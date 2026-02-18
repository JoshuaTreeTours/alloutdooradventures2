import { parse } from "csv-parse/sync";

import { caboCsvRaw } from "./generatedCsvRaw";
import { slugify } from "../../utils/slugify";

export type CaboCitySlug = "cabo-san-lucas" | "san-jose-del-cabo";

export interface CaboTourRow {
  item_id: string;
  item_name: string;
  slug: string;
  country: "Mexico";
  countrySlug: "mexico";
  city: string;
  citySlug: CaboCitySlug;
  image: string;
  bookingUrl: string;
  providerName: string;
  providerShortName: string;
  providerEmail: string;
  providerPhone: string;
  location: string;
  locationLat: string;
  locationLong: string;
}

const clean = (value?: string) => (value ?? "").trim();

const US_STATE_ABBREVIATIONS = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
]);

const normalizeSearchText = (value: string) =>
  clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const locationSegments = (value: string) =>
  clean(value)
    .split("/")
    .map(segment => clean(segment))
    .filter(Boolean);

const looksUs = (record: Record<string, string>) => {
  const combined = normalizeSearchText(
    [
      record.country,
      record.addressCountry,
      record.location,
      record.region,
      record.state,
      record.city,
    ]
      .map(value => clean(value))
      .join(" ")
  );

  if (
    combined.includes("united states") ||
    combined.includes("united states of america") ||
    /\busa\b/.test(combined) ||
    /\bus\b/.test(combined)
  ) {
    return true;
  }

  const state = clean(record.state || record.region).toUpperCase();
  if (US_STATE_ABBREVIATIONS.has(state)) {
    return true;
  }

  return false;
};

const resolveCity = (record: Record<string, string>) => {
  const source = [record.city, record.destination_city, record.location]
    .map(value => clean(value))
    .filter(Boolean)
    .join(" ");
  const normalized = normalizeSearchText(source);

  if (
    normalized.includes("san jose del cabo") ||
    normalized.includes("san jose cabo")
  ) {
    return {
      city: "San José del Cabo",
      citySlug: "san-jose-del-cabo" as const,
    };
  }

  return {
    city: "Cabo San Lucas",
    citySlug: "cabo-san-lucas" as const,
  };
};

const resolveItemId = (record: Record<string, string>, index: number) => {
  const id = clean(record.item_id || record.sourceItemId || record.id);
  return id || `cabo-row-${index + 2}`;
};

const resolveItemName = (record: Record<string, string>, index: number) => {
  const title = clean(record.item_name || record.title || record.name);
  return title || `Cabo Tour ${index + 1}`;
};

const resolveSlug = (record: Record<string, string>, fallbackTitle: string, id: string) => {
  const explicit = slugify(clean(record.slug));
  if (explicit) {
    return explicit;
  }

  const fromName = slugify(fallbackTitle);
  if (fromName) {
    return fromName;
  }

  const fromId = slugify(id);
  return fromId || "cabo-tour";
};

export function loadCaboTours(): CaboTourRow[] {
  try {
    if (!clean(caboCsvRaw)) {
      console.warn("[cabo] cabo.csv not found or empty");
      return [];
    }

    const parsed = parse(caboCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    return parsed.reduce<CaboTourRow[]>((acc, record, index) => {
      try {
        if (looksUs(record)) {
          console.warn(`[cabo] skipped row ${index + 2}: appears US-based`);
          return acc;
        }

        const segments = locationSegments(record.location || "");
        if (segments.length > 0) {
          const countrySegment = normalizeSearchText(segments[0] || "");
          if (countrySegment && countrySegment !== "mexico") {
            console.warn(
              `[cabo] skipped row ${index + 2}: non-Mexico location (${segments[0]})`
            );
            return acc;
          }
        }

        const item_id = resolveItemId(record, index);
        const item_name = resolveItemName(record, index);
        const city = resolveCity(record);

        if (!item_id || !item_name) {
          console.warn(`[cabo] skipped row ${index + 2}: unusable id/title`);
          return acc;
        }

        acc.push({
          item_id,
          item_name,
          slug: resolveSlug(record, item_name, item_id),
          country: "Mexico",
          countrySlug: "mexico",
          city: city.city,
          citySlug: city.citySlug,
          image: clean(record.image_url || record.image || record.photo),
          bookingUrl: clean(record.regular_link || record.calendar_link || record.booking_url),
          providerName: clean(record.company_name || record.operator),
          providerShortName: clean(record.company_shortname),
          providerEmail: clean(record.company_email),
          providerPhone: clean(record.company_phone),
          location: clean(record.location),
          locationLat: clean(record.location_lat || record.lat),
          locationLong: clean(record.location_long || record.lng || record.long),
        });
      } catch (error) {
        console.warn(`[cabo] skipped malformed row ${index + 2}`, error);
      }

      return acc;
    }, []);
  } catch (error) {
    console.warn("[cabo] failed to load cabo.csv", error);
    return [];
  }
}
