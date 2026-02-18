import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_CURRENCY, DEFAULT_IMAGE_URL } from "../src/constants/merchantDefaults";
import { getCityTourDetailPath, tours } from "../src/data/tours";
import { applyPriceFloor, formatMerchantPrice, parsePrice } from "../src/utils/merchantPricing";
import { extractPageMetadata } from "./utils/extractPageImage";

const INPUT_PATH = path.resolve(process.cwd(), "data/tourEnrichment.csv");
const OUTPUT_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const TODO_PATH = path.resolve(process.cwd(), "data/merchantFeed.todo.csv");
const DEBUG_PATH = path.resolve(process.cwd(), "data/merchantFeed.debug.csv");

const OUTPUT_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
] as const;

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type CsvRecord = Record<string, string>;
type MerchantRow = Record<OutputHeader, string>;

type TodoRow = {
  id: string;
  title: string;
  link: string;
  reasons: string;
  price_input: string;
  price_output: string;
  image_candidates: string;
};

type DebugRow = {
  id: string;
  title: string;
  status: "kept" | "todo" | "dropped";
  drop_reasons: string;
  link: string;
  allowed_activity: string;
  valid_url: string;
  page_not_found: string;
  price_input: string;
  price_output: string;
  currency_output: string;
  image_provider_csv: string;
  image_enrichment: string;
  image_twitter: string;
  image_og: string;
  image_jsonld: string;
  image_hero_json: string;
  image_selected: string;
};

type ActiveTour = {
  link: string;
  title: string;
  slug: string;
  tags: string[];
  providerImage: string;
};

const DOMAIN = "https://www.alloutdooradventures.com";
const DEFAULT_AVAILABILITY = "in_stock";

const STRICT_PAGE_CHECK = process.env.MERCHANT_STRICT_PAGE_CHECK === "1";

const ALLOWED_ACTIVITY_KEYWORDS = [
  "cycling",
  "biking",
  "bike",
  "hike",
  "hiking",
  "walk",
  "walking",
  "jeep",
  "hummer",
  "off-road",
  "off road",
  "kayak",
  "paddle",
  "surf",
  "boat",
  "sailing",
  "snorkel",
  "dive",
  "rafting",
  "horseback",
  "climbing",
  "canyon",
  "zipline",
  "atv",
  "utv",
  "snowmobile",
  "ski",
  "scooter",
];

const EXCLUDED_KEYWORDS = [
  "brewery",
  "wine",
  "tasting",
  "cocktail",
  "bar",
  "distillery",
  "food",
  "dining",
  "brunch",
  "lunch",
  "dinner",
  "restaurant",
  "cooking class",
  "therapy",
  "virtual",
  "thanksgiving",
  "reservation",
  "field trip",
  "party",
  "family",
  "group",
  "guest",
  "cuddle",
  "cow",
  "turkey",
];

const parseCsv = (content: string): CsvRecord[] => {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!normalized.trim()) {
    return [];
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    const next = normalized[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue);
  rows.push(currentRow);

  const header = rows[0]?.map(column => column.trim()) ?? [];
  return rows.slice(1).map(rowValues => {
    const row: CsvRecord = {};
    header.forEach((column, index) => {
      row[column] = rowValues[index]?.trim() ?? "";
    });
    return row;
  });
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: Array<Record<string, string>>, headers: string[]) => {
  const headerLine = headers.join(",");
  const body = rows
    .map(row => headers.map(header => escapeCsv(row[header] ?? "")).join(","))
    .join("\n");
  return `${headerLine}\n${body}\n`;
};

const isValidHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const sanitizeText = (value: string) => value.trim().toLowerCase();

const hasAnyKeyword = (content: string, keywords: string[]) => {
  const normalized = sanitizeText(content);
  return keywords.some(keyword => normalized.includes(keyword));
};

const isAllowedHighEnergyTour = (
  primaryText: string,
  secondaryTags: string[]
) => {
  const excludedHaystack = [primaryText, ...secondaryTags].join(" ");
  if (hasAnyKeyword(excludedHaystack, EXCLUDED_KEYWORDS)) {
    return false;
  }

  const primaryMatches = hasAnyKeyword(primaryText, ALLOWED_ACTIVITY_KEYWORDS);
  if (primaryMatches) {
    return true;
  }

  return false;
};

const normalizeLink = (pathname: string) => `${DOMAIN}${pathname.replace(/\/+$/, "")}`;

const normalizeSlugBase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/-\d+$/, "");


const toAbsoluteHttpUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed, DOMAIN).toString();
  } catch {
    return "";
  }
};

const selectProviderImage = (candidates: Array<string | undefined>) => {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const absolute = toAbsoluteHttpUrl(candidate);
    if (isValidHttpUrl(absolute) && absolute !== DEFAULT_IMAGE_URL) {
      return absolute;
    }
  }

  return "";
};

