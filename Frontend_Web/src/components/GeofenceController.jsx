// src/components/GeofenceController.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../hooks/useGeolocation';
import { findEnteredAnimal } from '../utils/geoUtils';
import { API } from '../config';

export default function GeofenceController() {
  const navigate = useNavigate();
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  const { location } = useGeolocation(isAutoPlayEnabled);
  const [animals, setAnimals] = useState([]);

  // Lưu các khu đã mở trong phiên để chống lặp (US-05)
  const playedZones = useRef(new Set());

  // Lấy danh sách động vật (kèm tọa độ + bán kính khu) một lần khi bật tự động
  useEffect(() => {
    if (!isAutoPlayEnabled || animals.length > 0) return;
    fetch(`${API}/api/animals`)
      .then(res => (res.ok ? res.json() : []))
      .then(setAnimals)
      .catch(err => console.error("Không tải được danh sách khu:", err));
  }, [isAutoPlayEnabled, animals.length]);

  useEffect(() => {
    if (!location || animals.length === 0) return;
    const animal = findEnteredAnimal(location, animals, playedZones.current);
    if (!animal) return;

    playedZones.current.add(animal.zoneId);
    // Trình duyệt chặn tự phát âm thanh khi chưa chạm, nên mở trang con vật để du khách bấm nghe
    navigate(`/a/${animal.id}?source=geo`);
  }, [location, animals, navigate]);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <button
        onClick={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${isAutoPlayEnabled ? 'bg-zoo-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
        title="Tự động mở thuyết minh theo vị trí"
        aria-label="Tự động mở thuyết minh theo vị trí"
        aria-pressed={isAutoPlayEnabled}
      >
        <i className={`fa-solid ${isAutoPlayEnabled ? 'fa-location-crosshairs animate-pulse' : 'fa-location-arrow'}`}></i>
      </button>
    </div>
  );
}
