/**
 * Visitor Reactive State Store
 */
import { CONFIG } from '../config.js';

class VisitorState {
  constructor() {
    this.state = {
      animals: [],
      zones: [],
      selectedAnimal: null,
      currentLanguage: localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE) || 'vi',
      isPlaying: false,
      userLocation: null,
      isAutoGeofenceEnabled: true,
      mapType: 'roadmap', // 'roadmap' or 'satellite'
      searchQuery: '',
      activeView: 'map', // 'map' or 'grid'
    };
    this.listeners = new Set();
  }

  get() {
    return this.state;
  }

  set(partial) {
    this.state = { ...this.state, ...partial };
    if (partial.currentLanguage) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, partial.currentLanguage);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Lỗi listener state:', err);
      }
    }
  }
}

export const visitorState = new VisitorState();
