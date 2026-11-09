import { useEffect, useMemo, useRef, useState } from 'react';
import useGeolocation from './useGeolocation';
import { groupZones, locateZone, MAX_ACCURACY_M } from '../utils/geoUtils';
import { getAnimals } from '../utils/animalsApi';

// Theo dõi khu du khách đang đứng. Vị trí chỉ xử lý trên máy, không gửi lên server.
// status: 'off' | 'loading' | 'error' | 'denied' | 'unsupported' | 'searching' | 'inaccurate' | 'inZone' | 'outside'
// Khách đã bật định vị thì giữ bật trong 12 giờ: quét mã bằng camera mở tab mới, không phải bật lại ở mỗi chuồng
const GEO_KEY = 'zoo_geo_on_until';
const GEO_HOURS = 12;
function readGeoOn() {
  try { return Number(localStorage.getItem(GEO_KEY)) > Date.now(); } catch { return false; }
}
function saveGeoOn(on) {
  try { on ? localStorage.setItem(GEO_KEY, String(Date.now() + GEO_HOURS * 3600e3)) : localStorage.removeItem(GEO_KEY); } catch { /* không nhớ được thì thôi */ }
}

export default function useZoneTracker(language) {
  const [enabled, setEnabled] = useState(readGeoOn);
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
  // Đang trong khu mà một lần đo bị nhảy sai số: vẫn coi là trong khu, để danh sách và audio đang phát không bị ngắt
  else if (!usable) status = currentZoneId != null ? 'inZone' : 'inaccurate';
  else status = currentZoneId != null ? 'inZone' : 'outside';

  const zone = zones.find(z => z.id === currentZoneId) || null;

  return {
    enabled,
    setEnabled: on => { setEnabled(on); saveGeoOn(on); if (!on) setDemoPosition(null); },
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
