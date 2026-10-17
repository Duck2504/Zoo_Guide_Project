# HỆ THỐNG THUYẾT MINH DU LỊCH VƯỜN THÚ TỰ ĐỘNG ĐA NGÔN NGỮ
## Multilingual Automatic Audio Narration & Smart Zoo Tour Guide System

Hệ thống thuyết minh tự động thông minh dành cho vườn thú, tích hợp bản đồ định vị GPS thời gian thực (WGS-84), công nghệ Geofencing khoanh vùng ranh giới khuôn viên, lộ trình xe tham quan tự hành và bài thuyết minh âm thanh đa ngôn ngữ.

---

## 🚀 HƯỚNG DẪN CHẠY THỬ NHANH (QUICK START)

### Cách 1: Xem thử ngay lập tức (Không cần cài đặt Node.js hay .NET)
Nhấp đúp chuột mở trực tiếp file sau bằng bất kỳ trình duyệt nào (Chrome, Edge, Cốc Cốc):
* **`MO_GIAO_DIEN.html`**

Toàn bộ bản đồ vệ tinh/đường phố, 8 phân khu chuồng động vật, nút căn chỉnh ranh giới, định vị GPS, mô phỏng xe du lịch chạy tự hành và phát giọng nói thuyết minh tiếng Việt đều hoạt động 100% độc lập.

---

### Cách 2: Khởi chạy Cổng Quản Trị Web Admin (React.js + Vite)
Cổng quản trị viên quản lý danh sách chuồng động vật, vẽ bán kính Geofence, xem bản đồ GPS thực tế và điều khiển tour thuyết minh tự động:

```bash
# 1. Di chuyển vào thư mục Web Admin
cd Frontend_Web

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```
👉 Mở trình duyệt truy cập: **`http://localhost:5173/`**

---

### Cách 3: Khởi chạy Ứng Dụng Di Động Du Khách (React Native / Expo)
Ứng dụng dành cho du khách tham quan, tự động nhận diện du khách bước vào bán kính chuồng để phát thuyết minh:

```bash
# 1. Di chuyển vào thư mục Mobile App
cd Frondend_MobileApp

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy ứng dụng với Expo
npx expo start
```
👉 Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại (Android / iOS) để trải nghiệm trực tiếp.

---

### Cách 4: Khởi chạy Backend Core API (C# .NET 9.0)
Hệ thống dịch vụ API cung cấp dữ liệu danh sách động vật, phân khu và tọa độ GPS:

```bash
# 1. Di chuyển vào thư mục API
cd Backend_core/ZooAudioGuide.API

# 2. Khôi phục thư viện và biên dịch
dotnet restore
dotnet build

# 3. Khởi chạy dịch vụ
dotnet run
```
👉 Truy cập giao diện Swagger UI tài liệu API: **`http://localhost:5000/swagger`** (hoặc `https://localhost:7000/swagger`).

---

## 🌟 CÁC TÍNH NĂNG NỔI BẬT ĐÃ HOÀN THIỆN

1. **Bản Đồ Thực Tế Đa Tầng (WGS-84 Standard)**:
   - **Đường Phố (Google Roadmap)**: Hiển thị mạng lưới đường giao thông xung quanh và lối đi nội bộ.
   - **Vệ Tinh (Hybrid Satellite)**: Hình ảnh vệ tinh độ phân giải cao, hiển thị rõ từng tán cây, hồ sen, chuồng thú.
   - **Công Viên (CartoDB Voyager)**: Tông màu sinh thái rõ nét, làm nổi bật các thảm thực vật.

2. **Ranh Giới Khuôn Viên Vườn Thú Khép Kín (Geofencing)**:
   - Thiết lập đa giác ranh giới khép kín (`ZOO_BOUNDARY_POLYGON`) bao trọn khuôn viên vườn thú.
   - **100% tọa độ của toàn bộ 8 loài động vật đại diện** (Voi Châu Á, Hổ Đông Dương, Hươu & Ngựa Vằn, Vượn Má Vàng, Hồng Hạc, Cá Sấu, Tê Giác, Gấu Ngựa) đều được kiểm định nằm hoàn toàn bên trong vành đai vườn thú.
   - Nút **"Khớp Ranh Giới"** giúp tự động căn chỉnh khung hình hiển thị trọn vẹn khuôn viên.
   - Cơ chế kiểm tra tọa độ thời gian thực: Cảnh báo đỏ ngay lập tức nếu chọn vị trí nằm ngoài khuôn viên vườn thú.

3. **Hành Trình Xe Tham Quan Tự Động & Thuyết Minh Âm Thanh**:
   - Khi bấm **"Bắt Đầu Hành Trình Tham Quan"**, xe du lịch ảo sẽ tự động di chuyển mượt mà qua lần lượt từng chuồng động vật.
   - Khi xe dừng tại mỗi chuồng, hệ thống tự động phát bài thuyết minh tiếng Việt chuẩn giọng đọc Web Speech API.
   - Có đầy đủ các nút điều khiển chuyên nghiệp: **Tạm Dừng**, **Tiếp Tục**, **Bỏ Qua Điểm**, **Dừng Tour**.

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Zoo_Guide_Project/
├── .github/
│   └── workflows/
│       ├── fe-ci.yml                 # CI/CD tự động kiểm tra cú pháp và build Web Admin + Mobile App
│       └── dotnet-backend.yml        # CI/CD tự động restore và compile Release cho Backend Core .NET
├── Frontend_Web/                     # Cổng Quản Trị Web Admin (React.js + Vite + Leaflet)
│   ├── src/
│   │   ├── App.jsx                   # Giao diện chính quản trị, thêm động vật, điều khiển tour
│   │   ├── RealZooMap.jsx            # Bản đồ thực tế Leaflet, ranh giới và xe du lịch tự hành
│   │   ├── RealPickerMap.jsx         # Bản đồ ghim tọa độ chuồng kèm kiểm tra ranh giới
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── Frondend_MobileApp/               # Ứng Dụng Di Động Du Khách (React Native / Expo)
│   ├── App.js                        # Giao diện du khách, danh sách chuồng, định vị Geofence
│   ├── app.json
│   └── package.json
├── Backend_core/                     # Backend Core Microservice (C# .NET 9.0)
│   └── ZooAudioGuide.API/            # Web API Controllers, Models, Swagger
├── MO_GIAO_DIEN.html                 # Bản xem trước độc lập (chạy ngay không cần cài đặt)
└── README.md                         # Tài liệu hướng dẫn dự án
```

---

## 🔄 TỰ ĐỘNG HÓA KIỂM THỬ CI/CD (GITHUB ACTIONS)

Dự án đã tích hợp sẵn quy trình CI/CD tự động kiểm thử trên GitHub Actions:
* **Frontend Web & Mobile CI (`fe-ci.yml`)**: Tự động cài đặt dependencies, chạy linter/test và thực hiện build production bundle bằng Vite.
* **Backend Core .NET CI (`dotnet-backend.yml`)**: Tự động restore packages và compile mã nguồn C# ở chế độ Release trên môi trường Ubuntu runner.
