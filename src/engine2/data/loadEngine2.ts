import palmSpringsTours from "./palm-springs.generated";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../utils/buildFareHarborUrl";
import { palmSpringsTourOverrides } from "../content/overrides/palm-springs";

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
    ogImage: string;
  };
  content: {
    experienceText: string;
    highlights: string[];
  };
  images: {
    hero: string;
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

const resolveBookingUrl = (tour: Engine2Tour) =>
  tour.booking.fareharbor
    ? buildFareHarborUrl({
        company: tour.booking.fareharbor.shortname,
        itemId: tour.booking.fareharbor.itemId,
        calendarPath: tour.booking.bookingUrl,
      })
    : normalizeFareHarborUrl(tour.booking.bookingUrl);

const generatedPalmSpringsTours = palmSpringsTours as unknown as readonly Engine2Tour[];

const toursWithOverrides: Engine2Tour[] = generatedPalmSpringsTours.map(tour => ({
  ...tour,
  ...(palmSpringsTourOverrides[tour.id] ?? {}),
})) as Engine2Tour[];

for (const [id, override] of Object.entries(palmSpringsTourOverrides)) {
  const alreadyPresent = toursWithOverrides.some(tour => tour.id === id);
  if (!alreadyPresent) {
    toursWithOverrides.push(override as Engine2Tour);
  }
}

const engine2Tours = toursWithOverrides.map(tour => {
  const shouldPreserveExactBookingUrl = !tour.booking.fareharbor;

  return {
    ...tour,
    booking: {
      ...tour.booking,
      bookingUrl: shouldPreserveExactBookingUrl
        ? tour.booking.bookingUrl
        : resolveBookingUrl(tour),
    },
  };
});

const byPath = new Map(
  engine2Tours.map(tour => [tour.seo.canonicalPath, tour])
);

export const getEngine2TourByPath = (path: string) => byPath.get(path) ?? null;

export const getEngine2TourBySlug = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  getEngine2TourByPath(
    `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
  );

export const getAllEngine2Tours = () => engine2Tours;

export const getEngine2ResolvedBookingUrl = (tour: Engine2Tour) =>
  tour.booking.bookingUrl;

export const getEngine2ToursBySourceCity = (citySlug: string) =>
  engine2Tours.filter(tour => tour.sourceCitySlug === citySlug);
