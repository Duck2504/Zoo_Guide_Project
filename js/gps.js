/**
 * gps.js - Thảo Cầm Viên Sài Gòn
 * Geolocation tracking, Haversine distance calculations, and Geofence trigger engine
 * Strictly compliant with Privacy Rule (Client-side only processing, PRD 4.4)
 */

class ZooGpsEngine {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.lastTriggerTimes = {}; // Anti-spam cooldown: { [animalId]: timestamp }
    this.COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes anti-spam cooldown (PRD 4.4)
    this.onPositionCallback = null;
    this.onGeofenceCallback = null;
  }

  /**
   * Calculate distance between two coordinates in meters using Haversine formula
   */
  getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Start live GPS tracking with Geolocation API
   */
  startTracking(animalsList = [], onPositionUpdate = null, onGeofenceTrigger = null) {
    if (!navigator.geolocation) {
      alert("Thiết bị của bạn không hỗ trợ định vị GPS.");
      return;
    }

    this.onPositionCallback = onPositionUpdate;
    this.onGeofenceCallback = onGeofenceTrigger;

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        this.currentPosition = { lat: latitude, lng: longitude, accuracy };

        if (this.onPositionCallback) {
          this.onPositionCallback(this.currentPosition);
        }

        // Evaluate Geofences
        this.evaluateGeofences(latitude, longitude, animalsList);
      },
      (err) => {
        console.warn("[GPS] Geolocation watch error:", err.message);
      },
      options
    );
  }

  /**
   * Check if user is inside any animal's geofence radius
   */
  evaluateGeofences(lat, lng, animalsList) {
    if (!Array.isArray(animalsList)) return;
    const now = Date.now();

    for (const animal of animalsList) {
      if (!animal.coordinates) continue;
      const dist = this.getDistanceMeters(
        lat, lng,
        animal.coordinates.lat, animal.coordinates.lon
      );

      const radius = animal.radius_meters || 25;
      if (dist <= radius) {
        const lastTrigger = this.lastTriggerTimes[animal.id] || 0;
        if (now - lastTrigger > this.COOLDOWN_MS) {
          this.lastTriggerTimes[animal.id] = now;
          console.log(`[Geofence] Triggered ${animal.name} (${dist}m <= ${radius}m)`);
          if (this.onGeofenceCallback) {
            this.onGeofenceCallback(animal, dist);
          }
        }
      }
    }
  }

  /**
   * Stop tracking
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

// Global GPS Engine instance
const zooGps = new ZooGpsEngine();
