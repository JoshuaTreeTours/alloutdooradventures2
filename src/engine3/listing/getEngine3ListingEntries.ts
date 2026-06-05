import type { Tour } from "../../data/tours.types";
import { classifyTourCategories } from "../../lib/tourCategoryClassifier";
import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { viatorTours } from "../data/viatorTours";
import { buildEngine3TourPath } from "../buildEngine3TourPath";
import { resolveEngine3PrimaryImage } from "../utils/resolveEngine3PrimaryImage";
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

const toEngine3ListingEntry = (
  tour: (typeof viatorTours)[number]
): Engine3ListingEntry | null => {
  const productCode = tour.viator.productCode;
  const productData = viatorProductCacheByCode[productCode];
  const attributedBookingUrl = buildViatorAffiliateUrl({
    baseUrl: productData?.sourceUrl,
    fallbackUrl: tour.viator.url,
  });

  if (!attributedBookingUrl) {
    console.warn(
      `[engine3] Skipping listing entry due to invalid Viator URL for ${productCode}: ${tour.viator.url}`
    );
    return null;
  }

  const { primaryImageUrl, secondaryImageUrl, gallery } =
    resolveEngine3PrimaryImage({
      productCode,
      imageCandidates: [
        ...(productData?.imageCandidates ?? []),
        productData?.supplierImage,
      ].filter((value): value is string => typeof value === "string"),
      fallbackImageUrl: productData?.supplierImage,
    });
  const href = buildEngine3TourPath(tour);

  const classification = classifyTourCategories({
    title: productData?.title ?? toTitleCase(tour.slug),
    overview: productData?.description,
    description: productData?.description,
    highlights: productData?.highlights,
    categories: ["adventure"],
  });

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
      primaryDisplayCategory:
        classification.primaryDisplayCategory ?? undefined,
      activityCategories: classification.activityCategories,
      destination: {
        country: "United States",
        state: toTitleCase(
          tour.destination.state ?? tour.destination.region ?? "california"
        ),
        stateSlug:
          tour.destination.state ?? tour.destination.region ?? "california",
        city: toTitleCase(tour.destination.city),
        citySlug: tour.destination.city,
        lat: productData?.latitude,
        lng: productData?.longitude,
      },
      heroImage: primaryImageUrl ?? "",
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
};

export const getAllEngine3ListingEntries = (): Engine3ListingEntry[] =>
  viatorTours
    .map(toEngine3ListingEntry)
    .filter((entry): entry is Engine3ListingEntry => Boolean(entry));

export const getEngine3ListingEntries = (
  stateSlug: string,
  citySlug: string
): Engine3ListingEntry[] =>
  getAllEngine3ListingEntries().filter(
    entry =>
      entry.tour.destination.stateSlug === stateSlug &&
      entry.tour.destination.citySlug === citySlug
  );
