import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';

// Danh sách các phân khu chuồng động vật tại Thảo Cầm Viên Sài Gòn
const ZOO_ANIMALS = [
  {
    id: "zoo-1",
    name: "Voi Châu Á",
    scientificName: "Elephas maximus",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    coords: { lon: 106.7056, lat: 10.7872 },
    radius: 25,
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=700",
    description: {
      vi: "Chào mừng quý khách đến với khu chuồng Voi Châu Á. Voi Châu Á là loài thú cạn lớn nhất châu lục, sở hữu chiếc vòi khéo léo với hơn 40.000 bó cơ. Đàn voi tại Thảo Cầm Viên được chăm sóc bằng chế độ dinh dưỡng giàu chất xơ từ mía, chuối và cỏ ngọt.",
      en: "Welcome to the Asian Elephant enclosure. The Asian Elephant is the largest land mammal on the continent, possessing an agile trunk with over 40,000 muscles.",
      ja: "アジアゾウの飼育エリアへようこそ。アジアゾウは大陸最大の陸上哺乳類で、4万以上の筋肉を持つ器用な鼻が特徴です。"
    }
  },
  {
    id: "zoo-2",
    name: "Hổ Đông Dương",
    scientificName: "Panthera tigris corbetti",
    zone: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    coords: { lon: 106.7061, lat: 10.7885 },
    radius: 20,
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=700",
    description: {
      vi: "Quý khách đang đứng trước khu nuôi dưỡng Hổ Đông Dương - chúa tể của núi rừng Đông Nam Á. Với bộ lông vàng cam rực rỡ và những vằn đen độc bản, hổ sở hữu sức mạnh và khả năng bơi lội đáng nể.",
      en: "You are standing before the Indochinese Tiger enclosure. Known as the lord of the forest, each tiger has a unique pattern of dark stripes on orange fur.",
      ja: "東南アジアの森の王者、インドシナトラのエリアです。オレンジ色の毛並みに独特の黒い縞模様が特徴です。"
    }
  },
  {
    id: "zoo-3",
    name: "Hươu Cao Cổ & Ngựa Vằn",
    scientificName: "Giraffa camelopardalis & Equus quagga",
    zone: "Khu Thảo Nguyên & Xavan Châu Phi",
    coords: { lon: 106.7045, lat: 10.7868 },
    radius: 30,
    image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=700",
    description: {
      vi: "Khuôn viên thảo nguyên xanh mát mở ra trước mắt quý khách là ngôi nhà chung của Hươu Cao Cổ và Ngựa Vằn. Chiếc cổ dài giúp hươu hái những ngọn lá keo cao nhất, còn bộ lông sọc vằn của ngựa giúp xua đuổi côn trùng.",
      en: "This open savannah sanctuary is home to Giraffes and Zebras living peacefully in a shared natural habitat.",
      ja: "広々としたサバンナエリアには、キリンとシマウマがのびのびと暮らしています。"
    }
  },
  {
    id: "zoo-4",
    name: "Vượn Má Vàng & Linh Trưởng",
    scientificName: "Nomascus gabriellae",
    zone: "Đảo Linh Trưởng Rừng Mưa Nhiệt Đới",
    coords: { lon: 106.7049, lat: 10.7880 },
    radius: 20,
    image: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=700",
    description: {
      vi: "Tiếng hót lảnh lót vang vọng cả một góc vườn chính là tiếng gọi đàn của Vượn Má Vàng - loài linh trưởng đặc hữu của Việt Nam và Đông Dương với khả năng chuyền cành tuyệt vời.",
      en: "Listen to the melodic singing echoing across the trees: that is the Yellow-cheeked Crested Gibbon, an endangered primate native to Vietnam.",
      ja: "木々の間に響き渡る美しい鳴き声は、ベトナム固有のキッペキホオジロシロテテナガザルの合唱です。"
    }
  },
  {
    id: "zoo-5",
    name: "Vườn Chim & Hồng Hạc",
    scientificName: "Phoenicopterus ruber",
    zone: "Vườn Chim & Đầm Lầy Thủy Điểu",
    coords: { lon: 106.7068, lat: 10.7878 },
    radius: 25,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700",
    description: {
      vi: "Đầm lầy rực rỡ sắc hồng là nơi sinh sống của đàn Chim Hồng Hạc cùng hàng chục loài chim quý. Sắc hồng đặc trưng của chim bắt nguồn từ sắc tố carotenoid có trong thức ăn thủy sinh.",
      en: "The wetland sanctuary is home to graceful Pink Flamingos whose vivid coloration comes from carotenoid pigments in their natural diet.",
      ja: "鮮やかなピンク色の湿地には、フラミンゴの群れが優雅に羽を休めています。"
    }
  },
  {
    id: "zoo-6",
    name: "Đầm Cá Sấu Nước Lợ",
    scientificName: "Crocodylus porosus",
    zone: "Khu Bò Sát Cổ Đại",
    coords: { lon: 106.7072, lat: 10.7865 },
    radius: 25,
    image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?w=700",
    description: {
      vi: "Chào mừng quý khách đến với Đầm Cá Sấu Thảo Cầm Viên. Cá sấu nước lợ là loài bò sát lớn nhất hành tinh với lực cắn khủng khiếp và khả năng ngụy trang như khúc gỗ dưới nước.",
      en: "Welcome to the Saltwater Crocodile enclosure. As the largest living reptile on Earth, they possess formidable bite force and stealth.",
      ja: "地球上で最大の爬虫類、イリエワニの池へようこそ。水中に潜み獲物を待ち伏せる強力なハンターです。"
    }
  },
  {
    id: "zoo-7",
    name: "Tê Giác Một Sừng",
    scientificName: "Rhinoceros unicornis",
    zone: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    coords: { lon: 106.7051, lat: 10.7865 },
    radius: 30,
    image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=700",
    description: {
      vi: "Tê giác là một trong những loài thú to lớn cổ xưa còn tồn tại đến ngày nay với lớp da dầy xếp nếp như áo giáp chiến binh. Chiếc sừng đặc trưng được cấu tạo từ keratin giống như móng tay con người.",
      en: "The Indian Rhinoceros is an ancient giant mammal with armor-plated skin and a magnificent single horn made of keratin.",
      ja: "サイは鎧のような皮膚を持つ古代から生き残る大型動物で、ケラチン質の角が特徴です。"
    }
  },
  {
    id: "zoo-8",
    name: "Gấu Ngựa Đông Dương",
    scientificName: "Ursus thibetanus",
    zone: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    coords: { lon: 106.7065, lat: 10.7888 },
    radius: 20,
    image: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=700",
    description: {
      vi: "Gấu ngựa sở hữu vệt lông màu vàng hình chữ Y hoặc chữ V đặc trưng trước ngực, nổi bật trên nền lông đen bóng. Chúng là những vận động viên leo trèo cừ khôi trong rừng nhiệt đới.",
      en: "The Asian Black Bear (Moon Bear) is recognized by the distinct crescent-shaped yellow patch on its chest. They are skilled tree climbers.",
      ja: "胸に三日月型の白い模様を持つツキノワグマの仲間で、木登りが非常に得意です。"
    }
  }
];

