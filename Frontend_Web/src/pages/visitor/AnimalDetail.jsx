import { useEffect, useState, useRef } from 'react';
import { API } from '../../config';
import { getAnimals } from '../../utils/animalsApi';
import { IUCN_TONE } from '../../utils/iucn';
import { Link, useParams, useNavigate, useSearchParams, useLocation, useOutletContext } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import AnimalImage from '../../components/AnimalImage';
import LanguageMenu from '../../components/LanguageMenu';
import PlayingBars from '../../components/PlayingBars';
import { getListened, markListened } from '../../utils/listened';

const translations = {
  vi: { back: 'Quay lại', notFound: 'Không tìm thấy thông tin.', noAudio: 'Chưa có thuyết minh cho ngôn ngữ này', play: 'Phát thuyết minh', pause: 'Tạm dừng', rewind: 'Lùi 10 giây', speed: 'Tốc độ đọc', seek: 'Vị trí đang nghe', photo: 'Ảnh: Wikimedia Commons', factsTitle: 'Thông tin nhanh', facts: ['Mức bảo tồn', 'Thức ăn', 'Nơi sống', 'Tuổi thọ'], years: n => `khoảng ${n} năm`, iucn: { LC: 'Ít quan ngại', NT: 'Sắp bị đe dọa', VU: 'Sắp nguy cấp', EN: 'Nguy cấp', CR: 'Cực kỳ nguy cấp', EW: 'Tuyệt chủng ngoài tự nhiên' }, diet: { carnivore: 'Ăn thịt', herbivore: 'Ăn thực vật', omnivore: 'Ăn tạp' }, habitat: { rainforest: 'Rừng mưa nhiệt đới', forest: 'Rừng', savanna: 'Đồng cỏ xavan', wetland: 'Đầm lầy', coast: 'Vùng ven biển' }, listen: 'Nghe thuyết minh', nextUp: 'Nghe tiếp', waking: 'Máy chủ đang khởi động, chờ chút nhé…', offline: 'Chưa kết nối được máy chủ. Kiểm tra mạng rồi thử lại.', retry: 'Thử lại', about: 'Giới thiệu', mapShort: 'Bản đồ', scanMore: 'Quét tiếp', directionsShort: 'Chỉ đường', sameZone: z => `Cùng ${z}`, lives: z => `Sống tại `, livesEnd: '', statusIs: s => `, mức bảo tồn: ${s}.` },
  en: { back: 'Back', notFound: 'Information not found.', noAudio: 'No audio guide in this language yet', play: 'Play audio guide', pause: 'Pause', rewind: 'Back 10 seconds', speed: 'Playback speed', seek: 'Playback position', photo: 'Photo: Wikimedia Commons', factsTitle: 'Quick facts', facts: ['Conservation', 'Diet', 'Habitat', 'Lifespan'], years: n => `about ${n} years`, iucn: { LC: 'Least concern', NT: 'Near threatened', VU: 'Vulnerable', EN: 'Endangered', CR: 'Critically endangered', EW: 'Extinct in the wild' }, diet: { carnivore: 'Carnivore', herbivore: 'Herbivore', omnivore: 'Omnivore' }, habitat: { rainforest: 'Rainforest', forest: 'Forest', savanna: 'Savanna', wetland: 'Wetland', coast: 'Coast' }, listen: 'Listen to the guide', nextUp: 'Up next', waking: 'The server is waking up, just a moment…', offline: 'Could not reach the server. Check your connection and try again.', retry: 'Try again', about: 'About', mapShort: 'Map', scanMore: 'Scan next', directionsShort: 'Directions', sameZone: z => `Also in ${z}`, lives: z => `Lives in `, livesEnd: '', statusIs: s => `; conservation status: ${s}.` },
  ko: { back: '뒤로', notFound: '정보를 찾을 수 없습니다.', noAudio: '이 언어의 오디오 가이드가 아직 없습니다', play: '오디오 재생', pause: '일시정지', rewind: '10초 뒤로', speed: '재생 속도', seek: '재생 위치', photo: '사진: Wikimedia Commons', factsTitle: '간단 정보', facts: ['보전 상태', '먹이', '서식지', '수명'], years: n => `약 ${n}년`, iucn: { LC: '관심대상', NT: '준위협', VU: '취약', EN: '위기', CR: '위급', EW: '야생절멸' }, diet: { carnivore: '육식', herbivore: '초식', omnivore: '잡식' }, habitat: { rainforest: '열대우림', forest: '숲', savanna: '사바나', wetland: '습지', coast: '해안' }, listen: '해설 듣기', nextUp: '다음 동물', waking: '서버를 깨우는 중입니다. 잠시만 기다려 주세요…', offline: '서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.', retry: '다시 시도', about: '소개', mapShort: '지도', scanMore: '다음 스캔', directionsShort: '길찾기', sameZone: z => `${z}의 다른 동물`, lives: z => ``, livesEnd: '에서 살고 있어요', statusIs: s => `. 보전 상태: ${s}` },
  ja: { back: '戻る', notFound: '情報が見つかりません。', noAudio: 'この言語の音声ガイドはまだありません', play: '音声ガイドを再生', pause: '一時停止', rewind: '10秒戻る', speed: '再生速度', seek: '再生位置', photo: '写真: Wikimedia Commons', factsTitle: '基本情報', facts: ['保全状況', '食性', '生息地', '寿命'], years: n => `約${n}年`, iucn: { LC: '低懸念', NT: '準絶滅危惧', VU: '危急', EN: '絶滅危惧', CR: '深刻な危機', EW: '野生絶滅' }, diet: { carnivore: '肉食', herbivore: '草食', omnivore: '雑食' }, habitat: { rainforest: '熱帯雨林', forest: '森林', savanna: 'サバンナ', wetland: '湿地', coast: '沿岸' }, listen: '音声ガイドを聞く', nextUp: '次の動物', waking: 'サーバーを起動しています。少々お待ちください…', offline: 'サーバーに接続できません。接続を確認してもう一度お試しください。', retry: '再試行', about: '紹介', mapShort: 'マップ', scanMore: '次をスキャン', directionsShort: 'ルート案内', sameZone: z => `${z}のほかの動物`, lives: z => ``, livesEnd: 'で暮らしています', statusIs: s => `。保全状況：${s}` },
};

