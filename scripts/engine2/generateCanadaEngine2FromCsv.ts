import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ENGINE2_DEFAULT_IMAGE } from "../../src/engine2/config/destinations";
import { buildTourCopy } from "../../src/engine2/content/templates/buildTourCopy";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../../src/engine2/utils/buildFareHarborUrl";
import { parseCsv } from "./csvUtils";

type CsvRow = Record<string, string>;

type GeneratedTour = {
  id: string;
  sourceCountrySlug: "canada";
  sourceProvinceSlug: string;
  sourceCitySlug: string;
  slug: string;
  name: string;
  activityTags: string[];
  provider: { name: string; shortName: string; email?: string; phone?: string };
  geo: {
    country: "Canada";
    region: string;
    city: string;
    lat: number | null;
    lng: number | null;
  };
  seo: { title: string; description: string; canonicalPath: string; ogImage: string };
  content: { experienceText: string; highlights: string[] };
  images: { hero: string | null; gallery: string[] };
  booking: {
    bookingUrl: string;
    fareharbor?: { shortname: string; itemId: string; refUrl: string; backUrl: string };
  };
};

const clean = (value?: string) => (value ?? "").trim();
const uniq = (arr: string[]) => Array.from(new Set(arr));
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const parseLatLng = (latRaw: string, lngRaw: string) => {
  const lat = Number.parseFloat(latRaw);
  const lng = Number.parseFloat(lngRaw);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : { lat: null, lng: null };
};

const parseFareHarborDetails = (url?: string) => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "fareharbor.com") return undefined;
    const match = parsed.pathname.match(/\/embeds\/(?:book|calendar)\/([^/]+)\/items\/(\d+)/);
    if (!match?.[1] || !match?.[2]) return undefined;
    return {
      shortname: match[1],
      itemId: match[2],
      refUrl: "https://www.alloutdooradventures.com",
      backUrl: "https://www.alloutdooradventures.com/",
    };
  } catch {
    return undefined;
  }
};

const PROVINCE_ALIASES: Record<string, string> = {
  quebec: "Québec",
};

const detectActivityTags = (name: string) => {
  const value = name.toLowerCase();
  const map: Array<[string, RegExp]> = [
    ["bike", /\bbike|biking|ebike|cycling\b/],
    ["kayak", /\bkayak|canoe|paddle\b/],
    ["whale", /\bwhale\b/],
    ["food", /\bfood|taco|wine|brew|culinary\b/],
    ["walking", /\bwalk|walking|hike|hiking\b/],
    ["helicopter", /\bhelicopter|heli\b/],
    ["boat", /\bboat|cruise|sail\b/],
  ];
  return map.filter(([, rx]) => rx.test(value)).map(([tag]) => tag);
};

const parseCanadaLocation = (row: CsvRow) => {
  const parts = clean(row.location).split("/").map(clean).filter(Boolean);
  if (parts[0]?.toLowerCase() !== "canada") return null;
  const provinceRaw = parts[1] || "Unknown Province";
  const cityRaw = parts[2] || clean(row.company_name) || clean(row.item_name).split(" ").slice(0, 2).join(" ");
  const provinceSlug = slugify(provinceRaw);
  const citySlug = slugify(cityRaw);
  return {
    country: "Canada" as const,
    province: PROVINCE_ALIASES[provinceRaw.toLowerCase()] || provinceRaw,
    provinceSlug,
    city: titleCase(cityRaw),
    citySlug,
  };
};

const validateGeneratedTours = (tours: GeneratedTour[]) => {
  for (const tour of tours) {
    const seo = buildEngine2Seo(tour);
    const graph = buildSchemaGraph(tour, seo);
    const types = new Set(graph.map(node => node["@type"]));
    if (!types.has("TouristTrip") || !types.has("Product")) {
      throw new Error(`Schema validation failed for ${tour.id}`);
    }
  }
};

