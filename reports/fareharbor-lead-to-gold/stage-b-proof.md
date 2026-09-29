# Stage B FareHarbor proof set

Scope is the 10 Stage A representative products. Runtime pages read the generated module in `src/data/fareharborLeadToGoldProof.generated.ts`. They do not call FareHarbor.

Public copy is original editorial prose written from the stored harvest. Provenance labels, HTTP statuses, and fare tables stay in this report and in the pricing block. They are not part of the description.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/proof-set`. The unmerged derivative on `origin/feat/fareharbor-content-rebuild` is a secondary cross-check and is not page copy.

Catalog `quality_score` and `availability_count` are not ratings or review counts. The synthetic $129 price floor is not used for these 10 products. Other FareHarbor pages still use that floor.

Item 34849 had been hard-deleted and covered by the red-jeep operator opt-out. This proof restores only `shared-san-andreas-fault-jeep-tour-34849` at the Palm Springs path. Other red-jeep items stay removed.

## Proof URLs

- `/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208`
- `/destinations/hawaii/paia/tours/haleakala-downhill-self-guided-bike-tour-181765`
- `/destinations/new-york/new-york/tours/nycs-underground-subway-tour---private-tour-322210`
- `/destinations/wyoming/wilson/tours/scenic-float-tour-595701`
- `/destinations/wyoming/cody/tours/self-guided-adv-motorcycle-rental-klr-650-694384`
- `/destinations/wyoming/moose/tours/grand-teton-scenic-float---private-tour-646999`
- `/destinations/british-columbia/vancouver/tours/guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500`
- `/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849`
- `/destinations/florida/orlando/tours/date-night-neon-glow-clear-kayak-or-paddleboard-and-champagne-orlando-333279`
- `/destinations/california/ensenada/tours/la-bufadora-tour-in-baja-california-193220`

## 145208 Country Boy Gold Mine Tour

### BEFORE

- Path: `/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208`
- Price on main: NONE
- Catalog rating field: 3.2 / review field 895. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: Country Boy Gold Mine Tour is a guided outdoor experience based in Breckenridge, Colorado that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/countryboymine-145208`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 200 sha256 `54cf0b994eb9b4f60655e622cc39063142a6d0cafdc968029122cb0f58661a7f`
- structured-description: HTTP 200 sha256 `0a0e1b56ded0819303dcea95496932d646e0c0ecf3cd9d5f9d18e91a247c927d`
- item: HTTP 200 sha256 `266f46a1da0536b676d74587814e4c326b9fc95d05701edf863eb7680913c5e6`
- price-preview: HTTP 200 sha256 `f246a98eaefe28362660736b15eb904a8c6c2bd065f08ab2a9a7c96ed6168b7f`
- Authoritative price: $59.95 USD (Adult)
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['duration 1 hour']; not used=['derivative template opener was not copied', 'derivative marketing phrasing was not copied']

### AFTER

