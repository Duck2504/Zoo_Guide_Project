/**
 * home.js - Thảo Cầm Viên Sài Gòn
 * Controller độc lập cho Trang Chủ (Home Portal - index.html)
 * Quản lý danh mục động vật, thống kê, đồng bộ CSDL Backend API, và chuyển hướng sang Bản đồ / Mã QR.
 */

let currentLanguage = localStorage.getItem('zoo_guide_lang') || 'vi';

function getZooAnimals() {
  const source = (typeof localStorage !== 'undefined') ? localStorage.getItem('zoo_data_source') : null;
  const saved = (typeof localStorage !== 'undefined') ? (localStorage.getItem('ZOO_ANIMALS_DATA_V2') || localStorage.getItem('zoo_animals_data')) : null;
  if (saved && source === 'backend') {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {}
  }
  return [];
}

let zooAnimals = getZooAnimals();

/**
 * Render Animals Grid trên Trang Chủ
 */
function renderHomeAnimalsGrid() {
  const count = (zooAnimals && zooAnimals.length) ? zooAnimals.length : 0;
  const countEl = document.getElementById('home-animal-count');
  if (countEl) countEl.textContent = count;
  const badgeEl = document.getElementById('home-animal-count-badge');
  if (badgeEl) badgeEl.textContent = `${count} loài thú`;
  const zoneEl = document.getElementById('home-zone-count');
  if (zoneEl) zoneEl.textContent = 8;
  const container = document.getElementById('home-animals-grid');
  if (!container) return;

  const t = (typeof UI_TRANSLATIONS !== 'undefined' && UI_TRANSLATIONS[currentLanguage]) ? UI_TRANSLATIONS[currentLanguage] : (UI_TRANSLATIONS?.vi || {});

  if (count === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zoo-50 text-zoo-600 flex items-center justify-center text-2xl shadow-inner">
          <i class="fa-solid fa-database"></i>
        </div>
        <h4 class="text-base font-bold text-slate-800 mb-1">Chưa có dữ liệu động vật</h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto">Danh sách động vật sẽ tự động hiển thị khi kết nối cơ sở dữ liệu (Database) hoặc khi được thêm từ hệ thống.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = zooAnimals.map((a, index) => {
    const locName = (typeof getAnimalLocalizedName === 'function') ? getAnimalLocalizedName(a, currentLanguage) : (a.name || '');
    const locZone = (typeof getAnimalLocalizedZone === 'function') ? getAnimalLocalizedZone(a, currentLanguage) : (a.zone || '');
    const narrative = (typeof getAnimalLocalizedNarrative === 'function') ? getAnimalLocalizedNarrative(a, currentLanguage) : (a.descriptionVi || '');
    const iconChar = (typeof getAnimalIcon === 'function') ? getAnimalIcon(a.name, index) : '🐾';

    return `
      <div class="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-zoo-500/50 transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div class="relative overflow-hidden rounded-2xl mb-4 h-48 bg-slate-100">
            <img src="${a.imageUrl}" alt="${locName}"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 onerror="this.src='https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600'" />
            <span class="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span>${iconChar}</span>
              <span class="truncate max-w-[130px]">${locZone}</span>
            </span>
            <span class="absolute bottom-3 right-3 px-2.5 py-1 bg-zoo-600 text-white text-xs font-bold rounded-lg shadow-sm">
              <i class="fa-solid fa-broadcast-tower text-[10px] mr-1"></i>${a.radius_meters || 25}m
            </span>
          </div>

          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="font-extrabold text-slate-900 text-lg group-hover:text-zoo-600 transition-colors">${locName}</h3>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold ${
              (a.conservationStatus || '').includes('CR') ? 'bg-red-100 text-red-700' :
              (a.conservationStatus || '').includes('EN') ? 'bg-orange-100 text-orange-700' :
              'bg-emerald-100 text-emerald-700'
            }">${a.conservationStatus ? a.conservationStatus.split('-')[0].trim() : 'LC'}</span>
          </div>

          <p class="text-xs text-slate-400 italic mb-2">${a.scientificName || ''}</p>
          <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">${narrative}</p>
        </div>

        <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
          <a href="map.html?animalId=${a.id}&play=1"
             class="flex-1 py-2 px-3 rounded-xl bg-zoo-600 hover:bg-zoo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer text-center">
            <i class="fa-solid fa-headphones text-[11px]"></i>
            <span>${t.btnListen || 'Nghe Thuyết Minh'}</span>
          </a>
          <a href="map.html?animalId=${a.id}"
             class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
             title="${t.btnViewOnMap || 'Xem Trên Bản Đồ'}">
            <i class="fa-solid fa-location-dot text-zoo-600"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * QR Code Scanner Modal Simulator
 */
function openQrScannerModal() {
  const modal = document.getElementById('qr-scan-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeQrScannerModal() {
  const modal = document.getElementById('qr-scan-modal');
  if (modal) modal.classList.add('hidden');
}

function populateQrSampleButtons() {
  const container = document.getElementById('qr-sample-buttons');
  if (!container) return;

  if (!zooAnimals || zooAnimals.length === 0) {
    container.innerHTML = '<div class="col-span-2 text-center text-xs text-slate-500 py-3">Chưa có dữ liệu động vật từ CSDL</div>';
    return;
  }

  container.innerHTML = zooAnimals.map(a => {
    return `
      <a href="map.html?animalId=${a.id}&play=1"
         class="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-zoo-900/60 border border-slate-700/60 rounded-xl text-left transition group">
        <img src="${a.imageUrl}" class="w-8 h-8 rounded-lg object-cover" onerror="this.src='https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=100'" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-slate-200 group-hover:text-zoo-400 truncate">${a.name}</p>
          <p class="text-[10px] text-slate-400 truncate">${a.zone || ''}</p>
        </div>
      </a>
    `;
  }).join('');
}

/**
 * Switch Language
 */
function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('zoo_guide_lang', lang);
  renderHomeAnimalsGrid();
  populateQrSampleButtons();
}

/**
 * DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Bind Language Selector
  const langSelect = document.getElementById('header-lang-select');
  if (langSelect) {
    langSelect.value = currentLanguage;
    langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
  }

  // Initial Render
  renderHomeAnimalsGrid();
  populateQrSampleButtons();

  // Background Sync với Backend API :5222
  if (typeof fetchAnimalsFromBackend === 'function') {
    fetchAnimalsFromBackend().then(res => {
      if (res && res.data && res.data.length > 0) {
        zooAnimals = res.data;
        renderHomeAnimalsGrid();
        populateQrSampleButtons();
      }
    });
  }
});
