import {
  ENGINE6_PILOT_CANONICAL_PATH,
  ENGINE6_PILOT_PRODUCT_CODE,
  ENGINE6_PILOT_SLUG,
} from "../routes";
import type { Engine6FaqItem, Engine6PageData } from "../types";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const asString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const getByPath = (payload: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc === null || acc === undefined) {
      return undefined;
    }
    if (Array.isArray(acc) && /^\d+$/.test(part)) {
      return acc[Number.parseInt(part, 10)];
    }
    const row = asRecord(acc);
    return row ? row[part] : undefined;
  }, payload);
};

const firstNonZeroNumber = (
  payload: Record<string, unknown>,
  paths: string[]
): { value: number; path: string } | null => {
  for (const path of paths) {
    const value = asNumber(getByPath(payload, path));
    if (value && value > 0) {
      return { value, path };
    }
  }

  return null;
};

const firstNumber = (
  payload: Record<string, unknown>,
  paths: string[]
): { value: number; path: string } | null => {
  for (const path of paths) {
    const value = asNumber(getByPath(payload, path));
    if (value !== undefined) {
      return { value, path };
    }
  }

  return null;
};

const firstString = (
  payload: Record<string, unknown>,
  paths: string[]
): { value: string; path: string } | null => {
  for (const path of paths) {
    const value = asString(getByPath(payload, path));
    if (value) {
      return { value, path };
    }
  }

  return null;
};

const stringListFromPath = (payload: Record<string, unknown>, path: string) => {
  const value = getByPath(payload, path);
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map(item => {
      if (typeof item === "string") {
        return item.trim();
      }
      const record = asRecord(item);
      if (!record) {
        return "";
      }
      return (
        asString(record.description) ||
        asString(record.title) ||
        asString(record.text) ||
        asString(record.name)
      );
    })
    .filter(Boolean);
};

const imageUrlListFromPath = (payload: Record<string, unknown>, path: string) => {
  const value = getByPath(payload, path);
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map(item => {
      if (typeof item === "string") {
        return item.trim();
      }
      const record = asRecord(item);
      if (!record) {
        return "";
      }

      const variants = Array.isArray(record.variants) ? record.variants : [];
      const firstVariant = asRecord(variants[0]);
      return asString(firstVariant?.url) || asString(record.url);
    })
    .filter(item => item.startsWith("http"));
};

type ResolvedPrice = {
  value: number;
  path: string;
  currency?: string;
};

const isCommercialPriceLeaf = (leafKey: string, joinedPath: string) => {
  if (/partnerNetPrice|partnerNet/i.test(joinedPath)) {
    return false;
  }

  if (
    /recommendedRetailPrice|recommendedRetailPriceFrom|displayPrice|retailPrice|fromPrice|lowestPrice|finalPrice|advertisedPrice/i.test(
      leafKey
    )
  ) {
    return true;
  }

  if (/amount/i.test(leafKey) && /price|pricing|retail|display|fare/i.test(joinedPath)) {
    return true;
  }

  return false;
};


