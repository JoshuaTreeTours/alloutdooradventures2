import type { Engine2Tour } from "../engine2/data/loadEngine2";

import { buildEngine3TourPath } from "./buildEngine3TourPath";
import { viatorProductCacheByCode } from "./data/viatorProductCache";
import { viatorTours } from "./data/viatorTours";
import { resolveEngine3PrimaryImage } from "./utils/resolveEngine3PrimaryImage";

export const getEngine3TourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
): Engine2Tour | null => {
  const path = `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`;
  const entry = viatorTours.find(tour => buildEngine3TourPath(tour) === path);

  if (!entry) {
    return null;
  }

  const productData = viatorProductCacheByCode[entry.viator.productCode];
  const { primaryImageUrl, secondaryImageUrl, gallery } = resolveEngine3PrimaryImage({
    productCode: entry.viator.productCode,
    imageCandidates: [
      ...(productData?.imageCandidates ?? []),
      productData?.supplierImage,
    ].filter((value): value is string => typeof value === "string"),
    fallbackImageUrl: productData?.supplierImage,
  });

  return {
    id: entry.viator.productCode,
    engine: "engine3",
    bookingProvider: "viator",
    bookingUrl: entry.viator.url,
    sourceCitySlug: entry.destination.city,
    slug: `${entry.slug}-${entry.viator.productCode.toLowerCase()}`,
    name: productData?.title ?? entry.slug,
    provider: {
      name: productData?.operatorName ?? "Viator Operator",
      shortName: "viator",
    },
    geo: {
      country: "United States",
      region: "California",
      city: "Palm Springs",
      lat: productData?.latitude ?? null,
      lng: productData?.longitude ?? null,
    },
    seo: {
      title: productData?.title ?? entry.slug,
      description: productData?.description ?? "",
      canonicalPath: path,
      ogImage: primaryImageUrl ?? "",
    },
    content: {
      experienceText: productData?.description ?? "",
      highlights: productData?.highlights ?? [],
      included: productData?.included,
      notIncluded: productData?.notIncluded,
      faqs: productData?.faqs,
      itinerary: productData?.itinerary?.map(item => ({
        title: item.title ?? "",
        description: item.description,
        duration: item.duration,
      })),
      meetingPoint: {
        instructions: productData?.meetingPointDescription,
      },
      duration: productData?.duration,
    },
    images: {
      hero: primaryImageUrl,
      gallery: Array.from(
        new Set(
          [primaryImageUrl, secondaryImageUrl, ...gallery].filter(
            (value): value is string => typeof value === "string" && value.length > 0
          )
        )
      ),
    },
    booking: {
      bookingUrl: entry.viator.url,
    },
    pricing: {
      price: productData?.priceFrom,
      currency: productData?.priceCurrency,
    },
    viatorRatingValue: productData?.rating ?? null,
    viatorReviewCount: productData?.reviewCount ?? null,
  };
};

export const resolveEngine3Route = getEngine3TourBySlugs;

export { buildEngine3TourPath };
