import type { Tour } from "../../data/tours.types";
import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { viatorTours } from "../data/viatorTours";
import { buildEngine3TourPath } from "../routing/buildEngine3TourPath";
import { selectEngine3PrimaryImage } from "../utils/selectEngine3PrimaryImage";

type Engine3ListingEntry = {
  tour: Tour;
  href: string;
};

const toTitleCase = (value: string): string =>
  value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getEngine3ListingEntries = (
  stateSlug: string,
  citySlug: string
): Engine3ListingEntry[] => {
  return viatorTours
    .filter(
      tour =>
        (tour.destination.state ?? tour.destination.region) === stateSlug &&
        tour.destination.city === citySlug
    )
    .map(tour => {
      const productCode = tour.viator.productCode;
      const productData = viatorProductCacheByCode[productCode];
      const primaryImageUrl =
        selectEngine3PrimaryImage({
          viatorImageCandidates: [
            tour.viator.heroImageOverrideUrl,
            ...(productData?.imageCandidates ?? []),
          ],
          fallbackImageUrl: productData?.supplierImage,
        }) ?? "";
      const href = buildEngine3TourPath(tour);

      return {
        href,
        tour: {
          id: `engine3-${productCode}`,
          engine: "engine3",
          productCode,
          slug: href.split("/").at(-1) ?? "",
          title: productData?.title ?? toTitleCase(tour.slug),
          shortDescription: productData?.highlights?.[0],
          operator: productData?.operatorName,
          categories: ["adventure"],
          primaryCategory: "adventure",
          destination: {
            country: "United States",
            state: "California",
            stateSlug,
            city: "Palm Springs",
            citySlug,
            lat: productData?.latitude,
            lng: productData?.longitude,
          },
          heroImage: primaryImageUrl || "/hero.jpg",
          primaryImageUrl: primaryImageUrl || "/hero.jpg",
          galleryImages: primaryImageUrl ? [primaryImageUrl] : [],
          badges: {
            rating: productData?.rating,
            reviewCount: productData?.reviewCount,
          },
          activitySlugs: ["adventure"],
          bookingProvider: "viator",
          bookingUrl: tour.viator.url,
          longDescription: productData?.description ?? "",
        },
      } satisfies Engine3ListingEntry;
    });
};
