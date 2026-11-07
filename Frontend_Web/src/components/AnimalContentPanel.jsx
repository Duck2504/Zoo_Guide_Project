import { useEffect, useState } from 'react';
import { API } from '../config';
import { adminFetch } from '../utils/adminFetch';
import { errorText } from './AdminFeedback';

export const ADMIN_LANGS = [
  ['vi', 'Tiếng Việt'], ['en', 'Tiếng Anh'], ['ja', 'Tiếng Nhật'], ['ko', 'Tiếng Hàn'],
];

// Trạng thái audio của một ngôn ngữ: done (có audio khớp bài), stale (có audio nhưng bài đã đổi hoặc lần đọc lại lỗi), missing
export function audioState(content) {
  if (!content?.audioUrl) return 'missing';
  return content.syncStatus === 'Done' ? 'done' : 'stale';
}

// Con vật còn ngôn ngữ nào chưa có audio khớp bài
export const needsAudio = contents => ADMIN_LANGS.some(([code]) => audioState(contents?.find(c => c.languageCode === code)) !== 'done');

const CHIP = {
  done: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  stale: 'border-amber-200 bg-amber-50 text-amber-800',
  missing: 'border-slate-200 bg-white text-slate-400 line-through',
};
const STATE_TEXT = { done: 'có audio', stale: 'audio cũ, cần đọc lại', missing: 'chưa có audio' };

// Bốn ô mã ngôn ngữ trên mỗi dòng của bảng
export function AudioStatus({ contents }) {
  return (
    <ul className="flex gap-1" aria-label="Trạng thái audio">
      {ADMIN_LANGS.map(([code, name]) => {
        const state = audioState(contents?.find(c => c.languageCode === code));
        return (
          <li key={code} title={`${name}: ${STATE_TEXT[state]}`} className={`rounded-md border px-1.5 py-0.5 text-xs font-bold uppercase ${CHIP[state]}`}>
            {code}<span className="sr-only">: {STATE_TEXT[state]}</span>
          </li>
        );
      })}
    </ul>
  );
}

// Xem từng ngôn ngữ: nghe audio, đọc bản dịch, sửa bản dịch (trừ tiếng Việt) rồi đọc lại đúng chữ đã sửa
export function ContentPanel({ animal, contents, onClose, onSaved, setNotice }) {
  const [drafts, setDrafts] = useState({});
  const [savingLang, setSavingLang] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async (code, content) => {
    const draft = { localName: content.localName, scriptText: content.scriptText, ...drafts[code] };
    setSavingLang(code);
    try {
      const res = await adminFetch(`${API}/api/animals/${animal.id}/contents/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) { setNotice({ type: 'error', text: `Chưa lưu được: ${await errorText(res)}` }); return; }
      const r = await res.json();
      setNotice(r.status === 'DONE'
        ? { type: 'success', text: 'Đã lưu bản dịch và đọc lại audio.' }
        : { type: 'error', text: 'Đã lưu bản dịch nhưng chưa đọc lại được audio.', lines: [{ label: code.toUpperCase(), ok: false, detail: (r.error || '').slice(0, 160) }] });
      setDrafts(d => ({ ...d, [code]: undefined }));
      onSaved();
    } catch {
      setNotice({ type: 'error', text: 'Không gọi được server.' });
    } finally {
      setSavingLang(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="content-title">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Nội dung theo ngôn ngữ</p>
            <h2 id="content-title" className="mt-1 text-xl font-black text-slate-800">{animal.defaultLocalName}</h2>
          </div>
          <button autoFocus onClick={onClose} aria-label="Đóng" className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div className="space-y-4 px-6 py-6 sm:px-8">
          <p className="text-sm text-slate-500">Bài tiếng Việt sửa ở nút "Chỉnh sửa". Các ngôn ngữ khác do máy dịch: sửa chữ nếu dịch sai, bấm lưu là audio được đọc lại đúng chữ đó.</p>
          {ADMIN_LANGS.map(([code, name]) => {
            const content = contents?.find(c => c.languageCode === code);
            const state = audioState(content);
            const draft = drafts[code] || {};
            const dirty = draft.scriptText !== undefined || draft.localName !== undefined;
            return (
              <section key={code} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-800">{name}</h3>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${CHIP[state]}`}>{STATE_TEXT[state]}</span>
                </div>
                {!content ? (
                  <p className="mt-2 text-sm text-slate-500">Chưa có bản {name.toLowerCase()}. Bấm nút tạo audio ở danh sách để máy dịch và đọc.</p>
                ) : (
                  <>
                    {content.audioUrl && <audio controls preload="none" src={content.audioUrl} className="mt-3 w-full" aria-label={`Audio ${name}`} />}
                    {code === 'vi' ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{content.scriptText}</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <label className="block text-xs font-semibold text-slate-500" htmlFor={`name-${code}`}>Tên</label>
                        <input id={`name-${code}`} lang={code} value={draft.localName ?? content.localName}
                          onChange={e => setDrafts(d => ({ ...d, [code]: { ...d[code], localName: e.target.value } }))}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
                        <label className="block text-xs font-semibold text-slate-500" htmlFor={`text-${code}`}>Bài thuyết minh</label>
                        <textarea id={`text-${code}`} lang={code} rows="4" value={draft.scriptText ?? content.scriptText}
                          onChange={e => setDrafts(d => ({ ...d, [code]: { ...d[code], scriptText: e.target.value } }))}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
                        <div className="flex justify-end">
                          <button onClick={() => save(code, content)} disabled={savingLang !== null || (!dirty && state === 'done')}
                            className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50">
                            <i className={`fa-solid ${savingLang === code ? 'fa-spinner fa-spin' : 'fa-floppy-disk'} mr-2`} aria-hidden="true"></i>
                            {dirty ? 'Lưu và đọc lại' : 'Đọc lại audio'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
