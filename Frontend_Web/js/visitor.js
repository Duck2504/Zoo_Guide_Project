/**
 * visitor.js - Thảo Cầm Viên Sài Gòn
 * Visitor Web Guide controller:
 * High-End Google Maps layout, Gate shortcuts, Map Switcher capsule,
 * Horizontal quick-drawer carousel, Audio Player HUD, and Illustrated Map overlay.
 */

let currentLanguage = localStorage.getItem('zoo_guide_lang') || 'vi';
let currentMapType = 'roadmap'; // 'roadmap' | 'satellite'
function getZooAnimals() {
  const saved = (typeof localStorage !== 'undefined') ? (localStorage.getItem('ZOO_ANIMALS_DATA_V3') || localStorage.getItem('zoo_animals_data')) : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return (typeof DEFAULT_ZOO_ANIMALS !== 'undefined') ? DEFAULT_ZOO_ANIMALS : [];
}

let zooAnimals = getZooAnimals();
let currentSelectedAnimal = null;

let map = null;
let googleMapLayer = null;
let markers = [];
let circles = [];
let touristMarker = null;
let gateMarkers = [];
let zooBoundaryLayer = null;
let navigationRouteLayer = null;

// Auto Tour state
let isAutoTourRunning = false;
let autoTourIndex = 0;
let autoTourTimeout = null;

/**
 * Tile layer URL generator for Google Maps
 */
function getGoogleMapTileUrl(mapType, lang) {
  const lyrs = (mapType === 'satellite') ? 'y' : 'm';
  return `https://{s}.google.com/vt/lyrs=${lyrs}&hl=${lang || 'vi'}&x={x}&y={y}&z={z}`;
}

/**
 * Switch Google Map layer between Digital Roadmap and Satellite
 */
function setGoogleMapType(type) {
  currentMapType = type;

  const btnRoad = document.getElementById('btn-capsule-roadmap');
  const btnSat = document.getElementById('btn-capsule-satellite');

  [btnRoad, btnSat].forEach(b => b?.classList.remove('active'));

  if (type === 'satellite') {
    btnSat?.classList.add('active');
  } else {
    btnRoad?.classList.add('active');
  }

  if (map) {
    if (googleMapLayer) map.removeLayer(googleMapLayer);
    googleMapLayer = L.tileLayer(getGoogleMapTileUrl(currentMapType, currentLanguage), {
      maxZoom: 21,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps — Thảo Cầm Viên Sài Gòn'
    }).addTo(map);
  }
}



function selectLandmark(id) {
  const lm = ZOO_LANDMARKS.find(x => x.id === id);
  if (lm) {
    showGeofenceToast({ name: lm.name, id: lm.id, descriptionVi: lm.desc }, 0);
    zooAudio.playNarration(lm.desc, null, currentLanguage);
  }
}

/**
 * Draw Official Zoo Boundary Polygon on Leaflet Map
 */
function renderZooBoundaryPolygon() {
  if (!map) return;
  if (zooBoundaryLayer) map.removeLayer(zooBoundaryLayer);

  zooBoundaryLayer = L.polygon(ZOO_BOUNDARY_POLYGON, {
    color: '#059669',
    weight: 3,
    dashArray: null,
    fillColor: '#10b981',
    fillOpacity: 0.10
  }).addTo(map);

  zooBoundaryLayer.bindTooltip("Khuôn viên chính thức Thảo Cầm Viên Sài Gòn (WGS-84)", {
    sticky: true,
    className: 'text-xs font-bold'
  });
}

/**
 * Render Zoo Entrance Gates on Map
 */
