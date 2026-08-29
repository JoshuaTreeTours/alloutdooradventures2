# Mexico City Engine6 selection notes

## Destination identity

Canonical public destination: **Mexico City** (`mexico-city`).
Preexisting Engine2 identity **Ciudad De México** (`ciudad-de-mexico`) is retained as an alias/redirect only.

## Catalog constraint

Viator Mexico City city destination is **d628**. The supplied country City Tours URL (`d76-g12-c5330`) is Mexico-wide and was used as a discovery seed, not as the product destination.

Live public Viator pages could not be scraped at volume from this environment (DataDome 403). Every selected product was therefore captured individually via `WebFetch` and accepted only when the dump included:

- USD From$ price
- combined rating + review count
- a product-specific 674x446 Viator photo
- itinerary / inclusions sufficient to write a governed description

## Selected count

**11 products** (below the 20-product target). Edinburgh on latest `origin/main` used the same live-USD constraint and selected 18. Mexico City dumps more often arrived in BRL/CAD/GBP/EUR/DKK/AUD without a USD From$ field, so fewer products cleared the commercial-authority bar.

Do not invent USD prices for rejected products.

Premium / high-value count: **8 / 11**.

## Itinerary titles

Verified POI titles are used on 10 of 11 products.

`247495P2` uses the neutral fallback **Teotihuacan Launch Field** instead of the operator meeting-point name **We Fly Teotihuacan**. The operator name contains the banned overview token `we`, so the launch-field label is used on itinerary and overview surfaces. The official Viator product title still includes “We Fly”.
