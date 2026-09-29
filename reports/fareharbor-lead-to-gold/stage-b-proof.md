# Stage B FareHarbor proof set

Scope is the 10 Stage A representative products. Runtime pages read the generated module in `src/data/fareharborLeadToGoldProof.generated.ts`. They do not call FareHarbor.

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
- Visible price: Prices starting at $59.95
- Offer: `{"type": "Offer", "price": "59.95", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Country Boy Gold Mine Tour is booked with Country Boy Mine. The operator lists the duration as 1 hour. The listed meeting address is 0542 French Gulch Rd Breckenridge, CO US 80424.
- Included items listed by the operator: Country Boy Gold Mine Tour.
- Additional facts stated by the operator: over 1,000 feet into the mountain, and gold pan in Eureka Creek.
- The operator description states: Venture over 1,000 feet into the mountain.
- The stored price preview lists Adult (13+) at $59.95 USD on the stored departure starting 2026-09-30T09:00:00. Other listed prices: Child at $39.95. Listed at $0 on that departure: Mine Tour Child (3-years old and under) - FREE.

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
- Visible price: Prices starting at $119
- Offer: `{"type": "Offer", "price": "119.00", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Haleakala Downhill Self-Guided Bike Tour is booked with Maui Sunriders Bike Company. The operator lists the duration as 4-5 hours. The listed meeting address is 71 Baldwin Ave. Suite D3 Paia, HI US 96779.
- The operator lists minimum age 15.
- Included items listed by the operator: Front-suspension mountain bike with disc brakes, Downhill Bike full-face helmet (or lightweight helmet option), Rain and wind gear, Bike Gloves, Backpack with lock and map, Narrated van tour to the starting point, and Roadside assistance during the ride.
- Items listed as not included: Meals and beverages (available for purchase along the route), Personal expenses or shopping, and Tips for guides (optional).
- Listed itinerary: Check-In at Paia Shop (8:45 AM), Scenic Van Tour to 6,500 Feet, Begin Self-Guided Bike Ride, Van Shuttle Through Kula (Highway Bypass), For safety, Maui County law requires all bike tours to bypass a short stretch of Kula Highway. Riders will be transported in the van past this section before continuing their ride, and Continue Riding Through Makawao.
- Listed restrictions: Minimum age: 15 years - Maximum weight: 280 lbs - Not suitable for beginner riders - Not suitable for pregnant women - Not suitable for individuals with impaired mobility.
- Listed items to bring: Light layers (cooler temperatures at higher elevation), Closed-toe shoes, Sunglasses, Sunscreen, and Cash or card for food and shopping.
- The stored price preview lists Adult (18+) at $119 USD on the stored departure starting 2026-09-29T08:45:00. Other listed prices: Youth at $119.

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
- Visible price: omitted
- Offer: `null`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- NYC's Underground Subway Tour - Private Tour is booked with Untapped New York. The operator lists the duration as 2 hours. The listed meeting address is 200 Broadway New York, NY US 10038.
- The operator lists group size Any group size - 12 guests per guide recommended, as many guides as needed.
- Included items listed by the operator: Walking tour in English, led by a local New Yorker, and Ear pieces provided to each guests, ensuring everyone hears the guide perfectly, even from a distance.
- Items listed as not included: Guests will need one MetroCard swipe, or OMNY tap, to enter the subway.
- Listed itinerary: City Hall Park, The Municipal Building, Astor Place, and 14th St. Union Square.
- Listed restrictions: This tour is easy and most people can participate.
- Listed items to bring: Please bring comfortable shoes.
- Cancellation terms listed by the operator: Free cancellation up to 72 hours before the tour starts.
- The stored price-preview response did not include a bookable price for this item. No from-price is shown.

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
- Visible price: omitted
- Offer: `null`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Authoritative FareHarbor content and price data were not available for Scenic Float Tour. The stored harvest returned content HTTP 403, structured-description HTTP 404, item HTTP 404, and price-preview HTTP 400. This page does not state a price, review count, duration, meeting point, or inclusions.

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
- Derivative cross-check: usedAsAuthority=false; confirmed=['none']; not used=['derivative template opener was not copied', 'derivative excerpt was not used as page copy']

### AFTER

- Exception status: `PRICE_NOT_FOUND`
- Visible price: omitted
- Offer: `null`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Self-Guided ADV Motorcycle Rental – KLR 650 is booked with Yellowstone Adventure Moto. The operator lists the duration as 1 day. The listed meeting address is 1108 14th Street Cody, WY US 82414.
- The operator lists minimum age 25, maximum age 75, group size Maximum 2 riders per motorcycle rental.
- Included items listed by the operator: Premium adventure motorcycle rental (Kawasaki KLR 650 / 650S or Yamaha Ténéré 700), Complimentary delivery and pickup within the greater Cody, WY area, Most riding gear included (helmet, jacket, gloves) - limited sizes and quantities available, Riding or hiking boots (ankle-covering footwear required; no street shoes or sneakers), Pre-ride inspection and setup, Local area orientation and riding recommendations, Soft Pannier side bags, and Tools, first aid kit and extra tubes.
- Items listed as not included: Optional supplemental insurance: $15 per day (through MBA), and Motorcycle boots: limited sizes and quantities available; guests are strongly encouraged to bring their own ankle-covering riding or hiking boots if proper fit cannot be provided.
- Listed itinerary: Pickup & Orientation - Cody, WY, Meet in Cody for motorcycle delivery, paperwork, and a safety briefing. Bike setup, fit check, and local riding overview included, Recommended Loop Selection, Ride independently with flexibility for stops, photos, meals, and fuel. Routes are designed for experienced riders who want freedom without a rigid schedule, Return & Pickup, and Motorcycle pickup at the agreed location in Cody or surrounding area. Post-ride check and wrap-up.
- Listed restrictions: This experience is not suitable for beginners or first-time motorcycle riders, Riders must have prior on-road motorcycle experience, Participants must be physically able to safely mount, dismount, balance, and control a mid-to-large displacement adventure motorcycle for extended periods, and Riders must be comfortable riding in changing weather conditions, including cold mornings, wind, rain, and varying road surfaces.
- Listed items to bring: Full water bottle or hydration pack, Sunglasses, Light jacket or extra layer (weather and elevation can change quickly) Rain Gear is in each Rental Bike, Snacks (energy bars, trail snacks, etc.), and Camera or phone for photos.
- The stored price-preview response did not include a bookable price for this item. No from-price is shown.

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
- Visible price: Prices starting at $1,200
- Offer: `{"type": "Offer", "price": "1200.00", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Grand Teton Scenic Float - Private Tour is booked with Solitude Float Trips. The operator lists the duration as 2.5 hours. The listed meeting address is 1 Teton Park Road, Moose, WY 83012.
- The operator lists minimum age 5, maximum age 99.
- Included items listed by the operator: central meeting point, transportation to river put-in, life jacket for each person (USCG certified), professional guide, and small group tour: 12 guests per boat, maximum.
- Items listed as not included: layered clothing (for warmth), refillable water bottle, soft-soled shoes, sunglasses / hat, sunscreen, and personal items (lip balm, medications like epi, inhaler, etc.).
- Listed restrictions: This will ensure that they are properly fitted for a personal flotation device (PFD or life jacket), While a scenic float is not necessarily an athletic activity per se, some agility and mobility is required, Please note there is no cover on the raft for shade or solid back support, and The landing area changes depending on the time of year, with there being little room to maneuver when the water is high (typically May - July).
- The stored price preview lists Private Raft (Select the number of rafts) at $1,200 USD on the stored departure starting 2027-05-15T09:30:00. Listed at $0 on that departure: Adult, Child.

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
- Visible price: omitted
- Offer: `null`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Authoritative FareHarbor content and price data were not available for (Guided) 4-Hr E-Bike Tour of Vancouver Seawall - JW Marriott. The stored harvest returned content HTTP 403, structured-description HTTP 404, item HTTP 404, and price-preview HTTP 400. This page does not state a price, review count, duration, meeting point, or inclusions.

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
- Visible price: Prices starting at $183.75
- Offer: `{"type": "Offer", "price": "183.75", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Shared San Andreas Fault Jeep Tour is booked with Desert Adventures Red Jeep Tours. The operator lists the duration as 3 hours. The listed meeting address is Metate Ranch - 38635 Monroe St, Indio, CA 92203.
- The operator lists minimum age 5, group size Minimum 2 / Maximum 7 guests per Jeep (Single riders, please call to book).
- Cancellation terms listed by the operator: Cancel up to 48 hours before departure without penalty. No refund or credit for cancellation within 48 hours.
- Additional facts stated by the operator: Jeep Scrambler (CJ-8), up to 7 guests per Jeep, admission fees and taxes included, bottled water, granola snacks, and one mile deep into the heart of the San Andreas Fault zone.
- The stored price preview lists Adult (18 years and up) (Aged 18 and up) at $183.75 USD on the stored departure starting 2026-09-30T08:00:00. Other listed prices: Child (Aged 17 and under) at $149.62.

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
- Visible price: Prices starting at $80
- Offer: `{"type": "Offer", "price": "80.00", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- Date Night Neon Glow Clear Kayak or Paddleboard & Champagne Orlando is booked with Epic Paddle Adventures. The operator lists the duration as 2 hour experience. The listed meeting address is 1600 North Orange Avenue Orlando, FL US 32804.
- The operator lists group size 40.
- Included items listed by the operator: Clear kayak or paddleboard (selected at booking), Neon under-glow lighting setup, Complimentary champagne (21+), USCG-approved life vests, Paddle and safety equipment, Guided experience, and Complimentary photos provided after the tour.
- Items listed as not included: Additional food or beverages.
- Listed itinerary: Sunset Launch - Enter the water as evening light fades, Neon Glow Paddle - Relaxed guided paddle with champagne and photo moments, and Return to Shore - Easy paddle back under the city lights.
- Listed items to bring: Athletic wear, shorts, or light layers, Closed-toe water shoes or sandals with straps, A valid ID (21+ for champagne), and Phone or camera (dry storage recommended).
- Cancellation terms listed by the operator: Refund or credit available with 24 hour notice.
- The stored price preview lists Adult Paddle Board (15 years and over, Requires Valid Drivers License or Permit) at $80 USD on the stored departure starting 2026-09-29T20:00:00. Other listed prices: Clear 2-Person Kayak at $160; Clear Single Kayak at $80.

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
- Visible price: Prices starting at $40
- Offer: `{"type": "Offer", "price": "40.00", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}`
- AggregateRating: omitted
- Validation: pass

Rewritten copy:

- La Bufadora Tour in Baja California is booked with The Wine Route. The operator lists the duration as 4 hours. The listed meeting address is Miguel Aleman Ave | 512 Colonia Ampliacion Moderna Ensenada, Ensenada Municipality MX 22879.
- The operator lists maximum age 99, group size 50.
- Included items listed by the operator: Hotel pickup and drop-off, Transport, Local expert English/Spanish guide, Bottled water, and Snacks.
- Items listed as not included: Food and drinks, and Gratuities.
- Listed itinerary: Midmorning pickup in Ensenada and scenic 24-mile (39 km) drive to Punta Banda peninsula, Observe La Bufadora as waves force water up through the sea cave every 1-2 minutes, Free time to browse the sidewalk crafts market and visit nearby restaurants (own expense), and Meet the guide at 1:00 pm to return to hotels by 2:00 pm.
- Listed restrictions: Minimum drinking age is 18 years, Children must be accompanied by an adult, and Tour recommended for all ages.
- Listed items to bring: Cash (U.S. dollars widely accepted; few ATMs available), Hat or cap, Comfortable walking shoes, Sunscreen in summer, and Sunglasses.
- Additional facts stated by the operator: Bottled water.
- The stored price preview lists Adult (Ages 5+) at $40 USD on the stored departure starting 2026-10-01T10:00:00. Other listed prices: Private Tour at $55. Listed at $0 on that departure: Infant.

