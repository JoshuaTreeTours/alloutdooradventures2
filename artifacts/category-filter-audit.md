# Category Assignment and Hiking Filter Audit

## Root cause

Bike products reached `/tours/hiking/us/california` through two paths:

1. Legacy CSV import inferred `hiking` for cycling records when broad scenic keywords such as `trail`, `mountain`, or `canyon` appeared in bike product titles/tags. That produced cycling-primary tours with `activitySlugs: ["cycling", "hiking"]`.
2. The activity state route filtered category pages with a simple `activitySlugs.includes(activity.slug)` check, so any cycling-primary product that carried a secondary `hiking` slug rendered on Hiking category pages.

Engine6-specific audit found category labels such as `Bike Tours`, `E-Bike Tours`, `Mountain Bike Tours`, `Hiking Tours`, and `Walking Tours` were normalized literally to plural slugs (for example, `e-bike-tours`) rather than canonical activity slugs. That did not create the reported California hiking leakage by itself, but it made bike/e-bike classification inconsistent across Engine6 products.

## Engine6 tagged product counts after normalization

- Total Engine6 listing products audited: 130
- Hiking / hike tagged: 10
- Bike / bicycle / cycling tagged: 15
- eBike tagged: 8
- Mountain bike tagged: 0
- Walking tagged: 1

## Engine6 products reviewed in requested categories

| Product code                     | Title                                                                            | Primary category | Categories                                                      | Activity slugs              | Notes                                                              |
| -------------------------------- | -------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| 63657P1                          | Santa Barbara Vineyard to Table Taste Tour by E-Bike                             | bike-tour        | bike-tour, food-and-drink-tour                                  | cycling, bike-tours         | Excluded from Hiking                                               |
| 7079RREBIKE                      | Red Rock Canyon Electric Bike Tour                                               | bike-tour        | bike-tour, outdoor-activities, nature-and-wildlife-tours        | cycling, bike-tours         | Canonicalized from Bike Tours                                      |
| 354611P1                         | Historical Railroad Trail eBike Tour                                             | bike-tour        | bike-tour, outdoor-activities, half-day-tours, historical-tours | cycling, bike-tours         | Canonicalized from Bike Tours                                      |
| 5615689P4                        | Arts District E Bike Tour                                                        | bike-tour        | bike-tour, city-tours                                           | cycling, bike-tours         | Canonicalized eBike / mountain-bike labels to bike-tour            |
| 6007GGB                          | Golden Gate Bridge Guided Bicycle or E-Bike Tour from San Francisco to Sausalito | bike-tour        | bike-tour, outdoor-activities                                   | cycling, bike-tours         | Excluded from Hiking                                               |
| 6007P5                           | Golden Gate Bridge Guided Bicycle Tour with Lunch at Local Hotspot               | bike-tour        | bike-tour, outdoor-activities, food-and-drink-tour              | cycling, bike-tours         | Excluded from Hiking                                               |
| 3454P57                          | Golden Gate Bridge Bike Tour with Muir Woods and Sausalito Tour                  | bike-tour        | bike-tour, outdoor-activities, day-trip                         | cycling, bike-tours         | Excluded from Hiking                                               |
| 53474P8                          | Anchorage Greenbelt Bike Tour                                                    | bike-tour        | bike-tour, wildlife-tour                                        | cycling, bike-tours         | Excluded from Hiking                                               |
| 233384P2                         | Brooklyn Bridge Waterfront Guided Bike Tour                                      | bike-tour        | bike-tour, sightseeing-tour                                     | cycling, bike-tours         | Excluded from Hiking                                               |
| 3156P13                          | Classic Manhattan Electric Bike Tour                                             | bike-tour        | bike-tour                                                       | cycling, bike-tours         | Excluded from Hiking                                               |
| 191303P1                         | San Diego Electric Bike Tour of Coronado (Small-Group Beach Cruiser Experience)  | bike-tour        | bike-tour                                                       | cycling, bike-tours         | Canonicalized from Bike Tours / E-Bike Tours; excluded from Hiking |
| 383300P6                         | 90 min Electric Bike Tour of Fort Lauderdale (min 2)                             | bike-tour        | bike-tour, sightseeing-tours                                    | cycling, bike-tours         | Canonicalized from E-Bike Tours                                    |
| 26095P3                          | Lauterbrunnen and Trummelbach Waterfalls E-bike Tour Swiss Picnic                | bike-tour        | bike-tour                                                       | cycling, bike-tours         | Excluded from Hiking                                               |
| fh-central-park-bike-tours-16628 | Central Park Bike Tours                                                          | bike-tour        | bike-tour                                                       | cycling, bike-tours         | Excluded from Hiking                                               |
| 3454YE3D                         | Yosemite 3-Day Camping Adventure from San Francisco                              | hiking-tour      | hiking-tour, food-and-drink-tour                                | hiking                      | Included in Hiking                                                 |
| 5569HIKE                         | Griffith Observatory Hike: Guided Tour through Griffith Park                     | hiking-tour      | hiking-tour                                                     | hiking                      | Included in Hiking                                                 |
| 100569P5                         | Glacier Hike on Matanuska Glacier - Best Vacation Value                          | hiking-tour      | hiking-tour, wildlife-tour                                      | hiking                      | Included in Hiking                                                 |
| 327321P1                         | Mountain Sunrise Hike and Meditation in Palm Springs                             | hiking-tour      | hiking-tour, outdoor-activities                                 | hiking                      | Included in Hiking                                                 |
| 237571P2                         | Full Day Hike in Joshua Tree National Park                                       | hiking-tour      | hiking-tour                                                     | hiking                      | Included in Hiking                                                 |
| 335698P7                         | Joshua Tree National Park Half-Day Small-Group Guided Tour                       | hiking-tour      | hiking-tour, wildlife-tour                                      | hiking                      | Included in Hiking                                                 |
| 3351P15                          | Palm Springs Indian Canyons Bike and Hike                                        | hiking-tour      | hiking-tour, bike-tour                                          | cycling, bike-tours, hiking | Included because Hiking is primary                                 |
| 474891P3                         | New York City Private Walking Tour with a Local                                  | walking-tour     | walking-tour, private-tour                                      | adventure                   | Included on Hiking-style pages as walking experience               |
| 60136P1                          | Antelope Canyon Horseshoe Bend Day Tour from Las Vegas                           | day-trip         | day-trip, hiking-tour                                           | hiking                      | Included by hiking signal; not a bike product                      |
| 2335P1                           | San Andreas Fault Jeep Tour (Greater Palm Springs)                               | off-road-tour    | off-road-tour, hiking-tour                                      | hiking                      | Included by hiking signal; not a bike product                      |
| 428219P6                         | Chinatown and Little Italy Food Tour \| Tasty Tours NYC                          | hiking-tour      | hiking-tour, food-and-drink-tour                                | hiking                      | Existing primary category is Hiking; retained by current rule      |

