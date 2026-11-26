# Thảo Cầm Viên Zoo Audio Guide - React Native Mobile App

Ứng dụng di động Native (xây dựng bằng **React Native & Expo SDK 50**) phục vụ khách tham quan Thảo Cầm Viên Sài Gòn với các công nghệ phần cứng tiên tiến:

---

## 📱 Tính Năng Cốt Lõi Trên Thiết Bị Di Động

1. **Quét mã QR bằng Camera Native (`expo-camera`):**
   - Tận dụng trực tiếp cảm biến Camera phần cứng thiết bị thay vì Web Camera, quét siêu nhanh dưới trời nắng gắt.
   - Hỗ trợ bật/tắt đèn Flash khi trời tối hoặc tham quan chuồng thú có bóng râm.
   - Tự động nhận diện URL hoặc mã chuồng thú để mở ngay bài thuyết minh.

2. **Cảm biến Định vị Nền & Tự Rung Túi Quần (Hands-free Background Tracking):**
   - Tích hợp `expo-location` và `expo-task-manager` theo dõi vị trí GPS ngầm ngay cả khi khách **tắt màn hình và đút điện thoại vào túi quần**.
   - Khi đi vào bán kính chuồng thú (công thức Haversine), ứng dụng **tự động rung thiết bị (`Vibration.vibrate`)** báo hiệu qua túi quần và **phát bài thuyết minh qua tai nghe**.

3. **Trình phát âm thanh đa ngôn ngữ (`expo-av`):**
   - Cấu hình phát âm thanh nền (`staysActiveInBackground: true`), không bị dừng khi khóa màn hình.
   - Hỗ trợ đa ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Nhật, Tiếng Hàn.

4. **Đồng bộ hóa 2 chiều với Backend ASP.NET Core:**
   - Kết nối trực tiếp API Backend (`https://backend-zooaudio.onrender.com/api/animals`).
   - Tự động lưu bộ nhớ đệm (Cache) để du khách vẫn xem được bản đồ và thông tin khi mất sóng 4G.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu môi trường:
- Node.js 18+ hoặc 20+
- Ứng dụng **Expo Go** trên điện thoại Android (Google Play) hoặc iOS (App Store).

### Khởi động dự án:
```bash
cd Frondend_MobileApp

# Cài đặt thư viện
npm install

# Khởi chạy Expo Dev Server
npm start
```
Quét mã QR trên màn hình Terminal bằng ứng dụng **Expo Go** trên điện thoại để trải nghiệm trực tiếp!

---

## 🏗️ Cấu Trúc Thư Mục

```
Frondend_MobileApp/
├── App.js                     # Điểm khởi chạy chính & điều hướng 5 Tab
├── app.json                   # Cấu hình quyền Camera, GPS nền, Icon & Splash
├── package.json               # Khai báo Expo SDK 50 & dependencies
└── src/
    ├── components/
    │   ├── ExploreView.js     # Danh sách thẻ loài thú & tìm kiếm
    │   ├── MapView.js         # Radar định vị GPS Thảo Cầm Viên & Tour giả lập
    │   ├── QrScannerView.js   # Camera quét mã QR phần cứng & đèn Flash
    │   ├── PlayerView.js      # Trình phát âm thanh, lời đọc & đổi ngôn ngữ
    │   ├── SettingsView.js    # Cài đặt API Backend, chế độ rảnh tay & túi quần
    │   └── MiniPlayer.js      # Thanh phát âm thanh cố định dưới đáy màn hình
    ├── data/
    │   └── animals.js         # Bộ dữ liệu 17 loài thú dự phòng ngoại tuyến
    └── services/
        ├── apiService.js      # Kết nối REST API Backend Core
        └── locationService.js # Thuật toán Haversine, Geofence & Rung túi quần
```
