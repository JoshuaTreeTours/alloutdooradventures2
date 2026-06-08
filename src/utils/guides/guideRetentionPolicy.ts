import { states } from "../../data/destinations";
import { CITY_TIER1_SLUGS } from "../../data/cityTier1";
import { tours } from "../../data/tours";
import { getAllEngine2Tours } from "../../engine2/data/loadEngine2";
import { slugify } from "../slugify";
import type { GuidePageData } from "../loadGuide";

export const GUIDE_RETENTION_MIN_ACTIVE_TOURS = 5;

const PROTECTED_FLAGSHIP_CITY_SLUGS = [
  "yellowstone",
  "yellowstone-national-park",
  "grand-canyon",
  "grand-canyon-national-park",
  "yosemite",
  "yosemite-national-park",
  "joshua-tree",
  "joshua-tree-national-park",
  "glacier",
  "glacier-national-park",
  "zion",
  "zion-national-park",
  "bryce-canyon",
  "bryce-canyon-national-park",
  "arches",
  "arches-national-park",
  "canyonlands",
  "canyonlands-national-park",
  "grand-teton",
  "grand-teton-national-park",
  "rocky-mountain",
  "rocky-mountain-national-park",
  "death-valley",
  "death-valley-national-park",
  "olympic",
  "olympic-national-park",
  "acadia",
  "acadia-national-park",
  "denali",
  "denali-national-park",
  "sedona",
  "moab",
  "lake-tahoe",
  "big-sur",
  "palm-springs",
  "santa-barbara",
  "san-diego",
  "san-francisco",
  "los-angeles",
  "monterey",
  "carmel-by-the-sea",
  "avalon",
  "catalina-island",
  "napa",
  "sonoma",
  "whitefish",
  "jackson",
  "cody",
  "page",
  "bar-harbor",
  "stowe",
  "asheville",
  "rapid-city",
  "traverse-city",
  "hilton-head-island",
  "key-west",
];

export const PROTECTED_US_GUIDE_CITY_SLUGS = new Set([
  ...CITY_TIER1_SLUGS,
  ...PROTECTED_FLAGSHIP_CITY_SLUGS,
]);

const getTourCityKey = (tour: {
  destination?: {
    stateSlug?: string;
    state?: string;
    citySlug?: string;
    city?: string;
    country?: string;
  };
}) => {
  const destination = tour.destination;
  if (!destination) return null;

  const country = destination.country || "United States";
  const countrySlug = slugify(country);
  const stateSlug =
    destination.stateSlug ||
    (destination.state ? slugify(destination.state) : "");
  const citySlug =
    destination.citySlug || (destination.city ? slugify(destination.city) : "");

  if (!stateSlug || !citySlug) return null;
  if (
    !["united-states", "us", "usa"].includes(countrySlug) &&
    country !== "United States"
  ) {
    return null;
  }

  return `${stateSlug}/${citySlug}`;
};

const activeUsTourCountsByCity = (() => {
  const counts = new Map<string, number>();
  const addTour = (tour: Parameters<typeof getTourCityKey>[0]) => {
    const key = getTourCityKey(tour);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };

  tours.forEach(addTour);
  getAllEngine2Tours().forEach(tour =>
    addTour(tour as Parameters<typeof getTourCityKey>[0])
  );

  return counts;
})();

export const getActiveUsCityTourCount = (stateSlug: string, citySlug: string) =>
  activeUsTourCountsByCity.get(`${stateSlug}/${citySlug}`) ?? 0;

const routeCitySlug = (slug?: string) => {
  if (!slug) return "";
  const parts = slug.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

export const isProtectedUsCityGuide = (
  citySlug: string,
  guide?: Partial<GuidePageData>
) => {
  const normalizedCitySlug = citySlug.trim();
  if (!normalizedCitySlug) return false;

  if (PROTECTED_US_GUIDE_CITY_SLUGS.has(normalizedCitySlug)) return true;

  const cityNameSlug = guide?.city ? slugify(guide.city) : "";
  if (cityNameSlug && PROTECTED_US_GUIDE_CITY_SLUGS.has(cityNameSlug))
    return true;

  return false;
};

export const shouldRetainUsCityGuide = (
  stateSlug: string,
  citySlug: string,
  guide?: Partial<GuidePageData>
) =>
  isProtectedUsCityGuide(citySlug || routeCitySlug(guide?.slug), guide) ||
  getActiveUsCityTourCount(stateSlug, citySlug) >=
    GUIDE_RETENTION_MIN_ACTIVE_TOURS;

export const getRetainedUsGuideCityKeys = () => {
  const retained = new Set<string>();

  states.forEach(state => {
    state.cities.forEach(city => {
      if (shouldRetainUsCityGuide(state.slug, city.slug)) {
        retained.add(`${state.slug}/${city.slug}`);
      }
    });
  });

  activeUsTourCountsByCity.forEach((count, key) => {
    if (count >= GUIDE_RETENTION_MIN_ACTIVE_TOURS) {
      retained.add(key);
    }
  });

  return retained;
};
