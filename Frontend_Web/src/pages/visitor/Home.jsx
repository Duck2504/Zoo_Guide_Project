import { useEffect } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { API } from '../../config';
import { useVisitor } from '../../context/VisitorContext';
import AroundYou from '../../components/AroundYou';

const translations = {
  vi: {
    hours: 'Mở cửa · 07:00 – 18:30',
    scanTitle: 'Quét mã QR tại chuồng thú', sub: 'Nghe thuyết minh bằng 5 ngôn ngữ', openCamera: 'Mở camera',
    around: 'Quanh bạn', aroundOn: 'Đang bật', aroundOff: 'Bấm để bật',
    map: 'Bản đồ', mapSub: 'Xem các khu trong vườn'
  },
  en: {
    hours: 'Open · 07:00 – 18:30',
    scanTitle: 'Scan the QR code at an enclosure', sub: 'Listen to the guide in 5 languages', openCamera: 'Open camera',
    around: 'Around you', aroundOn: 'On', aroundOff: 'Tap to turn on',
    map: 'Map', mapSub: 'See the zoo zones'
  },
  ko: {
    hours: '운영 · 07:00 – 18:30',
    scanTitle: '우리 앞 QR 코드를 스캔하세요', sub: '5개 언어로 해설 듣기', openCamera: '카메라 열기',
    around: '내 주변', aroundOn: '켜짐', aroundOff: '눌러서 켜기',
    map: '지도', mapSub: '동물원 구역 보기'
  },
  ja: {
    hours: '開園 · 07:00 – 18:30',
    scanTitle: '展示場のQRコードをスキャン', sub: '5言語で音声ガイドを聞く', openCamera: 'カメラを開く',
    around: '近くの動物', aroundOn: 'オン', aroundOff: 'タップでオン',
    map: 'マップ', mapSub: '園内のエリアを見る'
  },
  zh: {
    hours: '开放 · 07:00 – 18:30',
    scanTitle: '扫描围栏处的二维码', sub: '用5种语言收听导览', openCamera: '打开相机',
    around: '我附近', aroundOn: '已开启', aroundOff: '点击开启',
    map: '地图', mapSub: '查看园区各区域'
  }
};

export default function Home() {
  const { openQR, geo } = useOutletContext();
  const { language } = useVisitor();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'web_home';
  const t = translations[language] || translations['vi'];

  // Tự động ghi nhận lượt truy cập trang chủ / quét QR trang chủ để tính số lượng Online
  useEffect(() => {
    let sessionId = sessionStorage.getItem('zoo_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('zoo_session_id', sessionId);
    }
    fetch(`${API}/api/scan-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animalId: null, source, languageCode: language, sessionId }) // trang chủ không gắn con vật nào
    }).catch(error => console.error("Lỗi ghi log trang chủ:", error));
    // Không đưa `language` vào: đổi ngôn ngữ không phải một lượt truy cập mới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const tile = 'flex min-h-24 flex-col justify-between rounded-2xl border border-trail-line bg-white p-4 text-left transition-colors hover:border-sign/40';

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-3 sm:px-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:px-8 lg:pt-8">
      <div className="space-y-3">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sign-deep">
          <i className="fa-regular fa-clock" aria-hidden="true"></i>{t.hours}
        </p>

        {/* Hành động chính: quét mã QR ở chuồng */}
        <section className="rounded-3xl bg-sign p-5 text-white sm:p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl" aria-hidden="true">
            <i className="fa-solid fa-qrcode"></i>
          </span>
          <h1 className="mt-4 max-w-[14ch] text-2xl font-semibold leading-tight text-balance sm:text-3xl">{t.scanTitle}</h1>
          <p className="mt-1 text-sm text-white/85">{t.sub}</p>
          <button
            onClick={openQR}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-base font-semibold text-sign-deep transition-transform duration-150 hover:bg-sage-soft active:scale-[0.98]"
          >
            <i className="fa-solid fa-camera" aria-hidden="true"></i>{t.openCamera}
          </button>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => geo.setEnabled(!geo.enabled)} aria-pressed={geo.enabled} className={tile}>
            <i className={`fa-solid fa-location-crosshairs text-xl ${geo.enabled ? 'text-sign' : 'text-post-soft'}`} aria-hidden="true"></i>
            <span>
              <span className="block text-sm font-semibold text-post">{t.around}</span>
              <span className={`block text-xs ${geo.enabled ? 'font-medium text-sign' : 'text-post-soft'}`}>{geo.enabled ? t.aroundOn : t.aroundOff}</span>
            </span>
          </button>
          <Link to="/map" className={tile}>
            <i className="fa-solid fa-map text-xl text-sign" aria-hidden="true"></i>
            <span>
              <span className="block text-sm font-semibold text-post">{t.map}</span>
              <span className="block text-xs text-post-soft">{t.mapSub}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Chưa bật định vị thì ô "Quanh bạn" ở trên đã là lời mời bật, không lặp lại */}
      {geo.enabled && (
        <div className="mt-3 lg:mt-0">
          <AroundYou geo={geo} language={language} />
        </div>
      )}
    </div>
  );
}
