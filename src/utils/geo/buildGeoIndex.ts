import { allCities } from "../../data/destinations";
import { getTourDetailPath, tours } from "../../data/tours";
import { getAllEngine2Tours } from "../../engine2/data/loadEngine2";
import { usGuideRegistry } from "../guides/guideRegistry";
import { slugify } from "../slugify";

export type CityGeoRecord = {
  citySlug: string;
  state?: string;
  stateSlug?: string;
  country?: string;
  lat: number;
  lng: number;
  title: string;
  href: string;
  image?: string;
  tourCount: number;
};

export type TourGeoRecord = {
  tourSlug: string;
  citySlug: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  title: string;
  href: string;
  image?: string;
  ratingValue?: number;
  ratingCount?: number;
};

export type GeoIndex = {
  cityGeoIndex: Record<string, CityGeoRecord>;
  tourGeoIndex: Record<string, TourGeoRecord>;
  cityToTours: Record<string, string[]>;
};

let memoizedGeoIndex: GeoIndex | null = null;

const hasCoordinates = (lat?: number, lng?: number) =>
  Number.isFinite(lat) && Number.isFinite(lng);

const getCityKey = (stateSlug: string, citySlug: string) =>
  `${stateSlug}/${citySlug}`;

const getTourKey = (href: string) => href;

export const buildGeoIndex = (): GeoIndex => {
  if (memoizedGeoIndex) {
    return memoizedGeoIndex;
  }

  const cityGeoIndex: Record<string, CityGeoRecord> = {};
  const tourGeoIndex: Record<string, TourGeoRecord> = {};
  const cityToTours: Record<string, string[]> = {};

  for (const city of allCities) {
    if (!hasCoordinates(city.lat, city.lng)) {
      continue;
    }

    const key = getCityKey(city.stateSlug, city.slug);
    cityGeoIndex[key] = {
      citySlug: city.slug,
      state: city.stateSlug,
      stateSlug: city.stateSlug,
      country: "United States",
      lat: city.lat,
      lng: city.lng,
      title: `${city.name} Guide`,
      href: `/guides/us/${city.stateSlug}/${city.slug}`,
      image: city.heroImages[0],
      tourCount: 0,
    };
    cityToTours[key] = [];
  }

  for (const guideRecord of usGuideRegistry) {
    const cityCenter = guideRecord.dataImport.cityCenter;
    if (!cityCenter || !hasCoordinates(cityCenter.lat, cityCenter.lng)) {
      continue;
    }

    const key = getCityKey(guideRecord.stateSlug, guideRecord.citySlug);
    if (!cityGeoIndex[key]) {
      cityGeoIndex[key] = {
        citySlug: guideRecord.citySlug,
        state: guideRecord.dataImport.state,
        stateSlug: guideRecord.stateSlug,
        country: guideRecord.dataImport.country,
        lat: cityCenter.lat,
        lng: cityCenter.lng,
        title: `${guideRecord.dataImport.city ?? guideRecord.dataImport.state} Guide`,
        href: `/guides/us/${guideRecord.stateSlug}/${guideRecord.citySlug}`,
        image: guideRecord.dataImport.hero.image,
        tourCount: 0,
      };
      cityToTours[key] = [];
    }
  }

  for (const tour of tours) {
    const cityKey = getCityKey(
      tour.destination.stateSlug,
      tour.destination.citySlug
    );
    const cityRecord = cityGeoIndex[cityKey];
    const lat = tour.destination.lat ?? cityRecord?.lat;
    const lng = tour.destination.lng ?? cityRecord?.lng;

    if (!hasCoordinates(lat, lng)) {
      continue;
    }

    const href = getTourDetailPath(tour);
    const tourKey = getTourKey(href);
    tourGeoIndex[tourKey] = {
      tourSlug: tour.slug,
      citySlug: tour.destination.citySlug,
      state: tour.destination.state,
      country: tour.destination.country,
      lat: lat as number,
      lng: lng as number,
      title: tour.title,
      href,
      image: tour.heroImage,
      ratingValue: tour.badges.rating,
      ratingCount: tour.badges.reviewCount,
    };
    cityToTours[cityKey] = [...(cityToTours[cityKey] ?? []), tourKey];
  }

  for (const tour of getAllEngine2Tours()) {
    const stateSlug = slugify(tour.geo.region || "");
    const cityKey = getCityKey(stateSlug, tour.sourceCitySlug);
    const cityRecord = cityGeoIndex[cityKey];
    const lat = tour.geo.lat ?? cityRecord?.lat;
    const lng = tour.geo.lng ?? cityRecord?.lng;

    if (!hasCoordinates(lat, lng)) {
      continue;
    }

    const href = tour.seo.canonicalPath;
    const tourKey = getTourKey(href);
    tourGeoIndex[tourKey] = {
      tourSlug: tour.slug,
      citySlug: tour.sourceCitySlug,
      state: tour.geo.region,
      country: tour.geo.country,
      lat: lat as number,
      lng: lng as number,
      title: tour.name,
      href,
      image: tour.images.hero,
    };
    cityToTours[cityKey] = [...(cityToTours[cityKey] ?? []), tourKey];
  }

  for (const cityKey of Object.keys(cityToTours)) {
    const entries = cityToTours[cityKey].sort((a, b) => a.localeCompare(b));
    cityToTours[cityKey] = entries;
    if (cityGeoIndex[cityKey]) {
      cityGeoIndex[cityKey].tourCount = entries.length;
    }
  }

  memoizedGeoIndex = {
    cityGeoIndex,
    tourGeoIndex,
    cityToTours,
  };

  return memoizedGeoIndex;
};

export const getGeoCityKey = (
  stateSlug: string | undefined,
  citySlug: string | undefined
) => {
  if (!stateSlug || !citySlug) {
    return undefined;
  }

  return getCityKey(stateSlug, citySlug);
};
