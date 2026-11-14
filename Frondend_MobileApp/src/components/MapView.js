import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { getHaversineDistance } from '../services/locationService';

const { width } = Dimensions.get('window');

export default function MapView({
  animals = [],
  touristCoords,
  onUpdateCoords,
  onSelectAnimal,
  onPlayAnimal,
  activeAnimal
}) {
  const [mapMode, setMapMode] = useState('radar'); // 'radar' | 'zones'
  const [selectedPin, setSelectedPin] = useState(activeAnimal || animals[0] || null);

  // Tính toán khoảng cách và góc phương vị của các loài thú so với du khách
  const radarAnimals = animals.map(item => {
    const dist = touristCoords && item.coords
      ? getHaversineDistance(touristCoords.lon, touristCoords.lat, item.coords.lon, item.coords.lat)
      : 999;
    const isInside = dist <= (item.radius || 25);

    // Tính góc lệch vị trí relative (độ chênh lệch kinh độ & vĩ độ)
    const dx = ((item.coords?.lon || 106.7055) - (touristCoords?.lon || 106.7055)) * 100000;
    const dy = ((item.coords?.lat || 10.7873) - (touristCoords?.lat || 10.7873)) * 100000;

    return {
      ...item,
      dist,
      isInside,
      dx,
      dy
    };
  });

  return (
    <View style={styles.container}>
      {/* Top Map Mode Switcher & Stats */}
      <View style={styles.topControlBar}>
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTab, mapMode === 'radar' && styles.modeTabActive]}
            onPress={() => setMapMode('radar')}
          >
            <Text style={[styles.modeTabText, mapMode === 'radar' && styles.modeTabTextActive]}>
              📡 Radar Geofence
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mapMode === 'zones' && styles.modeTabActive]}
            onPress={() => setMapMode('zones')}
          >
            <Text style={[styles.modeTabText, mapMode === 'zones' && styles.modeTabTextActive]}>
              🗺️ Sơ Đồ Phân Khu
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusDot}>🟢</Text>
          <Text style={styles.statusPillText}>
            GPS: {touristCoords ? `${touristCoords.lat.toFixed(4)}, ${touristCoords.lon.toFixed(4)}` : 'Đang tìm...'}
          </Text>
        </View>
      </View>

      {/* Main Map Content Area */}
      <View style={styles.mapCanvas}>
        {mapMode === 'radar' ? (
          /* RADAR GEOFENCE SCANNER VIEW */
          <View style={styles.radarContainer}>
            {/* Radar Wave Rings */}
            <View style={[styles.radarRing, styles.ring200]}>
              <Text style={styles.ringLabel}>200m</Text>
            </View>
            <View style={[styles.radarRing, styles.ring150]}>
              <Text style={styles.ringLabel}>150m</Text>
            </View>
            <View style={[styles.radarRing, styles.ring100]}>
              <Text style={styles.ringLabel}>100m</Text>
            </View>
            <View style={[styles.radarRing, styles.ring50]}>
              <Text style={styles.ringLabel}>50m</Text>
            </View>

            {/* Crosshairs */}
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />

            {/* Tourist Location Center Marker */}
            <View style={styles.touristPin}>
              <View style={styles.touristPulse} />
              <View style={styles.touristDot} />
              <Text style={styles.touristLabel}>Bạn ở đây</Text>
            </View>

            {/* Animal Blips on Radar */}
            {radarAnimals.map((item, index) => {
              // Chuẩn hóa tọa độ offset để vẽ vừa vặn trong vòng tròn radar 280px
              const maxOffset = 130;
              const scale = 1.2;
              const clampX = Math.max(-maxOffset, Math.min(maxOffset, item.dx * scale));
              const clampY = Math.max(-maxOffset, Math.min(maxOffset, -item.dy * scale));
              const isSelected = selectedPin && selectedPin.id === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.radarBlip,
                    {
                      transform: [
                        { translateX: clampX },
                        { translateY: clampY }
                      ]
                    },
                    item.isInside && styles.radarBlipInside,
                    isSelected && styles.radarBlipSelected
                  ]}
                  onPress={() => setSelectedPin(item)}
                >
                  <Text style={styles.blipEmoji}>
                    {item.isInside ? '🔊' : '🐾'}
                  </Text>
                  <View style={[styles.blipNameTag, isSelected && styles.blipNameTagSelected]}>
                    <Text style={styles.blipNameText} numberOfLines={1}>
                      {item.name} ({item.dist}m)
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* ZOO ZONES SCHEMATIC VIEW */
          <ScrollView style={styles.zonesScroll} contentContainerStyle={styles.zonesScrollContent}>
            <View style={styles.zonesCard}>
              <Text style={styles.zonesCardTitle}>🏛️ SƠ ĐỒ CÁC PHÂN KHU THẢO CẦM VIÊN</Text>
              <Text style={styles.zonesCardSubtitle}>
                Chạm vào bất kỳ chuồng thú nào để định vị bước chân GPS và kích hoạt bài thuyết minh
              </Text>

              <View style={styles.pinsGrid}>
                {radarAnimals.map(item => {
                  const isSelected = selectedPin && selectedPin.id === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pinGridItem,
                        isSelected && styles.pinGridItemSelected,
                        item.isInside && styles.pinGridItemInside
                      ]}
                      onPress={() => {
                        setSelectedPin(item);
                        onUpdateCoords({ lon: item.coords.lon, lat: item.coords.lat });
                      }}
                    >
                      <Image source={{ uri: item.image }} style={styles.pinGridThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pinGridName}>{item.name}</Text>
                        <Text style={styles.pinGridZone} numberOfLines={1}>{item.zone}</Text>
                        <Text style={[styles.pinGridDist, item.isInside && styles.pinGridDistInside]}>
                          {item.isInside ? `🎯 ĐANG Ở ĐÂY (${item.dist}m)` : `Cự ly: ${item.dist}m`}
                        </Text>
                      </View>
                      <Text style={styles.pinGridArrow}>{item.isInside ? '🔊' : '📍'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Selected Animal Place Card Bottom Drawer */}
      {selectedPin ? (
        <View style={styles.placeCard}>
          <Image source={{ uri: selectedPin.image }} style={styles.placeImage} />
          <View style={styles.placeInfo}>
            <View style={styles.placeHeaderRow}>
              <Text style={styles.placeTitle}>{selectedPin.name}</Text>
              <View style={[styles.placeRadiusBadge, selectedPin.dist <= selectedPin.radius && styles.placeRadiusInside]}>
                <Text style={styles.placeRadiusText}>
                  {selectedPin.dist <= selectedPin.radius
                    ? `🎯 ${selectedPin.dist}m (Trong bán kính ${selectedPin.radius}m)`
                    : `Khoảng cách: ${selectedPin.dist}m`}
                </Text>
              </View>
            </View>
            <Text style={styles.placeScientific}>{selectedPin.scientificName}</Text>
            <Text style={styles.placeZone} numberOfLines={1}>📍 {selectedPin.zone}</Text>

            {/* Quick Action Buttons */}
            <View style={styles.placeActionsRow}>
              <TouchableOpacity
                style={styles.walkToBtn}
                onPress={() => {
                  if (selectedPin.coords) {
                    onUpdateCoords({ lon: selectedPin.coords.lon, lat: selectedPin.coords.lat });
                  }
                }}
              >
                <Text style={styles.walkToBtnText}>🚶 Bước Đến Đây</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPlaceBtn}
                onPress={() => {
                  onSelectAnimal(selectedPin);
                  onPlayAnimal(selectedPin);
                }}
              >
                <Text style={styles.playPlaceBtnText}>🔊 Nghe Thuyết Minh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      <View style={{ height: 90 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16'
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 3,
    gap: 4
  },
  modeTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  modeTabActive: {
    backgroundColor: '#059669'
  },
  modeTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  modeTabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b2c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 5
  },
  statusDot: {
    fontSize: 8
  },
  statusPillText: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace'
  },
  mapCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070b14',
    position: 'relative',
    overflow: 'hidden'
  },
  radarContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  radarRing: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  ring200: {
    width: 280,
    height: 280,
    borderColor: 'rgba(16, 185, 129, 0.2)'
  },
  ring150: {
    width: 210,
    height: 210,
    borderColor: 'rgba(16, 185, 129, 0.25)'
  },
  ring100: {
    width: 140,
    height: 140,
    borderColor: 'rgba(16, 185, 129, 0.35)'
  },
  ring50: {
    width: 70,
    height: 70,
    borderColor: 'rgba(16, 185, 129, 0.5)'
  },
  ringLabel: {
    color: '#059669',
    fontSize: 8,
    backgroundColor: '#070b14',
    paddingHorizontal: 4,
    marginTop: -6
  },
  crosshairH: {
    position: 'absolute',
    width: 280,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  crosshairV: {
    position: 'absolute',
    height: 280,
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  touristPin: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  touristPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.35)'
  },
  touristDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  touristLabel: {
    color: '#93c5fd',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2
  },
  radarBlip: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5
  },
  radarBlipInside: {
    zIndex: 8
  },
  radarBlipSelected: {
    zIndex: 9
  },
  blipEmoji: {
    fontSize: 14
  },
  blipNameTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 2,
    maxWidth: 90
  },
  blipNameTagSelected: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b'
  },
  blipNameText: {
    color: '#e2e8f0',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  zonesScroll: {
    flex: 1,
    width: '100%'
  },
  zonesScrollContent: {
    padding: 14
  },
  zonesCard: {
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  zonesCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4
  },
  zonesCardSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 12
  },
  pinsGrid: {
    gap: 8
  },
  pinGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2438',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#24324d',
    gap: 10
  },
  pinGridItemSelected: {
    borderColor: '#059669',
    backgroundColor: '#0c2725'
  },
  pinGridItemInside: {
    borderColor: '#10b981',
    borderWidth: 2
  },
  pinGridThumb: {
    width: 44,
    height: 44,
    borderRadius: 8
  },
  pinGridName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  pinGridZone: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 1
  },
  pinGridDist: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2
  },
  pinGridDistInside: {
    color: '#34d399',
    fontWeight: 'bold'
  },
  pinGridArrow: {
    fontSize: 16
  },
  placeCard: {
    position: 'absolute',
    bottom: 95,
    left: 12,
    right: 12,
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#24324d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20
  },
  placeImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 10
  },
  placeInfo: {
    flex: 1
  },
  placeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  placeTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1
  },
  placeRadiusBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  placeRadiusInside: {
    backgroundColor: '#065f46'
  },
  placeRadiusText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: 'bold'
  },
  placeScientific: {
    color: '#94a3b8',
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 2
  },
  placeZone: {
    color: '#cbd5e1',
    fontSize: 10,
    marginBottom: 8
  },
  placeActionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  walkToBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  walkToBtnText: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: 'bold'
  },
  playPlaceBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center'
  },
  playPlaceBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  }
});
