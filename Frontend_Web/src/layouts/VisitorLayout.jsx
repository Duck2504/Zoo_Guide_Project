import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';
import { useState } from 'react';
import GeofenceController from '../components/GeofenceController';
import QRScannerModal from '../components/QRScannerModal'; 

export default function VisitorLayout() {
  const { language, setLanguage } = useVisitor();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const location = useLocation();

  const isDetailPage = location.pathname.startsWith('/a/');

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' }
  ];

  return (
    <div className="bg-gray-50 flex flex-col h-[100dvh] w-full max-w-md mx-auto relative shadow-2xl overflow-hidden ring-1 ring-gray-200">
      
      {/* Header tối giản (Chỉ hiện nếu không phải trang chi tiết) */}
      {!isDetailPage && (
        <header className="h-14 bg-white/80 backdrop-blur-md shrink-0 px-4 flex items-center justify-between z-30 absolute top-0 left-0 right-0 border-b border-gray-100">
          <div className="font-bold text-lg text-emerald-800 tracking-tight flex items-center gap-2">
            <span className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><i className="fa-solid fa-leaf text-sm"></i></span>
            Thảo Cầm Viên
          </div>

          <div className="relative">
            <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-200 transition">
              {languages.find(l => l.code === language)?.flag} {language.toUpperCase()}
              <i className="fa-solid fa-chevron-down text-xs text-gray-400 ml-1"></i>
            </button>

            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsLangMenuOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 ${language === lang.code ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-700'}`}>
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Vùng nội dung chính */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar relative z-10 ${!isDetailPage ? 'pt-14 pb-20' : 'pb-0'}`}>
        <GeofenceController />
        <Outlet />
      </div>

      {/* Bottom Navigation (Thanh điều hướng dưới cùng) */}
      {!isDetailPage && (
        <nav className="h-20 bg-white border-t border-gray-100 shrink-0 z-40 absolute bottom-0 left-0 right-0 flex justify-around items-center px-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <i className="fa-solid fa-house text-xl"></i>
            <span className="text-[10px] font-bold">Trang chủ</span>
          </NavLink>

          <div className="relative -top-6">
            <button onClick={() => setIsQRModalOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/40 flex items-center justify-center text-2xl transform active:scale-95 transition">
              <i className="fa-solid fa-qrcode"></i>
            </button>
          </div>

          <NavLink to="/map" className={({ isActive }) => `flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <i className="fa-solid fa-map-location-dot text-xl"></i>
            <span className="text-[10px] font-bold">Bản đồ</span>
          </NavLink>
        </nav>
      )}

      <QRScannerModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </div>
  );
}