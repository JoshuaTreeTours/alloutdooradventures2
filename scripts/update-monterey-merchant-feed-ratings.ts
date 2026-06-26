import { readFileSync, writeFileSync } from "node:fs";

import { MONTEREY_VIATOR_PUBLIC_RATINGS } from "../src/engine6/montereyViatorPublicRatings";

const path = "data/merchantFeed.csv";
const lines = readFileSync(path, "utf8").split(/\r?\n/);
const out: string[] = [];
let montereyUpdated = 0;

for (const line of lines) {
  if (!line.trim()) {
    continue;
  }

  const id = line.split(",")[0];
  const ratings = MONTEREY_VIATOR_PUBLIC_RATINGS[id];
  if (!ratings) {
    out.push(line);
    continue;
  }

  const averageRating = ratings.rating.toFixed(1);
  const reviewCount = String(ratings.reviewCount);
  const updatedLine = line.replace(
    /,Outdoor Adventures,[\d.]+,\d+,\d+$/,
    `,Outdoor Adventures,${averageRating},${reviewCount},${reviewCount}`
  );

  if (updatedLine === line) {
    throw new Error(`Failed to update merchant feed ratings for ${id}`);
  }

  out.push(updatedLine);
  montereyUpdated += 1;
  console.log(`${id}: ${averageRating} / ${reviewCount}`);
}

writeFileSync(path, `${out.join("\n")}\n`, "utf8");
console.log(
  `Updated ${montereyUpdated} Monterey merchant feed rows (${out.length - 1} total data rows).`
);
