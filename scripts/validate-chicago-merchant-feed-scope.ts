/**
 * Validates Chicago-only merchant feed regeneration scope.
 * Run: npx tsx scripts/validate-chicago-merchant-feed-scope.ts [before.csv] [after.csv]
 */
import { readFileSync } from "node:fs";

import { CHICAGO_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/chicagoViatorPublicRatings";

const beforePath = process.argv[2] ?? "data/merchantFeed.csv.bak";
const afterPath = process.argv[3] ?? "data/merchantFeed.csv";

const chicagoCodes = new Set<string>(CHICAGO_VIATOR_PUBLIC_PRODUCT_CODES);

const parseCsvLine = (line: string) => {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
};

const readRows = (path: string) => {
  const lines = readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean);
  const map = new Map<string, string[]>();

  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line);
    map.set(fields[0], fields);
  }

  return map;
};

const readFixtureHeroUrl = (productCode: string) => {
  const payload = JSON.parse(
    readFileSync(
      `data/engine6/viator/${productCode}.exact-product.json`,
      "utf8"
    )
  ) as {
    product: {
      media: {
        images: Array<{
          variants: {
            FULL: {
              url: string;
            };
          };
        }>;
      };
    };
  };

  return payload.product.media.images[0].variants.FULL.url;
};

const before = readRows(beforePath);
const after = readRows(afterPath);
const changed: string[] = [];

for (const [id, fields] of after) {
  const previous = before.get(id);
  if (!previous || previous.join("\u0000") !== fields.join("\u0000")) {
    changed.push(id);
  }
}

const changedNonChicago = changed.filter(id => !chicagoCodes.has(id));
const unchangedChicago = CHICAGO_VIATOR_PUBLIC_PRODUCT_CODES.filter(
  code => {
    const previous = before.get(code);
    const next = after.get(code);
    return (
      previous &&
      next &&
      previous.join("\u0000") === next.join("\u0000")
    );
  }
);

const heroMismatches: string[] = [];
const commercialFieldChanges: string[] = [];

for (const code of CHICAGO_VIATOR_PUBLIC_PRODUCT_CODES) {
  const previous = before.get(code);
  const next = after.get(code);
  if (!previous || !next) {
    throw new Error(`Missing merchant feed row for ${code}`);
  }

  const expectedHero = readFixtureHeroUrl(code);
  if (next[4] !== expectedHero) {
    heroMismatches.push(`${code}: feed=${next[4]} fixture=${expectedHero}`);
  }

  const commercialIndexes = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
  const changedCommercial = commercialIndexes.filter(
    index => previous[index] !== next[index]
  );
  if (changedCommercial.length > 0) {
    commercialFieldChanges.push(`${code}: indexes ${changedCommercial.join(",")}`);
  }
}

console.log(`Changed rows: ${changed.length}`);
console.log(`Changed product codes: ${changed.sort().join(", ")}`);
console.log(`Non-Chicago changes: ${changedNonChicago.length}`);
console.log(`Unchanged Chicago rows: ${unchangedChicago.length}`);
console.log(`Hero mismatches: ${heroMismatches.length}`);
console.log(`Commercial field changes: ${commercialFieldChanges.length}`);

if (changedNonChicago.length > 0) {
  console.error("Non-Chicago rows changed:", changedNonChicago.join(", "));
  process.exit(1);
}

if (changed.some(id => !chicagoCodes.has(id))) {
  console.error("Changed rows include non-Chicago product codes.");
  process.exit(1);
}

if (unchangedChicago.length > 0) {
  console.log(
    `Already-correct Chicago rows (no diff): ${unchangedChicago.join(", ")}`
  );
}

if (heroMismatches.length > 0) {
  console.error(heroMismatches.join("\n"));
  process.exit(1);
}

if (commercialFieldChanges.length > 0) {
  console.error(commercialFieldChanges.join("\n"));
  process.exit(1);
}

console.log("Chicago merchant feed scope validation passed.");
