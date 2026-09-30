# Stage C Boston editorial rewrite

Customer-facing copy only. Geography, pricing authority, schema-graph, terminal-product, and Merchant-feed logic were not redesigned. The approved 10-product voice is now applied to all 221 published Boston migrated products. No other city was processed.

Voice lives in `scripts/fareharbor-lead-to-gold/editorial_voice.py`. The original 10 remain hand-tuned overlays in `boston_editorial_sample.json`. The remaining 211 are generated from harvest facts in the same guest-centered style (sail, pass, see, explore, come into view; no “uses / takes in / points out / continues toward”).

Runtime after rewrite: 221 published (68 priced, 62 `PRICE_NOT_FOUND`, 91 `INSUFFICIENT_SOURCE_CONTENT`). Geography still: 1 moved to Portland, 1 Hardwick exclude, 8 terminals.

## Sample of 10 (hand-tuned)

| Item | Title | Status | Path |
| --- | --- | --- | --- |
| 27344 | City View Tour | OK | `/destinations/massachusetts/boston/tours/city-view-tour-27344` |
| 112945 | Chinatown's Culture & Cuisine | OK | `/destinations/massachusetts/boston/tours/chinatowns-culture-and-cuisine-112945` |
| 117124 | Happy Hour Stroll | OK | `/destinations/massachusetts/boston/tours/happy-hour-stroll-117124` |
| 243407 | Local Gems of the South End | OK | `/destinations/massachusetts/boston/tours/local-gems-of-the-south-end-243407` |
| 26483 | Adirondack Sunset Sail | OK | `/destinations/massachusetts/boston/tours/adirondack-sunset-sail-26483` |
| 26504 | Boston Harbor Cruise on Northern Lights | OK | `/destinations/massachusetts/boston/tours/boston-harbor-cruise-on-northern-lights-26504` |
| 361612 | Boston By Little Feet | OK | `/destinations/massachusetts/boston/tours/boston-by-little-feet-361612` |
| 361623 | Heart of the Freedom Trail | OK | `/destinations/massachusetts/boston/tours/heart-of-the-freedom-trail-361623` |
| 482166 | Holiday Harbor Cruise | PRICE_NOT_FOUND | `/destinations/massachusetts/boston/tours/holiday-harbor-cruise-482166` |
| 618195 | Boston Chocolate Tour | OK | `/destinations/massachusetts/boston/tours/boston-chocolate-tour-618195` |

The remaining 211 Boston products now use this voice.

## 27344 — City View Tour

The City View Tour is a 2.5- to 3-hour bicycle outing with Urban Adventours, covering about 10 to 12 miles and six Boston neighborhoods. Each guest rides an individually fitted bike. A helmet and water are included, and the guide leads in English.

The ride starts in the North End, Boston's oldest residential neighborhood, with Charlestown across the water, then follows the Charles River Esplanade toward Cambridge and MIT. From there it continues past Boston University and Kenmore Square to Fenway Park, then to the Christian Science Center and Copley Square, where the John Hancock Building and the Boston Marathon finish line stand. The last stretch moves through Back Bay and South End brownstones, Boston Common, the Rose Kennedy Greenway, and Long Wharf, looking toward South Boston and East Boston.

Departures are daily at 10 a.m. and 2 p.m. Guests are asked to reserve by 6 p.m. the day before. The ride continues in ordinary rain. Children must be at least 12 months old, and helmets are required.

## 112945 — Chinatown's Culture & Cuisine

Chinatown's Culture & Cuisine is a three-hour food walk with Bites of Boston Food Tours through Boston's Chinatown. The walk samples traditional and modern Chinese dishes and covers the neighborhood's history.

Groups are capped at 12, and guests must be at least 12 years old. Strollers are not permitted.

## 117124 — Happy Hour Stroll

Happy Hour Stroll is a 2.5-hour Friday-evening food walk with Bites of Boston Food Tours in the South End. The walk visits four eateries that South End residents use, and each stop pairs a tasting with an alcoholic drink.

Groups are capped at 12. Guests must be 21 or older.

## 243407 — Local Gems of the South End

Local Gems of the South End is a three-hour food walk with Bites of Boston Food Tours. The outing leaves downtown for the South End and visits restaurants, bakeries, and markets, sampling sweet and savory dishes from more than one cuisine.