const resolvePriceFromPricingInfo = (payload: Record<string, unknown>): ResolvedPrice | null => {
  const explicit = firstNonZeroNumber(payload, [
    "pricingInfo.summary.fromPrice",
    "pricingInfo.summary.fromPriceBeforeDiscount",
    "pricingInfo.fromPrice",
    "pricingInfo.priceFrom",
  ]);
  if (explicit) {
    const explicitCurrency =
      firstString(payload, [
        "pricingInfo.summary.currencyCode",
        "pricingInfo.currencyCode",
      ])?.value || undefined;
    return { ...explicit, currency: explicitCurrency };
  }

  const pricingInfo = asRecord(payload.pricingInfo);
  if (!pricingInfo) {
    return null;
  }

  const queue: Array<{ value: unknown; path: string[] }> = [
    { value: pricingInfo, path: ["pricingInfo"] },
  ];

  const commercialMatches: Array<ResolvedPrice & { rank: number }> = [];

  while (queue.length) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    const record = asRecord(current.value);
    if (record) {
      Object.entries(record).forEach(([key, value]) => {
        queue.push({ value, path: [...current.path, key] });
      });
      continue;
    }

    if (Array.isArray(current.value)) {
      current.value.forEach((value, index) => {
        queue.push({ value, path: [...current.path, String(index)] });
      });
      continue;
    }

    const leafKey = current.path[current.path.length - 1] ?? "";
    const amount = asNumber(current.value);
    if (!amount || amount <= 0) {
      continue;
    }

    const joinedPath = current.path.join(".");
    if (!isCommercialPriceLeaf(leafKey, joinedPath)) {
      continue;
    }

    const parentPath = current.path.slice(0, -1).join(".");
    const inferredCurrency =
      asString(getByPath(payload, `${parentPath}.currencyCode`)) ||
      asString(getByPath(payload, `${parentPath}.currency`)) ||
      asString(getByPath(payload, `${parentPath}.currencySymbol`)) ||
      undefined;

    const rank = /recommendedRetailPrice/i.test(leafKey)
      ? 1
      : /displayPrice/i.test(leafKey)
        ? 2
        : /retailPrice|fromPrice/i.test(leafKey)
          ? 3
          : /lowestPrice|advertisedPrice|finalPrice/i.test(leafKey)
            ? 4
            : 5;

    commercialMatches.push({
      value: amount,
      path: joinedPath,
      rank,
      currency: inferredCurrency,
    });
  }

  if (!commercialMatches.length) {
    return null;
  }

  commercialMatches.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return a.value - b.value;
  });

  return {
    value: commercialMatches[0].value,
    path: commercialMatches[0].path,
    currency: commercialMatches[0].currency,
  };
};

const itineraryFromPayload = (payload: Record<string, unknown>) => {
  const itineraryCandidates = [
    "itinerary.itineraryItems",
    "itineraryItems",
    "itinerary",
    "whatToExpect.items",
  ];

  for (const path of itineraryCandidates) {
    const value = getByPath(payload, path);
    if (!Array.isArray(value)) {
      continue;
    }

    const stops = value
      .map(item => {
        const row = asRecord(item);
        if (!row) {
          return null;
        }
        const title =
          asString(row.title) ||
          asString(row.name) ||
          asString(row.label) ||
          "Tour stop";
        const description =
          asString(row.description) ||
          asString(row.text) ||
          asString(row.summary);
        if (!description) {
          return null;
        }

        return {
          title,
          description,
          duration: asString(row.duration) || asString(row.durationText) || undefined,
        };
      })
      .filter((stop): stop is { title: string; description: string; duration?: string } =>
        Boolean(stop)
      );

    if (stops.length > 0) {
      return { stops, path };
    }
  }

  return { stops: [], path: "none" };
};

const buildFallbackFaqs = (payload: Record<string, unknown>): Engine6FaqItem[] => {
  const duration =
    firstString(payload, ["duration", "durationText", "durationFixed"])?.value ??
    "Duration varies by traffic and guide pacing.";
  const cancellation =
    firstString(payload, ["cancellationPolicy.description", "cancellationPolicyText"])?.value ??
    "Check the cancellation details on the booking page.";
  const meeting =
    firstString(payload, ["meetingPoint.description", "meetingPoint.address", "meetingPoint"])?.value ??
    "Meeting point details are provided after booking.";

  return [
    {
      question: "How long is this tour?",
      answer: duration,
    },
    {
      question: "What is the cancellation policy?",
      answer: cancellation,
    },
    {
      question: "Where do we meet?",
      answer: meeting,
    },
  ];
};

