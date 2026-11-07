import { useState, useEffect, useRef } from 'react';
import { API } from '../../config';
import { QRCodeCanvas } from 'qrcode.react';
import { adminFetch } from '../../utils/adminFetch';
import { Notice, useConfirm, errorText } from '../../components/AdminFeedback';
import { AudioStatus, ContentPanel, needsAudio } from '../../components/AnimalContentPanel';

const LANG_NAMES = { vi: 'Tiếng Việt', en: 'Tiếng Anh', ja: 'Tiếng Nhật', ko: 'Tiếng Hàn' };
const FACT_OPTIONS = {
  conservationStatus: [['LC', 'Ít quan ngại (LC)'], ['NT', 'Sắp bị đe dọa (NT)'], ['VU', 'Sắp nguy cấp (VU)'], ['EN', 'Nguy cấp (EN)'], ['CR', 'Cực kỳ nguy cấp (CR)'], ['EW', 'Tuyệt chủng ngoài tự nhiên (EW)']],
  diet: [['carnivore', 'Ăn thịt'], ['herbivore', 'Ăn thực vật'], ['omnivore', 'Ăn tạp']],
  habitat: [['rainforest', 'Rừng mưa nhiệt đới'], ['forest', 'Rừng'], ['savanna', 'Đồng cỏ xavan'], ['wetland', 'Đầm lầy'], ['coast', 'Vùng ven biển']],
};
// Độ dài bài thuyết minh tiếng Việt: khoảng 15 ký tự/giây khi đọc, 600–1200 ký tự ≈ 45–90 giây
const SCRIPT_MIN = 600, SCRIPT_MAX = 1200;
const FIELD = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

