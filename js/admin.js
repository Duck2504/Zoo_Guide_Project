/**
 * admin.js — Thảo Cầm Viên Sài Gòn
 * Dedicated Control Panel implementing 4 Core Admin Modules:
 * 1. Thêm Loài Thú Mới (Add New Animal)
 * 2. Danh Mục & Sửa / Xóa (Catalog & CRUD)
 * 3. Bản Đồ GPS & Geofence (Interactive Map & Geofence Manager)
 * 4. Tạo Biển Bảng QR (QR Signage Generator & Batch Print)
 */

// Global State
let adminAnimals = [];
let adminZones = [];
let currentAdminTab = 'add';
let adminMap = null;
let adminMarkers = {};
let adminCircles = {};
let selectedAnimalForMap = null;
let currentSignageTheme = 'emerald';
let currentSignageSize = 'a4';

// ----------------------------------------------------
// 1. DATA INITIALIZATION & LOCALSTORAGE SYNC
// ----------------------------------------------------
function loadAdminData() {
  const savedAnimals = localStorage.getItem('ZOO_ANIMALS_DATA_V3');
  if (savedAnimals) {
    try {
      const parsed = JSON.parse(savedAnimals);
      if (Array.isArray(parsed) && parsed.length > 0) {
        adminAnimals = parsed;
      }
    } catch (_) {}
  }
  
  if (!adminAnimals) {
    adminAnimals = [];
  }

  adminZones = (typeof ZOO_ZONES !== 'undefined') ? ZOO_ZONES : [
    { id: "zone-1", name: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc", color: "#059669" },
    { id: "zone-2", name: "Khu Thú Dữ Ăn Thịt & Rừng Nhiệt Đới", color: "#ea580c" },
    { id: "zone-3", name: "Khu Thảo Nguyên Châu Phi", color: "#d97706" },
    { id: "zone-4", name: "Khu Linh Trưởng & Đảo Khỉ", color: "#4f46e5" }
  ];
}

function saveAdminAnimals() {
  try {
    localStorage.setItem('ZOO_ANIMALS_DATA_V3', JSON.stringify(adminAnimals));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

// ----------------------------------------------------
// 2. TOAST NOTIFICATIONS & CONFETTI
// ----------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('admin-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600 border-emerald-500' : (type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-sky-600 border-sky-500');
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle');

  toast.className = `p-4 rounded-2xl ${bg} text-white border shadow-2xl text-xs font-bold flex items-center gap-2.5 transform translate-y-4 opacity-0 transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `<i class="fa-solid ${icon} text-base"></i><span>${message}</span>`;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function triggerCelebration() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#10b981', '#059669', '#38bdf8', '#fbbf24']
    });
  }
}

// ----------------------------------------------------
// 3. TAB NAVIGATION
// ----------------------------------------------------
const TAB_TITLES = {
  'add': 'Thêm Loài Thú Mới',
  'catalog': 'Danh Mục & Sửa / Xóa',
  'map': 'Bản Đồ GPS & Geofence',
  'signage': 'Tạo Biển Bảng QR'
};

function switchAdminTab(tabKey) {
  currentAdminTab = tabKey;
  
  // Update header title
  const titleEl = document.getElementById('current-pane-title');
  if (titleEl) titleEl.textContent = TAB_TITLES[tabKey] || 'Quản Trị';

  // Toggle tab buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabKey;
    if (isTarget) {
      btn.className = 'admin-tab-btn w-full py-2.5 px-3.5 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 flex items-center space-x-2.5 transition shadow-md cursor-pointer';
    } else {
      btn.className = 'admin-tab-btn w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center space-x-2.5 transition cursor-pointer';
    }
  });

  // Toggle panes
  const panes = {
    'add': document.getElementById('pane-add'),
    'catalog': document.getElementById('pane-catalog'),
    'map': document.getElementById('pane-map'),
    'signage': document.getElementById('pane-signage')
  };

  Object.keys(panes).forEach(k => {
    if (panes[k]) {
      if (k === tabKey) {
        panes[k].classList.remove('hidden');
      } else {
        panes[k].classList.add('hidden');
      }
    }
  });

  // Specific lifecycle actions
  if (tabKey === 'catalog') {
    renderCatalogTable();
  } else if (tabKey === 'map') {
    if (!adminMap) {
      initAdminMap();
    } else {
      setTimeout(() => {
        adminMap.invalidateSize();
      }, 150);
    }
  } else if (tabKey === 'signage') {
    populateSignageDropdown();
    renderSignagePlatePreview();
  }
}

// ----------------------------------------------------
// 4. MODULE 1: THÊM LOÀI THÚ MỚI
// ----------------------------------------------------
function populateZoneDropdowns() {
  const addZoneSelect = document.getElementById('add-animal-zone');
  const editZoneSelect = document.getElementById('edit-animal-zone');
  const catalogFilter = document.getElementById('catalog-zone-filter');

  const optionsHtml = adminZones.map(z => `<option value="${z.name}">${z.name}</option>`).join('');

  if (addZoneSelect) addZoneSelect.innerHTML = optionsHtml;
  if (editZoneSelect) editZoneSelect.innerHTML = optionsHtml;
  if (catalogFilter) {
    catalogFilter.innerHTML = `<option value="">Tất Cả Khu Vực</option>` + adminZones.map(z => `<option value="${z.name}">${z.name}</option>`).join('');
  }
}

function updateAddLivePreview() {
  const name = document.getElementById('add-animal-name')?.value || 'Tên Loài Thú';
  const sciname = document.getElementById('add-animal-sciname')?.value || 'Scientific name';
  const zone = document.getElementById('add-animal-zone')?.value || 'Phân khu sinh cảnh';
  const iucn = document.getElementById('add-animal-iucn')?.value || 'EN';
  const radius = document.getElementById('add-animal-radius')?.value || '25';
  const imgUrl = document.getElementById('add-animal-image')?.value || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=700';
  const narrative = document.getElementById('add-animal-narrative')?.value || 'Mô tả bài thuyết minh audio...';

  const previewName = document.getElementById('preview-animal-name');
  if (previewName) previewName.textContent = name;
  const previewSci = document.getElementById('preview-animal-sciname');
  if (previewSci) previewSci.textContent = sciname;
  const previewZone = document.getElementById('preview-animal-zone');
  if (previewZone) previewZone.textContent = zone;
  const previewIucn = document.getElementById('preview-animal-iucn');
  if (previewIucn) previewIucn.textContent = iucn.split('-')[0].trim();
  const previewRad = document.getElementById('preview-animal-radius');
  if (previewRad) previewRad.innerHTML = `<i class="fa-solid fa-broadcast-tower text-[9px] mr-1"></i>${radius}m`;
  const previewImg = document.getElementById('preview-animal-img');
  if (previewImg && imgUrl) previewImg.src = imgUrl;
  const previewDesc = document.getElementById('preview-animal-desc');
  if (previewDesc) previewDesc.textContent = narrative;
}

function resetAddAnimalForm() {
  const form = document.getElementById('form-add-animal');
  if (form) form.reset();
  updateAddLivePreview();
  showToast('Đã làm mới biểu mẫu thêm thú', 'info');
}

function pickCoordinatesFromMap() {
  switchAdminTab('map');
  showToast('Hãy click chuột lên bản đồ để chọn tọa độ mới cho con thú', 'info');
}

function handleAddAnimalSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('add-animal-name').value.trim();
  const sciname = document.getElementById('add-animal-sciname').value.trim();
  const zone = document.getElementById('add-animal-zone').value;
  const iucn = document.getElementById('add-animal-iucn').value;
  const lat = parseFloat(document.getElementById('add-animal-lat').value);
  const lon = parseFloat(document.getElementById('add-animal-lng').value);
  const radius = parseInt(document.getElementById('add-animal-radius').value, 10) || 25;
  const diet = document.getElementById('add-animal-diet').value.trim() || 'Ăn thực vật / thức ăn tổng hợp';
  const imgUrl = document.getElementById('add-animal-image').value.trim();
  const narrative = document.getElementById('add-animal-narrative').value.trim();

  if (!name || isNaN(lat) || isNaN(lon)) {
    showToast('Vui lòng nhập đầy đủ tên và tọa độ hợp lệ!', 'error');
    return;
  }

  const newId = `zoo-${Date.now().toString().slice(-4)}`;
  const newAnimal = {
    id: newId,
    name: name,
    scientificName: sciname,
    zone: zone,
    conservationStatus: iucn,
    diet: diet,
    coordinates: { lon: lon, lat: lat },
    radius_meters: radius,
    color: '#059669',
    imageUrl: imgUrl,
    descriptionVi: narrative,
    audioLength: '01:20'
  };

  adminAnimals.push(newAnimal);
  saveAdminAnimals();
  triggerCelebration();
  showToast(`Đã thêm thành công loài thú: ${name}!`);

  // Refresh other tabs
  renderCatalogTable();
  if (adminMap) refreshAdminMapLayers();
  populateSignageDropdown();

  // Reset form
  resetAddAnimalForm();
}

// ----------------------------------------------------
// 5. MODULE 2: DANH MỤC & SỬA / XÓA
// ----------------------------------------------------
function renderCatalogTable(searchTerm = '', zoneTerm = '', iucnTerm = '') {
  const tbody = document.getElementById('catalog-table-body');
  if (!tbody) return;

  const totalEl = document.getElementById('catalog-count-total');
  const filteredEl = document.getElementById('catalog-count-filtered');
  if (totalEl) totalEl.textContent = adminAnimals.length;

  const filtered = adminAnimals.filter(a => {
    const matchName = !searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (a.scientificName && a.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchZone = !zoneTerm || (a.zone && a.zone === zoneTerm);
    const matchIucn = !iucnTerm || (a.conservationStatus && a.conservationStatus.includes(iucnTerm));
    return matchName && matchZone && matchIucn;
  });

  if (filteredEl) filteredEl.textContent = filtered.length;

    if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-400">
          <div class="max-w-md mx-auto space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xl">
              <i class="fa-solid fa-paw"></i>
            </div>
            <h4 class="text-sm font-bold text-white">Chưa có loài thú nào trong hệ thống (0 loài)</h4>
            <p class="text-xs text-slate-400">Dữ liệu hiện tại đang là 0. Bạn có thể bấm vào nút bên dưới để thêm loài thú mới bất kỳ lúc nào.</p>
            <button type="button" onclick="switchAdminTab('add')"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md transition">
              <i class="fa-solid fa-plus"></i> Thêm Loài Thú Đầu Tiên
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    const lat = (a.coordinates && a.coordinates.lat) ? a.coordinates.lat.toFixed(4) : (a.lat ? a.lat.toFixed(4) : '--');
    const lon = (a.coordinates && a.coordinates.lon) ? a.coordinates.lon.toFixed(4) : (a.lng ? a.lng.toFixed(4) : '--');
    const radius = a.radius_meters || 25;
    const iucnShort = a.conservationStatus ? a.conservationStatus.split('-')[0].trim() : 'EN';
    
    const iucnColor = iucnShort === 'CR' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                     (iucnShort === 'EN' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                     (iucnShort === 'VU' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'));

    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="py-3 px-4">
          <div class="flex items-center space-x-3">
            <img src="${a.imageUrl}" alt="${a.name}" class="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" onerror="this.src='https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=200'" />
            <div class="min-w-0">
              <h4 class="font-extrabold text-white text-xs truncate">${a.name}</h4>
              <p class="text-[11px] text-slate-400 italic truncate font-mono">${a.scientificName || '--'}</p>
            </div>
          </div>
        </td>

        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 inline-block max-w-[180px] truncate">
            ${a.zone || '--'}
          </span>
        </td>

        <td class="py-3 px-4 font-mono text-[11px]">
          <span class="text-slate-300">${lat}, ${lon}</span>
          <span class="ml-1 text-emerald-400 font-bold">(${radius}m)</span>
        </td>

        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${iucnColor}">
            ${iucnShort}
          </span>
        </td>

        <td class="py-3 px-4 text-center">
          <button type="button" onclick="openSignageForAnimal('${a.id}')"
                  class="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs transition cursor-pointer"
                  title="Tạo biển bảng QR cho ${a.name}">
            <i class="fa-solid fa-qrcode"></i>
          </button>
        </td>

        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end space-x-1.5">
            <button type="button" onclick="openEditModal('${a.id}')"
                    class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition cursor-pointer"
                    title="Chỉnh sửa thông tin">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button type="button" onclick="deleteAnimalById('${a.id}')"
                    class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                    title="Xóa con thú">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterCatalogTable() {
  const search = document.getElementById('catalog-search-input')?.value.trim() || '';
  const zone = document.getElementById('catalog-zone-filter')?.value || '';
  const iucn = document.getElementById('catalog-iucn-filter')?.value || '';
  renderCatalogTable(search, zone, iucn);
}

function resetCatalogFilters() {
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) searchInput.value = '';
  const zoneSelect = document.getElementById('catalog-zone-filter');
  if (zoneSelect) zoneSelect.value = '';
  const iucnSelect = document.getElementById('catalog-iucn-filter');
  if (iucnSelect) iucnSelect.value = '';
  renderCatalogTable();
  showToast('Đã xóa bộ lọc danh mục', 'info');
}

function exportAnimalsJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminAnimals, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `zoo_animals_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Đã xuất file JSON dữ liệu thành công!');
}

// ----------------------------------------------------
// 6. MODAL: SỬA & XÓA THÚ
// ----------------------------------------------------
function openEditModal(animalId) {
  const animal = adminAnimals.find(a => a.id === animalId);
  if (!animal) return;

  document.getElementById('edit-animal-id').value = animal.id;
  document.getElementById('edit-animal-name').value = animal.name || '';
  document.getElementById('edit-animal-sciname').value = animal.scientificName || '';
  document.getElementById('edit-animal-zone').value = animal.zone || '';
  document.getElementById('edit-animal-iucn').value = animal.conservationStatus || 'EN - Nguy cấp (Sách Đỏ IUCN)';
  
  const lat = (animal.coordinates && animal.coordinates.lat) ? animal.coordinates.lat : (animal.lat || 10.7875);
  const lon = (animal.coordinates && animal.coordinates.lon) ? animal.coordinates.lon : (animal.lng || 106.7055);
  document.getElementById('edit-animal-lat').value = lat;
  document.getElementById('edit-animal-lng').value = lon;
  document.getElementById('edit-animal-radius').value = animal.radius_meters || 25;
  document.getElementById('edit-animal-image').value = animal.imageUrl || '';
  document.getElementById('edit-animal-narrative').value = animal.descriptionVi || '';

  const modal = document.getElementById('modal-edit-animal');
  if (modal) modal.classList.remove('hidden');
}

function closeEditModal() {
  const modal = document.getElementById('modal-edit-animal');
  if (modal) modal.classList.add('hidden');
}

function handleEditAnimalSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-animal-id').value;
  const animal = adminAnimals.find(a => a.id === id);
  if (!animal) return;

  animal.name = document.getElementById('edit-animal-name').value.trim();
  animal.scientificName = document.getElementById('edit-animal-sciname').value.trim();
  animal.zone = document.getElementById('edit-animal-zone').value;
  animal.conservationStatus = document.getElementById('edit-animal-iucn').value;
  
  const lat = parseFloat(document.getElementById('edit-animal-lat').value);
  const lon = parseFloat(document.getElementById('edit-animal-lng').value);
  animal.coordinates = { lon: lon, lat: lat };
  animal.radius_meters = parseInt(document.getElementById('edit-animal-radius').value, 10) || 25;
  animal.imageUrl = document.getElementById('edit-animal-image').value.trim();
  animal.descriptionVi = document.getElementById('edit-animal-narrative').value.trim();

  saveAdminAnimals();
  closeEditModal();
  renderCatalogTable();
  if (adminMap) refreshAdminMapLayers();
  populateSignageDropdown();

  showToast(`Đã cập nhật thông tin loài thú: ${animal.name}!`);
}

function deleteAnimalById(id) {
  const animal = adminAnimals.find(a => a.id === id);
  if (!animal) return;

  if (confirm(`Bạn có chắc chắn muốn xóa loài thú "${animal.name}" khỏi hệ thống?`)) {
    adminAnimals = adminAnimals.filter(a => a.id !== id);
    saveAdminAnimals();
    renderCatalogTable();
    if (adminMap) refreshAdminMapLayers();
    populateSignageDropdown();
    showToast(`Đã xóa loài thú: ${animal.name}`, 'info');
  }
}

// ----------------------------------------------------
// 7. MODULE 3: BẢN ĐỒ GPS & GEOFENCE
// ----------------------------------------------------
function initAdminMap() {
  if (adminMap) return;

  const container = document.getElementById('admin-interactive-map');
  if (!container) return;

  adminMap = L.map('admin-interactive-map', {
    zoomControl: true,
    minZoom: 15,
    maxZoom: 21
  }).setView([10.7880, 106.7062], 16.5);

  // Google Maps tile layer
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 21,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps'
  }).addTo(adminMap);

  // Boundary Polygon
  if (typeof ZOO_BOUNDARY_POLYGON !== 'undefined') {
    L.polygon(ZOO_BOUNDARY_POLYGON, {
      color: '#059669',
      weight: 3,
      fillColor: '#10b981',
      fillOpacity: 0.12
    }).addTo(adminMap).bindTooltip("Khuôn viên Thảo Cầm Viên Sài Gòn", { sticky: true });
  }

  // Gates
  if (typeof ZOO_GATES !== 'undefined') {
    ZOO_GATES.forEach(g => {
      const gateIcon = L.divIcon({
        className: 'custom-gate-pin',
        html: `<div class="bg-slate-900 border border-amber-400 text-amber-400 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-lg flex items-center gap-1">
                 <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>${g.name.split('(')[0]}
               </div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });
      L.marker([g.lat, g.lng], { icon: gateIcon }).addTo(adminMap).bindPopup(`<strong>${g.name}</strong><br>${g.desc || ''}`);
    });
  }

  // Map Click Listener to pick coordinates
  adminMap.on('click', (e) => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    const latDisplay = document.getElementById('display-map-lat');
    const lngDisplay = document.getElementById('display-map-lng');
    if (latDisplay) latDisplay.textContent = lat;
    if (lngDisplay) lngDisplay.textContent = lng;

    // Also populate Add Animal Form inputs
    const addLat = document.getElementById('add-animal-lat');
    const addLng = document.getElementById('add-animal-lng');
    if (addLat) addLat.value = lat;
    if (addLng) addLng.value = lng;

    showToast(`Đã ghim tọa độ mới: [${lat}, ${lng}]`, 'info');
  });

  refreshAdminMapLayers();
  populateMapAnimalDropdown();
}

function refreshAdminMapLayers() {
  if (!adminMap) return;

  // Clear existing markers and circles
  Object.values(adminMarkers).forEach(m => adminMap.removeLayer(m));
  Object.values(adminCircles).forEach(c => adminMap.removeLayer(c));
  adminMarkers = {};
  adminCircles = {};

  adminAnimals.forEach(a => {
    const lat = (a.coordinates && a.coordinates.lat) ? a.coordinates.lat : (a.lat || 10.7875);
    const lon = (a.coordinates && a.coordinates.lon) ? a.coordinates.lon : (a.lng || 106.7055);
    const radius = a.radius_meters || 25;
    const color = a.color || '#059669';

    // Geofence Circle
    const circle = L.circle([lat, lon], {
      radius: radius,
      color: color,
      weight: 1.5,
      fillColor: color,
      fillOpacity: 0.18,
      dashArray: '4, 4'
    }).addTo(adminMap);
    circle.bindTooltip(`Vùng Geofence: ${a.name} (${radius}m)`, { sticky: true });
    adminCircles[a.id] = circle;

    // Marker
    const icon = L.divIcon({
      className: 'custom-animal-pin',
      html: `<div class="w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-400 text-white flex items-center justify-center text-xs shadow-xl cursor-pointer hover:scale-110 transition">
               🐾
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([lat, lon], { icon: icon }).addTo(adminMap);
    marker.bindPopup(`
      <div class="p-1 space-y-1">
        <h4 class="font-bold text-slate-900 text-xs">${a.name}</h4>
        <p class="text-[10px] text-slate-500">${a.zone || ''}</p>
        <p class="text-[10px] text-emerald-600 font-bold">Bán kính Geofence: ${radius}m</p>
      </div>
    `);
    marker.on('click', () => {
      onMapAnimalSelected(a.id);
    });
    adminMarkers[a.id] = marker;
  });
}

function populateMapAnimalDropdown() {
  const select = document.getElementById('map-select-animal');
  if (!select) return;

  if (adminAnimals.length === 0) {
    select.innerHTML = `<option value="">(Chưa có con thú nào — hãy thêm thú mới)</option>`;
    const latDisplay = document.getElementById('display-map-lat');
    const lngDisplay = document.getElementById('display-map-lng');
    if (latDisplay) latDisplay.textContent = '10.788000';
    if (lngDisplay) lngDisplay.textContent = '106.706200';
    return;
  }

  select.innerHTML = adminAnimals.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  onMapAnimalSelected(adminAnimals[0].id);
}

function onMapAnimalSelected(animalId) {
  const animal = adminAnimals.find(a => a.id === animalId);
  if (!animal) return;

  selectedAnimalForMap = animal;
  const lat = (animal.coordinates && animal.coordinates.lat) ? animal.coordinates.lat : (animal.lat || 10.7875);
  const lon = (animal.coordinates && animal.coordinates.lon) ? animal.coordinates.lon : (animal.lng || 106.7055);
  const radius = animal.radius_meters || 25;

  const latDisplay = document.getElementById('display-map-lat');
  const lngDisplay = document.getElementById('display-map-lng');
  if (latDisplay) latDisplay.textContent = lat.toFixed(6);
  if (lngDisplay) lngDisplay.textContent = lon.toFixed(6);

  const slider = document.getElementById('geofence-radius-slider');
  const sliderVal = document.getElementById('slider-radius-val');
  if (slider) slider.value = radius;
  if (sliderVal) sliderVal.textContent = `${radius} mét`;

  if (adminMap) {
    adminMap.flyTo([lat, lon], 17.5, { duration: 0.8 });
    if (adminMarkers[animal.id]) {
      adminMarkers[animal.id].openPopup();
    }
  }
}

function onGeofenceSliderChange(val) {
  const sliderVal = document.getElementById('slider-radius-val');
  if (sliderVal) sliderVal.textContent = `${val} mét`;

  if (selectedAnimalForMap && adminCircles[selectedAnimalForMap.id]) {
    adminCircles[selectedAnimalForMap.id].setRadius(parseInt(val, 10));
  }
}

function saveCurrentAnimalGeofence() {
  if (!selectedAnimalForMap) return;

  const slider = document.getElementById('geofence-radius-slider');
  const radius = parseInt(slider?.value || 25, 10);
  selectedAnimalForMap.radius_meters = radius;

  saveAdminAnimals();
  renderCatalogTable();
  showToast(`Đã lưu bán kính Geofence ${radius}m cho: ${selectedAnimalForMap.name}`);
}

function resetAdminMapView() {
  if (adminMap) {
    adminMap.flyTo([10.7880, 106.7062], 16.5, { duration: 0.6 });
  }
}

function focusMapLocation(lat, lng) {
  if (adminMap) {
    adminMap.flyTo([lat, lng], 18, { duration: 0.8 });
  }
}

// ----------------------------------------------------
// 8. MODULE 4: TẠO BIỂN BẢNG QR
// ----------------------------------------------------
function populateSignageDropdown() {
  const select = document.getElementById('signage-animal-select');
  if (!select) return;

  if (adminAnimals.length === 0) {
    select.innerHTML = `<option value="">(Chưa có loài thú nào)</option>`;
    return;
  }

  select.innerHTML = adminAnimals.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
}

function openSignageForAnimal(animalId) {
  switchAdminTab('signage');
  const select = document.getElementById('signage-animal-select');
  if (select) {
    select.value = animalId;
    renderSignagePlatePreview();
  }
}

function setSignageSize(size) {
  currentSignageSize = size;
  document.querySelectorAll('.signage-size-btn').forEach(btn => {
    btn.className = 'signage-size-btn py-2 rounded-xl bg-slate-800 text-slate-400 font-bold text-center cursor-pointer';
  });
  if (event && event.target) {
    event.target.className = 'signage-size-btn active py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-center cursor-pointer';
  }
}

function renderSignagePlatePreview() {
  const select = document.getElementById('signage-animal-select');
  if (!select) return;
  
  if (adminAnimals.length === 0) {
    const nameEl = document.getElementById('plate-animal-name');
    if (nameEl) nameEl.textContent = 'Chưa Có Dữ Liệu';
    const sciEl = document.getElementById('plate-animal-sciname');
    if (sciEl) sciEl.textContent = 'Hãy thêm loài thú mới để tạo mã QR';
    const zoneEl = document.getElementById('plate-animal-zone');
    if (zoneEl) zoneEl.textContent = 'Hệ Thống Trống';
    const urlEl = document.getElementById('signage-target-url');
    if (urlEl) urlEl.textContent = `${window.location.origin}${window.location.pathname.replace('admin.html', 'index.html')}`;

    const qrContainer = document.getElementById('plate-qrcode-container');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
          text: `${window.location.origin}${window.location.pathname.replace('admin.html', 'index.html')}`,
          width: 176,
          height: 176,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }
    return;
  }

  const animalId = select.value || (adminAnimals[0] && adminAnimals[0].id);
  const animal = adminAnimals.find(a => a.id === animalId) || adminAnimals[0];
  if (!animal) return;

  const themeSelect = document.getElementById('signage-theme-select');
  currentSignageTheme = themeSelect ? themeSelect.value : 'emerald';

  // Update text
  const nameEl = document.getElementById('plate-animal-name');
  if (nameEl) nameEl.textContent = animal.name;
  const sciEl = document.getElementById('plate-animal-sciname');
  if (sciEl) sciEl.textContent = animal.scientificName || '';
  const zoneEl = document.getElementById('plate-animal-zone');
  if (zoneEl) zoneEl.textContent = animal.zone || '';

  // Update target URL
  const qrTarget = `${window.location.origin}${window.location.pathname.replace('admin.html', 'index.html')}?animalId=${animal.id}`;
  const urlEl = document.getElementById('signage-target-url');
  if (urlEl) urlEl.textContent = qrTarget;

  // Render Theme Styles on Plate
  const plate = document.getElementById('signage-printable-area');
  if (plate) {
    if (currentSignageTheme === 'dark') {
      plate.className = "w-full max-w-sm rounded-3xl p-7 text-center transition-all duration-300 shadow-2xl relative border-4 border-slate-700 bg-gradient-to-b from-slate-950 to-slate-900 text-white";
    } else if (currentSignageTheme === 'gold') {
      plate.className = "w-full max-w-sm rounded-3xl p-7 text-center transition-all duration-300 shadow-2xl relative border-4 border-amber-500 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-white";
    } else {
      plate.className = "w-full max-w-sm rounded-3xl p-7 text-center transition-all duration-300 shadow-2xl relative border-4 border-emerald-600 bg-gradient-to-b from-slate-900 to-emerald-950 text-white";
    }
  }

  // Generate QR Code
  const qrContainer = document.getElementById('plate-qrcode-container');
  if (qrContainer) {
    qrContainer.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: qrTarget,
        width: 176,
        height: 176,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }
}

function downloadCurrentSignagePng() {
  const qrCanvas = document.querySelector('#plate-qrcode-container canvas');
  const qrImg = document.querySelector('#plate-qrcode-container img');
  const src = qrCanvas ? qrCanvas.toDataURL("image/png") : (qrImg ? qrImg.src : null);

  if (!src) {
    showToast('Đang tạo mã QR, vui lòng thử lại sau 1 giây', 'error');
    return;
  }

  const select = document.getElementById('signage-animal-select');
  const animalId = select ? select.value : 'exhibit';
  const animal = adminAnimals.find(a => a.id === animalId);
  const fileName = `Bien_Bang_QR_${(animal ? animal.name : 'animal').replace(/\s+/g, '_')}.png`;

  const link = document.createElement('a');
  link.href = src;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast(`Đã tải biển bảng mã QR: ${fileName}`);
}

function printSingleSignage() {
  window.print();
}

function printAllSignageBatch() {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Trình duyệt đã chặn cửa sổ pop-up in!', 'error');
    return;
  }

  const platesHtml = adminAnimals.map(a => {
    const qrUrl = `${window.location.origin}${window.location.pathname.replace('admin.html', 'index.html')}?animalId=${a.id}`;
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
    
    return `
      <div style="page-break-after: always; width: 100%; max-width: 480px; margin: 40px auto; padding: 32px; border: 4px solid #059669; border-radius: 24px; text-align: center; font-family: 'Be Vietnam Pro', sans-serif; background: #064e3b; color: white;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px;">
          <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">🐾</div>
          <div style="text-align: left;">
            <div style="font-weight: 900; font-size: 13px; text-transform: uppercase;">Thảo Cầm Viên Sài Gòn</div>
            <div style="font-size: 9px; color: #6ee7b7; text-transform: uppercase;">Hệ Thống Thuyết Minh Tự Động</div>
          </div>
        </div>
        <div style="margin: 16px 0;">
          <div style="font-size: 26px; font-weight: 900;">${a.name}</div>
          <div style="font-size: 13px; font-style: italic; color: #a7f3d0; margin-top: 4px;">${a.scientificName || ''}</div>
          <div style="font-size: 11px; margin-top: 6px; color: #d1fae5;">${a.zone || ''}</div>
        </div>
        <div style="background: white; padding: 16px; border-radius: 16px; display: inline-block; margin: 16px 0;">
          <img src="${qrImgSrc}" style="width: 180px; height: 180px; display: block;" alt="QR" />
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #a7f3d0; margin-top: 8px;">📷 Mở Camera hoặc Zalo để quét mã</div>
        <div style="font-size: 10px; color: #d1fae5; margin-top: 4px;">Tự động phát audio thuyết minh đa ngôn ngữ</div>
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 14px;">
          🇻🇳 🇬🇧 🇰🇷 🇯🇵 🇨🇳
        </div>
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>In Hàng Loạt Biển Bảng QR Thảo Cầm Viên</title>
      <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; background: #f8fafc; }
        @media print {
          body { background: transparent; }
        }
      </style>
    </head>
    <body>
      ${platesHtml}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ----------------------------------------------------
// 9. EVENT LISTENERS INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadAdminData();
  populateZoneDropdowns();
  updateAddLivePreview();
  renderCatalogTable();

  // Tab button events
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchAdminTab(tab);
    });
  });

  // Form Add Animal
  const formAdd = document.getElementById('form-add-animal');
  if (formAdd) {
    formAdd.addEventListener('submit', handleAddAnimalSubmit);
  }

  // Form Edit Animal
  const formEdit = document.getElementById('form-edit-animal');
  if (formEdit) {
    formEdit.addEventListener('submit', handleEditAnimalSubmit);
  }

  // Logout button
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi Cổng Quản Trị?')) {
        window.location.href = 'index.html';
      }
    });
  }

  // Initial tab
  switchAdminTab('add');
});
