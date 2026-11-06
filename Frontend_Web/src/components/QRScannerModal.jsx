import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';

const translations = {
  vi: { title: 'Quét mã QR', hint: 'Hướng camera vào mã QR gắn ở chuồng thú.', close: 'Đóng', start: 'Bật camera', starting: 'Đang bật camera…', denied: 'Bạn chưa cho phép dùng camera. Hãy cho phép trong cài đặt trình duyệt rồi thử lại.', noCamera: 'Không mở được camera trên thiết bị này.', retry: 'Thử lại', invalid: 'Mã này không phải mã của vườn. Hãy thử mã trên biển chuồng thú.' },
  en: { title: 'Scan QR code', hint: 'Point the camera at the QR code on the enclosure sign.', close: 'Close', start: 'Turn on camera', starting: 'Starting camera…', denied: 'Camera access was not allowed. Allow it in your browser settings and try again.', noCamera: 'The camera could not be opened on this device.', retry: 'Try again', invalid: 'This code is not from the zoo. Try the code on the enclosure sign.' },
  ko: { title: 'QR 코드 스캔', hint: '우리 표지판의 QR 코드에 카메라를 맞추세요.', close: '닫기', start: '카메라 켜기', starting: '카메라를 켜는 중…', denied: '카메라 사용이 허용되지 않았습니다. 브라우저 설정에서 허용한 뒤 다시 시도하세요.', noCamera: '이 기기에서 카메라를 열 수 없습니다.', retry: '다시 시도', invalid: '동물원 코드가 아닙니다. 우리 표지판의 코드를 사용해 보세요.' },
  ja: { title: 'QRコードをスキャン', hint: '展示場の看板にあるQRコードにカメラを向けてください。', close: '閉じる', start: 'カメラをオン', starting: 'カメラを起動中…', denied: 'カメラの使用が許可されていません。ブラウザの設定で許可してから、もう一度お試しください。', noCamera: 'この端末ではカメラを開けませんでした。', retry: 'もう一度', invalid: '園のコードではありません。展示場の看板のコードをお試しください。' },
  zh: { title: '扫描QR码', hint: '将摄像头对准围栏标牌上的QR码。', close: '关闭', start: '打开摄像头', starting: '正在打开摄像头…', denied: '未允许使用摄像头。请在浏览器设置中允许后重试。', noCamera: '无法在此设备上打开摄像头。', retry: '重试', invalid: '这不是本园的二维码，请扫描围栏标牌上的码。' }
};

const READER_ID = 'qr-reader';

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { language } = useVisitor();
  const t = translations[language] || translations['vi'];
  // idle → starting → scanning; hoặc denied / failed khi không mở được camera
  const [state, setState] = useState('idle');
  const [invalid, setInvalid] = useState(false);
  const scannerRef = useRef(null);

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
            // Chỉ nhận đường dẫn tới trang con vật hoặc trang chủ của hệ thống
            if (!/^\/(a\/\d+)?$/.test(url.pathname)) throw new Error('not ours');
            await stop();
            onClose();
            navigate(url.pathname + url.search);
          } catch {
            setInvalid(true); // camera vẫn chạy cho lần quét sau
          }
        },
        () => { /* bỏ qua khung hình chưa thấy mã */ }
      );
      setState('scanning');
    } catch (err) {
      scannerRef.current = null;
      setState(/permission|notallowed/i.test(String(err?.name || err)) ? 'denied' : 'failed');
    }
  };

  // Mở hộp là bật camera luôn; đóng hộp là tắt camera
  useEffect(() => {
    if (!isOpen) return;
    start();
    return () => { stop(); setState('idle'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Esc đóng hộp quét
  useEffect(() => {
    if (!isOpen) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const problem = state === 'denied' ? t.denied : state === 'failed' ? t.noCamera : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-post/80 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="qr-title">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-[0_25px_50px_-12px_rgb(0_0_0/0.4)] sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 pb-1 pt-4 text-post">
          <h2 id="qr-title" className="text-lg font-semibold">{t.title}</h2>
          <button autoFocus onClick={onClose} aria-label={t.close} className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-trail">
            <i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
          </button>
        </div>

        <div className="p-5 pb-8 pt-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-post">
            {/* Thư viện chèn video camera vào đây */}
            <div id={READER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
            {state !== 'scanning' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
                <i className={`fa-solid ${problem ? 'fa-video-slash' : 'fa-qrcode'} text-5xl text-white/70`} aria-hidden="true"></i>
                {state === 'starting' && <p className="text-base font-semibold">{t.starting}</p>}
                {problem && <p role="alert" className="text-base">{problem}</p>}
                {(problem || state === 'idle') && (
                  <button onClick={start} className="min-h-12 rounded-2xl bg-white px-5 text-base font-semibold text-sign-deep transition-colors hover:bg-sage-soft">
                    {problem ? t.retry : t.start}
                  </button>
                )}
              </div>
            )}
          </div>
          {invalid
            ? <p role="alert" className="mt-4 rounded-2xl bg-sage-soft px-4 py-3 text-center text-sm font-medium text-post">{t.invalid}</p>
            : <p className="mt-4 text-center text-sm text-post-soft">{t.hint}</p>}
        </div>
      </div>
    </div>
  );
}
