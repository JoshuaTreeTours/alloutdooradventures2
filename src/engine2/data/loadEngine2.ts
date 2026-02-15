import palmSpringsTours from "./palm-springs.generated";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../utils/buildFareHarborUrl";

export const REQUIRED_FH_URL_34849 =
  "https://fareharbor.com/embeds/book/red-jeep/items/34849/calendar/2026/02/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&marketplace=yes&flow=no&full-items=yes";

export type Engine2Tour = {
  id: string;
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
    ogImage: string | null;
  };
  content: {
    experienceText: string;
    highlights: string[];
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
};

const isAbsoluteUrl = (value: unknown): value is string =>
  typeof value === "string" && /^https?:\/\//.test(value);

const engine2Tours: Engine2Tour[] = (
  palmSpringsTours as unknown as readonly Engine2Tour[]
).map(tour => {
  const canonicalProviderImage = isAbsoluteUrl(tour.seo.ogImage)
    ? tour.seo.ogImage
    : isAbsoluteUrl(tour.images.hero)
      ? tour.images.hero
      : null;

  return {
    ...tour,
    seo: {
      ...tour.seo,
      ogImage: canonicalProviderImage,
    },
    images: {
      ...tour.images,
      hero: canonicalProviderImage,
    },
    booking: {
      ...tour.booking,
      bookingUrl:
        tour.booking.fareharbor?.itemId === "34849"
          ? REQUIRED_FH_URL_34849
          : tour.booking.fareharbor
            ? buildFareHarborUrl({
                company: tour.booking.fareharbor.shortname,
                itemId: tour.booking.fareharbor.itemId,
                calendarPath: tour.booking.bookingUrl,
              })
            : normalizeFareHarborUrl(tour.booking.bookingUrl),
    },
  };
});

const byPath = new Map(
  engine2Tours.map(tour => [tour.seo.canonicalPath, tour])
);

export const getEngine2TourByPath = (path: string): Engine2Tour | null =>
  byPath.get(path) ?? null;

export const getEngine2TourBySlug = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  getEngine2TourByPath(
    `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
  );

export const getAllEngine2Tours = (): Engine2Tour[] => engine2Tours;

export const getEngine2ToursBySourceCity = (citySlug: string): Engine2Tour[] =>
  engine2Tours.filter(tour => tour.sourceCitySlug === citySlug);
