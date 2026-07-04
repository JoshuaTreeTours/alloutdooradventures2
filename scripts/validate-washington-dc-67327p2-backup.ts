/**
 * Validate ranked backups for failed Washington D.C. product 67327P2.
 * Run: npx tsx scripts/validate-washington-dc-67327p2-backup.ts
 */
import { validateEngine6LiveViatorCandidate } from "../src/engine6/engine6LiveViatorProductionValidation";
import { resolveViatorApiConfig } from "../api/engine6/resolveEngine6ViatorProductCommercialExtract";

const BACKUPS = [
  {
    rank: 1,
    productCode: "67327P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-Day-Tour/d657-67327P1",
  },
  {
    rank: 2,
    productCode: "67327P13",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Black-History-Tour-Washington-DC/d657-67327P13",
  },
  {
    rank: 3,
    productCode: "255730P179",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Walking-Tour-of-Capitol-Hill-and-the-National-Mall/d657-255730P179",
  },
] as const;

const main = async () => {
  const { apiKey } = resolveViatorApiConfig();
  if (!apiKey) {
    console.error("VIATOR_API_KEY is required.");
    process.exit(1);
  }

  console.log("Validating 67327P2 backup candidates (rank order)...\n");

  for (const candidate of BACKUPS) {
    const result = await validateEngine6LiveViatorCandidate({
      productCode: candidate.productCode,
      sourceUrl: candidate.sourceUrl,
    });
    console.log(
      JSON.stringify(
        {
          rank: candidate.rank,
          productCode: candidate.productCode,
          passed: result.passed,
          apiConfirmedActive: result.apiConfirmedActive,
          reason: result.reason,
        },
        null,
        2
      )
    );
    if (result.passed) {
      console.log(`\nSelected backup: ${candidate.productCode}`);
      process.exit(0);
    }
  }

  console.error("\nNo backup candidate passed live Viator validation.");
  process.exit(1);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
