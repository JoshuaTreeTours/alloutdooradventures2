import { states } from "../../data/destinations";
import { getGuideStates, retainedUsGuideRegistry } from "./guideRegistry";
import { hasUsGuide } from "./guideIndex";
import { isProtectedUsCityGuide } from "./guideRetentionPolicy";

export type ResolvedUsGuideHref = {
  href: string;
  hasCityGuide: boolean;
  stateSlug: string;
  citySlug: string;
};

const buildUsStateGuideHref = (stateSlug: string) => `/guides/us/${stateSlug}`;

const buildUsCityGuideHref = (stateSlug: string, citySlug: string) =>
  `${buildUsStateGuideHref(stateSlug)}/${citySlug}`;

const EXPLICIT_RETIRED_GUIDE_REDIRECTS: Record<string, string> = {
  "montana/west-yellowstone": "/guides/us/wyoming/yellowstone-national-park",
  "montana/gardiner": "/guides/us/wyoming/yellowstone-national-park",
  "montana/big-sky": "/guides/us/montana",
  "california/rio-linda": "/guides/us/california/sacramento",
  "new-jersey/wallington": "/guides/us/new-york/new-york",
  "florida/greenacres": "/guides/us/florida/miami",
  "arizona/morristown": "/guides/us/arizona",
  "florida/canal-point": "/guides/us/florida",
  "new-jersey/fieldsboro": "/guides/us/new-jersey",
};

const cityByKey = new Map(
  states.flatMap(state =>
    state.cities.map(
      city => [`${state.slug}/${city.slug}`, { state, city }] as const
    )
  )
);

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const distanceMiles = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) => {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
};

const retainedCityCandidates = retainedUsGuideRegistry
  .map(record => {
    const destination = cityByKey.get(
      `${record.stateSlug}/${record.citySlug}`
    )?.city;
    const lat = destination?.lat ?? record.dataImport.cityCenter?.lat;
    const lng = destination?.lng ?? record.dataImport.cityCenter?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return null;
    }

    return {
      stateSlug: record.stateSlug,
      citySlug: record.citySlug,
      href: buildUsCityGuideHref(record.stateSlug, record.citySlug),
      isFlagship: isProtectedUsCityGuide(record.citySlug, record.dataImport),
      lat,
      lng,
    };
  })
  .filter((candidate): candidate is NonNullable<typeof candidate> =>
    Boolean(candidate)
  );

const findNearestRetainedCityHref = (
  stateSlug: string,
  citySlug: string,
  flagshipOnly: boolean
) => {
  const source = cityByKey.get(`${stateSlug}/${citySlug}`)?.city;
  if (
    !source ||
    typeof source.lat !== "number" ||
    typeof source.lng !== "number"
  ) {
    return null;
  }

  const candidates = retainedCityCandidates.filter(candidate =>
    flagshipOnly ? candidate.isFlagship : candidate.stateSlug === stateSlug
  );

  const nearest = candidates
    .filter(
      candidate =>
        candidate.stateSlug !== stateSlug || candidate.citySlug !== citySlug
    )
    .map(candidate => ({
      ...candidate,
      distance: distanceMiles(source, candidate),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest?.href ?? null;
};

export const hasUsStateGuide = (stateSlug: string): boolean =>
  getGuideStates().includes(stateSlug);

export const resolveUsGuideHref = (
  stateSlug: string,
  citySlug: string
): ResolvedUsGuideHref => {
  const hasCityGuide = hasUsGuide(stateSlug, citySlug);

  return {
    href: hasCityGuide
      ? buildUsCityGuideHref(stateSlug, citySlug)
      : (resolveMissingUsCityGuideRedirect(stateSlug, citySlug) ??
        buildUsStateGuideHref(stateSlug)),
    hasCityGuide,
    stateSlug,
    citySlug,
  };
};

export const resolveMissingUsCityGuideRedirect = (
  stateSlug: string,
  citySlug: string
): string | null => {
  if (hasUsGuide(stateSlug, citySlug)) {
    return null;
  }

  const explicitRedirect =
    EXPLICIT_RETIRED_GUIDE_REDIRECTS[`${stateSlug}/${citySlug}`];
  if (explicitRedirect) {
    return explicitRedirect;
  }

  const nearestFlagship = findNearestRetainedCityHref(
    stateSlug,
    citySlug,
    true
  );
  if (nearestFlagship) {
    return nearestFlagship;
  }

  const nearestRetainedCity = findNearestRetainedCityHref(
    stateSlug,
    citySlug,
    false
  );
  if (nearestRetainedCity) {
    return nearestRetainedCity;
  }

  if (!hasUsStateGuide(stateSlug)) {
    return null;
  }

  return buildUsStateGuideHref(stateSlug);
};
