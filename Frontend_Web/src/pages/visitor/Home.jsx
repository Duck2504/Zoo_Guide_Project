import { useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { API } from '../../config';
import { getAnimals } from '../../utils/animalsApi';
import { IUCN_TONE } from '../../utils/iucn';
import { useVisitor } from '../../context/VisitorContext';
import AroundYou from '../../components/AroundYou';
import AnimalImage from '../../components/AnimalImage';
import { getListened, LISTENED_EVENT } from '../../utils/listened';

const translations = {
  vi: {
    orScan: 'Hoặc quét mã trên nhãn chuồng',
    orScanBody: 'Mỗi chuồng có một mã QR. Quét để mở thẳng bài thuyết minh của con vật đó, không cần bật định vị.',
    openCamera: 'Mở camera quét mã',
    featured: 'Loài nổi bật', featuredSub: n => `${n} điểm nghe trong vườn, xếp theo mức bảo tồn`,
    stop: 'Điểm nghe', listened: 'Đã nghe', allOnMap: 'Xem tất cả trên bản đồ', loadFail: 'Chưa tải được danh sách loài. Kiểm tra mạng rồi mở lại trang.',
    iucn: { LC: 'Ít quan ngại', NT: 'Sắp bị đe dọa', VU: 'Sắp nguy cấp', EN: 'Nguy cấp', CR: 'Cực kỳ nguy cấp', EW: 'Tuyệt chủng ngoài tự nhiên' },
    hoursTitle: 'Giờ mở cửa', hours: '07:00 – 18:30, mỗi ngày', langsTitle: 'Ngôn ngữ thuyết minh',
    demo: 'Đồ án môn học, không phải trang chính thức của Thảo Cầm Viên.', photos: 'Ảnh động vật: Wikimedia Commons.'
  },
  en: {
    orScan: 'Or scan the code on the enclosure label',
    orScanBody: 'Every enclosure has a QR code. Scan it to open that animal’s guide directly, no location needed.',
    openCamera: 'Open camera to scan',
    featured: 'Featured animals', featuredSub: n => `${n} listening stops in the zoo, ordered by conservation status`,
    stop: 'Stop', listened: 'Listened', allOnMap: 'See all on the map', loadFail: 'The animal list could not be loaded. Check your connection and reopen the page.',
    iucn: { LC: 'Least concern', NT: 'Near threatened', VU: 'Vulnerable', EN: 'Endangered', CR: 'Critically endangered', EW: 'Extinct in the wild' },
    hoursTitle: 'Opening hours', hours: '07:00 – 18:30, daily', langsTitle: 'Guide languages',
    demo: 'A student project, not an official Saigon Zoo website.', photos: 'Animal photos: Wikimedia Commons.'
  },
  ja: {
    orScan: 'または展示場ラベルのコードをスキャン',
    orScanBody: '各展示場にQRコードがあります。スキャンするとその動物のガイドが直接開きます。位置情報は不要です。',
    openCamera: 'カメラを開いてスキャン',
    featured: '注目の動物', featuredSub: n => `園内の音声ポイント ${n} か所（保全状況の順）`,
    stop: 'ポイント', listened: '聞いた', allOnMap: '地図ですべて見る', loadFail: '動物リストを読み込めませんでした。接続を確認してページを開き直してください。',
    iucn: { LC: '低懸念', NT: '準絶滅危惧', VU: '危急', EN: '絶滅危惧', CR: '深刻な危機', EW: '野生絶滅' },
    hoursTitle: '開園時間', hours: '毎日 07:00 – 18:30', langsTitle: 'ガイドの言語',
    demo: '学生の課題制作であり、サイゴン動植物園の公式サイトではありません。', photos: '動物の写真：Wikimedia Commons'
  },
  ko: {
    orScan: '또는 우리 라벨의 코드를 스캔하세요',
    orScanBody: '모든 우리에 QR 코드가 있습니다. 스캔하면 해당 동물의 해설이 바로 열립니다. 위치는 필요 없습니다.',
    openCamera: '카메라 열고 스캔',
    featured: '주요 동물', featuredSub: n => `동물원 내 청취 지점 ${n}곳, 보전 상태 순`,
    stop: '지점', listened: '들음', allOnMap: '지도에서 모두 보기', loadFail: '동물 목록을 불러오지 못했습니다. 연결을 확인하고 페이지를 다시 여세요.',
    iucn: { LC: '관심대상', NT: '준위협', VU: '취약', EN: '위기', CR: '위급', EW: '야생절멸' },
    hoursTitle: '운영 시간', hours: '매일 07:00 – 18:30', langsTitle: '해설 언어',
    demo: '학생 과제 프로젝트이며 사이공 동물원 공식 사이트가 아닙니다.', photos: '동물 사진: Wikimedia Commons'
  }
};

// Mức bảo tồn: nặng nhất lên trước; màu ô mã theo bảng màu Sách Đỏ IUCN, chữ mực ở nền sáng để đủ tương phản.
// Ô mã là ô đặc; trạng thái "đang phát" là viền cam son quanh cả nhãn, nên ô EN cam không bị đọc nhầm.
const SEVERITY = { EW: 5, CR: 4, EN: 3, VU: 2, NT: 1, LC: 0 };
const FEATURED_COUNT = 4;
const stopNo = id => String(id).padStart(2, '0');

export default function Home() {
  const { openQR, geo } = useOutletContext();
  const { language, languages } = useVisitor();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'web_home';
  const t = translations[language] || translations['vi'];
  const [animals, setAnimals] = useState(null); // null = đang tải, 'error' = lỗi
  const [listened, setListened] = useState(getListened);

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

  // Danh sách loài theo ngôn ngữ đang chọn (tên và mức bảo tồn cho các nhãn nổi bật)
  useEffect(() => {
    let cancelled = false;
    getAnimals(language)
      .then(data => { if (!cancelled) setAnimals(data); })
      .catch(() => { if (!cancelled) setAnimals('error'); });
    return () => { cancelled = true; };
  }, [language]);

  useEffect(() => {
    const update = () => setListened(getListened());
    window.addEventListener(LISTENED_EVENT, update);
    return () => window.removeEventListener(LISTENED_EVENT, update);
  }, []);

  const list = Array.isArray(animals) ? animals : [];
  const zoneCount = new Set(list.map(a => a.zoneId)).size;
  const featured = [...list]
    .sort((a, b) => (SEVERITY[b.conservationStatus] ?? -1) - (SEVERITY[a.conservationStatus] ?? -1) || a.id - b.id)
    .slice(0, FEATURED_COUNT);

  return (
    <div className="wall-page mx-auto max-w-5xl px-4 pb-10 pt-4 font-label text-label sm:px-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-10 lg:px-8 lg:pt-8">

      {/* Cột trái: nhãn lớn nghe theo vị trí, rồi nhãn quét mã (dính khi cuộn trên máy tính) */}
      <div className="lg:sticky lg:top-22">
        {/* Cách nghe chính: theo vị trí */}
        <AroundYou geo={geo} language={language} languages={languages} zoneCount={zoneCount} />

        {/* Cách thứ hai: quét mã QR trên nhãn chuồng (nút viền, để định vị là hành động nổi bật nhất) */}
        <section aria-labelledby="scan-title" className="mt-3 bg-label p-5 text-ink sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink text-2xl" aria-hidden="true">
              <i className="fa-solid fa-qrcode" aria-hidden="true"></i>
            </span>
            <div>
              <h2 id="scan-title" className="text-lg font-extrabold leading-tight">{t.orScan}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.orScanBody}</p>
            </div>
          </div>
          <button
            onClick={openQR}
            className="mt-4 flex min-h-12 w-full items-center justify-between border-2 border-ink px-4 text-left text-[15px] font-semibold transition-colors hover:bg-white"
          >
            <span className="flex items-center gap-3"><i className="fa-solid fa-camera" aria-hidden="true"></i>{t.openCamera}</span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </section>
      </div>

      {/* Cột phải: các nhãn loài cùng một khuôn, rồi khối thông tin ở chân trang */}
      <div className="mt-8 lg:mt-0">
        <section aria-labelledby="featured-title">
          <h2 id="featured-title" className="text-2xl font-extrabold tracking-[-0.01em]">{t.featured}</h2>
          {list.length > 0 && <p className="mt-1 text-sm text-label/80">{t.featuredSub(list.length)}</p>}

          {animals === null ? (
            <div className="mt-4 space-y-2" aria-busy="true">
              {Array.from({ length: FEATURED_COUNT }, (_, i) => <div key={i} className="h-[88px] bg-label/10 motion-safe:animate-pulse" />)}
            </div>
          ) : animals === 'error' ? (
            <p role="alert" className="mt-4 bg-label p-4 text-sm text-ink">{t.loadFail}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {featured.map((a, i) => (
                <li key={a.id} className="label-in" style={{ animationDelay: `${i * 70}ms` }}>
                  <Link
                    to={`/a/${a.id}?source=web_home`}
                    className="group grid min-h-[88px] grid-cols-[3.5rem_3.5rem_minmax(0,1fr)] items-center gap-2.5 bg-label p-3 pr-3 min-[400px]:grid-cols-[4.25rem_4rem_minmax(0,1fr)] min-[400px]:gap-3 min-[400px]:pr-4 text-ink transition-colors hover:bg-white"
                  >
                    <span className="text-center">
                      <span className="block font-label-narrow text-[2rem] font-bold leading-none text-wall">{stopNo(a.id)}</span>
                      <span className="mt-0.5 block text-xs font-medium leading-tight text-ink-soft min-[400px]:whitespace-nowrap">{t.stop}</span>
                    </span>
                    <AnimalImage src={a.avatarUrl} alt="" className="h-14 w-14 min-[400px]:h-16 min-[400px]:w-16" />
                    <span className="min-w-0">
                      <span className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 text-base font-bold leading-tight">{a.defaultLocalName}</span>
                        {listened.has(a.id) && (
                          <span className="shrink-0 -rotate-3 border-2 border-wall px-1.5 text-xs font-bold uppercase leading-5 text-wall">{t.listened}</span>
                        )}
                      </span>
                      <span className="block truncate font-latin text-[13px] italic text-ink-soft">{a.scientificName}</span>
                      {a.conservationStatus && (
                        <span className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                          <span className={`px-1.5 font-label-narrow text-xs font-bold leading-5 ${IUCN_TONE[a.conservationStatus] || 'bg-ink text-label'}`}>{a.conservationStatus}</span>
                          <span className="truncate">{t.iucn[a.conservationStatus]}</span>
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link to="/map" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-label underline decoration-label/40 underline-offset-4 hover:decoration-label">
            {t.allOnMap}<i className="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
          </Link>
        </section>

        {/* Chân trang: khối thông tin dày, trung thực về bối cảnh đồ án */}
        <footer className="mt-10 border-t border-label/20 pt-6 text-sm">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-label/70">{t.hoursTitle}</dt>
              <dd className="mt-0.5 font-semibold">{t.hours}</dd>
            </div>
            <div>
              <dt className="text-label/70">{t.langsTitle}</dt>
              <dd className="mt-0.5 font-semibold">
                {languages.map(l => <span key={l.code} lang={l.code} className="block">{l.name}</span>)}
              </dd>
            </div>
          </dl>
          <p className="mt-6 leading-relaxed text-label/75">{t.demo} {t.photos}</p>
        </footer>
      </div>
    </div>
  );
}
