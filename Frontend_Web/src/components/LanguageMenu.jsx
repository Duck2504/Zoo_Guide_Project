import { useEffect, useRef, useState } from 'react';
import { useVisitor } from '../context/VisitorContext';

// Danh sách ngôn ngữ lấy từ bảng Languages (VisitorContext). Mã ngôn ngữ bằng chữ thay cho cờ emoji (Windows không vẽ được cờ).
const MENU_LABEL = { vi: 'Ngôn ngữ', en: 'Language', ko: '언어', ja: '言語' };

// variant: "menu" (nút + danh sách thả xuống), "onPhoto" (nút trắng đè lên ảnh), "wall" (các mã ngôn ngữ xếp liền trên tường xanh của trang chủ)
export default function LanguageMenu({ onPhoto = false, variant = onPhoto ? 'onPhoto' : 'menu' }) {
  const { language, setLanguage, languages } = useVisitor();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find(l => l.code === language);
  const menuLabel = MENU_LABEL[language] || MENU_LABEL.vi;

  // Đóng khi bấm ra ngoài hoặc nhấn Esc
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
      <div role="group" aria-label={menuLabel} className="flex">
        {languages.map(lang => (
          <button
            key={lang.code}
            lang={lang.code}
            aria-pressed={language === lang.code}
            aria-label={`${lang.code.toUpperCase()} – ${lang.name}`}
            title={lang.name}
            onClick={() => setLanguage(lang.code)}
            className={`-ml-px flex h-11 min-w-11 items-center justify-center border px-2 font-label-narrow text-sm font-bold uppercase transition-colors ${
              language === lang.code ? 'z-10 border-label bg-label text-wall' : 'border-label/35 text-label/90 hover:bg-label/10'
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
        className={`flex min-h-11 items-center gap-2 px-3.5 text-sm font-semibold uppercase transition-colors ${
          variant === 'onPhoto' ? 'bg-label font-label text-ink hover:bg-white' : 'rounded-full border border-trail-line bg-white text-post hover:border-sign/40'
        }`}
      >
        <i className="fa-solid fa-language" aria-hidden="true"></i>
        {language}
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true"></i>
      </button>

      {open && (
        <ul aria-label={menuLabel} className="absolute right-0 top-full z-50 mt-2 w-44 bg-label py-1 font-label shadow-[0_16px_32px_-12px_rgb(0_0_0/0.5)]">
          {languages.map(lang => (
            <li key={lang.code}>
              <button
                lang={lang.code}
                aria-current={language === lang.code ? 'true' : undefined}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`flex min-h-11 w-full items-center justify-between px-4 text-left text-sm font-semibold transition-colors ${
                  language === lang.code ? 'bg-ink text-label' : 'text-ink hover:bg-ink/5'
                }`}
              >
                {lang.name}
                <span className="text-xs font-semibold uppercase opacity-70">{lang.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
