import { runMerchantFeedCommercialBackfill } from "../api/engine6/runMerchantFeedCommercialBackfill";
import { describeViatorApiConfigEnvVisibility } from "../api/engine6/resolveEngine6ViatorProductCommercialExtract";

const main = async () => {
  const viatorApiConfig = describeViatorApiConfigEnvVisibility();
  console.log("[commercial-backfill] Viator API config:", viatorApiConfig);

  const result = await runMerchantFeedCommercialBackfill({
    onProgress: ({ productCode, completed, total }) => {
      if (completed === 1 || completed % 10 === 0 || completed === total) {
        console.log(
          `[commercial-backfill] live Viator query ${completed}/${total}: ${productCode}`
        );
      }
    },
  });

  if (result.status === "skipped") {
    console.log(`[commercial-backfill] ${result.reason}`);
    return;
  }

  console.log("");
  console.log(result.report);
  console.log("");
  console.log(
    `[commercial-backfill] Wrote refreshed CSV to ${result.merchantFeedPath}.`
  );
  console.log(`[commercial-backfill] Wrote audit JSON to ${result.auditPath}.`);
};

main().catch(error => {
  console.error(
    "[commercial-backfill] failed:",
    error instanceof Error ? error.message : error
  );
  console.error(error);
  process.exit(1);
});
