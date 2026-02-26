import { useMapEvents, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { isInNY } from "@/constants/geo";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  position: [number, number] | null;
  onPositionChange: (lat: number, lon: number) => void;
}

function MapClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (isInNY(lat, lng)) {
        onPositionChange(lat, lng);
      }
    }
  });
  return null;
}

export function LocationPicker({ position, onPositionChange }: LocationPickerProps) {
  return (
    <>
      <MapClickHandler onPositionChange={onPositionChange} />
      {position && (
        <Marker position={position} icon={markerIcon} draggable eventHandlers={{
          dragend: (e) => {
            const marker = e.target as L.Marker;
            const { lat, lng } = marker.getLatLng();
            if (isInNY(lat, lng)) {
              onPositionChange(lat, lng);
            }
          }
        }}>
          <Popup>
            Delivery: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </Popup>
        </Marker>
      )}
    </>
  );
}
