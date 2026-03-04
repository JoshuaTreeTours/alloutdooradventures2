import type { Tour } from "../../data/tours.types";
import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { viatorTours } from "../data/viatorTours";
import { buildEngine3TourPath } from "../buildEngine3TourPath";
import { resolveEngine3PrimaryImage } from "../utils/resolveEngine3PrimaryImage";
import { resolveEngine3ViatorHero } from "../utils/resolveEngine3ViatorHero";
import { buildViatorAffiliateUrl } from "../utils/viatorLinks";

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

export type Engine3MissingHeroEntry = {
  productCode: string;
  slug: string;
  bookingUrl: string;
  canonicalPath: string;
};

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
    .flatMap(tour => {
      const productCode = tour.viator.productCode;
      const productData = viatorProductCacheByCode[productCode];
      const attributedBookingUrl = buildViatorAffiliateUrl({
        baseUrl: productData?.sourceUrl,
        fallbackUrl: tour.viator.url,
        productCode,
      });

      if (!attributedBookingUrl) {
        console.warn(
          `[engine3] Skipping listing entry due to invalid Viator URL for ${productCode}: ${tour.viator.url}`
        );
        return [];
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
      const contentImages = gallery;
      const heroImageOverride = tour.viator.heroImageOverrideUrl;
      const heroImage =
        resolveEngine3ViatorHero({
          bookingProvider: "viator",
          viatorPrimaryImageUrl: primaryImageUrl,
          heroImageOverrideUrl: heroImageOverride,
          contentImages,
          fallbackImageUrl: productData?.supplierImage,
          productCode,
        }) ?? "";

      return [{
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
          heroImage,
          heroImageOverride,
          content: {
            images: contentImages,
          },
          primaryImageUrl: heroImage || undefined,
          galleryImages: Array.from(
            new Set(
              [heroImage, secondaryImageUrl, ...gallery].filter(
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
      } satisfies Engine3ListingEntry];
    });
};

export const getEngine3MissingHeroEntries = (): Engine3MissingHeroEntry[] =>
  viatorTours
    .flatMap(tour => {
      const productCode = tour.viator.productCode;
      const path = buildEngine3TourPath(tour);
      const productData = viatorProductCacheByCode[productCode];
      const contentImages = [
        ...(productData?.imageCandidates ?? []),
        productData?.supplierImage,
      ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
      const hero = resolveEngine3ViatorHero({
        bookingProvider: "viator",
        viatorPrimaryImageUrl: contentImages[0],
        heroImageOverrideUrl: tour.viator.heroImageOverrideUrl,
        contentImages,
        fallbackImageUrl: productData?.supplierImage,
        productCode,
      });

      if (hero) {
        return [];
      }

      return [{
        productCode,
        slug: tour.slug,
        bookingUrl: tour.viator.url,
        canonicalPath: path,
      } satisfies Engine3MissingHeroEntry];
    });
