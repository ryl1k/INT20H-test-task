import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import type { ReactNode } from "react";
import { NY_CENTER, NY_MAP_BOUNDS } from "@/constants/geo";

const DEFAULT_ZOOM = 7;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: ReactNode;
  ariaLabel?: string;
}

export function MapContainer({ center = NY_CENTER, zoom = DEFAULT_ZOOM, className = "h-[500px] w-full", children, ariaLabel = "Interactive map" }: MapProps) {
  return (
    <div role="region" aria-label={ariaLabel}>
      <LeafletMap
        center={center}
        zoom={zoom}
        className={className}
        scrollWheelZoom
        maxBounds={NY_MAP_BOUNDS}
        maxBoundsViscosity={0.8}
        minZoom={5}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </LeafletMap>
    </div>
  );
}
