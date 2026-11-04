// src/components/GeofenceController.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../hooks/useGeolocation';
import { findEnteredAnimal } from '../utils/geoUtils';
import { API } from '../config';

// Chỉ chứa logic theo dõi GPS; nút bật/tắt nằm ở header của VisitorLayout. Luôn được mount để không mất trạng thái khi đổi trang.
export default function GeofenceController({ enabled }) {
  const navigate = useNavigate();
  const { location } = useGeolocation(enabled);
  const [animals, setAnimals] = useState([]);

  // Lưu các khu đã mở trong phiên để chống lặp (US-05)
  const playedZones = useRef(new Set());

  // Lấy danh sách động vật (kèm tọa độ + bán kính khu) một lần khi bật tự động
  useEffect(() => {
    if (!enabled || animals.length > 0) return;
    fetch(`${API}/api/animals`)
      .then(res => (res.ok ? res.json() : []))
      .then(setAnimals)
      .catch(err => console.error("Không tải được danh sách khu:", err));
  }, [enabled, animals.length]);

  useEffect(() => {
    if (!location || animals.length === 0) return;
    const animal = findEnteredAnimal(location, animals, playedZones.current);
    if (!animal) return;

    playedZones.current.add(animal.zoneId);
    // Trình duyệt chặn tự phát âm thanh khi chưa chạm, nên mở trang con vật để du khách bấm nghe
    navigate(`/a/${animal.id}?source=geo`);
  }, [location, animals, navigate]);

  return null;
}
