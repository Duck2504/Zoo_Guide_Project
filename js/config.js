/**
 * Global Configuration & Constants - Saigon Zoo Audio Guide System
 */

export const CONFIG = {
  API_BASE_URL: window.API_BASE_URL || 'http://localhost:5222',
  NARRATION_SERVICE_URL: window.NARRATION_SERVICE_URL || 'http://localhost:5292',
  STORAGE_KEYS: {
    ANIMALS: 'ZOO_ANIMALS_DATA_V2',
    SESSION_ID: 'ZOO_VISITOR_SESSION_ID',
    LANGUAGE: 'ZOO_VISITOR_LANG',
    COOLDOWN: 'ZOO_GEOFENCE_COOLDOWN',
    AUTH_TOKEN: 'ZOO_ADMIN_TOKEN',
  },
  MAP: {
    CENTER: [10.7876, 106.7056],
    ZOOM: 17,
    MAX_ZOOM: 20,
    MIN_ZOOM: 15,
  },
  GEOFENCE: {
    DEFAULT_RADIUS_METERS: 25,
    COOLDOWN_MS: 3 * 60 * 1000, // 3 minutes cooldown before re-triggering same zone
    WATCH_TIMEOUT_MS: 10000,
  },
  GATES: [
    {
      id: 'gate-1',
      coords: [10.7876, 106.7042],
      name: {
        vi: 'Cổng 1 (Nguyễn Bỉnh Khiêm)',
        en: 'Gate 1 (Nguyen Binh Khiem)',
        ko: '1번 출입구 (응우옌 빈 키엠)',
        ja: '第1ゲート (グエン・ビン・キエム)',
        zh: '1号大门 (阮秉谦路)'
      },
      desc: {
        vi: 'Cổng đón khách chính Thảo Cầm Viên Sài Gòn',
        en: 'Main Entrance Gate to Saigon Zoo',
        ko: '사이공 동물원 정문 출입구',
        ja: 'サイゴン動植物園メインエントランス',
        zh: '西贡动植物园主入口大门'
      }
    },
    {
      id: 'gate-2',
      coords: [10.7887, 106.7058],
      name: {
        vi: 'Cổng 2 (Nguyễn Thị Minh Khai)',
        en: 'Gate 2 (Nguyen Thi Minh Khai)',
        ko: '2번 출입구 (응우옌 티 민 카이)',
        ja: '第2ゲート (グエン・ティ・ミン・カイ)',
        zh: '2号大门 (阮氏明开路)'
      },
      desc: {
        vi: 'Cổng phụ Thảo Cầm Viên (đối diện Thư viện)',
        en: 'Secondary Gate (opposite Library)',
        ko: '사이공 동물원 보조 출입구',
        ja: 'サイゴン動植物園サブエントランス',
        zh: '西贡动植物园次入口大门'
      }
    }
  ],
  LANGUAGES: [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', ttsVoice: 'vi-VN-HoaiMyNeural' },
    { code: 'en', name: 'English', flag: '🇬🇧', ttsVoice: 'en-US-AriaNeural' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', ttsVoice: 'ko-KR-SunHiNeural' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', ttsVoice: 'ja-JP-NanamiNeural' },
    { code: 'zh', name: '中文', flag: '🇨🇳', ttsVoice: 'zh-CN-XiaoxiaoNeural' }
  ]
};

