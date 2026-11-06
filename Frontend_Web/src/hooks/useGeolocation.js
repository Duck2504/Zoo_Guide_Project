// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

// error: 'denied' | 'unsupported' | null. Hết giờ chờ (TIMEOUT) không phải lỗi: watchPosition vẫn tiếp tục thử.
export default function useGeolocation(isTracking) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isTracking) { setError(null); return; }
    if (!navigator.geolocation) { setError('unsupported'); return; }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setError(null);
      },
      (err) => { if (err.code === err.PERMISSION_DENIED) setError('denied'); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking]);

  return { location, error };
}
