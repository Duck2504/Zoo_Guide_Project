import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet';

// Bản đồ nhỏ trong form khu vực: bấm để đặt tâm khu, thấy ngay vòng bán kính và các khu khác (xám).
// Dùng Circle/CircleMarker thay cho Marker vì ảnh ghim mặc định của Leaflet bị hỏng khi build bằng Vite.
const DEFAULT_CENTER = [10.7875, 106.7053]; // Thảo Cầm Viên

function ClickToPlace({ onPick }) {
  useMapEvents({ click: e => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function ZonePicker({ lat, lng, radius, others, hasOverlap = false, overlapIds = [], onPick }) {
  const has = Number.isFinite(lat) && Number.isFinite(lng);
  const center = has ? [lat, lng] : others[0] ? [others[0].latitude, others[0].longitude] : DEFAULT_CENTER;
  const activeColor = hasOverlap ? '#e11d48' : '#047857';
  const overlapSet = new Set(overlapIds);

  return (
    <div>
      <div className="h-64 overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={center} zoom={17} className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {others.map(z => {
            const isConflicting = overlapSet.has(z.id);
            return (
              <Circle
                key={z.id}
                center={[z.latitude, z.longitude]}
                radius={Number(z.radius) || 0}
                pathOptions={{
                  color: isConflicting ? '#e11d48' : '#64748b',
                  weight: isConflicting ? 2 : 1,
                  fillOpacity: isConflicting ? 0.18 : 0.12,
                }}
              >
                <Tooltip direction="center">{z.name || z.zoneCode} ({z.radius} m)</Tooltip>
              </Circle>
            );
          })}
          {has && <Circle center={[lat, lng]} radius={Number(radius) || 0} pathOptions={{ color: activeColor, weight: 2, fillOpacity: 0.22 }} />}
          {has && <CircleMarker center={[lat, lng]} radius={5} pathOptions={{ color: '#ffffff', weight: 2, fillColor: activeColor, fillOpacity: 1 }} />}
          <ClickToPlace onPick={onPick} />
        </MapContainer>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Bấm lên bản đồ để đặt tâm khu. {hasOverlap ? 'Vòng đỏ đang đè lên khu khác (cần dời tâm hoặc giảm bán kính).' : 'Vòng xanh là phạm vi khu này, vòng xám là các khu sẵn có.'}
      </p>
    </div>
  );
}
