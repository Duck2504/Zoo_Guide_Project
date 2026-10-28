import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    // Khởi tạo bộ quét, khung nhận diện kích thước 250x250
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        // 1. Khi quét thành công -> Tắt camera và đóng Modal
        scanner.clear();
        onClose();
        
        // 2. Xử lý đường link lấy được (vd: http://localhost:5173/a/1)
        try {
          const url = new URL(decodedText);
          // 3. Điều hướng người dùng sang trang chi tiết con vật
          navigate(url.pathname); 
        } catch (e) {
          alert("Mã QR không hợp lệ của hệ thống!");
        }
      },
      (error) => {
        // Bỏ qua các lỗi không tìm thấy QR trong lúc đang di chuyển camera
      }
    );

    // Dọn dẹp bộ nhớ và tắt camera khi component bị hủy
    return () => {
      scanner.clear().catch(error => console.error("Lỗi dọn dẹp camera:", error));
    };
  }, [isOpen, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-slate-800">Quét mã QR</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>
        
        {/* Vùng chứa luồng video từ Camera */}
        <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border-2 border-zoo-100"></div>
        
        <p className="text-center text-sm text-slate-500 font-bold mt-4">
          Hướng camera về phía mã QR tại chuồng thú
        </p>
      </div>
    </div>
  );
}