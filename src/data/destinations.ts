export type Destination = {
  name: string;
  stateSlug: string;
  description: string;
  featuredDescription?: string;
  image: string;
  href: string;
};

export type StateRegion = {
  title: string;
  description: string;
};

export type CityExperience = {
  mountains: string;
  lakesWater: string;
  desertForest: string;
  cycling: string;
  scenicDrives: string;
  seasonalNotes: string;
};

export type WeekendItinerary = {
  dayOne: string[];
  dayTwo: string[];
};

export type CityFaq = {
  question: string;
  answer: string;
};

export type City = {
  name: string;
  slug: string;
  stateSlug: string;
  region: string;
  lat: number;
  lng: number;
  shortDescription: string;
  intro: string;
  heroImages: string[];
  activityTags: string[];
  whereItIs: string[];
  experiences: CityExperience;
  thingsToDo: string[];
  toursCopy: string[];
  weekendItinerary: WeekendItinerary;
  gettingThere: string[];
  faq: CityFaq[];
};

export type StateDestination = {
  slug: string;
  name: string;
  description: string;
  featuredDescription?: string;
  heroImage: string;
  intro: string;
  longDescription: string;
  topRegions: StateRegion[];
  cities: City[];
};

export type Tour = {
  id: string;
  name: string;
  description: string;
  duration: string;
  stateSlug: string;
  tags: string[];
};

