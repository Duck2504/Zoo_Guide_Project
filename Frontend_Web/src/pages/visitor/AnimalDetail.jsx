import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useVisitor();
  const [animal, setAnimal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    }, 500);
  }, [id, language]);

  if (isLoading) return <div className="h-full bg-white animate-pulse"><div className="w-full h-[50vh] bg-gray-200"></div></div>;

  return (
    <div className="h-full bg-white overflow-y-auto hide-scrollbar relative">
      
      {/* Nút Back Trôi nổi */}
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full text-white flex items-center justify-center z-50">
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      {/* Ảnh bìa */}
      <div className="w-full h-[45vh] relative">
        <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
      </div>

      {/* Nội dung */}
      <div className="px-6 -mt-10 relative z-20 pb-32">
        <div className="flex justify-between items-end mb-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{animal.name}</h1>
        </div>
        <p className="text-sm font-semibold text-emerald-600 italic mb-4">{animal.scientificName}</p>

        <div className="flex gap-2 mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{animal.zoneName}</span>
          <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">{animal.iucnStatus}</span>
        </div>

        <p className="text-gray-700 leading-relaxed text-[15px] font-medium opacity-90">{animal.content}</p>
      </div>

      {/* Audio Player Cố định dưới */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-safe z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform shrink-0">
            <i className="fa-solid fa-play text-xl ml-1"></i>
          </button>
          
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span>00:00</span>
              <span>01:45</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full w-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}