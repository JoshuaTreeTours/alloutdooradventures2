import { getAllEngine2Tours } from "../../src/engine2/data/loadEngine2";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";

const FORBIDDEN_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Food Tour", pattern: /\bFood\s+Tour\b/i },
  { label: "ID marker", pattern: /·\s*ID\b|\bID\s*\d+/i },
  { label: "slug-like id", pattern: /\b[a-z0-9]+(?:-[a-z0-9]+){2,}-\d{3,}\b/i },
  { label: "slug suffix number", pattern: /-\d{3,}\b/ },
];

const main = () => {
  const tours = getAllEngine2Tours();
  const failures: string[] = [];

  for (const tour of tours) {
    const seo = buildEngine2Seo(tour);

    if (seo.title !== tour.seo.title) {
      failures.push(`${tour.slug}: seo.title mismatch with generated dataset title`);
    }
    if (seo.description !== tour.seo.description) {
      failures.push(`${tour.slug}: seo.description mismatch with generated dataset description`);
    }

    for (const { label, pattern } of FORBIDDEN_PATTERNS) {
      if (pattern.test(seo.description)) {
        failures.push(`${tour.slug}: description contains forbidden token (${label})`);
      }
    }

    const nodes = buildSchemaGraph(tour, seo);
    const nodeList = Array.isArray(nodes) ? nodes : [];

    const webPageNode = nodeList.find((node) => node["@type"] === "WebPage");
    const productNode = nodeList.find((node) => node["@type"] === "Product");
    const tripNode = nodeList.find((node) => node["@type"] === "TouristTrip");

    if (webPageNode?.description !== seo.description) {
      failures.push(`${tour.slug}: WebPage.description does not match seo.description`);
    }
    if (productNode?.description !== seo.description) {
      failures.push(`${tour.slug}: Product.description does not match seo.description`);
    }
    if (tripNode?.description !== seo.description) {
      failures.push(`${tour.slug}: TouristTrip.description does not match seo.description`);
    }
  }

  if (failures.length) {
    console.error("Engine2 SEO quality checks failed:\n");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Engine2 SEO quality checks passed for ${tours.length} tours.`);
};

main();
