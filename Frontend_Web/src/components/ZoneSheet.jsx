import { useEffect, useRef } from 'react';
import ZoneAnimalList from './ZoneAnimalList';
import { getZoneText } from '../utils/zoneText';

// Ngăn kéo từ đáy, không chặn trang bên dưới (không modal): hiện danh sách con vật của khu đang đứng.
// open = false thì thu lại thành nút nhỏ để mở lại.
export default function ZoneSheet({ zone, language, open, onOpen, onClose, raised }) {
  const t = getZoneText(language);
  const startY = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!zone) return null;

  if (!open) {
    return (
      <button
        onClick={onOpen}
        aria-label={`${t.openZone}: ${zone.name}`}
        className={`absolute right-4 z-[60] flex min-h-12 items-center gap-2 rounded-md bg-sign px-4 font-sign text-base font-bold text-trail shadow-[0_10px_20px_-8px_rgb(15_63_34/0.6)] transition-colors hover:bg-sign-deep ${raised ? 'bottom-28' : 'bottom-24 lg:bottom-6'}`}
      >
        <i className="fa-solid fa-location-dot text-arrow" aria-hidden="true"></i>
        <span className="max-w-[12rem] truncate">{zone.name}</span>
        <span className="rounded bg-trail/15 px-1.5 text-sm">{zone.animals.length}</span>
      </button>
    );
  }

  return (
    <section
      aria-labelledby="zone-sheet-title"
      className="absolute inset-x-0 bottom-0 z-[60] max-h-[75%] lg:left-auto lg:right-6 lg:w-[28rem] overflow-y-auto rounded-t-xl border-t border-trail-line bg-trail px-4 pb-6 pt-2 shadow-[0_-16px_32px_-12px_rgb(28_43_34/0.35)] pb-safe sm:px-6"
      onTouchStart={e => { startY.current = e.touches[0].clientY; }}
      onTouchEnd={e => {
        // Vuốt xuống từ phần trên cùng của ngăn kéo thì đóng
        if (startY.current != null && e.currentTarget.scrollTop === 0 && e.changedTouches[0].clientY - startY.current > 80) onClose();
        startY.current = null;
      }}
    >
      <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-trail-line" aria-hidden="true" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div aria-live="polite">
          <p className="font-sign text-sm font-bold uppercase tracking-wider text-post-soft">{t.youAreIn}</p>
          <h2 id="zone-sheet-title" className="font-sign text-2xl font-extrabold leading-tight text-sign">
            {zone.name} <span className="text-base font-bold text-post-soft">· {t.species(zone.animals.length)}</span>
          </h2>
        </div>
        <button onClick={onClose} aria-label={t.close} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-post transition-colors hover:bg-trail-line">
          <i className="fa-solid fa-chevron-down text-lg" aria-hidden="true"></i>
        </button>
      </div>
      <ZoneAnimalList zone={zone} language={language} onNavigate={onClose} />
    </section>
  );
}
