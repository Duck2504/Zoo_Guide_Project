import { useEffect, useState, useRef } from 'react';
import { API } from '../../config';
import { useParams, useNavigate, useSearchParams, useLocation, useOutletContext } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import AnimalImage from '../../components/AnimalImage';
import LanguageMenu from '../../components/LanguageMenu';

const translations = {
  vi: { scanNext: 'Quét chuồng kế tiếp', zoneMap: 'Xem khu này trên bản đồ', back: 'Quay lại', audioTitle: 'Thuyết minh tự động', notFound: 'Không tìm thấy thông tin.', noAudio: 'Chưa có thuyết minh cho ngôn ngữ này', viewOnMap: 'Xem trên bản đồ', play: 'Phát thuyết minh', pause: 'Tạm dừng' },
  en: { scanNext: 'Scan the next enclosure', zoneMap: 'See this zone on the map', back: 'Back', audioTitle: 'Auto Audio Guide', notFound: 'Information not found.', noAudio: 'No audio guide in this language yet', viewOnMap: 'View on map', play: 'Play audio guide', pause: 'Pause' },
  ko: { scanNext: '다음 우리 스캔', zoneMap: '지도에서 이 구역 보기', back: '뒤로', audioTitle: '자동 오디오 가이드', notFound: '정보를 찾을 수 없습니다.', noAudio: '이 언어의 오디오 가이드가 아직 없습니다', viewOnMap: '지도에서 보기', play: '오디오 재생', pause: '일시정지' },
  ja: { scanNext: '次の展示場をスキャン', zoneMap: 'このエリアを地図で見る', back: '戻る', audioTitle: '自動音声ガイド', notFound: '情報が見つかりません。', noAudio: 'この言語の音声ガイドはまだありません', viewOnMap: '地図で見る', play: '音声ガイドを再生', pause: '一時停止' },
  zh: { scanNext: '扫描下一个围栏', zoneMap: '在地图上查看此区域', back: '返回', audioTitle: '自动语音导览', notFound: '未找到信息。', noAudio: '此语言暂无语音导览', viewOnMap: '在地图上查看', play: '播放语音导览', pause: '暂停' }
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
            imageUrl: data.avatarUrl || '',
            zoneId: data.zoneId,
            zoneName: data.zoneName || `Khu vực ${data.zoneId}`,
            content: data.scriptText || 'Nội dung thuyết minh đang được cập nhật...',
            audioUrl: data.audioUrl || ''
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

  // --- AUDIO CONTROL FUNCTIONS ---
  const togglePlayPause = () => {
    if (!audioRef.current || !hasAudio) return;

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
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-36 sm:px-6">
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

        <p className="mt-8 max-w-[65ch] whitespace-pre-wrap text-[17px] leading-relaxed text-post">
          {animal.content}
        </p>
      </div>

      {/* TRÌNH PHÁT AUDIO: ghim đáy, nút phát vàng là hành động chính của trang */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-trail-line bg-trail/95 p-4 pb-safe backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          {animal.audioUrl && (
            <audio
              onError={() => { setAudioFailed(true); setIsPlaying(false); }}
              ref={audioRef}
              src={animal.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              onLoadedMetadata={handleLoadedMetadata}
            />
          )}

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
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate font-sign text-base font-bold text-post">{t.audioTitle}</span>
              {hasAudio && (
                <span className="shrink-0 font-sign text-sm font-semibold tabular-nums text-post-soft">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>
            {hasAudio ? (
              <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-trail-line">
                <div className="h-full rounded-full bg-sign transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
              </div>
            ) : (
              <p className="mt-1 text-sm text-post-soft">{t.noAudio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
