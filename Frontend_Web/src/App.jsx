import React, { useState, useEffect, useRef } from 'react';
import RealZooMap, { ZOO_BOUNDARY_POLYGON, isPointInsideZoo, ZOO_GATES } from './RealZooMap.jsx';
import RealPickerMap from './RealPickerMap.jsx';

// 8 Loài động vật mẫu đại diện vườn thú (Tất cả tọa độ nằm 100% bên trong ranh giới khuôn viên Vườn Thú)
const INITIAL_ZOO_ANIMALS = [
  {
    id: "zoo-1",
    name: "Voi Châu Á",
    scientificName: "Elephas maximus",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    conservationStatus: "EN - Nguy cấp (Sách Đỏ IUCN)",
    diet: "Ăn thực vật (Cỏ tươi, mía, bí đỏ, chuối)",
    coordinates: { lon: 106.7055, lat: 10.7873 },
    radius_meters: 25,
    color: "#059669",
    mapLeft: "57.5%",
    mapTop: "36.5%",
    imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700",
    descriptionVi: "Chào mừng quý khách đến với khu vực chuồng Voi Châu Á tại vườn thú. Voi Châu Á là loài thú trên cạn lớn nhất châu lục, sở hữu chiếc vòi khéo léo với hơn 40.000 bó cơ. Tại đây, đàn voi được chăm sóc theo chế độ dinh dưỡng giàu chất xơ với cỏ tươi, mía, chuối và bí đỏ. Hãy cùng chung tay bảo vệ loài động vật quý hiếm này khỏi nguy cơ tuyệt chủng.",
    audioLength: "01:25"
  },
  {
    id: "zoo-2",
    name: "Hổ Đông Dương",
    scientificName: "Panthera tigris corbetti",
    zone: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    conservationStatus: "CR - Cực kỳ nguy cấp",
    diet: "Ăn thịt tươi (Bò, sườn heo, gà)",
    coordinates: { lon: 106.7057, lat: 10.7883 },
    radius_meters: 20,
    color: "#dc2626",
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
    coordinates: { lon: 106.7047, lat: 10.7869 },
    radius_meters: 30,
    color: "#f59e0b",
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
    coordinates: { lon: 106.7048, lat: 10.7877 },
    radius_meters: 20,
    color: "#7c3aed",
    mapLeft: "86.5%",
    mapTop: "84%",
    imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=700",
    descriptionVi: "Tiếng hót lảnh lót vang vọng cả một góc vườn thú chính là tiếng gọi đàn của Vượn Má Vàng - loài linh trưởng đặc hữu của bán đảo Đông Dương. Chúng có cánh tay rất dài giúp chuyền cành thoăn thoắt với tốc độ đáng kinh ngạc. Vườn thú là một trong số ít nơi nhân giống thành công loài này.",
    audioLength: "01:15"
  },
  {
    id: "zoo-5",
    name: "Vườn Chim Nhiệt Đới & Hồng Hạc",
    scientificName: "Phoenicopterus ruber",
    zone: "Vườn Chim & Đầm Lầy Thủy Điểu",
    conservationStatus: "LC - Ít lo ngại",
    diet: "Thủy sinh & Giáp xác giàu Carotenoid",
    coordinates: { lon: 106.7062, lat: 10.7875 },
    radius_meters: 25,
    color: "#ec4899",
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
    coordinates: { lon: 106.7062, lat: 10.7868 },
    radius_meters: 25,
    color: "#2563eb",
    mapLeft: "88%",
    mapTop: "70%",
    imageUrl: "https://images.unsplash.com/photo-1551085254-e96b210db58a?w=700",
    descriptionVi: "Chào mừng quý khách đến với Đầm Cá Sấu vườn thú. Cá sấu nước lợ là loài bò sát còn sống lớn nhất hành tinh với lực cắn khủng khiếp lên tới hơn 3.700 pound/inch vuông. Chúng có thể nằm bất động hàng giờ dưới mặt nước như một khúc gỗ để rình mồi với khả năng ngụy trang hoàn hảo.",
    audioLength: "01:20"
  },
  {
    id: "zoo-7",
    name: "Tê Giác Một Sừng",
    scientificName: "Rhinoceros unicornis",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    conservationStatus: "VU - Sắp nguy cấp",
    diet: "Cỏ voi, cành cây non, rễ cây",
    coordinates: { lon: 106.7052, lat: 10.7866 },
    radius_meters: 30,
    color: "#0d9488",
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
    coordinates: { lon: 106.7052, lat: 10.7883 },
    radius_meters: 20,
    color: "#475569",
    mapLeft: "78%",
    mapTop: "75%",
    imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=700",
    descriptionVi: "Gấu ngựa sở hữu vệt lông màu vàng hình chữ Y hoặc chữ V đặc trưng trước ngực, nổi bật trên nền lông đen bóng. Chúng là những vận động viên leo trèo cừ khôi và có thói quen làm tổ trên các chảng cây cao để nghỉ ngơi và ăn trái cây rừng.",
    audioLength: "01:12"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('map'); // Default to map for tour guide experience
  const [mapMode, setMapMode] = useState('illustrated'); // 'illustrated' | 'radar'
  const [tourLang, setTourLang] = useState('vi'); // 'vi' | 'en' | 'fr' | 'zh' | 'ja'
  const [activePin, setActivePin] = useState({ left: '57.5%', top: '36.5%', label: 'Voi Châu Á' });
  const [animals, setAnimals] = useState(INITIAL_ZOO_ANIMALS);
  const [selectedAnimal, setSelectedAnimal] = useState(INITIAL_ZOO_ANIMALS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Backend API Status (.NET 9.0 port 5000/5222 & Python FastAPI port 8000)
  const [apiInfo, setApiInfo] = useState({
    fastApiStatus: 'checking',
    dotnetStatus: 'checking',
    activeBackend: 'Đang kết nối API...',
    isConnected: false
  });

  // Vị trí người dùng & Presets trong vườn thú (100% nằm trọn bên trong ranh giới)
  const LOCATION_PRESETS = [
    { label: 'Cổng Chính (Nguyễn Bỉnh Khiêm)', mapLeft: '32%', mapTop: '82%', lon: 106.7040, lat: 10.7868 },
    { label: 'Đền Thờ Vua Hùng & Bảo Tàng Lịch Sử', mapLeft: '38%', mapTop: '88%', lon: 106.7046, lat: 10.7863 },
    { label: 'Hồ Sen & Đảo Linh Trưởng Trung Tâm', mapLeft: '50%', mapTop: '55%', lon: 106.7055, lat: 10.7875 },
    { label: 'Khu Vực Cầu Thị Nghè (Góc Vườn Thú)', mapLeft: '80%', mapTop: '25%', lon: 106.7065, lat: 10.7886 }
  ];

  const [userLocation, setUserLocation] = useState({
    lon: 106.7040,
    lat: 10.7868,
    mapLeft: '32%',
    mapTop: '82%',
    label: 'Cổng Chính (Nguyễn Bỉnh Khiêm)',
    isRealGPS: false
  });
  const [selectedGate, setSelectedGate] = useState(ZOO_GATES[0]);
  const [isLocating, setIsLocating] = useState(false);

  // Trạng thái Chỉ đường (Navigation)
  const [navigationTarget, setNavigationTarget] = useState(null);
  const [isWalking, setIsWalking] = useState(false);
  const walkingTimerRef = useRef(null);

  // Trạng thái Tour Thuyết Minh Tự Động (Xe đi lần lượt các điểm)
  const [tourState, setTourState] = useState({
    isActive: false,
    isPaused: false,
    currentStopIndex: 0,
    phase: 'idle' // 'idle' | 'driving' | 'arrived' | 'narrating' | 'completed'
  });
  const tourTimerRef = useRef(null);
  const tourSpeechTimerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    zone: 'Khu Động Vật Thảo Tự Nhiên & Móng Guốc',
    conservationStatus: 'EN - Nguy cấp (Sách Đỏ IUCN)',
    diet: 'Ăn thực vật (Cỏ tươi, trái cây)',
    lon: '106.7055',
    lat: '10.7873',
    radius: 25,
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700',
    descriptionVi: '',
    voiceRate: 0.95
  });

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Tính khoảng cách theo công thức Haversine (mét)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Kiểm tra & kết nối Backend API (.NET 9.0 Port 5000/5222 & Python FastAPI Port 8000)
  useEffect(() => {
    let isMounted = true;
    const checkBackends = async () => {
      let isFastApiOk = false;
      let isDotnetOk = false;
      let activeNames = [];

      // 1. Kiểm tra Python FastAPI (Port 8000)
      try {
        const res = await fetch('http://localhost:8000/api/health', { signal: AbortSignal.timeout(1800) });
        if (res.ok) {
          isFastApiOk = true;
          activeNames.push('FastAPI:8000');
        }
      } catch (e) {}

      // 2. Kiểm tra C# .NET API (Port 5000 hoặc 5222)
      try {
        const resNet = await fetch('http://localhost:5000/weatherforecast', { signal: AbortSignal.timeout(1800) });
        if (resNet.ok) {
          isDotnetOk = true;
          activeNames.push('.NET:5000');
        }
      } catch (e) {
        try {
          const resNet2 = await fetch('http://localhost:5222/weatherforecast', { signal: AbortSignal.timeout(1200) });
          if (resNet2.ok) {
            isDotnetOk = true;
            activeNames.push('.NET:5222');
          }
        } catch (e2) {}
      }

      // 3. Kiểm tra .NET Narration Microservice (Port 5292)
      let isNarrationOk = false;
      try {
        const resNarr = await fetch('http://localhost:5292/health', { signal: AbortSignal.timeout(1200) });
        if (resNarr.ok) {
          isNarrationOk = true;
          activeNames.push('Narration:5292');
        }
      } catch (e3) {}

      if (isMounted) {
        const isConnected = isFastApiOk || isDotnetOk || isNarrationOk;
        setApiInfo({
          fastApiStatus: isFastApiOk ? 'connected' : 'offline',
          dotnetStatus: isDotnetOk ? 'connected' : 'offline',
          narrationStatus: isNarrationOk ? 'connected' : 'offline',
          isConnected,
          activeBackend: isConnected ? activeNames.join(' & ') : 'Chờ khởi động API'
        });
      }
    };

    checkBackends();
    const interval = setInterval(checkBackends, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Lấy vị trí GPS thật từ trình duyệt
  const handleGetLiveGPS = () => {
    if (!navigator.geolocation) {
      showToast("Trình duyệt không hỗ trợ Geolocation!", "error");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const inside = isPointInsideZoo(latitude, longitude);

        if (inside) {
          setUserLocation({
            lon: parseFloat(longitude.toFixed(6)),
            lat: parseFloat(latitude.toFixed(6)),
            label: `GPS Hiện Tại Của Bạn (±${Math.round(accuracy)}m)`,
            isRealGPS: true
          });
          showToast(`Đã nhận vị trí GPS của bạn trong Vườn Thú [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]!`, "success");
        } else {
          // Khi người dùng đang ở ngoài vườn thú (ở nhà/trường học/văn phòng):
          setUserLocation({
            lon: 106.7040,
            lat: 10.7868,
            label: `GPS Của Bạn [${latitude.toFixed(4)}, ${longitude.toFixed(4)}] → Đặt tại Cổng Chính`,
            isRealGPS: true,
            userActualCoords: { lat: latitude, lon: longitude }
          });
          showToast(`Đã nhận GPS thực tế của bạn [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]! Điểm xuất phát được đặt tại Cổng Chính Vườn Thú để bắt đầu đi thử.`, "success");
        }
      },
      (err) => {
        setIsLocating(false);
        showToast("Không thể lấy GPS từ trình duyệt (đang dùng vị trí Cổng chính)", "info");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Khởi động chỉ đường đến con thú
  const startNavigation = (animal) => {
    setNavigationTarget(animal);
    setSelectedAnimal(animal);
    setActiveTab('map');
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      animal.coordinates.lat,
      animal.coordinates.lon
    );
    showToast(`Bắt đầu chỉ đường đến: ${animal.name} (${dist}m)`, 'info');
    handleSpeech(`Đang kích hoạt lộ trình dẫn đường đến chuồng ${animal.name}. Khoảng cách ước tính ${dist} mét. Vui lòng di chuyển theo lộ trình chỉ dẫn trên bản đồ.`, tourLang);
  };

  // Hủy dẫn đường
  const cancelNavigation = () => {
    if (walkingTimerRef.current) {
      clearInterval(walkingTimerRef.current);
      walkingTimerRef.current = null;
    }
    setIsWalking(false);
    setNavigationTarget(null);
    showToast("Đã dừng chỉ đường.", "info");
  };

  // Đặt hình người đi bộ tại Cổng Chính
  const placeTouristAtGate = (gate = ZOO_GATES[0]) => {
    const targetGate = gate || ZOO_GATES[0];
    setSelectedGate(targetGate);
    cancelNavigation();
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (tourSpeechTimerRef.current) clearTimeout(tourSpeechTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setTourState(prev => ({ ...prev, isActive: false, phase: 'idle' }));

    setUserLocation({
      lat: targetGate.lat,
      lon: targetGate.lon,
      label: `Tôi (Tại ${targetGate.name})`,
      isRealGPS: false
    });
    showToast(`Đã đặt người đi bộ tại: ${targetGate.name}! Sẵn sàng xuất phát.`, "success");
  };

  // Người đi bộ xuất phát từ Cổng Chính đi vào một địa điểm cụ thể
  const walkFromGateToAnimal = (gate = ZOO_GATES[0], targetAnimal) => {
    const targetGate = gate || ZOO_GATES[0];
    setSelectedGate(targetGate);
    cancelNavigation();
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (tourSpeechTimerRef.current) clearTimeout(tourSpeechTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setSelectedAnimal(targetAnimal);
    setNavigationTarget(targetAnimal);

    setTourState({
      isActive: true,
      isPaused: false,
      currentStopIndex: animals.findIndex(a => a.id === targetAnimal.id),
      phase: 'driving'
    });

    showToast(`Người đi bộ xuất phát từ ${targetGate.shortName} -> đang di chuyển đến: ${targetAnimal.name}...`, "info");

    const startLat = targetGate.lat;
    const startLon = targetGate.lon;
    const targetLat = targetAnimal.coordinates.lat;
    const targetLon = targetAnimal.coordinates.lon;

    let step = 0;
    const totalSteps = 28;

    tourTimerRef.current = setInterval(() => {
      step++;
      const p = step / totalSteps;
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

      if (p >= 1) {
        clearInterval(tourTimerRef.current);
        tourTimerRef.current = null;

        setUserLocation(prev => ({
          ...prev,
          lat: targetLat,
          lon: targetLon,
          label: `Tại chuồng ${targetAnimal.name}`
        }));

        setTourState(prev => ({ ...prev, phase: 'narrating' }));
        showToast(`ĐÃ ĐẾN NƠI: Người đi bộ từ ${gate.shortName} đã đến chuồng ${targetAnimal.name}! Bắt đầu thuyết minh.`, "success");

        const speechContent = `Quý khách vừa đi bộ từ ${gate.name} đến điểm tham quan ${targetAnimal.name}. ` + targetAnimal.descriptionVi;
        speakWithCallback(speechContent, tourLang, () => {
          showToast(`Đã hoàn tất thuyết minh tại chuồng ${targetAnimal.name}!`, "info");
          setTourState(prev => ({ ...prev, isActive: false, phase: 'idle' }));
        });
      } else {
        const curLat = parseFloat((startLat + (targetLat - startLat) * ease).toFixed(6));
        const curLon = parseFloat((startLon + (targetLon - startLon) * ease).toFixed(6));
        setUserLocation(prev => ({
          ...prev,
          lat: curLat,
          lon: curLon,
          label: `Đi từ ${gate.shortName} -> ${targetAnimal.name}...`
        }));
      }
    }, 60);
  };

  // Bắt đầu tour đi bộ từ Cổng Chính vào lần lượt 8 địa điểm
  const startTourFromGate = (gate = ZOO_GATES[0]) => {
    const targetGate = gate || ZOO_GATES[0];
    setSelectedGate(targetGate);
    setUserLocation({
      lat: targetGate.lat,
      lon: targetGate.lon,
      label: `Xuất phát từ ${targetGate.name}`,
      isRealGPS: false
    });
    showToast(`Bắt đầu hành trình đi bộ từ ${targetGate.name} lần lượt qua 8 địa điểm...`, "success");
    setTimeout(() => {
      startAutoTour();
    }, 200);
  };

  // 0. Cho hình người đi thử đến một điểm cụ thể theo yêu cầu
  const walkToAnimal = (targetAnimal) => {
    cancelNavigation();
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (tourSpeechTimerRef.current) clearTimeout(tourSpeechTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setSelectedAnimal(targetAnimal);
    setNavigationTarget(targetAnimal);

    setTourState({
      isActive: true,
      isPaused: false,
      currentStopIndex: animals.findIndex(a => a.id === targetAnimal.id),
      phase: 'driving'
    });

    showToast(`Hình người đi thử đang di chuyển đến: ${targetAnimal.name}...`, "info");

    const startLat = userLocation.lat;
    const startLon = userLocation.lon;
    const targetLat = targetAnimal.coordinates.lat;
    const targetLon = targetAnimal.coordinates.lon;

    let step = 0;
    const totalSteps = 26;

    tourTimerRef.current = setInterval(() => {
      step++;
      const p = step / totalSteps;
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

      if (p >= 1) {
        clearInterval(tourTimerRef.current);
        tourTimerRef.current = null;

        setUserLocation(prev => ({
          ...prev,
          lat: targetLat,
          lon: targetLon,
          label: `Tại chuồng ${targetAnimal.name}`
        }));

        setTourState(prev => ({ ...prev, phase: 'narrating' }));
        showToast(`ĐÃ ĐẾN NƠI: Hình người đã đến chuồng ${targetAnimal.name}! Bắt đầu thuyết minh.`, "success");

        const speechContent = `Quý khách đã đến điểm tham quan ${targetAnimal.name}. ` + targetAnimal.descriptionVi;
        speakWithCallback(speechContent, tourLang, () => {
          showToast(`Đã hoàn tất thuyết minh tại chuồng ${targetAnimal.name}!`, "info");
          setTourState(prev => ({ ...prev, isActive: false, phase: 'idle' }));
        });
      } else {
        const curLat = parseFloat((startLat + (targetLat - startLat) * ease).toFixed(6));
        const curLon = parseFloat((startLon + (targetLon - startLon) * ease).toFixed(6));
        setUserLocation(prev => ({
          ...prev,
          lat: curLat,
          lon: curLon,
          label: `Đang đi đến chuồng ${targetAnimal.name}...`
        }));
      }
    }, 60);
  };

  // 1. Bắt đầu tour thuyết minh tự động qua các địa điểm
  const startAutoTour = () => {
    if (animals.length === 0) {
      showToast("Danh sách không có chuồng thú nào để tham quan!", "error");
      return;
    }
    cancelNavigation();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setTourState({
      isActive: true,
      isPaused: false,
      currentStopIndex: 0,
      phase: 'driving'
    });
    showToast("Bắt đầu hành trình đi thử! Hình người du khách đang di chuyển từ vị trí của bạn...", "success");
    driveToStop(0, userLocation.lat, userLocation.lon);
  };

  // 2. Xe di chuyển mượt mà trên bản đồ thực tế tới từng điểm dừng
  const driveToStop = (stopIndex, fromLat, fromLon) => {
    if (stopIndex >= animals.length) {
      finishAutoTour();
      return;
    }

    const targetAnimal = animals[stopIndex];
    setSelectedAnimal(targetAnimal);
    setNavigationTarget(targetAnimal);

    setTourState(prev => ({
      ...prev,
      currentStopIndex: stopIndex,
      phase: 'driving'
    }));

    const startLat = fromLat;
    const startLon = fromLon;
    const targetLat = targetAnimal.coordinates.lat;
    const targetLon = targetAnimal.coordinates.lon;

    let step = 0;
    const totalSteps = 28; // ~1.8s di chuyển mượt mà

    if (tourTimerRef.current) clearInterval(tourTimerRef.current);

    tourTimerRef.current = setInterval(() => {
      step++;
      const p = step / totalSteps;
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

      if (p >= 1) {
        clearInterval(tourTimerRef.current);
        tourTimerRef.current = null;

        setUserLocation(prev => ({
          ...prev,
          lat: targetLat,
          lon: targetLon,
          label: `Tại chuồng ${targetAnimal.name}`
        }));

        arriveAndNarrateStop(stopIndex, targetAnimal);
      } else {
        const curLat = parseFloat((startLat + (targetLat - startLat) * ease).toFixed(6));
        const curLon = parseFloat((startLon + (targetLon - startLon) * ease).toFixed(6));
        setUserLocation(prev => ({
          ...prev,
          lat: curLat,
          lon: curLon,
          label: `Đang đến chuồng ${targetAnimal.name}...`
        }));
      }
    }, 65);
  };

  // 3. Đến nơi: dừng xe và tự động phát bài thuyết minh tiếng Việt
  const arriveAndNarrateStop = (stopIndex, targetAnimal) => {
    setTourState(prev => ({
      ...prev,
      phase: 'narrating'
    }));

    showToast(`ĐÃ ĐẾN NƠI: Điểm ${stopIndex + 1}/${animals.length} - ${targetAnimal.name}! Bắt đầu thuyết minh.`, "success");

    const intro = `Quý khách đã đến điểm tham quan số ${stopIndex + 1}: ${targetAnimal.name}. `;
    const speechContent = intro + targetAnimal.descriptionVi;

    speakWithCallback(speechContent, tourLang, () => {
      showToast(`Đã thuyết minh xong ${targetAnimal.name}! Chuẩn bị sang điểm tiếp theo...`, "info");
      tourSpeechTimerRef.current = setTimeout(() => {
        const nextIndex = stopIndex + 1;
        if (nextIndex < animals.length) {
          driveToStop(nextIndex, targetAnimal.coordinates.lat, targetAnimal.coordinates.lon);
        } else {
          finishAutoTour();
        }
      }, 1800);
    });
  };

  // 4. Phát âm thanh kèm callback khi hoàn tất bài đọc (Hỗ trợ cả Narration Microservice :5292 & Web Speech)
  const speakWithCallback = async (text, lang = tourLang, onEnd) => {
    let called = false;
    const done = () => {
      if (!called) {
        called = true;
        setIsSpeaking(false);
        if (onEnd) onEnd();
      }
    };

    // Ưu tiên gọi Narration Microservice (.NET :5292) nếu online
    if (apiInfo.narrationStatus === 'connected') {
      try {
        const resp = await fetch('http://localhost:5292/api/narration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: lang })
        });
        if (resp.ok) {
          const blob = await resp.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            done();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            speakBrowserTts(text, lang, done);
          };
          audio.play().catch(() => speakBrowserTts(text, lang, done));
          return;
        }
      } catch (e) {
        // Fallback sang Web Speech
      }
    }

    speakBrowserTts(text, lang, done);
  };

  const speakBrowserTts = (text, lang, done) => {
    if (!('speechSynthesis' in window)) {
      if (done) setTimeout(done, 3500);
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
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
  };

  // 5. Tạm dừng tour
  const pauseTour = () => {
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (tourSpeechTimerRef.current) clearTimeout(tourSpeechTimerRef.current);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    setTourState(prev => ({ ...prev, isPaused: true }));
    showToast("Đã tạm dừng tour.", "info");
  };

  // 6. Tiếp tục tour
  const resumeTour = () => {
    setTourState(prev => ({ ...prev, isPaused: false }));
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else if (tourState.phase === 'driving') {
      driveToStop(tourState.currentStopIndex, userLocation.lat, userLocation.lon);
    } else if (tourState.phase === 'narrating') {
      const cur = animals[tourState.currentStopIndex];
      arriveAndNarrateStop(tourState.currentStopIndex, cur);
    }
    showToast("Tiếp tục hành trình tour.", "info");
  };

  // 7. Bỏ qua điểm hiện tại sang điểm kế tiếp
  const skipToNextTourStop = () => {
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (tourSpeechTimerRef.current) clearTimeout(tourSpeechTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const nextIndex = tourState.currentStopIndex + 1;
    if (nextIndex < animals.length) {
      driveToStop(nextIndex, userLocation.lat, userLocation.lon);
    } else {
      finishAutoTour();
    }
  };

  // 8. Dừng tour hoàn toàn
  const stopTour = () => {
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (tourSpeechTimerRef.current) clearTimeout(tourSpeechTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setTourState({
      isActive: false,
      isPaused: false,
      currentStopIndex: 0,
      phase: 'idle'
    });
    setNavigationTarget(null);
    showToast("Đã dừng tour tham quan.", "info");
  };

  // 9. Hoàn thành toàn bộ tour
  const finishAutoTour = () => {
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (tourSpeechTimerRef.current) clearTimeout(tourSpeechTimerRef.current);
    setTourState({
      isActive: false,
      isPaused: false,
      currentStopIndex: animals.length - 1,
      phase: 'completed'
    });
    setNavigationTarget(null);
    showToast("Chúc mừng! Đã hoàn thành toàn bộ chuyến tham quan vườn thú!", "success");
    handleSpeech("Chúc mừng quý khách đã hoàn thành toàn bộ hành trình tham quan và thuyết minh tự động tại vườn thú! Chúc quý khách một ngày thật nhiều niềm vui!", tourLang);
  };

  // Mô phỏng bước đi dọc theo lộ trình
  const simulateWalk = () => {
    if (!navigationTarget) return;
    if (isWalking) {
      if (walkingTimerRef.current) {
        clearInterval(walkingTimerRef.current);
        walkingTimerRef.current = null;
      }
      setIsWalking(false);
      showToast("Đã tạm dừng mô phỏng bước đi.", "info");
      return;
    }

    setIsWalking(true);
    const startX = parseFloat(userLocation.mapLeft);
    const startY = parseFloat(userLocation.mapTop);
    const targetX = parseFloat(navigationTarget.mapLeft);
    const targetY = parseFloat(navigationTarget.mapTop);
    const startLat = userLocation.lat;
    const startLon = userLocation.lon;
    const targetLat = navigationTarget.coordinates.lat;
    const targetLon = navigationTarget.coordinates.lon;

    let step = 0;
    const totalSteps = 40;

    walkingTimerRef.current = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      if (progress >= 1) {
        clearInterval(walkingTimerRef.current);
        walkingTimerRef.current = null;
        setIsWalking(false);
        setUserLocation(prev => ({
          ...prev,
          mapLeft: `${targetX}%`,
          mapTop: `${targetY}%`,
          lat: targetLat,
          lon: targetLon,
          label: `Tại chuồng ${navigationTarget.name}`
        }));
        showToast(`ĐÃ ĐẾN NƠI: Bạn đã bước vào bán kính chuồng ${navigationTarget.name}! Tự động phát thuyết minh.`, "success");
        handleSpeech(`Chào mừng bạn đã đến khu vực chuồng ${navigationTarget.name}. ${navigationTarget.descriptionVi}`, tourLang);
      } else {
        const curX = startX + (targetX - startX) * progress;
        const curY = startY + (targetY - startY) * progress;
        const curLat = startLat + (targetLat - startLat) * progress;
        const curLon = startLon + (targetLon - startLon) * progress;
        setUserLocation(prev => ({
          ...prev,
          mapLeft: `${curX.toFixed(2)}%`,
          mapTop: `${curY.toFixed(2)}%`,
          lat: curLat,
          lon: curLon
        }));
      }
    }, 70);
  };

  const currentNavDistance = navigationTarget ? calculateDistance(
    userLocation.lat,
    userLocation.lon,
    navigationTarget.coordinates.lat,
    navigationTarget.coordinates.lon
  ) : 0;
  const currentWalkMinutes = Math.max(1, Math.round(currentNavDistance / 65));

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
      text = `Chào mừng quý khách đến với khu vực chuồng ${name} tại vườn thú. Đây là một trong những loài động vật quý hiếm được bảo tồn đặc biệt trong khuôn viên vườn thú hơn 150 năm tuổi.`;
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

    if (!isPointInsideZoo(latNum, lonNum)) {
      showToast("CẢNH BÁO: Tọa độ động vật phải nằm trọn vẹn trong ranh giới Vườn Thú!", "error");
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

    // Đồng bộ sang Backend API nếu đang online
    if (apiInfo.isConnected) {
      try {
        fetch('http://localhost:8000/api/poi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newAnimal.name,
            category: 'mammal',
            address: `Chuồng ${newAnimal.name}, Vườn Thú`,
            coordinates: [lonNum, latNum],
            radius_meters: newAnimal.radius_meters,
            description_vi: newAnimal.descriptionVi,
            image_url: newAnimal.imageUrl
          })
        }).catch(() => {});
      } catch (e) {}
    }

    showToast(`Đã lưu thành công loài "${newAnimal.name}" vào cơ sở dữ liệu & Bản đồ!`, "success");
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
      <style>{`
        @keyframes routeDash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -32; }
        }
        .animated-route-dash {
          animation: routeDash 1.2s linear infinite;
        }
        @keyframes pulsePing {
          0% { transform: scale(0.95); opacity: 0.9; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .user-pulse-ring {
          animation: pulsePing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes spinPulse {
          to { transform: rotate(360deg); }
        }
        .spin-loader {
          animation: spinPulse 1s linear infinite;
        }
        @keyframes tour-ping {
          0% { transform: scale(0.95); opacity: 0.9; }
          70% { transform: scale(2.0); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .tour-pulse-ring {
          animation: tour-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes personWalkBob {
          0% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
          100% { transform: translateY(0) rotate(-3deg); }
        }
        .person-walking {
          animation: personWalkBob 0.45s ease-in-out infinite alternate;
        }
        @keyframes footPulseEffect {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .foot-pulse {
          animation: footPulseEffect 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .custom-animal-marker, .custom-user-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit !important;
        }
      `}</style>
      
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px' }}>
            HỆ THỐNG THUYẾT MINH SỞ THÚ TỰ ĐỘNG
          </h1>
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

          {/* Backend API Connection Status Chip */}
          <div style={{
            backgroundColor: apiInfo.isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.22)',
            border: apiInfo.isConnected ? '1px solid #34d399' : '1px solid #f87171',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: apiInfo.isConnected ? '0 0 10px rgba(52, 211, 153, 0.35)' : 'none'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: apiInfo.isConnected ? '#34d399' : '#f87171',
              display: 'inline-block',
              animation: apiInfo.isConnected ? 'tour-ping 1.5s infinite' : 'none'
            }}></span>
            <span>
              API Backend: <strong>{apiInfo.isConnected ? `${apiInfo.activeBackend} Đã Kết Nối` : 'Đang Kiểm Tra...'}</strong>
            </span>
          </div>

          <span style={{ backgroundColor: '#047857', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            TTS Tiếng Việt: Sẵn sàng
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
          { key: 'map', label: navigationTarget ? `Dẫn Đường: ${navigationTarget.name}` : 'Bản Đồ & Dẫn Đường GPS' },
          { key: 'create', label: 'Thêm Động Vật / Tọa Độ / Thuyết Minh' },
          { key: 'list', label: `Quản Lý Danh Sách (${animals.length} Chuồng)` },
          { key: 'mobile', label: 'App Du Khách Mobile (Giả Lập)' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 20px',
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
                  Thêm Chuồng Động Vật, Tọa Độ GPS & Bài Thuyết Minh Tiếng Việt
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#a7f3d0' }}>
                  Biểu mẫu nhập liệu hoàn chỉnh theo chuẩn đồ án: Thiết lập loài, ghim tọa độ GPS vườn thú, bán kính Geofence và lời dẫn du lịch.
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
                  Mẫu Voi Châu Á
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
                  Mẫu Hổ Đông Dương
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
                  Mẫu Hươu Cao Cổ
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
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Tọa Độ GPS & Bán Kính Geofence Kích Hoạt Tự Động (Bản Đồ vườn thú)</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Nhấp vào chuồng thú hoặc điểm bất kỳ trên bản đồ để ghim GPS & thuyết minh tức thì đa ngôn ngữ.</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>vườn thú: [10.7876, 106.7052]</span>
                    </div>

                    {/* Multilingual Selector Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '10px', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 'bold' }}>Ngôn ngữ thuyết minh:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { id: 'vi', label: 'Tiếng Việt' },
                          { id: 'en', label: 'English' },
                          { id: 'fr', label: 'Français' },
                          { id: 'zh', label: '中文' },
                          { id: 'ja', label: '日本語' }
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

                    {/* Bản Đồ Định Vị GPS Thực Tế Để Chọn Tọa Độ */}
                    <RealPickerMap formData={formData} setFormData={setFormData} animals={animals} />

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
                          Bán Kính Geofence:
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
                        <span>25m (Chuẩn vườn thú)</span>
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
                        Du Lịch Phổ Thông
                      </button>
                      <button type="button" onClick={() => setNarrationStyle('kids')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Trẻ Em Vui Nhộn
                      </button>
                      <button type="button" onClick={() => setNarrationStyle('science')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Khoa Học & Bảo Tồn
                      </button>
                    </div>

                    <textarea
                      required
                      rows="5"
                      placeholder="Nhập nội dung bài thuyết minh chuẩn văn phong du lịch sinh thái vườn thú..."
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
                        {isSpeaking ? 'Dừng Đọc' : 'Nghe Thử Giọng Đọc Tiếng Việt'}
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
                      Lưu Động Vật & Bài Thuyết Minh Mới
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
                    Bản Xem Trước Thẻ Du Khách (Live Preview)
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
                      {formData.zone}
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
                      <span>Kinh độ: {formData.lon}</span>
                      <span>|</span>
                      <span>Vĩ độ: {formData.lat}</span>
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
                      {isSpeaking ? 'Dừng Giọng Đọc' : 'Nghe Thuyết Minh Vườn Thú'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BẢN ĐỒ THỰC TẾ & DẪN ĐƯỜNG TOUR GPS */}
        {activeTab === 'map' && (
          <RealZooMap
            animals={animals}
            selectedAnimal={selectedAnimal}
            onSelectAnimal={setSelectedAnimal}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            navigationTarget={navigationTarget}
            tourState={tourState}
            onStartTour={startAutoTour}
            onPauseTour={pauseTour}
            onResumeTour={resumeTour}
            onSkipTourStop={skipToNextTourStop}
            onStopTour={stopTour}
            onStartNavigation={startNavigation}
            onCancelNavigation={cancelNavigation}
            onWalkToAnimal={walkToAnimal}
            selectedGate={selectedGate}
            onSelectGate={placeTouristAtGate}
            onWalkFromGateToAnimal={walkFromGateToAnimal}
            onStartTourFromGate={startTourFromGate}
            showToast={showToast}
            tourLang={tourLang}
            setTourLang={setTourLang}
            handleSpeech={handleSpeech}
            isSpeaking={isSpeaking}
            calculateDistance={calculateDistance}
            onGetLiveGPS={handleGetLiveGPS}
            isLocating={isLocating}
          />
        )}

        {/* TAB 3: DANH SÁCH QUẢN LÝ */}
        {activeTab === 'list' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  Danh Sách Động Vật & Bài Thuyết Minh ({filteredAnimals.length} Chuồng)
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
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#059669' }}>{an.audioLength}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => { setSelectedAnimal(an); handleSpeech(an.descriptionVi); }}
                          style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Nghe
                        </button>
                        <button
                          onClick={() => startNavigation(an)}
                          style={{ backgroundColor: '#eff6ff', border: '1px solid #3b82f6', color: '#1d4ed8', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Dẫn Đường
                        </button>
                      </div>
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
                Mô Phỏng GPS Du Khách
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
                        {isCur ? `Đã vào vùng (12m ≤ ${an.radius_meters}m)` : `Cách 60m`}
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
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold' }}>VƯỜN THÚ AUDIO TOUR</span>
                </div>
                <img src={selectedAnimal.imageUrl} alt={selectedAnimal.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '16px', marginBottom: '12px' }} />
                <h3 style={{ color: '#ffffff', margin: '4px 0 2px', fontSize: '18px', fontWeight: 'bold' }}>{selectedAnimal.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 10px', fontStyle: 'italic' }}>{selectedAnimal.scientificName}</p>

                <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', padding: '10px 12px', borderRadius: '10px' }}>
                  <p style={{ color: '#34d399', fontSize: '11px', fontWeight: 'bold', margin: '0 0 4px' }}>GPS GEOFENCE TỰ ĐỘNG PHÁT HIỆN (12m)</p>
                  <p style={{ color: '#e2e8f0', fontSize: '11px', margin: 0, lineHeight: '1.5', maxHeight: '110px', overflowY: 'auto' }}>
                    {selectedAnimal.descriptionVi}
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>
                    {isSpeaking ? 'Đang thuyết minh...' : 'Tạm dừng'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>Tiếng Việt</span>
                </div>
                <button
                  onClick={() => handleSpeech(selectedAnimal.descriptionVi)}
                  style={{ width: '100%', backgroundColor: isSpeaking ? '#ef4444' : '#10b981', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {isSpeaking ? 'Dừng Thuyết Minh' : 'Tiếp Tục Nghe'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
