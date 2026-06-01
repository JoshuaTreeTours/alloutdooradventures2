import { SITE_URL } from "../utils/seo";

type TourLike = {
  title?: string;
  name?: string;
  id?: string;
  partnerId?: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  destination?: {
    city?: string;
    state?: string;
    country?: string;
  };
  categories?: string[];
  primaryCategory?: string;
  activityType?: string;
  activitySlugs?: string[];
  badges?: {
    duration?: string;
  };
  operator?: string;
  engine?: string;
};

const TARGETED_LEGACY_METADATA_SLUGS = new Set([
  "south-beach-bicycle-tour-70874",
  "calgary-city-bike-tour-378748",
  "bent-hill-tour-4-5-riders-442011",
  "the-stanley-park-bike-tour-of-vancouver-118669",
  "upper-pass-tour-2-5-riders-441761",
  "jasper-murdocks-tour-2-5-riders-441998",
  "harpoon-tour-4-5-riders-442005",
  "private-central-park-bike-tour-16691",
  "central-park-bike-tour-562552",
  "south-beach-bicycle-rental-266538",
  "bikes-and-bites-210126",
  "bikes-and-bites-210325",
  "south-beach-tandem-bike-rental-266587",
  "golden-gate-park-electric-bike-tour-313936",
  "south-beach-bicycle-tour-266590",
  "private-central-park-bike-tour-37370",
  "the-stanley-park-bike-tour-of-vancouver-530042",
  "central-park-bike-tour-441675",
  "calgary-city-bike-tour-529962",
  "central-park-bike-tour-355491",
  "golden-gate-park-electric-bike-tour-638096",
  "brooklyn-navy-yard-bicycle-tour-19349",
  "brooklyn-navy-yard-bicycle-tour-333546",
  "red-rock-state-park---scenic-sedona-hiking-adventure-214438",
  "sedona-hiking-and-yoga-experience-214442",
  "temecula-vineyard-and-winery-private-tour-private-652807",
  "private-sunset-sail-503348",
  "two-hour-private-charter-656686",
  "three-hour-private-charter-658230",
  "four-hour-private-charter-658231",
  "private-group-charter-large-wooden-sailboat-65-stephens-brothers-yawl-2-hours-681680",
  "private-group-charter-large-wooden-sailboat-55-twin-masted-ketch-2-hours-681687",
  "two-hour-private-charter-658237",
  "three-hour-private-charter-658238",
  "four-hour-private-charter-658239",
  "zoo-animal-party-1-15-attendees-231271",
  "zoo-animal-party-16-35-attendees-359106",
  "temecula-vineyard-and-winery-private-tour-public-659422",
  "san-diego-tours-tijuana-culture-and-culinary-tour-private-644671",
  "private-sunset-sail-598263",
  "private-morning-sail-598268",
  "san-diego-tours-tijuana-culture-and-culinary-tour-daily-647015",
  "two-hour-private-charter-668273",
  "private-morning-sail-503305",
  "whale-watching-620803",
  "whale-watching-449815",
  "24-boston-whaler-dual-engine-308250",
  "highlights-of-boston---public-walking-tour-spanish-641580",
  "24-boston-whaler-308245",
  "highlights-of-boston---public-walking-tour-464912",
  "18-ventura-boston-whaler-51785",
  "22-dauntless-boston-whaler-251834",
  "18-ventura-boston-whaler-96495",
  "22-dauntless-boston-whaler-469534",
  "26th-annual-chamber-music-festival-boston-chamber-music-378272",
  "26th-annual-chamber-music-festival-boston-chamber-music-378279",
  "surf-lessons-7571",
  "surf-lessons-991",
  "oak-alley-plantation-tour-561477",
  "all-day-rental-1-5-riders-441775",
  "half-day-rental-1-5-riders-441765",
  "farm-stand-tour-2-5-riders-622327",
  "farm-stand-tour-6-riders-622406",
  "half-day-rental-6-riders-605779",
  "bent-hill-tour-6-riders-606460",
  "all-day-rental-6-riders-605781",
  "upper-pass-tour-6-riders-606458",
  "jasper-murdocks-tour-6-riders-606462",
  "harpoon-tour-6-riders-606463",
  "micro-brewery-tour-352913",
  "micro-brewery-tour-353504",
  "micro-brewery-tour-353797",
  "taste-of-vt-food-tour-353512",
  "taste-of-vt-food-tour-353513",
  "cider-and-spirits-tour-352903",
  "waterfall-and-covered-bridge-tour-353775",
  "waterfall-and-covered-bridge-tour-353774",
  "cider-and-spirits-tour-353798",
  "lonely-planet-experiences---dc-food-and-history-tour-on-h-street-60706",
  "lonely-planet-experiences---dc-food-and-history-tour-on-h-street-private-99195",
  "airline-bna-to-downtown-trip-631683",
  "airline-bna-to-cool-springs-trip-632304",
  "airline-downtown-to-bna-trip-632309",
  "south-beach-bicycle-rental-111014",
  "south-beach-tandem-bike-rental-197106",
  "dolphin-and-wildlife-adventure-19075",
  "trail-ride-little-manatee-river-state-park-258884",
  "dolphin-and-wildlife-adventure-650108",
  "trail-ride-deer-prairie-creek-preserve-258885",
  "oak-alley-plantation-tour-359297",
  "louisiana-whooping-crane-reintroduction-progress-made-goals-still-to-be-achieved-with-sara-zimorski-louisiana-department-of-wildlife-and-fisheries-581906",
  "e-bike-tour-kln-panorama---privat-deutsch-450600",
  "e-bike-tour-kln-panorama---privat-englisch-450650",
  "3-tagesmiete-montag---donnerstag---mehringdamm-29-146240",
  "3-tagesmiete-wochenende---mehringdamm-29-146243",
  "riviera-del-brenta-bike-tour-pomeriggio-221576",
  "london-e-bike-tour-semi-private-261887",
  "london-e-bike-tour-private-366443",
  "e-bike-self-guided-trip---bled-highlights-including-vintgar-gorge-half-day-211290",
  "e-bike-self-guided-trip---bled-highlights-including-vintgar-gorge-full-day-211294",
  "rotterdam-hike-and-bite-food-tour-nl-139135",
  "rotterdam-hike-and-bite-food-tour-eng-139136",
  "rotterdam-hike-and-dine-food-tour-nl-139148",
  "delft-hike-and-bite-food-tour-eng-139152",
  "montserrat-monastery-and-hiking-experience-83795",
  "delft-hike-and-bite-food-tour-nl-139149",
  "montserrat-monastery-and-hiking-experience-154259",
  "rotterdam-hike-and-dine-food-tour-eng-141929",
  "all-inclusive-kajakpaket-2-dagar-1-natt-682043",
  "all-inclusive-kajakpaket-7-dagar-6-ntter-682845",
  "all-inclusive-kajakpaket-3-dagar-2-ntter-682838",
  "all-inclusive-kajakpaket-5-dagar-4-ntter-682843",
  "canoeing-public-552222",
  "canoeing-private-552223",
]);

