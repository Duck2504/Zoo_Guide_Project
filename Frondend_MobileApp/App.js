import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';

import { INITIAL_ZOO_ANIMALS } from './src/data/animals';
import { 
  detectActiveGeofenceAnimal, 
  triggerHapticArrival,
  requestLocationPermissions,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking
} from './src/services/locationService';
import { fetchAnimalsFromBackend, DEFAULT_API_CONFIG } from './src/services/apiService';

import ExploreView from './src/components/ExploreView';
import MapView from './src/components/MapView';
import QrScannerView from './src/components/QrScannerView';
import PlayerView from './src/components/PlayerView';
import SettingsView from './src/components/SettingsView';
import MiniPlayer from './src/components/MiniPlayer';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState('explore'); // 'explore' | 'map' | 'qr' | 'player' | 'settings'

  // Data & Backend Sync State
  const [animals, setAnimals] = useState(INITIAL_ZOO_ANIMALS);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_CONFIG.baseUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Audio Playback & Multi-Language State
  const [activeAnimal, setActiveAnimal] = useState(INITIAL_ZOO_ANIMALS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLang, setSelectedLang] = useState('vi'); // 'vi' | 'en' | 'ja' | 'ko'
  const [isHandsFreeAutoPlay, setIsHandsFreeAutoPlay] = useState(true);
  const [isBackgroundTrackingEnabled, setIsBackgroundTrackingEnabled] = useState(false);

  // Location & Geofence State (Mặc định ở Cổng Nguyễn Bỉnh Khiêm)
  const [touristCoords, setTouristCoords] = useState({ lon: 106.7050, lat: 10.7865 });
  const [geofenceBanner, setGeofenceBanner] = useState(null);

  // Quản lý Audio Sound của Expo-AV
  const soundRef = useRef(null);
  const lastGeofenceIdRef = useRef(null);

  // Khởi tạo audio mode cho phép phát nền khi màn hình tắt / trong túi quần
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });
      } catch (err) {
        console.log('[AudioMode] Không thể thiết lập Audio Mode:', err);
      }
    })();

    // Tự động đồng bộ danh sách động vật từ API Backend khi khởi động
    handleSyncBackend();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Xử lý phát / dừng file âm thanh thật
  const handlePlaySound = async (animalToPlay = activeAnimal) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (!animalToPlay || !animalToPlay.audioUrl) {
        setIsPlaying(true);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: animalToPlay.audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      console.log('[Audio] Lỗi phát âm thanh URL:', err.message);
      setIsPlaying(true); // Fallback giữ UI phát
    }
  };

  const handlePauseSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
      setIsPlaying(false);
    } catch (err) {
      setIsPlaying(false);
    }
  };

  // Kích hoạt Geofence tự động khi du khách di chuyển vào vùng bán kính chuồng thú
  useEffect(() => {
    if (!touristCoords) return;

    const detected = detectActiveGeofenceAnimal(touristCoords, animals);
    if (detected) {
      const { animal, distance } = detected;
      
      // Nếu là chuồng mới bước vào (chưa kích hoạt trước đó)
      if (lastGeofenceIdRef.current !== animal.id) {
        lastGeofenceIdRef.current = animal.id;
        setActiveAnimal(animal);

        // 1. Rung thiết bị để báo hiệu qua túi quần
        triggerHapticArrival();

        // 2. Tự động phát thuyết minh nếu bật chế độ rảnh tay
        if (isHandsFreeAutoPlay) {
          handlePlaySound(animal);
        }
      }

      setGeofenceBanner({
        animalName: animal.name,
        distance,
        radius: animal.radius || 25
      });
    } else {
      setGeofenceBanner(null);
      lastGeofenceIdRef.current = null;
    }
  }, [touristCoords, animals, isHandsFreeAutoPlay]);

  // Bật / tắt cảm biến định vị nền GPS khi khách đút điện thoại vào túi quần
  const toggleBackgroundTracking = async () => {
    if (!isBackgroundTrackingEnabled) {
      const perm = await requestLocationPermissions();
      if (!perm.success) {
        Alert.alert('Cần quyền định vị', perm.message);
        return;
      }

      const started = await startBackgroundLocationTracking((newCoords) => {
        setTouristCoords(newCoords);
      });

      if (started) {
        setIsBackgroundTrackingEnabled(true);
        Alert.alert(
          'Đã kích hoạt định vị túi quần',
          'Ứng dụng sẽ tự động rung và thuyết minh khi bạn đi ngang qua chuồng thú kể cả khi tắt màn hình.'
        );
      }
    } else {
      await stopBackgroundLocationTracking();
      setIsBackgroundTrackingEnabled(false);
      Alert.alert('Đã tắt định vị nền', 'Chỉ định vị khi mở ứng dụng trên màn hình.');
    }
  };

  // Đồng bộ dữ liệu động vật từ API Backend
  const handleSyncBackend = async () => {
    if (isOfflineMode) return;

    setIsSyncing(true);
    setSyncStatusMessage('Đang kết nối API Backend...');

    try {
      const res = await fetchAnimalsFromBackend(apiUrl, selectedLang);
      if (res.success && res.data && res.data.length > 0) {
        setAnimals(res.data);
        if (!activeAnimal || !res.data.find(a => a.id === activeAnimal.id)) {
          setActiveAnimal(res.data[0]);
        }
        setSyncStatusMessage(res.message);
      }
    } catch (err) {
      setSyncStatusMessage('Lỗi kết nối máy chủ, dùng cache offline.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Khi chọn con vật từ danh sách hoặc bản đồ
  const handleSelectAnimal = (animal) => {
    setActiveAnimal(animal);
    setCurrentTab('player');
    handlePlaySound(animal);
  };

  // Khi quét mã QR thành công từ camera
  const handleScanSuccess = (animal) => {
    triggerHapticArrival();
    setActiveAnimal(animal);
    setCurrentTab('player');
    handlePlaySound(animal);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogo}>🐾</Text>
          <View>
            <Text style={styles.headerTitle}>THẢO CẦM VIÊN SÀI GÒN</Text>
            <Text style={styles.headerSubtitle}>THUYẾT MINH TỰ ĐỘNG ĐA NGÔN NGỮ (NATIVE APP)</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.bgStatusPill, isBackgroundTrackingEnabled && styles.bgStatusPillActive]}
          onPress={toggleBackgroundTracking}
        >
          <Text style={styles.bgStatusText}>
            {isBackgroundTrackingEnabled ? '📍 Túi Quần: Bật' : '📍 Túi Quần: Tắt'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Geofence Alert Banner */}
      {geofenceBanner && (
        <View style={styles.geofenceBanner}>
          <Text style={styles.geofenceIcon}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.geofenceTitle}>
              ĐÃ ĐẾN GẦN {geofenceBanner.animalName?.toUpperCase()}
            </Text>
            <Text style={styles.geofenceDesc}>
              Cách {geofenceBanner.distance}m (bán kính nhận diện {geofenceBanner.radius}m) • Tự động thuyết minh
            </Text>
          </View>
        </View>
      )}

      {/* Main View Container */}
      <View style={styles.contentContainer}>
        {currentTab === 'explore' && (
          <ExploreView
            animals={animals}
            touristCoords={touristCoords}
            activeAnimal={activeAnimal}
            isPlaying={isPlaying}
            onSelectAnimal={handleSelectAnimal}
            onPlayPause={() => {
              if (isPlaying) handlePauseSound();
              else handlePlaySound(activeAnimal);
            }}
          />
        )}

        {currentTab === 'map' && (
          <MapView
            animals={animals}
            touristCoords={touristCoords}
            onUpdateTouristCoords={setTouristCoords}
            onSelectAnimal={handleSelectAnimal}
          />
        )}

        {currentTab === 'qr' && (
          <QrScannerView
            animals={animals}
            onScanSuccess={handleScanSuccess}
          />
        )}

        {currentTab === 'player' && (
          <PlayerView
            animal={activeAnimal}
            isPlaying={isPlaying}
            selectedLang={selectedLang}
            onChangeLang={(lang) => {
              setSelectedLang(lang);
              handleSyncBackend();
            }}
            onPlayPause={() => {
              if (isPlaying) handlePauseSound();
              else handlePlaySound(activeAnimal);
            }}
            onPrevAnimal={() => {
              const idx = animals.findIndex(a => a.id === activeAnimal.id);
              const prev = animals[idx > 0 ? idx - 1 : animals.length - 1];
              handleSelectAnimal(prev);
            }}
            onNextAnimal={() => {
              const idx = animals.findIndex(a => a.id === activeAnimal.id);
              const next = animals[idx < animals.length - 1 ? idx + 1 : 0];
              handleSelectAnimal(next);
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            apiUrl={apiUrl}
            onChangeApiUrl={setApiUrl}
            onSyncBackend={handleSyncBackend}
            isSyncing={isSyncing}
            syncStatusMessage={syncStatusMessage}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
            isHandsFreeAutoPlay={isHandsFreeAutoPlay}
            onToggleHandsFree={() => setIsHandsFreeAutoPlay(!isHandsFreeAutoPlay)}
            isBackgroundTracking={isBackgroundTrackingEnabled}
            onToggleBackgroundTracking={toggleBackgroundTracking}
            selectedLang={selectedLang}
            onChangeLang={setSelectedLang}
          />
        )}
      </View>

      {/* Mini Player */}
      {currentTab !== 'player' && activeAnimal && (
        <MiniPlayer
          animal={activeAnimal}
          isPlaying={isPlaying}
          onPress={() => setCurrentTab('player')}
          onPlayPause={() => {
            if (isPlaying) handlePauseSound();
            else handlePlaySound(activeAnimal);
          }}
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'explore' && styles.navItemActive]}
          onPress={() => setCurrentTab('explore')}
        >
          <Text style={styles.navIcon}>🐾</Text>
          <Text style={[styles.navLabel, currentTab === 'explore' && styles.navLabelActive]}>Khám Phá</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'map' && styles.navItemActive]}
          onPress={() => setCurrentTab('map')}
        >
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={[styles.navLabel, currentTab === 'map' && styles.navLabelActive]}>Bản Đồ</Text>
        </TouchableOpacity>

        {/* Nút Quét Camera Nổi Bật Ở Giữa */}
        <TouchableOpacity
          style={styles.navQrSpecialBtn}
          onPress={() => setCurrentTab('qr')}
        >
          <View style={styles.navQrCircle}>
            <Text style={styles.navQrIcon}>📷</Text>
          </View>
          <Text style={[styles.navLabel, currentTab === 'qr' && styles.navLabelActive]}>Quét QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'player' && styles.navItemActive]}
          onPress={() => setCurrentTab('player')}
        >
          <Text style={styles.navIcon}>🎧</Text>
          <Text style={[styles.navLabel, currentTab === 'player' && styles.navLabelActive]}>Nghe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'settings' && styles.navItemActive]}
          onPress={() => setCurrentTab('settings')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={[styles.navLabel, currentTab === 'settings' && styles.navLabelActive]}>Cài Đặt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#047857'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerLogo: {
    fontSize: 22
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  headerSubtitle: {
    color: '#a7f3d0',
    fontSize: 9,
    fontWeight: '600'
  },
  bgStatusPill: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  bgStatusPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#34d399'
  },
  bgStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  geofenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065f46',
    borderBottomWidth: 1,
    borderBottomColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10
  },
  geofenceIcon: {
    fontSize: 18
  },
  geofenceTitle: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: 'bold'
  },
  geofenceDesc: {
    color: '#d1fae5',
    fontSize: 10
  },
  contentContainer: {
    flex: 1
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0c1220',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  navItemActive: {
    opacity: 1
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2
  },
  navLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600'
  },
  navLabelActive: {
    color: '#10b981',
    fontWeight: 'bold'
  },
  navQrSpecialBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -16
  },
  navQrCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 2
  },
  navQrIcon: {
    fontSize: 22
  }
});
