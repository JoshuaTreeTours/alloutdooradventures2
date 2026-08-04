# Engine6 Stage 2 Governance Audit

Permanent consolidated audit across Engine6 publishing contracts. Blocking applies only to deploy-scoped products in warn mode unless ENGINE6_GOVERNANCE_MODE=strict.

Generated: 2026-08-04T19:51:19.826Z
Governance mode: audit
Scope mode: pr-scoped
Full-site validation: false
Blocking passed: true
Overall passed: true

## Scope

- Deploy-scoped blocking products: 20
- Scoped product codes: 129206P1, 129206P2, 129206P4, 129206P5, 164292P1, 172188P36, 192749P1, 192749P3, 192749P5, 192749P6, 192749P7, 192749P8, 298059P2, 331634P5, 333327P1, 37391P12, 37391P17, 37391P2, 377051P2, 5920CITY
- Destination cohort labels: Houston

## Totals

- Blocking findings: 0
- Warning findings: 0
- Legacy findings (report-only): 3070
- Areas audited: 12
- Areas passed (no blocking findings): 12

## Area summary

| Area | Blocking | Warning | Legacy | Pass |
| --- | ---: | ---: | ---: | --- |
| live-viator | 0 | 0 | 0 | yes |
| product-selection | 0 | 0 | 0 | yes |
| merchant-feed-commercial-refresh | 0 | 0 | 2286 | yes |
| merchant-feed-image | 0 | 0 | 0 | yes |
| description-title | 0 | 0 | 46 | yes |
| itinerary-title | 0 | 0 | 273 | yes |
| route-sitemap-merchant-feed-parity | 0 | 0 | 465 | yes |
| product-code-blocklist | 0 | 0 | 0 | yes |
| destination-cohort | 0 | 0 | 0 | yes |
| destination-infrastructure | 0 | 0 | 0 | yes |
| product-hero | 0 | 0 | 0 | yes |
| paragon-build-scope | 0 | 0 | 0 | yes |

## Notes

- rating_count is maintained as a synchronized mirror of review_count for merchant-feed compatibility. No independent live refresh of rating_count is performed; it changes only when review_count changes.
- Destination cohort scope: Houston

## Legacy findings (report-only)

