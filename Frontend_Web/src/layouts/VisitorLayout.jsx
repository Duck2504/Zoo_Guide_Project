import { NavLink, Outlet } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';

export default function VisitorLayout() {
  const { language, setLanguage } = useVisitor();

  return (
    <div className="bg-slate-100 text-slate-800 flex flex-col h-screen overflow-hidden">
      {/* HEADER CỐ ĐỊNH */}
      <header className="h-16 sm:h-20 bg-white border-b border-slate-200 shadow-md shrink-0 z-40 px-3 sm:px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center group">
          <span className="font-black text-slate-900 group-hover:text-zoo-700 text-xl sm:text-2xl tracking-tight transition">
            Thảo Cầm Viên
          </span>
        </NavLink>

        {/* Thanh điều hướng (Tự động đổi màu khi active nhờ NavLink) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" 
            className={({ isActive }) => `flex items-center gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${isActive ? 'text-zoo-700 bg-zoo-50 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            <i className="fa-solid fa-house"></i>
            <span className="hidden sm:inline">Trang Chủ</span>
          </NavLink>

          <NavLink to="/map" 
            className={({ isActive }) => `flex items-center gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${isActive ? 'text-zoo-700 bg-zoo-50 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            <i className="fa-solid fa-map-location-dot"></i>
            <span className="hidden sm:inline">Bản đồ sở thú</span>
          </NavLink>

          <button onClick={() => alert("Mở Modal Quét QR!")} className="flex items-center gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold text-xs sm:text-sm transition">
            <i className="fa-solid fa-qrcode"></i>
            <span className="hidden sm:inline">Mã QR</span>
          </button>
        </nav>

        {/* Chọn Ngôn Ngữ */}
        <div className="flex items-center shrink-0">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-full py-1.5 sm:py-2 pl-3 pr-8 focus:outline-none focus:border-zoo-500 shadow-sm cursor-pointer">
            <option value="vi">🇻🇳 VN Tiếng Việt</option>
            <option value="en">🇬🇧 EN English</option>
            <option value="ko">🇰🇷 KO 한국어</option>
            <option value="ja">🇯🇵 JA 日本語</option>
            <option value="zh">🇨🇳 ZH 中文</option>
          </select>
        </div>
      </header>

      {/* VÙNG HIỂN THỊ NỘI DUNG ĐỘNG (Trang Chủ hoặc Bản Đồ sẽ render ở đây) */}
      <div className="flex-1 relative">
        <Outlet />
      </div>
    </div>
  );
}