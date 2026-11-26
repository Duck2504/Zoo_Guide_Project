import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import 'leaflet/dist/leaflet.css';
import { getAnimals } from '../../utils/animalsApi';
import {
  calculateDistance,
  calculateBearing,
  getBearingDirection,
  getEstimatedWalkingMinutes,
  getGoogleMapsDirectionsUrl,
  groupZones
} from '../../utils/geoUtils';
import { getZoneText } from '../../utils/zoneText';
import { useZonePlaylist } from '../../components/ZonePlaylist';
import PlayingBars from '../../components/PlayingBars';

const translations = {
  vi: {
    title: 'Bản đồ khu',
    hint: 'Chạm một khu ở dưới hoặc một ghim trên bản đồ để xem con vật và chỉ đường.',
    failed: 'Chưa tải được vị trí các khu. Kiểm tra mạng rồi mở lại trang.',
    count: (s, z) => `${s} loài · ${z} khu`,
    species: n => `${n} loài`,
    zones: 'Các khu trong vườn',
    here: 'Bạn đang ở đây',
    listen: 'Nghe',
    directions: 'Chỉ đường',
    startNav: 'Chỉ đường đến đây',
    stopNav: 'Dừng chỉ đường',
    walkEst: min => `~${min} phút đi bộ`,
    distance: 'Khoảng cách',
    estTime: 'Thời gian',
    heading: 'Hướng đi',
    openGoogleMaps: 'Mở Google Maps',
    liveGpsPrompt: 'Lộ trình từ vị trí GPS hiện tại của bạn.',
    defaultStartPrompt: 'Chưa bật GPS: Lộ trình tính từ cổng chính Thảo Cầm Viên.'
  },
  en: {
    title: 'Zone map',
    hint: 'Tap a zone below or a pin on the map to view animals and get walking directions.',
    failed: 'Zone locations could not be loaded. Check your connection and reopen the page.',
    count: (s, z) => `${s} species · ${z} zones`,
    species: n => `${n} species`,
    zones: 'Zones in the zoo',
    here: 'You are here',
    listen: 'Listen',
    directions: 'Directions',
    startNav: 'Get directions',
    stopNav: 'Stop directions',
    walkEst: min => `~${min} min walk`,
    distance: 'Distance',
    estTime: 'Est. time',
    heading: 'Heading',
    openGoogleMaps: 'Open Google Maps',
    liveGpsPrompt: 'Route from your current live GPS position.',
    defaultStartPrompt: 'GPS inactive: Route calculated from zoo main entrance.'
  },
  ko: {
    title: '구역 지도',
    hint: '아래 구역이나 지도의 핀을 눌러 동물과 길찾기 경로를 확인하세요.',
    failed: '구역 위치를 불러오지 못했습니다. 연결을 확인하고 페이지를 다시 여세요.',
    count: (s, z) => `${s}종 · ${z}개 구역`,
    species: n => `${n}종`,
    zones: '동물원 구역',
    here: '현재 위치',
    listen: '듣기',
    directions: '길찾기',
    startNav: '여기로 길찾기',
    stopNav: '길안내 종료',
    walkEst: min => `도보 약 ${min}분`,
    distance: '거리',
    estTime: '예상 시간',
    heading: '이동 방향',
    openGoogleMaps: 'Google 지도 열기',
    liveGpsPrompt: '현재 GPS 위치 기준 경로입니다.',
    defaultStartPrompt: 'GPS 꺼짐: 동물원 정문 기준 경로입니다.'
  },
  ja: {
    title: 'エリアマップ',
    hint: '下のエリアか地図上のピンをタップして動物と徒歩ルートを確認します。',
    failed: 'エリアの位置を読み込めませんでした。接続を確認してページを開き直してください。',
    count: (s, z) => `${s}種 · ${z}エリア`,
    species: n => `${n}種`,
    zones: '園内のエリア',
    here: '現在地',
    listen: '聞く',
    directions: 'ルート案内',
    startNav: 'ここへ案内',
    stopNav: '案内終了',
    walkEst: min => `徒歩約${min}分`,
    distance: '距離',
    estTime: '所要時間',
    heading: '方角',
    openGoogleMaps: 'Googleマップで開く',
    liveGpsPrompt: '現在のGPS位置からのルートです。',
    defaultStartPrompt: 'GPS未取得: 正門からのルートを表示しています。'
  },
};

// Cổng chính Thảo Cầm Viên (Nguyễn Bỉnh Khiêm, Bến Nghé, Quận 1) làm điểm xuất phát mặc định khi chưa bật GPS
const ZOO_MAIN_GATE = { lat: 10.7874, lng: 106.7050 };

