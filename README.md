# Zoo Audio Guide – Thuyết minh Thảo Cầm Viên đa ngôn ngữ

Hệ thống thuyết minh tự động cho sở thú: du khách quét mã QR trên nhãn chuồng (hoặc bật định vị để web tự nhận ra khu đang đứng) và nghe bài giới thiệu con vật bằng **tiếng Việt, Anh, Nhật, Hàn** ngay trên trình duyệt điện thoại, không cần cài app hay đăng ký.

Quản trị viên chỉ viết bài bằng tiếng Việt một lần; hệ thống tự dịch (Gemini) và đọc thành giọng nói (edge-tts) cho các ngôn ngữ còn lại.

> Đồ án môn học. Thảo Cầm Viên chỉ là bối cảnh demo, dự án không có liên hệ chính thức với vườn. Ảnh động vật lấy từ Wikimedia Commons.

## Tính năng

**Trang du khách** (thiết kế cho điện thoại, một tay, ngoài trời, mạng 4G)
- Trang con vật `/a/{id}` mở từ mã QR: ảnh, thông tin nhanh (mức bảo tồn IUCN, thức ăn, nơi sống, tuổi thọ), trình phát audio (tua 10 giây, đổi tốc độ, thanh phát nhỏ khi cuộn), gợi ý "Nghe tiếp" con cùng khu chưa nghe.
- Theo vị trí: bật định vị một lần, đi vào khu nào thì danh sách con vật của khu đó hiện ra, có nút **Nghe cả khu** phát lần lượt. Vị trí chỉ xử lý trên máy, không gửi lên server.
- Bản đồ khu (Leaflet + OpenStreetMap) và quét QR bằng camera ngay trong web.
- Ngôn ngữ tự chọn theo điện thoại và được nhớ giữa các lần quét; dấu "Đã nghe" cho con đã nghe.
- Báo rõ khi máy chủ đang khởi động hoặc mất mạng, có nút thử lại; trang 404 riêng.

**Trang quản trị** `/admin` (đăng nhập bằng tài khoản cấu hình trên server)
- Quản lý con vật: hồ sơ, bài thuyết minh, tải ảnh, trạng thái audio từng ngôn ngữ, tạo audio từng con hoặc hàng loạt, sửa bản dịch rồi đọc lại, tải mã QR khổ in (1024px).
- Quản lý khu: chọn tâm khu trên bản đồ, bán kính GPS, cảnh báo hai khu chồng nhau.
- Tổng quan: lượt nghe 7 ngày (theo giờ Việt Nam), loài được quan tâm nhất, chia theo ngôn ngữ / nguồn truy cập / khu. Lượt của bot, nguồn lạ và lượt tải lại trong 5 phút không được tính.
- Mã QR trang chủ để in đặt ở cổng, quầy vé.

## Kiến trúc

| Thành phần | Chạy ở đâu |
| --- | --- |
| Frontend (React) | SmarterASP (IIS), deploy tự động bằng GitHub Action |
| Backend (ASP.NET Core) | Render |
| Microservice thuyết minh | `localhost:5292` trên máy cá nhân, mở ra Internet qua **ngrok** để backend trên Render gọi được |
| Cơ sở dữ liệu | SQL Server trên site4now |
| Audio, bản dịch, ảnh | Supabase Storage |

```
Điện thoại du khách / máy admin
        │  React SPA (SmarterASP, IIS)
        ▼
Backend_core  ── ASP.NET Core (Render) ──►  SQL Server (site4now)
        │  gọi khi admin tạo audio / tải ảnh
        ▼
NarrationService  ── chạy trên máy cá nhân, mở ra ngoài qua ngrok
        ├─ Gemini: dịch bài và tên loài
        ├─ edge-tts: đọc thành mp3
        └─ Supabase Storage: lưu mp3, bản dịch, ảnh
```

Audio đã tạo được lưu sẵn trên Supabase, nên du khách nghe không phụ thuộc máy chạy NarrationService; máy đó chỉ cần bật khi admin tạo audio hoặc tải ảnh.

## Thư mục

