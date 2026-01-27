import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  renderCityBookingPage,
  renderCityRoutes,
  renderCityTourPage,
} from "./templates/cityTourTemplates";

const DEFAULT_CSV_PATH = "data/sedona.csv";
const PLACEHOLDER_IMAGE = "/hero.jpg";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const sanitizeCsvText = (value?: string) =>
  value
    ?.replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const splitCsvRows = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      const nextChar = text[index + 1];
      if (inQuotes && nextChar === '"') {
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
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      row.push(current);
      current = "";
      if (row.some((entry) => entry.length > 0)) {
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

export const enforceBrandingNo = (url: string): string => {
  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;

    if (!params.has("branding")) {
      params.set("branding", "no");
    }

    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
};

const writeFileIfChanged = async (filePath: string, content: string) => {
  try {
    const existing = await readFile(filePath, "utf-8");
    if (existing === content) {
      return;
    }
  } catch {
    // File missing, write new content.
  }

  await writeFile(filePath, content, "utf-8");
};

const parseArgs = (args: string[]) => {
  const flags = new Set(args);
  const getValue = (name: string) => {
    const direct = args.find((arg) => arg.startsWith(`${name}=`));
    if (direct) {
      return direct.split("=")[1];
    }
    const index = args.indexOf(name);
    if (index >= 0) {
      return args[index + 1];
    }
    return undefined;
  };

  const start = Number(getValue("--start") ?? "0");
  const count = Number(getValue("--count") ?? String(Number.POSITIVE_INFINITY));

  return {
    csvPath: getValue("--csv") ?? args[0],
    jsonOnly: flags.has("--json-only"),
    pagesOnly: flags.has("--pages-only"),
    includeRoutes: flags.has("--routes"),
    start: Number.isFinite(start) ? Math.max(0, start) : 0,
    count:
      Number.isFinite(count) && count > 0
        ? count
        : Number.POSITIVE_INFINITY,
  };
};

const normalizeLocation = (city: string, state: string) =>
  `${city}, ${state}`;

const buildTours = (
  rows: Record<string, string>[],
  cityName: string,
  stateName: string,
) =>
  rows.map((row) => {
    const title = sanitizeCsvText(row.item_name) ?? "Untitled Tour";
    const operator = sanitizeCsvText(row.company_name) ?? "Tour Operator";
    const operatorSlug = sanitizeCsvText(row.company_shortname) ?? "operator";
    const itemId = sanitizeCsvText(row.item_id) ?? "";
    const baseSlug = slugify(`${title}-${itemId}`);
    const tags = (sanitizeCsvText(row.tags) ?? "")
      .split("-")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const bookingUrl = enforceBrandingNo(
      sanitizeCsvText(row.regular_link) ?? "",
    );
    const bookingWidgetUrl = enforceBrandingNo(
      sanitizeCsvText(row.calendar_link) ?? "",
    );
    const imageUrl = sanitizeCsvText(row.image_url) ?? PLACEHOLDER_IMAGE;
    const shortDescription = `${title} is a ${cityName} experience hosted by ${operator}, blending local knowledge with an easy booking flow.`;
    const tagline = tags.slice(0, 3).join(" · ") || "Local adventure";

    return {
      id: `${operatorSlug}-${itemId}`,
      slug: baseSlug,
      title,
      operator,
      operatorSlug,
      location: normalizeLocation(cityName, stateName),
      tags,
      tagline,
      imageUrl,
      bookingUrl,
      bookingWidgetUrl,
      shortDescription,
    };
  });

const loadCsvRows = async (csvPath: string) => {
  const csvText = await readFile(csvPath, "utf-8");
  const [headerRow, ...bodyRows] = splitCsvRows(csvText);
  const headers = headerRow.map((header) => sanitizeCsvText(header) ?? "");

  return bodyRows
    .filter((row) => row.some((entry) => entry.length > 0))
    .map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (header) {
          record[header] = row[index] ?? "";
        }
      });
      return record;
    });
};