const addUniqueMapKey = (
  map: Map<string, ActiveTour | null>,
  key: string,
  value: ActiveTour
) => {
  if (!key.trim()) {
    return;
  }

  if (!map.has(key)) {
    map.set(key, value);
    return;
  }

  const existing = map.get(key);
  if (existing && existing.link !== value.link) {
    map.set(key, null);
  }
};

const buildActiveTourMap = () => {
  const map = new Map<string, ActiveTour | null>();

  tours.forEach(tour => {
    const link = normalizeLink(getCityTourDetailPath(tour));
    const bookingItemId = tour.bookingUrl.match(/\/items\/(\d+)/)?.[1]?.trim() ?? "";

    const activeTour: ActiveTour = {
      link,
      title: tour.title,
      slug: tour.slug,
      providerImage: selectProviderImage([tour.heroImage, ...(tour.galleryImages ?? [])]),
      tags: [
        tour.primaryCategory,
        ...(Array.isArray(tour.categories) ? tour.categories : []),
        ...(Array.isArray(tour.activitySlugs) ? tour.activitySlugs : []),
      ].filter(Boolean) as string[],
    };

    if (bookingItemId) {
      addUniqueMapKey(map, `item:${bookingItemId}`, activeTour);
    }

    if (tour.id?.trim()) {
      addUniqueMapKey(map, `id:${tour.id.trim()}`, activeTour);
    }

    if (tour.slug?.trim()) {
      addUniqueMapKey(map, `slug:${normalizeSlugBase(tour.slug)}`, activeTour);
    }
  });

  return map;
};

const rowLooksLikeTour = (row: CsvRecord, activeTour: ActiveTour) => {
  const rowSlug = row.slug?.trim();
  if (rowSlug) {
    return normalizeSlugBase(rowSlug) === normalizeSlugBase(activeTour.slug);
  }

  const rowTitle = row.title?.trim();
  if (!rowTitle) {
    return true;
  }

  const normalizeTitle = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  return normalizeTitle(rowTitle) === normalizeTitle(activeTour.title);
};

const findActiveTour = (
  map: Map<string, ActiveTour | null>,
  row: CsvRecord,
  tourId: string
): ActiveTour | null => {
  const itemMatch = map.get(`item:${tourId}`);
  if (itemMatch && rowLooksLikeTour(row, itemMatch)) {
    return itemMatch;
  }

  const idMatch = map.get(`id:${tourId}`);
  if (idMatch && rowLooksLikeTour(row, idMatch)) {
    return idMatch;
  }

  const slug = row.slug?.trim();
  if (!slug) {
    return null;
  }

  return map.get(`slug:${normalizeSlugBase(slug)}`) ?? null;
};

