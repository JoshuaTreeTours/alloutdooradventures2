import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export type MapMarker = {
  name: string;
  position: [number, number];
  description?: string;
};

type LeafletMapProps = {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  heightClassName?: string;
};

export default function LeafletMap({
  center,
  zoom,
  markers,
  heightClassName = "h-96",
}: LeafletMapProps) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl ${heightClassName}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.name} position={marker.position}>
            <Tooltip direction="top" offset={[0, -12]} opacity={0.9}>
              {marker.name}
            </Tooltip>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-[#1f2a1f]">{marker.name}</p>
                {marker.description ? (
                  <p className="mt-1 text-[#405040]">{marker.description}</p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