- Exception status: `OK`
- Editorial word count: 153
- Visible price: From $59.95
- Duration: 1 hour
- Meeting location: Country Boy Mine, 0542 French Gulch Road, Breckenridge, CO 80424
- Schema and meta description: One-hour combined-group tour at Country Boy Mine in Breckenridge. Guests meet at 0542 French Gulch Road, go more than 1,000 feet into the mountain through the original workings, and pan for gold in Eureka Creek. Gold panning is included, and guests keep what they find.
- Offer: `{"type": "Offer", "price": "59.95", "priceCurrency": "USD"}`
- Pricing rows: `[{"label": "Adult", "note": "13+", "amountLabel": "$59.95"}, {"label": "Child", "note": "Ages 4-12", "amountLabel": "$39.95"}, {"label": "Mine Tour Child (3-years old and under)", "note": "", "amountLabel": "Free"}]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- The Country Boy Gold Mine Tour is a one-hour combined-group visit to Country Boy Mine in Breckenridge, Colorado. The visit begins at the mine before the route goes more than 1,000 feet into the mountain, through the original workings. Those workings are presented as the setting of a Colorado miner more than 100 years ago. Old photographs and other exhibits are part of the visit.
- Gold panning in Eureka Creek is included with the mine tour. After the underground portion, guests pan in the creek and keep what they find. It gets very cold underground, so warm clothing is needed, and waterproof shoes are recommended for the gold panning. The tour is offered year-round.
- Tickets are sold in three categories. Adults are 13 and older. Children ages 4 to 12 have their own ticket. Children 3 and under are admitted free. The age floor on the tour is 4.

Claims removed in the provenance audit:

- Private mine bookings are unavailable.
- Photographs and exhibits are located along the underground passage.
- The tunnel would otherwise be an empty corridor.
- The mine is cold in every season.
- Guests stand in Eureka Creek while panning.

## 181765 Haleakala Downhill Self-Guided Bike Tour

### BEFORE

- Path: `/destinations/hawaii/paia/tours/haleakala-downhill-self-guided-bike-tour-181765`
- Price on main: NONE
- Catalog rating field: 5 / review field 155. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: Haleakala Downhill Self-Guided Bike Tour is a guided outdoor experience based in Paia, Hawaii that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/mauisunriders-181765`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 200 sha256 `074e5a176a0d74401373f6dd2a6839c5a550aa6a41f93b295d22ad8e5e376588`
- structured-description: HTTP 200 sha256 `7ffa9c01d5a54c1619b639eb726329060977a84f4fc25b7c75a8bca6ed3717b7`
- item: HTTP 200 sha256 `424b3244a75efe1c039cccc69330745fe16e3e50f12d99f6df428e370ebeba4e`
- price-preview: HTTP 200 sha256 `0b666c76114d038647318bc73c7539154214a7da5baaaf07d0ca34261d04737d`
- Authoritative price: $119 USD (Adult)
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['unmerged price cache 119.0 USD matches harvest basis']; not used=['derivative template opener was not copied', 'derivative marketing phrasing was not copied']

### AFTER

- Exception status: `OK`
- Editorial word count: 270
- Visible price: From $119
- Duration: 4-5 hours
- Meeting location: Maui Sunriders, 71 Baldwin Avenue, Suite D3, Paia, HI 96779
- Schema and meta description: Self-guided downhill bike ride from 6,500 feet on Haleakala back to Paia, lasting four to five hours. Check-in is at 71 Baldwin Avenue, Suite D3. A narrated van ride starts the day, and Maui County law requires a van bypass on part of the Kula Highway.
- Offer: `{"type": "Offer", "price": "119.00", "priceCurrency": "USD"}`
- Pricing rows: `[{"label": "Adult", "note": "18+", "amountLabel": "$119"}, {"label": "Youth", "note": "15-17", "amountLabel": "$119"}]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Haleakala Downhill is a self-guided bike ride that starts with a van trip from Paia. The published itinerary puts check-in at 8:45 a.m. There is a gear fitting and a safety briefing, then a narrated van ride of about 45 minutes to 6,500 feet, just outside Haleakala National Park. On the way up, the narration covers Maui history, volcanic landscapes, and cultural notes.
- The ride from that point is self-guided. Riders set their own pace through upcountry Maui and can stop for photos. A short stretch of the Kula Highway is skipped in the van because Maui County law requires bike tours to bypass it. Riders get back in the van for that section, then continue. The route goes through Makawao before the last stretch into Paia. Bikes are due back at the shop by 1:30 p.m. From check-in to return, the outing runs four to five hours.
- Each rider gets a mountain bike with front suspension and disc brakes, a full-face downhill helmet or a lighter helmet, rain and wind gear, gloves, and a backpack with a lock and a map. Roadside assistance is available during the ride. Meals, drinks, shopping, and tips are not included. Riders must be at least 15 and no heavier than 280 pounds. The ride is not for beginners, pregnant guests, or guests with impaired mobility. Temperatures are cooler at the higher elevation, so the items to bring include a light layer, closed-toe shoes, sunglasses, and sunscreen. Adult tickets are for ages 18 and older. Youth tickets are for ages 15 to 17.

Claims removed in the provenance audit:

- The 8:45 a.m. check-in was described as a stored schedule rather than the published itinerary time.
- The start of the ride was called a pullout.
- Higher elevation was described as cooler than Paia specifically, rather than cooler at higher elevation.

## 322210 NYC's Underground Subway Tour - Private Tour

### BEFORE

- Path: `/destinations/new-york/new-york/tours/nycs-underground-subway-tour---private-tour-322210`
- Price on main: NONE
- Catalog rating field: 5 / review field 4500. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: NYC's Underground Subway Tour - Private Tour is a guided outdoor experience based in New York, New York that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/untappednewyork-322210`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 200 sha256 `06dffc9c5f682361859e5ed820020d8cab09d14dca87bac6c651d0bd7e650783`
- structured-description: HTTP 200 sha256 `bc880fcaf8c914f2d5d2a07f923c29e4a482d198e089a984b02c9ca5b71cba9d`
- item: HTTP 200 sha256 `70951faa6de3d4dac65e07a837341559c7c5be23161f245fc91e301bc5556dd8`
- price-preview: HTTP 200 sha256 `cf4c4dd801624a5ae67c22a639558369e34c91f19f8f995a8510854d3528a2bd`
- Authoritative price: none in the stored price preview
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['none']; not used=['derivative template opener was not copied', 'derivative marketing phrasing was not copied', 'derivative excerpt was not used as page copy']