const main = async () => {
  const sourceRows = parseCsv(await readFile(INPUT_PATH, "utf8"));
  const activeToursById = buildActiveTourMap();

  const outputRows: MerchantRow[] = [];
  const todoRows: TodoRow[] = [];
  const debugRows: DebugRow[] = [];

  const counters = {
    totalInput: sourceRows.length,
    filteredNotAllowedActivity: 0,
    invalidUrl: 0,
    pageNotFound: 0,
    missingImage: 0,
    keptEligible: 0,
  };

  const todoByReason = new Map<string, number>();

  for (let index = 0; index < sourceRows.length; index += 1) {
    const row = sourceRows[index];
    const tourId = row.tourId?.trim() || `generated-${index + 1}`;
    const activeTour = findActiveTour(activeToursById, row, tourId);

    const title = row.merchant_title?.trim() || row.title?.trim() || activeTour?.title || `Tour ${tourId}`;
    const description = row.merchant_description?.trim() || row.description?.trim() || "";

    const tags = [
      ...(activeTour?.tags ?? []),
      row.slug,
      row.title,
      row.merchant_title,
      row.merchant_description,
      row.description,
    ].filter(Boolean) as string[];

    const primarySignals = [
      title,
      row.slug,
      row.title,
      row.merchant_title,
    ]
      .filter(Boolean)
      .join(" ");

    const allowedActivity = isAllowedHighEnergyTour(primarySignals, tags);

    const rawPrice = parsePrice(row.price);
    const floorApplied = rawPrice === null || rawPrice < 20;
    const finalPrice = applyPriceFloor(rawPrice);
    const currency = floorApplied
      ? DEFAULT_CURRENCY
      : row.currency?.trim().toUpperCase() || DEFAULT_CURRENCY;
    const price = formatMerchantPrice(finalPrice, currency);

    const link = activeTour?.link ?? "";
    const validUrl = isValidHttpUrl(link);

    const pageMetadata = validUrl ? await extractPageMetadata(link) : null;
    const pageNotFound = STRICT_PAGE_CHECK && Boolean(pageMetadata?.pageNotFound);

    const providerImage =
      activeTour?.providerImage || row.image_url?.trim() || row.image?.trim() || "";
    const enrichmentImage = row.image?.trim() || "";
    const twitterImage = pageMetadata?.twitterImage ?? "";
    const ogImage = pageMetadata?.ogImage ?? "";
    const jsonLdImage = pageMetadata?.jsonLdImage ?? "";
    const heroJsonImage = pageMetadata?.heroJsonImage ?? "";

    const imageCandidates = [
      providerImage,
      enrichmentImage,
      twitterImage,
      ogImage,
      jsonLdImage,
      heroJsonImage,
    ];

    const imageLink = imageCandidates.find(candidate => isValidHttpUrl(candidate) && candidate !== DEFAULT_IMAGE_URL) ?? "";

    const reasons: string[] = [];

    if (!allowedActivity) {
      reasons.push("notAllowedActivity");
      counters.filteredNotAllowedActivity += 1;
    }

    if (!validUrl) {
      reasons.push("invalidUrl");
      counters.invalidUrl += 1;
    }

    if (pageNotFound) {
      reasons.push("pageNotFound");
      counters.pageNotFound += 1;
    }

    if (!imageLink) {
      reasons.push("missingImage");
      counters.missingImage += 1;
    }

    if (!description) {
      reasons.push("missingDescription");
    }

    if (rawPrice === null) {
      reasons.push("missingPrice");
      reasons.push("lowPriceFloorApplied");
    } else if (rawPrice < 20) {
      reasons.push("lowPriceFloorApplied");
    }

    const availability = (row.availability ?? "").trim() || DEFAULT_AVAILABILITY;

    const requiredForMerchantFeed = allowedActivity && validUrl && !pageNotFound && Boolean(imageLink);

    if (requiredForMerchantFeed) {
      outputRows.push({
        id: tourId,
        title,
        description: description || `Tour ${tourId}`,
        link,
        image_link: imageLink,
        availability,
        price,
        condition: "new",
      });
      counters.keptEligible += 1;
    }

    if (allowedActivity && validUrl && !pageNotFound) {
      const todoReasons = reasons.filter(reason =>
        ["missingImage", "missingDescription", "missingPrice", "lowPriceFloorApplied"].includes(reason)
      );

      if (todoReasons.length > 0) {
        const reasonValue = todoReasons.join("|");
        todoRows.push({
          id: tourId,
          title,
          link,
          reasons: reasonValue,
          price_input: row.price ?? "",
          price_output: price,
          image_candidates: imageCandidates.filter(Boolean).join(" | "),
        });

        todoReasons.forEach(reason => {
          todoByReason.set(reason, (todoByReason.get(reason) ?? 0) + 1);
        });
      }
    }

    debugRows.push({
      id: tourId,
      title,
      status: requiredForMerchantFeed ? "kept" : allowedActivity && validUrl && !pageNotFound ? "todo" : "dropped",
      drop_reasons: reasons.join("|") || "",
      link,
      allowed_activity: String(allowedActivity),
      valid_url: String(validUrl),
      page_not_found: String(pageNotFound),
      price_input: row.price ?? "",
      price_output: price,
      currency_output: currency,
      image_provider_csv: providerImage,
      image_enrichment: enrichmentImage,
      image_twitter: twitterImage,
      image_og: ogImage,
      image_jsonld: jsonLdImage,
      image_hero_json: heroJsonImage,
      image_selected: imageLink,
    });
  }

  await writeFile(OUTPUT_PATH, toCsv(outputRows as unknown as Array<Record<string, string>>, [...OUTPUT_HEADERS]), "utf8");
  await writeFile(TODO_PATH, toCsv(todoRows as unknown as Array<Record<string, string>>, ["id", "title", "link", "reasons", "price_input", "price_output", "image_candidates"]), "utf8");
  await writeFile(DEBUG_PATH, toCsv(debugRows as unknown as Array<Record<string, string>>, [
    "id",
    "title",
    "status",
    "drop_reasons",
    "link",
    "allowed_activity",
    "valid_url",
    "page_not_found",
    "price_input",
    "price_output",
    "currency_output",
    "image_provider_csv",
    "image_enrichment",
    "image_twitter",
    "image_og",
    "image_jsonld",
    "image_hero_json",
    "image_selected",
  ]), "utf8");

  console.table({
    total_input: counters.totalInput,
    filtered_not_allowed_activity: counters.filteredNotAllowedActivity,
    invalid_url: counters.invalidUrl,
    page_not_found: counters.pageNotFound,
    missing_image: counters.missingImage,
    kept_eligible: counters.keptEligible,
    todo_count: todoRows.length,
  });

  const todoBreakdown = Array.from(todoByReason.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  if (todoBreakdown.length > 0) {
    console.table(
      todoBreakdown.reduce<Record<string, number>>((acc, [reason, count]) => {
        acc[reason] = count;
        return acc;
      }, {})
    );
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