export const states: StateDestination[] = [
  {
    slug: "california",
    name: "California",
    description: "Coastal drives, alpine hikes, and redwood escapes.",
    featuredDescription:
      "Surf to summit with coastal cliffs, redwood groves, and alpine trails.",
    heroImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    intro:
      "California is a choose-your-own-adventure state, pairing Pacific coastlines with desert basins and granite peaks in a single road trip.",
    longDescription: `California is a masterclass in variety for outdoor travelers. Within a single day you can watch dawn break over the Mojave Desert, spend an afternoon paddling a glassy alpine lake, and still catch sunset along the Pacific. The state stretches almost 800 miles from north to south, which means climates, ecosystems, and travel styles change quickly. That range creates the perfect playground for weekend escapes and weeklong epic loops alike. Whether you crave redwood shade, granite peaks, coastal cliffs, or sprawling desert basins, California delivers a layered itinerary that always feels new.

Along the coast, the vibe is restless and cinematic. Tide pools, surf breaks, and headlands draw visitors into a world of salt air and dramatic sunsets. Highway drives reveal fog-wrapped coves, vineyards on coastal bluffs, and wildlife refuges where sea lions lounge in the sun. Kayaking in kelp forests or hiking along bluff-top trails is often paired with local seafood markets and small-town cafés. The Pacific acts as a constant companion, moderating temperatures and offering year-round trails with epic ocean views.

Move inland and the Sierra Nevada rises like a wall of granite, crowned with alpine lakes and glacier-carved valleys. Summer brings accessible trailheads, wildflower meadows, and crisp, pine-scented air. Fall means golden aspens around high-elevation lakes, while winter transforms the range into a snow-sport haven. The Sierra is also where California’s long-distance backpacking dreams live—routes like the John Muir Trail give hikers weeks of big-sky wilderness. Even a short visit offers dramatic drives, scenic pullouts, and day hikes that end at waterfalls or panoramic lookouts.

Northern California’s forests feel almost enchanted. Coastal redwoods tower hundreds of feet above fern-lined trails, and the filtered light makes every walk feel quiet and sacred. You can string together a day of forest hikes with short detours to hidden beaches and cliffside viewpoints. The pace slows in these regions, and the scenery invites easy, mindful travel—great for visitors who want to slow down without sacrificing awe.

In the south and east, the desert shifts the mood. Joshua trees stand like sentinels, boulder piles create natural climbing gyms, and the night sky is a glittering dome. Desert adventures favor sunrise starts, late-day canyon walks, and soaking in hot springs when the air cools. The contrast between sun-baked basins and high-elevation mountain ridges is one of California’s best secrets. You can drive from palm oases to snow-capped peaks in a single afternoon.

California also excels at mixing outdoor adventure with easy logistics. Major airports, coastal towns, and mountain villages make it simple to plan a trip that balances comfort and wildness. Boutique lodges, campgrounds, and cabin stays are plentiful, and gear rental is accessible in most hubs. The state has invested heavily in trail networks, parks, and visitor services, which means beginners can explore without stress and seasoned explorers can push deeper into the backcountry.

For families, California’s variety shines. You can pair a beach day with a short hike, add a ranger-led program, then wind down with a local meal. For adrenaline seekers, the menu includes mountain biking, rock climbing, whitewater rafting, and multi-day backpacking loops. Food and culture sit right alongside the adventure, so each itinerary feels well-rounded rather than one-note.

Another reason California stands out is its shoulder season magic. Spring brings waterfalls and high-flow rivers. Early summer is peak wildflower time in the high country. Late summer and early fall reward travelers with warm days and uncrowded trails. Winter still offers coastline escapes and desert climbs even if alpine routes are snowed in. With thoughtful planning, there is always a trail, paddle, or viewpoint ready to go.

California’s outdoor identity is a blend of rugged landscapes and thoughtful access. It is where scenic drives become outdoor classrooms, where an afternoon hike can end with a dip in a turquoise lake, and where desert silence and coastal energy co-exist. The state’s scale might feel intimidating at first, but its experience is best enjoyed in small arcs—choose a region, set a pace, and let the landscapes do the rest. California doesn’t ask you to choose between coast or mountains, beginner or expert, quick getaway or long expedition. It invites you to do it all, one inspiring trip at a time.`,
    topRegions: [
      {
        title: "Coastal Escapes",
        description: "Bluff hikes, sea caves, and surf culture along the Pacific edge.",
      },
      {
        title: "High Sierra",
        description: "Granite peaks, alpine lakes, and big-sky trail networks.",
      },
      {
        title: "Desert Wonders",
        description: "Joshua tree forests, slot canyons, and stargazing basins.",
      },
    ],
    cities: [
      {
        name: "San Diego",
        slug: "san-diego",
        stateSlug: "california",
        region: "South Coast",
        lat: 32.7157,
        lng: -117.1611,
        shortDescription: "Coastal paddles, cliff walks, and sunny beach culture.",
        intro:
          "San Diego blends beach-town energy with dramatic coastal trails and harbor adventures. It is ideal for travelers who want surf breaks in the morning and bluff-top hikes by late afternoon.",
        heroImages: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["coastal", "paddling", "biking"],
        whereItIs: [
          "San Diego stretches along the southern California coast, close to the Mexican border and framed by the Pacific on one side and inland canyons on the other. The city’s neighborhoods flow from sandy beaches to urban mesas, which means you can move between waterfront promenades and trailheads without a long drive.",
          "The vibe is laid-back and outdoor-first. Locals plan days around tide cycles, sunset hikes, and harbor breezes, making it a great basecamp for travelers who want ocean air with plenty of city comforts.",
        ],
        experiences: {
          mountains:
            "Pair coastal mornings with a drive east to the foothills for mellow ridge walks and canyon overlooks in the Cleveland National Forest.",
          lakesWater:
            "Launch a kayak in Mission Bay or La Jolla’s sea caves, then end with a calm paddle at sunset as the water turns coppery.",
          desertForest:
            "The inland scrublands around the city offer short hikes with wildflower bursts in spring and warm, open vistas year-round.",
          cycling:
            "Ride the Bayshore Bikeway for a mostly flat loop with skyline views, ferry crossings, and beach-town stops.",
          scenicDrives:
            "Cruise the coast on Highway 101 or take the Mount Laguna drive for a quick elevation change and pine-scented viewpoints.",
          seasonalNotes:
            "Fall and spring deliver the clearest skies and cooler trail temperatures, while summer is perfect for early-morning hikes and long beach days.",
        },
        thingsToDo: [
          "Walk the Torrey Pines bluffs for ocean panoramas.",
          "Kayak the La Jolla sea caves and kelp forests.",
          "Bike the Coronado loop for skyline views.",
          "Spend golden hour at Sunset Cliffs Natural Park.",
          "Take a harbor cruise to spot sea lions and dolphins.",
        ],
        toursCopy: [
          "For a classic ocean-first itinerary, pair a sunrise paddle with an afternoon cliff walk and a harbor sunset cruise.",
          "Small-group guides can help you time tides and winds for the best experience on the water and on the bluffs.",
          "If you prefer a flexible schedule, book a half-day outing and keep the rest of the day open for beach time or local food stops.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: coffee in Little Italy, then Torrey Pines coastal hike.",
            "Afternoon: kayak La Jolla and picnic at the shore.",
            "Evening: sunset at Sunset Cliffs and waterfront dinner.",
          ],
          dayTwo: [
            "Morning: bike the Bayshore loop with a Coronado stop.",
            "Afternoon: visit Balboa Park gardens and museums.",
            "Evening: harbor stroll and casual seafood spot.",
          ],
        },
        gettingThere: [
          "San Diego International Airport is minutes from downtown and well connected for short domestic trips.",
          "Driving from Los Angeles typically takes 2–3 hours depending on traffic and coastal detours.",
        ],
        faq: [
          {
            question: "Do I need a car in San Diego?",
            answer:
              "A car helps for trailheads, but many beach neighborhoods are walkable and rideshares cover the core areas.",
          },
          {
            question: "Is the water warm enough for paddling?",
            answer:
              "Yes, but a light wetsuit is common outside of late summer.",
          },
          {
            question: "What’s the best time for coastal hikes?",
            answer:
              "Late afternoon brings cooler temps and softer light for photos.",
          },
        ],
      },
      {
        name: "Lake Tahoe",
        slug: "lake-tahoe",
        stateSlug: "california",
        region: "Sierra Nevada",
        lat: 39.0968,
        lng: -120.0324,
        shortDescription: "Crystal waters, alpine peaks, and year-round trails.",
        intro:
          "Lake Tahoe is an alpine escape wrapped in pine forests and granite peaks. The lake’s cobalt water pairs with ridge hikes, paddle routes, and cozy mountain towns that make for a perfect basecamp.",
        heroImages: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["alpine", "hiking", "paddling"],
        whereItIs: [
          "Lake Tahoe sits high in the Sierra Nevada, straddling the California-Nevada border. It is ringed by forested slopes, granite peaks, and alpine meadows that feel far removed from city life.",
          "The lake’s towns provide quick access to shoreline beaches, hiking trails, and scenic drives, making it a hub for both summer and winter adventures.",
        ],
        experiences: {
          mountains:
            "Hike ridge trails like Mount Tallac for sweeping lake views and crisp alpine air.",
          lakesWater:
            "Paddle Emerald Bay early in the day when the water is glassy and the light is soft.",
          desertForest:
            "Forests dominate here, with fragrant pine and granite outcrops creating classic mountain scenery.",
          cycling:
            "Ride the Tahoe East Shore Trail or explore mellow forest singletrack near Truckee.",
          scenicDrives:
            "Cruise the West Shore and stop at viewpoints like Eagle Falls and Inspiration Point.",
          seasonalNotes:
            "Summer brings lake days and hikes; winter is prime for snow sports and snowy forest walks.",
        },
        thingsToDo: [
          "Paddle or swim at Emerald Bay.",
          "Hike to Eagle Lake for a short scenic outing.",
          "Bike the East Shore multi-use trail.",
          "Ride a gondola at Heavenly for panoramic views.",
          "Watch sunset from Sand Harbor or Kings Beach.",
        ],
        toursCopy: [
          "Guided paddles help you explore coves and hidden beaches without worrying about wind shifts.",
          "A half-day hike with a local guide can unlock alpine viewpoints while keeping the pace comfortable.",
          "Pair a scenic lake cruise with an easy shoreline walk for a relaxed day.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: coffee in Tahoe City and a short hike to Eagle Lake.",
            "Afternoon: paddle Emerald Bay or relax at Sand Harbor.",
            "Evening: dinner with lake views and stargazing.",
          ],
          dayTwo: [
            "Morning: drive the West Shore with quick photo stops.",
            "Afternoon: bike the East Shore trail.",
            "Evening: sunset picnic at Kings Beach.",
          ],
        },
        gettingThere: [
          "Reno-Tahoe International Airport is about 1–1.5 hours away by car.",
          "From Sacramento, expect a 2–3 hour drive depending on mountain conditions.",
        ],
        faq: [
          {
            question: "Is Lake Tahoe good for beginners?",
            answer:
              "Yes. Many shoreline trails are short and well-marked, and the lake has plenty of easy-access beaches.",
          },
          {
            question: "What time should I paddle?",
            answer:
              "Early morning is best for calm water and minimal wind.",
          },
          {
            question: "Do I need to book lodging early?",
            answer:
              "Summer and winter weekends fill quickly, so booking ahead is smart.",
          },
        ],
      },
      {
        name: "Joshua Tree",
        slug: "joshua-tree",
        stateSlug: "california",
        region: "High Desert",
        lat: 34.1347,
        lng: -116.3131,
        shortDescription: "Desert boulders, stargazing skies, and golden light.",
        intro:
          "Joshua Tree delivers otherworldly desert scenes with an easygoing town vibe. It is a haven for climbers, photographers, and anyone who wants wide-open silence and glowing sunsets.",
        heroImages: ["/images/california/cities/hero.jpg"],
        activityTags: ["desert", "climbing", "stargazing"],
        whereItIs: [
          "Joshua Tree sits where the Mojave and Colorado deserts meet, about two hours east of Los Angeles. The national park surrounds a small desert town, with wide-open skies and iconic Joshua trees dotting the landscape.",
          "The atmosphere is calm and creative, with art installations, roadside cafés, and a steady flow of climbers and hikers planning their routes around sunrise and sunset.",
        ],
        experiences: {
          mountains:
            "The park’s rock piles double as mini-mountain climbs, offering short scrambles and panoramic viewpoints.",
          lakesWater:
            "Water is scarce, so plan for dry hikes and bring plenty of hydration; seasonal pools can appear after rain.",
          desertForest:
            "Joshua trees, creosote, and boulder fields create a unique desert ecosystem with endless photo opportunities.",
          cycling:
            "Ride the park roads for quiet, open desert cycling with steady grades and big views.",
          scenicDrives:
            "Drive Park Boulevard and stop at Keys View for a sweeping desert panorama.",
          seasonalNotes:
            "Fall through spring is prime for hiking, while summer favors early starts and night-sky sessions.",
        },
        thingsToDo: [
          "Scramble among the boulder fields at Hidden Valley.",
          "Watch sunset from Keys View.",
          "Hike the Barker Dam loop for desert wildlife.",
          "Photograph the Cholla Cactus Garden at sunrise.",
          "Join a stargazing program after dark.",
        ],
        toursCopy: [
          "Guided climbs and hikes help you navigate the boulder maze and learn about desert ecology.",
          "Night-sky tours add astronomy storytelling and telescope views for a deeper experience.",
          "If you are new to the desert, a guide can help you plan safe routes and timing.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: sunrise at the Cholla Cactus Garden.",
            "Afternoon: Hidden Valley boulder hike and picnic.",
            "Evening: stargazing session in the park.",
          ],
          dayTwo: [
            "Morning: Ryan Mountain hike for big views.",
            "Afternoon: explore local art galleries and cafés.",
            "Evening: sunset at Keys View.",
          ],
        },
        gettingThere: [
          "Palm Springs International Airport is about 1–1.5 hours away by car.",
          "Driving from Los Angeles typically takes 2–3 hours depending on traffic.",
        ],
        faq: [
          {
            question: "Is Joshua Tree good for beginners?",
            answer:
              "Yes, many short loops and roadside viewpoints make it easy to explore.",
          },
          {
            question: "Do I need a permit?",
            answer:
              "A park entry pass is required; backcountry permits are only needed for overnight trips.",
          },
          {
            question: "What should I pack?",
            answer:
              "Bring plenty of water, sun protection, and layers for cool desert nights.",
          },
        ],
      },
      {
        // TODO: confirm city name
        name: "San Francisco",
        slug: "san-francisco",
        stateSlug: "california",
        region: "Bay Area & Marin Coast",
        lat: 37.7749,
        lng: -122.4194,
        shortDescription: "Foggy headlands, bay trails, and iconic coastal views.",
        intro:
          "San Francisco pairs classic city energy with quick access to rugged coastal trails and bayfront parks. It is ideal for travelers who want outdoor mornings and city evenings without long drives.",
        heroImages: [
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["coastal", "urban-trails", "scenic"],
        whereItIs: [
          "San Francisco sits on a narrow peninsula between the Pacific Ocean and the San Francisco Bay. The city’s hills create instant viewpoints, while parks and waterfront promenades thread through iconic neighborhoods.",
          "With Marin Headlands and Golden Gate National Recreation Area nearby, it is easy to hop from urban coffee stops to cliffside trails within minutes.",
        ],
        experiences: {
          mountains:
            "Hike the Marin Headlands for rolling ridges and Golden Gate views that feel like a coastal mountain escape.",
          lakesWater:
            "Kayak or paddleboard in the calmer waters of the Bay, especially around Sausalito and Angel Island.",
          desertForest:
            "The region is defined by coastal scrub and eucalyptus groves, with shaded walks in Golden Gate Park.",
          cycling:
            "Cycle across the Golden Gate Bridge and return via the waterfront for a classic Bay Area route.",
          scenicDrives:
            "Drive Highway 1 north to Point Reyes or south toward Half Moon Bay for dramatic coastal scenery.",
          seasonalNotes:
            "Summer brings foggy mornings and crisp afternoons, while fall offers the clearest skies and warmest weather.",
        },
        thingsToDo: [
          "Walk Lands End for oceanfront trails.",
          "Bike the Golden Gate Bridge into Sausalito.",
          "Explore Golden Gate Park gardens and lakes.",
          "Visit Twin Peaks for a sweeping skyline view.",
          "Take a day trip to Point Reyes for coastal hikes.",
        ],
        toursCopy: [
          "Guided bike tours make the bridge crossing easy and include ferry returns for a relaxed finish.",
          "Coastal hike guides can add history and wildlife spotting along the headlands.",
          "Small-group bay cruises offer another perspective on the skyline and bridges.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: walk Lands End and Sutro Baths.",
            "Afternoon: explore Golden Gate Park and museums.",
            "Evening: sunset at Twin Peaks and dinner in the Mission.",
          ],
          dayTwo: [
            "Morning: bike the Golden Gate Bridge to Sausalito.",
            "Afternoon: ferry return and waterfront stroll.",
            "Evening: North Beach cafés and city lights.",
          ],
        },
        gettingThere: [
          "San Francisco International Airport is 25–35 minutes from downtown by car or transit.",
          "Oakland International Airport is a convenient alternative with easy BART access.",
        ],
        faq: [
          {
            question: "Do I need a car?",
            answer:
              "Not for the city core, but a car helps for coastal day trips and trailheads.",
          },
          {
            question: "What should I wear?",
            answer:
              "Bring layers—weather can shift quickly between fog and sun.",
          },
          {
            question: "Is it walkable?",
            answer:
              "Yes, but the hills are steep, so plan for extra time on foot.",
          },
        ],
      },
      {
        // TODO: confirm city name
        name: "Los Angeles",
        slug: "los-angeles",
        stateSlug: "california",
        region: "Coastal Metro & Mountains",
        lat: 34.0522,
        lng: -118.2437,
        shortDescription: "Urban energy with canyon hikes and beach sunsets.",
        intro:
          "Los Angeles blends iconic city culture with easy access to beaches, canyon trails, and coastal viewpoints. It is a choose-your-own-pace destination with endless outdoor options.",
        heroImages: [
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["coastal", "hiking", "urban-trails"],
        whereItIs: [
          "Los Angeles sprawls between the Santa Monica Mountains and the Pacific, which means trailheads and beaches are sprinkled across the city. Short drives can take you from downtown to canyon ridges or oceanfront bike paths.",
          "The outdoor vibe is casual and social—think sunrise hikes, mid-day beach breaks, and sunset overlooks with skyline views.",
        ],
        experiences: {
          mountains:
            "Hike Griffith Park or Runyon Canyon for city-meets-nature viewpoints and easy access to scenic overlooks.",
          lakesWater:
            "Head to the beach for surf lessons or paddleboarding in calmer marina waters.",
          desertForest:
            "The Santa Monica Mountains offer chaparral-covered trails and shaded canyons for quick escapes.",
          cycling:
            "Bike the Strand from Santa Monica to Manhattan Beach for a classic coastal ride.",
          scenicDrives:
            "Cruise Mulholland Drive or the Pacific Coast Highway for iconic viewpoints.",
          seasonalNotes:
            "Spring and fall offer the best hiking weather, while summer is ideal for long beach days.",
        },
        thingsToDo: [
          "Hike to the Griffith Observatory for skyline views.",
          "Bike the beach path from Santa Monica to Venice.",
          "Drive the Pacific Coast Highway for golden-hour views.",
          "Explore the Malibu bluffs and beaches.",
          "Catch sunset at a coastal overlook in Palos Verdes.",
        ],
        toursCopy: [
          "Guided canyon hikes add local context and the best viewpoints without the route planning.",
          "Coastal tours can combine biking and beach stops for a flexible day.",
          "If you want a highlight reel, book a half-day city-and-coast itinerary.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: hike Griffith Park and visit the observatory.",
            "Afternoon: lunch in Silver Lake and a lakeside stroll.",
            "Evening: sunset at Santa Monica Pier.",
          ],
          dayTwo: [
            "Morning: beach bike ride on the Strand.",
            "Afternoon: Malibu hike with ocean views.",
            "Evening: dinner in Venice or Santa Monica.",
          ],
        },
        gettingThere: [
          "Los Angeles International Airport (LAX) is the main hub; Burbank and Long Beach are smaller alternatives.",
          "Plan for traffic—driving times between neighborhoods can vary widely.",
        ],
        faq: [
          {
            question: "Is Los Angeles good without a car?",
            answer:
              "You can explore core neighborhoods with transit and rideshares, but a car helps for coastal and mountain access.",
          },
          {
            question: "When is the best time to hike?",
            answer:
              "Early mornings are cooler and less crowded, especially in summer.",
          },
          {
            question: "Do beaches get crowded?",
            answer:
              "Yes on summer weekends, so go early or choose quieter stretches like Malibu coves.",
          },
        ],
      },
      {
        // TODO: confirm city name
        name: "Palm Springs",
        slug: "palm-springs",
        stateSlug: "california",
        region: "Coachella Valley",
        lat: 33.8303,
        lng: -116.5453,
        shortDescription: "Mid-century oasis with desert hikes and palm oases.",
        intro:
          "Palm Springs is a stylish desert basecamp surrounded by rugged mountains and palm-lined canyons. It is perfect for early hikes, poolside recovery, and scenic drives.",
        heroImages: [
          "/images/california/cities/palm-springs-hero.jpg",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["desert", "hot-springs", "scenic"],
        whereItIs: [
          "Palm Springs sits in the Coachella Valley beneath the San Jacinto Mountains, about two hours east of Los Angeles. The dramatic elevation shift means you can ride a tram into cool alpine air after a desert morning.",
          "The town blends retro design with outdoor adventure, making it a favorite for travelers who want equal parts hiking and relaxation.",
        ],
        experiences: {
          mountains:
            "Ride the Palm Springs Aerial Tramway to alpine trails and cooler temperatures.",
          lakesWater:
            "Desert oases and resort pools are the main water escapes, with seasonal streams in nearby canyons.",
          desertForest:
            "Hike the Andreas Canyon or Indian Canyons for palm groves and desert cliffs.",
          cycling:
            "Cruise the flat valley roads for warm-weather cycling with big mountain views.",
          scenicDrives:
            "Drive Highway 74 for mountain switchbacks and lookout points above the valley.",
          seasonalNotes:
            "Winter and early spring offer the most comfortable hiking conditions; summer favors sunrise starts.",
        },
        thingsToDo: [
          "Explore the Indian Canyons palm oases.",
          "Take the aerial tramway to alpine trails.",
          "Cycle the valley bike paths at sunrise.",
          "Visit nearby hot springs for recovery.",
          "Drive to Joshua Tree for a desert day trip.",
        ],
        toursCopy: [
          "Guided canyon hikes add context about the Agua Caliente Band of Cahuilla Indians and the desert ecosystem.",
          "A tram-to-trail combo tour delivers cool-air hikes without the logistics.",
          "Desert stargazing sessions are a relaxing way to end the day.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: hike Andreas Canyon or Tahquitz Canyon.",
            "Afternoon: pool time and mid-century architecture stroll.",
            "Evening: sunset drive along Highway 74.",
          ],
          dayTwo: [
            "Morning: aerial tramway to alpine trails.",
            "Afternoon: visit a local market and café.",
            "Evening: stargazing or hot springs soak.",
          ],
        },
        gettingThere: [
          "Palm Springs International Airport is minutes from downtown.",
          "Driving from Los Angeles takes about 2–2.5 hours depending on traffic.",
        ],
        faq: [
          {
            question: "Is Palm Springs too hot in summer?",
            answer:
              "It can be, so plan for early hikes and plenty of shade and water.",
          },
          {
            question: "Do I need to book the tram ahead?",
            answer:
              "Advance tickets are recommended on weekends and holidays.",
          },
          {
            question: "What is the best season?",
            answer:
              "October through April offers the most comfortable outdoor conditions.",
          },
        ],
      },
      {
        // TODO: confirm city name
        name: "Yosemite",
        slug: "yosemite",
        stateSlug: "california",
        region: "Yosemite National Park",
        lat: 37.8651,
        lng: -119.5383,
        shortDescription: "Granite icons, waterfall valleys, and alpine meadows.",
        intro:
          "Yosemite is California’s granite cathedral, famous for towering cliffs, thundering waterfalls, and sweeping meadow views. It is a must for hikers who want iconic scenery.",
        heroImages: [
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["alpine", "waterfalls", "hiking"],
        whereItIs: [
          "Yosemite National Park sits in the central Sierra Nevada, about 4–5 hours from the Bay Area. The Valley is the heart of the park, with iconic cliffs like El Capitan and Half Dome towering above.",
          "The experience is immersive and awe-filled, with waterfalls in spring, high-country meadows in summer, and golden foliage in fall.",
        ],
        experiences: {
          mountains:
            "Climb to viewpoints like Glacier Point or Taft Point for classic granite vistas.",
          lakesWater:
            "Spring and early summer bring roaring waterfalls and refreshing riverside walks.",
          desertForest:
            "Giant sequoia groves and pine forests provide shaded trails and dramatic contrasts.",
          cycling:
            "Bike the Valley Loop for car-free views and easy access to trailheads.",
          scenicDrives:
            "Drive Tioga Road for high-country overlooks and alpine lakes (seasonal).",
          seasonalNotes:
            "Spring is waterfall season; summer is prime for high-country hikes; winter offers snowy valley quiet.",
        },
        thingsToDo: [
          "Hike to Vernal and Nevada Falls via the Mist Trail.",
          "Bike the Yosemite Valley Loop.",
          "Visit Glacier Point for panoramic views (seasonal).",
          "Walk the Tuolumne Meadows trails in summer.",
          "Explore the Mariposa Grove of giant sequoias.",
        ],
        toursCopy: [
          "Guided hikes help manage logistics and timing for popular trails.",
          "Photography-focused walks are great for catching golden-hour light on granite walls.",
          "If you want a multi-day feel without camping, book a full-day guided loop.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: sunrise at Tunnel View and a Valley loop walk.",
            "Afternoon: Mist Trail to Vernal Fall.",
            "Evening: picnic in El Capitan Meadow.",
          ],
          dayTwo: [
            "Morning: Glacier Point or Taft Point hike.",
            "Afternoon: explore Tuolumne Meadows (seasonal).",
            "Evening: stargazing in the Valley.",
          ],
        },
        gettingThere: [
          "Major gateways include Fresno, Sacramento, and the Bay Area airports, all 3–5 hours away by car.",
          "Entry reservations may be required in peak season—check ahead for access rules.",
        ],
        faq: [
          {
            question: "Do I need reservations?",
            answer:
              "Peak season may require an entry reservation; lodging and campsites book early.",
          },
          {
            question: "Is Yosemite family friendly?",
            answer:
              "Yes, there are many easy valley walks and scenic viewpoints.",
          },
          {
            question: "When is the best time to visit?",
            answer:
              "Late spring for waterfalls, summer for high-country access, and fall for lighter crowds.",
          },
        ],
      },
      {
        // TODO: confirm city name
        name: "Big Sur",
        slug: "big-sur",
        stateSlug: "california",
        region: "Central Coast",
        lat: 36.2704,
        lng: -121.8081,
        shortDescription: "Dramatic cliffs, redwood canyons, and ocean hikes.",
        intro:
          "Big Sur is California’s iconic coastal stretch, where rugged cliffs drop into the Pacific and redwood groves hide inland trails. It is built for scenic drives and short, memorable hikes.",
        heroImages: ["/images/california/cities/hero.jpg"],
        activityTags: ["coastal", "redwoods", "scenic"],
        whereItIs: [
          "Big Sur stretches along Highway 1 between Carmel and San Simeon, with steep cliffs, ocean overlooks, and hidden redwood canyons. The area feels remote despite being just a few hours from major cities.",
          "The pace is slow and scenic. Most visitors plan their days around viewpoints, short hikes, and cozy stops at cliffside cafés.",
        ],
        experiences: {
          mountains:
            "Short climbs at Pfeiffer Big Sur State Park deliver ridge views over the coastline.",
          lakesWater:
            "Creekside hikes and hidden waterfalls offer a cool contrast to the ocean views.",
          desertForest:
            "Redwood groves provide shaded trails and a serene forest atmosphere.",
          cycling:
            "Cyclists love Highway 1’s rolling climbs, but plan for narrow shoulders and coastal winds.",
          scenicDrives:
            "The Highway 1 drive is the main event, with dramatic pullouts at Bixby Bridge and Nepenthe.",
          seasonalNotes:
            "Spring brings wildflowers, while fall offers clear skies and fewer crowds.",
        },
        thingsToDo: [
          "Stop at Bixby Bridge for iconic photos.",
          "Hike to McWay Falls in Julia Pfeiffer Burns State Park.",
          "Walk the Pfeiffer Beach shoreline.",
          "Explore redwood trails in Pfeiffer Big Sur State Park.",
          "Enjoy a sunset overlook from Nepenthe.",
        ],
        toursCopy: [
          "Guided scenic drives provide local insight on geology, history, and the best viewpoints.",
          "Small-group hikes help you navigate redwood trails and coastal cliffs safely.",
          "A half-day itinerary blends waterfall stops with coastal overlooks for a relaxed pace.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: sunrise at Bixby Bridge.",
            "Afternoon: hike to McWay Falls and picnic.",
            "Evening: sunset at Nepenthe.",
          ],
          dayTwo: [
            "Morning: redwood hike in Pfeiffer Big Sur State Park.",
            "Afternoon: stop at Pfeiffer Beach.",
            "Evening: scenic drive south with viewpoint stops.",
          ],
        },
        gettingThere: [
          "Nearest airports include Monterey Regional and San Jose, both about 1.5–2.5 hours away.",
          "Highway 1 can close during storms, so check road conditions before traveling.",
        ],
        faq: [
          {
            question: "Is Big Sur a town?",
            answer:
              "It is more of a region with lodges and small stops rather than a single town center.",
          },
          {
            question: "Do I need reservations?",
            answer:
              "Lodging and campgrounds book quickly—reserve well ahead for weekends.",
          },
          {
            question: "Is cell service reliable?",
            answer:
              "Service is limited in many areas, so download maps ahead of time.",
          },
        ],
      },
    ],
  },
  {
    slug: "arizona",
    name: "Arizona",
    description: "Desert sunrises, canyon overlooks, and stargazing nights.",
    featuredDescription:
      "Sunrise hikes, canyon overlooks, and desert skies that glow at dusk.",
    heroImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Arizona is defined by canyon country and high desert skies, offering red rock hikes, alpine forests, and legendary sunsets.",
    longDescription: `Arizona is a land of deep canyons, sculpted mesas, and sky that seems to stretch forever. It is a destination that rewards early starts and patient exploration, where the desert teaches a slower rhythm and the landscapes expand in every direction. The state’s outdoor appeal begins with the Grand Canyon, but the real magic lies in the layers—high plateaus, red-rock amphitheaters, pine forests, and hidden river corridors that invite you to explore beyond the obvious.

In northern Arizona, pine-scented highlands create a cool escape from summer heat. Flagstaff serves as a mountain basecamp with easy access to volcanic cinder cones, alpine meadows, and canyon rim trails. Trails here are ideal for day hikes and mountain bike loops, with elevation keeping the air crisp even in the height of summer. Nearby, Sedona adds a surreal blend of red rock cathedrals and winding canyons, a haven for hikers, photographers, and travelers who love sunrise and sunset light.

The canyon country is Arizona’s signature. Standing at a rim overlook can feel like staring at another planet. Hiking down into the depths reveals hidden streams, dramatic stone walls, and a sense of scale that makes every step feel monumental. Rafting trips on the Colorado River combine adventure with a front-row seat to geology that spans millions of years. Whether you choose a short rim walk or a multi-day river journey, the canyon experience is unforgettable.

Southern Arizona leans into desert beauty with a softer, more rugged charm. Saguaro cactus forests surround Tucson, offering dawn and dusk hikes that are as much about light and quiet as they are about distance. The Sonoran Desert blooms in spring, painting the landscape with color and inviting wildflower hikes. Outside the cities, mountain ranges rise abruptly from the desert floor, creating microclimates with cooler temperatures and scenic drives.

Arizona is also a stargazer’s dream. The state’s dry air and low light pollution mean skies that sparkle with intensity. Dark-sky parks and observatories invite you to linger after dinner, scanning the Milky Way while desert nights cool. For travelers who want their adventures to extend past daylight, Arizona provides an unmatched nighttime show.

The state’s outdoor culture is welcoming to all levels. Short hikes lead to natural bridges, slot canyons, and waterfalls that feel like hidden gems. Longer trails cross mesas and weaving riverbeds for those wanting a full-day challenge. Road trippers appreciate Arizona’s scenic byways and iconic Route 66 towns. At the same time, the state’s networks of guided tours, outfitters, and national park services make it easy for first-time visitors to navigate safely and confidently.

Arizona’s seasons deliver different highlights. Winter is prime time for desert hikes, with clear skies and mild temperatures. Spring brings wildflowers and comfortable days in the canyons. Summer is ideal for the high country, where mountain trails and lakes offer cooler escapes. Fall blends warm days and golden light, perfect for photography and shoulder-season hiking. That year-round window makes planning flexible and fun.

More than anything, Arizona invites you to slow down. The landscapes are expansive and the pace is unhurried, encouraging lingering looks and quiet moments. You can build an itinerary around sunrise hikes and evening canyon overlooks, or mix in cultural stops at heritage sites and historic towns. The state thrives on contrast—fiery red rocks and shadowed canyons, quiet desert washes and lively mountain towns, remote trails and accessible scenic drives.

Arizona’s outdoor experiences feel timeless. They offer both big, bucket-list moments and small, personal memories: a switchback trail, a desert breeze, a canyon echo. That balance makes Arizona a top-tier getaway for anyone who wants adventure with space to breathe, a place where every horizon promises a new route to explore.`,
    topRegions: [
      {
        title: "Canyon Country",
        description: "Rim hikes, river rafts, and sandstone amphitheaters.",
      },
      {
        title: "High Plateau",
        description: "Pine forests, alpine lakes, and cool mountain towns.",
      },
      {
        title: "Sonoran Desert",
        description: "Saguaro trails, desert blooms, and warm winter hikes.",
      },
    ],
    cities: [
      {
        name: "Sedona",
        slug: "sedona",
        stateSlug: "arizona",
        region: "Red Rock Country",
        lat: 34.8697,
        lng: -111.761,
        shortDescription: "Red rock trails, vortex viewpoints, and canyon sunsets.",
        intro:
          "Sedona is a red rock dreamscape with glowing canyon walls and sweeping trail systems. It is a top pick for sunrise hikes and layered desert panoramas.",
        heroImages: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["canyons", "hiking", "scenic"],
        whereItIs: [
          "Sedona sits between the Coconino National Forest and a maze of red rock buttes, about two hours north of Phoenix. The town is nestled in a canyon basin, so every direction offers another viewpoint.",
          "Its mix of art galleries, wellness culture, and trail access makes it easy to blend hiking days with relaxing evenings.",
        ],
        experiences: {
          mountains:
            "Climb Cathedral Rock or Doe Mountain for classic red rock panoramas.",
          lakesWater:
            "Oak Creek adds refreshing creekside hikes and shaded canyon walks.",
          desertForest:
            "Juniper and red rock landscapes dominate, with pockets of pine forest nearby.",
          cycling:
            "Sedona’s trail network is a mountain biking favorite with flowy sandstone routes.",
          scenicDrives:
            "Drive Red Rock Scenic Byway for easy pullouts and sunset light.",
          seasonalNotes:
            "Spring and fall offer the best temps; summer favors early starts and shady canyon hikes.",
        },
        thingsToDo: [
          "Hike Cathedral Rock at sunrise.",
          "Walk West Fork Trail along Oak Creek.",
          "Drive the Red Rock Scenic Byway.",
          "Visit Chapel of the Holy Cross viewpoint.",
          "Explore Airport Mesa at sunset.",
        ],
        toursCopy: [
          "Guided sunrise hikes help you time the best light on the red rocks.",
          "Jeep tours access rugged viewpoints without the long climbs.",
          "Pair a mellow canyon walk with a stargazing session for a full-day experience.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Cathedral Rock hike.",
            "Afternoon: lunch in town and gallery stroll.",
            "Evening: sunset at Airport Mesa.",
          ],
          dayTwo: [
            "Morning: West Fork Trail in Oak Creek Canyon.",
            "Afternoon: scenic drive toward Flagstaff.",
            "Evening: dinner and stargazing.",
          ],
        },
        gettingThere: [
          "Phoenix Sky Harbor is about a 2-hour drive away.",
          "Flagstaff Pulliam Airport offers limited regional flights and is about 45 minutes north.",
        ],
        faq: [
          {
            question: "Do trails get crowded?",
            answer:
              "Yes, especially in spring—start early for the quietest hikes.",
          },
          {
            question: "Is Sedona good for beginners?",
            answer:
              "Absolutely—many trails are short and well-marked.",
          },
          {
            question: "Are permits required?",
            answer:
              "Some trailheads require a Red Rock Pass, available locally.",
          },
        ],
      },
      {
        name: "Flagstaff",
        slug: "flagstaff",
        stateSlug: "arizona",
        region: "High Country",
        lat: 35.1983,
        lng: -111.6513,
        shortDescription: "Pine forests, volcanic peaks, and cool mountain air.",
        intro:
          `Flagstaff is a high-elevation mountain town surrounded by ponderosa pine forests, volcanic landscapes, and the soaring San Francisco Peaks. The altitude keeps days crisp and nights cool, making it a welcome escape when the desert heats up. Just as important, the city sits in the perfect position for day trips to the Grand Canyon South Rim, with trailheads and viewpoints close enough for a sunrise-to-sunset loop.

Flagstaff is also a four-season adventure basecamp. Summer and early fall bring big hiking days, mountain bike loops, and wildflower meadows. Autumn colors light up the aspens on the peaks, while winter transforms the slopes into a snow-sport hub at Arizona Snowbowl. When daylight fades, the town’s dark-sky reputation delivers some of the best stargazing in the Southwest, whether you are at Lowell Observatory or on a forest road just outside town.

Between outings, the historic Route 66 corridor and walkable downtown add brewery patios, local food, and easy post-adventure hangs. Sedona’s red-rock canyons are close enough for a half-day detour, so you can mix pine forest hikes with high-desert vistas and still make it back for dinner in town.`,
        heroImages: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1443890923422-7819ed4101c0?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["alpine", "hiking", "volcanic"],
        whereItIs: [
          "Flagstaff sits at 7,000 feet on the Colorado Plateau, surrounded by ponderosa pine forests and old volcanic fields. The San Francisco Peaks rise directly north of town, creating an alpine skyline that feels more Rocky Mountain than desert Southwest.",
          "The city is a natural base for exploring northern Arizona, especially for day trips to the Grand Canyon South Rim. You can be on the rim trail or an early shuttle before lunch, then return to town for dinner and breweries.",
          "Downtown’s Route 66 corridor anchors a walkable core with coffee shops, breweries, and local food spots, making it easy to pair outdoor days with laid-back evenings.",
          "If you want red rock scenery, Sedona is close enough for a half-day adventure, adding canyon hikes and scenic drives to your itinerary without changing lodges.",
        ],
        experiences: {
          mountains:
            "Climb Humphreys Peak for Arizona’s highest summit, or take a shorter alpine hike near the San Francisco Peaks for big views without the full ascent.",
          lakesWater:
            "Head to nearby alpine lakes like Lake Mary for paddling, fishing, and picnic time when the afternoons heat up.",
          desertForest:
            "Dense pine forests create shaded trails with cooler temperatures, while nearby cinder cone landscapes add open, volcanic terrain.",
          cycling:
            "Ride forest roads and mellow singletrack near Fort Tuthill, or connect longer loops through aspen groves in early fall.",
          scenicDrives:
            "Drive to Sunset Crater and Wupatki for volcanic and pueblo history, or cruise Oak Creek Canyon for a dramatic descent into red-rock country.",
          seasonalNotes:
            "Summer is peak hiking season, fall brings glowing aspens, and winter turns Arizona Snowbowl into a snow-sport hub with powder days and cozy town evenings.",
        },
        thingsToDo: [
          "Plan a day trip to the Grand Canyon South Rim for rim walks and sunrise views.",
          "Ride the Arizona Snowbowl gondola or ski the slopes in winter.",
          "Hike Humphreys Peak or take a shorter San Francisco Peaks trail.",
          "Mountain bike the Fort Tuthill trail system and forest roads.",
          "Chase fall colors in the aspen groves near the peaks.",
          "Explore Sunset Crater Volcano National Monument and nearby cinder cones.",
          "Spend a dark-sky evening at Lowell Observatory or a nearby pullout.",
          "Explore Route 66 downtown, breweries, and local food spots after your hike.",
          "Take a quick day trip to Sedona for red-rock scenery and canyon hikes.",
        ],
        toursCopy: [
          "Guided day trips to the Grand Canyon South Rim handle the logistics so you can focus on rim walks and viewpoints.",
          "Local guides can customize alpine hikes in the San Francisco Peaks or build a mountain biking loop that matches your pace.",
          "Pair an observatory visit with a dark-sky tour for unforgettable stargazing nights.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: day trip to the Grand Canyon South Rim for rim trails and viewpoints.",
            "Afternoon: return to Flagstaff for late lunch and a Route 66 stroll.",
            "Evening: brewery patio dinner and stargazing at Lowell Observatory.",
          ],
          dayTwo: [
            "Morning: San Francisco Peaks hike or Arizona Snowbowl gondola ride.",
            "Afternoon: mountain bike Fort Tuthill or paddle Lake Mary.",
            "Evening: downtown dinner and local desserts before a night drive for dark skies.",
          ],
        },
        gettingThere: [
          "Flagstaff Pulliam Airport offers limited flights; Phoenix is about 2 hours away by car.",
          "Driving from the Grand Canyon South Rim takes about 1.5 hours.",
        ],
        faq: [
          {
            question: "Is Flagstaff a good summer escape?",
            answer:
              "Yes, cooler temps make it popular for warm-weather hiking.",
          },
          {
            question: "Are trails family friendly?",
            answer:
              "Many forest trails are gentle and shaded, great for families.",
          },
          {
            question: "When is snow season?",
            answer:
              "Snow can arrive in late fall and lasts into early spring.",
          },
        ],
      },
      {
        name: "Tucson",
        slug: "tucson",
        stateSlug: "arizona",
        region: "Sonoran Desert",
        lat: 32.2226,
        lng: -110.9747,
        shortDescription: "Saguaro trails, desert sunsets, and mountain views.",
        intro:
          "Tucson is wrapped by saguaro cactus forests and rugged mountain ranges. It is a sun-soaked destination for desert hikes and scenic drives.",
        heroImages: [
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["desert", "wildlife", "scenic"],
        whereItIs: [
          "Tucson sits in the heart of the Sonoran Desert, surrounded by Saguaro National Park and the Santa Catalina Mountains. The dramatic elevation change means you can hike deserts and pine forests in the same day.",
          "The city is laid-back, with local markets, cultural sites, and easy access to trailheads on every side.",
        ],
        experiences: {
          mountains:
            "Drive to Mount Lemmon for cool pine forests and a high-elevation escape.",
          lakesWater:
            "Desert washes and seasonal streams add surprise greenery after rain.",
          desertForest:
            "Saguaro-studded trails deliver classic Sonoran desert scenery and wildlife spotting.",
          cycling:
            "Ride the Loop bike path for an easy, scenic circuit around the city.",
          scenicDrives:
            "Take the scenic drive through Saguaro National Park for sunrise or sunset.",
          seasonalNotes:
            "Winter and spring offer the best hiking temps; summer favors early mornings.",
        },
        thingsToDo: [
          "Hike the Valley View Overlook in Saguaro National Park.",
          "Drive the Mount Lemmon Scenic Byway.",
          "Explore Sabino Canyon’s trails and tram.",
          "Bike the Loop for an easy ride.",
          "Watch sunset over Gates Pass.",
        ],
        toursCopy: [
          "Guided desert walks help spot wildlife and learn about Sonoran ecology.",
          "Scenic drive tours are great for catching golden-hour light without long hikes.",
          "Pair a short hike with a cultural stop for a balanced day.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: hike in Saguaro National Park (east side).",
            "Afternoon: explore downtown and local markets.",
            "Evening: sunset at Gates Pass.",
          ],
          dayTwo: [
            "Morning: Sabino Canyon walk or tram ride.",
            "Afternoon: drive Mount Lemmon for cooler air.",
            "Evening: stargazing outside the city.",
          ],
        },
        gettingThere: [
          "Tucson International Airport is about 20 minutes from downtown.",
          "Phoenix is about 2 hours away by car for more flight options.",
        ],
        faq: [
          {
            question: "Is Tucson too hot in summer?",
            answer:
              "It can be very hot, so plan early hikes and stay hydrated.",
          },
          {
            question: "Are there shaded trails?",
            answer:
              "Sabino Canyon and higher elevations on Mount Lemmon offer more shade.",
          },
          {
            question: "Do I need a park pass?",
            answer:
              "Saguaro National Park requires an entry fee or park pass.",
          },
        ],
      },
    ],
  },
  {
    slug: "nevada",
    name: "Nevada",
    description: "Wide-open basins, hot springs, and starry skies.",
    featuredDescription:
      "Remote hot springs, dark-sky nights, and wide-open desert basins.",
    heroImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Nevada is a high-desert playground of basin-and-range mountains, quiet hot springs, and wide-open horizons.",
    longDescription: `Nevada is the ultimate open-road adventure, a state built on vast basins, rugged mountain ranges, and desert skies that stretch forever. It is a destination that rewards explorers who love solitude, hot springs, and stargazing nights. Nevada’s landscapes are raw and dramatic, offering outdoor experiences that feel expansive and unhurried.

Beyond Las Vegas, Nevada reveals its wild heart. The Great Basin region is a highlight, with alpine peaks, ancient bristlecone forests, and the dark skies of Great Basin National Park. The park’s Wheeler Peak trails provide high-elevation adventures and sweeping views, while Lehman Caves offer a cool underground escape. It is a surprising alpine side of the desert that feels refreshingly remote.

Northern Nevada centers around Reno and Lake Tahoe’s eastern slopes, where alpine lakes and desert valleys meet. The Truckee River provides paddling and walking paths, and nearby Tahoe offers crystal-clear waters and high-elevation hikes. The contrast of high desert and alpine environments makes the region perfect for travelers who want a mix of scenery in a single trip.

Southern Nevada is a playground for red rock canyons and desert drives. Red Rock Canyon, Valley of Fire, and the Mojave Desert create a dramatic backdrop for hikers and climbers. These areas shine at sunrise and sunset, when the sandstone glows in warm hues. Even a short hike here delivers classic desert vistas.

Hot springs are part of Nevada’s identity. Remote valleys hide natural soaking pools that pair well with long drives and star-filled nights. These experiences require planning and respect for the environment, but they add a unique, restorative layer to any itinerary.

Nevada’s night skies are legendary. With low light pollution across much of the state, stargazing is a highlight everywhere you go. Dark-sky parks and open desert campsites offer some of the clearest views of the Milky Way in the country.

Outdoor adventures in Nevada are best enjoyed at a relaxed pace. The distances between towns are large, which means road trips become part of the experience. Scenic byways, open highways, and long desert drives are iconic here. Each stop feels like a new chapter in an epic route.

Nevada’s outdoor culture is a blend of rugged independence and welcoming small towns. You will find quirky diners, local outfitters, and friendly locals who know the back roads and hidden spots. That mix makes Nevada a great choice for travelers who want to explore beyond the usual destinations.

For those seeking quiet, open landscapes and a feeling of discovery, Nevada delivers. It is a state where adventure is defined by space, silence, and the thrill of finding beauty in the unexpected. Whether you are hiking alpine ridges or soaking in a desert hot spring, Nevada offers a unique outdoor escape that feels far from the everyday.`,
    topRegions: [
      {
        title: "High Desert Vistas",
        description: "Open basins, mountain ranges, and epic road trips.",
      },
      {
        title: "Hot Springs Routes",
        description: "Natural soaks tucked into remote valleys and ranchlands.",
      },
      {
        title: "Great Basin Peaks",
        description: "Alpine hikes, bristlecone pines, and star-filled skies.",
      },
    ],
    cities: [
      {
        name: "Reno",
        slug: "reno",
        stateSlug: "nevada",
        region: "Tahoe Gateway",
        lat: 39.5296,
        lng: -119.8138,
        shortDescription: "Urban basecamp for Tahoe trails and river walks.",
        intro:
          "Reno is a lively basecamp with quick access to the Truckee River and Tahoe’s alpine playground. It is ideal for travelers who want trails by day and city energy by night.",
        heroImages: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["alpine", "paddling", "hot-springs"],
        whereItIs: [
          "Reno sits along the Truckee River near the eastern edge of the Sierra Nevada. It is the quickest Nevada gateway to Lake Tahoe and alpine trailheads.",
          "The city blends urban energy with outdoor access, so you can split your day between riverside walks and mountain hikes.",
        ],
        experiences: {
          mountains:
            "Drive to Tahoe for alpine trails and lake-view hikes like Mount Rose.",
          lakesWater:
            "Paddle the Truckee River or head to Tahoe’s east shore for lake time.",
          desertForest:
            "High desert landscapes surround the city, with sagebrush valleys and open skies.",
          cycling:
            "Bike the Truckee River path for a mellow, scenic ride.",
          scenicDrives:
            "Take Mount Rose Highway for sweeping views into Tahoe country.",
          seasonalNotes:
            "Summer is ideal for lake days; winter brings nearby skiing and snowshoeing.",
        },
        thingsToDo: [
          "Paddle the Truckee River whitewater park.",
          "Day trip to Tahoe’s east shore beaches.",
          "Explore nearby desert hot springs.",
          "Bike the river path downtown.",
          "Take a scenic drive to Mount Rose.",
        ],
        toursCopy: [
          "Guided river floats offer an easy way to experience the Truckee.",
          "A Tahoe day tour can combine hiking with a lakeside picnic.",
          "Hot spring excursions add a restorative finish to a trail-heavy day.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: riverside walk and coffee downtown.",
            "Afternoon: drive to Tahoe and paddle or swim.",
            "Evening: dinner in Midtown Reno.",
          ],
          dayTwo: [
            "Morning: hike Mount Rose or a nearby trail.",
            "Afternoon: hot springs soak.",
            "Evening: sunset walk along the river.",
          ],
        },
        gettingThere: [
          "Reno-Tahoe International Airport is about 10 minutes from downtown.",
          "Driving from Sacramento takes about 2–2.5 hours depending on conditions.",
        ],
        faq: [
          {
            question: "Is Reno close to Lake Tahoe?",
            answer:
              "Yes, the north shore is about a 45-minute drive.",
          },
          {
            question: "Is summer hot?",
            answer:
              "Days are warm but evenings cool down thanks to elevation.",
          },
          {
            question: "Can I visit without skiing?",
            answer:
              "Absolutely—Reno is a year-round base for hiking and lake trips.",
          },
        ],
      },
      {
        name: "Las Vegas",
        slug: "las-vegas",
        stateSlug: "nevada",
        region: "Mojave Desert",
        lat: 36.1699,
        lng: -115.1398,
        shortDescription: "Gateway to desert parks, canyons, and rock climbs.",
        intro:
          "Las Vegas is the launchpad for red rock adventures, desert canyons, and scenic drives. Just beyond the Strip lies a world of sandstone trails and sunrise hikes.",
        heroImages: [
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["desert", "canyons", "climbing"],
        whereItIs: [
          "Las Vegas sits in the Mojave Desert and acts as a convenient hub for Southern Nevada’s red rock landscapes. Trailheads at Red Rock Canyon and Valley of Fire are within an hour’s drive.",
          "The city offers endless dining and lodging options, making it easy to pair outdoor adventures with comfortable evenings.",
        ],
        experiences: {
          mountains:
            "Hike the escarpments at Red Rock Canyon for layered desert mountain views.",
          lakesWater:
            "Lake Mead and the Black Canyon offer paddling and cooling water escapes.",
          desertForest:
            "Joshua trees and desert flora mix with sandstone canyons for a classic Mojave feel.",
          cycling:
            "Ride the River Mountains Loop Trail for desert and lake scenery.",
          scenicDrives:
            "Drive the Red Rock Scenic Loop for quick access to trailheads and viewpoints.",
          seasonalNotes:
            "Fall through spring is best for hiking; summer favors early mornings and water activities.",
        },
        thingsToDo: [
          "Hike Calico Tanks at Red Rock Canyon.",
          "Explore Valley of Fire’s sandstone formations.",
          "Kayak the Black Canyon on the Colorado River.",
          "Drive the Red Rock Scenic Loop.",
          "Catch sunset at Lake Mead overlooks.",
        ],
        toursCopy: [
          "Guided canyon hikes help you navigate slickrock terrain and learn about desert geology.",
          "A morning kayak trip on the Colorado River is a cool contrast to desert hikes.",
          "For a full-day loop, pair Valley of Fire with a scenic drive at sunset.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Red Rock Canyon hike.",
            "Afternoon: lunch in town and pool break.",
            "Evening: sunset drive through the scenic loop.",
          ],
          dayTwo: [
            "Morning: Valley of Fire exploration.",
            "Afternoon: Lake Mead or Black Canyon paddle.",
            "Evening: return to the Strip for dinner.",
          ],
        },
        gettingThere: [
          "Harry Reid International Airport is minutes from the Strip and major hotels.",
          "Most trailheads require a car; rideshare can cover shorter distances.",
        ],
        faq: [
          {
            question: "Is it safe to hike in summer?",
            answer:
              "Only with early starts and plenty of water—temperatures rise quickly.",
          },
          {
            question: "Do I need permits?",
            answer:
              "Red Rock Canyon has an entry fee; Valley of Fire has its own fee.",
          },
          {
            question: "Can I get to trails without a car?",
            answer:
              "A car is recommended for most outdoor destinations around Las Vegas.",
          },
        ],
      },
      {
        name: "Baker",
        slug: "baker",
        stateSlug: "nevada",
        region: "Great Basin",
        lat: 38.9833,
        lng: -114.1992,
        shortDescription: "Small-town gateway to Great Basin National Park.",
        intro:
          "Baker is the quiet access point for Great Basin’s alpine trails, limestone caves, and bristlecone forests. It is perfect for travelers seeking remote mountain adventures.",
        heroImages: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["alpine", "stargazing", "hiking"],
        whereItIs: [
          "Baker is a tiny town on the eastern edge of Nevada, tucked against the Snake Range. It serves as the primary gateway to Great Basin National Park.",
          "The atmosphere is quiet and remote, with wide skies and minimal light pollution—ideal for stargazing and slow-paced exploration.",
        ],
        experiences: {
          mountains:
            "Hike Wheeler Peak for alpine views and a true high-country experience.",
          lakesWater:
            "Alpine lakes dot the Snake Range and offer peaceful breaks along the trail.",
          desertForest:
            "Ancient bristlecone pines create a rare high-desert forest environment.",
          cycling:
            "Road cycling is popular on quiet highways with big open vistas.",
          scenicDrives:
            "Drive the Wheeler Peak Scenic Drive for elevation and vista pullouts.",
          seasonalNotes:
            "Summer is best for high-elevation hikes; winter brings snow and closed roads.",
        },
        thingsToDo: [
          "Hike the Wheeler Peak trail (challenging).",
          "Tour Lehman Caves for underground geology.",
          "Visit the bristlecone pine groves.",
          "Camp under some of the darkest skies in the West.",
          "Take a scenic drive to alpine trailheads.",
        ],
        toursCopy: [
          "Guided cave tours add history and geology to the Great Basin experience.",
          "Small-group hikes help you tackle the long Wheeler Peak route safely.",
          "Stargazing guides can point out constellations and seasonal meteor showers.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Lehman Caves tour.",
            "Afternoon: bristlecone pine hike.",
            "Evening: stargazing at a dark-sky site.",
          ],
          dayTwo: [
            "Morning: Wheeler Peak hike or a shorter alpine trail.",
            "Afternoon: scenic drive and picnic.",
            "Evening: sunset over the Snake Range.",
          ],
        },
        gettingThere: [
          "The nearest major airports are in Las Vegas or Salt Lake City, each about 4–5 hours away by car.",
          "Baker is remote, so plan fuel and supplies ahead of time.",
        ],
        faq: [
          {
            question: "Is Baker remote?",
            answer:
              "Yes, services are limited, which is part of the Great Basin’s appeal.",
          },
          {
            question: "Do I need a reservation for caves?",
            answer:
              "Lehman Caves tours often require advance booking in summer.",
          },
          {
            question: "When is stargazing best?",
            answer:
              "Moonless nights offer the darkest skies and brightest stars.",
          },
        ],
      },
    ],
  },
  {
    slug: "utah",
    name: "Utah",
    description: "Slot canyons, iconic arches, and sandstone vistas.",
    featuredDescription:
      "Iconic arches, canyon slots, and sandstone trails made for exploration.",
    heroImage:
      "/images/utah/utah-hero.webp",
    intro:
      "Utah is the heart of canyon country, mixing red rock drama with alpine escapes in the Wasatch Range.",
    longDescription: `Utah is the crown jewel of canyon country, a state defined by sculpted sandstone, towering cliffs, and a landscape that feels like a national park on repeat. It is the place where arches span the sky, slot canyons glow with reflected light, and mesas rise like ships from the desert floor. For outdoor travelers, Utah is a dream: accessible trails, epic viewpoints, and a sense of wonder that appears around every bend.

Southern Utah is home to the legendary “Mighty Five” national parks, but the appeal extends far beyond the park gates. Zion, Bryce, Arches, Capitol Reef, and Canyonlands each offer distinct experiences, from towering canyon walls to hoodoo amphitheaters. Visitors can choose between easy riverside walks, iconic overlooks, and adventurous slot canyon hikes. Even short hikes deliver dramatic scenery and unforgettable photo ops.

The state’s slot canyons are an outdoor highlight. Narrow passages carved by flash floods create winding corridors of sandstone, with light beams that dance across the walls. Guided canyoneering trips offer safe access to these mesmerizing spaces. For those seeking adventure, you can combine rappelling, scrambling, and hiking into a single day that feels like an expedition.

Beyond the iconic parks, Utah’s high plateaus and alpine regions provide cooler escapes in summer. The Wasatch Range near Salt Lake City is filled with hiking trails, mountain bike routes, and alpine lakes. These mountains offer a completely different vibe from the desert, with pine forests, wildflower meadows, and crisp air. It is easy to build a trip that pairs canyon hikes with a few days of alpine exploration.

Utah’s desert landscapes shine in the shoulder seasons. Spring and fall bring mild temperatures, perfect for long hikes, scenic drives, and photography. Winter can be a surprisingly good time to visit southern parks, with fewer crowds and clear skies. In the north, winter is for skiing and snowshoeing, creating a year-round adventure calendar that keeps the state vibrant no matter the season.

Utah is also remarkably accessible for visitors. Trailheads are well-marked, scenic drives are abundant, and local gateway towns provide lodging, food, and outfitters. The state’s infrastructure supports both seasoned travelers and families looking for an easy introduction to the outdoors. Short hikes to arches, overlooks, and canyon rims are perfect for beginners, while longer backcountry routes satisfy experienced hikers.

Another strength of Utah is its variety of terrain for adventure sports. Mountain bikers can explore famous singletrack networks in Moab and beyond. Climbers find endless sandstone routes, from beginner-friendly crags to challenging multi-pitch climbs. River runners can paddle scenic stretches of the Colorado or float calmer rivers through towering canyon walls. The state’s mix of sandstone, alpine, and river terrain makes it a favorite for multi-activity trips.

The light in Utah is legendary, especially in the early morning and late afternoon. The desert glows with shades of red, orange, and gold, and the landscape feels almost surreal. Photographers love the contrast between blue skies and red rock, and hikers appreciate the cooler temperatures during these golden hours. Sunset hikes are a must, whether you are in a canyon, on a rim, or atop a mesa.

Utah’s outdoor experience is about balance. You can plan an ambitious itinerary of long hikes and technical adventures, or you can focus on scenic drives and easy trails. The state is forgiving and welcoming, and its landscapes are so dramatic that even a simple walk can feel extraordinary. For travelers who want a mix of iconic sights and quiet moments, Utah delivers every time.

Whether you are chasing the sunrise in a slot canyon or cruising a scenic byway through red rock country, Utah offers a sense of scale and adventure that is hard to match. It is a place where the outdoors feels larger than life, yet still accessible. With thoughtful planning, Utah becomes an outdoor playground that feels both epic and approachable, making it one of the best getaway states in the American West.`,
    topRegions: [
      {
        title: "Canyon Vistas",
        description: "Red rock overlooks, rim trails, and scenic byways.",
      },
      {
        title: "Slot Canyon Hikes",
        description: "Narrow sandstone corridors and guided canyon routes.",
      },
      {
        title: "Alpine Escapes",
        description: "Wasatch trails, mountain lakes, and summer wildflowers.",
      },
    ],
    cities: [
      {
        name: "Moab",
        slug: "moab",
        stateSlug: "utah",
        region: "Canyon Country",
        lat: 38.5733,
        lng: -109.5498,
        shortDescription: "Red rock playground for biking, hiking, and rafting.",
        intro:
          "Moab is the adventure epicenter of Utah, surrounded by red rock cliffs and desert trails. It is the ideal base for mountain biking, canyon hikes, and river adventures.",
        heroImages: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["biking", "canyons", "rafting"],
        whereItIs: [
          "Moab sits along the Colorado River in southeastern Utah, surrounded by Arches and Canyonlands National Parks. It is a small town with outsized access to red rock scenery.",
          "The town’s adventure culture is strong, with bike shops, guiding services, and easy access to trailheads.",
        ],
        experiences: {
          mountains:
            "Hike Delicate Arch or nearby slickrock trails for iconic desert vistas.",
          lakesWater:
            "Float or raft the Colorado River for a different perspective on the canyon walls.",
          desertForest:
            "Slickrock domes and desert mesas define the landscape, with scattered desert flora.",
          cycling:
            "Ride the Slickrock Trail or nearby singletrack networks.",
          scenicDrives:
            "Drive the Arches National Park loop or Shafer Trail for dramatic overlooks.",
          seasonalNotes:
            "Spring and fall bring the most comfortable temps; summer favors early rides and river trips.",
        },
        thingsToDo: [
          "Hike to Delicate Arch at sunrise.",
          "Bike the Slickrock Trail (intermediate+).",
          "Raft a mellow stretch of the Colorado River.",
          "Drive to Canyonlands’ Island in the Sky.",
          "Watch sunset at Dead Horse Point.",
        ],
        toursCopy: [
          "Guided bike rides help you navigate slickrock safely and efficiently.",
          "River float tours offer a relaxed way to take in canyon scenery.",
          "Jeep tours add access to remote overlooks and backcountry routes.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Delicate Arch hike.",
            "Afternoon: lunch in town and bike ride.",
            "Evening: sunset at Dead Horse Point.",
          ],
          dayTwo: [
            "Morning: Canyonlands scenic drive.",
            "Afternoon: Colorado River float.",
            "Evening: stargazing in the desert.",
          ],
        },
        gettingThere: [
          "Moab has a small regional airport; most visitors fly into Grand Junction or Salt Lake City.",
          "Driving from Salt Lake City takes about 4 hours.",
        ],
        faq: [
          {
            question: "Is Moab good for families?",
            answer:
              "Yes, there are easy hikes and scenic drives suitable for kids.",
          },
          {
            question: "Do I need permits?",
            answer:
              "Some parks require timed entry in peak season; check ahead.",
          },
          {
            question: "Can I visit in summer?",
            answer:
              "Yes, but plan early starts and plenty of water.",
          },
        ],
      },
      {
        name: "Springdale",
        slug: "springdale",
        stateSlug: "utah",
        region: "Zion Gateway",
        lat: 37.1889,
        lng: -112.9989,
        shortDescription: "Gateway to Zion’s iconic canyon walls and hikes.",
        intro:
          "Springdale sits at the entrance of Zion National Park, providing easy access to famous hikes and scenic canyon drives.",
        heroImages: [
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["canyons", "hiking", "scenic"],
        whereItIs: [
          "Springdale is a small town perched at the mouth of Zion Canyon in southern Utah. The park’s shuttle and trailheads are only minutes away.",
          "The vibe is relaxed and park-focused, with lodges and cafés catering to hikers and photographers.",
        ],
        experiences: {
          mountains:
            "Zion’s canyon walls rise thousands of feet, creating dramatic vertical scenery.",
          lakesWater:
            "The Virgin River flows through the canyon and anchors the classic Riverside Walk.",
          desertForest:
            "Cottonwood groves and desert scrub mix along canyon floors and mesa tops.",
          cycling:
            "Bike the Pa’rus Trail for a car-free ride with canyon views.",
          scenicDrives:
            "Zion Canyon Scenic Drive delivers iconic views and pullouts.",
          seasonalNotes:
            "Spring and fall are ideal; summer brings heat and higher crowds.",
        },
        thingsToDo: [
          "Walk the Riverside Walk into the Narrows.",
          "Take the Canyon Overlook Trail.",
          "Cycle the Pa’rus Trail at sunset.",
          "Photograph the Watchman at golden hour.",
          "Explore nearby Kolob Canyons for fewer crowds.",
        ],
        toursCopy: [
          "Guided hikes help you navigate Zion’s most popular routes safely.",
          "Canyoneering tours provide access to slot canyons beyond the main park road.",
          "For a mellow day, book a scenic drive tour with short walks.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: early hike to Canyon Overlook.",
            "Afternoon: Riverside Walk and shuttle stops.",
            "Evening: sunset at the Watchman viewpoint.",
          ],
          dayTwo: [
            "Morning: explore the Narrows (conditions permitting).",
            "Afternoon: lunch in town and gallery stroll.",
            "Evening: drive to Kolob Canyons.",
          ],
        },
        gettingThere: [
          "Las Vegas is about 2.5 hours away by car; St. George is the closest regional airport.",
          "Parking in the park is limited—use the shuttle in peak season.",
        ],
        faq: [
          {
            question: "Do I need a permit for Zion?",
            answer:
              "The Narrows and certain routes may require permits; check current conditions.",
          },
          {
            question: "Is Zion crowded?",
            answer:
              "It can be, so arrive early or visit shoulder seasons.",
          },
          {
            question: "Are there easy hikes?",
            answer:
              "Yes, Riverside Walk and Pa’rus Trail are great for all levels.",
          },
        ],
      },
      {
        name: "Park City",
        slug: "park-city",
        stateSlug: "utah",
        region: "Wasatch Mountains",
        lat: 40.6461,
        lng: -111.498,
        shortDescription: "Alpine trails, mountain bike parks, and summer festivals.",
        intro:
          "Park City mixes mountain-town charm with accessible alpine trails. It is a cooler summer escape with easy hikes, biking, and scenic chairlift rides.",
        heroImages: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["alpine", "biking", "hiking"],
        whereItIs: [
          "Park City sits in the Wasatch Range about 40 minutes from Salt Lake City. It is known for its ski resorts, which transform into summer hiking and biking hubs.",
          "The town is walkable and lively, with historic streets and easy access to trailheads.",
        ],
        experiences: {
          mountains:
            "Hike the Wasatch Crest Trail for high-alpine ridge views.",
          lakesWater:
            "Alpine reservoirs nearby offer paddle and picnic options.",
          desertForest:
            "Aspen groves and pine forests create cool, shaded trails.",
          cycling:
            "Ride lift-served mountain bike trails at the resort parks.",
          scenicDrives:
            "Drive Guardsman Pass for sweeping views across the Wasatch.",
          seasonalNotes:
            "Summer is prime for biking and hiking; fall brings golden aspens.",
        },
        thingsToDo: [
          "Ride the resort chairlifts for scenic views.",
          "Hike the Wasatch Crest Trail.",
          "Bike resort downhill trails.",
          "Stroll historic Main Street.",
          "Drive Guardsman Pass for fall colors.",
        ],
        toursCopy: [
          "Guided mountain bike tours help you choose the right trails and gear.",
          "Alpine hikes with guides are great for learning about local flora and wildlife.",
          "Combine a chairlift ride with a downhill hike for an easy adventure day.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: coffee on Main Street and a short hike.",
            "Afternoon: chairlift ride and ridge walk.",
            "Evening: dinner downtown.",
          ],
          dayTwo: [
            "Morning: mountain bike session at the resort.",
            "Afternoon: picnic by an alpine reservoir.",
            "Evening: sunset drive over Guardsman Pass.",
          ],
        },
        gettingThere: [
          "Salt Lake City International Airport is about 40 minutes away.",
          "Mountain weather can change quickly, so pack layers even in summer.",
        ],
        faq: [
          {
            question: "Is Park City only for winter?",
            answer:
              "No, summer and fall are excellent for hiking and biking.",
          },
          {
            question: "Are trails crowded?",
            answer:
              "Resort areas can be busy on weekends, so start early.",
          },
          {
            question: "Do I need a bike pass?",
            answer:
              "Lift-served downhill parks require tickets; some trails are free.",
          },
        ],
      },
    ],
  },
  {
    slug: "oregon",
    name: "Oregon",
    description: "Waterfalls, misty forests, and volcanic ridgelines.",
    featuredDescription:
      "Waterfalls, misty forests, and volcanic peaks around every bend.",
    heroImage:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Oregon blends Pacific coastline with waterfall hikes and volcanic peaks, perfect for travelers who want a mix of forest, river, and ocean.",
    longDescription: `Oregon is a lush, storybook landscape of rainforests, volcanic peaks, and rugged coastline. It is a state where waterfalls tumble down mossy cliffs, where mist hangs in the trees, and where coastal winds sculpt dramatic shorelines. Oregon’s outdoor appeal is built on diversity and easy access, making it ideal for travelers who want to balance adventure with cozy, small-town charm.

The coast is a signature highlight. Scenic drives reveal towering sea stacks, hidden coves, and windswept beaches. Tide pools come alive with starfish and anemones, while cliffside trails offer sweeping ocean views. Visitors can pair a morning hike with afternoon clam chowder and sunset beach walks. The coast’s cool temperatures make it comfortable year-round, and the endless viewpoints ensure every stop feels like a discovery.

Inland, Oregon’s forests are equally captivating. The Columbia River Gorge is famous for its waterfall hikes and dramatic cliffs, offering easy access to nature just outside Portland. Trails range from short walks to full-day hikes with panoramic views of the river. The lush, green landscape makes every hike feel refreshing, especially during the warmer months.

Oregon’s volcanic heritage adds another layer. The Cascade Range includes iconic peaks like Mount Hood and Mount Bachelor, plus high lakes and lava fields that invite exploration. Summer brings wildflower meadows, alpine lakes, and sunny trail days. In winter, the mountains shift into ski and snowshoe territory, offering a full calendar of outdoor activities.

Central Oregon is a playground for paddlers and mountain bikers. The Deschutes River winds through Bend, where you can float in the sunshine and explore riverfront trails. The area’s high desert climate brings sunny days and cool nights, creating ideal conditions for biking and hiking. The trails are well-maintained, and the local outdoor culture makes it easy to connect with guides and gear.

Oregon also excels at blending outdoor adventure with food and drink. Farm-to-table dining, craft breweries, and local markets make it easy to refuel after a day on the trail. Small towns like Hood River, Sisters, and Astoria offer a mix of historic charm and modern outdoor culture. These communities provide both the essentials and the extras that turn a trip into a full experience.

Seasonally, Oregon shines in spring and early summer when waterfalls are at their peak and forests are vibrant. Late summer brings warm, dry days in the mountains and on the coast, while fall paints the forests with golden hues. Winter offers snow sports in the Cascades and storm watching on the coast. That variety makes Oregon a year-round destination with something new in every season.

For families, Oregon’s accessible trails and scenic drives are a perfect fit. Short hikes to waterfalls or viewpoints are easy to plan, and many parks include visitor centers and amenities. For more adventurous travelers, multi-day backpacking trips, long mountain bike routes, and coastal camping provide deeper immersion. The state’s public lands are expansive, and its trail networks are welcoming to a wide range of skill levels.

Oregon’s outdoor identity is rooted in its quiet beauty. The landscapes feel intimate and inviting, encouraging travelers to slow down and notice the details—moss-covered rocks, crashing surf, or the steady rush of a waterfall. It is a place where you can build a balanced itinerary of hiking, paddling, and scenic drives without ever feeling rushed.

Whether you are exploring rainforest trails, watching the sun set over the Pacific, or paddling a calm alpine lake, Oregon delivers a sense of serenity and wonder. It is a destination that blends adventure with ease, offering natural beauty that feels both accessible and awe-inspiring. For anyone seeking a getaway filled with fresh air, scenic beauty, and a touch of coastal magic, Oregon is an ideal choice.`,
    topRegions: [
      {
        title: "Coastal Overlooks",
        description: "Sea stacks, tide pools, and windswept beach hikes.",
      },
      {
        title: "Cascade Volcanics",
        description: "High lakes, volcanic peaks, and alpine wildflowers.",
      },
      {
        title: "Waterfall Country",
        description: "Misty gorge trails and riverfront viewpoints.",
      },
    ],
    cities: [
      {
        name: "Portland",
        slug: "portland",
        stateSlug: "oregon",
        region: "Columbia Gorge Gateway",
        lat: 45.5152,
        lng: -122.6784,
        shortDescription: "Urban gateway to the Columbia Gorge and forest trails.",
        intro:
          "Portland is the ideal launch point for waterfall hikes, forest walks, and river adventures. It pairs an outdoor-friendly city vibe with quick access to the Gorge and Mount Hood.",
        heroImages: [
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["waterfalls", "biking", "alpine"],
        whereItIs: [
          "Portland sits on the Willamette River and is less than an hour from the Columbia River Gorge. It is the perfect mix of city comfort and quick nature access.",
          "The city is bike-friendly, green, and packed with parks, making outdoor exploration easy even between trail days.",
        ],
        experiences: {
          mountains:
            "Day trip to Mount Hood for alpine hikes and summer wildflowers.",
          lakesWater:
            "The Willamette River offers paddling and riverside walks in the city core.",
          desertForest:
            "Forest Park’s dense trails provide a quick woodland escape inside the city.",
          cycling:
            "Ride waterfront paths or head to the Springwater Corridor for longer rides.",
          scenicDrives:
            "Drive the Historic Columbia River Highway for waterfall viewpoints.",
          seasonalNotes:
            "Spring is waterfall season; summer brings dry trails and outdoor patios.",
        },
        thingsToDo: [
          "Hike Multnomah Falls and nearby trails.",
          "Bike the Springwater Corridor.",
          "Explore Forest Park’s trail network.",
          "Day trip to Mount Hood’s alpine lakes.",
          "Stroll the riverfront at sunset.",
        ],
        toursCopy: [
          "Guided waterfall tours help you hit multiple Gorge highlights in one day.",
          "Bike tours through the city provide a relaxed, outdoorsy intro to Portland neighborhoods.",
          "Pair a Mount Hood hike with a local food stop for a full-day adventure.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Forest Park hike.",
            "Afternoon: bike ride along the river.",
            "Evening: food carts and brewery stop.",
          ],
          dayTwo: [
            "Morning: Columbia Gorge waterfall loop.",
            "Afternoon: picnic and scenic drive stops.",
            "Evening: sunset at a riverfront park.",
          ],
        },
        gettingThere: [
          "Portland International Airport is about 20–30 minutes from downtown.",
          "The Columbia Gorge is about a 45-minute drive east.",
        ],
        faq: [
          {
            question: "Is Portland walkable?",
            answer:
              "Yes, and it is also very bike-friendly with extensive paths.",
          },
          {
            question: "When is waterfall season?",
            answer:
              "Late winter through spring offers the strongest flows.",
          },
          {
            question: "Do I need a car?",
            answer:
              "You can explore the city without one, but a car helps for the Gorge and Mount Hood.",
          },
        ],
      },
      {
        name: "Bend",
        slug: "bend",
        stateSlug: "oregon",
        region: "High Desert",
        lat: 44.0582,
        lng: -121.3153,
        shortDescription: "High desert trails, river floats, and volcanic vistas.",
        intro:
          "Bend blends sunny high-desert weather with easy access to volcanic peaks and river adventures. It is a playground for biking, paddling, and casual hikes.",
        heroImages: [
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["biking", "paddling", "volcanic"],
        whereItIs: [
          "Bend sits on the Deschutes River in Central Oregon, framed by volcanic peaks and high desert landscapes. The climate is sunny and dry, perfect for outdoor days.",
          "The town has a fun, active vibe with breweries, bike shops, and quick access to trailheads.",
        ],
        experiences: {
          mountains:
            "Hike around the Three Sisters or Tumalo Mountain for volcanic views.",
          lakesWater:
            "Float the Deschutes River or paddle in the Cascade Lakes basin.",
          desertForest:
            "High desert pine forests blend with lava flows and open vistas.",
          cycling:
            "Ride the Phil’s Trail network for classic Bend singletrack.",
          scenicDrives:
            "Drive the Cascade Lakes Scenic Byway for lakes and mountain views.",
          seasonalNotes:
            "Summer is peak for river floats; fall brings crisp biking weather.",
        },
        thingsToDo: [
          "Float the Deschutes River through town.",
          "Mountain bike the Phil’s Trail network.",
          "Hike around Sparks Lake or Todd Lake.",
          "Drive the Cascade Lakes Scenic Byway.",
          "Grab a post-hike drink at a local brewery.",
        ],
        toursCopy: [
          "Guided bike tours help you navigate the best flow trails for your skill level.",
          "River float guides can set up shuttle logistics for a stress-free paddle.",
          "A day tour to the Cascade Lakes adds alpine scenery to your Bend base.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: bike the Phil’s Trail network.",
            "Afternoon: float the Deschutes River.",
            "Evening: dinner and brewery crawl.",
          ],
          dayTwo: [
            "Morning: Cascade Lakes scenic drive and short hike.",
            "Afternoon: paddle on Sparks Lake.",
            "Evening: sunset at Pilot Butte.",
          ],
        },
        gettingThere: [
          "Redmond Municipal Airport is about 25 minutes from Bend.",
          "Driving from Portland takes about 3 hours across the Cascades.",
        ],
        faq: [
          {
            question: "Is Bend good for beginners?",
            answer:
              "Yes, there are easy river floats and mellow hikes.",
          },
          {
            question: "When is the river float season?",
            answer:
              "Typically late spring through early fall depending on flow.",
          },
          {
            question: "Do I need a car?",
            answer:
              "A car is helpful for the Cascade Lakes and trailheads.",
          },
        ],
      },
      {
        name: "Cannon Beach",
        slug: "cannon-beach",
        stateSlug: "oregon",
        region: "North Coast",
        lat: 45.8918,
        lng: -123.9615,
        shortDescription: "Sea stacks, sandy coves, and coastal strolls.",
        intro:
          "Cannon Beach is famous for Haystack Rock and a charming coastal vibe. It is perfect for beach walks, tide pooling, and sunset photography.",
        heroImages: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["coastal", "scenic", "wildlife"],
        whereItIs: [
          "Cannon Beach sits on Oregon’s north coast, about 90 minutes from Portland. It is known for its wide sandy beach and the iconic Haystack Rock.",
          "The town is walkable and relaxed, with easy access to tide pools, viewpoints, and nearby state parks.",
        ],
        experiences: {
          mountains:
            "Coastal headlands provide short climbs with big ocean views.",
          lakesWater:
            "The Pacific is the star here—tide pools, surf breaks, and cool ocean air.",
          desertForest:
            "Coastal forests and headlands offer mossy trails and sea-sprayed viewpoints.",
          cycling:
            "Ride coastal bike paths for gentle, scenic routes.",
          scenicDrives:
            "Drive to Ecola State Park for sweeping coastline overlooks.",
          seasonalNotes:
            "Summer brings calm beach days; winter is ideal for storm watching.",
        },
        thingsToDo: [
          "Explore the tide pools at low tide.",
          "Walk the beach at golden hour.",
          "Hike Ecola State Park viewpoints.",
          "Visit Haystack Rock wildlife viewing spots.",
          "Take a scenic drive along Highway 101.",
        ],
        toursCopy: [
          "Guided tide pool walks highlight the marine life hiding around Haystack Rock.",
          "A coastal photography tour helps you plan for the best light and angles.",
          "For a slow day, book a beach walk with a naturalist guide.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Ecola State Park hike.",
            "Afternoon: tide pool exploration.",
            "Evening: sunset beach walk.",
          ],
          dayTwo: [
            "Morning: coffee and coastal stroll.",
            "Afternoon: scenic drive with lookout stops.",
            "Evening: seafood dinner in town.",
          ],
        },
        gettingThere: [
          "Portland is about 1.5 hours away by car.",
          "Parking is easier early in the day, especially in summer.",
        ],
        faq: [
          {
            question: "When is the best tide for tide pools?",
            answer:
              "Low tide offers the best access—check tide charts before you go.",
          },
          {
            question: "Is swimming possible?",
            answer:
              "The water is cold year-round, so most visitors stick to walks and wading.",
          },
          {
            question: "Is it crowded in summer?",
            answer:
              "Yes, weekends are busy—arrive early for parking and quiet trails.",
          },
        ],
      },
    ],
  },
  {
    slug: "washington",
    name: "Washington",
    description: "Rainforests, alpine lakes, and glacier-capped peaks.",
    featuredDescription:
      "Coastal rainforests, alpine lakes, and glacier-capped peaks to explore.",
    heroImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Washington is a landscape of misty rainforests and glacier-fed lakes, offering everything from coastal paddles to alpine hikes.",
    longDescription: `Washington is a state of lush contrasts—rainforests, rugged coastline, snow-capped peaks, and sparkling alpine lakes. It is a paradise for hikers, paddlers, and anyone who loves misty mornings and mountain silhouettes. From the Olympic Peninsula to the Cascade Range, Washington offers an outdoor itinerary that feels both wild and accessible.

The Olympic Peninsula is a standout for its diversity. In a single day you can walk along driftwood-lined beaches, wander through temperate rainforest, and hike alpine ridgelines. The Hoh Rainforest is a highlight with its moss-draped trees and quiet, misty trails. Coastal hikes bring sea stacks, tide pools, and dramatic sunsets. The peninsula’s remote feel makes it ideal for travelers who want a true sense of escape.

The Cascade Mountains dominate the state’s interior, offering some of the best alpine hiking in the country. Trails lead to turquoise lakes, wildflower meadows, and glacier-capped viewpoints. Mount Rainier is the crown jewel, with legendary hikes that circle the mountain and reveal sweeping views. The Cascades also provide excellent opportunities for mountain biking, camping, and scenic drives.

Washington’s waterways add another layer of adventure. Puget Sound is a hub for kayaking, whale watching, and island hopping. The San Juan Islands offer quiet paddling routes and peaceful trails with ocean views. Lakes like Diablo and Lake Chelan provide vibrant blue water framed by rugged cliffs, perfect for paddling or scenic boat tours.

The state’s outdoor culture is strong and inclusive. Trail networks are extensive, parks are well-maintained, and local communities embrace an active lifestyle. Seattle and other cities provide easy access to nearby hikes, making it possible to build a trip that balances urban energy with outdoor exploration. Visitors can enjoy a morning market, then be on a mountain trail by afternoon.

Seasonally, Washington shines in late spring and summer when alpine trails open and wildflowers bloom. Fall offers crisp air and golden forests, while winter transforms the Cascades into a snowy playground for skiing and snowshoeing. Coastal areas remain accessible year-round, with dramatic storm watching in the colder months. This variety makes Washington a destination for every season and every type of traveler.

Washington is also a dream for photographers and nature lovers. The interplay of mist, light, and mountain shapes creates dramatic scenery, and the state’s diverse ecosystems mean that every region feels distinct. Whether you are hiking to a glacier-fed lake, exploring a rainforest trail, or paddling along a rocky coast, the experience feels immersive and unforgettable.

For families, Washington offers easy day hikes, scenic drives, and ferry rides that add adventure to any itinerary. For more experienced travelers, multi-day backpacking routes and challenging summit hikes provide a deeper immersion. The state’s infrastructure makes it easy to plan, with well-marked trails, visitor centers, and abundant lodging options in gateway towns.

Washington invites exploration with a sense of wonder. It is a state where the outdoors feels abundant and close at hand, where each region offers a new atmosphere, and where every trip can be tailored to your pace. Whether you are chasing alpine sunrises, coastal sunsets, or quiet forest walks, Washington delivers a balanced, awe-filled getaway that keeps outdoor lovers coming back.`,
    topRegions: [
      {
        title: "Rainforest Trails",
        description: "Mossy paths, fern-lined rivers, and misty hikes.",
      },
      {
        title: "Alpine Lakes",
        description: "Glacier-fed waters, ridge hikes, and big views.",
      },
      {
        title: "Coastal Escapes",
        description: "Sea stacks, tidal pools, and wind-swept beaches.",
      },
    ],
    cities: [
      {
        name: "Olympic Peninsula",
        slug: "olympic-peninsula",
        stateSlug: "washington",
        region: "Olympic National Park",
        lat: 47.8021,
        lng: -123.6044,
        shortDescription: "Rainforest walks, rugged beaches, and alpine ridges.",
        intro:
          "The Olympic Peninsula is a choose-your-own landscape—rainforest, mountains, and wild coastline all in one region. It is an unforgettable loop for hikers and photographers.",
        heroImages: [
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["rainforest", "coastal", "hiking"],
        whereItIs: [
          "The Olympic Peninsula sits west of Seattle, surrounded by the Pacific and Puget Sound. It is home to Olympic National Park’s rainforests, mountains, and beaches.",
          "The region feels remote and wild, with long stretches of coastline and quiet forest trails.",
        ],
        experiences: {
          mountains:
            "Hike Hurricane Ridge for alpine views and wildflower meadows.",
          lakesWater:
            "Lake Crescent offers clear water and easy shoreline walks.",
          desertForest:
            "Temperate rainforests like Hoh and Quinault feel lush and otherworldly.",
          cycling:
            "Road cycling is popular on scenic highways, but trails are more hiking-focused.",
          scenicDrives:
            "Drive the 101 loop for beaches, forests, and mountain stops.",
          seasonalNotes:
            "Summer is best for alpine access; winter brings storm watching on the coast.",
        },
        thingsToDo: [
          "Walk the Hoh Rainforest trails.",
          "Visit Rialto Beach and its sea stacks.",
          "Hike Hurricane Ridge viewpoints.",
          "Explore Lake Crescent’s shoreline trails.",
          "Drive the 101 loop for scenic stops.",
        ],
        toursCopy: [
          "Guided rainforest walks add insight into the ecology and wildlife.",
          "Coastal hikes with a guide help you time tides and find the best viewpoints.",
          "A multi-day loop tour can handle logistics for a big Olympic Peninsula itinerary.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Hoh Rainforest trail loop.",
            "Afternoon: Lake Crescent picnic and short hike.",
            "Evening: sunset at Rialto Beach.",
          ],
          dayTwo: [
            "Morning: Hurricane Ridge hike.",
            "Afternoon: drive the coastal loop.",
            "Evening: dinner in Port Angeles.",
          ],
        },
        gettingThere: [
          "Seattle is about 2.5–3.5 hours away depending on ferry and traffic.",
          "Ferry routes can save time, but plan schedules in advance.",
        ],
        faq: [
          {
            question: "Is the Olympic Peninsula a day trip?",
            answer:
              "It is best as a 2–3 day loop to see multiple regions.",
          },
          {
            question: "Are rainforests accessible year-round?",
            answer:
              "Yes, but expect wet trails outside of summer.",
          },
          {
            question: "Do I need a park pass?",
            answer:
              "Olympic National Park requires an entry pass.",
          },
        ],
      },
      {
        name: "Leavenworth",
        slug: "leavenworth",
        stateSlug: "washington",
        region: "Cascade Mountains",
        lat: 47.5962,
        lng: -120.6615,
        shortDescription: "Alpine village charm with lake hikes and river floats.",
        intro:
          "Leavenworth blends alpine scenery with a charming Bavarian village feel. Nearby trails and rivers provide quick outdoor escapes in a picturesque setting.",
        heroImages: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["alpine", "paddling", "scenic"],
        whereItIs: [
          "Leavenworth sits on the east side of the Cascades, surrounded by alpine peaks and forested valleys. It is a popular weekend getaway from Seattle.",
          "The town’s Bavarian-inspired village adds charm, while trailheads and river access sit just outside town.",
        ],
        experiences: {
          mountains:
            "Hike to Colchuck Lake or nearby alpine trails for glacier views.",
          lakesWater:
            "Float the Wenatchee River for a relaxed summer paddle.",
          desertForest:
            "Dense pine forests surround the town, offering shaded hikes and scenic drives.",
          cycling:
            "Road bike along the Icicle Creek corridor for mountain views.",
          scenicDrives:
            "Drive the Icicle Gorge for quick pullouts and picnic spots.",
          seasonalNotes:
            "Summer is best for hiking; winter brings snow sports and festive village vibes.",
        },
        thingsToDo: [
          "Hike to Colchuck Lake.",
          "Tube or float the Wenatchee River.",
          "Stroll the Icicle Gorge scenic drive.",
          "Explore the Bavarian-style downtown.",
          "Visit nearby alpine meadows in late summer.",
        ],
        toursCopy: [
          "Guided alpine hikes help you navigate popular trails and parking logistics.",
          "River float tours are perfect for a relaxing summer afternoon.",
          "A local guide can combine scenic drives with short hikes for a mellow itinerary.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Colchuck Lake or a shorter alpine hike.",
            "Afternoon: lunch in town and river float.",
            "Evening: stroll the village for dinner.",
          ],
          dayTwo: [
            "Morning: Icicle Gorge scenic drive.",
            "Afternoon: winery or café stop.",
            "Evening: sunset at a nearby viewpoint.",
          ],
        },
        gettingThere: [
          "Leavenworth is about 2.5 hours from Seattle by car.",
          "Winter driving can require traction devices due to mountain passes.",
        ],
        faq: [
          {
            question: "Is Leavenworth good in summer?",
            answer:
              "Yes, alpine hiking and river floats are at their best.",
          },
          {
            question: "Are hikes crowded?",
            answer:
              "Popular trails like Colchuck Lake are busy—start early.",
          },
          {
            question: "Do I need a pass?",
            answer:
              "Many trailheads require a Northwest Forest Pass or similar permit.",
          },
        ],
      },
      {
        name: "Seattle",
        slug: "seattle",
        stateSlug: "washington",
        region: "Puget Sound",
        lat: 47.6062,
        lng: -122.3321,
        shortDescription: "Waterfront trails, ferry rides, and quick mountain access.",
        intro:
          "Seattle is a vibrant city base with easy access to Puget Sound, mountain trails, and island escapes. It is perfect for mixing urban energy with outdoor excursions.",
        heroImages: [
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["paddling", "urban-trails", "alpine"],
        whereItIs: [
          "Seattle sits between Puget Sound and Lake Washington, with the Cascades rising to the east. It is a city where ferry rides and waterfront walks are part of daily life.",
          "From downtown, you can reach mountain trailheads or island parks in just a couple of hours.",
        ],
        experiences: {
          mountains:
            "Day trip to Mount Rainier or the Cascade foothills for alpine hikes.",
          lakesWater:
            "Paddle Lake Union or head to Puget Sound for sea kayaking.",
          desertForest:
            "Dense evergreen forests and coastal parks offer easy nature escapes.",
          cycling:
            "Bike the Burke-Gilman Trail for an urban-to-nature ride.",
          scenicDrives:
            "Drive to Snoqualmie Pass for waterfalls and mountain viewpoints.",
          seasonalNotes:
            "Summer is dry and sunny, while fall offers crisp air and fall colors.",
        },
        thingsToDo: [
          "Walk the waterfront and Pike Place Market.",
          "Bike the Burke-Gilman Trail.",
          "Take a ferry to Bainbridge Island.",
          "Day trip to Snoqualmie Falls.",
          "Hike a Cascade foothills trail.",
        ],
        toursCopy: [
          "Guided kayak tours in Puget Sound offer wildlife spotting and skyline views.",
          "A day hike tour to Mount Rainier handles logistics and timing.",
          "Ferry-based excursions are a low-effort way to add island scenery.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Pike Place Market and waterfront stroll.",
            "Afternoon: bike the Burke-Gilman Trail.",
            "Evening: sunset at Kerry Park.",
          ],
          dayTwo: [
            "Morning: ferry to Bainbridge Island.",
            "Afternoon: hike a nearby foothills trail.",
            "Evening: dinner in Capitol Hill.",
          ],
        },
        gettingThere: [
          "Seattle-Tacoma International Airport is about 25–35 minutes from downtown.",
          "Traffic can be heavy—build extra time into your plans.",
        ],
        faq: [
          {
            question: "Do I need a car in Seattle?",
            answer:
              "You can explore the city without one, but a car helps for mountain day trips.",
          },
          {
            question: "Is it rainy year-round?",
            answer:
              "Winters are wet, but summers are typically dry and sunny.",
          },
          {
            question: "Are there easy hikes nearby?",
            answer:
              "Yes, the Cascade foothills have many beginner-friendly trails.",
          },
        ],
      },
    ],
  },
];

