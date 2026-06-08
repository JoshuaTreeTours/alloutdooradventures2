# Destination state-level tours route audit

## Findings

State-level tours pages are obsolete. The canonical state destination route is `/destinations/{state}`. City-level tours remain canonical at `/destinations/{state}/{city}/tours`.

### Route patterns audited

| Pattern                                   | Finding                                                                                                                                       | Resolution                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| /destinations/{state}/tours               | No internal literal links or sitemap entries were found. The SPA previously treated `tours` as a city slug and could render `City not found`. | Added app and Vercel redirects to `/destinations/{state}`.                                                    |
| /destinations/states/{state}/tours        | Internal footer/template/builder links and `public/sitemap-destinations.xml` entries existed.                                                 | Repointed internal links/builders to `/destinations/{state}`, removed sitemap emissions, and added redirects. |
| /destinations/united-states/{state}/tours | No sitemap entries or internal literal links found for state-level listing URLs.                                                              | Added app and Vercel redirects to `/destinations/{state}`.                                                    |

## Affected sitemap states

The previous destination sitemap emitted `/destinations/states/{state}/tours` for these states:

- arizona
- california
- colorado
- connecticut
- district-of-columbia
- florida
- georgia
- louisiana
- maine
- maryland
- massachusetts
- minnesota
- mississippi
- montana
- nevada
- new-hampshire
- new-jersey
- new-york
- north-carolina
- oregon
- pennsylvania
- rhode-island
- south-carolina
- tennessee
- utah
- vermont
- washington
- wyoming

## Internal reference changes

- Footer popular-state links now point to canonical state pages.
- State overview CTA links now point to canonical state pages.
- `getAllToursHref` now returns the canonical state page for state-level guide places.
- Destination sitemap generation now emits `/destinations/{state}` and no state-level tours listing URLs.

## Regression coverage

- Added route integrity tests to ensure obsolete state-level tours URLs are not emitted by internal builders or destination sitemaps.
- Added redirect coverage for all three obsolete patterns.
- Added render coverage for internally linked canonical state destination pages and the Alaska fallback state page to guard against `State not found`, `City not found`, or `Destination not found` soft-404 copy.
