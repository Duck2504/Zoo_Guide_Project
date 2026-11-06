import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimalImage from './AnimalImage';
import { getListened, markListened, LISTENED_EVENT } from '../utils/listened';
import { getZoneText } from '../utils/zoneText';

// Danh sách con vật của một khu + nút "Nghe cả khu" (phát lần lượt bằng một thẻ audio).
// Dùng chung cho trang chủ (variant "wall": nhãn vuông trên tường xanh) và ngăn kéo khu (kiểu ứng dụng).
export default function ZoneAnimalList({ zone, language, onNavigate, variant = 'app' }) {
  const wall = variant === 'wall';
  const t = getZoneText(language);
  const [listened, setListened] = useState(getListened);
  const [track, setTrack] = useState(-1); // vị trí đang phát trong danh sách có audio, -1 = không phát
  const audioRef = useRef(null);

  useEffect(() => {
    const update = () => setListened(getListened());
    window.addEventListener(LISTENED_EVENT, update);
    return () => window.removeEventListener(LISTENED_EVENT, update);
  }, []);

  const tracks = zone.animals.filter(a => a.audioUrl);

  // Đổi khu hoặc đổi ngôn ngữ thì dừng danh sách đang phát
  useEffect(() => { setTrack(-1); }, [zone.id, language]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track < 0 || track >= tracks.length) { audio.pause(); return; }
    audio.src = tracks[track].audioUrl;
    audio.play().catch(() => setTrack(-1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const playing = track >= 0 && track < tracks.length ? tracks[track] : null;

  return (
    <div>
      <ul className="space-y-2">
        {zone.animals.map(a => (
          <li key={a.id}>
            <Link
              to={`/a/${a.id}?source=geo`}
              onClick={onNavigate}
              className={`flex min-h-16 items-center gap-3 border p-2 pr-3 transition-colors ${wall ? 'bg-white text-ink' : 'rounded-2xl bg-white text-post'} ${playing?.id === a.id ? 'border-onair ring-2 ring-onair' : wall ? 'border-ink/15 hover:border-ink/40' : 'border-trail-line hover:border-sign/40'}`}
            >
              <AnimalImage src={a.avatarUrl} alt="" className={`h-12 w-12 shrink-0 ${wall ? '' : 'rounded-xl'}`} />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm ${wall ? 'font-bold' : 'font-semibold'}`}>{a.defaultLocalName}</span>
                <span className={`block truncate italic ${wall ? 'font-latin text-[13px] text-ink-soft' : 'text-xs text-post-soft'}`}>{a.scientificName}</span>
              </span>
              {listened.has(a.id) && (
                <span className={wall ? 'shrink-0 -rotate-3 border-2 border-wall px-1.5 text-[11px] font-bold uppercase leading-5 text-wall' : 'flex shrink-0 items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-xs font-medium text-sign-deep'}>
                  {!wall && <i className="fa-solid fa-check" aria-hidden="true"></i>}{t.listened}
                </span>
              )}
              <i className="fa-solid fa-chevron-right shrink-0 text-xs text-post-soft" aria-hidden="true"></i>
            </Link>
          </li>
        ))}
      </ul>

      {tracks.length === 0 ? (
        <p className={`mt-3 text-sm ${wall ? 'text-ink-soft' : 'text-post-soft'}`}>{t.noAudioZone}</p>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setTrack(playing ? -1 : 0)}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors ${wall ? (playing ? 'border-2 border-ink bg-white text-ink hover:bg-label' : 'bg-ink text-label hover:bg-wall') : `rounded-2xl ${playing ? 'border border-sign bg-white text-sign hover:bg-sage-soft' : 'bg-sign text-white hover:bg-sign-deep'}`}`}
          >
            <i className={`fa-solid ${playing ? 'fa-stop' : 'fa-play'}`} aria-hidden="true"></i>
            {playing ? t.stop : `${t.playAll} (${tracks.length})`}
          </button>
          {playing && <span className={`shrink-0 text-xs font-medium ${wall ? 'text-ink-soft' : 'text-post-soft'}`} aria-live="polite">{t.nowPlaying(track + 1, tracks.length)}</span>}
        </div>
      )}
      <audio
        ref={audioRef}
        onPlay={() => playing && markListened(playing.id)}
        // Bị dừng từ ngoài (vd mở audio khác) thì thôi phát danh sách; hết bài thì để onEnded chuyển bài
        onPause={e => { if (!e.currentTarget.ended) setTrack(-1); }}
        onEnded={() => setTrack(i => (i + 1 < tracks.length ? i + 1 : -1))}
        onError={() => setTrack(i => (i + 1 < tracks.length ? i + 1 : -1))}
      />
    </div>
  );
}
