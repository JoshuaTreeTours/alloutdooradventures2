import { ENGINE6_CONFIGURED_PRODUCT_CODES } from "../src/engine6/routes";
import { ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS } from "../src/engine6/viatorPublicAvailability";

const LEGACY_REMOVED_CODES = [
  "44152P18",
  "191303P1",
  "5559561P1",
  "5765P7",
  "5396BOEING",
  "6021MBA",
  "9345P1",
  "118744P4",
] as const;

const LEGACY_REPLACEMENTS = {
  "191303P1": "142924P6",
  "9345P1": "9345P24",
} as const;

type ValidationRow = {
  code: string;
  status: "removed" | "replaced" | "active";
  replacement?: string;
  configured: boolean;
  blocklisted: boolean;
  source?: string;
  price?: number | null;
  rating?: number | null;
  reviews?: number | null;
  failure?: string;
};

const rows: ValidationRow[] = [];

for (const code of LEGACY_REMOVED_CODES) {
  const replacement = LEGACY_REPLACEMENTS[code as keyof typeof LEGACY_REPLACEMENTS];
  rows.push({
    code,
    status: replacement ? "replaced" : "removed",
    replacement,
    configured: ENGINE6_CONFIGURED_PRODUCT_CODES.includes(code),
    blocklisted: Boolean(ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS[code as keyof typeof ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS]),
  });
}

for (const code of ["142924P6", "9345P24"]) {
  try {
    const response = await fetch(
      `https://www.alloutdooradventures.com/api/engine6/viator-product?productCode=${code}`
    );
    const json = await response.json();
    rows.push({
      code,
      status: "active",
      configured: ENGINE6_CONFIGURED_PRODUCT_CODES.includes(code),
      blocklisted: false,
      source: json.source,
      price: json.extracted?.priceAmount ?? null,
      rating: json.extracted?.aggregateRating ?? null,
      reviews: json.extracted?.reviewCount ?? null,
      failure:
        json.source === "live-api"
          ? undefined
          : json.diagnostics?.usedBundledFallbackBecause ?? "not-live-api",
    });
  } catch (error) {
    rows.push({
      code,
      status: "active",
      configured: ENGINE6_CONFIGURED_PRODUCT_CODES.includes(code),
      blocklisted: false,
      failure: String(error),
    });
  }
}

const failures = rows.filter(row => {
  if (row.status === "removed" || row.status === "replaced") {
    return row.configured || !row.blocklisted;
  }
  return row.failure || !row.configured || row.source !== "live-api";
});

console.log(JSON.stringify({ rows, failures, pass: failures.length === 0 }, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