const writeJson = async (
  tours: ReturnType<typeof buildTours>,
  outputPath: string,
  payload: { state: string; city: string },
) => {
  const payloadWithTours = {
    state: payload.state,
    city: payload.city,
    tours,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFileIfChanged(
    outputPath,
    `${JSON.stringify(payloadWithTours, null, 2)}\n`,
  );
};

const writePages = async (
  tours: ReturnType<typeof buildTours>,
  start: number,
  count: number,
  pagesDir: string,
) => {
  const bookingDir = path.join(pagesDir, "book");
  await mkdir(pagesDir, { recursive: true });
  await mkdir(bookingDir, { recursive: true });

  const slice = tours.slice(start, start + count);

  await Promise.all(
    slice.map(async (tour) => {
      const detailPath = path.join(pagesDir, `${tour.slug}.tsx`);
      const bookingPath = path.join(bookingDir, `${tour.slug}.tsx`);

      await Promise.all([
        writeFileIfChanged(detailPath, renderCityTourPage(tour.slug)),
        writeFileIfChanged(bookingPath, renderCityBookingPage(tour.slug)),
      ]);
    }),
  );
};

const writeRoutes = async (
  tours: ReturnType<typeof buildTours>,
  routesPath: string,
  stateSlug: string,
  citySlug: string,
) => {
  await mkdir(path.dirname(routesPath), { recursive: true });
  await writeFileIfChanged(
    routesPath,
    renderCityRoutes(tours.map((tour) => tour.slug), {
      stateSlug,
      citySlug,
    }),
  );
};

const writeCityData = async (
  outputPath: string,
  stateSlug: string,
  citySlug: string,
) => {
  const content = `import cityToursData from "../../../data/generated/${stateSlug}.${citySlug}.tours.json";\n\ntype CityToursPayload = {\n  state: string;\n  city: string;\n  tours: CityTour[];\n};\n\nexport type CityTour = {\n  id: string;\n  slug: string;\n  title: string;\n  operator: string;\n  operatorSlug: string;\n  location: string;\n  tags: string[];\n  tagline: string;\n  imageUrl: string;\n  bookingUrl: string;\n  bookingWidgetUrl: string;\n  shortDescription: string;\n};\n\nconst { tours } = cityToursData as CityToursPayload;\n\nconst tourBySlug = new Map(tours.map((tour) => [tour.slug, tour]));\n\nexport const cityTours = tours;\n\nexport const getCityTourBySlug = (slug: string) => tourBySlug.get(slug);\n\nexport const getCityTourPath = (slugOrTour: string | CityTour) => {\n  const slug = typeof slugOrTour === "string" ? slugOrTour : slugOrTour.slug;\n  return "/${stateSlug}/${citySlug}/" + slug;\n};\n\nexport const getCityTourBookingPath = (slugOrTour: string | CityTour) => {\n  const slug = typeof slugOrTour === "string" ? slugOrTour : slugOrTour.slug;\n  return "/${stateSlug}/${citySlug}/book/" + slug;\n};\n`;

  await writeFileIfChanged(outputPath, content);
};

const writeCityPages = async (
  pagesDir: string,
  stateSlug: string,
  citySlug: string,
  stateName: string,
  cityName: string,
) => {
  const indexContent = `import React from "react";
import data from "../../../data/generated/${stateSlug}.${citySlug}.tours.json";

export default function CityToursIndex() {
  const tours = data.tours || [];

  return (
    <main className=\"mx-auto max-w-5xl px-6 py-12\">
      <h1 className=\"text-3xl font-semibold\">${cityName} Tours</h1>
      <p className=\"mt-3 opacity-90\">
        Hand-picked experiences in ${cityName}, ${stateName}.
      </p>

      <div className=\"mt-8 grid gap-4 sm:grid-cols-2\">
        {tours.map((tour) => (
          <a
            key={tour.id}
            className=\"rounded-2xl border p-5 hover:shadow-sm\"
            href={\"/${stateSlug}/${citySlug}/\" + tour.slug}
          >
            <div className=\"font-semibold\">{tour.title}</div>
            <div className=\"mt-1 text-sm opacity-80\">
              {tour.shortDescription || "Explore with a top-rated local experience."}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
`;

  const tourPageContent = `import { Link } from "wouter";\n\nimport Image from "../../../components/Image";\nimport { getCityTourBookingPath, type CityTour } from "./cityTourData";\n\ntype CityTourPageProps = {\n  tour?: CityTour;\n};\n\nexport default function CityTourPage({ tour }: CityTourPageProps) {\n  if (!tour) {\n    return (\n      <main className=\"mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]\">\n        <h1 className=\"text-2xl font-semibold\">Tour not found</h1>\n        <p className=\"mt-4 text-sm text-[#405040]\">\n          We couldn’t find that ${cityName} tour. Head back to ${stateName} to keep\n          exploring.\n        </p>\n        <div className=\"mt-6\">\n          <Link href=\"/destinations/states/${stateSlug}\">\n            <a className=\"inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]\">\n              Back to ${stateName}\n            </a>\n          </Link>\n        </div>\n      </main>\n    );\n  }\n\n  return (\n    <main className=\"bg-[#f6f1e8] text-[#1f2a1f]\">\n      <section className=\"bg-[#2f4a2f] text-white\">\n        <div className=\"mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12\">\n          <div className=\"flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80\">\n            <Link href=\"/destinations\">\n              <a>Destinations</a>\n            </Link>\n            <span>/</span>\n            <Link href=\"/destinations/states/${stateSlug}\">\n              <a>${stateName}</a>\n            </Link>\n            <span>/</span>\n            <Link href=\"/${stateSlug}/${citySlug}\">\n              <a>${cityName} tours</a>\n            </Link>\n            <span>/</span>\n            <span className=\"text-white\">{tour.title}</span>\n          </div>\n          <div>\n            <p className=\"text-xs uppercase tracking-[0.3em] text-white/70\">\n              {tour.location}\n            </p>\n            <h1 className=\"mt-3 text-3xl font-semibold md:text-5xl\">\n              {tour.title}\n            </h1>\n            {tour.tagline ? (\n              <p className=\"mt-3 max-w-3xl text-sm text-white/90 md:text-base\">\n                {tour.tagline}\n              </p>\n            ) : null}\n          </div>\n          <div className=\"flex flex-wrap gap-3\">\n            <Link href={getCityTourBookingPath(tour)}>\n              <a className=\"inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]\">\n                Book now\n              </a>\n            </Link>\n            <Link href=\"/${stateSlug}/${citySlug}\">\n              <a className=\"inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25\">\n                Back to ${cityName} tours\n              </a>\n            </Link>\n          </div>\n        </div>\n      </section>\n\n      <section className=\"mx-auto grid max-w-5xl gap-8 px-6 py-14 md:grid-cols-[2fr_1fr]\">\n        <div className=\"space-y-6\">\n          <div className=\"overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm\">\n            <Image\n              src={tour.imageUrl}\n              fallbackSrc=\"/hero.jpg\"\n              alt={tour.title}\n              className=\"h-80 w-full object-cover\"\n            />\n          </div>\n          <div className=\"rounded-2xl border border-black/10 bg-white p-6 shadow-sm\">\n            <h2 className=\"text-xl font-semibold text-[#2f4a2f]\">\n              About this ${cityName} tour\n            </h2>\n            <p className=\"mt-3 text-sm md:text-base text-[#405040]\">\n              {tour.shortDescription}\n            </p>\n            <p className=\"mt-4 text-sm text-[#405040]\">\n              Hosted by <span className=\"font-semibold\">{tour.operator}</span>.\n            </p>\n          </div>\n        </div>\n        <aside className=\"space-y-6\">\n          <div className=\"rounded-2xl border border-black/10 bg-white p-6 shadow-sm\">\n            <h3 className=\"text-lg font-semibold text-[#2f4a2f]\">Highlights</h3>\n            <div className=\"mt-4 flex flex-wrap gap-2\">\n              {tour.tags.map((tag) => (\n                <span\n                  key={tag}\n                  className=\"rounded-full bg-[#f1eadf] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]\"\n                >\n                  {tag}\n                </span>\n              ))}\n            </div>\n          </div>\n          <div className=\"rounded-2xl border border-[#2f4a2f]/20 bg-white p-6 shadow-sm\">\n            <h3 className=\"text-lg font-semibold text-[#2f4a2f]\">\n              Ready to book?\n            </h3>\n            <p className=\"mt-3 text-sm text-[#405040]\">\n              Secure your preferred time with the official booking calendar.\n            </p>\n            <div className=\"mt-4 flex flex-col gap-3\">\n              <Link href={getCityTourBookingPath(tour)}>\n                <a className=\"inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]\">\n                  View booking calendar\n                </a>\n              </Link>\n              <a\n                href={tour.bookingUrl}\n                className=\"inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#f1eadf]\"\n                target=\"_blank\"\n                rel=\"noreferrer\"\n              >\n                Open official booking page\n              </a>\n            </div>\n          </div>\n        </aside>\n      </section>\n    </main>\n  );\n}\n`;

  const bookingPageContent = `import { Link } from "wouter";\n\nimport {\n  getCityTourBookingPath,\n  getCityTourPath,\n  type CityTour,\n} from "./cityTourData";\n\ntype CityTourBookingPageProps = {\n  tour?: CityTour;\n};\n\nexport default function CityTourBookingPage({\n  tour,\n}: CityTourBookingPageProps) {\n  if (!tour) {\n    return (\n      <main className=\"mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]\">\n        <h1 className=\"text-2xl font-semibold\">Booking page not found</h1>\n        <p className=\"mt-4 text-sm text-[#405040]\">\n          We couldn’t find that ${cityName} tour booking page. Head back to ${stateName} to\n          keep exploring.\n        </p>\n        <div className=\"mt-6\">\n          <Link href=\"/destinations/states/${stateSlug}\">\n            <a className=\"inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]\">\n              Back to ${stateName}\n            </a>\n          </Link>\n        </div>\n      </main>\n    );\n  }\n\n  return (\n    <main className=\"bg-[#f6f1e8] text-[#1f2a1f]\">\n      <section className=\"bg-[#2f4a2f] text-white\">\n        <div className=\"mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12\">\n          <div className=\"flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80\">\n            <Link href={getCityTourPath(tour)}>\n              <a>{tour.title}</a>\n            </Link>\n            <span>/</span>\n            <span className=\"text-white\">Booking</span>\n          </div>\n          <div>\n            <p className=\"text-xs uppercase tracking-[0.3em] text-white/70\">\n              {tour.location}\n            </p>\n            <h1 className=\"mt-3 text-3xl font-semibold md:text-5xl\">\n              Book {tour.title}\n            </h1>\n            <p className=\"mt-3 max-w-3xl text-sm text-white/90 md:text-base\">\n              Reserve your spot through the official FareHarbor calendar. If the\n              embed doesn’t load, use the direct booking link below.\n            </p>\n          </div>\n          <div className=\"flex flex-wrap gap-3\">\n            <Link href={getCityTourPath(tour)}>\n              <a className=\"inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25\">\n                Back to tour\n              </a>\n            </Link>\n            <Link href={getCityTourBookingPath(tour)}>\n              <a className=\"inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]\">\n                Refresh booking\n              </a>\n            </Link>\n          </div>\n        </div>\n      </section>\n\n      <section className=\"mx-auto max-w-5xl px-6 py-14\">\n        <div className=\"overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm\">\n          {tour.bookingWidgetUrl ? (\n            <iframe\n              title={tour.title + " booking"}\n              src={tour.bookingWidgetUrl}\n              className=\"h-[820px] w-full\"\n              loading=\"lazy\"\n            />\n          ) : (\n            <div className=\"p-10 text-center text-sm text-[#405040]\">\n              Booking details aren’t available right now. Please use the direct\n              booking link below.\n            </div>\n          )}\n        </div>\n        <div className=\"mt-6 flex flex-col items-start gap-3\">\n          <a\n            href={tour.bookingUrl}\n            className=\"inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]\"\n            target=\"_blank\"\n            rel=\"noreferrer\"\n          >\n            Open official booking page\n          </a>\n          <p className=\"text-xs text-[#405040]\">\n            You’ll be taken to FareHarbor to confirm availability and pricing.\n          </p>\n        </div>\n      </section>\n    </main>\n  );\n}\n`;

  await Promise.all([
    writeFileIfChanged(path.join(pagesDir, "index.tsx"), indexContent),
    writeFileIfChanged(path.join(pagesDir, "CityTourPage.tsx"), tourPageContent),
    writeFileIfChanged(
      path.join(pagesDir, "CityTourBookingPage.tsx"),
      bookingPageContent,
    ),
  ]);
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const csvPath = path.resolve(options.csvPath ?? DEFAULT_CSV_PATH);
  const rows = await loadCsvRows(csvPath);
  const [firstRow] = rows;
  const stateName = sanitizeCsvText(firstRow?.state) ?? "";
  const cityName = sanitizeCsvText(firstRow?.city) ?? "";

  if (!stateName || !cityName) {
    throw new Error("CSV is missing required state/city columns or values.");
  }

  const stateSlug = slugify(stateName);
  const citySlug = slugify(cityName);

  rows.forEach((row) => {
    const rowState = sanitizeCsvText(row.state) ?? "";
    const rowCity = sanitizeCsvText(row.city) ?? "";
    if (!rowState || !rowCity) {
      throw new Error("CSV rows must include state and city values.");
    }
    if (slugify(rowState) !== stateSlug || slugify(rowCity) !== citySlug) {
      throw new Error("CSV contains multiple state/city values.");
    }
  });

  const tours = buildTours(rows, cityName, stateName);
  const pagesDir = path.resolve(`src/pages/${stateSlug}/${citySlug}`);
  const routesPath = path.join(pagesDir, "cityTourRoutes.tsx");
  const outputJson = path.resolve(
    `src/data/generated/${stateSlug}.${citySlug}.tours.json`,
  );
  const dataPath = path.join(pagesDir, "cityTourData.ts");

  if (!options.pagesOnly) {
    await writeJson(tours, outputJson, {
      state: stateName,
      city: cityName,
    });
  }

  if (!options.jsonOnly) {
    await writeCityPages(pagesDir, stateSlug, citySlug, stateName, cityName);
    await writeCityData(dataPath, stateSlug, citySlug);
    await writePages(tours, options.start, options.count, pagesDir);
  }

  if (options.includeRoutes) {
    await writeRoutes(tours, routesPath, stateSlug, citySlug);
  }
};

run();
