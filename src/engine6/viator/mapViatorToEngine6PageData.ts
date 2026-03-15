import type { Engine4TourViewModel } from "../../engine4/types";
import {
  ENGINE6_HILO_PILOT_CITY_SLUG,
  ENGINE6_HILO_PILOT_PRODUCT_CODE,
  ENGINE6_HILO_PRICE_PATHS,
  ENGINE6_HILO_PILOT_STATE_SLUG,
  ENGINE6_HILO_PILOT_TOUR_SLUG,
} from "../hiloPilot";

type Engine6MappedPageData = {
  page: Engine4TourViewModel;
  priceDiagnostics: {
    pathsTried: string[];
    selectedPath?: string;
    rawValue?: unknown;
  };
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const cleanText = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map(item => cleanText(item))
        .filter((item): item is string => Boolean(item))
    : [];

const asPathSegment = (segment: string): string | number => {
  if (/^\d+$/.test(segment)) {
    return Number(segment);
  }
  return segment;
};

const readPath = (root: Record<string, unknown>, path: string): unknown => {
  let current: unknown = root;
  for (const rawSegment of path.split(".")) {
    const segment = asPathSegment(rawSegment);

    if (typeof segment === "number") {
      if (!Array.isArray(current) || segment >= current.length) {
        return undefined;
      }
      current = current[segment];
      continue;
    }

    const row = asRecord(current);
    if (!row || !(segment in row)) {
      return undefined;
    }

    current = row[segment];
  }

  return current;
};

const toPriceText = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return `$${value.toFixed(2)}`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const numeric = Number(trimmed.replace(/[^\d.]/g, ""));
    if (Number.isFinite(numeric) && numeric > 0) {
      if (trimmed.startsWith("$")) {
        return trimmed;
      }
      return `$${numeric.toFixed(2)}`;
    }
  }

  const row = asRecord(value);
  if (!row) return undefined;

  return (
    toPriceText(row.formattedValue) ??
    toPriceText(row.formatted) ??
    toPriceText(row.amount) ??
    toPriceText(row.value)
  );
};

const resolvePrice = (product: Record<string, unknown>) => {
  const pathsTried = [...ENGINE6_HILO_PRICE_PATHS];

  for (const path of pathsTried) {
    const rawValue = readPath(product, path);
    const value = toPriceText(rawValue);
    if (value) {
      return { value, pathsTried, selectedPath: path, rawValue };
    }
  }

  return {
    value: undefined,
    pathsTried,
    selectedPath: undefined,
    rawValue: undefined,
  };
};

const pickHeroAndGallery = (product: Record<string, unknown>) => {
  const images = Array.isArray(product.images) ? product.images : [];

  const variants = images
    .map(image => asRecord(image))
    .filter((image): image is Record<string, unknown> => Boolean(image))
    .flatMap(image => {
      const imageVariants = Array.isArray(image.variants) ? image.variants : [];
      return imageVariants
        .map(variant => asRecord(variant))
        .filter((variant): variant is Record<string, unknown> =>
          Boolean(variant)
        )
        .map(variant => ({
          url: cleanText(variant.url),
          width: Number(variant.width ?? 0),
          height: Number(variant.height ?? 0),
          isCover: image.isCover === true,
        }))
        .filter(variant => Boolean(variant.url));
    });

  const hero =
    variants
      .filter(variant => variant.isCover)
      .sort((a, b) => b.width * b.height - a.width * a.height)[0]?.url ??
    variants.sort((a, b) => b.width * b.height - a.width * a.height)[0]?.url ??
    null;

  const gallery = Array.from(
    new Set(
      variants
        .map(variant => variant.url)
        .filter((url): url is string => Boolean(url))
    )
  );

  return { hero, gallery };
};

const parseFaqs = (product: Record<string, unknown>) => {
  const faqs = Array.isArray(product.faqs) ? product.faqs : [];
  return faqs
    .map(item => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map(item => ({
      question: cleanText(item.question) ?? "",
      answer: cleanText(item.answer) ?? "",
    }))
    .filter(item => Boolean(item.question) && Boolean(item.answer));
};

export const mapViatorToEngine6PageData = (
  product: Record<string, unknown>
): Engine6MappedPageData => {
  const title =
    cleanText(product.title) ??
    cleanText(product.productTitle) ??
    "Hilo Volcanoes Eco Tour";
  const overview =
    cleanText(product.shortDescription) ??
    cleanText(product.summary) ??
    cleanText(asRecord(product.description)?.text) ??
    cleanText(product.description) ??
    "Explore Hawaii Volcanoes National Park with a private guide.";
  const bookingUrl =
    cleanText(product.productUrl) ??
    cleanText(product.seoUrl) ??
    "https://www.viator.com/tours/Hilo/Private-Tour-Hawaii-Volcanoes-National-Park-Eco-Tour/d669-11069P1";

  const price = resolvePrice(product);
  const { hero, gallery } = pickHeroAndGallery(product);

  const page: Engine4TourViewModel = {
    tourId: `engine6-${ENGINE6_HILO_PILOT_PRODUCT_CODE}`,
    engine: "engine4",
    bookingProvider: "viator",
    productCode: ENGINE6_HILO_PILOT_PRODUCT_CODE,
    slug: ENGINE6_HILO_PILOT_TOUR_SLUG,
    title,
    canonicalPath: `/destinations/${ENGINE6_HILO_PILOT_STATE_SLUG}/${ENGINE6_HILO_PILOT_CITY_SLUG}/tours/${ENGINE6_HILO_PILOT_TOUR_SLUG}`,
    bookingUrl,
    destination: {
      country: "United States",
      state: "Hawaii",
      stateSlug: ENGINE6_HILO_PILOT_STATE_SLUG,
      city: "Hilo",
      citySlug: ENGINE6_HILO_PILOT_CITY_SLUG,
    },
    heroImage: hero,
    primaryImage: hero,
    galleryImages: gallery,
    facts: {
      priceFrom: price.value,
      ratingValue:
        typeof product.rating === "number" && Number.isFinite(product.rating)
          ? product.rating
          : undefined,
      reviewCount:
        typeof product.reviewCount === "number" &&
        Number.isFinite(product.reviewCount)
          ? product.reviewCount
          : undefined,
      duration: cleanText(product.duration),
      startTime: cleanText(product.startTime),
      meetingPointFull: cleanText(product.meetingPoint),
      meetingPointShort: cleanText(product.meetingPoint)?.split(",")[0],
      cancellationPolicy: cleanText(product.cancellationPolicy),
    },
    content: {
      overview,
      highlights: toStringArray(product.highlights),
      faqs: parseFaqs(product),
      inclusions: toStringArray(product.inclusions),
      exclusions: toStringArray(product.exclusions),
      additionalInfo: toStringArray(product.additionalInfo).join(" "),
    },
  };

  return {
    page,
    priceDiagnostics: {
      pathsTried: price.pathsTried,
      selectedPath: price.selectedPath,
      rawValue: price.rawValue,
    },
  };
};