export default function AnimalManager() {
  const [animals, setAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(''); // lỗi tải danh sách (khác lỗi form)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();
  const [zoneList, setZoneList] = useState([]); // danh sách khu thật cho ô chọn khu trong form
  const [contents, setContents] = useState({}); // animalId → nội dung từng ngôn ngữ (trạng thái audio thật, không lùi về tiếng Việt)
  const [contentAnimal, setContentAnimal] = useState(null); // con đang mở bảng "Nội dung"
  const [bulk, setBulk] = useState(null); // { done, total, current } khi đang tạo audio hàng loạt
  const bulkCancel = useRef(false);
  const [uploading, setUploading] = useState(false);
  
  // Khởi tạo state khớp với AnimalCreateDto
  const initialFormState = { 
    zoneId: 1, 
    scientificName: '', 
    avatarUrl: '',
    localName: '',
    scriptText: '',
    conservationStatus: null,
    diet: null,
    habitat: null,
    lifespanYears: null
  };
  const [formData, setFormData] = useState(initialFormState);

  const API_URL = `${API}/api/animals`;
  const zones = [...new Set(animals.map(animal => animal.zoneId).filter(Boolean))].sort((a, b) => a - b);
  const zoneName = id => animals.find(a => a.zoneId === id)?.zoneName || `Khu ${id}`;
  const missingAudio = animals.filter(a => needsAudio(contents[a.id]));
  const filteredAnimals = animals.filter(animal => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    const matchesSearch = !query || [
      animal.defaultLocalName,
      animal.scientificName,
      animal.zoneName,
      String(animal.id)
    ].some(value => String(value || '').toLocaleLowerCase('vi').includes(query));
    const matchesZone = selectedZone === 'all' || String(animal.zoneId) === selectedZone;
    return matchesSearch && matchesZone;
  });

  useEffect(() => {
    fetch(`${API}/api/zones`)
      .then(res => (res.ok ? res.json() : []))
      .then(list => Array.isArray(list) && setZoneList(list))
      .catch(() => { /* không tải được thì form dùng ô nhập số */ });
  }, []);

  const fetchContents = async () => {
    try {
      const res = await adminFetch(`${API_URL}/contents`);
      if (!res.ok) return;
      const list = await res.json();
      setContents(Object.fromEntries(list.map(x => [x.animalId, x.contents])));
    } catch { /* cột audio chỉ trống đi */ }
  };

  const fetchAnimals = async () => {
    setIsLoading(true);
    fetchContents();
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setAnimals(data);
        setLoadError('');
      } else {
        setLoadError(`Không tải được danh sách động vật (HTTP ${res.status}). Vui lòng thử lại.`);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setLoadError('Không kết nối được máy chủ. Kiểm tra backend rồi thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const isUpdate = formData.id;
      const url = isUpdate ? `${API_URL}/${formData.id}` : API_URL;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setNotice({ type: 'success', text: isUpdate ? 'Đã lưu thay đổi.' : 'Đã thêm động vật mới.' });
        setIsModalOpen(false);
        fetchAnimals();
      } else {
        // Giữ form mở để admin sửa lại, không mất dữ liệu vừa nhập
        setFormError(`Chưa lưu được: ${await errorText(res)}`);
      }
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      setFormError('Không kết nối được máy chủ. Dữ liệu trong form vẫn còn, hãy thử lưu lại.');
    } finally {
      setSaving(false);
    }
  };

  // Tạo audio thuyết minh (dịch + đọc) cho các ngôn ngữ từ bài tiếng Việt đã lưu
  const [generatingId, setGeneratingId] = useState(null);
  const handleGenerateAudio = async (id) => {
    setGeneratingId(id);
    try {
      const res = await adminFetch(`${API_URL}/${id}/narration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(['vi', 'en', 'ja', 'ko'])
      });
      if (!res.ok) {
        setNotice({ type: 'error', text: `Tạo audio thất bại: ${await errorText(res)}` });
        return;
      }
      const { results } = await res.json();
      const failed = results.filter(r => r.status !== 'DONE');
      setNotice({
        type: failed.length === 0 ? 'success' : 'error',
        text: failed.length === 0 ? 'Đã tạo audio cho tất cả ngôn ngữ.' : `Tạo audio lỗi ${failed.length}/${results.length} ngôn ngữ`,
        lines: results.map(r => ({ label: LANG_NAMES[r.lang] || r.lang, ok: r.status === 'DONE', detail: r.status === 'DONE' ? '' : (r.error || '').slice(0, 160) })),
      });
      fetchAnimals();
    } catch (error) {
      console.error("Lỗi tạo audio:", error);
      setNotice({ type: 'error', text: 'Không gọi được server để tạo audio.' });
    } finally {
      setGeneratingId(null);
    }
  };

  // Tạo audio lần lượt cho các con còn thiếu; dừng ngay khi không gọi được microservice (laptop/ngrok tắt)
  const handleBulkGenerate = async () => {
    const queue = missingAudio;
    if (!queue.length) return;
    if (!(await confirm(`Tạo audio cho ${queue.length} con còn thiếu? Mỗi con mất khoảng 10–30 giây và dùng lượt dịch Gemini.`))) return;
    bulkCancel.current = false;
    const failed = [];
    for (let i = 0; i < queue.length; i++) {
      if (bulkCancel.current) break;
      const a = queue[i];
      setBulk({ done: i, total: queue.length, current: a.defaultLocalName });
      try {
        const res = await adminFetch(`${API_URL}/${a.id}/narration`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(['vi', 'en', 'ja', 'ko']),
        });
        const body = res.ok ? await res.json() : null;
        const results = body?.results || [];
        const errors = results.filter(r => r.status !== 'DONE');
        if (!res.ok || errors.length) failed.push({ label: a.defaultLocalName, ok: false, detail: (!res.ok ? await errorText(res) : errors[0].error || '').slice(0, 140) });
        // Lỗi cả con (mọi ngôn ngữ, hoặc server từ chối): thường là microservice/ngrok tắt, dừng thay vì lặp lỗi cho cả danh sách
        if (!res.ok || (results.length > 0 && errors.length === results.length)) break;
      } catch {
        failed.push({ label: a.defaultLocalName, ok: false, detail: 'Không gọi được server' });
        break;
      }
    }
    setBulk(null);
    setNotice(failed.length
      ? { type: 'error', text: `Có ${failed.length} con chưa tạo được audio`, lines: failed.slice(0, 6) }
      : { type: 'success', text: bulkCancel.current ? 'Đã dừng tạo audio.' : 'Đã tạo audio cho các con còn thiếu.' });
    fetchAnimals();
  };

  // Tải ảnh lên kho đám mây (qua backend), rồi điền link vào form
  const handleImageFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormError('Ảnh lớn hơn 5 MB. Hãy chọn ảnh nhỏ hơn.'); return; }
    setUploading(true);
    setFormError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await adminFetch(`${API_URL}/image`, { method: 'POST', body });
      if (!res.ok) { setFormError(`Chưa tải được ảnh: ${await errorText(res)}`); return; }
      const { url } = await res.json();
      setFormData(f => ({ ...f, avatarUrl: url }));
    } catch {
      setFormError('Không gọi được server để tải ảnh.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (animal) => {
    if (!(await confirm(`Xóa "${animal.defaultLocalName || 'động vật này'}"? Không hoàn tác được.`))) return;
    try {
      const res = await adminFetch(`${API_URL}/${animal.id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotice({ type: 'success', text: 'Đã xóa.' });
        fetchAnimals();
      } else {
        setNotice({ type: 'error', text: `Xóa thất bại: ${await errorText(res)}` });
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      setNotice({ type: 'error', text: 'Không kết nối được máy chủ.' });
    }
  };

  const handleOpenModal = (animal = null) => {
    if (animal) {
      // Map dữ liệu từ AnimalDto (GET) sang AnimalCreateDto (PUT)
      setFormData({ 
        id: animal.id,
        zoneId: animal.zoneId || 1, 
        scientificName: animal.scientificName || '', 
        avatarUrl: animal.avatarUrl || '',
        localName: animal.defaultLocalName || '', // Lấy defaultLocalName gán vào localName
        scriptText: animal.scriptText || '',
        // PUT ghi đè cả bản ghi: phải gửi lại thông tin nhanh, nếu không sẽ bị xóa
        conservationStatus: animal.conservationStatus ?? null,
        diet: animal.diet ?? null,
        habitat: animal.habitat ?? null,
        lifespanYears: animal.lifespanYears ?? null
      });
    } else {
      setFormData(initialFormState);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDownloadQR = (animalId, scientificName) => {
    const canvas = document.getElementById(`qr-${animalId}`);
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${scientificName ? scientificName.replace(/ /g, '_') : 'Animal'}_${animalId}.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 px-6 py-7 text-white shadow-lg shadow-emerald-950/10 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-50">
                <i className="fa-solid fa-paw" aria-hidden="true"></i> TRUNG TÂM QUẢN TRỊ SỞ THÚ
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Quản lý động vật</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100 sm:text-base">
                Quản lý hồ sơ, nội dung thuyết minh và mã QR cho các loài trong sở thú.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/25"
            >
              <i className="fa-solid fa-plus" aria-hidden="true"></i> Thêm động vật
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-700"><i className="fa-solid fa-paw" aria-hidden="true"></i></div>
            <div><p className="text-sm font-medium text-slate-500">Tổng số động vật</p><p className="mt-1 text-2xl font-black text-slate-800">{animals.length}</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-xl text-sky-700"><i className="fa-solid fa-map-location-dot" aria-hidden="true"></i></div>
            <div><p className="text-sm font-medium text-slate-500">Khu vực có động vật</p><p className="mt-1 text-2xl font-black text-slate-800">{zones.length}</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600"><i className="fa-solid fa-filter" aria-hidden="true"></i></div>
            <div><p className="text-sm font-medium text-slate-500">Kết quả đang hiển thị</p><p className="mt-1 text-2xl font-black text-slate-800">{filteredAnimals.length}</p></div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-bold text-slate-800">Danh sách động vật</h2>
              <p className="mt-1 text-sm text-slate-500">Tra cứu và quản lý thông tin từng loài</p>
              {bulk ? (
                <p className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-emerald-800" role="status">
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                  Đang tạo audio {bulk.done + 1}/{bulk.total}: {bulk.current}
                  <button onClick={() => { bulkCancel.current = true; }} className="min-h-9 rounded-lg border border-slate-200 px-3 text-slate-600 hover:bg-slate-50">Dừng sau con này</button>
                </p>
              ) : missingAudio.length > 0 && Object.keys(contents).length > 0 && (
                <button onClick={handleBulkGenerate} disabled={generatingId !== null} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-50 px-4 text-sm font-bold text-amber-900 ring-1 ring-amber-200 transition hover:bg-amber-100 disabled:opacity-50">
                  <i className="fa-solid fa-volume-high" aria-hidden="true"></i> Tạo audio cho {missingAudio.length} con còn thiếu
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-64">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" aria-hidden="true"></i>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Tìm tên, mã động vật..."
                  aria-label="Tìm động vật"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </label>
              <label className="relative block sm:w-44">
                <i className="fa-solid fa-map-pin absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" aria-hidden="true"></i>
                <select
                  value={selectedZone}
                  onChange={event => setSelectedZone(event.target.value)}
                  aria-label="Lọc theo khu vực"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="all">Tất cả khu vực</option>
                  {zones.map(zone => <option key={zone} value={String(zone)}>{zoneName(zone)}</option>)}
                </select>
                <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true"></i>
              </label>
              <button
                onClick={fetchAnimals}
                disabled={isLoading}
                title="Làm mới danh sách"
                aria-label="Làm mới danh sách"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
              >
                <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`} aria-hidden="true"></i><span className="sm:hidden">Làm mới</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-bold">Động vật</th>
                  <th className="px-5 py-3.5 font-bold">Khu vực</th>
                  <th className="px-5 py-3.5 font-bold">Audio</th>
                  <th className="px-5 py-3.5 text-center font-bold">Mã QR</th>
                  <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-5 py-16 text-center text-sm font-medium text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2 text-emerald-600" aria-hidden="true"></i>Đang tải danh sách động vật...</td></tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <div role="alert" className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                        <p className="font-bold">{loadError}</p>
                        <button onClick={fetchAnimals} className="mt-3 min-h-11 rounded-xl bg-white px-4 py-2 font-bold text-amber-800 shadow-sm transition-colors hover:bg-amber-100"><i className="fa-solid fa-rotate mr-2" aria-hidden="true"></i>Thử lại</button>
                      </div>
                    </td>
                  </tr>
                ) : filteredAnimals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400"><i className={`fa-solid ${animals.length ? 'fa-magnifying-glass' : 'fa-paw'}`} aria-hidden="true"></i></div>
                      <p className="mt-4 font-bold text-slate-700">{animals.length ? 'Không tìm thấy động vật phù hợp' : 'Chưa có động vật nào'}</p>
                      <p className="mt-1 text-sm text-slate-500">{animals.length ? 'Thử từ khóa hoặc khu vực khác.' : 'Thêm loài đầu tiên để bắt đầu xây dựng danh mục.'}</p>
                      {!animals.length && <button onClick={() => handleOpenModal()} className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"><i className="fa-solid fa-plus mr-2" aria-hidden="true"></i>Thêm động vật</button>}
                    </td>
                  </tr>
                ) : filteredAnimals.map(animal => (
                  <tr key={animal.id} className="group transition hover:bg-emerald-50/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        {animal.avatarUrl ? (
                          <img src={animal.avatarUrl} alt={animal.defaultLocalName || 'Ảnh động vật'} className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm" />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-lg text-slate-400"><i className="fa-solid fa-paw" aria-hidden="true"></i></div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800">{animal.defaultLocalName || 'Chưa cập nhật tên'}</p>
                          <p className="mt-0.5 text-sm italic text-slate-500">{animal.scientificName || 'Chưa có tên khoa học'}</p>
                          <span className="mt-1.5 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Mã #{animal.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-semibold text-emerald-800"><i className="fa-solid fa-location-dot text-xs text-emerald-600" aria-hidden="true"></i>Khu {animal.zoneId}</span>
                      {animal.zoneName && <p className="mt-1.5 pl-1 text-xs text-slate-500">{animal.zoneName}</p>}
                    </td>
                    <td className="px-5 py-4"><AudioStatus contents={contents[animal.id]} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                          <QRCodeCanvas id={`qr-${animal.id}`} value={`https://zooaudioguide-001-site1.ftempurl.com/a/${animal.id}`} size={60} level="H" />
                        </div>
                        <button onClick={() => handleDownloadQR(animal.id, animal.scientificName)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                          <i className="fa-solid fa-download" aria-hidden="true"></i>Tải mã
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleGenerateAudio(animal.id)} disabled={generatingId !== null} title="Tạo audio thuyết minh" aria-label="Tạo audio thuyết minh" className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50">
                          <i className={`fa-solid ${generatingId === animal.id ? 'fa-spinner fa-spin' : 'fa-volume-high'}`} aria-hidden="true"></i>
                        </button>
                        <button onClick={() => setContentAnimal(animal)} title="Nội dung theo ngôn ngữ (nghe, sửa bản dịch)" aria-label={`Nội dung theo ngôn ngữ của ${animal.defaultLocalName || 'động vật'}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50">
                          <i className="fa-solid fa-language" aria-hidden="true"></i>
                        </button>
                        <button onClick={() => handleOpenModal(animal)} title="Chỉnh sửa" aria-label={`Chỉnh sửa ${animal.defaultLocalName || 'động vật'}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100">
                          <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                        </button>
                        <button onClick={() => handleDelete(animal)} title="Xóa" aria-label={`Xóa ${animal.defaultLocalName || 'động vật'}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100">
                          <i className="fa-solid fa-trash" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && animals.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              Đang hiển thị <span className="font-bold text-slate-700">{filteredAnimals.length}</span> / <span className="font-bold text-slate-700">{animals.length}</span> động vật
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{formData.id ? 'Cập nhật hồ sơ' : 'Danh mục động vật'}</p>
                <h2 className="mt-1 text-xl font-black text-slate-800">{formData.id ? 'Chỉnh sửa thông tin' : 'Thêm động vật mới'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} aria-label="Đóng biểu mẫu" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"><i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
                <i className="fa-solid fa-circle-info mr-2 text-emerald-700" aria-hidden="true"></i>
                Điền thông tin cơ bản và nội dung thuyết minh để hoàn thiện hồ sơ.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="animal-local-name" className="mb-1.5 block text-sm font-bold text-slate-700">Tên tiếng Việt <span className="text-rose-500">*</span></label>
                  <input id="animal-local-name" type="text" value={formData.localName || ''} onChange={e => setFormData({ ...formData, localName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required />
                </div>
                
                <div>
                  <label htmlFor="animal-scientific-name" className="mb-1.5 block text-sm font-bold text-slate-700">Tên khoa học <span className="text-rose-500">*</span></label>
                  <input id="animal-scientific-name" type="text" value={formData.scientificName || ''} onChange={e => setFormData({ ...formData, scientificName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="animal-zone" className="mb-1.5 block text-sm font-bold text-slate-700">Khu vực <span className="text-rose-500">*</span></label>
                  {zoneList.length ? (
                    <select id="animal-zone" value={formData.zoneId || ''} onChange={e => setFormData({ ...formData, zoneId: parseInt(e.target.value) })} className={FIELD} required>
                      {zoneList.map(z => <option key={z.id} value={z.id}>{z.name ? `${z.name} (${z.zoneCode})` : z.zoneCode}</option>)}
                    </select>
                  ) : (
                    <input id="animal-zone" type="number" min="1" value={formData.zoneId || ''} onChange={e => setFormData({ ...formData, zoneId: parseInt(e.target.value) || 1 })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required />
                  )}
                </div>

                <div>
                  <label htmlFor="animal-avatar-url" className="mb-1.5 block text-sm font-bold text-slate-700">Ảnh (tải lên hoặc dán link)</label>
                  <label className={`mb-2 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 ${uploading ? 'opacity-60' : ''}`}>
                    <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-upload'}`} aria-hidden="true"></i>
                    {uploading ? 'Đang tải ảnh…' : 'Tải ảnh lên (JPG, PNG, WebP ≤ 5 MB)'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={e => { handleImageFile(e.target.files?.[0]); e.target.value = ''; }} />
                  </label>
                  <input id="animal-avatar-url" type="url" placeholder="https://..." value={formData.avatarUrl || ''} onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
                </div>
              </div>

              {formData.avatarUrl && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Xem trước ảnh</p>
                  <img src={formData.avatarUrl} alt="Xem trước ảnh động vật" className="h-36 w-36 rounded-xl border border-slate-200 bg-white object-cover" />
                </div>
              )}

              <fieldset className="rounded-2xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-bold text-slate-700">Thông tin nhanh <span className="font-normal text-slate-500">(hiện trên trang du khách, tự dịch sang 5 ngôn ngữ)</span></legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[['conservationStatus', 'Mức bảo tồn'], ['diet', 'Thức ăn'], ['habitat', 'Nơi sống']].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-slate-600">{label}</span>
                      <select value={formData[key] || ''} onChange={e => setFormData({ ...formData, [key]: e.target.value || null })} className={FIELD}>
                        <option value="">Chưa có</option>
                        {FACT_OPTIONS[key].map(([v, text]) => <option key={v} value={v}>{text}</option>)}
                      </select>
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-600">Tuổi thọ (năm)</span>
                    <input type="number" min="1" max="200" value={formData.lifespanYears ?? ''} onChange={e => setFormData({ ...formData, lifespanYears: e.target.value ? parseInt(e.target.value) : null })} className={FIELD} />
                  </label>
                </div>
              </fieldset>

              <div>
                <label htmlFor="animal-script" className="mb-1.5 block text-sm font-bold text-slate-700">Bài thuyết minh</label>
                <textarea id="animal-script" 
                  rows="8" 
                  value={formData.scriptText || ''} 
                  onChange={e => setFormData({ ...formData, scriptText: e.target.value })} 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" 
                  placeholder="Nhập nội dung bài thuyết minh bằng tiếng Việt..."
                  aria-describedby="animal-script-hint"
                />
                {(() => {
                  const n = (formData.scriptText || '').trim().length;
                  const tone = n === 0 ? 'text-slate-500' : n < SCRIPT_MIN ? 'text-amber-700' : n > SCRIPT_MAX ? 'text-amber-700' : 'text-emerald-700';
                  return (
                    <p id="animal-script-hint" className={`mt-1.5 text-xs font-medium ${tone}`}>
                      {n} ký tự (khoảng {Math.max(1, Math.round(n / 15))} giây đọc). Nên viết {SCRIPT_MIN}–{SCRIPT_MAX} ký tự, khoảng 45–90 giây: tên, một điều thú vị, tình trạng bảo tồn, điều khách có thể quan sát ngay trước chuồng.
                    </p>
                  );
                })()}
              </div>

              {formError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">{formError}</p>}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={saving} className="rounded-xl bg-emerald-700 disabled:opacity-60 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20">
                  <i className={`fa-solid ${formData.id ? 'fa-floppy-disk' : 'fa-plus'} mr-2`} aria-hidden="true"></i>{formData.id ? 'Lưu cập nhật' : 'Tạo hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {contentAnimal && (
        <ContentPanel animal={contentAnimal} contents={contents[contentAnimal.id]} onClose={() => setContentAnimal(null)} onSaved={fetchContents} setNotice={setNotice} />
      )}
      {confirmDialog}
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}