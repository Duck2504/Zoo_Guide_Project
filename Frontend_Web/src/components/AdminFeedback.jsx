import { useEffect, useRef, useState } from 'react';

// Thay alert()/confirm() của trình duyệt trong trang admin: không chặn màn hình, không hiện lỗi thô dài.

// Thông báo nổi góc dưới. notice = { type: 'success' | 'error', text, lines? } hoặc null.
export function Notice({ notice, onClose }) {
  // Thành công thì tự tắt; lỗi thì để admin đọc xong tự đóng
  useEffect(() => {
    if (notice?.type !== 'success') return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
    // onClose thường là hàm viết inline: không đưa vào để mỗi lần render không đặt lại hẹn giờ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-end sm:left-auto sm:w-96">
      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={`pointer-events-auto w-full rounded-2xl border px-4 py-3 text-sm shadow-lg ${notice.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
          <div className="flex items-start gap-3">
            <i className={`fa-solid ${notice.type === 'error' ? 'fa-circle-exclamation text-rose-600' : 'fa-circle-check text-emerald-600'} mt-0.5`} aria-hidden="true"></i>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{notice.text}</p>
              {notice.lines?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {notice.lines.map(l => (
                    <li key={l.label} className="flex gap-2">
                      <span aria-hidden="true">{l.ok ? '✓' : '✗'}</span>
                      <span className="min-w-0 break-words"><span className="font-semibold">{l.label}</span>{l.detail ? `: ${l.detail}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={onClose} aria-label="Đóng thông báo" className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/5">
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Server trả ProblemDetails / chuỗi / JSON lỗi validate: rút ra một câu ngắn để hiện cho admin
export const errorText = async (res) => {
  const body = await res.text();
  try {
    const j = JSON.parse(body);
    if (j.errors) return Object.values(j.errors).flat().join(' ');
    return String(j.message || j.detail || j.title || body).slice(0, 300);
  } catch {
    return body.slice(0, 200) || `HTTP ${res.status}`;
  }
};

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Hộp thoại có khóa focus (cùng cách QRScannerModal): mở thì focus ô nhập đầu tiên (không có thì nút đầu tiên),
// Esc gọi onClose, Tab/Shift+Tab chỉ đi vòng trong hộp, đóng thì trả focus về nút đã mở. Gắn ref vào khung hộp.
export function useDialog(open, onClose) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // trang truyền hàm inline: giữ trong ref để effect không chạy lại mỗi lần render

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const panel = ref.current;
    (panel?.querySelector('input, select, textarea') || panel?.querySelector(FOCUSABLE))?.focus();
    const onKey = e => {
      if (e.key === 'Escape') return onCloseRef.current();
      if (e.key !== 'Tab' || !ref.current) return;
      const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter(el => !el.disabled);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (!ref.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); opener?.focus?.(); };
  }, [open]);

  return ref;
}

// const [confirm, confirmDialog] = useConfirm();  ...  if (await confirm('Xóa?')) { ... }  ...  {confirmDialog}
// Nút xác nhận mặc định là "Xóa" màu đỏ; việc không phải xóa: confirm(msg, { confirmLabel: 'Tạo audio', danger: false })
export function useConfirm() {
  const [ask, setAsk] = useState(null); // { message, resolve, confirmLabel, danger }

  const close = (answer) => { ask?.resolve(answer); setAsk(null); };
  const confirm = (message, { confirmLabel = 'Xóa', danger = true } = {}) =>
    new Promise(resolve => setAsk({ message, resolve, confirmLabel, danger }));
  const panelRef = useDialog(!!ask, () => close(false)); // focus vào nút Hủy như trước

  const dialog = ask && (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" onClick={() => close(false)}>
      <div ref={panelRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-text" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <p id="confirm-text" className="font-bold text-slate-800">{ask.message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => close(false)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
          <button onClick={() => close(true)} className={`min-h-11 rounded-xl px-4 text-sm font-bold text-white ${ask.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}>{ask.confirmLabel}</button>
        </div>
      </div>
    </div>
  );

  return [confirm, dialog];
}
