import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

// Ranh giới thực tế khuôn viên Vườn Thú (WGS-84 Coordinates Polygon)
export const ZOO_BOUNDARY_POLYGON = [
  [10.7860, 106.7049], // Phía Đền Hùng / Nguyễn Bỉnh Khiêm
  [10.7868, 106.7038], // Cổng chính số 2 Nguyễn Bỉnh Khiêm
  [10.7884, 106.7036], // Góc Nguyễn Bỉnh Khiêm - Nguyễn Thị Minh Khai
  [10.7892, 106.7043], // Cầu Thị Nghè 1
  [10.7896, 106.7053], // Bờ kênh Nhiêu Lộc - Thị Nghè (Bắc)
  [10.7893, 106.7064], // Bờ kênh Nhiêu Lộc - Thị Nghè (Đông Bắc)
  [10.7884, 106.7071], // Bờ kênh Nhiêu Lộc - Thị Nghè (Đông)
  [10.7872, 106.7070], // Bờ kênh góc Đông Nam
  [10.7863, 106.7064], // Nguyễn Hữu Cảnh
  [10.7858, 106.7055], // Góc Nguyễn Bỉnh Khiêm - Nguyễn Hữu Cảnh
  [10.7860, 106.7049]  // Khép kín vòng
];

// Hàm kiểm tra tọa độ có nằm trong khuôn viên Vườn Thú hay không (Point-in-Polygon Ray Casting)
export function isPointInsideZoo(lat, lon) {
  const vs = ZOO_BOUNDARY_POLYGON;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > lon) !== (yj > lon))
        && (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function RealZooMap({
  animals,
  selectedAnimal,
  onSelectAnimal,
  userLocation,
  setUserLocation,
  navigationTarget,
  tourState,
  onStartTour,
  onPauseTour,
  onResumeTour,
  onSkipTourStop,
  onStopTour,
  onStartNavigation,
  onCancelNavigation,
  showToast,
  tourLang,
  setTourLang,
  handleSpeech,
  isSpeaking,
  calculateDistance,
  onGetLiveGPS,
  isLocating,
  onWalkToAnimal
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const animalsLayerRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const [tileMode, setTileMode] = useState('roadmap'); // 'roadmap' | 'satellite' | 'voyager'

  // Map Tile configuration (Google Maps & CartoDB tiles)
  const TILE_CONFIG = {
    roadmap: {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attr: '&copy; Google Maps | Sở Thú'
    },
    satellite: {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attr: '&copy; Google Hybrid Satellite | Sở Thú'
    },
    voyager: {
      url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attr: '&copy; CartoDB &copy; OpenStreetMap contributors'
    }
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [10.7876, 106.7052],
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      maxBounds: [
        [10.7830, 106.7010],
        [10.7925, 106.7095]
      ],
      maxBoundsViscosity: 0.85,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const initialTile = TILE_CONFIG[tileMode];
    tileLayerRef.current = L.tileLayer(initialTile.url, {
      maxZoom: 20,
      attribution: initialTile.attr
    }).addTo(map);

    // Render Zoo Boundary Polygon (Ranh giới khuôn viên Vườn Thú)
    boundaryLayerRef.current = L.polygon(ZOO_BOUNDARY_POLYGON, {
      color: '#059669',
      weight: 3,
      dashArray: '8, 6',
      fillColor: '#10b981',
      fillOpacity: 0.08,
      smoothFactor: 1
    }).addTo(map);

    boundaryLayerRef.current.bindTooltip("Ranh Giới Vườn Thú (Tất cả địa điểm động vật nằm trọn bên trong)", {
      permanent: false,
      direction: 'center',
      className: 'zoo-boundary-tooltip'
    });

    animalsLayerRef.current = L.layerGroup().addTo(map);

    // Click anywhere on map to reposition user (when not on auto tour)
    map.on('click', (e) => {
      if (tourState?.isActive) return;
      const { lat, lng } = e.latlng;
      const isInside = isPointInsideZoo(lat, lng);
      if (!isInside) {
        showToast("LƯU Ý: Vị trí phải nằm trong ranh giới Vườn Thú!", "warning");
        return;
      }
      setUserLocation(prev => ({
        ...prev,
        lat: parseFloat(lat.toFixed(6)),
        lon: parseFloat(lng.toFixed(6)),
        label: `Tọa độ [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
        isRealGPS: false
      }));
      showToast(`Đã chuyển vị trí đến [${lat.toFixed(4)}, ${lng.toFixed(4)}]`, "info");
    });

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Change Tile Layer
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const tile = TILE_CONFIG[tileMode];
    tileLayerRef.current = L.tileLayer(tile.url, {
      maxZoom: 20,
      attribution: tile.attr
    }).addTo(mapRef.current);
  }, [tileMode]);

  // 3. Render Animal Enclosures & Geofence Circles
  useEffect(() => {
    if (!mapRef.current || !animalsLayerRef.current) return;

    animalsLayerRef.current.clearLayers();

    animals.forEach((animal, index) => {
      const isSelected = selectedAnimal?.id === animal.id;
      const isTourTarget = tourState?.isActive && tourState?.currentStopIndex === index;
      const isNavTarget = navigationTarget?.id === animal.id;
      const isHighlighted = isSelected || isTourTarget || isNavTarget;

      // Geofence Circle
      const circle = L.circle([animal.coordinates.lat, animal.coordinates.lon], {
        color: isHighlighted ? '#059669' : '#64748b',
        fillColor: isHighlighted ? '#10b981' : (animal.color || '#059669'),
        fillOpacity: isHighlighted ? 0.32 : 0.14,
        weight: isHighlighted ? 2.5 : 1.2,
        dashArray: isHighlighted ? '6, 6' : undefined,
        radius: animal.radius_meters
      });
      animalsLayerRef.current.addLayer(circle);

      // Clean Numbered Marker Badge (No unnecessary cartoon emojis)
      const iconHtml = `
        <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -50%); cursor: pointer;">
          ${isTourTarget ? '<div class="tour-pulse-ring" style="position:absolute;inset:-6px;border-radius:50%;background:rgba(5,150,105,0.45);animation:tour-ping 1.6s infinite;"></div>' : ''}
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: ${isHighlighted ? '#059669' : (animal.color || '#1e293b')};
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 800;
            border: 2.5px solid #ffffff;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            transition: transform 0.2s;
          ">${index + 1}</div>
          <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            background: ${isHighlighted ? '#064e3b' : 'rgba(15,23,42,0.9)'};
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 5px;
            border: 1px solid ${isHighlighted ? '#34d399' : 'rgba(255,255,255,0.2)'};
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            pointer-events: none;
          ">
            ${animal.name}
          </div>
        </div>
      `;

      const marker = L.marker([animal.coordinates.lat, animal.coordinates.lon], {
        icon: L.divIcon({
          className: 'custom-animal-marker',
          html: iconHtml,
          iconSize: [36, 36],
          iconAnchor: [0, 0]
        }),
        zIndexOffset: isHighlighted ? 500 : 100
      });

      marker.on('click', () => {
        onSelectAnimal(animal);
        if (mapRef.current) {
          mapRef.current.panTo([animal.coordinates.lat, animal.coordinates.lon], { animate: true });
        }
      });

      // Clean Popup Content với Nút Đi Thử
      const popupHtml = `
        <div style="font-family: inherit; width: 220px; padding: 4px;">
          <div style="margin-bottom:6px;">
            <h4 style="margin:0;font-size:14px;font-weight:800;color:#0f172a;">${animal.name}</h4>
            <p style="margin:2px 0 0;font-size:11px;color:#64748b;font-style:italic;">${animal.scientificName}</p>
          </div>
          <img src="${animal.imageUrl}" alt="${animal.name}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
          <div style="font-size:11px;color:#334155;margin-bottom:6px;line-height:1.5;">
            <div><strong>Phân khu:</strong> ${animal.zone}</div>
            <div><strong>Bán kính Geofence:</strong> ${animal.radius_meters} mét</div>
          </div>
          <button
            type="button"
            onclick="window.__walkToAnimal && window.__walkToAnimal('${animal.id}')"
            style="
              width: 100%;
              background: #059669;
              color: #ffffff;
              border: none;
              padding: 8px 12px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              box-shadow: 0 3px 8px rgba(5,150,105,0.35);
            "
          >
            <span>🚶</span>
            <span>Hình Người Đi Thử Đến Đây</span>
          </button>
        </div>
      `;
      marker.bindPopup(popupHtml);

      if (isTourTarget && tourState?.phase === 'narrating') {
        setTimeout(() => marker.openPopup(), 100);
      }

      animalsLayerRef.current.addLayer(marker);
    });

    // Expose global handler for popup button clicks
    window.__walkToAnimal = (animalId) => {
      const an = animals.find(a => a.id === animalId);
      if (an && onWalkToAnimal) {
        onWalkToAnimal(an);
      }
    };
  }, [animals, selectedAnimal, navigationTarget, tourState, onWalkToAnimal]);

  // 4. GPS Location Marker - Hình Người Đi Thử / Du Khách (Human Pedestrian Walking Avatar)
  useEffect(() => {
    if (!mapRef.current) return;

    const isTouring = tourState?.isActive;
    const userHtml = `
      <div style="position: relative; width: 44px; height: 58px; display: flex; flex-direction: column; align-items: center; user-select: none;">
        <!-- Status Label Badge Above Head -->
        <div style="
          position: absolute;
          top: -24px;
          white-space: nowrap;
          background: ${isTouring ? '#064e3b' : '#1e3a8a'};
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 12px;
          border: 1.5px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 10;
        ">
          <span style="
            display: inline-block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: ${isTouring ? '#34d399' : '#60a5fa'};
            ${isTouring ? 'animation: tour-ping 1.2s infinite;' : ''}
          "></span>
          <span>${isTouring ? 'Tôi (Đang đi thử...)' : 'Vị Trí Của Tôi'}</span>
        </div>

        <!-- Radar Pulse on Ground beneath Feet -->
        <div class="foot-pulse" style="
          position: absolute;
          bottom: -2px;
          width: 32px;
          height: 14px;
          border-radius: 50%;
          background: ${isTouring ? 'rgba(16,185,129,0.5)' : 'rgba(37,99,235,0.4)'};
          pointer-events: none;
        "></div>

        <!-- Person Walking Avatar Circle -->
        <div class="${isTouring ? 'person-walking' : ''}" style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${isTouring ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'};
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        ">
          <!-- SVG Human Pedestrian Figure (Hình Người Đi Bộ) -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" style="overflow: visible;">
            <!-- Head -->
            <circle cx="12" cy="4" r="2.8"/>
            <!-- Walking Body with Arms & Striding Legs -->
            <path d="M13.5 8.5c-.4-.3-.9-.5-1.5-.5s-1.1.2-1.5.5L7.2 11.2c-.4.3-.5.8-.3 1.2.3.4.8.5 1.2.3L11 11V15l-3.2 4.2c-.3.4-.2 1 .2 1.3.4.3 1 .2 1.3-.2L13 15.5V21c0 .6.4 1 1 1s1-.4 1-1v-6.5l-2-2.3V10.2l2.3 1.5c.4.3 1 .1 1.3-.3.3-.4.1-1-.3-1.3l-2.8-1.6z"/>
          </svg>
        </div>

        <!-- Downward Pointer Arrow Pin to Ground GPS Point -->
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${isTouring ? '#047857' : '#1d4ed8'};
          margin-top: -3px;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
          z-index: 6;
        "></div>
      </div>
    `;

    const latLng = [userLocation.lat, userLocation.lon];

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(latLng, {
        icon: L.divIcon({
          className: 'custom-user-marker',
          html: userHtml,
          iconSize: [44, 58],
          iconAnchor: [22, 58]
        }),
        zIndexOffset: 1000
      }).addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLatLng(latLng);
      userMarkerRef.current.setIcon(L.divIcon({
        className: 'custom-user-marker',
        html: userHtml,
        iconSize: [44, 58],
        iconAnchor: [22, 58]
      }));
    }

    if (tourState?.isActive) {
      mapRef.current.panTo(latLng, { animate: true, duration: 0.6 });
    }
  }, [userLocation.lat, userLocation.lon, tourState?.isActive, tourState?.phase]);

  // 5. Route Polyline
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    let targetCoords = null;
    let lineColor = '#2563eb';

    if (tourState?.isActive) {
      const curAnimal = animals[tourState.currentStopIndex];
      if (curAnimal) {
        targetCoords = [curAnimal.coordinates.lat, curAnimal.coordinates.lon];
        lineColor = '#059669';
      }
    } else if (navigationTarget) {
      targetCoords = [navigationTarget.coordinates.lat, navigationTarget.coordinates.lon];
      lineColor = '#2563eb';
    }

    if (targetCoords) {
      const latlngs = [
        [userLocation.lat, userLocation.lon],
        targetCoords
      ];
      routeLineRef.current = L.polyline(latlngs, {
        color: lineColor,
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(mapRef.current);
    }
  }, [userLocation, navigationTarget, tourState?.isActive, tourState?.currentStopIndex]);

  const currentStopAnimal = tourState?.isActive ? animals[tourState.currentStopIndex] : null;
  const tourPercent = tourState?.isActive
    ? Math.round(((tourState.currentStopIndex + (tourState.phase === 'narrating' ? 1 : 0.5)) / animals.length) * 100)
    : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.55fr', gap: '20px', alignItems: 'start' }}>
      <style>{`
        @keyframes personWalkBob {
          0% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
          100% { transform: translateY(0) rotate(-3deg); }
        }
        .person-walking {
          animation: personWalkBob 0.45s ease-in-out infinite alternate;
        }
        @keyframes footPulseEffect {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .foot-pulse {
          animation: footPulseEffect 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .custom-user-marker, .custom-animal-marker, .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      
      {/* Left Column: Map & Tour Control Center */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Map Header & Layer Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                Bản Đồ Thực Tế Sở Thú
              </h3>
              <span style={{ backgroundColor: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                Live GPS WGS-84
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              Tọa độ thực tế: 10.7876°N, 106.7052°E • Nhấp chuột lên bản đồ để thay đổi vị trí của bạn
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: '#047857', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                Đường viền xanh nét đứt: Ranh giới Vườn Thú (100% động vật nằm trọn bên trong)
              </span>
            </div>
          </div>

          {/* Clean Map Layer Mode & Bounds Button */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.fitBounds(ZOO_BOUNDARY_POLYGON, { padding: [35, 35] });
                  showToast("Đã căn chỉnh góc nhìn khớp trọn vẹn ranh giới Vườn Thú", "info");
                }
              }}
              title="Căn chỉnh bản đồ khớp trọn vẹn ranh giới Vườn Thú"
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid #10b981',
                cursor: 'pointer',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                transition: 'all 0.2s'
              }}
            >
              Khớp Ranh Giới
            </button>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setTileMode('roadmap')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tileMode === 'roadmap' ? '#059669' : 'transparent',
                color: tileMode === 'roadmap' ? '#ffffff' : '#475569',
                transition: 'all 0.2s'
              }}
            >
              Đường Phố
            </button>
            <button
              type="button"
              onClick={() => setTileMode('satellite')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tileMode === 'satellite' ? '#059669' : 'transparent',
                color: tileMode === 'satellite' ? '#ffffff' : '#475569',
                transition: 'all 0.2s'
              }}
            >
              Vệ Tinh
            </button>
            <button
              type="button"
              onClick={() => setTileMode('voyager')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tileMode === 'voyager' ? '#059669' : 'transparent',
                color: tileMode === 'voyager' ? '#ffffff' : '#475569',
                transition: 'all 0.2s'
              }}
            >
              Công Viên
            </button>
          </div>
        </div>
      </div>

        {/* TOUR AUTOMATION HUD PANEL */}
        {tourState?.isActive ? (
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '14px',
            border: '2px solid #10b981',
            boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hành Trình Thuyết Minh Tự Động
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  Điểm {tourState.currentStopIndex + 1}/{animals.length}: {currentStopAnimal?.name}
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  backgroundColor: tourState.phase === 'narrating' ? '#d97706' : '#059669',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {tourState.phase === 'narrating' ? 'Đang thuyết minh' : 'Đang di chuyển...'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#a7f3d0' }}>
                  {tourPercent}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ width: `${tourPercent}%`, height: '100%', backgroundColor: '#34d399', transition: 'width 0.4s ease' }} />
            </div>

            {/* Narration Preview Snippet */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', lineHeight: '1.5', marginBottom: '14px', borderLeft: '3px solid #34d399' }}>
              {tourState.phase === 'narrating' ? (
                <div>
                  <span style={{ color: '#fde047', fontWeight: 'bold' }}>Lời thuyết minh: </span>
                  <span>{currentStopAnimal?.descriptionVi}</span>
                </div>
              ) : (
                <div>
                  Hệ thống đang điều hướng đến chuồng <strong>{currentStopAnimal?.name}</strong>. Khi tới nơi, bài thuyết minh sẽ tự động phát.
                </div>
              )}
            </div>

            {/* Clean HUD Controls */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={tourState.isPaused ? onResumeTour : onPauseTour}
                style={{
                  backgroundColor: tourState.isPaused ? '#059669' : '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {tourState.isPaused ? 'Tiếp Tục' : 'Tạm Dừng'}
              </button>

              <button
                type="button"
                onClick={onSkipTourStop}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Bỏ Qua & Sang Điểm Kế
              </button>

              <button
                type="button"
                onClick={onStopTour}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Dừng Hành Trình
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '14px',
            border: '1px solid #10b981',
            boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 'bold' }}>
                  Hành Trình Thuyết Minh Tự Động Qua Từng Địa Điểm
                </h4>
                <div style={{ fontSize: '12px', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>Vị trí hiện tại của bạn:</span>
                  <strong style={{ color: '#fde047', backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px' }}>
                    {userLocation.label || `[${userLocation.lat}, ${userLocation.lon}]`}
                  </strong>
                </div>
              </div>

              {/* Action Buttons: Get GPS + Start Tour */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onGetLiveGPS}
                  disabled={isLocating}
                  title="Nhận tọa độ GPS thực tế của bạn từ trình duyệt"
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: '1px solid #38bdf8',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: isLocating ? 'wait' : 'pointer',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                    transition: 'all 0.15s'
                  }}
                >
                  {isLocating ? 'Đang dò GPS...' : 'Lấy Vị Trí Của Tôi (GPS)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.flyTo([userLocation.lat, userLocation.lon], 18, { animate: true });
                    }
                  }}
                  title="Xem vị trí người dùng trên bản đồ"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Xem Vị Trí
                </button>

                <button
                  type="button"
                  onClick={onStartTour}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🚶</span>
                  <span>Bắt Đầu Đi Thử (Lần Lượt 8 Điểm)</span>
                </button>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: '#93c5fd', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
              Khi bấm <strong>"Bắt Đầu Đi Thử"</strong>, hình người du khách của bạn sẽ xuất phát từ vị trí hiện tại, di chuyển tuần tự qua 8 phân khu chuồng động vật và tự động phát thuyết minh tiếng Việt tại mỗi điểm.
            </p>
          </div>
        )}

        {/* Quick Travel To Specific Requested Animal ("Đi Thử Đến Điểm Yêu Cầu") */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '11px', color: '#047857', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🚶</span> <strong>Đi thử đến điểm yêu cầu:</strong>
          </span>
          {animals.map((an, idx) => (
            <button
              key={an.id}
              type="button"
              onClick={() => {
                if (onWalkToAnimal) onWalkToAnimal(an);
              }}
              title={`Hình người đi thử ngay đến chuồng ${an.name}`}
              style={{
                backgroundColor: selectedAnimal?.id === an.id ? '#059669' : '#ffffff',
                color: selectedAnimal?.id === an.id ? '#ffffff' : '#047857',
                border: '1px solid #86efac',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.15s'
              }}
            >
              <span>🚶</span>
              <span>{idx + 1}. {an.name}</span>
            </button>
          ))}
        </div>

        {/* Real Leaflet Map Container */}
        <div
          ref={mapContainerRef}
          style={{
            height: '560px',
            width: '100%',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2px solid #059669',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 1
          }}
        />

        {/* Quick Departure Point Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>Chọn nhanh điểm xuất phát:</span>
          {[
            { label: 'Cổng Nguyễn Bỉnh Khiêm', lat: 10.7868, lon: 106.7040 },
            { label: 'Cổng Nguyễn Thị Minh Khai', lat: 10.7882, lon: 106.7039 },
            { label: 'Cầu Thị Nghè (Góc Vườn Thú)', lat: 10.7886, lon: 106.7065 },
            { label: 'Đền Thờ Vua Hùng', lat: 10.7863, lon: 106.7046 },
            { label: 'Hồ Sen & Đảo Linh Trưởng', lat: 10.7875, lon: 106.7055 }
          ].map((pt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUserLocation({
                  lat: pt.lat,
                  lon: pt.lon,
                  label: pt.label,
                  isRealGPS: false
                });
                if (mapRef.current) {
                  mapRef.current.panTo([pt.lat, pt.lon], { animate: true });
                }
                showToast(`Đã đặt điểm xuất phát: ${pt.label}`, "info");
              }}
              style={{
                backgroundColor: (userLocation.lat === pt.lat && userLocation.lon === pt.lon) ? '#059669' : '#f1f5f9',
                color: (userLocation.lat === pt.lat && userLocation.lon === pt.lon) ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {pt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onGetLiveGPS}
            disabled={isLocating}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: isLocating ? 'wait' : 'pointer'
            }}
          >
            {isLocating ? 'Đang dò GPS...' : 'GPS Trực Tiếp'}
          </button>
        </div>
      </div>

      {/* Right Column: Selected Animal Info & Actions */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
        <span style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
          {selectedAnimal.zone}
        </span>

        <h3 style={{ margin: '8px 0 2px', fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
          {selectedAnimal.name}
        </h3>
        <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
          {selectedAnimal.scientificName}
        </p>

        <img
          src={selectedAnimal.imageUrl}
          alt={selectedAnimal.name}
          style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px', border: '1px solid #e2e8f0' }}
        />

        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '11px', color: '#475569', marginBottom: '12px', lineHeight: '1.6' }}>
          <div><strong>Tọa độ GPS:</strong> {selectedAnimal.coordinates.lat}°N, {selectedAnimal.coordinates.lon}°E</div>
          <div><strong>Bán kính Geofence:</strong> {selectedAnimal.radius_meters}m</div>
          <div><strong>Sách Đỏ IUCN:</strong> {selectedAnimal.conservationStatus}</div>
          <div><strong>Chế độ ăn:</strong> {selectedAnimal.diet}</div>
          <div><strong>Khoảng cách:</strong> <strong style={{ color: '#2563eb' }}>{calculateDistance(userLocation.lat, userLocation.lon, selectedAnimal.coordinates.lat, selectedAnimal.coordinates.lon)}m</strong></div>
        </div>

        {/* Action: Hình người đi thử đến chuồng này */}
        <button
          type="button"
          onClick={() => {
            if (onWalkToAnimal) onWalkToAnimal(selectedAnimal);
          }}
          style={{
            width: '100%',
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '12px 14px',
            borderRadius: '10px',
            border: 'none',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
            transition: 'all 0.15s'
          }}
        >
          <span style={{ fontSize: '18px' }}>🚶</span>
          <span>Hình Người Đi Thử Đến {selectedAnimal.name}</span>
        </button>

        {/* Action: Dẫn đường */}
        <button
          type="button"
          onClick={() => {
            if (navigationTarget && navigationTarget.id === selectedAnimal.id) {
              onCancelNavigation();
            } else {
              onStartNavigation(selectedAnimal);
            }
          }}
          style={{
            width: '100%',
            backgroundColor: (navigationTarget && navigationTarget.id === selectedAnimal.id) ? '#dc2626' : '#2563eb',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {(navigationTarget && navigationTarget.id === selectedAnimal.id) ? 'Hủy Dẫn Đường' : 'Dẫn Đường Đến Chuồng Này'}
        </button>

        {/* Narration Description Text */}
        <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
          <strong>Bài Thuyết Minh:</strong>
          <p style={{ margin: '4px 0 0' }}>{selectedAnimal.descriptionVi}</p>
        </div>

        {/* Action: Nghe Thuyết Minh */}
        <button
          type="button"
          onClick={() => handleSpeech(selectedAnimal.descriptionVi)}
          style={{
            width: '100%',
            backgroundColor: isSpeaking ? '#dc2626' : '#059669',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          {isSpeaking ? 'Dừng Phát Âm' : 'Nghe Bài Thuyết Minh'}
        </button>
      </div>

    </div>
  );
}
