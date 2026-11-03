import { useEffect, useState, useRef } from 'react';
import { API } from '../../config';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';

const translations = {
  vi: { audioTitle: 'Thuyết minh tự động', notFound: 'Không tìm thấy thông tin.' },
  en: { audioTitle: 'Auto Audio Guide', notFound: 'Information not found.' },
  ko: { audioTitle: '자동 오디오 가이드', notFound: '정보를 찾을 수 없습니다.' },
  ja: { audioTitle: '自動音声ガイド', notFound: '情報が見つかりません。' },
  zh: { audioTitle: '自动语音导览', notFound: '未找到信息。' }
};

// Hàm phụ trợ định dạng thời gian (vd: 105 giây -> 01:45)
const formatTime = (time) => {
  if (isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'web';

  const { language, setLanguage } = useVisitor();
  const [animal, setAnimal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- THÊM STATE CHO MENU NGÔN NGỮ ---
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
  ];

  // --- AUDIO STATES & REFS ---
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // Tính theo %
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const t = translations[language] || translations['vi'];

  // 1. Tự động ghi log quét QR
  useEffect(() => {
    const logScan = async () => {
      if (!id) return;
      let sessionId = sessionStorage.getItem('zoo_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('zoo_session_id', sessionId);
      }

      const logData = {
        animalId: parseInt(id),
        source: source,
        languageCode: language,
        sessionId: sessionId
      };

      try {
        await fetch(`${API}/api/scan-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
      } catch (error) {
        console.error("Lỗi khi ghi nhận log:", error);
      }
    };
    logScan();
  }, [id, source, language]);

  // 2. Fetch data động vật TỪ DATABASE THEO API THẬT
  useEffect(() => {
    const fetchAnimalData = async () => {
      if (!id) return;
      setIsLoading(true);
      
      // Reset lại audio khi đổi bài hoặc đổi ngôn ngữ
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);

      try {
        const response = await fetch(`${API}/api/animals/${id}?lang=${language}`);
        if (response.ok) {
          const data = await response.json();
          setAnimal({
            id: data.id,
            name: data.defaultLocalName || 'Đang cập nhật tên...',
            scientificName: data.scientificName || 'Chưa rõ',
            imageUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?q=80&w=800&auto=format&fit=crop',
            zoneName: data.zoneName || `Khu vực ${data.zoneId}`,
            content: data.scriptText || 'Nội dung thuyết minh đang được cập nhật...',
            audioUrl: data.audioUrl || '',
            iucnStatus: 'EN'
          });
        } else {
          setAnimal(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu động vật từ server:", error);
        setAnimal(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimalData();
  }, [id, language]);

  // --- AUDIO CONTROL FUNCTIONS ---
  const togglePlayPause = () => {
    if (!audioRef.current || !animal?.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    
    setCurrentTime(current);
    if (total > 0) {
      setProgress((current / total) * 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  if (isLoading) return <div className="h-full bg-white animate-pulse"><div className="w-full h-[45vh] bg-gray-200"></div><div className="p-6 -mt-6"><div className="h-8 bg-gray-200 rounded-full w-2/3 mb-4"></div><div className="h-4 bg-gray-200 rounded-full w-full mb-2"></div><div className="h-4 bg-gray-200 rounded-full w-5/6"></div></div></div>;
  if (!animal) return <div className="p-8 text-center font-bold text-red-500">{t.notFound}</div>;

  return (
    <div className="h-full bg-white overflow-y-auto hide-scrollbar relative">
      
      {/* NÚT BACK */}
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full text-white flex items-center justify-center z-50">
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      {/* MENU ĐỔI NGÔN NGỮ NỔI GÓC PHẢI */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
          className="flex items-center gap-1.5 px-3 py-2 bg-black/30 backdrop-blur-md rounded-full text-sm font-semibold text-white shadow-sm transition"
        >
          {languages.find(l => l.code === language)?.flag} {language.toUpperCase()}
          <i className="fa-solid fa-chevron-down text-[10px] ml-1 opacity-80"></i>
        </button>

        {isLangMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-1">
            {languages.map(lang => (
              <button 
                key={lang.code} 
                onClick={() => { setLanguage(lang.code); setIsLangMenuOpen(false); }} 
                className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors ${language === lang.code ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-700'}`}
              >
                <span className="text-lg">{lang.flag}</span> {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ẢNH ĐỘNG VẬT */}
      <div className="w-full h-[45vh] relative">
        <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
      </div>

      {/* THÔNG TIN CHI TIẾT */}
      <div className="px-6 -mt-10 relative z-20 pb-32">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">{animal.name}</h1>
        <p className="text-sm font-semibold text-emerald-600 italic mb-4">{animal.scientificName}</p>

        <div className="flex gap-2 mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{animal.zoneName}</span>
          {animal.iucnStatus && (
            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">{animal.iucnStatus}</span>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed text-[15px] font-medium opacity-90 whitespace-pre-wrap">
          {animal.content}
        </p>
      </div>

      {/* TRÌNH PHÁT AUDIO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-safe z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          
          {/* Thẻ audio ẩn */}
          {animal.audioUrl && (
            <audio 
              ref={audioRef} 
              src={animal.audioUrl} 
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              onLoadedMetadata={handleLoadedMetadata}
            />
          )}

          <button 
            onClick={togglePlayPause}
            disabled={!animal.audioUrl}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform shrink-0 
              ${animal.audioUrl 
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 active:scale-95' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl ${!isPlaying ? 'ml-1' : ''}`}></i>
          </button>

          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-gray-800">{t.audioTitle}</span>
              <span className="text-[10px] font-bold text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full w-full overflow-hidden mt-1 relative">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}