### AFTER

- Exception status: `PRICE_NOT_FOUND`
- Editorial word count: 251
- Visible price: omitted
- Duration: 2 hours
- Meeting location: Outside 200 Broadway, at Broadway and Fulton Street, New York, NY 10038
- Schema and meta description: Two-hour private walking tour of New York's subway, in English, meeting at 200 Broadway. A local guide uses earpieces. The group rides the 6 train past closed stations, including City Hall Station, which are seen from the train and are not open to visitors.
- Offer: `null`
- Pricing rows: `[]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- This is a two-hour private walking tour of the New York subway, led in English. The group starts near City Hall in Lower Manhattan. A local guide leads, and each guest gets an earpiece so the guide can be heard from a short distance. Any group size is allowed. About 12 guests are recommended for each guide, and more guides are added when they are needed.
- Named stops include City Hall Park, the Municipal Building, Astor Place, and 14th Street at Union Square. The guide covers Chambers Street station, once nicknamed the Grand Central of Downtown, and what remains of the older Union Square station, including an art installation that everyday riders walk past. The group rides the 6 train past stations that are closed to the public, City Hall Station among them. Those stations are seen from the train, and the MTA does not open them to visitors. The tour also covers the first subway, described as built illegally at night, and Alfred Ely Beach's pneumatic transit, called the subway before the subway. Archival photographs that are not available to the public are used for the early history of the system.
- Guests are asked to bring comfortable shoes. Entering the subway takes one MetroCard swipe or one OMNY tap, and that fare is not included. The walking is described as easy, and most people can take part. Guests who need assistance are asked to email the operator before the day. Cancellation is free until 72 hours before the start.

Claims removed in the provenance audit:

- Earpieces were described as specifically for the sidewalk and the platform.
- A private departure was described as never being mixed into a public tour.
- Alfred Ely Beach's pneumatic transit was identified as the subway dug illegally at night.
- Comfortable shoes were described as the only item to bring.

## 595701 Scenic Float Tour

### BEFORE

- Path: `/destinations/wyoming/wilson/tours/scenic-float-tour-595701`
- Price on main: NONE
- Catalog rating field: None / review field None. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: Scenic Float Tour is a guided outdoor experience based in Wilson, Wyoming that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/wilsonfishingguides-595701`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 403 sha256 `f7ca317a0aef36faf33ed0b0ca1e2889324d5001957e1e6f32347ab0de3ba9d5`
- structured-description: HTTP 404 sha256 `53fc17db856bcb25c64252a41956d1ac37cdfc1558e46363d92699fe2013bd2b`
- item: HTTP 404 sha256 `53fc17db856bcb25c64252a41956d1ac37cdfc1558e46363d92699fe2013bd2b`
- price-preview: HTTP 400 sha256 `b6cc5f800b1160014c3438b0695fc7260be47ebc27615530c9074e5cd01ab243`
- Authoritative price: none in the stored price preview
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['none']; not used=['no unmerged derivative excerpt was stored for this route']

### AFTER

