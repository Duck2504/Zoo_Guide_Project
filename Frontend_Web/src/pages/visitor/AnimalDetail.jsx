import { useEffect, useState, useRef } from 'react';
import { API } from '../../config';
import { useParams, useNavigate, useSearchParams, useLocation, useOutletContext } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import AnimalImage from '../../components/AnimalImage';
import LanguageMenu from '../../components/LanguageMenu';
import { markListened } from '../../utils/listened';

const translations = {
  vi: { scanNext: 'Quét chuồng kế tiếp', zoneMap: 'Xem khu này trên bản đồ', back: 'Quay lại', audioTitle: 'Thuyết minh tự động', notFound: 'Không tìm thấy thông tin.', noAudio: 'Chưa có thuyết minh cho ngôn ngữ này', viewOnMap: 'Xem trên bản đồ', play: 'Phát thuyết minh', pause: 'Tạm dừng', rewind: 'Lùi 10 giây', speed: 'Tốc độ đọc', seek: 'Vị trí đang nghe', photo: 'Ảnh: Wikimedia Commons', factsTitle: 'Thông tin nhanh', facts: ['Mức bảo tồn', 'Thức ăn', 'Nơi sống', 'Tuổi thọ'], years: n => `khoảng ${n} năm`, iucn: { LC: 'Ít quan ngại', NT: 'Sắp bị đe dọa', VU: 'Sắp nguy cấp', EN: 'Nguy cấp', CR: 'Cực kỳ nguy cấp', EW: 'Tuyệt chủng ngoài tự nhiên' }, diet: { carnivore: 'Ăn thịt', herbivore: 'Ăn thực vật', omnivore: 'Ăn tạp' }, habitat: { rainforest: 'Rừng mưa nhiệt đới', forest: 'Rừng', savanna: 'Đồng cỏ xavan', wetland: 'Đầm lầy', coast: 'Vùng ven biển' } },
  en: { scanNext: 'Scan the next enclosure', zoneMap: 'See this zone on the map', back: 'Back', audioTitle: 'Auto Audio Guide', notFound: 'Information not found.', noAudio: 'No audio guide in this language yet', viewOnMap: 'View on map', play: 'Play audio guide', pause: 'Pause', rewind: 'Back 10 seconds', speed: 'Playback speed', seek: 'Playback position', photo: 'Photo: Wikimedia Commons', factsTitle: 'Quick facts', facts: ['Conservation', 'Diet', 'Habitat', 'Lifespan'], years: n => `about ${n} years`, iucn: { LC: 'Least concern', NT: 'Near threatened', VU: 'Vulnerable', EN: 'Endangered', CR: 'Critically endangered', EW: 'Extinct in the wild' }, diet: { carnivore: 'Carnivore', herbivore: 'Herbivore', omnivore: 'Omnivore' }, habitat: { rainforest: 'Rainforest', forest: 'Forest', savanna: 'Savanna', wetland: 'Wetland', coast: 'Coast' } },
  ko: { scanNext: '다음 우리 스캔', zoneMap: '지도에서 이 구역 보기', back: '뒤로', audioTitle: '자동 오디오 가이드', notFound: '정보를 찾을 수 없습니다.', noAudio: '이 언어의 오디오 가이드가 아직 없습니다', viewOnMap: '지도에서 보기', play: '오디오 재생', pause: '일시정지', rewind: '10초 뒤로', speed: '재생 속도', seek: '재생 위치', photo: '사진: Wikimedia Commons', factsTitle: '간단 정보', facts: ['보전 상태', '먹이', '서식지', '수명'], years: n => `약 ${n}년`, iucn: { LC: '관심대상', NT: '준위협', VU: '취약', EN: '위기', CR: '위급', EW: '야생절멸' }, diet: { carnivore: '육식', herbivore: '초식', omnivore: '잡식' }, habitat: { rainforest: '열대우림', forest: '숲', savanna: '사바나', wetland: '습지', coast: '해안' } },
  ja: { scanNext: '次の展示場をスキャン', zoneMap: 'このエリアを地図で見る', back: '戻る', audioTitle: '自動音声ガイド', notFound: '情報が見つかりません。', noAudio: 'この言語の音声ガイドはまだありません', viewOnMap: '地図で見る', play: '音声ガイドを再生', pause: '一時停止', rewind: '10秒戻る', speed: '再生速度', seek: '再生位置', photo: '写真: Wikimedia Commons', factsTitle: '基本情報', facts: ['保全状況', '食性', '生息地', '寿命'], years: n => `約${n}年`, iucn: { LC: '低懸念', NT: '準絶滅危惧', VU: '危急', EN: '絶滅危惧', CR: '深刻な危機', EW: '野生絶滅' }, diet: { carnivore: '肉食', herbivore: '草食', omnivore: '雑食' }, habitat: { rainforest: '熱帯雨林', forest: '森林', savanna: 'サバンナ', wetland: '湿地', coast: '沿岸' } },
  zh: { scanNext: '扫描下一个围栏', zoneMap: '在地图上查看此区域', back: '返回', audioTitle: '自动语音导览', notFound: '未找到信息。', noAudio: '此语言暂无语音导览', viewOnMap: '在地图上查看', play: '播放语音导览', pause: '暂停', rewind: '后退10秒', speed: '播放速度', seek: '播放位置', photo: '图片：Wikimedia Commons', factsTitle: '速览', facts: ['保护状况', '食性', '栖息地', '寿命'], years: n => `约${n}年`, iucn: { LC: '无危', NT: '近危', VU: '易危', EN: '濒危', CR: '极危', EW: '野外灭绝' }, diet: { carnivore: '肉食', herbivore: '草食', omnivore: '杂食' }, habitat: { rainforest: '热带雨林', forest: '森林', savanna: '稀树草原', wetland: '湿地', coast: '海岸' } }
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
      <div className="h-[42vh] w-full bg-sign/15 motion-safe:animate-pulse" />
      <div className="mx-4 -mt-10 h-32 rounded-md bg-sign/25 motion-safe:animate-pulse" />
    </div>
  );
  if (!animal) return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-trail p-8 text-center">
      <p className="font-sign text-2xl font-bold text-post">{t.notFound}</p>
      <button onClick={() => navigate('/')} className="min-h-12 rounded bg-sign px-5 font-sign text-lg font-bold text-trail">{t.back}</button>
    </div>
  );

  return (
    <div className="relative h-full overflow-y-auto bg-trail hide-scrollbar">

      {/* Ảnh con vật, nút quay lại và ngôn ngữ đặt trên ảnh */}
      <div className="relative h-[42vh] min-h-64 w-full md:h-[52vh]">
        <AnimalImage src={animal.imageUrl} alt={animal.name} loading="eager" fetchPriority="high" className="h-full w-full" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-post/55 to-transparent" aria-hidden="true" />
        <button onClick={goBack} aria-label={t.back} className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-md bg-post/70 text-trail backdrop-blur-sm transition-colors hover:bg-post/85">
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <div className="absolute right-4 top-4 z-20"><LanguageMenu onPhoto /></div>
        {photoPage && (
          <a href={photoPage} target="_blank" rel="noopener noreferrer" className="absolute bottom-14 right-3 z-20 rounded bg-post/60 px-2 py-0.5 text-xs text-trail/90 backdrop-blur-sm hover:bg-post/80">
            {t.photo}
          </a>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-44 sm:px-6">
        {/* Biển tên con vật gắn lên ảnh */}
        <section className="relative -mt-12 rounded-md bg-sign p-5 text-trail shadow-[0_14px_28px_-14px_rgb(15_63_34/0.6)] sm:p-7">
          <div className="pointer-events-none absolute inset-2 rounded border border-trail/30" aria-hidden="true" />
          <h1 className="font-sign text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">{animal.name}</h1>
          <p className="mt-2 text-base italic text-trail/80">{animal.scientificName}</p>
          {/* Khu chỉ có mã nội bộ, chưa có tên hiển thị: cho xem vị trí trên bản đồ thay vì hiện mã */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => navigate(`/map?zone=${animal.zoneId}`)} className="inline-flex min-h-11 items-center gap-2 rounded border border-trail/40 px-4 font-sign text-base font-bold transition-colors hover:bg-trail/10">
              <i className="fa-solid fa-map-location-dot" aria-hidden="true"></i> {t.zoneMap}
            </button>
            <button onClick={openQR} className="inline-flex min-h-11 items-center gap-2 rounded border border-trail/40 px-4 font-sign text-base font-bold transition-colors hover:bg-trail/10">
              <i className="fa-solid fa-qrcode" aria-hidden="true"></i> {t.scanNext}
            </button>
          </div>
        </section>

        {facts.length > 0 && (
          <section aria-labelledby="facts-title" className="mt-6 rounded-md border-2 border-sign bg-white">
            <h2 id="facts-title" className="bg-sign px-5 py-2 font-sign text-lg font-extrabold text-trail">{t.factsTitle}</h2>
            <dl className="grid grid-cols-2 gap-px bg-trail-line">
              {facts.map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-post-soft">{label}</dt>
                  <dd className="mt-0.5 font-sign text-lg font-bold leading-tight text-post">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <p className="mt-8 max-w-[65ch] whitespace-pre-wrap text-[17px] leading-relaxed text-post">
          {animal.content}
        </p>
      </div>

      {/* TRÌNH PHÁT AUDIO: ghim đáy, nút phát vàng là hành động chính của trang */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-trail-line bg-trail/95 p-4 pb-safe backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-2 sm:gap-3">
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

          <button
            onClick={() => seekTo(audioRef.current.currentTime - 10)}
            disabled={!hasAudio}
            aria-label={t.rewind}
            title={t.rewind}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-lg text-post transition-colors hover:bg-trail-line disabled:invisible"
          >
            <i className="fa-solid fa-rotate-left" aria-hidden="true"></i>
          </button>

          <button
            onClick={togglePlayPause}
            disabled={!hasAudio}
            aria-label={!hasAudio ? t.noAudio : isPlaying ? t.pause : t.play}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-xl transition-[background-color,transform] duration-150 ${
              hasAudio ? 'bg-arrow text-post hover:bg-arrow-deep active:scale-95' : 'cursor-not-allowed bg-trail-line text-post-soft'
            }`}
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} ${!isPlaying ? 'ml-0.5' : ''}`} aria-hidden="true"></i>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-end gap-3 sm:justify-between">
              <span className="hidden truncate font-sign text-base font-bold text-post sm:inline">{t.audioTitle}</span>
              {hasAudio && (
                <span className="shrink-0 font-sign text-sm font-semibold tabular-nums text-post-soft">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>
            {hasAudio ? (
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={e => seekTo(Number(e.target.value))}
                aria-label={t.seek}
                aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                className="block h-8 w-full cursor-pointer accent-sign"
                style={{ background: 'transparent' }}
              />
            ) : (
              <p className="mt-1 text-sm text-post-soft">{t.noAudio}</p>
            )}
          </div>

          {hasAudio && (
            <button
              onClick={nextSpeed}
              aria-label={`${t.speed}: ${speed}×`}
              title={t.speed}
              className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-trail-line px-2 font-sign text-sm font-bold tabular-nums text-post transition-colors hover:bg-trail-line"
            >
              {speed}×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
