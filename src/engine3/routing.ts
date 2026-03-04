import type { Engine2Tour } from "../engine2/data/loadEngine2";

import { buildEngine3TourPath } from "./buildEngine3TourPath";
import { viatorProductCacheByCode } from "./data/viatorProductCache";
import { normalizeViatorTourContent } from "./normalize/normalizeViatorTourContent";
import { viatorTours } from "./data/viatorTours";
import { resolveEngine3PrimaryImage } from "./utils/resolveEngine3PrimaryImage";
import { resolveEngine3ViatorHero } from "./utils/resolveEngine3ViatorHero";
import { buildViatorAffiliateUrl } from "./utils/viatorLinks";

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
  const attributedBookingUrl = buildViatorAffiliateUrl({
    baseUrl: productData?.sourceUrl,
    fallbackUrl: entry.viator.url,
  });

  if (!attributedBookingUrl) {
    console.warn(
      `[engine3] Invalid Viator booking URL for ${entry.viator.productCode}: ${entry.viator.url}`
    );
    return null;
  }

  const normalizedContent = normalizeViatorTourContent({ productData });
  const { secondaryImageUrl, gallery } = resolveEngine3PrimaryImage({
    productCode: entry.viator.productCode,
    imageCandidates: [
      ...(productData?.imageCandidates ?? []),
      productData?.supplierImage,
    ].filter((value): value is string => typeof value === "string"),
    fallbackImageUrl: productData?.supplierImage,
  });

  const contentImages = gallery;
  const heroImage = resolveEngine3ViatorHero({
    bookingProvider: "viator",
    heroImageOverrideUrl: undefined,
    contentImages,
  });

  return {
    id: entry.viator.productCode,
    engine: "engine3",
    bookingProvider: "viator",
    bookingUrl: attributedBookingUrl,
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
      ogImage: heroImage ?? "",
    },
    content: {
      experienceText: normalizedContent.overview ?? productData?.description ?? "",
      overview: normalizedContent.overview,
      highlights: normalizedContent.highlights,
      images: contentImages,
      inclusions: normalizedContent.inclusions,
      exclusions: normalizedContent.exclusions,
      included: normalizedContent.inclusions,
      notIncluded: normalizedContent.exclusions,
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
      hero: heroImage,
      gallery: Array.from(
        new Set(
          [heroImage, secondaryImageUrl, ...gallery].filter(
            (value): value is string => typeof value === "string" && value.length > 0
          )
        )
      ),
    },
    booking: {
      bookingUrl: attributedBookingUrl,
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
