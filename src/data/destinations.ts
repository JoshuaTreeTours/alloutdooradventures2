export type Destination = {
  name: string;
  stateSlug: string;
  description: string;
  featuredDescription?: string;
  image: string;
  href: string;
};

export type StateCategory = {
  title: string;
  description: string;
};

export type City = {
  name: string;
  slug: string;
  stateSlug: string;
  lat: number;
  lng: number;
  shortDescription: string;
  intro: string;
  activities: string[];
  categoryTags: string[];
  image: string;
};

export type StateDestination = {
  slug: string;
  name: string;
  description: string;
  featuredDescription?: string;
  heroImage: string;
  longDescription: string;
  categories: StateCategory[];
  specialCategories: StateCategory[];
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
    longDescription: `California is a masterclass in variety for outdoor travelers. Within a single day you can watch dawn break over the Mojave Desert, spend an afternoon paddling a glassy alpine lake, and still catch sunset along the Pacific. The state stretches almost 800 miles from north to south, which means climates, ecosystems, and travel styles change quickly. That range creates the perfect playground for weekend escapes and weeklong epic loops alike. Whether you crave redwood shade, granite peaks, coastal cliffs, or sprawling desert basins, California delivers a layered itinerary that always feels new.

Along the coast, the vibe is restless and cinematic. Tide pools, surf breaks, and headlands draw visitors into a world of salt air and dramatic sunsets. Highway drives reveal fog-wrapped coves, vineyards on coastal bluffs, and wildlife refuges where sea lions lounge in the sun. Kayaking in kelp forests or hiking along bluff-top trails is often paired with local seafood markets and small-town cafés. The Pacific acts as a constant companion, moderating temperatures and offering year-round trails with epic ocean views.

Move inland and the Sierra Nevada rises like a wall of granite, crowned with alpine lakes and glacier-carved valleys. Summer brings accessible trailheads, wildflower meadows, and crisp, pine-scented air. Fall means golden aspens around high-elevation lakes, while winter transforms the range into a snow-sport haven. The Sierra is also where California’s long-distance backpacking dreams live—routes like the John Muir Trail give hikers weeks of big-sky wilderness. Even a short visit offers dramatic drives, scenic pullouts, and day hikes that end at waterfalls or panoramic lookouts.

Northern California’s forests feel almost enchanted. Coastal redwoods tower hundreds of feet above fern-lined trails, and the filtered light makes every walk feel quiet and sacred. You can string together a day of forest hikes with short detours to hidden beaches and cliffside viewpoints. The pace slows in these regions, and the scenery invites easy, mindful travel—great for visitors who want to slow down without sacrificing awe.

In the south and east, the desert shifts the mood. Joshua trees stand like sentinels, boulder piles create natural climbing gyms, and the night sky is a glittering dome. Desert adventures favor sunrise starts, late-day canyon walks, and soaking in hot springs when the air cools. The contrast between sun-baked basins and high-elevation mountain ridges is one of California’s best secrets. You can drive from palm oases to snow-capped peaks in a single afternoon.

California also excels at mixing outdoor adventure with easy logistics. Major airports, coastal towns, and mountain villages make it simple to plan a trip that balances comfort and wildness. Boutique lodges, campgrounds, and cabin stays are plentiful, and gear rental is accessible in most hubs. The state has invested heavily in trail networks, parks, and visitor services, which means beginners can explore without stress and seasoned explorers can push deeper into the backcountry.

For families, California’s variety shines. You can pair a beach day with a short hike, add a ranger-led program, then wind down with a local meal. For adrenaline seekers, the menu includes mountain biking, rock climbing, whitewater rafting, and multi-day backpacking loops. Food and culture sit right alongside the adventure, so each itinerary feels well-rounded rather than one-note.

Another reason California stands out is its shoulder season magic. Spring brings waterfalls and high-flow rivers. Early summer is peak wildflower time in the high country. Late summer and early fall reward travelers with warm days and uncrowded trails. Winter still offers coastline escapes and desert climbs even if alpine routes are snowed in. With thoughtful planning, there is always a trail, paddle, or viewpoint ready to go.

California’s outdoor identity is a blend of rugged landscapes and thoughtful access. It is where scenic drives become outdoor classrooms, where an afternoon hike can end with a dip in a turquoise lake, and where desert silence and coastal energy co-exist. The state’s scale might feel intimidating at first, but its experience is best enjoyed in small arcs—choose a region, set a pace, and let the landscapes do the rest. California doesn’t ask you to choose between coast or mountains, beginner or expert, quick getaway or long expedition. It invites you to do it all, one inspiring trip at a time.`,
    categories: [
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
    specialCategories: [
      {
        title: "Coastal Adventures",
        description: "Foggy headlands, wildlife cruises, and sunrise surf sessions.",
      },
      {
        title: "Sierra Mountains",
        description: "High-alpine lakes, granite domes, and summer trail loops.",
      },
      {
        title: "Desert Escapes",
        description: "Boulder fields, golden-hour hikes, and remote hot springs.",
      },
    ],
    cities: [
      {
        name: "San Diego",
        slug: "san-diego",
        stateSlug: "california",
        lat: 32.7157,
        lng: -117.1611,
        shortDescription: "Coastal paddles, cliff walks, and sunny beach culture.",
        intro:
          "San Diego blends beach-town energy with dramatic coastal trails and harbor adventures. Spend mornings on boardwalk rides, afternoons on sandstone bluffs, and evenings watching the sun drop into the Pacific.",
        activities: [
          "Kayak the sea caves of La Jolla",
          "Hike Torrey Pines’ coastal ridges",
          "Bike the bayside loop around Coronado",
        ],
        categoryTags: ["coastal", "paddling", "biking"],
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Lake Tahoe",
        slug: "lake-tahoe",
        stateSlug: "california",
        lat: 39.0968,
        lng: -120.0324,
        shortDescription: "Crystal waters, alpine peaks, and year-round trails.",
        intro:
          "Lake Tahoe is an alpine escape wrapped in pine forests and granite peaks. The lake’s cobalt water pairs with ridge hikes, paddle routes, and cozy mountain towns that make for a perfect basecamp.",
        activities: [
          "Paddle Emerald Bay at sunrise",
          "Hike to alpine viewpoints above the lake",
          "Ride forest singletrack in summer",
        ],
        categoryTags: ["alpine", "hiking", "paddling"],
        image:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Joshua Tree",
        slug: "joshua-tree",
        stateSlug: "california",
        lat: 34.1347,
        lng: -116.3131,
        shortDescription: "Desert boulders, stargazing skies, and golden light.",
        intro:
          "Joshua Tree delivers otherworldly desert scenes with an easygoing town vibe. It is a haven for climbers, photographers, and anyone who wants wide-open silence and glowing sunsets.",
        activities: [
          "Scramble among the boulder fields",
          "Drive scenic loops through desert vistas",
          "Stargaze under the Milky Way",
        ],
        categoryTags: ["desert", "climbing", "stargazing"],
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
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
    longDescription: `Arizona is a land of deep canyons, sculpted mesas, and sky that seems to stretch forever. It is a destination that rewards early starts and patient exploration, where the desert teaches a slower rhythm and the landscapes expand in every direction. The state’s outdoor appeal begins with the Grand Canyon, but the real magic lies in the layers—high plateaus, red-rock amphitheaters, pine forests, and hidden river corridors that invite you to explore beyond the obvious.

In northern Arizona, pine-scented highlands create a cool escape from summer heat. Flagstaff serves as a mountain basecamp with easy access to volcanic cinder cones, alpine meadows, and canyon rim trails. Trails here are ideal for day hikes and mountain bike loops, with elevation keeping the air crisp even in the height of summer. Nearby, Sedona adds a surreal blend of red rock cathedrals and winding canyons, a haven for hikers, photographers, and travelers who love sunrise and sunset light.

The canyon country is Arizona’s signature. Standing at a rim overlook can feel like staring at another planet. Hiking down into the depths reveals hidden streams, dramatic stone walls, and a sense of scale that makes every step feel monumental. Rafting trips on the Colorado River combine adventure with a front-row seat to geology that spans millions of years. Whether you choose a short rim walk or a multi-day river journey, the canyon experience is unforgettable.

Southern Arizona leans into desert beauty with a softer, more rugged charm. Saguaro cactus forests surround Tucson, offering dawn and dusk hikes that are as much about light and quiet as they are about distance. The Sonoran Desert blooms in spring, painting the landscape with color and inviting wildflower hikes. Outside the cities, mountain ranges rise abruptly from the desert floor, creating microclimates with cooler temperatures and scenic drives.

Arizona is also a stargazer’s dream. The state’s dry air and low light pollution mean skies that sparkle with intensity. Dark-sky parks and observatories invite you to linger after dinner, scanning the Milky Way while desert nights cool. For travelers who want their adventures to extend past daylight, Arizona provides an unmatched nighttime show.

The state’s outdoor culture is welcoming to all levels. Short hikes lead to natural bridges, slot canyons, and waterfalls that feel like hidden gems. Longer trails cross mesas and weaving riverbeds for those wanting a full-day challenge. Road trippers appreciate Arizona’s scenic byways and iconic Route 66 towns. At the same time, the state’s networks of guided tours, outfitters, and national park services make it easy for first-time visitors to navigate safely and confidently.

Arizona’s seasons deliver different highlights. Winter is prime time for desert hikes, with clear skies and mild temperatures. Spring brings wildflowers and comfortable days in the canyons. Summer is ideal for the high country, where mountain trails and lakes offer cooler escapes. Fall blends warm days and golden light, perfect for photography and shoulder-season hiking. That year-round window makes planning flexible and fun.

More than anything, Arizona invites you to slow down. The landscapes are expansive and the pace is unhurried, encouraging lingering looks and quiet moments. You can build an itinerary around sunrise hikes and evening canyon overlooks, or mix in cultural stops at heritage sites and historic towns. The state thrives on contrast—fiery red rocks and shadowed canyons, quiet desert washes and lively mountain towns, remote trails and accessible scenic drives.

Arizona’s outdoor experiences feel timeless. They offer both big, bucket-list moments and small, personal memories: a switchback trail, a desert breeze, a canyon echo. That balance makes Arizona a top-tier getaway for anyone who wants adventure with space to breathe, a place where every horizon promises a new route to explore.`,
    categories: [
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
    specialCategories: [
      {
        title: "Red Rock Sanctuaries",
        description: "Cathedral formations, sunrise hikes, and scenic overlooks.",
      },
      {
        title: "Colorado River Adventures",
        description: "Rafting trips, canyon beaches, and riverside camps.",
      },
      {
        title: "Sky Island Escapes",
        description: "High-elevation trails with sweeping desert views.",
      },
    ],
    cities: [
      {
        name: "Sedona",
        slug: "sedona",
        stateSlug: "arizona",
        lat: 34.8697,
        lng: -111.7609,
        shortDescription: "Red rock cathedrals, vortex hikes, and sunset vistas.",
        intro:
          "Sedona is defined by crimson cliffs and sculpted rock towers. It is the perfect basecamp for sunrise hikes, jeep tours, and quiet canyon walks lined with juniper and pine.",
        activities: [
          "Hike Cathedral Rock at dawn",
          "Ride scenic backcountry jeep trails",
          "Explore Oak Creek’s shaded canyon walks",
        ],
        categoryTags: ["canyons", "hiking", "scenic"],
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Flagstaff",
        slug: "flagstaff",
        stateSlug: "arizona",
        lat: 35.1983,
        lng: -111.6513,
        shortDescription: "Pine forests, volcanic peaks, and cool alpine air.",
        intro:
          "Flagstaff offers a mountain escape with quick access to alpine hikes, cinder cone climbs, and stargazing skies. It is a refreshing summer base with a vibrant downtown.",
        activities: [
          "Climb Sunset Crater’s lava fields",
          "Bike the forest singletrack network",
          "Catch the Milky Way at Lowell Observatory",
        ],
        categoryTags: ["alpine", "biking", "stargazing"],
        image:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Tucson",
        slug: "tucson",
        stateSlug: "arizona",
        lat: 32.2226,
        lng: -110.9747,
        shortDescription: "Saguaro forests, desert loops, and mountain escapes.",
        intro:
          "Tucson pairs Sonoran Desert trails with easy access to cooler mountain ridges. The region is perfect for sunrise hikes, desert drives, and outdoor dining under clear skies.",
        activities: [
          "Walk the Saguaro National Park loops",
          "Drive the scenic Mount Lemmon Highway",
          "Join a desert sunset tour",
        ],
        categoryTags: ["desert", "scenic", "wildlife"],
        image:
          "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    slug: "nevada",
    name: "Nevada",
    description: "Hidden hot springs, high desert trails, and open skies.",
    featuredDescription: "Wide-open basins, rugged ranges, and hidden hot springs.",
    heroImage:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80",
    longDescription: `Nevada is the quiet achiever of the West—vast, dramatic, and endlessly surprising. Beyond the neon lights of Las Vegas lies a landscape of high deserts, lonely mountain ranges, and remote hot springs. It is a place for travelers who crave space and solitude, where a scenic drive can mean hours of open road and a trail can lead to a viewpoint with no one else in sight. Nevada’s outdoor appeal is about scale and silence, about wide horizons and hidden pockets of life in the desert.

The state’s geography is shaped by the Basin and Range, a series of parallel mountain ridges and broad valleys. That pattern creates endless opportunities for hiking, off-road exploration, and backcountry camping. The ranges rise abruptly from the desert floor, offering cooler temperatures and unexpected pockets of green. In spring and early summer, you might find alpine wildflowers on the peaks and sun-warmed sagebrush in the valleys below.

Nevada’s hot springs are legendary. From developed resort pools to remote soak spots hidden in the hills, the state offers a unique way to unwind after a day of hiking. A well-planned road trip can string together hot springs, ghost towns, and scenic byways, making each day feel like a treasure hunt. These experiences are best enjoyed at a slower pace, with time to linger and appreciate the quiet.

The state is also rich with geological wonders. Great Basin National Park stands as a highlight with its limestone caves, high-elevation bristlecone pine groves, and dark night skies. The park’s remoteness is part of its magic; you can hike to alpine lakes, explore caves, and watch the Milky Way blaze overhead with minimal crowds. In the west, the Sierra Nevada spills into the state, bringing alpine lakes and forested slopes to places like Lake Tahoe’s Nevada shore.

Nevada’s desert offers a different kind of adventure. Long-distance trail runners and mountain bikers love the open terrain and rolling hills. Photographers chase the golden light that paints the basins at dusk. The desert’s minimalism becomes an asset—you can see weather systems rolling in from miles away and track the movement of light across the ranges. With proper planning and water, day hikes through canyons and washes are rewarding and surprisingly diverse.

For travelers who prefer guided experiences, Nevada offers opportunities to explore with local expertise. Off-road tours, backcountry jeep excursions, and guided hikes help visitors safely navigate the remote terrain. Small towns and desert outposts provide the essentials, and the state’s friendly, frontier spirit shows through in local diners and small lodging spots.

Nevada’s seasons are distinct but manageable. Spring is ideal for exploring the deserts and lower ranges, while summer is best spent in higher elevations or on alpine lakes. Fall is crisp and golden, perfect for scenic drives and shoulder-season hiking. Winter brings snow to the mountains and a quiet hush to the basins, ideal for those seeking solitude and clear night skies.

The spirit of Nevada is one of adventure and self-reliance, yet it offers plenty of accessible experiences for first-time explorers. A sunrise hike to a high desert overlook, a soak in a natural hot spring, or a starlit camp in a remote basin can be life-changing without requiring extreme skills. The key is planning and respect for the environment, which rewards visitors with genuine quiet and open space.

Nevada might be understated, but for those who want a deeper, more contemplative outdoor getaway, it is extraordinary. The state invites you to slow down, to watch the light change across the desert, to linger in a hot spring as the stars come out, and to appreciate landscapes that feel untouched and timeless. It is an ideal destination for travelers who want to escape the noise and reconnect with the vastness of the West.`,
    categories: [
      {
        title: "High Desert Trails",
        description: "Open landscapes, sagebrush basins, and rugged ridgelines.",
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
    specialCategories: [
      {
        title: "Remote Soakaways",
        description: "Quiet hot springs paired with desert sunsets.",
      },
      {
        title: "Basin & Range Treks",
        description: "Multi-range hiking loops and scenic ridge walks.",
      },
      {
        title: "Dark Sky Adventures",
        description: "Astronomy nights and moonlit desert camps.",
      },
    ],
    cities: [
      {
        name: "Reno",
        slug: "reno",
        stateSlug: "nevada",
        lat: 39.5296,
        lng: -119.8138,
        shortDescription: "Urban basecamp for Tahoe trails and river walks.",
        intro:
          "Reno is a lively basecamp with quick access to the Truckee River and Tahoe’s alpine playground. It is ideal for travelers who want trails by day and city energy by night.",
        activities: [
          "Paddle the Truckee River whitewater park",
          "Day trip to Tahoe’s east shore beaches",
          "Explore nearby desert hot springs",
        ],
        categoryTags: ["alpine", "paddling", "hot-springs"],
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Las Vegas",
        slug: "las-vegas",
        stateSlug: "nevada",
        lat: 36.1699,
        lng: -115.1398,
        shortDescription: "Gateway to desert parks, canyons, and rock climbs.",
        intro:
          "Las Vegas is the launchpad for red rock adventures, desert canyons, and scenic drives. Just beyond the strip lies a world of sandstone trails and sunrise hikes.",
        activities: [
          "Hike Red Rock Canyon’s calico trails",
          "Kayak the Black Canyon of the Colorado",
          "Climb the boulders of Calico Basin",
        ],
        categoryTags: ["desert", "canyons", "climbing"],
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Baker",
        slug: "baker",
        stateSlug: "nevada",
        lat: 38.9833,
        lng: -114.1992,
        shortDescription: "Small-town gateway to Great Basin National Park.",
        intro:
          "Baker is the quiet access point for Great Basin’s alpine trails, limestone caves, and bristlecone forests. It is perfect for travelers seeking remote mountain adventures.",
        activities: [
          "Hike Wheeler Peak’s alpine switchbacks",
          "Tour Lehman Caves’ underground chambers",
          "Camp under Nevada’s darkest skies",
        ],
        categoryTags: ["alpine", "stargazing", "hiking"],
        image:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
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
    categories: [
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
    specialCategories: [
      {
        title: "Moab Adventure Hub",
        description: "Mountain biking, river trips, and desert jeep trails.",
      },
      {
        title: "Zion & Bryce Highlights",
        description: "Iconic viewpoints, hoodoo trails, and canyon hikes.",
      },
      {
        title: "Wasatch Alpine Days",
        description: "High-elevation lakes, ridge hikes, and cool air.",
      },
    ],
    cities: [
      {
        name: "Moab",
        slug: "moab",
        stateSlug: "utah",
        lat: 38.5733,
        lng: -109.5498,
        shortDescription: "Red rock playground for biking, hiking, and rafting.",
        intro:
          "Moab is the adventure epicenter of Utah, surrounded by red rock cliffs and desert trails. It is the ideal base for mountain biking, canyon hikes, and river adventures.",
        activities: [
          "Ride the Slickrock Trail",
          "Hike to Delicate Arch at sunrise",
          "Raft the Colorado River’s gentle stretches",
        ],
        categoryTags: ["biking", "canyons", "rafting"],
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Springdale",
        slug: "springdale",
        stateSlug: "utah",
        lat: 37.1889,
        lng: -112.9989,
        shortDescription: "Gateway to Zion’s iconic canyon walls and hikes.",
        intro:
          "Springdale sits at the entrance of Zion National Park, providing easy access to famous hikes and scenic canyon drives.",
        activities: [
          "Walk the Riverside Walk into the Narrows",
          "Take the Canyon Overlook Trail",
          "Cycle the Pa’rus Trail at sunset",
        ],
        categoryTags: ["canyons", "hiking", "scenic"],
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Park City",
        slug: "park-city",
        stateSlug: "utah",
        lat: 40.6461,
        lng: -111.498,
        shortDescription: "Alpine trails, mountain bike parks, and summer festivals.",
        intro:
          "Park City mixes mountain-town charm with accessible alpine trails. It is a cooler summer escape with easy hikes, biking, and scenic chairlift rides.",
        activities: [
          "Hike the Wasatch Crest Trail",
          "Bike resort singletrack routes",
          "Ride a scenic chairlift for panoramic views",
        ],
        categoryTags: ["alpine", "biking", "hiking"],
        image:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
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
    categories: [
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
    specialCategories: [
      {
        title: "Pacific Coast Drives",
        description: "Scenic byways, beach towns, and sunset strolls.",
      },
      {
        title: "High Desert Escapes",
        description: "Sunny days, pine forests, and volcanic landscapes.",
      },
      {
        title: "Rainforest Ramblers",
        description: "Fern-lined trails and mossy canyon hikes.",
      },
    ],
    cities: [
      {
        name: "Portland",
        slug: "portland",
        stateSlug: "oregon",
        lat: 45.5152,
        lng: -122.6784,
        shortDescription: "Urban gateway to the Columbia Gorge and forest trails.",
        intro:
          "Portland is the ideal launch point for waterfall hikes, forest walks, and river adventures. It pairs an outdoor-friendly city vibe with quick access to the Gorge and Mount Hood.",
        activities: [
          "Hike Multnomah Falls and nearby trails",
          "Bike along the Willamette River",
          "Day trip to Mount Hood’s alpine lakes",
        ],
        categoryTags: ["waterfalls", "biking", "alpine"],
        image:
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Bend",
        slug: "bend",
        stateSlug: "oregon",
        lat: 44.0582,
        lng: -121.3153,
        shortDescription: "High desert trails, river floats, and volcanic vistas.",
        intro:
          "Bend blends sunny high-desert weather with easy access to volcanic peaks and river adventures. It is a playground for biking, paddling, and casual hikes.",
        activities: [
          "Float the Deschutes River",
          "Mountain bike the Phil’s Trail network",
          "Hike around the Cascade Lakes",
        ],
        categoryTags: ["biking", "paddling", "volcanic"],
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Cannon Beach",
        slug: "cannon-beach",
        stateSlug: "oregon",
        lat: 45.8918,
        lng: -123.9615,
        shortDescription: "Sea stacks, sandy coves, and coastal strolls.",
        intro:
          "Cannon Beach is famous for Haystack Rock and a charming coastal vibe. It is perfect for beach walks, tide pooling, and sunset photography.",
        activities: [
          "Explore the tide pools at low tide",
          "Walk the beach at golden hour",
          "Hike Ecola State Park viewpoints",
        ],
        categoryTags: ["coastal", "scenic", "wildlife"],
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
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
    longDescription: `Washington is a state of lush contrasts—rainforests, rugged coastline, snow-capped peaks, and sparkling alpine lakes. It is a paradise for hikers, paddlers, and anyone who loves misty mornings and mountain silhouettes. From the Olympic Peninsula to the Cascade Range, Washington offers an outdoor itinerary that feels both wild and accessible.

The Olympic Peninsula is a standout for its diversity. In a single day you can walk along driftwood-lined beaches, wander through temperate rainforest, and hike alpine ridgelines. The Hoh Rainforest is a highlight with its moss-draped trees and quiet, misty trails. Coastal hikes bring sea stacks, tide pools, and dramatic sunsets. The peninsula’s remote feel makes it ideal for travelers who want a true sense of escape.

The Cascade Mountains dominate the state’s interior, offering some of the best alpine hiking in the country. Trails lead to turquoise lakes, wildflower meadows, and glacier-capped viewpoints. Mount Rainier is the crown jewel, with legendary hikes that circle the mountain and reveal sweeping views. The Cascades also provide excellent opportunities for mountain biking, camping, and scenic drives.

Washington’s waterways add another layer of adventure. Puget Sound is a hub for kayaking, whale watching, and island hopping. The San Juan Islands offer quiet paddling routes and peaceful trails with ocean views. Lakes like Diablo and Lake Chelan provide vibrant blue water framed by rugged cliffs, perfect for paddling or scenic boat tours.

The state’s outdoor culture is strong and inclusive. Trail networks are extensive, parks are well-maintained, and local communities embrace an active lifestyle. Seattle and other cities provide easy access to nearby hikes, making it possible to build a trip that balances urban energy with outdoor exploration. Visitors can enjoy a morning market, then be on a mountain trail by afternoon.

Seasonally, Washington shines in late spring and summer when alpine trails open and wildflowers bloom. Fall offers crisp air and golden forests, while winter transforms the Cascades into a snowy playground for skiing and snowshoeing. Coastal areas remain accessible year-round, with dramatic storm watching in the colder months. This variety makes Washington a destination for every season and every type of traveler.

Washington is also a dream for photographers and nature lovers. The interplay of mist, light, and mountain shapes creates dramatic scenery, and the state’s diverse ecosystems mean that every region feels distinct. Whether you are hiking to a glacier-fed lake, exploring a rainforest trail, or paddling along a rocky coast, the experience feels immersive and unforgettable.

For families, Washington offers easy day hikes, scenic drives, and ferry rides that add adventure to any itinerary. For more experienced travelers, multi-day backpacking routes and challenging summit hikes provide a deeper immersion. The state’s infrastructure makes it easy to plan, with well-marked trails, visitor centers, and abundant lodging options in gateway towns.

Washington invites exploration with a sense of wonder. It is a state where the outdoors feels abundant and close at hand, where each region offers a new atmosphere, and where every trip can be tailored to your pace. Whether you are chasing alpine sunrises, coastal sunsets, or quiet forest walks, Washington delivers a balanced, awe-filled getaway that keeps outdoor lovers coming back.`,
    categories: [
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
    specialCategories: [
      {
        title: "Olympic Peninsula Loops",
        description: "Rainforests, beaches, and alpine ridges in one region.",
      },
      {
        title: "Cascade Summit Days",
        description: "Glacier viewpoints and high-elevation trail loops.",
      },
      {
        title: "Island + Sound Adventures",
        description: "Ferry rides, kayaking routes, and coastal towns.",
      },
    ],
    cities: [
      {
        name: "Seattle",
        slug: "seattle",
        stateSlug: "washington",
        lat: 47.6062,
        lng: -122.3321,
        shortDescription: "City basecamp for alpine lakes and island escapes.",
        intro:
          "Seattle pairs waterfront energy with quick access to mountain trails and island ferries. It is the perfect hub for day trips to alpine lakes and coastal viewpoints.",
        activities: [
          "Hike to Rattlesnake Ledge",
          "Take a ferry to Bainbridge Island",
          "Kayak on Lake Union at sunset",
        ],
        categoryTags: ["alpine", "paddling", "scenic"],
        image:
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Port Angeles",
        slug: "port-angeles",
        stateSlug: "washington",
        lat: 48.1181,
        lng: -123.4307,
        shortDescription: "Gateway to Olympic rainforests and rugged coastline.",
        intro:
          "Port Angeles offers easy access to Olympic National Park’s rainforests, alpine ridges, and driftwood beaches. It is ideal for travelers who want quick access to wilderness.",
        activities: [
          "Hike Hurricane Ridge trails",
          "Explore the Hoh Rainforest boardwalks",
          "Drive out to Rialto Beach for sunset",
        ],
        categoryTags: ["rainforest", "coastal", "hiking"],
        image:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Leavenworth",
        slug: "leavenworth",
        stateSlug: "washington",
        lat: 47.5962,
        lng: -120.6615,
        shortDescription: "Alpine village with river trails and mountain views.",
        intro:
          "Leavenworth blends alpine scenery with a charming Bavarian village feel. Nearby trails and rivers provide quick outdoor escapes in a picturesque setting.",
        activities: [
          "Hike to Colchuck Lake",
          "Tube the Wenatchee River",
          "Stroll the Icicle Gorge scenic drive",
        ],
        categoryTags: ["alpine", "paddling", "scenic"],
        image:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
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
