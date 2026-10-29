import { useState, useEffect } from 'react';

export default function ZoneManager() {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ zoneCode: '', latitude: '', longitude: '', radius: 15 });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/zones`;

  // 1. Lấy danh sách Khu vực
  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách Khu vực:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // 2. Lưu form (Thêm mới / Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isUpdate = formData.id;
      const url = isUpdate ? `${API_URL}/${formData.id}` : API_URL;
      const method = isUpdate ? 'PUT' : 'POST';

      // Chuyển đổi dữ liệu về dạng số để khớp với Backend DTO
      const payload = {
        zoneCode: formData.zoneCode,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius)
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isUpdate ? "Cập nhật thành công!" : "Thêm mới thành công!");
        setIsModalOpen(false);
        fetchZones();
      } else {
        alert("Lưu thất bại!");
      }
    } catch (error) {
      console.error("Lỗi lưu Khu vực:", error);
    }
  };

  // 3. Xóa Khu vực
  const handleDelete = async (id) => {
    if (window.confirm("Xóa khu vực này có thể ảnh hưởng đến các động vật đang thuộc về nó. Tiếp tục?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
          alert("Xóa thành công!");
          fetchZones();
        } else {
          alert("Xóa thất bại!");
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  const handleOpenModal = (zone = null) => {
    if (zone) {
      setFormData(zone);
    } else {
      setFormData({ zoneCode: '', latitude: '', longitude: '', radius: 15 });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">Quản lý Khu vực (Zone)</h1>
        <button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition shadow-sm flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> Thêm Khu Vực
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-4 font-bold">Mã Zone</th>
              <th className="p-4 font-bold">Tọa độ (Lat, Lng)</th>
              <th className="p-4 font-bold">Bán kính quét (m)</th>
              <th className="p-4 font-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500 animate-pulse">Đang tải...</td></tr>
            ) : zones.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">Chưa có dữ liệu.</td></tr>
            ) : (
              zones.map(z => (
                <tr key={z.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="p-4 font-black text-emerald-700">{z.zoneCode}</td>
                  <td className="p-4 text-slate-600 font-mono text-sm">{z.latitude}, {z.longitude}</td>
                  <td className="p-4 font-bold text-slate-600">{z.radius}m</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleOpenModal(z)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onClick={() => handleDelete(z.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition">
                      <i className="fa-solid fa-trash"></i>
                    </button>
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
            <h2 className="text-xl font-black text-slate-800 mb-6">{formData.id ? 'Sửa Khu Vực' : 'Thêm Khu Vực'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Mã Zone (vd: Z-TIGER)</label>
                <input type="text" value={formData.zoneCode} onChange={e => setFormData({...formData, zoneCode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Vĩ độ (Latitude)</label>
                  <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Kinh độ (Longitude)</label>
                  <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Bán kính quét GPS (mét)</label>
                <input type="number" min="1" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">Hủy</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}