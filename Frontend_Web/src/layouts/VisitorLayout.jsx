import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const QRScannerModal = lazy(() => import('../components/QRScannerModal'));
import useZoneTracker from '../hooks/useZoneTracker';
import ZoneSheet from '../components/ZoneSheet';
import { ZonePlaylistProvider } from '../components/ZonePlaylist';
import LanguageMenu from '../components/LanguageMenu';
import { ACCESS_EVENT, accessLeft } from '../utils/qrAccess';

const translations = {
  vi: { title: 'Thảo Cầm Viên', subtitle: 'Audio Guide', home: 'Trang chủ', map: 'Bản đồ', scan: 'Quét mã QR', scanShort: 'Quét mã', nav: 'Điều hướng', geoOn: 'Đang theo dõi vị trí (bấm để tắt)', geoOff: 'Bật định vị để xem con vật quanh bạn', lockTitle: 'Quét mã QR để tiếp tục', lockBody: 'Mỗi lần quét mã được dùng 1 phút. Hãy quét mã QR trên biển chuồng thú hoặc ở cổng để nghe tiếp.', rescan: 'Quét lại mã QR' },
  en: { title: 'Saigon Zoo', subtitle: 'Audio Guide', home: 'Home', map: 'Map', scan: 'Scan QR code', scanShort: 'Scan', nav: 'Navigation', geoOn: 'Tracking your location (tap to stop)', geoOff: 'Turn on location to see animals around you', lockTitle: 'Scan a QR code to continue', lockBody: 'Each scan gives you 1 minute. Scan the QR code on an enclosure sign or at the gate to keep listening.', rescan: 'Scan QR code again' },
  ko: { title: '사이공 동물원', subtitle: 'Audio Guide', home: '홈', map: '지도', scan: 'QR 스캔', scanShort: '스캔', nav: '탐색', geoOn: '위치 추적 중 (눌러서 끄기)', geoOff: '위치를 켜고 주변 동물 보기', lockTitle: '계속하려면 QR 코드를 스캔하세요', lockBody: '한 번 스캔하면 1분 동안 이용할 수 있습니다. 계속 들으려면 우리 표지판이나 입구의 QR 코드를 스캔하세요.', rescan: 'QR 코드 다시 스캔' },
  ja: { title: 'サイゴン動植物園', subtitle: 'Audio Guide', home: 'ホーム', map: 'マップ', scan: 'QRスキャン', scanShort: 'スキャン', nav: 'ナビゲーション', geoOn: '現在地を追跡中（タップで停止）', geoOff: '位置情報をオンにして近くの動物を見る', lockTitle: '続けるにはQRコードをスキャンしてください', lockBody: '1回のスキャンで1分間ご利用いただけます。続けて聞くには、展示場の看板か入口のQRコードをスキャンしてください。', rescan: 'QRコードを再スキャン' },
};

const tabClass = wall => ({ isActive }) =>
  `relative flex min-h-12 w-20 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-all ${
    wall
      ? (isActive ? 'font-label text-white bg-white/10' : 'font-label text-label/70 hover:text-label')
      : (isActive ? 'text-sign bg-sage-soft/60' : 'text-post-soft hover:text-post')
  }`;

const headerLinkClass = wall => ({ isActive }) =>
  `relative flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all ${
    wall
      ? (isActive ? 'bg-label text-wall shadow-sm' : 'text-label/85 hover:bg-white/10 hover:text-white')
      : (isActive ? 'bg-sign text-white shadow-sm' : 'text-post-soft hover:bg-ink/5 hover:text-post')
  }`;

