import { useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { API } from '../../config';
import { useVisitor } from '../../context/VisitorContext';
import AroundYou from '../../components/AroundYou';

const translations = {
  vi: {
    title: 'Thảo Cầm Viên', sub: 'Thuyết minh động vật bằng 5 ngôn ngữ', // không ngắt dòng giữa "động vật"
    scan: 'Quét mã QR tại chuồng', map: 'Xem bản đồ khu',
    howTitle: 'Cách nghe thuyết minh',
    steps: [['Quét mã', 'Mã QR gắn ở mỗi chuồng'], ['Nghe', 'Chọn ngôn ngữ của bạn'], ['Đi tiếp', 'Theo bản đồ tới chuồng kế']],
    hoursTitle: 'Giờ mở cửa', hours: '07:00 – 18:30, mỗi ngày'
  },
  en: {
    title: 'Saigon Zoo', sub: 'Animal audio guide in 5 languages',
    scan: 'Scan the QR code at an enclosure', map: 'See the zone map',
    howTitle: 'How the audio guide works',
    steps: [['Scan', 'A QR code at every enclosure'], ['Listen', 'Pick your language'], ['Move on', 'Follow the map to the next one']],
    hoursTitle: 'Opening hours', hours: '07:00 – 18:30, daily'
  },
  ko: {
    title: '사이공 동물원', sub: '5개 언어 동물 오디오 가이드',
    scan: '우리 앞 QR 코드 스캔', map: '구역 지도 보기',
    howTitle: '오디오 가이드 이용 방법',
    steps: [['스캔', '모든 우리에 QR 코드'], ['듣기', '언어 선택'], ['이동', '지도를 따라 다음 우리로']],
    hoursTitle: '운영 시간', hours: '매일 07:00 – 18:30'
  },
  ja: {
    title: 'サイゴン動植物園', sub: '5言語の動物音声ガイド',
    scan: '展示場のQRコードをスキャン', map: 'エリアマップを見る',
    howTitle: '音声ガイドの使い方',
    steps: [['スキャン', '各展示場にQRコード'], ['聞く', '言語を選ぶ'], ['次へ', 'マップで次の展示場へ']],
    hoursTitle: '開園時間', hours: '毎日 07:00 – 18:30'
  },
  zh: {
    title: '西贡动植物园', sub: '5种语言的动物语音导览',
    scan: '扫描围栏处的QR码', map: '查看区域地图',
    howTitle: '如何收听导览',
    steps: [['扫描', '每个围栏都有QR码'], ['收听', '选择您的语言'], ['继续', '按地图前往下一个']],
    hoursTitle: '开放时间', hours: '每天 07:00 – 18:30'
  }
};

const STEP_ICONS = ['fa-qrcode', 'fa-headphones', 'fa-person-walking'];

export default function Home() {
  const navigate = useNavigate();
  const { openQR, geo } = useOutletContext();
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
        await fetch(`${API}/api/scan-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
      } catch (error) {
        console.error("Lỗi ghi log trang chủ:", error);
      }
    };

    logHomeVisit();
    // Không đưa `language` vào: đổi ngôn ngữ không phải một lượt truy cập mới
  }, [source]);

  return (
    <div className="px-4 pt-5 pb-28 sm:px-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-10 lg:px-8 lg:pt-8">

      {/* CỘT TRÁI: tấm biển chính (dính khi cuộn trên máy tính) */}
      <div className="space-y-5 lg:sticky lg:top-8 lg:space-y-6">
        <section className="relative rounded-md bg-sign px-6 pb-6 pt-8 text-trail shadow-[0_14px_28px_-14px_rgb(15_63_34/0.6)] sm:p-8">
          {/* Viền kẻ trắng chạy trong mép biển, như biển sơn ngoài trời */}
          <div className="pointer-events-none absolute inset-2 rounded border border-trail/30" aria-hidden="true" />
          <h1 className="max-w-[8ch] font-sign text-[4rem] font-extrabold leading-[0.88] tracking-tight text-balance sm:text-7xl lg:text-[5.25rem]">{t.title}</h1>
          <p className="mt-4 text-lg font-semibold text-trail/85 text-balance">{t.sub}</p>

          <button
            onClick={openQR}
            className="group mt-7 flex min-h-16 w-full items-center justify-between gap-4 rounded bg-arrow px-5 text-left font-sign text-xl font-extrabold text-post shadow-[0_6px_14px_-6px_rgb(0_0_0/0.45)] transition-[background-color,transform] duration-150 hover:bg-arrow-deep active:scale-[0.98] sm:text-2xl"
          >
            <span className="flex items-center gap-3">
              <i className="fa-solid fa-qrcode text-2xl" aria-hidden="true"></i>
              {t.scan}
            </span>
            <i className="fa-solid fa-arrow-right text-2xl transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true"></i>
          </button>

          <button
            onClick={() => navigate('/map')}
            className="mt-3 flex min-h-12 w-full items-center justify-between rounded border border-trail/40 px-5 font-sign text-lg font-bold text-trail transition-colors hover:bg-trail/10"
          >
            {t.map}
            <i className="fa-solid fa-map-location-dot" aria-hidden="true"></i>
          </button>
        </section>

        {/* Cách dùng: ba ký hiệu như biển pictogram */}
        <section aria-labelledby="how-title">
          {/* Điện thoại: dải ký hiệu gọn một hàng */}
          <h2 id="how-title" className="sr-only font-sign text-xl font-extrabold text-post lg:not-sr-only">{t.howTitle}</h2>
          <ol className="grid grid-cols-3 gap-2 lg:mt-3 lg:gap-3">
            {t.steps.map(([title, desc], i) => (
              <li key={title} className="flex items-center gap-2 lg:block lg:text-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sage text-lg text-white lg:mx-auto lg:aspect-square lg:h-auto lg:w-full lg:max-w-24 lg:text-3xl">
                  <i className={`fa-solid ${STEP_ICONS[i]}`} aria-hidden="true"></i>
                </span>
                <p className="font-sign text-base font-bold leading-tight text-post lg:mt-2 lg:text-lg">{title}</p>
                <p className="hidden text-sm leading-snug text-post-soft lg:block">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="hidden items-center gap-4 rounded-md border border-trail-line bg-white p-4 lg:flex">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-sage-soft text-xl text-sign"><i className="fa-solid fa-clock" aria-hidden="true"></i></span>
          <div>
            <p className="font-sign text-lg font-bold">{t.hoursTitle}</p>
            <p className="text-sm text-post-soft">{t.hours}</p>
          </div>
        </section>
      </div>

      {/* CỘT PHẢI: con vật quanh bạn (theo định vị) và giờ mở cửa */}
      <div className="mt-7 space-y-10 lg:mt-0">
        {/* Bảng giới thiệu kiểu biển diễn giải ngoài trời: khung xanh, thân trắng, ảnh có chú thích */}
        <AroundYou geo={geo} language={language} />

        <section className="flex items-center gap-4 rounded-md border border-trail-line bg-white p-4 lg:hidden">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-sage-soft text-xl text-sign"><i className="fa-solid fa-clock" aria-hidden="true"></i></span>
          <div>
            <p className="font-sign text-lg font-bold">{t.hoursTitle}</p>
            <p className="text-sm text-post-soft">{t.hours}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
