import { QRCodeCanvas } from 'qrcode.react';

export default function HomeAccessManager() {
  // Thay bằng domain thật của web Khách hàng
  const CLIENT_URL = "https://zooaudioguide-001-site1.ftempurl.com"; 
  const homeQrUrl = `${CLIENT_URL}/?source=qr_home`;

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`qr-home`);
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_TrangChu_Zoo.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-black text-slate-800 mb-6">Mã Truy Cập Trang Chủ</h1>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-xl">
        <p className="text-slate-600 mb-6">
          Sử dụng mã QR này để đặt tại cổng ra vào hoặc quầy vé. 
        </p>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <QRCodeCanvas
              id="qr-home"
              value={homeQrUrl}
              size={200}
              level={"H"}
            />
          </div>
          
          <div className="text-center w-full mb-6">
            <span className="text-sm text-slate-500 font-bold block mb-1">Đường dẫn truy cập:</span>
            <code className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md block break-all">
              {homeQrUrl}
            </code>
          </div>

          <button
            onClick={handleDownloadQR}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-download"></i> Tải Mã QR Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
}