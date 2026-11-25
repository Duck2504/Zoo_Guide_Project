import { useEffect, useRef } from 'react';
import ZoneAnimalList from './ZoneAnimalList';
import { getZoneText } from '../utils/zoneText';

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
        className={`fixed right-4 z-[60] flex min-h-12 items-center gap-2 rounded-2xl border border-ink/10 bg-label/95 px-4 font-label text-base font-bold text-ink shadow-[0_14px_30px_-10px_rgb(0_0_0/0.55)] backdrop-blur-md transition-all hover:bg-white ${raised ? 'bottom-24' : 'bottom-24 lg:bottom-6'}`}
      >
        <i className="fa-solid fa-location-dot text-wall" aria-hidden="true"></i>
        <span className="max-w-[12rem] truncate">{zone.name}</span>
        <span className="rounded-lg bg-wall px-2 py-0.5 text-xs font-bold text-label">{zone.animals.length}</span>
      </button>
    );
  }

  return (
    <section
      aria-labelledby="zone-sheet-title"
      className="wall-page fixed inset-x-0 bottom-0 z-[60] max-h-[75dvh] overflow-y-auto rounded-t-3xl border border-ink/10 bg-label px-4 pb-6 pt-3 font-label text-ink shadow-[0_-18px_40px_-12px_rgb(0_0_0/0.5)] pb-safe sm:px-6 lg:left-auto lg:right-6 lg:bottom-6 lg:w-[28rem] lg:rounded-3xl"
      onTouchStart={e => { startY.current = e.touches[0].clientY; }}
      onTouchEnd={e => {
        if (startY.current != null && e.currentTarget.scrollTop === 0 && e.changedTouches[0].clientY - startY.current > 80) onClose();
        startY.current = null;
      }}
    >
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/15 lg:hidden" aria-hidden="true" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{t.youAreIn}</p>
          <h2 id="zone-sheet-title" className="text-xl font-extrabold leading-tight">
            {zone.name} <span className="text-base font-medium text-ink-soft">· {t.species(zone.animals.length)}</span>
          </h2>
        </div>
        <button onClick={onClose} aria-label={t.close} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink transition-colors hover:bg-ink/10">
          <i className="fa-solid fa-chevron-down text-lg" aria-hidden="true"></i>
        </button>
      </div>
      <ZoneAnimalList zone={zone} language={language} onNavigate={onClose} variant="wall" />
    </section>
  );
}
