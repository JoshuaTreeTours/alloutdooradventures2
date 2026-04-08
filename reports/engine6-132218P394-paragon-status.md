# Engine6 Specimen Status — 132218P394

- Source product ID: `132218P394`
- Source product URL: `https://www.viator.com/tours/Las-Vegas/Small-Group-Valley-of-Fire-Half-Day-Hiking-Tour-from-Las-Vegas/d684-132218P394`
- Route path: `/destinations/nevada/las-vegas/tours/small-group-valley-of-fire-half-day-hiking-tour-from-las-vegas`
- Pinned hero URL: `https://dynamic-media.tacdn.com/media/photo-o/2f/f0/50/d7/caption.jpg?w=1100&h=800&s=1`

## API availability

- Live Viator API in this environment: **Unavailable**.
- Evidence:
  - `VIATOR_API_KEY` is not configured.
  - Outbound network call to `https://api.viator.com/partner/products/132218P394` failed with `ENETUNREACH`.

## Field provenance

- Hero image: manually pinned (allowed override).
- Non-hero fields from live API: **unavailable in this environment**.
- Non-hero fields rendered from fixture-authored placeholders/fallbacks: title, description/overview, price, duration, rating, review count, itinerary, meeting point, highlights, inclusions/exclusions, important information, categories/tags.

## Strict paragon result

- **FAILED** strict full API-driven paragon validation in this environment.
- Reason: required live Viator API fields were unavailable; non-hero content therefore cannot be confirmed as API-driven.
- Silent fallback attempted: **No** (explicitly flagged as unavailable).
