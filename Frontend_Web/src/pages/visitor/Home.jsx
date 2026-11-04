import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { API } from '../../config';
import { useVisitor } from '../../context/VisitorContext';
import AnimalImage from '../../components/AnimalImage';

// Ảnh minh họa từ Unsplash (không phải ảnh chụp tại Thảo Cầm Viên) — nên thay bằng ảnh thật của vườn khi có.
const photo = (id, w) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;
const HERO_PHOTO = 'photo-1557050543-4d5f4e07ef46'; // voi trên đồng cỏ
const WILD_PHOTOS = [
  { id: 'photo-1547721064-da6cfb341d50', key: 'giraffe' },
  { id: 'photo-1564349683136-77e08dba1ef7', key: 'panda' },
  { id: 'photo-1552728089-57bdde30beb3', key: 'parrot' },
  { id: 'photo-1526095179574-86e545346ae6', key: 'zebra' },
  { id: 'photo-1503066211613-c17ebc9daef0', key: 'tiger' },
];

const translations = {
  vi: {
    greeting: 'Xin chào 👋',
    description: 'Hệ thống thuyết minh đa ngôn ngữ. Quét mã QR tại chuồng thú hoặc bật định vị để nghe tự động.',
    scanQR: 'Quét mã QR', openMap: 'Mở bản đồ',
    species: n => `${n} loài động vật`, languages: '4 ngôn ngữ thuyết minh', hours: '07:00 – 18:30 mỗi ngày',
    howTitle: 'Tham quan trong 3 bước',
    steps: [['Quét mã QR', 'Mã đặt tại mỗi chuồng thú'], ['Đi theo bản đồ', 'Bật định vị để tự mở thuyết minh'], ['Nghe thuyết minh', 'Chọn ngôn ngữ bạn muốn']],
    animalsTitle: 'Động vật tại vườn', animalsEmpty: 'Danh sách động vật đang được cập nhật.',
    wildTitle: 'Thế giới hoang dã', wildDesc: 'Hàng trăm loài đang chờ bạn khám phá.',
    wild: { giraffe: 'Hươu cao cổ', panda: 'Gấu trúc', parrot: 'Vẹt', zebra: 'Ngựa vằn', tiger: 'Hổ trắng' },
    credit: 'Ảnh minh họa: Unsplash'
  },
  en: {
    greeting: 'Hello 👋',
    description: 'Multilingual audio guide. Scan QR codes at enclosures or enable location for auto-playback.',
    scanQR: 'Scan QR code', openMap: 'Open map',
    species: n => `${n} animal species`, languages: '4 guide languages', hours: '07:00 – 18:30 daily',
    howTitle: 'Visit in 3 steps',
    steps: [['Scan a QR code', 'Found at every enclosure'], ['Follow the map', 'Turn on location for auto-guides'], ['Listen', 'Pick your language']],
    animalsTitle: 'Animals at the zoo', animalsEmpty: 'The animal list is being updated.',
    wildTitle: 'The wild world', wildDesc: 'Hundreds of species are waiting for you.',
    wild: { giraffe: 'Giraffe', panda: 'Panda', parrot: 'Parrot', zebra: 'Zebra', tiger: 'White tiger' },
    credit: 'Illustrative photos: Unsplash'
  },
  ko: {
    greeting: '안녕하세요 👋',
    description: '다국어 오디오 가이드. 동물 우리에서 QR을 스캔하거나 위치를 켜면 자동으로 재생됩니다.',
    scanQR: 'QR 스캔', openMap: '지도 열기',
    species: n => `동물 ${n}종`, languages: '4개 언어 가이드', hours: '매일 07:00 – 18:30',
    howTitle: '3단계로 관람하기',
    steps: [['QR 스캔', '각 동물 우리에 있습니다'], ['지도 따라가기', '위치를 켜면 자동 안내'], ['가이드 듣기', '원하는 언어 선택']],
    animalsTitle: '동물원의 동물들', animalsEmpty: '동물 목록을 업데이트하는 중입니다.',
    wildTitle: '야생의 세계', wildDesc: '수백 종의 동물이 기다리고 있습니다.',
    wild: { giraffe: '기린', panda: '판다', parrot: '앵무새', zebra: '얼룩말', tiger: '백호' },
    credit: '참고 사진: Unsplash'
  },
  ja: {
    greeting: 'こんにちは 👋',
    description: '多言語音声ガイド。QRコードをスキャンするか、位置情報を有効にすると自動再生されます。',
    scanQR: 'QRスキャン', openMap: 'マップを開く',
    species: n => `${n}種の動物`, languages: '4言語の音声ガイド', hours: '毎日 07:00 – 18:30',
    howTitle: '3ステップで見学',
    steps: [['QRをスキャン', '各展示場にあります'], ['マップに沿って', '位置情報で自動再生'], ['ガイドを聞く', '言語を選べます']],
    animalsTitle: '園内の動物', animalsEmpty: '動物リストを更新中です。',
    wildTitle: '野生の世界', wildDesc: '何百種もの動物があなたを待っています。',
    wild: { giraffe: 'キリン', panda: 'パンダ', parrot: 'オウム', zebra: 'シマウマ', tiger: 'ホワイトタイガー' },
    credit: 'イメージ写真: Unsplash'
  },
  zh: {
    greeting: '您好 👋',
    description: '多语言语音导览。在动物围栏处扫描QR码或启用定位即可自动播放。',
    scanQR: '扫描QR码', openMap: '打开地图',
    species: n => `${n} 种动物`, languages: '4 种导览语言', hours: '每天 07:00 – 18:30',
    howTitle: '三步游览',
    steps: [['扫描QR码', '每个围栏处都有'], ['跟随地图', '开启定位自动导览'], ['收听导览', '选择您的语言']],
    animalsTitle: '园内动物', animalsEmpty: '动物列表正在更新。',
    wildTitle: '野生世界', wildDesc: '数百种动物等你来探索。',
    wild: { giraffe: '长颈鹿', panda: '熊猫', parrot: '鹦鹉', zebra: '斑马', tiger: '白虎' },
    credit: '示意图片: Unsplash'
  }
};

