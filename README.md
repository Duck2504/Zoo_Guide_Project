# 🦁 HỆ THỐNG THUYẾT MINH SỞ THÚ TỰ ĐỘNG ĐA NGÔN NGỮ
## DỰ ÁN MÔN HỌC CÔNG NGHỆ PHẦN MỀM — THẢO CẦM VIÊN SÀI GÒN

* **Giảng viên hướng dẫn:** **TS. Nguyễn Quốc Huy**
* **Khoa:** Công Nghệ Thông Tin
* **Đề tài:** **Thuyết minh tự động đa ngôn ngữ**


---

## 👥 Bảng Phân Công Nhiệm Vụ Thành Viên

Theo đúng yêu cầu của đề tài, dự án được chia làm 3 phân hệ độc lập và tích hợp CI/CD tự động:

| Vai Trò | Phân Hệ Phụ Trách | Công Nghệ Áp Dụng | Trạng Thái & CI/CD |
| :--- | :--- | :--- | :---: |
| **Phần 1: FE DEV** | • **`Frontend_Web`**: Cổng Web Admin Quản trị<br>• **`Frondend_MobileApp`**: App Mobile Du Khách | • **React.js** (Vite, Leaflet, Web Speech)<br>• **React Native** (Expo, GPS Location, Audio) | ✅ **HOÀN THÀNH**<br>`fe-ci.yml` |
| **Phần 2: BE Dev 1** | • **`Backend_core`**: API Lõi quản trị dữ liệu | • Hướng kiến trúc **3 Lớp**<br>(`Controller -> Service -> Repository`) | ⚙️ Đang tích hợp<br>`be-core-ci.yml` |
| **Phần 3: BE Dev 2** | • **`MicroServices`**: Dịch thuật & TTS Engine | • Microservices giao tiếp liên dịch vụ<br>(`REST API, Edge-TTS, Translator`) | ⚙️ Đang tích hợp<br>`be-services-ci.yml` |

---

