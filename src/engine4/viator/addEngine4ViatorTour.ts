import type { Engine4ViatorTourRecord } from "../types";

type AddEngine4ViatorTourInput = {
  productCode: string;
  slug: string;
  state: { name: string; slug: string };
  city: { name: string; slug: string };
  bookingUrl: string;
  heroOverrideUrl?: string;
};

const VIATOR_BOOKING_URL_PATTERN = /^https:\/\/www\.viator\.com\/tours\//i;

export const addEngine4ViatorTour = (
  input: AddEngine4ViatorTourInput
): Engine4ViatorTourRecord => {
  if (!VIATOR_BOOKING_URL_PATTERN.test(input.bookingUrl)) {
    throw new Error(
      "Engine4 Viator tours require canonical Viator booking URLs."
    );
  }

  return {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: input.productCode,
    slug: input.slug,
    destination: {
      country: "United States",
      state: input.state.name,
      stateSlug: input.state.slug,
      city: input.city.name,
      citySlug: input.city.slug,
    },
    bookingUrl: input.bookingUrl,
    heroImage: input.heroOverrideUrl ?? null,
  };
};
