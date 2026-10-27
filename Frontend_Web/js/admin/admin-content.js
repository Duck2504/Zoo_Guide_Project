/**
 * Multilingual Content & Translation/TTS Studio Controller
 * Handles auto-translation, manual override (IsManual), sync statuses (PRD FR-08, FR-09, FR-14, US-15 to US-18)
 */
import { AdminApi } from '../api/admin-api.js';
import { VisitorApi } from '../api/visitor-api.js';
import { adminState } from './admin-state.js';
import { adminAnimals } from './admin-animals.js';

class AdminContent {
  constructor() {
    this.currentAnimalId = null;
    this.currentLang = 'vi';
    this.contentsCache = {}; // lang -> { text, status, audioUrl, isManual }
    this.audioPreview = new Audio();
    this.isAudioPlaying = false;
  }

  init() {
    this.bindEvents();
    window.addEventListener('admin:animal-deleted', (event) => {
      if (Number(event.detail) === this.currentAnimalId) this.clearSelection();
    });
  }

  async selectAnimal(animalId) {
    if (!animalId) {
      this.clearSelection();
      return;
    }
    this.currentAnimalId = Number(animalId);
    adminState.set({ selectedAnimalId: this.currentAnimalId });

    const { animals } = adminState.get();
    const animal = animals.find(a => Number(a.id) === this.currentAnimalId);
    if (!animal) return;

    const languages = ['vi', 'en', 'ko', 'ja', 'zh'];
    const selectedAnimalId = this.currentAnimalId;
    const loadedContents = await Promise.all(languages.map(async (lang) => {
      try {
        const content = await AdminApi.getAnimalContent(selectedAnimalId, lang);
        return [lang, {
          text: content.contentText || '',
          status: (content.syncStatus || 'PENDING').toUpperCase(),
          isManual: Boolean(content.isManual),
          audioUrl: content.audioUrl || ''
        }];
      } catch (err) {
        console.error(`Không thể tải nội dung ${lang.toUpperCase()} từ cơ sở dữ liệu:`, err);
        return [lang, { text: '', status: 'FAILED', isManual: false }];
      }
    }));
    if (this.currentAnimalId !== selectedAnimalId) return;
    this.contentsCache = Object.fromEntries(loadedContents);

    // Render tabs and current language
    this.renderLanguageTabs();
    this.loadLanguageContent(this.currentLang);
  }

  clearSelection() {
    this.currentAnimalId = null;
    this.contentsCache = {};
    const textarea = document.getElementById('content-text-editor');
    if (textarea) textarea.value = '';
    const manual = document.getElementById('content-is-manual');
    if (manual) manual.checked = false;
    const status = document.getElementById('content-active-status');
    if (status) {
      status.innerText = 'CHƯA CHỌN';
      status.className = 'status-pill badge-pending';
    }
    this.renderLanguageTabs();
  }

