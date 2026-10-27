/**
 * Admin Portal Master Orchestrator
 */
import { adminState } from './admin-state.js';
import { adminAuth } from './admin-auth.js';
import { adminDashboard } from './admin-dashboard.js';
import { adminZones } from './admin-zones.js';
import { adminAnimals } from './admin-animals.js';
import { adminContent } from './admin-content.js';
import { adminQr } from './admin-qr.js';
import { adminMapPicker } from './admin-map-picker.js';

class AdminApp {
  async init() {
    console.log('🚀 Khởi tạo Cổng Quản Trị Hệ Thống (Admin Web Portal)...');

    // 1. Initialize Auth
    adminAuth.init();

    // 2. Initialize Sub-controllers
    adminDashboard.init();
    adminZones.init();
    adminAnimals.init();
    adminContent.init();
    adminQr.init();

    // 3. Bind Tab Navigation
    this.bindTabNavigation();

    // 4. Load Data from Backend
    await this.loadAllData();

    // 5. Initialize Picker Map
    setTimeout(() => {
      adminMapPicker.initPickerMap('admin-picker-map');
    }, 250);
  }

  async loadAllData() {
    await Promise.all([
      adminZones.loadZones(),
      adminAnimals.loadAnimals(),
    ]);

    const { animals, zones } = adminState.get();

    // Setup initial QR selection
    if (animals && animals.length > 0) {
      adminQr.generateQrForAnimal(animals[0]);
    }

    // Setup overview map
    setTimeout(() => {
      adminMapPicker.initOverviewMap('admin-overview-map', zones);
    }, 300);
  }

  bindTabNavigation() {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-tab');
        if (tabKey) this.switchTab(tabKey);
      });
    });
    document.querySelectorAll('[data-close-modal]').forEach(button => {
      button.addEventListener('click', () => {
        const modal = document.getElementById(button.dataset.closeModal);
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
      });
    });
  }

  switchTab(tabKey) {
    adminState.set({ currentTab: tabKey });

    // Hide all panes
    document.querySelectorAll('.admin-pane').forEach(el => el.classList.add('hidden'));

    // Reset active styles without discarding each button's layout classes.
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('font-black', 'bg-emerald-500', 'text-slate-950', 'shadow-md');
      btn.classList.add('font-bold', 'text-slate-400', 'hover:text-white', 'hover:bg-slate-800/60');
    });

    // Show target pane
    const targetPane = document.getElementById(`pane-${tabKey}`);
    const targetBtn = document.getElementById(`tab-btn-${tabKey}`);

    if (targetPane) targetPane.classList.remove('hidden');
    if (targetBtn) {
      targetBtn.classList.remove('font-bold', 'text-slate-400', 'hover:text-white', 'hover:bg-slate-800/60');
      targetBtn.classList.add('font-black', 'bg-emerald-500', 'text-slate-950', 'shadow-md');
    }

    // Invalidate maps if switching to their tab
    if (tabKey === 'create') {
      setTimeout(() => {
        adminMapPicker.initPickerMap('admin-picker-map');
        if (adminMapPicker.map) adminMapPicker.map.invalidateSize();
      }, 100);
    } else if (tabKey === 'overview') {
      setTimeout(() => {
        const { zones } = adminState.get();
        adminMapPicker.initOverviewMap('admin-overview-map', zones);
      }, 100);
    }
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const app = new AdminApp();
  app.init();
});
