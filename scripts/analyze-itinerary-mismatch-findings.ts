import { readFileSync } from "node:fs";
import path from "node:path";

type Finding = {
  reason: string;
  severity: string;
};

type AuditRow = {
  productId: string;
  route: string;
  tourTitle: string;
  itineraryIndex: number;
  renderedTitle: string | null;
  renderedDescription: string | null;
  findings: Finding[];
};

const reportPath = path.resolve("reports/engine6-itinerary-governance-audit.json");
const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
  rows: AuditRow[];
};

const TRANSPORT_DEPARTURE =
  /\b(?:departure|depart|board(?:ing)?|embark|launch|shuttle|transfer|pickup|meeting point|check[- ]?in|preflight|airport|hotel pickup|afternoon hotel|riverboat boarding|bike setup|campground arrival|trailhead|launch area|everglades launch|bayside departure|director park departure|san francisco departure|midtown manhattan departure|downtown new orleans pickup|miami bus|day \d+ -|orientation|gather|assemble|set off|leave|head out|begin|start)\b/i;
const RETURN_DROPOFF =
  /\b(?:return|drop[- ]?off|drop off|finish|end|conclude|back to|hotel return|terminal return|san francisco drop|las vegas return|new orleans drop|dock arrival|landing at|harbor arrival|departure pier)\b/i;
const OPERATIONAL =
  /\b(?:free time|activity time|scenic drive|scenic transfer|city highlights|waterway cruise|open[- ]water|photo stop|viewpoint|overview|commentary|drive through|drive-by|pass by|pass-by|route|corridor|neighborhoods|districts|waterfront|riverfront|city tour|highlights|exploration|excursion|adventure|experience|stop here|scheduled|briefing|safety|orientation stop)\b/i;
const GENERIC_DESC =
  /\b(?:local guide|guided|commentary|photo(?:s| opportunities)?|scenic views|panoramic|historic context|waterfall views|wildlife viewing|trail time|former prison|ferry access|app-guided|wine-country|during the|as part of the route|as a scheduled tour stop|with local|city growth|architecture|evolving|settlement|introduction to the route|safety basics|route and safety|departure point|original hotel|downtown hotel|city skyline|mount hood|seasonal|when conditions|when blooms|when time allows|optional|independent|narrated|captain|crew|vessel|coach|van|sprinter|bike|walk|drive|cross|travel|continue|explore|visit|see|view|look toward|pass|stop at|head to|spend time)\b/i;
const GOVERNED_REWRITE =
  /^(?:Visit|Explore|Stop at|Walk through|Pass|Travel past|View|Continue past|Glide by|Move past|Look toward|Skirt)\s+/i;

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "from",
  "with",
  "into",
  "over",
  "near",
  "area",
  "park",
  "stop",
  "tour",
  "city",
  "downtown",
  "national",
  "island",
  "point",
  "drive",
  "trail",
  "district",
  "garden",
  "gardens",
  "free",
  "time",
  "day",
  "hour",
  "minutes",
  "activity",
  "scenic",
  "view",
  "views",
  "crossing",
  "departure",
  "return",
  "pickup",
  "drop",
  "off",
  "launch",
  "briefing",
  "boarding",
  "river",
  "bay",
  "bridge",
  "highway",
  "waterfront",
  "riverfront",
  "neighborhood",
  "neighborhoods",
  "corridor",
  "block",
  "blocks",
]);

const hasPoiTokenOverlap = (title: string, description: string) => {
  const titleTokens = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
  const desc = description.toLowerCase();
  return titleTokens.some(token => desc.includes(token));
};

const getWordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

type Group =
  | "true_misalignment"
  | "operational_fp"
  | "transport_departure_fp"
  | "return_dropoff_fp"
  | "generic_poi_fp";

const TRUNCATED_DESCRIPTION =
  /^(?:By\.?|N\/A|TBD|\.\.\.|—|-|--|\.|See booking details\.?)$/i;

