/**
 * Visitor API Service - Client endpoints for Visitor App
 */
import { apiClient } from './client.js';
import { CONFIG } from '../config.js';

export const VisitorApi = {
  /**
   * Get all animals from Backend Core
   */
  async getAnimals() {
    try {
      const data = await apiClient.get('/api/animals');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Backend Core API chưa phản hồi:', err.message);
      return [];
    }
  },

  /**
   * Get single animal by ID with specific language content (PRD FR-01, FR-02, US-01)
   */
  async getAnimalById(id, lang = 'vi') {
    try {
      return await apiClient.get(`/api/animals/${id}?lang=${encodeURIComponent(lang)}`);
    } catch (err) {
      console.warn(`Không thể lấy chi tiết thú ID ${id} từ API, tìm trong cache:`, err.message);
      throw err;
    }
  },

  /**
   * Get all zones with location and radius for Geofencing (PRD FR-03, US-04)
   */
  async getZones() {
    try {
      const data = await apiClient.get('/api/zones');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Không thể tải danh sách Zone từ Backend:', err.message);
      return [];
    }
  },

  /**
   * Get active languages list (PRD FR-17)
   */
  async getLanguages() {
    try {
      const data = await apiClient.get('/api/languages');
      return Array.isArray(data) && data.length > 0 ? data : CONFIG.LANGUAGES;
    } catch (_) {
      return CONFIG.LANGUAGES;
    }
  },

  /**
   * Log visitor scan event into SCAN_LOGS (PRD FR-06, US-07)
   */
  async logScan(animalId, source = 'QR', languageCode = 'vi') {
    try {
      const payload = {
        animalId: Number(animalId),
        sessionId: apiClient.getSessionId(),
        source: source.toUpperCase(), // 'QR' or 'GEO'
        languageCode: languageCode,
        userAgent: navigator.userAgent
      };
      await apiClient.post('/api/scan-logs', payload);
    } catch (err) {
      // PRD US-07: Lỗi ghi log không được làm hỏng giao diện trang
      console.warn('Lỗi ghi SCAN_LOGS không nghiêm trọng (bỏ qua):', err.message);
    }
  },

  /**
   * Request TTS narration audio from Narration Microservice
   */
  async getNarrationAudio(text, targetLang = 'vi') {
    const url = `${CONFIG.NARRATION_SERVICE_URL}/api/narration`;
    const payload = { text, targetLang };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Narration service trả về lỗi HTTP ${response.status}`);
      }
      return await response.blob();
    } catch (err) {
      console.warn('MicroService Narration (:5292) ngoại tuyến:', err.message);
      throw err;
    }
  }
};
