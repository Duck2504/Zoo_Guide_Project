import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert
} from 'react-native';
import { SIMULATION_TOUR_STOPS } from '../services/locationService';

export default function SettingsView({
  isOfflineMode,
  onToggleOffline,
  touristCoords,
  onSelectSimulationStop,
  apiUrl,
  onChangeApiUrl,
  onSyncBackend,
  isSyncing,
  syncStatusMessage
}) {
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  const handleSaveApi = () => {
    onChangeApiUrl(tempUrl);
    Alert.alert('Thành công', 'Đã lưu cấu hình địa chỉ máy chủ API.');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Offline Mode Box */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Chế độ Ngoại Tuyến (Offline Mode)</Text>
              <Text style={styles.settingDesc}>
                Phát âm thanh và dữ liệu từ bộ nhớ đệm máy để tiết kiệm dữ liệu 4G bên trong Thảo Cầm Viên
              </Text>
            </View>
            <Switch
              value={isOfflineMode}
              onValueChange={onToggleOffline}
              thumbColor={isOfflineMode ? '#10b981' : '#64748b'}
              trackColor={{ false: '#334155', true: '#064e3b' }}
            />
          </View>
        </View>

        {/* GPS Walkthrough Tour Simulation Section */}
        <View style={styles.settingCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🚶 MÔ PHỎNG TOUR BƯỚC CHÂN (GPS SIMULATION)</Text>
            <View style={styles.gpsPill}>
              <Text style={styles.gpsPillText}>
                {touristCoords ? `${touristCoords.lat.toFixed(4)}, ${touristCoords.lon.toFixed(4)}` : 'N/A'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Dành cho giảng viên, hội đồng chấm và du khách trải nghiệm tour đi dạo ảo quanh Thảo Cầm Viên để kiểm thử việc kích hoạt Geofence tự động.
          </Text>

          {/* List of 9 Simulation Stops */}
          <View style={styles.stopsList}>
            {SIMULATION_TOUR_STOPS.map(stop => {
              const isCurrent = touristCoords &&
                Math.abs(touristCoords.lon - stop.coords.lon) < 0.0001 &&
                Math.abs(touristCoords.lat - stop.coords.lat) < 0.0001;

              return (
                <TouchableOpacity
                  key={stop.step}
                  style={[styles.stopItem, isCurrent && styles.stopItemActive]}
                  onPress={() => onSelectSimulationStop(stop)}
                >
                  <View style={[styles.stepBadge, isCurrent && styles.stepBadgeActive]}>
                    <Text style={[styles.stepBadgeText, isCurrent && styles.stepBadgeTextActive]}>
                      {stop.step}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stopTitle}>{stop.title}</Text>
                    <Text style={styles.stopSub}>{stop.subtitle}</Text>
                  </View>
                  <Text style={styles.stopAction}>
                    {isCurrent ? '🎯 Đang đứng đây' : 'Bước đến 👉'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Backend API & Database Sync Section */}
        <View style={styles.settingCard}>
          <Text style={styles.cardTitle}>🔌 KẾT NỐI API MÁY CHỦ & CSDL</Text>
          <Text style={styles.cardDesc}>
            Cấu hình địa chỉ API Backend ASP.NET Core để đồng bộ danh sách loài thú mới từ cổng quản trị.
          </Text>

          <View style={styles.apiInputRow}>
            <TextInput
              style={styles.apiInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://localhost:5222/api..."
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.saveApiBtn} onPress={handleSaveApi}>
              <Text style={styles.saveApiBtnText}>Lưu</Text>
            </TouchableOpacity>
          </View>

          {/* Sync Trigger Button */}
          <TouchableOpacity
            style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
            disabled={isSyncing}
            onPress={onSyncBackend}
          >
            <Text style={styles.syncBtnIcon}>{isSyncing ? '⏳' : '🔄'}</Text>
            <Text style={styles.syncBtnText}>
              {isSyncing ? 'Đang Đồng Bộ Dữ Liệu...' : 'Đồng Bộ Từ Database / API'}
            </Text>
          </TouchableOpacity>

          {syncStatusMessage ? (
            <View style={styles.syncStatusBox}>
              <Text style={styles.syncStatusText}>{syncStatusMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* Zoo About Info Card */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>🏛️ THẢO CẦM VIÊN SÀI GÒN (1864)</Text>
          <Text style={styles.aboutBody}>
            Được thành lập từ năm 1864, Thảo Cầm Viên Sài Gòn là một trong 8 vườn thú - bách thảo cổ xưa nhất trên thế giới. Nơi đây bảo tồn hơn 1.300 cá thể động vật quý hiếm cùng hơn 2.500 cây xanh di sản lâu đời.
          </Text>
          <View style={styles.aboutMetaRow}>
            <Text style={styles.aboutMetaItem}>📍 Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1</Text>
            <Text style={styles.aboutMetaItem}>⏰ Mở cửa: 07:00 – 18:30 hàng ngày</Text>
            <Text style={styles.aboutMetaItem}>📞 Hotline du khách: (028) 3829 1425</Text>
          </View>
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
  settingCard: {
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2
  },
  settingDesc: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 15
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 12
  },
  gpsPill: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  gpsPillText: {
    color: '#6ee7b7',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  stopsList: {
    gap: 8
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2438',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#24324d',
    gap: 10
  },
  stopItemActive: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b'
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  stepBadgeActive: {
    backgroundColor: '#10b981',
    borderColor: '#34d399'
  },
  stepBadgeText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold'
  },
  stepBadgeTextActive: {
    color: '#ffffff'
  },
  stopTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  stopSub: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 1
  },
  stopAction: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: 'bold'
  },
  apiInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  apiInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontFamily: 'monospace'
  },
  saveApiBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  saveApiBtnText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: 'bold'
  },
  syncBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  syncBtnDisabled: {
    backgroundColor: '#334155'
  },
  syncBtnIcon: {
    fontSize: 14
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  syncStatusBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0f2425',
    borderWidth: 1,
    borderColor: '#065f46'
  },
  syncStatusText: {
    color: '#34d399',
    fontSize: 10,
    textAlign: 'center'
  },
  aboutCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  aboutTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6
  },
  aboutBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 10
  },
  aboutMetaRow: {
    gap: 4
  },
  aboutMetaItem: {
    color: '#64748b',
    fontSize: 10
  }
});
