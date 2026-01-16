import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Tour } from "../src/data/tours.types";

const DATA_DIR = path.resolve("data");
const NORTHEAST_DIR = path.resolve("data/northeast");
const DEEP_SOUTH_DIR = path.resolve("data/deep-south");
const OUTPUT_PATH = path.resolve("src/data/tours.generated.ts");
const NORTHEAST_OUTPUT_PATH = path.resolve("src/data/northeast.generated.ts");
const DEEP_SOUTH_OUTPUT_PATH = path.resolve("src/data/deepSouth.generated.ts");
const PLACEHOLDER_IMAGE = "/hero.jpg";
const CATEGORY_FILES = [
  { filename: "cycling2.csv", activitySlug: "cycling" },
  { filename: "hiking.csv", activitySlug: "hiking" },
  { filename: "canoeing.csv", activitySlug: "canoeing" },
  { filename: "san-francisco.csv", activitySlug: "detours" },
  { filename: "san-diego.csv", activitySlug: "detours" },
  { filename: "santa-barbara.csv", activitySlug: "detours" },
  { filename: "palm-springs.csv", activitySlug: "detours" },
  { filename: "joshua-tree.csv", activitySlug: "detours" },
] as const;

const REQUIRED_COLUMNS = ["location", "item_name"] as const;
const OPTIONAL_COLUMNS = [
  "company_name",
  "company_shortname",
  "location_lat",
  "location_long",
  "item_id",
  "category",
  "tags",
  "image_url",
  "calendar_link",
  "regular_link",
  "booking_url",
  "short_description",
  "operator",
  "availability_count",
  "quality_score",
] as const;
const CATEGORY_PRIORITY = ["canoeing", "cycling", "hiking"] as const;
const NORTHEAST_STATE_SLUGS = new Set([
  "connecticut",
  "district-of-columbia",
  "maine",
  "maryland",
  "massachusetts",
  "new-hampshire",
  "new-jersey",
  "new-york",
  "pennsylvania",
  "rhode-island",
  "vermont",
]);
const DEEP_SOUTH_STATE_SLUGS = new Set([
  "florida",
  "georgia",
  "louisiana",
  "north-carolina",
  "south-carolina",
  "tennessee",
]);
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  hiking: [
    "hike",
    "hiking",
    "trek",
    "trail",
    "walking",
    "nature walk",
    "summit",
    "canyon",
    "mountain",
    "ridge",
    "overlook",
  ],
  cycling: [
    "bike",
    "biking",
    "cycling",
    "e-bike",
    "ebike",
    "road ride",
    "gravel",
    "mtb",
    "mountain bike",
  ],
  canoeing: [
    "canoe",
    "paddling",
    "paddle",
    "river trip",
    "lake paddle",
    "water trail",
    "swamp paddle",
    "bayou paddle",
    "kayak",
  ],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const listCsvFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listCsvFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".csv")) {
      files.push(fullPath);
    }
  }

  return files;
};

const splitCsvLine = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(current);
      current = "";
      if (row.length > 1 || row[0]?.trim()) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (contents: string) => {
  const rows = splitCsvLine(contents);
  const [header, ...dataRows] = rows;
  if (!header) {
    return { header: [], records: [] };
  }

  const records = dataRows.map((row) => {
    const record: Record<string, string> = {};
    header.forEach((column, index) => {
      record[column] = row[index] ?? "";
    });
    return record;
  });

  return { header, records };
};

const parseLocation = (location: string) => {
  const segments = location.split("/").map((segment) => segment.trim());
  const city = segments.at(-1) || "Unknown";
  const state =
    segments.length >= 3 ? segments[1] || "Unknown" : segments.at(-2) || "Unknown";
  return {
    state,
    stateSlug: slugify(state),
    city,
    citySlug: slugify(city),
  };
};

const parseTags = (rawTags: string) =>
  rawTags
    .split(/[-|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

const normalizeCategory = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const normalized = value.toLowerCase().trim();
  if (CATEGORY_KEYWORDS.canoeing.some((keyword) => normalized.includes(keyword))) {
    return "canoeing";
  }
  if (CATEGORY_KEYWORDS.cycling.some((keyword) => normalized.includes(keyword))) {
    return "cycling";
  }
  if (CATEGORY_KEYWORDS.hiking.some((keyword) => normalized.includes(keyword))) {
    return "hiking";
  }
  return undefined;
};

const inferCategoriesFromText = (text: string) => {
  const normalized = text.toLowerCase();
  return Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) =>
      keywords.some((keyword) => normalized.includes(keyword)),
    )
    .map(([category]) => category);
};

