import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { ZOO_ZONES } from '../data/animals';
import { getHaversineDistance } from '../services/locationService';

const { width } = Dimensions.get('window');

export default function ExploreView({
  animals = [],
  touristCoords,
  onSelectAnimal,
  onPlayAnimal,
  activeAnimalId,
  isPlaying,
  onGoToMap
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  // Lọc danh sách động vật theo thanh tìm kiếm và phân khu
  const filteredAnimals = animals.filter(animal => {
    const matchesZone = selectedZone === 'all' || animal.zoneId === selectedZone;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesZone;

    const matchesName = (animal.name || '').toLowerCase().includes(q);
    const matchesSci = (animal.scientificName || '').toLowerCase().includes(q);
    const matchesZoneName = (animal.zone || '').toLowerCase().includes(q);
    const matchesQr = (animal.qrCode || '').toLowerCase().includes(q);

    return matchesZone && (matchesName || matchesSci || matchesZoneName || matchesQr);
  });

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên loài thú, phân khu, mã QR..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Horizontal Zone Filter Chips */}
      <View style={styles.zoneScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zoneScrollContent}
        >
          {ZOO_ZONES.map(zone => {
            const isSelected = selectedZone === zone.id;
            return (
              <TouchableOpacity
                key={zone.id}
                style={[styles.zoneChip, isSelected && styles.zoneChipActive]}
                onPress={() => setSelectedZone(zone.id)}
              >
                <Text style={styles.zoneChipIcon}>{zone.icon}</Text>
                <Text style={[styles.zoneChipText, isSelected && styles.zoneChipTextActive]}>
                  {zone.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Result Count Header */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          Hiển thị <Text style={styles.countHighlight}>{filteredAnimals.length}</Text> loài thú
        </Text>
        <TouchableOpacity style={styles.mapShortcutBtn} onPress={onGoToMap}>
          <Text style={styles.mapShortcutText}>🗺️ Xem Bản Đồ</Text>
        </TouchableOpacity>
      </View>

      {/* Animals Card List */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAnimals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy loài thú phù hợp</Text>
            <Text style={styles.emptySubtitle}>Thử tìm với từ khóa khác hoặc chuyển sang phân khu khác</Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedZone('all');
              }}
            >
              <Text style={styles.resetFilterText}>Xem tất cả các loài</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAnimals.map(item => {
            const dist = touristCoords && item.coords
              ? getHaversineDistance(touristCoords.lon, touristCoords.lat, item.coords.lon, item.coords.lat)
              : null;
            const isInside = dist !== null && dist <= (item.radius || 25);
            const isCurrentlyActive = activeAnimalId === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.animalCard,
                  isCurrentlyActive && styles.animalCardActive,
                  isInside && styles.animalCardInside
                ]}
                activeOpacity={0.88}
                onPress={() => onSelectAnimal(item)}
              >
                {/* Animal Thumbnail Image */}
                <View style={styles.cardImageWrapper}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                  
                  {/* Status Overlay Badges */}
                  <View style={styles.imageBadgeTopRow}>
                    <View style={styles.qrBadge}>
                      <Text style={styles.qrBadgeText}>🏷️ {item.qrCode}</Text>
                    </View>
                    {item.iucnStatus ? (
                      <View style={styles.iucnBadge}>
                        <Text style={styles.iucnBadgeText}>{item.iucnStatus}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Geofence Alert Strip */}
                  {isInside ? (
                    <View style={styles.insideBanner}>
                      <Text style={styles.insideBannerText}>🎯 BẠN ĐANG TRONG KHU VỰC ({dist}m)</Text>
                    </View>
                  ) : null}
                </View>

                {/* Card Content Information */}
                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.animalName}>{item.name}</Text>
                      <Text style={styles.scientificName}>{item.scientificName}</Text>
                    </View>
                  </View>

                  <Text style={styles.zoneName} numberOfLines={1}>
                    📍 {item.zone}
                  </Text>

                  {/* Distance and Geofence Info */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>
                        🎯 Bán kính: {item.radius}m
                      </Text>
                    </View>
                    {dist !== null ? (
                      <View style={[styles.distBadge, isInside && styles.distBadgeActive]}>
                        <Text style={[styles.distBadgeText, isInside && styles.distBadgeTextActive]}>
                          {isInside ? `🔊 Ở rất gần (${dist}m)` : `🚶 Cách ${dist}m`}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Actions Row */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => onSelectAnimal(item)}
                    >
                      <Text style={styles.detailBtnText}>Chi Tiết Thuyết Minh</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.playBtn,
                        isCurrentlyActive && isPlaying && styles.playBtnPlaying
                      ]}
                      onPress={() => onPlayAnimal(item)}
                    >
                      <Text style={styles.playBtnIcon}>
                        {isCurrentlyActive && isPlaying ? '⏸' : '▶'}
                      </Text>
                      <Text style={styles.playBtnText}>
                        {isCurrentlyActive && isPlaying ? 'Tạm Dừng' : 'Phát Audio'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  searchSection: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161f30',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#24324d'
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    paddingVertical: 0
  },
  clearBtn: {
    padding: 4
  },
  clearBtnText: {
    color: '#94a3b8',
    fontSize: 14
  },
  zoneScrollWrapper: {
    marginBottom: 6
  },
  zoneScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
    paddingVertical: 4
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161f30',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#24324d',
    gap: 5
  },
  zoneChipActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981'
  },
  zoneChipIcon: {
    fontSize: 13
  },
  zoneChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500'
  },
  zoneChipTextActive: {
    color: '#34d399',
    fontWeight: 'bold'
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  countText: {
    color: '#94a3b8',
    fontSize: 12
  },
  countHighlight: {
    color: '#34d399',
    fontWeight: 'bold'
  },
  mapShortcutBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  mapShortcutText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: 'bold'
  },
  listScroll: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 4
  },
  animalCard: {
    backgroundColor: '#131b2c',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2b42',
    overflow: 'hidden'
  },
  animalCardActive: {
    borderColor: '#059669',
    backgroundColor: '#0f2425'
  },
  animalCardInside: {
    borderColor: '#10b981',
    borderWidth: 2
  },
  cardImageWrapper: {
    width: '100%',
    height: 170,
    position: 'relative',
    backgroundColor: '#0b1120'
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  imageBadgeTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  qrBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  qrBadgeText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: 'bold'
  },
  iucnBadge: {
    backgroundColor: 'rgba(185, 28, 28, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  iucnBadgeText: {
    color: '#fee2e2',
    fontSize: 10,
    fontWeight: 'bold'
  },
  insideBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(6, 95, 70, 0.92)',
    paddingVertical: 5,
    alignItems: 'center'
  },
  insideBannerText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  cardBody: {
    padding: 12
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  animalName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold'
  },
  scientificName: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 1
  },
  zoneName: {
    color: '#cbd5e1',
    fontSize: 11,
    marginBottom: 8
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  metaBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  metaBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600'
  },
  distBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  distBadgeActive: {
    backgroundColor: '#065f46'
  },
  distBadgeText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '600'
  },
  distBadgeTextActive: {
    color: '#6ee7b7',
    fontWeight: 'bold'
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2
  },
  detailBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  detailBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600'
  },
  playBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  playBtnPlaying: {
    backgroundColor: '#d97706'
  },
  playBtnIcon: {
    color: '#ffffff',
    fontSize: 12
  },
  playBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center'
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16
  },
  resetFilterBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  resetFilterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  }
});
