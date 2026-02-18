import { parse } from "csv-parse/sync";

import mexicoCsvRaw from "../../../data/mexico.csv?raw";
import puertoVallartaCsvRaw from "../../../data/Puerto Vallarta.csv?raw";
import { slugify } from "../../utils/slugify";

export interface MexicoTourRow {
  sourceKey: string;
  id: string;
  title: string;
  city: string;
  region: string;
  country: string;
  description: string;
  image: string;
  price: string;
  bookingUrl: string;
  providerName: string;
  providerShortName: string;
  providerEmail: string;
  providerPhone: string;
  location: string;
  locationLat: string;
  locationLong: string;
  addressCountry: string;
}

type MexicoCsvSource = {
  key: string;
  label: string;
  raw: string;
  forceCountry?: string;
  forceCountrySlug?: string;
  forceCity?: string;
  forceCitySlug?: string;
};

const MEXICO_SOURCES: MexicoCsvSource[] = [
  {
    key: "mexico-core",
    label: "mexico.csv",
    raw: mexicoCsvRaw,
  },
  {
    key: "mexico-puerto-vallarta",
    label: "Puerto Vallarta.csv",
    raw: puertoVallartaCsvRaw,
    forceCountry: "Mexico",
    forceCountrySlug: "mexico",
    forceCity: "Puerto Vallarta",
    forceCitySlug: "puerto-vallarta",
  },
];

const clean = (value?: string) => (value ?? "").trim();

const US_STATE_ABBREVIATIONS = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
]);

const countryLooksUs = (value: string) => {
  const normalized = clean(value).toLowerCase();
  return (
    normalized.includes("united states") ||
    normalized.includes("united states of america") ||
    normalized === "us" ||
    normalized === "usa"
  );
};

const regionLooksUsStateAbbreviation = (value: string) =>
  US_STATE_ABBREVIATIONS.has(clean(value).toUpperCase());

const getLocationParts = (location: string) =>
  clean(location)
    .split("/")
    .map(segment => clean(segment))
    .filter(Boolean);

const getLocationSegment = (value: string, index: number) => {
  const parts = getLocationParts(value);
  return parts[index] ?? "";
};

const resolveCity = (record: Record<string, string>) => {
  const raw = clean(record.city || record.location || record.destination_city);
  if (raw.includes("/")) {
    return getLocationSegment(raw, 2) || getLocationSegment(raw, 1) || raw;
  }
  return raw;
};

const resolveRegion = (record: Record<string, string>) => {
  const raw = clean(record.state || record.region || record.province);
  if (raw) {
    return raw.includes("/") ? getLocationSegment(raw, 1) || raw : raw;
  }
  return getLocationSegment(clean(record.location), 1);
};

const resolveCountry = (record: Record<string, string>) => {
  const raw = clean(record.country || record.country_name);
  if (raw) {
    return raw.includes("/") ? getLocationSegment(raw, 0) || raw : raw;
  }
  return getLocationSegment(clean(record.location), 0);
};

const isUsRow = (row: Record<string, string>, resolved: MexicoTourRow) => {
  const locationParts = getLocationParts(resolved.location);
  const locationCountry = locationParts[0] ?? "";
  const locationRegion = locationParts[1] ?? "";
  const countrySlug = slugify(resolved.country || locationCountry);
  const generatedRoute = `/destinations/${countrySlug}/`;

  return (
    countryLooksUs(resolved.country) ||
    countryLooksUs(locationCountry) ||
    clean(resolved.addressCountry).toUpperCase() === "US" ||
    regionLooksUsStateAbbreviation(resolved.region) ||
    regionLooksUsStateAbbreviation(locationRegion) ||
    generatedRoute.startsWith("/destinations/united-states/")
  );
};

export function loadMexicoTours(): MexicoTourRow[] {
  try {
    let filteredUsRows = 0;

    const rows = MEXICO_SOURCES.reduce<MexicoTourRow[]>((allRows, source) => {
      if (!clean(source.raw)) {
        console.warn(`[mexico] ${source.label} not found or empty`);
        return allRows;
      }

      const parsed = parse(source.raw, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
      }) as Array<Record<string, string>>;

      const sourceRows = parsed.reduce<MexicoTourRow[]>((acc, record, index) => {
        try {
          const locationParts = getLocationParts(clean(record.location));
          const locationCountry = locationParts[0] ?? "";
          const locationRegion = locationParts[1] ?? "";
          const locationCity = locationParts[2] ?? "";

          const forcedCountry = clean(source.forceCountry);
          const forcedCountrySlug = clean(source.forceCountrySlug);
          const forcedCity = clean(source.forceCity);
          const resolvedRegion = resolveRegion(record) || locationRegion;
          const resolvedCountry = forcedCountry || resolveCountry(record) || locationCountry;
          const resolvedCity = forcedCity || resolveCity(record) || locationCity;

          const row: MexicoTourRow = {
            sourceKey: source.key,
            id: clean(
              record.id || record.tour_id || record.item_id || record.sourceItemId
            ),
            title: clean(record.title || record.name || record.item_name),
            city: resolvedCity,
            region: resolvedRegion,
            country: resolvedCountry,
            description: clean(record.description || record.summary),
            image: clean(record.image || record.image_url || record.photo),
            price: clean(record.price || record.starting_price),
            bookingUrl: clean(
              record.booking_url || record.regular_link || record.calendar_link
            ),
            providerName: clean(record.company_name || record.operator),
            providerShortName: clean(record.company_shortname),
            providerEmail: clean(record.company_email),
            providerPhone: clean(record.company_phone),
            location: forcedCountry && forcedCity
              ? `${resolvedCountry}/${resolvedRegion}/${resolvedCity}`
              : clean(record.location),
            locationLat: clean(record.location_lat || record.lat),
            locationLong: clean(record.location_long || record.lng || record.long),
            addressCountry: forcedCountrySlug || clean(record.addressCountry || record.address_country),
          };

          if (!row.id || !row.title || !row.city) {
            console.warn(
              `[mexico] skipped incomplete row in ${source.label} at index ${index + 2}`,
            );
            return acc;
          }

          if (isUsRow(record, row)) {
            filteredUsRows += 1;
            return acc;
          }

          acc.push(row);
          return acc;
        } catch {
          console.warn(
            `[mexico] skipped malformed row in ${source.label} at index ${index + 2}`,
          );
          return acc;
        }
      }, []);

      return [...allRows, ...sourceRows];
    }, []);

    console.warn("[mexico] filtered US rows:", filteredUsRows);
    return rows;
  } catch (error) {
    console.warn("[mexico] failed to load mexico.csv", error);
    return [];
  }
}