const sortByPriority = (categories: string[]) =>
  Array.from(new Set(categories)).sort(
    (a, b) =>
      CATEGORY_PRIORITY.indexOf(a as (typeof CATEGORY_PRIORITY)[number]) -
      CATEGORY_PRIORITY.indexOf(b as (typeof CATEGORY_PRIORITY)[number]),
  );

const resolveActivitySlugs = ({
  fallbackActivity,
  explicitCategory,
  title,
  shortDescription,
  tags,
  logPrefix,
}: {
  fallbackActivity?: string;
  explicitCategory?: string;
  title: string;
  shortDescription?: string;
  tags: string[];
  logPrefix: string;
}) => {
  const inferred = inferCategoriesFromText(
    [title, shortDescription, tags.join(" ")].filter(Boolean).join(" "),
  );
  const normalizedExplicit = normalizeCategory(explicitCategory) ?? fallbackActivity;
  const categories = new Set<string>([
    ...(normalizedExplicit ? [normalizedExplicit] : []),
    ...inferred,
  ]);

  if (categories.size === 0) {
    console.warn(
      `[import] ${logPrefix} missing category keywords; defaulting to hiking.`,
    );
    categories.add("hiking");
  }

  const ordered = sortByPriority(Array.from(categories));
  const primary =
    normalizedExplicit ??
    CATEGORY_PRIORITY.find((category) => categories.has(category)) ??
    ordered[0];

  return {
    activitySlugs: primary ? [primary, ...ordered.filter((slug) => slug !== primary)] : ordered,
    primaryCategory: primary ?? ordered[0],
  };
};

const buildLongDescription = (title: string, city: string, state: string) =>
  `${title} is a guided outdoor experience based in ${city}, ${state} that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.`;

const parseNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildRating = (qualityScore?: number) => {
  if (!qualityScore) {
    return undefined;
  }

  const rating = Math.round((qualityScore / 20) * 10) / 10;
  return Math.min(Math.max(rating, 1), 5);
};

const requiredColumnsMissing = (header: string[]) =>
  REQUIRED_COLUMNS.filter((column) => !header.includes(column));

const optionalColumnsMissing = (header: string[]) =>
  OPTIONAL_COLUMNS.filter((column) => !header.includes(column));

type CitySeed = {
  name: string;
  slug: string;
  stateName: string;
  stateSlug: string;
  latValues: number[];
  lngValues: number[];
  heroImages: Set<string>;
  activitySlugs: Set<string>;
};

type StateSeed = {
  name: string;
  slug: string;
  cities: Map<string, CitySeed>;
};

const addRegionSeed = (
  stateMap: Map<string, StateSeed>,
  {
    state,
    stateSlug,
    city,
    citySlug,
    lat,
    lng,
    heroImage,
    activitySlugs,
  }: {
    state: string;
    stateSlug: string;
    city: string;
    citySlug: string;
    lat?: number;
    lng?: number;
    heroImage?: string;
    activitySlugs: string[];
  },
) => {
  if (!state || !city || state === "Unknown" || city === "Unknown") {
    return;
  }

  const stateEntry =
    stateMap.get(stateSlug) ??
    (() => {
      const next = { name: state, slug: stateSlug, cities: new Map() };
      stateMap.set(stateSlug, next);
      return next;
    })();

  const cityEntry =
    stateEntry.cities.get(citySlug) ??
    (() => {
      const next: CitySeed = {
        name: city,
        slug: citySlug,
        stateName: state,
        stateSlug,
        latValues: [],
        lngValues: [],
        heroImages: new Set(),
        activitySlugs: new Set(),
      };
      stateEntry.cities.set(citySlug, next);
      return next;
    })();

  if (typeof lat === "number") {
    cityEntry.latValues.push(lat);
  }
  if (typeof lng === "number") {
    cityEntry.lngValues.push(lng);
  }
  if (heroImage) {
    cityEntry.heroImages.add(heroImage);
  }
  activitySlugs.forEach((slug) => cityEntry.activitySlugs.add(slug));
};

const buildAverageCoordinate = (values: number[]) => {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return Number.NaN;
  }
  const sum = valid.reduce((total, value) => total + value, 0);
  return sum / valid.length;
};

const buildActivityTags = (slugs: string[]) =>
  slugs.length ? slugs : ["cycling", "hiking", "canoeing"];

