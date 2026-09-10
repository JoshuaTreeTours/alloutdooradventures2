import type { GuidePageData } from "../utils/loadGuide";

const major: Record<string, { overview: string; things: [string, string][]; tourism: string; tips: string[] }> = {
  "san-diego": {
    overview: "San Diego is a large Pacific city whose visitor geography stretches from downtown and San Diego Bay to Balboa Park, coastal communities and protected shoreline. A useful guide groups experiences by area, distinguishes independent neighboring cities such as Coronado, and treats major federal and state protected lands as separate jurisdictions rather than generic city parks.",
    things: [
      ["Balboa Park", "Spend substantial time in the city's great cultural park, where museums, gardens, Spanish Colonial Revival architecture and the San Diego Zoo make it a destination rather than a single stop."],
      ["San Diego Bay and Embarcadero", "Walk the working waterfront for maritime museums, harbor views and ferry access while keeping nearby Coronado geographically distinct across the bay."],
      ["Cabrillo National Monument", "Visit the National Park Service site on Point Loma for coastal views, tide pools, lighthouse history and interpretation of Juan Rodríguez Cabrillo's 1542 voyage."],
      ["La Jolla coast", "Explore coves, cliffs and marine habitat in the City of San Diego's La Jolla community, checking surf, tide and wildlife-protection rules before entering the water."],
      ["Torrey Pines State Natural Reserve", "Hike protected coastal bluffs and native Torrey pine habitat north of La Jolla, recognizing the reserve as a California state protected area with its own access rules."],
      ["Old Town and Presidio landscape", "Examine layers of Kumeyaay, Spanish, Mexican and early American history without reducing San Diego's past to a single mission-era narrative."],
      ["Mission Bay", "Use the large aquatic park for cycling, paddling, beaches and family recreation, choosing a specific section before arriving because the bay covers a wide area."],
      ["Pacific Beach and Mission Beach", "Walk or cycle the oceanfront communities for surf culture and sunset, using the boardwalk to connect short coastal distances without repeatedly driving."]
    ],
    tourism: "https://www.visitcalifornia.com/places-to-visit/san-diego/",
    tips: ["Group each day geographically because San Diego is much larger than a compact downtown destination.", "Check tides and marine conditions before tide-pool, kayak or snorkeling plans.", "Use the trolley, ferry, walking and cycling where they fit; reserve a car for dispersed coastal or inland stops."]
  },
  "san-francisco": {
    overview: "San Francisco occupies a compact peninsula between the Pacific Ocean and San Francisco Bay, but its steep terrain and distinct neighborhoods make route planning important. The strongest guide combines waterfront and hilltop landmarks with parks, transit, neighborhood culture and the city's relationship to the Golden Gate, while treating places such as Sausalito, Muir Woods and Alcatraz according to their separate jurisdictions.",
    things: [
      ["Golden Gate Bridge and Presidio", "Walk part of the bridge and explore the Presidio's trails, overlooks and military history; the Presidio is a National Park Service-managed landscape within the city."],
      ["Alcatraz Island", "Reserve the official ferry well ahead for the National Park Service island site, allowing several hours for the crossing, cellhouse and broader history beyond the famous prison era."],
      ["Golden Gate Park", "Choose a few gardens, museums or walking routes in the enormous urban park rather than trying to cover it as a single attraction."],
      ["Ferry Building and Embarcadero", "Walk the bayfront for food, architecture, transit connections and views toward the Bay Bridge, then continue only as far as the day's pace allows."],
      ["Chinatown and North Beach", "Explore adjacent neighborhoods on foot for architecture, food and immigration history, remembering that each has a distinct cultural story rather than treating them as a single tourist strip."],
      ["Cable cars and historic transit", "Ride a cable-car line as transportation and living infrastructure, planning around queues and using Muni for the rest of the network."],
      ["Lands End and Sutro Baths", "Hike the rugged Pacific edge for Golden Gate views, coastal geology and ruins, staying back from unstable cliffs and respecting trail closures."],
      ["Mission District", "Walk selected blocks for murals, food and neighborhood history, pairing cultural stops thoughtfully rather than using the area as a drive-through photo backdrop."]
    ],
    tourism: "https://www.visitcalifornia.com/places-to-visit/san-francisco/",
    tips: ["Use Muni, BART, ferries and walking before defaulting to a car; parking can be difficult and expensive.", "Bring layers because fog, wind and neighborhood microclimates can change conditions quickly.", "Reserve Alcatraz and other high-demand timed experiences early, especially in summer."]
  }
};

export const enhanceCaliforniaMajorCityGuide = (stateSlug: string, citySlug: string, guide: GuidePageData): GuidePageData => {
  if (stateSlug !== "california" || !major[citySlug]) return guide;
  const e = major[citySlug];
  const place = guide.city ?? citySlug;
  return {
    ...guide,
    hero: { ...guide.hero, alt: `${place}, California travel guide`, subheadline: `Explore ${place} with destination-specific context, practical routing and accurate protected-area geography.` },
    overview: [e.overview],
    highlights: [
      { title: "Plan by geography", description: "Group nearby experiences together so the guide reflects how the destination actually works on the ground." },
      { title: "City and protected lands", description: "Keep city attractions, neighboring communities and state or federal protected areas accurately distinguished." }
    ],
    thingsToDo: e.things.map(([title, description]) => ({ title, description: `${description} Check current hours, reservations, closures and transit conditions before visiting.` })),
    bestTimeToVisit: { title: `When to visit ${place}`, bullets: ["Spring and fall often balance comfortable weather with manageable crowds, but local microclimates matter.", "Summer is popular and requires earlier reservations for major attractions.", "Check current weather, transit notices and closures before finalizing each day."] },
    travelTips: e.tips,
    faq: [
      { q: `How many days should I spend in ${place}?`, a: "Three to four days gives most visitors enough time for major sights plus one or two neighborhood or outdoor experiences without rushing." },
      { q: "Should I plan by neighborhood?", a: "Yes. Grouping nearby stops usually saves substantial transit time and produces a more coherent day." }
    ],
    seoLinks: { officialTourism: e.tourism },
    aboutCity: undefined
  };
};
