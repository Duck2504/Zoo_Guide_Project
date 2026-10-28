import { useVisitor } from '../../context/VisitorContext';

const translations = {
  vi: 'Bản đồ Leaflet đang được tích hợp...',
  en: 'Leaflet map is being integrated...',
  ko: 'Leaflet 지도가 통합 중입니다...',
  ja: 'Leafletマップを統合中です...',
  zh: '正在集成Leaflet地图...'
};

export default function Map() {
  const { language } = useVisitor();
  const text = translations[language] || translations['vi'];

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 p-6 text-center">
      <h2 className="text-lg font-bold text-gray-400">
        <i className="fa-solid fa-map-location-dot mr-2"></i> 
        {text}
      </h2>
    </div>
  );
}