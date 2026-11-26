import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image
} from 'react-native';

export default function MiniPlayer({
  animal,
  isPlaying,
  onTogglePlay,
  onOpenPlayer,
  selectedLang
}) {
  if (!animal) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.contentTouch}
        activeOpacity={0.9}
        onPress={onOpenPlayer}
      >
        <Image source={{ uri: animal.image }} style={styles.thumbImage} />
        
        <View style={styles.infoCol}>
          <View style={styles.badgeRow}>
            <Text style={styles.playingLabel}>
              {isPlaying ? '🔊 ĐANG PHÁT THUYẾT MINH' : '⏸ ĐÃ TẠM DỪNG'}
            </Text>
            <Text style={styles.langTag}>{selectedLang.toUpperCase()}</Text>
          </View>
          <Text style={styles.animalName} numberOfLines={1}>
            {animal.name}
          </Text>
          <Text style={styles.zoneName} numberOfLines={1}>
            {animal.zone}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.playBtn, isPlaying && styles.playBtnActive]}
        onPress={onTogglePlay}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 58,
    left: 10,
    right: 10,
    backgroundColor: '#0c2725',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 99
  },
  contentTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10
  },
  infoCol: {
    flex: 1,
    marginRight: 8
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 1
  },
  playingLabel: {
    color: '#34d399',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.3
  },
  langTag: {
    color: '#a7f3d0',
    fontSize: 8,
    fontWeight: 'bold',
    backgroundColor: '#064e3b',
    paddingHorizontal: 4,
    borderRadius: 3
  },
  animalName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  zoneName: {
    color: '#94a3b8',
    fontSize: 10
  },
  playBtn: {
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4
  },
  playBtnActive: {
    backgroundColor: '#d97706'
  },
  playIcon: {
    color: '#ffffff',
    fontSize: 16
  }
});
