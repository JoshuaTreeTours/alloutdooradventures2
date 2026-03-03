import type { Tour } from "../../data/tours.types";
import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { viatorTours } from "../data/viatorTours";
import { buildEngine3TourPath } from "../buildEngine3TourPath";
import { resolveEngine3PrimaryImage } from "../utils/resolveEngine3PrimaryImage";
import { buildViatorAffiliateUrl } from "../viator/buildViatorAffiliateUrl";

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
      const attributedBookingUrl = buildViatorAffiliateUrl(tour.viator.url);

      if (!attributedBookingUrl) {
        console.warn(
          `[engine3] Skipping listing entry due to invalid Viator URL for ${productCode}: ${tour.viator.url}`
        );
        return null;
      }

      const { primaryImageUrl, secondaryImageUrl, gallery } = resolveEngine3PrimaryImage({
        productCode,
        imageCandidates: [
          ...(productData?.imageCandidates ?? []),
          productData?.supplierImage,
        ].filter((value): value is string => typeof value === "string"),
        fallbackImageUrl: productData?.supplierImage,
      });
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
          heroImage: primaryImageUrl,
          primaryImageUrl,
          galleryImages: Array.from(
            new Set(
              [primaryImageUrl, secondaryImageUrl, ...gallery].filter(
                (value): value is string =>
                  typeof value === "string" && value.length > 0
              )
            )
          ),
          badges: {
            rating: productData?.rating,
            reviewCount: productData?.reviewCount,
          },
          activitySlugs: ["adventure"],
          bookingProvider: "viator",
          bookingUrl: attributedBookingUrl,
          longDescription: productData?.description ?? "",
        },
      } satisfies Engine3ListingEntry;
    })
    .filter((entry): entry is Engine3ListingEntry => Boolean(entry));
};
