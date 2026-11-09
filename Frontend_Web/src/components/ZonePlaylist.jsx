import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { markListened } from '../utils/listened';

// "Nghe cả khu": một thẻ audio đặt ở layout, nên bấm vào một con trong danh sách (sang trang khác) không ngắt danh sách đang phát.
const PlaylistContext = createContext(null);

export function ZonePlaylistProvider({ zoneId, language, children }) {
  const [list, setList] = useState(null); // { zoneId, tracks, index } hoặc null = không phát
  const audioRef = useRef(null);
  const current = list && list.index < list.tracks.length ? list.tracks[list.index] : null;

  // Đổi ngôn ngữ (link audio khác) hoặc bước sang khu khác thì dừng danh sách cũ
  useEffect(() => { setList(null); }, [language, zoneId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!current) { audio?.pause(); return; }
    audio.src = current.audioUrl;
    audio.play().catch(() => setList(null));
  }, [current]);

  const next = () => setList(l => (l && l.index + 1 < l.tracks.length ? { ...l, index: l.index + 1 } : null));

  const value = {
    zoneId: list?.zoneId ?? null,
    current,
    index: list?.index ?? -1,
    play: (id, tracks) => setList({ zoneId: id, tracks, index: 0 }),
    stop: () => setList(null),
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onPlay={() => current && markListened(current.id)}
        // Bị dừng từ ngoài (vd bấm nghe ở trang con vật) thì thôi phát danh sách; hết bài thì onEnded chuyển bài
        onPause={e => { if (!e.currentTarget.ended) setList(null); }}
        onEnded={next}
        onError={next}
      />
    </PlaylistContext.Provider>
  );
}

export const useZonePlaylist = () => useContext(PlaylistContext);
