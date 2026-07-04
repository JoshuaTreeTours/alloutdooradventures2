import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const FIXTURE_DIR = path.join(process.cwd(), "data", "engine6", "viator");
const PRODUCT_CODES = [
  "67327P4",
  "7953P7",
  "67327P13",
  "149066P1",
  "255730P191",
  "67327P5",
  "41503P1",
  "41503P2",
  "6349P59",
  "6766SIGTOUR",
  "67327P3",
  "7812P219",
  "6349DAYTOUR",
  "6349NIGHT",
  "6766P11",
  "41377P2",
  "60725P1",
  "14782P1",
  "5046WAS_MON",
  "6349VIPDC",
  "2384P20",
  "5769MTVN",
];

for (const productCode of PRODUCT_CODES) {
  const filePath = path.join(FIXTURE_DIR, `${productCode}.exact-product.json`);
  const payload = JSON.parse(readFileSync(filePath, "utf8")) as {
    product: {
      description?: { text?: string };
      itineraryItems?: Array<{ description?: string }>;
    };
  };

  const description = payload.product.description?.text ?? "";
  if (!/Washington,\s*D\.C\.|Washington D\.C\./i.test(description)) {
    payload.product.description = {
      text: description.replace(
        /^See Washington(?:'s)?/i,
        "See Washington, D.C."
      ).replace(
        /^Explore the capital/i,
        "Explore Washington, D.C."
      ).replace(
        /^Explore Washington(?!,\s*D\.C\.|\s+D\.C\.)/i,
        "Explore Washington, D.C."
      ).replace(
        /^Tour Washington/i,
        "Tour Washington, D.C."
      ).replace(
        /^Walk the National Mall/i,
        "Walk the National Mall in Washington, D.C."
      ).replace(
        /^Day-trip to Mount Vernon/i,
        "Day-trip from Washington, D.C. to Mount Vernon"
      ).replace(
        /^Combine Mount Vernon/i,
        "Combine Mount Vernon from Washington, D.C."
      ).replace(
        /^Visit Mount Vernon/i,
        "Visit Mount Vernon from Washington, D.C."
      ).replace(
        /^Glide through Washington, D\.C\./i,
        "Glide through Washington, D.C."
      ).replace(
        /^Cycle the National Mall/i,
        "Cycle the National Mall in Washington, D.C."
      ).replace(
        /^Design your own Washington, D\.C\./i,
        "Design your own Washington, D.C."
      ).replace(
        /^Discover U Street/i,
        "Discover U Street in Washington, D.C."
      ).replace(
        /^See the capital/i,
        "See Washington, D.C."
      ),
    };
  }

  for (const item of payload.product.itineraryItems ?? []) {
    item.description = "";
  }

  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Repaired ${productCode}`);
}

console.log(`Repaired ${PRODUCT_CODES.length} Washington D.C. fixtures.`);
