import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import 'leaflet/dist/leaflet.css';
import { getAnimals } from '../../utils/animalsApi';
import { calculateDistance, groupZones } from '../../utils/geoUtils';
import { getZoneText } from '../../utils/zoneText';

const translations = {
  vi: { title: 'Bản đồ khu', hint: 'Chạm một khu ở dưới hoặc một ghim trên bản đồ để xem con vật.', failed: 'Chưa tải được vị trí các khu. Kiểm tra mạng rồi mở lại trang.', count: (s, z) => `${s} loài · ${z} khu`, species: n => `${n} loài`, zones: 'Các khu trong vườn', here: 'Bạn đang ở đây', listen: 'Nghe' },
  en: { title: 'Zone map', hint: 'Tap a zone below or a pin on the map to see its animals.', failed: 'Zone locations could not be loaded. Check your connection and reopen the page.', count: (s, z) => `${s} species · ${z} zones`, species: n => `${n} species`, zones: 'Zones in the zoo', here: 'You are here', listen: 'Listen' },
  ko: { title: '구역 지도', hint: '아래 구역이나 지도의 핀을 눌러 동물을 보세요.', failed: '구역 위치를 불러오지 못했습니다. 연결을 확인하고 페이지를 다시 여세요.', count: (s, z) => `${s}종 · ${z}개 구역`, species: n => `${n}종`, zones: '동물원 구역', here: '현재 위치', listen: '듣기' },
  ja: { title: 'エリアマップ', hint: '下のエリアか地図上のピンをタップして動物を見ます。', failed: 'エリアの位置を読み込めませんでした。接続を確認してページを開き直してください。', count: (s, z) => `${s}種 · ${z}エリア`, species: n => `${n}種`, zones: '園内のエリア', here: '現在地', listen: '聞く' },
};