const CONTRADICTORY_POI =
  /\b(?:washington park|pearl district|nw 23rd|waterfront park|salmon street|oswego lake|earthquake park|international rose test garden|old town|downtown portland)\b/i;

const activityAligned = (title: string, description: string) => {
  const pairs: Array<[RegExp, RegExp]> = [
    [/\bfalls\b/i, /\b(?:waterfall|falls|cascade|plunge)\b/i],
    [/\bbridge\b/i, /\b(?:bridge|crossing|span)\b/i],
    [/\bmansion\b/i, /\b(?:estate|grounds|historic|views?)\b/i],
    [/\bgarden\b/i, /\b(?:garden|rose|bloom|floral)\b/i],
    [/\bbeach\b/i, /\b(?:beach|coast|shore|ocean|tide)\b/i],
    [/\bwharf\b/i, /\b(?:wharf|pier|waterfront|harbor|dock)\b/i],
    [/\bobservatory\b/i, /\b(?:observatory|planetarium|exhibit|hollywood sign)\b/i],
    [/\bmarket\b/i, /\b(?:market|food|vendor|shop)\b/i],
    [/\bdistrict\b/i, /\b(?:district|neighborhood|corridor|street|avenue|downtown)\b/i],
    [/\boverlook\b/i, /\b(?:overlook|viewpoint|panoram|vista|views?)\b/i],
    [/\btrail\b/i, /\b(?:trail|hik(?:e|ing)|walk|path)\b/i],
    [/\bisland\b/i, /\b(?:island|shore|beach|ashore)\b/i],
    [/\bwilderness\b/i, /\b(?:wilderness|backcountry|off-road|terrain)\b/i],
    [/\btelescope\b/i, /\b(?:telescope|planet|star|constellation|astronomy|sky)\b/i],
  ];

  return pairs.some(([titlePattern, descriptionPattern]) =>
    titlePattern.test(title) && descriptionPattern.test(description)
  );
};

