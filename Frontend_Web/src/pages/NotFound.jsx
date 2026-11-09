import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';

const text = {
  vi: { title: 'Không có trang này', body: 'Đường dẫn có thể đã sai hoặc trang đã bị gỡ.', home: 'Về trang chủ', map: 'Xem bản đồ', admin: 'Về trang quản trị' },
  en: { title: 'Page not found', body: 'The link may be wrong, or the page was removed.', home: 'Go to the home page', map: 'Open the map', admin: 'Back to admin' },
  ja: { title: 'ページが見つかりません', body: 'リンクが間違っているか、ページが削除されました。', home: 'ホームへ', map: '地図を見る', admin: '管理画面へ' },
  ko: { title: '페이지를 찾을 수 없습니다', body: '링크가 잘못되었거나 페이지가 삭제되었습니다.', home: '홈으로', map: '지도 보기', admin: '관리 페이지로' },
};

// Đường dẫn không khớp trang nào (kể cả /admin/... gõ sai). Không ghi lượt quét.
export default function NotFound() {
  const { language } = useVisitor();
  const t = text[language] || text.vi;
  const admin = useLocation().pathname.toLowerCase().startsWith('/admin');
  useEffect(() => {
    const siteTitle = document.title;
    document.title = t.title;
    document.documentElement.lang = text[language] ? language : 'vi';
    return () => { document.title = siteTitle; };
  }, [t.title, language]);
  const btn = 'flex min-h-12 items-center justify-center px-5 text-base font-semibold transition-colors';

  return (
    <main className="flex min-h-[100dvh] items-center bg-wall px-4 font-label text-label sm:px-6">
      <div className="mx-auto w-full max-w-md bg-label p-6 text-ink sm:p-8">
        <h1 className="text-3xl font-extrabold leading-tight tracking-[-0.02em]">{t.title}</h1>
        <p className="mt-2 text-base text-ink-soft">{t.body}</p>
        <div className="mt-6 grid gap-2">
          {admin ? (
            <Link to="/admin" className={`${btn} bg-ink text-label hover:bg-wall`}>{t.admin}</Link>
          ) : (
            <>
              <Link to="/" className={`${btn} bg-ink text-label hover:bg-wall`}>{t.home}</Link>
              <Link to="/map" className={`${btn} border-2 border-ink hover:bg-white`}>{t.map}</Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
