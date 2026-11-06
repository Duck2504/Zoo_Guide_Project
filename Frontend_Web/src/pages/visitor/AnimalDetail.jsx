import { useEffect, useState, useRef } from 'react';
import { API } from '../../config';
import { useParams, useNavigate, useSearchParams, useLocation, useOutletContext } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import AnimalImage from '../../components/AnimalImage';
import LanguageMenu from '../../components/LanguageMenu';
import { markListened } from '../../utils/listened';

const translations = {
  vi: { scanNext: 'Quét chuồng kế tiếp', zoneMap: 'Xem khu này trên bản đồ', back: 'Quay lại', audioTitle: 'Thuyết minh tự động', notFound: 'Không tìm thấy thông tin.', noAudio: 'Chưa có thuyết minh cho ngôn ngữ này', viewOnMap: 'Xem trên bản đồ', play: 'Phát thuyết minh', pause: 'Tạm dừng', rewind: 'Lùi 10 giây', speed: 'Tốc độ đọc', seek: 'Vị trí đang nghe', photo: 'Ảnh: Wikimedia Commons', factsTitle: 'Thông tin nhanh', facts: ['Mức bảo tồn', 'Thức ăn', 'Nơi sống', 'Tuổi thọ'], years: n => `khoảng ${n} năm`, iucn: { LC: 'Ít quan ngại', NT: 'Sắp bị đe dọa', VU: 'Sắp nguy cấp', EN: 'Nguy cấp', CR: 'Cực kỳ nguy cấp', EW: 'Tuyệt chủng ngoài tự nhiên' }, diet: { carnivore: 'Ăn thịt', herbivore: 'Ăn thực vật', omnivore: 'Ăn tạp' }, habitat: { rainforest: 'Rừng mưa nhiệt đới', forest: 'Rừng', savanna: 'Đồng cỏ xavan', wetland: 'Đầm lầy', coast: 'Vùng ven biển' }, listen: 'Nghe thuyết minh', about: 'Giới thiệu', mapShort: 'Bản đồ', scanMore: 'Quét tiếp' },
  en: { scanNext: 'Scan the next enclosure', zoneMap: 'See this zone on the map', back: 'Back', audioTitle: 'Auto Audio Guide', notFound: 'Information not found.', noAudio: 'No audio guide in this language yet', viewOnMap: 'View on map', play: 'Play audio guide', pause: 'Pause', rewind: 'Back 10 seconds', speed: 'Playback speed', seek: 'Playback position', photo: 'Photo: Wikimedia Commons', factsTitle: 'Quick facts', facts: ['Conservation', 'Diet', 'Habitat', 'Lifespan'], years: n => `about ${n} years`, iucn: { LC: 'Least concern', NT: 'Near threatened', VU: 'Vulnerable', EN: 'Endangered', CR: 'Critically endangered', EW: 'Extinct in the wild' }, diet: { carnivore: 'Carnivore', herbivore: 'Herbivore', omnivore: 'Omnivore' }, habitat: { rainforest: 'Rainforest', forest: 'Forest', savanna: 'Savanna', wetland: 'Wetland', coast: 'Coast' }, listen: 'Listen to the guide', about: 'About', mapShort: 'Map', scanMore: 'Scan next' },
  ko: { scanNext: '다음 우리 스캔', zoneMap: '지도에서 이 구역 보기', back: '뒤로', audioTitle: '자동 오디오 가이드', notFound: '정보를 찾을 수 없습니다.', noAudio: '이 언어의 오디오 가이드가 아직 없습니다', viewOnMap: '지도에서 보기', play: '오디오 재생', pause: '일시정지', rewind: '10초 뒤로', speed: '재생 속도', seek: '재생 위치', photo: '사진: Wikimedia Commons', factsTitle: '간단 정보', facts: ['보전 상태', '먹이', '서식지', '수명'], years: n => `약 ${n}년`, iucn: { LC: '관심대상', NT: '준위협', VU: '취약', EN: '위기', CR: '위급', EW: '야생절멸' }, diet: { carnivore: '육식', herbivore: '초식', omnivore: '잡식' }, habitat: { rainforest: '열대우림', forest: '숲', savanna: '사바나', wetland: '습지', coast: '해안' }, listen: '해설 듣기', about: '소개', mapShort: '지도', scanMore: '다음 스캔' },
  ja: { scanNext: '次の展示場をスキャン', zoneMap: 'このエリアを地図で見る', back: '戻る', audioTitle: '自動音声ガイド', notFound: '情報が見つかりません。', noAudio: 'この言語の音声ガイドはまだありません', viewOnMap: '地図で見る', play: '音声ガイドを再生', pause: '一時停止', rewind: '10秒戻る', speed: '再生速度', seek: '再生位置', photo: '写真: Wikimedia Commons', factsTitle: '基本情報', facts: ['保全状況', '食性', '生息地', '寿命'], years: n => `約${n}年`, iucn: { LC: '低懸念', NT: '準絶滅危惧', VU: '危急', EN: '絶滅危惧', CR: '深刻な危機', EW: '野生絶滅' }, diet: { carnivore: '肉食', herbivore: '草食', omnivore: '雑食' }, habitat: { rainforest: '熱帯雨林', forest: '森林', savanna: 'サバンナ', wetland: '湿地', coast: '沿岸' }, listen: '音声ガイドを聞く', about: '紹介', mapShort: 'マップ', scanMore: '次をスキャン' },
};