const SPEEDS = [1, 1.25, 0.75];

const NEIGHBOUR_COUNT = 3;

// Tên file trên Commons lấy từ link ảnh, để dẫn về trang ghi tác giả/giấy phép của ảnh
const commonsPage = (url) => {
  const m = /(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?]+)/.exec(url || '');
  return m ? `https://commons.wikimedia.org/wiki/File:${m[1]}` : null;
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
  const routerLocation = useLocation();
  const { openQR } = useOutletContext();
  // Vào thẳng từ mã QR thì không có lịch sử trong app: quay lại đưa về trang chủ
  const goBack = () => (routerLocation.key === 'default' ? navigate('/') : navigate(-1));
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'web';

  const { language } = useVisitor();
  const [animal, setAnimal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null); // 'missing' (không có con này) | 'network' (máy chủ/mạng lỗi)
  const [retry, setRetry] = useState(0);
  const [slow, setSlow] = useState(false); // tải quá 3 giây: thường là máy chủ Render đang khởi động lại

  // --- AUDIO STATES & REFS ---
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false); // link audio có nhưng tải lỗi
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const playerRef = useRef(null);
  const [showMini, setShowMini] = useState(false);
  const [zoneAnimals, setZoneAnimals] = useState([]); // các con khác cùng khu, để đi tiếp
  const [isBuffering, setIsBuffering] = useState(false); // đã bấm phát nhưng audio còn đang tải (mạng chậm)
  const [ended, setEnded] = useState(false); // nghe hết bài: gợi ý con tiếp theo
  const titleRef = useRef(null);

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
    // Không đưa `language` vào: đổi ngôn ngữ không phải một lượt quét mới
  }, [id, source]);

  // 2. Fetch data động vật TỪ DATABASE THEO API THẬT
  useEffect(() => {
    const fetchAnimalData = async () => {
      if (!id) return;
      setIsLoading(true);
      setLoadError(null);
      
      // Reset lại audio khi đổi bài hoặc đổi ngôn ngữ
      setIsPlaying(false);
      setAudioFailed(false);
      setCurrentTime(0);
      setIsBuffering(false);
      setEnded(false);

      try {
        const response = await fetch(`${API}/api/animals/${id}?lang=${language}`);
        if (response.ok) {
          const data = await response.json();
          setAnimal({
            id: data.id,
            name: data.defaultLocalName || 'Đang cập nhật tên...',
            scientificName: data.scientificName || 'Chưa rõ',
            imageUrl: data.avatarUrl || '',
            zoneId: data.zoneId,
            zoneName: data.zoneName || `Khu vực ${data.zoneId}`,
            content: data.scriptText || 'Nội dung thuyết minh đang được cập nhật...',
            audioUrl: data.audioUrl || '',
            status: data.conservationStatus,
            diet: data.diet,
            habitat: data.habitat,
            lifespan: data.lifespanYears
          });
        } else {
          setAnimal(null);
          setLoadError(response.status === 404 ? 'missing' : 'network');
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu động vật từ server:", error);
        setAnimal(null);
        setLoadError('network');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimalData();
  }, [id, language, retry]);

  useEffect(() => {
    if (!isLoading) { setSlow(false); return; }
    const timer = setTimeout(() => setSlow(true), 3000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Đổi con vật trong app (Nghe tiếp, Cùng khu): đưa tiêu điểm về tên con mới thay vì rơi về đầu trang; tiêu đề tab theo tên.
  // Vào thẳng từ mã QR thì không kéo tiêu điểm.
  const animalId = animal?.id;
  useEffect(() => {
    if (!animalId) return;
    const siteTitle = document.title;
    document.title = titleRef.current?.textContent || siteTitle;
    if (routerLocation.key !== 'default') titleRef.current?.focus({ preventScroll: true });
    return () => { document.title = siteTitle; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId]);

  // Các con cùng khu (ảnh thật + tên theo ngôn ngữ đang chọn) cho mục "Cùng khu"
  useEffect(() => {
    let cancelled = false;
    getAnimals(language)
      .then(list => { if (!cancelled && Array.isArray(list)) setZoneAnimals(list); })
      .catch(() => { /* mục Cùng khu chỉ ẩn đi */ });
    return () => { cancelled = true; };
  }, [language]);

  // Thẻ trình phát khuất khỏi màn hình (đã cuộn xuống đọc) thì hiện thanh phát nhỏ ở đáy
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowMini(!e.isIntersecting), { rootMargin: '0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [animal, isLoading]);

  const hasAudio = !!animal?.audioUrl && !audioFailed;
  const neighbours = animal ? zoneAnimals.filter(a => a.zoneId === animal.zoneId && a.id !== animal.id).slice(0, NEIGHBOUR_COUNT) : [];
  // Con tiếp theo: ưu tiên con trong khu chưa nghe
  const nextUp = ended ? (neighbours.find(a => !getListened().has(a.id)) || neighbours[0]) : null;
  const photoPage = commonsPage(animal?.imageUrl);
  // Chỉ hiện mục có dữ liệu và có bản dịch (mã lạ thì bỏ qua)
  const facts = animal ? [
    [t.facts[0], t.iucn[animal.status]],
    [t.facts[1], t.diet[animal.diet]],
    [t.facts[2], t.habitat[animal.habitat]],
    [t.facts[3], animal.lifespan ? t.years(animal.lifespan) : null],
  ].filter(([, v]) => v) : [];

  // --- AUDIO CONTROL FUNCTIONS ---
  const togglePlayPause = () => {
    if (!audioRef.current || !hasAudio) return;

    if (audioRef.current.paused) {
      setIsBuffering(true); // tắt khi sự kiện playing/pause/error tới
      audioRef.current.play().catch(() => setIsBuffering(false));
    } else audioRef.current.pause();
  };

  const seekTo = (seconds) => {
    const a = audioRef.current;
    if (!a || !isFinite(a.duration)) return;
    a.currentTime = Math.min(Math.max(0, seconds), a.duration);
    handleTimeUpdate();
  };

  const nextSpeed = () => {
    const s = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleAudioEnded = () => {
    setCurrentTime(0);
    setEnded(true);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = speed; // đổi ngôn ngữ = đổi file, trình duyệt đặt lại tốc độ về 1
    }
  };

  if (isLoading) return (
    <div className="min-h-[100dvh] bg-wall" aria-busy="true">
      <div className="h-[40vh] w-full bg-label/10 motion-safe:animate-pulse md:h-[62vh] lg:h-[52vh]" />
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-14 w-2/3 bg-label/10 motion-safe:animate-pulse" />
        <div className="h-28 bg-label/10 motion-safe:animate-pulse" />
        {slow && <p role="status" className="text-base font-label text-label">{t.waking}</p>}
      </div>
    </div>
  );
  if (!animal) return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-wall p-8 text-center font-label text-label">
      <p role="alert" className="max-w-[34ch] text-xl font-bold">{loadError === 'network' ? t.offline : t.notFound}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {loadError === 'network' && <button onClick={() => setRetry(r => r + 1)} className="min-h-12 bg-label px-5 text-base font-semibold text-ink">{t.retry}</button>}
        <button onClick={() => navigate('/')} className={`min-h-12 px-5 text-base font-semibold ${loadError === 'network' ? 'border-2 border-label' : 'bg-label text-ink'}`}>{t.back}</button>
      </div>
    </div>
  );

  const playIcon = isBuffering
    ? <i className="fa-solid fa-circle-notch motion-safe:animate-spin" aria-hidden="true"></i>
    : <i key={isPlaying ? 'pause' : 'play'} className={`icon-swap fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-0.5'}`} aria-hidden="true"></i>;
  const playLabel = !hasAudio ? t.noAudio : isPlaying || isBuffering ? t.pause : t.play;
  const ctrl = 'flex min-h-10 items-center justify-center gap-2 rounded-xl bg-ink/5 px-3.5 text-sm font-bold text-ink transition-colors hover:bg-ink/10';

  return (
    <div className="wall-page wall-ambient relative bg-wall font-label text-label">

      {/* Ảnh con vật với lớp phủ chuyển sắc mượt mà */}
      <div className="relative h-[42vh] w-full overflow-hidden md:h-[60vh] lg:h-[52vh]">
        <AnimalImage src={animal.imageUrl} alt={animal.name} loading="eager" fetchPriority="high" hero className="hero-drift h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-wall via-wall/45 to-transparent" aria-hidden="true" />
        <button onClick={goBack} aria-label={t.back} className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-xl bg-label/90 text-ink shadow-lg backdrop-blur-md transition-all hover:bg-white active:scale-95 sm:left-6 lg:left-8">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div className="absolute right-4 top-4 z-20 sm:right-6 lg:right-8"><LanguageMenu onPhoto /></div>
      </div>

      <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 pb-32 pt-2 sm:px-6 lg:px-8">
        {/* Tên và trình phát */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-14">
          <div>
            <h1 ref={titleRef} tabIndex={-1} className="label-in outline-none text-[clamp(2.5rem,8vw,6.25rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-white text-balance drop-shadow-xs">{animal.name}</h1>
            <p className="label-in mt-3 max-w-[40ch] text-lg leading-snug text-label/90 sm:text-xl" style={{ animationDelay: '70ms' }}>
              {t.lives(animal.zoneName)}
              <button onClick={() => navigate(`/map?zone=${animal.zoneId}`)} className="font-bold text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:decoration-emerald-300">{animal.zoneName}</button>
              {t.livesEnd}
              {animal.status && t.iucn[animal.status] ? t.statusIs(t.iucn[animal.status]) : '.'}
            </p>
            <p className="label-in mt-1.5 font-latin text-base italic text-emerald-200/80" style={{ animationDelay: '140ms' }}>{animal.scientificName}</p>
          </div>
          {/* Trình phát thẻ bo tròn */}
          <section ref={playerRef} aria-label={t.listen} className="label-in rounded-3xl border border-ink/5 bg-label p-5 text-ink shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)] sm:p-6" style={{ animationDelay: '210ms' }}>
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                disabled={!hasAudio}
                aria-label={playLabel}
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-lg transition-all duration-150 ${
                  hasAudio ? 'bg-gradient-to-br from-wall to-emerald-800 text-label hover:brightness-110 active:scale-95' : 'cursor-not-allowed bg-ink/10 text-ink-soft'
                }`}
              >
                {playIcon}
              </button>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2.5 text-lg font-extrabold sm:text-xl">{hasAudio ? t.listen : t.noAudio}{isPlaying && <PlayingBars className="text-wall" />}</p>
                {hasAudio && (
                  <>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={e => seekTo(Number(e.target.value))}
                      aria-label={t.seek}
                      aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                      className="block h-7 w-full cursor-pointer accent-wall"
                      style={{ background: 'transparent' }}
                    />
                    <div className="flex justify-between text-xs font-semibold tabular-nums text-ink-soft sm:text-sm">
                      <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {hasAudio && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => seekTo(audioRef.current.currentTime - 10)} aria-label={t.rewind} className={ctrl}>
                  <i className="fa-solid fa-rotate-left" aria-hidden="true"></i>10s
                </button>
                <button onClick={nextSpeed} aria-label={`${t.speed}: ${speed}×`} className={`${ctrl} min-w-12 tabular-nums`}>{speed}×</button>
              </div>
            )}
            <div aria-live="polite">
              {nextUp && (
                <Link to={`/a/${nextUp.id}?source=zone`} className="label-in mt-4 flex items-center gap-3 rounded-2xl bg-wall p-2.5 pr-4 text-label shadow-md transition-all hover:bg-emerald-800">
                  <AnimalImage src={nextUp.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-200/80">{t.nextUp}</span>
                    <span className="block truncate text-base font-bold">{nextUp.defaultLocalName}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <i className="fa-solid fa-play text-xs" aria-hidden="true"></i>
                  </span>
                </Link>
              )}
            </div>
          </section>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div className="space-y-10">
            <section aria-labelledby="about-title" className="label-in rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8" style={{ animationDelay: '280ms' }}>
              <h2 id="about-title" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-[-0.01em] text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-sm text-emerald-300">
                  <i className="fa-solid fa-book-open" aria-hidden="true"></i>
                </span>
                {t.about}
              </h2>
              <p className="mt-4 max-w-[60ch] whitespace-pre-wrap text-lg leading-relaxed text-label/90 sm:text-xl">{animal.content}</p>
            </section>
          </div>

          <div className="space-y-10">
            {facts.length > 0 && (
              <section aria-labelledby="facts-title" className="label-in" style={{ animationDelay: '350ms' }}>
                <h2 id="facts-title" className="text-2xl font-extrabold tracking-[-0.01em] text-white">{t.factsTitle}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  {facts.map(([label, value], i) => (
                    <div key={label} className="label-in rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xs" style={{ animationDelay: `${380 + i * 70}ms` }}>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-emerald-200/75">{label}</dt>
                      <dd className="mt-1.5 flex items-center gap-2 text-base font-bold leading-tight text-white sm:text-lg">
                        {i === 0 && animal.status && <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold ${IUCN_TONE[animal.status] || 'bg-label text-ink'}`}>{animal.status}</span>}
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {neighbours.length > 0 && (
              <section aria-labelledby="zone-title" className="label-in" style={{ animationDelay: '420ms' }}>
                <h2 id="zone-title" className="text-2xl font-extrabold tracking-[-0.01em] text-white">{t.sameZone(animal.zoneName)}</h2>
                <ul className="mt-4 space-y-2.5">
                  {neighbours.map((a, i) => (
                    <li key={a.id} className="label-in" style={{ animationDelay: `${450 + i * 70}ms` }}>
                      <Link to={`/a/${a.id}?source=zone`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-wall-deep/80 p-2.5 pr-4 transition-all hover:border-white/20 hover:bg-label hover:text-ink">
                        <AnimalImage src={a.avatarUrl} alt="" className="h-20 w-28 shrink-0 rounded-xl min-[400px]:h-24 min-[400px]:w-32" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg font-bold leading-tight sm:text-xl">{a.defaultLocalName}</span>
                          <span className="mt-0.5 block truncate font-latin text-sm italic opacity-75 sm:text-base">{a.scientificName}</span>
                        </span>
                        <i className="fa-solid fa-arrow-right transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true"></i>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="label-in grid grid-cols-1 gap-2.5 sm:grid-cols-3" style={{ animationDelay: '490ms' }}>
              <button
                onClick={() => navigate(`/map?zone=${animal.zoneId}&nav=1`)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 text-base font-bold text-white shadow-lg shadow-emerald-950/30 transition-all hover:bg-emerald-400 active:scale-[0.98]"
              >
                <i className="fa-solid fa-diamond-turn-right" aria-hidden="true"></i>{t.directionsShort}
              </button>
              <button
                onClick={() => navigate(`/map?zone=${animal.zoneId}`)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-3 text-base font-semibold text-label transition-all hover:bg-label hover:text-ink"
              >
                <i className="fa-solid fa-map" aria-hidden="true"></i>{t.mapShort}
              </button>
              <button
                onClick={openQR}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-3 text-base font-semibold text-label transition-all hover:bg-label hover:text-ink"
              >
                <i className="fa-solid fa-qrcode" aria-hidden="true"></i>{t.scanMore}
              </button>
            </div>
          </div>
        </div>

        {photoPage && (
          <p className="mt-14 text-sm text-label/75">
            <a href={photoPage} target="_blank" rel="noopener noreferrer" className="underline decoration-label/40 underline-offset-4 hover:decoration-label">{t.photo}</a>
          </p>
        )}
      </div>

      {animal.audioUrl && (
        <audio
          onError={() => { setAudioFailed(true); setIsPlaying(false); setIsBuffering(false); }}
          onPlay={() => { setIsPlaying(true); setEnded(false); markListened(animal.id); }}
          onPlaying={() => setIsBuffering(false)}
          onWaiting={() => setIsBuffering(true)}
          onPause={() => { setIsPlaying(false); setIsBuffering(false); }}
          ref={audioRef}
          src={animal.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {hasAudio && (
        <div data-hidden={showMini ? undefined : ''} className={'mini-player fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-wall-deep/95 px-4 pb-safe backdrop-blur-md shadow-[0_-12px_32px_-10px_rgb(0_0_0/0.65)]'}>
          <div className="mx-auto flex max-w-6xl items-center gap-3 py-2.5 sm:px-2 lg:px-4">
            <button onClick={togglePlayPause} aria-label={playLabel} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-label text-ink transition-all hover:bg-white active:scale-95">
              {playIcon}
            </button>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-base font-bold text-white"><span className="truncate">{animal.name}</span>{isPlaying && <PlayingBars className="shrink-0 text-emerald-400" />}</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-label/75 sm:text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
