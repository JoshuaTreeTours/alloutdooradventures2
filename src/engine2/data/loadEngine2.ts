import palmSpringsTours from "./palm-springs.generated";
import californiaEngine2Tours, {
  californiaEngine2CitiesIndex,
} from "./california.generated";
import canadaEngine2Tours, {
  canadaEngine2CitiesIndex,
  canadaEngine2ProvincesIndex,
} from "./canada.generated";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../utils/buildFareHarborUrl";
import { loadCanoeingEngine2Tours } from "./canoeingTours";
import { loadOregonEngine2Tours } from "./oregonTours";
import { loadMinnesotaEngine2Tours } from "./minnesotaTours";
import { loadAlaskaEngine2Tours } from "./alaskaTours";
import { getEngine2HawaiiTours } from "./hawaiiTours";
import getMexicoTours from "./mexicoTours";
import { getEngine2CancunTours } from "./cancunTours";
import { getEngine2PuertoVallartaTours } from "./puertoVallartaTours";
import { getEngine2CaboTours } from "./caboTours";
import { getEngine2MexicoCityTours } from "./mexicoCityTours";
import { getEngine2AmsterdamTours } from "./amsterdamTours";
import { getEngine2SpainTours as loadEngine2SpainTours } from "./spainTours";
import { getEngine2ParisTours } from "./parisTours";
import { isTourRemoved } from "../../utils/tours/isTourRemoved";

export type Engine2Tour = {
  id: string;
  bookingProvider?: "fareharbor" | "viator";
  bookingUrl?: string;
  sourceDatasetKey?: string;
  sourceCountrySlug?: string;
  sourceProvinceSlug?: string;
  sourceCitySlug: string;
  slug: string;
  name: string;
  provider: {
    name: string;
    shortName: string;
    email?: string;
    phone?: string;
  };
  geo: {
    country: string;
    region: string;
    city: string;
    lat: number | null;
    lng: number | null;
  };
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
    ogImage: string;
  };
  content: {
    experienceText: string;
    highlights: string[];
    included?: string[];
    notIncluded?: string[];
    itinerary?: Array<{
      title: string;
      description?: string;
      duration?: string;
    }>;
    faqs?: Array<{ question: string; answer: string }>;
    meetingPoint?: {
      name?: string;
      address?: string;
    };
    duration?: string;
  };
  images: {
    hero: string | null;
    gallery: string[];
  };
  booking: {
    bookingUrl: string;
    fareharbor?: {
      shortname: string;
      itemId: string;
      refUrl: string;
      backUrl: string;
    };
  };
  pricing?: {
    price?: string;
    currency?: string;
    priceRange?: string;
  };
  viatorRatingValue?: number | null;
  viatorReviewCount?: number | null;
};

const getBestFareHarborImage = (tour: Engine2Tour) => {
  if (tour.bookingProvider === "viator") {
    return tour.images?.hero ?? null;
  }

  if (tour.images?.gallery?.length) {
    return tour.images.gallery[0];
  }

  if (tour.seo?.ogImage) {
    return tour.seo.ogImage;
  }

  if (tour.images?.hero) {
    return tour.images.hero;
  }

  return null;
};

const mergeEngine2Tours = (datasets: Engine2Tour[][]) => {
  const byTourId = new Map<string, Engine2Tour>();
  const byCanonicalPath = new Map<string, Engine2Tour>();

  for (const tours of datasets) {
    for (const tour of tours) {
      if (
        byTourId.has(tour.id) ||
        byCanonicalPath.has(tour.seo.canonicalPath)
      ) {
        continue;
      }

      byTourId.set(tour.id, tour);
      byCanonicalPath.set(tour.seo.canonicalPath, tour);
    }
  }

  return Array.from(byTourId.values());
};

const allGeneratedTours = mergeEngine2Tours([
  [...(palmSpringsTours as unknown as readonly Engine2Tour[])],
  [...(californiaEngine2Tours as unknown as readonly Engine2Tour[])],
  [...(canadaEngine2Tours as unknown as readonly Engine2Tour[])],
  loadCanoeingEngine2Tours(),
  loadOregonEngine2Tours(),
  loadMinnesotaEngine2Tours(),
  loadAlaskaEngine2Tours(),
  getEngine2HawaiiTours(),
  getMexicoTours(),
  getEngine2CancunTours(),
  getEngine2PuertoVallartaTours(),
  getEngine2CaboTours(),
  getEngine2MexicoCityTours(),
  getEngine2AmsterdamTours(),
  loadEngine2SpainTours(),
  getEngine2ParisTours(),
]);