function renderGateMarkers() {
  if (!map) return;
  gateMarkers.forEach(m => map.removeLayer(m));
  gateMarkers = [];

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.vi;
  ZOO_GATES.forEach(gate => {
    const gateLabel = gate.key === 'gate1' ? t.gate1Name : t.gate2Name;
    const gateIcon = L.divIcon({
      className: 'custom-gate-pin',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer" onclick="jumpToGate(${gate.lat}, ${gate.lng}, '${gate.key}')">
          <div class="px-2.5 py-1 bg-slate-900/95 text-white rounded-lg text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-1.5 whitespace-nowrap">
            <span class="w-1.5 h-3 bg-amber-500 rounded-xs"></span>
            <span>${gateLabel}</span>
          </div>
          <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-lg border-2 border-white -mt-1">
            <i class="fa-solid fa-location-dot"></i>
          </div>
        </div>
      `,
      iconSize: [160, 42],
      iconAnchor: [80, 40]
    });

    const m = L.marker([gate.lat, gate.lng], { icon: gateIcon })
      .bindPopup(`
        <div class="p-2 text-center">
          <div class="font-bold text-amber-700 mb-1">${gate.name}</div>
          <div class="text-xs text-slate-600 mb-2">${gate.desc}</div>
          <button onclick="drawWalkingRouteToSelected([${gate.lat}, ${gate.lng}])"
                  class="px-3 py-1 bg-zoo-600 text-white text-xs font-semibold rounded-lg hover:bg-zoo-700 w-full transition">
            <i class="fa-solid fa-route mr-1"></i> Bắt đầu đi bộ từ cổng này
          </button>
        </div>
      `)
      .addTo(map);

    gateMarkers.push(m);
  });
}

/**
 * Render Animal Pins and Geofence Circles on Leaflet Map
 */
function renderMapAnimals(animals) {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  circles.forEach(c => map.removeLayer(c));
  markers = [];
  circles = [];

  if (!animals || animals.length === 0) {
    closePlaceCard();
    return;
  }

  animals.forEach((animal, index) => {
    if (!animal.coordinates) return;

    const lat = animal.coordinates.lat;
    const lon = animal.coordinates.lon;
    const radius = animal.radius_meters || 25;
    const localizedName = getAnimalLocalizedName(animal, currentLanguage);
    const localizedZone = getAnimalLocalizedZone(animal, currentLanguage);
    const iconChar = getAnimalIcon(animal.name, index);

    // Geofence radius circle
    const circle = L.circle([lat, lon], {
      radius: radius,
      color: animal.color || '#059669',
      weight: 1.5,
      opacity: 0.8,
      fillColor: animal.color || '#059669',
      fillOpacity: 0.12,
      dashArray: '4, 6'
    }).addTo(map);
    circles.push(circle);

    // Custom marker pin
    const pinHtml = `
      <div class="gmap-pin relative flex flex-col items-center group cursor-pointer" onclick="selectAnimalById('${animal.id}')">
        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold shadow-xl border-2 border-white"
             style="background: ${animal.color || '#059669'};">
          <span class="text-base">${iconChar}</span>
          <span class="max-w-[120px] truncate">${localizedName}</span>
        </div>
        <div class="w-2.5 h-2.5 rotate-45 -mt-1 border-r border-b border-white"
             style="background: ${animal.color || '#059669'};"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-animal-marker',
      html: pinHtml,
      iconSize: [150, 36],
      iconAnchor: [75, 34]
    });

    const marker = L.marker([lat, lon], { icon: customIcon })
      .bindPopup(`
        <div class="p-2 text-center">
          <img src="${animal.imageUrl}" class="w-full h-24 object-cover rounded-lg mb-2 shadow-sm" alt="${localizedName}" />
          <div class="font-bold text-slate-900 text-sm">${localizedName}</div>
          <div class="text-xs text-slate-500 italic mb-1">${animal.scientificName || ''}</div>
          <div class="text-xs text-zoo-700 font-medium mb-2">${localizedZone}</div>
          <button onclick="selectAnimalById('${animal.id}'); playCurrentSelectedAnimalNarration();" class="px-3 py-1 bg-zoo-600 text-white text-xs font-semibold rounded-lg hover:bg-zoo-700 w-full transition">
            <i class="fa-solid fa-headphones mr-1"></i> Nghe Thuyết Minh
          </button>
        </div>
      `)
      .addTo(map);

    markers.push(marker);
  });
}

/**
 * Render Bottom Horizontal Quick-Drawer (Cards Carousel)
 */
