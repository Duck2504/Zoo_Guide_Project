import { useEffect, useMemo, useRef, useState } from 'react';
import useGeolocation from './useGeolocation';
import { groupZones, locateZone, MAX_ACCURACY_M } from '../utils/geoUtils';
import { getAnimals } from '../utils/animalsApi';

// Theo dõi khu du khách đang đứng. Vị trí chỉ xử lý trên máy, không gửi lên server.
// status: 'off' | 'loading' | 'error' | 'denied' | 'unsupported' | 'searching' | 'inaccurate' | 'inZone' | 'outside'
export default function useZoneTracker(language) {
  const [enabled, setEnabled] = useState(false);
  const [demoPosition, setDemoPosition] = useState(null); // chế độ thử: vị trí đặt bằng tay trên bản đồ
  const [animals, setAnimals] = useState(null);           // null = chưa tải, 'error' = lỗi
  const [currentZoneId, setCurrentZoneId] = useState(null);
  const currentRef = useRef(null);

  const { location: gps, error: gpsError } = useGeolocation(enabled && !demoPosition);

  // Danh sách con vật (kèm tọa độ khu) theo ngôn ngữ đang chọn; tải khi bật định vị
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getAnimals(language)
      .then(data => { if (!cancelled) setAnimals(data); })
      .catch(() => { if (!cancelled) setAnimals('error'); });
    return () => { cancelled = true; };
  }, [enabled, language]);

  const zones = useMemo(() => (Array.isArray(animals) ? groupZones(animals) : []), [animals]);
  const position = demoPosition || gps;
  const usable = position && (demoPosition || position.accuracy <= MAX_ACCURACY_M);
  const located = usable && zones.length ? locateZone(position, zones, currentRef.current) : null;
  const zoneId = located?.inZone?.id ?? null;

  // Lần đo không dùng được thì giữ nguyên khu cũ, không coi là đã rời khu
  useEffect(() => {
    if (!enabled) { currentRef.current = null; setCurrentZoneId(null); return; }
    if (!located) return;
    currentRef.current = zoneId;
    setCurrentZoneId(zoneId);
  }, [enabled, located, zoneId]);

  let status;
  if (!enabled) status = 'off';
  else if (gpsError && !demoPosition) status = gpsError;
  else if (animals === null) status = 'loading';
  else if (animals === 'error') status = 'error';
  else if (!position) status = 'searching';
  else if (!usable) status = 'inaccurate';
  else status = currentZoneId != null ? 'inZone' : 'outside';

  const zone = zones.find(z => z.id === currentZoneId) || null;

  return {
    enabled,
    setEnabled: on => { setEnabled(on); if (!on) setDemoPosition(null); },
    status,
    zone,
    nearest: located?.nearest || null,
    distance: located?.distance ?? null,
    accuracy: gps?.accuracy ?? null,
    position,
    zones,
    setDemoPosition: pos => { setDemoPosition(pos); setEnabled(true); },
    isDemo: !!demoPosition,
  };
}
