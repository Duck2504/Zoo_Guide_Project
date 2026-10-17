import React, { useState, useEffect, useRef } from 'react';

// 8 Loài động vật mẫu đại diện Thảo Cầm Viên Sài Gòn
const INITIAL_ZOO_ANIMALS = [
  {
    id: "zoo-1",
    name: "Voi Châu Á",
    scientificName: "Elephas maximus",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    conservationStatus: "EN - Nguy cấp (Sách Đỏ IUCN)",
    diet: "Ăn thực vật (Cỏ tươi, mía, bí đỏ, chuối)",
    coordinates: { lon: 106.7056, lat: 10.7872 },
    radius_meters: 25,
    color: "#059669",
    icon: "🐘",
    mapLeft: "57.5%",
    mapTop: "36.5%",
    imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700",
    descriptionVi: "Chào mừng quý khách đến với khu vực chuồng Voi Châu Á tại Thảo Cầm Viên Sài Gòn. Voi Châu Á là loài thú trên cạn lớn nhất châu lục, sở hữu chiếc vòi khéo léo với hơn 40.000 bó cơ. Tại đây, đàn voi được chăm sóc theo chế độ dinh dưỡng giàu chất xơ với cỏ tươi, mía, chuối và bí đỏ. Hãy cùng chung tay bảo vệ loài động vật quý hiếm này khỏi nguy cơ tuyệt chủng.",
    audioLength: "01:25"
  },
  {
    id: "zoo-2",
    name: "Hổ Đông Dương",
    scientificName: "Panthera tigris corbetti",
    zone: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    conservationStatus: "CR - Cực kỳ nguy cấp",
    diet: "Ăn thịt tươi (Bò, sườn heo, gà)",
    coordinates: { lon: 106.7061, lat: 10.7885 },
    radius_meters: 20,
    color: "#dc2626",
    icon: "🐅",
    mapLeft: "82.5%",
    mapTop: "76.5%",
    imageUrl: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=700",
    descriptionVi: "Quý khách đang đứng trước khu nuôi dưỡng Hổ Đông Dương - chúa tể của núi rừng Đông Nam Á. Với bộ lông vàng cam rực rỡ và những vằn đen độc bản không con nào giống con nào, hổ sở hữu sức mạnh và khả năng bơi lội đáng nể. Hổ Đông Dương hiện được xếp vào nhóm động vật cực kỳ nguy cấp cần được bảo tồn nghiêm ngặt.",
    audioLength: "01:10"
  },
  {
    id: "zoo-3",
    name: "Hươu Cao Cổ & Ngựa Vằn",
    scientificName: "Giraffa camelopardalis & Equus quagga",
    zone: "Khu Thảo Nguyên & Xavan Châu Phi",
    conservationStatus: "VU - Sắp nguy cấp",
    diet: "Ăn thực vật (Lá keo cao, cỏ khô)",
    coordinates: { lon: 106.7045, lat: 10.7868 },
    radius_meters: 30,
    color: "#f59e0b",
    icon: "🦒",
    mapLeft: "23%",
    mapTop: "77%",
    imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=700",
    descriptionVi: "Khuôn viên thảo nguyên xanh mát mở ra trước mắt quý khách là ngôi nhà chung của Hươu Cao Cổ và Ngựa Vằn. Chiếc cổ dài đặc trưng giúp hươu vươn tới những ngọn cây keo cao nhất. Trong khi đó, bộ lông sọc vằn của ngựa vằn tạo hiệu ứng thị giác xua đuổi côn trùng và đánh lừa động vật ăn thịt trên đồng cỏ hoang dã.",
    audioLength: "01:35"
  },
  {
    id: "zoo-4",
    name: "Vượn Má Vàng & Linh Trưởng",
    scientificName: "Nomascus gabriellae",
    zone: "Đảo Linh Trưởng Rừng Mưa Nhiệt Đới",
    conservationStatus: "EN - Nguy cấp đặc hữu",
    diet: "Ăn tạp (Trái cây rừng, lá non, côn trùng)",
    coordinates: { lon: 106.7049, lat: 10.7880 },
    radius_meters: 20,
    color: "#7c3aed",
    icon: "🐒",
    mapLeft: "86.5%",
    mapTop: "84%",
    imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=700",
    descriptionVi: "Tiếng hót lảnh lót vang vọng cả một góc Thảo Cầm Viên chính là tiếng gọi đàn của Vượn Má Vàng - loài linh trưởng đặc hữu của bán đảo Đông Dương. Chúng có cánh tay rất dài giúp chuyền cành thoăn thoắt với tốc độ đáng kinh ngạc. Thảo Cầm Viên là một trong số ít vườn thú trên thế giới nhân giống thành công loài này.",
    audioLength: "01:15"
  },
  {
    id: "zoo-5",
    name: "Vườn Chim Nhiệt Đới & Hồng Hạc",
    scientificName: "Phoenicopterus ruber",
    zone: "Vườn Chim & Đầm Lầy Thủy Điểu",
    conservationStatus: "LC - Ít lo ngại",
    diet: "Thủy sinh & Giáp xác giàu Carotenoid",
    coordinates: { lon: 106.7068, lat: 10.7878 },
    radius_meters: 25,
    color: "#ec4899",
    icon: "🦩",
    mapLeft: "44%",
    mapTop: "61%",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700",
    descriptionVi: "Đầm lầy rực rỡ sắc hồng là nơi sinh sống của đàn Chim Hồng Hạc cùng hàng chục loài chim quý hiếm như Vẹt Macaw, Cò Sen và Giang Sen. Màu hồng đặc trưng của chim đến từ sắc tố carotenoid có trong các loài giáp xác và tảo nhỏ mà chúng ăn hằng ngày dưới nước.",
    audioLength: "01:05"
  },
  {
    id: "zoo-6",
    name: "Đầm Cá Sấu Nước Lợ",
    scientificName: "Crocodylus porosus",
    zone: "Khu Bò Sát & Lưỡng Cư Cổ Đại",
    conservationStatus: "LC - Được bảo vệ nghiêm ngặt",
    diet: "Thịt tươi sống & cá lớn",
    coordinates: { lon: 106.7072, lat: 10.7865 },
    radius_meters: 25,
    color: "#2563eb",
    icon: "🐊",
    mapLeft: "88%",
    mapTop: "70%",
    imageUrl: "https://images.unsplash.com/photo-1551085254-e96b210db58a?w=700",
    descriptionVi: "Chào mừng quý khách đến với Đầm Cá Sấu Thảo Cầm Viên. Cá sấu nước lợ là loài bò sát còn sống lớn nhất hành tinh với lực cắn khủng khiếp lên tới hơn 3.700 pound/inch vuông. Chúng có thể nằm bất động hàng giờ dưới mặt nước như một khúc gỗ để rình mồi với khả năng ngụy trang hoàn hảo.",
    audioLength: "01:20"
  },
  {
    id: "zoo-7",
    name: "Tê Giác Một Sừng",
    scientificName: "Rhinoceros unicornis",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    conservationStatus: "VU - Sắp nguy cấp",
    diet: "Cỏ voi, cành cây non, rễ cây",
    coordinates: { lon: 106.7051, lat: 10.7865 },
    radius_meters: 30,
    color: "#0d9488",
    icon: "🦏",
    mapLeft: "20.5%",
    mapTop: "69%",
    imageUrl: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=700",
    descriptionVi: "Tê giác là một trong những loài thú to lớn cổ xưa còn tồn tại đến ngày nay với lớp da dầy xếp nếp như áo giáp chiến binh. Chiếc sừng đặc trưng được cấu tạo từ keratin giống như móng tay con người. Chúng đóng vai trò cực kỳ quan trọng trong việc cân bằng hệ sinh thái đồng cỏ.",
    audioLength: "01:18"
  },
  {
    id: "zoo-8",
    name: "Gấu Ngựa Đông Dương",
    scientificName: "Ursus thibetanus",
    zone: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    conservationStatus: "VU - Sắp nguy cấp",
    diet: "Ăn tạp (Mật ong, cá, quả mọng, trứng)",
    coordinates: { lon: 106.7065, lat: 10.7888 },
    radius_meters: 20,
    color: "#475569",
    icon: "🐻",
    mapLeft: "78%",
    mapTop: "75%",
    imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=700",
    descriptionVi: "Gấu ngựa sở hữu vệt lông màu vàng hình chữ Y hoặc chữ V đặc trưng trước ngực, nổi bật trên nền lông đen bóng. Chúng là những vận động viên leo trèo cừ khôi và có thói quen làm tổ trên các chảng cây cao để nghỉ ngơi và ăn trái cây rừng.",
    audioLength: "01:12"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [mapMode, setMapMode] = useState('illustrated'); // 'illustrated' | 'radar'
  const [tourLang, setTourLang] = useState('vi'); // 'vi' | 'en' | 'fr' | 'zh' | 'ja'
  const [activePin, setActivePin] = useState({ left: '57.5%', top: '36.5%', label: 'Voi Châu Á' });
  const [animals, setAnimals] = useState(INITIAL_ZOO_ANIMALS);
  const [selectedAnimal, setSelectedAnimal] = useState(INITIAL_ZOO_ANIMALS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    zone: 'Khu Động Vật Thảo Tự Nhiên & Móng Guốc',
    conservationStatus: 'EN - Nguy cấp (Sách Đỏ IUCN)',
    diet: 'Ăn thực vật (Cỏ tươi, trái cây)',
    lon: '106.7056',
    lat: '10.7872',
    radius: 25,
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700',
    descriptionVi: '',
    voiceRate: 0.95
  });

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSpeech = (text, lang = tourLang) => {
    if (!('speechSynthesis' in window)) {
      alert("Trình duyệt không hỗ trợ Web Speech API!");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      vi: 'vi-VN',
      en: 'en-US',
      fr: 'fr-FR',
      zh: 'zh-CN',
      ja: 'ja-JP'
    };
    utterance.lang = langMap[lang] || 'vi-VN';
    utterance.rate = formData.voiceRate || 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleApplyPreset = (item) => {
    setFormData({
      name: item.name,
      scientificName: item.scientificName,
      zone: item.zone,
      conservationStatus: item.conservationStatus,
      diet: item.diet,
      lon: item.coordinates.lon.toString(),
      lat: item.coordinates.lat.toString(),
      radius: item.radius_meters,
      imageUrl: item.imageUrl,
      descriptionVi: item.descriptionVi,
      voiceRate: 0.95
    });
    showToast(`Đã nạp mẫu: ${item.name}`, 'info');
  };

  const setNarrationStyle = (style) => {
    const name = formData.name || "loài động vật";
    let text = "";
    if (style === 'standard') {
      text = `Chào mừng quý khách đến với khu vực chuồng ${name} tại Thảo Cầm Viên Sài Gòn. Đây là một trong những loài động vật quý hiếm được bảo tồn đặc biệt trong khuôn viên vườn thú hơn 150 năm tuổi.`;
    } else if (style === 'kids') {
      text = `Xin chào các bạn nhỏ! Chúng mình đang đứng trước chuồng ${name} nè! Các bạn có biết loài bạn nhỏ này thích ăn gì nhất không? Hãy cùng chú ý lắng nghe và khám phá những điều kỳ thú nhé!`;
    } else if (style === 'science') {
      text = `Thông số khoa học sinh học: ${name}. Thuộc danh lục Sách Đỏ IUCN về các loài bị đe dọa. Hệ sinh thái sinh cảnh tự nhiên đòi hỏi tán rừng mưa nhiệt đới nguyên sinh và chế độ giám sát thú y nghiêm ngặt.`;
    }
    setFormData({ ...formData, descriptionVi: text });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.descriptionVi.trim()) {
      showToast("Vui lòng nhập Tên loài và Bài thuyết minh!", "error");
      return;
    }

    const lonNum = parseFloat(formData.lon);
    const latNum = parseFloat(formData.lat);
    if (isNaN(lonNum) || isNaN(latNum)) {
      showToast("Tọa độ GPS không hợp lệ!", "error");
      return;
    }

    const words = formData.descriptionVi.trim().split(/\s+/).length;
    const estSec = Math.round((words / 140) * 60);
    const m = Math.floor(estSec / 60);
    const s = estSec % 60;
    const audioLen = `0${m}:${s < 10 ? '0' : ''}${s}`;

    const newAnimal = {
      id: `zoo-${Date.now()}`,
      name: formData.name,
      scientificName: formData.scientificName || "Đang cập nhật",
      zone: formData.zone,
      conservationStatus: formData.conservationStatus,
      diet: formData.diet,
      coordinates: { lon: lonNum, lat: latNum },
      radius_meters: parseInt(formData.radius) || 25,
      color: "#059669",
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700",
      descriptionVi: formData.descriptionVi,
      audioLength: audioLen
    };

    setAnimals([newAnimal, ...animals]);
    setSelectedAnimal(newAnimal);
    showToast(`Đã lưu thành công loài "${newAnimal.name}"!`, "success");
    setActiveTab('list');
  };

  const wordCount = formData.descriptionVi.trim() ? formData.descriptionVi.trim().split(/\s+/).length : 0;
  const estSeconds = Math.round((wordCount / 140) * 60);

  const filteredAnimals = animals.filter(an => 
    an.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    an.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    an.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* Toast Alert */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '12px',
          backgroundColor: notification.type === 'error' ? '#ef4444' : (notification.type === 'info' ? '#3b82f6' : '#059669'),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '13px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{notification.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <header style={{
        backgroundColor: '#064e3b',
        color: '#ffffff',
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #059669',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            backgroundColor: '#10b981',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            🦁
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px' }}>
                HỆ THỐNG THUYẾT MINH SỞ THÚ TỰ ĐỘNG
              </h1>
              <span style={{ backgroundColor: '#047857', color: '#a7f3d0', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                THẢO CẦM VIÊN SÀI GÒN
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#a7f3d0' }}>
              Giảng viên hướng dẫn: TS. Nguyễn Quốc Huy • Quản Trị Viên: Động Vật, GPS Geofence & AI Audio
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }}></span>
            <span>Geofence Engine: <strong>{animals.length} Chuồng Online</strong></span>
          </div>
          <span style={{ backgroundColor: '#047857', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            🇻🇳 TTS Tiếng Việt: Sẵn sàng
          </span>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 28px',
        display: 'flex',
        gap: '6px'
      }}>
        {[
          { key: 'create', icon: '📝', label: 'Thêm Động Vật / Tọa Độ / Bài Thuyết Minh' },
          { key: 'map', icon: '🗺️', label: 'Bản Đồ Geofence Thảo Cầm Viên' },
          { key: 'list', icon: '📋', label: `Quản Lý Danh Sách (${animals.length} Chuồng)` },
          { key: 'mobile', icon: '📱', label: 'App Du Khách Mobile (Giả Lập)' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 18px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
                color: isActive ? '#059669' : '#64748b',
                fontWeight: isActive ? '800' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px' }}>

        {/* TAB 1: FORM THÊM ĐỘNG VẬT / TỌA ĐỘ / BÀI THUYẾT MINH TIẾNG VIỆT */}
        {activeTab === 'create' && (
          <div>
            {/* Banner Presets */}
            <div style={{
              backgroundColor: '#064e3b',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '18px 24px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>
                  🌿 Thêm Chuồng Động Vật, Tọa Độ GPS & Bài Thuyết Minh Tiếng Việt
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#a7f3d0' }}>
                  Biểu mẫu nhập liệu hoàn chỉnh theo chuẩn đồ án: Thiết lập loài, ghim tọa độ GPS Thảo Cầm Viên, bán kính Geofence và lời dẫn du lịch.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(INITIAL_ZOO_ANIMALS[0])}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🐘 Mẫu Voi Châu Á
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(INITIAL_ZOO_ANIMALS[1])}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🐅 Mẫu Hổ Đông Dương
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(INITIAL_ZOO_ANIMALS[2])}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🦒 Mẫu Hươu Cao Cổ
                </button>
              </div>
            </div>

            {/* Form & Live Preview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Form Input Column */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <form onSubmit={handleSubmitForm}>
                  
                  {/* Section 1: Thông tin loài */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ backgroundColor: '#d1fae5', color: '#065f46', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</span>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Thông Tin Loài Động Vật & Phân Phổ</h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                          Tên Loài Động Vật (Tiếng Việt) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Voi Châu Á, Hổ Đông Dương..."
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                          Tên Khoa Học (Latin)
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Elephas maximus..."
                          value={formData.scientificName}
                          onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontStyle: 'italic', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                          Phân Khu Chuồng
                        </label>
                        <select
                          value={formData.zone}
                          onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', outline: 'none' }}
                        >
                          <option value="Khu Động Vật Thảo Tự Nhiên & Móng Guốc">Khu Móng Guốc & Thú Lớn</option>
                          <option value="Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)">Khu Thú Săn Mồi (Ăn thịt)</option>
                          <option value="Khu Thảo Nguyên & Xavan Châu Phi">Khu Thảo Nguyên Xavan</option>
                          <option value="Đảo Linh Trưởng Rừng Mưa Nhiệt Đới">Đảo Linh Trưởng Rừng Mưa</option>
                          <option value="Vườn Chim & Đầm Lầy Thủy Điểu">Vườn Chim & Thủy Điểu</option>
                          <option value="Khu Bò Sát & Lưỡng Cư Cổ Đại">Khu Bò Sát & Lưỡng Cư</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                          Tình Trạng Sách Đỏ IUCN
                        </label>
                        <select
                          value={formData.conservationStatus}
                          onChange={(e) => setFormData({ ...formData, conservationStatus: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', outline: 'none' }}
                        >
                          <option value="CR - Cực kỳ nguy cấp">CR - Cực kỳ nguy cấp</option>
                          <option value="EN - Nguy cấp (Sách Đỏ IUCN)">EN - Nguy cấp (Sách Đỏ IUCN)</option>
                          <option value="VU - Sắp nguy cấp">VU - Sắp nguy cấp</option>
                          <option value="NT - Gần bị đe dọa">NT - Gần bị đe dọa</option>
                          <option value="LC - Ít lo ngại">LC - Ít lo ngại</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Tọa độ GPS & Geofence Radius */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#059669', color: '#ffffff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Tọa Độ GPS & Bán Kính Geofence Kích Hoạt Tự Động (Bản Đồ Thảo Cầm Viên)</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Nhấp vào chuồng thú hoặc điểm bất kỳ trên bản đồ để ghim GPS & thuyết minh tức thì đa ngôn ngữ.</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Thảo Cầm Viên: [10.7876, 106.7052]</span>
                    </div>

                    {/* Multilingual Selector Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '10px', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 'bold' }}>🌐 Ngôn ngữ thuyết minh:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { id: 'vi', label: '🇻🇳 Tiếng Việt' },
                          { id: 'en', label: '🇬🇧 English' },
                          { id: 'fr', label: '🇫🇷 Français' },
                          { id: 'zh', label: '🇨🇳 中文' },
                          { id: 'ja', label: '🇯🇵 日本語' }
                        ].map(l => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => { setTourLang(l.id); handleSpeech(formData.descriptionVi, l.id); }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: tourLang === l.id ? '#059669' : '#1e293b',
                              color: tourLang === l.id ? '#ffffff' : '#94a3b8'
                            }}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Illustrated Map Box */}
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pctX = ((e.clientX - rect.left) / rect.width) * 100;
                        const pctY = ((e.clientY - rect.top) / rect.height) * 100;
                        const lon = (106.7040 + (pctX / 100) * 0.0035).toFixed(6);
                        const lat = (10.7890 - (pctY / 100) * 0.0030).toFixed(6);
                        
                        const matched = animals.find(an => {
                          const anX = parseFloat(an.mapLeft);
                          const anY = parseFloat(an.mapTop);
                          return Math.hypot(pctX - anX, pctY - anY) <= 5.0;
                        });

                        if (matched) {
                          handleApplyPreset(matched);
                          setActivePin({ left: matched.mapLeft, top: matched.mapTop, label: matched.name });
                          handleSpeech(matched.descriptionVi, tourLang);
                        } else {
                          setActivePin({ left: `${pctX.toFixed(2)}%`, top: `${pctY.toFixed(2)}%`, label: `Tọa độ [${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}]` });
                          setFormData(prev => ({
                            ...prev,
                            lon: lon.toString(),
                            lat: lat.toString(),
                            name: `Điểm Khám Phá Thảo Cầm Viên [${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}]`,
                            descriptionVi: `Quý khách đang ở tọa độ ${lat}° vĩ Bắc, ${lon}° kinh Đông bên trong khuôn viên Thảo Cầm Viên Sài Gòn. Bán kính định vị Geofence là ${prev.radius} mét. Chúc quý khách có trải nghiệm tham quan tuyệt vời!`
                          }));
                          handleSpeech(`Quý khách đang ở tọa độ ${lat}° vĩ Bắc, ${lon}° kinh Đông bên trong Thảo Cầm Viên Sài Gòn. Bán kính định vị geofence là ${formData.radius} mét.`, tourLang);
                        }
                      }}
                      style={{
                        position: 'relative',
                        width: '100%',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid #059669',
                        backgroundColor: '#022c22',
                        cursor: 'crosshair',
                        marginBottom: '14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      <img
                        src="ban-do-tcv.jpg"
                        onError={(e) => { e.target.src = 'http://localhost:8000/audio/files/ban-do-tcv.jpg'; }}
                        alt="Bản đồ Thảo Cầm Viên Sài Gòn"
                        style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' }}
                      />

                      {/* Active Geofence Circle on Map */}
                      <div
                        style={{
                          position: 'absolute',
                          left: activePin.left,
                          top: activePin.top,
                          width: `${Math.max(34, Math.round(formData.radius * 2.8))}px`,
                          height: `${Math.max(34, Math.round(formData.radius * 2.8))}px`,
                          transform: 'translate(-50%, -50%)',
                          borderRadius: '50%',
                          border: '2px solid #34d399',
                          backgroundColor: 'rgba(16, 185, 129, 0.25)',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease-out'
                        }}
                      />

                      {/* Active GPS Pin Marker */}
                      <div
                        style={{
                          position: 'absolute',
                          left: activePin.left,
                          top: activePin.top,
                          transform: 'translate(-50%, -100%)',
                          pointerEvents: 'none',
                          zIndex: 25,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', border: '1px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
                          📍 {activePin.label}
                        </div>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#dc2626', transform: 'rotate(45deg)', marginTop: '-3px' }} />
                      </div>

                      {/* Hotspots */}
                      {animals.map((an) => (
                        <div
                          key={an.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPreset(an);
                            setActivePin({ left: an.mapLeft, top: an.mapTop, label: an.name });
                            handleSpeech(an.descriptionVi, tourLang);
                          }}
                          style={{
                            position: 'absolute',
                            left: an.mapLeft,
                            top: an.mapTop,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            zIndex: 20
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: an.color || '#059669',
                            color: '#ffffff',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            transition: 'transform 0.15s'
                          }}>
                            {an.icon || '📍'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                          Kinh Độ (Longitude) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lon}
                          onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                          Vĩ Độ (Latitude) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lat}
                          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Geofence Slider */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>
                          🎯 Bán Kính Geofence:
                        </span>
                        <span style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: 'bold', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' }}>
                          {formData.radius} mét
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        step="5"
                        value={formData.radius}
                        onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        <span>10m (Lồng hẹp)</span>
                        <span>25m (Chuẩn Thảo Cầm Viên)</span>
                        <span>60m (Khu thảo nguyên)</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Bài Thuyết Minh Tiếng Việt */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#fef3c7', color: '#92400e', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>3</span>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Bài Thuyết Minh Tiếng Việt</h4>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {wordCount} từ (~{estSeconds}s audio)
                      </span>
                    </div>

                    {/* Quick tone selector */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      <button type="button" onClick={() => setNarrationStyle('standard')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🏛️ Du Lịch Phổ Thông
                      </button>
                      <button type="button" onClick={() => setNarrationStyle('kids')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🎈 Trẻ Em Vui Nhộn
                      </button>
                      <button type="button" onClick={() => setNarrationStyle('science')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🔬 Khoa Học & Bảo Tồn
                      </button>
                    </div>

                    <textarea
                      required
                      rows="5"
                      placeholder="Nhập nội dung bài thuyết minh chuẩn văn phong du lịch sinh thái Thảo Cầm Viên..."
                      value={formData.descriptionVi}
                      onChange={(e) => setFormData({ ...formData, descriptionVi: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: '1.6', outline: 'none' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleSpeech(formData.descriptionVi || "Vui lòng nhập bài thuyết minh để nghe thử!")}
                        style={{
                          backgroundColor: isSpeaking ? '#ef4444' : '#059669',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {isSpeaking ? '⏹ Dừng Đọc' : '🔊 Nghe Thử Giọng Đọc Tiếng Việt Ngay'}
                      </button>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Phát qua Web Speech API (vi-VN)</span>
                    </div>
                  </div>

                  {/* Section 4: Ảnh đại diện */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>4</span>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>URL Ảnh Chuồng Thú</h4>
                    </div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Form Actions */}
                  <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      💾 Lưu Động Vật & Bài Thuyết Minh Mới
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, name: '', descriptionVi: '' })}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        padding: '12px 18px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Xóa Trắng
                    </button>
                  </div>

                </form>
              </div>

              {/* Live Preview Column */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
                    👁️ Bản Xem Trước Thẻ Du Khách (Live Preview)
                  </h3>
                  <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    Đồng Bộ Tức Thì
                  </span>
                </div>

                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #0f172a', backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <div style={{ position: 'relative', height: '170px' }}>
                    <img
                      src={formData.imageUrl || "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700"}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.65)', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                      📍 {formData.zone}
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#10b981', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                      Geofence: {formData.radius}m
                    </div>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>
                          {formData.name || "Tên Loài Động Vật"}
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          {formData.scientificName || "Scientific Name"}
                        </p>
                      </div>
                      <span style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', fontSize: '10px', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                        {formData.conservationStatus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', backgroundColor: '#1e293b', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#34d399', margin: '10px 0', fontFamily: 'monospace' }}>
                      <span>🌐 Kinh độ: {formData.lon}</span>
                      <span>|</span>
                      <span>🌐 Vĩ độ: {formData.lat}</span>
                    </div>

                    <p style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: '1.6', backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                      {formData.descriptionVi || "Lời thuyết minh tự động khi du khách tiến vào chuồng thú..."}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleSpeech(formData.descriptionVi || "Vui lòng nhập bài thuyết minh!")}
                      style={{
                        width: '100%',
                        backgroundColor: isSpeaking ? '#ef4444' : '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      {isSpeaking ? '⏹ Dừng Giọng Đọc' : '▶ Nghe Thuyết Minh Thảo Cầm Viên'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BẢN ĐỒ GEOFENCE */}
        {activeTab === 'map' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                    🗺️ Bản Đồ Thảo Cầm Viên Sài Gòn — Điểm Tham Quan & Geofence
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Tâm vườn thú: Số 2 Nguyễn Bỉnh Khiêm, Quận 1. Chuyển đổi linh hoạt giữa Bản đồ tranh vẽ gốc và Bản đồ Radar GPS.
                  </p>
                </div>

                {/* Mode Selector Buttons */}
                <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setMapMode('illustrated')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: mapMode === 'illustrated' ? '#059669' : 'transparent',
                      color: mapMode === 'illustrated' ? '#ffffff' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    🎨 Bản Đồ Tranh Vẽ Gốc
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('radar')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: mapMode === 'radar' ? '#059669' : 'transparent',
                      color: mapMode === 'radar' ? '#ffffff' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    📡 Bản Đồ Radar GPS
                  </button>
                </div>
              </div>

              {/* Mode 1: Illustrated Map from official ban-do-tcv.jpg */}
              {mapMode === 'illustrated' && (
                <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '2px solid #059669', backgroundColor: '#022c22', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                  <img
                    src="ban-do-tcv.jpg"
                    onError={(e) => { e.target.src = 'http://localhost:8000/audio/files/ban-do-tcv.jpg'; }}
                    alt="Bản đồ Thảo Cầm Viên Sài Gòn"
                    style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
                  />
                  {animals.map((an) => {
                    const isCur = selectedAnimal.id === an.id;
                    const left = an.mapLeft || '50%';
                    const top = an.mapTop || '50%';
                    return (
                      <div
                        key={an.id}
                        onClick={() => { setSelectedAnimal(an); handleSpeech(an.descriptionVi); }}
                        style={{
                          position: 'absolute',
                          left: left,
                          top: top,
                          transform: 'translate(-50%, -50%)',
                          cursor: 'pointer',
                          zIndex: isCur ? 30 : 20,
                          textAlign: 'center'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isCur ? '#059669' : (an.color || '#3b82f6'),
                          color: '#ffffff',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #ffffff',
                          boxShadow: isCur ? '0 0 16px rgba(16,185,129,0.95)' : '0 2px 6px rgba(0,0,0,0.4)',
                          transform: isCur ? 'scale(1.25)' : 'scale(1)',
                          transition: 'all 0.2s ease-in-out'
                        }}>
                          {an.icon || '📍'}
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '38px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          whiteSpace: 'nowrap',
                          backgroundColor: isCur ? '#064e3b' : 'rgba(15,23,42,0.85)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          pointerEvents: 'none'
                        }}>
                          {an.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mode 2: Radar SVG Map */}
              {mapMode === 'radar' && (
                <div style={{ position: 'relative', width: '100%', height: '500px', backgroundColor: '#e2f1e8', borderRadius: '14px', overflow: 'hidden', border: '2px solid #a7f3d0' }}>
                  <svg width="100%" height="100%" viewBox="0 0 800 500">
                    <path d="M 50 80 Q 200 30 400 70 T 750 90 L 780 430 Q 500 470 200 440 Z" fill="#d1fae5" opacity="0.6" />
                    <path d="M 0 40 Q 300 20 800 30" fill="none" stroke="#93c5fd" strokeWidth="22" opacity="0.8" />
                    <text x="350" y="32" fill="#1e40af" fontSize="11" fontWeight="bold">KÊNH NHIÊU LỘC - THỊ NGHÈ</text>
                    <path d="M 80 250 Q 250 200 400 250 T 720 230" fill="none" stroke="#fed7aa" strokeWidth="20" strokeLinecap="round" />
                    <path d="M 380 70 L 400 440" fill="none" stroke="#fed7aa" strokeWidth="16" strokeLinecap="round" />

                    {animals.map((an, idx) => {
                      const px = 100 + ((an.coordinates.lon - 106.7040) / 0.0040) * 600;
                      const py = 430 - ((an.coordinates.lat - 10.7860) / 0.0035) * 360;
                      const rPix = an.radius_meters * 1.5;
                      const isCur = selectedAnimal.id === an.id;

                      return (
                        <g key={an.id} onClick={() => { setSelectedAnimal(an); handleSpeech(an.descriptionVi); }} style={{ cursor: 'pointer' }}>
                          <circle cx={px} cy={py} r={rPix} fill={isCur ? "rgba(16, 185, 129, 0.35)" : "rgba(59, 130, 246, 0.18)"} stroke={isCur ? "#059669" : "#3b82f6"} strokeWidth="2" strokeDasharray={isCur ? "4,4" : "none"} />
                          <circle cx={px} cy={py} r="14" fill={isCur ? "#059669" : "#ffffff"} stroke="#0f172a" strokeWidth="2" />
                          <text x={px} y={py + 4} textAnchor="middle" fill={isCur ? "#ffffff" : "#0f172a"} fontSize="10" fontWeight="bold">{idx + 1}</text>
                          <rect x={px - 45} y={py - 30} width="90" height="18" rx="4" fill={isCur ? "#064e3b" : "rgba(15, 23, 42, 0.85)"} />
                          <text x={px} y={py - 17} textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">{an.name}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>

            {/* Selected Detail */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                {selectedAnimal.zone}
              </span>
              <h3 style={{ margin: '8px 0 2px', fontSize: '18px', color: '#0f172a' }}>{selectedAnimal.name}</h3>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>{selectedAnimal.scientificName}</p>
              
              <img src={selectedAnimal.imageUrl} alt={selectedAnimal.name} style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
              
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '11px', color: '#475569', marginBottom: '12px' }}>
                <div>📍 <strong>Tọa độ:</strong> {selectedAnimal.coordinates.lat}°N, {selectedAnimal.coordinates.lon}°E</div>
                <div>🎯 <strong>Geofence:</strong> {selectedAnimal.radius_meters}m</div>
                <div>🛡️ <strong>Bảo tồn:</strong> {selectedAnimal.conservationStatus}</div>
              </div>

              <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '14px' }}>
                {selectedAnimal.descriptionVi}
              </p>

              <button
                type="button"
                onClick={() => handleSpeech(selectedAnimal.descriptionVi)}
                style={{ width: '100%', backgroundColor: isSpeaking ? '#ef4444' : '#059669', color: '#ffffff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {isSpeaking ? '⏹ Dừng Phát Âm' : '🔊 Nghe Bài Thuyết Minh'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DANH SÁCH QUẢN LÝ */}
        {activeTab === 'list' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  📋 Danh Sách Động Vật & Bài Thuyết Minh ({filteredAnimals.length} Chuồng)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Toàn bộ chuồng thú đã được cấu hình GPS Geofence và bài thuyết minh tự động
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Tìm theo tên loài..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
                <button
                  onClick={() => setActiveTab('create')}
                  style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  + Thêm Chuồng Mới
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px' }}>STT</th>
                  <th style={{ padding: '12px' }}>Loài Thú</th>
                  <th style={{ padding: '12px' }}>Phân Khu</th>
                  <th style={{ padding: '12px' }}>Tọa Độ GPS</th>
                  <th style={{ padding: '12px' }}>Geofence</th>
                  <th style={{ padding: '12px' }}>Bảo Tồn</th>
                  <th style={{ padding: '12px' }}>Thời Lượng</th>
                  <th style={{ padding: '12px' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((an, idx) => (
                  <tr key={an.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#64748b' }}>#{idx + 1}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={an.imageUrl} alt={an.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{an.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>{an.scientificName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{an.zone}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '11px' }}>{an.coordinates.lon.toFixed(4)}, {an.coordinates.lat.toFixed(4)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        {an.radius_meters}m
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                        {an.conservationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#059669' }}>⏱ {an.audioLength}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => { setSelectedAnimal(an); handleSpeech(an.descriptionVi); }}
                        style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🔊 Nghe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: APP DU KHÁCH MOBILE (GIẢ LẬP) */}
        {activeTab === 'mobile' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '36px', padding: '10px 0' }}>
            <div style={{ width: '340px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 'bold' }}>
                📡 Mô Phỏng GPS Du Khách
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                Nhấn vào từng khu chuồng để mô phỏng du khách di chuyển vào vùng bán kính Geofence:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                {animals.map((an) => {
                  const isCur = selectedAnimal.id === an.id;
                  return (
                    <button
                      key={an.id}
                      onClick={() => { setSelectedAnimal(an); handleSpeech(an.descriptionVi); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isCur ? '2px solid #059669' : '1px solid #cbd5e1',
                        backgroundColor: isCur ? '#ecfdf5' : '#f8fafc',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>{an.name}</div>
                      <div style={{ fontSize: '11px', color: isCur ? '#059669' : '#64748b' }}>
                        {isCur ? `🎯 ĐÃ VÀO VÙNG (12m ≤ ${an.radius_meters}m)` : `Cách 60m`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smartphone simulator */}
            <div style={{
              width: '340px',
              height: '660px',
              backgroundColor: '#0f172a',
              borderRadius: '44px',
              border: '8px solid #334155',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 25px 30px -5px rgba(0, 0, 0, 0.35)'
            }}>
              <div>
                <div style={{ textAlign: 'center', marginTop: '14px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>🌿 THẢO CẦM VIÊN AUDIO TOUR</span>
                </div>
                <img src={selectedAnimal.imageUrl} alt={selectedAnimal.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '16px', marginBottom: '12px' }} />
                <h3 style={{ color: '#ffffff', margin: '4px 0 2px', fontSize: '18px', fontWeight: 'bold' }}>{selectedAnimal.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 10px', fontStyle: 'italic' }}>{selectedAnimal.scientificName}</p>

                <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', padding: '10px 12px', borderRadius: '10px' }}>
                  <p style={{ color: '#34d399', fontSize: '11px', fontWeight: 'bold', margin: '0 0 4px' }}>🎯 GPS GEOFENCE TỰ ĐỘNG PHÁT HIỆN (12m)</p>
                  <p style={{ color: '#e2e8f0', fontSize: '11px', margin: 0, lineHeight: '1.5', maxHeight: '110px', overflowY: 'auto' }}>
                    {selectedAnimal.descriptionVi}
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>
                    {isSpeaking ? '▶ Đang thuyết minh...' : '⏸ Tạm dừng'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>🇻🇳 Tiếng Việt</span>
                </div>
                <button
                  onClick={() => handleSpeech(selectedAnimal.descriptionVi)}
                  style={{ width: '100%', backgroundColor: isSpeaking ? '#ef4444' : '#10b981', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {isSpeaking ? '⏹ Dừng Thuyết Minh' : '▶ Tiếp Tục Nghe'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