- Exception status: `SOURCE_NOT_FOUND`
- Editorial word count: 19
- Visible price: omitted
- Duration: omitted
- Meeting location: omitted
- Schema and meta description: No description, meeting place, or price was available for this Wilson scenic float. Those details are not added here.
- Offer: `null`
- Pricing rows: `[]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- No description, meeting place, or price was available for this Wilson scenic float. Those details are not added here.

Claims removed in the provenance audit:

- No FareHarbor content was stored, so duration, meeting place, inclusions, and price are omitted rather than filled from the catalog or an older draft.

## 694384 Self-Guided ADV Motorcycle Rental – KLR 650

### BEFORE

- Path: `/destinations/wyoming/cody/tours/self-guided-adv-motorcycle-rental-klr-650-694384`
- Price on main: NONE
- Catalog rating field: 3.4 / review field 61. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: Self-Guided ADV Motorcycle Rental – KLR 650 is a guided outdoor experience based in Cody, Wyoming that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/yellowstoneadvmoto-694384`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 403 sha256 `f7ca317a0aef36faf33ed0b0ca1e2889324d5001957e1e6f32347ab0de3ba9d5`
- structured-description: HTTP 200 sha256 `fb9eb77e6c752199ee5cd95fed87b583450e6c7e9aea90b2aecb87f86a7e2459`
- item: HTTP 200 sha256 `3ad5d427e78a0ac3c4372e28ef25aafdc267be5ffe6b4710396a37e0f6fc3e86`
- price-preview: HTTP 200 sha256 `de4c7234077854fe2076d0e09b3d008aff24ee3120fdaa6ffba2c938903bb00a`
- Authoritative price: none in the stored price preview
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Insurance note: what_is_not_included calls supplemental insurance optional; special_requirements and check-in require MBA insurance at $15 per day and a $1,000 damage hold. The page follows the requirement and keeps both amounts in the pricing notes.
- Derivative cross-check: usedAsAuthority=false; confirmed=['none']; not used=['derivative template opener was not copied', 'derivative excerpt was not used as page copy']

### AFTER

- Exception status: `PRICE_NOT_FOUND`
- Editorial word count: 316
- Visible price: omitted
- Duration: 1 day
- Meeting location: omitted
- Schema and meta description: One-day self-guided adventure-motorcycle rental in Cody for experienced riders, on a Kawasaki KLR 650 or 650S or a Yamaha Ténéré 700. Delivery is within the greater Cody area. No guide and no fuel are included, and no rental fare was published.
- Offer: `null`
- Pricing rows: `[]`
- Pricing notes: `["Supplemental insurance through MBA: $15 per day, purchased separately.", "Damage hold on the card at delivery: $1,000."]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- This is a one-day self-guided adventure-motorcycle rental for riders who already have on-road experience. It is not a guided tour, and it is not for beginners or first-time riders. The motorcycles are a Kawasaki KLR 650 or 650S, or a Yamaha Ténéré 700. Delivery and pickup are included in the greater Cody area. Riders must be 25 to 75 years old, and each motorcycle is limited to two people.
- The rental includes the motorcycle, a pre-ride inspection and setup, a basic orientation, route suggestions, and an emergency contact. Helmet, jacket, and gloves are included when sizes are available. Soft panniers, tools, a first-aid kit, spare tubes, and a GPS display go with the bike. Rain gear is on each motorcycle. Ankle-covering riding or hiking boots are required. Street shoes and sneakers are not. A guide is not included, and fuel is not included. Riders should also bring a full water bottle, a light layer, snacks, sunscreen, and long pants with a long-sleeve shirt if they are not wearing the provided gear.
- Two self-guided loops are suggested, each set up as a riding day of more than six hours. One goes toward Yellowstone. The other crosses the Beartooth Highway, where some sections can include mild dirt or gravel. Routes may reach about 8,000 to 11,000 feet, which can affect breathing, stamina, hydration, and physical performance. Riders need to be comfortable with cold mornings, wind, rain, and changing road surfaces. A valid motorcycle endorsement is required. International riders need a passport and a motorcycle license that can be read in English, or an International Driving Permit. Pregnant riders are discouraged. Riders must be able to mount, balance, and control a mid-size adventure bike for a long day. Supplemental insurance is purchased separately, and a damage hold is placed on the card at delivery.

Claims removed in the provenance audit:

- High elevation was described as the reason mornings feel cold. Cold mornings are a separate riding requirement in the source.
- The meeting point labeled TBD was not shown. The street address used is the location address.

## 646999 Grand Teton Scenic Float - Private Tour

### BEFORE

- Path: `/destinations/wyoming/moose/tours/grand-teton-scenic-float---private-tour-646999`
- Price on main: NONE
- Catalog rating field: None / review field None. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: Grand Teton Scenic Float - Private Tour is a guided outdoor experience based in Moose, Wyoming that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/solitudefloattrips-646999`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 200 sha256 `c1f265cfca0d302be1ba5f51c732c0b1fb7187e2d8f559d81ead0b96daa6b470`
- structured-description: HTTP 200 sha256 `a96e46478d4065f363d0893c73265980516537a247095f133ae951e4970359b2`
- item: HTTP 200 sha256 `d454ac6fe3e73bb7be75a825ec83fe86e1f70c01e33f35810f51d9ca3233ca1c`
- price-preview: HTTP 200 sha256 `7745e579dcb49784d2537ae4546efaec1e19311e0545e910580f31f4ae8a3430`
- Authoritative price: $1,200 USD (Private Raft)
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['duration 2.5 hours']; not used=['derivative template opener was not copied']

