export type CityGuideHighlight = {
  title: string;
  description: string;
};

export type CityGuideContent = {
  heroTitle: string;
  intro: string;
  whyVisit: string;
  bestThingsIntro: string;
  highlights: CityGuideHighlight[];
  whenToGo: string;
  whoFor: string;
  practicalTips: string;
  toursIntro: string;
};

type RegionType = "coastal" | "mountain" | "desert" | "urban" | "lake" | "river" | "general";

type GenerateCityGuideInput = {
  cityName: string;
  stateName: string;
  categoriesPresent: string[];
  regionType?: RegionType;
};

const REGION_FLAVOR: Record<RegionType, string[]> = {
  coastal: [
    "salt air breezes and boardwalk energy",
    "oceanfront promenades, tide timing, and seafood markets",
    "sunset viewpoints over the water and easy beach access",
  ],
  mountain: [
    "trail networks, alpine mornings, and big-sky viewpoints",
    "a culture of basecamp cafés and trailhead breakfasts",
    "cool evenings, mountain light, and high-elevation panoramas",
  ],
  desert: [
    "golden-hour light, open horizons, and red-rock scenery",
    "a rhythm of early starts, shaded patios, and starlit nights",
    "wide-open landscapes, bold geology, and big temperature swings",
  ],
  urban: [
    "a compact grid of neighborhoods, galleries, and café patios",
    "walkable districts with transit connections and nightlife hubs",
    "a blend of historic blocks and modern design-forward streets",
  ],
  lake: [
    "waterfront paths, dockside cafés, and slow-sunrise mornings",
    "easy access to shoreline parks and calm water adventures",
    "island views, breezy afternoons, and boat-friendly bays",
  ],
  river: [
    "riverwalks, bridges, and a steady current of outdoor energy",
    "scenic overlooks, paddle launches, and relaxed waterfront dining",
    "daytime trail loops with a cooling river breeze",
  ],
  general: [
    "a mix of easygoing neighborhoods and outdoor day trips",
    "a balance of culture, food, and quick escapes to nature",
    "an approachable gateway that works for first-time and repeat visits",
  ],
};

const CATEGORY_LABELS: Record<string, string> = {
  cycling: "cycling",
  hiking: "hiking",
  canoeing: "paddle",
  "day-adventures": "day adventures",
  detours: "scenic detours",
  "multi-day": "multi-day journeys",
};

const CATEGORY_HIGHLIGHTS: Record<string, (city: string, state: string) => CityGuideHighlight> = {
  cycling: (city, state) => ({
    title: "Greenway ride through town",
    description: `${city} has a ride-friendly core with protected paths and calm side streets. Book a guided cycling tour to stitch together neighborhoods in ${state} while learning the city’s backstory. The loop format keeps it easy to pause for coffee or a viewpoint without losing momentum.`,
  }),
  hiking: (city, state) => ({
    title: "Signature hike with city views",
    description: `Trailheads near ${city} deliver quick access to higher ground and skyline perspectives. A guided hike helps you pick the right route for the weather and avoid midday heat in ${state}. Expect a mix of switchbacks, interpretive stops, and time for photos at the top.`,
  }),
  canoeing: (city, state) => ({
    title: "Paddle the city waterways",
    description: `Water-based tours in ${city} are a serene contrast to the downtown buzz. Local guides point out wildlife, architectural details, and launch points you might miss on your own. Plan for a mellow pace and lingering sunset light in ${state}.`,
  }),
  "multi-day": (city, state) => ({
    title: "Multi-day basecamp escape",
    description: `${city} makes a smart staging point for multi-day adventures deeper in ${state}. Use a guided itinerary to handle logistics, gear, and route planning while still returning to a comfortable bed. It’s a smooth way to sample bigger terrain without the stress.`,
  }),
  "day-adventures": (city, state) => ({
    title: "All-day adventure circuit",
    description: `Day-long excursions from ${city} connect a highlight trail, a scenic lunch stop, and an easygoing return. Guides keep timing realistic and recommend the best seasonal routes in ${state}. It’s a full itinerary without the fatigue of planning it yourself.`,
  }),
  detours: (city, state) => ({
    title: "Scenic detours beyond the core",
    description: `Short drives from ${city} reveal quieter vistas, hidden cafés, and overlook pullouts. A curated detour day lets you savor ${state}’s landscapes without the rush. Bring a camera and a flexible afternoon for spontaneous stops.`,
  }),
};

