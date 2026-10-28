import { useVisitor } from '../../context/VisitorContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// 1. Fix lỗi mất Icon mặc định của Leaflet khi build bằng Vite
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 2. Từ điển đa ngôn ngữ cho Bản đồ
const translations = {
  vi: {
    zooName: 'Thảo Cầm Viên Sài Gòn',
    predatorZone: 'Khu Thú Dữ (Hổ, Báo)',
    elephantZone: 'Khu Voi Châu Á',
    viewDetail: 'Xem chi tiết',
  },
  en: {
    zooName: 'Saigon Zoo and Botanical Gardens',
    predatorZone: 'Predator Zone (Tigers, Leopards)',
    elephantZone: 'Asian Elephant Zone',
    viewDetail: 'View details',
  },
  ko: {
    zooName: '사이공 동식물원',
    predatorZone: '맹수 구역 (호랑이, 표범)',
    elephantZone: '아시아 코끼리 구역',
    viewDetail: '자세히 보기',
  },
  ja: {
    zooName: 'サイゴン動植物園',
    predatorZone: '猛獣ゾーン (トラ、ヒョウ)',
    elephantZone: 'アジアゾウ ゾーン',
    viewDetail: '詳細を見る',
  },
  zh: {
    zooName: '西贡动植物园',
    predatorZone: '猛兽区 (老虎、豹子)',
    elephantZone: '亚洲象区',
    viewDetail: '查看详情',
  }
};

export default function Map() {
  const { language } = useVisitor();
  const navigate = useNavigate();
  const t = translations[language] || translations['vi'];

  // Tọa độ trung tâm Thảo Cầm Viên
  const centerPosition = [10.7875, 106.7053];

  // Dữ liệu giả lập các khu vực (Sau này lấy từ API /api/zones)
  const zones = [
    { id: 1, name: t.predatorZone, lat: 10.7885, lng: 106.7060, animalId: '1' },
    { id: 2, name: t.elephantZone, lat: 10.7865, lng: 106.7045, animalId: '2' },
  ];

  return (
    <div className="h-full w-full relative z-0">
      {/* Khung bản đồ */}
      <MapContainer 
        center={centerPosition} 
        zoom={17} 
        className="w-full h-full"
        zoomControl={false} // Tắt nút zoom mặc định để tự custom UI gọn hơn nếu cần
      >
        {/* Lớp bản đồ nền (dùng OpenStreetMap miễn phí) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ghim trung tâm Sở Thú */}
        <Marker position={centerPosition} icon={defaultIcon}>
          <Popup>
            <div className="font-bold text-emerald-700 text-sm text-center">
              {t.zooName}
            </div>
          </Popup>
        </Marker>

        {/* Lặp qua các khu vực để cắm cờ (Marker) */}
        {zones.map((zone) => (
          <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={defaultIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-sm mb-2">{zone.name}</p>
                <button 
                  onClick={() => navigate(`/a/${zone.animalId}`)}
                  className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition"
                >
                  {t.viewDetail} <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Lớp phủ Gradient ở trên cùng để làm dịu Header trong suốt */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-[400]"></div>
    </div>
  );
}