/**
 * Leaflet Map Controller for Visitor Experience
 */
import { CONFIG, UI_TRANSLATIONS } from '../config.js';
import { visitorState } from './visitor-state.js';

class VisitorMap {
  constructor() {
    this.map = null;
    this.tileLayer = null;
    this.markers = [];
    this.circles = [];
    this.gateMarkers = [];
    this.touristMarker = null;
    this.onSelectAnimal = null;
  }

  getTileUrl(mapType, lang) {
    const lyrs = mapType === 'satellite' ? 'y' : 'm';
    return `https://mt{s}.google.com/vt/lyrs=${lyrs}&hl=${lang || 'vi'}&x={x}&y={y}&z={z}`;
  }

  init(containerId, onSelectAnimal) {
    this.onSelectAnimal = onSelectAnimal;
    const { mapType, currentLanguage } = visitorState.get();

    this.map = L.map(containerId, {
      center: CONFIG.MAP.CENTER,
      zoom: CONFIG.MAP.ZOOM,
      zoomControl: false,
    });

    // Add Tile Layer
    this.tileLayer = L.tileLayer(this.getTileUrl(mapType, currentLanguage), {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: CONFIG.MAP.MAX_ZOOM,
      minZoom: CONFIG.MAP.MIN_ZOOM,
      attribution: '&copy; Google Maps & Thảo Cầm Viên Sài Gòn',
    }).addTo(this.map);

    // Initial Gates
    this.renderGates();

    // Initial Tourist Location Marker
    const touristIcon = L.divIcon({
      className: 'tourist-pin',
      html: `
        <div class="tourist-pulse" style="background:#1a73e8;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:14px;">
          📍
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    this.touristMarker = L.marker([10.7876, 106.7042], { icon: touristIcon }).addTo(this.map);

    // Click anywhere on map to simulate walking to that location
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.updateTouristPosition(lat, lng);
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  setMapType(type) {
    const { currentLanguage } = visitorState.get();
    visitorState.set({ mapType: type });
    if (this.tileLayer) {
      this.tileLayer.setUrl(this.getTileUrl(type, currentLanguage));
    }
  }

  updateLanguage(lang) {
    const { mapType } = visitorState.get();
    if (this.tileLayer) {
      this.tileLayer.setUrl(this.getTileUrl(mapType, lang));
    }
    this.renderGates();
  }

  renderGates() {
    if (!this.map) return;
    this.gateMarkers.forEach((m) => {
      try {
        this.map.removeLayer(m);
      } catch (_) {}
    });
    this.gateMarkers = [];

    const { currentLanguage } = visitorState.get();
    const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.vi;

    CONFIG.GATES.forEach((g) => {
      const gateName = g.name[currentLanguage] || g.name.vi;
      const gateDesc = g.desc[currentLanguage] || g.desc.vi;

      const gateIcon = L.divIcon({
        className: 'gate-pin',
        html: `
          <div style="background:#0f172a;color:#f8fafc;padding:5px 10px;border-radius:14px;font-size:11px;font-weight:800;border:2px solid #38bdf8;box-shadow:0 4px 10px rgba(0,0,0,0.4);white-space:nowrap;display:flex;align-items:center;gap:4px;">
            🚪 ${gateName}
          </div>
        `,
        iconSize: [150, 28],
        iconAnchor: [75, 14],
      });

      const m = L.marker(g.coords, { icon: gateIcon })
        .addTo(this.map)
        .bindPopup(`<b>${gateName}</b><br><span style="font-size:12px;color:#64748b;">${gateDesc}</span>`);
      this.gateMarkers.push(m);
    });
  }

  renderAnimals(animals) {
    if (!this.map) return;

    // Clear existing markers and circles
    this.markers.forEach((m) => {
      try {
        this.map.removeLayer(m);
      } catch (_) {}
    });
    this.markers = [];

    this.circles.forEach((c) => {
      try {
        this.map.removeLayer(c);
      } catch (_) {}
    });
    this.circles = [];

    animals.forEach((animal) => {
      if (!animal.coords || animal.coords.length < 2) return;

      const color = animal.color || '#059669';
      const radius = animal.radius || CONFIG.GEOFENCE.DEFAULT_RADIUS_METERS;

      // Draw Geofence Radius Circle
      const circle = L.circle(animal.coords, {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(this.map);
      this.circles.push(circle);

      // Draw Animal Marker
      const pinIcon = L.divIcon({
        className: 'gmap-pin',
        html: `
          <div style="background:${color};color:white;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:900;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2px solid white;display:flex;align-items:center;gap:5px;">
            <span>${animal.icon || '🐾'}</span> <span>${animal.name}</span>
          </div>
        `,
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });

      const marker = L.marker(animal.coords, { icon: pinIcon }).addTo(this.map);
      marker.on('click', () => {
        if (this.onSelectAnimal) {
          this.onSelectAnimal(animal);
        }
      });
      this.markers.push(marker);
    });
  }

  updateTouristPosition(lat, lng) {
    if (this.touristMarker) {
      this.touristMarker.setLatLng([lat, lng]);
    }
    visitorState.set({ userLocation: [lat, lng] });
  }

  flyTo(coords, zoom = 18) {
    if (this.map && coords) {
      this.map.flyTo(coords, zoom, { duration: 1.2 });
    }
  }

  resetView() {
    this.flyTo(CONFIG.MAP.CENTER, CONFIG.MAP.ZOOM);
  }
}

export const visitorMap = new VisitorMap();