const STEP_ICONS = ['fa-qrcode', 'fa-map-location-dot', 'fa-headphones'];

export default function Home() {
  const navigate = useNavigate();
  const { openQR } = useOutletContext();
  const { language } = useVisitor();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'web_home';
  const [animals, setAnimals] = useState(null); // null = đang tải

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

  // Danh sách động vật thật để hiện ở dải ảnh "Động vật tại vườn"
  useEffect(() => {
    fetch(`${API}/api/animals`)
      .then(res => (res.ok ? res.json() : []))
      .then(setAnimals)
      .catch(() => setAnimals([]));
  }, []);

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 pb-28 space-y-8 md:space-y-10">

      {/* HERO: ảnh lớn + lớp phủ xanh lá đủ đậm để chữ trắng dễ đọc */}
      <section className="relative overflow-hidden rounded-3xl bg-zoo-900 shadow-xl shadow-zoo-900/20 min-h-[22rem] md:min-h-[26rem] [@media(max-height:500px)]:min-h-[15rem] flex">
        <img
          src={photo(HERO_PHOTO, 1400)}
          srcSet={`${photo(HERO_PHOTO, 640)} 640w, ${photo(HERO_PHOTO, 1024)} 1024w, ${photo(HERO_PHOTO, 1600)} 1600w`}
          sizes="(min-width: 1152px) 1100px, 100vw"
          alt=""
          fetchpriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zoo-950/95 via-zoo-900/70 to-zoo-900/20 md:bg-gradient-to-r md:from-zoo-950/95 md:via-zoo-900/70 md:to-transparent" />
        <div className="relative z-10 mt-auto w-full p-6 sm:p-8 md:my-auto md:max-w-lg text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">{t.greeting}</h2>
          <p className="text-zoo-50/90 text-sm sm:text-base leading-relaxed mb-6">{t.description}</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={openQR} className="min-h-12 inline-flex items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-zoo-900 shadow-sm transition-[transform,background-color] duration-150 hover:bg-zoo-50 active:scale-[0.97]">
              <i className="fa-solid fa-qrcode" aria-hidden="true"></i> {t.scanQR}
            </button>
            <button onClick={() => navigate('/map')} className="min-h-12 inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-sm transition-[transform,background-color] duration-150 hover:bg-white/20 active:scale-[0.97]">
              <i className="fa-solid fa-map-location-dot" aria-hidden="true"></i> {t.openMap}
            </button>
          </div>
        </div>
      </section>

      {/* THÔNG TIN NHANH */}
      <section className="flex flex-wrap gap-2">
        {animals?.length > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-zoo-50 px-4 py-2 text-xs sm:text-sm font-bold text-zoo-800">
            <i className="fa-solid fa-paw" aria-hidden="true"></i> {t.species(animals.length)}
          </span>
        )}
        <span className="inline-flex items-center gap-2 rounded-full bg-zoo-50 px-4 py-2 text-xs sm:text-sm font-bold text-zoo-800">
          <i className="fa-solid fa-language" aria-hidden="true"></i> {t.languages}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-zoo-50 px-4 py-2 text-xs sm:text-sm font-bold text-zoo-800">
          <i className="fa-solid fa-clock" aria-hidden="true"></i> {t.hours}
        </span>
      </section>

      {/* ĐỘNG VẬT THẬT TỪ HỆ THỐNG: điện thoại vuốt ngang, màn lớn thành lưới */}
      <section>
        <h3 className="mb-4 text-lg sm:text-xl font-extrabold text-gray-900">{t.animalsTitle}</h3>
        {animals === null ? (
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2].map(i => <div key={i} className="aspect-[4/5] w-40 shrink-0 rounded-2xl bg-gray-200 motion-safe:animate-pulse" />)}
          </div>
        ) : animals.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-gray-500 border border-gray-100">{t.animalsEmpty}</p>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {animals.map(a => (
              <Link key={a.id} to={`/a/${a.id}`} className="group w-40 shrink-0 snap-start md:w-auto">
                <div className="aspect-[4/5] md:aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                  <AnimalImage src={a.avatarUrl} alt={a.defaultLocalName} className="h-full w-full transition-transform duration-300 ease-out md:group-hover:scale-105" />
                </div>
                <p className="mt-2 truncate text-sm font-bold text-gray-900">{a.defaultLocalName}</p>
                <p className="truncate text-xs italic text-zoo-700">{a.scientificName}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CÁCH SỬ DỤNG */}
      <section>
        <h3 className="mb-4 text-lg sm:text-xl font-extrabold text-gray-900">{t.howTitle}</h3>
        <ol className="grid gap-3 sm:grid-cols-3">
          {t.steps.map(([title, desc], i) => (
            <li key={title} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-col sm:items-start">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zoo-600 text-lg text-white">
                <i className={`fa-solid ${STEP_ICONS[i]}`} aria-hidden="true"></i>
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">{i + 1}. {title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* KHỐI ẢNH TRANG TRÍ */}
      <section>
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">{t.wildTitle}</h3>
        <p className="mb-4 text-sm text-gray-500">{t.wildDesc}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
          {WILD_PHOTOS.map((p, i) => (
            <figure key={p.id} className={`relative overflow-hidden rounded-2xl bg-gray-100 ${i === 0 ? 'col-span-2 aspect-[2/1] md:row-span-2 md:aspect-auto' : 'aspect-square'}`}>
              <AnimalImage src={photo(p.id, i === 0 ? 900 : 450)} alt={t.wild[p.key]} className="h-full w-full" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-xs sm:text-sm font-bold text-white">{t.wild[p.key]}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-2 text-right text-[11px] text-gray-400">{t.credit}</p>
      </section>
    </div>
  );
}
