import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';

const translations = {
  vi: { title: 'Quét mã QR', hint: 'Hướng camera vào mã QR gắn ở chuồng thú.', close: 'Đóng', start: 'Bật camera', starting: 'Đang bật camera…', denied: 'Bạn chưa cho phép dùng camera. Hãy cho phép trong cài đặt trình duyệt rồi thử lại.', noCamera: 'Không mở được camera trên thiết bị này.', retry: 'Thử lại', invalid: 'Mã này không phải mã của vườn. Hãy thử mã trên biển chuồng thú.' },
  en: { title: 'Scan QR code', hint: 'Point the camera at the QR code on the enclosure sign.', close: 'Close', start: 'Turn on camera', starting: 'Starting camera…', denied: 'Camera access was not allowed. Allow it in your browser settings and try again.', noCamera: 'The camera could not be opened on this device.', retry: 'Try again', invalid: 'This code is not from the zoo. Try the code on the enclosure sign.' },
  ko: { title: 'QR 코드 스캔', hint: '우리 표지판의 QR 코드에 카메라를 맞추세요.', close: '닫기', start: '카메라 켜기', starting: '카메라를 켜는 중…', denied: '카메라 사용이 허용되지 않았습니다. 브라우저 설정에서 허용한 뒤 다시 시도하세요.', noCamera: '이 기기에서 카메라를 열 수 없습니다.', retry: '다시 시도', invalid: '동물원 코드가 아닙니다. 우리 표지판의 코드를 사용해 보세요.' },
  ja: { title: 'QRコードをスキャン', hint: '展示場の看板にあるQRコードにカメラを向けてください。', close: '閉じる', start: 'カメラをオン', starting: 'カメラを起動中…', denied: 'カメラの使用が許可されていません。ブラウザの設定で許可してから、もう一度お試しください。', noCamera: 'この端末ではカメラを開けませんでした。', retry: 'もう一度', invalid: '園のコードではありません。展示場の看板のコードをお試しください。' },
};

const READER_ID = 'qr-reader';

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { language } = useVisitor();
  const t = translations[language] || translations['vi'];
  const [state, setState] = useState('idle');
  const [invalid, setInvalid] = useState(false);
  const scannerRef = useRef(null);
  const panelRef = useRef(null);

  const stop = async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s?.isScanning) await s.stop().catch(() => {});
  };

  const start = async () => {
    setState('starting');
    setInvalid(false);
    try {
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          try {
            const url = new URL(decodedText);
            if (!/^\/(a\/\d+)?$/.test(url.pathname)) throw new Error('not ours');
            await stop();
            onClose();
            navigate(url.pathname + url.search);
          } catch {
            setInvalid(true);
          }
        },
        () => {}
      );
      setState('scanning');
    } catch (err) {
      scannerRef.current = null;
      setState(/permission|notallowed/i.test(String(err?.name || err)) ? 'denied' : 'failed');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    start();
    return () => { stop(); setState('idle'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = e => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const problem = state === 'denied' ? t.denied : state === 'failed' ? t.noCamera : null;

  return (
    <div className="qr-scrim fixed inset-0 z-50 flex items-end justify-center bg-wall-deep/85 backdrop-blur-xs p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="qr-title">
      <div ref={panelRef} className="qr-sheet w-full max-w-md rounded-t-3xl bg-label font-label text-ink shadow-[0_25px_50px_-12px_rgb(0_0_0/0.6)] sm:rounded-3xl">
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-wall/10 text-wall">
              <i className="fa-solid fa-qrcode" aria-hidden="true"></i>
            </span>
            <h2 id="qr-title" className="text-xl font-extrabold">{t.title}</h2>
          </div>
          <button autoFocus onClick={onClose} aria-label={t.close} className="-mr-2 flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-ink/10">
            <i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
          </button>
        </div>

        <div className="p-6 pb-8 pt-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ink shadow-inner">
            <div id={READER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
            {state !== 'scanning' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-label">
                <i className={`fa-solid ${problem ? 'fa-video-slash' : 'fa-qrcode'} text-5xl text-label/70`} aria-hidden="true"></i>
                {state === 'starting' && <p className="text-base font-semibold">{t.starting}</p>}
                {problem && <p role="alert" className="text-base">{problem}</p>}
                {(problem || state === 'idle') && (
                  <button onClick={start} className="min-h-12 rounded-xl bg-label px-6 text-base font-bold text-ink shadow-lg transition-all hover:bg-white active:scale-95">
                    {problem ? t.retry : t.start}
                  </button>
                )}
              </div>
            )}
          </div>
          {invalid
            ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700">{t.invalid}</p>
            : <p className="mt-4 text-center text-sm font-medium text-ink-soft">{t.hint}</p>}
        </div>
      </div>
    </div>
  );
}