// Công thức tính khoảng cách mặt cầu Haversine (mét)
function getDistanceMeters(lon1, lat1, lon2, lat2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function App() {
  const [selectedLang, setSelectedLang] = useState('vi'); // vi, en, ja
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeAnimal, setActiveAnimal] = useState(ZOO_ANIMALS[0]);
  const [touristLocation, setTouristLocation] = useState({ lon: 106.7056, lat: 10.7872 });
  const [autoGeofenceAlert, setAutoGeofenceAlert] = useState(null);

  // Kích hoạt Geofence tự động khi du khách di chuyển gần chuồng
  useEffect(() => {
    let triggered = null;
    ZOO_ANIMALS.forEach(animal => {
      const dist = getDistanceMeters(
        touristLocation.lon, touristLocation.lat,
        animal.coords.lon, animal.coords.lat
      );
      if (dist <= animal.radius) {
        triggered = { animal, dist };
      }
    });

    if (triggered && (!activeAnimal || activeAnimal.id !== triggered.animal.id)) {
      setActiveAnimal(triggered.animal);
      setIsPlaying(true);
      setAutoGeofenceAlert(`GPS Geofence: Bạn vừa bước vào khu vực ${triggered.animal.name} (${triggered.dist}m). Đang tự động phát thuyết minh!`);
    }
  }, [touristLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>🦁</Text>
          <View>
            <Text style={styles.headerTitle}>THẢO CẦM VIÊN AUDIO GUIDE</Text>
            <Text style={styles.headerSubtitle}>Hướng Dẫn Viên Tự Động Định Vị GPS</Text>
          </View>
        </View>

        {/* Offline Mode Switch */}
        <View style={styles.offlineBox}>
          <Text style={styles.offlineText}>Chế độ Offline:</Text>
          <Switch
            value={isOfflineMode}
            onValueChange={(val) => {
              setIsOfflineMode(val);
              Alert.alert(
                val ? "Đã bật chế độ Ngoại Tuyến (Offline)" : "Đã bật chế độ Trực Tuyến (Online)",
                val ? "Ứng dụng sẽ phát âm thanh từ bộ nhớ đệm (Cache) để tiết kiệm dữ liệu 4G trong sở thú." : "Ứng dụng kết nối trực tiếp API máy chủ để cập nhật dữ liệu mới nhất."
              );
            }}
            thumbColor={isOfflineMode ? "#10b981" : "#cbd5e1"}
            trackColor={{ false: "#334155", true: "#047857" }}
          />
        </View>
      </View>

      {/* Language Switcher Bar */}
      <View style={styles.langBar}>
        <Text style={styles.langBarLabel}>Ngôn ngữ thuyết minh:</Text>
        <View style={styles.langButtonsRow}>
          {[
            { id: 'vi', label: '🇻🇳 Tiếng Việt' },
            { id: 'en', label: '🇬🇧 English' },
            { id: 'ja', label: '🇯🇵 日本語' }
          ].map(lang => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.langBtn, selectedLang === lang.id && styles.langBtnActive]}
              onPress={() => setSelectedLang(lang.id)}
            >
              <Text style={[styles.langBtnText, selectedLang === lang.id && styles.langBtnTextActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Geofence Detection Toast */}
      {autoGeofenceAlert && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>🎯</Text>
          <Text style={styles.alertText}>{autoGeofenceAlert}</Text>
        </View>
      )}

      {/* Main Body Content */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        
        {/* Active Animal Main Card */}
        <View style={styles.animalCard}>
          <Image source={{ uri: activeAnimal.image }} style={styles.animalImage} />
          
          <View style={styles.animalBadgeRow}>
            <View style={styles.zoneBadge}>
              <Text style={styles.zoneBadgeText}>{activeAnimal.zone}</Text>
            </View>
            <View style={styles.radiusBadge}>
              <Text style={styles.radiusBadgeText}>🎯 Geofence: {activeAnimal.radius}m</Text>
            </View>
          </View>

          <Text style={styles.animalName}>{activeAnimal.name}</Text>
          <Text style={styles.scientificName}>{activeAnimal.scientificName}</Text>

          {/* Vietnamese Narration Script */}
          <View style={styles.narrationBox}>
            <Text style={styles.narrationHeader}>Bài thuyết minh ({selectedLang.toUpperCase()}):</Text>
            <Text style={styles.narrationContent}>
              {activeAnimal.description[selectedLang] || activeAnimal.description.vi}
            </Text>
          </View>
        </View>

        {/* GPS Simulation Walking Controller */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 Danh Sách Các Khu Chuồng (Mô Phỏng Bước Chân GPS)</Text>
        </View>

        {ZOO_ANIMALS.map(item => {
          const dist = getDistanceMeters(
            touristLocation.lon, touristLocation.lat,
            item.coords.lon, item.coords.lat
          );
          const isInside = dist <= item.radius;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.listItem, isInside && styles.listItemActive]}
              onPress={() => {
                setTouristLocation({ lon: item.coords.lon, lat: item.coords.lat });
                setActiveAnimal(item);
                setIsPlaying(true);
              }}
            >
              <Image source={{ uri: item.image }} style={styles.thumbImage} />
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listZone}>{item.zone}</Text>
                <Text style={[styles.listDist, isInside ? styles.listDistActive : null]}>
                  {isInside ? `🎯 ĐANG Ở ĐÂY (${dist}m ≤ ${item.radius}m)` : `Khoảng cách: ${dist}m`}
                </Text>
              </View>
              <Text style={styles.walkIcon}>{isInside ? '🔊' : '🚶'}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Audio Playback Controller */}
      <View style={styles.audioBottomBar}>
        <View style={styles.audioInfoRow}>
          <View>
            <Text style={styles.nowPlayingLabel}>ĐANG PHÁT THUYẾT MINH</Text>
            <Text style={styles.nowPlayingTitle} numberOfLines={1}>{activeAnimal.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: isPlaying ? '65%' : '0%' }]} />
        </View>
        <View style={styles.audioTimeRow}>
          <Text style={styles.timeText}>{isPlaying ? '00:45' : '00:00'}</Text>
          <Text style={styles.timeText}>01:25</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#047857'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerEmoji: {
    fontSize: 26
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    color: '#a7f3d0',
    fontSize: 10
  },
  offlineBox: {
    alignItems: 'flex-end'
  },
  offlineText: {
    color: '#a7f3d0',
    fontSize: 10,
    marginBottom: 2
  },
  langBar: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  langBarLabel: {
    color: '#94a3b8',
    fontSize: 11
  },
  langButtonsRow: {
    flexDirection: 'row',
    gap: 6
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#334155'
  },
  langBtnActive: {
    backgroundColor: '#059669'
  },
  langBtnText: {
    color: '#cbd5e1',
    fontSize: 11
  },
  langBtnTextActive: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  alertBanner: {
    backgroundColor: '#065f46',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#10b981',
    gap: 8
  },
  alertIcon: {
    fontSize: 16
  },
  alertText: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1
  },
  contentScroll: {
    paddingHorizontal: 14,
    paddingTop: 12
  },
  animalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16
  },
  animalImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10
  },
  animalBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  zoneBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  zoneBadgeText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: 'bold'
  },
  radiusBadge: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  radiusBadgeText: {
    color: '#bfdbfe',
    fontSize: 10,
    fontWeight: 'bold'
  },
  animalName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4
  },
  scientificName: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 10
  },
  narrationBox: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  narrationHeader: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4
  },
  narrationContent: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18
  },
  sectionHeader: {
    marginVertical: 10
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 'bold'
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  listItemActive: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b'
  },
  thumbImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10
  },
  listInfo: {
    flex: 1
  },
  listName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  listZone: {
    color: '#94a3b8',
    fontSize: 10
  },
  listDist: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2
  },
  listDistActive: {
    color: '#34d399',
    fontWeight: 'bold'
  },
  walkIcon: {
    fontSize: 18,
    marginLeft: 8
  },
  audioBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#10b981'
  },
  audioInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  nowPlayingLabel: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: 'bold'
  },
  nowPlayingTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    maxWidth: 240
  },
  playButton: {
    backgroundColor: '#10b981',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16
  },
  progressBarBg: {
    height: 3,
    backgroundColor: '#065f46',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34d399'
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3
  },
  timeText: {
    color: '#a7f3d0',
    fontSize: 9
  }
});
