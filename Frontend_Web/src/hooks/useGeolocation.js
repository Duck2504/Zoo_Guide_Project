// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

export default function useGeolocation(isTracking) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isTracking || !navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ GPS hoặc đang tắt tự động phát.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setError(null);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking]);

  return { location, error };
}