import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimalImage from './AnimalImage';
import PlayingBars from './PlayingBars';
import { getListened, LISTENED_EVENT } from '../utils/listened';
import { useZonePlaylist } from './ZonePlaylist';
import { getZoneText } from '../utils/zoneText';

export default function ZoneAnimalList({ zone, language, onNavigate, variant = 'app' }) {
  const wall = variant === 'wall';
  const t = getZoneText(language);
  const [listened, setListened] = useState(getListened);
  const listenedRef = useRef(listened);
  const [fresh, setFresh] = useState(() => new Set());
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
              className={`flex min-h-16 items-center gap-3 rounded-2xl border p-2 pr-3.5 transition-all ${wall ? 'bg-white text-ink shadow-xs' : 'bg-white text-post'} ${
                playing?.id === a.id
                  ? 'border-onair ring-2 ring-onair'
                  : wall
                  ? 'border-ink/10 hover:border-wall/40 hover:shadow-md'
                  : 'border-trail-line hover:border-sign/40'
              }`}
            >
              <AnimalImage src={a.avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm ${wall ? 'font-bold' : 'font-semibold'}`}>{a.defaultLocalName}</span>
                <span className={`block truncate italic ${wall ? 'font-latin text-[13px] text-ink-soft' : 'text-xs text-post-soft'}`}>{a.scientificName}</span>
              </span>
              {listened.has(a.id) && (
                <span className={`${fresh.has(a.id) ? 'stamp-in ' : ''}flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800`}>
                  <i className="fa-solid fa-check text-[10px]" aria-hidden="true"></i>{t.listened}
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
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-150 ease-out active:scale-[0.98] ${
              wall
                ? (playing ? 'border-2 border-ink bg-white text-ink hover:bg-label' : 'bg-wall text-label shadow-md hover:bg-emerald-800')
                : (playing ? 'border border-sign bg-white text-sign hover:bg-sage-soft' : 'bg-sign text-white hover:bg-sign-deep')
            }`}
          >
            <i className={`fa-solid ${playing ? 'fa-stop' : 'fa-play'}`} aria-hidden="true"></i>
            {playing ? t.stop : `${t.playAll} (${tracks.length})`}
          </button>
          {playing && <span className={`shrink-0 text-xs font-semibold ${wall ? 'text-ink-soft' : 'text-post-soft'}`} aria-live="polite">{t.nowPlaying(track + 1, tracks.length)}</span>}
        </div>
      )}
    </div>
  );
}
