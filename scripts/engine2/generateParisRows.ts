import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseCsv } from "./csvUtils";

const clean = (value?: string) => (value ?? "").trim();

const isParisLocation = (value?: string) => {
  const parts = clean(value)
    .split("/")
    .map(part => part.trim().toLowerCase())
    .filter(Boolean);

  return parts[0] === "france" && parts[2] === "paris";
};

const main = async () => {
  const csvPath = path.resolve(process.cwd(), "data/Paris.csv");
  const outputPath = path.resolve(
    process.cwd(),
    "src/engine2/data/paris.rows.ts"
  );

  const csv = await readFile(csvPath, "utf8");
  const sourceRows = parseCsv(csv);
  const parisRows = sourceRows.filter(row => isParisLocation(row.location));

  if (!parisRows.length) {
    throw new Error(
      "Paris row generation found no France/Île-de-France/Paris inventory; refusing to preserve or publish contaminated Paris data."
    );
  }

  const rows = parisRows.map(row => ({
    id: clean(row.item_id),
    title: clean(row.item_name),
    image: clean(row.image_url),
    bookingUrl: clean(row.regular_link),
    providerName: clean(row.company_name),
    providerShortName: clean(row.company_shortname),
    providerEmail: clean(row.company_email),
    providerPhone: clean(row.company_phone),
    location: clean(row.location),
    locationLat: clean(row.location_lat),
    locationLong: clean(row.location_long),
  }));

  const invalidRows = rows.filter(row => !row.id || !row.title || !row.bookingUrl);
  if (invalidRows.length) {
    throw new Error(
      `Paris row generation found ${invalidRows.length} Paris row(s) missing id, title, or booking URL.`
    );
  }

  const fileContents = `export type ParisEngine2Row = {\n  id: string;\n  title: string;\n  image: string;\n  bookingUrl: string;\n  providerName: string;\n  providerShortName: string;\n  providerEmail: string;\n  providerPhone: string;\n  location: string;\n  locationLat: string;\n  locationLong: string;\n};\n\nexport const parisEngine2Rows: ParisEngine2Row[] = ${JSON.stringify(
    rows,
    null,
    2
  )};\n`;

  await writeFile(outputPath, fileContents, "utf8");

  const rejected = sourceRows.length - parisRows.length;
  console.log(
    `[generateParisRows] retained ${parisRows.length.toLocaleString()} Paris rows and rejected ${rejected.toLocaleString()} row(s) whose CSV location is not France/Île-de-France/Paris.`
  );
};

await main();
