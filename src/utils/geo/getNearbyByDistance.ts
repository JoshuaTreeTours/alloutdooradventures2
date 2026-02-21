import {
  buildGeoIndex,
  getGeoCityKey,
  type CityGeoRecord,
  type TourGeoRecord,
} from "./buildGeoIndex";
import { haversineMiles } from "./haversineMiles";

export type NearbyContext = {
  type: "guide" | "city" | "tour";
  citySlug?: string;
  state?: string;
  stateSlug?: string;
  country?: string;
  lat?: number;
  lng?: number;
  tourSlug?: string;
  tourHref?: string;
};

export type NearbyGuideItem = CityGeoRecord & { distanceMiles: number };
export type NearbyTourItem = TourGeoRecord & { distanceMiles: number };

const DEFAULT_RADIUS_MILES = 200;

export const getNearbyByDistance = <T extends { lat: number; lng: number }>(
  origin: { lat: number; lng: number },
  items: T[],
  radiusMiles = DEFAULT_RADIUS_MILES
) =>
  items
    .map(item => ({
      item,
      distanceMiles: haversineMiles(origin.lat, origin.lng, item.lat, item.lng),
    }))
    .filter(entry => entry.distanceMiles <= radiusMiles);

const isLikelyPlaceholder = (image?: string) =>
  !image ||
  image === "/hero.jpg" ||
  image.includes("default") ||
  image.includes("placeholder");

export const getNearbyClusterData = ({
  context,
  maxGuides = 8,
  maxTours = 10,
  radiusMiles = DEFAULT_RADIUS_MILES,
}: {
  context: NearbyContext;
  maxGuides?: number;
  maxTours?: number;
  radiusMiles?: number;
}) => {
  const index = buildGeoIndex();
  const cityKey = getGeoCityKey(context.stateSlug, context.citySlug);
  const originCity = cityKey ? index.cityGeoIndex[cityKey] : undefined;
  const originLat = context.lat ?? originCity?.lat;
  const originLng = context.lng ?? originCity?.lng;

  if (!Number.isFinite(originLat) || !Number.isFinite(originLng)) {
    return {
      nearbyGuides: [] as NearbyGuideItem[],
      nearbyTours: [] as NearbyTourItem[],
    };
  }

  const nearbyGuides = getNearbyByDistance(
    { lat: originLat as number, lng: originLng as number },
    Object.entries(index.cityGeoIndex)
      .filter(([key]) => key !== cityKey)
      .map(([, value]) => value),
    radiusMiles
  )
    .sort((a, b) => {
      const sameStateA =
        context.stateSlug && a.item.stateSlug === context.stateSlug ? 1 : 0;
      const sameStateB =
        context.stateSlug && b.item.stateSlug === context.stateSlug ? 1 : 0;
      return (
        sameStateB - sameStateA ||
        b.item.tourCount - a.item.tourCount ||
        a.distanceMiles - b.distanceMiles ||
        a.item.href.localeCompare(b.item.href)
      );
    })
    .slice(0, maxGuides)
    .map(entry => ({
      ...entry.item,
      distanceMiles: entry.distanceMiles,
      image: isLikelyPlaceholder(entry.item.image)
        ? undefined
        : entry.item.image,
    }));

  const nearbyTours = getNearbyByDistance(
    { lat: originLat as number, lng: originLng as number },
    Object.values(index.tourGeoIndex).filter(
      item => item.href !== context.tourHref
    ),
    radiusMiles
  )
    .sort((a, b) => {
      const sameStateA =
        context.stateSlug && a.item.state === context.state ? 1 : 0;
      const sameStateB =
        context.stateSlug && b.item.state === context.state ? 1 : 0;
      return (
        sameStateB - sameStateA ||
        (b.item.ratingCount ?? 0) - (a.item.ratingCount ?? 0) ||
        (b.item.ratingValue ?? 0) - (a.item.ratingValue ?? 0) ||
        a.distanceMiles - b.distanceMiles ||
        a.item.href.localeCompare(b.item.href)
      );
    })
    .slice(0, maxTours)
    .map(entry => ({
      ...entry.item,
      distanceMiles: entry.distanceMiles,
      image: isLikelyPlaceholder(entry.item.image)
        ? undefined
        : entry.item.image,
    }));

  return { nearbyGuides, nearbyTours };
};
