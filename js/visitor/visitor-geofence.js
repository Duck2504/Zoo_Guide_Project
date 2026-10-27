/**
 * Geolocation & Geofencing Controller
 * Implements Haversine distance, cooldown, and anti-looping rules (PRD FR-03, FR-04, FR-05)
 */
import { CONFIG } from '../config.js';
import { visitorState } from './visitor-state.js';

class VisitorGeofence {
  constructor() {
    this.watchId = null;
    this.cooldownMap = new Map(); // key: zoneId/animalId, value: timestamp last triggered
    this.currentlyInsideId = null;
  }

  /**
   * Calculate great-circle distance between two GPS coordinates using Haversine formula
   * Returns distance in meters.
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Start tracking user GPS position
   */
  startTracking(onPositionUpdate, onGeofenceTrigger) {
    if (!('geolocation' in navigator)) {
      console.warn('Thiết bị không hỗ trợ Geolocation API.');
      return false;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: CONFIG.GEOFENCE.WATCH_TIMEOUT_MS,
    };

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        visitorState.set({ userLocation: [latitude, longitude] });

        if (onPositionUpdate) {
          onPositionUpdate(latitude, longitude, accuracy);
        }

        const { isAutoGeofenceEnabled, animals } = visitorState.get();
        if (isAutoGeofenceEnabled) {
          this.checkGeofence(latitude, longitude, animals, onGeofenceTrigger);
        }
      },
      (err) => {
        console.warn('Lỗi Geolocation hoặc người dùng từ chối quyền:', err.message);
        // PRD US-06: Du khách từ chối quyền vị trí vẫn dùng được bằng quét QR
        visitorState.set({ isAutoGeofenceEnabled: false });
      },
      options
    );

    return true;
  }

  /**
   * Stop tracking GPS
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Check if current user position is within any animal/zone geofence radius
   */
  checkGeofence(lat, lng, animals, onTrigger) {
    if (!animals || animals.length === 0) return;

    let closestInside = null;
    let minDistance = Infinity;

    for (const animal of animals) {
      if (!animal.coords || animal.coords.length < 2) continue;
      const [targetLat, targetLng] = animal.coords;
      const dist = this.calculateDistance(lat, lng, targetLat, targetLng);
      const radius = animal.radius || CONFIG.GEOFENCE.DEFAULT_RADIUS_METERS;

      if (dist <= radius) {
        if (dist < minDistance) {
          minDistance = dist;
          closestInside = { animal, distance: Math.round(dist) };
        }
      }
    }

    if (!closestInside) {
      // Left all zones
      this.currentlyInsideId = null;
      return;
    }

    const { animal, distance } = closestInside;
    const now = Date.now();
    const lastTriggered = this.cooldownMap.get(animal.id) || 0;
    const cooldownTime = CONFIG.GEOFENCE.COOLDOWN_MS;

    // PRD FR-04: Chống phát lặp
    // Nếu vẫn đang đứng trong cùng một zone đã kích hoạt thì không phát lại
    if (this.currentlyInsideId === animal.id) {
      return;
    }

    // Nếu đã rời đi và quay lại, chỉ kích hoạt khi đã hết thời gian cooldown
    if (now - lastTriggered < cooldownTime) {
      console.log(`Bỏ qua tự phát thú ID ${animal.id} do đang trong cooldown (${Math.round((cooldownTime - (now - lastTriggered)) / 1000)}s còn lại)`);
      return;
    }

    // Trigger Geofence activation
    this.currentlyInsideId = animal.id;
    this.cooldownMap.set(animal.id, now);

    if (onTrigger) {
      onTrigger(animal, distance);
    }
  }
}

export const visitorGeofence = new VisitorGeofence();
