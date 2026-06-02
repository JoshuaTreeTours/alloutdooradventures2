# Strict Hiking Category Filter Audit

## Root cause

Bike products originally reached `/tours/hiking/us/california` because CSV import and category-page filtering treated any secondary `hiking` activity slug as enough to render on Hiking pages. A second pass showed the same loose rule still admitted other non-hiking products — food, history, ghost, walking, boat, kayak, horseback/trail ride, yoga, rental, and general outdoor products — when generated data carried weak `hiking` categories or activity slugs.

## Updated rule

The Hiking category filter is now strict:

- Include governed Engine6 products only when their primary governed category is `hiking-tour` / Hiking.
- Include non-Engine6 products only when they have an explicit Hiking label/badge or a title-level `hike` / `hiking` product activity signal.
- Exclude products with non-hiking activity signals such as bike/eBike/mountain-bike, boat, kayak, paddle, horseback/trail ride, food, history, ghost, yoga, rental, cooking, firearms/permits, and similar non-hiking categories.
- Do not include products merely because generated metadata or descriptions contain broad outdoorsy words such as trail, mountain, park, outdoor, scenery, walking, or nature.

## Removed non-hiking products from `/tours/hiking/us/california`

Removed count: 48

- Bike The Bridge & 1 Day Hop On Hop Off Combo
- Golden Gate Bridge Electric Bike Guided Tour
- Golden Gate Bridge to Sausalito Bike Tour
- Golden Gate Bridge Guided Tour
- The Golden Gate Bridge Bike Tour
- Alcatraz & the Golden Gate Bridge to Sausalito Tour
- Golden Gate Bridge Bike and Brew Tour
- Private Golden Gate Bridge to Sausalito
- Bike The Bridge & Muir Woods Tour Combo
- Goat Mountain & 007 Guided Ride – Intermediate
- Big Sandy Guided Ride & Hike – Beginner
- Custom Guided Mountain Bike Ride – All Levels
- Big Sandy eBike Ride & Waterfall Hike – Beginner
- 007 3rd – 1st Guided Mountain Bike Ride – Advanced
- Golden Gate Bridge Bike Tour
- E-Mountain Bike Tours
- Golden Gate Bridge Electric Bike Tour
- Sip, Savor and Sea - La Jolla
- Pizza, Pasta and Piazzas
- Vino! Vino! Little Italy Wine Tour
- Brothels, Bites and Booze
- San Diego Beach Yoga Hiking Tour
- San Diego: Embarcadero Waterfront Ghost Tour
- Art of Balboa Park Walking Tour
- Blue Bridge Kayak Tour
- Private Duffy Coronado Bay Bridge, City Skyline, Aircraft Carrier Tour • 2 Hours
- San Diego: LGBTQ+ History Tour
- Trail Rides
- San Diego: Embarcadero History & Photo Tour
- 5 Day Yoga & Hiking Retreat in San Diego
- Tarot Reading
- Pizza and Gelato Tour
- The Original Downtown Food Tour (Mini)
- Wine & Walking Tour Santa Barbara
- Desert Nature Walk + Soundbath + Meditation + Cacao Ceremony
- Sunset Trail Ride
- Morning Trail Ride
- 17' Boston Whaler
- 13 foot Boston Whaler
- SWFT Boston Cooking Classes
- Boston Whaler
- Midtown Walking Food Tour
- Historic Old Sacramento Walking Tour
- SWFT Washington DC Cooking Classes
- Utah/Florida Concealed Firearms Permit
- Jet Ski Florida Special!
- Palm Canyon Tour
- San Andreas Fault Jeep Tour (Greater Palm Springs)

## Final remaining hiking products

Rendered count: 16

- Laguna Wilderness Hiking — badge: Hiking
- San Diego Tours: Torrey Pines Hiking + Picnic Experience (Private) — badge: Hiking
- Meditation and Mountain Hike Tour 8:00 AM — badge: Hiking
- Mountain Hike Tour (meditation optional) 10:30 AM — badge: Hiking
- Potato Chip Rock Hiking — badge: Hiking
- Photography Hike — badge: Hiking
- Sunset Hike, Dinner, & Night Sky Presentation — badge: Hiking
- Hike & Climb — badge: Hiking
- Private Morning Hike — badge: Hiking
- Private Sunset Hike — badge: Hiking
- Yosemite 3-Day Camping Adventure from San Francisco — governed Engine6 Hiking Tour
- Griffith Observatory Hike: Guided Tour through Griffith Park — governed Engine6 Hiking Tour
- Mountain Sunrise Hike and Meditation in Palm Springs — governed Engine6 Hiking Tour
- Full Day Hike in Joshua Tree National Park — governed Engine6 Hiking Tour
- Joshua Tree National Park Half-Day Small-Group Guided Tour — governed Engine6 Hiking Tour
- Palm Springs Indian Canyons Bike and Hike — governed Engine6 Hiking Tour

## Validation

A local rendered-count validation of `/tours/hiking/us/california` using the same route predicate reported:

- Previous loose activity-slug selection: 64 products
- Strict rendered selection: 16 products
- Removed non-hiking products: 48
- Remaining products without a visible Hiking badge or governed Engine6 Hiking Tour classification: 0