export const UI_TRANSLATIONS = {
  vi: {
    navMap: "Bản đồ sở thú",
    navMobile: "Mô phỏng di động",
    navAdmin: "Quản Trị Hệ Thống",
    searchPlaceholder: "Tìm chuồng thú trên bản đồ...",
    pillGate1: "🚪 Cổng 1 (Nguyễn Bỉnh Khiêm)",
    pillGate2: "🚪 Cổng 2 (Nguyễn Thị Minh Khai)",
    gate1Name: "Cổng 1 (Nguyễn Bỉnh Khiêm)",
    gate2Name: "Cổng 2 (Nguyễn Thị Minh Khai)",
    gateDesc: "Cổng đón khách Thảo Cầm Viên",
    satelliteBadge: "Google Maps Vệ Tinh",
    mapDigital: "Bản đồ số",
    mapSatellite: "Vệ tinh",
    autoDetect: "Tự động nhận diện",
    audioGuideHeading: "Bài Thuyết Minh",
    btnListen: "Nghe Thuyết Minh",
    btnStop: "Dừng",
    btnViewOnMap: "Xem Trên Bản Đồ",
    geofenceRadiusLabel: "Bán kính Geofence",
    gridHeading: "Danh Sách Động Vật",
    gridSubheading: "Đồng bộ trực tiếp từ Core API & Geofencing GPS.",
    gridBadge: "Live Database",
    noAnimalData: "Đang tải dữ liệu động vật...",
    langCardTag: "🇻🇳 VIỆT NAM",
    speed: "Tốc độ",
    scanQrBtn: "Quét mã QR",
    privacyNote: "🔒 Toạ độ GPS của bạn được tính cục bộ trên máy và không lưu trên máy chủ."
  },
  en: {
    navMap: "Zoo Map",
    navMobile: "Mobile Experience",
    navAdmin: "Admin Portal",
    searchPlaceholder: "Search exhibits on map...",
    pillGate1: "🚪 Gate 1 (Nguyen Binh Khiem)",
    pillGate2: "🚪 Gate 2 (Nguyen Thi Minh Khai)",
    gate1Name: "Gate 1 (Nguyen Binh Khiem)",
    gate2Name: "Gate 2 (Nguyen Thi Minh Khai)",
    gateDesc: "Saigon Zoo Entrance Gate",
    satelliteBadge: "Google Maps Satellite",
    mapDigital: "Digital Map",
    mapSatellite: "Satellite",
    autoDetect: "Auto Detect",
    audioGuideHeading: "Audio Guide",
    btnListen: "Listen Narration",
    btnStop: "Stop",
    btnViewOnMap: "View on Map",
    geofenceRadiusLabel: "Geofence Radius",
    gridHeading: "Animal Exhibits",
    gridSubheading: "Synchronized directly with Core API & GPS Geofencing.",
    gridBadge: "Live Database",
    noAnimalData: "Loading exhibits...",
    langCardTag: "🇬🇧 ENGLISH",
    speed: "Speed",
    scanQrBtn: "Scan QR",
    privacyNote: "🔒 Your GPS location is computed locally on your device and never uploaded to servers."
  },
  ko: {
    navMap: "동물원 지도",
    navMobile: "모바일 체험",
    navAdmin: "관리자 포털",
    searchPlaceholder: "동물 우리 검색...",
    pillGate1: "🚪 1번 출입구",
    pillGate2: "🚪 2번 출입구",
    gate1Name: "1번 출입구 (응우옌 빈 키엠)",
    gate2Name: "2번 출입구 (응우옌 티 민 카이)",
    gateDesc: "사이공 동물원 정문",
    satelliteBadge: "위성 지도",
    mapDigital: "디지털 지도",
    mapSatellite: "위성",
    autoDetect: "자동 감지",
    audioGuideHeading: "오디오 가이드",
    btnListen: "해설 듣기",
    btnStop: "정지",
    btnViewOnMap: "지도에서 보기",
    geofenceRadiusLabel: "지오펜스 반경",
    gridHeading: "동물 목록",
    gridSubheading: "백엔드 API 및 GPS 지오펜싱 실시간 동기화.",
    gridBadge: "라이브 DB",
    noAnimalData: "데이터를 불러오는 중...",
    langCardTag: "🇰🇷 한국어",
    speed: "속도",
    scanQrBtn: "QR 스캔",
    privacyNote: "🔒 사용자의 GPS 위치는 기기에서 로컬로만 계산되며 서버에 전송되지 않습니다."
  },
  ja: {
    navMap: "動物園マップ",
    navMobile: "モバイル体験",
    navAdmin: "管理者ログイン",
    searchPlaceholder: "展示エリアを検索...",
    pillGate1: "🚪 第1ゲート",
    pillGate2: "🚪 第2ゲート",
    gate1Name: "第1ゲート (グエン・ビン・キエム)",
    gate2Name: "第2ゲート (グエン・ティ・ミン・カイ)",
    gateDesc: "サイゴン動植物園エントランス",
    satelliteBadge: "Googleマップ衛星",
    mapDigital: "デジタルマップ",
    mapSatellite: "衛星写真",
    autoDetect: "自動認識",
    audioGuideHeading: "音声ガイド",
    btnListen: "解説を聴く",
    btnStop: "停止",
    btnViewOnMap: "マップで見る",
    geofenceRadiusLabel: "ジオフェンス半径",
    gridHeading: "動物展示リスト",
    gridSubheading: "バックエンドAPIおよびGPSジオフェンシングと同期中。",
    gridBadge: "DB接続中",
    noAnimalData: "バックエンドから読み込み中...",
    langCardTag: "🇯🇵 日本語",
    speed: "再生速度",
    scanQrBtn: "QRコードをスキャン",
    privacyNote: "🔒 GPS位置情報は端末内でのみ計算され、サーバーには送信されません。"
  },
  zh: {
    navMap: "动物园地图",
    navMobile: "移动导览",
    navAdmin: "管理后台",
    searchPlaceholder: "在地图上搜索动物展区...",
    pillGate1: "🚪 1号大门",
    pillGate2: "🚪 2号大门",
    gate1Name: "1号门 (阮秉谦路)",
    gate2Name: "2号门 (阮氏明开路)",
    gateDesc: "西贡动植物园入园大门",
    satelliteBadge: "谷歌卫星地图",
    mapDigital: "电子地图",
    mapSatellite: "卫星图",
    autoDetect: "自动感应",
    audioGuideHeading: "语音讲解",
    btnListen: "收听语音讲解",
    btnStop: "停止",
    btnViewOnMap: "在地图上查看",
    geofenceRadiusLabel: "地理围栏半径",
    gridHeading: "动物展区列表",
    gridSubheading: "直接从后端数据库 API 与 GPS 地理围栏实时同步。",
    gridBadge: "数据库已连接",
    noAnimalData: "正在从后端加载数据...",
    langCardTag: "🇨🇳 中文",
    speed: "倍速",
    scanQrBtn: "扫码导览",
    privacyNote: "🔒 您的 GPS 位置仅在手机本地计算，绝不上传至任何服务器。"
  }
};

