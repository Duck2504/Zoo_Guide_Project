# 🦁 HỆ THỐNG THUYẾT MINH SỞ THÚ TỰ ĐỘNG ĐA NGÔN NGỮ
## DỰ ÁN MÔN HỌC CÔNG NGHỆ PHẦN MỀM — THẢO CẦM VIÊN SÀI GÒN

* **Giảng viên hướng dẫn:** **TS. Nguyễn Quốc Huy**
* **Khoa:** Công Nghệ Thông Tin
* **Đề tài:** **Thuyết minh tự động đa ngôn ngữ**
* **Chủ quyền quốc gia:** *Quần đảo Hoàng Sa và Trường Sa là của Việt Nam 🇻🇳*

---

## 👥 Bảng Phân Công Nhiệm Vụ Thành Viên

Theo đúng yêu cầu của đề tài, dự án được chia làm 3 phân hệ độc lập và tích hợp CI/CD tự động:

| Vai Trò | Phân Hệ Phụ Trách | Công Nghệ Áp Dụng | Trạng Thái & CI/CD |
| :--- | :--- | :--- | :---: |
| **Phần 1: FE DEV** | • **`Frontend_Web`**: Cổng Web Admin Quản trị<br>• **`Frondend_MobileApp`**: App Mobile Du Khách | • **React.js** (Vite, Leaflet, Web Speech)<br>• **React Native** (Expo, GPS Location, Audio) | ✅ **HOÀN THÀNH**<br>`fe-ci.yml` |
| **Phần 2: BE Dev 1** | • **`Backend_core`**: API Lõi quản trị dữ liệu | • Hướng kiến trúc **3 Lớp**<br>(`Controller -> Service -> Repository`) | ⚙️ Đang tích hợp<br>`be-core-ci.yml` |
| **Phần 3: BE Dev 2** | • **`MicroServices`**: Dịch thuật & TTS Engine | • Microservices giao tiếp liên dịch vụ<br>(`REST API, Edge-TTS, Translator`) | ⚙️ Đang tích hợp<br>`be-services-ci.yml` |

---

## 🗂️ Cấu Trúc Kho Chứa (Repository Structure)

```text
Zoo_Guide_Project/
│
├── 📂 .github/workflows/
│   └── fe-ci.yml                   # CI/CD: Tự động kiểm tra lỗi code Frontend trên GitHub
│
├── 📂 Frontend_Web/                # 🌐 PHẦN 1A: WEB ADMIN (React.js + Vite)
│   ├── src/
│   │   ├── App.jsx                 # Trang Thêm Động Vật / Tọa Độ GPS / Thuyết Minh
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── ban-do-tcv.jpg          # Bản đồ tranh vẽ Thảo Cầm Viên tương tác
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md                   # Hướng dẫn chi tiết Web Admin
│
├── 📂 Frondend_MobileApp/          # 📱 PHẦN 1B: MOBILE APP (React Native / Expo)
│   ├── assets/                     # Icons, Splash & Bản đồ Thảo Cầm Viên
│   ├── App.js                      # Trình quét Radar GPS & Tự động phát âm thanh
│   ├── app.json                    # Cấu hình dự án Expo
│   ├── babel.config.js
│   ├── package.json
│   └── README.md                   # Hướng dẫn chi tiết Mobile App
│
├── 📂 Backend_core/                # ⚙️ PHẦN 2: BACKEND CORE 3-LỚP (.NET API)
│   ├── ZooAudioGuide.API/
│   └── ZooAudioGuide.Tests/
│
├── 📂 MicroServices/               # 🔄 PHẦN 3: BACKEND MICROSERVICES
│   └── Readme.txt
│
├── .gitignore                      # Loại bỏ node_modules, dist, bin, obj khi push
└── README.md                       # Tài liệu tổng quan dự án
```

---

## 🚀 Hướng Dẫn Chạy Phân Hệ Front-end

### 1. Chạy Web Admin (React.js)
```bash
cd Frontend_Web
npm install
npm run dev
```
Truy cập giao diện Web Admin tại: `http://localhost:5173`

### 2. Chạy Mobile App (React Native / Expo)
```bash
cd Frondend_MobileApp
npm install
npx expo start
```
Mở ứng dụng **Expo Go** trên điện thoại để quét mã QR và trải nghiệm.

### 3. Kiểm Tra Lỗi Code Tự Động (CI/CD)
Mỗi khi có commit mới đẩy lên nhánh `main`, **GitHub Actions** sẽ tự động kích hoạt workflow [`.github/workflows/fe-ci.yml`](.github/workflows/fe-ci.yml) để:
* Kiểm tra linter và đóng gói build `Frontend_Web`.
* Kiểm tra cú pháp JavaScript của `Frondend_MobileApp`.