/**
 * Unified API Client for Saigon Zoo System
 * Handles Session ID, JWT tokens, timeouts, and error handling.
 */
import { CONFIG } from '../config.js';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || CONFIG.API_BASE_URL;
  }

  /**
   * Get or initialize visitor unique session ID (PRD US-07 / US-10)
   */
  getSessionId() {
    let sessionId = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION_ID, sessionId);
    }
    return sessionId;
  }

  /**
   * Get Admin JWT Token
   */
  getAuthToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN) || '';
  }

  /**
   * Set Admin JWT Token
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  /**
   * Core request wrapper
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Session-Id': this.getSessionId(),
      ...options.headers,
    };

    const token = this.getAuthToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Handle HTTP Errors
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.detail || errData.title || errData.error || errorMsg;
        } catch (_) {
          const text = await response.text();
          if (text) errorMsg = text;
        }
        if (response.status === 401 && token && !endpoint.includes('/api/admin/auth/login')) {
          this.setAuthToken('');
          window.dispatchEvent(new Event('admin:auth-expired'));
        }
        const err = new Error(errorMsg);
        err.status = response.status;
        throw err;
      }

      // If expecting Blob/File (e.g. mp3 audio or image)
      if (options.responseType === 'blob') {
        return await response.blob();
      }

      // If expecting Text
      if (options.responseType === 'text') {
        return await response.text();
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu hết thời gian chờ (Timeout 10s)');
      }
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
