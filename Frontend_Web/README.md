# Frontend Web — Hệ Thống Thuyết Minh Tự Động Đa Ngôn Ngữ (Thảo Cầm Viên Sài Gòn)

## 📌 Giới Thiệu
Frontend Web là giao diện người dùng chính cho cả **Du khách (Visitor Web/PWA)** và **Quản trị viên (Admin Portal)**, được thiết kế theo đúng đặc tả yêu cầu trong tài liệu **PRD v2.0**.

Dự án áp dụng kiến trúc tách biệt hoàn toàn giữa **HTML (Semantic Markup)**, **CSS (Modular Styles)**, và **JS (Separation of Concerns / ES Modules)** nhằm đảm bảo tính module hóa, dễ bảo trì và dễ kiểm thử.

---

## 🏗️ Cấu Trúc Thư Mục Frontend

```
Frontend_Web/
├── index.html                   # Giao diện Du khách (Visitor Web/PWA)
├── admin.html                   # Giao diện Quản trị viên (Admin Portal)
├── package.json                 # Cấu hình npm & dependencies
├── vite.config.js               # Cấu hình Vite Multi-page Bundle
├── css/
│   ├── base.css                 # Biến CSS, Reset, Typography, Thanh cuộn, Hiệu ứng chuyển động
│   ├── visitor.css              # Giao diện Bản đồ Leaflet, Card thông tin thú, Player audio, Quét QR
│   └── admin.css                # Giao diện Dashboard, Bản đồ chọn tọa độ, Bảng dữ liệu, Biển QR in ấn
└── js/
    ├── config.js                # Cấu hình API, tọa độ Thảo Cầm Viên, danh mục ngôn ngữ, dữ liệu mẫu
    ├── api/
    │   ├── client.js            # HTTP Client dùng chung (Fetch wrapper, Quản lý Session ID & JWT)
    │   ├── visitor-api.js       # Gọi API Du khách (/api/animals, /api/zones, ghi nhận SCAN_LOGS)
    │   └── admin-api.js         # Gọi API Admin (Đăng nhập JWT, CRUD Zone, CRUD Animal, Sync đa ngôn ngữ, Stats)
    ├── visitor/
    │   ├── visitor-state.js     # Quản lý trạng thái Du khách (State Store phản ứng)
    │   ├── visitor-map.js       # Quản lý bản đồ Leaflet (Layer vệ tinh/số, Marker thú, Cổng vào)
    │   ├── visitor-geofence.js  # Định vị GPS, công thức khoảng cách Haversine, Cooldown chống phát lặp
    │   ├── visitor-audio.js     # Trình phát âm thanh HTML5 (Play/pause, thanh trượt tua, tốc độ phát, Web Speech fallback)
    │   ├── visitor-qr.js        # Trình quét mã QR camera và chọn nhanh mô phỏng
    │   └── visitor-app.js       # Bộ điều phối chính giao diện Du khách
    └── admin/
        ├── admin-state.js       # Quản lý trạng thái Admin
        ├── admin-auth.js        # Đăng nhập / Đăng xuất Admin, lưu JWT
        ├── admin-map-picker.js  # Bản đồ Leaflet chọn tọa độ Lat/Lng và xem trước vòng tròn bán kính
        ├── admin-zones.js       # Quản lý Khu vực (CRUD Zone, Validate dữ liệu)
        ├── admin-animals.js     # Quản lý Động vật (CRUD Animal)
        ├── admin-content.js     # Quản lý nội dung đa ngôn ngữ, cờ IsManual, tự động dịch & sinh TTS
        ├── admin-qr.js          # Studio tạo mã QR, tải ảnh PNG, in biển bảng hàng loạt theo Zone
        ├── admin-dashboard.js   # Thống kê tổng quan, số người online trực tiếp (polling 15s), biểu đồ
        └── admin-app.js         # Bộ điều phối chính cổng Quản trị
```

---

## 🌟 Tính Năng Đáp Ứng Chuẩn PRD v2.0

