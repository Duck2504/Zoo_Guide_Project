import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col p-5 space-y-6">
      
      {/* Thẻ Chào Mừng */}
      <div className="bg-emerald-900 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-800 rounded-full opacity-50 blur-2xl"></div>
        <div className="relative z-10 text-white">
          <h2 className="text-2xl font-extrabold mb-2">Xin chào 👋</h2>
          <p className="text-emerald-100 text-sm font-medium leading-relaxed mb-6 opacity-90">
            Hệ thống thuyết minh đa ngôn ngữ. Quét mã QR tại chuồng thú hoặc bật định vị để nghe tự động.
          </p>
          <button onClick={() => navigate('/map')} className="bg-white text-emerald-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-gray-100 transition">
            Mở Bản Đồ Vị Trí <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>

      {/* Lối tắt (Quick Actions) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 active:bg-gray-50 transition cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-location-arrow"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Tự động phát</h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Dựa trên GPS</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 active:bg-gray-50 transition cursor-pointer" onClick={() => document.querySelector('.fa-qrcode').closest('button').click()}>
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-expand"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Quét mã QR</h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Tại chuồng thú</p>
          </div>
        </div>
      </div>

      {/* Thông tin thêm */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><i className="fa-solid fa-clock"></i></div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">Giờ mở cửa</h4>
            <p className="text-xs text-gray-500">07:00 - 18:30 (Mọi ngày)</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}