# Engine6 Merchant Commercial Parity Audit

Generated at: 2026-07-06T23:23:47.629Z

Commercial parity audit:

- total rows audited: 589
- price mismatches: 0
- rating mismatches: 0
- review_count mismatches: 0
- required blank fields: 0
- merchant CSV commercial source: shared Engine6 commercial resolver (/api/engine6/viator-product or Viator API fallback) via buildMerchantFeedRowFromProductSchema
- live page commercial source: shared Engine6 commercial resolver (/api/engine6/viator-product or Viator API fallback) before Product JSON-LD rendering
- root cause: stale CSV values occur when merchantFeed.csv is preserved or generated from older static/fixture commercial values instead of this shared resolver; the audit now fails any price/rating/review_count drift.
- recommended remediation: keep page rendering and merchant generation on the shared resolver; refresh syndicated commercial fields every build when credentials/runtime are available, otherwise enforce a 2-7 day refresh cadence with explicit staleness detection.
- generated-at-audit-time volatile examples: no affected products in current audited CSV

## Scheduled refresh

Vercel Cron invokes `/api/cron/merchant-commercial-refresh` every Monday at 09:00 UTC (`0 9 * * 1`). The cron handler calls the deploy hook configured in `MERCHANT_FEED_REFRESH_DEPLOY_HOOK_URL`; that deploy runs the normal production build, regenerates `data/merchantFeed.csv`, runs this merchant commercial parity audit, and records `data/merchantFeed-commercial-refresh-metadata.json` only after the audit succeeds.

Verify scheduled refresh health in Vercel Cron logs, the follow-on deployment logs, and `data/merchantFeed-commercial-refresh-metadata.json`, whose `lastSuccessfulCommercialRefreshAt` must be no older than 7 days.
