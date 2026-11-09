import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimalImage from './AnimalImage';
import PlayingBars from './PlayingBars';
import { getListened, LISTENED_EVENT } from '../utils/listened';
import { useZonePlaylist } from './ZonePlaylist';
import { getZoneText } from '../utils/zoneText';

// Danh sách con vật của một khu + nút "Nghe cả khu" (phát lần lượt bằng một thẻ audio).
// Dùng chung cho trang chủ (variant "wall": nhãn vuông trên tường xanh) và ngăn kéo khu (kiểu ứng dụng).
export default function ZoneAnimalList({ zone, language, onNavigate, variant = 'app' }) {
  const wall = variant === 'wall';
  const t = getZoneText(language);
  const [listened, setListened] = useState(getListened);
  const listenedRef = useRef(listened);
  const [fresh, setFresh] = useState(() => new Set()); // dấu vừa đóng trong lúc đang xem, để chạy hiệu ứng đóng dấu
  const playlist = useZonePlaylist();

  useEffect(() => {
    const update = () => {
      const next = getListened();
      setFresh(new Set([...next].filter(id => !listenedRef.current.has(id))));
      listenedRef.current = next;
      setListened(next);
    };
    window.addEventListener(LISTENED_EVENT, update);
    return () => window.removeEventListener(LISTENED_EVENT, update);
  }, []);

  const tracks = zone.animals.filter(a => a.audioUrl);

  const playing = playlist.zoneId === zone.id ? playlist.current : null;
  const track = playing ? playlist.index : -1;

  return (
    <div>
      <ul className="space-y-2">
        {zone.animals.map((a, i) => (
          <li key={a.id} className={wall && i < 4 ? 'label-in' : undefined} style={wall && i < 4 ? { animationDelay: `${80 + i * 50}ms` } : undefined}>
            <Link
              to={`/a/${a.id}?source=geo`}
              onClick={onNavigate}
              aria-current={playing?.id === a.id ? 'true' : undefined}
              className={`flex min-h-16 items-center gap-3 border p-2 pr-3 transition-colors ${wall ? 'bg-white text-ink' : 'rounded-2xl bg-white text-post'} ${playing?.id === a.id ? 'border-onair ring-2 ring-onair' : wall ? 'border-ink/15 hover:border-ink/40' : 'border-trail-line hover:border-sign/40'}`}
            >
              <AnimalImage src={a.avatarUrl} alt="" className={`h-12 w-12 shrink-0 ${wall ? '' : 'rounded-xl'}`} />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm ${wall ? 'font-bold' : 'font-semibold'}`}>{a.defaultLocalName}</span>
                <span className={`block truncate italic ${wall ? 'font-latin text-[13px] text-ink-soft' : 'text-xs text-post-soft'}`}>{a.scientificName}</span>
              </span>
              {listened.has(a.id) && (
                <span className={wall ? `${fresh.has(a.id) ? 'stamp-in ' : ''}shrink-0 -rotate-3 border-2 border-wall px-1.5 text-xs font-bold uppercase leading-5 text-wall` : 'flex shrink-0 items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-xs font-medium text-sign-deep'}>
                  {!wall && <i className="fa-solid fa-check" aria-hidden="true"></i>}{t.listened}
                </span>
              )}
              {playing?.id === a.id && <PlayingBars className="shrink-0 text-onair" />}
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
            onClick={() => (playing ? playlist.stop() : playlist.play(zone.id, tracks))}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 px-4 text-sm font-semibold transition-[color,background-color,border-color,scale] duration-150 ease-out active:scale-[0.97] ${wall ? (playing ? 'border-2 border-ink bg-white text-ink hover:bg-label' : 'bg-ink text-label hover:bg-wall') : `rounded-2xl ${playing ? 'border border-sign bg-white text-sign hover:bg-sage-soft' : 'bg-sign text-white hover:bg-sign-deep'}`}`}
          >
            <i className={`fa-solid ${playing ? 'fa-stop' : 'fa-play'}`} aria-hidden="true"></i>
            {playing ? t.stop : `${t.playAll} (${tracks.length})`}
          </button>
          {playing && <span className={`shrink-0 text-xs font-medium ${wall ? 'text-ink-soft' : 'text-post-soft'}`} aria-live="polite">{t.nowPlaying(track + 1, tracks.length)}</span>}
        </div>
      )}
    </div>
  );
}
