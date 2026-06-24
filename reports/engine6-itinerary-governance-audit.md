# Engine6 Itinerary Governance Audit

Report-only audit aligned with `src/engine6/ITINERARY_GOVERNANCE_POLICY.md` v2.

Generated: 2026-06-24T01:03:45.887Z

## Totals

- Total Engine6 tours audited: 165
- Total itinerary rows audited: 741
- Rows with findings: 201
- Critical rows: 197
- Review rows: 4
- Affected tours: 20

## Top findings

| Severity | Finding | Count |
| --- | --- | ---: |
| critical | title-description-semantic-mismatch | 177 |
| critical | matches-description-first-sentence | 20 |
| critical | prose-title | 1 |
| review | sentence-punctuation | 5 |

## Affected products

| Route | Product ID | Suspicious rows | Examples |
| --- | --- | ---: | --- |
| /destinations/california/san-francisco/tours/3-day-yosemite-camping-adventure-from-san-francisco | 3454YE3D | 3 | San Francisco departure; Yosemite Village free time; Valley activity time |
| /destinations/california/los-angeles/tours/hollywood-and-beverly-hills-celebrity-homes-tour-106439P1 | 106439P1 | 2 | Beverly Gardens Park; Beverly Canon Gardens |
| /destinations/louisiana/new-orleans/tours/new-orleans-75-minute-riverboat-sightseeing-cruise | 3780P45 | 2 | French Quarter riverfront; Crescent City Connection |
| /destinations/california/san-diego/tours/san-diego-bay-sail-aboard-a-french-yacht-beer-and-wine-included | 5598628P3 | 2 | Sunset Cliffs Natural Park; Waterfront Park Downtown San Diego |
| /destinations/california/los-angeles/tours/hollywood-private-helicopter-tour-15131P4 | 15131P4 | 1 | Crypto.com Arena |
| /destinations/nevada/las-vegas/tours/zion-and-bryce-canyon-small-group-tour-from-las-vegas | 190492P3 | 1 | Bryce Canyon National Park |
| /destinations/louisiana/new-orleans/tours/new-orleans-city-bike-tour | 276551P2 | 1 | Lafayette Cemetery No. 1 |
| /destinations/california/san-diego/tours/tijuana-mexico-border-tour-from-san-diego-28758P1 | 28758P1 | 1 | Tijuana Walking Tour |
| /destinations/california/san-diego/tours/san-diego-zoo-and-safari-park-2-visit-pass-ticket | 3097SDZSP_2VISIT | 1 | San Diego Zoo Safari Park |
| /destinations/nevada/las-vegas/tours/historical-railroad-trail-ebike-tour | 354611P1 | 1 | Historic Railroad Trail |
| /destinations/california/san-francisco/tours/big-sur-monterey-and-carmel-tour-from-san-francisco | 36001P14 | 1 | Pacific Coast Highway |
| /destinations/california/san-diego/tours/san-diego-sunday-brunch-cruise | 5144BRUNCH | 1 | Sunday Brunch Cruise |
| /destinations/new-york/new-york/tours/nyc-bustronome-gourmet-sightseeing-lunch-panoramic-bus | 5515296P1 | 1 | Solomon R. Guggenheim Museum |
| /destinations/california/los-angeles/tours/hollywood-hills-hiking-tour-in-los-angeles | 5569HIKE | 1 | Warner Bros. Studios |
| /destinations/california/san-diego/tours/spectacular-sunset-sail-on-san-diego-bay | 5584233P1 | 1 | Cabrillo National Monument |
| /destinations/nevada/las-vegas/tours/western-national-parks-7-day-explorer-camping | 5602P25 | 1 | Day 3: Monument Valley |
| /destinations/new-york/new-york/tours/washington-d-c-tour-from-new-york | 5614063P8 | 1 | Washington, D.C. Landmarks |
| /destinations/new-york/new-york/tours/niagara-falls-in-one-day-from-new-york-city | 62527P11 | 1 | Midtown Manhattan Departure |
| /destinations/louisiana/new-orleans/tours/honey-island-swamp-tour-with-transport | 6953SWAMPTRANS | 1 | Downtown New Orleans pickup |
| /destinations/new-york/new-york/tours/new-york-in-one-day-guided-sightseeing-tour | 7081NYCDAY | 1 | Gansevoort Liberty Market |

## Full findings

See `reports/engine6-itinerary-governance-audit.json` for row-level findings, severities, rendered title/description, and titleSource.
