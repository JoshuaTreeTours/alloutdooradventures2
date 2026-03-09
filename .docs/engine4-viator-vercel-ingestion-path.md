# Engine4 Viator ingestion path (Vercel-compatible)

## Confirmed existing wiring

- `src/engine4/viator/viatorApi.ts#getEngine4ViatorTourData` already attempts live Viator Partner API fetch using `process.env.VIATOR_API_KEY`.
- It falls back to `engine4ViatorApiFallbackByProductCode` only when key is absent or API fails.
- Viator API transport is centralized in `api/viator/client.ts` and uses `exp-api-key` header from env.

## Why Codex runtime cannot prove key availability

- This task runtime does not inherit the Vercel secret context and cannot be treated as proof of deployment-time env availability.
- Vercel build/runtime can still resolve `process.env.VIATOR_API_KEY` even when Codex cannot.

## Operational path for product 132218P209

1. In a Vercel-like env where `VIATOR_API_KEY` is available, run:
   - `tsx scripts/engine4/printEngine4ViatorMapping.ts 132218P209`
2. Use that API-derived payload to populate the Engine4 record/fallback fields (title, price, duration, rating/reviews, meeting/pickup, inclusions/exclusions, itinerary, cancellation, restrictions/additional info, and canonical image media).
3. Keep hero + listing card image aligned to API `images[]`-derived canonical URL.

## New helper added

- `scripts/engine4/printEngine4ViatorMapping.ts` provides a direct way to materialize the mapped Engine4 API payload through the same env/key path that production uses.
