# Engine6 Itinerary Title Repair Plan

Source: `reports/engine6-itinerary-title-triage.md`

## Scope

- This is a **repair plan only**.
- Focus is limited to the **49 rows classified as Definitely broken** in the triage report.
- This plan does **not** change code, rendering behavior, routes, schema, production data, or itinerary titles.
- Each affected product below has exactly one recommended repair method:
  - **reviewed public-json-ld allowlist** — use only if the reviewed public JSON-LD item names are count-aligned with the affected itinerary rows.
  - **reviewed product-specific override** — use when public JSON-LD is unavailable, not count-aligned, or the title requires product-local reviewed stop names.
  - **leave unchanged until manual source found** — use when the triage evidence is not enough to identify a safe reviewed title source.

## Totals

- Definitely broken rows in scope: **49**
- Affected products in scope: **11**
- Recommended repair methods:
  - reviewed public-json-ld allowlist: **3 products / 29 rows**
  - reviewed product-specific override: **6 products / 17 rows**
  - leave unchanged until manual source found: **2 products / 3 rows**

## Product repair recommendations

| Product ID | Route | Definitely broken rows | Broken itinerary indexes | Recommended repair method | Rationale | Repair-source requirement |
|---|---|---:|---|---|---|---|
| `106439P1` | `/destinations/california/los-angeles/tours/hollywood-and-beverly-hills-celebrity-homes-tour-106439P1` | 9 | 1, 2, 3, 5, 6, 7, 8, 9, 10 | reviewed product-specific override | The broken titles are mostly route prose and neighborhood/landmark descriptions rather than a clean sequence of public POI names. Several rows describe pass-by areas or generalized route segments, so a public-json-ld allowlist is unlikely to be safely count-aligned without manual product review. | Create a reviewed product-local title list from the merchant/source itinerary, preserving row order and only replacing the 9 definitely broken title values. |
| `170119P1` | `/destinations/california/los-angeles/tours/full-day-los-angeles-highlights-tour-hollywood-beverly-hills-beaches-170119P1` | 8 | 0, 1, 2, 3, 4, 5, 6, 7 | reviewed public-json-ld allowlist | The definitely broken rows appear to describe a complete full-day highlights itinerary with recognizable stop names embedded in each prose title: Santa Monica Pier, Venice Beach, Venice Canals, Beverly Hills/Rodeo Drive, Original Farmers Market, The Grove, Hollywood Boulevard/Walk of Fame, and Hollywood Sign viewpoint. This is a strong candidate for a count-aligned reviewed public-json-ld name allowlist. | Verify public-json-ld item names are present, reviewed, and exactly count-aligned to the 8 affected itinerary rows before applying. If not count-aligned, fall back to product-specific override. |
| `32779P6` | `/destinations/california/los-angeles/tours/2-hour-inside-adventure-tour-on-catalina-island-32779P6` | 1 | 0 | leave unchanged until manual source found | The single broken title is broad supplier prose about Catalina Island’s interior and does not expose a specific reviewed POI/location noun phrase in the triage report. | Do not repair from inference. Wait for a manual merchant/source title or a verified aligned JSON-LD name. |
| `5569HIKE` | `/destinations/california/los-angeles/tours/hollywood-hills-hiking-tour-in-los-angeles` | 15 | 0, 2, 3, 4, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20 | reviewed public-json-ld allowlist | The broken rows are numerous but consistently describe a known guided hike sequence through Griffith Park/Hollywood Hills with recognizable places embedded in prose, such as Griffith Observatory, Hollywood Sign, Mount Hollywood, Century City, Downtown Los Angeles, Los Angeles Zoo, Gene Autry Museum, Griffith Park Bird Sanctuary, and Walt Disney Studios. Because this looks like a structured itinerary, use reviewed public-json-ld names only if row counts align. | Verify public-json-ld item names are reviewed and count-aligned to the itinerary rows. If the JSON-LD list omits non-stop viewpoints or pass-by items, fall back to a product-specific override. |
| `5144BRUNCH` | `/destinations/california/san-diego/tours/san-diego-sunday-brunch-cruise` | 1 | 3 | reviewed product-specific override | The definitely broken row is experience prose for the onboard brunch/harbor panorama segment, while the same product also has probably broken route-segment rows. A product-specific reviewed segment title is safer than public-json-ld because this cruise itinerary may not map cleanly to POI item names. | Add a reviewed product-local title for itinerary index 3 only, sourced from merchant itinerary copy or a verified internal product source. |
| `69764P1` | `/destinations/california/san-diego/tours/san-diego-whale-watching-cruise-3-hour-coastal-wildlife-tour` | 2 | 0, 1 | reviewed product-specific override | The broken rows are operational cruise segments rather than POI names: departure/route briefing and coastline wildlife scanning. Public-json-ld place names are unlikely to provide count-aligned replacement titles. | Use reviewed product-local segment titles from the merchant/source itinerary, preserving the two-row order. |
| `18125P5` | `/destinations/california/san-diego/tours/san-diego-private-balboa-park-segway-tour` | 2 | 0, 2 | reviewed product-specific override | The broken rows contain action phrases around Balboa Park and Alcazar Garden. Because only a subset of the product’s suspicious rows are definitely broken and one neighboring row is only probably broken, a product-specific override is safer than a broad JSON-LD allowlist. | Add reviewed product-local titles for itinerary indexes 0 and 2 only after confirming the merchant/source stop labels. |
| `5046SAN_SEA` | `/destinations/california/san-diego/tours/san-diego-seal-tour-5046PRTSANSEA` | 1 | 0 | leave unchanged until manual source found | The broken row is a tour-level marketing sentence and does not contain a specific safe replacement title in the triage report. | Do not infer a replacement. Wait for a verified merchant/source itinerary title or reviewed aligned JSON-LD name. |
| `37126P9` | `/destinations/california/san-diego/tours/san-diego-bay-day-sail` | 1 | 0 | reviewed product-specific override | The broken row is malformed multiline prose combining an action phrase with a Star of India description. A product-specific reviewed override can target the malformed row without affecting neighboring probably broken and false-positive rows. | Add one reviewed product-local title for itinerary index 0 after confirming the intended stop/segment label from source material. |
| `28758P1` | `/destinations/california/san-diego/tours/tijuana-mexico-border-tour-from-san-diego-28758P1` | 3 | 0, 1, 2 | reviewed product-specific override | The broken rows describe a border day-trip experience, guide accompaniment, and broad historical/cultural places in Tijuana rather than a clean count-aligned POI list. | Use a reviewed product-local three-title sequence from merchant/source itinerary labels. |
| `5553984P5` | `/destinations/switzerland/zurich/tours/exclusive-zurich-tour-old-town-lake-zurich-cruise-and-lindt-museum` | 6 | 0, 2, 3, 5, 6, 8 | reviewed public-json-ld allowlist | The broken rows contain recognizable Zurich itinerary nouns embedded in prose, including Old Town, Zurich Old Town/Altstadt, Bahnhofstrasse, Lake Zurich, and Paradeplatz. This is a good candidate for reviewed public-json-ld names if the JSON-LD item list is count-aligned. | Verify reviewed public-json-ld item names align to the affected itinerary order. If any rows are missing or reordered, use a product-specific override instead. |

## Execution guardrails for a future repair PR

1. Repair only the rows listed in this plan as **Definitely broken**.
2. Do not repair rows classified as **Probably broken** unless a separate review promotes them to definitely broken.
3. Do not repair rows classified as **Valid POI title (false positive)**.
4. Do not add inference logic or automatic rewrites.
5. For products marked **reviewed public-json-ld allowlist**, first confirm count alignment between public-json-ld names and the itinerary rows.
6. For products marked **reviewed product-specific override**, store only reviewed product-local replacements and preserve itinerary order.
7. For products marked **leave unchanged until manual source found**, make no title change until a reviewed source is available.
