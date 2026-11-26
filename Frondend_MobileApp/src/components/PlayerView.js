import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { AVAILABLE_LANGUAGES } from '../data/animals';

const { width } = Dimensions.get('window');

export default function PlayerView({
  animal,
  isPlaying,
  onTogglePlay,
  selectedLang,
  onChangeLang,
  isHandsFreeAutoPlay,
  onToggleHandsFree,
  onNextAnimal,
  onPrevAnimal
}) {
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const totalDuration = animal?.audioDuration || 90;

  // Mô phỏng tiến trình phát âm thanh
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds(prev => {
          if (prev >= totalDuration) {
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Reset tiến trình khi đổi loài thú
  useEffect(() => {
    setPlaybackSeconds(0);
  }, [animal?.id]);

  if (!animal) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎧</Text>
        <Text style={styles.emptyText}>Chưa có loài thú nào được chọn</Text>
        <Text style={styles.emptySub}>Vui lòng chọn một loài thú từ màn hình Khám Phá hoặc Quét QR</Text>
      </View>
    );
  }

  // Format giây thành mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (playbackSeconds / totalDuration) * 100));

  // Lấy nội dung thuyết minh theo ngôn ngữ được chọn
  const narrationText = animal.description?.[selectedLang] || animal.description?.vi || 'Nội dung thuyết minh đang được cập nhật.';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Thuyết minh Thảo Cầm Viên: ${animal.name} (${animal.scientificName}) - ${animal.zone}. Nghe ngay trên App Zoo Guide!`,
        title: animal.name
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Animal Cover Artwork Card */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: animal.image }} style={styles.artworkImage} />
          <View style={styles.artworkGradient}>
            <View style={styles.artworkBadgeRow}>
              <View style={styles.zonePill}>
                <Text style={styles.zonePillText}>📍 {animal.zone}</Text>
              </View>
              {animal.iucnStatus ? (
                <View style={styles.iucnPill}>
                  <Text style={styles.iucnPillText}>🛡️ {animal.iucnStatus}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Title & Metadata */}
        <View style={styles.metaSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.animalName}>{animal.name}</Text>
              <Text style={styles.scientificName}>{animal.scientificName}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareIcon}>📤</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Biology Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>MÃ BIỂN QR</Text>
              <Text style={styles.specValue}>{animal.qrCode || animal.id}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>BÁN KÍNH GPS</Text>
              <Text style={styles.specValue}>{animal.radius || 25}m</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>TRỌNG LƯỢNG</Text>
              <Text style={styles.specValue} numberOfLines={1}>{animal.weight || 'Đang cập nhật'}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>TUỔI THỌ</Text>
              <Text style={styles.specValue} numberOfLines={1}>{animal.lifespan || 'Đang cập nhật'}</Text>
            </View>
          </View>
        </View>

        {/* 5-Language Selector Bar */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionHeading}>🌐 CHỌN NGÔN NGỮ THUYẾT MINH (5 THỨ TIẾNG):</Text>
          <View style={styles.langGrid}>
            {AVAILABLE_LANGUAGES.map(lang => {
              const isSelected = selectedLang === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  style={[styles.langChip, isSelected && styles.langChipActive]}
                  onPress={() => onChangeLang(lang.id)}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.langText, isSelected && styles.langTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Audio Waveform & Status Visualizer */}
        <View style={styles.visualizerCard}>
          <View style={styles.visualizerHeaderRow}>
            <View style={styles.audioStatusRow}>
              <View style={[styles.liveDot, isPlaying && styles.liveDotActive]} />
              <Text style={styles.audioStatusText}>
                {isPlaying ? 'ĐANG PHÁT GIỌNG ĐỌC AI' : 'ĐÃ TẠM DỪNG'}
              </Text>
            </View>
            <Text style={styles.langIndicator}>
              {selectedLang.toUpperCase()} AUDIO
            </Text>
          </View>

          {/* Equalizer Wave Bars Simulation */}
          <View style={styles.equalizerRow}>
            {[24, 45, 78, 55, 90, 40, 65, 80, 50, 70, 95, 60, 45, 85, 30, 75, 55, 65, 40].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.eqBar,
                  {
                    height: isPlaying ? Math.max(10, (h * ((playbackSeconds % 5 + 1) / 5))) : 12,
                    backgroundColor: isPlaying ? '#10b981' : '#334155'
                  }
                ]}
              />
            ))}
          </View>

          {/* Seekable Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          {/* Time Labels */}
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(playbackSeconds)}</Text>
            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
          </View>

          {/* Main Playback Controllers */}
          <View style={styles.controlsRow}>
            {/* Prev Animal */}
            <TouchableOpacity style={styles.sideBtn} onPress={onPrevAnimal}>
              <Text style={styles.sideBtnIcon}>⏮</Text>
            </TouchableOpacity>

            {/* Rewind 10s */}
            <TouchableOpacity
              style={styles.seekBtn}
              onPress={() => setPlaybackSeconds(prev => Math.max(0, prev - 10))}
            >
              <Text style={styles.seekBtnText}>-10s</Text>
            </TouchableOpacity>

            {/* Giant Play/Pause Button */}
            <TouchableOpacity
              style={[styles.playMasterBtn, isPlaying && styles.playMasterBtnActive]}
              onPress={onTogglePlay}
            >
              <Text style={styles.playMasterIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>

            {/* Fast-forward 10s */}
            <TouchableOpacity
              style={styles.seekBtn}
              onPress={() => setPlaybackSeconds(prev => Math.min(totalDuration, prev + 10))}
            >
              <Text style={styles.seekBtnText}>+10s</Text>
            </TouchableOpacity>

            {/* Next Animal */}
            <TouchableOpacity style={styles.sideBtn} onPress={onNextAnimal}>
              <Text style={styles.sideBtnIcon}>⏭</Text>
            </TouchableOpacity>
          </View>

          {/* Hands-Free Auto Geofence Switch */}
          <View style={styles.handsFreeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.handsFreeTitle}>Tự động phát khi đến gần (Hands-free)</Text>
              <Text style={styles.handsFreeDesc}>Phát bài thuyết minh ngay khi bước vào Geofence chuồng thú</Text>
            </View>
            <Switch
              value={isHandsFreeAutoPlay}
              onValueChange={onToggleHandsFree}
              thumbColor={isHandsFreeAutoPlay ? '#10b981' : '#64748b'}
              trackColor={{ false: '#334155', true: '#064e3b' }}
            />
          </View>
        </View>

        {/* Full Narration Script Transcript */}
        <View style={styles.transcriptCard}>
          <View style={styles.transcriptHeaderRow}>
            <Text style={styles.transcriptTitle}>📜 BÀI THUYẾT MINH CHÍNH THỨC</Text>
            <TouchableOpacity
              style={styles.ttsButton}
              onPress={() => {
                onTogglePlay();
                Alert.alert('Thuyết Minh', `Đang đọc bài thuyết minh loài ${animal.name} (${selectedLang.toUpperCase()}).`);
              }}
            >
              <Text style={styles.ttsButtonText}>🔊 Đọc To</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.transcriptBody}>{narrationText}</Text>
        </View>

        {/* Diet & Care Notes */}
        <View style={styles.dietCard}>
          <Text style={styles.dietTitle}>🍃 Chế độ dinh dưỡng & Chăm sóc:</Text>
          <Text style={styles.dietBody}>{animal.diet || 'Được nuôi dưỡng theo tiêu chuẩn quốc tế tại Thảo Cầm Viên Sài Gòn.'}</Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16'
  },
  scrollContent: {
    padding: 14
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 12
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center'
  },
  artworkContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0f172a',
    marginBottom: 14
  },
  artworkImage: {
    width: '100%',
    height: '100%'
  },
  artworkGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.65)'
  },
  artworkBadgeRow: {
    flexDirection: 'row',
    gap: 8
  },
  zonePill: {
    backgroundColor: 'rgba(6, 78, 59, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  zonePillText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: 'bold'
  },
  iucnPill: {
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  iucnPillText: {
    color: '#fee2e2',
    fontSize: 10,
    fontWeight: 'bold'
  },
  metaSection: {
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  animalName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  scientificName: {
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2
  },
  shareBtn: {
    backgroundColor: '#1e293b',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  shareIcon: {
    fontSize: 16
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  specBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a2438',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24324d'
  },
  specLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2
  },
  specValue: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 'bold'
  },
  languageSection: {
    marginBottom: 14
  },
  sectionHeading: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b2c',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2b42',
    gap: 5
  },
  langChipActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981'
  },
  langFlag: {
    fontSize: 14
  },
  langText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  langTextActive: {
    color: '#34d399',
    fontWeight: 'bold'
  },
  visualizerCard: {
    backgroundColor: '#131b2c',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  visualizerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  audioStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748b'
  },
  liveDotActive: {
    backgroundColor: '#10b981'
  },
  audioStatusText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  langIndicator: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#064e3b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 40,
    marginBottom: 14,
    paddingHorizontal: 10
  },
  eqBar: {
    width: 4,
    borderRadius: 2
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981'
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  timeText: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace'
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 14
  },
  sideBtn: {
    padding: 8
  },
  sideBtnIcon: {
    color: '#94a3b8',
    fontSize: 20
  },
  seekBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  seekBtnText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: 'bold'
  },
  playMasterBtn: {
    backgroundColor: '#059669',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6
  },
  playMasterBtnActive: {
    backgroundColor: '#d97706'
  },
  playMasterIcon: {
    color: '#ffffff',
    fontSize: 24
  },
  handsFreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  handsFreeTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  handsFreeDesc: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 1
  },
  transcriptCard: {
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  transcriptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  transcriptTitle: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: 'bold'
  },
  ttsButton: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  ttsButtonText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: 'bold'
  },
  transcriptBody: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 22
  },
  dietCard: {
    backgroundColor: '#0f1d24',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#164e63'
  },
  dietTitle: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4
  },
  dietBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 18
  }
});
