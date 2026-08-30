import { deepSouthStates } from "./deepSouth.generated";
import { northeastStates } from "./northeast.generated";

export type Destination = {
  name: string;
  stateSlug: string;
  description: string;
  featuredDescription?: string;
  image: string;
  href: string;
  region?: string;
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
  region: string;
  intro: string;
  longDescription: string;
  topRegions: StateRegion[];
  cities: City[];
  isFallback?: boolean;
};

export type Tour = {
  id: string;
  name: string;
  description: string;
  duration: string;
  stateSlug: string;
  tags: string[];
};

const westStates: StateDestination[] = [
  {
    slug: "california",
    name: "California",
    description: "Coastal drives, alpine hikes, and redwood escapes.",
    featuredDescription:
      "Surf to summit with coastal cliffs, redwood groves, and alpine trails.",
    heroImage: "/images/california/california-hero.jpg",
    region: "West",
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
        description:
          "Bluff hikes, sea caves, and surf culture along the Pacific edge.",
      },
      {
        title: "High Sierra",
        description: "Granite peaks, alpine lakes, and big-sky trail networks.",
      },
      {
        title: "Desert Wonders",
        description:
          "Joshua tree forests, slot canyons, and stargazing basins.",
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
        shortDescription:
          "Coastal paddles, cliff walks, and sunny beach culture.",
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
        shortDescription:
          "Crystal waters, alpine peaks, and year-round trails.",
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
            answer: "Early morning is best for calm water and minimal wind.",
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
        shortDescription:
          "Desert boulders, stargazing skies, and golden light.",
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
        shortDescription:
          "Foggy headlands, bay trails, and iconic coastal views.",
        intro:
          "San Francisco pairs classic city energy with quick access to rugged coastal trails and bayfront parks. It is ideal for travelers who want outdoor mornings and city evenings without long drives.",
        heroImages: ["/images/california/cities/san-francisco-hero.jpg"],
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
        heroImages: ["/images/california/cities/los-angeles.jpg"],
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
        name: "Santa Barbara",
        slug: "santa-barbara",
        stateSlug: "california",
        region: "Central Coast",
        lat: 34.4208,
        lng: -119.6982,
        shortDescription:
          "Coastal bluffs, wine-country days, and easygoing surf.",
        intro:
          "Santa Barbara pairs Mediterranean-style charm with coastal trails and mellow ocean adventures. It is a relaxed basecamp where beach mornings, canyon hikes, and vineyard afternoons all fit in the same weekend.",
        heroImages: ["/images/california/cities/Santa-Barbara.jpg"],
        activityTags: ["coastal", "hiking", "wine-country"],
        whereItIs: [
          "Santa Barbara sits along the Central Coast between Los Angeles and Big Sur, backed by the Santa Ynez Mountains and fronted by a calm, south-facing stretch of the Pacific. The city’s beaches, bluffs, and harbor are all within a short drive of downtown.",
          "The vibe is laid-back and sunlit, with palm-lined streets, Spanish-style architecture, and a steady rhythm of outdoor time mixed with cafés and wine tastings.",
        ],
        experiences: {
          mountains:
            "Hike the Inspiration Point trail in the Santa Ynez Mountains for panoramic views of the coastline and Channel Islands.",
          lakesWater:
            "Launch a kayak or paddleboard from the harbor and glide along the waterfront with mountain views behind you.",
          desertForest:
            "Head into the Santa Ynez foothills for oak-lined trails and shaded canyon hikes that feel cooler than the coast.",
          cycling:
            "Ride the Cabrillo Bike Path for a scenic, mostly flat coastal loop past beaches and the wharf.",
          scenicDrives:
            "Cruise Highway 154 through the mountains to the Santa Ynez Valley for vineyards and lake overlooks.",
          seasonalNotes:
            "Spring and fall bring the clearest skies and mild temperatures, while summer favors early hikes and long beach days.",
        },
        thingsToDo: [
          "Walk the bluffs and tide pools at Shoreline Park.",
          "Paddle around the Santa Barbara Harbor and Stearns Wharf.",
          "Hike Inspiration Point for sweeping coastal views.",
          "Explore the Funk Zone for wine tasting and local art.",
          "Spend a day in the Santa Ynez Valley vineyards.",
        ],
        toursCopy: [
          "Guided coastal paddles keep you close to shore while spotting sea lions and seabirds.",
          "A small-group hiking tour can pair canyon trails with a post-hike tasting room visit.",
          "If you want a relaxed mix, book a half-day outing and keep the afternoon open for the beach.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: coastal walk at Shoreline Park and coffee downtown.",
            "Afternoon: harbor paddle or sail and lunch on the waterfront.",
            "Evening: sunset at East Beach and dinner in the Funk Zone.",
          ],
          dayTwo: [
            "Morning: hike Inspiration Point or Rattlesnake Canyon.",
            "Afternoon: drive to Santa Ynez Valley for wine tasting.",
            "Evening: casual dinner on State Street.",
          ],
        },
        gettingThere: [
          "Santa Barbara Airport offers short regional flights and is about 15 minutes from downtown.",
          "Driving from Los Angeles takes about 1.5–2.5 hours depending on traffic and coastal stops.",
        ],
        faq: [
          {
            question: "Do I need a car in Santa Barbara?",
            answer:
              "A car helps for mountain trails and wine country, but the waterfront and downtown are bikeable and walkable.",
          },
          {
            question: "What is the best time to visit?",
            answer:
              "Spring and fall bring mild weather and fewer crowds, with clear skies for coastal views.",
          },
          {
            question: "Is it easy to combine beach time and hiking?",
            answer:
              "Yes, trailheads sit just above the city, so you can hike in the morning and be at the beach by afternoon.",
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
            answer: "Advance tickets are recommended on weekends and holidays.",
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
        shortDescription:
          "Granite icons, waterfall valleys, and alpine meadows.",
        intro:
          "Yosemite is California’s granite cathedral, famous for towering cliffs, thundering waterfalls, and sweeping meadow views. It is a must for hikers who want iconic scenery.",
        heroImages: ["/images/california/cities/yosemite.jpg"],
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
        heroImages: ["/images/california/cities/big-sur-hero.gif"],
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
    heroImage: "/images/arizona/arizona-hero.jpg",
    region: "West",
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
        name: "Grand Canyon National Park",
        slug: "grand-canyon-national-park",
        stateSlug: "arizona",
        region: "Grand Canyon",
        lat: 36.0544,
        lng: -112.1401,
        shortDescription:
          "South Rim overlooks, canyon hikes, and Colorado River adventures.",
        intro:
          "Grand Canyon National Park is Arizona’s defining landscape—a mile-deep chasm carved by the Colorado River with layered rock, rim trails, and world-class viewpoints from the South Rim.",
        heroImages: [
          "https://images.unsplash.com/photo-1474041669434-77e4c8abab92?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["canyons", "hiking", "rafting"],
        whereItIs: [
          "The South Rim sits on the Colorado Plateau in northern Arizona, about 90 minutes from Flagstaff and four hours from Phoenix.",
          "Tusayan and Grand Canyon Village provide lodging and tour departures at the park’s main entrance.",
        ],
        experiences: {
          mountains:
            "Hike below the rim on guided trails like South Kaibab and Bright Angel with a certified guide.",
          lakesWater:
            "Colorado River rafting and helicopter flights reveal the canyon from river level.",
          desertForest:
            "Ponderosa pine forest frames the rim while the inner canyon opens to desert heat.",
          cycling: "Limited rim cycling; most visitors explore by foot, shuttle, or guided tour.",
          scenicDrives:
            "Desert View Drive connects Mather Point, Yavapai, and Desert View Watchtower.",
          seasonalNotes:
            "Spring and fall offer the best hiking temps; summer favors sunrise and sunset tours.",
        },
        thingsToDo: [
          "Watch sunrise from Mather Point or Yavapai Point.",
          "Take a helicopter flight over the canyon from Tusayan.",
          "Hike below the rim on a guided South Kaibab or Bright Angel route.",
          "Join a Jeep or Hummer rim tour at sunset.",
          "Book a multi-day ranch stay or backpacking trip into the inner canyon.",
        ],
        toursCopy: [
          "Guided rim tours help you skip entrance lines and hit the best viewpoints efficiently.",
          "Helicopter and airplane flights deliver unmatched aerial views of the Colorado River.",
          "Multi-day ranch and backpacking trips suit travelers who want more than a rim stop.",
        ],
        faq: [
          {
            question: "Which rim should I visit?",
            answer:
              "The South Rim offers the classic national park experience with the most viewpoints and tours.",
          },
          {
            question: "Do I need a guide to hike below the rim?",
            answer:
              "Day hikes below the rim are strenuous; guided hikes add safety, pacing, and local insight.",
          },
        ],
      },
      {
        name: "Sedona",
        slug: "sedona",
        stateSlug: "arizona",
        region: "Red Rock Country",
        lat: 34.8697,
        lng: -111.761,
        shortDescription:
          "Red rock trails, vortex viewpoints, and canyon sunsets.",
        intro:
          "Sedona is a red rock dreamscape with glowing canyon walls and sweeping trail systems. It is a top pick for sunrise hikes and layered desert panoramas.",
        heroImages: ["/images/arizona/cities/sedona-hero.jpg"],
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
            answer: "Absolutely—many trails are short and well-marked.",
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
        shortDescription:
          "Pine forests, volcanic peaks, and cool mountain air.",
        intro: `Flagstaff is a high-elevation mountain town surrounded by ponderosa pine forests, volcanic landscapes, and the soaring San Francisco Peaks. The altitude keeps days crisp and nights cool, making it a welcome escape when the desert heats up. Just as important, the city sits in the perfect position for day trips to the Grand Canyon South Rim, with trailheads and viewpoints close enough for a sunrise-to-sunset loop.

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
            answer: "Snow can arrive in late fall and lasts into early spring.",
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
        heroImages: ["/images/arizona/cities/tucson.webp"],
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
            answer: "Saguaro National Park requires an entry fee or park pass.",
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
    heroImage: "/images/nevada/nevada-hero.png",
    region: "West",
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
          cycling: "Bike the Truckee River path for a mellow, scenic ride.",
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
            answer: "Yes, the north shore is about a 45-minute drive.",
          },
          {
            question: "Is summer hot?",
            answer: "Days are warm but evenings cool down thanks to elevation.",
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
    heroImage: "/images/utah/utah-hero.webp",
    region: "West",
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
        shortDescription:
          "Red rock playground for biking, hiking, and rafting.",
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
          cycling: "Ride the Slickrock Trail or nearby singletrack networks.",
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
            answer: "Yes, but plan early starts and plenty of water.",
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
            answer: "It can be, so arrive early or visit shoulder seasons.",
          },
          {
            question: "Are there easy hikes?",
            answer:
              "Yes, Riverside Walk and Pa’rus Trail are great for all levels.",
          },
        ],
      },
      {
        name: "Zion National Park",
        slug: "zion-national-park",
        stateSlug: "utah",
        region: "Zion Canyon",
        lat: 37.2982,
        lng: -113.0263,
        shortDescription:
          "Towering canyon walls, Narrows hikes, slot canyons, and East Zion adventures.",
        intro:
          "Zion National Park is Utah's crown-jewel canyon—a vertical landscape of red sandstone cliffs, Virgin River narrows, and world-famous hikes from Angels Landing to the Riverside Walk.",
        heroImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/1d/62/0b.jpg",
        ],
        activityTags: ["canyons", "hiking", "canyoneering"],
        whereItIs: [
          "Zion Canyon sits in southwestern Utah near Springdale, with the main park shuttle serving the scenic drive from March through November.",
          "East Zion and Kanab-area operators run UTV slot canyon tours beyond the main canyon road.",
        ],
        experiences: {
          mountains:
            "Hike Angels Landing, the Narrows, and Emerald Pools with certified guides.",
          lakesWater:
            "Wade the Virgin River Narrows when flow levels permit safe bottom-up hiking.",
          desertForest:
            "Cottonwood groves line the canyon floor while desert scrub covers the eastern plateau.",
          cycling: "Bike the Pa'rus Trail for a car-free ride with canyon views.",
          scenicDrives:
            "Zion Canyon Scenic Drive and Kolob Terrace Road reveal iconic viewpoints.",
          seasonalNotes:
            "Spring and fall are ideal; summer heat favors early starts and shuttle access.",
        },
        thingsToDo: [
          "Hike the Narrows bottom-up from Riverside Walk.",
          "Summit Angels Landing with a permitted guided hike.",
          "Explore East Zion slot canyons on a UTV tour.",
          "Photograph the Watchman at golden hour from Springdale.",
          "Book a private full-day tour covering Zion and Bryce Canyon.",
        ],
        toursCopy: [
          "Private and small-group tours help you time Narrows conditions and Angels Landing permits.",
          "East Zion UTV and canyoneering tours access slot canyons beyond the main park road.",
          "Multi-day Bryce and Zion combos suit travelers basing in Springdale.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Canyon Overlook or Riverside Walk.",
            "Afternoon: Emerald Pools and shuttle stops.",
            "Evening: sunset Jeep tour in East Zion.",
          ],
          dayTwo: [
            "Morning: Narrows or Angels Landing guided hike.",
            "Afternoon: UTV slot canyon tour near Kanab.",
            "Evening: dinner in Springdale.",
          ],
        },
        gettingThere: [
          "Las Vegas McCarran International Airport is about 2.5 hours by car; St. George Regional Airport is the closest commercial option.",
        ],
        faq: [
          {
            question: "Do I need a permit for Angels Landing?",
            answer:
              "Yes. Angels Landing requires a seasonal permit; guided tours often include permit coordination.",
          },
          {
            question: "When can I hike the Narrows?",
            answer:
              "Bottom-up Narrows hiking depends on Virgin River flow; check conditions and book a guide for gear and safety.",
          },
        ],
      },
      {
        name: "Bryce Canyon National Park",
        slug: "bryce-canyon-national-park",
        stateSlug: "utah",
        region: "Bryce Canyon",
        lat: 37.593,
        lng: -112.1871,
        shortDescription:
          "Hoodoo amphitheaters, rim overlooks, stargazing, and red-rock guided adventures.",
        intro:
          "Bryce Canyon National Park is Utah's high-plateau hoodoo amphitheater—a landscape of pink limestone spires, rim viewpoints, and dark skies above Bryce Canyon City.",
        heroImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/ff/99/2a.jpg",
        ],
        activityTags: ["canyons", "hiking", "stargazing"],
        whereItIs: [
          "Bryce Canyon sits on Utah's Paunsaugunt Plateau near Bryce Canyon City, about two hours from Springdale and Zion.",
          "Ruby’s Inn and Bryce Canyon City provide lodging and tour departures outside the main park entrance.",
        ],
        experiences: {
          mountains:
            "Hike below the rim on Queen's Garden and Navajo Loop with a certified guide.",
          lakesWater:
            "Seasonal reservoirs near the park offer quiet contrast to the amphitheater rim.",
          desertForest:
            "Ponderosa pine and bristlecone forests frame pink limestone hoodoos along the rim.",
          cycling:
            "Guided e-bike tours reach Fairyland Point and Inspiration Point overlooks.",
          scenicDrives:
            "Bryce Canyon Scenic Drive links amphitheater viewpoints to Rainbow Point.",
          seasonalNotes:
            "Summer brings long days and dark-sky nights; winter snow contrasts the orange hoodoos.",
        },
        thingsToDo: [
          "Walk the rim between Sunrise, Sunset, Inspiration, and Bryce Points.",
          "Descend into the amphitheater on Queen's Garden or Navajo Loop.",
          "Book a stargazing tour under Bryce's International Dark Sky skies.",
          "Ride horseback or ATV routes in nearby Red Canyon country.",
          "Fly a short helicopter circuit over Fairyland and Boat Mesa.",
        ],
        toursCopy: [
          "Small-group scenic vans and private guides cover the amphitheater overlooks efficiently.",
          "Premium options include helicopter flights, photography tours, and full-day hiking adventures.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: scenic rim overlooks and short amphitheater walks.",
            "Afternoon: guided hike or e-bike tour.",
            "Evening: dark-sky stargazing near the park.",
          ],
          dayTwo: [
            "Morning: horseback or ATV outing in Red Canyon country.",
            "Afternoon: photography stops or helicopter flight.",
            "Evening: sunset at Inspiration Point or Bryce Point.",
          ],
        },
        gettingThere: [
          "Cedar City Regional and St. George Regional airports are the closest commercial options; Las Vegas is about a 4-hour drive.",
        ],
        faq: [
          {
            question: "How much time do I need in Bryce Canyon National Park?",
            answer:
              "A half day covers the main amphitheater overlooks; plan a full day for hiking below the rim plus sunset or stargazing.",
          },
          {
            question: "Is Bryce Canyon good for stargazing?",
            answer:
              "Yes. Bryce Canyon is an International Dark Sky Park, and guided telescope tours operate near the park.",
          },
        ],
      },
      {
        name: "Canyonlands National Park",
        slug: "canyonlands-national-park",
        stateSlug: "utah",
        region: "Moab",
        lat: 38.3269,
        lng: -109.8783,
        shortDescription:
          "Island in the Sky overlooks, Needles backcountry, jeep routes, and guided canyon adventures.",
        intro:
          "Canyonlands National Park spreads across mesas and canyons carved by the Colorado and Green rivers near Moab—Island in the Sky overlooks, Needles spires, White Rim Road, and guided jeep, hiking, and aerial tours into Utah's largest national park.",
        heroImages: [
          "https://dynamic-media.tacdn.com/media/photo-o/2f/b0/48/25/caption.jpg?w=700&h=500&s=1",
        ],
        activityTags: ["canyons", "hiking", "jeeping"],
        whereItIs: [
          "Canyonlands National Park surrounds Moab, Utah, with Island in the Sky the closest district and Needles farther south on the Colorado Plateau.",
          "Most guided tours depart from Moab lodging or downtown meeting points before entering Island in the Sky, Needles, or White Rim routes.",
        ],
        experiences: {
          mountains:
            "Hike Mesa Arch, Grand View Point, or Needles Joint Trail routes with a local guide.",
          lakesWater:
            "The Colorado and Green river corridors cut through Canyonlands and pair with overlook tours from Moab.",
          desertForest:
            "Mesas, grabens, sandstone needles, and high-desert scrub define the park's canyon-country scenery.",
          cycling:
            "Scenic paved overlooks in Island in the Sky suit visitors who want canyon views without long backcountry approaches.",
          scenicDrives:
            "Shafer Trail, White Rim Road, and Needles backcountry tracks reveal districts beyond the paved overlooks.",
          seasonalNotes:
            "Spring and fall bring milder touring weather; summer favors early starts and sunset tours; winter is quieter with crisp light.",
        },
        thingsToDo: [
          "Explore Island in the Sky overlooks and Shafer Trail on a guided 4x4 tour.",
          "Spend a full day in the Needles District with optional Joint Trail hiking.",
          "Drive White Rim Road deep into Canyonlands backcountry with buffet lunch included.",
          "Book a private hike, sunrise photography session, or helicopter flight over canyon country.",
          "Catch a secluded Canyonlands sunset from a 4x4-accessed overlook.",
        ],
        toursCopy: [
          "Jeep backcountry routes, private hikes, and aerial tours cover Canyonlands districts without self-driving remote roads.",
          "Premium options include Needles and White Rim full-day 4x4 trips, helicopter flights, and sunrise photography.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Island in the Sky half-day 4x4 tour via Shafer Trail.",
            "Afternoon: Mesa Arch and Grand View Point overlooks.",
            "Evening: secluded Canyonlands sunset 4x4 outing.",
          ],
          dayTwo: [
            "Morning: White Rim or Needles full-day backcountry adventure.",
            "Afternoon: continue guided hiking or overlook photography.",
            "Evening: Moab dinner and red-rock sunset views.",
          ],
        },
        gettingThere: [
          "Canyonlands Field Airport (CNY) is the closest air option; Grand Junction and Salt Lake City are common gateways with a drive to Moab.",
        ],
        faq: [
          {
            question: "How much time do I need in Canyonlands National Park?",
            answer:
              "A half day covers Island in the Sky overlooks; plan a full day for White Rim Road, Needles District, or a private hiking itinerary.",
          },
          {
            question: "Do I need a high-clearance vehicle for Canyonlands?",
            answer:
              "Paved Island in the Sky overlooks are accessible by standard cars; Shafer Trail, White Rim, and Needles backcountry routes typically require guided 4x4 transport.",
          },
        ],
      },
      {
        name: "Arches National Park",
        slug: "arches-national-park",
        stateSlug: "utah",
        region: "Moab",
        lat: 38.7331,
        lng: -109.5925,
        shortDescription:
          "Natural stone arches, red-rock viewpoints, jeep routes, and guided desert adventures.",
        intro:
          "Arches National Park concentrates more than 2,000 natural stone arches above Moab—Delicate Arch, the Windows Section, Devils Garden, and backcountry fins reached by guided hiking, jeep, and scenic tours.",
        heroImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/5e/d7/9e.jpg",
        ],
        activityTags: ["arches", "hiking", "jeeping"],
        whereItIs: [
          "Arches National Park sits just north of Moab, Utah, along U.S. Highway 191 on the Colorado Plateau.",
          "Most guided tours depart from Moab lodging or downtown meeting points a short drive from the park entrance.",
        ],
        experiences: {
          mountains:
            "Hike to Delicate Arch, Devils Garden, or secluded backcountry arches with a local guide.",
          lakesWater:
            "The Colorado River corridor near Moab pairs with Arches day trips for a red-rock river-and-arch itinerary.",
          desertForest:
            "Slickrock fins, sandstone arches, and desert scrub define the park's high-desert scenery.",
          cycling:
            "Scenic paved overlooks and short walks suit visitors who want arches without long desert approaches.",
          scenicDrives:
            "The park road links Courthouse Towers, Balanced Rock, the Windows, and Devils Garden viewpoints.",
          seasonalNotes:
            "Spring and fall bring milder hiking weather; summer favors early starts and sunset tours; winter is quieter with crisp light.",
        },
        thingsToDo: [
          "Visit Delicate Arch and the Windows Section on a guided scenic or private hike.",
          "Explore Tower Arch and Eye of the Whale on a 4x4 backcountry tour.",
          "Book a sunset or night photography outing under International Dark Sky conditions.",
          "Fly a short helicopter or airplane circuit over Moab canyon country and Arches.",
          "Combine Arches with Canyonlands on a full-day guided adventure.",
        ],
        toursCopy: [
          "Private hikes, jeep backcountry routes, and scenic vans cover Arches highlights without timed-entry stress.",
          "Premium options include photography workshops, helicopter flights, and full-day multi-park 4x4 adventures.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: guided scenic tour or private hike through the Windows and Delicate Arch viewpoints.",
            "Afternoon: Devils Garden hike or short overlook walks.",
            "Evening: sunset photography or dark-sky outing in the park.",
          ],
          dayTwo: [
            "Morning: 4x4 backcountry tour to Tower Arch and Eye of the Whale.",
            "Afternoon: Canyonlands combo or scenic flight over Arches.",
            "Evening: Moab dinner and red-rock sunset views.",
          ],
        },
        gettingThere: [
          "Canyonlands Field Airport (CNY) is the closest air option; Grand Junction and Salt Lake City are common gateways with a drive to Moab.",
        ],
        faq: [
          {
            question: "How much time do I need in Arches National Park?",
            answer:
              "A half day covers the main paved overlooks; plan a full day for Delicate Arch, Devils Garden, or a backcountry 4x4 route.",
          },
          {
            question: "Do I need timed entry for a guided Arches tour?",
            answer:
              "Many guided operators handle park access logistics; confirm whether timed entry or park fees are included when booking.",
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
        shortDescription:
          "Alpine trails, mountain bike parks, and summer festivals.",
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
          cycling: "Ride lift-served mountain bike trails at the resort parks.",
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
            answer: "No, summer and fall are excellent for hiking and biking.",
          },
          {
            question: "Are trails crowded?",
            answer: "Resort areas can be busy on weekends, so start early.",
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
    heroImage: "/images/oregon/oregon-hero.JPG",
    region: "West",
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
        shortDescription:
          "Urban gateway to the Columbia Gorge and forest trails.",
        intro:
          "Portland is the ideal launch point for waterfall hikes, forest walks, and river adventures. It pairs an outdoor-friendly city vibe with quick access to the Gorge and Mount Hood.",
        heroImages: ["/images/oregon/cities/portland-hero.jpg"],
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
            answer: "Late winter through spring offers the strongest flows.",
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
        shortDescription:
          "High desert trails, river floats, and volcanic vistas.",
        intro:
          "Bend blends sunny high-desert weather with easy access to volcanic peaks and river adventures. It is a playground for biking, paddling, and casual hikes.",
        heroImages: ["/images/oregon/cities/bend-hero.webp"],
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
            answer: "Yes, there are easy river floats and mellow hikes.",
          },
          {
            question: "When is the river float season?",
            answer:
              "Typically late spring through early fall depending on flow.",
          },
          {
            question: "Do I need a car?",
            answer: "A car is helpful for the Cascade Lakes and trailheads.",
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
        heroImages: ["/images/oregon/cities/canon-beach-hero.jpg"],
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
          cycling: "Ride coastal bike paths for gentle, scenic routes.",
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
    heroImage: "/images/washington/washington-hero.jpg",
    region: "West",
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
        shortDescription:
          "Rainforest walks, rugged beaches, and alpine ridges.",
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
            answer: "It is best as a 2–3 day loop to see multiple regions.",
          },
          {
            question: "Are rainforests accessible year-round?",
            answer: "Yes, but expect wet trails outside of summer.",
          },
          {
            question: "Do I need a park pass?",
            answer: "Olympic National Park requires an entry pass.",
          },
        ],
      },
      {
        name: "Olympic National Park",
        slug: "olympic-national-park",
        stateSlug: "washington",
        region: "Olympic Peninsula",
        lat: 47.8021,
        lng: -123.6044,
        shortDescription:
          "Rainforest trails, alpine ridges, wild beaches, and Seattle day trips.",
        intro:
          "Olympic National Park is a UNESCO-listed landscape of temperate rainforest, glacier-carved lakes, and rugged Pacific coastline—one of the few places where you can walk mossy Hoh Rainforest trails in the morning and explore Rialto Beach by afternoon.",
        heroImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/78/b1/b5.jpg",
        ],
        activityTags: ["rainforest", "hiking", "coastal"],
        whereItIs: [
          "Olympic National Park covers most of the Olympic Peninsula west of Seattle, with gateways at Port Angeles, Forks, and Bainbridge ferry routes for Seattle departures.",
          "Hurricane Ridge, Lake Crescent, the Hoh Rainforest, and Ruby Beach anchor most guided day tours and multi-day itineraries.",
        ],
        experiences: {
          mountains:
            "Hike Hurricane Ridge for alpine meadows and panoramic Olympic Mountain views.",
          lakesWater:
            "Explore Lake Crescent's blue waters, Marymere Falls, and Sol Duc Valley waterfalls.",
          desertForest:
            "Walk the Hoh Rainforest's moss-draped hall of giants and Quinault old-growth groves.",
          cycling:
            "Limited park cycling; most visitors explore by guided van or Seattle ferry day trips.",
          scenicDrives:
            "Loop Hurricane Ridge, Lake Crescent, and coastal beaches on full-day tours from Seattle or Port Angeles.",
          seasonalNotes:
            "Summer opens alpine trails and ferry schedules; winter brings snow at Hurricane Ridge and storm watching on the coast.",
        },
        thingsToDo: [
          "Hike the Hoh Rainforest Hall of Mosses trail.",
          "Visit Hurricane Ridge for mountain panoramas.",
          "Explore Rialto Beach and Ruby Beach sea stacks.",
          "Photograph Lake Crescent and Marymere Falls.",
          "Book a Seattle day trip with Bainbridge ferry crossing.",
        ],
        toursCopy: [
          "Seattle day tours combine ferry crossings with Hurricane Ridge and Lake Crescent highlights.",
          "Port Angeles guided hikes reach Sol Duc Falls, Hoh Rainforest, and Rialto Beach in one outing.",
          "Multi-day private tours cover both rainforest and coastal ecosystems without rushing the peninsula.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Hoh Rainforest guided walk.",
            "Afternoon: Rialto Beach and coastal tide pools.",
            "Evening: return via Forks or Port Angeles.",
          ],
          dayTwo: [
            "Morning: Hurricane Ridge alpine hike.",
            "Afternoon: Lake Crescent and Marymere Falls.",
            "Evening: Bainbridge ferry return to Seattle.",
          ],
        },
        gettingThere: [
          "Seattle is the main departure hub for ferry-linked day tours; Port Angeles serves in-park hiking tours.",
          "Olympic National Park requires an entry pass for most tour vehicles.",
        ],
        faq: [
          {
            question: "Can I visit Olympic National Park on a day trip from Seattle?",
            answer:
              "Yes. Many guided tours use the Bainbridge ferry and cover Hurricane Ridge, Lake Crescent, or rainforest highlights in one long day.",
          },
          {
            question: "What are the must-see Olympic National Park spots?",
            answer:
              "Hoh Rainforest, Hurricane Ridge, Lake Crescent, Rialto Beach, and Ruby Beach appear on most highlight itineraries.",
          },
          {
            question: "Do I need a park pass?",
            answer: "Olympic National Park requires an entry pass; most tours include entrance fees.",
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
        shortDescription:
          "Alpine village charm with lake hikes and river floats.",
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
          lakesWater: "Float the Wenatchee River for a relaxed summer paddle.",
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
            answer: "Yes, alpine hiking and river floats are at their best.",
          },
          {
            question: "Are hikes crowded?",
            answer: "Popular trails like Colchuck Lake are busy—start early.",
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
        shortDescription:
          "Waterfront trails, ferry rides, and quick mountain access.",
        intro:
          "Seattle is a vibrant city base with easy access to Puget Sound, mountain trails, and island escapes. It is perfect for mixing urban energy with outdoor excursions.",
        heroImages: ["/images/washington/Seattle.jpg"],
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
          cycling: "Bike the Burke-Gilman Trail for an urban-to-nature ride.",
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
            answer: "Winters are wet, but summers are typically dry and sunny.",
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
  {
    slug: "colorado",
    name: "Colorado",
    description: "Front Range foothills, alpine peaks, and red-rock vistas.",
    featuredDescription:
      "Plan hiking and cycling days with mountain towns and Front Range basecamps.",
    heroImage: "/images/colorado-hero.jpg",
    region: "Heartland",
    intro:
      "Colorado delivers high-elevation trails, scenic drives, and easygoing cities that keep adventure planning simple.",
    longDescription: `Colorado is a classic mountain state with a little bit of everything. The Front Range lines up big peaks with city comforts, while the high country brings alpine lakes, winding passes, and cool summer trail conditions. Whether you want a short urban walk or a full-day hike, the scenery ramps up fast once you leave town.

Denver, Boulder, Colorado Springs, Fort Collins, and Durango make reliable basecamps, each with quick access to foothills routes, bike paths, and day trips. Distances can add up, so plan for drive time, but the payback is a mix of skyline views, mountain air, and small-town food stops along the way.`,
    topRegions: [
      {
        title: "Front Range",
        description:
          "Foothill trails, bike paths, and quick access to the Rockies from Denver north to Fort Collins.",
      },
      {
        title: "High Country",
        description:
          "Elevated lakes, scenic passes, and alpine hikes around Colorado’s central mountains.",
      },
      {
        title: "Southwest Colorado",
        description:
          "San Juan Mountain scenery, historic rail towns, and canyon drives around Durango.",
      },
    ],
    cities: [
      {
        name: "Aspen",
        slug: "aspen",
        stateSlug: "colorado",
        region: "Roaring Fork Valley",
        lat: 39.1911,
        lng: -106.8175,
        shortDescription:
          "High-country trails, historic downtown streets, and easy access to guided hikes.",
        intro:
          "Aspen blends mountain scenery with walkable downtown blocks, making it simple to pair guided hikes with cafes, galleries, and riverfront strolls.",
        heroImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["hiking", "scenic-drives", "walking"],
        whereItIs: [
          "Aspen sits in the Roaring Fork Valley in central Colorado, about a four-hour drive from Denver depending on route and weather.",
          "The city center is compact, and many trailheads and meeting points are close enough for short transfers.",
        ],
        experiences: {
          mountains:
            "Aspen is surrounded by alpine terrain with guided and self-guided routes that range from light walks to steeper mountain climbs.",
          lakesWater:
            "Mountain streams and nearby reservoirs offer calm waterside stops and short scenic detours.",
          desertForest:
            "Aspen’s trails move through mixed forests and open slopes with seasonal wildflowers and fall color.",
          cycling:
            "Paved valley paths and rolling roads make it easy to add cycling between hiking days.",
          scenicDrives:
            "Highway approaches and mountain passes deliver classic Colorado viewpoints around town.",
          seasonalNotes:
            "Summer and early fall are prime for light hiking, with crisp mornings and cooler temperatures at elevation.",
        },
        thingsToDo: [
          "Join a guided light hike on Aspen’s East End.",
          "Walk downtown Aspen and nearby historic blocks.",
          "Take a scenic drive through surrounding mountain passes.",
          "Plan an early-morning trail outing before afternoon weather shifts.",
          "Pair outdoor time with local cafes and art stops in town.",
        ],
        toursCopy: [
          "Guided light hikes are a strong option for visitors who want local trail context without a full-day itinerary.",
          "Morning departures help you enjoy cooler trail conditions and clear mountain views.",
          "Use Aspen as a basecamp for short active outings followed by relaxed downtown time.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: guided light hike on the East End.",
            "Afternoon: lunch and downtown Aspen walk.",
            "Evening: scenic overlook stop and casual dinner.",
          ],
          dayTwo: [
            "Morning: easy trail or valley path ride.",
            "Afternoon: scenic drive and short photo stops.",
            "Evening: riverfront stroll.",
          ],
        },
        gettingThere: [
          "Aspen/Pitkin County Airport serves regional flights close to downtown.",
          "Driving access from Denver typically takes several hours and can vary by season.",
        ],
        faq: [
          {
            question: "When is the best time for light hikes in Aspen?",
            answer:
              "Summer through early fall typically offers the most reliable trail conditions for light hiking itineraries.",
          },
          {
            question: "Is Aspen walkable for visitors?",
            answer:
              "Yes, central Aspen is generally walkable, and many tours use convenient in-town meeting points.",
          },
        ],
      },
      {
        name: "Denver",
        slug: "denver",
        stateSlug: "colorado",
        region: "Front Range",
        lat: 39.7392,
        lng: -104.9903,
        shortDescription:
          "Urban basecamp with foothills trails, bike routes, and neighborhood walking tours.",
        intro:
          "Denver is Colorado’s biggest hub, pairing easy city logistics with fast access to nearby foothills and day-trip trailheads.",
        heroImages: [
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["hiking", "cycling", "food-tours"],
        whereItIs: [
          "Denver sits at the base of the Rocky Mountain foothills, about 30 minutes from trailheads around Golden and Red Rocks.",
          "The city center is compact and walkable, while bike paths follow the South Platte River and connect to surrounding neighborhoods.",
        ],
        experiences: {
          mountains:
            "Head west toward the foothills for quick hikes and skyline views at parks like Red Rocks and Mount Falcon.",
          lakesWater:
            "Nearby reservoirs and rivers make for easy morning paddles or waterside walks just outside the metro area.",
          desertForest:
            "Short drives bring you to open foothills trails with scrubby pines and wide-open panoramas.",
          cycling:
            "Use the Cherry Creek and South Platte trails for city rides, or connect to foothills roads for longer loops.",
          scenicDrives:
            "Plan a half-day drive along the Lariat Loop or to Lookout Mountain for classic Front Range scenery.",
          seasonalNotes:
            "Spring and fall offer the best hiking temps, while summer mornings are ideal for rides before the heat builds.",
        },
        thingsToDo: [
          "Walk the LoDo district and Union Station area.",
          "Bike the Cherry Creek Trail.",
          "Take a short foothills hike near Red Rocks.",
          "Explore RiNo street art and food stops.",
          "Plan a sunset viewpoint stop on Lookout Mountain.",
        ],
        toursCopy: [
          "Guided walking tours are a simple way to pair downtown history with local food stops.",
          "Bike tours help you cover more neighborhoods without the hassle of city driving.",
          "If you want trail time, add a foothills hike before returning for dinner in the city.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: downtown walk and coffee.",
            "Afternoon: bike ride on the Cherry Creek path.",
            "Evening: brewery or food hall stop.",
          ],
          dayTwo: [
            "Morning: foothills hike near Red Rocks.",
            "Afternoon: explore RiNo art district.",
            "Evening: sunset viewpoint drive.",
          ],
        },
        gettingThere: [
          "Denver International Airport is about 35–45 minutes from downtown.",
          "Light rail and rideshares cover the core, but a car helps for trailheads.",
        ],
        faq: [
          {
            question: "Do I need a car in Denver?",
            answer:
              "You can explore downtown without one, but a car makes foothill and mountain day trips easier.",
          },
          {
            question: "How close are the mountains?",
            answer:
              "Foothill trailheads are about 30–45 minutes west of the city.",
          },
        ],
      },
      {
        name: "Colorado Springs",
        slug: "colorado-springs",
        stateSlug: "colorado",
        region: "Pikes Peak Region",
        lat: 38.8339,
        lng: -104.8214,
        shortDescription:
          "Pikes Peak views, red-rock parks, and walkable downtown food tours.",
        intro:
          "Colorado Springs mixes dramatic mountain backdrops with accessible trailheads and a compact downtown.",
        heroImages: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["hiking", "cycling", "food-tours"],
        whereItIs: [
          "Colorado Springs sits at the base of Pikes Peak, about 70 miles south of Denver along the Front Range.",
          "Garden of the Gods and nearby trail networks are minutes from downtown, making it easy to mix city time with outdoor stops.",
        ],
        experiences: {
          mountains:
            "Ride or hike toward Pikes Peak for big alpine views and cool-air escapes in summer.",
          lakesWater:
            "Local reservoirs and park ponds offer relaxed shoreline walks and picnic-friendly stops.",
          desertForest:
            "Red-rock parks and foothill trails provide rugged scenery without long drives.",
          cycling:
            "E-bike outings and paved paths keep cycling approachable for all skill levels.",
          scenicDrives:
            "The drive to Pikes Peak Highway delivers iconic vistas and elevation changes.",
          seasonalNotes:
            "Late spring through early fall brings the best mix of trail access and comfortable temps.",
        },
        thingsToDo: [
          "Walk the Garden of the Gods loop.",
          "Visit downtown for a food-focused walking tour.",
          "Cycle a foothills route with mountain views.",
          "Plan a Pikes Peak scenic drive.",
          "Catch sunset over red-rock formations.",
        ],
        toursCopy: [
          "Walking food tours are a simple way to explore downtown without a long itinerary.",
          "Guided e-bike trips help you cover more ground while keeping the pace relaxed.",
          "Pair a quick park hike with a scenic drive for a balanced day.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Garden of the Gods walk.",
            "Afternoon: downtown food tour.",
            "Evening: sunset viewpoints near the foothills.",
          ],
          dayTwo: [
            "Morning: e-bike ride with mountain views.",
            "Afternoon: visit a local museum or park.",
            "Evening: casual dinner downtown.",
          ],
        },
        gettingThere: [
          "Colorado Springs Airport is about 20 minutes from downtown.",
          "Driving from Denver takes roughly 1.5 hours without heavy traffic.",
        ],
        faq: [
          {
            question: "How long should I plan for Garden of the Gods?",
            answer:
              "Most visitors spend 2–3 hours for short hikes and overlooks.",
          },
          {
            question: "Is Colorado Springs walkable?",
            answer:
              "Downtown is compact, but a car helps for parks and trailheads.",
          },
        ],
      },
      {
        name: "Rocky Mountain National Park",
        slug: "rocky-mountain-national-park",
        stateSlug: "colorado",
        region: "Northern Front Range",
        lat: 40.3428,
        lng: -105.6836,
        shortDescription:
          "Alpine peaks, Trail Ridge Road, wildlife meadows, and Estes Park gateway tours.",
        intro:
          "Rocky Mountain National Park protects Colorado's high-country spine—Trail Ridge Road, Bear Lake, alpine tundra, and elk-filled meadows anchored by Estes Park.",
        heroImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/92/85/fc.jpg",
        ],
        activityTags: ["hiking", "wildlife", "scenic-drives"],
        whereItIs: [
          "Rocky Mountain National Park sits west of Estes Park on the Northern Front Range, about 90 minutes from Denver.",
          "Trail Ridge Road crosses the Continental Divide when seasonal conditions allow, linking east-side meadows to Grand Lake.",
        ],
        experiences: {
          mountains:
            "Hike Bear Lake, Dream Lake, and Wild Basin waterfalls with certified guides.",
          lakesWater:
            "Alpine lakes and cascading streams frame many RMNP trailheads and photo stops.",
          desertForest:
            "Montane forests, subalpine meadows, and tundra ecosystems change quickly with elevation.",
          cycling: "Estes Park valley paths complement car-based park touring.",
          scenicDrives:
            "Trail Ridge Road and Old Fall River Road deliver iconic Colorado overlooks.",
          seasonalNotes:
            "Summer and early fall offer the best trail access; winter brings snowshoe and wildlife tours.",
        },
        thingsToDo: [
          "Book a private wildlife driving tour at dawn or dusk.",
          "Drive Trail Ridge Road to the Alpine Visitor Center.",
          "Hike Bear Lake or Wild Basin with a local guide.",
          "Join a sunrise or photography tour along the Continental Divide.",
          "Explore Estes Park before or after a full-day RMNP outing.",
        ],
        toursCopy: [
          "Private and small-group tours help you navigate timed-entry reservations and wildlife viewing windows.",
          "Estes Park outfitters run Jeep, hiking, photography, and snowshoe tours year-round.",
          "Full-day tours combine Trail Ridge Road, Bear Lake, and Grand Lake routing.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: sunrise wildlife tour in RMNP.",
            "Afternoon: Bear Lake corridor hike.",
            "Evening: sunset photo stop on Trail Ridge Road.",
          ],
          dayTwo: [
            "Morning: Old Fall River Road or Grand Lake loop.",
            "Afternoon: Estes Park downtown stroll.",
            "Evening: stargazing tour when conditions allow.",
          ],
        },
        gettingThere: [
          "Denver International Airport is about 90 minutes from Estes Park; regional flights also serve nearby Front Range airports.",
        ],
        faq: [
          {
            question: "Do I need a timed-entry reservation for Rocky Mountain National Park?",
            answer:
              "Timed-entry reservations are required during peak season; many guided tours include reservation coordination.",
          },
          {
            question: "Is Estes Park a good base for RMNP tours?",
            answer:
              "Yes. Estes Park sits at the east gateway and most outfitters meet guests there before entering the park.",
          },
        ],
      },
      {
        name: "Boulder",
        slug: "boulder",
        stateSlug: "colorado",
        region: "Front Range Foothills",
        lat: 40.015,
        lng: -105.2705,
        shortDescription:
          "College-town energy with creek paths, bike routes, and nearby foothill trails.",
        intro:
          "Boulder is a compact, outdoorsy city known for walkable downtown streets and quick access to the Flatirons.",
        heroImages: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["cycling", "hiking", "creek-paths"],
        whereItIs: [
          "Boulder sits about 30 minutes northwest of Denver at the base of the Flatirons.",
          "Multi-use paths and creek corridors thread through town, linking downtown with parks and trailheads.",
        ],
        experiences: {
          mountains:
            "Hike the Flatirons or nearby canyons for fast elevation gain and big views.",
          lakesWater:
            "Creekside paths and nearby reservoirs make for easy walks and picnic stops.",
          desertForest:
            "Foothill trails mix open views with shaded sections close to town.",
          cycling:
            "Boulder’s bike infrastructure makes it easy to tour downtown and connect to scenic loops.",
          scenicDrives:
            "Take a short drive up Boulder Canyon or toward Nederland for alpine scenery.",
          seasonalNotes:
            "Spring and fall bring crisp air for hiking; summer mornings are best for rides.",
        },
        thingsToDo: [
          "Ride the Boulder Creek Path.",
          "Walk Pearl Street and its cafés.",
          "Hike a Flatirons trail.",
          "Plan an e-bike tour of town.",
          "Catch sunset from a foothill overlook.",
        ],
        toursCopy: [
          "E-bike tours are a fun way to connect downtown with surrounding parks and paths.",
          "If you prefer flexibility, rentals keep the day open for self-guided exploration.",
          "Pair a short hike with a relaxed downtown evening for a balanced visit.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Pearl Street coffee and stroll.",
            "Afternoon: e-bike tour of local highlights.",
            "Evening: sunset at a nearby overlook.",
          ],
          dayTwo: [
            "Morning: Flatirons hike.",
            "Afternoon: Boulder Creek path ride.",
            "Evening: casual dinner downtown.",
          ],
        },
        gettingThere: [
          "Boulder is about 40 minutes from Denver International Airport.",
          "Local buses connect to Denver, but a car helps for canyon drives.",
        ],
        faq: [
          {
            question: "Is Boulder bike friendly?",
            answer:
              "Yes, multi-use paths and bike lanes make cycling around town easy.",
          },
          {
            question: "How long do Flatirons hikes take?",
            answer:
              "Most popular hikes range from 1–3 hours depending on the route.",
          },
        ],
      },
      {
        name: "Fort Collins",
        slug: "fort-collins",
        stateSlug: "colorado",
        region: "Northern Front Range",
        lat: 40.5853,
        lng: -105.0844,
        shortDescription:
          "Relaxed college town with river paths, brewery stops, and trail access.",
        intro:
          "Fort Collins offers a slower-paced basecamp with bike trails, riverside walks, and easy access to northern Front Range trails.",
        heroImages: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["cycling", "hiking", "riverwalks"],
        whereItIs: [
          "Fort Collins sits north of Denver along the Front Range, about 90 minutes from the capital city.",
          "The Poudre River runs through town, connecting parks, bike paths, and greenways.",
        ],
        experiences: {
          mountains:
            "Quick drives lead to Horsetooth Mountain and foothill trails with panoramic views.",
          lakesWater:
            "Horsetooth Reservoir and the Poudre River offer easy waterside walks and picnic spots.",
          desertForest:
            "Foothill trail networks bring open terrain and seasonal wildflowers close to town.",
          cycling:
            "Use the Spring Creek and Poudre trails for low-stress rides across town.",
          scenicDrives:
            "Drive toward Poudre Canyon for river scenery and overlook pull-offs.",
          seasonalNotes:
            "Summer and early fall are ideal for bike rides and foothill hikes.",
        },
        thingsToDo: [
          "Bike the Poudre Trail.",
          "Hike near Horsetooth Rock.",
          "Explore Old Town Fort Collins.",
          "Plan a scenic drive through Poudre Canyon.",
          "Pair a riverside walk with a local brewery stop.",
        ],
        toursCopy: [
          "Fort Collins is a good choice for visitors who want mellow trails and bike paths.",
          "Build a day around a foothills hike and an easy downtown evening.",
          "Add a river walk or scenic drive to keep logistics simple.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Old Town stroll and coffee.",
            "Afternoon: bike ride along the Poudre.",
            "Evening: dinner and brewery stop.",
          ],
          dayTwo: [
            "Morning: Horsetooth hike.",
            "Afternoon: Poudre Canyon scenic drive.",
            "Evening: relaxed meal downtown.",
          ],
        },
        gettingThere: [
          "Fort Collins is about 1.5 hours from Denver International Airport.",
          "A car is recommended for trailheads and canyon drives.",
        ],
        faq: [
          {
            question: "Is Fort Collins walkable?",
            answer:
              "Old Town is walkable, but a bike or car helps for trailheads.",
          },
          {
            question: "What’s nearby for hiking?",
            answer:
              "Horsetooth Mountain and foothill trails are the closest options.",
          },
        ],
      },
      {
        name: "Durango",
        slug: "durango",
        stateSlug: "colorado",
        region: "Southwest Colorado",
        lat: 37.2753,
        lng: -107.8801,
        shortDescription:
          "Historic rail town with San Juan scenery, bike rentals, and canyon drives.",
        intro:
          "Durango anchors southwest Colorado with a walkable downtown and fast access to the San Juan Mountains.",
        heroImages: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["cycling", "hiking", "scenic-drives"],
        whereItIs: [
          "Durango sits in southwest Colorado near the Animas River and the San Juan Mountain foothills.",
          "It is a convenient base for scenic drives, rail journeys, and trailheads outside town.",
        ],
        experiences: {
          mountains:
            "Head into the San Juans for alpine drives and high-country trail options.",
          lakesWater:
            "The Animas River corridor offers riverside walks and easy access to calm-water outings.",
          desertForest:
            "Canyon drives and mesa viewpoints add a different texture to mountain-focused days.",
          cycling:
            "E-bike rentals make it simple to explore town and nearby bike paths at your own pace.",
          scenicDrives:
            "Take the drive toward Mesa Verde or mountain passes for standout viewpoints.",
          seasonalNotes:
            "Late spring through fall is best for riding and day hikes, with cooler evenings.",
        },
        thingsToDo: [
          "Ride the Animas River Trail.",
          "Explore downtown Durango shops and cafés.",
          "Take a scenic drive toward Mesa Verde.",
          "Plan an e-bike rental day.",
          "Catch sunset at a nearby overlook.",
        ],
        toursCopy: [
          "E-bike rentals keep Durango exploration flexible without committing to a full-day tour.",
          "Combine a short hike with a scenic drive for an easy itinerary.",
          "Guided options can help you balance town time with mountain views.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: downtown stroll and coffee.",
            "Afternoon: e-bike ride along the river.",
            "Evening: dinner downtown.",
          ],
          dayTwo: [
            "Morning: short hike outside town.",
            "Afternoon: scenic drive toward Mesa Verde.",
            "Evening: sunset viewpoint stop.",
          ],
        },
        gettingThere: [
          "Durango-La Plata County Airport is about 20 minutes from downtown.",
          "A car is recommended for canyon drives and national park visits.",
        ],
        faq: [
          {
            question: "Is Durango a good base for Mesa Verde?",
            answer:
              "Yes, Mesa Verde National Park is about 45 minutes away by car.",
          },
          {
            question: "Can I get around without a car?",
            answer:
              "Downtown is walkable, but a car helps for trailheads and scenic drives.",
          },
        ],
      },
    ],
  },
  {
    slug: "montana",
    name: "Montana",
    description: "Big-sky valleys, glacier lakes, and trail-first towns.",
    featuredDescription:
      "Plan hiking, cycling, and canoeing days across Montana's mountain gateways.",
    heroImage: "/images/montana-hero.jpg",
    region: "Heartland",
    intro:
      "Montana pairs rugged ranges with wide-open rivers, making it a natural fit for multi-activity trips.",
    longDescription: `Montana is defined by dramatic mountain backdrops, long river valleys, and towns that serve as easy basecamps for outdoor travel. From Yellowstone gateways in the south to glacier-carved lakes in the north, the state rewards travelers who want trail time, scenic drives, and quiet water days in the same trip.

Basecamping in Bozeman, Missoula, or Whitefish keeps logistics simple while letting you mix guided outings with self-guided exploration. Distances are big, so plan for drive time, but the pay-off is a steady stream of viewpoints, riverside trails, and uncrowded paddling routes.`,
    topRegions: [
      {
        title: "Yellowstone Gateway",
        description:
          "Wildlife corridors, geothermal landscapes, and big-sky trailheads near the park boundary.",
      },
      {
        title: "Flathead & Glacier",
        description:
          "Alpine lakes, forested ridgelines, and iconic drives around Glacier National Park.",
      },
      {
        title: "River Valleys",
        description:
          "Clark Fork and Bitterroot river corridors with easy paddling access and bike-friendly paths.",
      },
    ],
    cities: [
      {
        name: "Bozeman",
        slug: "bozeman",
        stateSlug: "montana",
        region: "Southwest Montana",
        lat: 45.6769,
        lng: -111.0429,
        shortDescription:
          "College-town energy with rivers, trailheads, and Yellowstone access.",
        intro:
          "Bozeman is a lively basecamp with quick access to the Gallatin Valley, mountain trails, and Yellowstone day trips.",
        heroImages: ["/images/bozeman.jpg"],
        activityTags: ["hiking", "cycling", "canoeing"],
        whereItIs: [
          "Bozeman sits in the Gallatin Valley, about 90 minutes from the north entrance to Yellowstone National Park.",
          "Trailheads, river access points, and scenic drives are all within a short drive of downtown.",
        ],
        experiences: {
          mountains:
            "Hike the Bridger Range or Gallatin foothills for panoramic valley views.",
          lakesWater:
            "Paddle Hyalite Reservoir or float mellow stretches of the Gallatin River.",
          desertForest:
            "Forested trails around the valley offer shaded hikes and wildlife spotting.",
          cycling:
            "Ride quiet valley roads or connect to gravel routes outside town.",
          scenicDrives:
            "Plan a Yellowstone day trip or loop through Paradise Valley.",
          seasonalNotes:
            "Late spring through early fall brings the best hiking and paddling weather.",
        },
        thingsToDo: [
          "Hike a Bridger Range trail.",
          "Plan a Yellowstone day tour.",
          "Bike a Gallatin Valley loop.",
          "Paddle or float the Gallatin River.",
          "Catch sunset at a mountain overlook.",
        ],
        toursCopy: [
          "Guided Yellowstone outings help with timing and logistics for first-time visitors.",
          "Paddling rentals make it easy to fit in a self-guided lake day.",
          "Small-group bike tours are a simple way to see town and nearby trails.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: coffee downtown and a local bike or walking tour.",
            "Afternoon: paddle Hyalite or take a short hike.",
            "Evening: dinner downtown and sunset views.",
          ],
          dayTwo: [
            "Morning: Yellowstone day trip or Gallatin hike.",
            "Afternoon: river float or scenic drive.",
            "Evening: relaxed meal in town.",
          ],
        },
        gettingThere: [
          "Bozeman Yellowstone International Airport is 20 minutes from downtown.",
          "Rental cars help for park trips and trailheads outside town.",
        ],
        faq: [
          {
            question: "How far is Yellowstone from Bozeman?",
            answer:
              "The north entrance is about 90 minutes away by car, depending on stops.",
          },
          {
            question: "Do I need a car?",
            answer:
              "A car helps for trailheads and park access, but guided tours can cover major highlights.",
          },
        ],
      },
      {
        name: "Missoula",
        slug: "missoula",
        stateSlug: "montana",
        region: "Western Montana",
        lat: 46.8721,
        lng: -113.994,
        shortDescription:
          "Riverfront trails, bike paths, and easy access to the Bitterroot.",
        intro:
          "Missoula is a relaxed river city that pairs downtown access with nearby mountain trails and paddling routes.",
        heroImages: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ],
        activityTags: ["canoeing", "cycling", "hiking"],
        whereItIs: [
          "Missoula sits where the Clark Fork and Bitterroot rivers meet in western Montana.",
          "Trail systems and river access points start close to downtown.",
        ],
        experiences: {
          mountains:
            "Head to the Rattlesnake National Recreation Area for quick hikes.",
          lakesWater: "Float the Clark Fork River or paddle nearby reservoirs.",
          desertForest:
            "Forested foothills provide shaded trails and wildlife sightings.",
          cycling: "Use the Riverfront and Bitterroot paths for easy miles.",
          scenicDrives:
            "Drive south along the Bitterroot Valley for quiet views.",
          seasonalNotes:
            "Summer is prime for river floats, while fall offers cooler hiking temps.",
        },
        thingsToDo: [
          "Walk the Clark Fork Riverfront Trail.",
          "Plan a mellow river float.",
          "Bike the Bitterroot Trail.",
          "Hike in the Rattlesnake area.",
          "Explore downtown food and coffee spots.",
        ],
        toursCopy: [
          "River float options keep paddling simple without extra planning.",
          "Bike services help you prep gear before longer rides.",
          "Mix a short hike with a river afternoon for a balanced day.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: riverfront walk and coffee.",
            "Afternoon: float the Clark Fork or paddle a calm stretch.",
            "Evening: dinner downtown.",
          ],
          dayTwo: [
            "Morning: ride the Bitterroot Trail.",
            "Afternoon: quick hike in the Rattlesnake area.",
            "Evening: sunset along the river.",
          ],
        },
        gettingThere: [
          "Missoula International Airport is about 15 minutes from downtown.",
          "The city is walkable, but a car helps for trailheads outside town.",
        ],
        faq: [
          {
            question: "Is Missoula good for river time?",
            answer:
              "Yes, the Clark Fork River is central to the city and easy to access.",
          },
          {
            question: "Are bike paths beginner-friendly?",
            answer:
              "The riverfront and Bitterroot paths are mostly flat and easy to ride.",
          },
        ],
      },
      {
        name: "Whitefish",
        slug: "whitefish",
        stateSlug: "montana",
        region: "Flathead Valley",
        lat: 48.4111,
        lng: -114.3376,
        shortDescription:
          "Glacier access, lake paddles, and alpine climbing routes.",
        intro: `Whitefish is a compact mountain town with quick access to Glacier National Park and Whitefish Lake.`,
        heroImages: ["/images/whitefish.jpg"],
        activityTags: ["hiking", "canoeing"],
        whereItIs: [
          "Whitefish sits in the Flathead Valley, about 30 minutes from Glacier National Park.",
          "Whitefish Lake and alpine trailheads are minutes from downtown.",
        ],
        experiences: {
          mountains:
            "Hike or climb in nearby alpine zones before heading into Glacier.",
          lakesWater: "Paddle Whitefish Lake for a calm evening on the water.",
          desertForest:
            "Dense pine forests around town keep trails shaded and cool.",
          cycling:
            "Ride the Whitefish Trail network for quick singletrack loops.",
          scenicDrives:
            "Drive toward Glacier for iconic pullouts and viewpoints.",
          seasonalNotes:
            "Summer and early fall are best for lake paddles and Glacier access.",
        },
        thingsToDo: [
          "Paddle Whitefish Lake at sunset.",
          "Take a Glacier day trip.",
          "Hike a section of the Whitefish Trail.",
          "Book a guided climb.",
          "Explore downtown shops and cafés.",
        ],
        toursCopy: [
          "Evening lake tours are ideal for relaxed paddling and golden light.",
          "Climbing outings pair well with Glacier day trips.",
          "Half-day options keep schedules flexible for park drives.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Whitefish Trail hike.",
            "Afternoon: lake paddle or guided climb.",
            "Evening: dinner in town.",
          ],
          dayTwo: [
            "Morning: Glacier National Park drive.",
            "Afternoon: short hike near the park boundary.",
            "Evening: sunset at the lake.",
          ],
        },
        gettingThere: [
          "Glacier Park International Airport is about 20 minutes away.",
          "A car is helpful for Glacier access and regional trailheads.",
        ],
        faq: [
          {
            question: "How far is Glacier National Park?",
            answer:
              "The west entrance is about 30 minutes from downtown Whitefish.",
          },
          {
            question: "Is Whitefish Lake easy to access?",
            answer: "Yes, public access points and rentals are close to town.",
          },
        ],
      },
      {
        name: "Glacier National Park",
        slug: "glacier-national-park",
        stateSlug: "montana",
        region: "Flathead Valley",
        lat: 48.4964,
        lng: -113.9783,
        shortDescription:
          "Going-to-the-Sun Road, alpine lakes, whitewater rafting, and guided park tours.",
        intro: `Glacier National Park is Montana's Crown of the Continent—a million-acre wilderness of alpine peaks, turquoise lakes, and the legendary Going-to-the-Sun Road. West Glacier serves as the primary gateway for rafting on the Middle Fork Flathead River, scenic driving tours, and guided hikes.`,
        heroImages: [
          "https://media.tacdn.com/media/photo-w/2d/67/82/0b/caption.jpg",
        ],
        activityTags: ["hiking", "rafting", "wildlife"],
        whereItIs: [
          "West Glacier sits at the west entrance to Glacier National Park, about 30 minutes from Whitefish and Kalispell.",
          "Going-to-the-Sun Road connects Lake McDonald with Logan Pass and the park's eastern valleys.",
        ],
        experiences: {
          mountains:
            "Drive Going-to-the-Sun Road or hike trails from Logan Pass and Many Glacier.",
          lakesWater:
            "Raft the Middle Fork Flathead River or paddle Lake McDonald at sunset.",
          desertForest:
            "Old-growth cedar forests line valleys below the Continental Divide.",
          cycling:
            "E-bike tours explore Apgar Village and seasonal bike access on Sun Road.",
          scenicDrives:
            "Guided driving tours cover Lake McDonald, Logan Pass, and Two Medicine.",
          seasonalNotes:
            "Most tours run June through September when Going-to-the-Sun Road is fully open.",
        },
        thingsToDo: [
          "Raft whitewater on the Middle Fork Flathead River.",
          "Take a guided drive on Going-to-the-Sun Road.",
          "Walk the Trail of the Cedars near Apgar Village.",
          "Visit Polebridge Mercantile on a North Fork day trip.",
          "Spot mountain goats at Logan Pass.",
        ],
        toursCopy: [
          "Half-day rafting trips pair well with an afternoon lakeshore stop at Lake McDonald.",
          "Private driving tours handle Sun Road logistics and wildlife stops.",
          "Nature walks and e-bike outings suit travelers who want active time outside a vehicle.",
        ],
        weekendItinerary: {
          dayOne: [
            "Morning: Half-day whitewater rafting on the Middle Fork Flathead.",
            "Afternoon: Apgar Village and Lake McDonald shoreline.",
            "Evening: Sunset paddle or lodge dinner in West Glacier.",
          ],
          dayTwo: [
            "Morning: Guided drive on Going-to-the-Sun Road to Logan Pass.",
            "Afternoon: Nature walk or Two Medicine side trip.",
            "Evening: Return through West Glacier gateway towns.",
          ],
        },
        gettingThere: [
          "Glacier Park International Airport in Kalispell is about 30 minutes from West Glacier.",
          "A rental car helps for Sun Road access; many tours include hotel pickup.",
        ],
        faq: [
          {
            question: "When is Going-to-the-Sun Road open?",
            answer:
              "The road typically opens fully by late June and closes in October, depending on snow.",
          },
          {
            question: "Is whitewater rafting beginner-friendly?",
            answer:
              "Yes, half-day trips on the Middle Fork Flathead are designed for first-time rafters.",
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
    description:
      "Paddle along kelp forests and explore sea caves with a guide.",
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

const mississippiState: StateDestination = {
  slug: "mississippi",
  name: "Mississippi",
  description:
    "Riverfront towns, wetlands, and outdoor adventures across Mississippi.",
  featuredDescription:
    "Plan scenic river cruises, wetlands walks, and city-based outdoor tours across Mississippi.",
  heroImage:
    "https://dynamic-media.tacdn.com/media/photo-o/2f/b4/2c/9b/caption.jpg?w=1100&h=800&s=1",
  region: "Deep South",
  intro:
    "Mississippi blends riverfront history with wetlands ecosystems, creating practical options for guided outdoor experiences.",
  longDescription:
    "Mississippi offers travelers a mix of big-river scenery, wetlands habitat, and walkable historic districts that work well for flexible itineraries. Use Natchez as a base for river-based sightseeing and guided swamp walks, then layer in local food stops and downtown exploration between departures.",
  topRegions: [
    {
      title: "Riverfront experiences",
      description:
        "Cruise and sightseeing options along the Mississippi River corridor.",
    },
    {
      title: "Wetlands and bayous",
      description:
        "Guided swamp and nature walks that highlight local ecosystems.",
    },
    {
      title: "Historic city centers",
      description:
        "Compact downtown areas that pair easily with half-day tours.",
    },
  ],
  cities: [
    {
      name: "Bay Saint Louis",
      slug: "bay-saint-louis",
      stateSlug: "mississippi",
      region: "Deep South",
      lat: 30.315753,
      lng: -89.325394,
      shortDescription:
        "Coastal boat tours and relaxed bay sightseeing in Bay Saint Louis.",
      intro:
        "Bay Saint Louis is a Gulf Coast launch point for guided boat tours and easy waterfront exploration.",
      heroImages: [
        "https://dynamic-media.tacdn.com/media/photo-o/31/c2/9b/8f/caption.jpg?w=1100&h=800&s=1",
      ],
      activityTags: ["boat-tour", "sightseeing", "coastal"],
      whereItIs: [
        "Bay Saint Louis sits on Mississippi's Gulf Coast, west of Gulfport and Biloxi, with direct access to bays and coastal waterways.",
        "The city works well for short on-water itineraries that pair a guided boat tour with waterfront dining and walkable downtown stops.",
      ],
      experiences: {
        mountains:
          "Bay Saint Louis is coastal and low-elevation, with water-focused experiences instead of mountain terrain.",
        lakesWater:
          "Guided boat tours provide broad views of the bay, marinas, and nearby shoreline habitats.",
        desertForest:
          "The surrounding coast includes marsh and wetland ecosystems that support birdlife and calm-water sightseeing.",
        cycling:
          "Flat local roads and waterfront segments can be explored by bike before or after boat departures.",
        scenicDrives:
          "The Gulf Coast route offers easy scenic driving between Bay Saint Louis and nearby Mississippi beach towns.",
        seasonalNotes:
          "Spring and fall usually bring comfortable weather for combining water excursions with downtown walking.",
      },
      thingsToDo: [
        "Join a Bay Saint Louis sightseeing boat tour for coastal views.",
        "Explore the waterfront and marina areas before departure time.",
        "Pair your on-water outing with local food and walkable Old Town streets.",
      ],
      toursCopy: [
        "Book a guided bay cruise for a simple half-day outdoor plan.",
        "Use Bay Saint Louis as a coastal base for relaxed sightseeing.",
      ],
      nearby: ["Gulfport", "Biloxi", "Pass Christian"],
      bestFor: [
        "Boat sightseeing",
        "Coastal day trips",
        "Relaxed outdoor pacing",
      ],
      logistics: [
        "Arrive early for parking and marina check-in.",
        "Bring sun protection and light layers for wind on the water.",
      ],
      seasonalTips: [
        "Morning departures often bring calmer water and softer light.",
        "Warm-season afternoons can be humid; plan hydration.",
      ],
      faq: [
        {
          q: "What outdoor tours are common in Bay Saint Louis?",
          a: "Guided sightseeing boat tours are a core outdoor option in Bay Saint Louis.",
        },
      ],
    },
    {
      name: "Natchez",
      slug: "natchez",
      stateSlug: "mississippi",
      region: "Deep South",
      lat: 31.560444,
      lng: -91.403171,
      shortDescription:
        "River cruises, swamp walks, and guided outdoor experiences around Natchez.",
      intro:
        "Natchez is a practical base for river and wetlands tours in southwest Mississippi.",
      heroImages: [
        "https://dynamic-media.tacdn.com/media/photo-o/2f/b4/2c/9b/caption.jpg?w=1100&h=800&s=1",
      ],
      activityTags: ["river-cruise", "nature-walk", "sightseeing"],
      whereItIs: [
        "Natchez sits on bluffs above the Mississippi River in southwest Mississippi, close to wetlands and lowland habitats.",
        "The city works well for short outdoor itineraries that combine water-based sightseeing and guided nature walks.",
      ],
      experiences: {
        mountains:
          "Natchez focuses on river overlooks and bluff viewpoints rather than mountain terrain.",
        lakesWater:
          "River cruise departures provide broad views and on-water sightseeing along the Mississippi.",
        desertForest:
          "Wetlands and swamp habitats near Natchez support nature walks with local ecological context.",
        cycling:
          "Downtown streets and nearby roads can be paired with casual cycling between tour departures.",
        scenicDrives:
          "The Great River Road offers easy scenic drive options near Natchez.",
        seasonalNotes:
          "Spring and fall often bring comfortable weather for combining cruises with walking segments.",
      },
      thingsToDo: [
        "Join a Mississippi River cruise for city and river views.",
        "Take a guided swamp walk to learn about regional wetlands.",
        "Explore Natchez riverfront overlooks and historic streets.",
      ],
      toursCopy: [
        "Book a half-day river-and-swamp itinerary for a compact outdoor experience.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: riverfront walk and local breakfast.",
          "Afternoon: Mississippi River cruise departure.",
          "Evening: downtown Natchez dining.",
        ],
        dayTwo: [
          "Morning: guided swamp walk.",
          "Afternoon: explore historic Natchez neighborhoods.",
          "Evening: sunset river overlook.",
        ],
      },
      gettingThere: [
        "Natchez is typically reached by car from regional airports in Louisiana and Mississippi.",
      ],
      faq: [
        {
          question: "Can I combine river and swamp experiences in one trip?",
          answer:
            "Yes. Natchez itineraries are commonly structured around a river cruise plus a wetlands walking segment.",
        },
      ],
    },
  ],
};

const minnesotaState: StateDestination = {
  slug: "minnesota",
  name: "Minnesota",
  description:
    "North woods trails, lake-country paddling, and Twin Cities basecamps.",
  featuredDescription:
    "City-to-lakes itineraries with guided outings across Minnesota’s four-season landscapes.",
  heroImage:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
  region: "Heartland",
  intro:
    "Minnesota blends urban access with lake-country adventure, making it easy to pair city stays with guided outdoor days.",
  longDescription:
    "Minnesota is built for travelers who want flexible, water-forward itineraries. From the Twin Cities to North Shore gateways, guided experiences range from easy city excursions to wilderness-focused outings around lakes, forests, and river corridors.",
  topRegions: [
    {
      title: "Twin Cities",
      description:
        "Minneapolis and Saint Paul provide easy access to river parks, bike paths, and day tours.",
    },
    {
      title: "North Shore & Lake Country",
      description:
        "Duluth and northern hubs open up shoreline drives, paddling routes, and scenic forest adventures.",
    },
  ],
  cities: [
    {
      name: "Minneapolis",
      slug: "minneapolis",
      stateSlug: "minnesota",
      region: "Twin Cities",
      lat: 44.9778,
      lng: -93.265,
      shortDescription:
        "Urban basecamp with river trails, lakes, and year-round day tours.",
      intro:
        "Minneapolis pairs city convenience with easy access to waterfront parks, bike networks, and guided outings.",
      heroImages: [
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
      ],
      activityTags: ["hiking", "cycling", "paddling"],
      whereItIs: [
        "Minneapolis sits along the Mississippi River in eastern Minnesota, linked to Saint Paul and a broad metro trail network.",
      ],
      experiences: {
        mountains:
          "Regional bluffs and river overlooks deliver easy half-day hikes.",
        lakesWater:
          "City lakes and nearby waterways support paddling and sightseeing tours.",
        desertForest:
          "Forest parks and river greenways shape most outdoor routes here.",
        cycling:
          "Miles of connected bike trails make guided rides beginner-friendly.",
        scenicDrives:
          "Short drives reach lake towns, bluff roads, and state-park day trips.",
        seasonalNotes:
          "Summer and early fall are peak for biking and paddling, while winter adds snow-focused tours.",
      },
      thingsToDo: [
        "Ride the city lakes bike loop.",
        "Explore riverfront parks and stone-arch viewpoints.",
        "Take a guided city-and-waterways tour.",
      ],
      toursCopy: [
        "Minneapolis tours work well as half-day add-ons between museum, food, and neighborhood stops.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: riverfront walk and local coffee.",
          "Afternoon: guided city highlight tour.",
          "Evening: dinner in the North Loop.",
        ],
        dayTwo: [
          "Morning: bike trail loop around city lakes.",
          "Afternoon: paddle or park outing.",
          "Evening: sunset along the Mississippi.",
        ],
      },
      gettingThere: [
        "MSP Airport provides national connections and quick access to downtown.",
      ],
      faq: [
        {
          question:
            "Is Minneapolis good for outdoor trips without long drives?",
          answer:
            "Yes. Trails, waterfront routes, and guided experiences are accessible from central neighborhoods.",
        },
      ],
    },
    {
      name: "Duluth",
      slug: "duluth",
      stateSlug: "minnesota",
      region: "North Shore",
      lat: 46.7867,
      lng: -92.1005,
      shortDescription:
        "Lake Superior gateway for shoreline hikes and scenic tours.",
      intro:
        "Duluth anchors North Shore adventures with quick access to lake views, forest trails, and day-trip routes.",
      heroImages: [],
      activityTags: ["hiking", "scenic-drives", "waterfront"],
      whereItIs: [
        "Duluth sits at the western tip of Lake Superior, serving as a launch point for North Shore itineraries.",
      ],
      experiences: {
        mountains: "Ridge trails above the lake deliver broad Superior views.",
        lakesWater:
          "Harbor cruises and shoreline walks define many first-time visits.",
        desertForest:
          "Pine forests and rocky shoreline parks dominate local terrain.",
        cycling: "Lakefront paths offer easy, scenic riding options.",
        scenicDrives: "Highway 61 day trips are a Minnesota classic.",
        seasonalNotes:
          "Late spring through fall is ideal for mixed hiking and shoreline touring.",
      },
      thingsToDo: [
        "Walk Canal Park.",
        "Plan a North Shore scenic drive.",
        "Visit lake overlooks and local trailheads.",
      ],
      toursCopy: [
        "Duluth-based tours are great for combining city comforts with North Shore scenery.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Canal Park stroll.",
          "Afternoon: guided shoreline outing.",
          "Evening: harbor sunset.",
        ],
        dayTwo: [
          "Morning: North Shore drive.",
          "Afternoon: waterfall or ridge hike.",
          "Evening: return to Duluth.",
        ],
      },
      gettingThere: [
        "Drive from the Twin Cities in about 2.5 hours or fly into Duluth International Airport.",
      ],
      faq: [
        {
          question: "Can I do North Shore highlights in a weekend?",
          answer:
            "Yes. Base in Duluth and prioritize one scenic drive plus one guided outdoor tour.",
        },
      ],
    },
  ],
  isFallback: true,
};

const hawaiiState: StateDestination = {
  slug: "hawaii",
  name: "Hawaii",
  description:
    "Volcanic peaks, reef-lined coasts, and Polynesian culture across the Pacific.",
  featuredDescription:
    "Island adventures from Pearl Harbor history to North Shore surf and circle-island day trips.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/08/6c/5d/e9.jpg",
  region: "Pacific",
  intro:
    "Hawaii pairs volcanic landscapes with reef snorkeling, luau culture, and legendary Oahu day-trip routes.",
  longDescription:
    "Hawaii's islands deliver layered outdoor travel—coastal cliffs, rainforest waterfalls, and historic memorials within a single day's drive on Oahu.",
  topRegions: [
    {
      title: "Honolulu & Waikiki",
      description:
        "Urban basecamp for Pearl Harbor, Diamond Head, and reef excursions.",
    },
    {
      title: "North Shore & Windward Coast",
      description:
        "Surf breaks, waterfall valleys, and circle-island scenic drives.",
    },
  ],
  cities: [
    {
      name: "Honolulu",
      slug: "honolulu",
      stateSlug: "hawaii",
      region: "Oahu",
      lat: 21.3069,
      lng: -157.8583,
      shortDescription:
        "Waikiki basecamp for Pearl Harbor, circle-island, and reef tours.",
      intro:
        "Honolulu anchors Oahu itineraries with quick access to Pearl Harbor, Diamond Head, and North Shore day trips.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/08/6c/5d/e9.jpg",
      ],
      activityTags: ["snorkeling", "hiking", "cultural-tours"],
      whereItIs: [
        "Honolulu sits on Oahu's south shore with Waikiki Beach and Diamond Head as signature landmarks.",
      ],
      experiences: {
        mountains: "Hike Diamond Head crater or Manoa Valley waterfall trails.",
        lakesWater: "Snorkel Hanauma Bay reefs or sail off Waikiki.",
        desertForest:
          "Explore rainforest valleys and botanical gardens on guided hikes.",
        cycling: "Coastal paths and guided bike routes around Honolulu.",
        scenicDrives:
          "Circle-island tours reach North Shore, Dole Plantation, and Waimea Valley.",
        seasonalNotes:
          "Winter brings North Shore surf season; summer offers calmer snorkeling conditions.",
      },
      thingsToDo: [
        "Visit Pearl Harbor and the USS Arizona Memorial.",
        "Take a full-day Oahu circle-island tour.",
        "Snorkel with sea turtles on the North Shore.",
      ],
      toursCopy: [
        "Honolulu tours work best as full-day guided experiences with Waikiki hotel pickup.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Pearl Harbor and USS Missouri.",
          "Afternoon: Honolulu city highlights.",
          "Evening: Waikiki luau or sunset sail.",
        ],
        dayTwo: [
          "Morning: Circle-island tour with North Shore stops.",
          "Afternoon: Snorkel or beach time on the windward coast.",
          "Evening: Return via scenic Pali Lookout.",
        ],
      },
      gettingThere: [
        "Daniel K. Inouye International Airport serves Honolulu with direct flights from the mainland.",
        "Waikiki hotels are the main pickup hub for guided Oahu tours.",
      ],
      faq: [
        {
          question: "What are the signature Honolulu tours?",
          answer:
            "Pearl Harbor memorial tours, Oahu circle-island day trips, and reef snorkeling excursions are the most popular departures.",
        },
      ],
    },
    {
      name: "Maui",
      slug: "maui",
      stateSlug: "hawaii",
      region: "Maui",
      lat: 20.7984,
      lng: -156.3319,
      shortDescription:
        "Road to Hana coastline, Haleakala summit, and Molokini reef tours.",
      intro:
        "Maui pairs volcanic summit views with rainforest coastline, snorkel reefs, and West Maui adventure routes.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/5b/de/c9.jpg",
      ],
      activityTags: ["helicopter", "snorkeling", "hiking"],
      whereItIs: [
        "Maui sits in the Hawaiian Islands between Oahu and the Big Island, with Kahului as the main gateway and resort corridors in West and South Maui.",
      ],
      experiences: {
        mountains:
          "Summit Haleakala for sunrise or sunset and hike waterfall canyons on the Hana coast.",
        lakesWater:
          "Snorkel Molokini Crater and watch seasonal humpback whales off Ma'alaea.",
        desertForest:
          "Explore West Maui valleys, rainforest ziplines, and ATV ranch trails.",
        cycling: "Coastal bike paths and guided downhill routes from Haleakala.",
        scenicDrives:
          "Road to Hana and Upcountry routes connect waterfalls, black sand beaches, and summit overlooks.",
        seasonalNotes:
          "Winter brings whale season and cooler summit mornings; summer favors calmer snorkel days.",
      },
      thingsToDo: [
        "Drive or tour the Road to Hana with waterfall and black-sand beach stops.",
        "Watch sunrise or sunset from Haleakala National Park.",
        "Snorkel Molokini Crater or join a West Maui helicopter flight.",
      ],
      toursCopy: [
        "Maui tours work best as full-day guided experiences with hotel pickup from West Maui, South Maui, or Kahului.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Road to Hana waterfalls and Wai'anapanapa State Park.",
          "Afternoon: Hana town and coastal lookouts.",
          "Evening: Oceanfront luau in Lahaina or Wailea.",
        ],
        dayTwo: [
          "Morning: Haleakala summit sunrise or daytime crater overlooks.",
          "Afternoon: Molokini snorkel sail or West Maui ATV adventure.",
          "Evening: Sunset cruise or Upcountry dinner.",
        ],
      },
      gettingThere: [
        "Kahului Airport (OGG) is Maui's main gateway with mainland and interisland flights.",
        "West Maui and South Maui hotels are common pickup points for guided tours.",
      ],
      faq: [
        {
          question: "What are the signature Maui tours?",
          answer:
            "Road to Hana private tours, Haleakala sunrise or sunset trips, Molokini snorkel sails, and West Maui helicopter flights are among the most popular departures.",
        },
      ],
    },
    {
      name: "Kauai",
      slug: "kauai",
      stateSlug: "hawaii",
      region: "Kauai",
      lat: 22.0964,
      lng: -159.5261,
      shortDescription:
        "Waimea Canyon overlooks, Na Pali coastline, and Garden Isle adventure tours.",
      intro:
        "Kauai pairs red canyon viewpoints with Na Pali sea cliffs, rainforest waterfalls, and island cultural experiences.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/2c/e4/71.jpg",
      ],
      activityTags: ["helicopter", "snorkeling", "hiking"],
      whereItIs: [
        "Kauai is the northernmost main Hawaiian Island, with Lihue as the primary gateway and resort corridors in Poipu, Kapaa, and Princeville.",
      ],
      experiences: {
        mountains:
          "Overlook Waimea Canyon and Koke'e ridges, or fly above Mount Waialeale and hidden waterfall valleys.",
        lakesWater:
          "Kayak the Wailua River, snorkel Na Pali reefs, and cruise sea caves along the northwest coast.",
        desertForest:
          "Explore south-shore lookouts, rainforest ziplines near Koloa, and coffee country on the west side.",
        cycling: "Coastal bike paths and quiet plantation roads around south and east Kauai.",
        scenicDrives:
          "West-side canyon routes and south-to-east coastal drives connect Spouting Horn, coffee estates, and waterfall lookouts.",
        seasonalNotes:
          "Trade winds shape Na Pali boat days; winter can bring bigger surf and cooler canyon mornings.",
      },
      thingsToDo: [
        "Tour Waimea Canyon overlooks and west-side coffee stops with a guided driver.",
        "Fly a doors-off helicopter over Na Pali Coast and Manawaiopuna Falls.",
        "Kayak and hike to Secret Falls or join a Na Pali Zodiac expedition.",
      ],
      toursCopy: [
        "Kauai tours work best as guided half-day and full-day experiences with hotel pickup from Poipu, Kapaa, Lihue, or Princeville.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Waimea Canyon and Kalalau Lookout viewpoints.",
          "Afternoon: Spouting Horn and south-shore coastal stops.",
          "Evening: Luau dinner and show at Kilohana Plantation.",
        ],
        dayTwo: [
          "Morning: Na Pali Coast boat or Zodiac sea-cave run.",
          "Afternoon: Helicopter flight or Secret Falls kayak and hike.",
          "Evening: Quiet beach time in Poipu or Kapaa.",
        ],
      },
      gettingThere: [
        "Lihue Airport (LIH) is Kauai's main gateway with mainland and interisland flights.",
        "Poipu, Kapaa, Lihue, and Princeville hotels are common pickup points for guided tours.",
      ],
      faq: [
        {
          question: "What are the signature Kauai tours?",
          answer:
            "Waimea Canyon sightseeing, Na Pali Coast boat or Zodiac trips, doors-off helicopter flights, and Wailua River kayak-and-hike adventures are among the most popular departures.",
        },
      ],
    },
    {
      name: "Kona",
      slug: "kona",
      stateSlug: "hawaii",
      region: "Big Island",
      lat: 19.6399,
      lng: -155.9969,
      shortDescription:
        "Kona coast helicopter flights, Mauna Kea stargazing, and Big Island adventure tours.",
      intro:
        "Kona anchors west Big Island itineraries with coastal helicopter routes, Mauna Kea summit nights, coffee-country farms, and off-road adventures.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/18/96/9c.jpg",
      ],
      activityTags: ["helicopter", "stargazing", "hiking"],
      whereItIs: [
        "Kona sits on the west side of Hawaii's Big Island, with Kailua-Kona and the Kohala Coast as primary resort and tour-departure corridors.",
      ],
      experiences: {
        mountains:
          "Ride to Mauna Kea summit for sunset and stargazing, or hike Hualalai's hidden craters above the Kona coast.",
        lakesWater:
          "Pair coastal days with waterfall ziplines, Waipio horseback rides, and Kohala valley helicopter views.",
        desertForest:
          "Explore southside ATV ranchlands, lava flows, and Kona coffee plantations between coastal lookouts.",
        cycling: "Coastal paths and quieter coffee-country roads around Kailua-Kona.",
        scenicDrives:
          "Routes link Ali'i Drive, coffee belt farms, Kohala Coast resorts, and Mauna Kea access corridors.",
        seasonalNotes:
          "Evenings cool quickly at Mauna Kea elevation; trade winds shape coastal flight and ocean days.",
      },
      thingsToDo: [
        "Fly a Kona Coast or Kohala waterfall helicopter tour.",
        "Join a Mauna Kea summit sunset and stargazing outing.",
        "Hike Hualalai's hidden craters or tour a Kona coffee and chocolate farm.",
      ],
      toursCopy: [
        "Kona tours work best as guided half-day and full-day experiences with hotel pickup from Kailua-Kona, Waikoloa, or the Kohala Coast.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Kona Coast or Kohala helicopter flight.",
          "Afternoon: Coffee and chocolate farm tour or southside ATV ride.",
          "Evening: Island Breeze Luau or waterfront dinner in Kailua-Kona.",
        ],
        dayTwo: [
          "Morning: Hidden Craters Hike on Hualalai.",
          "Afternoon: Waipio horseback ride or waterfall zipline.",
          "Evening: Mauna Kea summit sunset and stargazing.",
        ],
      },
      gettingThere: [
        "Kona International Airport (KOA) is the main west Big Island gateway.",
        "Kailua-Kona, Waikoloa, and Kohala Coast hotels are common pickup points for guided tours.",
      ],
      faq: [
        {
          question: "What are the signature Kona tours?",
          answer:
            "Kona Coast and Kohala helicopter flights, Mauna Kea stargazing, Hualalai crater hikes, ATV adventures, and Kona coffee farm tours are among the most popular departures.",
        },
      ],
    },
    {
      name: "Hawaii Volcanoes National Park",
      slug: "hawaii-volcanoes-national-park",
      stateSlug: "hawaii",
      region: "Big Island",
      lat: 19.4194,
      lng: -155.2885,
      shortDescription:
        "Kilauea crater overlooks, lava landscapes, and Big Island volcano day tours.",
      intro:
        "Hawaii Volcanoes National Park anchors Big Island itineraries with active crater views, rainforest lava tubes, and coastal black-sand routes.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/12/54/58.jpg",
      ],
      activityTags: ["hiking", "helicopter", "sightseeing"],
      whereItIs: [
        "Hawaii Volcanoes National Park sits on the southeast Big Island, with common tour departures from Kona, the Kohala Coast, and Hilo.",
      ],
      experiences: {
        mountains:
          "Walk crater-rim overlooks, steam vents, and lava fields around Kilauea and Mauna Loa approaches.",
        lakesWater:
          "Pair park days with Rainbow Falls, Akaka Falls, and black-sand beaches along the southeast coast.",
        desertForest:
          "Move between rainforest trails, lava tubes, and open volcanic plains inside the park.",
        cycling: "Scenic road touring connects Kona coffee country to park gateways.",
        scenicDrives:
          "Saddle Road, Chain of Craters approaches, and coastal routes link volcano, waterfall, and black-sand stops.",
        seasonalNotes:
          "Weather can shift quickly at elevation; evenings are cooler for twilight and Mauna Kea stargazing add-ons.",
      },
      thingsToDo: [
        "Tour Hawaii Volcanoes National Park with a guided crater and lava-tube itinerary.",
        "Add Mauna Kea sunset and stargazing or a Big Island helicopter flight.",
        "Visit Punalu'u Black Sand Beach and Hilo waterfalls on a full-day circle route.",
      ],
      toursCopy: [
        "Hawaii Volcanoes National Park tours work best as full-day guided experiences with hotel pickup from Kona, Kohala, or Hilo.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Kona coffee country and Punalu'u Black Sand Beach.",
          "Afternoon: Hawaii Volcanoes National Park crater overlooks and Thurston Lava Tube.",
          "Evening: Twilight volcano viewpoints or a Volcano Village dinner.",
        ],
        dayTwo: [
          "Morning: Hilo waterfalls or a volcano helicopter flight.",
          "Afternoon: Additional park hiking or coastal lookouts.",
          "Evening: Mauna Kea sunset and stargazing when weather allows.",
        ],
      },
      gettingThere: [
        "Kona International Airport (KOA) and Hilo International Airport (ITO) are the main Big Island gateways.",
        "Kona, Kohala Coast, and Hilo hotels are common pickup points for guided volcano tours.",
      ],
      faq: [
        {
          question: "What are the signature Hawaii Volcanoes National Park tours?",
          answer:
            "Full-day volcano sightseeing from Kona or Hilo, private park guiding, Mauna Kea stargazing, and Big Island helicopter flights over Kilauea are among the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const wyomingState: StateDestination = {
  slug: "wyoming",
  name: "Wyoming",
  description:
    "Wide-open basins, alpine peaks, and iconic national park gateways.",
  featuredDescription:
    "Wild landscapes and mountain towns that make Wyoming a year-round adventure basecamp.",
  heroImage:
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80",
  region: "West",
  intro:
    "Wyoming combines Yellowstone and Grand Teton access with wide-open spaces and classic mountain-town adventures.",
  longDescription:
    "Wyoming is built for travelers who want big-sky drives, wildlife-rich valleys, and trail networks that start minutes from town.",
  topRegions: [
    {
      title: "Jackson Hole & Teton Valley",
      description:
        "Alpine hikes, wildlife drives, and river adventures anchored by Jackson.",
    },
    {
      title: "Yellowstone Gateways",
      description:
        "Geothermal basins, canyon overlooks, and guided park touring from Cody and nearby hubs.",
    },
  ],
  cities: [
    {
      name: "Jackson",
      slug: "jackson",
      stateSlug: "wyoming",
      region: "Jackson Hole",
      lat: 43.4799,
      lng: -110.7624,
      shortDescription:
        "Mountain-town basecamp for Tetons and Yellowstone day tours.",
      intro:
        "Jackson is a high-energy mountain town with quick access to iconic Wyoming landscapes.",
      heroImages: [
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80",
      ],
      activityTags: ["hiking", "wildlife", "scenic-drives"],
      whereItIs: [
        "Jackson sits in northwestern Wyoming, framed by the Teton Range and wildlife-rich valleys.",
      ],
      experiences: {
        mountains: "Ride or hike ridge lines with expansive Teton views.",
        lakesWater:
          "Plan float trips and lakeside stops during summer itineraries.",
        desertForest:
          "High-elevation forests and sage valleys create varied terrain.",
        cycling: "Ride scenic roads and paved paths around the valley floor.",
        scenicDrives:
          "Use Jackson as a launch point for Grand Teton and Yellowstone loops.",
        seasonalNotes:
          "Summer and early fall are prime for trails; winter adds snow-focused adventures.",
      },
      thingsToDo: [
        "Visit Grand Teton viewpoints and lakes.",
        "Plan a Yellowstone day trip.",
        "Take a guided wildlife-spotting drive.",
      ],
      toursCopy: [
        "Jackson tours work well as full-day experiences paired with flexible evenings in town.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Teton scenic drive.",
          "Afternoon: guided trail or wildlife tour.",
          "Evening: downtown Jackson dinner.",
        ],
        dayTwo: [
          "Morning: Yellowstone gateway route.",
          "Afternoon: canyon viewpoints and geyser basins.",
          "Evening: return via scenic valley overlooks.",
        ],
      },
      gettingThere: [
        "Jackson Hole Airport provides direct regional and seasonal national flights.",
      ],
      faq: [
        {
          question: "Can I visit Grand Teton and Yellowstone in one trip?",
          answer:
            "Yes. Many visitors use Jackson as a base and split park days for a more relaxed pace.",
        },
      ],
    },
    {
      name: "Yellowstone National Park",
      slug: "yellowstone-national-park",
      stateSlug: "wyoming",
      region: "Yellowstone",
      lat: 44.428,
      lng: -110.5885,
      shortDescription:
        "Geysers, wildlife valleys, canyon overlooks, and multi-day park expeditions.",
      intro:
        "Yellowstone National Park is America's first national park—a volcanic landscape of geysers, hot springs, bison-filled valleys, and the Grand Canyon of the Yellowstone.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/d9/ee/1d.jpg",
      ],
      activityTags: ["wildlife", "hiking", "geysers"],
      whereItIs: [
        "Yellowstone spans northwestern Wyoming with entrances at West Yellowstone, Gardiner, Cody, and Jackson gateway routes.",
        "Most guided tours depart from West Yellowstone, Gardiner, or in-park lodges for wildlife and geyser basin loops.",
      ],
      experiences: {
        mountains:
          "Hike canyon rims, geyser basins, and Lamar Valley trails with certified guides.",
        lakesWater:
          "Kayak Yellowstone Lake and photograph geothermal shorelines on half-day paddles.",
        desertForest:
          "Alpine meadows, lodgepole forests, and thermal basins create dramatic contrast.",
        cycling: "Seasonal e-bike routes explore geyser basins on guided park tours.",
        scenicDrives:
          "Upper and lower loop drives connect Old Faithful, Grand Prismatic, and Lamar Valley.",
        seasonalNotes:
          "Summer is peak wildlife and geyser season; winter brings snowcoach and photo safaris.",
      },
      thingsToDo: [
        "Watch Old Faithful and walk the Upper Geyser Basin boardwalks.",
        "Scan Lamar Valley for wolves, bison, and elk on a wildlife safari.",
        "Photograph Grand Prismatic Spring and Fairy Falls overlooks.",
        "Hike the Grand Canyon of the Yellowstone rim to Artist Point.",
        "Book a multi-day private upper and lower loop expedition.",
      ],
      toursCopy: [
        "Private and small-group tours help you time Lamar Valley wildlife activity and geyser eruptions.",
        "Multi-day packages cover both loops without rushing the park's signature sights.",
        "Photo safaris and hiking tours suit travelers who want trail time beyond roadside overlooks.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Lamar Valley wildlife drive.",
          "Afternoon: Mammoth Hot Springs and Norris Geyser Basin.",
          "Evening: Return via Hayden Valley overlooks.",
        ],
        dayTwo: [
          "Morning: Old Faithful and Grand Prismatic Spring.",
          "Afternoon: Grand Canyon of the Yellowstone hike.",
          "Evening: West Yellowstone or Gardiner return.",
        ],
      },
      gettingThere: [
        "West Yellowstone Airport and Bozeman Yellowstone International Airport serve most guided tour departures.",
      ],
      faq: [
        {
          question: "How many days do I need in Yellowstone?",
          answer:
            "Two full days cover the upper and lower loops; wildlife-focused travelers often add a third day in Lamar Valley.",
        },
        {
          question: "Are private tours worth it in Yellowstone?",
          answer:
            "Private guides adjust timing for wildlife activity, geyser eruptions, and family-friendly hikes that crowded buses miss.",
        },
      ],
    },
  ],
  isFallback: true,
};

