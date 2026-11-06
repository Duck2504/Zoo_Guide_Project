import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import { API } from '../../config';
import { groupZones } from '../../utils/geoUtils';
import { getZoneText } from '../../utils/zoneText';

const translations = {
  vi: { title: 'Bản đồ khu', hint: 'Chạm vào một biển trên bản đồ để mở thuyết minh.', listen: 'Nghe thuyết minh', failed: 'Chưa tải được vị trí các khu.', species: n => `${n} loài` },
  en: { title: 'Zone map', hint: 'Tap a sign on the map to open its audio guide.', listen: 'Open audio guide', failed: 'Zone locations could not be loaded.', species: n => `${n} species` },
  ko: { title: '구역 지도', hint: '지도 위 표지판을 눌러 오디오 가이드를 여세요.', listen: '오디오 가이드 열기', failed: '구역 위치를 불러오지 못했습니다.', species: n => `${n}종` },
  ja: { title: 'エリアマップ', hint: 'マップ上の看板をタップして音声ガイドを開きます。', listen: '音声ガイドを開く', failed: 'エリアの位置を読み込めませんでした。', species: n => `${n}種` },
  zh: { title: '区域地图', hint: '点击地图上的标牌打开语音导览。', listen: '打开语音导览', failed: '无法加载区域位置。', species: n => `${n} 种` }
};

// Ghim kiểu biển: ô vuông xanh có chân trụ, hiện số loài trong khu
const signIcon = count => L.divIcon({
  className: '',
  html: `<div style="display:flex;flex-direction:column;align-items:center">
    <div style="display:flex;align-items:center;gap:4px;min-width:40px;height:36px;padding:0 10px;border-radius:12px;background:#15803d;color:#ffffff;font:600 14px 'Be Vietnam Pro',system-ui;box-shadow:0 6px 12px -6px rgb(0 0 0/.5)">
      <i class="fa-solid fa-paw" aria-hidden="true"></i>${count}
    </div>
    <div style="width:4px;height:12px;background:#15803d"></div>
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -44]
});

// Chế độ thử (?demo=1): chạm bản đồ để đặt vị trí, thay cho đi bộ thật trong vườn
function DemoClicks({ onPick }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng, accuracy: 0 }) });
  return null;
}

export default function Map() {
  const { language } = useVisitor();
  const t = translations[language] || translations['vi'];
  const [animals, setAnimals] = useState(null);
  const [searchParams] = useSearchParams();
  const focusZone = searchParams.get('zone'); // mở từ trang con vật: tập trung vào khu của con vật đó
  const demo = searchParams.get('demo') === '1';
  const { geo } = useOutletContext();
  const zt = getZoneText(language);

  useEffect(() => {
    fetch(`${API}/api/animals?lang=${language}`)
      .then(res => (res.ok ? res.json() : 'error'))
      .then(setAnimals)
      .catch(() => setAnimals('error'));
  }, [language]);

  // Mỗi khu một biển (con vật cùng khu dùng chung tọa độ của khu)
  const zones = useMemo(() => (Array.isArray(animals) ? groupZones(animals) : []), [animals]);

  // Khung bản đồ ôm vừa mọi khu; chưa có dữ liệu thì về trung tâm Thảo Cầm Viên
  const focused = zones.find(z => String(z.id) === focusZone);
  const view = focused
    ? { center: [focused.lat, focused.lng], zoom: 18 }
    : zones.length
    ? { bounds: zones.map(z => [z.lat, z.lng]), boundsOptions: { padding: [48, 48], maxZoom: 18 } }
    : { center: [10.7875, 106.7053], zoom: 17 };

  return (
    <div className="relative z-0 h-full w-full">
      <MapContainer key={zones.length} {...view} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map(zone => (
          <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={signIcon(zone.animals.length)} ref={m => { if (m && zone === focused) setTimeout(() => m.openPopup(), 0); }}>
            <Popup>
              <p className="!mb-1.5 !mt-0 text-sm font-semibold text-post">{zone.name}</p>
              <ul className="min-w-44 space-y-1 font-trail">
                {zone.animals.map(a => (
                  <li key={a.id}>
                    <Link to={`/a/${a.id}?source=map`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-sign px-3 text-sm font-semibold !text-white no-underline">
                      {a.defaultLocalName}
                      <i className="fa-solid fa-headphones" aria-hidden="true"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}

        {/* Chế độ thử: hiện vòng bán kính của từng khu để biết chạm vào đâu là "vào khu" */}
        {demo && zones.map(z => (
          <Circle key={`r${z.id}`} center={[z.lat, z.lng]} radius={z.radius} pathOptions={{ color: '#15803d', weight: 1, fillOpacity: 0.08 }} />
        ))}
        {demo && <DemoClicks onPick={geo.setDemoPosition} />}

        {/* Vị trí của du khách (GPS hoặc vị trí thử) */}
        {geo.position && (
          <CircleMarker center={[geo.position.lat, geo.position.lng]} radius={9} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }} />
        )}
      </MapContainer>

      {/* Biển tiêu đề nổi trên bản đồ */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-[400] sm:left-6 sm:right-auto sm:max-w-sm">
        <div className="rounded-2xl bg-white/95 p-4 text-post shadow-[0_12px_28px_-14px_rgb(24_36_29/0.35)] backdrop-blur-sm">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-lg font-semibold text-post">{t.title}</h1>
            {Array.isArray(animals) && <span className="text-xs font-medium text-post-soft">{t.species(animals.length)}</span>}
          </div>
          <p className="mt-1 text-sm text-post-soft">{animals === 'error' ? t.failed : t.hint}</p>
          {demo && <p className="mt-2 rounded-xl bg-sage-soft px-2.5 py-1 text-sm font-medium text-sign-deep">{zt.demo}</p>}
        </div>
      </div>
    </div>
  );
}
