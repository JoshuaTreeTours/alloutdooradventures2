# International guide paragon rewrite — Phase I

Branch: `international-guide-paragon-rewrite`

## Objective

Apply the same editorial standard used by the Santa Monica and U.S. major-city paragons to international city guides: replace generic destination boilerplate with place-specific orientation, factual visitor context, practical planning guidance, and named POIs that a traveler can actually visit.

Wikipedia or Wikidata links are not treated as a quality defect by themselves. The defect is thin or generic guide copy that relies on those references instead of providing useful first-party planning content.

## Phase I coverage

The first cohort targets flagship international cities and destinations with strong tour inventory or strategic guide value:

- Amsterdam
- Athens
- Barcelona
- Berlin
- Budapest
- Cancun
- Copenhagen
- Dublin
- Edinburgh
- Florence
- Lisbon
- London
- Madrid
- Munich
- Paris
- Porto
- Prague
- Reykjavik
- Rome
- Sydney
- Venice
- Vienna
- Zurich

Edinburgh content is shared across the Scotland and United Kingdom guide routes so the duplicate geography does not produce two different editorial standards.

## Paragon contract

Every enhanced guide must provide:

1. A destination-specific overview with geographic or historical orientation rather than generic travel language.
2. A second factual context section explaining how the place is organized or why its major visitor districts matter.
3. Practical planning guidance tied to local geography, transit, climate, crowding, or reservation behavior.
4. At least six named POIs with unique titles and substantive factual descriptions.
5. Destination-specific season and packing advice.
6. No filler such as “quick way to add variety,” “easy change of scenery,” “recognized destination connected to tours,” “build this stop into the day,” or equivalent generated checklist language.

The runtime enhancer contains assertions for POI count, duplicate titles, minimum descriptive depth, and banned boilerplate. An unprofiled destination is left unchanged rather than being dressed up with invented landmarks.

## Paris exception

Paris has a dedicated route and generated content file rather than using the normal world-city route. It is therefore rebuilt directly as part of Phase I: the former one-sentence attraction cards are replaced with factual multi-sentence POI descriptions, and the live header now uses the curated Paris introduction rather than the generic city-intro generator.

## Next cohorts

Phase II should work outward from the world index using active tour inventory and tourist importance, not simple alphabetical order. Priority groups are Canada and the remaining major European cities, followed by high-value Asia-Pacific and Latin American destinations. Smaller regional towns should be rebuilt only when tour inventory and search intent justify a standalone guide; otherwise they should be candidates for consolidation or retirement rather than automatic content inflation.

No Phase I changes should be merged to `main` until type checks, guide-route tests, prerendering, and a representative visual review pass.