const main = async () => {
  const csvPath = path.resolve(process.cwd(), "data/canada plus northern states.csv");
  const rows = parseCsv(await readFile(csvPath, "utf8"));

  let canadaRows = 0;
  let unitedStatesRows = 0;
  const tours: GeneratedTour[] = [];

  for (const row of rows) {
    const location = parseCanadaLocation(row);
    if (!location) {
      if (clean(row.location).toLowerCase().startsWith("united states/")) unitedStatesRows += 1;
      continue;
    }
    canadaRows += 1;

    const id = clean(row.item_id);
    const name = clean(row.item_name);
    if (!id || !name || !location.citySlug || !location.provinceSlug) continue;

    const fareharbor = parseFareHarborDetails(row.regular_link) ?? parseFareHarborDetails(row.calendar_link);
    const bookingUrl = fareharbor
      ? buildFareHarborUrl({ company: fareharbor.shortname, itemId: fareharbor.itemId, calendarPath: row.calendar_link || row.regular_link })
      : normalizeFareHarborUrl(row.regular_link || row.calendar_link);
    if (!bookingUrl) continue;

    const canonicalPath = `/destinations/world/canada/${location.provinceSlug}/${location.citySlug}/tours/${slugify(name)}-${id}`;
    const providerName = clean(row.company_name) || "Unknown provider";
    const copy = buildTourCopy({ name, provider: providerName, city: location.city, region: location.province });
    const primaryImage = clean(row.image_url) || ENGINE2_DEFAULT_IMAGE;
    const coords = parseLatLng(row.location_lat, row.location_long);

    const draft: GeneratedTour = {
      id,
      sourceCountrySlug: "canada",
      sourceProvinceSlug: location.provinceSlug,
      sourceCitySlug: location.citySlug,
      slug: `${slugify(name)}-${id}`,
      name,
      activityTags: detectActivityTags(name),
      provider: { name: providerName, shortName: clean(row.company_shortname), email: clean(row.company_email) || undefined, phone: clean(row.company_phone) || undefined },
      geo: { country: "Canada", region: location.province, city: location.city, lat: coords.lat, lng: coords.lng },
      seo: { title: "", description: copy.metaDescription, canonicalPath, ogImage: primaryImage },
      content: { experienceText: copy.experienceText, highlights: copy.highlights },
      images: { hero: primaryImage, gallery: [] },
      booking: { bookingUrl, fareharbor },
    };

    const seo = buildEngine2Seo(draft);
    tours.push({ ...draft, seo: { ...draft.seo, title: seo.title, description: seo.description } });
  }

  const uniqueTours = Array.from(new Map(tours.map(t => [t.id, t])).values()).sort((a, b) => a.seo.canonicalPath.localeCompare(b.seo.canonicalPath));

  const provincesMap = new Map<string, { provinceName: string; provinceSlug: string; cities: Map<string, { cityName: string; citySlug: string; tourIds: string[] }> }>();
  const citiesIndexMap = new Map<string, { cityName: string; citySlug: string; tourCount: number; sampleImages: string[] }>();

  for (const tour of uniqueTours) {
    const pKey = tour.sourceProvinceSlug;
    if (!provincesMap.has(pKey)) {
      provincesMap.set(pKey, { provinceName: tour.geo.region, provinceSlug: pKey, cities: new Map() });
    }
    const province = provincesMap.get(pKey)!;
    if (!province.cities.has(tour.sourceCitySlug)) {
      province.cities.set(tour.sourceCitySlug, { cityName: tour.geo.city, citySlug: tour.sourceCitySlug, tourIds: [] });
    }
    province.cities.get(tour.sourceCitySlug)!.tourIds.push(tour.id);

    const city = citiesIndexMap.get(tour.sourceCitySlug) ?? { cityName: tour.geo.city, citySlug: tour.sourceCitySlug, tourCount: 0, sampleImages: [] };
    city.tourCount += 1;
    city.sampleImages = uniq([...city.sampleImages, tour.images.hero || ENGINE2_DEFAULT_IMAGE]).slice(0, 4);
    citiesIndexMap.set(tour.sourceCitySlug, city);
  }

  const provincesIndex = Array.from(provincesMap.values()).map((province) => ({
    provinceName: province.provinceName,
    provinceSlug: province.provinceSlug,
    tourCount: Array.from(province.cities.values()).reduce((sum, city) => sum + city.tourIds.length, 0),
    cities: Array.from(province.cities.values()).sort((a, b) => a.citySlug.localeCompare(b.citySlug)),
  })).sort((a, b) => b.tourCount - a.tourCount);

  const citiesIndex = Array.from(citiesIndexMap.values()).sort((a, b) => b.tourCount - a.tourCount);

  validateGeneratedTours(uniqueTours);

  const outPath = path.resolve(process.cwd(), "src/engine2/data/canada.generated.ts");
  const out = `const canadaEngine2Tours = ${JSON.stringify(uniqueTours, null, 2)} as const;\n\nexport const canadaEngine2ProvincesIndex = ${JSON.stringify(provincesIndex, null, 2)} as const;\n\nexport const canadaEngine2CitiesIndex = ${JSON.stringify(citiesIndex, null, 2)} as const;\n\nexport default canadaEngine2Tours;\n`;
  await writeFile(outPath, out, "utf8");

  console.log("[engine2:canada] CSV rows:", rows.length);
  console.log("[engine2:canada] Canada rows:", canadaRows);
  console.log("[engine2:canada] Ignored United States rows:", unitedStatesRows);
  console.log("[engine2:canada] Generated tours:", uniqueTours.length);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