const explicitLegacyVariantLabels: Record<string, string> = {
  "micro-brewery-tour-352913": "FareHarbor item 352913",
  "micro-brewery-tour-353504": "FareHarbor item 353504",
  "micro-brewery-tour-353797": "FareHarbor item 353797",
  "taste-of-vt-food-tour-353512": "FareHarbor item 353512",
  "taste-of-vt-food-tour-353513": "FareHarbor item 353513",
  "cider-and-spirits-tour-352903": "FareHarbor item 352903",
  "cider-and-spirits-tour-353798": "FareHarbor item 353798",
  "18-ventura-boston-whaler-51785": "18-foot rental item 51785",
  "18-ventura-boston-whaler-96495": "18-foot rental item 96495",
  "22-dauntless-boston-whaler-251834": "22-foot rental item 251834",
  "22-dauntless-boston-whaler-469534": "22-foot rental item 469534",
};

const extractProductId = (tour: TourLike) => {
  const raw = clean(tour.id) || clean(tour.slug);
  return raw.match(/(\d+)(?!.*\d)/)?.[1] ?? "";
};

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildSlugVariantLabel = (slug: string) => {
  const stem = slug.replace(/-\d+$/i, "");
  const capacity = stem.match(/(?:^|-)(\d+)-(\d+)-riders(?:-|$)/i);
  if (capacity) return `${capacity[1]}–${capacity[2]} riders`;

  const riders = stem.match(/(?:^|-)(\d+)-riders(?:-|$)/i);
  if (riders) return `${riders[1]} riders`;

  const dayNight = stem.match(/(?:^|-)(\d+)-dagar-(\d+)-natt(?:er)?(?:-|$)/i);
  if (dayNight)
    return `${dayNight[1]} days / ${dayNight[2]} night${dayNight[2] === "1" ? "" : "s"}`;

  const dayOnly = stem.match(/(?:^|-)(\d+)-dagar(?:-|$)/i);
  if (dayOnly) return `${dayOnly[1]} days`;

  const dayRental = stem.match(/(?:^|-)(\d+)-tagesmiete(?:-|$)/i);
  if (dayRental) return `${dayRental[1]}-day rental`;

  const hour = stem.match(/(?:^|-)(two|three|four|\d+)-hour(?:-|$)/i);
  if (hour) {
    const hours: Record<string, string> = { two: "2", three: "3", four: "4" };
    const value = hours[hour[1].toLowerCase()] ?? hour[1];
    return `${value}-hour option`;
  }

  if (/(^|-)half-day(?:-|$)/i.test(stem)) return "half-day option";
  if (/(^|-)full-day(?:-|$)/i.test(stem)) return "full-day option";
  if (/(^|-)all-day(?:-|$)/i.test(stem)) return "all-day option";
  if (/(^|-)semi-private(?:-|$)/i.test(stem)) return "semi-private option";
  if (/(^|-)public(?:-|$)/i.test(stem)) return "public option";
  if (/(^|-)private(?:-|$)/i.test(stem)) return "private option";
  if (/(^|-)spanish(?:-|$)/i.test(stem)) return "Spanish-language option";
  if (/(^|-)deutsch(?:-|$)/i.test(stem)) return "German-language option";
  if (/(^|-)(englisch|eng)(?:-|$)/i.test(stem))
    return "English-language option";
  if (/(^|-)nl(?:-|$)/i.test(stem)) return "Dutch-language option";
  if (/(^|-)morning(?:-|$)/i.test(stem)) return "morning option";
  if (/(^|-)sunset(?:-|$)/i.test(stem)) return "sunset option";
  if (/(^|-)daily(?:-|$)/i.test(stem)) return "daily option";

  const location = stem.match(
    /(?:^|-)(hyatt|loews|harbor-island|del-marina|mehringdamm-29)(?:-|$)/i
  );
  if (location) return `${toTitleCase(location[1].replace(/-/g, " "))} option`;

  return "";
};

