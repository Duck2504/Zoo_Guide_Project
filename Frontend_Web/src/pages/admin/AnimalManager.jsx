import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import ContentModal from './ContentModal';

export default function AnimalManager() {
  const [animals, setAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', scientificName: '', zoneId: 1 });

  const API_URL = `https://backend-zooaudio.onrender.com/api/animals`;

  const fetchAnimals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setAnimals(data);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isUpdate = formData.id;
      const url = isUpdate ? `${API_URL}/${formData.id}` : API_URL;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(isUpdate ? "Cập nhật thành công!" : "Thêm mới thành công!");
        setIsModalOpen(false);
        fetchAnimals();
      } else {
        alert("Lưu thất bại, kiểm tra lại dữ liệu!");
      }
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa động vật này?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
          alert("Xóa thành công!");
          fetchAnimals();
        } else {
          alert("Xóa thất bại!");
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  const handleOpenModal = (animal = null) => {
    if (animal) {
      setFormData(animal);
    } else {
      setFormData({ name: '', scientificName: '', zoneId: 1 });
    }
    setIsModalOpen(true);
  };

  // Hàm xử lý tải ảnh QR Code về máy
  const handleDownloadQR = (animalId, animalName) => {
    const canvas = document.getElementById(`qr-${animalId}`);
    if (!canvas) return;

    // Chuyển đổi canvas thành file ảnh PNG
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    // Đặt tên file tự động theo tên con vật
    downloadLink.download = `QR_${animalName.replace(/ /g, '_')}_${animalId}.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">Quản lý Động vật</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-zoo-600 hover:bg-zoo-700 text-white px-4 py-2 rounded-xl font-bold transition shadow-sm flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-4 font-bold">ID</th>
              <th className="p-4 font-bold">Tên động vật</th>
              <th className="p-4 font-bold">Khu vực</th>
              <th className="p-4 font-bold text-center">Mã QR</th>
              <th className="p-4 font-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-bold animate-pulse">Đang tải dữ liệu...</td></tr>
            ) : animals.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500 italic">Chưa có dữ liệu động vật nào.</td></tr>
            ) : (
              animals.map(animal => (
                <tr key={animal.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-600 font-medium">#{animal.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{animal.name}</p>
                    <p className="text-sm text-slate-500 italic">{animal.scientificName}</p>
                  </td>
                  <td className="p-4 text-slate-600 font-bold">Khu {animal.zoneId}</td>

                  {/* Cột hiển thị và tải mã QR */}
                  <td className="p-4 flex flex-col items-center justify-center gap-2">
                    <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <QRCodeCanvas
                        id={`qr-${animal.id}`}
                        value={`http://localhost:5173/a/${animal.id}`}
                        size={64}
                        level={"H"}
                      />
                    </div>
                    <button
                      onClick={() => handleDownloadQR(animal.id, animal.name)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-md font-bold transition flex items-center gap-1"
                    >
                      <i className="fa-solid fa-download"></i> Tải ảnh
                    </button>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(animal)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition">
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button onClick={() => handleDelete(animal.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">{formData.id ? 'Sửa thông tin' : 'Thêm động vật mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Tên động vật</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-zoo-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Tên khoa học</label>
                <input type="text" value={formData.scientificName || ''} onChange={e => setFormData({ ...formData, scientificName: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-zoo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">ID Khu vực (Zone)</label>
                <input type="number" min="1" value={formData.zoneId || ''} onChange={e => setFormData({ ...formData, zoneId: parseInt(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-zoo-500" required />
              </div>
              <button type="submit" className="w-full bg-zoo-600 hover:bg-zoo-700 text-white font-bold py-3 rounded-xl transition mt-4">
                {formData.id ? 'Lưu cập nhật' : 'Lưu tạo mới'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}