function renderAnimalsGrid(animals) {
  const container = document.getElementById('map-carousel-container');
  if (!container) return;

  if (!animals || animals.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  container.classList.remove('hidden');

  container.innerHTML = animals.map((a, index) => {
    const locName = getAnimalLocalizedName(a, currentLanguage);
    const locZone = getAnimalLocalizedZone(a, currentLanguage);
    const iconChar = getAnimalIcon(a.name, index);
    const isSelected = currentSelectedAnimal && currentSelectedAnimal.id === a.id;

    return `
      <div onclick="selectAnimalById('${a.id}')"
           class="carousel-animal-card ${isSelected ? 'selected' : ''}">
        <img src="${a.imageUrl}" class="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0" alt="${locName}"
             onerror="this.src='https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=200'" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1">
            <span>${iconChar}</span>
            <h4 class="font-bold text-slate-800 text-xs truncate">${locName}</h4>
          </div>
          <div class="text-[10px] text-slate-400 truncate">${locZone}</div>
          <div class="flex items-center justify-between text-[10px] mt-1">
            <span class="text-zoo-700 font-bold">Geofence: ${a.radius_meters || 25}m</span>
            <span class="text-slate-400"><i class="fa-solid fa-clock text-[9px]"></i> ${a.audioLength || '01:20'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Select animal by ID
 */
function selectAnimalById(id) {
  const animal = zooAnimals.find(a => a.id === id);
  if (animal) {
    selectAnimal(animal);
  }
}

/**
 * Handle animal selection, open place card, and center map
 */
function selectAnimal(animal, shouldFly = true) {
  if (!animal) return;
  currentSelectedAnimal = animal;

  if (map && animal.coordinates && shouldFly) {
    map.flyTo([animal.coordinates.lat, animal.coordinates.lon], 18, { duration: 1.2 });
    drawWalkingRouteToSelected();
  }

  // Update carousel selection highlight
  renderAnimalsGrid(zooAnimals);

  const card = document.getElementById('gmap-place-card');
  if (card) {
    card.classList.remove('hidden');

    const localizedName = getAnimalLocalizedName(animal, currentLanguage);
    const localizedZone = getAnimalLocalizedZone(animal, currentLanguage);
    const localizedNarrative = getAnimalLocalizedNarrative(animal, currentLanguage);
    const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.vi;

    document.getElementById('card-animal-img').src = animal.imageUrl || '';
    document.getElementById('card-animal-name').textContent = localizedName;
    document.getElementById('card-animal-sciname').textContent = animal.scientificName || '';
    document.getElementById('card-animal-zone').textContent = localizedZone;
    document.getElementById('card-animal-iucn').textContent = animal.conservationStatus || 'Bảo tồn Thảo Cầm Viên';
    document.getElementById('card-animal-geofence').textContent = `${animal.radius_meters || 25}m`;
    document.getElementById('card-animal-narrative').textContent = localizedNarrative;
    document.getElementById('card-lang-tag').textContent = t.langCardTag;

    // Reset audio button state
    updateAudioButtonUI('stopped');
  }
}

function closePlaceCard() {
  const card = document.getElementById('gmap-place-card');
  if (card) card.classList.add('hidden');
  zooAudio.stop();
  updateAudioButtonUI('stopped');
  if (navigationRouteLayer && map) {
    map.removeLayer(navigationRouteLayer);
    navigationRouteLayer = null;
  }
}

/**
 * Audio control action
 */
function playCurrentSelectedAnimalNarration() {
  if (!currentSelectedAnimal) return;

  if (zooAudio.state === 'playing') {
    zooAudio.pause();
    updateAudioButtonUI('paused');
    return;
  } else if (zooAudio.state === 'paused') {
    zooAudio.resume();
    updateAudioButtonUI('playing');
    return;
  }

  const narrative = getAnimalLocalizedNarrative(currentSelectedAnimal, currentLanguage);
  updateAudioButtonUI('playing');

  // Trigger Unified Audio Player
  zooAudio.playNarration(
    narrative,
    currentSelectedAnimal.audioUrl,
    currentLanguage,
    (state) => updateAudioButtonUI(state),
    (cur, dur, pct) => {
      const progressBar = document.getElementById('audio-progress-bar');
      const timeDisplay = document.getElementById('audio-time-display');
      if (progressBar) progressBar.value = pct;
      if (timeDisplay) {
        const formatTime = (s) => {
          const m = Math.floor(s / 60).toString().padStart(2, '0');
          const sec = Math.floor(s % 60).toString().padStart(2, '0');
          return `${m}:${sec}`;
        };
        timeDisplay.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
      }
    }
  );

  // Send scan log according to PRD US-07
  sendScanLog(currentSelectedAnimal.id, 'USER', currentLanguage);
}

function stopAnimalNarration() {
  zooAudio.stop();
  updateAudioButtonUI('stopped');
}

function updateAudioButtonUI(state) {
  const btn = document.getElementById('card-btn-listen');
  const icon = document.getElementById('card-listen-icon');
  const txtListen = document.getElementById('card-btn-listen-text');
  const txtStop = document.getElementById('card-btn-stop-text');

  if (!btn) return;
  if (state === 'playing') {
    btn.classList.add('bg-amber-600', 'hover:bg-amber-700');
    btn.classList.remove('bg-zoo-600', 'hover:bg-zoo-700');
    if (icon) icon.className = 'fa-solid fa-pause';
    if (txtListen) txtListen.classList.add('hidden');
    if (txtStop) txtStop.classList.remove('hidden');
  } else {
    btn.classList.remove('bg-amber-600', 'hover:bg-amber-700');
    btn.classList.add('bg-zoo-600', 'hover:bg-zoo-700');
    if (icon) icon.className = 'fa-solid fa-headphones';
    if (txtListen) txtListen.classList.remove('hidden');
    if (txtStop) txtStop.classList.add('hidden');
  }
}

/**
 * Draw Walking Navigation Line (Route Polyline)
 */
function drawWalkingRouteToSelected(fromCoords = null) {
  if (!map || !currentSelectedAnimal || !currentSelectedAnimal.coordinates) return;

  if (navigationRouteLayer) {
    map.removeLayer(navigationRouteLayer);
    navigationRouteLayer = null;
  }

  const startPt = fromCoords || (touristMarker ? [touristMarker.getLatLng().lat, touristMarker.getLatLng().lng] : [ZOO_GATES[0].lat, ZOO_GATES[0].lng]);
  const endPt = [currentSelectedAnimal.coordinates.lat, currentSelectedAnimal.coordinates.lon];

  navigationRouteLayer = L.polyline([startPt, endPt], {
    color: '#059669',
    weight: 4,
    dashArray: '8, 8',
    opacity: 0.9
  }).addTo(map);
}

/**
 * Gate Jump Shortcuts
 */
function jumpToGate(lat, lng, gateKey) {
  if (map) {
    map.flyTo([lat, lng], 18, { duration: 1.2 });
  }
}

/**
 * Zoom & Fullscreen Controls
 */
function zoomInMap() {
  if (map) map.zoomIn();
}

function zoomOutMap() {
  if (map) map.zoomOut();
}

function resetMapView() {
  if (map) {
    map.flyTo([10.7876, 106.7053], 17, { duration: 1.0 });
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/**
 * Locate Tourist GPS and check if inside Zoo boundary (Ray Casting)
 */
function locateTouristGMap() {
  zooGps.startTracking(
    zooAnimals,
    (pos) => {
      if (!map) return;
      const inside = isPointInsideZoo(pos.lat, pos.lng);

      if (!touristMarker) {
        const touristIcon = L.divIcon({
          className: 'tourist-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-8 h-8 rounded-full bg-blue-500/30 pulse-radar absolute"></div>
              <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg relative z-10"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        touristMarker = L.marker([pos.lat, pos.lng], { icon: touristIcon }).addTo(map);
        map.flyTo([pos.lat, pos.lng], 18, { duration: 1.0 });

        if (inside) {
          showGeofenceToast({ name: "Chào mừng quý khách đến Thảo Cầm Viên Sài Gòn!" }, 0);
        } else {
          showGeofenceToast({ name: "Bạn đang ở ngoài vườn thú (Chế độ tham quan từ xa)" }, 0);
        }
      } else {
        touristMarker.setLatLng([pos.lat, pos.lng]);
      }
    },
    (animal, dist) => {
      // Geofence auto-trigger (PRD US-05)
      showGeofenceToast(animal, dist);
    }
  );
}

function showGeofenceToast(animal, dist) {
  const existing = document.getElementById('live-geofence-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'live-geofence-toast';
  toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-zoo-500 flex items-center gap-3 slide-down-toast max-w-[92vw]';
  toast.innerHTML = `
    <div class="w-9 h-9 rounded-xl bg-zoo-600/30 flex items-center justify-center text-lg text-zoo-400 shrink-0">
      ${getAnimalIcon(animal.name || '')}
    </div>
    <div class="min-w-0">
      <div class="text-[10px] text-zoo-400 font-bold uppercase tracking-wider">Tự động phát hiện (GPS)</div>
      <div class="font-bold text-xs truncate">${animal.name} ${dist > 0 ? `(${dist}m)` : ''}</div>
    </div>
    <button onclick="selectAnimalById('${animal.id}'); playCurrentSelectedAnimalNarration(); this.parentElement.remove();"
            class="px-2.5 py-1 bg-zoo-600 hover:bg-zoo-700 text-white text-xs font-bold rounded-lg transition shrink-0">
      Nghe
    </button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 7000);
}

/**
 * Filter animals search
 */
function filterAnimalsSearch(query) {
  const q = (query || '').toLowerCase().trim();
  const clearBtn = document.getElementById('gmap-search-clear');
  if (clearBtn) {
    if (q) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  const filtered = zooAnimals.filter(a => {
    const locName = getAnimalLocalizedName(a, currentLanguage).toLowerCase();
    const sciName = (a.scientificName || '').toLowerCase();
    const zoneName = getAnimalLocalizedZone(a, currentLanguage).toLowerCase();
    return locName.includes(q) || sciName.includes(q) || zoneName.includes(q);
  });

  renderMapAnimals(filtered);
  renderAnimalsGrid(filtered);
}

function clearSearch() {
  const input = document.getElementById('gmap-search-input');
  if (input) input.value = '';
  filterAnimalsSearch('');
}

/**
 * Change Language Switcher
 */
function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('zoo_guide_lang', lang);

  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.vi;

  const elMap = document.getElementById('nav-text-map');
  const elSearch = document.getElementById('gmap-search-input');
  const elDigital = document.getElementById('text-map-digital');
  const elSat = document.getElementById('text-map-satellite');

  if (elMap) elMap.textContent = t.navMap;
  if (elSearch) elSearch.placeholder = t.searchPlaceholder;
  if (elDigital) elDigital.textContent = t.mapDigital;
  if (elSat) elSat.textContent = t.mapSatellite;

  setGoogleMapType(currentMapType);
  renderGateMarkers();
  renderMapAnimals(zooAnimals);
  renderAnimalsGrid(zooAnimals);

  if (currentSelectedAnimal) {
    selectAnimal(currentSelectedAnimal);
  }
}

/**
 * QR Code Scanner Simulator Modal (PRD US-01)
 */
function openQrScannerModal() {
  const modal = document.getElementById('qr-scan-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const container = document.getElementById('qr-sample-buttons');
  if (container) {
    container.innerHTML = zooAnimals.map(a => `
      <button onclick="simulateQrScan('${a.id}')"
              class="px-3 py-2 bg-slate-800 hover:bg-zoo-600 rounded-xl text-xs font-semibold text-white transition flex items-center gap-2 border border-slate-700">
        <span>${getAnimalIcon(a.name)}</span>
        <span class="truncate">${getAnimalLocalizedName(a, currentLanguage)}</span>
      </button>
    `).join('');
  }
}

function simulateQrScan(id) {
  closeQrScannerModal();
  selectAnimalById(id);
  setTimeout(() => {
    playCurrentSelectedAnimalNarration();
    sendScanLog(id, 'QR', currentLanguage);
  }, 400);
}

function closeQrScannerModal() {
  const modal = document.getElementById('qr-scan-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * DOM Initialization
 */
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Leaflet Map
  map = L.map("google-maps-view", {
    zoomControl: false,
    minZoom: 15,
    maxZoom: 21
  }).setView([10.7880, 106.7062], 17);

  // 2. Set default Google Maps tile layer
  setGoogleMapType("roadmap");

  // 3. Render Boundary Polygon, Gates & Animals
  renderZooBoundaryPolygon();
  renderGateMarkers();
  renderMapAnimals(zooAnimals);
  renderAnimalsGrid(zooAnimals);
  renderHomeAnimalsGrid();

  // 4. Background sync with backend (khi có database thì tự động hiển thị)
  fetchAnimalsFromBackend().then(res => {
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      zooAnimals = res.data;
      renderMapAnimals(zooAnimals);
      renderAnimalsGrid(zooAnimals);
      renderHomeAnimalsGrid();
      if (!currentSelectedAnimal) {
        selectAnimal(zooAnimals[0], false);
      }
    }
  });

  // 5. Handle QR Code direct link in URL: ?animalId=... (PRD US-01)
  const urlParams = new URLSearchParams(window.location.search);
  const paramAnimalId = urlParams.get('animalId');
  if (paramAnimalId) {
    // Nếu quét mã QR con thú cụ thể, chuyển sang Bản đồ và phát thuyết minh
    switchMainTab('map');
    setTimeout(() => {
      selectAnimalById(paramAnimalId);
      playCurrentSelectedAnimalNarration();
      sendScanLog(paramAnimalId, 'QR', currentLanguage);
    }, 600);
  } else {
    // Mặc định hiển thị Trang Chủ đầu tiên khi bấm vào web (theo yêu cầu người dùng)
    switchMainTab('home');
    if (zooAnimals.length > 0) {
      selectAnimal(zooAnimals[0], false);
    }
  }

  // 6. Bind language selector dropdown
  const langSelect = document.getElementById('header-lang-select');
  if (langSelect) {
    langSelect.value = currentLanguage;
    langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
  }
});


/**
 * Switch Main Navigation Tab: 'map' (Bản đồ sở thú) vs 'home' (Trang Chủ)
 */
function switchMainTab(tab) {
  const viewMap = document.getElementById('view-tab-map');
  const viewHome = document.getElementById('view-tab-home');
  const btnMap = document.getElementById('nav-btn-map');
  const btnHome = document.getElementById('nav-btn-home');

  if (tab === 'map') {
    viewMap?.classList.remove('hidden');
    viewHome?.classList.add('hidden');
    btnMap?.classList.add('text-zoo-700', 'bg-zoo-50', 'shadow-xs');
    btnMap?.classList.remove('text-slate-600');
    btnHome?.classList.remove('text-zoo-700', 'bg-zoo-50', 'shadow-xs');
    btnHome?.classList.add('text-slate-600');

    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  } else {
    viewMap?.classList.add('hidden');
    viewHome?.classList.remove('hidden');
    btnHome?.classList.add('text-zoo-700', 'bg-zoo-50', 'shadow-xs');
    btnHome?.classList.remove('text-slate-600');
    btnMap?.classList.remove('text-zoo-700', 'bg-zoo-50', 'shadow-xs');
    btnMap?.classList.add('text-slate-600');

    renderHomeAnimalsGrid();
  }
}

/**
 * Render Animals Grid in the 'Trang Chủ' view
 */
function renderHomeAnimalsGrid() {
  const countEl = document.getElementById('home-animal-count');
  if (countEl) countEl.textContent = (zooAnimals && zooAnimals.length) ? zooAnimals.length : 0;
  const badgeEl = document.getElementById('home-animal-count-badge');
  if (badgeEl) badgeEl.textContent = (zooAnimals && zooAnimals.length) ? `${zooAnimals.length} loài thú` : '0 loài thú';
  const zoneEl = document.getElementById('home-zone-count');
  if (zoneEl) zoneEl.textContent = 4;
  const container = document.getElementById('home-animals-grid');
  if (!container) return;

  if (!zooAnimals || zooAnimals.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
        <div class="w-14 h-14 rounded-2xl bg-zoo-50 text-zoo-600 flex items-center justify-center mx-auto text-2xl mb-3 shadow-xs">
          <i class="fa-solid fa-paw"></i>
        </div>
                <h4 class="text-base font-extrabold text-slate-900">Dữ liệu động vật đang được chuẩn bị</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Hệ thống thuyết minh tự động đang được cập nhật. Du khách vui lòng khám phá khuôn viên trên bản đồ hoặc quét mã QR trực tiếp tại chuồng thú.
        </p>
        <div class="pt-4 flex justify-center gap-3">
          <button type="button" onclick="switchMainTab('map')" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zoo-600 hover:bg-zoo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
            <i class="fa-solid fa-map-location-dot text-xs"></i><span>Khám Phá Bản Đồ Sở Thú</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.vi;

  container.innerHTML = zooAnimals.map((a, index) => {
    const locName = getAnimalLocalizedName(a, currentLanguage);
    const locZone = getAnimalLocalizedZone(a, currentLanguage);
    const narrative = getAnimalLocalizedNarrative(a, currentLanguage);
    const iconChar = getAnimalIcon(a.name, index);

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
          <button onclick="switchMainTab('map'); selectAnimalById('${a.id}'); playCurrentSelectedAnimalNarration();"
                  class="flex-1 py-2 px-3 rounded-xl bg-zoo-600 hover:bg-zoo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer">
            <i class="fa-solid fa-headphones text-[11px]"></i>
            <span>${t.btnListen}</span>
          </button>
          <button onclick="switchMainTab('map'); selectAnimalById('${a.id}');"
                  class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  title="${t.btnViewOnMap}">
            <i class="fa-solid fa-location-dot text-zoo-600"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}


/**
 * Global database loader hook:
 * Khi người dùng nạp cơ sở dữ liệu (từ API, SQL, JSON hoặc Admin), hàm này sẽ tự động hiển thị các con thú lên bản đồ và toàn bộ hệ thống
 */
window.loadZooDatabase = function(animals) {
  if (!Array.isArray(animals)) {
    console.error('[Zoo Database] Dữ liệu truyền vào phải là một mảng danh sách loài thú.');
    return;
  }
  zooAnimals = animals;
  try {
    localStorage.setItem('ZOO_ANIMALS_DATA_V3', JSON.stringify(animals));
    localStorage.setItem('zoo_animals_data', JSON.stringify(animals));
  } catch (_) {}
  
  renderMapAnimals(zooAnimals);
  renderAnimalsGrid(zooAnimals);
  renderHomeAnimalsGrid();
  if (typeof renderGateMarkers === 'function') renderGateMarkers();
  
  if (zooAnimals.length > 0 && !currentSelectedAnimal) {
    selectAnimal(zooAnimals[0], false);
  }
  console.log(`[Zoo Database] Đã kết nối cơ sở dữ liệu thành công! Hiển thị ${animals.length} loài thú lên Bản Đồ & Thuyết Minh.`);
  window.dispatchEvent(new CustomEvent('zooDataUpdated', { detail: animals }));
};
window.setZooAnimals = window.loadZooDatabase;

// Lắng nghe cập nhật tự động khi database thêm dữ liệu mới
window.addEventListener('zooDataUpdated', (e) => {
  if (Array.isArray(e.detail)) {
    zooAnimals = e.detail;
    renderMapAnimals(zooAnimals);
    renderAnimalsGrid(zooAnimals);
    renderHomeAnimalsGrid();
    if (zooAnimals.length > 0 && !currentSelectedAnimal) {
      selectAnimal(zooAnimals[0], false);
    }
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === 'ZOO_ANIMALS_DATA_V3' || e.key === 'zoo_animals_data') {
    zooAnimals = getZooAnimals();
    renderMapAnimals(zooAnimals);
    renderAnimalsGrid(zooAnimals);
    renderHomeAnimalsGrid();
  }
});