const getTargetedLegacyVariantLabel = (tour: TourLike) => {
  const slug = clean(tour.slug);
  if (
    !slug ||
    tour.engine === "engine6" ||
    !TARGETED_LEGACY_METADATA_SLUGS.has(slug)
  ) {
    return "";
  }

  const explicit = explicitLegacyVariantLabels[slug];
  if (explicit) return explicit;

  const productId = extractProductId(tour);
  const slugLabel = buildSlugVariantLabel(slug);
  if (slugLabel)
    return productId ? `${slugLabel} item ${productId}` : slugLabel;

  return productId ? `FareHarbor item ${productId}` : "legacy variant";
};

const INDEX_ROBOTS = "index,follow,max-image-preview:large";
const NOINDEX_ROBOTS = "noindex,follow,max-image-preview:large";

const clean = (value?: string) => (value ?? "").trim();

const stripLegacyPrefix = (value: string) =>
  value
    .replace(
      /^Destinations\s*\/\s*[^/]+\s*\/\s*[^/]+\s*\/\s*Tours\s*\/\s*/i,
      ""
    )
    .replace(/\bHome\s*[:|/-]\s*/gi, "")
    .replace(/\s*\|\s*All Outdoor Adventures$/i, "");

const stripTrailingId = (value: string) =>
  value
    .replace(/\s+[A-Z]?\d{5,}$/i, "")
    .replace(/\s+\d{5,}$/i, "")
    .trim();

