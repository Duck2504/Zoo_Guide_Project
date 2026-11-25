import { useEffect, useRef, useState } from 'react';
import { useVisitor } from '../context/VisitorContext';

const MENU_LABEL = { vi: 'Ngôn ngữ', en: 'Language', ko: '언어', ja: '言語' };

export default function LanguageMenu({ onPhoto = false, variant = onPhoto ? 'onPhoto' : 'menu' }) {
  const { language, setLanguage, languages } = useVisitor();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find(l => l.code === language);
  const menuLabel = MENU_LABEL[language] || MENU_LABEL.vi;

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (variant === 'wall') {
    return (
      <div role="group" aria-label={menuLabel} className="flex overflow-hidden rounded-xl border border-white/20 bg-white/5 p-0.5 backdrop-blur-sm">
        {languages.map(lang => (
          <button
            key={lang.code}
            lang={lang.code}
            aria-pressed={language === lang.code}
            aria-label={`${lang.code.toUpperCase()} – ${lang.name}`}
            title={lang.name}
            onClick={() => setLanguage(lang.code)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 font-label-narrow text-xs font-bold uppercase transition-all ${
              language === lang.code ? 'bg-label text-wall shadow-sm' : 'text-label/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {lang.code}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${menuLabel}: ${current?.name ?? language}`}
        className={`flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold uppercase shadow-sm transition-all ${
          variant === 'onPhoto'
            ? 'bg-label/90 font-label text-ink backdrop-blur-md hover:bg-white'
            : 'border border-trail-line bg-white text-post hover:border-sign/40'
        }`}
      >
        <i className="fa-solid fa-globe text-emerald-700" aria-hidden="true"></i>
        {language}
        <i className={`fa-solid fa-chevron-down text-[10px] opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true"></i>
      </button>

      {open && (
        <ul aria-label={menuLabel} className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-ink/10 bg-label p-1.5 font-label shadow-[0_20px_40px_-12px_rgb(0_0_0/0.45)]">
          {languages.map(lang => (
            <li key={lang.code}>
              <button
                lang={lang.code}
                aria-current={language === lang.code ? 'true' : undefined}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3.5 text-left text-sm font-semibold transition-colors ${
                  language === lang.code ? 'bg-wall text-label' : 'text-ink hover:bg-ink/5'
                }`}
              >
                {lang.name}
                <span className="text-xs font-bold uppercase opacity-70">{lang.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
