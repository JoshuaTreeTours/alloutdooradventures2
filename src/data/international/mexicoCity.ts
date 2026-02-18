import { parse } from "csv-parse/sync";

import { mexicoCityCsvRaw } from "./rawCsvData";
import { slugify } from "../../utils/slugify";

export interface MexicoCityTourRow {
  item_id: string;
  item_name: string;
  slug: string;
  country: "Mexico";
  countrySlug: "mexico";
  city: "Ciudad De México";
  citySlug: "ciudad-de-mexico";
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

const resolveSlug = (record: Record<string, string>, title: string, id: string) => {
  const explicitSlug = slugify(clean(record.slug));
  if (explicitSlug) {
    return explicitSlug;
  }

  const fromTitle = slugify(title);
  if (fromTitle) {
    return fromTitle;
  }

  return slugify(id) || "ciudad-de-mexico-tour";
};

const resolveItemId = (record: Record<string, string>) =>
  clean(record.item_id || record.sourceItemId || record.id);

const resolveItemName = (record: Record<string, string>) =>
  clean(record.item_name || record.title || record.name);

const isMexicoCityRecord = (record: Record<string, string>) => {
  const location = clean(record.location);
  const segments = locationSegments(location);
  const country = normalizeSearchText(segments[0] || record.country || "");
  const city = normalizeSearchText(
    record.city || record.destination_city || segments[2] || segments[1] || ""
  );

  if (country && country !== "mexico") {
    return false;
  }

  if (!city) {
    return true;
  }

  return city.includes("ciudad de mexico") || city.includes("mexico city");
};

export function loadMexicoCityTours(): MexicoCityTourRow[] {
  try {
    if (!clean(mexicoCityCsvRaw)) {
      console.warn("[mexico-city] mexico city.csv not found or empty");
      return [];
    }

    const parsed = parse(mexicoCityCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    return parsed.reduce<MexicoCityTourRow[]>((acc, record, index) => {
      try {
        if (!isMexicoCityRecord(record)) {
          console.warn(`[mexico-city] skipped row ${index + 2}: non-Mexico City location`);
          return acc;
        }

        const item_id = resolveItemId(record);
        const item_name = resolveItemName(record);
        const location = clean(record.location);

        if (!item_id || !item_name) {
          console.warn(`[mexico-city] skipped row ${index + 2}: missing item_id or item_name`);
          return acc;
        }

        acc.push({
          item_id,
          item_name,
          slug: resolveSlug(record, item_name, item_id),
          country: "Mexico",
          countrySlug: "mexico",
          city: "Ciudad De México",
          citySlug: "ciudad-de-mexico",
          image: clean(record.image_url || record.image || record.photo),
          bookingUrl: clean(
            record.regular_link || record.booking_url || record.calendar_link
          ),
          providerName: clean(record.company_name || record.operator),
          providerShortName: clean(record.company_shortname),
          providerEmail: clean(record.company_email),
          providerPhone: clean(record.company_phone),
          location,
          locationLat: clean(record.location_lat || record.lat),
          locationLong: clean(record.location_long || record.lng || record.long),
        });
      } catch (error) {
        console.warn(`[mexico-city] skipped malformed row ${index + 2}`, error);
      }

      return acc;
    }, []);
  } catch (error) {
    console.warn("[mexico-city] failed to load mexico city.csv", error);
    return [];
  }
}