export const FALLBACK_ANIMALS = [
  {
    id: 1,
    name: "Voi Châu Á",
    scientificName: "Elephas maximus",
    zone: "Khu Voi & Thú Lớn (Zone A)",
    zoneId: 1,
    coords: [10.7878, 106.7052],
    radius: 25,
    icon: "🐘",
    color: "#059669",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600",
    narrative: "Chào mừng quý khách đến với khu vực chuồng Voi Châu Á tại Thảo Cầm Viên Sài Gòn. Voi Châu Á là loài thú trên cạn lớn nhất châu lục, sở hữu chiếc vòi khéo léo với hơn 40.000 bó cơ.",
    multilingual: {
      en: "Welcome to the Asian Elephant exhibit at Saigon Zoo. The Asian Elephant is the largest land mammal in Asia, possessing an agile trunk with over 40,000 muscles.",
      ko: "사이공 동물원의 아시아코끼리 서식지에 오신 것을 환영합니다. 아시아코끼리는 아시아 대륙에서 가장 큰 육상 동물로 4만 개 이상의 근육으로 이루어진 정교한 코를 가지고 있습니다.",
      ja: "サイゴン動植物園のアジアゾウ展示エリアへようこそ。アジアゾウはアジア大陸最大の陸生動物であり、4万以上の筋肉からなる器用な鼻を持っています。",
      zh: "欢迎来到西贡动植物园的亚洲象展区。亚洲象是亚洲大陆上现存最大的陆生动物，长鼻拥有超过4万条肌肉组织，极为灵巧敏捷。"
    }
  },
  {
    id: 2,
    name: "Hổ Đông Dương",
    scientificName: "Panthera tigris corbetti",
    zone: "Khu Thú Ăn Thịt (Zone B)",
    zoneId: 2,
    coords: [10.7882, 106.7061],
    radius: 20,
    icon: "🐅",
    color: "#ea580c",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600",
    narrative: "Quý khách đang đứng trước khu nuôi dưỡng Hổ Đông Dương - chúa tể của núi rừng Đông Nam Á. Với bộ lông vàng cam rực rỡ và những vằn đen độc bản, hổ sở hữu sức mạnh và khả năng bơi lội đáng nể.",
    multilingual: {
      en: "You are standing in front of the Indochinese Tiger exhibit - the lord of Southeast Asian jungle. Boasting brilliant orange fur and unique black stripes, tigers possess extraordinary muscular power.",
      ko: "동남아시아 열대우림의 제왕인 인도차이나호랑이 서식지입니다. 선명한 주황색 털과 고유한 검은 줄무늬를 자랑하며 뛰어난 수영 능력을 갖추고 있습니다.",
      ja: "東南アジアの密林の王者、インドシナトラの飼育エリアです。鮮やかなオレンジ色と独特の黒い縞模様を持ち、力強い体躯と優れた泳ぎの能力を誇ります。",
      zh: "您现在看到的是东南亚丛林霸主——印支虎展区。金黄色的皮毛配以独一无二的黑色条纹，印支虎拥有极其敏捷的身姿和出色的游泳本领。"
    }
  },
  {
    id: 3,
    name: "Hươu Cao Cổ",
    scientificName: "Giraffa camelopardalis",
    zone: "Khu Thú Móng Guốc (Zone C)",
    zoneId: 3,
    coords: [10.7869, 106.7048],
    radius: 25,
    icon: "🦒",
    color: "#ca8a04",
    image: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=600",
    narrative: "Hươu cao cổ là sinh vật cao nhất thế giới với chiều cao có thể đạt tới 5,8 mét. Chiếc cổ dài đặc trưng cùng chiếc lưỡi màu tím dài 45 cm giúp chúng dễ dàng hái lá keo trên ngọn cây cao.",
    multilingual: {
      en: "The giraffe is the tallest living terrestrial animal, reaching heights up to 5.8 meters. Their long neck and 45-cm prehensile tongue help them forage the sweetest acacia leaves.",
      ko: "기린은 최대 5.8m까지 자랄 수 있는 세계에서 가장 키가 큰 동물입니다. 긴 목과 45cm에 달하는 혀로 높은 나뭇가지의 잎을 손쉽게 뜯어먹습니다.",
      ja: "キリンは体高が最大5.8メートルにも達する世界で最も背の高い動物です。特徴的な長い首と45cmもの長い舌を使って高い木の梢の葉を器用に食べます。",
      zh: "长颈鹿是世界上现存最高的陆生动物，身高可达5.8米。标志性的长颈和长达45厘米的青紫色舌头，让它们能轻松卷食高处的树叶。"
    }
  },
  {
    id: 4,
    name: "Hồng Hạc Mỹ",
    scientificName: "Phoenicopterus ruber",
    zone: "Khu Vực Hồ Nước & Chim (Zone D)",
    zoneId: 4,
    coords: [10.7872, 106.7065],
    radius: 20,
    icon: "🦩",
    color: "#ec4899",
    image: "https://images.unsplash.com/photo-1539667547529-84c607280d20?w=600",
    narrative: "Đàn Hồng Hạc kiêu sa với bộ lông màu hồng phấn tuyệt đẹp là một trong những điểm chụp ảnh yêu thích nhất tại Thảo Cầm Viên. Sắc hồng đặc biệt này đến từ sắc tố carotenoid trong thức ăn của chúng.",
    multilingual: {
      en: "The American Flamingo flock with breathtaking pink plumage is one of the most beloved photography highlights at Saigon Zoo. The vivid color comes from carotenoids in their diet.",
      ko: "화려한 분홍빛 깃털을 뽐내는 플라밍고 무리는 사이공 동물원에서 가장 인기 있는 포토존 중 하나입니다. 이 아름다운 분홍빛은 먹이 속에 함유된 카로티노이드 색소에서 비롯됩니다.",
      ja: "鮮やかなピンク色の羽を持つフラミンゴの群れは、サイゴン動植物園でも屈指の人気撮影スポットです。この鮮やかな色は餌に含まれるカロテノイド色素に由来します。",
      zh: "羽色粉红华丽美艳的美洲红鹳（火烈鸟）群，是西贡动植物园极具人气的拍照打卡点。它们身上鲜艳的粉红色源于食物中摄入的类胡萝卜素色素。"
    }
  }
];

export const FALLBACK_ZONES = [
  { id: 1, zoneCode: "Khu Voi & Thú Lớn (Zone A)", latitude: 10.7878, longitude: 106.7052, radius: 25, description: "Khu vực trưng bày các loài thú lớn như voi và hà mã" },
  { id: 2, zoneCode: "Khu Thú Ăn Thịt (Zone B)", latitude: 10.7882, longitude: 106.7061, radius: 20, description: "Khu chuồng cọp Đông Dương, sư tử và báo hoa mai" },
  { id: 3, zoneCode: "Khu Thú Móng Guốc (Zone C)", latitude: 10.7869, longitude: 106.7048, radius: 25, description: "Khu vực hươu cao cổ, ngựa vằn và linh dương" },
  { id: 4, zoneCode: "Khu Vực Hồ Nước & Chim (Zone D)", latitude: 10.7872, longitude: 106.7065, radius: 20, description: "Khu hồ chim, hồng hạc và bò sát nhiệt đới" }
];
