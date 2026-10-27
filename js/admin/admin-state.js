/**
 * Admin Reactive State Store
 */
class AdminState {
  constructor() {
    this.state = {
      zones: [],
      animals: [],
      stats: null,
      currentTab: 'overview', // 'overview', 'create', 'multilingual', 'signage'
      selectedAnimalId: null,
      selectedLanguage: 'vi',
      isAuthenticated: false,
    };
    this.listeners = new Set();
  }

  get() {
    return this.state;
  }

  set(partial) {
    this.state = { ...this.state, ...partial };
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
        console.error('Lỗi admin state listener:', err);
      }
    }
  }
}

export const adminState = new AdminState();
