# Engine6 Itinerary Rendering Audit

Generated: 2026-06-21T21:45:54.912Z

## Scope

- **Branch/preview source:** bundled Engine6 registry tours (`engine6ResolvedTours`) — the SSR/initial render path before live API merge.
- **Production comparison:** JSON-LD itinerary item names fetched from https://www.alloutdooradventures.com where HTTP fetch succeeded (133/133 routes).

## Criteria

Each itinerary row is flagged when any of the following apply:

1. Rendered title equals rendered description
2. Rendered title is long marketing prose (>8 words, >72 chars, or sentence-shaped supplier copy)
3. Rendered title starts with: `A guided`, `In this`, `View`, `No other`, `Learn`, `Discover`, `Visit`, `See`
4. Rendered title exceeds 80 characters
5. Rendered title is `Itinerary Stop N` while a bundled positional or native explicit title exists

## Totals

- Engine6 tours audited: 133
- Itinerary rows audited: 614
- Failing rows (branch/preview): 0
- Affected tours: 0
- Production routes with title diffs vs branch: 0
- Production itinerary title diffs (aligned indices): 0

## Flag counts

| Flag | Count | Likely root cause |
| --- | ---: | --- |
| title-equals-description | 0 | Rendered title matches description body (description-as-title leak) |
| long-prose-sentence | 0 | Title is supplier marketing prose rather than a concise POI name |
| blocked-prefix | 0 | Title opens with a generic marketing sentence prefix |
| title-exceeds-80-chars | 0 | Title string exceeds 80 characters |
| neutral-stop-with-native-title | 0 | Neutral Itinerary Stop fallback despite bundled/native explicit title |

## Failures by title source

| Title source | Failing rows |
| --- | ---: |

## Grouped failures (route × product × title source × root cause)

| Route | Product | Title source | Root cause(s) | Rows | Examples |
| --- | --- | --- | --- | ---: | --- |

## Production vs branch diffs (sample)

No production fetch diffs or all routes matched on comparable indices.

## Full row detail

See `reports/engine6-itinerary-rendering-audit.json` for every failing row, bundled native title candidates, production comparison payloads, and fetch errors.

## Branch

- Commit: `9f66e824b0b0cb777832d36347f7b5c340317b02`

## Limitations

- Audited bundled registry tours (SSR/initial render). Client-side live API merge is not simulated without VIATOR_API_KEY.
- Production comparison uses JSON-LD itemListElement names from prerendered HTML; visible DOM may hydrate with live merge after load.
- neutral-stop-with-native-title only flags when bundled positional or native explicit title differs from rendered neutral fallback.

## Neutral stop inventory (informational)

- Total `Itinerary Stop N` rows in bundled registry: 24
- Rows where bundled positional title exists but was not used: 0
- None — neutral stops occur only where bundled fixtures lack positional/native explicit titles.