### AFTER

- Exception status: `OK`
- Editorial word count: 308
- Visible price: From $1,200
- Duration: 2.5 hours
- Meeting location: 1 Teton Park Road, Moose, WY 83012
- Schema and meta description: Private scenic float on the Snake River in Grand Teton National Park with Solitude Float Trips. The meeting point is 1 Teton Park Road in Moose. About two hours are spent on the water, and the outing is about two and a half hours including the shuttle. The departure is booked as a private raft.
- Offer: `{"type": "Offer", "price": "1200.00", "priceCurrency": "USD"}`
- Pricing rows: `[{"label": "Private Raft", "note": "Select the number of rafts", "amountLabel": "$1,200"}]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Solitude Float Trips runs this as a private scenic float on the Snake River in Grand Teton National Park. Guests should arrive 10 to 15 minutes before the stated launch and be ready and waiting. A 15-passenger van shuttles the group to the put-in, a ride of about 15 to 20 minutes. Time on the water is about two hours. With the shuttle, the outing is about two and a half hours. There are no stops and no restroom breaks on the river. The float has views of the Teton Range from the Snake in Jackson Hole. Moose, elk, and bald eagles may be seen.
- A guide is at the oars. The raft holds at most 12 guests. Each person wears a U.S. Coast Guard life jacket, which has to be fitted in order to take part. There is no shade cover and no solid back support. Guests sit on the tube of the raft. Boarding means three steps up onto a trailer used as a dock, about 16 feet of walking on that trailer, and a step down of about 18 to 20 inches into the raft. At the take-out, the walk is about five yards up an uneven bank to flat pavement, and the car is about 100 yards farther on. When the water is high, typically May through July, the landing has less room to maneuver.
- Children on this float need to be five or older and at least 50 pounds, so a life jacket can be fitted. Adult jackets for this stretch generally fit guests from about 90 to 260 pounds, with a chest measurement no greater than 56 inches. Some mobility is required: stepping into the van, climbing onto the trailer, and being able to self-rescue if that became necessary. The departure is booked as a private raft.

Claims removed in the provenance audit:

- The Teton Range was described as lining the river. The source describes views of the range.
- Wildlife sightings were described as never promised. The source lists moose, elk, and bald eagles as animals that may be seen.
- The life jacket was described as fitted before launch. The source requires a fitted jacket in order to take part.

## 612500 (Guided) 4-Hr E-Bike Tour of Vancouver Seawall - JW Marriott

### BEFORE

- Path: `/destinations/british-columbia/vancouver/tours/guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500`
- Price on main: NONE
- Catalog rating field: 4.8 / review field 122. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: (Guided) 4-Hr E-Bike Tour of Vancouver Seawall - JW Marriott is a guided outdoor experience based in Vancouver, British Columbia that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/hotelebikerentals-612500`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 403 sha256 `f7ca317a0aef36faf33ed0b0ca1e2889324d5001957e1e6f32347ab0de3ba9d5`
- structured-description: HTTP 404 sha256 `53fc17db856bcb25c64252a41956d1ac37cdfc1558e46363d92699fe2013bd2b`
- item: HTTP 404 sha256 `53fc17db856bcb25c64252a41956d1ac37cdfc1558e46363d92699fe2013bd2b`
- price-preview: HTTP 400 sha256 `b6cc5f800b1160014c3438b0695fc7260be47ebc27615530c9074e5cd01ab243`
- Authoritative price: none in the stored price preview
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['none']; not used=['derivative template opener was not copied', 'derivative marketing phrasing was not copied', 'derivative excerpt was not used as page copy']