const extractNamedPlaces = (text: string) =>
  [...text.matchAll(/\b(?:[A-Z][a-z]+(?:['’][A-Z][a-z]+)?(?:\s+(?:of|and|the|de|la|del|van|von|Mc|St|Mt)\s+)?)+[A-Z][a-z]+(?:['’][A-Z][a-z]+)?\b/g)]
    .map(match => match[0].trim())
    .filter(value => value.split(/\s+/).length <= 6);

const hasContradictoryPlace = (title: string, description: string) => {
  if (CONTRADICTORY_POI.test(description) && !CONTRADICTORY_POI.test(title)) {
    return true;
  }

  const titlePlaces = extractNamedPlaces(title);
  const descriptionPlaces = extractNamedPlaces(description);
  if (!descriptionPlaces.length) return false;

  return descriptionPlaces.some(place => {
    const normalizedPlace = place.toLowerCase();
    if (normalizedPlace.length < 4) return false;
    if (title.toLowerCase().includes(normalizedPlace)) return false;
    if (titlePlaces.some(titlePlace => titlePlace.toLowerCase().includes(normalizedPlace))) {
      return false;
    }
    return /\b(?:park|district|garden|museum|island|bridge|falls|beach|wharf|mansion|observatory|monument|cathedral|stadium|arena|cove|harbor|marina|square|plaza|center|centre|village|town|valley|mountain|canyon|wilderness|overlook|promenade|heights|dumbo|zoo|safari)\b/i.test(
      place
    );
  });
};

const classify = (row: AuditRow): Group => {
  const title = row.renderedTitle ?? "";
  const description = row.renderedDescription ?? "";

  if (TRUNCATED_DESCRIPTION.test(description.trim())) {
    return "generic_poi_fp";
  }
  if (
    (description.trim().length <= 12 || description.trim().split(/\s+/).length <= 2) &&
    !hasPoiTokenOverlap(title, description)
  ) {
    return "generic_poi_fp";
  }

  if (RETURN_DROPOFF.test(title)) return "return_dropoff_fp";
  if (TRANSPORT_DEPARTURE.test(title)) return "transport_departure_fp";
  if (OPERATIONAL.test(title) && !hasPoiTokenOverlap(title, description)) {
    return "operational_fp";
  }

  if (hasContradictoryPlace(title, description)) {
    return "true_misalignment";
  }

  if (
    activityAligned(title, description) ||
    GENERIC_DESC.test(description) ||
    GOVERNED_REWRITE.test(description)
  ) {
    if (!hasPoiTokenOverlap(title, description)) {
      return "generic_poi_fp";
    }
  }

  if (OPERATIONAL.test(title)) return "operational_fp";

  return "true_misalignment";
};

const mismatchRows = report.rows.filter(row =>
  row.findings.some(finding => finding.reason === "title-description-semantic-mismatch")
);

const counts: Record<Group, number> = {
  true_misalignment: 0,
  operational_fp: 0,
  transport_departure_fp: 0,
  return_dropoff_fp: 0,
  generic_poi_fp: 0,
};

const byProduct = new Map<
  string,
  { route: string; true: number; examples: string[] }
>();

for (const row of mismatchRows) {
  const group = classify(row);
  counts[group] += 1;

  const existing = byProduct.get(row.productId) ?? {
    route: row.route,
    true: 0,
    examples: [],
  };
  if (group === "true_misalignment") {
    existing.true += 1;
    if (existing.examples.length < 3) {
      existing.examples.push(
        `[${row.itineraryIndex}] ${row.renderedTitle} | ${(row.renderedDescription ?? "").slice(0, 80)}`
      );
    }
  }
  byProduct.set(row.productId, existing);
}

const labels: Record<Group, string> = {
  true_misalignment: "True misalignments",
  operational_fp: "Operational stop false positives",
  transport_departure_fp: "Transportation/departure false positives",
  return_dropoff_fp: "Return/dropoff false positives",
  generic_poi_fp: "Generic POI description false positives",
};

console.log(`Mismatch findings analyzed: ${mismatchRows.length}`);
console.log("");
console.log("=== COUNTS ===");
for (const group of Object.keys(labels) as Group[]) {
  console.log(`${labels[group]}: ${counts[group]}`);
}
console.log(`Total: ${Object.values(counts).reduce((sum, count) => sum + count, 0)}`);

console.log("");
console.log("=== TOP 20 TRUE MISALIGNMENT PRODUCTS ===");
const top = Array.from(byProduct.entries())
  .filter(([, value]) => value.true > 0)
  .sort((a, b) => b[1].true - a[1].true || a[0].localeCompare(b[0]))
  .slice(0, 20);

for (const [productId, value] of top) {
  console.log(`${productId}: ${value.true}`);
  value.examples.forEach(example => console.log(`  ${example}`));
}

console.log("");
console.log("=== GENERIC POI FP SUB-BREAKDOWN ===");
const genericRows = mismatchRows.filter(row => classify(row) === "generic_poi_fp");
console.log(`Truncated "By." descriptions: ${genericRows.filter(row => TRUNCATED_DESCRIPTION.test((row.renderedDescription ?? "").trim())).length}`);
console.log(`Very short descriptions (<=12 chars): ${genericRows.filter(row => (row.renderedDescription ?? "").trim().length <= 12).length}`);
console.log(`Governed rewrite templates: ${genericRows.filter(row => GOVERNED_REWRITE.test(row.renderedDescription ?? "")).length}`);
console.log(`Admission / logistics-only descriptions: ${genericRows.filter(row => /\b(?:admission included|photo stop and guide commentary|viewpoint exploration)\b/i.test(row.renderedDescription ?? "")).length}`);
for (const group of Object.keys(labels) as Group[]) {
  console.log(`\n-- ${labels[group]} (${counts[group]}) --`);
  mismatchRows
    .filter(row => classify(row) === group)
    .slice(0, 5)
    .forEach(row => {
      console.log(
        `${row.productId}[${row.itineraryIndex}] ${row.renderedTitle} | ${(row.renderedDescription ?? "").slice(0, 100)}`
      );
    });
}
