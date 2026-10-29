import { useNavigate } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const translations = {
  vi: {
    greeting: 'Xin chào 👋',
    description: 'Hệ thống thuyết minh đa ngôn ngữ. Quét mã QR tại chuồng thú hoặc bật định vị để nghe tự động.',
    openMap: 'Mở Bản Đồ Vị Trí',
    autoPlay: 'Tự động phát',
    gpsBased: 'Dựa trên GPS',
    scanQR: 'Quét mã QR',
    atEnclosure: 'Tại chuồng thú',
    openHours: 'Giờ mở cửa',
    time: '07:00 - 18:30 (Mọi ngày)'
  },
  en: {
    greeting: 'Hello 👋',
    description: 'Multilingual audio guide. Scan QR codes at enclosures or enable location for auto-playback.',
    openMap: 'Open Location Map',
    autoPlay: 'Auto-play',
    gpsBased: 'GPS Based',
    scanQR: 'Scan QR Code',
    atEnclosure: 'At enclosures',
    openHours: 'Opening hours',
    time: '07:00 - 18:30 (Everyday)'
  },
  ko: {
    greeting: '안녕하세요 👋',
    description: '다국어 오디오 가이드. 동물 우리에서 QR을 스캔하거나 위치를 켜면 자동으로 재생됩니다.',
    openMap: '지도 열기',
    autoPlay: '자동 재생',
    gpsBased: 'GPS 기반',
    scanQR: 'QR 스캔',
    atEnclosure: '동물 우리에서',
    openHours: '영업 시간',
    time: '07:00 - 18:30 (매일)'
  },
  ja: {
    greeting: 'こんにちは 👋',
    description: '多言語音声ガイド。QRコードをスキャンするか、位置情報を有効にすると自動再生されます。',
    openMap: 'マップを開く',
    autoPlay: '自動再生',
    gpsBased: 'GPSベース',
    scanQR: 'QRスキャン',
    atEnclosure: '動物の囲いで',
    openHours: '営業時間',
    time: '07:00 - 18:30 (毎日)'
  },
  zh: {
    greeting: '您好 👋',
    description: '多语言语音导览。在动物围栏处扫描QR码或启用定位即可自动播放。',
    openMap: '打开地图',
    autoPlay: '自动播放',
    gpsBased: '基于GPS',
    scanQR: '扫描QR码',
    atEnclosure: '在动物围栏处',
    openHours: '开放时间',
    time: '07:00 - 18:30 (每天)'
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { language } = useVisitor();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'web_home';
  
  const t = translations[language] || translations['vi'];

  // Tự động ghi nhận lượt truy cập trang chủ / quét QR trang chủ để tính số lượng Online
  useEffect(() => {
    const logHomeVisit = async () => {
      let sessionId = sessionStorage.getItem('zoo_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('zoo_session_id', sessionId);
      }

      const logData = {
        animalId: null, // Trang chủ không gắn với con vật cụ thể nào
        source: source,
        languageCode: language, 
        sessionId: sessionId
      };

      try {
        await fetch(`https://backend-zooaudio.onrender.com/api/scan-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
      } catch (error) {
        console.error("Lỗi ghi log trang chủ:", error);
      }
    };

    logHomeVisit();
  }, [source, language]);

  return (
    <div className="h-full flex flex-col p-5 space-y-6">
      
      <div className="bg-emerald-900 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-800 rounded-full opacity-50 blur-2xl"></div>
        <div className="relative z-10 text-white">
          <h2 className="text-2xl font-extrabold mb-2">{t.greeting}</h2>
          <p className="text-emerald-100 text-sm font-medium leading-relaxed mb-6 opacity-90">
            {t.description}
          </p>
          <button onClick={() => navigate('/map')} className="bg-white text-emerald-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-gray-100 transition">
            {t.openMap} <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 active:bg-gray-50 transition cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-location-arrow"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{t.autoPlay}</h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">{t.gpsBased}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-3 active:bg-gray-50 transition cursor-pointer" onClick={() => document.querySelector('.fa-qrcode')?.closest('button')?.click()}>
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-expand"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{t.scanQR}</h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">{t.atEnclosure}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><i className="fa-solid fa-clock"></i></div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">{t.openHours}</h4>
            <p className="text-xs text-gray-500">{t.time}</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}