export default function VisitorLayout() {
  const { language } = useVisitor();
  const location = useLocation();
  const navigate = useNavigate();
  const isQRModalOpen = !!location.state?.qr;
  const qrOpener = useRef(null); // nút đã mở hộp quét, để đóng hộp thì focus quay về đó
  const openQR = () => {
    if (isQRModalOpen) return;
    qrOpener.current = document.activeElement;
    navigate(location.pathname + location.search, { state: { ...location.state, qr: true } });
  };
  // Đóng = lùi một bước, giống bấm Back. Mở lại trang (F5) mà còn trạng thái hộp thì chỉ gỡ trạng thái, không tự bật camera.
  const closeQR = () => { navigate(-1); qrOpener.current?.focus?.(); };
  useEffect(() => {
    if (location.state?.qr) navigate(location.pathname + location.search, { replace: true, state: { ...location.state, qr: undefined } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const geo = useZoneTracker(language);
  const geoEnabled = geo.enabled;
  const [sheetOpen, setSheetOpen] = useState(false);
  const seenZones = useRef(new Set());

  const isDetailPage = location.pathname.startsWith('/a/');
  const isHome = location.pathname === '/';
  const isMap = location.pathname === '/map';
  const isWall = isHome || isMap || isDetailPage;
  const t = translations[language] || translations['vi'];

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  useEffect(() => {
    document.body.style.backgroundColor = isWall ? 'var(--color-wall)' : '';
    document.documentElement.style.scrollbarColor = isWall ? 'rgb(246 248 247 / 0.35) var(--color-wall)' : '';
    return () => { document.body.style.backgroundColor = ''; document.documentElement.style.scrollbarColor = ''; };
  }, [isWall]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);

  useEffect(() => {
    const onPlay = e => document.querySelectorAll('audio').forEach(a => { if (a !== e.target) a.pause(); });
    document.addEventListener('play', onPlay, true);
    return () => document.removeEventListener('play', onPlay, true);
  }, []);

  // Hết 1 phút sau lần quét mã: dừng mọi audio và khóa app tới khi quét lại
  const [locked, setLocked] = useState(() => accessLeft() === 0);
  const rescanRef = useRef(null);
  useEffect(() => {
    let timer;
    const check = () => {
      clearTimeout(timer);
      const left = accessLeft();
      setLocked(!left);
      if (left) timer = setTimeout(check, left + 50);
      else document.querySelectorAll('audio').forEach(a => a.pause());
    };
    // Điện thoại tắt màn hình có thể hoãn hẹn giờ: audio còn chạy thì tự kiểm tra lại
    const guard = e => { if (!accessLeft()) { e.target.pause(); setLocked(true); } };
    check();
    window.addEventListener(ACCESS_EVENT, check);
    document.addEventListener('visibilitychange', check);
    document.addEventListener('play', guard, true);
    document.addEventListener('timeupdate', guard, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(ACCESS_EVENT, check);
      document.removeEventListener('visibilitychange', check);
      document.removeEventListener('play', guard, true);
      document.removeEventListener('timeupdate', guard, true);
    };
  }, []);
  useEffect(() => { if (locked && !isQRModalOpen) rescanRef.current?.focus(); }, [locked, isQRModalOpen]);

  const zoneId = geo.zone?.id ?? null;
  useEffect(() => {
    if (zoneId == null) { setSheetOpen(false); return; }
    if (locked) return;
    navigator.vibrate?.(150);
    const audioPlaying = [...document.querySelectorAll('audio')].some(a => !a.paused);
    if (!seenZones.current.has(zoneId) && isDetailPage && !audioPlaying) setSheetOpen(true);
    seenZones.current.add(zoneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const qrModal = isQRModalOpen && (
    <Suspense fallback={null}>
      <QRScannerModal isOpen onClose={closeQR} />
    </Suspense>
  );

  if (locked) return (
    <ZonePlaylistProvider zoneId={zoneId} language={language}>
      <div className="visitor-world font-trail bg-wall wall-ambient min-h-[100dvh] w-full max-w-md md:max-w-3xl mx-auto relative flex flex-col">
        <div className="flex justify-end p-4"><LanguageMenu variant="wall" /></div>
        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-16 text-center font-label text-label">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-4xl" aria-hidden="true">
            <i className="fa-solid fa-qrcode"></i>
          </span>
          <h1 className="text-2xl font-extrabold text-white">{t.lockTitle}</h1>
          <p className="max-w-sm text-base leading-relaxed text-label/85">{t.lockBody}</p>
          <button
            ref={rescanRef}
            onClick={openQR}
            className="flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-6 text-base font-semibold text-white shadow-lg shadow-emerald-950/50 transition-transform active:scale-95"
          >
            <i className="fa-solid fa-qrcode" aria-hidden="true"></i> {t.rescan}
          </button>
        </main>
        {qrModal}
      </div>
    </ZonePlaylistProvider>
  );

  return (
    <ZonePlaylistProvider zoneId={zoneId} language={language}>
    <div className={`visitor-world font-trail text-post ${isWall ? 'bg-wall wall-ambient' : 'bg-trail'} flex flex-col ${isMap ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto relative ${isWall ? '' : 'md:shadow-[0_25px_50px_-12px_rgb(28_43_34/0.25)]'}`}>
      {!isDetailPage && (
        <header className={`${isWall ? 'wall-page ' : ''}h-16 shrink-0 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-30 sticky top-0 border-b ${isWall ? 'bg-wall/90 backdrop-blur-md border-white/10' : 'bg-trail/95 backdrop-blur-md border-trail-line'}`}>
          <NavLink to="/" aria-label={t.title} className={`flex min-w-0 items-center gap-3 text-base font-bold transition-opacity hover:opacity-90 ${isWall ? 'font-label text-label' : 'text-post'}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${isWall ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-sign text-white'}`} aria-hidden="true">
              <i className="fa-solid fa-leaf text-sm" aria-hidden="true"></i>
            </span>
            <span className={`min-w-0 ${isWall ? 'hidden min-[440px]:block' : 'block'}`}>
              <span className="block truncate leading-tight">{t.title}</span>
              <span className={`block text-[11px] font-medium tracking-wide uppercase ${isWall ? 'text-emerald-300/80' : 'text-post-soft'}`}>{t.subtitle}</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-2">
            {/* Máy tính: điều hướng hiện đại dạng pill */}
            <nav className="hidden items-center gap-1.5 lg:flex mr-1" aria-label={t.nav}>
              <NavLink to="/" end className={headerLinkClass(isWall)}>
                <i className="fa-solid fa-house text-xs" aria-hidden="true"></i>
                {t.home}
              </NavLink>
              <NavLink to="/map" className={headerLinkClass(isWall)}>
                <i className="fa-solid fa-map-location-dot text-xs" aria-hidden="true"></i>
                {t.map}
              </NavLink>
              <button
                onClick={openQR}
                className={`ml-1 flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-95 ${
                  isWall
                    ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-400'
                    : 'bg-sign text-white shadow-sm hover:bg-sign-deep'
                }`}
              >
                <i className="fa-solid fa-qrcode" aria-hidden="true"></i> {t.scan}
              </button>
            </nav>

            <button
              onClick={() => geo.setEnabled(!geoEnabled)}
              aria-pressed={geoEnabled}
              aria-label={geoEnabled ? t.geoOn : t.geoOff}
              title={geoEnabled ? t.geoOn : t.geoOff}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                isWall
                  ? (geoEnabled ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-inner' : 'border-white/20 bg-white/5 text-label hover:bg-white/10')
                  : (geoEnabled ? 'border-sign bg-sign text-white' : 'border-trail-line bg-white text-post hover:border-sign/40')
              }`}
            >
              <i className={`fa-solid ${geoEnabled ? 'fa-location-crosshairs' : 'fa-location-arrow'}`} aria-hidden="true"></i>
              {geoEnabled && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-wall animate-pulse" aria-hidden="true" />}
            </button>
            <LanguageMenu variant={isWall ? 'wall' : 'menu'} />
          </div>
        </header>
      )}

      <main className={`flex-1 relative z-10 ${isMap ? 'min-h-0' : ''} ${!isDetailPage ? 'pb-20 lg:pb-0' : ''}`}>
        <Suspense fallback={null}>
          <Outlet context={{ openQR, geo }} />
        </Suspense>
      </main>

      {!isDetailPage && (
        <nav className={`${isWall ? 'wall-page ' : ''}h-20 shrink-0 z-40 fixed bottom-0 inset-x-0 mx-auto w-full max-w-md md:max-w-3xl flex justify-around items-center px-3 pb-safe lg:hidden border-t ${isWall ? 'bg-wall-deep/95 backdrop-blur-md border-white/10' : 'bg-white/95 backdrop-blur-md border-trail-line'}`} aria-label={t.nav}>
          <NavLink to="/" end className={tabClass(isWall)}>
            <i className="fa-solid fa-house text-lg" aria-hidden="true"></i>
            <span>{t.home}</span>
          </NavLink>

          <button
            onClick={openQR}
            aria-label={t.scan}
            className="relative -top-3.5 flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl text-white shadow-lg shadow-emerald-950/50 ring-4 ring-wall-deep transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-qrcode" aria-hidden="true"></i>
          </button>

          <NavLink to="/map" className={tabClass(isWall)}>
            <i className="fa-solid fa-map-location-dot text-lg" aria-hidden="true"></i>
            <span>{t.map}</span>
          </NavLink>
        </nav>
      )}

      {isDetailPage && (
        <ZoneSheet
          zone={geo.zone}
          language={language}
          open={sheetOpen}
          onOpen={() => setSheetOpen(true)}
          onClose={() => setSheetOpen(false)}
          raised={isDetailPage}
        />
      )}

      {qrModal}
    </div>
    </ZonePlaylistProvider>
  );
}
