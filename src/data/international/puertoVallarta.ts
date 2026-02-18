import { parse } from "csv-parse/sync";

import { puertoVallartaCsvRaw } from "./generatedCsvRaw";
import { slugify } from "../../utils/slugify";

export interface PuertoVallartaTourRow {
  item_id: string;
  item_name: string;
  slug: string;
  country: "mexico";
  countrySlug: "mexico";
  city: "Puerto Vallarta";
  citySlug: "puerto-vallarta";
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

const resolveItemId = (record: Record<string, string>) =>
  clean(record.item_id || record.sourceItemId || record.id);

const resolveTitle = (record: Record<string, string>) =>
  clean(record.item_name || record.title || record.name);

const resolveSlug = (record: Record<string, string>, title: string) => {
  const slugFromRecord = slugify(clean(record.slug));
  if (slugFromRecord) {
    return slugFromRecord;
  }

  const slugFromTitle = slugify(title);
  if (slugFromTitle) {
    return slugFromTitle;
  }

  return "puerto-vallarta-tour";
};

export function loadPuertoVallartaTours(): PuertoVallartaTourRow[] {
  try {
    if (!clean(puertoVallartaCsvRaw)) {
      console.warn("[puerto-vallarta] Puerto Vallarta.csv not found or empty");
      return [];
    }

    const parsed = parse(puertoVallartaCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    let filteredRows = 0;

    const rows = parsed.reduce<PuertoVallartaTourRow[]>((acc, record, index) => {
      try {
        const itemId = resolveItemId(record);
        const itemName = resolveTitle(record);

        if (!itemId || !itemName) {
          filteredRows += 1;
          console.warn(
            `[puerto-vallarta] skipped row ${index + 2}: missing item_id or item_name`
          );
          return acc;
        }

        acc.push({
          item_id: itemId,
          item_name: itemName,
          slug: resolveSlug(record, itemName),
          country: "mexico",
          countrySlug: "mexico",
          city: "Puerto Vallarta",
          citySlug: "puerto-vallarta",
          image: clean(record.image || record.image_url || record.photo),
          bookingUrl: clean(
            record.booking_url || record.regular_link || record.calendar_link
          ),
          providerName: clean(record.company_name || record.operator),
          providerShortName: clean(record.company_shortname),
          providerEmail: clean(record.company_email),
          providerPhone: clean(record.company_phone),
          location: clean(record.location),
          locationLat: clean(record.location_lat || record.lat),
          locationLong: clean(record.location_long || record.lng || record.long),
        });
        return acc;
      } catch (error) {
        filteredRows += 1;
        console.warn(
          `[puerto-vallarta] skipped malformed row ${index + 2}`,
          error
        );
        return acc;
      }
    }, []);

    console.warn("[puerto-vallarta] filtered rows:", filteredRows);
    return rows;
  } catch (error) {
    console.warn("[puerto-vallarta] failed to load Puerto Vallarta.csv", error);
    return [];
  }
}
