import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function HomeAccessManager() {
  const CLIENT_URL = 'https://zooaudioguide-001-site1.ftempurl.com';
  const homeQrUrl = `${CLIENT_URL}/?source=qr_home`;
  const [isCopied, setIsCopied] = useState(false);

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-home');
    if (!canvas) {
      console.error('Không tìm thấy mã QR để tải xuống.');
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = 'QR_TrangChu_Zoo.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(homeQrUrl);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Không thể sao chép đường dẫn:', error);
      window.prompt('Sao chép đường dẫn truy cập:', homeQrUrl);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 px-6 py-7 text-white shadow-lg shadow-emerald-950/10 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-50">
              <i className="fa-solid fa-qrcode"></i> CÔNG CỤ DÀNH CHO KHÁCH THAM QUAN
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Mã QR trang chủ</h1>
            <p className="mt-2 text-sm leading-6 text-emerald-100 sm:text-base">
              Giúp khách tham quan mở nhanh cổng thông tin sở thú bằng cách quét mã QR.
              In mã và đặt tại cổng vào, quầy vé hoặc khu vực hướng dẫn.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Mã truy cập của bạn</h2>
                  <p className="mt-1 text-sm text-slate-500">Quét thử trước khi tải xuống hoặc đem đi in.</p>
                </div>
              </div>
            </div>

            {/* Cột trái ở màn lg quá hẹp cho 2 cột con (URL break-all cao vọt, đẩy QR xuống) nên chỉ chia 2 cột ở md và từ xl */}
            <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[auto_minmax(0,1fr)] md:items-start lg:grid-cols-1 xl:grid-cols-[auto_minmax(0,1fr)]">
              <div className="mx-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                  <QRCodeCanvas
                    id="qr-home"
                    value={homeQrUrl}
                    size={240}
                    level="H"
                    marginSize={2}
                    title="Mã QR truy cập trang chủ Zoo Audio Guide"
                  />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  Sẵn sàng để quét
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Đường dẫn đích</p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <code className="block break-all text-sm leading-6 text-slate-700">{homeQrUrl}</code>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Mã QR đưa khách đến trang chủ và đánh dấu lượt truy cập từ mã tại sở thú.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleDownloadQR}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                  >
                    <i className="fa-solid fa-download"></i> Tải mã QR PNG
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <i className={`fa-solid ${isCopied ? 'fa-check' : 'fa-copy'}`}></i>
                    {isCopied ? 'Đã sao chép' : 'Sao chép liên kết'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 font-bold text-slate-800">
                <i className="fa-solid fa-lightbulb text-amber-500"></i> Cách sử dụng
              </h2>
              <ol className="mt-5 space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">1</span>
                  <p className="pt-1 text-sm leading-5 text-slate-600">Tải mã QR xuống dưới dạng ảnh PNG.</p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">2</span>
                  <p className="pt-1 text-sm leading-5 text-slate-600">In mã với kích thước rõ nét, dễ quét.</p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">3</span>
                  <p className="pt-1 text-sm leading-5 text-slate-600">Đặt ở nơi dễ thấy và thử quét bằng điện thoại.</p>
                </li>
              </ol>
            </section>

            <section className="rounded-2xl border border-sky-100 bg-sky-50/80 p-5 sm:p-6">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h2 className="font-bold text-sky-950">Mẹo để quét tốt hơn</h2>
                  <p className="mt-1.5 text-sm leading-6 text-sky-900/75">
                    Giữ nền quanh mã sáng, không cắt mất viền trắng và tránh đặt dưới ánh sáng phản chiếu.
                    Kiểm tra mã sau khi in để đảm bảo đường dẫn vẫn hoạt động.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