// Ghim nằm trong trang nên đọc thẳng token CSS; riêng nét vẽ SVG của Leaflet cần giá trị thật
const WALL = 'var(--color-wall)';
const LABEL = 'var(--color-label)';
const INK = 'var(--color-ink)';
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Ghim khu kiểu nhãn: ô vuông xanh tường, số loài chữ hẹp; khu đang chọn đổi sang nhãn trắng viền mực
const zoneIcon = (count, selected) => L.divIcon({
  className: '',
  html: `<div aria-hidden="true" style="display:flex;flex-direction:column;align-items:center">
    <div style="display:flex;align-items:center;gap:5px;min-width:44px;height:36px;padding:0 10px;background:${selected ? LABEL : WALL};color:${selected ? INK : LABEL};border:2px solid ${selected ? INK : WALL};font:700 17px 'Archivo Narrow',system-ui;box-shadow:0 6px 12px -6px rgb(0 0 0/.45)">
      <i class="fa-solid fa-paw" style="font-size:13px" aria-hidden="true"></i>${count}
    </div>
    <div style="width:3px;height:12px;background:${INK}"></div>
  </div>`,
  iconSize: [48, 50],
  iconAnchor: [24, 50],
  popupAnchor: [0, -46]
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
  const focusZone = searchParams.get('zone'); // mở từ trang con vật hoặc trang chủ: tập trung vào khu đó
  const demo = searchParams.get('demo') === '1';
  const { geo } = useOutletContext();
  const zt = getZoneText(language);
  const [map, setMap] = useState(null);
  const [selectedId, setSelectedId] = useState(focusZone ? Number(focusZone) : null);
  const markers = useRef({});
  const stripItems = useRef({});

  useEffect(() => {
    getAnimals(language)
      .then(setAnimals)
      .catch(() => setAnimals('error'));
  }, [language]);

  // Mỗi khu một ghim (con vật cùng khu dùng chung tọa độ của khu)
  const zones = useMemo(() => (Array.isArray(animals) ? groupZones(animals) : []), [animals]);

  // Khung bản đồ ôm vừa mọi khu; mở từ một khu thì phóng to vào khu đó
  const focused = zones.find(z => String(z.id) === focusZone);
  const view = focused
    ? { center: [focused.lat, focused.lng], zoom: 18 }
    : zones.length
    ? { bounds: zones.map(z => [z.lat, z.lng]), boundsOptions: { padding: [48, 48], maxZoom: 18 } }
    : { center: [10.7875, 106.7053], zoom: 17 };

  // Chọn một khu ở dải nhãn: bay tới khu đó rồi mở danh sách con vật của nó
  const selectZone = zone => {
    setSelectedId(zone.id);
    if (!map) return;
    map.flyTo([zone.lat, zone.lng], 18, { duration: 0.6 });
    map.once('moveend', () => markers.current[zone.id]?.openPopup());
  };

  // Khu đang chọn luôn nằm trọn trong dải nhãn (vd mở từ trang chủ với ?zone=)
  useEffect(() => {
    stripItems.current[selectedId]?.scrollIntoView({ inline: 'start', block: 'nearest' });
  }, [selectedId, zones.length]);

  const distanceTo = zone => geo.position ? calculateDistance(geo.position.lat, geo.position.lng, zone.lat, zone.lng) : null;

  return (
    <div className="wall-page relative z-0 h-full w-full font-label">
      <MapContainer key={zones.length} ref={setMap} {...view} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map(zone => (
          <Marker
            key={zone.id}
            position={[zone.lat, zone.lng]}
            icon={zoneIcon(zone.animals.length, zone.id === selectedId)}
            title={`${zone.name}, ${t.species(zone.animals.length)}`}
            eventHandlers={{ click: () => setSelectedId(zone.id) }}
            ref={m => {
              if (!m) return;
              markers.current[zone.id] = m;
              if (zone === focused && !m.isPopupOpen()) setTimeout(() => m.openPopup(), 0);
            }}
          >
            {/* Khi tự cuộn để hiện popup, chừa chỗ cho nhãn tiêu đề phía trên và dải nhãn khu phía dưới */}
            <Popup autoPanPaddingTopLeft={[16, 170]} autoPanPaddingBottomRight={[16, 120]}>
              <p className="!mb-2 !mt-0 text-base font-extrabold leading-tight text-ink">
                {zone.name} <span className="text-sm font-medium text-ink-soft">· {t.species(zone.animals.length)}</span>
              </p>
              <ul className="min-w-48 space-y-1">
                {zone.animals.map(a => (
                  <li key={a.id}>
                    <Link to={`/a/${a.id}?source=map`} className="flex min-h-11 items-center justify-between gap-3 bg-ink px-3 text-sm font-semibold !text-label no-underline hover:bg-wall">
                      {a.defaultLocalName}
                      <span className="flex items-center gap-1.5 text-xs font-medium text-label/80"><i className="fa-solid fa-headphones" aria-hidden="true"></i>{t.listen}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}

        {/* Chế độ thử: hiện vòng bán kính của từng khu để biết chạm vào đâu là "vào khu" */}
        {demo && zones.map(z => (
          <Circle key={`r${z.id}`} center={[z.lat, z.lng]} radius={z.radius} pathOptions={{ color: css('--color-wall'), weight: 1, fillOpacity: 0.08 }} />
        ))}
        {demo && <DemoClicks onPick={geo.setDemoPosition} />}

        {/* Vị trí của du khách (GPS hoặc vị trí thử): chấm xanh dương quen thuộc của bản đồ */}
        {geo.position && (
          <CircleMarker center={[geo.position.lat, geo.position.lng]} radius={9} pathOptions={{ color: css('--color-label'), weight: 3, fillColor: css('--color-you'), fillOpacity: 1 }} />
        )}
      </MapContainer>

      {/* Nhãn tiêu đề nổi trên bản đồ */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-[400] sm:left-6 sm:right-auto sm:max-w-sm">
        <div className="border border-ink/10 bg-label p-4 text-ink shadow-[0_10px_24px_-14px_rgb(16_22_20/0.5)]">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-xl font-extrabold tracking-[-0.01em]">{t.title}</h1>
            {zones.length > 0 && <span className="shrink-0 font-label-narrow text-sm font-bold text-wall">{t.count(animals.length, zones.length)}</span>}
          </div>
          <p className="mt-1 text-sm leading-snug text-ink-soft">{animals === 'error' ? t.failed : t.hint}</p>
          {demo && <p className="mt-2 border border-wall/30 px-2.5 py-1 text-sm font-semibold text-wall">{zt.demo}</p>}
        </div>
      </div>

      {/* Dải nhãn khu ở đáy: cùng khuôn với nhãn loài ở trang chủ, số khu đọc trước tiên */}
      {zones.length > 0 && (
        <nav aria-label={t.zones} className="absolute inset-x-0 bottom-6 z-[400]">
          <ul className="hide-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-8">
            {zones.map(zone => {
              const selected = zone.id === selectedId;
              const here = geo.zone?.id === zone.id;
              const d = distanceTo(zone);
              return (
                <li key={zone.id} ref={el => { stripItems.current[zone.id] = el; }} className="snap-start">
                  <button
                    onClick={() => selectZone(zone)}
                    aria-pressed={selected}
                    className={`block min-h-[76px] w-56 border-2 p-3 text-left shadow-[0_10px_24px_-14px_rgb(16_22_20/0.5)] transition-colors lg:w-full ${
                      selected ? 'border-ink bg-ink text-label' : 'border-label bg-label text-ink hover:border-ink/40'
                    }`}
                  >
                    <span className="block truncate text-base font-bold">{zone.name}</span>
                    <span className={`mt-0.5 block truncate text-sm ${selected ? 'text-label/80' : 'text-ink-soft'}`}>
                      {here ? t.here : [t.species(zone.animals.length), d != null && zt.meters(d)].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