// Ghim nằm trong trang nên đọc thẳng token CSS; riêng nét vẽ SVG của Leaflet cần giá trị thật
const WALL = 'var(--color-wall)';
const LABEL = 'var(--color-label)';
const INK = 'var(--color-ink)';
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Ghim khu kiểu nhãn hiện đại bo góc, bóng đổ nổi bật trên bản đồ
const zoneIcon = (count, selected) => L.divIcon({
  className: '',
  html: `<div aria-hidden="true" style="display:flex;flex-direction:column;align-items:center">
    <div style="display:flex;align-items:center;gap:5px;min-width:46px;height:36px;padding:0 11px;border-radius:12px;background:${selected ? LABEL : WALL};color:${selected ? INK : LABEL};border:2px solid ${selected ? INK : 'rgba(255,255,255,0.28)'};font:700 16px 'Archivo Narrow',system-ui;box-shadow:0 8px 18px -6px rgb(0 0 0/.45)">
      <i class="fa-solid fa-paw" style="font-size:12px" aria-hidden="true"></i>${count}
    </div>
    <div style="width:3px;height:10px;border-radius:0 0 3px 3px;background:${INK}"></div>
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
  const focusZone = searchParams.get('zone'); // mở từ trang con vật hoặc trang chủ: tập trung vào khu đó
  const navParam = searchParams.get('nav') === '1'; // mở từ nút chỉ đường
  const demo = searchParams.get('demo') === '1';
  const { geo } = useOutletContext();
  const zt = getZoneText(language);
  const playlist = useZonePlaylist();
  const [map, setMap] = useState(null);
  const [selectedId, setSelectedId] = useState(focusZone ? Number(focusZone) : null);
  const [navZone, setNavZone] = useState(null); // Khu đang kích hoạt chỉ đường
  const markers = useRef({});
  const stripItems = useRef({});
  const openedFocus = useRef(null); // khu đã tự mở popup, để không mở lại mỗi lần vẽ lại

  useEffect(() => {
    let cancelled = false;
    getAnimals(language)
      .then(data => { if (!cancelled) setAnimals(data); })
      .catch(() => { if (!cancelled) setAnimals('error'); });
    return () => { cancelled = true; };
  }, [language]);

  // Mỗi khu một ghim (con vật cùng khu dùng chung tọa độ của khu)
  const zones = useMemo(() => (Array.isArray(animals) ? groupZones(animals) : []), [animals]);

  // Tự động kích hoạt chỉ đường nếu URL có ?nav=1
  useEffect(() => {
    if (navParam && focusZone && zones.length > 0 && !navZone) {
      const target = zones.find(z => String(z.id) === focusZone);
      if (target) {
        setNavZone(target);
        setSelectedId(target.id);
      }
    }
  }, [navParam, focusZone, zones, navZone]);

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

  // Bắt đầu chỉ đường đến khu được chọn
  const startNavigation = zone => {
    setNavZone(zone);
    setSelectedId(zone.id);
    if (!map) return;
    const startLat = geo.position?.lat ?? ZOO_MAIN_GATE.lat;
    const startLng = geo.position?.lng ?? ZOO_MAIN_GATE.lng;
    map.fitBounds([
      [startLat, startLng],
      [zone.lat, zone.lng]
    ], { padding: [100, 100], maxZoom: 18 });
  };

  // Khu đang chọn luôn nằm trọn trong dải nhãn (vd mở từ trang chủ với ?zone=)
  useEffect(() => {
    stripItems.current[selectedId]?.scrollIntoView({ inline: 'start', block: 'nearest' });
  }, [selectedId, zones.length]);

  const distanceTo = zone => geo.position ? calculateDistance(geo.position.lat, geo.position.lng, zone.lat, zone.lng) : null;

  // Điểm xuất phát chỉ đường: ưu tiên GPS du khách, fallback là cổng chính
  const startPos = geo.position
    ? { lat: geo.position.lat, lng: geo.position.lng, isGps: true }
    : { lat: ZOO_MAIN_GATE.lat, lng: ZOO_MAIN_GATE.lng, isGps: false };

  // Tính toán khoảng cách & hướng đi khi đang bật chỉ đường
  const navMetrics = useMemo(() => {
    if (!navZone) return null;
    const dist = calculateDistance(startPos.lat, startPos.lng, navZone.lat, navZone.lng);
    const bearing = calculateBearing(startPos.lat, startPos.lng, navZone.lat, navZone.lng);
    const direction = getBearingDirection(bearing, language);
    const walkMinutes = getEstimatedWalkingMinutes(dist);
    const gmapsUrl = getGoogleMapsDirectionsUrl(navZone.lat, navZone.lng, geo.position?.lat, geo.position?.lng);
    return { dist, bearing, direction, walkMinutes, gmapsUrl };
  }, [navZone, startPos.lat, startPos.lng, geo.position, language]);

  return (
    <div className="wall-page relative z-0 h-full w-full font-label">
      <MapContainer key={zones.length} ref={setMap} {...view} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Tuyến đường chỉ đường nối từ vị trí du khách đến khu đích */}
        {navZone && (
          <>
            <Polyline
              positions={[
                [startPos.lat, startPos.lng],
                [navZone.lat, navZone.lng]
              ]}
              pathOptions={{
                color: '#059669',
                weight: 5,
                dashArray: '8, 8',
                opacity: 0.95
              }}
            />
            {/* Điểm đích đến với vòng phát sáng đỏ nổi bật */}
            <CircleMarker
              center={[navZone.lat, navZone.lng]}
              radius={18}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: '#dc2626',
                fillOpacity: 0.95
              }}
            />
            {/* Điểm xuất phát mặc định nếu chưa bật GPS */}
            {!startPos.isGps && (
              <CircleMarker
                center={[startPos.lat, startPos.lng]}
                radius={9}
                pathOptions={{
                  color: '#ffffff',
                  weight: 3,
                  fillColor: '#2563eb',
                  fillOpacity: 1
                }}
              />
            )}
          </>
        )}

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
              if (zone === focused && openedFocus.current !== zone.id) { openedFocus.current = zone.id; setTimeout(() => m.openPopup(), 0); }
            }}
          >
            <Popup autoPanPaddingTopLeft={[16, 170]} autoPanPaddingBottomRight={[16, 120]}>
              <div className="min-w-56">
                <p className="!mb-1.5 !mt-0 text-base font-extrabold leading-tight text-ink">
                  {zone.name} <span className="text-xs font-semibold text-ink-soft">· {t.species(zone.animals.length)}</span>
                </p>

                {/* Nút chỉ đường trực tiếp */}
                <button
                  onClick={() => startNavigation(zone)}
                  className="mb-2.5 mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-wall to-emerald-700 px-3 py-2 text-xs font-bold text-label shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <i className="fa-solid fa-diamond-turn-right" aria-hidden="true"></i>
                  {t.startNav}
                </button>

                <ul className="space-y-1.5">
                  {zone.animals.map(a => (
                    <li key={a.id}>
                      <Link to={`/a/${a.id}?source=map`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-ink px-3 py-1.5 text-sm font-semibold !text-label no-underline transition-colors hover:bg-wall">
                        {a.defaultLocalName}
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300"><i className="fa-solid fa-headphones" aria-hidden="true"></i>{t.listen}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Chế độ thử */}
        {demo && zones.map(z => (
          <Circle key={`r${z.id}`} center={[z.lat, z.lng]} radius={z.radius} pathOptions={{ color: css('--color-wall'), weight: 1, fillOpacity: 0.08 }} />
        ))}
        {demo && <DemoClicks onPick={geo.setDemoPosition} />}

        {/* Vị trí du khách */}
        {geo.position && (
          <CircleMarker center={[geo.position.lat, geo.position.lng]} radius={9} pathOptions={{ color: css('--color-label'), weight: 3, fillColor: css('--color-you'), fillOpacity: 1 }} />
        )}
      </MapContainer>

      {/* Nhãn tiêu đề nổi trên bản đồ */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-[400] sm:left-6 sm:right-auto sm:max-w-sm">
        <div className="rounded-2xl border border-ink/10 bg-label/95 p-4 text-ink shadow-[0_14px_30px_-14px_rgb(16_22_20/0.5)] backdrop-blur-md">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-lg font-extrabold tracking-[-0.01em] sm:text-xl">{t.title}</h1>
            {zones.length > 0 && <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-0.5 font-label-narrow text-xs font-bold text-emerald-800">{t.count(animals.length, zones.length)}</span>}
          </div>
          <p className="mt-1 text-xs leading-snug text-ink-soft sm:text-sm">{animals === 'error' ? t.failed : t.hint}</p>
          {demo && <p className="mt-2 rounded-xl border border-wall/30 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-wall sm:text-sm">{zt.demo}</p>}
          {playlist.current && (
            <div className="pointer-events-auto mt-3 flex items-center gap-3 border-t border-ink/10 pt-3">
              <PlayingBars className="shrink-0 text-wall" />
              <p className="min-w-0 flex-1 text-sm">
                <span className="block text-ink-soft">{zt.nowPlaying(playlist.index + 1, playlist.total)}</span>
                <span className="block truncate font-bold">{playlist.current.defaultLocalName}</span>
              </p>
              <button onClick={playlist.stop} className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-wall px-4 text-sm font-semibold text-label hover:bg-wall-deep">
                <i className="fa-solid fa-stop" aria-hidden="true"></i>{zt.stop}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hộp thoại chỉ đường đang kích hoạt */}
      {navZone && navMetrics && (
        <aside aria-label={t.directions} className="absolute inset-x-4 top-28 z-[410] mx-auto max-w-sm sm:left-6 sm:right-auto">
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-label/95 p-4 text-ink shadow-[0_20px_44px_-12px_rgb(0_0_0/0.6)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  <i className="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> {t.directions}
                </span>
                <h2 className="mt-1.5 text-lg font-extrabold leading-tight text-ink">{navZone.name}</h2>
              </div>
              <button
                onClick={() => setNavZone(null)}
                aria-label={t.stopNav}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-ink/10"
              >
                <i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-emerald-950/[0.04] p-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{t.distance}</span>
                <span className="block font-label-narrow text-lg font-bold text-wall">{Math.round(navMetrics.dist)} m</span>
              </div>
              <div className="rounded-xl bg-emerald-950/[0.04] p-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{t.estTime}</span>
                <span className="block text-sm font-bold text-ink">{t.walkEst(navMetrics.walkMinutes)}</span>
              </div>
              <div className="rounded-xl bg-emerald-950/[0.04] p-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{t.heading}</span>
                <span className="block text-sm font-bold text-ink">{navMetrics.direction}</span>
              </div>
            </div>

            <p className="mt-2.5 text-xs leading-snug text-ink-soft">
              {startPos.isGps ? t.liveGpsPrompt : t.defaultStartPrompt}
            </p>

            <div className="mt-3 flex gap-2">
              <a
                href={navMetrics.gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-wall px-3 text-sm font-bold !text-label no-underline shadow-sm transition-colors hover:bg-emerald-800"
              >
                <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                {t.openGoogleMaps}
              </a>
              <button
                onClick={() => setNavZone(null)}
                className="flex min-h-11 items-center justify-center rounded-xl border border-ink/20 bg-white px-3 text-sm font-bold text-ink transition-colors hover:bg-ink/5"
              >
                {t.stopNav}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Dải nhãn khu ở đáy */}
      {zones.length > 0 && (
        <nav aria-label={t.zones} className="absolute inset-x-0 bottom-5 z-[400]">
          <ul className="hide-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-8">
            {zones.map(zone => {
              const selected = zone.id === selectedId;
              const here = geo.zone?.id === zone.id;
              const isNavigatingThis = navZone?.id === zone.id;
              const d = distanceTo(zone);
              return (
                <li key={zone.id} ref={el => { stripItems.current[zone.id] = el; }} className="snap-start">
                  <div
                    onClick={() => selectZone(zone)}
                    aria-pressed={selected}
                    className={`block min-h-[78px] w-60 cursor-pointer rounded-2xl border-2 p-3.5 text-left shadow-[0_12px_28px_-12px_rgb(16_22_20/0.5)] backdrop-blur-md transition-all lg:w-full ${
                      selected ? 'border-emerald-400 bg-wall text-label' : 'border-white/70 bg-label/95 text-ink hover:border-wall/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="block truncate text-base font-extrabold">{zone.name}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (isNavigatingThis) {
                            setNavZone(null);
                          } else {
                            startNavigation(zone);
                          }
                        }}
                        title={isNavigatingThis ? t.stopNav : t.startNav}
                        className={`flex h-7 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold transition-colors ${
                          isNavigatingThis
                            ? 'bg-rose-600 text-white'
                            : selected
                            ? 'bg-emerald-400 text-wall-deep hover:bg-emerald-300'
                            : 'bg-wall text-label hover:bg-emerald-800'
                        }`}
                      >
                        <i className={`fa-solid ${isNavigatingThis ? 'fa-xmark' : 'fa-diamond-turn-right'}`} aria-hidden="true"></i>
                        <span>{isNavigatingThis ? t.stopNav : t.directions}</span>
                      </button>
                    </div>

                    <span className={`mt-1 block truncate text-xs font-medium sm:text-sm ${selected ? 'text-emerald-200/85' : 'text-ink-soft'}`}>
                      {here ? t.here : [t.species(zone.animals.length), d != null && zt.meters(d)].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
