import fs from "node:fs";
import path from "node:path";
import type { City } from "./destinations";
import { states } from "./destinations";
import { CITY_TIER1_INTL } from "./cityTier1Intl";
import { slugify } from "./tourCatalog";

export type CityGuideRecord = {
  country: string;
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  route: string;
  regionType: "state" | "country";
  cityData?: City;
};

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
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

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    if (char !== "\r") {
      current += char;
    }
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (text: string) => {
  const rows = parseCsvRows(text).filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  );
  const [headers, ...dataRows] = rows;

  if (!headers) {
    return [];
  }

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index]?.trim() ?? "";
    });
    return record;
  });
};

const getInternationalCsvFiles = () => {
  const baseDir = path.resolve("data");
  const europeDir = path.join(baseDir, "europe");
  const europeFiles = fs.existsSync(europeDir)
    ? fs
        .readdirSync(europeDir)
        .filter((file) => file.endsWith(".csv"))
        .map((file) => path.join(europeDir, file))
    : [];

  return [
    path.join(baseDir, "canada.csv"),
    ...europeFiles,
  ].filter((file) => fs.existsSync(file));
};

const buildIntlCityGuideRecords = (): CityGuideRecord[] => {
  const records = new Map<string, CityGuideRecord>();
  const files = getInternationalCsvFiles();

  files.forEach((file) => {
    const csvText = fs.readFileSync(file, "utf8");
    const rows = parseCsv(csvText);
    rows.forEach((row) => {
      const location = row.location;
      if (!location) {
        return;
      }
      const parts = location
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length < 2) {
        return;
      }
      const [country, maybeRegion, maybeCity] = parts;
      const city = maybeCity ?? maybeRegion;
      if (!city) {
        return;
      }
      const countrySlug = slugify(country);
      if (countrySlug === "united-states") {
        return;
      }
      const citySlug = slugify(city);
      const key = `${countrySlug}/${citySlug}`;
      if (records.has(key)) {
        return;
      }

      records.set(key, {
        country,
        state: country,
        stateSlug: countrySlug,
        city,
        citySlug,
        route: `/guides/world/${countrySlug}/${citySlug}`,
        regionType: "country",
      });
    });
  });

  return Array.from(records.values());
};

const buildUsCityGuideRecords = (): CityGuideRecord[] =>
  states.flatMap((state) =>
    state.cities.map((city) => ({
      country: "United States",
      state: state.name,
      stateSlug: state.slug,
      city: city.name,
      citySlug: city.slug,
      route: `/guides/us/${state.slug}/${city.slug}`,
      regionType: "state" as const,
      cityData: city,
    })),
  );

const intlCityGuideRecords = buildIntlCityGuideRecords();

const tier1IntlMissing = CITY_TIER1_INTL.filter(
  (city) =>
    !intlCityGuideRecords.some(
      (record) =>
        record.stateSlug === city.countrySlug &&
        record.citySlug === city.citySlug,
    ),
);

if (tier1IntlMissing.length) {
  const missingList = tier1IntlMissing
    .map((city) => `${city.countrySlug}/${city.citySlug}`)
    .join(", ");
  throw new Error(
    `Tier-1 Intl registry mismatch: ${missingList} not found in international guide records.`,
  );
}

export const allCityGuideRecords: CityGuideRecord[] = [
  ...buildUsCityGuideRecords(),
  ...intlCityGuideRecords,
];
