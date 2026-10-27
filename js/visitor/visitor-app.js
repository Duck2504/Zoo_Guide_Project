/**
 * Visitor Application Main Controller
 * Orchestrates Map, Audio, Geofence, QR Scanner, and UI Interactions
 */
import { CONFIG, UI_TRANSLATIONS } from '../config.js';
import { VisitorApi } from '../api/visitor-api.js';
import { visitorState } from './visitor-state.js';
import { visitorMap } from './visitor-map.js';
import { visitorAudio } from './visitor-audio.js';
import { visitorGeofence } from './visitor-geofence.js';
import { visitorQrScanner } from './visitor-qr.js';

class VisitorApp {
  async init() {
    console.log('🚀 Khởi tạo Hệ thống Thuyết minh Thảo Cầm Viên (Visitor Web)...');

    // 1. Initialize Map
    visitorMap.init('google-maps-view', (animal) => this.selectAnimal(animal));

    // 2. Initialize QR Scanner
    visitorQrScanner.init((animalId) => this.handleQrScanned(animalId));

    // 3. Bind Audio State updates to UI
    visitorAudio.onStateChange = (state) => this.updateAudioPlayerUI(state);

    // 4. Bind UI DOM Events
    this.bindDomEvents();

    // 5. Load Data
    await this.loadInitialData();

    // 6. Check URL query params (e.g. /a/1 or ?id=1 from QR code)
    this.checkInitialUrlParams();

    // 7. Start GPS Geofencing
    this.startGeofencing();

    // 8. Render UI with initial language
    this.updateLanguageUI(visitorState.get().currentLanguage);
  }

  async loadInitialData() {
    const [animals, zones] = await Promise.all([
      VisitorApi.getAnimals(),
      VisitorApi.getZones(),
    ]);

    const formattedAnimals = animals.map((a, idx) => {
      const z = zones.find(z => z.id === a.zoneId) || {};
      const defaultIcons = ['🐘', '🐅', '🦒', '🦩', '🐊', '🦏', '🐻', '🐆'];
      const defaultColors = ['#059669', '#ea580c', '#ca8a04', '#ec4899', '#0284c7', '#16a34a', '#6366f1', '#475569'];

      return {
        id: a.id,
        name: a.defaultLocalName || a.name,
        scientificName: a.scientificName || '',
        zone: z.zoneCode || a.zone || 'Khu Thảo Cầm Viên',
        zoneId: a.zoneId || z.id,
        coords: a.coords || [z.latitude || 10.7876, z.longitude || 106.7056],
        radius: a.radius || z.radius || CONFIG.GEOFENCE.DEFAULT_RADIUS_METERS,
        image: a.avatarUrl || a.image || 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600',
        narrative: a.scriptText || a.narrative || `Chào mừng quý khách đến với khu vực chuồng ${a.defaultLocalName || a.name}.`,
        multilingual: a.multilingual || {},
        icon: a.icon || defaultIcons[idx % defaultIcons.length],
        color: a.color || defaultColors[idx % defaultColors.length],
      };
    });

    visitorState.set({ animals: formattedAnimals, zones });
    visitorMap.renderAnimals(formattedAnimals);
    this.renderAnimalsGrid(formattedAnimals);

    if (formattedAnimals.length > 0) {
      this.updateMobileMockup(formattedAnimals[0]);
    }
  }

  checkInitialUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || urlParams.get('animalId');
    if (id) {
      this.handleQrScanned(Number(id));
    }
  }

  startGeofencing() {
    visitorGeofence.startTracking(
      (lat, lng) => {
        visitorMap.updateTouristPosition(lat, lng);
      },
      (animal, distance) => {
        this.showGeofenceToast(animal, distance);
        this.selectAnimal(animal);
        // PRD FR-03: Tự động phát khi vào bán kính
        this.playAnimal(animal, 'GEO');
      }
    );
  }

  showGeofenceToast(animal, distance) {
    let toast = document.getElementById('geofence-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'geofence-toast';
      toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-center space-x-3 text-xs transition duration-300 pointer-events-auto';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">📍</div>
      <div>
        <div class="font-extrabold text-white">Vào Vùng Geofence: ${animal.name} (${distance}m)</div>
        <div class="text-[11px] text-emerald-400">Tự động phát thuyết minh theo ngôn ngữ đã chọn.</div>
      </div>
    `;
    toast.classList.remove('hidden');
    setTimeout(() => {
      if (toast) toast.classList.add('hidden');
    }, 5000);
  }

  async selectAnimal(animal) {
    if (!animal) return;
    visitorState.set({ selectedAnimal: animal });

    const card = document.getElementById('gmap-place-card');
    if (card) {
      card.classList.remove('hidden');
      const nameEl = document.getElementById('card-animal-name');
      if (nameEl) nameEl.innerText = animal.name;
      const sciEl = document.getElementById('card-animal-sciname');
      if (sciEl) sciEl.innerText = animal.scientificName || '';
      const zoneEl = document.getElementById('card-animal-zone');
      if (zoneEl) zoneEl.innerText = animal.zone;
      const geoEl = document.getElementById('card-animal-geofence');
      if (geoEl) geoEl.innerText = `Bán kính: ${animal.radius || 25} mét`;
      const narEl = document.getElementById('card-animal-narrative');
      if (narEl) {
        const { currentLanguage } = visitorState.get();
        let text = animal.narrative;
        if (currentLanguage !== 'vi' && animal.multilingual?.[currentLanguage]) {
          text = animal.multilingual[currentLanguage];
        }
        narEl.innerText = text || '';
      }
      const img = document.getElementById('card-animal-img');
      if (img) img.src = animal.image;
    }

    this.updateMobileMockup(animal);

    if (animal.coords) {
      visitorMap.flyTo(animal.coords, 18);
    }
  }

  async playAnimal(animal, source = 'QR') {
    if (!animal) return;
    const { currentLanguage } = visitorState.get();

    // Log scan event (PRD FR-06)
    VisitorApi.logScan(animal.id, source, currentLanguage);

    // Play narration
    await visitorAudio.playAnimal(animal, currentLanguage);

    // Show floating audio player bar
    const dock = document.getElementById('audio-player-dock');
    if (dock) dock.classList.remove('collapsed');
  }

  handleQrScanned(animalId) {
    const { animals } = visitorState.get();
    const animal = animals.find(a => Number(a.id) === Number(animalId));
    if (animal) {
      this.selectAnimal(animal);
      this.playAnimal(animal, 'QR');
    } else {
      alert(`Không tìm thấy động vật có mã ID: ${animalId}`);
    }
  }

  updateAudioPlayerUI({ isPlaying, animal }) {
    const btnPlay = document.getElementById('player-play-btn');
    const titleEl = document.getElementById('player-title');
    const subEl = document.getElementById('player-subtitle');
    const imgEl = document.getElementById('player-thumb');
    const waveEl = document.getElementById('player-wave');
    const cardBtnListen = document.getElementById('card-btn-listen-text');
    const cardListenIcon = document.getElementById('card-listen-icon');

    if (btnPlay) {
      btnPlay.innerHTML = isPlaying
        ? '<i class="fa-solid fa-pause text-slate-950 text-sm"></i>'
        : '<i class="fa-solid fa-play text-slate-950 text-sm ml-0.5"></i>';
    }

    if (waveEl) {
      waveEl.classList.toggle('hidden', !isPlaying);
      waveEl.classList.toggle('flex', isPlaying);
    }

    if (animal) {
      if (titleEl) titleEl.innerText = animal.name;
      if (subEl) subEl.innerText = animal.scientificName || animal.zone;
      if (imgEl) imgEl.src = animal.image;
    }

    if (cardBtnListen) {
      cardBtnListen.innerText = isPlaying ? "Đang phát..." : "Nghe Thuyết Minh";
    }
    if (cardListenIcon) {
      cardListenIcon.className = isPlaying ? "fa-solid fa-volume-high animate-pulse" : "fa-solid fa-play";
    }
  }

  updateMobileMockup(animal) {
    if (!animal) return;
    const nameEl = document.getElementById('mobile-mockup-name');
    if (nameEl) nameEl.innerText = animal.name;
    const sciEl = document.getElementById('mobile-mockup-sciname');
    if (sciEl) sciEl.innerText = animal.scientificName || '';
    const imgContainer = document.querySelector('#section-mobile .relative.rounded-2xl.overflow-hidden.h-40');
    if (imgContainer) {
      imgContainer.innerHTML = `
        <img src="${animal.image}" class="w-full h-full object-cover" alt="${animal.name}" onerror="this.src='https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600'" />
        <div class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-black text-emerald-400 border border-emerald-500/30">
          ${animal.zone}
        </div>
      `;
    }
  }

  renderAnimalsGrid(animals) {
    const grid = document.getElementById('animals-grid');
    if (!grid) return;
    const { currentLanguage } = visitorState.get();
    const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.vi;

    const badge = document.getElementById('grid-heading-badge');
    if (badge) badge.innerText = animals && animals.length ? `${animals.length} loài thú` : t.gridBadge;

    if (!animals || animals.length === 0) {
      grid.innerHTML = `<div class="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs font-bold text-slate-500">${t.noAnimalData}</div>`;
      return;
    }

    grid.innerHTML = animals.map((a) => `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group">
        <div class="relative h-44 overflow-hidden bg-slate-100 cursor-pointer btn-card-open" data-animal-id="${a.id}">
          <img src="${a.image}" alt="${a.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600'" />
          <div class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black border border-white/20">
            ${a.zone}
          </div>
          <div class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black shadow-sm flex items-center space-x-1">
            <span>📍 Geofence ${a.radius || 25}m</span>
          </div>
        </div>
        <div class="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-base">${a.icon || '🐾'}</span>
              <h3 class="font-black text-slate-900 text-sm tracking-tight">${a.name}</h3>
            </div>
            <p class="text-[11px] text-slate-400 italic">${a.scientificName || ''}</p>
            <p class="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">${a.narrative || ''}</p>
          </div>
          <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button type="button" data-animal-id="${a.id}" class="btn-card-listen py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer">
              <i class="fa-solid fa-volume-high text-[11px]"></i>
              <span>${t.btnListen}</span>
            </button>
            <button type="button" data-animal-id="${a.id}" class="btn-card-open py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1 transition cursor-pointer">
              <i class="fa-solid fa-map-pin text-[11px] text-emerald-600"></i>
              <span>Xem Map</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click events
    grid.querySelectorAll('.btn-card-open').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-animal-id'));
        const target = animals.find(a => a.id === id);
        if (target) this.selectAnimal(target);
      });
    });

    grid.querySelectorAll('.btn-card-listen').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-animal-id'));
        const target = animals.find(a => a.id === id);
        if (target) {
          this.selectAnimal(target);
          this.playAnimal(target, 'QR');
        }
      });
    });
  }

  updateLanguageUI(lang) {
    visitorState.set({ currentLanguage: lang });
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.vi;

    // Update Text labels
    const langCardTag = document.getElementById('card-lang-tag');
    if (langCardTag) langCardTag.innerText = t.langCardTag;

    const navMap = document.getElementById('nav-text-map');
    if (navMap) navMap.innerText = t.navMap;
    const navMobile = document.getElementById('nav-text-mobile');
    if (navMobile) navMobile.innerText = t.navMobile;
    const navAdmin = document.getElementById('nav-text-admin');
    if (navAdmin) navAdmin.innerText = t.navAdmin;

    visitorMap.updateLanguage(lang);
    const { animals, selectedAnimal } = visitorState.get();
    this.renderAnimalsGrid(animals);

    if (selectedAnimal) {
      this.selectAnimal(selectedAnimal);
    }
  }

  bindDomEvents() {
    // Language Dropdown / Selector
    document.querySelectorAll('.lang-selector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (lang) this.updateLanguageUI(lang);
      });
    });

    // Map Tile Switcher (Roadmap vs Satellite)
    const btnRoad = document.getElementById('btn-map-roadmap');
    const btnSat = document.getElementById('btn-map-satellite');
    if (btnRoad && btnSat) {
      btnRoad.addEventListener('click', () => {
        visitorMap.setMapType('roadmap');
        btnRoad.className = "px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition bg-emerald-600 text-white shadow-sm cursor-pointer";
        btnSat.className = "px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition text-slate-700 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer";
      });

      btnSat.addEventListener('click', () => {
        visitorMap.setMapType('satellite');
        btnSat.className = "px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition bg-emerald-600 text-white shadow-sm cursor-pointer";
        btnRoad.className = "px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition text-slate-700 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer";
      });
    }

    // QR Scan Modal Buttons
    const btnOpenQr = document.getElementById('btn-open-qr-scanner');
    if (btnOpenQr) {
      btnOpenQr.addEventListener('click', () => {
        const { animals } = visitorState.get();
        visitorQrScanner.openModal(animals);
      });
    }

    const btnCloseQr = document.getElementById('btn-close-qr-modal');
    if (btnCloseQr) {
      btnCloseQr.addEventListener('click', () => visitorQrScanner.closeModal());
    }

    // Audio Player Controls
    const btnPlay = document.getElementById('player-play-btn');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => visitorAudio.togglePlayPause());
    }

    const btnSeekFwd = document.getElementById('player-seek-fwd');
    if (btnSeekFwd) {
      btnSeekFwd.addEventListener('click', () => visitorAudio.seekRelative(10));
    }

    const btnSeekBack = document.getElementById('player-seek-back');
    if (btnSeekBack) {
      btnSeekBack.addEventListener('click', () => visitorAudio.seekRelative(-10));
    }

    const btnSpeed = document.getElementById('player-speed-btn');
    if (btnSpeed) {
      btnSpeed.addEventListener('click', () => visitorAudio.cycleSpeed());
    }

    const slider = document.getElementById('player-seek-slider');
    if (slider) {
      slider.addEventListener('input', (e) => visitorAudio.seek(Number(e.target.value)));
    }

    const btnClosePlayer = document.getElementById('player-close-btn');
    if (btnClosePlayer) {
      btnClosePlayer.addEventListener('click', () => {
        visitorAudio.stop();
        const dock = document.getElementById('audio-player-dock');
        if (dock) dock.classList.add('collapsed');
      });
    }

    // Place card listen button
    const cardBtnListen = document.getElementById('card-btn-listen');
    if (cardBtnListen) {
      cardBtnListen.addEventListener('click', () => {
        const { selectedAnimal } = visitorState.get();
        if (selectedAnimal) {
          if (visitorAudio.isPlaying && visitorAudio.currentAnimal?.id === selectedAnimal.id) {
            visitorAudio.stop();
          } else {
            this.playAnimal(selectedAnimal, 'QR');
          }
        }
      });
    }

    const cardBtnClose = document.getElementById('card-btn-close');
    if (cardBtnClose) {
      cardBtnClose.addEventListener('click', () => {
        const card = document.getElementById('gmap-place-card');
        if (card) card.classList.add('hidden');
      });
    }

    // Jump to Gates
    const pillGate1 = document.getElementById('pill-gate-1');
    if (pillGate1) {
      pillGate1.addEventListener('click', () => {
        visitorMap.flyTo(CONFIG.GATES[0].coords, 18);
        visitorMap.updateTouristPosition(CONFIG.GATES[0].coords[0], CONFIG.GATES[0].coords[1]);
        const { animals } = visitorState.get();
        visitorGeofence.checkGeofence(CONFIG.GATES[0].coords[0], CONFIG.GATES[0].coords[1], animals, (a, d) => {
          this.showGeofenceToast(a, d);
          this.selectAnimal(a);
        });
      });
    }

    const pillGate2 = document.getElementById('pill-gate-2');
    if (pillGate2) {
      pillGate2.addEventListener('click', () => {
        visitorMap.flyTo(CONFIG.GATES[1].coords, 18);
        visitorMap.updateTouristPosition(CONFIG.GATES[1].coords[0], CONFIG.GATES[1].coords[1]);
        const { animals } = visitorState.get();
        visitorGeofence.checkGeofence(CONFIG.GATES[1].coords[0], CONFIG.GATES[1].coords[1], animals, (a, d) => {
          this.showGeofenceToast(a, d);
          this.selectAnimal(a);
        });
      });
    }

    // Search filter
    const searchInp = document.getElementById('gmap-search-input');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const { animals } = visitorState.get();
        if (!q) {
          this.renderAnimalsGrid(animals);
        } else {
          const filtered = animals.filter(a =>
            a.name.toLowerCase().includes(q) ||
            (a.scientificName || '').toLowerCase().includes(q) ||
            (a.zone || '').toLowerCase().includes(q)
          );
          this.renderAnimalsGrid(filtered);
        }
      });
    }
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const app = new VisitorApp();
  app.init();
});
