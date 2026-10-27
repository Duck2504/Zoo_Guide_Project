// Dọn sạch hoàn toàn mọi dữ liệu con vật demo ban đầu theo yêu cầu người dùng (hệ thống khởi đầu 0 loài thú)
try {
  ['zoo_animals_data', 'ZOO_ANIMALS_DATA', 'ZOO_ANIMALS_DATA_V2', 'ZOO_ANIMALS_DATA_V3', 'ZOO_ANIMALS_DATA_CLEAN'].forEach(k => {
    localStorage.removeItem(k);
  });
} catch (_) {}


// Tọa độ đa giác ranh giới Thảo Cầm Viên Sài Gòn
const ZOO_BOUNDARY_POLYGON = [
  [10.788729, 106.703594],
  [10.789236, 106.703869],
  [10.789658, 106.704169],
  [10.790021, 106.704563],
  [10.790351, 106.704958],
  [10.790722, 106.705361],
  [10.790908, 106.705653],
  [10.79079, 106.70591],
  [10.790604, 106.706433],
  [10.790342, 106.70687],
  [10.790038, 106.70711],
  [10.789743, 106.707299],
  [10.789363, 106.707556],
  [10.78894, 106.707814],
  [10.78856, 106.708071],
  [10.788138, 106.708328],
  [10.787783, 106.708628],
  [10.787505, 106.708885],
  [10.787344, 106.709074],
  [10.786998, 106.708885],
  [10.786702, 106.708628],
  [10.786238, 106.708397],
  [10.785773, 106.708071],
  [10.785216, 106.707668],
  [10.785478, 106.707342],
  [10.7859, 106.706827],
  [10.786322, 106.706356],
  [10.78666, 106.705944],
  [10.787082, 106.705481],
  [10.78742, 106.705112],
  [10.787843, 106.704598],
  [10.78818, 106.704126],
  [10.788518, 106.703783]
];

// Các điểm mốc văn hóa - lịch sử
const ZOO_LANDMARKS = [
  { id: 'temple', name: 'Đền Thờ Vua Hùng', desc: 'Công trình kiến trúc lịch sử được xây dựng năm 1926.', lat: 10.7872, lng: 106.7046 },
  { id: 'museum', name: 'Bảo Tàng Lịch Sử TP.HCM', desc: 'Bảo tàng lưu giữ hàng chục ngàn hiện vật lịch sử quý giá.', lat: 10.7882, lng: 106.7042 }
];

/**
 * data.js - Thảo Cầm Viên Sài Gòn
 * Core database, multilingual tour narratives (5 languages), zones, gates, and UI i18n
 */

const ZOO_GATES = [
  {
    key: "gate1",
    name: "Cổng 1 (Nguyễn Bỉnh Khiêm)",
    lat: 10.7878,
    lng: 106.7040,
    desc: "Cổng chính Thảo Cầm Viên Sài Gòn — Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1 (Đầu đường Lê Duẩn)"
  },
  {
    key: "gate2",
    name: "Cổng 2 (Nguyễn Thị Minh Khai)",
    lat: 10.7895,
    lng: 106.7058,
    desc: "Cổng phụ đường Nguyễn Thị Minh Khai — Gần chân Cầu Thị Nghè & Vườn Chim"
  }
];

