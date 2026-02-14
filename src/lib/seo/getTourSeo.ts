import type { Tour } from "../../data/tours.types";
import {
  buildCanonicalUrl,
  buildImageUrl,
  buildMetaDescription,
  buildTourMetaDescription,
} from "../../utils/seo";

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const getLocationLabel = (tour: Tour) => {
  const stateOrCountry = tour.destination.state || tour.destination.country;
  return stateOrCountry
    ? `${tour.destination.city}, ${stateOrCountry}`
    : tour.destination.city;
};

export const getTourSeo = ({
  tour,
  pathname,
  bookingPage = false,
}: {
  tour: Tour;
  pathname: string;
  bookingPage?: boolean;
}) => {
  const locationLabel = getLocationLabel(tour);
  const title = bookingPage
    ? `Book ${tour.title} | ${locationLabel}`
    : `${tour.title} | ${locationLabel} Outdoor Tour`;

  const primaryDescription = normalizeWhitespace(
    buildTourMetaDescription(tour)
  );
  const fallbackDescription = normalizeWhitespace(
    tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription
  );

  return {
    title,
    description: buildMetaDescription(primaryDescription, fallbackDescription),
    canonicalUrl: buildCanonicalUrl(pathname),
    ogImage: buildImageUrl(tour.heroImage),
  };
};
