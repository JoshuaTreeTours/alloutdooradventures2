import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";
import { resolveEngine6TourForProductSchema } from "../src/engine6/resolveEngine6TourForProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { formatMerchantPrice } from "../src/utils/merchantPricing";

const DEFAULT_RUNTIME_BASE_URL = "https://www.alloutdooradventures.com";

export type MerchantFeedLiveRuntimeParityReport = {
  totalProducts: number;
  productsInParity: number;
  priceDrift: number;
  ratingDrift: number;
  reviewCountDrift: number;
  pass: boolean;
  drifts: Array<{
    productCode: string;
    title: string;
    csv: { price: string; rating: string; reviews: string };
    liveJsonLd: { price: string; rating: string; reviews: string };
    priceDrift: boolean;
    ratingDrift: boolean;
    reviewCountDrift: boolean;
  }>;
};

const resolveRuntimeCommercialBaseUrl = () =>
  (
    process.env.MERCHANT_FEED_RUNTIME_BASE_URL ??
    process.env.ENGINE6_RUNTIME_BASE_URL ??
    DEFAULT_RUNTIME_BASE_URL
  ).replace(/\/$/, "");

const formatRating = (value: number) => value.toFixed(1);
const formatCount = (value: number) => String(Math.trunc(value));

const fetchLiveProductJsonLdCommercial = async (productCode: string) => {
  const baseUrl = resolveRuntimeCommercialBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/engine6/viator-product?productCode=${encodeURIComponent(productCode)}`
  );

  if (!response.ok) {
    throw new Error(
      `Live runtime commercial fetch failed for ${productCode}: HTTP ${response.status}`
    );
  }

  const body = (await response.json()) as {
    extracted?: {
      priceAmount?: number | null;
      priceFormatted?: string | null;
      aggregateRating?: number | null;
      reviewCount?: number | null;
    };
  };

  const tour = engine6ResolvedTours.find(
    candidate => candidate.productCode === productCode
  );
  if (!tour || !body.extracted) {
    throw new Error(`Missing runtime commercial payload for ${productCode}`);
  }

  const resolvedTour = resolveEngine6TourForProductSchema(tour, {
    priceAmount:
      typeof body.extracted.priceAmount === "number"
        ? body.extracted.priceAmount
        : null,
    priceFormatted:
      typeof body.extracted.priceFormatted === "string"
        ? body.extracted.priceFormatted
        : null,
    aggregateRating:
      typeof body.extracted.aggregateRating === "number"
        ? body.extracted.aggregateRating
        : null,
    reviewCount:
      typeof body.extracted.reviewCount === "number"
        ? body.extracted.reviewCount
        : null,
  });

  const graph = buildEngine6SchemaGraph(resolvedTour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const offer = graph.find(node => node["@type"] === "Offer");
  const aggregateRating = graph.find(node => node["@type"] === "AggregateRating");

  return {
    price: formatMerchantPrice(
      typeof offer?.price === "number" ? offer.price : null,
      typeof offer?.priceCurrency === "string" ? offer.priceCurrency : "USD"
    ),
    averageRating:
      typeof aggregateRating?.ratingValue === "number"
        ? formatRating(aggregateRating.ratingValue)
        : "",
    reviewCount:
      typeof aggregateRating?.reviewCount === "number"
        ? formatCount(aggregateRating.reviewCount)
        : "",
  };
};

export const auditMerchantFeedLiveRuntimeParity = async (
  csvRows: Array<{
    id: string;
    price?: string;
    average_rating?: string;
    review_count?: string;
  }>
): Promise<MerchantFeedLiveRuntimeParityReport> => {
  const csvById = new Map(csvRows.map(row => [row.id, row]));
  const drifts: MerchantFeedLiveRuntimeParityReport["drifts"] = [];
  let productsInParity = 0;
  let priceDrift = 0;
  let ratingDrift = 0;
  let reviewCountDrift = 0;

  for (let index = 0; index < engine6ResolvedTours.length; index += 8) {
    const batch = engine6ResolvedTours.slice(index, index + 8);
    const results = await Promise.all(
      batch.map(async tour => {
        const csv = csvById.get(tour.productCode);
        const liveJsonLd = await fetchLiveProductJsonLdCommercial(
          tour.productCode
        );
        const priceMatch = (csv?.price ?? "").trim() === liveJsonLd.price.trim();
        const ratingMatch =
          (csv?.average_rating ?? "").trim() === liveJsonLd.averageRating.trim();
        const reviewMatch =
          (csv?.review_count ?? "").trim() === liveJsonLd.reviewCount.trim();

        return {
          productCode: tour.productCode,
          title: tour.title,
          csv: {
            price: csv?.price ?? "",
            rating: csv?.average_rating ?? "",
            reviews: csv?.review_count ?? "",
          },
          liveJsonLd,
          priceDrift: !priceMatch,
          ratingDrift: !ratingMatch,
          reviewCountDrift: !reviewMatch,
        };
      })
    );

    for (const row of results) {
      if (!row.priceDrift && !row.ratingDrift && !row.reviewCountDrift) {
        productsInParity += 1;
      } else {
        if (row.priceDrift) priceDrift += 1;
        if (row.ratingDrift) ratingDrift += 1;
        if (row.reviewCountDrift) reviewCountDrift += 1;
        drifts.push(row);
      }
    }
  }

  return {
    totalProducts: engine6ResolvedTours.length,
    productsInParity,
    priceDrift,
    ratingDrift,
    reviewCountDrift,
    pass: drifts.length === 0,
    drifts,
  };
};

export const formatMerchantFeedLiveRuntimeParityReport = (
  report: MerchantFeedLiveRuntimeParityReport
) =>
  [
    "Live runtime commercial parity audit:",
    `- total products: ${report.totalProducts}`,
    `- products in parity: ${report.productsInParity}`,
    `- price drift: ${report.priceDrift}`,
    `- rating drift: ${report.ratingDrift}`,
    `- review_count drift: ${report.reviewCountDrift}`,
  ].join("\n");

const main = async () => {
  const csvContent = await readFile(
    path.resolve(process.cwd(), "data/merchantFeed.csv"),
    "utf8"
  );
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < csvContent.length; index += 1) {
    const char = csvContent[index];
    const next = csvContent[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );
  const csvRows = bodyRows.map(values =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );

  const report = await auditMerchantFeedLiveRuntimeParity(
    csvRows.map(row => ({
      id: row.id ?? "",
      price: row.price ?? "",
      average_rating: row.average_rating ?? "",
      review_count: row.review_count ?? "",
    }))
  );

  console.log(formatMerchantFeedLiveRuntimeParityReport(report));

  if (!report.pass) {
    for (const drift of report.drifts.slice(0, 20)) {
      console.error(
        `${drift.productCode}: csv=${drift.csv.price}/${drift.csv.rating}/${drift.csv.reviews} live=${drift.liveJsonLd.price}/${drift.liveJsonLd.averageRating}/${drift.liveJsonLd.reviewCount}`
      );
    }
    process.exit(1);
  }
};

if (process.argv[1]?.includes("audit-merchant-feed-live-runtime-parity")) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