const prettifyLegacyTourName = (value: string) =>
  value
    .replace(/\s*-\s*/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\bsignature tour\b/gi, "")
    .replace(/\bwith\b/gi, " ")
    .replace(/\bf\s+pjx\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[-:|\s]+|[-:|\s]+$/g, "")
    .trim();

const isGrandCanyonSouthRimHummerRoute = (tour: TourLike) =>
  clean(tour.slug) ===
  "grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131";

const pickTourName = (tour: TourLike) => {
  const base = clean(tour.title) || clean(tour.name);
  return prettifyLegacyTourName(stripTrailingId(stripLegacyPrefix(base)));
};

const pickCity = (tour: TourLike) => clean(tour.destination?.city) || "Unknown";

const pickState = (tour: TourLike) =>
  clean(tour.destination?.state) || "Unknown";

const pickCountry = (tour: TourLike) =>
  clean(tour.destination?.country) || pickState(tour);

const isInternationalLegacyTourRoute = (
  tour: TourLike,
  canonicalUrl: string
) => {
  const rawCountry = clean(tour.destination?.country);
  const country = rawCountry.toLowerCase();
  const isInternational =
    !!rawCountry && country !== "united states" && country !== "usa";
  const isLegacyRoute =
    /\/tours\/[^/]+\/[^/]+\/[^/]+\/?$/i.test(canonicalUrl) ||
    /\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+\/?$/i.test(canonicalUrl);
  return isInternational && isLegacyRoute && tour.engine !== "engine6";
};

const pickActivityType = (tour: TourLike) => {
  const raw =
    clean(tour.activityType) ||
    clean(tour.primaryCategory) ||
    clean(tour.categories?.[0]) ||
    clean(tour.activitySlugs?.[0]);
  return raw
    ? raw.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().toLowerCase()
    : "";
};

const withLengthCap = (value: string, max: number) =>
  value.length <= max
    ? value
    : `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;

const getTourSlugFromPath = (pathname: string) => {
  const normalized = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const match = normalized.match(/\/tours\/([^/]+)\/book$/);
  return match?.[1] ?? "";
};

const normalizeCanonical = (canonicalUrl: string) => {
  if (
    canonicalUrl.startsWith("http://") ||
    canonicalUrl.startsWith("https://")
  ) {
    return canonicalUrl;
  }

  const path = canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`;
  return `${SITE_URL}${path}`;
};

const buildTitle = (tour: TourLike, canonicalUrl: string) => {
  if (tour.engine === "engine6") {
    return `${pickTourName(tour) || "Tour"} | ${pickCity(tour)}, ${pickState(tour)} | All Outdoor Adventures`;
  }

  const variantLabel = getTargetedLegacyVariantLabel(tour);
  const variantSuffix = variantLabel ? ` (${variantLabel})` : "";

  if (isInternationalLegacyTourRoute(tour, canonicalUrl)) {
    return `${pickTourName(tour) || "Tour"}${variantSuffix} | ${pickCity(tour)}, ${pickCountry(tour)} | All Outdoor Adventures`;
  }

  return `${
    isGrandCanyonSouthRimHummerRoute(tour)
      ? "Grand Canyon South Rim Hummer Ground Tour"
      : pickTourName(tour) || "Tour"
  }${variantSuffix} | ${pickCity(tour)}, ${pickState(tour)} | All Outdoor Adventures`;
};

