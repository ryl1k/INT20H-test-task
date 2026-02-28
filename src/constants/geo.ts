import L from "leaflet";

export const NY_BOUNDS_RECT = {
  latMin: 40.4,
  latMax: 45.1,
  lonMin: -79.8,
  lonMax: -71.8
};

export const NY_MAP_BOUNDS = L.latLngBounds(
  L.latLng(39.0, -82.0),
  L.latLng(46.5, -69.5)
);

export const NY_CENTER: [number, number] = [42.0, -75.5];

export const NYC_CENTER: [number, number] = [40.75, -73.95];

export function isInNY(lat: number, lon: number): boolean {
  return (
    lat >= NY_BOUNDS_RECT.latMin &&
    lat <= NY_BOUNDS_RECT.latMax &&
    lon >= NY_BOUNDS_RECT.lonMin &&
    lon <= NY_BOUNDS_RECT.lonMax
  );
}