export const mapViatorToEngine6PageData = (
  payload: Record<string, unknown>
): Engine6PageData => {
  const title =
    firstString(payload, ["title", "productTitle"])?.value ||
    "Private Tour: Hawaii Volcanoes National Park Eco Tour";

  const heroImage =
    firstString(payload, ["images.0.variants.0.url", "images.0.url"])?.value || "";
  const galleryImages = Array.from(
    new Set([heroImage, ...imageUrlListFromPath(payload, "images")])
  ).filter(Boolean);

  const priceCandidate =
    resolvePriceFromPricingInfo(payload) ??
    firstNonZeroNumber(payload, ["pricing.summary.fromPrice", "pricing.fromPrice", "price.fromPrice", "fromPrice"]);

  if (!priceCandidate) {
    throw new Error(
      "Unable to resolve a non-zero commercial price from Viator payload."
    );
  }

  const ratingCandidate = firstNumber(payload, [
    "reviews.combinedAverageRating",
    "reviews.averageRating",
    "rating",
    "reviews.stats.averageRating",
  ]);
  const reviewCountCandidate = firstNumber(payload, [
    "reviews.totalReviews",
    "reviews.reviewCount",
    "reviewCount",
    "reviews.stats.totalReviews",
  ]);

  const itinerary = itineraryFromPayload(payload);

  const inclusions = stringListFromPath(payload, "inclusions") || [];
  const exclusions = stringListFromPath(payload, "exclusions") || [];
  const highlights =
    stringListFromPath(payload, "highlights") || stringListFromPath(payload, "additionalInfo") || [];

  const faqListRaw = getByPath(payload, "faqs");
  const faqs = Array.isArray(faqListRaw)
    ? faqListRaw
        .map(item => {
          const row = asRecord(item);
          if (!row) {
            return null;
          }
          const question = asString(row.question) || asString(row.title);
          const answer = asString(row.answer) || asString(row.description);
          if (!question || !answer) {
            return null;
          }
          return { question, answer };
        })
        .filter((item): item is Engine6FaqItem => Boolean(item))
    : [];

  const additionalInfo = stringListFromPath(payload, "additionalInfo");
  const meetingPointFull =
    firstString(payload, [
      "meetingPoint.description",
      "logistics.meetingPoint.description",
      "meetingPoint.address",
    ])?.value || "Meeting details are provided after booking.";

  const meetingPointShort =
    firstString(payload, [
      "meetingPoint.name",
      "logistics.meetingPoint.name",
      "meetingPoint.address",
    ])?.value || meetingPointFull;

  const durationText =
    firstString(payload, ["duration", "durationText", "durationFixed"])?.value ||
    "Duration details confirmed after booking";

  const cancellationText =
    firstString(payload, [
      "cancellationPolicy.description",
      "cancellationPolicyText",
      "cancellationPolicy",
    ])?.value || "Cancellation details available at booking.";

  const overview =
    firstString(payload, ["description", "shortDescription", "summary"])?.value || "";

  return {
    productCode: ENGINE6_PILOT_PRODUCT_CODE,
    slug: ENGINE6_PILOT_SLUG,
    canonicalPath: ENGINE6_PILOT_CANONICAL_PATH,
    title,
    heroImage,
    galleryImages,
    fromPrice: priceCandidate.value,
    currency:
      priceCandidate.currency ||
      firstString(payload, [
        "pricingInfo.currencyCode",
        "pricingInfo.summary.currencyCode",
        "pricingInfo.pricingDetails.0.pricingPackage.ageBandPrices.0.price.currencyCode",
        "pricingInfo.pricingDetails.0.pricingPackage.ageBandPrices.0.price.currency",
        "pricing.summary.currency",
        "currencyCode",
        "currency",
      ])?.value ||
      "USD",
    ratingValue: ratingCandidate?.value,
    reviewCount: reviewCountCandidate?.value,
    meetingPointFull,
    meetingPointShort,
    durationText,
    cancellationText,
    overview,
    highlights,
    inclusions,
    exclusions,
    itinerary: itinerary.stops,
    faqs: faqs.length ? faqs : buildFallbackFaqs(payload),
    additionalInfo,
    seo: {
      title,
      description: overview || title,
      canonical: ENGINE6_PILOT_CANONICAL_PATH,
      ogImage: heroImage,
    },
    bookingUrl: firstString(payload, ["productUrl", "webURL", "bookingUrl"])?.value,
    fieldPathAudit: {
      pricePath: priceCandidate.path,
      ratingPath: ratingCandidate?.path ?? "not-found",
      reviewCountPath: reviewCountCandidate?.path ?? "not-found",
      itineraryPath: itinerary.path,
    },
  };
};