const buildDescription = (tour: TourLike, canonicalUrl: string) => {
  const tourName = pickTourName(tour) || "this tour";
  const city = pickCity(tour);
  const state = pickState(tour);
  const country = pickCountry(tour);
  const detail = clean(tour.shortDescription) || clean(tour.longDescription);
  const variantLabel = getTargetedLegacyVariantLabel(tour);
  const tourNameWithVariant = variantLabel
    ? `${tourName} (${variantLabel})`
    : tourName;

  if (isGrandCanyonSouthRimHummerRoute(tour)) {
    return "Experience the Grand Canyon South Rim with a guided Hummer ground tour from Flagstaff, Arizona. Explore scenic canyon viewpoints, desert landscapes, and one of America’s most iconic natural wonders with All Outdoor Adventures.";
  }

  if (tour.engine === "engine6") {
    if (detail) {
      return withLengthCap(
        `Explore ${tourName} in ${city}, ${state}. ${detail}`,
        155
      );
    }
    return withLengthCap(
      `Experience ${tourName} in ${city}, ${state} with destination highlights, local context, and flexible planning through All Outdoor Adventures.`,
      155
    );
  }

  if (isInternationalLegacyTourRoute(tour, canonicalUrl)) {
    const activity = pickActivityType(tour);
    const duration = clean(tour.badges?.duration);
    const operator = clean(tour.operator);
    const templates = [
      `Explore ${tourNameWithVariant} in ${city}, ${country}`,
      `Experience ${tourNameWithVariant} in ${city}, ${country}`,
      `Join ${tourNameWithVariant} in ${city}, ${country}`,
      `Enjoy ${tourNameWithVariant} in ${city}, ${country}`,
    ];
    const templateIndex =
      (clean(tour.id).length + clean(tour.slug).length) % templates.length;
    const pieces = [
      templates[templateIndex],
      activity ? `for a ${activity} outing` : "for a memorable local outing",
      duration ? `${duration}` : "",
      operator ? `with ${operator}` : "",
    ].filter(Boolean);
    const base = `${pieces.join(" ")}.`;
    if (detail) {
      return withLengthCap(`${base} ${detail}`, 155);
    }
    return withLengthCap(
      `${base} Discover destination highlights, local atmosphere, and easy planning for your trip.`,
      155
    );
  }

  const templates = [
    `Explore ${tourNameWithVariant} in ${city}, ${state}.`,
    `Experience ${tourNameWithVariant} in ${city}, ${state}.`,
    `Join ${tourNameWithVariant} in ${city}, ${state}.`,
    `Enjoy ${tourNameWithVariant} in ${city}, ${state}.`,
    `Ride into ${city}, ${state} on ${tourNameWithVariant}.`,
    `Discover ${tourNameWithVariant} across ${city}, ${state}.`,
  ];
  const templateIndex =
    (clean(tour.id).length + clean(tour.slug).length) % templates.length;
  const activity = pickActivityType(tour);
  const duration = clean(tour.badges?.duration);
  const operator = clean(tour.operator);
  const qualifier = [activity, duration, operator ? `with ${operator}` : ""]
    .filter(Boolean)
    .join(" • ");

  if (detail) {
    return withLengthCap(
      `${templates[templateIndex]}${qualifier ? ` ${qualifier}.` : ""} ${detail}`,
      155
    );
  }

  return withLengthCap(
    `${templates[templateIndex]}${qualifier ? ` ${qualifier}.` : ""} Discover key sights, local flavor, and straightforward trip planning with All Outdoor Adventures.`,
    155
  );
};

export const getCanonicalFromBookingPath = (pathname: string) => {
  const slugId = getTourSlugFromPath(pathname);
  return slugId ? `${SITE_URL}/tours/${slugId}` : "";
};

export function buildTourMeta(tour: TourLike, canonicalUrl: string) {
  const title = buildTitle(tour, canonicalUrl);
  const description = buildDescription(tour, canonicalUrl);
  const canonical = normalizeCanonical(canonicalUrl);

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    robots: INDEX_ROBOTS,
    googlebot: INDEX_ROBOTS,
    canonical,
  };
}

export function buildBookingMeta(tour: TourLike, canonicalUrl: string) {
  const title = buildTitle(tour, canonicalUrl);
  const description = buildDescription(tour, canonicalUrl);
  const canonical = normalizeCanonical(canonicalUrl);

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    robots: NOINDEX_ROBOTS,
    googlebot: NOINDEX_ROBOTS,
    canonical,
  };
}