### AFTER

- Exception status: `SOURCE_NOT_FOUND`
- Editorial word count: 20
- Visible price: omitted
- Duration: omitted
- Meeting location: omitted
- Schema and meta description: No description, meeting place, or price was available for this Vancouver e-bike tour. Those details are not added here.
- Offer: `null`
- Pricing rows: `[]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- No description, meeting place, or price was available for this Vancouver e-bike tour. Those details are not added here.

Claims removed in the provenance audit:

- Route details from the older unmerged draft, including Stanley Park, were not used because the harvest returned no content.

## 34849 Shared San Andreas Fault Jeep Tour

### BEFORE

- Path: `/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849`
- Price on main: NONE
- Catalog rating field: 4.3 / review field 180. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: Shared San Andreas Fault Jeep Tour is a guided outdoor experience based in Palm Springs, California that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/red-jeep-34849`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 200 sha256 `9295f826074aedf2b890e44362412cd916c68ad4374bf32082b22bbf533619ea`
- structured-description: HTTP 200 sha256 `edec8feb5f5bf915e0f28b4ab4438c811ed79cfd3db1dcfd7dbc23721dfa7c2a`
- item: HTTP 200 sha256 `170f71bb40cfcb670a157322b1f167c72c6cc1e905a84d65512d3a386ebc4a43`
- price-preview: HTTP 200 sha256 `930a98600b0df1e1b54e8acbe85dedaf29589d6abd5d78ea233118bcc4f965c1`
- Authoritative price: $183.75 USD (Adult (18 years and up))
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['none']; not used=['no unmerged derivative excerpt was stored for this route']

### AFTER

- Exception status: `OK`
- Editorial word count: 312
- Visible price: From $183.75
- Duration: 3 hours
- Meeting location: Metate Ranch, 38635 Monroe Street, Indio, CA 92203
- Schema and meta description: Shared three-hour naturalist-guided Jeep ride into the San Andreas Fault zone, meeting at Metate Ranch, 38635 Monroe Street, Indio. The vehicle is an open-air Jeep Scrambler. The drive goes about one mile into the fault zone, with two to seven guests per Jeep.
- Offer: `{"type": "Offer", "price": "183.75", "priceCurrency": "USD"}`
- Pricing rows: `[{"label": "Adult (18 years and up)", "note": "Aged 18 and up", "amountLabel": "$183.75"}, {"label": "Child (Aged 17 and under)", "note": "A parent must accompany children. Booster seats are not provided.", "amountLabel": "$149.62"}]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Red Jeep Tours runs this as a shared, naturalist-guided drive into the San Andreas Fault zone near Indio. More than one party may share a Jeep. Guests meet at Metate Ranch in the Indio Hills, where the Pacific and North American plates meet. Guests should arrive about 10 minutes before departure. If the guide has not arrived by five minutes before the start, the office number is (760) 324-5337, extension 1. The tour is scheduled for three hours.
- The vehicle is an open-air Jeep Scrambler, the CJ-8, with a removable canvas shade top. Each Jeep takes at least two guests and no more than seven. A single rider is asked to call before booking. The minimum age is five. The drive goes about one mile into the fault zone. The guide covers plants, animals, geology, and seismology in the cuts and canyons, then leads a walk in a slot canyon. One stop is a California fan palm oasis sustained by groundwater captured along the fault. Another is a recreated Cahuilla village with interpretive displays on the archaeological site of Paltewet. An optional short walk climbs to the grinding stone above the village. Guests who are able to enter and leave the Jeep can ask ahead about a limited-mobility arrangement.
- Bottled water, granola snacks, admission, and taxes are included. Guide gratuities are not. Shoes need to be closed at the toe and have good traction. Sandals, heels, and shoes without grip are not allowed. Seat belts stay on while the Jeep is moving. Portable toilets are on the property, and the Jeeps stop for breaks. Blankets are on the Jeeps for cooler mornings from November through March. Cancellation without a penalty is available until 48 hours before departure. On the child ticket, children are 17 and under, a parent must accompany them, and booster seats are not provided.

Claims removed in the provenance audit:

- A sentence about the listing headline being direct was removed as audit commentary.
- Groundwater at the palm oasis was described as trapped. The source says captured by the fault.
- Footwear was described as a tread sole. The source requires closed-toe shoes with good traction.

## 333279 Date Night Neon Glow Clear Kayak or Paddleboard & Champagne Orlando

### BEFORE

- Path: `/destinations/florida/orlando/tours/date-night-neon-glow-clear-kayak-or-paddleboard-and-champagne-orlando-333279`
- Price on main: NONE
- Catalog rating field: 4.6 / review field 359. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: Date Night Neon Glow Clear Kayak or Paddleboard & Champagne Orlando is a guided outdoor experience based in Orlando, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.
- Engine 2 template copy: none

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/epicpaddleadventures-333279`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 200 sha256 `eca0511cf67204240edbf9698c8367d451c654491006505fd583439680f967e1`
- structured-description: HTTP 200 sha256 `e2ca3b45f58e2110266d86e61f388b45e088a541878666a6f26f3bb535982a7a`
- item: HTTP 200 sha256 `56cdbfed42aed76ca1d2d169ff80ad09ae40b13530f7e5ca08d69175c23e04bc`
- price-preview: HTTP 200 sha256 `c107b549f9b931c1ac706e2055ad090f0aea4c4459b8c712175f3f8665da1217`
- Authoritative price: $80 USD (Adult Paddle Board)
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['duration 2 hour experience']; not used=['derivative template opener was not copied', 'derivative marketing phrasing was not copied']

