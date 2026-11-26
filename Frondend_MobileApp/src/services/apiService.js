/**
 * Dịch vụ Kết nối API Backend Core & Đồng bộ CSDL
 * Tự động đồng bộ danh sách loài thú từ API Backend ASP.NET Core
 * và hỗ trợ lưu trữ dự phòng ngoại tuyến (Offline Fallback)
 */

import { INITIAL_ZOO_ANIMALS } from '../data/animals';

// Cấu hình mặc định máy chủ API (ưu tiên Production Render)
export const DEFAULT_API_CONFIG = {
  baseUrl: 'https://backend-zooaudio.onrender.com/api',
  localUrl: 'http://localhost:8080/api',
  timeoutMs: 10000
};

/**
 * Lấy danh sách loài thú từ Backend API
 * @param {string} customUrl - URL máy chủ tùy chọn
 * @param {string} lang - Mã ngôn ngữ (vi, en, ja, ko)
 * @returns {Promise<{success: boolean, data: Array, source: string, error?: string}>}
 */
export async function fetchAnimalsFromBackend(customUrl = null, lang = 'vi') {
  const targetUrl = customUrl || DEFAULT_API_CONFIG.baseUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_API_CONFIG.timeoutMs);

    const res = await fetch(`${targetUrl}/animals?lang=${lang}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Máy chủ phản hồi mã lỗi ${res.status}`);
    }

    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (json.data || []);

    if (rawList.length === 0) {
      return {
        success: true,
        data: INITIAL_ZOO_ANIMALS,
        source: 'local_fallback',
        message: 'CSDL máy chủ hiện trống, sử dụng bộ dữ liệu mẫu'
      };
    }

    // Mapping DTO từ Backend C# sang format chuẩn của Mobile App
    const mapped = rawList.map((item, idx) => {
      const lon = parseFloat(item.longitude || item.lon) || (106.7050 + (idx * 0.0003));
      const lat = parseFloat(item.latitude || item.lat) || (10.7870 + (idx * 0.0002));
      const radius = parseInt(item.radiusMeters || item.radius) || 25;

      return {
        id: item.id ? String(item.id) : `api-${idx + 1}`,
        qrCode: `TCV-ANIMAL-${String(item.id || idx + 1).padStart(2, '0')}`,
        name: item.defaultLocalName || item.name || 'Loài thú chưa đặt tên',
        scientificName: item.scientificName || 'Species incognita',
        zoneId: item.zoneId ? String(item.zoneId) : 'zone-1',
        zone: item.zoneName || 'Khu Sinh Thái Thảo Cầm Viên',
        coords: { lon, lat },
        radius: radius,
        iucnStatus: item.iucnStatus || "Ít quan tâm (LC)",
        diet: item.diet || "Thức ăn tự nhiên theo tiêu chuẩn sở thú",
        habitat: item.habitat || "Rừng nhiệt đới ẩm & đồng bằng",
        lifespan: item.lifespan || "15 - 25 năm",
        image: item.avatarUrl || item.imageUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Indochinese_Tiger_2.JPG/640px-Indochinese_Tiger_2.JPG",
        audioUrl: item.audioUrl || "",
        audioDuration: 90,
        description: {
          vi: item.scriptText || "Bài thuyết minh về loài thú đang được ban quản lý cập nhật.",
          en: "Indochinese tiger commentary and biological information.",
          ja: "動物園の自動音声ガイド解説です。",
          ko: "사이공 동식물원 자동 음성 안내입니다."
        }
      };
    });

    return {
      success: true,
      data: mapped,
      source: 'backend_api',
      message: `Đã nạp thành công ${mapped.length} loài thú từ máy chủ`
    };

  } catch (err) {
    // Tự động fallback về dữ liệu cục bộ khi offline
    return {
      success: false,
      data: INITIAL_ZOO_ANIMALS,
      source: 'offline_cache',
      error: err.message,
      message: 'Không thể kết nối máy chủ, đang chạy chế độ Ngoại Tuyến (Offline)'
    };
  }
}