const ZOO_ZONES = [
  { id: "zone-1", name: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc", color: "#059669", center: [10.7873, 106.7055] },
  { id: "zone-2", name: "Khu Thú Dữ Ăn Thịt & Rừng Nhiệt Đới", color: "#ea580c", center: [10.7885, 106.7048] },
  { id: "zone-3", name: "Khu Thảo Nguyên Châu Phi", color: "#d97706", center: [10.7865, 106.7062] },
  { id: "zone-4", name: "Khu Linh Trưởng & Đảo Khỉ", color: "#4f46e5", center: [10.7878, 106.7065] },
  { id: "zone-5", name: "Khu Vườn Chim & Đầm Lầy Thủy Cầm", color: "#0284c7", center: [10.7889, 106.7058] },
  { id: "zone-6", name: "Khu Bò Sát & Đầm Cá Sấu", color: "#16a34a", center: [10.7865, 106.7072] },
  { id: "zone-7", name: "Khu Động Vật Quý Hiếm Châu Á", color: "#7c3aed", center: [10.7868, 106.7060] },
  { id: "zone-8", name: "Khu Thú Lớn & Rừng Khô Hạn", color: "#dc2626", center: [10.7880, 106.7046] }
];

// Mẫu dữ liệu tham khảo (lưu trữ sẵn sàng)
const SAMPLE_ZOO_ANIMALS = [];

// Mặc định ban đầu chưa có dữ liệu con vật (0 loài thú theo yêu cầu)
const DEFAULT_ZOO_ANIMALS = [];

const MULTILINGUAL_TOUR_DATA = {
  "zoo-1": {
    names: { vi: "Voi Châu Á", en: "Asian Elephant", ko: "아시아코끼리", zh: "亚洲象", ja: "アジアゾウ" },
    vi: "Chào mừng quý khách đến với khu vực chuồng Voi Châu Á tại Thảo Cầm Viên Sài Gòn. Voi Châu Á là loài thú trên cạn lớn nhất châu lục, sở hữu chiếc vòi khéo léo với hơn 40.000 bó cơ. Tại đây, đàn voi được chăm sóc chu đáo với chế độ ăn giàu chất xơ gồm cỏ tươi, mía, chuối và bí đỏ. Hãy cùng bảo vệ loài động vật quý hiếm này khỏi nguy cơ tuyệt chủng.",
    en: "Welcome to the Asian Elephant exhibit at Saigon Zoo and Botanical Gardens. The Asian Elephant is the largest land mammal in Asia, possessing an agile trunk with over 40,000 muscles. Here, our elephants enjoy a fiber-rich diet of fresh grass, sugarcane, bananas, and pumpkin. Let us join hands to protect this endangered species.",
    ko: "사이공 동식물원의 아시아코끼리 전시관에 오신 것을 환영합니다. 아시아코끼리는 아시아 대륙에서 가장 큰 육상 동물로, 4만 개 이상의 근육으로 이루어진 놀라운 코를 자랑합니다. 신선한 풀과 사탕수수, 바나나로 잘 보살핌을 받고 있으며, 멸종 위기에 처한 이 귀중한 동물 보호에 함께해 주시기 바랍니다.",
    zh: "欢迎来到西贡动植物园的亚洲象展区。亚洲象是亚洲大陆上现存最大的陆生动物，长鼻拥有超过4万条肌肉组织，极为灵巧敏捷。在动物园里，象群得到悉心照料，每日享用富含纤维的鲜草、甘蔗、香蕉与南瓜。让我们携手保护这一珍稀濒危物种。",
    ja: "サイゴン動植物園のアジアゾウ展示エリアへようこそ。アジアゾウはアジア大陸最大の陸生動物であり、4万以上の筋肉からなる器用な鼻を持っています。園内では新鮮な草やサトウキビ、バナナなど栄養満点の食事で大切に飼育されています。絶滅が危惧される貴重なゾウたちを共に守りましょう。"
  },
  "zoo-2": {
    names: { vi: "Hổ Đông Dương", en: "Indochinese Tiger", ko: "인도차이나호랑이", zh: "印支虎", ja: "インドシナトラ" },
    vi: "Quý khách đang đứng trước khu nuôi dưỡng Hổ Đông Dương - chúa tể của núi rừng Đông Nam Á. Với bộ lông vàng cam rực rỡ và những vằn đen độc bản, hổ sở hữu sức mạnh và khả năng bơi lội đáng nể. Hổ Đông Dương hiện được xếp vào nhóm động vật cực kỳ nguy cấp cần được bảo tồn nghiêm ngặt.",
    en: "You are standing in front of the Indochinese Tiger exhibit - the undisputed lord of the Southeast Asian jungle. Boasting brilliant orange fur and unique black stripes, tigers possess extraordinary muscular power and excellent swimming abilities. They are critically endangered and in urgent need of protection.",
    ko: "동남아시아 밀림의 제왕, 인도차이나호랑이 서식지입니다. 선명한 주황색 털과 고유한 검은 줄무늬를 지닌 호랑이는 막강한 힘과 뛰어난 수영 능력을 갖추고 있습니다. 현재 심각한 멸종 위기종으로 엄격한 보존이 필요합니다.",
    zh: "您现在看到的是东南亚丛林霸主——印支虎展区。金黄色的皮毛配以独一无二的黑色条纹，印支虎拥有极其敏捷的身姿和出色的游泳本领。目前该物种处于极度濒危状态，亟需全社会的严格保护。",
    ja: "東南アジアの密林の王者、インドシナトラの展示場へようこそ。鮮やかなオレンジ色と一頭ごとに異なる黒い縞模様をまとい、圧倒的な筋力と優れた泳ぎの能力を誇ります。絶滅寸前の貴重な野生動物です。"
  },
  "zoo-3": {
    names: { vi: "Hươu Cao Cổ & Ngựa Vằn", en: "Giraffe & Zebra", ko: "기린과 얼룩말", zh: "长颈鹿与斑马", ja: "キリンとシマウマ" },
    vi: "Khuôn viên thảo nguyên xanh mát mở ra trước mắt quý khách là ngôi nhà chung của Hươu Cao Cổ và Ngựa Vằn. Chiếc cổ dài đặc trưng giúp hươu vươn tới những ngọn cây keo cao nhất. Trong khi đó, bộ lông sọc vằn của ngựa vằn tạo hiệu ứng thị giác xua đuổi côn trùng và đánh lừa động vật ăn thịt trên đồng cỏ hoang dã.",
    en: "The savannah grassland before you is home to both Giraffes and Zebras. The giraffe's iconic long neck allows it to browse the tenderest leaves high up in acacia trees, while the zebra's dazzling black-and-white stripes deter biting flies and confuse predators in the wild.",
    ko: "푸른 아프리카 초원 구역에는 기린과 얼룩말이 함께 살고 있습니다. 기린의 긴 목은 높은 아카시아 나무 꼭대기의 잎을 먹는 데 완벽하며, 얼룩말의 흑백 줄무늬는 벌레를 쫓고 포식자의 시선을 교란하는 신비로운 역할을 합니다.",
    zh: "展现在您眼前的是非洲草原区，长颈鹿与斑马在此和谐共居。长颈鹿标志性的长颈能轻松采食高耸金合欢树顶的嫩芽；斑马黑白相间的条纹不仅能驱赶吸血昆虫，更可在野外有效迷惑捕食者。",
    ja: "サバンナエリアにはキリンとシマウマが仲良く暮らしています。キリンの長い首は高いアカシアの若葉を食べるのに適しており、シマウマの美しい白黒模様は吸血昆虫を遠ざけ捕食者を惑わす効果があります。"
  },
  "zoo-4": {
    names: { vi: "Vượn Má Vàng & Linh Trưởng", en: "Yellow-cheeked Gibbon", ko: "노랑뺨긴팔원숭이", zh: "黄颊长臂猿", ja: "キッペクシロテテナガザル" },
    vi: "Tiếng hót véo von vang vọng khắp tán cây là âm thanh đặc trưng của loài Vượn Má Vàng - báu vật linh trưởng đặc hữu của rừng mưa Đông Dương. Chúng có cánh tay dài linh hoạt giúp di chuyển thoăn thoắt trên ngọn cây bằng kỹ thuật đu cành điêu luyện.",
    en: "The melodious morning calls echoing through the high canopy belong to the Yellow-cheeked Gibbon - a primate gem endemic to Indochinese rainforests. Their exceptionally long arms allow effortless brachiation high above the jungle floor.",
    ko: "숲속 높이 울려 퍼지는 아름다운 노랫소리의 주인공은 인도차이나 열대우림의 보물인 노랑뺨긴팔원숭이입니다. 유난히 긴 팔을 활용해 나뭇가지 사이를 날아다니듯 건너뛰는 뛰어난 활강 기술을 관찰해 보세요.",
    zh: "在树冠之间回荡的清脆啼鸣，正是黄颊长臂猿的晨间合唱。作为中南半岛热带雨林的特有灵长类珍宝，它们拥有修长有力的双臂，能在林冠间以高超的摆荡技巧自由穿梭。",
    ja: "梢に響き渡る美しい鳴き声は、インドシナ半島固有種であるキッペクシロテテナガザルによるものです。非常に長い腕を巧みに使って枝から枝へと華麗に跳び移る姿をご覧ください。"
  },
  "zoo-5": {
    names: { vi: "Vườn Chim & Hồng Hạc", en: "Flamingo & Aviary", ko: "홍학과 열대조류원", zh: "火烈鸟与热带鸟园", ja: "フラミンゴと熱帯鳥類園" },
    vi: "Đầm lầy rực rỡ sắc hồng là nơi sinh sống của đàn Chim Hồng Hạc cùng hàng chục loài chim quý hiếm như Vẹt Macaw, Cò Sen và Giang Sen. Màu hồng đặc trưng của chim đến từ sắc tố carotenoid có trong các loài giáp xác và tảo nhỏ mà chúng ăn hằng ngày dưới nước.",
    en: "This vibrant pink wetland is home to our American Flamingos alongside exotic tropical birds like Macaws and Painted Storks. The vivid pink coloration comes from natural carotenoid pigments found in the crustaceans and micro-algae of their wetland diet.",
    ko: "분홍빛 물결이 가득한 습지에는 화려한 플라밍고와 마코앵무새 등 다채로운 열대 조류가 모여 있습니다. 홍학의 우아한 분홍색 깃털은 먹이인 갑각류와 미세조류에 풍부한 카로티노이드 색소에서 비롯됩니다.",
    zh: "这片泛着梦幻粉红色的水沼栖息着美洲红鹳群以及金刚鹦鹉等多样珍禽。火烈鸟羽毛亮丽的粉红色泽，源自其每日滤食的小型甲壳类水生动物与藻类中丰富的类胡萝卜素。",
    ja: "鮮やかなピンク色の水辺には、ベニイロフラミンゴや熱帯の美しい鳥たちが優雅に暮らしています。特徴的な羽の色は、餌となる微細藻類や甲殻類に含まれるカロテノイド色素によるものです。"
  },
  "zoo-6": {
    names: { vi: "Đầm Cá Sấu Nước Lợ", en: "Saltwater Crocodile", ko: "바다악어", zh: "湾鳄（咸水鳄）", ja: "イリエワニ" },
    vi: "Chào mừng quý khách đến với Đầm Cá Sấu Thảo Cầm Viên. Cá sấu nước lợ là loài bò sát còn sống lớn nhất hành tinh với lực cắn khủng khiếp lên tới hơn 3.700 pound/inch vuông. Chúng có thể nằm bất động hàng giờ dưới mặt nước như một khúc gỗ để rình mồi với khả năng ngụy trang hoàn hảo.",
    en: "Welcome to the Crocodile Lagoon. The Saltwater Crocodile is the largest living reptile on Earth, packing a devastating bite force exceeding 3,700 pounds per square inch. Masters of stealth, they remain motionless for hours like floating logs awaiting unsuspecting prey.",
    ko: "바다악어는 지구상에서 가장 거대한 파충류로, 1제곱인치당 3,700파운드가 넘는 무시무시한 치악력을 자랑합니다. 마치 물에 뜬 통나무처럼 몇 시간이고 미동 없이 완벽히 위장하여 먹잇감을 노립니다.",
    zh: "欢迎来到鳄鱼池。湾鳄是现存体型最大的爬行动物，咬合力超过3700磅每平方英寸。它们擅长像浮木一样在水中静止潜伏数小时，以近乎完美的伪装伏击猎物。",
    ja: "ワニ池へようこそ。イリエワニは現生最大の爬虫類であり、3,700ポンド/平方インチを超える圧倒的な咬合力を誇ります。水面に丸太のように擬態して獲物をじっと待ち伏せします。"
  },
  "zoo-7": {
    names: { vi: "Tê Giác Một Sừng", en: "One-Horned Rhino", ko: "인도코뿔소", zh: "独角犀牛", ja: "インドサイ" },
    vi: "Tê giác là một trong những loài thú to lớn cổ xưa còn tồn tại đến ngày nay với lớp da dầy xếp nếp như áo giáp chiến binh. Chiếc sừng đặc trưng được cấu tạo từ keratin giống như móng tay con người. Chúng đóng vai trò cực kỳ quan trọng trong việc cân bằng hệ sinh thái đồng cỏ.",
    en: "The Greater One-horned Rhino is a prehistoric megaherbivore sporting armor-plated skin folds. Its iconic single horn consists of dense keratin, identical to human hair and fingernails. Rhinos play an indispensable keystone role in shaping grassland ecosystems.",
    ko: "인도코뿔소는 마치 갑옷을 입은 듯한 두터운 피부 주름을 가진 고대의 거대 초식동물입니다. 상징적인 단 하나의 뿔은 사람의 손톱과 같은 케라틴 단백질로 이루어져 있으며, 생태계 균형 유지의 주춧돌 역할을 합니다.",
    zh: "独角犀牛是极其古老的巨型植食动物，厚实坚硬的皮肤褶皱犹如披挂的重装铠甲。标志性的独角完全由角蛋白纤维紧密构成，在维护草原森林健康方面扮演着关键角色。",
    ja: "鎧のような分厚い皮膚のひだを持つインドサイは、古代から姿を変えずに生き残った巨大草食獣です。角は骨ではなく人間の爪と同じケラチンでできており、草原生態系に不可欠な動物です。"
  },
  "zoo-8": {
    names: { vi: "Gấu Ngựa Đông Dương", en: "Asian Black Bear", ko: "아시아반달가슴곰", zh: "亚洲黑熊（月熊）", ja: "ツキノワグマ" },
    vi: "Gấu Ngựa Đông Dương nổi bật với vệt lông hình chữ V màu vàng kem hoặc trắng sáng đặc trưng trước ngực. Đây là loài động vật thông minh, leo trèo giỏi và đặc biệt thích ăn mật ong nguyên chất cùng các loại quả rừng nhiệt đới ngọt ngào.",
    en: "The Asian Black Bear is immediately recognized by the striking cream-colored V-shaped patch across its chest. Exceptionally clever and agile tree climbers, they relish wild honeycomb, acorns, and succulent tropical forest fruits.",
    ko: "아시아반달가슴곰은 가슴에 새겨진 선명한 초승달 모양의 브이(V)자 무늬가 특징입니다. 매우 영리하며 나무 타기에 능숙하고, 야생 벌꿀과 달콤한 열대 열매를 가장 즐겨 먹습니다.",
    zh: "亚洲黑熊最显著的特征就是胸前那道皎洁明亮的V字形月牙白斑。它们生性聪颖、擅长攀爬高树，尤其钟爱野蜂蜜与各色香甜多汁的热带林木果实。",
    ja: "ツキノワグマは胸元にある鮮やかな三日月（V字型）の白い斑紋が特徴です。非常に賢く木登りが得意で、大好物のハチミツや木の実を器用に探して食べます。"
  }
};

const UI_TRANSLATIONS = {
  vi: {
    navMap: "Bản đồ sở thú",
    navMobile: "Mô phỏng di động",
    navAdmin: "Quản Trị Hệ Thống",
    searchPlaceholder: "Tìm chuồng thú trên bản đồ...",
    pillGate1: "🚪 Cổng 1",
    pillGate2: "🚪 Cổng 2",
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
    btnViewOnMap: "Xem Trên Google Maps",
    geofenceRadiusLabel: "Bán kính Geofence",
    gridHeading: "Danh Sách Động Vật",
    gridSubheading: "Đồng bộ đa phương tiện theo chuẩn PRD Thảo Cầm Viên.",
    gridBadge: "Hệ thống Audio Guide",
    noAnimalData: "Đang tải dữ liệu...",
    langCardTag: "🇻🇳 VIỆT NAM"
  },
  en: {
    navMap: "Zoo Map",
    navMobile: "Mobile Experience",
    navAdmin: "Admin Portal",
    searchPlaceholder: "Search exhibits on map...",
    pillGate1: "🚪 Gate 1",
    pillGate2: "🚪 Gate 2",
    gate1Name: "Gate 1 (Nguyen Binh Khiem)",
    gate2Name: "Gate 2 (Nguyen Thi Minh Khai)",
    gateDesc: "Saigon Zoo Entrance Gate",
    satelliteBadge: "Google Maps Satellite",
    mapDigital: "Digital Map",
    mapSatellite: "Satellite",
    autoDetect: "Auto Detection",
    audioGuideHeading: "Audio Narration",
    btnListen: "Listen Guide",
    btnStop: "Stop",
    btnViewOnMap: "Open Google Maps",
    geofenceRadiusLabel: "Geofence Radius",
    gridHeading: "Animal Exhibits",
    gridSubheading: "Real-time automated multimedia tour guide.",
    gridBadge: "Audio Guide System",
    noAnimalData: "Loading exhibit data...",
    langCardTag: "🇬🇧 ENGLISH"
  },
  ko: {
    navMap: "동물원 지도",
    navMobile: "모바일 가이드",
    navAdmin: "관리자 포털",
    searchPlaceholder: "지도에서 동물 서식지 검색...",
    pillGate1: "🚪 1번 출입구",
    pillGate2: "🚪 2번 출입구",
    gate1Name: "1번 문 (Nguyen Binh Khiem)",
    gate2Name: "2번 문 (Nguyen Thi Minh Khai)",
    gateDesc: "사이공 동물원 공식 출입문",
    satelliteBadge: "위성 지도",
    mapDigital: "일반 지도",
    mapSatellite: "위성 사진",
    autoDetect: "자동 감지 활성",
    audioGuideHeading: "음성 가이드",
    btnListen: "해설 듣기",
    btnStop: "정지",
    btnViewOnMap: "구글 지도에서 보기",
    geofenceRadiusLabel: "지오펜스 반경",
    gridHeading: "동물 서식지 목록",
    gridSubheading: "GPS 및 QR 기반 실시간 다국어 음성 안내 시스템.",
    gridBadge: "오디오 가이드",
    noAnimalData: "데이터 불러오는 중...",
    langCardTag: "🇰🇷 한국어"
  },
  ja: {
    navMap: "動物園マップ",
    navMobile: "モバイルガイド",
    navAdmin: "管理者ポータル",
    searchPlaceholder: "動物展示をマップ上で検索...",
    pillGate1: "🚪 第1ゲート",
    pillGate2: "🚪 第2ゲート",
    gate1Name: "第1ゲート (Nguyen Binh Khiem)",
    gate2Name: "第2ゲート (Nguyen Thi Minh Khai)",
    gateDesc: "サイゴン動植物園エントランス",
    satelliteBadge: "Google マップ 衛星写真",
    mapDigital: "標準地図",
    mapSatellite: "衛星写真",
    autoDetect: "自動検知オン",
    audioGuideHeading: "音声ガイドナレーション",
    btnListen: "解説を聞く",
    btnStop: "停止",
    btnViewOnMap: "Googleマップで開く",
    geofenceRadiusLabel: "検知エリア半径",
    gridHeading: "展示動物一覧",
    gridSubheading: "QRコード・GPS連動の自動音声ガイドシステム。",
    gridBadge: "音声ガイド稼働中",
    noAnimalData: "データを読み込み中...",
    langCardTag: "🇯🇵 日本語"
  },
  zh: {
    navMap: "动物园地图",
    navMobile: "移动导览体验",
    navAdmin: "系统管理后台",
    searchPlaceholder: "在地图上搜索动物展区...",
    pillGate1: "🚪 1号大门",
    pillGate2: "🚪 2号大门",
    gate1Name: "1号门 (阮秉谦路)",
    gate2Name: "2号门 (阮氏明开路)",
    gateDesc: "西贡动植物园主要出入口",
    satelliteBadge: "谷歌卫星实景",
    mapDigital: "数字地图",
    mapSatellite: "卫星地图",
    autoDetect: "自动感应就绪",
    audioGuideHeading: "多语言语音导览",
    btnListen: "收听语音解说",
    btnStop: "停止",
    btnViewOnMap: "在谷歌地图中查看",
    geofenceRadiusLabel: "地理围栏识别半径",
    gridHeading: "动植物展区一览",
    gridSubheading: "基于QR扫码与GPS定位的智能导览系统。",
    gridBadge: "导览系统已连接",
    noAnimalData: "正在同步数据...",
    langCardTag: "🇨🇳 简体中文"
  }
};

function getAnimalIcon(name = "", index = 0) {
  const n = (name || "").toLowerCase();
  if (n.includes("voi") || n.includes("elephant")) return "🐘";
  if (n.includes("hổ") || n.includes("tiger")) return "🐅";
  if (n.includes("hươu") || n.includes("ngựa vằn") || n.includes("giraffe") || n.includes("zebra")) return "🦒";
  if (n.includes("vượn") || n.includes("khỉ") || n.includes("gibbon")) return "🐒";
  if (n.includes("chim") || n.includes("hồng hạc") || n.includes("flamingo")) return "🦩";
  if (n.includes("cá sấu") || n.includes("crocodile")) return "🐊";
  if (n.includes("tê giác") || n.includes("rhino")) return "🦏";
  if (n.includes("gấu") || n.includes("bear")) return "🐻";
  const defaultIcons = ["🦁", "🦚", "🦜", "🦌", "🐆", "🐢", "🦅", "🦔"];
  return defaultIcons[index % defaultIcons.length];
}

function getAnimalLocalizedName(animal, lang = "vi") {
  if (!animal) return "";
  const tour = MULTILINGUAL_TOUR_DATA[animal.id];
  if (tour && tour.names && tour.names[lang]) {
    return tour.names[lang];
  }
  return animal.name;
}

function getAnimalLocalizedZone(animal, lang = "vi") {
  if (!animal) return "";
  return animal.zone || "";
}

function getAnimalLocalizedNarrative(animal, lang = "vi") {
  if (!animal) return "";
  const tour = MULTILINGUAL_TOUR_DATA[animal.id];
  if (tour && tour[lang]) {
    return tour[lang];
  }
  return animal.descriptionVi || "";
}


function getZooAnimals() {
  const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('ZOO_ANIMALS_DATA_V3') : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return (typeof DEFAULT_ZOO_ANIMALS !== 'undefined') ? DEFAULT_ZOO_ANIMALS : [];
}


// Global & Module Export Bridge
const _allExports = {
  UI_TRANSLATIONS: (typeof UI_TRANSLATIONS !== 'undefined') ? UI_TRANSLATIONS : {},
  DEFAULT_ZOO_ANIMALS: (typeof DEFAULT_ZOO_ANIMALS !== 'undefined') ? DEFAULT_ZOO_ANIMALS : [],
  ZOO_BOUNDARY_POLYGON: (typeof ZOO_BOUNDARY_POLYGON !== 'undefined') ? ZOO_BOUNDARY_POLYGON : [],
  ZOO_GATES: (typeof ZOO_GATES !== 'undefined') ? ZOO_GATES : [],
  ZOO_LANDMARKS: (typeof ZOO_LANDMARKS !== 'undefined') ? ZOO_LANDMARKS : [],
  MULTILINGUAL_TOUR_DATA: (typeof MULTILINGUAL_TOUR_DATA !== 'undefined') ? MULTILINGUAL_TOUR_DATA : {},
  getZooAnimals: (typeof getZooAnimals !== 'undefined') ? getZooAnimals : () => [],
  getAnimalLocalizedName: (typeof getAnimalLocalizedName !== 'undefined') ? getAnimalLocalizedName : (a) => a?.name || '',
  getAnimalLocalizedZone: (typeof getAnimalLocalizedZone !== 'undefined') ? getAnimalLocalizedZone : (a) => a?.zone || '',
  getAnimalLocalizedNarrative: (typeof getAnimalLocalizedNarrative !== 'undefined') ? getAnimalLocalizedNarrative : (a, l) => a?.narrations?.[l] || '',
  getAnimalIcon: (typeof getAnimalIcon !== 'undefined') ? getAnimalIcon : () => '🐾',
  isPointInsideZoo: (typeof isPointInsideZoo !== 'undefined') ? isPointInsideZoo : () => true
};

if (typeof window !== 'undefined') {
  Object.assign(window, _allExports);
}
if (typeof global !== 'undefined') {
  Object.assign(global, _allExports);
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = _allExports;
}
