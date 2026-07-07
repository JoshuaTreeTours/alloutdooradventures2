import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  MERCHANT_FEED_COMMERCIAL_SNAPSHOT_PATH,
  resolveToursWithMerchantFeedCommercialSnapshot,
  type MerchantFeedCommercialSnapshot,
} from "../src/engine6/merchantFeedCommercialSnapshot";
import {
  auditEngine6MerchantFeedCommercialParity,
  formatMerchantFeedCommercialParityAuditReport,
} from "../src/engine6/merchantFeedParity";
import {
  assessMerchantCommercialRefreshStaleness,
  buildMerchantCommercialRefreshMetadata,
  MERCHANT_COMMERCIAL_REFRESH_METADATA_PATH,
  type MerchantCommercialRefreshMetadata,
} from "../src/engine6/merchantCommercialRefreshMetadata";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { validateMerchantFeedRows } from "./generate-merchant-feed";

const OUTPUT_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const COMMERCIAL_SNAPSHOT_PATH = path.resolve(
  process.cwd(),
  MERCHANT_FEED_COMMERCIAL_SNAPSHOT_PATH
);
const REPORT_DIR = path.resolve(process.cwd(), "reports");
const REPORT_MD_PATH = path.join(
  REPORT_DIR,
  "engine6-merchant-commercial-parity-audit.md"
);
const REPORT_JSON_PATH = path.join(
  REPORT_DIR,
  "engine6-merchant-commercial-parity-audit.json"
);
const REFRESH_METADATA_PATH = path.resolve(
  process.cwd(),
  MERCHANT_COMMERCIAL_REFRESH_METADATA_PATH
);

const readRefreshMetadata = async () => {
  try {
    return JSON.parse(
      await readFile(REFRESH_METADATA_PATH, "utf8")
    ) as MerchantCommercialRefreshMetadata;
  } catch {
    return null;
  }
};

const readCommercialSnapshot = async () =>
  JSON.parse(
    await readFile(COMMERCIAL_SNAPSHOT_PATH, "utf8")
  ) as MerchantFeedCommercialSnapshot;

const writeRefreshMetadata = async () => {
  await mkdir(path.dirname(REFRESH_METADATA_PATH), { recursive: true });
  const metadata = buildMerchantCommercialRefreshMetadata();
  await writeFile(
    REFRESH_METADATA_PATH,
    `${JSON.stringify(metadata, null, 2)}\n`
  );
  return metadata;
};

const parseCsv = (content: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
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

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );
  return bodyRows.map(values =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""])
    )
  );
};

const main = async () => {
  const previousMetadata = await readRefreshMetadata();
  const previousStaleness =
    assessMerchantCommercialRefreshStaleness(previousMetadata);
  if (!previousStaleness.pass) {
    console.warn(`[merchant-commercial-refresh] ${previousStaleness.message}`);
  }

  const csvContent = await readFile(OUTPUT_PATH, "utf8");
  const csvRows = parseCsv(csvContent);
  const validation = validateMerchantFeedRows(
    csvRows.map(row => ({
      id: row.id ?? "",
      title: row.title ?? "",
      description: row.description ?? "",
      link: row.link ?? "",
      image_link: row.image_link ?? "",
      availability: row.availability ?? "",
      price: row.price ?? "",
      condition: row.condition ?? "",
      brand: row.brand ?? "",
      average_rating: row.average_rating ?? "",
      rating_count: row.rating_count ?? "",
      review_count: row.review_count ?? "",
    }))
  );

  const commercialSnapshot = await readCommercialSnapshot();
  const schemaResolvedTours = resolveToursWithMerchantFeedCommercialSnapshot(
    engine6ResolvedTours,
    commercialSnapshot
  );
  const audit = auditEngine6MerchantFeedCommercialParity(
    schemaResolvedTours,
    new Map(csvRows.map(row => [row.id ?? "", row]))
  );

  const generatedAt = new Date().toISOString();
  const formattedReport = formatMerchantFeedCommercialParityAuditReport(
    audit,
    validation.report.blankRequiredFieldRows
  );

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(
    REPORT_MD_PATH,
    [
      `# Engine6 Merchant Commercial Parity Audit`,
      ``,
      `Generated at: ${generatedAt}`,
      `Commercial snapshot generated at: ${commercialSnapshot.generatedAt}`,
      ``,
      formattedReport,
      ``,
      `## Scheduled refresh`,
      ``,
      `Vercel Cron invokes \`/api/cron/merchant-commercial-refresh\` every Monday at 09:00 UTC (\`0 9 * * 1\`). The cron handler calls the deploy hook configured in \`MERCHANT_FEED_REFRESH_DEPLOY_HOOK_URL\`; that deploy runs the normal production build, regenerates \`data/merchantFeed.csv\`, runs this merchant commercial parity audit, and records \`data/merchantFeed-commercial-refresh-metadata.json\` only after the audit succeeds.`,
      ``,
      `Verify scheduled refresh health in Vercel Cron logs, the follow-on deployment logs, and \`data/merchantFeed-commercial-refresh-metadata.json\`, whose \`lastSuccessfulCommercialRefreshAt\` must be no older than 7 days.`,
      ``,
    ].join("\n")
  );
  await writeFile(
    REPORT_JSON_PATH,
    JSON.stringify(
      {
        generatedAt,
        merchantFeedPath: path.relative(process.cwd(), OUTPUT_PATH),
        commercialSnapshotPath: path.relative(
          process.cwd(),
          COMMERCIAL_SNAPSHOT_PATH
        ),
        commercialSnapshotGeneratedAt: commercialSnapshot.generatedAt,
        report: audit,
        blankRequiredFieldRows: validation.report.blankRequiredFieldRows,
        sourceUsedByMerchantCsv:
          "shared Engine6 commercial resolver via buildMerchantFeedRowFromProductSchema",
        sourceUsedByLivePages:
          "shared Engine6 commercial resolver before Product JSON-LD rendering",
        recommendedRemediation:
          "Use one shared commercial resolver for page rendering and merchant feed generation; refresh every build when possible, otherwise enforce a 2-7 day cadence with explicit staleness detection.",
      },
      null,
      2
    )
  );

  if (!validation.pass || !audit.pass) {
    for (const failure of [...validation.failures, ...audit.failures].slice(
      0,
      20
    )) {
      console.error(failure);
    }
    process.exit(1);
  }

  const refreshMetadata = await writeRefreshMetadata();
  console.log(formattedReport);
  console.log(`Wrote ${path.relative(process.cwd(), REPORT_MD_PATH)}`);
  console.log(
    `Recorded merchant commercial refresh metadata at ${refreshMetadata.lastSuccessfulCommercialRefreshAt}`
  );
};

if (process.argv[1]?.includes("audit-merchant-feed-commercial-parity")) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
