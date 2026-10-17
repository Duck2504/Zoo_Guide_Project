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
  calculateDistance
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

      // Clean Popup Content
      const popupHtml = `
        <div style="font-family: inherit; width: 220px; padding: 4px;">
          <div style="margin-bottom:6px;">
            <h4 style="margin:0;font-size:14px;font-weight:800;color:#0f172a;">${animal.name}</h4>
            <p style="margin:2px 0 0;font-size:11px;color:#64748b;font-style:italic;">${animal.scientificName}</p>
          </div>
          <img src="${animal.imageUrl}" alt="${animal.name}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
          <div style="font-size:11px;color:#334155;margin-bottom:4px;line-height:1.5;">
            <div><strong>Phân khu:</strong> ${animal.zone}</div>
            <div><strong>Bán kính Geofence:</strong> ${animal.radius_meters} mét</div>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      if (isTourTarget && tourState?.phase === 'narrating') {
        setTimeout(() => marker.openPopup(), 100);
      }

      animalsLayerRef.current.addLayer(marker);
    });
  }, [animals, selectedAnimal, navigationTarget, tourState]);

  // 4. Clean GPS Location Dot / Vehicle Indicator
  useEffect(() => {
    if (!mapRef.current) return;

    const isTouring = tourState?.isActive;
    const userHtml = `
      <div style="position: relative; width: 38px; height: 38px; transform: translate(-50%, -50%);">
        <div class="tour-pulse-ring" style="
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: ${isTouring ? 'rgba(5,150,105,0.4)' : 'rgba(37,99,235,0.4)'};
          animation: tour-ping 1.8s infinite;
        "></div>
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${isTouring ? '#059669' : '#2563eb'};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        ">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff;"></div>
        </div>
        <div style="
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          background: ${isTouring ? '#064e3b' : '#1e3a8a'};
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        ">
          ${isTouring ? 'Điểm Tham Quan' : 'Vị Trí Của Bạn'}
        </div>
      </div>
    `;

    const latLng = [userLocation.lat, userLocation.lon];

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(latLng, {
        icon: L.divIcon({
          className: 'custom-user-marker',
          html: userHtml,
          iconSize: [38, 38],
          iconAnchor: [0, 0]
        }),
        zIndexOffset: 1000
      }).addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLatLng(latLng);
      userMarkerRef.current.setIcon(L.divIcon({
        className: 'custom-user-marker',
        html: userHtml,
        iconSize: [38, 38],
        iconAnchor: [0, 0]
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
          /* When NOT on tour: Clean Launch Button */
          <div style={{
            background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(6, 95, 70, 0.2)'
          }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 'bold' }}>
                Hành Trình Thuyết Minh Tự Động Qua Từng Địa Điểm
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#a7f3d0' }}>
                Hệ thống sẽ dẫn đường lần lượt qua từng chuồng thú trên bản đồ thực tế và tự động phát thuyết minh tiếng Việt tại mỗi điểm.
              </p>
            </div>

            <button
              type="button"
              onClick={onStartTour}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.15s'
              }}
            >
              Bắt Đầu Hành Trình Tham Quan
            </button>
          </div>
        )}

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
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>Xuất phát từ:</span>
          {[
            { label: 'Cổng Nguyễn Bỉnh Khiêm', lat: 10.7865, lon: 106.7045 },
            { label: 'Cổng Nguyễn Thị Minh Khai', lat: 10.7878, lon: 106.7038 },
            { label: 'Cầu Thị Nghè', lat: 10.7892, lon: 106.7072 },
            { label: 'Đền Thờ Vua Hùng', lat: 10.7860, lon: 106.7048 },
            { label: 'Hồ Sen Trung Tâm', lat: 10.7875, lon: 106.7055 }
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
                showToast(`Đã chọn điểm xuất phát: ${pt.label}`, "info");
              }}
              style={{
                backgroundColor: (userLocation.lat === pt.lat && userLocation.lon === pt.lon) ? '#059669' : '#f1f5f9',
                color: (userLocation.lat === pt.lat && userLocation.lon === pt.lon) ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {pt.label}
            </button>
          ))}
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
