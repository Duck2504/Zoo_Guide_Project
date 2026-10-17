# 📱 Frontend Mobile App — Thảo Cầm Viên Sài Gòn
## Ứng Dụng Hướng Dẫn Viên Du Lịch Thảo Cầm Viên (React Native / Expo)

* **Vai trò:** **FE DEV (Phần 1 theo đề bài phân công)**
* **Học phần:** Công Nghệ Phần Mềm (CNPM)
* **Giảng viên hướng dẫn:** **TS. Nguyễn Quốc Huy**
* **Chủ quyền:** *Quần đảo Hoàng Sa và Trường Sa là của Việt Nam 🇻🇳*

---

## 📌 1. Giới Thiệu Chức Năng

Ứng dụng di động dành cho khách tham quan Thảo Cầm Viên Sài Gòn, hoạt động như một hướng dẫn viên du lịch cá nhân thông minh:

1. **Quét Radar Định Vị GPS (Geofence Scanner):**
   - Tự động lấy tọa độ thực tế của du khách thông qua GPS trên điện thoại (`expo-location`).
   - Tính toán khoảng cách tới tất cả các chuồng thú trong sở thú theo thời gian thực.
2. **Kích Hoạt Thuyết Minh Tự Động (Auto-Trigger Audio):**
   - Khi du khách tiến vào phạm vi bán kính Geofence (20m – 30m) của một chuồng thú, ứng dụng sẽ tự động kích hoạt bài thuyết minh tương ứng mà không cần thao tác bấm.
3. **Bộ Phát Âm Thanh Mini-Player Đa Ngôn Ngữ:**
   - Hỗ trợ chuyển đổi linh hoạt giữa 5 ngôn ngữ: 🇻🇳 Tiếng Việt, 🇬🇧 English, 🇫🇷 Français, 🇨🇳 中文, 🇯🇵 日本語.
   - Các nút điều khiển: Play, Pause, Tua, Hiển thị hình ảnh và bài học bảo tồn động vật.
4. **Khám Phá Bản Đồ & Danh Mục Chuồng Thú:**
   - Xem bản đồ và thông tin khoa học của toàn bộ các loài động vật tại Thảo Cầm Viên.

---

## 🛠️ 2. Công Nghệ Sử Dụng

* **React Native 0.73**
* **Expo SDK 50**
* **expo-location** (Định vị GPS độ chính xác cao & Geofencing)
* **expo-av** (Xử lý âm thanh và luồng phát thuyết minh)
* **React Native Safe Area Context & Status Bar**

---

## 🚀 3. Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu môi trường
* Node.js >= 18.x
* Ứng dụng **Expo Go** trên điện thoại thông minh (tải miễn phí trên Google Play Store hoặc Apple App Store).

### Các bước thực hiện
```bash
# 1. Di chuyển vào thư mục Frondend_MobileApp
cd Frondend_MobileApp

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy Expo Metro Bundler
npx expo start
```

### Trải nghiệm ứng dụng
1. Mở ứng dụng **Expo Go** trên điện thoại.
2. Quét mã QR hiển thị trên màn hình terminal máy tính.
3. Ứng dụng sẽ tự động tải và chạy trực tiếp trên điện thoại của bạn.

> **Mẹo:** Bạn cũng có thể chạy thử trên trình duyệt web bằng lệnh:
> ```bash
> npm run web
> ```