### AFTER

- Exception status: `OK`
- Editorial word count: 275
- Visible price: From $80
- Duration: 2 hour experience
- Meeting location: Epic Paddle Adventures, 1600 North Orange Avenue, Orlando, FL 32804
- Schema and meta description: Two-hour guided night paddle in Orlando on a clear kayak or paddleboard with neon light underneath. Guests meet at 1600 North Orange Avenue. A life vest is included, champagne is included for guests 21 and older, and photos are sent afterward.
- Offer: `{"type": "Offer", "price": "80.00", "priceCurrency": "USD"}`
- Pricing rows: `[{"label": "Clear 2-Person Kayak", "note": "HOLDS 2 PEOPLE - Each Guest Must Weigh under 200lbs (<400lbs total)", "amountLabel": "$160"}, {"label": "Clear Single Kayak", "note": "Weight Limit 325 lbs", "amountLabel": "$80"}, {"label": "Adult Paddle Board", "note": "15 years and over, Requires Valid Drivers License or Permit", "amountLabel": "$80"}]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- This is a two-hour guided night paddle in Orlando on a clear kayak or a paddleboard, with neon light under the hull. The group size is 40. Check-in is a safety briefing and a gear fitting. The group launches as the evening light fades, paddles with the guide, and returns to shore. No paddling experience is required. The guide keeps an easy pace, with time for photos on the water.
- The booking choice is a clear single kayak, a clear two-person kayak, or an adult paddleboard. Neon under-glow, a paddle, safety equipment, and a U.S. Coast Guard life vest are included. Photos are sent after the outing. Champagne is included for guests 21 and older, and a valid ID is required for it. Dry storage is recommended for a phone or camera. Gratuities and any extra food or drinks are not included. Clothing to wear is athletic wear, shorts, or a light layer, along with water shoes that cover the toes or sandals that have straps.
- The paddle takes place at night and may not suit guests who are uncomfortable on the water after dark. It is not suitable when a mobility limitation would prevent safe boarding or paddling. Guests need to get in and out of the craft with little help. On the two-person kayak, each person must weigh under 200 pounds, and the pair must be under 400 pounds combined. The single kayak lists a weight limit of 325 pounds. The paddleboard is for ages 15 and older and requires a driver's license or a permit. A refund or a credit is available with 24 hours' notice.

Claims removed in the provenance audit:

- The photo ID for champagne was placed in the dry bag. Dry storage is recommended for a phone or camera, not for the ID.
- The return was described as the same shore. The itinerary says the group returns to shore.

## 193220 La Bufadora Tour in Baja California

### BEFORE

- Path: `/destinations/california/ensenada/tours/la-bufadora-tour-in-baja-california-193220`
- Price on main: NONE
- Catalog rating field: None / review field None. Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.
- Legacy copy: none
- Engine 2 template copy: La Bufadora Tour in Baja California with The Wine Route is designed for travelers who want more than a quick photo stop in Ensenada. This experience combines local storytelling, practical route planning, and time to explore the landscapes that define Ensenada, California. Expect a relaxed but well-paced outing where your guide helps you understand what makes each stop unique, from geology and neighborhood history to small details you might miss on your own. The pace works well for first-time visitors and return travelers who want a dependable, professionally operated day in the desert. Throughout the tour, your guide can share tips on timing, weather, and local recommendations so the rest of your trip in Ensenada is even easier to plan. The Wine Route keeps the logistics simple, so you can focus on the experience itself and enjoy every segment with confidence. If you are comparing options, this is a strong fit when you want a la bufadora tour in baja california experience with reliable operations and memorable views. It is a polished way to enjoy la bufadora tour in baja california moments while making the most of your time in Ensenada.

### SOURCE

- Artifacts: `data/fareharbor-lead-to-gold/proof-set/wineroutebaja-193220`
- Fetched at: 2026-09-29T17:24:06.494452+00:00
- content: HTTP 200 sha256 `b84de4fa48009ea4e7d6e21f9f222731236d91cd0608ca56d0354b644971079a`
- structured-description: HTTP 200 sha256 `32eaeac07bd20be4c8d2a234157fbb5dd30012fabbab19084f17433655731533`
- item: HTTP 200 sha256 `5df15c89de2bc3c6af139fbe709a3a7b7ca0a664fdd239fcb93f50483f75d21e`
- price-preview: HTTP 200 sha256 `a7a1fbd6d94326392c1131420a73190b0b90fc693012c043b2ec9ff1ae1c35af`
- Authoritative price: $40 USD (Adult)
- Rating provenance: No numeric rating or review count is present in the stored FareHarbor content, structured-description, item, or price-preview payloads. Catalog quality_score and availability_count were not used. AggregateRating is omitted.
- Derivative cross-check: usedAsAuthority=false; confirmed=['unmerged price cache 40.0 USD matches harvest basis']; not used=['derivative template opener was not copied', 'derivative marketing phrasing was not copied']

### AFTER

- Exception status: `OK`
- Editorial word count: 238
- Visible price: From $40
- Duration: 4 hours
- Meeting location: Miguel Aleman Avenue 512, Colonia Ampliacion Moderna, Ensenada, Mexico 22879
- Schema and meta description: Guided four-hour outing from Ensenada to the La Bufadora blowhole on Punta Banda, with hotel pickup and an English- and Spanish-speaking guide. The drive is about 24 miles. Bottled water and snacks are included. Food and drinks at the market are extra.
- Offer: `{"type": "Offer", "price": "40.00", "priceCurrency": "USD"}`
- Pricing rows: `[{"label": "Adult", "note": "Ages 5+", "amountLabel": "$40"}, {"label": "Private Tour", "note": "Ages 5+", "amountLabel": "$55"}, {"label": "Infant", "note": "", "amountLabel": "Free"}]`
- Pricing notes: `[]`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- This outing runs for four hours and takes a guided group from Ensenada out to La Bufadora, the blowhole on the Punta Banda peninsula. Pickup from Ensenada hotels is midmorning. The drive is about 24 miles, or 39 kilometers, with coastal scenery on the way. A guide who speaks English and Spanish goes with the group. Bottled water and snacks are included. Food, other drinks, and gratuities are not.
- After the drive, the group walks about three blocks through the crafts market to the blowhole. Waves force water up through a sea cave about every one to two minutes. Spouts can rise more than 100 feet, and the guide explains the phenomenon. There is then free time to browse the sidewalk market or eat at the restaurants next to it, both at the guest's own expense. The guide meets the group again at 1:00 p.m. for the return, with hotel drop-off scheduled by 2:00 p.m.
- Adult tickets on the shared tour are for ages 5 and older, and children must be with an adult. Infants under 4 are a separate ticket category. A private tour is also sold. The group size is 50, and the maximum age is 99. U.S. dollars are widely accepted and ATMs are scarce, so the useful things to carry are cash, a hat, walking shoes, and sunglasses. In summer, sunscreen is one of the things to bring.

Claims removed in the provenance audit:

- The vehicle was called a van. The source says transport, not a van.
- The maximum age was described as a field on a form.
- U.S. dollars were described as accepted at the market. The source says they are widely accepted, and that few ATMs are available.

