# Activity taxonomy canonicalization sitemap impact

## Scope

This report compares `public/sitemap-categories.xml` immediately before and after the activity/location taxonomy canonicalization change.

- Before revision: `f5a331c` (`HEAD^` of the canonicalization commit)
- After revision: `33f5bcc` (canonicalization commit)
- Duplicate URL patterns counted:
  - `/tours/{activity}/us/{state-or-region}`
  - `/tours/{activity}/usa/{state-or-region}`
  - `/tours/{activity}/united-states/{state-or-region}`
  - `/tours/{activity}/{state-or-region}/usa`
  - `/tours/{activity}/{state-or-region}/united-states`

## Results

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| `sitemap-categories.xml` URL count | 616 | 1,658 | +1,042 |
| Duplicate country-qualified activity URLs | 73 | 0 | -73 |

## Notes

- The after sitemap has more total category URLs because it was regenerated from current route-backed activity discovery inventory, adding canonical activity/state/city URLs while excluding duplicate country-qualified variants.
- The duplicate activity URL removal count is 73, calculated as the before duplicate count minus the after duplicate count.
- The canonical Alaska hiking activity URL remains present after the change: `/tours/hiking/alaska`.
- The duplicate examples `/tours/hiking/us/alaska` and `/tours/hiking/alaska/united-states` are absent after the change.
