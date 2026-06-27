/**
 * Cloudflare Worker — Proxy gọi Claude API cho app "Học tiếng Anh"
 *
 * Worker này giữ API key Claude an toàn ở phía server (lưu trong Secret của
 * Cloudflare, KHÔNG nằm trong code), nhận request từ app PWA và trả lời lại.
 *
 * Hỗ trợ 2 chế độ:
 *  - mode: "chat"     -> chat tự do, không giới hạn chủ đề (tab Chat AI)
 *  - mode: "roleplay" -> AI đóng vai theo ngữ cảnh + chấm/sửa câu trả lời (tab Nói)
 *
 * Deploy: dán toàn bộ file này vào Cloudflare Workers (xem hướng dẫn kèm theo).
 */

const ALLOWED_ORIGIN = "*"; // có thể đổi thành domain GitHub Pages của bạn để chặt hơn, ví dụ: "https://username.github.io"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// Ánh xạ level số -> tên CEFR, dùng để AI điều chỉnh độ khó ngôn ngữ
const LEVEL_NAMES = { 1: "A1 (mới bắt đầu)", 2: "A2 (cơ bản)", 3: "B1 (trung cấp)", 4: "B2 (trung cao cấp)" };

function buildSystemPrompt(mode, payload) {
  const level = payload.level || 1;
  const levelName = LEVEL_NAMES[level] || "A1";

  if (mode === "roleplay") {
    const role = payload.role || "một người bản xứ thân thiện";
    const scenario = payload.scenario || "một cuộc trò chuyện đời thường";
    return `Bạn là một AI luyện nói tiếng Anh, đang đóng vai "${role}" trong tình huống: ${scenario}.
Người học đang ở trình độ CEFR ${levelName}. Hãy:
1. Dùng tiếng Anh ĐƠN GIẢN, phù hợp đúng trình độ ${levelName} (câu ngắn, từ vựng quen thuộc ở A1/A2, phức tạp hơn một chút ở B1/B2).
2. Phản hồi tự nhiên như nhân vật bạn đang đóng vai, tiếp tục hội thoại.
3. Sau phần hội thoại, thêm một dòng riêng bắt đầu bằng "📝 Nhận xét:" để CHẤM và SỬA LỖI câu trả lời gần nhất của người học bằng tiếng Việt — chỉ ra lỗi ngữ pháp/từ vựng/phát âm (nếu có) một cách ngắn gọn, khích lệ, kèm câu đúng. Nếu câu trả lời đã tốt, khen ngợi ngắn gọn.
Giữ câu trả lời ngắn gọn, không quá 4-5 câu cho phần hội thoại.`;
  }

  // mode === "chat"
  return `Bạn là một AI luyện hội thoại tiếng Anh thân thiện, kiên nhẫn, dành cho người Việt đang học tiếng Anh ở trình độ CEFR ${levelName}.
Hãy trò chuyện tự nhiên bằng tiếng Anh với độ khó phù hợp trình độ ${levelName} (câu ngắn gọn, từ vựng quen thuộc với A1/A2, phong phú hơn với B1/B2).
Nếu người học viết sai ngữ pháp hoặc dùng từ chưa đúng, hãy nhẹ nhàng chỉ ra cách sửa (bằng tiếng Việt, ngắn gọn) ngay sau phần trả lời tiếng Anh, đặt sau dòng "📝 Gợi ý:".
Luôn khích lệ, không chê bai. Trả lời ngắn gọn, không quá 4-5 câu.`;
}

async function callClaude(env, systemPrompt, messages) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: systemPrompt,
      messages: messages,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Claude API lỗi (${resp.status}): ${errText}`);
  }

  const data = await resp.json();
  const text = (data.content || []).map((b) => b.text || "").join("\n").trim();
  return text;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Chỉ hỗ trợ phương thức POST" }, 405);
    }

    if (!env.CLAUDE_API_KEY) {
      return jsonResponse({ error: "Server chưa cấu hình CLAUDE_API_KEY" }, 500);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return jsonResponse({ error: "Body request không hợp lệ (cần JSON)" }, 400);
    }

    const mode = payload.mode === "roleplay" ? "roleplay" : "chat";
    const history = Array.isArray(payload.history) ? payload.history : [];
    const userMessage = (payload.message || "").toString().slice(0, 2000);

    if (!userMessage) {
      return jsonResponse({ error: "Thiếu nội dung tin nhắn (message)" }, 400);
    }

    // Giới hạn lịch sử để tránh request quá lớn — chỉ giữ 10 lượt gần nhất
    const trimmedHistory = history.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    }));

    const messages = [...trimmedHistory, { role: "user", content: userMessage }];
    const systemPrompt = buildSystemPrompt(mode, payload);

    try {
      const reply = await callClaude(env, systemPrompt, messages);
      return jsonResponse({ reply });
    } catch (err) {
      return jsonResponse({ error: err.message || "Có lỗi xảy ra khi gọi Claude API" }, 502);
    }
  },
};
