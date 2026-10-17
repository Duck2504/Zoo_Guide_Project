cách gọi service dịch từ 1 ngôn ngữ sang ngôn ngữ khác
POST /api/narration
Body: { "text": "...", "targetLang": "en" }   (vi | en | ja | ko)
Trả về: file audio/mpeg
Lỗi: 400 nếu thiếu text / ngôn ngữ không hỗ trợ, 502 nếu API bên ngoài lỗi

CI tự build và chạy test mỗi lần push. CD ở mức cơ bản: tự đóng gói service thành Docker image.
docker build -t narration-service .
docker run -p 8080:8080 narration-service