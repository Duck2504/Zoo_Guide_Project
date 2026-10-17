# 🦁 Frontend Web Admin — Thảo Cầm Viên Sài Gòn
## Phân Hệ Quản Trị Hệ Thống Thuyết Minh Sở Thú Tự Động (React.js)

* **Vai trò:** **FE DEV **
* **Học phần:** Công Nghệ Phần Mềm (CNPM)
* **Giảng viên hướng dẫn:** **TS. Nguyễn Quốc Huy**


---

## 📌 1. Giới Thiệu Chức Năng

Cổng Web Admin được xây dựng bằng **React.js (Vite)** phục vụ ban quản lý Thảo Cầm Viên Sài Gòn với đầy đủ các nghiệp vụ:

1. **Quản Trị Động Vật & Chuồng Trại:**
   - Thêm, sửa, xóa thông tin động vật: Tên tiếng Việt, Tên khoa học, Phân khu sở thú (Thú ăn cỏ, Thú ăn thịt, Chim, Bò sát, Thảo nguyên...), Khẩu phần ăn, Tình trạng bảo tồn Sách đỏ IUCN, Hình ảnh đại diện.
2. **Tọa Độ GPS & Bán Kính Geofence Tự Động:**
   - Tích hợp trực tiếp **Bản đồ tranh vẽ Thảo Cầm Viên Sài Gòn (`ban-do-tcv.jpg`)** và bản đồ vệ tinh **Leaflet OpenStreetMap**.
   - Nhấp trực tiếp vào bất kỳ vị trí chuồng thú nào trên bản đồ để tự động lấy tọa độ `[Kinh độ, Vĩ độ]`.
   - Vòng tròn Geofence (10m – 60m) co giãn trực quan theo thanh trượt.
3. **Bài Thuyết Minh Tiếng Việt & Đa Ngôn Ngữ:**
   - Soạn thảo nội dung thuyết minh tiếng Việt chuẩn xác cho từng loài.
   - Trình nghe thử giọng đọc AI tích hợp sẵn hỗ trợ 5 ngôn ngữ: 🇻🇳 Tiếng Việt, 🇬🇧 Tiếng Anh, 🇫🇷 Tiếng Pháp, 🇨🇳 Tiếng Trung, 🇯🇵 Tiếng Nhật.
4. **Mô Phỏng Du Khách Di Chuyển (Visitor GPS Simulation):**
   - Chế độ giả lập bước đi của du khách trong khuôn viên Thảo Cầm Viên; tự động kích hoạt bài thuyết minh khi du khách bước vào bán kính Geofence của từng chuồng.

---

## 🛠️ 2. Công Nghệ Sử Dụng

* **React 18** (Functional Components, Hooks: `useState`, `useEffect`, `useRef`)
* **Vite** (Build tool siêu tốc, HMR)
* **Leaflet & React-Leaflet** (Bản đồ số)
* **Web Speech API** (Bộ tổng hợp giọng nói đa ngữ chuẩn HTML5)
* **Lucide React** (Bộ icon trực quan)

---

## 🚀 3. Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu môi trường
* Node.js >= 18.x
* npm >= 9.x

### Các bước thực hiện
```bash
# 1. Di chuyển vào thư mục Frontend_Web
cd Frontend_Web

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```
Trình duyệt sẽ mở tại địa chỉ: `http://localhost:5173`

### Đóng gói Production (Build Check)
```bash
npm run build
npm run preview
```
Bản build hoàn tất được đóng gói tại thư mục `dist/` sẵn sàng triển khai.
