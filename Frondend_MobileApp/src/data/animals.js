/**
 * Dữ liệu loài thú chính thức của Thảo Cầm Viên Sài Gòn
 * Tích hợp đầy đủ tọa độ GPS, bán kính Geofence, mã QR biển bảng
 * và bài thuyết minh chi tiết chuẩn 5 ngôn ngữ (VI, EN, FR, ZH, JA)
 */

export const ZOO_ZONES = [
  { id: 'all', label: 'Tất cả phân khu', icon: '🐾' },
  { id: 'carnivore', label: 'Khu Thú Ăn Thịt', icon: '🐯' },
  { id: 'herbivore', label: 'Móng Guốc & Thảo Nguyên', icon: '🐘' },
  { id: 'primate', label: 'Đảo Linh Trưởng', icon: '🐒' },
  { id: 'bird', label: 'Vườn Chim & Thủy Điểu', icon: '🦩' },
  { id: 'reptile', label: 'Bò Sát Cổ Đại', icon: '🐊' }
];

export const INITIAL_ZOO_ANIMALS = [
  {
    id: "zoo-1",
    qrCode: "TCV-VOI-01",
    name: "Voi Châu Á",
    scientificName: "Elephas maximus",
    zoneId: "herbivore",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    coords: { lon: 106.7055, lat: 10.7873 },
    radius: 25,
    iucnStatus: "Nguy cấp (EN)",
    diet: "Cỏ, mía, chuối, thân cây chuối",
    weight: "3.000 - 5.000 kg",
    lifespan: "60 - 70 năm",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800",
    audioDuration: 95,
    description: {
      vi: "Chào mừng quý khách đến với khu chuồng Voi Châu Á của Thảo Cầm Viên Sài Gòn. Voi Châu Á là loài thú trên cạn lớn nhất châu lục, sở hữu chiếc vòi khéo léo với hơn 40.000 bó cơ giúp cầm nắm thức ăn và hút nước. Đàn voi tại đây được nuôi dưỡng theo chế độ dinh dưỡng giàu chất xơ, bổ sung mía ngọt, chuối và các khoáng chất cần thiết.",
      en: "Welcome to the Asian Elephant sanctuary at Saigon Zoo and Botanical Gardens. As the largest land mammal on the continent, the Asian elephant possesses a remarkable trunk containing over 40,000 muscle bundles. Our herd receives daily natural forage, sweet sugarcane, and specialized veterinary care.",
      fr: "Bienvenue à l'enclos de l'Éléphant d'Asie du Jardin Botanique de Saïgon. Plus grand mammifère terrestre d'Asie, l'éléphant possède une trompe remarquable de plus de 40 000 muscles lui permettant de manipuler des objets avec précision et d'aspirer de l'eau.",
      zh: "热烈欢迎各位游客来到西贡动植物园的亚洲象展区。亚洲象是亚洲大陆上现存体型最大的陆生哺乳动物，其灵活的长鼻由超过四万条肌肉纤维构成，具备惊人的灵巧度与力量。",
      ja: "サイゴン動植物園のアジアゾウ展示エリアへようこそ。アジアゾウはアジア大陸最大の陸生哺乳類で、4万以上の筋肉束で構成される器用な鼻を使って食事や水浴びを行います。"
    }
  },
  {
    id: "zoo-2",
    qrCode: "TCV-HO-02",
    name: "Hổ Đông Dương",
    scientificName: "Panthera tigris corbetti",
    zoneId: "carnivore",
    zone: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    coords: { lon: 106.7057, lat: 10.7883 },
    radius: 20,
    iucnStatus: "Cực kỳ nguy cấp (CR)",
    diet: "Thịt bò, thịt gà, sườn tươi",
    weight: "150 - 220 kg",
    lifespan: "15 - 20 năm",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800",
    audioDuration: 88,
    description: {
      vi: "Quý khách đang đứng trước khu vực nuôi dưỡng Hổ Đông Dương – chúa tể của núi rừng Đông Nam Á. Mỗi cá thể hổ sở hữu hoa văn vằn đen độc bản như vân tay của con người. Loài hổ này bơi lội rất giỏi và có thể rình bắt con mồi với lực bật nhảy xa hơn 6 mét.",
      en: "You are standing before the Indochinese Tiger habitat, the legendary apex predator of Southeast Asian rainforests. Each tiger possesses a unique stripe pattern akin to human fingerprints. They are superb swimmers capable of leaping over 6 meters.",
      fr: "Vous vous trouvez devant l'habitat du Tigre d'Indochine, prédateur suprême des forêts tropicales d'Asie du Sud-Est. Chaque individu possède un motif de rayures unique comparable aux empreintes digitales humaines.",
      zh: "各位游客现在看到的是东南亚热带雨林的顶级掠食者——印度支那虎。每一只老虎身上的黑色条纹都是独一无二的，就像人类的指纹一样。它们不仅是敏锐的猎手，还是游泳好手。",
      ja: "こちらは東南アジア熱帯雨林の王者、インドシナトラの飼育区です。トラの黒い縞模様は人間の指紋のように個体ごとに異なり、水泳が得意で6メートル以上の跳躍力を誇ります。"
    }
  },
  {
    id: "zoo-3",
    qrCode: "TCV-HUOU-03",
    name: "Hươu Cao Cổ & Ngựa Vằn",
    scientificName: "Giraffa camelopardalis & Equus quagga",
    zoneId: "herbivore",
    zone: "Khu Thảo Nguyên & Xavan Châu Phi",
    coords: { lon: 106.7047, lat: 10.7869 },
    radius: 30,
    iucnStatus: "Sắp nguy cấp (VU)",
    diet: "Lá cây keo, cỏ tươi, củ quả",
    weight: "800 - 1.400 kg",
    lifespan: "25 - 30 năm",
    image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800",
    audioDuration: 92,
    description: {
      vi: "Khuôn viên thảo nguyên trước mắt quý khách tái hiện xavan châu Phi nơi Hươu Cao Cổ và Ngựa Vằn sống chan hòa. Chiếc cổ vươn cao giúp hươu hái những chồi non ngọt nhất trên ngọn cây, trong khi sọc vằn của ngựa giúp đánh lừa thị giác kẻ săn mồi và xua đuổi côn trùng hút máu.",
      en: "This open savannah meadow brings together Giraffes and Zebras in a peaceful shared environment. The giraffe's tall neck enables it to reach high canopy foliage, while zebra stripes disrupt predator vision and repel biting insects.",
      fr: "Cet espace de savane arborée réunit Girafes et Zèbres dans une cohabitation harmonieuse. Le long cou de la girafe lui permet de brouter la cime des acacias, tandis que les zébrures éloignent les insectes parasites.",
      zh: "眼前开阔的草原展示区将长颈鹿与斑马融合于非洲稀树草原般的共享生境中。长颈鹿凭借修长的颈部采食树冠嫩叶，而斑马独特的黑白条纹则能有效迷惑捕食者并驱赶蚊蝇。",
      ja: "広々としたサバンナ展示場では、キリンとシマウマが穏やかに共生しています。キリンの長い首は高い樹木の若葉を食べるのに適し、シマウマの縞模様は外敵の目を眩ませる効果があります。"
    }
  },
  {
    id: "zoo-4",
    qrCode: "TCV-VUON-04",
    name: "Vượn Má Vàng & Linh Trưởng",
    scientificName: "Nomascus gabriellae",
    zoneId: "primate",
    zone: "Đảo Linh Trưởng Rừng Mưa Nhiệt Đới",
    coords: { lon: 106.7048, lat: 10.7877 },
    radius: 20,
    iucnStatus: "Nguy cấp (EN)",
    diet: "Trái cây chín, chồi non, hoa, côn trùng",
    weight: "6 - 9 kg",
    lifespan: "35 - 45 năm",
    image: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800",
    audioDuration: 85,
    description: {
      vi: "Tiếng hót trong trẻo vang vọng cả một góc vườn chính là khúc ca buổi sáng của loài Vượn Má Vàng – bảo vật linh trưởng đặc hữu của miền Nam Việt Nam và Đông Dương. Nhờ cánh tay dài thon gọn, chúng có thể chuyền cành thoăn thoắt với tốc độ trên 50 km/h.",
      en: "The melodious morning chorus echoing across the canopy belongs to the Yellow-cheeked Crested Gibbon, an endangered primate endemic to Southern Vietnam. Their elongated arms allow rapid brachiation reaching speeds up to 50 km/h.",
      fr: "Les chants mélodieux résonnant dans la canopée sont émis par le Gibbon à joues jaunes, primate emblématique menacé endémique du Sud du Vietnam. Ses longs bras lui permettent une brachiation spectaculaire entre les arbres.",
      zh: "在树冠之间回荡的悠扬鸣啼，正是南越及中南半岛特有的珍稀灵长类动物——黄颊长臂猿的晨曲。它们修长的手臂能在密林间自如荡跃，飞行般的臂跃速度可达每小时50公里。",
      ja: "森に響き渡る美しいデュエットソングの主は、ベトナム南部固有のキッペキホオジロシロテテナガザルです。長い腕を巧みに使って枝から枝へと敏捷に移動します。"
    }
  },
  {
    id: "zoo-5",
    qrCode: "TCV-CHIM-05",
    name: "Vườn Chim & Hồng Hạc",
    scientificName: "Phoenicopterus ruber",
    zoneId: "bird",
    zone: "Vườn Chim & Đầm Lầy Thủy Điểu",
    coords: { lon: 106.7062, lat: 10.7875 },
    radius: 25,
    iucnStatus: "Ít quan tâm (LC)",
    diet: "Tảo, tôm nhỏ, ấu trùng giáp xác",
    weight: "2 - 4 kg",
    lifespan: "30 - 40 năm",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
    audioDuration: 80,
    description: {
      vi: "Đầm nước thơ mộng trước mắt quý khách là vương quốc của đàn Chim Hồng Hạc kiêu sa. Màu lông hồng rực rỡ của chúng không phải bẩm sinh mà tích lũy từ sắc tố carotenoid có trong tôm biển và tảo xoắn mà chúng lọc được nhờ chiếc mỏ cong chuyên biệt.",
      en: "This picturesque wetland sanctuary hosts our elegant flock of American Flamingos. Their vivid pink coloration is derived from carotenoid pigments absorbed through their natural diet of brine shrimp and specialized blue-green algae.",
      fr: "Cette lagune abrite une superbe colonie de Flamants roses. Leur plumage écarlate provient des caroténoïdes présents dans les petits crustacés et algues microscopiques qu'ils filtrent avec leur bec courbé.",
      zh: "眼前优美的水禽湿地栖息着迷人的美洲红鹳群。火烈鸟羽毛那艳丽的粉红色并非与生俱来，而是通过滤食富含类胡萝卜素的卤虫与螺旋藻在体内沉淀转化而来。",
      ja: "湿地エリアに優雅にたたずむのはベニイロフラミンゴの群れです。鮮やかなピンク色の羽は、エサに含まれる甲殻類や藍藻のカロテノイド色素に由来しています。"
    }
  },
  {
    id: "zoo-6",
    qrCode: "TCV-CASAU-06",
    name: "Đầm Cá Sấu Nước Lợ",
    scientificName: "Crocodylus porosus",
    zoneId: "reptile",
    zone: "Khu Bò Sát Cổ Đại",
    coords: { lon: 106.7062, lat: 10.7868 },
    radius: 25,
    iucnStatus: "Ít quan tâm (LC)",
    diet: "Cá, thịt gia cầm, thịt bò tươi",
    weight: "400 - 1.000 kg",
    lifespan: "70 - 100 năm",
    image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?w=800",
    audioDuration: 90,
    description: {
      vi: "Quý khách đang quan sát loài bò sát lớn nhất còn sống trên Trái Đất: Cá Sấu Nước Lợ. Với lịch sử tiến hóa hơn 200 triệu năm, chúng sở hữu lực cắn mạnh bậc nhất hành tinh, có thể nhịn thở dưới nước hơn 1 giờ đồng hồ và điều chỉnh thân nhiệt nhờ phơi nắng trên bờ đá.",
      en: "You are observing the Saltwater Crocodile, the largest living reptile on Earth. Having survived for over 200 million years, they wield colossal bite strength and can submerge unseen for over an hour while stalking prey.",
      fr: "Vous observez le Crocodile marin, le plus grand reptile vivant sur Terre. Témoin vivant de plus de 200 millions d'années d'évolution, il possède l'une des morsures les plus puissantes du règne animal.",
      zh: "正在阳光下栖息的是地球上现存体型最大的爬行动物——湾鳄。经历了两亿多年的进化洗礼，它们具有自然界最惊人的咬合力之一，可在水下隐匿伏击超过一小时。",
      ja: "こちらは現生最大の爬虫類、イリエワニの池です。恐竜の時代から2億年以上姿を変えずに生き抜き、強力な顎の力と優れた水中潜伏能力を持っています。"
    }
  },
  {
    id: "zoo-7",
    qrCode: "TCV-TEGIAC-07",
    name: "Tê Giác Một Sừng",
    scientificName: "Rhinoceros unicornis",
    zoneId: "herbivore",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    coords: { lon: 106.7052, lat: 10.7866 },
    radius: 30,
    iucnStatus: "Sắp nguy cấp (VU)",
    diet: "Cỏ voi, lá cây, củ quả tươi",
    weight: "1.800 - 2.500 kg",
    lifespan: "40 - 50 năm",
    image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800",
    audioDuration: 86,
    description: {
      vi: "Tê Giác Một Sừng là sinh vật cổ đại với lớp da xám dày gấp nếp trông tựa như bộ áo giáp kiên cố của một chiến binh thời Trung cổ. Chiếc sừng trứ danh của tê giác thực chất không phải bằng xương mà được cấu tạo từ keratin nén chặt – chất liệu cấu tạo nên móng tay và tóc của con người.",
      en: "The Greater One-horned Rhinoceros resembles a prehistoric beast encased in heavy rivet-studded armor plating. Its iconic horn is not bone, but solid compressed keratin, identical to the protein found in human hair and fingernails.",
      fr: "Le Rhinocéros unicorne d'Asie arbore une peau cuirassée aux plis profonds rappelant une armure de chevalier médiéval. Sa corne emblématique n'est pas un os, mais un agglomérat dense de kératine.",
      zh: "大独角犀以其深折叠的厚重灰色皮肤著称，外貌如同身披坚实铆钉铠甲的远古武士。它标志性的独角并非由骨骼构成，而是由紧密压缩的角蛋白组成，与人类的头发和指甲成分完全一致。",
      ja: "インドサイは鎧のような頑丈な皮膚のヒダを持つ古代の面影を残す大型動物です。一本の角は骨ではなく、人間の髪や爪と同じケラチン質が凝縮してできています。"
    }
  },
  {
    id: "zoo-8",
    qrCode: "TCV-GAU-08",
    name: "Gấu Ngựa Đông Dương",
    scientificName: "Ursus thibetanus",
    zoneId: "carnivore",
    zone: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    coords: { lon: 106.7052, lat: 10.7883 },
    radius: 20,
    iucnStatus: "Sắp nguy cấp (VU)",
    diet: "Mật ong, trái cây rừng, bắp ngô non, thịt nạc",
    weight: "100 - 180 kg",
    lifespan: "25 - 30 năm",
    image: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800",
    audioDuration: 84,
    description: {
      vi: "Gấu Ngựa (hay Gấu Mặt Trăng) nổi tiếng với mảng lông màu vàng hình chữ V hoặc trăng khuyết kiêu hãnh trước ngực, nổi bật trên nền lông đen nhánh dày mượt. Chúng là những vận động viên leo trèo tài ba và rất thích thưởng thức mật ong thơm ngọt cùng trái cây rừng.",
      en: "The Asian Black Bear, affectionately named the Moon Bear, bears a distinct crescent-shaped creamy chest mark against dense black fur. Excellent tree climbers, they love wild forest fruits and fresh honey.",
      fr: "L'Ours noir d'Asie (Ours à collier) se distingue par un croissant blanc ou jaune crème sur son poitrail obscur. Grimpeur hors pair, il affectionne particulièrement les baies sauvages et le miel.",
      zh: "亚洲黑熊（又称月熊）胸前拥有一弯醒目的白色或浅黄色月牙形斑纹，与一身浓密的乌黑毛皮形成鲜明对比。它们是出色的爬树能手，尤其喜爱采食蜂蜜和多汁的野生浆果。",
      ja: "ツキノワグマ（月熊）は胸元にある三日月型の白い模様が特徴的です。木登りが非常に得意で、森の果実や甘い蜂蜜が大好物です。"
    }
  }
];

export const AVAILABLE_LANGUAGES = [
  { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', voice: 'vi-VN' },
  { id: 'en', label: 'English', flag: '🇬🇧', voice: 'en-US' },
  { id: 'fr', label: 'Français', flag: '🇫🇷', voice: 'fr-FR' },
  { id: 'zh', label: '中文', flag: '🇨🇳', voice: 'zh-CN' },
  { id: 'ja', label: '日本語', flag: '🇯🇵', voice: 'ja-JP' }
];
