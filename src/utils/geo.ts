export type GeoPoint = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (value: number) => (value * Math.PI) / 180;

export const haversineMiles = (a: GeoPoint, b: GeoPoint) => {
  const latDelta = toRadians(b.lat - a.lat);
  const lngDelta = toRadians(b.lng - a.lng);
  const latA = toRadians(a.lat);
  const latB = toRadians(b.lat);

  const sinLat = Math.sin(latDelta / 2);
  const sinLng = Math.sin(lngDelta / 2);
  const haversine =
    sinLat * sinLat + Math.cos(latA) * Math.cos(latB) * sinLng * sinLng;
  const distance = 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(haversine));

  return distance;
};

export const withinMiles = (a: GeoPoint, b: GeoPoint, maxMiles: number) =>
  haversineMiles(a, b) <= maxMiles;

export const normalizePlaceName = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