const illinoisState: StateDestination = {
  slug: "illinois",
  name: "Illinois",
  description: "Lakefront cities, river architecture, and guided urban adventures.",
  featuredDescription:
    "Explore Chicago tours with architecture cruises, food walks, and skyline sightseeing.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/aa/41/ca.jpg",
  region: "Midwest",
  intro:
    "Illinois pairs Great Lakes scenery with walkable city districts and curated guided experiences.",
  longDescription:
    "Chicago anchors Illinois tour inventory with river cruises, neighborhood walks, and premium sightseeing across the Loop and lakefront.",
  topRegions: [
    {
      title: "Chicago lakefront",
      description:
        "Architecture cruises, skyline sails, and lakefront tours along Lake Michigan.",
    },
    {
      title: "Loop and riverfront",
      description:
        "Walking, food, and history tours through downtown Chicago districts.",
    },
  ],
  cities: [
    {
      name: "Chicago",
      slug: "chicago",
      stateSlug: "illinois",
      region: "Chicago",
      lat: 41.8781,
      lng: -87.6298,
      shortDescription:
        "Architecture cruises, food tours, and skyline sightseeing in Chicago.",
      intro:
        "Chicago is a lakefront city with river cruises, guided food walks, and premium urban tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/aa/41/ca.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "cruises"],
      whereItIs: [
        "Chicago sits on Lake Michigan in northeastern Illinois with the Chicago River running through downtown.",
        "Most guided tours depart from the Loop, river docks, and lakefront neighborhoods.",
      ],
      experiences: {
        mountains:
          "Chicago is a flat lakefront city; tours focus on architecture and urban districts.",
        lakesWater:
          "Lake Michigan cruises and river architecture tours highlight the skyline from the water.",
        desertForest:
          "Parks and lakefront trails offer green space between urban sightseeing routes.",
        cycling:
          "Guided bike tours explore lakefront paths and neighborhood corridors.",
        scenicDrives:
          "Private driving tours cover lakefront boulevards and landmark districts.",
        seasonalNotes:
          "Summer and early fall are popular for lake cruises; winter adds holiday light tours.",
      },
      thingsToDo: [
        "Cruise the Chicago River for architecture commentary.",
        "Join a guided food or walking tour in the Loop.",
        "Sail Lake Michigan for skyline views at sunset.",
      ],
      toursCopy: [
        "Book an architecture river cruise for a compact introduction to Chicago.",
        "Pair a food tour with a lakefront cruise for a full-day city itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: architecture river cruise.",
          "Afternoon: Loop walking or food tour.",
          "Evening: Lake Michigan sunset sail.",
        ],
        dayTwo: [
          "Morning: neighborhood or bike tour.",
          "Afternoon: museum or helicopter sightseeing.",
          "Evening: dinner in River North or West Loop.",
        ],
      },
      gettingThere: [
        "O'Hare and Midway airports serve Chicago with rail and rideshare links to downtown.",
      ],
      faq: [
        {
          question: "What are the signature Chicago tours?",
          answer:
            "Architecture river cruises, lakefront sails, and guided food walks are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const massachusettsState: StateDestination = {
  slug: "massachusetts",
  name: "Massachusetts",
  description:
    "Historic harbor cities, Freedom Trail landmarks, and New England coastal adventures.",
  featuredDescription:
    "Explore Boston tours with harbor cruises, Freedom Trail walks, and North End food experiences.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/94/3a/b2.jpg",
  region: "Northeast",
  intro:
    "Massachusetts pairs Revolutionary history with walkable harbor districts and curated guided experiences.",
  longDescription:
    "Boston anchors Massachusetts tour inventory with harbor cruises, Freedom Trail walks, and premium sightseeing across the North End and waterfront.",
  topRegions: [
    {
      title: "Boston Harbor",
      description:
        "Historic sightseeing cruises, whale watching, and sunset sails from Long Wharf.",
    },
    {
      title: "Freedom Trail and North End",
      description:
        "Walking, food, and history tours through Revolutionary Boston districts.",
    },
  ],
  cities: [
    {
      name: "Boston",
      slug: "boston",
      stateSlug: "massachusetts",
      region: "Boston",
      lat: 42.3601,
      lng: -71.0589,
      shortDescription:
        "Harbor cruises, Freedom Trail tours, and North End food walks in Boston.",
      intro:
        "Boston is a harbor city with historic cruises, guided food walks, and premium Revolutionary history tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/94/3a/b2.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "cruises"],
      whereItIs: [
        "Boston sits on Massachusetts Bay with the Charles River and Boston Harbor framing downtown.",
        "Most guided tours depart from Long Wharf, the North End, and Freedom Trail meeting points.",
      ],
      experiences: {
        mountains:
          "Boston is a coastal city; tours focus on harbor history and walkable districts.",
        lakesWater:
          "Boston Harbor cruises and whale watching highlight the waterfront from the water.",
        desertForest:
          "Public Garden, Boston Common, and the Esplanade offer green space between urban sightseeing routes.",
        cycling:
          "Guided bike tours explore the Emerald Necklace and harborfront paths.",
        scenicDrives:
          "Private driving tours cover Beacon Hill, Back Bay, and coastal day trips to Salem.",
        seasonalNotes:
          "Summer and early fall are popular for harbor cruises; autumn adds foliage day trips.",
      },
      thingsToDo: [
        "Cruise Boston Harbor for USS Constitution and skyline views.",
        "Walk the Freedom Trail with a licensed history guide.",
        "Join a North End food tour for Italian specialties and local markets.",
      ],
      toursCopy: [
        "Book a historic harbor cruise for a compact introduction to Boston.",
        "Pair a Freedom Trail walk with a North End food tour for a full-day city itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Boston Harbor historic sightseeing cruise.",
          "Afternoon: Freedom Trail walking tour.",
          "Evening: sunset harbor cruise.",
        ],
        dayTwo: [
          "Morning: North End food or bike tour.",
          "Afternoon: Salem or Lexington day trip.",
          "Evening: dinner in the Seaport or North End.",
        ],
      },
      gettingThere: [
        "Logan International Airport serves Boston with rail and rideshare links to downtown.",
      ],
      faq: [
        {
          question: "What are the signature Boston tours?",
          answer:
            "Harbor cruises, Freedom Trail walks, and North End food tours are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const spainState: StateDestination = {
  slug: "spain",
  name: "Spain",
  description:
    "Mediterranean city sightseeing, Gaudí landmarks, and Catalonia day trips from Barcelona.",
  featuredDescription:
    "Explore Barcelona tours with private Gaudí visits, Montserrat wine days, and Costa Brava adventures.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/fa/f1/fc.jpg",
  region: "Europe",
  intro:
    "Spain pairs walkable Barcelona districts with Gaudí landmarks, Mediterranean views, and curated guided experiences.",
  longDescription:
    "Barcelona anchors Spain tour inventory with private walking tours, skip-the-line Sagrada Familia visits, Park Güell routes, Montserrat wine days, and Costa Brava kayak or Girona day trips from the capital of Catalonia.",
  topRegions: [
    {
      title: "Barcelona and Gaudí",
      description:
        "Sagrada Familia, Park Güell, the Gothic Quarter, and Montjuïc sightseeing.",
    },
    {
      title: "Catalonia day trips",
      description:
        "Montserrat monastery visits, Penedès cava tastings, Girona, and Costa Brava.",
    },
  ],
  cities: [
    {
      name: "Barcelona",
      slug: "barcelona",
      stateSlug: "spain",
      region: "Catalonia",
      lat: 41.3874,
      lng: 2.1686,
      shortDescription:
        "Private Gaudí tours, Montserrat wine days, and Mediterranean sightseeing in Barcelona.",
      intro:
        "Barcelona is a Mediterranean city with Sagrada Familia, Park Güell, Gothic Quarter streets, and guided walking, cycling, and day-trip tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/fa/f1/fc.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "cycling"],
      whereItIs: [
        "Barcelona sits on Spain's Mediterranean coast with the Gothic Quarter, Eixample, and Montjuïc framing central sightseeing.",
        "Most guided tours depart from Plaça de Catalunya, the Gothic Quarter, cruise port hotels, and central Barcelona meeting points.",
      ],
      experiences: {
        mountains:
          "Montserrat day trips add monastery walks and mountain viewpoints beyond the Barcelona waterfront.",
        lakesWater:
          "Private sailing from Port Olímpic and Costa Brava kayak days highlight the Mediterranean coastline.",
        desertForest:
          "Park Güell terraces and Montjuïc gardens offer green space between urban sightseeing routes.",
        cycling:
          "Guided bike tours cover Sagrada Familia, Plaça del Rei, and Gothic Quarter corridors.",
        scenicDrives:
          "Private car tours cover Montserrat, Girona, Costa Brava villages, and Penedès vineyards.",
        seasonalNotes:
          "Spring and summer are popular for Park Güell, sailing, and Costa Brava kayaking; cooler months favor Gaudí interiors and Montserrat.",
      },
      thingsToDo: [
        "Visit Sagrada Familia and Park Güell with skip-the-line tickets.",
        "Walk the Gothic Quarter and look out from Montjuïc.",
        "Join a Montserrat and cava winery day or a Costa Brava kayak trip.",
      ],
      toursCopy: [
        "Book a private Gaudí walk for a compact introduction to Barcelona.",
        "Pair a Sagrada Familia visit with Park Güell or a Montserrat wine day.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Gothic Quarter walk and Sagrada Familia.",
          "Afternoon: Park Güell and Montjuïc viewpoints.",
          "Evening: Tapas in the Eixample or El Born.",
        ],
        dayTwo: [
          "Morning: Montserrat monastery or Penedès cava tasting.",
          "Afternoon: Girona Old Town or Costa Brava coves.",
          "Evening: Return to Barcelona for a waterfront dinner.",
        ],
      },
      gettingThere: [
        "Barcelona-El Prat Airport serves the city with metro, Aerobús, and rail links to Plaça de Catalunya and the Gothic Quarter.",
      ],
      faq: [
        {
          question: "What are the signature Barcelona tours?",
          answer:
            "Private Gaudí sightseeing, skip-the-line Sagrada Familia visits, Montserrat wine days, and Costa Brava kayak trips are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const unitedKingdomState: StateDestination = {
  slug: "united-kingdom",
  name: "United Kingdom",
  description:
    "Historic capital districts, royal landmarks, and guided London sightseeing.",
  featuredDescription:
    "Explore London tours with private walking routes, Thames cruises, and landmark sightseeing.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/74/00.jpg",
  region: "Europe",
  intro:
    "The United Kingdom pairs walkable London districts with royal landmarks, river views, and curated guided experiences.",
  longDescription:
    "London anchors United Kingdom tour inventory with private walking tours, black-cab sightseeing, Thames cruises, and premium food or wine days from the capital.",
  topRegions: [
    {
      title: "Westminster and the Thames",
      description:
        "Big Ben, Buckingham Palace, Westminster Abbey, and river cruises along the Thames.",
    },
    {
      title: "Tower and East End",
      description:
        "Tower of London visits, street-art walks, and Borough Market food tours.",
    },
  ],
  cities: [
    {
      name: "London",
      slug: "london",
      stateSlug: "united-kingdom",
      region: "London",
      lat: 51.5074,
      lng: -0.1278,
      shortDescription:
        "Private walking tours, Thames cruises, and landmark sightseeing in London.",
      intro:
        "London is a river city with royal palaces, Tower of London history, and guided walking, cycling, and food tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/74/00.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "cycling"],
      whereItIs: [
        "London sits on the River Thames with Westminster, the City, and the South Bank framing central sightseeing.",
        "Most guided tours depart from Westminster, Tower Hill, Covent Garden, and Central London hotels.",
      ],
      experiences: {
        mountains:
          "London is a river city; tours focus on royal landmarks, walking districts, and Thames views.",
        lakesWater:
          "Thames River cruises highlight Tower Bridge, the London Eye, and Westminster from the water.",
        desertForest:
          "Royal parks such as St James's Park and Hyde Park offer green space between urban sightseeing routes.",
        cycling:
          "Guided bike tours cover Westminster, Covent Garden, and landmark corridors.",
        scenicDrives:
          "Private black-cab and car tours cover Abbey Road, Buckingham Palace, and Tower of London photo stops.",
        seasonalNotes:
          "Spring and summer are popular for Changing of the Guard and river cruises; winter adds indoor palace and market walking.",
      },
      thingsToDo: [
        "Walk Westminster for Big Ben, Buckingham Palace, and Westminster Abbey.",
        "Visit the Tower of London and cruise the Thames.",
        "Join a private food walk at Borough Market or a black-cab landmark tour.",
      ],
      toursCopy: [
        "Book a private Westminster walk for a compact introduction to London.",
        "Pair a Tower of London visit with a Thames cruise for a full-day city itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Westminster walking tour and Changing of the Guard.",
          "Afternoon: Tower of London visit.",
          "Evening: Thames River cruise.",
        ],
        dayTwo: [
          "Morning: Borough Market food tour or bike landmarks.",
          "Afternoon: Greenwich maritime walk or Notting Hill private tour.",
          "Evening: West End dinner.",
        ],
      },
      gettingThere: [
        "Heathrow, Gatwick, and London City airports serve London with rail and Tube links to Westminster and the South Bank.",
      ],
      faq: [
        {
          question: "What are the signature London tours?",
          answer:
            "Private walking tours, Tower of London visits, Thames cruises, and black-cab sightseeing are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const scotlandState: StateDestination = {
  slug: "scotland",
  name: "Scotland",
  description:
    "Castle cities, Highland glens, whisky country, and guided day tours from Edinburgh.",
  featuredDescription:
    "Explore Edinburgh tours with private Highlands days, Royal Mile walking, whisky glens, and Arthur's Seat cycling.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/7b/ac/f1.jpg",
  region: "Europe",
  intro:
    "Scotland pairs walkable Edinburgh districts with castle ridgelines, Forth views, and guided Highland, whisky, and coastal days.",
  longDescription:
    "Edinburgh anchors Scotland tour inventory with Royal Mile castle walks, Arthur's Seat hiking and cycling, whisky glen days, and private Land Rover or chauffeur routes into Glencoe, Loch Ness, Stirling, and St Andrews.",
  topRegions: [
    {
      title: "Old Town and the Royal Mile",
      description:
        "Edinburgh Castle, St Giles' Cathedral, and guided walking or food tours through UNESCO Old Town.",
    },
    {
      title: "Highlands and whisky country",
      description:
        "Glencoe, Loch Ness, Stirling Castle, and distillery days reachable from Edinburgh.",
    },
  ],
  cities: [
    {
      name: "Edinburgh",
      slug: "edinburgh",
      stateSlug: "scotland",
      region: "Edinburgh",
      lat: 55.9533,
      lng: -3.1883,
      shortDescription:
        "Private Highlands days, castle walking, and whisky touring from Edinburgh.",
      intro:
        "Edinburgh is a castle city with the Royal Mile, Arthur's Seat, and guided walking, cycling, whisky, and Highlands day tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/7b/ac/f1.jpg",
      ],
      activityTags: ["sightseeing", "hiking", "cycling"],
      whereItIs: [
        "Edinburgh sits between the Firth of Forth and the Pentland Hills, with Old Town, New Town, and Holyrood Park framing central sightseeing.",
        "Most guided tours depart from the Royal Mile, Calton Hill, central hotels, and Edinburgh bus stations.",
      ],
      experiences: {
        mountains:
          "Arthur's Seat and day trips into Glencoe, Loch Ness, and the Trossachs bring Highland scenery within reach of the capital.",
        lakesWater:
          "Loch Ness, Loch Lomond, and Forth estuary views appear on full-day routes from Edinburgh.",
        desertForest:
          "Holyrood Park, the Hermitage, and Highland glens offer open grassland and woodland between castle and loch stops.",
        cycling:
          "Guided bike and e-bike tours cover Arthur's Seat, Portobello, and the Port of Leith.",
        scenicDrives:
          "Private Land Rover and minivan days cover Glencoe, Stirling Castle, whisky distilleries, and West Highland lochs.",
        seasonalNotes:
          "Spring and fall are popular for castle walking and Highland days; long summer light favors Arthur's Seat and loch viewpoints.",
      },
      thingsToDo: [
        "Walk the Royal Mile to Edinburgh Castle.",
        "Hike Arthur's Seat or bike from skyline to sea.",
        "Take a whisky or private Highlands day to Glencoe and Loch Ness.",
      ],
      toursCopy: [
        "Book a private Land Rover or Highlands chauffeur day for a compact introduction beyond the city.",
        "Pair a Royal Mile castle walk with a whisky glen day for a full Edinburgh itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Royal Mile walking tour and Edinburgh Castle.",
          "Afternoon: Arthur's Seat hike or sky-to-sea bike ride.",
          "Evening: Old Town food walk.",
        ],
        dayTwo: [
          "Morning: Depart for Glencoe, Loch Ness, or Stirling Castle.",
          "Afternoon: Distillery tasting or St Andrews coastal villages.",
          "Evening: Return to Edinburgh.",
        ],
      },
      gettingThere: [
        "Edinburgh Airport and Waverley station serve the city with tram, bus, and rail links to the Royal Mile and New Town.",
      ],
      faq: [
        {
          question: "What are the signature Edinburgh tours?",
          answer:
            "Private Highlands Land Rover days, Edinburgh Castle walking tours, whisky glen trips, and Arthur's Seat bike rides are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const franceState: StateDestination = {
  slug: "france",
  name: "France",
  description:
    "Paris landmarks, Seine views, and guided walking, cycling, and museum touring.",
  featuredDescription:
    "Explore Paris tours with private walking routes, vintage-car sightseeing, museum access, and Versailles day trips.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/02/18/42.jpg",
  region: "Europe",
  intro:
    "France pairs walkable Paris districts with Seine river views, museum collections, and day trips to Versailles.",
  longDescription:
    "Paris anchors France tour inventory with private walking tours, vintage-car sightseeing, Louvre and Orsay visits, Montmartre food walks, and Versailles bike days from the capital.",
  topRegions: [
    {
      title: "Seine and historic islands",
      description:
        "Notre-Dame, Sainte-Chapelle, Île de la Cité, and river cruises along the Seine.",
    },
    {
      title: "Right Bank landmarks",
      description:
        "Louvre Museum, Champs-Élysées, Trocadéro, and Montmartre neighborhood walks.",
    },
  ],
  cities: [
    {
      name: "Paris",
      slug: "paris",
      stateSlug: "france",
      region: "Paris",
      lat: 48.8566,
      lng: 2.3522,
      shortDescription:
        "Private walking tours, museum visits, and landmark sightseeing in Paris.",
      intro:
        "Paris is a river city with the Eiffel Tower, Louvre collections, Notre-Dame, and guided walking, cycling, and food tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/02/18/42.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "cycling"],
      whereItIs: [
        "Paris sits on the River Seine with the Right Bank, Left Bank, and Île de la Cité framing central sightseeing.",
        "Most guided tours depart from Trocadéro, the Louvre, Île de la Cité, Montmartre, and central Paris hotels.",
      ],
      experiences: {
        mountains:
          "Paris is a river city; tours focus on landmarks, museum galleries, and neighborhood walking districts.",
        lakesWater:
          "Seine River cruises highlight Notre-Dame, the Louvre, and the Eiffel Tower from the water.",
        desertForest:
          "Parks such as the Tuileries Garden and Luxembourg Garden offer green space between urban sightseeing routes.",
        cycling:
          "Guided bike tours cover Les Invalides, the Louvre, Île de la Cité, and landmark corridors.",
        scenicDrives:
          "Private vintage-car and 2CV tours cover the Eiffel Tower, Montmartre, and Champs-Élysées photo stops.",
        seasonalNotes:
          "Spring and summer are popular for Seine cruises and Versailles gardens; winter adds indoor museum and food walking.",
      },
      thingsToDo: [
        "Walk Île de la Cité for Notre-Dame, Sainte-Chapelle, and Pont Neuf.",
        "Visit the Louvre Museum and cruise the Seine.",
        "Join a private Montmartre food walk or a vintage-car landmark tour.",
      ],
      toursCopy: [
        "Book a private Paris walk for a compact introduction to the city.",
        "Pair a Louvre visit with a Seine cruise for a full-day city itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Louvre Museum guided visit.",
          "Afternoon: Île de la Cité walking tour.",
          "Evening: Seine River cruise or night bike tour.",
        ],
        dayTwo: [
          "Morning: Montmartre food and wine walk.",
          "Afternoon: Versailles bike day or Musée d'Orsay.",
          "Evening: Trocadéro and the Eiffel Tower.",
        ],
      },
      gettingThere: [
        "Charles de Gaulle and Orly airports serve Paris with RER, Metro, and taxi links to central arrondissements.",
      ],
      faq: [
        {
          question: "What are the signature Paris tours?",
          answer:
            "Private walking tours, Louvre and Orsay visits, Seine cruises, vintage-car sightseeing, and Versailles bike days are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const italyState: StateDestination = {
  slug: "italy",
  name: "Italy",
  description:
    "Rome landmarks, Vatican collections, and guided walking, cycling, and food touring.",
  featuredDescription:
    "Explore Rome tours with Vespa sidecars, private photography, Colosseum arena access, Vatican visits, and countryside wine tastings.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/80/9d.jpg",
  region: "Europe",
  intro:
    "Italy pairs walkable Rome districts with Vatican museums, ancient ruins, and day trips into Roman wine country.",
  longDescription:
    "Rome anchors Italy tour inventory with Vespa sidecar sightseeing, private photography, Colosseum arena access, Vatican Museums visits, Trastevere food walks, Appian Way e-bike days, and countryside vineyard tastings from the capital.",
  topRegions: [
    {
      title: "Ancient center and Colosseum",
      description:
        "Colosseum arena floor, Roman Forum, Palatine Hill, and Vespa or e-bike loops through the historic center.",
    },
    {
      title: "Vatican and Trastevere",
      description:
        "Vatican Museums, the Sistine Chapel, St. Peter's Basilica, and food walks across Trastevere and Campo de' Fiori.",
    },
  ],
  cities: [
    {
      name: "Rome",
      slug: "rome",
      stateSlug: "italy",
      region: "Rome",
      lat: 41.9028,
      lng: 12.4964,
      shortDescription:
        "Private Vespa and Fiat tours, Vatican visits, and landmark sightseeing in Rome.",
      intro:
        "Rome is an ancient capital with the Colosseum, Vatican Museums, Trastevere, and guided walking, cycling, and food tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/80/9d.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "cycling"],
      whereItIs: [
        "Rome sits on the Tiber River with the historic center, Vatican City, and Trastevere framing central sightseeing.",
        "Most guided tours depart from the Colosseum area, Piazza Navona, Vatican Museums, and central Rome hotels.",
      ],
      experiences: {
        mountains:
          "Rome is a river city; tours focus on ancient landmarks, museum galleries, and neighborhood walking districts.",
        lakesWater:
          "Tiber cycle paths and riverside routes highlight Castel Sant'Angelo and historic-center views from the water's edge.",
        desertForest:
          "Parks such as Villa Borghese and the Appian Way countryside offer green space between urban sightseeing routes.",
        cycling:
          "Guided e-bike tours cover the historic center, the Appian Way, catacombs, and Roman aqueducts.",
        scenicDrives:
          "Private Fiat 500 and Vespa sidecar tours cover the Colosseum, Trevi Fountain, and Pantheon photo stops.",
        seasonalNotes:
          "Spring and fall are popular for walking and e-bike days; summer heat favors early Colosseum and Vatican entries.",
      },
      thingsToDo: [
        "Walk the Colosseum arena floor, Roman Forum, and Palatine Hill.",
        "Visit the Vatican Museums and St. Peter's Basilica.",
        "Join a Trastevere food walk or a Vespa sidecar landmark tour.",
      ],
      toursCopy: [
        "Book a Vespa sidecar or private Fiat 500 tour for a compact introduction to Rome.",
        "Pair a Vatican visit with Colosseum arena access for a full-day city itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Vatican Museums and St. Peter's Basilica.",
          "Afternoon: Colosseum arena floor and Roman Forum.",
          "Evening: Trastevere food tour with dinner and wine.",
        ],
        dayTwo: [
          "Morning: Appian Way e-bike or Borghese Gallery small-group visit.",
          "Afternoon: Historic-center Vespa or Fiat photography tour.",
          "Evening: Rome by night e-bike past the Colosseum and Trevi Fountain.",
        ],
      },
      gettingThere: [
        "Fiumicino and Ciampino airports serve Rome with train, bus, and taxi links to the historic center.",
      ],
      faq: [
        {
          question: "What are the signature Rome tours?",
          answer:
            "Vespa sidecar sightseeing, Colosseum arena access, Vatican Museums visits, Trastevere food walks, and Appian Way e-bike days are the most popular departures.",
        },
      ],
    },
    {
      name: "Venice",
      slug: "venice",
      stateSlug: "italy",
      region: "Venice",
      lat: 45.4408,
      lng: 12.3155,
      shortDescription:
        "Private island cruises, photography walks, and landmark sightseeing in Venice.",
      intro:
        "Venice is a lagoon city with St. Mark's Basilica, the Doge's Palace, Murano, Burano, and guided walking, boat, and food tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/33/b1/01.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "boat-tours"],
      whereItIs: [
        "Venice sits in the Venetian Lagoon with the historic center, Grand Canal, and lagoon islands framing sightseeing.",
        "Most guided tours depart from Piazza San Marco, Rialto, Piazzale Roma, and central Venice hotels.",
      ],
      experiences: {
        mountains:
          "Venice is a lagoon city; tours focus on basilicas, palaces, island crafts, and neighborhood walking districts.",
        lakesWater:
          "Gondola and motorboat routes highlight the Grand Canal, inner canals, and lagoon crossings to Murano, Burano, and Torcello.",
        desertForest:
          "Giudecca and quieter sestieri offer open waterfronts and residential streets between landmark sightseeing routes.",
        cycling:
          "Most Venice touring is on foot or by boat; day trips from the city reach Prosecco hills and the Dolomites.",
        scenicDrives:
          "Private motorboat island cruises and Prosecco or Dolomites day trips cover lagoon and mainland scenery from Venice.",
        seasonalNotes:
          "Spring and fall are popular for walking and island days; summer heat favors early basilica entries and lagoon departures.",
      },
      thingsToDo: [
        "Visit St. Mark's Basilica and the Doge's Palace.",
        "Take a boat to Murano, Burano, and Torcello.",
        "Join a cicchetti walk or a private photography tour.",
      ],
      toursCopy: [
        "Book a private island motorboat or photography walk for a compact introduction to Venice.",
        "Pair an after-hours basilica visit with a full-day St. Mark's, Doge's Palace, and gondola itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: St. Mark's Basilica and the Doge's Palace.",
          "Afternoon: Gondola on the Grand Canal and Rialto Market.",
          "Evening: Cicchetti and bacari walk in Cannaregio or San Polo.",
        ],
        dayTwo: [
          "Morning: Murano glass and Burano lace by boat.",
          "Afternoon: Private photo walk around Rialto or Giudecca.",
          "Evening: After-hours St. Mark's Basilica visit.",
        ],
      },
      gettingThere: [
        "Marco Polo Airport and Santa Lucia station serve Venice with water bus, water taxi, and bus links to Piazzale Roma and the historic center.",
      ],
      faq: [
        {
          question: "What are the signature Venice tours?",
          answer:
            "Murano and Burano boat days, private photography and gondola sessions, after-hours St. Mark's visits, Prosecco winery trips, and Dolomites day trips are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const netherlandsState: StateDestination = {
  slug: "netherlands",
  name: "Netherlands",
  description:
    "Amsterdam canals, Jordaan streets, and guided walking, cycling, and countryside touring.",
  featuredDescription:
    "Explore Amsterdam tours with canal cruises, private walking routes, bike days, food walks, and Zaanse Schans countryside trips.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/6c/b1/fa.jpg",
  region: "Europe",
  intro:
    "The Netherlands pairs walkable Amsterdam districts with UNESCO canals, museum collections, and day trips to windmill villages.",
  longDescription:
    "Amsterdam anchors Netherlands tour inventory with canal cruises, private walking tours, city and countryside bike days, Jordaan food walks, and Zaanse Schans, Edam, Volendam, and Marken countryside trips from the capital.",
  topRegions: [
    {
      title: "Canal ring and historic center",
      description:
        "Dam Square, the Jordaan, Anne Frank House, the Rijksmuseum, and UNESCO-listed canal cruises.",
    },
    {
      title: "Dutch countryside from Amsterdam",
      description:
        "Zaanse Schans windmills, Zaandam wooden houses, and fishing villages such as Volendam, Marken, and Edam.",
    },
  ],
  cities: [
    {
      name: "Amsterdam",
      slug: "amsterdam",
      stateSlug: "netherlands",
      region: "Amsterdam",
      lat: 52.3676,
      lng: 4.9041,
      shortDescription:
        "Canal cruises, bike tours, food walks, and countryside sightseeing from Amsterdam.",
      intro:
        "Amsterdam is a canal city with Dam Square, the Jordaan, the Rijksmuseum, and guided walking, cycling, food, and countryside tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/6c/b1/fa.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "cycling"],
      whereItIs: [
        "Amsterdam sits on the Amstel and the UNESCO canal ring, with Centraal Station and the Jordaan framing central sightseeing.",
        "Most guided tours depart from Centraal Station, Dam Square, the Jordaan, and central Amsterdam hotels.",
      ],
      experiences: {
        mountains:
          "Amsterdam is a canal city; tours focus on landmarks, museum galleries, and neighborhood walking districts.",
        lakesWater:
          "Canal cruises highlight the Jordaan, the Rijksmuseum, and Anne Frank House from the water.",
        desertForest:
          "Parks such as Vondelpark offer green space between urban sightseeing routes.",
        cycling:
          "Guided bike tours cover the canal ring, the Jordaan, Vondelpark, and countryside lanes toward Zaanse Schans.",
        scenicDrives:
          "Private countryside tours cover Zaanse Schans windmills, Volendam, and Marken from Amsterdam.",
        seasonalNotes:
          "Spring and summer are popular for canal cruises and countryside bike days; winter adds indoor museum and food walking.",
      },
      thingsToDo: [
        "Cruise the UNESCO canal ring past the Jordaan and the Rijksmuseum.",
        "Walk Dam Square, Nieuwmarkt, and the Jordaan with a local guide.",
        "Bike to Zaanse Schans or join a private Holland countryside day.",
      ],
      toursCopy: [
        "Book a canal cruise or city bike tour for a compact introduction to Amsterdam.",
        "Pair a Jordaan food walk with a Zaanse Schans countryside day.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Amsterdam city highlights bike tour.",
          "Afternoon: Jordaan food walk or canal cruise.",
          "Evening: Canal-ring stroll near the Anne Frank House.",
        ],
        dayTwo: [
          "Morning: Zaanse Schans, Edam, Volendam, and Marken day trip.",
          "Afternoon: Dam Square and Rijksmuseum walking time.",
          "Evening: Private Red Light District and food tour.",
        ],
      },
      gettingThere: [
        "Schiphol Airport and Amsterdam Centraal serve the city with train, tram, metro, and taxi links to the canal ring.",
      ],
      faq: [
        {
          question: "What are the signature Amsterdam tours?",
          answer:
            "Canal cruises, city and countryside bike tours, Jordaan food walks, private walking tours, and Zaanse Schans day trips are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const irelandState: StateDestination = {
  slug: "ireland",
  name: "Ireland",
  description:
    "Dublin streets, Howth cliffs, Wicklow valleys, and guided day trips to the west and north coasts.",
  featuredDescription:
    "Explore Dublin tours with private walking routes, food and whiskey walks, Howth e-bike and hikes, and full-day trips to Wicklow, the Cliffs of Moher, and Giant's Causeway.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0c/0b/6a/dc.jpg",
  region: "Europe",
  intro:
    "Ireland pairs walkable Dublin districts with coastal Howth, Wicklow mountains, and long day trips to Atlantic cliffs and Antrim basalt.",
  longDescription:
    "Dublin anchors Ireland tour inventory with private walking tours, food and whiskey walks, Howth e-bike and coastal hikes, Wicklow and Glendalough days, and coach trips to the Cliffs of Moher, Galway, Titanic Belfast, and Giant's Causeway.",
  topRegions: [
    {
      title: "Historic center and Temple Bar",
      description:
        "Trinity College, Ha'penny Bridge, the Molly Malone statue, and guided food and whiskey walks.",
    },
    {
      title: "Coast and countryside from Dublin",
      description:
        "Howth cliffs, Wicklow Mountains National Park, Glendalough, the Cliffs of Moher, and Giant's Causeway day trips.",
    },
  ],
  cities: [
    {
      name: "Dublin",
      slug: "dublin",
      stateSlug: "ireland",
      region: "Dublin",
      lat: 53.3498,
      lng: -6.2603,
      shortDescription:
        "Private walks, food tours, Howth adventures, and full-day sightseeing from Dublin.",
      intro:
        "Dublin is a capital city with Temple Bar, Trinity College, and guided walking, food, cycling, hiking, and countryside tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/0c/0b/6a/dc.jpg",
      ],
      activityTags: ["sightseeing", "food-tours", "hiking"],
      whereItIs: [
        "Dublin sits on the River Liffey, with Temple Bar, Trinity College, and O'Connell Street framing central sightseeing.",
        "Most guided tours depart from the Molly Malone statue, College Green, Howth Harbour, and central Dublin hotels.",
      ],
      experiences: {
        mountains:
          "Wicklow Mountains National Park and Glendalough sit a short drive south of Dublin.",
        lakesWater:
          "Howth Harbour, Dublin Bay, and Glendalough's lakes anchor coastal and valley days.",
        desertForest:
          "Wicklow woodland, Powerscourt gardens, and Burren limestone sit on day-trip routes from Dublin.",
        cycling:
          "Guided e-bike tours cover Howth cliffs, Baily Lighthouse, and off-road peninsula trails.",
        scenicDrives:
          "Coach and private days cover Wicklow, the Cliffs of Moher, Galway, and Giant's Causeway from Dublin.",
        seasonalNotes:
          "Spring and summer are popular for Howth hikes and cliff days; winter adds indoor food and whiskey walking.",
      },
      thingsToDo: [
        "Walk Temple Bar, Ha'penny Bridge, and Trinity College with a private guide.",
        "Taste Irish food and whiskey on a Dublin walking tour.",
        "Ride or hike Howth, or join a Wicklow, Cliffs of Moher, or Giant's Causeway day.",
      ],
      toursCopy: [
        "Book a private Dublin walk or food tour for a compact introduction to the city.",
        "Pair a Howth e-bike or hike with a full-day Cliffs of Moher or Wicklow trip.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Dublin private walking tour.",
          "Afternoon: Food or whiskey walking tour.",
          "Evening: Temple Bar and Ha'penny Bridge.",
        ],
        dayTwo: [
          "Morning: Howth e-bike or coastal hike.",
          "Afternoon: Wicklow and Glendalough, or a Cliffs of Moher day.",
          "Evening: Return to central Dublin.",
        ],
      },
      gettingThere: [
        "Dublin Airport and Dublin Connolly/Heuston stations serve the city with bus, LUAS, DART, and taxi links to Temple Bar and O'Connell Street.",
      ],
      faq: [
        {
          question: "What are the signature Dublin tours?",
          answer:
            "Private walking tours, food and whiskey walks, Howth e-bike and coastal hikes, Wicklow and Glendalough days, and Cliffs of Moher or Giant's Causeway coach trips are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const mexicoState: StateDestination = {
  slug: "mexico",
  name: "Mexico",
  description:
    "Mexico City landmarks, Cancun Caribbean days, Puerto Vallarta bay touring, and guided touring from the capital, hotel zone, and Banderas Bay.",
  featuredDescription:
    "Explore Mexico City, Cancun, and Puerto Vallarta tours with Teotihuacan, Centro Histórico, Chichen Itza, cenotes, Isla Mujeres sailing, and Banderas Bay days.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e4/d9/8e.jpg",
  region: "North America",
  intro:
    "Mexico pairs walkable Mexico City districts and highland day trips with Cancun hotel-zone departures to Chichen Itza, cenotes, and Isla Mujeres, plus Puerto Vallarta days on Banderas Bay and the Sierra Madre.",
  longDescription:
    "Mexico City, Cancun, and Puerto Vallarta anchor Mexico tour inventory: Centro Histórico walking, Teotihuacan pyramid days, Chapultepec, Xochimilco, and Coyoacán from the capital; Chichen Itza and Valladolid routes, jungle ATV days, cenote circuits, and Isla Mujeres catamarans from Cancun; and Marietas Islands, Yelapa, Malecón sightseeing, and Sierra Madre ATV or hiking days from Puerto Vallarta.",
  topRegions: [
    {
      title: "Centro Histórico and Zócalo",
      description:
        "The Metropolitan Cathedral, Templo Mayor, Palacio de Bellas Artes, and guided walking or bike tours through the historic center.",
    },
    {
      title: "Highlands and ancient cities",
      description:
        "Teotihuacan pyramids, Xochimilco canals, and Coyoacán streets reachable from Mexico City.",
    },
    {
      title: "Hotel zone and Isla Mujeres",
      description:
        "Catamaran sailing, reef snorkeling, and beach time from Cancun toward Isla Mujeres.",
    },
    {
      title: "Yucatan ruins and cenotes",
      description:
        "Chichen Itza, Tulum, Valladolid, and jungle cenote days reachable from Cancun.",
    },
    {
      title: "Banderas Bay and Sierra Madre",
      description:
        "Puerto Vallarta departures for Marietas Islands, Yelapa, Malecón sightseeing, and Sierra Madre ATV or hiking days.",
    },
  ],
  cities: [
    {
      name: "Mexico City",
      slug: "mexico-city",
      stateSlug: "mexico",
      region: "Mexico City",
      lat: 19.4326,
      lng: -99.1332,
      shortDescription:
        "Teotihuacan days, historic-center walking, and canal touring from Mexico City.",
      intro:
        "Mexico City is a highland capital with the Zócalo, Teotihuacan, Chapultepec, Xochimilco, and guided walking, cycling, and cultural tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e4/d9/8e.jpg",
      ],
      activityTags: ["sightseeing", "hiking", "cycling"],
      whereItIs: [
        "Mexico City sits on the highland Valley of Mexico, with Centro Histórico, Chapultepec, Coyoacán, and Xochimilco framing central sightseeing.",
        "Most guided tours depart from the Zócalo, Reforma hotels, Coyoacán, and Mexico City meeting points.",
      ],
      experiences: {
        mountains:
          "Day trips to Teotihuacan and highland viewpoints bring pyramid and volcanic scenery within reach of the capital.",
        lakesWater:
          "Xochimilco canals and trajinera routes appear on half-day and private outings from Mexico City.",
        desertForest:
          "Chapultepec Park, Desierto de los Leones, and Ajusco foothills offer woodland and parkland between city and highland stops.",
        cycling:
          "Guided bike and e-bike tours cover Centro Histórico, Reforma, Chapultepec, and Coyoacán.",
        scenicDrives:
          "Private van and Jeep days cover Teotihuacan, Puebla, and highland pueblos from Mexico City.",
        seasonalNotes:
          "Dry-season months favor pyramid climbing and canal touring; summer rains are typically afternoon showers around the Valley of Mexico.",
      },
      thingsToDo: [
        "Walk the Zócalo to the Metropolitan Cathedral and Templo Mayor.",
        "Visit Teotihuacan or bike through Chapultepec and Coyoacán.",
        "Take a Xochimilco trajinera or a private city sightseeing day.",
      ],
      toursCopy: [
        "Book a Teotihuacan day or Centro Histórico walk for a compact introduction to Mexico City.",
        "Pair a historic-center tour with Xochimilco or Coyoacán for a full Mexico City itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Centro Histórico walking tour and Zócalo landmarks.",
          "Afternoon: Chapultepec Castle or Coyoacán neighborhoods.",
          "Evening: Historic-center food walk.",
        ],
        dayTwo: [
          "Morning: Depart for Teotihuacan pyramids.",
          "Afternoon: Xochimilco canals or Basilica of Guadalupe.",
          "Evening: Return to central Mexico City.",
        ],
      },
      gettingThere: [
        "Mexico City International Airport and the city's metro, Metrobús, and taxi links serve Centro Histórico, Reforma, and Coyoacán meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Mexico City tours?",
          answer:
            "Teotihuacan pyramid days, Centro Histórico walking and bike tours, Xochimilco canal rides, Coyoacán neighborhood walks, and private city sightseeing are the most popular departures.",
        },
      ],
    },
    {
      name: "Cancun",
      slug: "cancun",
      stateSlug: "mexico",
      region: "Quintana Roo",
      lat: 21.1619,
      lng: -86.8515,
      shortDescription:
        "Chichen Itza days, jungle ATV routes, and Isla Mujeres sailing from Cancun.",
      intro:
        "Cancun is a Caribbean hotel-zone city with guided ruin days, cenote swims, ATV jungle routes, and Isla Mujeres sailing.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/e7/bd/55.jpg",
      ],
      activityTags: ["sightseeing", "adventure", "water-sports"],
      whereItIs: [
        "Cancun sits on Mexico's Caribbean coast in Quintana Roo, with the hotel zone, downtown, and Nichupte Lagoon framing departures.",
        "Most guided tours depart from hotel-zone and downtown hotels, Playa Tortugas, and meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Day trips inland reach Chichen Itza, Tulum ruins, and jungle cenotes beyond the hotel-zone shoreline.",
        lakesWater:
          "Isla Mujeres catamarans, reef snorkeling at Puerto Morelos, and whale-shark swims highlight the Caribbean water.",
        desertForest:
          "Yucatan jungle ATV trails, Selvatica, and Xenotes cenote circuits sit between resort and ruin days.",
        cycling:
          "Guided bike inventory is limited; most Cancun days use coaches, boats, or off-road vehicles instead of independent rentals.",
        scenicDrives:
          "Private and group coaches cover Chichen Itza, Valladolid, Tulum, and Puerto Morelos from Cancun hotels.",
        seasonalNotes:
          "Winter and spring are popular for ruin days and sailing; whale-shark swims are seasonal, and summer favors early departures.",
      },
      thingsToDo: [
        "Visit Chichen Itza with a cenote swim and Valladolid stop.",
        "Sail to Isla Mujeres or snorkel the reef at Puerto Morelos.",
        "Ride an ATV or Polaris through jungle trails and zip-line parks.",
      ],
      toursCopy: [
        "Book a full-day Chichen Itza route for a compact introduction beyond the hotel zone.",
        "Pair an Isla Mujeres catamaran with a jungle ATV or Xenotes cenote day.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Chichen Itza guided visit.",
          "Afternoon: Cenote swim and Valladolid plaza stop.",
          "Evening: Return to the Cancun hotel zone.",
        ],
        dayTwo: [
          "Morning: Isla Mujeres catamaran or Puerto Morelos reef snorkel.",
          "Afternoon: Jungle ATV, ziplines, or Xenotes cenotes.",
          "Evening: Hotel-zone dinner.",
        ],
      },
      gettingThere: [
        "Cancun International Airport serves the hotel zone and downtown with buses, shuttles, and taxis to most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Cancun tours?",
          answer:
            "Chichen Itza and Tulum ruin days, jungle ATV and zipline combos, Isla Mujeres catamarans, reef snorkeling, and cenote circuits are the most popular departures.",
        },
      ],
    },
    {
      name: "Puerto Vallarta",
      slug: "puerto-vallarta",
      stateSlug: "mexico",
      region: "Jalisco",
      lat: 20.6534,
      lng: -105.2253,
      shortDescription:
        "Marietas Islands days, Sierra Madre ATV routes, and Yelapa sailing from Puerto Vallarta.",
      intro:
        "Puerto Vallarta is a Banderas Bay city with guided island snorkeling, Sierra Madre off-road days, canopy circuits, and Yelapa yacht outings.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/3b/38/d8.jpg",
      ],
      activityTags: ["sightseeing", "adventure", "water-sports"],
      whereItIs: [
        "Puerto Vallarta sits on Mexico's Pacific coast in Jalisco, with the Malecón, Marina Vallarta, and Sierra Madre foothills framing departures.",
        "Most guided tours depart from Marina Vallarta, Zona Romántica, Punta de Mita, and meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Day trips inland reach Sierra Madre ATV trails, Palo María waterfalls, and canopy circuits above the Los Horcones River.",
        lakesWater:
          "Marietas Islands snorkeling, Hidden Beach access, Yelapa yacht days, and whale-watching on Banderas Bay highlight the Pacific water.",
        desertForest:
          "Rainforest UTV tracks, riverside ziplines, and jungle hike pools sit between resort and mountain days.",
        cycling:
          "Guided bike inventory is limited; most Puerto Vallarta days use boats, ATVs, or walking routes instead of independent rentals.",
        scenicDrives:
          "Private and group vehicles cover Old Town, Marina Vallarta, and Sierra Madre ranch or waterfall approaches.",
        seasonalNotes:
          "Winter and spring are popular for whale watching; summer favors early mountain departures, and Hidden Beach access depends on park conditions.",
      },
      thingsToDo: [
        "Snorkel the Marietas Islands with a Hidden Beach attempt when conditions allow.",
        "Ride an ATV or UTV through Sierra Madre trails, or hike to Palo María waterfalls.",
        "Sail to Yelapa or take a canopy circuit with a tequila tasting.",
      ],
      toursCopy: [
        "Book a Marietas or Yelapa boat day for a compact introduction beyond the Malecón.",
        "Pair a Sierra Madre ATV or UTV outing with a canopy or whale-watching morning.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Marietas Islands snorkel or Hidden Beach boat.",
          "Afternoon: Malecón walk or Marina Vallarta.",
          "Evening: Return to a Puerto Vallarta hotel.",
        ],
        dayTwo: [
          "Morning: Sierra Madre ATV, UTV, or Palo María hike.",
          "Afternoon: Los Veranos canopy or Yelapa yacht day.",
          "Evening: Bay-front dinner.",
        ],
      },
      gettingThere: [
        "Licenciado Gustavo Díaz Ordaz International Airport serves Puerto Vallarta, Nuevo Vallarta, and Punta de Mita with buses, shuttles, and taxis to most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Puerto Vallarta tours?",
          answer:
            "Marietas Islands and Hidden Beach snorkeling, Sierra Madre ATV and UTV days, Los Veranos canopy circuits, Yelapa yacht cruises, and Banderas Bay whale watching are the most popular departures.",
        },
      ],
    },
    {
      name: "Cabo San Lucas",
      slug: "cabo-san-lucas",
      stateSlug: "mexico",
      region: "Baja California Sur",
      lat: 22.8905,
      lng: -109.9167,
      shortDescription:
        "Arch cruises, corridor snorkeling, and Sierra de la Laguna hiking from Cabo San Lucas.",
      intro:
        "Cabo San Lucas is a Baja California Sur marina city with guided Land's End sightseeing, corridor snorkel days, Migrino off-road rides, and Todos Santos touring.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/cf/9e/b2.jpg",
      ],
      activityTags: ["sightseeing", "adventure", "water-sports"],
      whereItIs: [
        "Cabo San Lucas sits at the southern tip of Baja California Sur, with the marina, Medano Beach, and Land's End framing departures.",
        "Most guided tours depart from the Cabo San Lucas marina, corridor hotels, and meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Day trips inland reach Sierra de la Laguna hiking routes, Pericu trails, and desert canyon stops beyond the marina.",
        lakesWater:
          "Arch and Land's End cruises, Santa Maria and Chileno Bay snorkeling, and seasonal whale watching highlight the Sea of Cortez and Pacific meeting point.",
        desertForest:
          "Migrino Desert ATV tracks, camel or ranch add-ons, and semitropical reserve trails sit between resort and mountain days.",
        cycling:
          "Guided bike inventory is limited; most Cabo San Lucas days use boats, ATVs, or walking routes instead of independent rentals.",
        scenicDrives:
          "Private and group vehicles cover the marina, corridor bays, Todos Santos, and Sierra de la Laguna approaches.",
        seasonalNotes:
          "Winter and spring are popular for whale watching; summer favors early mountain and snorkel departures, and Arch access depends on sea conditions.",
      },
      thingsToDo: [
        "Cruise Land's End to the Arch of Cabo San Lucas and Lover's Beach.",
        "Snorkel Santa Maria Bay or Chileno Bay, or hike a Pericu route in Sierra de la Laguna.",
        "Ride an ATV at Migrino Beach or take a Todos Santos artisan day.",
      ],
      toursCopy: [
        "Book an Arch sunset sail or corridor snorkel for a compact introduction beyond the marina.",
        "Pair a Migrino ATV outing with a Todos Santos or Sierra de la Laguna day.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Santa Maria or Chileno Bay snorkel.",
          "Afternoon: Marina walk or Medano Beach.",
          "Evening: Sunset sail to the Arch.",
        ],
        dayTwo: [
          "Morning: Migrino ATV ride or Pericu hike.",
          "Afternoon: Todos Santos galleries or a private yacht window.",
          "Evening: Marina dinner.",
        ],
      },
      gettingThere: [
        "Los Cabos International Airport serves Cabo San Lucas and San José del Cabo with buses, shuttles, and taxis to most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Cabo San Lucas tours?",
          answer:
            "Arch and Land's End sunset sails, Santa Maria and Chileno Bay snorkeling, Migrino ATV days, Todos Santos artisan touring, and Sierra de la Laguna Pericu hikes are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const peruState: StateDestination = {
  slug: "peru",
  name: "Peru",
  description:
    "Cusco plazas, Sacred Valley ruins, Humantay and Rainbow Mountain days, and Machu Picchu train touring from the former Inka capital, plus Lima historic plazas, coastal neighborhoods, and day trips to older civilizations.",
  featuredDescription:
    "Explore Cusco tours with city ruin circuits, Sacred Valley days, Humantay Lake and Rainbow Mountain hikes, ATV outings, Andean textile workshops, planetarium evenings, and Machu Picchu train itineraries, plus Lima private city circuits, coast bike rides, sanctuary days, and desert outings.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/81/07.jpg",
  region: "South America",
  intro:
    "Peru pairs walkable Cusco districts and hillside ruins with Sacred Valley archaeological days and high-altitude lake or colored-mountain outings. On the Pacific coast, Lima adds historic plazas, coastal neighborhoods, and day trips to older civilizations.",
  longDescription:
    "Cusco anchors Peru tour inventory with Coricancha and Sacsayhuaman city circuits, Sacred Valley stops at Pisac, Ollantaytambo, Moray, Chinchero, and Salinas de Maras, Humantay Lake and Vinicunca hiking or ATV days, Andean weaving workshops, planetarium evenings, and Machu Picchu train itineraries from Ollantaytambo and Aguas Calientes. Lima adds Historic Downtown and Miraflores circuits, Barranco and catacomb evenings, coast bike rides, Pachacamac and Caral sanctuary days, and Ancón or Huacachina desert outings.",
  topRegions: [
    {
      title: "Historic center and hillside ruins",
      description:
        "Plaza de Armas, Coricancha, Sacsayhuaman, Qenko, Puca Pucara, and Tambomachay.",
    },
    {
      title: "Sacred Valley and Machu Picchu",
      description:
        "Pisac, Ollantaytambo, Moray, Chinchero, Salinas de Maras, Aguas Calientes, and Machu Picchu train days.",
    },
    {
      title: "Lima coast and older civilizations",
      description:
        "Historic Downtown, Miraflores, Barranco, the Catacombs, Pachacamac, Caral, and desert routes around Ancón and Huacachina.",
    },
  ],
  cities: [
    {
      name: "Cusco",
      slug: "cusco",
      stateSlug: "peru",
      region: "Cusco",
      lat: -13.5319,
      lng: -71.9675,
      shortDescription:
        "City ruins, Sacred Valley days, mountain hikes, and Machu Picchu trains from Cusco.",
      intro:
        "Cusco is the former Inka capital with Plaza de Armas, hillside ruins, Sacred Valley day trips, and Machu Picchu train departures.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/81/07.jpg",
      ],
      activityTags: ["sightseeing", "hiking", "adventure"],
      whereItIs: [
        "Cusco sits in the southern Andes of Peru, with Plaza de Armas, San Blas, and Sacsayhuaman framing central sightseeing.",
        "Most guided tours depart from city-center hotels, Plaza Regocijo, and meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Humantay Lake, Vinicunca Rainbow Mountain, and Palcoyo-style colored ridges sit on full-day routes from Cusco.",
        lakesWater:
          "Humantay Lake and glacial valleys appear on high-altitude hiking days from the city.",
        desertForest:
          "Sacred Valley terraces, Maras salt pans, and highland grassland sit between city and citadel days.",
        cycling:
          "Guided bike inventory is limited on verified USD pages; most Cusco days use hiking, vans, ATVs, or trains.",
        scenicDrives:
          "Shared and private vans cover the Sacred Valley, Humantay approaches, and Rainbow Mountain roads from Cusco.",
        seasonalNotes:
          "Dry-season months favor high-altitude hikes and citadel days; wet season can close mountain roads and change trail conditions.",
      },
      thingsToDo: [
        "Walk Coricancha and the four hillside ruins on a half-day city circuit.",
        "Spend a full day in the Sacred Valley or hike Humantay Lake or Rainbow Mountain.",
        "Take a train day or two-day itinerary to Machu Picchu.",
      ],
      toursCopy: [
        "Book a Cusco city ruin circuit or Sacred Valley day for a compact introduction.",
        "Pair a Humantay or Rainbow Mountain hike with a Machu Picchu train itinerary.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Cusco city tour and four ruins.",
          "Afternoon: Coricancha or historic-center walk.",
          "Evening: Planetarium Cusco or a plaza dinner.",
        ],
        dayTwo: [
          "Morning: Sacred Valley, Humantay Lake, or Rainbow Mountain.",
          "Afternoon: Continue the published valley or mountain circuit.",
          "Evening: Return to central Cusco.",
        ],
      },
      gettingThere: [
        "Alejandro Velasco Astete International Airport serves Cusco with taxis and hotel transfers to Plaza de Armas and most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Cusco tours?",
          answer:
            "City ruin circuits, Sacred Valley archaeological days, Humantay Lake and Rainbow Mountain hikes, ATV outings, Andean textile workshops, planetarium evenings, and Machu Picchu train itineraries are the most popular departures.",
        },
      ],
    },
    {
      name: "Lima",
      slug: "lima",
      stateSlug: "peru",
      region: "Lima",
      lat: -12.0464,
      lng: -77.0428,
      shortDescription:
        "Historic plazas, coastal neighborhoods, and day trips to older civilizations from Lima.",
      intro:
        "Lima is Peru's Pacific capital with Historic Downtown, Miraflores, Barranco, the Catacombs, Pachacamac, Caral, and desert routes around Ancón and Huacachina.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/04/97/94.jpg",
      ],
      activityTags: ["sightseeing", "adventure", "cycling"],
      whereItIs: [
        "Lima sits on Peru's central Pacific coast, with Miraflores, Barranco, and the historic center framing most sightseeing.",
        "Most guided tours depart from Miraflores, Barranco, San Isidro, or downtown hotels and meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Marcahuasi stone-forest days climb inland from Lima to the San Pedro de Casta plateau.",
        lakesWater:
          "Coastal bike routes follow the Pacific cliffs, while Ballestas boat windows sit on longer southbound days.",
        desertForest:
          "Lomas de Ancón dunes, Pachacamac adobe terraces, and Huacachina sand routes sit on full-day outings from the capital.",
        cycling:
          "Guided coast rides cover Miraflores, Barranco, Love Park, and Chorrillos on protected bike paths.",
        scenicDrives:
          "Private and small-group vans cover Historic Downtown, Pachacamac, Caral, Ancón, and Paracas-Huacachina approaches.",
        seasonalNotes:
          "Coastal days run year-round; inland Marcahuasi and Caral routes depend on highland weather and road conditions.",
      },
      thingsToDo: [
        "Walk Historic Downtown, Miraflores, and the San Francisco catacombs.",
        "Ride the coast by bike or take a night circuit to the Magic Water Circuit.",
        "Spend a full day at Pachacamac, Caral, Marcahuasi, Ancón dunes, or Huacachina.",
      ],
      toursCopy: [
        "Book a private historic-center and Miraflores circuit for a compact introduction.",
        "Pair a Pachacamac or Caral sanctuary day with a coast bike ride or desert outing.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Historic Downtown, Miraflores, and catacombs.",
          "Afternoon: Barranco or a coast bike ride.",
          "Evening: Magic Water Circuit or a plaza dinner.",
        ],
        dayTwo: [
          "Morning: Pachacamac, Caral, Marcahuasi, or Huacachina.",
          "Afternoon: Continue the published sanctuary or desert circuit.",
          "Evening: Return to central Lima.",
        ],
      },
      gettingThere: [
        "Jorge Chávez International Airport serves Lima with taxis and hotel transfers to Miraflores, Barranco, San Isidro, and most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Lima tours?",
          answer:
            "Private historic-center and Miraflores circuits, Barranco and catacomb evenings, coast bike rides, Marcahuasi and Ancón off-road days, Pachacamac and Caral sanctuary days, and Paracas-Huacachina desert days are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const brazilState: StateDestination = {
  slug: "brazil",
  name: "Brazil",
  description:
    "Rio de Janeiro granite peaks, South Zone beaches, Tijuca Forest days, and Petrópolis imperial excursions from the Marvelous City.",
  featuredDescription:
    "Explore Rio de Janeiro tours with private Christ the Redeemer and Sugar Loaf circuits, small-group city days, hang gliding from Pedra Bonita, helicopter flights, and Petrópolis museum outings.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/69/c1/75.jpg",
  region: "South America",
  intro:
    "Brazil's Rio de Janeiro inventory pairs Corcovado and Sugar Loaf city circuits with Tijuca Forest approaches, South Zone beach pass-bys, hang-gliding launches, helicopter windows, and Petrópolis imperial days.",
  longDescription:
    "Rio de Janeiro anchors Brazil tour inventory with Christ the Redeemer and Sugar Loaf private or small-group days, Escadaria Selarón and Metropolitan Cathedral downtown stops, Tijuca Forest approaches through Paineiras, hang-gliding from Pedra Bonita to São Conrado, Jacarepaguá helicopter flights, and Petrópolis Imperial Museum excursions. Copacabana, Ipanema, Maracanã, and the Sambadrome appear on longer guided sightseeing days.",
  topRegions: [
    {
      title: "Granite peaks and South Zone beaches",
      description:
        "Christ the Redeemer, Sugar Loaf, Copacabana, Ipanema, and Morro da Urca cable-car windows.",
    },
    {
      title: "Downtown and carnival landmarks",
      description:
        "Escadaria Selarón, the Metropolitan Cathedral, Cinelandia, Maracanã, and the Sambadrome.",
    },
    {
      title: "Forest and mountain days",
      description:
        "Tijuca Forest, Pedra Bonita hang-gliding launches, Jacarepaguá helicopter flights, and Petrópolis imperial museum days.",
    },
  ],
  cities: [
    {
      name: "Rio de Janeiro",
      slug: "rio-de-janeiro",
      stateSlug: "brazil",
      region: "Rio de Janeiro",
      lat: -22.9068,
      lng: -43.1729,
      shortDescription:
        "Christ the Redeemer, Sugar Loaf, Tijuca Forest, and Petrópolis days from Rio de Janeiro.",
      intro:
        "Rio de Janeiro is Brazil's coastal landmark city with Corcovado, Sugar Loaf, Copacabana, Ipanema, Tijuca Forest, and Petrópolis day trips.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/69/c1/75.jpg",
      ],
      activityTags: ["sightseeing", "adventure", "air-tours"],
      whereItIs: [
        "Rio de Janeiro sits on Brazil's southeast Atlantic coast, with Copacabana, Ipanema, and Corcovado framing most sightseeing.",
        "Most guided tours depart from South Zone hotels, Barra da Tijuca, or meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Corcovado, Sugar Loaf, Pedra Bonita, and the Petrópolis serra sit on full-day or aerial routes from the city.",
        lakesWater:
          "South Zone beach pass-bys cover Copacabana and Ipanema, while hang-gliding lands at São Conrado.",
        desertForest:
          "Tijuca Forest van approaches and Pedra Bonita launches sit inside the urban national park.",
        cycling:
          "Guided bike inventory is limited on verified USD pages; most Rio de Janeiro days use vans, cable cars, or aerial launches.",
        scenicDrives:
          "Private and small-group vans cover Corcovado, downtown, the Sambadrome, and the Petrópolis mountain road.",
        seasonalNotes:
          "Coastal sightseeing runs year-round; hang-gliding and helicopter windows depend on wind and cloud at the granite peaks.",
      },
      thingsToDo: [
        "Ride to Christ the Redeemer and take the Sugar Loaf cable car.",
        "Walk Escadaria Selarón and the Metropolitan Cathedral downtown.",
        "Add hang gliding, a helicopter flight, or a Petrópolis imperial day.",
      ],
      toursCopy: [
        "Book a private Christ the Redeemer and Sugar Loaf circuit for a compact introduction.",
        "Pair a small-group city day with hang gliding or a Petrópolis museum outing.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Corcovado and Christ the Redeemer.",
          "Afternoon: Sugar Loaf and South Zone beaches.",
          "Evening: Return to Copacabana or Ipanema.",
        ],
        dayTwo: [
          "Morning: Downtown, Escadaria Selarón, or hang gliding from Pedra Bonita.",
          "Afternoon: Petrópolis or a helicopter window.",
          "Evening: Return to central Rio de Janeiro.",
        ],
      },
      gettingThere: [
        "Galeão International Airport and Santos Dumont Airport serve Rio de Janeiro with taxis and hotel transfers to Copacabana, Ipanema, and most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Rio de Janeiro tours?",
          answer:
            "Private Christ the Redeemer and Sugar Loaf circuits, small-group city days with lunch, hang gliding from Pedra Bonita, Jacarepaguá helicopter flights, and Petrópolis Imperial Museum excursions are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const japanState: StateDestination = {
  slug: "japan",
  name: "Japan",
  description:
    "Tokyo neighborhoods, shrine and temple days, Mount Fuji and Hakone scenic circuits, and guided touring from the capital, plus Kyoto temple, shrine, bamboo, and Nara day touring.",
  featuredDescription:
    "Explore Tokyo tours with private city walking, coast and shrine bike rides, photography walks, tea tastings, Kamakura and Nikko days, and Mount Fuji or Hakone outings, plus Kyoto private temple circuits, Arashiyama bike rides, Fushimi Inari hikes, and tea or photography sessions.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/5b/2a/70.jpg",
  region: "Asia",
  intro:
    "Japan pairs walkable Tokyo districts and shrine or temple days with Mount Fuji, Hakone, Kamakura, and Nikko outings from the capital. In the former imperial city, Kyoto adds temple, shrine, bamboo, and Nara day touring.",
  longDescription:
    "Tokyo anchors Japan tour inventory with licensed private city circuits, neighborhood walking, Meiji Jingu and Asakusa shrine stops, Imperial Palace and Shinjuku Gyoen windows, Ginza photography walks, and coast or park bike rides. Day trips from the capital add Mount Fuji fifth-station and lake viewpoints, Hakone ropeway and Lake Ashi cruises, Kamakura Great Buddha and Enoshima coastal stops, and Nikko Toshogu shrine circuits. Kyoto adds licensed private temple circuits, Kinkaku-ji and Kiyomizu-dera days, Fushimi Inari hikes, Arashiyama bike rides, Nishiki tea sessions, and Nara outings from the former capital.",
  topRegions: [
    {
      title: "Shrines, gardens, and historic neighborhoods",
      description:
        "Meiji Jingu, Senso-ji, the Imperial Palace, Shinjuku Gyoen, Asakusa, and guided walking or bike tours through central Tokyo.",
    },
    {
      title: "Mount Fuji and Hakone",
      description:
        "Fifth Station viewpoints, Lake Kawaguchiko, Oshino Hakkai, Hakone Ropeway, Owakudani, and Lake Ashi days reachable from Tokyo.",
    },
    {
      title: "Kamakura and Nikko",
      description:
        "Kotoku-in Great Buddha, Tsurugaoka Hachimangu, Enoshima, Toshogu Shrine, and Kegon Falls on full-day routes from Tokyo.",
    },
    {
      title: "Kyoto temples and Nara",
      description:
        "Kinkaku-ji, Kiyomizu-dera, Fushimi Inari, Arashiyama bamboo, Gion, and Nara park days reachable from Kyoto.",
    },
  ],
  cities: [
    {
      name: "Tokyo",
      slug: "tokyo",
      stateSlug: "japan",
      region: "Tokyo",
      lat: 35.6762,
      lng: 139.6503,
      shortDescription:
        "Private city circuits, shrine bike rides, and Mount Fuji or Nikko days from Tokyo.",
      intro:
        "Tokyo is Japan's capital with Meiji Jingu, Asakusa, the Imperial Palace, Shinjuku Gyoen, and guided walking, cycling, photography, and day-trip tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/5b/2a/70.jpg",
      ],
      activityTags: ["sightseeing", "cycling", "hiking"],
      whereItIs: [
        "Tokyo sits on Tokyo Bay in eastern Honshu, with Shinjuku, Shibuya, Asakusa, and the Imperial Palace framing central sightseeing.",
        "Most guided tours depart from Shinjuku, Harajuku, Asakusa, Hatsudai, and hotel meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Day trips to Mount Fuji fifth-station viewpoints, Hakone volcanic valleys, and Kamakura coastal ridges sit on full-day routes from Tokyo.",
        lakesWater:
          "Lake Kawaguchiko, Lake Ashi cruises, and Tokyo Bay viewpoints appear on scenic days from the capital.",
        desertForest:
          "Meiji Jingu forest, Yoyogi Park, and Shinjuku Gyoen offer woodland and garden stops between city neighborhoods.",
        cycling:
          "Guided bike rides cover Meiji Jingu, Yoyogi Park, the Imperial Palace, Ginza, and Roppongi Hills on mixed park and street routes.",
        scenicDrives:
          "Private vans cover Mount Fuji lakes, Hakone ropeway approaches, Kamakura and Enoshima, and Nikko shrine roads from Tokyo.",
        seasonalNotes:
          "Cherry-blossom and autumn-color months favor garden and lake days; winter can close the Mount Fuji Subaru Line above lower stations.",
      },
      thingsToDo: [
        "Walk Meiji Jingu, Asakusa, and the Imperial Palace with a licensed or local guide.",
        "Ride a guided bike loop past Yoyogi Park, Ginza, and the Tokyo Metropolitan Government Building.",
        "Spend a full day at Mount Fuji, Hakone, Kamakura, or Nikko.",
      ],
      toursCopy: [
        "Book a private licensed city circuit or neighborhood walk for a compact introduction.",
        "Pair a Meiji Jingu bike ride or photography walk with a Mount Fuji, Hakone, or Nikko day.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Meiji Jingu, Asakusa, or a licensed private city circuit.",
          "Afternoon: Imperial Palace, Shinjuku Gyoen, or a Ginza photography walk.",
          "Evening: Return to Shinjuku or Asakusa.",
        ],
        dayTwo: [
          "Morning: Mount Fuji, Hakone, Kamakura, or Nikko.",
          "Afternoon: Continue the published lake, ropeway, or shrine circuit.",
          "Evening: Return to central Tokyo.",
        ],
      },
      gettingThere: [
        "Haneda and Narita airports serve Tokyo with trains, taxis, and hotel transfers to Shinjuku, Shibuya, Asakusa, and most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Tokyo tours?",
          answer:
            "Licensed private city circuits, neighborhood walking, Meiji Jingu and Imperial Palace bike rides, Ginza photography walks, tea tastings, and full-day Mount Fuji, Hakone, Kamakura, or Nikko itineraries are the most popular departures.",
        },
      ],
    },
    {
      name: "Kyoto",
      slug: "kyoto",
      stateSlug: "japan",
      region: "Kyoto",
      lat: 35.0116,
      lng: 135.7681,
      shortDescription:
        "Temple and shrine circuits, Arashiyama bike rides, and Nara days from Kyoto.",
      intro:
        "Kyoto is Japan's former imperial capital with Kinkaku-ji, Kiyomizu-dera, Fushimi Inari-taisha, Arashiyama bamboo, Gion, and guided walking, cycling, hiking, tea, and photography tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/5b/1c/e7.jpg",
      ],
      activityTags: ["sightseeing", "cycling", "hiking"],
      whereItIs: [
        "Kyoto sits in the Kansai basin of western Honshu, with Higashiyama, Arashiyama, Fushimi, and the historic center framing most sightseeing.",
        "Most guided tours depart from Kyoto Station, Kitaoji, Saga-Arashiyama, Nishiki, and hotel meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Fushimi Inari forest trails and Arashiyama hillside temples sit on half-day hiking or bike routes from central Kyoto.",
        lakesWater:
          "Togetsukyo Bridge and riverside Arashiyama paths appear on scenic bike and private-vehicle days.",
        desertForest:
          "Arashiyama Bamboo Forest and Fushimi Inari woodland trails offer grove and shrine-forest stops between city neighborhoods.",
        cycling:
          "Guided bike and e-bike rides cover Arashiyama bamboo, Kinkaku-ji, Fushimi Inari, Kiyomizu-dera, and Gion on mixed park and street routes.",
        scenicDrives:
          "Private vans cover Kinkaku-ji, Fushimi Inari, Kiyomizu-dera, and Nara park roads from Kyoto hotels.",
        seasonalNotes:
          "Cherry-blossom and autumn-color months favor temple gardens and bamboo paths; summer heat favors early Fushimi Inari starts.",
      },
      thingsToDo: [
        "Walk Kinkaku-ji, Kiyomizu-dera, and Fushimi Inari with a licensed or local guide.",
        "Ride a guided bike loop past Arashiyama bamboo, Gion, and the Golden Pavilion.",
        "Spend a full day at Nara Park or a private Kyoto-Nara circuit.",
      ],
      toursCopy: [
        "Book a private licensed city circuit or neighborhood walk for a compact introduction.",
        "Pair an Arashiyama bike ride or Fushimi Inari hike with a Nara day.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Kinkaku-ji, Fushimi Inari, or a licensed private city circuit.",
          "Afternoon: Kiyomizu-dera, Gion, or an Arashiyama bamboo ride.",
          "Evening: Return to Kyoto Station or Gion.",
        ],
        dayTwo: [
          "Morning: Nara Park, Todai-ji, or a Kyoto-Nara private day.",
          "Afternoon: Continue the published shrine or temple circuit.",
          "Evening: Return to central Kyoto.",
        ],
      },
      gettingThere: [
        "Kansai International and Itami airports serve Kyoto with trains, buses, and hotel transfers to Kyoto Station, Gion, and most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Kyoto tours?",
          answer:
            "Licensed private temple circuits, Arashiyama bike rides, Fushimi Inari hidden hikes, Nishiki tea ceremonies, photography sessions, and full-day Nara itineraries are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

const thailandState: StateDestination = {
  slug: "thailand",
  name: "Thailand",
  description:
    "Bangkok temple and palace days, Thonburi canal rides, Silom cooking classes, Chinatown food walks, and day trips to Ayutthaya, Damnoen Saduak, and Maeklong.",
  featuredDescription:
    "Explore Bangkok tours with private Grand Palace circuits, longtail canal rides, historic bike routes, street-food walks, Thai cooking classes, and day trips to Ayutthaya or the floating and railway markets.",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/1a/ed/f5.jpg",
  region: "Asia",
  intro:
    "Thailand pairs walkable Bangkok temple and market days with canal, cooking, and historic-city bike outings, plus Ayutthaya and Damnoen Saduak day trips from the capital.",
  longDescription:
    "Bangkok anchors Thailand tour inventory with private Grand Palace, Wat Pho, and Wat Arun circuits, Thonburi longtail canal rides, Phra Nakhon bike routes, Talad Noi and Chinatown food walks, and Silom or morning-market cooking classes. Day trips from the capital add Ayutthaya temples and Bang Pa-In, plus Damnoen Saduak Floating Market and Maeklong Railway Market.",
  topRegions: [
    {
      title: "Temples and the old city",
      description:
        "Grand Palace, Wat Pho, Wat Arun, and guided walking or private-vehicle circuits through Rattanakosin.",
    },
    {
      title: "Canals and the river",
      description:
        "Thonburi khlong longtail rides, Baan Silapin, Wat Paknam Phasi Charoen viewpoints, and Chao Phraya crossings.",
    },
    {
      title: "Markets and day trips",
      description:
        "Ayutthaya, Bang Pa-In, Damnoen Saduak Floating Market, and Maeklong Railway Market on full-day or half-day routes from Bangkok.",
    },
  ],
  cities: [
    {
      name: "Bangkok",
      slug: "bangkok",
      stateSlug: "thailand",
      region: "Bangkok",
      lat: 13.7563,
      lng: 100.5018,
      shortDescription:
        "Private temple circuits, canal rides, cooking classes, and Ayutthaya or market days from Bangkok.",
      intro:
        "Bangkok is Thailand's capital with the Grand Palace, Wat Pho, Wat Arun, Thonburi canals, Chinatown, and guided walking, cycling, cooking, and day-trip tours.",
      heroImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/1a/ed/f5.jpg",
      ],
      activityTags: ["sightseeing", "cycling", "food"],
      whereItIs: [
        "Bangkok sits on the Chao Phraya River in central Thailand, with Rattanakosin, Thonburi, Silom, and Chinatown framing most sightseeing.",
        "Most guided tours depart from city hotels, Wat Pho, Si Phraya pier, Silom, Phra Nakhon, and meeting points confirmed at booking.",
      ],
      experiences: {
        mountains:
          "Day trips to Ayutthaya temple ruins and Bang Pa-In sit on full-day private routes from Bangkok.",
        lakesWater:
          "Thonburi canals, Chao Phraya longtail rides, and Damnoen Saduak floating-market boats appear on scenic days from the capital.",
        desertForest:
          "Temple courtyards, canal-side wooden houses, and market lanes offer the city's outdoor walking and cycling stops.",
        cycling:
          "Guided bike rides cover Phra Nakhon backstreets, Rama 8 Bridge, and Chao Phraya ferry segments.",
        scenicDrives:
          "Private vans cover the Grand Palace, Wat Arun, Ayutthaya, Damnoen Saduak, and Maeklong from Bangkok hotels.",
        seasonalNotes:
          "Cooler months favor full-day temple and market circuits; the hot season favors early bike and cooking starts.",
      },
      thingsToDo: [
        "Walk the Grand Palace, Wat Pho, and Wat Arun with a private guide.",
        "Ride a longtail through Thonburi canals or a historic-city bike loop.",
        "Spend a day at Ayutthaya or the Damnoen Saduak and Maeklong markets.",
      ],
      toursCopy: [
        "Book a private temple circuit or canal ride for a compact introduction.",
        "Pair a Silom cooking class or Chinatown food walk with an Ayutthaya or market day.",
      ],
      weekendItinerary: {
        dayOne: [
          "Morning: Grand Palace, Wat Pho, or a licensed private city circuit.",
          "Afternoon: Wat Arun, a Thonburi canal ride, or a Silom cooking class.",
          "Evening: Return to Silom or Chinatown.",
        ],
        dayTwo: [
          "Morning: Ayutthaya, Damnoen Saduak, or Maeklong Railway Market.",
          "Afternoon: Continue the published temple or market circuit.",
          "Evening: Return to central Bangkok.",
        ],
      },
      gettingThere: [
        "Suvarnabhumi and Don Mueang airports serve Bangkok with trains, taxis, and hotel transfers to Silom, Rattanakosin, and most tour meeting points.",
      ],
      faq: [
        {
          question: "What are the signature Bangkok tours?",
          answer:
            "Private Grand Palace circuits, Thonburi longtail canal rides, historic-city bike routes, Chinatown food walks, Thai cooking classes, and full-day Ayutthaya or floating-market itineraries are the most popular departures.",
        },
      ],
    },
  ],
  isFallback: true,
};

export const states: StateDestination[] = [
  ...westStates,
  ...northeastStates.filter(state => state.slug !== "massachusetts"),
  ...deepSouthStates,
  mississippiState,
  minnesotaState,
  hawaiiState,
  wyomingState,
  massachusettsState,
  illinoisState,
  unitedKingdomState,
  scotlandState,
  franceState,
  spainState,
  italyState,
  netherlandsState,
  irelandState,
  mexicoState,
  peruState,
  brazilState,
  japanState,
  thailandState,
];

export const destinations: Destination[] = states.map(state => ({
  name: state.name,
  stateSlug: state.slug,
  description: state.description,
  featuredDescription: state.featuredDescription,
  image: state.heroImage,
  href: `/destinations/${state.slug}`,
  region: state.region,
}));

export const featuredDestinations = destinations;

export const allCities = states.flatMap(state => state.cities);

export const getStateBySlug = (slug: string) =>
  states.find(state => state.slug === slug);

export const getCityBySlugs = (stateSlug: string, citySlug: string) =>
  states
    .find(state => state.slug === stateSlug)
    ?.cities.find(city => city.slug === citySlug);
