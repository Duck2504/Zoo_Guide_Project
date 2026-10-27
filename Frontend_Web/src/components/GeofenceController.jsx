// src/components/GeofenceController.jsx
import { useEffect, useState, useRef } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { calculateDistance } from '../utils/geoUtils';
import { useVisitor } from '../context/VisitorContext';

export default function GeofenceController() {
  const { language, setIsPlaying } = useVisitor();
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  const { location, error } = useGeolocation(isAutoPlayEnabled);
  
  // Lưu lịch sử các khu vực đã phát để chống lặp (US-05)
  const playedZones = useRef(new Set()); 

  // Giả lập danh sách Zones gọi từ API (GET /api/zones)
  const zones = [
    { id: 1, name: 'Khu Thú Dữ', lat: 10.7875, lng: 106.7053, radiusM: 15 },
    { id: 2, name: 'Khu Linh Trưởng', lat: 10.7880, lng: 106.7060, radiusM: 20 },
  ];

  useEffect(() => {
    if (!location) return;

    zones.forEach(zone => {
      const distance = calculateDistance(location.lat, location.lng, zone.lat, zone.lng);
      
      // Nếu bước vào bán kính và chưa từng phát trong phiên này
      if (distance <= zone.radiusM && !playedZones.current.has(zone.id)) {
        console.log(`Đã vào vùng: ${zone.name}. Khoảng cách: ${distance.toFixed(1)}m`);
        
        // Đánh dấu đã phát để chống lặp
        playedZones.current.add(zone.id);
        
        // Tích hợp logic bật Audio và chuyển hướng tới trang Động vật tại đây
        setIsPlaying(true); 
        alert(`Tự động kích hoạt thuyết minh: ${zone.name} (${language})`);
      }
    });
  }, [location, language, setIsPlaying]);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <button 
        onClick={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${isAutoPlayEnabled ? 'bg-zoo-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
        title="Tự động phát theo vị trí"
      >
        <i className={`fa-solid ${isAutoPlayEnabled ? 'fa-location-crosshairs animate-pulse' : 'fa-location-arrow'}`}></i>
      </button>
    </div>
  );
}