const hashString = (value: string) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const pickFromPool = (pool: string[], seed: number, offset: number) =>
  pool[(seed + offset) % pool.length];

const sentenceList = (items: string[]) => {
  if (!items.length) {
    return "guided tours";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const buildIntro = ({ cityName, stateName, seed, regionType }: { cityName: string; stateName: string; seed: number; regionType: RegionType }) => {
  const flavor = pickFromPool(REGION_FLAVOR[regionType], seed, 1);
  const opener = pickFromPool(
    [
      `${cityName}, ${stateName} is the kind of place that rewards slowing down. It blends ${flavor} with a steady stream of local stories and outdoor access.`,
      `You’ll notice right away that ${cityName} feels built for travelers who want both culture and fresh air. The city pairs ${flavor} with an easygoing pace.`,
      `${cityName} sits at a crossroads of nature and neighborhood life in ${stateName}. Think ${flavor}, plus a deep roster of creative, food, and trail culture.`,
    ],
    seed,
    2,
  );

  const middle = pickFromPool(
    [
      `Spend a morning wandering local markets, then pivot to a guided outing that gets you into the landscapes just beyond the skyline. You can craft a visit that feels layered: a scenic overlook, a long lunch, and a sunset stroll back in town.`,
      `The city’s scale makes it easy to mix guided tours with self-guided wandering. You can pair a half-day adventure with a neighborhood food crawl or a museum hour, keeping the day varied without feeling packed.`,
      `First-timers appreciate how easy it is to navigate, while repeat visitors chase the smaller details: a new café, a quieter trail, or a fresh viewpoint at golden hour.`,
    ],
    seed,
    3,
  );

  const closer = pickFromPool(
    [
      `Whether you’re here for an active weekend or a longer reset, ${cityName} delivers a friendly, grounded introduction to the wider region.`,
      `It’s an ideal gateway for travelers who want the comfort of a city base with outdoor thrills always within reach.`,
      `Come for the trails and tours, stay for the food scene and the mellow local rhythm that makes ${cityName} feel instantly familiar.`,
    ],
    seed,
    4,
  );

  return `${opener}\n\n${middle}\n\n${closer}`;
};

const buildWhyVisit = ({ cityName, stateName, seed, regionType }: { cityName: string; stateName: string; seed: number; regionType: RegionType }) => {
  const regionalAngle = pickFromPool(REGION_FLAVOR[regionType], seed, 5);
  const paragraphOne = pickFromPool(
    [
      `${cityName} earns its reputation as a launchpad for discovery in ${stateName}. The city is compact enough to feel approachable, yet it sits close to landscapes that invite full-day adventures. That proximity means you can fit in a guided ride, a scenic hike, or a paddle session without sacrificing evenings in town.`,
      `The best reason to visit ${cityName} is the balance it strikes. In a single day you can explore neighborhoods, eat well, and still make time for an outing that captures ${regionalAngle}. It’s a destination that respects your time and rewards curiosity.`,
      `Travelers gravitate to ${cityName} because it doesn’t make you choose between culture and nature. You get galleries, architecture, and a creative food scene, plus easy access to ${regionalAngle} just beyond the city limits.`,
    ],
    seed,
    6,
  );

  const paragraphTwo = pickFromPool(
    [
      `Guided tours are especially valuable here because they connect the dots between neighborhoods and trailheads. Local guides explain the geography, the history, and the seasonal shifts that shape the best times to explore. You’ll walk away with a deeper sense of place than you would from a quick drive-by stop.`,
      `What stands out is how many different styles of exploration work in ${cityName}. You can plan a relaxed itinerary built around cafés and markets, or stack your days with longer excursions. Either way, the city’s pace makes it easy to settle in and see more than the highlights.`,
      `Because the city is used to hosting active travelers, the infrastructure is ready: rental gear, trail access, and tour operators that make logistics effortless. It’s a destination that feels curated for you, even if you’re planning on the fly.`,
    ],
    seed,
    7,
  );

  const paragraphThree = pickFromPool(
    [
      `If you’re exploring ${stateName} more broadly, ${cityName} makes a smart base. You can return each night to reliable dining and comfortable lodging, then head back out the next morning for a new slice of the region.`,
      `The result is a trip that feels both grounded and adventurous. You spend less time figuring out routes and more time being present in the places that drew you here in the first place.`,
      `For travelers who love a layered experience, ${cityName} is a sweet spot: approachable, engaging, and full of surprises that reveal themselves with each day.`,
    ],
    seed,
    8,
  );

  return `${paragraphOne}\n\n${paragraphTwo}\n\n${paragraphThree}`;
};

const buildBestThingsIntro = ({ cityName, stateName, seed }: { cityName: string; stateName: string; seed: number }) => {
  const paragraphOne = pickFromPool(
    [
      `The best things to do in ${cityName} combine natural scenery with a distinct local flavor. Plan for a mix of guided experiences and slow, meandering time in the neighborhoods — that’s where the city’s personality shines through.`,
      `In ${cityName}, the most memorable days blend outdoor energy with the small details: a favorite bakery, a sunset lookout, a riverside walk. Use the list below as a flexible menu rather than a checklist.`,
      `${cityName} rewards travelers who like variety. A great itinerary might pair an early adventure with an afternoon of gallery hopping and a long dinner that stretches into the evening.`,
    ],
    seed,
    9,
  );

  const paragraphTwo = pickFromPool(
    [
      `These highlights are curated to keep your days balanced — active mornings, restorative pauses, and plenty of room for local discovery. You’ll find options that suit families, solo travelers, and small groups planning a multi-day escape.`,
      `Each experience here works well on its own, but the real magic comes from combining them. Aim for one anchor activity each day, then leave space to linger in the neighborhoods that catch your eye.`,
      `Consider this a guide to pace: pick one or two headline activities, then sprinkle in food stops and scenic walks to keep the day easygoing.`,
    ],
    seed,
    10,
  );

  return `${paragraphOne}\n\n${paragraphTwo}`;
};

const buildWhenToGo = ({ cityName, stateName, seed }: { cityName: string; stateName: string; seed: number }) => {
  const paragraphOne = pickFromPool(
    [
      `Shoulder seasons tend to be the sweet spot in ${cityName}. Late spring and early fall deliver comfortable temperatures and lighter crowds, which makes guided tours feel more personal and unhurried. Summer brings a lively energy and longer days, but plan your outdoor adventures earlier to avoid the hottest hours.`,
      `If you prefer a calmer pace, aim for the weeks just before peak travel season in ${cityName}. You’ll find better availability on tours and easier access to scenic viewpoints, plus the weather in ${stateName} is often at its most photogenic.`,
      `Weather in ${cityName} can shift quickly, so build flexibility into your schedule. A local guide can help you swap in a shaded route or move your tour time to make the most of the day.`,
    ],
    seed,
    11,
  );

  const paragraphTwo = pickFromPool(
    [
      `For trip length, three to four days is the minimum to feel the city and one or two nearby landscapes. Five to seven days lets you add a day trip, slow down for museums and markets, and still carve out an easy afternoon.`,
      `A long weekend covers the essentials, but a full week in ${cityName} gives you room to explore different neighborhoods plus a full-day outing beyond town. That’s the ideal rhythm if you want to mix tours with unstructured wandering.`,
      `If you can stay for five days or more, you’ll have time to mix a signature tour with a second, slower experience — perhaps a food-focused walk or a scenic sunset outing.`,
    ],
    seed,
    12,
  );

  const paragraphThree = pickFromPool(
    [
      `Build in one flexible day for weather or spontaneous recommendations. Locals in ${cityName} often have the best tips for the day’s light, trail conditions, and unexpected events, so leave some room for their advice.`,
      `Because ${cityName} is easy to navigate, you can adapt on the fly. Keep one day open for a detour that feels right once you arrive.`,
      `The key is balance: anchor your trip with one or two must-dos, then let the rest unfold based on the season’s energy.`,
    ],
    seed,
    13,
  );

  return `${paragraphOne}\n\n${paragraphTwo}\n\n${paragraphThree}`;
};

const buildWhoFor = ({ cityName, stateName, seed }: { cityName: string; stateName: string; seed: number }) => {
  const paragraphOne = pickFromPool(
    [
      `${cityName} is perfect for travelers who want an active trip without giving up the comforts of a city base. It’s a strong pick for couples and small groups who value variety and don’t want to over-plan every hour.`,
      `If you like to mix a little adventure with a lot of local flavor, ${cityName} fits the bill. Families, friend groups, and solo travelers will find a friendly scene and plenty of choices in ${stateName}.`,
      `This destination suits curious explorers — people who want to do a guided tour, then linger in a café, then catch a sunset viewpoint before dinner.`,
    ],
    seed,
    14,
  );

  const paragraphTwo = pickFromPool(
    [
      `It’s also ideal for travelers who want to sample multiple activities in one trip. You can try cycling one day, a guided hike the next, and still leave time for cultural stops and long meals.`,
      `Outdoor enthusiasts will appreciate the range of tours, while culture seekers can anchor their days with markets, museums, and neighborhood walks. It’s a balanced blend that feels manageable even on a short stay.`,
      `If you appreciate a flexible itinerary that still feels well curated, ${cityName} delivers. You’ll get enough structure to feel confident, with plenty of space to improvise.`,
    ],
    seed,
    15,
  );

  return `${paragraphOne}\n\n${paragraphTwo}`;
};

const buildPracticalTips = ({ cityName, stateName, seed }: { cityName: string; stateName: string; seed: number }) => {
  const paragraphOne = pickFromPool(
    [
      `Getting around ${cityName} is straightforward: the core is walkable, and rideshare or local transit can bridge longer distances. If you plan day trips, consider renting a car for flexibility, but you can still cover a lot with guided tours that include transport.`,
      `Transportation in ${cityName} is simple once you learn the layout. The center is easy on foot, and a short rideshare makes trailheads or outlying neighborhoods feel close.`,
      `Plan to group activities by neighborhood to reduce transit time. Many of the city’s best cafés, galleries, and markets sit in clusters that are easy to explore in one outing.`,
    ],
    seed,
    16,
  );

  const paragraphTwo = pickFromPool(
    [
      `Weather in ${stateName} can be variable, so pack layers and plan for a temperature swing between morning and afternoon. Comfortable walking shoes are essential, and a reusable water bottle keeps you prepared for longer outdoor stretches.`,
      `Pack for adaptability: light layers, sun protection, and a small daypack for tours. If you’re visiting in summer, start early and save the longer excursions for cooler hours.`,
      `The most comfortable days in ${cityName} start early and build in shade breaks. Keep a light jacket handy for evenings, even in warmer months.`,
    ],
    seed,
    17,
  );

  const paragraphThree = pickFromPool(
    [
      `For pacing, aim for one major activity per day, then fill in with neighborhood time and relaxed meals. This keeps energy steady and leaves room for spontaneous stops.`,
      `Crowds peak on weekends and holidays, so book tours in advance during busy months and use weekday mornings for the most popular viewpoints.`,
      `A slow travel mindset works best here. Give yourself breathing room between tours so you can enjoy the quieter corners of ${cityName}.`,
    ],
    seed,
    18,
  );

  const paragraphFour = pickFromPool(
    [
      `Finally, listen to local advice — guides often know the best light, the best seasonal trails, and the quickest way to avoid bottlenecks. That insider perspective can turn a good day into a great one.`,
      `If you’re unsure about conditions, ask your guide or host. They’ll help you fine-tune timing based on weather and events around ${cityName}.`,
      `Local operators are tuned into the day’s conditions, so a quick chat can steer you toward the most scenic or least crowded options.`,
    ],
    seed,
    19,
  );

  return `${paragraphOne}\n\n${paragraphTwo}\n\n${paragraphThree}\n\n${paragraphFour}`;
};

const BASE_HIGHLIGHTS: Array<(city: string, state: string) => CityGuideHighlight> = [
  (city, state) => ({
    title: "Downtown orientation walk",
    description: `Start with a guided walk through ${city}’s historic core to get your bearings. The route usually covers architecture, local legends, and a few tucked-away courtyards. It’s the easiest way to feel connected to the city before heading out to the trails.`,
  }),
  (city, state) => ({
    title: "Neighborhood café crawl",
    description: `${city} rewards slow mornings. Pick two or three cafés and bakeries to sample regional flavors, then wander nearby boutiques and art spaces. This low-key pace is perfect after an active day outside.`,
  }),
  (city, state) => ({
    title: "Sunset viewpoint lookout",
    description: `Every city has a classic golden-hour spot, and ${city} is no exception. Plan to arrive early, bring a light layer, and watch the light shift across ${state}’s landscapes. It’s a simple moment that sticks with you.`,
  }),
  (city, state) => ({
    title: "Local history museum",
    description: `An hour at a local museum adds texture to your trip. You’ll learn about the cultures and industries that shaped ${city}, which makes the surrounding landscapes feel more meaningful. It’s a great rainy-day option as well.`,
  }),
  (city, state) => ({
    title: "Farmers market morning",
    description: `Markets in ${city} are full of seasonal produce, artisan goods, and local chatter. It’s a great way to pick up snacks for the day and get tips from locals about the best current trails.`,
  }),
  (city, state) => ({
    title: "Riverside or lakeside stroll",
    description: `Set aside time for a scenic waterfront walk if ${city} offers one. The pace is gentle, the views are wide, and you can easily pair it with a casual lunch nearby.`,
  }),
  (city, state) => ({
    title: "Signature park picnic",
    description: `Choose a central park in ${city} and plan a picnic with local goods. It’s a simple break between adventures and a chance to soak up the city’s easygoing energy.`,
  }),
  (city, state) => ({
    title: "Architecture and design tour",
    description: `Design-minded travelers will enjoy a guided look at ${city}’s most distinctive buildings. The tour highlights how climate, history, and local materials shape the skyline in ${state}.`,
  }),
  (city, state) => ({
    title: "Scenic drive loop",
    description: `A half-day drive from ${city} reveals sweeping landscapes and smaller towns that locals love. Plan a few short stops so you can stretch, snap photos, and pick up a roadside snack.`,
  }),
  (city, state) => ({
    title: "Local brewery or tasting room",
    description: `Wind down with a tasting flight from a local producer. ${city}’s beverage scene often showcases regional ingredients and community pride, making it a fun, low-effort evening activity.`,
  }),
  (city, state) => ({
    title: "Art district wander",
    description: `Spend an afternoon in the city’s creative district, where galleries, studios, and murals create an outdoor museum. It’s a relaxed way to see how ${city} expresses its identity beyond the main attractions.`,
  }),
  (city, state) => ({
    title: "Food hall dinner",
    description: `Food halls are ideal for groups because everyone can choose their own meal. In ${city}, these spaces often double as social hubs with live music or pop-up vendors.`,
  }),
  (city, state) => ({
    title: "Day trip to a nearby small town",
    description: `Plan a half-day visit to a nearby town for a change of pace. The slower rhythm offers charming main streets, scenic overlooks, and a fresh perspective on ${state}.`,
  }),
  (city, state) => ({
    title: "Garden or botanical escape",
    description: `A botanic garden visit adds a calm, shaded break to your itinerary. It’s a good option in warm weather and a chance to learn about regional flora in ${state}.`,
  }),
  (city, state) => ({
    title: "Sunrise coffee with a view",
    description: `Early risers should grab coffee and head to an overlook or quiet plaza. The morning light in ${city} is soft and photogenic, and the city feels especially peaceful before the day warms up.`,
  }),
  (city, state) => ({
    title: "Local music night",
    description: `Check the calendar for a live music venue or outdoor concert. It’s a great way to meet locals and experience the cultural energy of ${city} after a full day of exploring.`,
  }),
  (city, state) => ({
    title: "Neighborhood food tour",
    description: `A guided food walk keeps you moving while sampling specialty dishes. You’ll learn the story behind each bite and get a feel for the neighborhoods that define ${city}.`,
  }),
  (city, state) => ({
    title: "Scenic viewpoint hike",
    description: `Choose a moderate trail that finishes with a sweeping viewpoint. The reward is a wider perspective on how ${city} sits within the broader landscape of ${state}.`,
  }),
];

const buildHighlights = ({ cityName, stateName, categoriesPresent, seed }: { cityName: string; stateName: string; categoriesPresent: string[]; seed: number }) => {
  const categoryItems = categoriesPresent
    .filter((category) => CATEGORY_HIGHLIGHTS[category])
    .map((category) => CATEGORY_HIGHLIGHTS[category](cityName, stateName));

  const baseItems = BASE_HIGHLIGHTS.map((builder) => builder(cityName, stateName));
  const orderedBase = baseItems.sort((a, b) => (a.title > b.title ? 1 : -1));
  const shuffled = orderedBase.map((item, index) => ({
    ...item,
    weight: (seed + index * 7) % orderedBase.length,
  }));

  const sorted = shuffled
    .sort((a, b) => a.weight - b.weight)
    .map(({ weight, ...item }) => item);

  const combined = [...categoryItems, ...sorted];

  return combined.slice(0, Math.max(15, categoryItems.length + 12));
};

const buildToursIntro = ({ cityName, stateName, categoriesPresent }: { cityName: string; stateName: string; categoriesPresent: string[] }) => {
  const labels = categoriesPresent
    .map((category) => CATEGORY_LABELS[category])
    .filter(Boolean);

  const activityList = sentenceList(labels);

  return `Guided tours in ${cityName} help you cover more ground without the planning stress. You’ll find options focused on ${activityList}, plus local hosts who know the seasonal conditions in ${stateName}. Book one or two tours early, then fill the rest of your days with the highlights above for a well-rounded stay.`;
};

export const generateCityGuide = ({ cityName, stateName, categoriesPresent, regionType = "general" }: GenerateCityGuideInput): CityGuideContent => {
  const seed = hashString(`${cityName}-${stateName}`);

  return {
    heroTitle: `${cityName}, ${stateName} Travel Guide`,
    intro: buildIntro({ cityName, stateName, seed, regionType }),
    whyVisit: buildWhyVisit({ cityName, stateName, seed, regionType }),
    bestThingsIntro: buildBestThingsIntro({ cityName, stateName, seed }),
    highlights: buildHighlights({ cityName, stateName, categoriesPresent, seed }),
    whenToGo: buildWhenToGo({ cityName, stateName, seed }),
    whoFor: buildWhoFor({ cityName, stateName, seed }),
    practicalTips: buildPracticalTips({ cityName, stateName, seed }),
    toursIntro: buildToursIntro({ cityName, stateName, categoriesPresent }),
  };
};

export type { GenerateCityGuideInput };
