import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform
} from 'react-native';
import { Camera } from 'expo-camera';

export default function QrScannerView({
  animals = [],
  onScanSuccess
}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera?.Constants?.FlashMode?.off || 'off');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [manualCode, setManualCode] = useState('');

  // Yêu cầu quyền truy cập Camera phần cứng
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (err) {
        console.log('[Camera] Không thể yêu cầu quyền camera (có thể đang chạy Web/Simulator):', err);
        setHasPermission(false);
      }
    })();
  }, []);

  // Xử lý chuỗi mã QR sau khi quét
  const handleProcessCode = (code) => {
    if (!code || !code.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập hoặc quét mã QR chuồng thú.');
      return;
    }

    const raw = code.trim();
    // Bóc tách nếu là link web dạng https://.../a/1
    let extractedId = raw;
    const urlMatch = raw.match(/\/a\/(\d+)/i);
    if (urlMatch && urlMatch[1]) {
      extractedId = urlMatch[1];
    }

    const clean = extractedId.toUpperCase();
    const matched = animals.find(a => 
      (a.id && String(a.id).toUpperCase() === clean) ||
      (a.qrCode && a.qrCode.toUpperCase() === clean) ||
      (a.name && a.name.toUpperCase().includes(clean)) ||
      (clean.includes(String(a.id)))
    );

    if (matched) {
      setScanned(true);
      onScanSuccess(matched);
    } else {
      Alert.alert(
        'Không tìm thấy biển bảng',
        `Mã "${raw}" không khớp với loài thú nào tại Thảo Cầm Viên. Vui lòng quét lại biển gắn tại chuồng.`
      );
    }
  };

  // Callback quét mã Barcode/QR từ Camera Native
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    handleProcessCode(data);
  };

  const toggleFlash = () => {
    setFlashMode(prev => (prev === 'on' || prev === 2 ? 'off' : 'on'));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Instructions */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>📷 QUÉT MÃ QR NATIVE TẠI CHUỒNG THÚ</Text>
          <Text style={styles.headerSubtitle}>
            Tận dụng Camera phần cứng thiết bị để quét tức thì mã QR in trên biển bảng chuồng thú
          </Text>
        </View>

        {/* Khung Camera Quét Mã Thực Tế */}
        <View style={styles.scannerWrapper}>
          {hasPermission && isCameraActive ? (
            <View style={styles.cameraBox}>
              <Camera
                style={StyleSheet.absoluteFillObject}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                flashMode={flashMode}
                ratio="1:1"
              />
              {/* Overlay khung quét & tia laser */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.laserLine} />
              
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
                  <Text style={styles.flashButtonText}>
                    {flashMode === 'on' || flashMode === 2 ? '⚡ Tắt Đèn Flash' : '💡 Bật Đèn Flash'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Khung mô phỏng khi không có quyền Camera hoặc chạy trên máy ảo
            <View style={styles.cameraFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.laserLine} />
              <Text style={styles.qrCenterIcon}>📷</Text>
              <Text style={styles.scannerHint}>
                {hasPermission === false 
                  ? 'Chưa cấp quyền Camera thiết bị' 
                  : 'Đang kết nối cảm biến Camera...'}
              </Text>
            </View>
          )}

          {scanned && (
            <TouchableOpacity 
              style={styles.rescanBtn} 
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanBtnText}>🔄 Chạm để quét lại mã khác</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Nhập mã thủ công khi biển bị mờ/trầy xước */}
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Hoặc nhập mã số chuồng thú:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="VD: 1, 2 hoặc TCV-ANIMAL-01..."
              placeholderTextColor="#64748b"
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => handleProcessCode(manualCode)}
            >
              <Text style={styles.submitBtnText}>Xác Nhận</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách biển bảng để thử nghiệm nhanh */}
        <View style={styles.presetSection}>
          <View style={styles.presetHeaderRow}>
            <Text style={styles.presetTitle}>🎯 DANH SÁCH BIỂN BẢNG TẠI THẢO CẦM VIÊN</Text>
            <Text style={styles.presetSubtitle}>Chạm vào một biển để mở bài thuyết minh</Text>
          </View>

          <View style={styles.presetGrid}>
            {animals.slice(0, 8).map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.presetCard}
                onPress={() => handleProcessCode(String(item.id))}
              >
                <Image source={{ uri: item.image }} style={styles.presetThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.presetName}>{item.name}</Text>
                  <Text style={styles.presetCode}>Mã: {item.qrCode || `ID #${item.id}`}</Text>
                  <Text style={styles.presetZone} numberOfLines={1}>{item.zone}</Text>
                </View>
                <View style={styles.scanActionBadge}>
                  <Text style={styles.scanActionText}>Nghe</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  headerBox: {
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16
  },
  scannerWrapper: {
    alignItems: 'center',
    marginBottom: 16
  },
  cameraBox: {
    width: 260,
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000'
  },
  cameraFrame: {
    width: 260,
    height: 260,
    backgroundColor: '#070b14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#10b981',
    zIndex: 10
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3
  },
  laserLine: {
    position: 'absolute',
    top: '48%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10
  },
  cameraControls: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10
  },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  flashButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  qrCenterIcon: {
    fontSize: 48,
    opacity: 0.4,
    marginBottom: 8
  },
  scannerHint: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 16
  },
  rescanBtn: {
    marginTop: 12,
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10
  },
  rescanBtnText: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: 'bold'
  },
  manualSection: {
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  manualLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: 'monospace'
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  presetSection: {
    backgroundColor: '#131b2c',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2b42'
  },
  presetHeaderRow: {
    marginBottom: 12
  },
  presetTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2
  },
  presetSubtitle: {
    color: '#64748b',
    fontSize: 10
  },
  presetGrid: {
    gap: 8
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2438',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#24324d',
    gap: 10
  },
  presetThumb: {
    width: 44,
    height: 44,
    borderRadius: 8
  },
  presetName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  presetCode: {
    color: '#34d399',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 1
  },
  presetZone: {
    color: '#94a3b8',
    fontSize: 10
  },
  scanActionBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981'
  },
  scanActionText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: 'bold'
  }
});