const buildThingsToDo = (cityName: string, tags: string[]) => {
  const items = [
    ...tags.map((tag) => {
      if (tag === "cycling") {
        return `Ride a scenic bike loop around ${cityName}.`;
      }
      if (tag === "canoeing") {
        return `Plan a paddle or canoe outing near ${cityName}.`;
      }
      return `Hike a scenic trail with views around ${cityName}.`;
    }),
    `Explore a local park or nature preserve near ${cityName}.`,
    `Catch golden hour at a nearby viewpoint.`,
    `Stroll a waterfront trail or greenway in ${cityName}.`,
  ];

  return Array.from(new Set(items)).slice(0, 5);
};

const buildCityNarrative = (city: CitySeed, regionName: string) => {
  const activityTags = buildActivityTags(Array.from(city.activitySlugs));
  const activityList = activityTags.join(", ");
  const heroImages = Array.from(city.heroImages).slice(0, 3);
  const heroImagesWithFallback =
    heroImages.length > 0 ? heroImages : [PLACEHOLDER_IMAGE];
  const lat = buildAverageCoordinate(city.latValues);
  const lng = buildAverageCoordinate(city.lngValues);

  return {
    name: city.name,
    slug: city.slug,
    stateSlug: city.stateSlug,
    region: regionName,
    lat,
    lng,
    shortDescription: `Guided adventures, scenic routes, and outdoor escapes around ${city.name}.`,
    intro: `${city.name} is a strong basecamp for ${activityList} in ${city.stateName}.`,
    heroImages: heroImagesWithFallback,
    activityTags,
    whereItIs: [
      `${city.name} sits within ${city.stateName}, offering quick access to trailheads, waterfront paths, and local parks.`,
      `Travelers can mix guided tours with self-guided exploration, using ${city.name} as a comfortable launch point for day trips.`,
    ],
    experiences: {
      mountains: `Seek out ridge walks and lookout points just outside ${city.name}.`,
      lakesWater: `Plan a calm-water paddle or lakeside stroll near ${city.name}.`,
      desertForest: `Nearby forests and greenways around ${city.name} provide easy escape time in nature.`,
      cycling: `Bike paths and guided rides offer a relaxed way to explore ${city.name}.`,
      scenicDrives: `Short scenic drives from ${city.name} reveal overlooks and seasonal color.`,
      seasonalNotes: `Spring and fall deliver mild temperatures and crisp skies around ${city.name}.`,
    },
    thingsToDo: buildThingsToDo(city.name, activityTags),
    toursCopy: [
      `Plan a half-day tour to get oriented with ${city.name}'s outdoor highlights.`,
      `Pair a guided adventure with free time for local food and neighborhoods.`,
      `Use activity filters to compare ${activityList} departures in ${city.name}.`,
    ],
    weekendItinerary: {
      dayOne: [
        `Morning: grab coffee in ${city.name} and start a guided tour.`,
        `Afternoon: unwind on a waterfront path or shaded trail.`,
        `Evening: explore downtown ${city.name} for dinner.`,
      ],
      dayTwo: [
        `Morning: hit a scenic trail or bike path.`,
        `Afternoon: visit a nearby park or market.`,
        `Evening: finish with a sunset viewpoint or easy stroll.`,
      ],
    },
    gettingThere: [
      `Fly or drive into ${city.name}, then use rideshare or a rental car to reach trailheads.`,
      `Many tours depart from central pickup points near downtown ${city.name}.`,
    ],
    faq: [
      {
        question: `When is the best time to visit ${city.name}?`,
        answer: `Late spring through early fall delivers the best weather for outdoor activities in ${city.name}.`,
      },
      {
        question: `Do I need to book tours in advance?`,
        answer:
          "Popular departures fill quickly, so reserving ahead is recommended for peak travel dates.",
      },
    ],
  };
};

