/**
 * Admin Dashboard & Live Statistics Controller
 * Displays Total Scans, Today, Live Online Visitors (every 15s), Top Exhibits (PRD FR-07, US-08 to US-10)
 */
import { AdminApi } from '../api/admin-api.js';
import { adminState } from './admin-state.js';

class AdminDashboard {
  constructor() {
    this.pollIntervalId = null;
  }

  init() {
    if (AdminApi.isAuthenticated()) this.loadStats();
    this.startLivePolling();
    window.addEventListener('admin:authenticated', () => this.loadStats());
  }

  async loadStats() {
    try {
      const stats = await AdminApi.getDashboardOverview();
      adminState.set({ stats });
      this.renderKpiCards(stats);
      this.renderTopAnimals(stats.topAnimals || []);
      this.renderLanguageDistribution(stats.scansByLanguage || {});
    } catch (err) {
      console.warn('Lỗi tải thống kê dashboard:', err);
    }
  }

  startLivePolling() {
    // PRD US-10: Tự làm mới số người đang truy cập mỗi 15-30 giây
    if (this.pollIntervalId) clearInterval(this.pollIntervalId);
    this.pollIntervalId = setInterval(() => {
      const { currentTab } = adminState.get();
      if (currentTab === 'overview' && AdminApi.isAuthenticated()) {
        this.loadStats();
      }
    }, 15000);
  }

  renderKpiCards(stats) {
    const elTotal = document.getElementById('kpi-total-scans');
    const elToday = document.getElementById('kpi-scans-today');
    const elOnline = document.getElementById('kpi-online-visitors');

    if (elTotal) elTotal.innerText = Number(stats.totalScans ?? 0).toLocaleString();
    if (elToday) elToday.innerText = Number(stats.scansToday ?? 0).toLocaleString();
    if (elOnline) {
      const onlineVisitors = Number(stats.activeOnlineUsers ?? 0);
      elOnline.innerHTML = `
        <span class="inline-flex items-center space-x-1.5">
          ${onlineVisitors > 0 ? '<span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>' : ''}
          <span>${onlineVisitors.toLocaleString()}</span>
        </span>
      `;
    }
  }

  renderTopAnimals(topAnimals) {
    const container = document.getElementById('dashboard-top-animals');
    if (!container) return;

    if (!topAnimals || topAnimals.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-500">Chưa có dữ liệu động vật từ cơ sở dữ liệu.</p>';
      return;
    }

    const maxCount = Math.max(...topAnimals.map(t => t.count), 1);

    container.innerHTML = topAnimals.map((item, idx) => {
      const pct = Math.round((item.count / maxCount) * 100);
      return `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-slate-200">#${idx + 1} ${this.escapeHtml(item.name)}</span>
            <span class="text-emerald-400 font-mono">${item.count} lượt</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full rounded-full bg-emerald-500 transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderLanguageDistribution(langMap) {
    const container = document.getElementById('dashboard-lang-distribution');
    if (!container) return;

    const entries = Object.entries(langMap);
    const total = entries.reduce((sum, [_, v]) => sum + v, 0) || 1;

    const flagMap = {
      vi: '🇻🇳 Tiếng Việt',
      en: '🇬🇧 English',
      ko: '🇰🇷 한국어',
      ja: '🇯🇵 日本語',
      zh: '🇨🇳 中文',
    };

    if (entries.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-500">Chưa có dữ liệu lượt nghe từ cơ sở dữ liệu.</p>';
      return;
    }

    container.innerHTML = entries.map(([code, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
          <span class="font-bold text-slate-200">${flagMap[code] || code.toUpperCase()}</span>
          <span class="font-mono text-emerald-400 font-bold">${count} (${pct}%)</span>
        </div>
      `;
    }).join('');
  }

  escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }
}

export const adminDashboard = new AdminDashboard();
