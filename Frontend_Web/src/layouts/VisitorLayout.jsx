import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const QRScannerModal = lazy(() => import('../components/QRScannerModal')); // camera chỉ tải khi mở hộp quét
import useZoneTracker from '../hooks/useZoneTracker';
import ZoneSheet from '../components/ZoneSheet';

import LanguageMenu from '../components/LanguageMenu';

const translations = {
  vi: { title: 'Thảo Cầm Viên', home: 'Trang chủ', map: 'Bản đồ', scan: 'Quét mã QR', scanShort: 'Quét mã', nav: 'Điều hướng', geoOn: 'Đang theo dõi vị trí (bấm để tắt)', geoOff: 'Bật định vị để xem con vật quanh bạn' },
  en: { title: 'Saigon Zoo', home: 'Home', map: 'Map', scan: 'Scan QR code', scanShort: 'Scan', nav: 'Navigation', geoOn: 'Tracking your location (tap to stop)', geoOff: 'Turn on location to see animals around you' },
  ko: { title: '사이공 동물원', home: '홈', map: '지도', scan: 'QR 스캔', scanShort: '스캔', nav: '탐색', geoOn: '위치 추적 중 (눌러서 끄기)', geoOff: '위치를 켜고 주변 동물 보기' },
  ja: { title: 'サイゴン動植物園', home: 'ホーム', map: 'マップ', scan: 'QRスキャン', scanShort: 'スキャン', nav: 'ナビゲーション', geoOn: '現在地を追跡中（タップで停止）', geoOff: '位置情報をオンにして近くの動物を見る' },
};

// Mục điều hướng: mục đang chọn có vạch "bạn đang ở đây". wall = trang chủ (tường nhãn xanh đậm)
const tabClass = wall => ({ isActive }) =>
  `relative flex min-h-11 w-20 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
    wall ? (isActive ? 'font-label text-label' : 'font-label text-label/70 hover:text-label') : (isActive ? 'text-sign' : 'text-post-soft hover:text-post')
  }`;
const headerLinkClass = wall => ({ isActive }) =>
  `relative flex min-h-11 items-center gap-2 px-3 text-sm font-semibold transition-colors ${
    wall ? (isActive ? 'font-label text-label' : 'font-label text-label/75 hover:text-label') : (isActive ? 'text-sign' : 'text-post-soft hover:text-post')
  }`;
const HereMark = ({ className, wall }) => <span className={`absolute h-1 w-8 ${wall ? 'bg-label' : 'rounded-full bg-sign'} ${className}`} aria-hidden="true" />;

