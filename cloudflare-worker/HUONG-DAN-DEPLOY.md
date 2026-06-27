# Hướng dẫn triển khai Cloudflare Worker (backend giữ API key Claude)

Mục đích: app PWA của bạn chạy tĩnh trên GitHub Pages, không thể giữ API key an
toàn trong code. Worker này đóng vai trò "trạm trung chuyển" — giữ API key,
nhận câu hỏi từ app, gọi Claude, rồi trả lời về cho app.

## Bước 1 — Tạo tài khoản Cloudflare (miễn phí)

1. Vào https://dash.cloudflare.com/sign-up
2. Đăng ký bằng email (không cần thẻ tín dụng cho Workers free tier).
3. Xác nhận email.

## Bước 2 — Tạo Worker mới

1. Đăng nhập vào https://dash.cloudflare.com
2. Ở menu bên trái, chọn **Workers & Pages**.
3. Bấm **Create application** → tab **Workers** → **Create Worker**.
4. Đặt tên, ví dụ: `eng-app-ai-proxy` (tên này sẽ nằm trong URL của bạn).
5. Bấm **Deploy** (Cloudflare sẽ tạo sẵn 1 worker mẫu "Hello World").

## Bước 3 — Dán code

1. Sau khi deploy xong, bấm **Edit code** (hoặc vào worker vừa tạo → **Quick edit**).
2. Xoá hết code mẫu trong file `worker.js`.
3. Mở file `worker.js` (nằm cùng thư mục với hướng dẫn này) trên máy bạn, copy
   toàn bộ nội dung, dán vào ô code trên Cloudflare.
4. Bấm **Save and deploy** (hoặc **Deploy**) ở góc trên phải.

## Bước 4 — Lưu API key Claude an toàn (Secret)

**Không bao giờ dán API key trực tiếp vào code.** Làm theo cách này:

1. Vào worker vừa tạo → tab **Settings** → **Variables and Secrets**.
2. Bấm **Add** → chọn loại **Secret**.
3. Đặt tên biến: `CLAUDE_API_KEY` (phải đúng tên này, vì code worker đang gọi `env.CLAUDE_API_KEY`).
4. Dán API key Claude của bạn (lấy từ https://console.anthropic.com/settings/keys) vào ô giá trị.
5. Bấm **Save**/**Deploy**.

## Bước 5 — Lấy URL endpoint

Sau khi deploy, Cloudflare cho bạn 1 URL dạng:

```
https://eng-app-ai-proxy.<your-subdomain>.workers.dev
```

Đây là URL bạn sẽ nhập vào app (phần cấu hình AI trong app, ở mục Chat AI /
Cài đặt) để app biết gọi tới đâu.

## Bước 6 — Kiểm tra thử

Mở Terminal (hoặc dùng trang như https://reqbin.com) gửi thử:

```bash
curl -X POST https://eng-app-ai-proxy.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"mode":"chat","level":1,"message":"Hello, how are you?","history":[]}'
```

Nếu nhận được phản hồi JSON dạng `{"reply": "..."}` là đã chạy đúng.

Nếu gặp lỗi, kiểm tra lại:
- Tên secret phải đúng là `CLAUDE_API_KEY`.
- API key Claude còn hiệu lực, còn quota.
- Đã bấm Save/Deploy sau khi thêm secret.

## Giới hạn miễn phí (free tier)

Cloudflare Workers free tier: 100.000 request/ngày — quá đủ cho ứng dụng học
tiếng Anh dùng cá nhân hoặc nhóm nhỏ. Không cần thẻ tín dụng cho mức free này.

## Bảo mật thêm (tuỳ chọn)

Trong file `worker.js`, biến `ALLOWED_ORIGIN` đang để `"*"` (cho phép mọi
nguồn gọi tới). Để chặt hơn, sau khi app đã lên GitHub Pages, bạn có thể sửa
thành domain thật của app, ví dụ:

```js
const ALLOWED_ORIGIN = "https://ten-tai-khoan.github.io";
```

rồi deploy lại Worker.
