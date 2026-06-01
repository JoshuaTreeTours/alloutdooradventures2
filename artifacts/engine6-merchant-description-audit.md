# Engine6 Merchant Rich-Description Governance Audit

Scope: Engine6 configured products after the original 55 Merchant-approved rows. Original-55 Merchant-approved descriptions were treated as locked and were not regenerated.

## Governance result

Merchant descriptions now resolve through the same governed rich-description builder used for JSON-LD `WebPage.description`, `TouristTrip.description`, and `Product.description` for post-original-55 rows. The audit found no remaining post-original-55 rows with sufficient source material where the Merchant description is below the rich-description threshold or differs from the governed Product description.

## Rows updated

The following post-original-55 Merchant rows were updated from Merchant-approved/thin/legacy copy to the governed rich Product description:

- 233384P2
- 7081NYCDAY
- 62527P11
- 5250LIBERTYELLIS
- 5614063P8
- 3857PHI
- 5024MANSKY
- 103533P1
- 6288P29
- 122012P17
- 474891P3
- 5515296P1
- 3097SDZSP_2VISIT
- 447234P3
- 2335P1
- 5584233P1
- 21165P1
- 31015P9
- 173946P1
- 191303P1
- 5598628P3
- 69764P1
- 18125P5
- 424070P1
- 5257BOAT
- 388361P1
- 28758P1
- 327321P1
- 6740P7
- 237571P2
- 335698P7
- 335698P13
- 445161P1
- 3351P15

## Validation rule added

A regression test now audits every post-original-55 Engine6 tour. If a tour has at least 75 words of governed source material across overview/product description, itinerary, highlights, inclusions, duration, and activity type, the test fails unless the Merchant feed description exactly matches the governed Product description and remains at or above the rich-description threshold.
