import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ZOO_BOUNDARY_POLYGON, isPointInsideZoo } from './RealZooMap.jsx';

export default function RealPickerMap({ formData, setFormData, animals }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const curLat = parseFloat(formData.lat) || 10.7873;
  const curLon = parseFloat(formData.lon) || 106.7055;
  const isInside = isPointInsideZoo(curLat, curLon);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [curLat, curLon],
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      maxBounds: [
        [10.7830, 106.7010],
        [10.7925, 106.7095]
      ],
      maxBoundsViscosity: 0.85,
      zoomControl: true
    });

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps | Sở Thú'
    }).addTo(map);

    // Render Zoo Boundary Polygon
    const boundary = L.polygon(ZOO_BOUNDARY_POLYGON, {
      color: '#059669',
      weight: 2.5,
      dashArray: '8, 6',
      fillColor: '#10b981',
      fillOpacity: 0.08,
      smoothFactor: 1
    }).addTo(map);

    boundary.bindTooltip("Ranh Giới Vườn Thú (Động vật chỉ ở trong phạm vi này)", {
      permanent: false,
      direction: 'center'
    });

    // Reference markers for existing animals
    if (animals && animals.length > 0) {
      animals.forEach((an, idx) => {
        L.circle([an.coordinates.lat, an.coordinates.lon], {
          color: an.color || '#94a3b8',
          fillColor: an.color || '#94a3b8',
          fillOpacity: 0.12,
          radius: an.radius_meters,
          weight: 1
        }).addTo(map);

        const refIcon = L.divIcon({
          className: 'picker-ref-marker',
          html: `<div style="transform:translate(-50%,-50%);background:#ffffff;border:1px solid #cbd5e1;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.15);">${idx + 1}. ${an.name}</div>`,
          iconSize: [20, 20],
          iconAnchor: [0, 0]
        });
        L.marker([an.coordinates.lat, an.coordinates.lon], { icon: refIcon }).addTo(map);
      });
    }

    // Active Draggable Pin Icon
    const pinIcon = L.divIcon({
      className: 'picker-active-pin',
      html: `
        <div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;">
          <div style="background:#dc2626;color:white;font-weight:bold;font-size:11px;padding:3px 8px;border-radius:8px;border:1px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">
            Điểm Ghim Mới
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #dc2626;"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [0, 0]
    });

    const marker = L.marker([curLat, curLon], { draggable: true, icon: pinIcon }).addTo(map);
    const circle = L.circle([curLat, curLon], {
      color: isInside ? '#059669' : '#dc2626',
      fillColor: isInside ? '#10b981' : '#ef4444',
      fillOpacity: 0.25,
      radius: formData.radius || 25,
      weight: 2
    }).addTo(map);

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      circle.setLatLng(pos);
      setFormData(prev => ({
        ...prev,
        lat: pos.lat.toFixed(6),
        lon: pos.lng.toFixed(6)
      }));
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      setFormData(prev => ({
        ...prev,
        lat: e.latlng.lat.toFixed(6),
        lon: e.latlng.lng.toFixed(6)
      }));
    });

    mapRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync external changes
  useEffect(() => {
    if (!markerRef.current || !circleRef.current) return;
    const lat = parseFloat(formData.lat);
    const lon = parseFloat(formData.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      markerRef.current.setLatLng([lat, lon]);
      circleRef.current.setLatLng([lat, lon]);
      circleRef.current.setRadius(formData.radius || 25);
      
      const pointInside = isPointInsideZoo(lat, lon);
      circleRef.current.setStyle({
        color: pointInside ? '#059669' : '#dc2626',
        fillColor: pointInside ? '#10b981' : '#ef4444'
      });
    }
  }, [formData.lat, formData.lon, formData.radius]);

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
      <div
        ref={containerRef}
        style={{
          height: '320px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: isInside ? '2px solid #059669' : '2px solid #dc2626',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      />
      
      {/* Top instruction badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 500,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#065f46',
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        border: '1px solid #cbd5e1'
      }}>
        Nhấp hoặc kéo thả điểm ghim đỏ để định vị chuồng
      </div>

      {/* Boundary validation status badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '10px',
        zIndex: 500,
        backgroundColor: isInside ? 'rgba(236, 253, 245, 0.95)' : 'rgba(254, 242, 242, 0.95)',
        color: isInside ? '#065f46' : '#991b1b',
        border: isInside ? '1px solid #a7f3d0' : '1px solid #fecaca',
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 'bold',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isInside ? '#10b981' : '#ef4444', display: 'inline-block' }}></span>
        {isInside ? 'Tọa độ hợp lệ: Nằm trọn vẹn trong ranh giới Vườn Thú' : 'CẢNH BÁO: Tọa độ nằm ngoài ranh giới Vườn Thú!'}
      </div>

      {/* Button to fit boundary */}
      <button
        type="button"
        onClick={() => {
          if (mapRef.current) {
            mapRef.current.fitBounds(ZOO_BOUNDARY_POLYGON, { padding: [30, 30] });
          }
        }}
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '10px',
          zIndex: 500,
          backgroundColor: '#ffffff',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
          padding: '5px 10px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}
      >
        Khớp Ranh Giới
      </button>
    </div>
  );
}