## California Hiking page validation

Route: `/tours/hiking/us/california`

Before filtering fix:

- Total products selected by old route predicate: 64
- Pure bicycle products selected: 17

After filtering fix:

- Total products selected by new route predicate: 47
- Pure bicycle products selected: 0

Excluded pure bicycle products:

- bay-city-bike-262797 — Bike The Bridge & 1 Day Hop On Hop Off Combo
- blazing-saddles-bike-rentals-and-tours---san-francisco-78858 — Golden Gate Bridge Electric Bike Guided Tour
- bay-city-bike-10199 — Golden Gate Bridge to Sausalito Bike Tour
- blazing-saddles-bike-rentals-and-tours---san-francisco-78855 — Golden Gate Bridge Guided Tour
- unlimited-biking-138644 — The Golden Gate Bridge Bike Tour
- bay-city-bike-81664 — Alcatraz & the Golden Gate Bridge to Sausalito Tour
- blazing-saddles-bike-rentals-and-tours---san-francisco-110469 — Golden Gate Bridge Bike and Brew Tour
- bay-city-bike-333235 — Private Golden Gate Bridge to Sausalito
- bay-city-bike-165139 — Bike The Bridge & Muir Woods Tour Combo
- pedal-forward-bikes-629558 — Goat Mountain & 007 Guided Ride – Intermediate
- pedal-forward-bikes-629569 — Big Sandy Guided Ride & Hike – Beginner
- pedal-forward-bikes-629570 — Custom Guided Mountain Bike Ride – All Levels
- pedal-forward-bikes-629572 — Big Sandy eBike Ride & Waterfall Hike – Beginner
- pedal-forward-bikes-629579 — 007 3rd – 1st Guided Mountain Bike Ride – Advanced
- bike-and-roll-san-francisco-638088 — Golden Gate Bridge Bike Tour
- calistoga-bikeshop-542598 — E-Mountain Bike Tours
- fog-city-bike-tours-901002 — Golden Gate Bridge Electric Bike Tour

Prerendered HTML validation for `dist/tours/hiking/us/california/index.html` found none of these pure bicycle strings: `Golden Gate Bridge Electric Bike Tour`, `Big Sandy eBike Ride`, `Mountain Bike`, `Bike Tour`, or `Bicycle`.
