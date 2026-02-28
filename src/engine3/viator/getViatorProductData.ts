import fs from "node:fs/promises";
import path from "node:path";

import type {
  Engine3FaqItem,
  Engine3ItineraryItem,
  ViatorProductData,
} from "../types";

type ViatorCachePayload = {
  cacheVersion: number;
  fetchedAt: string;
  sourceUrl: string;
  data: ViatorProductData;
};

const CACHE_VERSION = 1;
const CACHE_DIR = path.resolve(process.cwd(), "data/cache/viator");

const toNumber = (value: unknown): number | undefined => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const text = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map(item => text(item))
    .filter((item): item is string => Boolean(item));

  return normalized.length ? normalized : undefined;
};

const parseJsonScripts = (html: string): unknown[] => {
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const parsed: unknown[] = [];

  for (const script of scripts) {
    const body = script
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();

    if (!body.startsWith("{") && !body.startsWith("[")) {
      continue;
    }

    try {
      parsed.push(JSON.parse(body));
    } catch {
      // ignore non-json script blocks
    }
  }

  return parsed;
};

const deepFind = (
  input: unknown,
  checker: (node: Record<string, unknown>) => string | number | undefined
): string | number | undefined => {
  if (!input || typeof input !== "object") {
    return undefined;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = deepFind(item, checker);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }

  const record = input as Record<string, unknown>;
  const direct = checker(record);
  if (direct !== undefined) {
    return direct;
  }

  for (const value of Object.values(record)) {
    const found = deepFind(value, checker);
    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
};

const deepFindArrayByKey = (
  input: unknown,
  key: string
): unknown[] | undefined => {
  if (!input || typeof input !== "object") {
    return undefined;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = deepFindArrayByKey(item, key);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  const record = input as Record<string, unknown>;
  const direct = record[key];
  if (Array.isArray(direct)) {
    return direct;
  }

  for (const value of Object.values(record)) {
    const found = deepFindArrayByKey(value, key);
    if (found) {
      return found;
    }
  }

  return undefined;
};

const asItinerary = (value: unknown): Engine3ItineraryItem[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const title = text(record.title) ?? text(record.name);
      const description =
        text(record.description) ??
        text(record.summary) ??
        text(record.details);
      const duration = text(record.duration) ?? text(record.durationText);
      const order = toNumber(record.order) ?? index + 1;

      if (!title && !description && !duration) {
        return null;
      }

      return {
        title,
        description,
        duration,
        order,
      } satisfies Engine3ItineraryItem;
    })
    .filter((entry): entry is Engine3ItineraryItem => Boolean(entry));

  return normalized.length ? normalized : undefined;
};

const asFaqs = (value: unknown): Engine3FaqItem[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map(entry => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const question = text(record.question) ?? text(record.title);
      const answer =
        text(record.answer) ??
        text(
          (record.acceptedAnswer as Record<string, unknown> | undefined)?.text
        );

      if (!question || !answer) {
        return null;
      }

      return {
        question,
        answer,
      };
    })
    .filter((entry): entry is Engine3FaqItem => Boolean(entry));

  return normalized.length ? normalized : undefined;
};

const parseViatorHtml = (
  html: string,
  sourceUrl: string,
  productCode: string
): ViatorProductData => {
  const scripts = parseJsonScripts(html);

  const supplierImage = deepFind(scripts, node =>
    text((node.supplierImages as any)?.[0]?.fullSizeImage?.src)
  );
  const title =
    text(
      deepFind(scripts, node => text(node.title) ?? text(node.name)) as
        | string
        | undefined
    ) ??
    text(html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/\s*\|.*$/, ""));

  const rating = toNumber(
    deepFind(
      scripts,
      node =>
        toNumber((node.aggregateRating as any)?.ratingValue) ??
        toNumber((node.review as any)?.rating)
    )
  );

  const reviewCount = toNumber(
    deepFind(
      scripts,
      node =>
        toNumber((node.aggregateRating as any)?.reviewCount) ??
        toNumber((node.aggregateRating as any)?.ratingCount)
    )
  );

  const priceFrom = text(
    deepFind(scripts, node => {
      const summary = node.summary as Record<string, unknown> | undefined;
      return text(summary?.fromPrice) ?? text(node.fromPrice as string);
    })
  );

  const priceCurrency = text(
    deepFind(scripts, node => {
      const summary = node.summary as Record<string, unknown> | undefined;
      return text(summary?.currencyCode) ?? text(node.priceCurrency as string);
    })
  );

  const itinerary =
    asItinerary(deepFindArrayByKey(scripts, "itineraryItems")) ??
    asItinerary(deepFindArrayByKey(scripts, "itinerary"));

  const faqs =
    asFaqs(deepFindArrayByKey(scripts, "faqs")) ??
    asFaqs(deepFindArrayByKey(scripts, "questions"));

  const meetingPointDescription = text(
    deepFind(scripts, node =>
      text(
        ((node.departureAndReturnLocations as any)?.departureLocations?.[0]
          ?.description as string) ?? (node.meetingPoint as any)?.description
      )
    )
  );

  return {
    sourceUrl,
    productCode,
    title,
    supplierImage:
      typeof supplierImage === "string" ? supplierImage : undefined,
    priceFrom,
    priceCurrency,
    rating,
    reviewCount,
    highlights: asList(
      deepFind(scripts, node =>
        Array.isArray(node.highlights) ? node.highlights : undefined
      )
    ),
    included: asList(
      deepFind(scripts, node =>
        Array.isArray(node.inclusions) ? node.inclusions : undefined
      )
    ),
    notIncluded: asList(
      deepFind(scripts, node =>
        Array.isArray(node.exclusions) ? node.exclusions : undefined
      )
    ),
    meetingPointDescription,
    itinerary,
    faqs,
  };
};

export const getViatorProductData = async ({
  sourceUrl,
  productCode,
}: {
  sourceUrl: string;
  productCode: string;
}): Promise<ViatorCachePayload> => {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${productCode}.json`);

  try {
    const cachedRaw = await fs.readFile(cachePath, "utf8");
    const cached = JSON.parse(cachedRaw) as ViatorCachePayload;
    if (cached.cacheVersion === CACHE_VERSION) {
      return cached;
    }
  } catch {
    // cache miss
  }

  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; AOAEngine3Bot/1.0)",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Viator product: ${response.status}`);
  }

  const html = await response.text();
  const data = parseViatorHtml(html, sourceUrl, productCode);

  const payload: ViatorCachePayload = {
    cacheVersion: CACHE_VERSION,
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    data,
  };

  await fs.writeFile(
    cachePath,
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8"
  );
  return payload;
};
