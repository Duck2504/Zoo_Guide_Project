/**
 * map.js - Thảo Cầm Viên Sài Gòn
 * Controller độc lập cho Bản Đồ Sở Thú (Zoo Map View - map.html)
 * Quản lý Leaflet Real-world Map, Google Maps Roadmap/Satellite, Geofencing, Audio Player HUD, và Carousel.
 */

let currentLanguage = localStorage.getItem('zoo_guide_lang') || 'vi';
let currentMapType = 'roadmap'; // 'roadmap' | 'satellite'

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
let currentSelectedAnimal = null;

let map = null;
let googleMapLayer = null;
let markers = [];
let circles = [];
let touristMarker = null;
let gateMarkers = [];
let zooBoundaryLayer = null;
let navigationRouteLayer = null;

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

/**
 * Draw Official Zoo Boundary Polygon on Leaflet Map
 */
function renderZooBoundaryPolygon() {
  if (!map || typeof ZOO_BOUNDARY_POLYGON === 'undefined') return;
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
 * Render Entrance Gates on Leaflet Map
 */
function renderGateMarkers() {
  if (!map || typeof ZOO_GATES === 'undefined') return;
  gateMarkers.forEach(m => map.removeLayer(m));
  gateMarkers = [];

  ZOO_GATES.forEach(gate => {
    const gateIcon = L.divIcon({
      className: 'gate-custom-icon',
      html: `
        <div class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black rounded-lg shadow-lg border border-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition">
          <i class="fa-solid fa-door-open"></i>
          <span>${gate.name}</span>
        </div>
      `,
      iconSize: [0, 0]
    });

    const m = L.marker([gate.lat, gate.lng], { icon: gateIcon }).addTo(map);
    m.bindPopup(`
      <div class="p-2 space-y-1 text-slate-800">
        <h4 class="font-extrabold text-sm text-amber-700">${gate.name}</h4>
        <p class="text-xs text-slate-600">${gate.desc}</p>
        <span class="inline-block mt-1 text-[10px] font-mono text-slate-400">Tọa độ: ${gate.lat}, ${gate.lng}</span>
      </div>
    `);
    gateMarkers.push(m);
  });
}

/**
 * Jump to specific entrance gate
 */
function jumpToGate(lat, lng, gateKey) {
  if (!map) return;
  map.flyTo([lat, lng], 18, { duration: 1.2 });
  const gate = ZOO_GATES.find(g => g.key === gateKey);
  if (gate) {
    const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.vi;
    const gateName = (gateKey === 'gate1') ? t.gate1Name : t.gate2Name;
    zooAudio.speakText(`${gateName}. ${t.gateDesc}`, currentLanguage);
  }
}

/**
 * Render Animals & Geofence Circles on Leaflet Map
 */
function renderMapAnimals(animals) {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  circles.forEach(c => map.removeLayer(c));
  markers = [];
  circles = [];

  animals.forEach((animal, index) => {
    if (!animal.coordinates) return;

    const lat = animal.coordinates.lat;
    const lon = animal.coordinates.lon;
    const radius = animal.radius_meters || 25;
    const localizedName = (typeof getAnimalLocalizedName === 'function') ? getAnimalLocalizedName(animal, currentLanguage) : (animal.name || '');
    const localizedZone = (typeof getAnimalLocalizedZone === 'function') ? getAnimalLocalizedZone(animal, currentLanguage) : (animal.zone || '');
    const iconChar = (typeof getAnimalIcon === 'function') ? getAnimalIcon(animal.name, index) : '🐾';

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

    circle.bindTooltip(`Geofence: ${localizedName} (${radius}m)`, {
      sticky: true,
      className: 'text-[11px] font-bold'
    });
    circles.push(circle);

    // Marker Pill
    const animalIcon = L.divIcon({
      className: 'animal-map-marker',
      html: `
        <div class="animal-map-pill group" onclick="selectAnimalById('${animal.id}')">
          <span class="text-sm shrink-0">${iconChar}</span>
          <span class="animal-map-name truncate">${localizedName}</span>
          <span class="animal-map-badge">${radius}m</span>
        </div>
      `,
      iconSize: [0, 0]
    });

    const marker = L.marker([lat, lon], { icon: animalIcon }).addTo(map);
    marker.on('click', () => selectAnimal(animal));
    markers.push(marker);
  });
}

/**
 * Render Animals into Bottom Carousel Quick-Drawer
 */
function renderAnimalsGrid(animals) {
  const container = document.getElementById('map-carousel-container');
  if (!container) return;

  const t = (typeof UI_TRANSLATIONS !== 'undefined' && UI_TRANSLATIONS[currentLanguage]) ? UI_TRANSLATIONS[currentLanguage] : (UI_TRANSLATIONS?.vi || {});
  
  if (!animals || animals.length === 0) {
    container.innerHTML = `
      <div class="py-3 px-6 text-xs text-slate-400 bg-white/95 rounded-2xl border border-slate-200">
        ${t.noAnimalData || 'Chưa có dữ liệu động vật'}
      </div>
    `;
    return;
  }

  container.innerHTML = animals.map((a, index) => {
    const locName = (typeof getAnimalLocalizedName === 'function') ? getAnimalLocalizedName(a, currentLanguage) : (a.name || '');
    const locZone = (typeof getAnimalLocalizedZone === 'function') ? getAnimalLocalizedZone(a, currentLanguage) : (a.zone || '');
    const iconChar = (typeof getAnimalIcon === 'function') ? getAnimalIcon(a.name, index) : '🐾';
    const isSelected = currentSelectedAnimal && String(currentSelectedAnimal.id) === String(a.id);

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
          <span class="inline-block mt-0.5 text-[9px] font-extrabold text-zoo-700 bg-zoo-50 px-1.5 py-0.2 rounded">
            ${a.radius_meters || 25}m
          </span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Select Animal by ID
 */
function selectAnimalById(id) {
  const targetId = String(id);
  const animal = zooAnimals.find(a => String(a.id) === targetId || String(a.id) === targetId.replace('zoo-', '') || `zoo-${a.id}` === targetId);
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

  // Populate floating detailed place card
  const card = document.getElementById('gmap-place-card');
  if (!card) return;

  const locName = (typeof getAnimalLocalizedName === 'function') ? getAnimalLocalizedName(animal, currentLanguage) : (animal.name || '');
  const locZone = (typeof getAnimalLocalizedZone === 'function') ? getAnimalLocalizedZone(animal, currentLanguage) : (animal.zone || '');
  const narrative = (typeof getAnimalLocalizedNarrative === 'function') ? getAnimalLocalizedNarrative(animal, currentLanguage) : (animal.descriptionVi || '');

  document.getElementById('card-animal-name').textContent = locName;
  document.getElementById('card-animal-sciname').textContent = animal.scientificName || '';
  document.getElementById('card-animal-zone').textContent = locZone;
  document.getElementById('card-animal-narrative').textContent = narrative;
  document.getElementById('card-animal-geofence').textContent = `${animal.radius_meters || 25}m`;
  document.getElementById('card-animal-iucn').textContent = animal.conservationStatus || 'Bảo tồn';

  const imgEl = document.getElementById('card-animal-img');
  if (imgEl) {
    imgEl.src = animal.imageUrl || '';
    imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600'; };
  }

  card.classList.remove('hidden');

  // Reset audio UI state
  updateAudioButtonUI(zooAudio.state);
}

function closePlaceCard() {
  const card = document.getElementById('gmap-place-card');
  if (card) card.classList.add('hidden');
  if (zooAudio.state === 'playing') {
    zooAudio.stop();
    updateAudioButtonUI('idle');
  }
}

/**
 * Unified Audio Player Controller
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

  const narrative = (typeof getAnimalLocalizedNarrative === 'function') ? getAnimalLocalizedNarrative(currentSelectedAnimal, currentLanguage) : (currentSelectedAnimal.descriptionVi || '');
  updateAudioButtonUI('playing');

  zooAudio.playNarration(
    narrative,
    currentSelectedAnimal.audioUrl,
    currentLanguage,
    (state) => updateAudioButtonUI(state),
    (cur, dur, pct) => {
      const progressBar = document.getElementById('audio-progress-bar');
      const timeDisplay = document.getElementById('audio-time-display');
      if (progressBar) progressBar.value = pct;
      if (timeDisplay) timeDisplay.textContent = `${zooAudio.formatTime(cur)} / ${zooAudio.formatTime(dur)}`;
    }
  );

  if (typeof sendScanLog === 'function') {
    sendScanLog(currentSelectedAnimal.id, 'GEO', currentLanguage);
  }
}

function updateAudioButtonUI(state) {
  const btn = document.getElementById('card-btn-listen');
  const icon = document.getElementById('card-listen-icon');
  const textPlay = document.getElementById('card-btn-listen-text');
  const textStop = document.getElementById('card-btn-stop-text');

  if (!btn || !icon || !textPlay || !textStop) return;

  if (state === 'playing') {
    icon.className = 'fa-solid fa-pause text-xs';
    textPlay.classList.add('hidden');
    textStop.classList.remove('hidden');
    textStop.textContent = 'Tạm Dừng';
    btn.classList.remove('bg-zoo-600', 'hover:bg-zoo-700');
    btn.classList.add('bg-amber-600', 'hover:bg-amber-700');
  } else if (state === 'paused') {
    icon.className = 'fa-solid fa-play text-xs';
    textPlay.classList.remove('hidden');
    textPlay.textContent = 'Tiếp Tục';
    textStop.classList.add('hidden');
    btn.classList.add('bg-zoo-600', 'hover:bg-zoo-700');
    btn.classList.remove('bg-amber-600', 'hover:bg-amber-700');
  } else {
    icon.className = 'fa-solid fa-headphones text-xs';
    textPlay.classList.remove('hidden');
    textPlay.textContent = 'Nghe Thuyết Minh';
    textStop.classList.add('hidden');
    btn.classList.add('bg-zoo-600', 'hover:bg-zoo-700');
    btn.classList.remove('bg-amber-600', 'hover:bg-amber-700');
  }
}

/**
 * Locate Tourist on Map via Browser GPS
 */
function locateTouristGMap() {
  if (!map) return;
  zooGps.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      if (!touristMarker) {
        const touristIcon = L.divIcon({
          className: 'tourist-gps-marker',
          html: `
            <div class="relative w-7 h-7 flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [28, 28]
        });
        touristMarker = L.marker([lat, lon], { icon: touristIcon }).addTo(map);
      } else {
        touristMarker.setLatLng([lat, lon]);
      }

      map.flyTo([lat, lon], 18, { duration: 1.0 });
      checkGeofenceTriggers(lat, lon);
    },
    (err) => {
      alert("Không thể truy cập GPS vị trí: " + err.message + "\nHãy đảm bảo bạn đã cấp quyền định vị cho trình duyệt.");
    }
  );
}

/**
 * Check Geofence distance to active zoo exhibits
 */
function checkGeofenceTriggers(userLat, userLon) {
  let closestAnimal = null;
  let minDistance = Infinity;

  zooAnimals.forEach(animal => {
    if (!animal.coordinates) return;
    const dist = zooGps.calculateDistance(userLat, userLon, animal.coordinates.lat, animal.coordinates.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closestAnimal = animal;
    }
  });

  if (closestAnimal && minDistance <= (closestAnimal.radius_meters || 25)) {
    selectAnimal(closestAnimal);
    showGeofenceToast(closestAnimal, Math.round(minDistance));
    playCurrentSelectedAnimalNarration();
  }
}

function showGeofenceToast(animal, distance) {
  const toast = document.getElementById('geofence-toast');
  if (!toast) return;

  const locName = (typeof getAnimalLocalizedName === 'function') ? getAnimalLocalizedName(animal, currentLanguage) : animal.name;
  document.getElementById('toast-animal-name').textContent = locName;
  document.getElementById('toast-distance').textContent = `${distance}m`;

  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 5000);
}

/**
 * Draw Walking Route
 */
function drawWalkingRouteToSelected() {
  if (!map || !touristMarker || !currentSelectedAnimal || !currentSelectedAnimal.coordinates) return;
  if (navigationRouteLayer) map.removeLayer(navigationRouteLayer);

  const from = touristMarker.getLatLng();
  const to = [currentSelectedAnimal.coordinates.lat, currentSelectedAnimal.coordinates.lon];

  navigationRouteLayer = L.polyline([from, to], {
    color: '#0284c7',
    weight: 3.5,
    dashArray: '8, 8',
    opacity: 0.8
  }).addTo(map);
}

/**
 * Search filter for exhibits
 */
function filterAnimalsSearch(query) {
  const q = (query || '').toLowerCase().trim();
  const clearBtn = document.getElementById('gmap-search-clear');
  if (clearBtn) {
    if (q.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  if (!q) {
    renderAnimalsGrid(zooAnimals);
    return;
  }

  const filtered = zooAnimals.filter(a => {
    const locName = (typeof getAnimalLocalizedName === 'function') ? getAnimalLocalizedName(a, currentLanguage).toLowerCase() : '';
    const sciName = (a.scientificName || '').toLowerCase();
    const zone = (a.zone || '').toLowerCase();
    return locName.includes(q) || sciName.includes(q) || zone.includes(q);
  });

  renderAnimalsGrid(filtered);
  if (filtered.length > 0) {
    selectAnimal(filtered[0], true);
  }
}

function clearSearch() {
  const input = document.getElementById('gmap-search-input');
  if (input) input.value = '';
  filterAnimalsSearch('');
}

/**
 * Map Navigation Helpers
 */
function resetMapView() {
  if (!map) return;
  map.flyTo([10.7880, 106.7062], 17, { duration: 1.0 });
}

function zoomInMap() {
  if (map) map.zoomIn();
}

function zoomOutMap() {
  if (map) map.zoomOut();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/**
 * Change Language
 */
function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('zoo_guide_lang', lang);

  setGoogleMapType(currentMapType);
  renderMapAnimals(zooAnimals);
  renderAnimalsGrid(zooAnimals);

  if (currentSelectedAnimal) {
    selectAnimal(currentSelectedAnimal, false);
  }
}

/**
 * DOM Initialization
 */
document.addEventListener("DOMContentLoaded", () => {
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

  // 4. Background sync with backend
  if (typeof fetchAnimalsFromBackend === 'function') {
    fetchAnimalsFromBackend().then(res => {
      if (res && res.data && res.data.length > 0) {
        zooAnimals = res.data;
        renderMapAnimals(zooAnimals);
        renderAnimalsGrid(zooAnimals);

        // Check URL params after DB sync
        const urlParams = new URLSearchParams(window.location.search);
        const paramAnimalId = urlParams.get('animalId');
        if (paramAnimalId) {
          selectAnimalById(paramAnimalId);
          if (urlParams.get('play') === '1') {
            setTimeout(() => playCurrentSelectedAnimalNarration(), 600);
          }
        } else if (!currentSelectedAnimal && zooAnimals.length > 0) {
          selectAnimal(zooAnimals[0], false);
        }
      }
    });
  }

  // 5. Handle initial URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const paramAnimalId = urlParams.get('animalId');
  if (paramAnimalId) {
    setTimeout(() => {
      selectAnimalById(paramAnimalId);
      if (urlParams.get('play') === '1') {
        playCurrentSelectedAnimalNarration();
      }
      if (typeof sendScanLog === 'function') {
        sendScanLog(paramAnimalId, 'QR', currentLanguage);
      }
    }, 400);
  } else if (zooAnimals.length > 0) {
    selectAnimal(zooAnimals[0], false);
  }

  // 6. Bind language selector dropdown
  const langSelect = document.getElementById('header-lang-select');
  if (langSelect) {
    langSelect.value = currentLanguage;
    langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
  }
});
