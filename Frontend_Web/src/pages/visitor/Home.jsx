import { useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { API } from '../../config';
import { useVisitor } from '../../context/VisitorContext';
import AnimalImage from '../../components/AnimalImage';

// Ảnh minh họa từ Unsplash (không chụp tại Thảo Cầm Viên), được ghi nhãn trên trang; nên thay bằng ảnh thật của vườn.
const photo = (id, w) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;
const PANEL_PHOTOS = [
  { id: 'photo-1557050543-4d5f4e07ef46', key: 'elephant' },
  { id: 'photo-1547721064-da6cfb341d50', key: 'giraffe' },
  { id: 'photo-1564349683136-77e08dba1ef7', key: 'panda' },
  { id: 'photo-1552728089-57bdde30beb3', key: 'parrot' },
  { id: 'photo-1526095179574-86e545346ae6', key: 'zebra' },
];

const translations = {
  vi: {
    title: 'Thảo Cầm Viên', sub: 'Thuyết minh động vật bằng 5 ngôn ngữ', // không ngắt dòng giữa "động vật"
    scan: 'Quét mã QR tại chuồng', map: 'Xem bản đồ khu',
    howTitle: 'Cách nghe thuyết minh',
    steps: [['Quét mã', 'Mã QR gắn ở mỗi chuồng'], ['Nghe', 'Chọn ngôn ngữ của bạn'], ['Đi tiếp', 'Theo bản đồ tới chuồng kế']],
    panelTitle: 'Bảng giới thiệu', panelText: 'Mỗi chuồng thú có một mã QR. Quét mã để nghe câu chuyện của loài sống ở đó, bằng ngôn ngữ của bạn.', photoAlt: 'Ảnh minh họa:',
    wild: { elephant: 'Voi', giraffe: 'Hươu cao cổ', panda: 'Gấu trúc', parrot: 'Vẹt', zebra: 'Ngựa vằn' },
    credit: 'Ảnh minh họa, không chụp tại vườn',
    hoursTitle: 'Giờ mở cửa', hours: '07:00 – 18:30, mỗi ngày'
  },
  en: {
    title: 'Saigon Zoo', sub: 'Animal audio guide in 5 languages',
    scan: 'Scan the QR code at an enclosure', map: 'See the zone map',
    howTitle: 'How the audio guide works',
    steps: [['Scan', 'A QR code at every enclosure'], ['Listen', 'Pick your language'], ['Move on', 'Follow the map to the next one']],
    panelTitle: 'Visitor panel', panelText: 'Every enclosure has a QR code. Scan it to hear the story of the animal that lives there, in your language.', photoAlt: 'Illustrative photo:',
    wild: { elephant: 'Elephant', giraffe: 'Giraffe', panda: 'Panda', parrot: 'Parrot', zebra: 'Zebra' },
    credit: 'Illustrative photos, not taken at the zoo',
    hoursTitle: 'Opening hours', hours: '07:00 – 18:30, daily'
  },
  ko: {
    title: '사이공 동물원', sub: '5개 언어 동물 오디오 가이드',
    scan: '우리 앞 QR 코드 스캔', map: '구역 지도 보기',
    howTitle: '오디오 가이드 이용 방법',
    steps: [['스캔', '모든 우리에 QR 코드'], ['듣기', '언어 선택'], ['이동', '지도를 따라 다음 우리로']],
    panelTitle: '안내판', panelText: '모든 우리에 QR 코드가 있습니다. 스캔하면 그곳에 사는 동물의 이야기를 원하는 언어로 들을 수 있습니다.', photoAlt: '참고 사진:',
    wild: { elephant: '코끼리', giraffe: '기린', panda: '판다', parrot: '앵무새', zebra: '얼룩말' },
    credit: '참고 사진이며 동물원에서 촬영하지 않았습니다',
    hoursTitle: '운영 시간', hours: '매일 07:00 – 18:30'
  },
  ja: {
    title: 'サイゴン動植物園', sub: '5言語の動物音声ガイド',
    scan: '展示場のQRコードをスキャン', map: 'エリアマップを見る',
    howTitle: '音声ガイドの使い方',
    steps: [['スキャン', '各展示場にQRコード'], ['聞く', '言語を選ぶ'], ['次へ', 'マップで次の展示場へ']],
    panelTitle: '案内板', panelText: '各展示場にQRコードがあります。スキャンすると、そこに暮らす動物の話をあなたの言語で聞けます。', photoAlt: 'イメージ写真:',
    wild: { elephant: 'ゾウ', giraffe: 'キリン', panda: 'パンダ', parrot: 'オウム', zebra: 'シマウマ' },
    credit: 'イメージ写真です（園内で撮影したものではありません）',
    hoursTitle: '開園時間', hours: '毎日 07:00 – 18:30'
  },
  zh: {
    title: '西贡动植物园', sub: '5种语言的动物语音导览',
    scan: '扫描围栏处的QR码', map: '查看区域地图',
    howTitle: '如何收听导览',
    steps: [['扫描', '每个围栏都有QR码'], ['收听', '选择您的语言'], ['继续', '按地图前往下一个']],
    panelTitle: '介绍牌', panelText: '每个围栏都有一个QR码。扫码即可用您的语言收听那里动物的故事。', photoAlt: '示意图片：',
    wild: { elephant: '大象', giraffe: '长颈鹿', panda: '熊猫', parrot: '鹦鹉', zebra: '斑马' },
    credit: '示意图片，并非在园内拍摄',
    hoursTitle: '开放时间', hours: '每天 07:00 – 18:30'
  }
};

const STEP_ICONS = ['fa-qrcode', 'fa-headphones', 'fa-person-walking'];

export default function Home() {
  const navigate = useNavigate();
  const { openQR } = useOutletContext();
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

      {/* CỘT PHẢI: bảng giới thiệu và giờ mở cửa */}
      <div className="mt-7 space-y-10 lg:mt-0">
        {/* Bảng giới thiệu kiểu biển diễn giải ngoài trời: khung xanh, thân trắng, ảnh có chú thích */}
        <section aria-labelledby="panel-title" className="overflow-hidden rounded-md border-2 border-sign bg-white">
          <div className="flex items-center justify-between bg-sign px-5 py-3 text-trail">
            <h2 id="panel-title" className="font-sign text-xl font-extrabold">{t.panelTitle}</h2>
            <i className="fa-solid fa-binoculars" aria-hidden="true"></i>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-base text-post">{t.panelText}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PANEL_PHOTOS.map((p, i) => (
                <AnimalImage
                  key={p.id}
                  src={photo(p.id, i === 0 ? 900 : 450)}
                  alt={`${t.photoAlt} ${t.wild[p.key]}`}
                  className={`w-full rounded ${i === 0 ? 'col-span-2 aspect-[16/10] sm:row-span-2 sm:aspect-auto sm:h-full' : 'aspect-square'}`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-post-soft">{t.credit}</p>
          </div>
        </section>

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
