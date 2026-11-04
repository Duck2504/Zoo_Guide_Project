import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';
import { useEffect, useState } from 'react';
import GeofenceController from '../components/GeofenceController';
import QRScannerModal from '../components/QRScannerModal';
import LanguageMenu from '../components/LanguageMenu';

const translations = {
  vi: { title: 'Thảo Cầm Viên', home: 'Trang chủ', map: 'Bản đồ', scan: 'Quét mã QR', nav: 'Điều hướng', geoOn: 'Đang tự mở theo vị trí (bấm để tắt)', geoOff: 'Tự mở thuyết minh theo vị trí' },
  en: { title: 'Saigon Zoo', home: 'Home', map: 'Map', scan: 'Scan QR code', nav: 'Navigation', geoOn: 'Opening guides by location (tap to stop)', geoOff: 'Open guides by location' },
  ko: { title: '사이공 동물원', home: '홈', map: '지도', scan: 'QR 스캔', nav: '탐색', geoOn: '위치로 가이드 여는 중 (눌러서 끄기)', geoOff: '위치로 가이드 열기' },
  ja: { title: 'サイゴン動植物園', home: 'ホーム', map: 'マップ', scan: 'QRスキャン', nav: 'ナビゲーション', geoOn: '位置でガイドを開いています（タップで停止）', geoOff: '位置でガイドを開く' },
  zh: { title: '西贡动植物园', home: '首页', map: '地图', scan: '扫描QR码', nav: '导航', geoOn: '正在按位置打开导览（点击关闭）', geoOff: '按位置打开导览' }
};

// Mục điều hướng kiểu biển: chữ đứng in hoa, mục đang chọn có vạch vàng "bạn đang ở đây"
const tabClass = ({ isActive }) =>
  `relative flex min-h-11 w-20 flex-col items-center justify-center gap-1 font-sign text-xs font-bold uppercase tracking-wider transition-colors ${
    isActive ? 'text-sign' : 'text-post-soft hover:text-post'
  }`;
const headerLinkClass = ({ isActive }) =>
  `relative flex min-h-11 items-center gap-2 px-3 font-sign text-base font-bold uppercase tracking-wider transition-colors ${
    isActive ? 'text-sign' : 'text-post-soft hover:text-post'
  }`;
const HereMark = ({ className }) => <span className={`absolute h-1 w-10 rounded bg-arrow ${className}`} aria-hidden="true" />;

export default function VisitorLayout() {
  const { language } = useVisitor();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const location = useLocation();

  const isDetailPage = location.pathname.startsWith('/a/');
  const isHome = location.pathname === '/';
  const t = translations[language] || translations['vi'];

  // Trình đọc màn hình và trình dịch biết đúng ngôn ngữ đang hiển thị
  useEffect(() => { document.documentElement.lang = language; }, [language]);

  // Điện thoại: full màn hình; tablet/desktop: khung rộng dần để trang không bị bó thành cột hẹp
  return (
    <div className="visitor-world font-trail text-post bg-trail flex flex-col h-[100dvh] w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto relative overflow-hidden md:shadow-[0_25px_50px_-12px_rgb(28_43_34/0.25)]">
      <GeofenceController enabled={geoEnabled} />

      {!isDetailPage && (
        <header className="h-14 bg-trail/95 backdrop-blur-sm shrink-0 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-30 absolute top-0 left-0 right-0 border-b border-trail-line">
          <NavLink to="/" className="flex min-w-0 items-center gap-2.5 font-sign text-xl font-extrabold text-sign">
            {/* Con dấu của vườn: luôn ở đúng một chỗ trên mọi trang */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sign text-trail" aria-hidden="true">
              <i className="fa-solid fa-leaf text-sm"></i>
            </span>
            {/* Trang chủ đã có tên vườn trên biển lớn, không lặp lại ở header */}
            <span className={isHome ? 'sr-only' : 'truncate'}>{t.title}</span>
          </NavLink>

          <div className="flex items-center gap-2">
            {/* Máy tính: điều hướng nằm trên header thay cho thanh tab dưới */}
            <nav className="hidden items-center lg:flex" aria-label={t.nav}>
              <NavLink to="/" end className={headerLinkClass}>
                {({ isActive }) => (<>{isActive && <HereMark className="-bottom-2 left-3" />}{t.home}</>)}
              </NavLink>
              <NavLink to="/map" className={headerLinkClass}>
                {({ isActive }) => (<>{isActive && <HereMark className="-bottom-2 left-3" />}{t.map}</>)}
              </NavLink>
              <button onClick={() => setIsQRModalOpen(true)} className="ml-2 flex min-h-11 items-center gap-2 rounded-md bg-sign px-4 font-sign text-base font-bold uppercase tracking-wider text-trail transition-colors hover:bg-sign-deep">
                <i className="fa-solid fa-qrcode" aria-hidden="true"></i> {t.scan}
              </button>
            </nav>

            <button
              onClick={() => setGeoEnabled(!geoEnabled)}
              aria-pressed={geoEnabled}
              aria-label={geoEnabled ? t.geoOn : t.geoOff}
              title={geoEnabled ? t.geoOn : t.geoOff}
              className={`flex h-11 w-11 items-center justify-center rounded-md border transition-colors ${
                geoEnabled ? 'border-sign bg-sign text-trail' : 'border-trail-line bg-white text-post hover:border-sage'
              }`}
            >
              <i className={`fa-solid ${geoEnabled ? 'fa-location-crosshairs' : 'fa-location-arrow'}`} aria-hidden="true"></i>
            </button>
            <LanguageMenu />
          </div>
        </header>
      )}

      <div className={`flex-1 overflow-y-auto hide-scrollbar relative z-10 ${!isDetailPage ? 'pt-14 pb-20 lg:pb-0' : 'pb-0'}`}>
        <Outlet context={{ openQR: () => setIsQRModalOpen(true) }} />
      </div>

      {!isDetailPage && (
        <nav className="h-20 bg-trail border-t border-trail-line shrink-0 z-40 absolute bottom-0 left-0 right-0 flex justify-around items-center px-2 pb-safe lg:hidden" aria-label={t.nav}>
          <NavLink to="/" end className={tabClass}>
            {({ isActive }) => (<>
              {isActive && <HereMark className="-top-px" />}
              <i className="fa-solid fa-house text-xl" aria-hidden="true"></i>
              <span>{t.home}</span>
            </>)}
          </NavLink>

          <button
            onClick={() => setIsQRModalOpen(true)}
            aria-label={t.scan}
            className="relative -top-5 flex h-16 w-16 items-center justify-center rounded-md bg-sign text-2xl text-trail shadow-[0_10px_20px_-6px_rgb(20_83_45/0.55)] ring-4 ring-trail transition-transform duration-150 hover:bg-sign-deep active:scale-95"
          >
            <i className="fa-solid fa-qrcode" aria-hidden="true"></i>
          </button>

          <NavLink to="/map" className={tabClass}>
            {({ isActive }) => (<>
              {isActive && <HereMark className="-top-px" />}
              <i className="fa-solid fa-map-location-dot text-xl" aria-hidden="true"></i>
              <span>{t.map}</span>
            </>)}
          </NavLink>
        </nav>
      )}

      <QRScannerModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </div>
  );
}
