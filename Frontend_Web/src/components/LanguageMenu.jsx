import { useEffect, useRef, useState } from 'react';
import { useVisitor } from '../context/VisitorContext';

// Dùng chung cho header du khách và trang con vật. Mã ngôn ngữ bằng chữ thay cho cờ emoji (Windows không vẽ được cờ).
const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' }
];
const MENU_LABEL = { vi: 'Ngôn ngữ', en: 'Language', ko: '언어', ja: '言語', zh: '语言' };

export default function LanguageMenu({ onPhoto = false }) {
  const { language, setLanguage } = useVisitor();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === language);
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${menuLabel}: ${current?.label ?? language}`}
        className={`flex min-h-11 items-center gap-2 rounded-md px-3 font-sign text-sm font-bold uppercase tracking-wider transition-colors ${
          onPhoto ? 'bg-post/70 text-trail backdrop-blur-sm hover:bg-post/85' : 'border border-trail-line bg-white text-post hover:border-sage'
        }`}
      >
        <i className="fa-solid fa-language" aria-hidden="true"></i>
        {language}
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true"></i>
      </button>

      {open && (
        <ul aria-label={menuLabel} className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-md border border-trail-line bg-white py-1 shadow-[0_16px_32px_-12px_rgb(28_43_34/0.35)]">
          {LANGUAGES.map(lang => (
            <li key={lang.code}>
              <button
                lang={lang.code}
                aria-current={language === lang.code ? 'true' : undefined}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`flex min-h-11 w-full items-center justify-between px-4 text-left text-sm font-semibold transition-colors ${
                  language === lang.code ? 'bg-sign text-trail' : 'text-post hover:bg-sage-soft'
                }`}
              >
                {lang.label}
                <span className="font-sign text-xs font-bold uppercase tracking-wider opacity-70">{lang.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
