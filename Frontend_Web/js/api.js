/**
 * api.js - Thảo Cầm Viên Sài Gòn
 * Centralized API client, backend integration, scan logging, and offline fallback
 */

const API_BASE_URL = 'http://localhost:5222';
const NARRATION_SERVICE_URL = 'http://localhost:5292';
const STORAGE_KEY_ANIMALS = 'ZOO_ANIMALS_DATA_V3';
const STORAGE_KEY_SESSION = 'zoo_session_id';
const STORAGE_KEY_LOGS = 'zoo_offline_logs';

/**
 * Get or generate persistent visitor SessionId (UUID v4)
 * Compliant with PRD US-07 & 4.4
 */
function getVisitorSessionId() {
  let sessionId = localStorage.getItem(STORAGE_KEY_SESSION);
  if (!sessionId) {
    sessionId = 'sess-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem(STORAGE_KEY_SESSION, sessionId);
  }
  return sessionId;
}

/**
 * Dispatch scan/listen log to Backend Core
 * @param {string} animalId 
 * @param {'QR'|'GEO'} source 
 * @param {string} languageCode 
 */
async function sendScanLog(animalId, source = 'QR', languageCode = 'vi') {
  const sessionId = getVisitorSessionId();
  const logPayload = {
    animalId: animalId,
    source: source,
    languageCode: languageCode,
    sessionId: sessionId,
    scannedAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/scan-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logPayload)
    });
    if (res.ok) {
      console.log(`[ScanLog] Log sent successfully (${source} - ${animalId} - ${languageCode})`);
      return true;
    }
  } catch (err) {
    console.warn('[ScanLog] Backend API offline. Queuing log locally.', err.message);
  }

  // Graceful offline fallback
  try {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');
    queue.push(logPayload);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(queue.slice(-50)));
  } catch (e) {}
  return false;
}

/**
 * Get active zoo animals with priority: LocalStorage -> Default Mock
 */
function getZooAnimals() {
  try {
    const raw = localStorage.getItem('ZOO_ANIMALS_DATA_V3') || localStorage.getItem('zoo_animals_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local zoo animals:', e);
  }
  return (typeof DEFAULT_ZOO_ANIMALS !== 'undefined') ? DEFAULT_ZOO_ANIMALS : [];
}

/**
 * Save active zoo animals to LocalStorage and notify all components
 */
function saveZooAnimals(animals) {
  if (!Array.isArray(animals)) return;
  localStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(animals));
  window.dispatchEvent(new CustomEvent('zooDataUpdated', { detail: animals }));
}

/**
 * Fetch animals from Backend Core .NET API if available
 */
/**
 * Fetch animals from Backend Core .NET API khi người dùng kết nối cơ sở dữ liệu
 */
async function fetchAnimalsFromBackend(forceSync = false) {
  if (!forceSync) {
    // Mặc định ban đầu chưa nạp dữ liệu (0 loài thú), chỉ tự động nạp khi người dùng gọi kết nối database
    return { success: false, data: getZooAnimals(), source: 'empty' };
  }

  try {
    let res = await fetch(`${API_BASE_URL}/api/v1/animals`, { method: 'GET' });
    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/api/animals`, { method: 'GET' });
    }
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item, idx) => {
          return {
            id: String(item.id || `zoo-${idx + 1}`),
            name: item.name || item.defaultLocalName || item.animalName || `Loài thú #${idx + 1}`,
            scientificName: item.scientificName || '',
            zone: item.zone || item.zoneName || 'Khu Vực Thảo Cầm Viên',
            conservationStatus: item.conservationStatus || 'LC - Ít quan tâm',
            diet: item.diet || 'Ăn thực vật / tạp',
            coordinates: item.coordinates || (item.latitude && item.longitude ? { lat: Number(item.latitude), lon: Number(item.longitude) } : { lat: 10.7875, lon: 106.7050 }),
            radius_meters: Number(item.radius_meters || item.radiusMeters || 25),
            color: item.color || '#059669',
            imageUrl: item.imageUrl || item.avatarUrl || item.thumbnailUrl || 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600',
            descriptionVi: item.descriptionVi || item.scriptText || item.description || '',
            audioLength: item.audioLength || '01:20'
          };
        });
        saveZooAnimals(mapped);
        return { success: true, data: mapped, source: 'backend' };
      }
    }
  } catch (err) {
    console.info('[Backend API] Backend Core is not running or database is empty.');
  }
  return { success: false, data: [], source: 'empty' };
}

/**
 * Hàm kích hoạt kết nối và đồng bộ cơ sở dữ liệu từ Backend API:
 * Khi người dùng thêm database vào, chỉ cần gọi window.syncFromDatabaseApi() hoặc window.loadZooDatabase(data)
 */
async function syncFromDatabaseApi() {
  console.log('[Zoo Database] Đang đồng bộ cơ sở dữ liệu từ API Backend...');
  const res = await fetchAnimalsFromBackend(true);
  if (res.success && res.data.length > 0) {
    if (typeof window.loadZooDatabase === 'function') {
      window.loadZooDatabase(res.data);
    }
    return res.data;
  }
  return [];
}
window.syncFromDatabaseApi = syncFromDatabaseApi;



// Global & Module Export Bridge
const _apiExports = {
  getVisitorSessionId: (typeof getVisitorSessionId !== 'undefined') ? getVisitorSessionId : () => 'sess-default',
  sendScanLog: (typeof sendScanLog !== 'undefined') ? sendScanLog : () => {},
  fetchAnimalsFromBackend: (typeof fetchAnimalsFromBackend !== 'undefined') ? fetchAnimalsFromBackend : () => Promise.resolve({ data: [] })
};

if (typeof window !== 'undefined') {
  Object.assign(window, _apiExports);
}
if (typeof global !== 'undefined') {
  Object.assign(global, _apiExports);
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = _apiExports;
}
