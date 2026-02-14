import palmSpringsTours from "../../data/locations/us/california/palm-springs.tours";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../utils/buildFareHarborUrl";


const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

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

const engine2Tours = (
  palmSpringsTours as unknown as readonly Engine2Tour[]
).map(tour => ({
  ...tour,
  booking: {
    ...tour.booking,
    bookingUrl: tour.booking.fareharbor
      ? buildFareHarborUrl({
          company: tour.booking.fareharbor.shortname,
          itemId: tour.booking.fareharbor.itemId,
          calendarPath: tour.booking.bookingUrl,
        })
      : normalizeFareHarborUrl(tour.booking.bookingUrl),
  },
}));

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

export const getEngine2ToursBySourceCity = (citySlug: string) =>
  engine2Tours.filter(tour => tour.sourceCitySlug === citySlug);

export const getTourById = (itemId: string | number) =>
  engine2Tours.find(tour => tour.id === String(itemId)) ?? null;

export const getToursByCity = (stateSlug: string, citySlug: string) =>
  engine2Tours.filter(
    tour =>
      slugify(tour.geo.region) === stateSlug &&
      slugify(tour.geo.city) === citySlug
  );
