import type { City, StateDestination } from "./destinations";
import { getFallbackStateBySlug } from "./tourFallbacks";
import { getToursByState } from "./tours";
import type { Tour } from "./tours.types";
import { pickBestHeroImageFromTours } from "../utils/heroImage";

export type DestinationCityCard = {
  city: City;
  tourCount: number;
  heroImage: string | null;
};

const normalizeCityKey = (city: City) => city.slug.trim().toLowerCase();

const stateTourCache = new Map<string, Tour[]>();
const stateTourCountCache = new Map<string, Map<string, number>>();
const stateTourHeroCache = new Map<string, Map<string, string | null>>();

const getStateTours = (stateSlug: string) => {
  const cached = stateTourCache.get(stateSlug);
  if (cached) {
    return cached;
  }

  const stateTours = getToursByState(stateSlug);
  stateTourCache.set(stateSlug, stateTours);
  return stateTours;
};

const getStateTourCounts = (stateSlug: string) => {
  const cached = stateTourCountCache.get(stateSlug);
  if (cached) {
    return cached;
  }

  const counts = new Map<string, number>();
  getStateTours(stateSlug).forEach(tour => {
    const citySlug = tour.destination.citySlug;
    if (citySlug) {
      counts.set(citySlug, (counts.get(citySlug) ?? 0) + 1);
    }
  });
  stateTourCountCache.set(stateSlug, counts);
  return counts;
};

export const getDestinationCityTourCount = (
  stateSlug: string,
  citySlug: string
) => getStateTourCounts(stateSlug).get(citySlug) ?? 0;

const getStateTourHeroes = (stateSlug: string) => {
  const cached = stateTourHeroCache.get(stateSlug);
  if (cached) {
    return cached;
  }

  const toursByCity = new Map<string, Tour[]>();
  getStateTours(stateSlug).forEach(tour => {
    const citySlug = tour.destination.citySlug;
    if (!citySlug) {
      return;
    }

    const cityTours = toursByCity.get(citySlug) ?? [];
    cityTours.push(tour);
    toursByCity.set(citySlug, cityTours);
  });

  const heroImages = new Map<string, string | null>();
  toursByCity.forEach((cityTours, citySlug) => {
    heroImages.set(
      citySlug,
      pickBestHeroImageFromTours(cityTours as unknown[])
    );
  });
  stateTourHeroCache.set(stateSlug, heroImages);
  return heroImages;
};

const getDestinationCityHeroImage = (stateSlug: string, citySlug: string) =>
  getStateTourHeroes(stateSlug).get(citySlug) ?? null;

export const getEligibleChildDestinationCities = (
  state: StateDestination
): City[] => {
  const bySlug = new Map<string, City>();

  state.cities.forEach(city => {
    const cityKey = normalizeCityKey(city);
    if (cityKey) {
      bySlug.set(cityKey, city);
    }
  });

  const fallbackState = getFallbackStateBySlug(state.slug);
  fallbackState?.cities.forEach(city => {
    const cityKey = normalizeCityKey(city);
    if (!cityKey || bySlug.has(cityKey)) {
      return;
    }

    const tourCount = getDestinationCityTourCount(state.slug, city.slug);
    if (tourCount > 0) {
      bySlug.set(cityKey, city);
    }
  });

  return [...bySlug.values()];
};

export const getDestinationCityCards = (
  state: StateDestination
): DestinationCityCard[] =>
  getEligibleChildDestinationCities(state)
    .map(city => ({
      city,
      tourCount: getDestinationCityTourCount(state.slug, city.slug),
      heroImage: getDestinationCityHeroImage(state.slug, city.slug),
    }))
    .sort(
      (a, b) =>
        b.tourCount - a.tourCount || a.city.name.localeCompare(b.city.name)
    );
