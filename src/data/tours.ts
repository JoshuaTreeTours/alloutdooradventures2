import type { BookingProvider, Tour } from "./tours.types";
import { toursGenerated } from "./tours.generated";

type ProviderConfig = {
  label: string;
  requiresDisclosure: boolean;
  affiliateDisclosure?: string;
};

const PROVIDER_CONFIG: Record<BookingProvider, ProviderConfig> = {
  fareharbor: {
    label: "FareHarbor",
    requiresDisclosure: true,
    affiliateDisclosure:
      "Affiliate disclosure: This booking link is an affiliate link. If you book, we may earn a commission at no extra cost to you.",
  },
  viator: {
    label: "Viator",
    requiresDisclosure: true,
    affiliateDisclosure:
      "Affiliate disclosure: We may receive a commission when you book through our Viator partner link.",
  },
};

const MANUAL_TOURS: Tour[] = [];

export const tours: Tour[] = [...toursGenerated, ...MANUAL_TOURS];

export const getToursByState = (stateSlug: string) =>
  tours.filter((tour) => tour.destination.stateSlug === stateSlug);

export const getToursByCity = (stateSlug: string, citySlug: string) =>
  tours.filter(
    (tour) =>
      tour.destination.stateSlug === stateSlug &&
      tour.destination.citySlug === citySlug,
  );

export const getTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string,
) =>
  tours.find(
    (tour) =>
      tour.destination.stateSlug === stateSlug &&
      tour.destination.citySlug === citySlug &&
      tour.slug === tourSlug,
  );

export const getToursByActivity = (activitySlug: string) =>
  tours.filter((tour) => tour.activitySlugs.includes(activitySlug));

export const getTourDetailPath = (tour: Tour) =>
  `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`;

export const getCityTourDetailPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

export const getCityTourBookingPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}/book`;

export const getBookCtaUrl = (tour: Tour) => {
  if (tour.bookingProvider === "fareharbor") {
    return tour.bookingUrl;
  }

  return tour.bookingUrl;
};

export const getAffiliateDisclosure = (tour: Tour) =>
  PROVIDER_CONFIG[tour.bookingProvider].affiliateDisclosure;

export const getProviderLabel = (provider: BookingProvider) =>
  PROVIDER_CONFIG[provider].label;
