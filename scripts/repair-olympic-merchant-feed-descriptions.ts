import { readFileSync, writeFileSync } from "node:fs";

import { engine6ResolvedTours } from "../src/engine6/registry";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";

const OLYMPIC_CODES = [
  "132218P140",
  "132218P405",
  "265766P14",
  "265766P23",
  "265766P73",
  "318681P15",
  "3657P1",
  "383259P1",
  "5412OLYM",
  "5412P36",
  "5557524P1",
  "88081P1",
  "88081P2",
  "88081P4",
] as const;

const path = "data/merchantFeed.csv";
const lines = readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean);
const header = lines[0];
const body = lines.slice(1);

const rebuilt = body.map(line => {
  const id = line.split(",")[0];
  if (!OLYMPIC_CODES.includes(id as (typeof OLYMPIC_CODES)[number])) {
    return line;
  }

  const tour = engine6ResolvedTours.find(entry => entry.productCode === id);
  if (!tour) {
    throw new Error(`Missing tour for ${id}`);
  }

  const row = buildMerchantFeedRowFromProductSchema(tour);
  const escape = (value: string) =>
    value.includes(",") || value.includes('"')
      ? `"${value.replace(/"/g, '""')}"`
      : value;

  return [
    row.id,
    escape(row.title),
    escape(row.description),
    row.link,
    row.image_link,
    row.availability,
    row.price,
    row.condition,
    row.brand,
    row.average_rating,
    row.rating_count,
    row.review_count,
  ].join(",");
});

writeFileSync(path, `${[header, ...rebuilt].join("\n")}\n`, "utf8");
console.log("Repaired Olympic merchant feed descriptions in place.");
