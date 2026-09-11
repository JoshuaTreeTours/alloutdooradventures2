import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { tsImport } from "tsx/esm/api";

const SITE = "https://www.alloutdooradventures.com";
const DIST = path.resolve("dist");
const MERCHANT_FEED = path.resolve("data/merchantFeed.csv");
const PRIMARY_SCRIPT_ID = "structured-data";

const normalizePath = value => {
  const pathname = value || "/";
  const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
};

const outputCandidatesFor = pathname => {
  const clean = normalizePath(pathname).replace(/^\//, "");
  if (!clean) return [path.join(DIST, "index.html")];
  return [
    path.join(DIST, clean, "index.html"),
    path.join(DIST, `${clean}.html`),
  ];
};

const readFirstExisting = async pathname => {
  for (const candidate of outputCandidatesFor(pathname)) {
    try {
      return { path: candidate, html: await readFile(candidate, "utf8") };
    } catch {
      // Try the next supported prerender layout.
    }
  }
  return null;
};

const parseCsv = content => {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

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

  return rows.filter(candidate => candidate.some(cell => cell.length > 0));
};

const parseMerchantRatings = async () => {
  const rows = parseCsv(await readFile(MERCHANT_FEED, "utf8"));
  const [headers = [], ...bodyRows] = rows;
  const idIndex = headers.indexOf("id");
  const ratingIndex = headers.indexOf("average_rating");
  const ratingCountIndex = headers.indexOf("rating_count");
  const reviewCountIndex = headers.indexOf("review_count");

  for (const [label, index] of [
    ["id", idIndex],
    ["average_rating", ratingIndex],
    ["rating_count", ratingCountIndex],
    ["review_count", reviewCountIndex],
  ]) {
    if (index < 0) {
      throw new Error(`Merchant feed missing required rating column: ${label}`);
    }
  }

  const byProductCode = new Map();
  for (const row of bodyRows) {
    const productCode = row[idIndex]?.trim().toUpperCase();
    if (!productCode) continue;

    const rating = Number.parseFloat(row[ratingIndex]?.trim() ?? "");
    const count = Number.parseInt(
      (row[reviewCountIndex]?.trim() || row[ratingCountIndex]?.trim() || ""),
      10
    );

    if (
      !Number.isFinite(rating) ||
      rating <= 0 ||
      rating > 5 ||
      !Number.isFinite(count) ||
      count <= 0
    ) {
      continue;
    }

    byProductCode.set(productCode, {
      rating,
      reviewCount: Math.trunc(count),
    });
  }

  return byProductCode;
};

const productMatchesCanonical = (product, canonicalUrl) => {
  const canonical = canonicalUrl.replace(/\/$/, "");
  return [product?.url, product?.["@id"]]
    .filter(value => typeof value === "string")
    .map(value => value.split("#")[0].replace(/\/$/, ""))
    .includes(canonical);
};

const extractPrimaryStructuredData = html => {
  const pattern = new RegExp(
    `<script\\b[^>]*id=["']${PRIMARY_SCRIPT_ID}["'][^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>`,
    "i"
  );
  const match = html.match(pattern);
  if (!match) return null;

  try {
    return { pattern, graph: JSON.parse(match[1].trim()) };
  } catch (error) {
    throw new Error(
      `Primary Product JSON-LD is malformed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

const typeIncludes = (node, wanted) => {
  const type = node?.["@type"];
  return Array.isArray(type) ? type.includes(wanted) : type === wanted;
};

const enforceRatingOnGraph = ({ graph, canonicalUrl, rating, reviewCount }) => {
  if (!graph || typeof graph !== "object") {
    throw new Error("Primary structured data is not an object");
  }

  const nodes = Array.isArray(graph["@graph"])
    ? [...graph["@graph"]]
    : [graph];
  const product = nodes.find(
    node => typeIncludes(node, "Product") && productMatchesCanonical(node, canonicalUrl)
  );

  if (!product) {
    throw new Error(`No canonical Product found for ${canonicalUrl}`);
  }

  const ratingId = `${canonicalUrl}#aggregate-rating`;
  const nextNodes = nodes.filter(node => {
    if (!typeIncludes(node, "AggregateRating")) return true;
    const nodeId = typeof node?.["@id"] === "string" ? node["@id"] : "";
    return nodeId !== ratingId;
  });

  product.aggregateRating = { "@id": ratingId };
  nextNodes.push({
    "@type": "AggregateRating",
    "@id": ratingId,
    ratingValue: rating,
    reviewCount,
  });

  return {
    "@context": graph["@context"] ?? "https://schema.org",
    "@graph": nextNodes,
  };
};

const verifyRatingParity = ({ graph, canonicalUrl, rating, reviewCount }) => {
  const nodes = Array.isArray(graph?.["@graph"]) ? graph["@graph"] : [graph];
  const product = nodes.find(
    node => typeIncludes(node, "Product") && productMatchesCanonical(node, canonicalUrl)
  );
  if (!product) return false;

  const ratingId = product.aggregateRating?.["@id"];
  if (typeof ratingId !== "string") return false;
  const aggregateRating = nodes.find(
    node => typeIncludes(node, "AggregateRating") && node?.["@id"] === ratingId
  );

  return (
    aggregateRating?.ratingValue === rating &&
    aggregateRating?.reviewCount === reviewCount
  );
};

const merchantRatings = await parseMerchantRatings();
const engine6Registry = await tsImport("../src/engine6/registry.ts", import.meta.url);
const engine6Tours = Array.isArray(engine6Registry.engine6ResolvedTours)
  ? engine6Registry.engine6ResolvedTours
  : [];

let eligible = 0;
let updated = 0;
let alreadyAligned = 0;
const failures = [];

for (const tour of engine6Tours) {
  const merchantRating = merchantRatings.get(tour.productCode.trim().toUpperCase());
  if (!merchantRating) continue;
  eligible += 1;

  const pathname = normalizePath(tour.canonicalPath);
  const canonicalUrl = `${SITE}${pathname}`;
  const artifact = await readFirstExisting(pathname);
  if (!artifact) {
    failures.push(`${tour.productCode}: missing prerendered artifact ${pathname}`);
    continue;
  }

  let parsed;
  try {
    parsed = extractPrimaryStructuredData(artifact.html);
  } catch (error) {
    failures.push(
      `${tour.productCode}: ${error instanceof Error ? error.message : String(error)}`
    );
    continue;
  }

  if (!parsed) {
    failures.push(`${tour.productCode}: missing primary structured-data script`);
    continue;
  }

  if (
    verifyRatingParity({
      graph: parsed.graph,
      canonicalUrl,
      ...merchantRating,
    })
  ) {
    alreadyAligned += 1;
    continue;
  }

  let nextGraph;
  try {
    nextGraph = enforceRatingOnGraph({
      graph: parsed.graph,
      canonicalUrl,
      ...merchantRating,
    });
  } catch (error) {
    failures.push(
      `${tour.productCode}: ${error instanceof Error ? error.message : String(error)}`
    );
    continue;
  }

  if (
    !verifyRatingParity({
      graph: nextGraph,
      canonicalUrl,
      ...merchantRating,
    })
  ) {
    failures.push(`${tour.productCode}: AggregateRating parity verification failed`);
    continue;
  }

  const replacement = `<script id="${PRIMARY_SCRIPT_ID}" type="application/ld+json">${JSON.stringify(nextGraph).replace(/</g, "\\u003c")}</script>`;

  // Use a replacement callback so JSON text is inserted literally. A string
  // replacement would interpret sequences such as "$1" in price text (for
  // example "From $199.00") as RegExp capture substitutions and corrupt the
  // JSON-LD document.
  const nextHtml = artifact.html.replace(parsed.pattern, () => replacement);

  // Parse the actual HTML result before writing it. This makes malformed JSON-LD
  // impossible to fan out across the catalog unnoticed.
  let reparsed;
  try {
    reparsed = extractPrimaryStructuredData(nextHtml);
  } catch (error) {
    failures.push(
      `${tour.productCode}: replacement produced malformed JSON-LD: ${error instanceof Error ? error.message : String(error)}`
    );
    continue;
  }

  if (
    !reparsed ||
    !verifyRatingParity({
      graph: reparsed.graph,
      canonicalUrl,
      ...merchantRating,
    })
  ) {
    failures.push(`${tour.productCode}: written AggregateRating parity verification failed`);
    continue;
  }

  await writeFile(artifact.path, nextHtml, "utf8");
  updated += 1;
}

if (failures.length) {
  console.error(
    `[engine6-rating-schema-parity] FAILED: ${failures.length} Engine6 rating parity defect(s).`
  );
  failures.slice(0, 100).forEach(failure => console.error(`  ${failure}`));
  if (failures.length > 100) {
    console.error(`  ... ${failures.length - 100} more`);
  }
  process.exit(1);
}

console.log(
  `[engine6-rating-schema-parity] PASS: ${eligible.toLocaleString()} Engine6 Merchant-rated products verified; ${updated.toLocaleString()} prerendered Product graphs updated, ${alreadyAligned.toLocaleString()} already aligned.`
);
