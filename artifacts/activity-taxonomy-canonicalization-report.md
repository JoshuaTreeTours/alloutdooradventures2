# Activity taxonomy canonicalization sitemap impact

## Scope

This report compares `public/sitemap-categories.xml` immediately before and after the activity/location taxonomy canonicalization change while preserving the pre-existing category sitemap eligibility/pruning rules.

- Before revision: `f5a331c` (pre-canonicalization baseline)
- After revision: current branch after pruning duplicate country-qualified activity URLs
- Duplicate URL patterns counted:
  - `/tours/{activity}/us/{state-or-region}`
  - `/tours/{activity}/usa/{state-or-region}`
  - `/tours/{activity}/united-states/{state-or-region}`
  - `/tours/{activity}/{state-or-region}/usa`
  - `/tours/{activity}/{state-or-region}/united-states`

## Results

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| `sitemap-categories.xml` URL count | 616 | 543 | -73 |
| Duplicate country-qualified activity URLs | 73 | 0 | -73 |

## Notes

- The after sitemap does not expand the category sitemap; it keeps the pre-existing eligible canonical category URLs and removes only duplicate country-qualified activity variants.
- The duplicate activity URL removal count is 73, calculated as the before duplicate count minus the after duplicate count.
- The canonical Alaska hiking activity URL remains present after the change: `/tours/hiking/alaska`.
- The duplicate examples `/tours/hiking/us/alaska` and `/tours/hiking/alaska/united-states` are absent after the change.
