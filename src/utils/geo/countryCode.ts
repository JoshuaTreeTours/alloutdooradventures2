import { US_STATES, slugify } from "../../data/tourCatalog";

export const REGION_SLUGS = new Set([
  "world",
  "europe",
  "asia",
  "africa",
  "north-america",
  "south-america",
  "oceania",
  "antarctica",
]);

export const US_STATE_SLUGS = new Set(US_STATES.map(state => slugify(state)));

export const COUNTRY_SLUG_TO_ISO2: Record<string, string> = {
  "united-states": "US",
  usa: "US",
  canada: "CA",
  mexico: "MX",
  france: "FR",
  "united-kingdom": "GB",
  uk: "GB",
  "great-britain": "GB",
  scotland: "GB",
  germany: "DE",
  spain: "ES",
  portugal: "PT",
  italy: "IT",
  ireland: "IE",
  denmark: "DK",
  greece: "GR",
  iceland: "IS",
  netherlands: "NL",
  australia: "AU",
  "new-zealand": "NZ",
  japan: "JP",
  thailand: "TH",
  vietnam: "VN",
  india: "IN",
  indonesia: "ID",
  jordan: "JO",
  kenya: "KE",
  morocco: "MA",
  nepal: "NP",
  peru: "PE",
  brazil: "BR",
  chile: "CL",
  ecuador: "EC",
  egypt: "EG",
  "south-africa": "ZA",
  tanzania: "TZ",
  "costa-rica": "CR",
  "united-arab-emirates": "AE",
  turkey: "TR",
  switzerland: "CH",
  austria: "AT",
  norway: "NO",
  sweden: "SE",
  finland: "FI",
  belgium: "BE",
};

export const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  us: "US",
  australia: "AU",
  canada: "CA",
  denmark: "DK",
  france: "FR",
  germany: "DE",
  greece: "GR",
  iceland: "IS",
  ireland: "IE",
  italy: "IT",
  netherlands: "NL",
  portugal: "PT",
  spain: "ES",
  "united kingdom": "GB",
  "great britain": "GB",
  uk: "GB",
  scotland: "GB",
  mexico: "MX",
  switzerland: "CH",
  austria: "AT",
};

export const normalizeCountryKey = (value: string) =>
  value.trim().toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ");

export const extractCountrySlugFromDestinationsPath = (
  detailUrl: string
): string | null => {
  try {
    const pathname = new URL(detailUrl).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const destinationIndex = segments.indexOf("destinations");

    if (destinationIndex === -1) {
      return null;
    }

    const first = segments[destinationIndex + 1];
    if (!first) {
      return null;
    }

    const countrySlug = REGION_SLUGS.has(first)
      ? segments[destinationIndex + 2]
      : first;

    if (!countrySlug) {
      return null;
    }

    if (US_STATE_SLUGS.has(countrySlug)) {
      return "united-states";
    }

    return countrySlug;
  } catch {
    return null;
  }
};
