import cityToursData from "../../../data/generated/arizona.sedona.tours.json";

type CityToursPayload = {
  state: string;
  city: string;
  tours: CityTour[];
};

export type CityTour = {
  id: string;
  slug: string;
  title: string;
  operator: string;
  operatorSlug: string;
  location: string;
  tags: string[];
  tagline: string;
  imageUrl: string;
  bookingUrl: string;
  bookingWidgetUrl: string;
  shortDescription: string;
};

const { tours } = cityToursData as CityToursPayload;

const tourBySlug = new Map(tours.map((tour) => [tour.slug, tour]));

export const cityTours = tours;

export const getCityTourBySlug = (slug: string) => tourBySlug.get(slug);

export const getCityTourPath = (slugOrTour: string | CityTour) => {
  const slug = typeof slugOrTour === "string" ? slugOrTour : slugOrTour.slug;
  return "/arizona/sedona/" + slug;
};

export const getCityTourBookingPath = (slugOrTour: string | CityTour) => {
  const slug = typeof slugOrTour === "string" ? slugOrTour : slugOrTour.slug;
  return "/arizona/sedona/book/" + slug;
};