  renderLanguageTabs() {
    const container = document.getElementById('content-lang-tabs');
    if (!container) return;

    const langs = [
      { code: 'vi', label: '🇻🇳 Tiếng Việt (Gốc)' },
      { code: 'en', label: '🇬🇧 English' },
      { code: 'ko', label: '🇰🇷 한국어' },
      { code: 'ja', label: '🇯🇵 日本語' },
      { code: 'zh', label: '🇨🇳 中文' },
    ];

    container.innerHTML = langs.map(l => {
      const item = this.contentsCache[l.code] || {};
      const status = item.status || 'PENDING';
      const statusClass = status === 'DONE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : status === 'PROCESSING' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 animate-pulse'
        : status === 'FAILED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

      const isActive = l.code === this.currentLang;
      return `
        <button type="button" data-lang="${l.code}" class="btn-lang-tab py-2 px-3 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${isActive ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
          <span>${l.label}</span>
          <span class="px-1.5 py-0.5 rounded-full text-[9px] font-black border ${statusClass}">${status}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.btn-lang-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        this.switchLanguage(lang);
      });
    });
  }

  switchLanguage(lang) {
    this.currentLang = lang;
    this.renderLanguageTabs();
    this.loadLanguageContent(lang);
  }

  loadLanguageContent(lang) {
    const textarea = document.getElementById('content-text-editor');
    const isManualCheckbox = document.getElementById('content-is-manual');
    const statusBadge = document.getElementById('content-active-status');

    const item = this.contentsCache[lang] || { text: '', status: 'PENDING', isManual: false };

    if (textarea) textarea.value = item.text || '';
    if (isManualCheckbox) isManualCheckbox.checked = Boolean(item.isManual);
    if (statusBadge) {
      statusBadge.innerText = item.status || 'PENDING';
      statusBadge.className = `status-pill ${item.status === 'DONE' ? 'badge-done' : item.status === 'PROCESSING' ? 'badge-processing' : item.status === 'FAILED' ? 'badge-failed' : 'badge-pending'}`;
    }
  }

  async triggerAutoTranslation() {
    alert('Chưa có dịch vụ dịch tự động kết nối với API. Vui lòng nhập bản dịch ở từng ngôn ngữ và bấm Lưu Bản Dịch; nút nghe thử chỉ phát âm thanh, không lưu bản dịch.');
  }

  async previewAudio() {
    const item = this.contentsCache[this.currentLang];
    const text = item?.text || document.getElementById('content-text-editor')?.value;
    if (!text) return alert('Chưa có nội dung để phát âm thanh.');

    const btn = document.getElementById('btn-preview-audio');
    if (this.isAudioPlaying) {
      this.audioPreview.pause();
      this.isAudioPlaying = false;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1"></i> Nghe thử Audio';
      return;
    }

    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang tải...';

    try {
      const blob = await VisitorApi.getNarrationAudio(text, this.currentLang);
      const url = URL.createObjectURL(blob);
      this.audioPreview.src = url;
      this.audioPreview.onended = () => {
        this.isAudioPlaying = false;
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1"></i> Nghe thử Audio';
      };
      await this.audioPreview.play();
      this.isAudioPlaying = true;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-pause mr-1 text-emerald-400"></i> Đang phát thử (Dừng)';
    } catch (_) {
      // Fallback Web Speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.onend = () => {
          this.isAudioPlaying = false;
          if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1"></i> Nghe thử Audio';
        };
        window.speechSynthesis.speak(utter);
        this.isAudioPlaying = true;
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause mr-1 text-emerald-400"></i> Đang phát (Web Speech)';
      }
    }
  }

  async saveCurrentLanguage() {
    if (!this.currentAnimalId) return alert('Vui lòng chọn động vật trước.');
    const text = document.getElementById('content-text-editor')?.value.trim();
    const isManual = document.getElementById('content-is-manual')?.checked;

    if (!text) return alert('Nội dung không được để trống');

    try {
      const savedContent = await AdminApi.saveAnimalContent(
        this.currentAnimalId,
        this.currentLang,
        text,
        Boolean(isManual)
      );
      this.contentsCache[this.currentLang] = {
        text: savedContent.contentText,
        status: (savedContent.syncStatus || 'PENDING').toUpperCase(),
        isManual: savedContent.isManual,
        audioUrl: savedContent.audioUrl
      };
      this.renderLanguageTabs();
      this.loadLanguageContent(this.currentLang);
      if (this.currentLang === 'vi') await adminAnimals.loadAnimals();
      alert(`Đã lưu nội dung ${this.currentLang.toUpperCase()} vào cơ sở dữ liệu.`);
    } catch (err) {
      alert(`Không thể lưu nội dung vào cơ sở dữ liệu: ${err.message}`);
    }
  }

  bindEvents() {
    const sel = document.getElementById('content-animal-select');
    if (sel) {
      sel.addEventListener('change', (e) => this.selectAnimal(e.target.value));
    }

    const btnAuto = document.getElementById('btn-auto-translate');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => this.triggerAutoTranslation());
    }

    const btnSave = document.getElementById('btn-save-content');
    if (btnSave) {
      btnSave.addEventListener('click', () => this.saveCurrentLanguage());
    }

    const btnPreview = document.getElementById('btn-preview-audio');
    if (btnPreview) {
      btnPreview.addEventListener('click', () => this.previewAudio());
    }
  }
}

export const adminContent = new AdminContent();