| Thư mục | Nội dung |
| --- | --- |
| `Frontend_Web/` | React 18 + Vite + Tailwind CSS v4: trang du khách (`src/pages/visitor`) và quản trị (`src/pages/admin`) |
| `Frondend_MobileApp/` | React Native (Expo SDK 50): Ứng dụng di động quét mã QR camera native, cảm biến GPS định vị nền và tự rung túi quần |
| `Backend_core/ZooAudioGuide.API/` | ASP.NET Core (.NET 10), EF Core + SQL Server (NetTopologySuite cho tọa độ khu): controller → service → repository |
| `Backend_core/ZooAudioGuide.Tests/` | Test MSTest cho backend |
| `MicroServices/ZooAudioGuide.NarrationService/` | Dịch vụ dịch + đọc + lưu audio (minimal API, có Dockerfile) |
| `MicroServices/ZooAudioGuide.NarrationService.Tests/` | Test xUnit cho microservice (dùng dịch vụ giả, không gọi API thật) |
| `PRODUCT.md`, `DESIGN.md` | Bối cảnh sản phẩm và hệ thống thiết kế giao diện |

## Chạy trên máy

Cần: .NET SDK 10, Node.js 24, Python + `pip install edge-tts` (cho microservice).

**Backend** – chạy ở `http://localhost:8080`
```bash
cd Backend_core/ZooAudioGuide.API
dotnet run
```

**Microservice** – chạy ở `http://localhost:5292`
```bash
dotnet run --project MicroServices/ZooAudioGuide.NarrationService --launch-profile http
```

**Frontend Web** – mặc định gọi backend trên Render; đặt `VITE_API_URL` để trỏ về backend ở máy
```bash
cd Frontend_Web
npm install
VITE_API_URL=http://localhost:8080 npm run dev
```

**Mobile App (React Native)** – chạy bằng Expo Go trên Android / iOS
```bash
cd Frondend_MobileApp
npm install
npm start
```

## Cấu hình

Đặt bằng biến môi trường (dấu `:` trong tên khóa đổi thành `__`), **không ghi vào `appsettings.json`**.

| Dịch vụ | Biến | Ý nghĩa |
| --- | --- | --- |
| Backend | `ConnectionStrings__DefaultConnection` | Chuỗi kết nối SQL Server |
| Backend | `Admin__Username`, `Admin__Password` | Tài khoản quản trị duy nhất |
| Backend | `NarrationService__BaseUrl` | Địa chỉ microservice (link ngrok) |
| Backend | `NarrationService__ApiKey` | Khóa gửi kèm khi gọi microservice |
| Microservice | `Admin__ApiKey` | Khóa chấp nhận (khớp `NarrationService__ApiKey` của backend) |
| Microservice | `Gemini__ApiKey`, `Gemini__Model` | Khóa và model Gemini để dịch |
| Microservice | `Supabase__Url`, `Supabase__ServiceKey`, `Supabase__Bucket` | Kho lưu audio và ảnh |
| Frontend | `VITE_API_URL` | Địa chỉ backend (bỏ trống = backend trên Render) |

Lưu ý: gói miễn phí của Gemini giới hạn số lượt gọi mỗi ngày; mỗi ngôn ngữ của một con cần khoảng 2 lượt (dịch bài và dịch tên). Bản dịch và audio đã tạo được dùng lại, không tốn lượt lần sau.

## Kiểm thử

```bash
dotnet test Backend_core/ZooAudioGuide.Tests
```
```bash
dotnet test MicroServices/ZooAudioGuide.NarrationService.Tests
```
```bash
cd Frontend_Web && npm test
```

## Triển khai

- **Frontend:** push lên `main` → GitHub Action `Deploy Frontend to SmarterASP` build và đẩy qua FTP. `public/web.config` lo định tuyến SPA và cache (HTML không cache, gói trong `/assets` cache lâu).
- **Backend:** Render tự deploy lại khi push lên `main` (thư mục có sẵn `Dockerfile`). Mỗi lần deploy admin phải đăng nhập lại.
- **Microservice:** chạy trên máy cá nhân và mở bằng `ngrok http 5292`; đổi link ngrok thì cập nhật `NarrationService__BaseUrl` trên Render. CI build sẵn Docker image nếu muốn chạy ở nơi khác.
- CI: mỗi lần push chạy test backend, test microservice và build frontend.
