import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';

const translations = {
  vi: { audioTitle: 'Thuyết minh tự động', notFound: 'Không tìm thấy thông tin.' },
  en: { audioTitle: 'Auto Audio Guide', notFound: 'Information not found.' },
  ko: { audioTitle: '자동 오디오 가이드', notFound: '정보를 찾을 수 없습니다.' },
  ja: { audioTitle: '自動音声ガイド', notFound: '情報が見つかりません。' },
  zh: { audioTitle: '自动语音导览', notFound: '未找到信息。' }
};

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Thêm useSearchParams để lấy query string từ URL
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'web'; 

  const { language } = useVisitor();
  const [animal, setAnimal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const t = translations[language] || translations['vi'];

  // 1. Tự động ghi log khi người dùng truy cập trang
  useEffect(() => {
    const logScan = async () => {
      if (!id) return;

      // Lấy hoặc tạo SessionId trong máy khách để định danh phiên
      let sessionId = sessionStorage.getItem('zoo_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('zoo_session_id', sessionId);
      }

      const logData = {
        animalId: parseInt(id),
        source: source,
        languageCode: language, // Lấy theo ngôn ngữ khách đang chọn
        sessionId: sessionId
      };

      try {
        await fetch(`https://backend-zooaudio.onrender.com/api/scan-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logData)
        });
      } catch (error) {
        console.error("Lỗi khi ghi nhận log:", error);
      }
    };

    logScan();
  }, [id, source, language]); // Cập nhật log nếu ID động vật hoặc ngôn ngữ thay đổi

  // 2. Fetch data động vật (giữ nguyên logic mock data của cậu hiện tại)
  useEffect(() => {
    setIsLoading(true);
    // Lưu ý: Sau này em sẽ thay bằng fetch(`http://localhost:5000/api/animals/${id}?lang=${language}`)
    setTimeout(() => {
      setAnimal({
        id,
        name: language === 'en' ? 'Indochinese Tiger' : 'Hổ Đông Dương',
        scientificName: 'Panthera tigris corbetti',
        imageUrl: 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?q=80&w=800&auto=format&fit=crop',
        zoneName: language === 'en' ? 'Predator Zone' : 'Khu Thú Dữ',
        content: language === 'en' ? 'The Indochinese tiger is a tiger subspecies...' : 'Hổ Đông Dương là một phân loài hổ đặc hữu...',
        audioUrl: '',
        iucnStatus: 'EN'
      });
      setIsLoading(false);
    }, 500);
  }, [id, language]);

  if (isLoading) return <div className="h-full bg-white animate-pulse"><div className="w-full h-[45vh] bg-gray-200"></div><div className="p-6 -mt-6"><div className="h-8 bg-gray-200 rounded-full w-2/3 mb-4"></div><div className="h-4 bg-gray-200 rounded-full w-full mb-2"></div><div className="h-4 bg-gray-200 rounded-full w-5/6"></div></div></div>;

  if (!animal) return <div className="p-8 text-center font-bold text-red-500">{t.notFound}</div>;

  return (
    <div className="h-full bg-white overflow-y-auto hide-scrollbar relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full text-white flex items-center justify-center z-50">
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      <div className="w-full h-[45vh] relative">
        <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
      </div>

      <div className="px-6 -mt-10 relative z-20 pb-32">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">{animal.name}</h1>
        <p className="text-sm font-semibold text-emerald-600 italic mb-4">{animal.scientificName}</p>

        <div className="flex gap-2 mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{animal.zoneName}</span>
          <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">{animal.iucnStatus}</span>
        </div>

        <p className="text-gray-700 leading-relaxed text-[15px] font-medium opacity-90">{animal.content}</p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-safe z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform shrink-0">
            <i className="fa-solid fa-play text-xl ml-1"></i>
          </button>
          
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-gray-800">{t.audioTitle}</span>
              <span className="text-[10px] font-bold text-gray-400">00:00 / 01:45</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full w-full overflow-hidden mt-1">
              <div className="h-full bg-emerald-500 w-1/3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}