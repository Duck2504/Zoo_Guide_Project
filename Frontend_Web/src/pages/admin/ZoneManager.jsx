import { lazy, Suspense, useState, useEffect } from 'react';
import { API } from '../../config';
import { adminFetch } from '../../utils/adminFetch';
import { Notice, useConfirm, errorText } from '../../components/AdminFeedback';
import { calculateDistance } from '../../utils/geoUtils';

const ZonePicker = lazy(() => import('../../components/ZonePicker')); // Leaflet chỉ tải khi mở form

export default function ZoneManager() {
  const [notice, setNotice] = useState(null);
  const [confirm, confirmDialog] = useConfirm();
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ zoneCode: '', name: '', latitude: '', longitude: '', radius: 45 });
  const [error, setError] = useState(null); // State lưu lỗi trả về từ Backend
  const [loadError, setLoadError] = useState(''); // lỗi tải danh sách (khác lỗi form)
  const [searchTerm, setSearchTerm] = useState('');
  const [animalCount, setAnimalCount] = useState({}); // zoneId → số con vật

  // Đếm con vật mỗi khu: gọi thẳng API (không dùng bộ nhớ đệm của trang du khách vì dữ liệu đổi khi quản trị sửa)
  useEffect(() => {
    fetch(`${API}/api/animals`)
      .then(res => (res.ok ? res.json() : []))
      .then(list => {
        const count = {};
        for (const a of Array.isArray(list) ? list : []) count[a.zoneId] = (count[a.zoneId] || 0) + 1;
        setAnimalCount(count);
      })
      .catch(() => { /* cột số con chỉ trống đi */ });
  }, []);

  // Khu trong form chồng lên khu khác (khoảng cách tâm nhỏ hơn tổng hai bán kính): khách ở vùng giao sẽ bị nhận nhầm khu
  const formLat = parseFloat(formData.latitude), formLng = parseFloat(formData.longitude), formRadius = Number(formData.radius) || 0;
  const otherZones = zones.filter(z => z.id !== formData.id);
  const overlaps = Number.isFinite(formLat) && Number.isFinite(formLng)
    ? otherZones
        .map(z => ({ z, d: calculateDistance(formLat, formLng, z.latitude, z.longitude) }))
        .filter(({ z, d }) => d < formRadius + (Number(z.radius) || 0))
    : [];

  const API_URL = `${API}/api/zones`;
  const filteredZones = zones.filter(zone =>
    `${zone.zoneCode || ''} ${zone.name || ''} ${zone.latitude ?? ''} ${zone.longitude ?? ''}`
      .toLocaleLowerCase('vi')
      .includes(searchTerm.trim().toLocaleLowerCase('vi'))
  );
  const averageRadius = zones.length
    ? Math.round(zones.reduce((total, zone) => total + (Number(zone.radius) || 0), 0) / zones.length)
    : 0;

  // 1. Lấy danh sách Khu vực
  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setZones(data);
        setLoadError('');
      } else {
        setLoadError(`Không tải được danh sách khu vực (HTTP ${res.status}). Vui lòng thử lại.`);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách Khu vực:", error);
      setLoadError('Không kết nối được máy chủ. Kiểm tra backend rồi thử lại.');
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
    setError(null); // Xóa lỗi cũ trước khi gọi API mới

    try {
      const isUpdate = formData.id;
      const url = isUpdate ? `${API_URL}/${formData.id}` : API_URL;
      const method = isUpdate ? 'PUT' : 'POST';

      // Chuyển đổi dữ liệu về dạng số để khớp với Backend DTO
      const payload = {
        zoneCode: formData.zoneCode,
        name: formData.name || null, // PUT ghi đè cả bản ghi: thiếu trường này là mất tên khu
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius)
      };

      const res = await adminFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setNotice({ type: 'success', text: isUpdate ? 'Đã lưu thay đổi.' : 'Đã thêm khu mới.' });
        setIsModalOpen(false);
        fetchZones();
      } else {
        setError(await errorText(res));
      }
    } catch (error) {
      console.error("Lỗi lưu Khu vực:", error);
      setError("Lỗi kết nối đến máy chủ.");
    }
  };

  // 3. Xóa Khu vực
  const handleDelete = async (id) => {
    if (!(await confirm('Xóa khu vực này? Khu còn động vật sẽ không xóa được.'))) return;
    try {
      const res = await adminFetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotice({ type: 'success', text: 'Đã xóa khu.' });
        fetchZones();
      } else {
        setNotice({ type: 'error', text: `Xóa thất bại: ${await errorText(res)}` });
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      setNotice({ type: 'error', text: 'Không kết nối được máy chủ.' });
    }
  };

  const handleOpenModal = (zone = null) => {
    setError(null); // Clear lỗi cũ mỗi khi mở form
    if (zone) {
      setFormData({ ...zone, name: zone.name || '' });
    } else {
      setFormData({ zoneCode: '', name: '', latitude: '', longitude: '', radius: 45 });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Quản lý khu vực</h1>
            <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-slate-600">Vị trí và bán kính GPS của từng khu, để trang du khách tự nhận ra khách đang đứng ở đâu.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30">
            <i className="fa-solid fa-plus" aria-hidden="true"></i> Thêm khu vực
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div><p className="text-sm font-medium text-slate-500">Tổng khu vực</p><p className="mt-1 text-2xl font-black text-slate-800">{zones.length}</p></div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div><p className="text-sm font-medium text-slate-500">Bán kính trung bình</p><p className="mt-1 text-2xl font-black text-slate-800">{averageRadius}<span className="ml-1 text-sm font-semibold text-slate-500">m</span></p></div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div><p className="text-sm font-medium text-slate-500">Kết quả hiển thị</p><p className="mt-1 text-2xl font-black text-slate-800">{filteredZones.length}</p></div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-bold text-slate-800">Danh sách khu vực</h2>
              <p className="mt-1 text-sm text-slate-500">Quản lý mã, tọa độ GPS và phạm vi quét</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-72">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" aria-hidden="true"></i>
                <input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Tìm mã khu vực, tọa độ..." aria-label="Tìm khu vực" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
              </label>
              <button onClick={fetchZones} disabled={isLoading} title="Làm mới danh sách" aria-label="Làm mới danh sách" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50">
                <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`} aria-hidden="true"></i><span className="sm:hidden">Làm mới</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-bold">Khu vực</th>
                  <th className="px-5 py-3.5 font-bold">Tọa độ GPS</th>
                  <th className="px-5 py-3.5 font-bold">Phạm vi quét</th>
                  <th className="px-5 py-3.5 font-bold">Con vật</th>
                  <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-5 py-16 text-center text-sm font-medium text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2 text-emerald-600" aria-hidden="true"></i>Đang tải danh sách khu vực...</td></tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <div role="alert" className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                        <p className="font-bold">{loadError}</p>
                        <button onClick={fetchZones} className="mt-3 min-h-11 rounded-xl bg-white px-4 py-2 font-bold text-amber-800 transition-colors hover:bg-amber-100"><i className="fa-solid fa-rotate mr-2" aria-hidden="true"></i>Thử lại</button>
                      </div>
                    </td>
                  </tr>
                ) : filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400"><i className={`fa-solid ${zones.length ? 'fa-magnifying-glass' : 'fa-map'}`} aria-hidden="true"></i></div>
                      <p className="mt-4 font-bold text-slate-700">{zones.length ? 'Không tìm thấy khu vực phù hợp' : 'Chưa có khu vực nào'}</p>
                      <p className="mt-1 text-sm text-slate-500">{zones.length ? 'Thử tìm bằng mã khu vực hoặc tọa độ khác.' : 'Thêm khu vực để bắt đầu cấu hình bản đồ sở thú.'}</p>
                      {!zones.length && <button onClick={() => handleOpenModal()} className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"><i className="fa-solid fa-plus mr-2" aria-hidden="true"></i>Thêm khu vực</button>}
                    </td>
                  </tr>
                ) : filteredZones.map(zone => (
                  <tr key={zone.id} className="transition hover:bg-emerald-50/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><i className="fa-solid fa-location-dot" aria-hidden="true"></i></div>
                        <div><p className="font-bold text-slate-800">{zone.name || zone.zoneCode}</p><p className="mt-0.5 text-xs text-slate-500">{zone.zoneCode} · #{zone.id}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                        <i className="fa-solid fa-globe text-xs text-slate-400" aria-hidden="true"></i>{zone.latitude}, {zone.longitude}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-bold text-sky-800">
                        <i className="fa-solid fa-bullseye text-xs text-sky-600" aria-hidden="true"></i>{zone.radius} m
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {animalCount[zone.id] ? `${animalCount[zone.id]} con` : <span className="text-amber-700">Chưa có con nào</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(zone)} title="Chỉnh sửa" aria-label={`Chỉnh sửa ${zone.zoneCode}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100"><i className="fa-solid fa-pen-to-square" aria-hidden="true"></i></button>
                        <button onClick={() => handleDelete(zone.id)} title="Xóa" aria-label={`Xóa ${zone.zoneCode}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"><i className="fa-solid fa-trash" aria-hidden="true"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && zones.length > 0 && <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Đang hiển thị <span className="font-bold text-slate-700">{filteredZones.length}</span> / <span className="font-bold text-slate-700">{zones.length}</span> khu vực</div>}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{formData.id ? 'Cập nhật thông tin' : 'Danh mục khu vực'}</p>
                <h2 className="mt-1 text-xl font-black text-slate-800">{formData.id ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Đóng biểu mẫu" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"><i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-5 text-emerald-900">
                <i className="fa-solid fa-circle-info mr-2 text-emerald-700" aria-hidden="true"></i>
                Nhập mã định danh, tọa độ GPS và bán kính nhận diện của khu vực.
              </div>
              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  <i className="fa-solid fa-circle-exclamation mr-2" aria-hidden="true"></i>
                  <span className="whitespace-pre-line">{error}</span>
                </div>
              )}
              <div>
                <label htmlFor="zone-code" className="mb-1.5 block text-sm font-bold text-slate-700">Mã khu vực <span className="text-rose-500">*</span></label>
                <input id="zone-code" type="text" placeholder="Ví dụ: Z-TIGER" value={formData.zoneCode} onChange={e => setFormData({...formData, zoneCode: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required />
              </div>
              <div>
                <label htmlFor="zone-name" className="mb-1.5 block text-sm font-bold text-slate-700">Tên hiển thị cho du khách</label>
                <input id="zone-name" type="text" maxLength={100} placeholder="Ví dụ: Khu Bò sát" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
                <p className="mt-1 text-xs text-slate-500">Hiện trên trang du khách khi họ bước vào khu. Để trống thì dùng mã khu vực.</p>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-slate-700">Vị trí trên bản đồ</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="zone-latitude" className="mb-1.5 block text-xs font-semibold text-slate-500">Vĩ độ (Latitude) <span className="text-rose-500">*</span></label>
                  <input id="zone-latitude" type="number" step="any" placeholder="10.7626" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required />
                </div>
                <div>
                  <label htmlFor="zone-longitude" className="mb-1.5 block text-xs font-semibold text-slate-500">Kinh độ (Longitude) <span className="text-rose-500">*</span></label>
                  <input id="zone-longitude" type="number" step="any" placeholder="106.6602" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required />
                </div>
                </div>
              </div>
              <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100" />}>
                <ZonePicker
                  lat={formLat} lng={formLng} radius={formRadius} others={otherZones}
                  onPick={(lat, lng) => setFormData(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))}
                />
              </Suspense>
              {overlaps.length > 0 && (
                <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <i className="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true"></i>
                  Khu này chồng lên {overlaps.map(({ z, d }) => `${z.name || z.zoneCode} (tâm cách ${Math.round(d)} m)`).join(', ')}. Khách đứng ở phần chồng nhau có thể bị nhận nhầm khu: dời tâm hoặc giảm bán kính.
                </p>
              )}
              <div>
                <label htmlFor="zone-radius" className="mb-1.5 block text-sm font-bold text-slate-700">Bán kính quét GPS <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input id="zone-radius" type="number" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">m</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Khoảng cách nhận diện khu vực tính từ tọa độ đã nhập.</p>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Hủy</button>
                <button type="submit" className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20">
                  <i className={`fa-solid ${formData.id ? 'fa-floppy-disk' : 'fa-plus'} mr-2`} aria-hidden="true"></i>{formData.id ? 'Lưu cập nhật' : 'Tạo khu vực'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDialog}
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}