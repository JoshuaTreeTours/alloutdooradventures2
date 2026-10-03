# Stage C San Diego legacy FareHarbor tranche

Scope is `citySlug === san-diego` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/san-diego`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the San Diego bucket.

- Total San Diego legacy products: 203
- Active booking pages: 185
- Terminal booking pages: 18
- Geography conflicts with San Diego: 5
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 5
- Published San Diego routes: 73
- Withheld for no authoritative price: 107
- Authoritative price-preview fares among active pages: 101
- Active PRICE_NOT_FOUND before editorial: 84
- Runtime PASS: 73
- Runtime FAIL: 0
- Terminal removals: 18
- PRICE_NOT_FOUND after editorial: 52
- INSUFFICIENT_SOURCE_CONTENT: 58
- SOURCE_NOT_FOUND: 2
- OK priced pages: 73
- Runtime pages with a FareHarbor rating: 30
- Runtime pages without a FareHarbor rating: 43

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `182052` `Signature Bonfire Experience` — 4 / 3673 TripAdvisor
- `60603` `San Diego Whale Watching Cruise` — 4.5 / 3348 Google
- `257108` `2.5 Hour Harbor Cruise` — 4.9 / 2633 Google
- `320733` `San Diego Bay Parade of Lights on Triton Charters⛵️🎄` — 4.9 / 2633 Google
- `467066` `Aquata Charters | Luxury and Speed!` — 4.9 / 2633 Google
- `673429` `Aquata - 2 Hour Charter` — 4.9 / 2633 Google
- `673432` `Aquata - 3 Hour Charter` — 4.9 / 2633 Google
- `673433` `Aquata - 4 Hour Charter` — 4.9 / 2633 Google
- 22 more published pages carry a FareHarbor rating.

## Geography conflicts

- `109487` `PADI Advanced Freediver Course` — exclude — Jolla, California from meeting_point does not belong to San Diego, and no matching public destination exists — `/destinations/california/jolla/tours/padi-advanced-freediver-course-109487`
- `110584` `PADI Master Freediver Course` — exclude — Jolla, California from meeting_point does not belong to San Diego, and no matching public destination exists — `/destinations/california/jolla/tours/padi-master-freediver-course-110584`
- `443620` `1.5 Day Spearfishing Charter` — exclude — Mission Bay, California from item_location does not belong to San Diego, and no matching public destination exists — `/destinations/california/mission-bay/tours/15-day-spearfishing-charter-443620`
- `509885` `San Diego Beach Yoga Hiking Tour` — exclude — Jolla, California from company_start_location does not belong to San Diego, and no matching public destination exists — `/destinations/california/jolla/tours/san-diego-beach-yoga-hiking-tour-509885`
- `647361` `San Diego Beach Yoga (Private Class)` — exclude — Jolla, California from meeting_point does not belong to San Diego, and no matching public destination exists — `/destinations/california/jolla/tours/san-diego-beach-yoga-private-class-647361`

## Terminal records retained for audit

- `681632` `/destinations/california/san-diego/tours/public-dolphin-seal-sailing-cruise-2-hours-681632` — `BOOKING_PAGE_NOT_FOUND`
- `681635` `/destinations/california/san-diego/tours/public-sight-seeing-sailing-cruise-2-hours-681635` — `BOOKING_PAGE_NOT_FOUND`
- `681637` `/destinations/california/san-diego/tours/private-sunset-sailing-cruise-2-hours-681637` — `BOOKING_PAGE_NOT_FOUND`
- `681639` `/destinations/california/san-diego/tours/ranger-race-yacht-sailing-cruise-2-hours-681639` — `BOOKING_PAGE_NOT_FOUND`
- `681677` `/destinations/california/san-diego/tours/private-catamaran-sightseeing-charter-2-hours-681677` — `BOOKING_PAGE_NOT_FOUND`
- `681678` `/destinations/california/san-diego/tours/private-duffy-coronado-bay-bridge-city-skyline-aircraft-carrier-tour-2-hours-681678` — `BOOKING_PAGE_NOT_FOUND`
- `681679` `/destinations/california/san-diego/tours/private-duffy-sub-base-sea-lion-colony-point-loma-lighthouse-bay-tour-3-hours-681679` — `BOOKING_PAGE_NOT_FOUND`
- `681680` `/destinations/california/san-diego/tours/private-group-charter-large-wooden-sailboat-65-stephens-brothers-yawl-2-hours-681680` — `BOOKING_PAGE_NOT_FOUND`
- `681687` `/destinations/california/san-diego/tours/private-group-charter-large-wooden-sailboat-55-twin-masted-ketch-2-hours-681687` — `BOOKING_PAGE_NOT_FOUND`
- `681690` `/destinations/california/san-diego/tours/private-group-charter-luxury-power-yacht-2-hours-681690` — `BOOKING_PAGE_NOT_FOUND`
- `681691` `/destinations/california/san-diego/tours/private-party-yacht-2-hours-681691` — `BOOKING_PAGE_NOT_FOUND`
- `681695` `/destinations/california/san-diego/tours/private-group-large-catamaran-charter-2-hours-681695` — `BOOKING_PAGE_NOT_FOUND`
- `681702` `/destinations/california/san-diego/tours/70-luxury-power-yacht-with-hot-tub-2-hours-681702` — `BOOKING_PAGE_NOT_FOUND`
- `681706` `/destinations/california/san-diego/tours/luxury-vip-party-yacht-3-hours-681706` — `BOOKING_PAGE_NOT_FOUND`
- `681714` `/destinations/california/san-diego/tours/private-sailing-lesson-2-hours-681714` — `BOOKING_PAGE_NOT_FOUND`
- `681717` `/destinations/california/san-diego/tours/memorial-ash-spreading-2-hours-681717` — `BOOKING_PAGE_NOT_FOUND`
- `681718` `/destinations/california/san-diego/tours/private-whale-watching-tour-3-hours-681718` — `BOOKING_PAGE_NOT_FOUND`
- `901101` `/destinations/california/san-diego/tours/mission-bay-guided-paddleboard-tour-901101` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- `109487` geography exclude — Jolla, California from meeting_point does not belong to San Diego, and no matching public destination exists
- `110584` geography exclude — Jolla, California from meeting_point does not belong to San Diego, and no matching public destination exists
- `443620` geography exclude — Mission Bay, California from item_location does not belong to San Diego, and no matching public destination exists
- `509885` geography exclude — Jolla, California from company_start_location does not belong to San Diego, and no matching public destination exists
- `647361` geography exclude — Jolla, California from meeting_point does not belong to San Diego, and no matching public destination exists
- `453576` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/21-hurricane-powerboat-453576` — none
- `453615` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/pontoon-boat-453615` — none
- `453644` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/20-hurricane-powerboat-453644` — none
- `453676` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/18-hurricane-powerboat-453676` — none
- `453696` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/21-duffy-453696` — none
- `453703` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/21-duffy-wsundeck-453703` — none
- `453715` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/yamaha-waverunner-453715` — none
- `453863` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/18-capri-sailboat-453863` — none
- `453882` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/22-capri-sailboat-453882` — none
- `453896` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/stand-up-paddle-sup-board-453896` — none
- `453906` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/single-kayaks-453906` — none
- `453921` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/tandem-kayak-453921` — none
- `453941` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/funcat-electric-catamaran-lounge-chair-453941` — none
- `614180` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/25-catalina-sailboat-614180` — none
- `633989` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/bare-boat-rental---speed-boat-tour-633989` — none
- `615826` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/private-custom-yacht-charters-615826` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 28 words; rich FareHarbor source requires at least 100 words
- `565843` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/snorkel-safari-565843` — none
- `107835` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/padi-freediver-course-107835` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 62 words; rich FareHarbor source requires at least 100 words
- `109487` `PRICE_NOT_FOUND` `/destinations/california/jolla/tours/padi-advanced-freediver-course-109487` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 61 words; rich FareHarbor source requires at least 100 words
- `110584` `PRICE_NOT_FOUND` `/destinations/california/jolla/tours/padi-master-freediver-course-110584` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 64 words; rich FareHarbor source requires at least 100 words
- `226915` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/basicintro-to-freedive-course-226915` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 59 words; rich FareHarbor source requires at least 100 words; full product title is repeated in the description
- `192837` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/ferry-tickets-192837` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 30 words; rich FareHarbor source requires at least 100 words
- `60605` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/patriot-jet-boat-thrill-ride-60605` — none
- `60627` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/full-bay-tour-2-hours-60627` — none
- `581360` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/police-room-581360` — none
- `581364` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/wizard-school-room-581364` — none
- `664169` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/6-passenger-capacity-signature-dolphin-and-whale-watching-trip-25hrs-approx-664169` — none
- `422717` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/beginner-spearfishing-course-422717` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 14 words; rich FareHarbor source requires at least 100 words
- `483473` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/discover-freediving-tour-483473` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 30 words; rich FareHarbor source requires at least 100 words
- `556020` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/spearfishing-shore-tour-556020` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 11 words; rich FareHarbor source requires at least 100 words
- `601167` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/dominica-sperm-whales-freedivingandyoga-retreat-601167` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 51 words; rich FareHarbor source requires at least 100 words; full product title is repeated in the description
- `626043` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/freedive-yogaandbreathwork-workshop-626043` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 46 words; rich FareHarbor source requires at least 100 words
- `489736` `SOURCE_NOT_FOUND` `/destinations/california/san-diego/tours/la-playa-cove---private-duffy-cruise-489736` — none
- `324726` `SOURCE_NOT_FOUND` `/destinations/california/san-diego/tours/private-yacht-charter-on-the-sirara-324726` — none
- `631718` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/pasta-class-631718` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 9 words; rich FareHarbor source requires at least 100 words
- `632518` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/night-cooking-class---make-your-own-pasta-632518` — none
- `632541` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/italian-bread-making-632541` — none
- `632548` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/italian-lasagna-632548` — none
- `313747` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/san-diego-gaslamp-quarter-ghost-tour-313747` — none
- `315509` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/san-diego-embarcadero-waterfront-ghost-tour-315509` — none
- `497509` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/tarot-reading-497509` — none
- `264188` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/blue-and-mako-shark-snorkeling-expedition-6hrs-264188` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 31 words; rich FareHarbor source requires at least 100 words
- `130626` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/island-yoga-130626` — none
- `148858` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/rock-painting-at-tidal-beach-148858` — none
- `155330` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/build-a-buddy-155330` — none
- `236977` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/ping-pong-reservation-236977` — none
- `236981` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/putt-putt-golf-236981` — none
- `236983` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/basketball-reservation-236983` — none
- `237011` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/tie-dye-fun-237011` — none
- `237048` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/mission-bay-bike-tour-237048` — none
- `240386` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/tennis-rentals-240386` — none
- `240433` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/sea-shell-painting-at-tidal-beach-240433` — none
- `286894` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/football-on-the-beach-286894` — none
- `322965` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/island-yoga-with-meditation-322965` — none
- `372237` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/spikeball-reservations-372237` — none
- `484334` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/pickleball-reservation-484334` — none
- `523537` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/trivialicious-523537` — none
- `552110` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/sound-bath-and-meditation-552110` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 28 words; rich FareHarbor source requires at least 100 words
- `556647` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/basketball-pick-up-game-556647` — none
- `115475` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/foam-surfboard-115475` — none
- `655952` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/the-mimosa-club-655952` — none
- `667283` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/cruise-san-diego-bay-667283` — none
- `294524` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/live-beach-cleanup-294524` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 72 words; rich FareHarbor source requires at least 100 words; repetitive sentence openings: the group; repetitive construction: 3 sentences start with The group
- `418943` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/duffy---mission-bay-rental-418943` — none
- `424602` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/single-kayak---mission-bay-rental-424602` — none
- `426219` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/pontoon-16---mission-bay-rental-426219` — none
- `437545` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/pretty-pink-boat---seaforth-boat-rental-437545` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 17 words; rich FareHarbor source requires at least 100 words
- `486330` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/pretty-pink-duffy---seaforth-boat-rental-486330` — none
- `507393` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/whale-watching-excursion-507393` — none
- `624568` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/burial-at-sea-624568` — none
- `633918` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/that-special-someone-633918` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 46 words; rich FareHarbor source requires at least 100 words
- `304583` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/adopt-me-donation-paddle-with-rescue-pup-304583` — none
- `588376` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/private-charter-for-14-30-people-588376` — none
- `588758` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/private-charter-for-up-to-13-people-588758` — none
- `602816` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/valentines-day-on-the-bay-602816` — none
- `320731` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/yo-ho-yo-ho-its-tritons-halloween-party-for-me-320731` — none
- `353912` `PRICE_NOT_FOUND` `/destinations/california/san-diego/tours/valentines-day-sunset-charter-353912` — dollar amount leaked into editorial copy
- `509885` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/jolla/tours/san-diego-beach-yoga-hiking-tour-509885` — none
