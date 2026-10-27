/**
 * Admin API Service - Management & Dashboard Endpoints
 */
import { apiClient } from './client.js';

export const AdminApi = {
  /**
   * Admin Login (PRD FR-11, US-11)
   */
  async login(username, password) {
    const res = await apiClient.post('/api/admin/auth/login', { username, password });
    if (res?.token) apiClient.setAuthToken(res.token);
    return res;
  },

  async logout() {
    try {
      if (apiClient.getAuthToken()) await apiClient.post('/api/admin/auth/logout');
    } finally {
      apiClient.setAuthToken('');
    }
  },

  isAuthenticated() {
    return Boolean(apiClient.getAuthToken());
  },

  // ================= ZONE CRUD =================
  async getZones() {
    return await apiClient.get('/api/zones');
  },

  async createZone(data) {
    return await apiClient.post('/api/zones', data);
  },

  async updateZone(id, data) {
    return await apiClient.put(`/api/zones/${id}`, data);
  },

  async deleteZone(id) {
    return await apiClient.delete(`/api/zones/${id}`);
  },

  // ================= ANIMAL CRUD =================
  async getAnimals() {
    return await apiClient.get('/api/animals');
  },

  async createAnimal(data) {
    return await apiClient.post('/api/animals', {
      zoneId: Number(data.zoneId),
      scientificName: data.scientificName || data.defaultLocalName,
      avatarUrl: data.avatarUrl || '',
      localName: data.defaultLocalName,
      scriptText: data.scriptText
    });
  },

  async updateAnimal(id, data) {
    return await apiClient.put(`/api/animals/${id}`, {
      zoneId: Number(data.zoneId),
      scientificName: data.scientificName || data.defaultLocalName,
      avatarUrl: data.avatarUrl || '',
      localName: data.defaultLocalName,
      scriptText: data.scriptText
    });
  },

  async deleteAnimal(id) {
    return await apiClient.delete(`/api/animals/${id}`);
  },

  // ================= MULTILINGUAL CONTENT & SYNC =================
  async getAnimalContent(animalId, lang = 'vi') {
    return await apiClient.get(`/api/admin/animals/${animalId}/contents/${lang}`);
  },

  async saveAnimalContent(animalId, lang, contentText, isManual = false) {
    return await apiClient.put(`/api/admin/animals/${animalId}/contents/${lang}`, {
      contentText,
      isManual
    });
  },

  async getSyncStatuses(animalId) {
    return await apiClient.get(`/api/admin/animals/${animalId}/sync-status`);
  },

  // ================= DASHBOARD & STATISTICS =================
  async getDashboardOverview() {
    return await apiClient.get('/api/admin/stats/overview');
  }
};
