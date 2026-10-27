import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';

export default function AnimalDetail() {
  const { id } = useParams();
  const { language } = useVisitor();
  const [animal, setAnimal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem('zoo_session')) {
      sessionStorage.setItem('zoo_session', crypto.randomUUID());
    }
    const sessionId = sessionStorage.getItem('zoo_session');

    // Giả lập thời gian gọi API để xem hiệu ứng Skeleton Loading
    setTimeout(() => {
      setAnimal({
        id,
        name: 'Hổ Đông Dương',
        scientificName: 'Panthera tigris corbetti',
        imageUrl: 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?q=80&w=800&auto=format&fit=crop',
        zoneName: 'Khu Thú Dữ',
        content: 'Hổ Đông Dương là một phân loài hổ đặc hữu của khu vực Đông Nam Á. Chúng có kích thước nhỏ hơn hổ Bengal và bộ lông màu cam sẫm hơn với các sọc đen hẹp và ngắn. Hiện nay, chúng đang đối mặt với nguy cơ tuyệt chủng cao do mất môi trường sống và nạn săn trộm.',
        audioUrl: '',
        iucnStatus: 'Nguy cấp (EN)'
      });
      setIsLoading(false);
    }, 800);

    // Ghi log
    fetch('http://localhost:5000/api/scan-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animalId: parseInt(id),
        sessionId: sessionId,
        source: 'QR',
        languageCode: language
      })
    }).catch(err => console.error("Lỗi:", err));

  }, [id, language]);

  // Hiệu ứng tải trang (Skeleton)
  if (isLoading) return (
    <div className="h-full bg-slate-50 animate-pulse">
       <div className="w-full h-72 sm:h-80 bg-slate-300"></div>
       <div className="p-6 bg-white rounded-t-[2.5rem] -mt-8 relative z-10 h-screen">
         <div className="h-8 bg-slate-200 rounded-full w-2/3 mb-4"></div>
         <div className="h-4 bg-slate-200 rounded-full w-1/2 mb-8"></div>
         <div className="space-y-3">
           <div className="h-4 bg-slate-200 rounded-full w-full"></div>
           <div className="h-4 bg-slate-200 rounded-full w-full"></div>
           <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
         </div>
       </div>
    </div>
  );

  if (!animal) return <div className="p-8 text-center font-bold text-red-500">Không tìm thấy thông tin động vật.</div>;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-32 custom-scrollbar">
      {/* KHU VỰC ẢNH BÌA */}
      <div className="relative w-full h-72 sm:h-96">
        <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
        
        {/* Lớp phủ Gradient mờ để làm nổi bật nút bấm và text */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/60"></div>
        
        {/* Nút quay lại & Badge ngôn ngữ (Kính mờ) */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <Link to="/" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full text-white flex items-center justify-center border border-white/30 hover:bg-white/40 transition shadow-sm">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
            <i className="fa-solid fa-language text-[11px]"></i>
            {language.toUpperCase()}
          </div>
        </div>

        {/* Tags phân khu & Bảo tồn */}
        <div className="absolute bottom-10 left-6 right-6 flex flex-wrap gap-2 z-20">
           <span className="px-3.5 py-1.5 text-xs font-black bg-zoo-500 text-white rounded-xl shadow-lg shadow-zoo-500/40 border border-zoo-400 flex items-center gap-1.5">
             <i className="fa-solid fa-map-pin"></i> {animal.zoneName}
           </span>
           {animal.iucnStatus && (
             <span className="px-3.5 py-1.5 text-xs font-bold bg-rose-500 text-white rounded-xl shadow-lg border border-rose-400">
               {animal.iucnStatus}
             </span>
           )}
        </div>
      </div>

      {/* KHU VỰC NỘI DUNG CHỮ */}
      <div className="p-6 sm:p-8 bg-white rounded-t-[2.5rem] -mt-6 relative z-30 shadow-[0_-15px_25px_rgba(0,0,0,0.05)] min-h-[50vh]">
        {/* Thanh gạch ngang trang trí (Handle bar) */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
        
        <h1 className="text-3xl font-black text-slate-900 leading-tight mb-1">{animal.name}</h1>
        <div className="flex items-center gap-2 mb-6 text-slate-500">
          <i className="fa-solid fa-dna text-xs"></i>
          <p className="text-sm font-medium italic">{animal.scientificName}</p>
        </div>
        
        <div className="prose prose-slate text-slate-700 leading-relaxed text-[15px] sm:text-base font-medium">
          <p>{animal.content}</p>
        </div>
      </div>

      {/* THANH PHÁT AUDIO (Floating Player) */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-50">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-3.5 sm:p-4 rounded-3xl shadow-2xl flex items-center gap-4 transform transition-all">
          <button className="w-14 h-14 rounded-2xl bg-zoo-500 hover:bg-zoo-400 text-white flex flex-shrink-0 items-center justify-center shadow-lg shadow-zoo-500/40 transition transform active:scale-95">
            <i className="fa-solid fa-play text-xl ml-1"></i>
          </button>
          
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex justify-between items-end mb-2">
              <h4 className="text-white text-[13px] font-bold truncate">Thuyết minh tự động</h4>
              <div className="text-[10px] font-mono text-slate-400 font-medium tracking-wider">
                <span>00:00</span> / <span>01:45</span>
              </div>
            </div>
            
            {/* Thanh tiến trình giả lập */}
            <div className="group h-2 bg-slate-700/60 rounded-full overflow-hidden flex items-center relative cursor-pointer hover:h-2.5 transition-all">
              <div className="h-full bg-gradient-to-r from-zoo-400 to-zoo-300 w-1/3 rounded-full relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}