const engine2Tours: Engine2Tour[] = allGeneratedTours
  .filter(
    tour =>
      !isTourRemoved({
        tourId: tour.id,
        operatorName: tour.provider.name,
        operatorShortName: tour.provider.shortName,
      })
  )
  .map(tour => ({
    ...tour,
    bookingProvider: tour.bookingProvider ?? "fareharbor",
    images: {
      ...tour.images,
      hero: getBestFareHarborImage(tour),
    },
    booking: {
      ...tour.booking,
      bookingUrl:
        (tour.bookingProvider ?? "fareharbor") === "fareharbor" &&
        tour.booking.fareharbor
          ? buildFareHarborUrl({
              company: tour.booking.fareharbor.shortname,
              itemId: tour.booking.fareharbor.itemId,
              calendarPath: tour.booking.bookingUrl,
            })
          : normalizeFareHarborUrl(tour.booking.bookingUrl),
    },
    bookingUrl:
      (tour.bookingProvider ?? "fareharbor") === "fareharbor" &&
      tour.booking.fareharbor
        ? buildFareHarborUrl({
            company: tour.booking.fareharbor.shortname,
            itemId: tour.booking.fareharbor.itemId,
            calendarPath: tour.booking.bookingUrl,
          })
        : normalizeFareHarborUrl(tour.booking.bookingUrl),
  }));

const byPath = new Map(
  engine2Tours.map(tour => [tour.seo.canonicalPath, tour])
);

export type Engine2CityIndexEntry = {
  cityName: string;
  citySlug: string;
  tourCount: number;
  sampleImages: string[];
};

export const getEngine2CityIndex = (): Engine2CityIndexEntry[] =>
  (
    [
      ...(californiaEngine2CitiesIndex as unknown as Engine2CityIndexEntry[]),
      ...(canadaEngine2CitiesIndex as unknown as Engine2CityIndexEntry[]),
    ] as Engine2CityIndexEntry[]
  ).map(entry => ({
    cityName: entry.cityName,
    citySlug: entry.citySlug,
    tourCount: Number(entry.tourCount) || 0,
    sampleImages: Array.isArray(entry.sampleImages)
      ? [...entry.sampleImages]
      : [],
  }));

export const getEngine2TourByPath = (path: string): Engine2Tour | null =>
  byPath.get(path) ?? null;

export const getEngine2TourBySlug = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  getEngine2TourByPath(
    `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
  ) ??
  getEngine2TourByPath(
    `/destinations/united-states/${stateSlug}/${citySlug}/tours/${tourSlug}`
  );

export const getAllEngine2Tours = (): Engine2Tour[] => engine2Tours;

export const getEngine2CanadaTours = (): Engine2Tour[] =>
  engine2Tours.filter(tour => tour.sourceCountrySlug === "canada");

export const getEngine2CanadaTourBySlug = (
  provinceSlug: string,
  citySlug: string,
  tourSlug: string
): Engine2Tour | null =>
  engine2Tours.find(
    tour =>
      tour.sourceCountrySlug === "canada" &&
      tour.sourceProvinceSlug === provinceSlug &&
      tour.sourceCitySlug === citySlug &&
      tour.slug === tourSlug
  ) ?? null;

export const getEngine2MexicoTours = (): Engine2Tour[] =>
  engine2Tours.filter(tour => tour.sourceCountrySlug === "mexico");

export const getEngine2SpainTours = (): Engine2Tour[] =>
  engine2Tours.filter(tour => tour.sourceCountrySlug === "spain");

export const getEngine2CanadaTourByTourSlug = (
  tourSlug: string
): Engine2Tour | null =>
  engine2Tours.find(
    tour => tour.sourceCountrySlug === "canada" && tour.slug === tourSlug
  ) ?? null;

export type Engine2CanadaProvinceIndexEntry = {
  provinceName: string;
  provinceSlug: string;
  tourCount: number;
  cities: Array<{ cityName: string; citySlug: string; tourIds: string[] }>;
};

export const getEngine2CanadaProvinceIndex =
  (): Engine2CanadaProvinceIndexEntry[] =>
    (
      canadaEngine2ProvincesIndex as unknown as Engine2CanadaProvinceIndexEntry[]
    ).map(province => ({
      ...province,
      cities: province.cities.map(city => ({
        ...city,
        tourIds: [...city.tourIds],
      })),
    }));

export const getEngine2ToursBySourceCity = (citySlug: string): Engine2Tour[] =>
  engine2Tours.filter(tour => tour.sourceCitySlug === citySlug);

export const getEngine2ToursByStateSlug = (
  stateSlug: string,
  citySlug?: string
): Engine2Tour[] => {
  const directBase = citySlug
    ? `/destinations/${stateSlug}/${citySlug}/tours/`
    : `/destinations/${stateSlug}/`;
  const usBase = citySlug
    ? `/destinations/united-states/${stateSlug}/${citySlug}/tours/`
    : `/destinations/united-states/${stateSlug}/`;

  return engine2Tours.filter(tour => {
    const path = tour.seo.canonicalPath;
    if (citySlug) {
      return path.startsWith(directBase) || path.startsWith(usBase);
    }

    const isStatePath = path.startsWith(directBase) || path.startsWith(usBase);
    return (
      isStatePath &&
      path.includes("/tours/") &&
      !path.startsWith("/destinations/world/")
    );
  });
};