export default function VisitorLayout() {
  const { language } = useVisitor();
  // Trình đọc màn hình đọc bằng giọng của ngôn ngữ đang hiện
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const qrOpener = useRef(null); // nút đã mở hộp quét, để đóng hộp thì focus quay về đó
  const openQR = () => { qrOpener.current = document.activeElement; setIsQRModalOpen(true); };
  const closeQR = () => { setIsQRModalOpen(false); qrOpener.current?.focus?.(); };
  const location = useLocation();
  const geo = useZoneTracker(language);
  const geoEnabled = geo.enabled;
  const [sheetOpen, setSheetOpen] = useState(false);
  const seenZones = useRef(new Set()); // mỗi khu chỉ tự mở ngăn kéo một lần trong phiên

  const isDetailPage = location.pathname.startsWith('/a/');
  const isHome = location.pathname === '/';
  const isMap = location.pathname === '/map';
  // Mọi trang du khách dùng tường nhãn xanh
  const isWall = isHome || isMap || isDetailPage;
  const t = translations[language] || translations['vi'];

  // Trình đọc màn hình và trình dịch biết đúng ngôn ngữ đang hiển thị
  useEffect(() => { document.documentElement.lang = language; }, [language]);

  // Trang tường nhãn: tường xanh phủ tới mép màn hình (khung giữa không còn lề sáng hai bên trên máy tính)
  useEffect(() => {
    document.body.style.backgroundColor = isWall ? 'var(--color-wall)' : '';
    document.documentElement.style.scrollbarColor = isWall ? 'rgb(246 248 247 / 0.35) var(--color-wall)' : '';
    return () => { document.body.style.backgroundColor = ''; document.documentElement.style.scrollbarColor = ''; };
  }, [isWall]);

  // Trang cuộn bằng thanh cuộn của trình duyệt: sang trang mới thì bắt đầu từ đầu trang
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);

  // Chỉ một thuyết minh phát cùng lúc: thẻ audio nào bắt đầu phát thì dừng các thẻ còn lại
  useEffect(() => {
    const onPlay = e => document.querySelectorAll('audio').forEach(a => { if (a !== e.target) a.pause(); });
    document.addEventListener('play', onPlay, true);
    return () => document.removeEventListener('play', onPlay, true);
  }, []);

  // Bước vào khu mới: rung nhẹ (Android) và tự mở ngăn kéo. Không tự mở ở trang chủ và bản đồ (đã có danh sách khu sẵn)
  // hoặc khi đang nghe thuyết minh (chỉ hiện nút nhỏ để khỏi che trình phát).
  const zoneId = geo.zone?.id ?? null;
  useEffect(() => {
    if (zoneId == null) { setSheetOpen(false); return; }
    navigator.vibrate?.(150);
    const audioPlaying = [...document.querySelectorAll('audio')].some(a => !a.paused);
    if (!seenZones.current.has(zoneId) && !isWall && !audioPlaying) setSheetOpen(true);
    seenZones.current.add(zoneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  // Điện thoại: full màn hình; tablet/desktop: khung rộng dần để trang không bị bó thành cột hẹp
  return (
    <div className={`visitor-world font-trail text-post ${isWall ? 'bg-wall' : 'bg-trail'} flex flex-col ${isMap ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto relative ${isWall ? '' : 'md:shadow-[0_25px_50px_-12px_rgb(28_43_34/0.25)]'}`}>
      {!isDetailPage && (
        <header className={`h-14 shrink-0 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-30 sticky top-0 border-b ${isWall ? 'bg-wall border-transparent' : 'bg-trail/95 backdrop-blur-sm border-trail-line'}`}>
          <NavLink to="/" className={`flex min-w-0 items-center gap-2.5 text-base font-semibold ${isWall ? 'font-label text-label' : 'text-post'}`}>
            {/* Con dấu của vườn: luôn ở đúng một chỗ trên mọi trang */}
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center ${isWall ? 'bg-label text-wall' : 'rounded-[10px] bg-sign text-white'}`} aria-hidden="true">
              <i className="fa-solid fa-leaf text-sm" aria-hidden="true"></i>
            </span>
            {/* Trang chủ trên điện thoại hẹp: 4 nút ngôn ngữ cần chỗ, chỉ giữ con dấu */}
            <span className={isWall ? 'hidden truncate min-[420px]:inline' : 'truncate'}>{t.title}</span>
          </NavLink>

          <div className="flex items-center gap-2">
            {/* Máy tính: điều hướng nằm trên header thay cho thanh tab dưới */}
            <nav className="hidden items-center lg:flex" aria-label={t.nav}>
              <NavLink to="/" end className={headerLinkClass(isWall)}>
                {({ isActive }) => (<>{isActive && <HereMark wall={isWall} className="-bottom-2 left-3" />}{t.home}</>)}
              </NavLink>
              <NavLink to="/map" className={headerLinkClass(isWall)}>
                {({ isActive }) => (<>{isActive && <HereMark wall={isWall} className="-bottom-2 left-3" />}{t.map}</>)}
              </NavLink>
              <button onClick={openQR} className={`ml-2 min-h-11 items-center gap-2 px-5 text-sm font-semibold transition-colors ${isWall ? 'hidden' : 'flex rounded-full bg-sign text-white hover:bg-sign-deep'}`}>
                <i className="fa-solid fa-qrcode" aria-hidden="true"></i> {t.scan}
              </button>
            </nav>

            <button
              onClick={() => geo.setEnabled(!geoEnabled)}
              aria-pressed={geoEnabled}
              aria-label={geoEnabled ? t.geoOn : t.geoOff}
              title={geoEnabled ? t.geoOn : t.geoOff}
              className={`flex h-11 w-11 items-center justify-center border transition-colors ${
                isWall
                  ? (geoEnabled ? 'border-label bg-label text-wall' : 'border-label/35 text-label hover:bg-label/10')
                  : `rounded-full ${geoEnabled ? 'border-sign bg-sign text-white' : 'border-trail-line bg-white text-post hover:border-sign/40'}`
              }`}
            >
              <i className={`fa-solid ${geoEnabled ? 'fa-location-crosshairs' : 'fa-location-arrow'}`} aria-hidden="true"></i>
            </button>
            <LanguageMenu variant={isWall ? 'wall' : 'menu'} />
          </div>
        </header>
      )}

      <div className={`flex-1 relative z-10 ${isMap ? 'min-h-0' : ''} ${!isDetailPage ? 'pb-20 lg:pb-0' : ''}`}>
        <Suspense fallback={null}>
          <Outlet context={{ openQR, geo }} />
        </Suspense>
      </div>

      {!isDetailPage && (
        <nav className={`h-20 shrink-0 z-40 fixed bottom-0 inset-x-0 mx-auto w-full max-w-md md:max-w-3xl flex justify-around items-center px-2 pb-safe lg:hidden ${isWall ? 'bg-wall-deep' : 'bg-white'}`} aria-label={t.nav}>
          <NavLink to="/" end className={tabClass(isWall)}>
            {({ isActive }) => (<>
              {isActive && <HereMark wall={isWall} className="-top-px" />}
              <i className="fa-solid fa-house text-xl" aria-hidden="true"></i>
              <span>{t.home}</span>
            </>)}
          </NavLink>

          <button
            onClick={openQR}
            aria-label={t.scan}
            className={isWall ? tabClass(true)({ isActive: false }) : 'relative -top-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sign text-2xl text-white shadow-[0_10px_20px_-8px_rgb(21_128_61/0.6)] ring-4 ring-trail transition-transform duration-150 hover:bg-sign-deep active:scale-95'}
          >
            <i className={`fa-solid fa-qrcode ${isWall ? 'text-xl' : ''}`} aria-hidden="true"></i>
            {isWall && <span>{t.scanShort}</span>}
          </button>

          <NavLink to="/map" className={tabClass(isWall)}>
            {({ isActive }) => (<>
              {isActive && <HereMark wall={isWall} className="-top-px" />}
              <i className="fa-solid fa-map-location-dot text-xl" aria-hidden="true"></i>
              <span>{t.map}</span>
            </>)}
          </NavLink>
        </nav>
      )}

      {!isWall && (
        <ZoneSheet
          zone={geo.zone}
          language={language}
          open={sheetOpen}
          onOpen={() => setSheetOpen(true)}
          onClose={() => setSheetOpen(false)}
          raised={isDetailPage}
        />
      )}

      {isQRModalOpen && (
        <Suspense fallback={null}>
          <QRScannerModal isOpen onClose={closeQR} />
        </Suspense>
      )}
    </div>
  );
}
