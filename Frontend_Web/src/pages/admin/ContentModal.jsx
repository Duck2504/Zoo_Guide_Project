import { useState, useEffect } from 'react';

export default function ContentModal({ animalId, animalName, onClose }) {
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State cho form nhập liệu
  const [formData, setFormData] = useState({
    languageCode: 'vi',
    localName: '',
    scriptText: '',
    audioFile: null
  });

  // 1. Tải danh sách nội dung đã có của con vật này
  const fetchContents = async () => {
    setIsLoading(true);
    try {
      // API lấy danh sách bài thuyết minh của 1 con vật (Em cần viết API này ở Core Backend)
      const res = await fetch(`https://backend-zooaudio.onrender.com/api/animals/${animalId}/contents`);
      if (res.ok) {
        const data = await res.json();
        setContents(data);
      }
    } catch (error) {
      console.error("Lỗi tải nội dung:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [animalId]);

  // 2. Xử lý lưu bài viết và upload audio
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // BƯỚC 1: Gọi sang Microservice của bạn kia để Upload file MP3 (Nếu có chọn file)
    let audioUrl = "";
    if (formData.audioFile) {
      const uploadData = new FormData();
      uploadData.append('file', formData.audioFile);
      
      try {
        // Thay bằng URL Microservice của bạn cùng nhóm
        const uploadRes = await fetch('http://localhost:5001/api/audio/upload', {
          method: 'POST',
          body: uploadData
        });
        const uploadResult = await uploadRes.json();
        audioUrl = uploadResult.url; // Lấy URL trả về từ Microservice
      } catch (error) {
        alert("Lỗi upload file âm thanh sang Microservice!");
        return;
      }
    }

    // BƯỚC 2: Gọi về Core Backend của em để lưu chữ và URL vào bảng AnimalContent
    try {
      const payload = {
        animalId: animalId,
        languageCode: formData.languageCode,
        localName: formData.localName,
        scriptText: formData.scriptText,
        audioUrl: audioUrl
      };

      const res = await fetch(`https://backend-zooaudio.onrender.com/api/animals/${animalId}/contents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Lưu nội dung thành công!");
        setFormData({ languageCode: 'vi', localName: '', scriptText: '', audioFile: null });
        fetchContents(); // Tải lại danh sách bên dưới
      }
    } catch (error) {
      console.error("Lỗi lưu nội dung:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800">Quản lý Thuyết minh & Audio</h2>
            <p className="text-sm font-bold text-zoo-600 mt-1">Động vật: {animalName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        {/* Thân Modal chia 2 cột */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI: Form thêm mới */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Thêm / Cập nhật nội dung</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Ngôn ngữ</label>
                <select 
                  value={formData.languageCode} 
                  onChange={e => setFormData({...formData, languageCode: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-zoo-500"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English (Tiếng Anh)</option>
                  <option value="ko">한국어 (Tiếng Hàn)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Tên động vật (theo ngôn ngữ)</label>
                <input type="text" value={formData.localName} onChange={e => setFormData({...formData, localName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-zoo-500" required placeholder="Vd: Hổ Đông Dương / Indochinese Tiger" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Nội dung thuyết minh (ScriptText)</label>
                <textarea rows="4" value={formData.scriptText} onChange={e => setFormData({...formData, scriptText: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-zoo-500 custom-scrollbar" required placeholder="Kịch bản dùng để đọc audio..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">File Audio (.mp3) - Xử lý qua Microservice</label>
                <input type="file" accept="audio/mp3" onChange={e => setFormData({...formData, audioFile: e.target.files[0]})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zoo-50 file:text-zoo-700 hover:file:bg-zoo-100" />
              </div>

              <button type="submit" className="w-full bg-zoo-600 hover:bg-zoo-700 text-white font-bold py-3 rounded-xl transition mt-2">
                Lưu nội dung & Tải Audio lên
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: Danh sách đã có */}
          <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Các ngôn ngữ đã có</h3>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-slate-500 italic">Đang tải...</p>
              ) : contents.length === 0 ? (
                <p className="text-slate-500 italic text-sm">Chưa có bài thuyết minh nào.</p>
              ) : (
                contents.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-zoo-600 bg-zoo-50 px-2 py-1 rounded-md text-sm uppercase">
                        {c.languageCode}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.syncStatus === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {c.syncStatus}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">{c.localName}</p>
                    {c.audioUrl && (
                      <audio controls className="w-full h-8 mt-3">
                        <source src={c.audioUrl} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}