Groups are capped at 16, and guests must be at least 12 years old. Strollers are not permitted.

## 26483 — Adirondack Sunset Sail

This two-hour sunset sail on Boston Harbor uses the 80-foot pilot schooners Adirondack III and Adirondack II, built in the style of 1890s pilot schooners, with teak decks and mahogany trim. Light commentary on waterfront landmarks starts after the boat leaves the dock.

The course first takes in the Seaport District, pointing out the Moakley courthouse on Fan Pier, World Trade Center, and Harpoon Brewery, then continues toward the Inner Harbor islands. Castle Island and Fort Independence come into view, along with the Donald McKay Monument, Spectacle Island, and the light at Long Island Head. The captain and crew answer questions about the harbor.

Adult beverages require valid identification. Tickets are not refundable; a reschedule or gift-card exchange is available until 24 hours before departure.

## 26504 — Boston Harbor Cruise on Northern Lights

Northern Lights, a 115-foot motor yacht styled after a 1920s New England steamship, runs a 60- or 90-minute sightseeing cruise on Boston Harbor. The captain offers moderate commentary on the main sights; this is not a fully narrated tour.

Guests can sit in the main cabin, which is heated or air-conditioned, or move to the open-air covered top deck. Drinks and small bites are sold at the onboard bar.

Sightlines include the Boston skyline, USS Constitution, USS Cassin Young, and the Old North Church steeple, along with Bunker Hill Monument, Fort Independence, the Seaport District, and Spectacle Island.

## 361612 — Boston By Little Feet

Boston By Little Feet is a one-hour Freedom Trail walk designed for families with children ages 6 to 12. The outdoor route is about 0.73 miles at a moderate pace, with up to 25 guests per guide.

Stops include Faneuil Hall and the Old State House. The route also reaches the Old South Meeting House, Boston's first public school site, and its oldest burying ground. Children are asked to take part at each stop. Every child must be with a ticketed adult.

The outing is held in ordinary rain as well as clear weather. Surfaces are mostly flat, and the walk is stroller and wheelchair accessible. On selected dates the same tour is offered in Spanish. Comfortable shoes, weather-ready clothing, and a water bottle are the packing notes.

## 361623 — Heart of the Freedom Trail

Heart of the Freedom Trail is a one-hour walking introduction to Boston's Revolutionary history with Boston By Foot. The outdoor route is about half a mile at a moderate pace, with up to 25 guests per guide.

The walk visits the Old State House, Faneuil Hall, King's Chapel, and the Old South Meeting House, with stories about the people and events tied to those buildings.

The outing is held in ordinary rain as well as clear weather. Surfaces are mostly flat, and the walk is stroller and wheelchair accessible. Comfortable shoes, weather-ready clothing, and a water bottle are the packing notes.

## 482166 — Holiday Harbor Cruise

Yacht Manhattan runs a 90-minute sightseeing cruise on Boston Harbor. Guests can sit in the heated main cabin or step onto the open deck. Drinks and small bites are sold at the bar.

The boat is an 80-foot, 1920s-style yacht with teak decks, mahogany trim, and an all-glass cabin. Sightlines include the Boston skyline, USS Constitution, USS Cassin Young, and the Old North Church steeple, along with Bunker Hill Monument, Fort Independence, the Seaport District, and Spectacle Island.

Tickets are not refundable; a reschedule or gift-card exchange is available until 24 hours before departure.

Holiday décor was not added; the harvest for this sailing does not describe holiday-specific staging.

## 618195 — Boston Chocolate Tour

This two-hour chocolate walk covers about 1.5 miles, starting in Beacon Hill and continuing across Boston Common, then along Park Street to the Boston Public Market. Groups stay at a maximum of 12 guests.

Five stops serve samples from mostly female-owned small businesses, including bean-to-bar chocolate, a Belgian tasting, truffles, Boston Cream Pie, and chocolate tea. Substitutions for dietary restrictions or allergies are confirmed by email. After the walk, guests receive a digital Boston guide.

The outing is stroller and wheelchair accessible. Comfortable shoes, weather-ready clothing, and a water bottle are the packing notes. A full refund is available with at least 48 hours' notice.
