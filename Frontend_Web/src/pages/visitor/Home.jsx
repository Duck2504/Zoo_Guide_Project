import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zoo-900 via-zoo-800 to-emerald-950 text-white p-8 sm:p-12 shadow-xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-zoo-600 shadow-sm inline-flex items-center gap-1.5">
              <i className="fa-solid fa-headphones-simple"></i> Hệ Thống Thuyết Minh Tự Động
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">Thảo Cầm Viên Sài Gòn</h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Trải nghiệm hệ thống thuyết minh tự động đa ngôn ngữ thông minh. Du khách chỉ cần quét mã QR tại chuồng thú hoặc bật định vị GPS để tự động nghe audio.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => navigate('/map')} className="px-5 py-2.5 rounded-xl bg-zoo-500 hover:bg-zoo-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition">
                <i className="fa-solid fa-map-location-dot"></i> Khám Phá Bản Đồ
              </button>
            </div>
          </div>
        </div>

        {/* THÔNG TIN THAM QUAN */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900">Thông Tin Tham Quan & Tiện Ích</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="space-y-1.5">
              <div className="font-bold text-zoo-700 flex items-center gap-2 text-sm">
                <i className="fa-solid fa-clock"></i> Giờ Mở Cửa
              </div>
              <p>Từ 07:00 đến 18:30 tất cả các ngày trong tuần (kể cả Lễ, Tết).</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-amber-700 flex items-center gap-2 text-sm">
                <i className="fa-solid fa-door-open"></i> Cổng Đón Khách
              </div>
              <p>Cổng 1: Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Q.1.</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-blue-700 flex items-center gap-2 text-sm">
                <i className="fa-solid fa-shield-halved"></i> Quyền Riêng Tư GPS
              </div>
              <p>Tọa độ vị trí chỉ xử lý trên trình duyệt, tuyệt đối không lưu trữ máy chủ.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}