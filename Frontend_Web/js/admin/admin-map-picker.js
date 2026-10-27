/**
 * Admin Map Picker Controller
 * Allows clicking on map to set coordinates and adjusts Geofence radius slider (PRD FR-12)
 */
import { CONFIG } from '../config.js';

class AdminMapPicker {
  constructor() {
    this.map = null;
    this.marker = null;
    this.circle = null;
    this.overviewMap = null;
    this.overviewLayers = [];
  }

  initPickerMap(containerId = 'admin-picker-map') {
    const el = document.getElementById(containerId);
    if (!el || this.map) return;

    this.map = L.map(containerId, {
      center: CONFIG.MAP.CENTER,
      zoom: 17,
    });

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    }).addTo(this.map);

    const defaultLat = 10.7876;
    const defaultLng = 106.7056;
    const defaultRadius = 25;

    this.marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(this.map);
    this.circle = L.circle([defaultLat, defaultLng], {
      radius: defaultRadius,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(this.map);

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.setCoordinates(lng, lat);
    });

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.setCoordinates(pos.lng, pos.lat);
    });

    const radiusInput = document.getElementById('c-radius');
    if (radiusInput) {
      this.setRadius(Number(radiusInput.value));
      radiusInput.addEventListener('input', () => {
        this.setRadius(Number(radiusInput.value));
      });
    }

    const syncCoordinatesFromInputs = () => {
      const latValue = document.getElementById('c-latitude')?.value.trim();
      const lngValue = document.getElementById('c-longitude')?.value.trim();
      if (!latValue || !lngValue) return;

      const lat = Number(latValue);
      const lng = Number(lngValue);
      if (Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
          Number.isFinite(lng) && lng >= -180 && lng <= 180) {
        this.setCoordinates(lng, lat);
      }
    };

    document.getElementById('c-latitude')?.addEventListener('change', syncCoordinatesFromInputs);
    document.getElementById('c-longitude')?.addEventListener('change', syncCoordinatesFromInputs);

    this.setCoordinates(defaultLng, defaultLat);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  setCoordinates(lng, lat) {
    if (this.marker) this.marker.setLatLng([lat, lng]);
    if (this.circle) this.circle.setLatLng([lat, lng]);
    if (this.map) this.map.panTo([lat, lng]);

    const latInp = document.getElementById('c-latitude');
    const lngInp = document.getElementById('c-longitude');
    if (latInp) latInp.value = lat.toFixed(6);
    if (lngInp) lngInp.value = lng.toFixed(6);
  }

  setRadius(radiusMeters) {
    if (this.circle) {
      this.circle.setRadius(radiusMeters);
    }
    const radText = document.getElementById('c-radius-value');
    if (radText) radText.innerText = `${radiusMeters} mét`;
  }

  initOverviewMap(containerId = 'admin-overview-map', zones = []) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!this.overviewMap) {
      this.overviewMap = L.map(containerId, {
        center: CONFIG.MAP.CENTER,
        zoom: 17,
      });

      L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps',
      }).addTo(this.overviewMap);
    }

    // Clear old layers
    this.overviewLayers.forEach(l => {
      try { this.overviewMap.removeLayer(l); } catch (_) {}
    });
    this.overviewLayers = [];

    zones.forEach(z => {
      if (!z.latitude || !z.longitude) return;
      const c = L.circle([z.latitude, z.longitude], {
        radius: z.radius || 25,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(this.overviewMap);
      this.overviewLayers.push(c);

      const m = L.marker([z.latitude, z.longitude])
        .addTo(this.overviewMap)
        .bindPopup(`<b>${z.zoneCode}</b><br>Bán kính: ${z.radius}m`);
      this.overviewLayers.push(m);
    });

    setTimeout(() => {
      this.overviewMap.invalidateSize();
    }, 200);
  }
}

export const adminMapPicker = new AdminMapPicker();
