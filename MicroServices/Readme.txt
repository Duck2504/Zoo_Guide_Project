cách gọi service dịch từ 1 ngôn ngữ sang ngôn ngữ khác
POST /api/narration
Body: { "text": "...", "targetLang": "en" }   (vi | en | ja | ko)
Trả về: file audio/mpeg
Lỗi: 400 nếu thiếu text / ngôn ngữ không hỗ trợ, 502 nếu API bên ngoài lỗi