const SPEEDS = [1, 1.25, 0.75];

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

  // --- AUDIO STATES & REFS ---
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false); // link audio có nhưng tải lỗi
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const scrollRef = useRef(null);
  const playerRef = useRef(null);
  const [showMini, setShowMini] = useState(false);

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
      
      // Reset lại audio khi đổi bài hoặc đổi ngôn ngữ
      setIsPlaying(false);
      setAudioFailed(false);
      setCurrentTime(0);

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

  // Thẻ trình phát khuất khỏi màn hình (đã cuộn xuống đọc) thì hiện thanh phát nhỏ ở đáy
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowMini(!e.isIntersecting), { root: scrollRef.current });
    io.observe(el);
    return () => io.disconnect();
  }, [animal, isLoading]);

  const hasAudio = !!animal?.audioUrl && !audioFailed;
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

    if (audioRef.current.paused) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
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
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = speed; // đổi ngôn ngữ = đổi file, trình duyệt đặt lại tốc độ về 1
    }
  };

  if (isLoading) return (
    <div className="h-full bg-trail" aria-busy="true">
      <div className="h-56 w-full bg-sign/10 motion-safe:animate-pulse md:h-80" />
      <div className="-mt-6 space-y-3 rounded-t-3xl bg-trail px-4 pt-6">
        <div className="h-8 w-2/3 rounded-xl bg-sign/10 motion-safe:animate-pulse" />
        <div className="h-24 rounded-2xl bg-sign/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
  if (!animal) return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-trail p-8 text-center">
      <p className="text-xl font-semibold text-post">{t.notFound}</p>
      <button onClick={() => navigate('/')} className="min-h-12 rounded-2xl bg-sign px-5 text-base font-semibold text-white">{t.back}</button>
    </div>
  );

  const statusTone = { CR: 'text-red-700', EN: 'text-red-700', VU: 'text-orange-700', NT: 'text-amber-700', LC: 'text-sign', EW: 'text-red-800' }[animal.status] || 'text-post';
  const playIcon = <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} ${!isPlaying ? 'ml-0.5' : ''}`} aria-hidden="true"></i>;
  const playLabel = !hasAudio ? t.noAudio : isPlaying ? t.pause : t.play;

  return (
    <div ref={scrollRef} className="relative h-full overflow-y-auto bg-trail hide-scrollbar">

      {/* Ảnh con vật; nút quay lại và ngôn ngữ dạng nút tròn đè trên ảnh */}
      <div className="relative h-56 w-full md:h-80">
        <AnimalImage src={animal.imageUrl} alt={animal.name} loading="eager" fetchPriority="high" className="h-full w-full" />
        <button onClick={goBack} aria-label={t.back} className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-post backdrop-blur-sm transition-colors hover:bg-white">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div className="absolute right-4 top-4 z-20"><LanguageMenu onPhoto /></div>
        {photoPage && (
          <a href={photoPage} target="_blank" rel="noopener noreferrer" className="absolute bottom-9 right-3 z-20 rounded-full bg-black/45 px-2.5 py-0.5 text-[11px] text-white/90 backdrop-blur-sm hover:bg-black/60">
            {t.photo}
          </a>
        )}
      </div>

      <div className="relative z-10 -mt-6 rounded-t-3xl bg-trail">
        <div className="mx-auto max-w-2xl px-4 pb-32 pt-5 sm:px-6">
          <button onClick={() => navigate(`/map?zone=${animal.zoneId}`)} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sage-soft px-3 text-xs font-medium text-sign-deep transition-colors hover:bg-arrow-deep">
            <i className="fa-solid fa-location-dot" aria-hidden="true"></i>{animal.zoneName}
          </button>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-post">{animal.name}</h1>
          <p className="text-sm italic text-post-soft">{animal.scientificName}</p>

          {/* Trình phát: hành động chính của trang, nằm ngay màn hình đầu */}
          <section ref={playerRef} aria-label={t.listen} className="mt-4 rounded-2xl border border-trail-line bg-white p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                disabled={!hasAudio}
                aria-label={playLabel}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl transition-[background-color,transform] duration-150 ${
                  hasAudio ? 'bg-sign text-white hover:bg-sign-deep active:scale-95' : 'cursor-not-allowed bg-trail-line text-post-soft'
                }`}
              >
                {playIcon}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-post">{hasAudio ? t.listen : t.noAudio}</p>
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
                      className="block h-7 w-full cursor-pointer accent-sign"
                      style={{ background: 'transparent' }}
                    />
                    <div className="flex justify-between text-xs tabular-nums text-post-soft">
                      <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {hasAudio && (
              <div className="mt-2 flex items-center justify-between border-t border-trail-line pt-2">
                <button onClick={() => seekTo(audioRef.current.currentTime - 10)} aria-label={t.rewind} className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-post transition-colors hover:bg-trail">
                  <i className="fa-solid fa-rotate-left" aria-hidden="true"></i>10s
                </button>
                <button onClick={nextSpeed} aria-label={`${t.speed}: ${speed}×`} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-trail px-3 text-sm font-semibold tabular-nums text-post transition-colors hover:bg-trail-line">
                  {speed}×
                </button>
              </div>
            )}
          </section>

          {facts.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-2">
              {facts.map(([label, value], i) => (
                <div key={label} className="rounded-2xl border border-trail-line bg-white px-3.5 py-2.5">
                  <dt className="text-xs text-post-soft">{label}</dt>
                  <dd className={`text-sm font-semibold ${i === 0 ? statusTone : 'text-post'}`}>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <h2 className="mt-6 text-base font-semibold text-post">{t.about}</h2>
          <p className="mt-1 max-w-[65ch] whitespace-pre-wrap text-[16px] leading-relaxed text-post/90">{animal.content}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigate(`/map?zone=${animal.zoneId}`)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-trail-line bg-white text-sm font-semibold text-post transition-colors hover:border-sign/40">
              <i className="fa-solid fa-map" aria-hidden="true"></i>{t.mapShort}
            </button>
            <button onClick={openQR} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-trail-line bg-white text-sm font-semibold text-post transition-colors hover:border-sign/40">
              <i className="fa-solid fa-qrcode" aria-hidden="true"></i>{t.scanMore}
            </button>
          </div>
        </div>
      </div>

      {animal.audioUrl && (
        <audio
          onError={() => { setAudioFailed(true); setIsPlaying(false); }}
          onPlay={() => { setIsPlaying(true); markListened(animal.id); }}
          onPause={() => setIsPlaying(false)}
          ref={audioRef}
          src={animal.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {/* Thanh phát nhỏ: chỉ hiện khi đã cuộn qua thẻ trình phát, để vẫn dừng/phát được lúc đọc */}
      {hasAudio && showMini && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-trail-line bg-white/95 px-4 pb-safe backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 py-2.5">
            <button onClick={togglePlayPause} aria-label={playLabel} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sign text-white transition-colors hover:bg-sign-deep">
              {playIcon}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-post">{animal.name}</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-trail-line">
                <div className="h-full rounded-full bg-sign" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
              </div>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-post-soft">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
