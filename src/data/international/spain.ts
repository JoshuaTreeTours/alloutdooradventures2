import { parse } from "csv-parse/sync";

import { spainCsvRaw } from "./generatedCsvRaw";
import { slugify } from "../../utils/slugify";

export interface SpainTourRow {
  id: string;
  title: string;
  city: string;
  citySlug: string;
  region: string;
  country: "Spain";
  countrySlug: "spain";
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
}

const clean = (value?: string) => (value ?? "").trim();

const getLocationParts = (location: string) =>
  clean(location)
    .split("/")
    .map(segment => clean(segment))
    .filter(Boolean);

const getLocationSegment = (location: string, index: number) =>
  getLocationParts(location)[index] ?? "";

const normalizeSearch = (value: string) =>
  clean(value).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const resolveSpainCityIdentity = (rawCity: string) => {
  const normalized = normalizeSearch(rawCity);

  if (
    normalized === "donostia" ||
    normalized === "donostia-san sebastian" ||
    normalized === "san sebastian"
  ) {
    return {
      city: "San Sebastián",
      citySlug: "san-sebastian",
    };
  }

  if (normalized === "bilbo") {
    return {
      city: "Bilbao",
      citySlug: "bilbao",
    };
  }

  return {
    city: clean(rawCity),
    citySlug: slugify(rawCity),
  };
};

const resolveCountry = (record: Record<string, string>) => {
  const raw = clean(record.country || record.country_name);
  if (raw) {
    if (raw.includes("/")) {
      return getLocationSegment(raw, 0) || raw;
    }

    return raw;
  }

  return getLocationSegment(clean(record.location), 0);
};

const resolveRegion = (record: Record<string, string>) => {
  const raw = clean(record.state || record.region || record.province);
  if (raw) {
    if (raw.includes("/")) {
      return getLocationSegment(raw, 1) || raw;
    }

    return raw;
  }

  return getLocationSegment(clean(record.location), 1);
};

const resolveCity = (record: Record<string, string>) => {
  const raw = clean(
    record.city || record.location_city || record.destination_city
  );
  if (raw) {
    if (raw.includes("/")) {
      return getLocationSegment(raw, 2) || getLocationSegment(raw, 1) || raw;
    }

    return raw;
  }

  return getLocationSegment(clean(record.location), 2);
};

const isSpainCountry = (value: string) => {
  const normalized = normalizeSearch(value);
  return normalized === "spain" || normalized === "espana";
};

export const loadSpainTours = (): SpainTourRow[] => {
  try {
    if (!clean(spainCsvRaw)) {
      console.warn("[spain] spain.csv not found or empty");
      return [];
    }

    const parsed = parse(spainCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    return parsed.reduce<SpainTourRow[]>((acc, record, index) => {
      try {
        const country = resolveCountry(record);
        if (!isSpainCountry(country)) {
          return acc;
        }

        const id = clean(record.item_id || record.sourceItemId || record.id);
        const title = clean(record.item_name || record.title || record.name);
        const cityRaw = resolveCity(record);

        if (!id || !title || !cityRaw) {
          return acc;
        }

        const cityIdentity = resolveSpainCityIdentity(cityRaw);
        if (!cityIdentity.citySlug) {
          return acc;
        }

        acc.push({
          id,
          title,
          city: cityIdentity.city,
          citySlug: cityIdentity.citySlug,
          region: resolveRegion(record),
          country: "Spain",
          countrySlug: "spain",
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
          location: clean(record.location),
          locationLat: clean(record.location_lat || record.lat),
          locationLong: clean(
            record.location_long || record.lng || record.long
          ),
        });

        return acc;
      } catch {
        console.warn(`[spain] skipped malformed row at index ${index + 2}`);
        return acc;
      }
    }, []);
  } catch (error) {
    console.warn("[spain] failed to load spain.csv", error);
    return [];
  }
};