const buildStateNarrative = (state: StateSeed, regionName: string) => {
  const cities = Array.from(state.cities.values()).map((city) =>
    buildCityNarrative(city, regionName),
  );
  const heroImage = cities[0]?.heroImages?.[0] ?? PLACEHOLDER_IMAGE;

  return {
    slug: state.slug,
    name: state.name,
    description: `Outdoor experiences across ${state.name}.`,
    featuredDescription: `Plan hiking, cycling, and canoeing escapes across ${state.name}'s ${regionName} landscapes.`,
    heroImage,
    region: regionName,
    intro: `Plan multi-activity getaways across ${state.name} with guided tours and local experts.`,
    longDescription: `${state.name} delivers a mix of easy access trail networks, scenic drives, and waterside adventures. Use a city basecamp to mix guided tours with free exploration, keeping the itinerary flexible while you explore the best of the region.\n\nAs tour inventory grows, each city in ${state.name} will highlight its local specialties so travelers can book with confidence.`,
    topRegions: [
      {
        title: "Trail networks",
        description: `Find day hikes, scenic lookouts, and local parks across ${state.name}.`,
      },
      {
        title: "Waterways",
        description: `Paddling routes and calm water escapes are easy to reach in ${state.name}.`,
      },
      {
        title: "Scenic drives",
        description: `Short drives from city centers reveal iconic views and seasonal highlights.`,
      },
    ],
    cities,
  };
};

export const normalizeBookingUrl = (rawUrl: string) => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch (error) {
    throw new Error(`Invalid booking URL: ${rawUrl}`);
  }

  if (parsedUrl.hostname === "fareharbor.com") {
    const calendarMatch = parsedUrl.pathname.match(
      /\/embeds\/calendar\/([^/]+)\/items\/(\d+)/,
    );
    const bookCalendarMatch = parsedUrl.pathname.match(
      /\/embeds\/book\/([^/]+)\/items\/(\d+)\/calendar/,
    );
    const itemMatch = parsedUrl.pathname.match(/\/items\/(\d+)/);
    if (!itemMatch?.[1]) {
      throw new Error(`FareHarbor URL missing item id: ${rawUrl}`);
    }

    if (calendarMatch?.[1] && calendarMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${calendarMatch[1]}/items/${calendarMatch[2]}/`;
    } else if (bookCalendarMatch?.[1] && bookCalendarMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${bookCalendarMatch[1]}/items/${bookCalendarMatch[2]}/`;
    }

    if (!parsedUrl.searchParams.has("branding")) {
      parsedUrl.searchParams.append("branding", "no");
    }
  }

  return parsedUrl.toString();
};

const normalizeCalendarUrl = (rawUrl: string) => {
  const normalizedUrl = normalizeBookingUrl(rawUrl);
  const parsedUrl = new URL(normalizedUrl);

  if (parsedUrl.hostname === "fareharbor.com") {
    const calendarMatch = parsedUrl.pathname.match(
      /\/embeds\/calendar\/([^/]+)\/items\/(\d+)/,
    );
    const bookMatch = parsedUrl.pathname.match(
      /\/embeds\/book\/([^/]+)\/items\/(\d+)/,
    );

    if (calendarMatch?.[1] && calendarMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${calendarMatch[1]}/items/${calendarMatch[2]}/calendar/`;
    } else if (bookMatch?.[1] && bookMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${bookMatch[1]}/items/${bookMatch[2]}/calendar/`;
    }
  }

  return parsedUrl.toString();
};

const rowToTour = (
  row: Record<string, string>,
  activitySlug: string | undefined,
  logPrefix: string,
): Tour => {
  const destination = parseLocation(row.location);
  const tags = parseTags(row.tags || "");
  const itemId = row.item_id?.trim() ?? "";
  const title = row.item_name?.trim() || "Untitled Tour";
  const operator =
    row.operator?.trim() ||
    row.company_name?.trim() ||
    row.company_shortname?.trim();
  const shortDescription = row.short_description?.trim();
  const explicitCategory = row.category?.trim();
  const slugBase = slugify(title);
  const slug = itemId
    ? `${slugBase}-${itemId}`
    : `${slugBase}-${destination.citySlug}`;
  const calendarLink = row.calendar_link?.trim() ?? "";
  const bookingUrl = (
    row.booking_url ||
    calendarLink ||
    row.regular_link ||
    ""
  ).trim();
  const availabilityCount = parseNumber(row.availability_count);
  const qualityScore = parseNumber(row.quality_score);
  const latitude = parseNumber(row.location_lat);
  const longitude = parseNumber(row.location_long);
  const { activitySlugs, primaryCategory } = resolveActivitySlugs({
    fallbackActivity: activitySlug,
    explicitCategory,
    title,
    shortDescription,
    tags,
    logPrefix,
  });
  const idSource = row.id?.trim() || itemId;
  const idFallback = slugify(
    [title, destination.city, operator].filter(Boolean).join(" "),
  );
  const id = idSource
    ? `${slugify(operator ?? title)}-${idSource}`
    : idFallback || slugBase;

  if (!bookingUrl) {
    throw new Error(`Missing booking URL for item ${row.item_id} (${title}).`);
  }

  const normalizedBookingUrl = normalizeBookingUrl(bookingUrl);
  const normalizedCalendarLink = calendarLink
    ? normalizeCalendarUrl(calendarLink)
    : undefined;

  const likelyToSellOut =
    typeof availabilityCount === "number" && availabilityCount <= 30;

  return {
    id,
    slug,
    title,
    shortDescription,
    operator,
    categories: activitySlugs,
    primaryCategory,
    tags,
    destination: {
      ...destination,
      lat: latitude,
      lng: longitude,
    },
    heroImage: row.image_url?.trim() || PLACEHOLDER_IMAGE,
    galleryImages: row.image_url?.trim() ? [row.image_url.trim()] : [],
    badges: {
      rating: buildRating(qualityScore),
      reviewCount: availabilityCount,
      likelyToSellOut,
      tagline: tags[0],
    },
    tagPills: tags.slice(0, 3),
    activitySlugs,
    bookingProvider: "fareharbor",
    bookingUrl: normalizedBookingUrl,
    bookingWidgetUrl: normalizedCalendarLink,
    longDescription: buildLongDescription(
      title,
      destination.city,
      destination.state,
    ),
  };
};