### 1. Phân hệ Du khách (`index.html`)
* **Quét mã QR (`FR-01`, `US-01`)**: Hỗ trợ quét mã QR URL dạng `/a/{animalId}` hoặc `?id={animalId}` mở bài thuyết minh tức thời trong $\le 3$ giây.
* **Trình phát Audio chuyên nghiệp (`FR-02`, `US-02`, `US-03`)**: Phát, tạm dừng, tua tới/lùi 10s, thanh trượt thời gian, tùy chỉnh tốc độ đọc (0.75x, 1.0x, 1.25x, 1.5x).
* **Đa ngôn ngữ tức thời (`FR-02`, `US-02`)**: Đổi ngôn ngữ trực tiếp (Việt, Anh, Hàn, Nhật, Trung) không tải lại trang.
* **Geofencing GPS thông minh (`FR-03`, `FR-04`, `US-04`, `US-05`)**:
  * Tự động nhận diện khi khoảng cách tới chuồng thú/zone $\le RadiusM$ (công thức Haversine).
  * **Chống phát lặp (Anti-loop / Cooldown)**: Mỗi vị trí chỉ kích hoạt 1 lần trong phiên; chỉ phát lại khi đã rời khỏi bán kính và quay lại sau thời gian chờ (cooldown).
* **Bảo vệ quyền riêng tư (`FR-05`, `US-06`)**: Tọa độ GPS của du khách chỉ tính cục bộ trên thiết bị, tuyệt đối không gửi lên máy chủ và không lưu trữ.
* **Ghi nhận SCAN_LOGS (`FR-06`, `US-07`)**: Ghi nhận lượt truy cập kèm `sessionId`, `source: 'QR' | 'GEO'`, `languageCode`, `userAgent` một cách bất đồng bộ không làm chậm trang.

### 2. Phân hệ Quản trị viên (`admin.html`)
* **Xác thực Admin JWT (`FR-11`, `US-11`)**: Đăng nhập an toàn, cấp JWT token và đính kèm vào mọi request quản trị.
* **Quản lý Khu vực & Bản đồ tương tác (`FR-12`, `FR-18`, `US-12`)**:
  * Nhấp chuột trực tiếp trên bản đồ Leaflet để lấy tọa độ Vĩ độ/Kinh độ chính xác.
  * Thanh trượt bán kính hiển thị vòng tròn Geofence trực quan.
* **Quản lý Động vật (`FR-13`, `US-13`)**: CRUD động vật, gán vào Zone, hình ảnh minh họa, tên khoa học.
* **Quản lý Nội dung đa ngôn ngữ & Dịch tự động (`FR-08`, `FR-09`, `FR-14`, `US-15` -> `US-18`)**:
  * Nhập tiếng Việt 1 lần, hệ thống tự động gọi Microservice dịch và sinh file giọng đọc mp3 cho 5 ngôn ngữ.
  * Hiển thị trạng thái đồng bộ: `PENDING`, `PROCESSING`, `DONE`, `FAILED`.
  * **Cờ sửa tay (`IsManual`)**: Bản dịch do Admin tinh chỉnh thủ công sẽ được đánh dấu để không bị tự động ghi đè khi chạy lại tác vụ dịch.
  * Nút **Nghe thử Audio** ngay trên giao diện soạn thảo.
* **Studio Tạo Mã QR & In Biển Bảng (`FR-16`, `US-14`)**:
  * Sinh mã QR vector/canvas sắc nét.
  * Xem trước biển bảng Thảo Cầm Viên giả lập kim loại sang trọng.
  * Tải ảnh PNG hoặc in ấn hàng loạt theo khổ chuẩn.
* **Dashboard Thống kê Realtime (`FR-07`, `US-08` -> `US-10`)**:
  * Tổng lượt quét và lượt quét trong ngày.
  * **Đếm số người đang online**: Đếm số SessionId duy nhất trong 5 phút gần nhất, tự động làm mới mỗi 15 giây.
  * Biểu đồ Top động vật được quan tâm nhất và phân bổ lượt nghe theo ngôn ngữ.

---

## 🚀 Hướng Dẫn Chạy & Phát Triển

### Cách 1: Chạy với Vite Dev Server (Khuyên dùng)
```bash
cd Frontend_Web
npm install
npm run dev
```
Trình duyệt sẽ tự động mở tại `http://localhost:5173/` (Du khách) và `http://localhost:5173/admin.html` (Quản trị).

### Cách 2: Biên dịch đóng gói Production Bundle
```bash
cd Frontend_Web
npm run build
```
Toàn bộ mã nguồn sẽ được Vite tối ưu hóa và xuất ra thư mục `Frontend_Web/dist/`.

### Cách 3: Kiểm thử Linter & Tests
```bash
cd Frontend_Web
npm run lint
npm test
```