export const tours: Tour[] = [
  {
    id: "ca-coast-kayak",
    name: "Pacific Coast Sea Caves Kayak",
    description: "Paddle along kelp forests and explore sea caves with a guide.",
    duration: "3 hours",
    stateSlug: "california",
    tags: ["coastal", "paddling"],
  },
  {
    id: "ca-sierra-hike",
    name: "Sierra Alpine Lake Hike",
    description: "Guided day hike to a glacier-fed lake with picnic lunch.",
    duration: "Full day",
    stateSlug: "california",
    tags: ["alpine", "hiking"],
  },
  {
    id: "ca-desert-stars",
    name: "Joshua Tree Stargazing Walk",
    description: "Nighttime desert walk with astronomy guide and telescopes.",
    duration: "2 hours",
    stateSlug: "california",
    tags: ["desert", "stargazing"],
  },
  {
    id: "az-red-rock-sunrise",
    name: "Sedona Sunrise Red Rock Tour",
    description: "Golden-hour hike with panoramic canyon views.",
    duration: "Half day",
    stateSlug: "arizona",
    tags: ["canyons", "hiking"],
  },
  {
    id: "az-canyon-float",
    name: "Colorado River Scenic Float",
    description: "Relaxing float through towering canyon walls.",
    duration: "Half day",
    stateSlug: "arizona",
    tags: ["canyons", "rafting"],
  },
  {
    id: "az-sky-island",
    name: "Sky Island Summit Hike",
    description: "Guided hike from desert floor to cool alpine forest.",
    duration: "Full day",
    stateSlug: "arizona",
    tags: ["alpine", "wildlife"],
  },
  {
    id: "nv-hot-springs",
    name: "Great Basin Hot Springs Loop",
    description: "Full-day road trip with guided hot spring stops.",
    duration: "Full day",
    stateSlug: "nevada",
    tags: ["hot-springs", "scenic"],
  },
  {
    id: "nv-desert-stars",
    name: "Desert Night Sky Camp",
    description: "Overnight camp with astronomy storytelling.",
    duration: "Overnight",
    stateSlug: "nevada",
    tags: ["stargazing", "desert"],
  },
  {
    id: "nv-tahoe-hike",
    name: "Tahoe Rim Ridge Hike",
    description: "Scenic ridge walk with lake panoramas and picnic.",
    duration: "Full day",
    stateSlug: "nevada",
    tags: ["alpine", "hiking"],
  },
  {
    id: "ut-moab-bike",
    name: "Moab Slickrock Mountain Bike",
    description: "Guided ride across Moab’s iconic slickrock.",
    duration: "Half day",
    stateSlug: "utah",
    tags: ["biking", "canyons"],
  },
  {
    id: "ut-zion-hike",
    name: "Zion Canyon Highlights Hike",
    description: "Guided hike to Zion’s signature overlooks.",
    duration: "Full day",
    stateSlug: "utah",
    tags: ["hiking", "canyons"],
  },
  {
    id: "ut-wasatch-lake",
    name: "Wasatch Alpine Lake Adventure",
    description: "Day hike to a high-elevation lake with wildflowers.",
    duration: "Full day",
    stateSlug: "utah",
    tags: ["alpine", "hiking"],
  },
  {
    id: "or-waterfall",
    name: "Columbia Gorge Waterfall Walk",
    description: "Scenic walk to multiple waterfall viewpoints.",
    duration: "Half day",
    stateSlug: "oregon",
    tags: ["waterfalls", "hiking"],
  },
  {
    id: "or-coast",
    name: "Oregon Coast Tidepool Tour",
    description: "Guided exploration of coastal tide pools and sea stacks.",
    duration: "3 hours",
    stateSlug: "oregon",
    tags: ["coastal", "wildlife"],
  },
  {
    id: "or-bend-bike",
    name: "Bend High Desert Bike Ride",
    description: "Guided ride on flowing high desert singletrack.",
    duration: "Half day",
    stateSlug: "oregon",
    tags: ["biking", "volcanic"],
  },
  {
    id: "wa-rainforest",
    name: "Olympic Rainforest Walk",
    description: "Easy guided walk through mossy rainforest trails.",
    duration: "Half day",
    stateSlug: "washington",
    tags: ["rainforest", "hiking"],
  },
  {
    id: "wa-alpine-lake",
    name: "Cascade Alpine Lake Hike",
    description: "Day hike to a turquoise glacier-fed lake.",
    duration: "Full day",
    stateSlug: "washington",
    tags: ["alpine", "hiking"],
  },
  {
    id: "wa-island-kayak",
    name: "Puget Sound Island Kayak",
    description: "Paddle between islands with wildlife spotting.",
    duration: "3 hours",
    stateSlug: "washington",
    tags: ["paddling", "coastal"],
  },
];

export const destinations: Destination[] = states.map((state) => ({
  name: state.name,
  stateSlug: state.slug,
  description: state.description,
  featuredDescription: state.featuredDescription,
  image: state.heroImage,
  href: `/destinations/states/${state.slug}`,
}));

export const featuredDestinations = destinations;

export const allCities = states.flatMap((state) => state.cities);

export const getStateBySlug = (slug: string) =>
  states.find((state) => state.slug === slug);

export const getCityBySlugs = (stateSlug: string, citySlug: string) =>
  states
    .find((state) => state.slug === stateSlug)
    ?.cities.find((city) => city.slug === citySlug);
