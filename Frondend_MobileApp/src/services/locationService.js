/**
 * Dịch vụ Định vị GPS, Radar Geofence và Cảm biến Nền (Background Tracking)
 * Tự động rung điện thoại (Vibration) và kích hoạt thuyết minh khi khách đút điện thoại vào túi quần
 */

import { Vibration, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const LOCATION_BACKGROUND_TASK = 'ZOO_BACKGROUND_LOCATION_TASK';

// Bán kính Trái Đất theo mét
const EARTH_RADIUS_METERS = 6371000;

/**
 * Tính khoảng cách mặt cầu Haversine giữa 2 tọa độ (mét)
 */
export function getHaversineDistance(lon1, lat1, lon2, lat2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 999999;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const rLat1 = lat1 * Math.PI / 180;
  const rLat2 = lat2 * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rLat1) * Math.cos(rLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Kiểm tra xem du khách có đang nằm trong vòng tròn Geofence của loài thú hay không
 */
export function isWithinGeofence(touristCoords, animal) {
  if (!touristCoords || !animal || !animal.coords) return false;
  const distance = getHaversineDistance(
    touristCoords.lon, touristCoords.lat,
    animal.coords.lon, animal.coords.lat
  );
  return distance <= (animal.radius || 25);
}

/**
 * Tìm loài thú đang được kích hoạt Geofence (nằm trong bán kính)
 */
export function detectActiveGeofenceAnimal(touristCoords, animalsList = []) {
  if (!touristCoords || !animalsList.length) return null;

  let matched = null;
  let minDistance = Infinity;

  animalsList.forEach(animal => {
    const dist = getHaversineDistance(
      touristCoords.lon, touristCoords.lat,
      animal.coords.lon, animal.coords.lat
    );
    const radius = animal.radius || 25;
    if (dist <= radius && dist < minDistance) {
      minDistance = dist;
      matched = { animal, distance: dist };
    }
  });

  return matched;
}

/**
 * Kích hoạt rung thiết bị khi du khách bước vào chuồng thú
 * Rung 2 nhịp đặc trưng: rung 400ms, nghỉ 200ms, rung 400ms
 */
export function triggerHapticArrival() {
  try {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      Vibration.vibrate([0, 400, 200, 400]);
    }
  } catch (err) {
    console.log('[Haptics] Thiết bị không hỗ trợ rung:', err);
  }
}

/**
 * Yêu cầu quyền định vị tiền cảnh và hậu cảnh (Background Location)
 */
export async function requestLocationPermissions() {
  try {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      return { success: false, message: 'Từ chối quyền định vị tiền cảnh' };
    }

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    return {
      success: true,
      hasBackground: bgStatus === 'granted',
      message: bgStatus === 'granted' 
        ? 'Đã cấp quyền định vị nền (Hands-free)' 
        : 'Chỉ hỗ trợ định vị khi mở ứng dụng'
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Khởi động theo dõi vị trí nền với expo-location
 */
export async function startBackgroundLocationTracking(onLocationUpdate) {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_BACKGROUND_TASK);
    if (!isRegistered) {
      TaskManager.defineTask(LOCATION_BACKGROUND_TASK, ({ data, error }) => {
        if (error) {
          console.error('[BackgroundLocation] Lỗi:', error);
          return;
        }
        if (data && data.locations && data.locations.length > 0) {
          const loc = data.locations[0];
          const coords = { lon: loc.coords.longitude, lat: loc.coords.latitude };
          if (typeof onLocationUpdate === 'function') {
            onLocationUpdate(coords);
          }
        }
      });
    }

    await Location.startLocationUpdatesAsync(LOCATION_BACKGROUND_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 4000,
      distanceInterval: 5,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Zoo Audio Guide - Định Vị Nền',
        notificationBody: 'Đang theo dõi vị trí để tự động thuyết minh khi bạn đến gần chuồng thú.',
        notificationColor: '#059669'
      }
    });

    return true;
  } catch (err) {
    console.log('[BackgroundLocation] Không thể khởi động ngầm:', err);
    return false;
  }
}

/**
 * Dừng theo dõi vị trí nền
 */
export async function stopBackgroundLocationTracking() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_BACKGROUND_TASK);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_BACKGROUND_TASK);
    }
  } catch (err) {
    console.log('[BackgroundLocation] Lỗi dừng tác vụ:', err);
  }
}

/**
 * Các chặng dừng chân trong Tour Mô Phỏng Bước Chân Du Khách
 */
export const SIMULATION_TOUR_STOPS = [
  {
    step: 1,
    title: "Cổng Chính (Nguyễn Bỉnh Khiêm)",
    subtitle: "Bắt đầu hành trình khám phá Thảo Cầm Viên",
    coords: { lon: 106.7050, lat: 10.7865 },
    animalId: null
  },
  {
    step: 2,
    title: "Chuồng Voi Châu Á",
    subtitle: "Khu Động Vật Thảo Tự Nhiên & Móng Guốc",
    coords: { lon: 106.7055, lat: 10.7873 },
    animalId: "zoo-1"
  },
  {
    step: 3,
    title: "Chuồng Hổ Đông Dương",
    subtitle: "Khu Thú Ăn Thịt (Chúa Tể Sơn Lâm)",
    coords: { lon: 106.7057, lat: 10.7883 },
    animalId: "zoo-2"
  },
  {
    step: 4,
    title: "Chuồng Gấu Ngựa Đông Dương",
    subtitle: "Khu Thú Ăn Thịt & Rừng Nhiệt Đới",
    coords: { lon: 106.7052, lat: 10.7883 },
    animalId: "zoo-8"
  },
  {
    step: 5,
    title: "Đảo Linh Trưởng & Vượn Má Vàng",
    subtitle: "Đảo Sinh Thái Rừng Mưa Nhiệt Đới",
    coords: { lon: 106.7048, lat: 10.7877 },
    animalId: "zoo-4"
  },
  {
    step: 6,
    title: "Khu Hươu Cao Cổ & Ngựa Vằn",
    subtitle: "Khu Thảo Nguyên & Xavan Châu Phi",
    coords: { lon: 106.7047, lat: 10.7869 },
    animalId: "zoo-3"
  },
  {
    step: 7,
    title: "Chuồng Tê Giác Một Sừng",
    subtitle: "Khu Động Vật Cổ Đại & Móng Guốc",
    coords: { lon: 106.7052, lat: 10.7866 },
    animalId: "zoo-7"
  },
  {
    step: 8,
    title: "Đầm Cá Sấu Nước Lợ",
    subtitle: "Khu Bò Sát Cổ Đại & Đầm Lầy",
    coords: { lon: 106.7062, lat: 10.7868 },
    animalId: "zoo-6"
  },
  {
    step: 9,
    title: "Vườn Chim & Đàn Hồng Hạc",
    subtitle: "Khu Đầm Lầy Thủy Điểu Rực Rỡ",
    coords: { lon: 106.7062, lat: 10.7875 },
    animalId: "zoo-5"
  }
];
