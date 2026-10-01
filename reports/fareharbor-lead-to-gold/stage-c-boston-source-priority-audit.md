# Stage C Boston source-priority recovery

Scope is the active Boston migrated FareHarbor set only. Geography, pricing authority, schema-graph, terminal-product, and Merchant-feed logic were not changed. No other city was processed.

`INSUFFICIENT_SOURCE_CONTENT` is now a **source-exhaustion** status. A thin composed summary is a composer/validation FAIL to fix, not a flip to insufficient, when FareHarbor still has usable details.

Reusable ingest lives in `scripts/fareharbor-lead-to-gold/source_priority.py`:

1. Structured product description
2. Booking/details content (item content description, public headline, public notes)
3. Itinerary, inclusions, and other logistics fields

Private confirmation notes (wedding emails, phone numbers, “thank you for booking”) are not treated as public source. Overlap checks use operator prose only, not the JSON harvest blob, so itinerary and inclusion facts can be restated.

## Counts

| Metric | Count |
| --- | ---: |
| Previously withheld as `INSUFFICIENT_SOURCE_CONTENT` | 97 |
| Upgraded from insufficient to full editorial | **93** |
| Still genuinely insufficient after source exhaustion | **4** |
| Newly withheld | 0 |
| Runtime PASS | **221 / 0 FAIL** |

Exception mix on the 221 published runtime records: **102 priced OK / 115 `PRICE_NOT_FOUND` / 4 `INSUFFICIENT_SOURCE_CONTENT`**.

Previous mix was 62 / 62 / 97. The `PRICE_NOT_FOUND` rise is expected: recovered pages keep an unpriced status when price-preview is empty instead of being wiped to insufficient.

## Still genuinely insufficient (4)

Authoritative FareHarbor description, public details, itinerary, and inclusions were all too thin to support guest-facing prose without invention:

- `630528` Community Event — booking stub only
- `130424` Boston Lighthouse Sunset Cruise — no usable stored details (the sibling `130441` listing had enough harbor/lighthouse copy to recover)
- `525191` Wedding — private confirmation notes only; not public tour copy
- `417626` Luggage Storage — no experience source

## Sample before / after

### `617316` April 19, 1775: A Revolution Begins Semi-Private Tour

Before (thin composer output treated as missing source):

> The operator Boston Hidden Gems lists this outing.

After (structured description + itinerary already in the harvest):

> This is a 7-hour guided outing with Boston Hidden Gems in Boston. Guides are licensed by the town of Concord. The route follows Paul Revere's midnight ride toward Lexington and Concord.
>
> The return follows Battle Road. The walk visits Old North Church. The outing starts at Paul Revere Mall. The route then visits Old North Church and Hancock-Clarke House.
>
> Later stops include Lexington Battle Green, Buckman Tavern, and Paul Revere Capture Site. Old North Church entry tickets, Concord Museum entry tickets, and Harvard Yard entry fees are included. Groups stay at a maximum of 9 guests. Guests must be at least 2 years old.

### `455629` Boston's Chinatown

Before:

> The operator Boston By Foot lists this outing.

After:

> Boston's Chinatown is a 90-minute guided outing with Boston By Foot. The walk covers Chinatown's immigrant history. The walk goes beyond restaurants into backstreets and alleyways. Stops cover Colonial times to the present. The walk covers Boston's Chinatown. The outdoor route is about 1.05 miles at a moderate pace. Groups stay at up to 15 guests per guide.

### `361628` The North End: Boston's Immigration Gateway

Before:

> The operator Boston By Foot lists this outing.

After:

> This is a 90-minute guided outing with Boston By Foot. The walk visits North End, the city's oldest neighborhood. The walk begins at the waterfront. The outing covers arrivals from Ireland, Eastern Europe, and Italy. The walk covers the neighborhood's immigrant history. The outdoor route is about 0.88 miles at a moderate pace. Selected dates are also offered in Italian. Groups stay at up to 15 guests per guide.

## Final PASS

221 runtime products, 0 validation failures. Boston geography still: 1 Portland move, 1 Hardwick exclude, 8 terminal booking pages. No other city was begun.
