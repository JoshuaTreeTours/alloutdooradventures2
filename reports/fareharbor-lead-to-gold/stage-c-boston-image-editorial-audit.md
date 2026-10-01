# Stage C Boston image and editorial audit

Scope is the active Boston migrated FareHarbor set only. Geography, pricing authority, schema-graph, terminal-product, and Merchant-feed logic were not changed. No other city was processed.

Reusable validators:

- `scripts/fareharbor-lead-to-gold/image_integrity.py` — ffmpeg 128×128 center-cropped RGB, 16×16 difference hash (256 bits), and MAE. A gallery image is a near-duplicate of the hero when pixel hashes match, MAE ≤ 0.05, or Hamming distance ≤ 10 with MAE ≤ 0.10.
- `scripts/fareharbor-lead-to-gold/editorial_voice.py` — editorial minimum substance, boilerplate/process language (`the guide leads in`, packing notes), and sentence-fragment / field-dump detection.

## Counts

| Metric | Count |
| --- | ---: |
| Duplicate-image pages corrected | 11 |
| Pages with an alternate harvested image substituted | 3 |
| Pages where the duplicate image was simply removed | 8 |
| Thin-copy pages successfully rewritten | 98 |
| Pages withheld as `INSUFFICIENT_SOURCE_CONTENT` | 97 |
| Final PASS | **221 / 0 FAIL** |

Exception mix on the 221 published runtime records: **62 priced OK / 62 `PRICE_NOT_FOUND` / 97 `INSUFFICIENT_SOURCE_CONTENT`**.

Previous mix was 68 / 62 / 91. Six previously priced pages and four previously unpriced pages were withheld because the harvest cannot support useful prose without padding. Four previously insufficient pages recovered enough harvest-backed copy to publish.

Visible galleries: 106 → 98. 95 remaining galleries were already perceptually distinct from the hero. 115 pages have no second image.

## Duplicate images corrected (11)

### Alternate image substituted (3)

- `26501` Harborfest Fireworks Cruise aboard Adirondack — harvest `DXAaRcpiRmiJu3Qr92DG` was near-identical to the hero (MAE 0.040); replaced with `82morSOPTtOxU3zkzyoy`.
- `26502` Winthrop Fireworks Cruise on Adirondack — harvest `EMU1KqAfTGCRs60mV0yz` matched the hero exactly; replaced with `KgFThPURTmqgkqu0nnKn`.
- `80585` Boston Harbor Sunset Sail — harvest `Me0ORNq1QwiLelV5TEjw` was near-identical (MAE 0.017); replaced with `8sJkOK6Q3cj48IYnFqhw`.

### Duplicate removed, no distinct harvest image (8)

- `26497` PRIVATE CHARTER on Adirondack III
- `26498` U.S.S. Constitution Turnaround Sail on Adirondack
- `685351` Cooking 101
- `144871` Private Full Day Sail Charter
- `26971` Boston TV and Movie Sites
- `26974` Boston Movie Mile Walking Tour
- `605912` Boston Night Tour
- `27352` City Bike Rental

## Thin-copy pages rewritten (98)

Customer-facing copy no longer uses “The guide leads in English.” or “are the packing notes.” Harvest-backed experience sentences (what guests do, where they go, tastings, vessels, stops) were written only from stored facts. Overlays `27344`, `361612`, `361623`, and `618195` were cleaned of the same filler.

`151824`, `26497`, `26505`, `26508`, `26510`, `26515`, `527475`, `617713`, `657142`, `657144`, `659558`, `664825`, `691661`, `361591`, `361612`, `361623`, `361628`, `361677`, `361682`, `361693`, `361712`, `361714`, `362213`, `362215`, `371157`, `371158`, `371159`, `371160`, `371161`, `378550`, `378552`, `378553`, `378554`, `378555`, `378556`, `378557`, `383436`, `383672`, `384054`, `384057`, `384549`, `387481`, `393802`, `393810`, `393814`, `393818`, `430742`, `438140`, `438143`, `438148`, `438149`, `438150`, `438153`, `441227`, `455619`, `455622`, `455623`, `455633`, `455634`, `455640`, `455641`, `455644`, `455646`, `455648`, `455653`, `455658`, `523516`, `523525`, `566969`, `576798`, `576799`, `586596`, `604666`, `665573`, `26333`, `26334`, `682930`, `426011`, `492720`, `580179`, `627552`, `637407`, `664802`, `670923`, `448075`, `448083`, `448094`, `540824`, `641580`, `653308`, `606254`, `629482`, `608038`, `618195`, `89865`, `408909`, `27344`, `27346`

## Newly withheld as `INSUFFICIENT_SOURCE_CONTENT` (10)

These were previously OK or `PRICE_NOT_FOUND` only because of filler or sub-40-word logistics padding. The stored harvest cannot support useful guest-facing prose without invention:

- `361701` Reinventing Boston
- `371156` Before Boston: Shawmut Peninsula Through 1630
- `389570` Working Women: Boston Women Find Their Voice
- `430743` Private Tour: Reinventing Boston
- `455629` Boston's Chinatown
- `523785` Boston Common: Past Lives and Hidden Stories
- `425924` The Best of Boston in a Day
- `606802` One if by Land, Two if by Sea
- `26971` Boston TV and Movie Sites
- `26974` Boston Movie Mile Walking Tour

Total withheld on the published runtime set: **97**.

## Final PASS

221 runtime products, 0 validation failures. Boston geography still: 1 Portland move, 1 Hardwick exclude, 8 terminal booking pages. No other city was begun.