- **merchant-feed-commercial-refresh** (`63657P1`): 63657P1.average_rating: expected "4.9", got "5.0"
- **merchant-feed-commercial-refresh** (`63657P1`): 63657P1.rating_count: expected "177", got "180"
- **merchant-feed-commercial-refresh** (`63657P1`): 63657P1.review_count: expected "177", got "180"
- **merchant-feed-commercial-refresh** (`163975P1`): 163975P1.rating_count: expected "853", got "860"
- **merchant-feed-commercial-refresh** (`163975P1`): 163975P1.review_count: expected "853", got "860"
- **merchant-feed-commercial-refresh** (`447486P8`): 447486P8.average_rating: expected "", got "4.6"
- **merchant-feed-commercial-refresh** (`447486P8`): 447486P8.rating_count: expected "", got "38"
- **merchant-feed-commercial-refresh** (`447486P8`): 447486P8.review_count: expected "", got "38"
- **merchant-feed-commercial-refresh** (`447486P4`): 447486P4.rating_count: expected "39", got "46"
- **merchant-feed-commercial-refresh** (`447486P4`): 447486P4.review_count: expected "39", got "46"
- **merchant-feed-commercial-refresh** (`117409P1`): 117409P1.rating_count: expected "223", got "231"
- **merchant-feed-commercial-refresh** (`117409P1`): 117409P1.review_count: expected "223", got "231"
- **merchant-feed-commercial-refresh** (`5119P13`): 5119P13.price: expected "399 USD", got "352.99 USD"
- **merchant-feed-commercial-refresh** (`5119P13`): 5119P13.rating_count: expected "163", got "165"
- **merchant-feed-commercial-refresh** (`5119P13`): 5119P13.review_count: expected "163", got "165"
- **merchant-feed-commercial-refresh** (`5602P25`): 5602P25.average_rating: expected "4.5", got "5.0"
- **merchant-feed-commercial-refresh** (`5602P25`): 5602P25.rating_count: expected "62", got "4"
- **merchant-feed-commercial-refresh** (`5602P25`): 5602P25.review_count: expected "62", got "4"
- **merchant-feed-commercial-refresh** (`190492P3`): 190492P3.price: expected "199 USD", got "249 USD"
- **merchant-feed-commercial-refresh** (`190492P3`): 190492P3.rating_count: expected "214", got "27"
- **merchant-feed-commercial-refresh** (`190492P3`): 190492P3.review_count: expected "214", got "27"
- **merchant-feed-commercial-refresh** (`5516ST5`): 5516ST5.price: expected "129 USD", got "99 USD"
- **merchant-feed-commercial-refresh** (`5516ST5`): 5516ST5.average_rating: expected "4.7", got "4.3"
- **merchant-feed-commercial-refresh** (`5516ST5`): 5516ST5.rating_count: expected "1842", got "5829"
- **merchant-feed-commercial-refresh** (`5516ST5`): 5516ST5.review_count: expected "1842", got "5829"
- **merchant-feed-commercial-refresh** (`13920P12`): 13920P12.price: expected "189.50 USD", got "240 USD"
- **merchant-feed-commercial-refresh** (`13920P12`): 13920P12.average_rating: expected "4.6", got "4.8"
- **merchant-feed-commercial-refresh** (`13920P12`): 13920P12.rating_count: expected "497", got "569"
- **merchant-feed-commercial-refresh** (`13920P12`): 13920P12.review_count: expected "497", got "569"
- **merchant-feed-commercial-refresh** (`470339P1`): 470339P1.price: expected "49 USD", got "69 USD"
- **merchant-feed-commercial-refresh** (`470339P1`): 470339P1.average_rating: expected "4.8", got "4.9"
- **merchant-feed-commercial-refresh** (`470339P1`): 470339P1.rating_count: expected "41", got "802"
- **merchant-feed-commercial-refresh** (`470339P1`): 470339P1.review_count: expected "41", got "802"
- **merchant-feed-commercial-refresh** (`398496P5`): 398496P5.price: expected "69 USD", got "115 USD"
- **merchant-feed-commercial-refresh** (`398496P5`): 398496P5.average_rating: expected "4.7", got "4.9"
- **merchant-feed-commercial-refresh** (`398496P5`): 398496P5.rating_count: expected "28", got "61"
- **merchant-feed-commercial-refresh** (`398496P5`): 398496P5.review_count: expected "28", got "61"
- **merchant-feed-commercial-refresh** (`7079RREBIKE`): 7079RREBIKE.price: expected "129 USD", got "137 USD"
- **merchant-feed-commercial-refresh** (`7079RREBIKE`): 7079RREBIKE.average_rating: expected "4.8", got "5.0"
- **merchant-feed-commercial-refresh** (`7079RREBIKE`): 7079RREBIKE.rating_count: expected "214", got "1939"
- **merchant-feed-commercial-refresh** (`7079RREBIKE`): 7079RREBIKE.review_count: expected "214", got "1939"
- **merchant-feed-commercial-refresh** (`3533RRC`): 3533RRC.price: expected "139 USD", got "126.53 USD"
- **merchant-feed-commercial-refresh** (`3533RRC`): 3533RRC.average_rating: expected "4.9", got "4.8"
- **merchant-feed-commercial-refresh** (`3533RRC`): 3533RRC.rating_count: expected "66", got "246"
- **merchant-feed-commercial-refresh** (`3533RRC`): 3533RRC.review_count: expected "66", got "246"
- **merchant-feed-commercial-refresh** (`3533P14`): 3533P14.price: expected "149 USD", got "156.30 USD"
- **merchant-feed-commercial-refresh** (`3533P14`): 3533P14.average_rating: expected "4.8", got "4.9"
- **merchant-feed-commercial-refresh** (`3533P14`): 3533P14.rating_count: expected "921", got "262"
- **merchant-feed-commercial-refresh** (`3533P14`): 3533P14.review_count: expected "921", got "262"
- **merchant-feed-commercial-refresh** (`32779P2`): 32779P2.price: expected "53 USD", got "56.50 USD"
- **merchant-feed-commercial-refresh** (`32779P2`): 32779P2.rating_count: expected "539", got "581"
- **merchant-feed-commercial-refresh** (`32779P2`): 32779P2.review_count: expected "539", got "581"
- **merchant-feed-commercial-refresh** (`60136P1`): 60136P1.price: expected "149 USD", got "160 USD"
- **merchant-feed-commercial-refresh** (`60136P1`): 60136P1.rating_count: expected "1922", got "2218"
- **merchant-feed-commercial-refresh** (`60136P1`): 60136P1.review_count: expected "1922", got "2218"
- **merchant-feed-commercial-refresh** (`26719P8`): 26719P8.price: expected "109 USD", got "99 USD"
- **merchant-feed-commercial-refresh** (`26719P8`): 26719P8.rating_count: expected "5060", got "5248"
- **merchant-feed-commercial-refresh** (`26719P8`): 26719P8.review_count: expected "5060", got "5248"
- **merchant-feed-commercial-refresh** (`354611P1`): 354611P1.rating_count: expected "112", got "118"
- **merchant-feed-commercial-refresh** (`354611P1`): 354611P1.review_count: expected "112", got "118"
- **merchant-feed-commercial-refresh** (`36001P14`): 36001P14.rating_count: expected "10", got "28"
- **merchant-feed-commercial-refresh** (`36001P14`): 36001P14.review_count: expected "10", got "28"
- **merchant-feed-commercial-refresh** (`152424P1`): 152424P1.rating_count: expected "765", got "891"
- **merchant-feed-commercial-refresh** (`152424P1`): 152424P1.review_count: expected "765", got "891"
- **merchant-feed-commercial-refresh** (`6007GGB`): 6007GGB.rating_count: expected "722", got "746"
- **merchant-feed-commercial-refresh** (`6007GGB`): 6007GGB.review_count: expected "722", got "746"
- **merchant-feed-commercial-refresh** (`2630SUN`): 2630SUN.rating_count: expected "1978", got "2018"
- **merchant-feed-commercial-refresh** (`2630SUN`): 2630SUN.review_count: expected "1978", got "2018"
- **merchant-feed-commercial-refresh** (`6007P5`): 6007P5.rating_count: expected "56", got "58"
- **merchant-feed-commercial-refresh** (`6007P5`): 6007P5.review_count: expected "56", got "58"
- **merchant-feed-commercial-refresh** (`3454P57`): 3454P57.average_rating: expected "", got "5.0"
- **merchant-feed-commercial-refresh** (`3454P57`): 3454P57.rating_count: expected "", got "1"
- **merchant-feed-commercial-refresh** (`3454P57`): 3454P57.review_count: expected "", got "1"
- **merchant-feed-commercial-refresh** (`23068P2`): 23068P2.price: expected "85 USD", got "99 USD"
- **merchant-feed-commercial-refresh** (`23068P2`): 23068P2.rating_count: expected "3002", got "3056"
- **merchant-feed-commercial-refresh** (`23068P2`): 23068P2.review_count: expected "3002", got "3056"
- **merchant-feed-commercial-refresh** (`415653P2`): 415653P2.rating_count: expected "64", got "69"
- **merchant-feed-commercial-refresh** (`415653P2`): 415653P2.review_count: expected "64", got "69"
- **merchant-feed-commercial-refresh** (`72999P3`): 72999P3.rating_count: expected "861", got "876"
- **merchant-feed-commercial-refresh** (`72999P3`): 72999P3.review_count: expected "861", got "876"
- **merchant-feed-commercial-refresh** (`2660SFOWIN`): 2660SFOWIN.rating_count: expected "4516", got "4536"
- **merchant-feed-commercial-refresh** (`2660SFOWIN`): 2660SFOWIN.review_count: expected "4516", got "4536"
- **merchant-feed-commercial-refresh** (`304471P122`): 304471P122.average_rating: expected "3.8", got "3.7"
- **merchant-feed-commercial-refresh** (`304471P122`): 304471P122.rating_count: expected "65", got "102"
- **merchant-feed-commercial-refresh** (`304471P122`): 304471P122.review_count: expected "65", got "102"
- **merchant-feed-commercial-refresh** (`333016P3`): 333016P3.rating_count: expected "119", got "123"
- **merchant-feed-commercial-refresh** (`333016P3`): 333016P3.review_count: expected "119", got "123"
- **merchant-feed-commercial-refresh** (`3454YE3D`): 3454YE3D.rating_count: expected "212", got "215"
- **merchant-feed-commercial-refresh** (`3454YE3D`): 3454YE3D.review_count: expected "212", got "215"
- **merchant-feed-commercial-refresh** (`365892P1`): 365892P1.price: expected "659 USD", got "689 USD"
- **merchant-feed-commercial-refresh** (`365892P1`): 365892P1.rating_count: expected "137", got "139"
- **merchant-feed-commercial-refresh** (`365892P1`): 365892P1.review_count: expected "137", got "139"
- **merchant-feed-commercial-refresh** (`148509P1`): 148509P1.price: expected "76 USD", got "79 USD"
- **merchant-feed-commercial-refresh** (`148509P1`): 148509P1.rating_count: expected "5381", got "5498"
- **merchant-feed-commercial-refresh** (`148509P1`): 148509P1.review_count: expected "5381", got "5498"
- **merchant-feed-commercial-refresh** (`170119P1`): 170119P1.rating_count: expected "135", got "138"
- **merchant-feed-commercial-refresh** (`170119P1`): 170119P1.review_count: expected "135", got "138"
- **merchant-feed-commercial-refresh** (`47235P1`): 47235P1.price: expected "149 USD", got "99 USD"
- **merchant-feed-commercial-refresh** (`47235P1`): 47235P1.average_rating: expected "4.8", got "4.9"
- **merchant-feed-commercial-refresh** (`47235P1`): 47235P1.rating_count: expected "412", got "6473"
- ...and 2970 additional legacy finding(s).

See `reports/engine6-stage2-governance-audit.json` for the full machine-readable report.
