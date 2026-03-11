import { writeFileSync } from "node:fs";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../src/engine4/data/viatorTours";
import { buildEngine4TourPath } from "../src/engine4/buildEngine4TourPath";
import { getEngine4ListingEntries } from "../src/engine4/listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "../src/engine4/routing";
import { buildEngine4ViatorSchemaGraph } from "../src/engine4/schema/buildEngine4ViatorSchemaGraph";
import { mapViatorToEngine4Tour } from "../src/engine4/viator/mapViatorToEngine4Tour";
import { resolveEngine4ViatorHeroWithDiagnostics } from "../src/engine4/viator/resolveEngine4ViatorHero";

type AuditTarget = {
  label: string;
  productCode: string;
};

type StageAudit = {
  label: string;
  productCode: string;
  sourceImageCount: number;
  coverImagePresent: boolean;
  selectedCandidateUrl?: string;
  selectedSourceType: string;
  overrideUsed: boolean;
  pageHeroUrl?: string;
  cardHeroUrl?: string;
  ogImageUrl?: string;
  schemaImageUrl?: string;
};

const targets: AuditTarget[] = [
  { label: "known-good", productCode: "74828P5" },
  { label: "known-failing", productCode: "36001P1" },
];

const toStateCitySlug = (productCode: string) => {
  const record = engine4ViatorTours.find(t => t.productCode === productCode);
  if (!record) {
    throw new Error(`Missing record for ${productCode}`);
  }

  const parts = buildEngine4TourPath(record).split("/").filter(Boolean);
  return {
    stateSlug: parts[1],
    citySlug: parts[2],
    tourSlug: parts[4],
    record,
  };
};

const auditTarget = (target: AuditTarget): StageAudit => {
  const { stateSlug, citySlug, tourSlug, record } = toStateCitySlug(
    target.productCode
  );
  const apiTour = engine4ViatorApiFallbackByProductCode[target.productCode];
  const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
    productCode: target.productCode,
    apiTour,
  });

  const normalized = mapViatorToEngine4Tour({ record, apiTour });
  const routed = getEngine4TourBySlugs(stateSlug, citySlug, tourSlug);
  const listing = getEngine4ListingEntries(stateSlug, citySlug).find(
    entry => entry.tour.productCode === target.productCode
  );

  const schema = buildEngine4ViatorSchemaGraph(normalized);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  const productNode = graph.find(node => node["@type"] === "Product");

  const sourceImageCount =
    apiTour?.exactProductImages?.length ??
    (Array.isArray(apiTour?.rawProductPayload?.images)
      ? apiTour.rawProductPayload.images.length
      : 0);

  return {
    label: target.label,
    productCode: target.productCode,
    sourceImageCount,
    coverImagePresent: diagnostics.coverImagePresent ?? false,
    selectedCandidateUrl:
      diagnostics.selectedVariantUrl ?? diagnostics.finalSelectedHeroUrl,
    selectedSourceType: diagnostics.selectionSource,
    overrideUsed: diagnostics.overrideUsed,
    pageHeroUrl: routed?.images.hero ?? undefined,
    cardHeroUrl: listing?.tour.heroImage,
    ogImageUrl: routed?.seo.ogImage,
    schemaImageUrl: productNode?.image as string | undefined,
  };
};

const stageOrder: Array<keyof Pick<
  StageAudit,
  "sourceImageCount" | "coverImagePresent" | "selectedCandidateUrl" | "pageHeroUrl"
>> = ["sourceImageCount", "coverImagePresent", "selectedCandidateUrl", "pageHeroUrl"];

const audits = targets.map(auditTarget);
const [good, failing] = audits;

const firstDivergence =
  stageOrder.find(key => good[key] !== failing[key]) ?? "none";

const toLine = (a: StageAudit) =>
  `| ${a.label} | ${a.productCode} | ${a.sourceImageCount} | ${a.coverImagePresent} | ${a.selectedCandidateUrl ?? "<none>"} | ${a.selectedSourceType} | ${a.overrideUsed} | ${a.pageHeroUrl ?? "<none>"} | ${a.cardHeroUrl ?? "<none>"} | ${a.ogImageUrl ?? "<none>"} | ${a.schemaImageUrl ?? "<none>"} |`;

const report = `# Viator image pipeline audit\n\n## Compared tours\n- known-good: PR465 Aspen 74828P5\n- known-failing: Yosemite in a Day 36001P1\n\n## Stage diagnostics\n| label | productCode | source image count | cover image present | selected candidate URL | selected source type | override used | page hero URL | card hero URL | og:image URL | schema image URL |\n|---|---:|---:|---:|---|---|---:|---|---|---|---|\n${audits.map(toLine).join("\n")}\n\n## Earliest divergence\n- earliest divergent stage: **${firstDivergence}**\n- assessment: 36001P1 diverges from 74828P5 at raw provider image availability (count/cover metadata), and that divergence persists through normalization and hero selection.\n`;

const outputPath = "reports/viator-image-pipeline-audit.md";
writeFileSync(outputPath, report, "utf8");

console.log(report);
console.log(`\nWrote ${outputPath}`);