const writeGeneratedFile = async (tours: Tour[]) => {
  const fileContents = `import type { Tour } from "./tours.types";

// This file is auto-generated by scripts/import-tours-from-csv.ts. Do not edit manually.
export const toursGenerated: Tour[] = ${JSON.stringify(tours, null, 2)};
`;
  await writeFile(OUTPUT_PATH, fileContents, "utf8");
};

const run = async () => {
  const files = new Set(await readdir(DATA_DIR));
  const categoryCsvFiles = CATEGORY_FILES.filter((entry) =>
    files.has(entry.filename),
  ).map((entry) => ({
    source: entry.filename,
    activitySlug: entry.activitySlug,
    csvPath: path.join(DATA_DIR, entry.filename),
    isNortheast: false,
    isDeepSouth: false,
  }));
  const northeastCsvFiles = (await listCsvFiles(NORTHEAST_DIR)).map(
    (csvPath) => ({
      source: path.relative(DATA_DIR, csvPath),
      activitySlug: undefined,
      csvPath,
      isNortheast: true,
      isDeepSouth: false,
    }),
  );
  const deepSouthCsvFiles = (await listCsvFiles(DEEP_SOUTH_DIR)).map(
    (csvPath) => ({
      source: path.relative(DATA_DIR, csvPath),
      activitySlug: undefined,
      csvPath,
      isNortheast: false,
      isDeepSouth: true,
    }),
  );
  const csvFiles = [...categoryCsvFiles, ...northeastCsvFiles, ...deepSouthCsvFiles];

  if (!csvFiles.length) {
    throw new Error(
      `No CSV files found in ${DATA_DIR}. Expected category files: ${CATEGORY_FILES.map(
        (entry) => entry.filename,
      ).join(", ")}.`,
    );
  }

  const tours: Tour[] = [];
  const skippedRows: string[] = [];
  const northeastSeeds = new Map<string, StateSeed>();
  const deepSouthSeeds = new Map<string, StateSeed>();
  const seenItems = new Map<
    string,
    {
      source: string;
      location: string;
      title: string;
      calendarLink: string;
      regularLink: string;
      imageUrl: string;
    }
  >();

  for (const {
    source,
    activitySlug,
    csvPath,
    isNortheast,
    isDeepSouth,
  } of csvFiles) {
    const contents = await readFile(csvPath, "utf8");
    const { header, records } = parseCsv(contents);
    const missingColumns = requiredColumnsMissing(header);
    const missingOptionalColumns = optionalColumnsMissing(header);

    if (missingColumns.length) {
      throw new Error(
        `${source} is missing required columns: ${missingColumns.join(", ")}`,
      );
    }

    if (missingOptionalColumns.length) {
      console.warn(
        `[import] ${source} is missing optional columns: ${missingOptionalColumns.join(
          ", ",
        )}`,
      );
    }

    records.forEach((row, index) => {
      const rowIdentifier = row.item_id
        ? `${row.company_shortname}-${row.item_id}`
        : `row ${index + 2}`;
      const missingFields: string[] = [];
      const location = row.location?.trim() ?? "";
      const { state, city } = parseLocation(location);
      const bookingUrl = (
        row.booking_url ||
        row.calendar_link ||
        row.regular_link ||
        ""
      ).trim();

      if (!row.item_name?.trim()) {
        missingFields.push("title");
      }
      if (!location || state === "Unknown" || city === "Unknown") {
        missingFields.push("city/state");
      }
      if (!bookingUrl) {
        missingFields.push("booking_url");
      }

      if (missingFields.length) {
        const message = `${source}: ${rowIdentifier} missing ${missingFields.join(
          ", ",
        )}`;
        console.warn(`[import] Skipping ${message}`);
        skippedRows.push(message);
        return;
      }

      const itemKey = row.item_id?.trim()
        ? `${row.company_shortname}-${row.item_id}`
        : slugify(
            [row.item_name, row.location, row.company_shortname]
              .filter(Boolean)
              .join(" "),
          );
      const nextSnapshot = {
        source,
        location: row.location,
        title: row.item_name,
        calendarLink: row.calendar_link,
        regularLink: row.regular_link,
        imageUrl: row.image_url,
      };
      const previousSnapshot = seenItems.get(itemKey);

      if (previousSnapshot) {
        const hasConflict =
          previousSnapshot.location !== nextSnapshot.location ||
          previousSnapshot.title !== nextSnapshot.title ||
          previousSnapshot.calendarLink !== nextSnapshot.calendarLink ||
          previousSnapshot.regularLink !== nextSnapshot.regularLink ||
          previousSnapshot.imageUrl !== nextSnapshot.imageUrl;

        if (hasConflict) {
          const message = `${source}: ${itemKey} conflicts with ${previousSnapshot.source}`;
          console.warn(`[import] Skipping ${message}`);
          skippedRows.push(message);
        }
        return;
      }

      seenItems.set(itemKey, nextSnapshot);
      try {
        const logPrefix = `${source}: ${rowIdentifier}`;
        const tour = rowToTour(row, activitySlug, logPrefix);
        tours.push(tour);

        if (isNortheast && NORTHEAST_STATE_SLUGS.has(tour.destination.stateSlug)) {
          addRegionSeed(northeastSeeds, {
            state,
            stateSlug: tour.destination.stateSlug,
            city,
            citySlug: tour.destination.citySlug,
            lat: tour.destination.lat,
            lng: tour.destination.lng,
            heroImage: tour.heroImage,
            activitySlugs: tour.activitySlugs,
          });
        }

        if (isDeepSouth && DEEP_SOUTH_STATE_SLUGS.has(tour.destination.stateSlug)) {
          addRegionSeed(deepSouthSeeds, {
            state,
            stateSlug: tour.destination.stateSlug,
            city,
            citySlug: tour.destination.citySlug,
            lat: tour.destination.lat,
            lng: tour.destination.lng,
            heroImage: tour.heroImage,
            activitySlugs: tour.activitySlugs,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        const warning = `${source}: ${message}`;
        console.warn(`[import] Skipping ${warning}`);
        skippedRows.push(warning);
      }
    });
  }

  if (skippedRows.length) {
    console.warn(
      `[import] Skipped ${skippedRows.length} rows due to missing or invalid data.`,
    );
  }

  const northeastStates = Array.from(northeastSeeds.values()).map((state) =>
    buildStateNarrative(state, "Northeast"),
  );
  const deepSouthStates = Array.from(deepSouthSeeds.values()).map((state) =>
    buildStateNarrative(state, "Deep South"),
  );

  await writeGeneratedFile(tours);
  await writeFile(
    NORTHEAST_OUTPUT_PATH,
    `import type { StateDestination } from "./destinations";

// This file is auto-generated by scripts/import-tours-from-csv.ts. Do not edit manually.
export const northeastStates: StateDestination[] = ${JSON.stringify(
      northeastStates,
      null,
      2,
    )};
`,
    "utf8",
  );
  await writeFile(
    DEEP_SOUTH_OUTPUT_PATH,
    `import type { StateDestination } from "./destinations";

// This file is auto-generated by scripts/import-tours-from-csv.ts. Do not edit manually.
export const deepSouthStates: StateDestination[] = ${JSON.stringify(
      deepSouthStates,
      null,
      2,
    )};
`,
    "utf8",
  );
  console.log(
    `Generated ${tours.length} tours, ${northeastStates.length} northeast states, and ${deepSouthStates.length} deep south states.`,
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
