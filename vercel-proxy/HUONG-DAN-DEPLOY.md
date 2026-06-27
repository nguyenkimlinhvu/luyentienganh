# Hướng dẫn deploy Vercel Proxy (thay cho Cloudflare Worker)

Lý do đổi: Cloudflare Worker đôi lúc bị route ra ngoài qua datacenter Hong Kong,
bị Anthropic chặn (403 "Request not allowed") dù key hoàn toàn hợp lệ. Vercel
cho phép cố định region chạy function (đã đặt sẵn `iad1` = Washington DC, Mỹ
trong `vercel.json`), tránh hẳn vấn đề này.

## Bước 1 — Cài Vercel CLI (nếu chưa có)

Mở Terminal:

```
npm install -g vercel
```

## Bước 2 — Đăng nhập Vercel

```
cd "/Users/nguyenkimlinhvu/Documents/Claude/Projects/App học tiếng anh/vercel-proxy"
vercel login
```

Chọn đăng nhập bằng email hoặc GitHub theo hướng dẫn trên màn hình.

## Bước 3 — Deploy lần đầu

```
vercel --prod
```

Trả lời các câu hỏi của CLI:
- "Set up and deploy?" → Yes
- "Which scope?" → chọn account của bạn
- "Link to existing project?" → No
- "What's your project's name?" → luyentienganh-proxy (hoặc tên bạn muốn)
- "In which directory is your code located?" → để mặc định (./ )

Sau khi xong, CLI sẽ in ra URL dạng:
`https://luyentienganh-proxy.vercel.app`

## Bước 4 — Thêm Environment Variable cho API key

**Quan trọng — an toàn:** không gõ key trực tiếp vào lệnh CLI hiển thị trên
màn hình. Dùng cách sau, key sẽ được nhập qua prompt riêng:

```
vercel env add CLAUDE_API_KEY production
```

CLI sẽ hỏi giá trị — dán key Claude API của bạn vào đó (lấy từ
console.anthropic.com/settings/keys), nhấn Enter.

## Bước 5 — Deploy lại để áp dụng biến môi trường mới

```
vercel --prod
```

## Bước 6 — Test bằng curl

Endpoint của bạn sẽ là: `https://<project-name>.vercel.app/api/chat`

```
curl -X POST https://luyentienganh-proxy.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mode":"chat","level":1,"message":"Hello","history":[]}'
```

Nếu trả về `{"reply": "..."}` là thành công.

## Bước 7 — Cập nhật URL trong app

Mở app PWA trên điện thoại/máy tính, vào phần cấu hình AI (lệnh
`promptSetupAiWorker()` trong app), nhập:

```
https://luyentienganh-proxy.vercel.app/api/chat
```

(Lưu ý: khác với Cloudflare Worker, endpoint Vercel có thêm `/api/chat` ở
cuối — cần nhập đầy đủ đường dẫn này, không chỉ domain gốc.)
