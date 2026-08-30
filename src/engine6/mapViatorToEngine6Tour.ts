import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { normalizeEngine6AggregateRating } from "./rating";
import { formatEngine6StartingPriceLabel } from "./priceDisplay";
import { normalizeIsoCurrency } from "./priceCurrency";
import { resolveEngine6PathForProductCode } from "./routes";
import { isEngine6NewBuildProductCode } from "./engine6NewBuilds";
import { rewriteEngine6Overview } from "./overviewGovernance";
import {
  buildEngine6CanonicalPath,
  buildEngine6SeoDescription,
  buildEngine6SeoTitle,
  cleanEngine6Description,
  formatEngine6CategoryLabel,
  stripEngine6AdmissionArtifacts,
} from "./seo";
import type { Engine6ApiResponse, Engine6Tour } from "./types";
import { getMexicoCityTargetedNarrativeDescription } from "./mexicoCityApprovedNarrativeDescriptions";

const shouldLogEngine6LocationDiagnostics = () =>
  process.env.ENGINE6_LOCATION_DIAGNOSTICS === "1";

const ENGINE6_SEO_TITLE_OVERRIDES: Record<string, string> = {
  "415653P2": "Private Yosemite & Giant Sequoias Tour from San Francisco",
  "304471P122":
    "Alcatraz App-Guided Experience with Ferry Access | San Francisco",
  "6007P5": "Golden Gate Bridge Bike Tour with Lunch | San Francisco",
  "2630SUN": "San Francisco Bay Sunset & City Lights Cruise",
  "276551P2": "New Orleans City Bike Tour | French Quarter & Garden District",
  "58347P1": "New Orleans Heart of the City Bicycle Tour",
  "6455NOLAAIR": "New Orleans Airboat Ride | Louisiana Bayou Tour",
  "15200P6": "New Orleans Swamp Boat Tour with Pickup",
  "3780P45": "New Orleans Riverboat Sightseeing Cruise",
  "3780SUPER": "New Orleans in a Day with Riverboat Cruise",
  "6953SWAMPTRANS":
    "Honey Island Swamp Boat Tour with New Orleans Transportation",
  "15200P2": "Large Airboat Swamp Tour with New Orleans Pickup",
  "273720P1": "Guided New Orleans Bayou Pontoon Boat Tour",
};
const ENGINE6_META_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "415653P2":
    "Explore Yosemite from San Francisco on a private tour with giant sequoias, Glacier Point, waterfalls, granite cliffs, and Sierra scenery.",
  "6007P5":
    "Ride from San Francisco to Sausalito on a guided bike tour across the Golden Gate Bridge, with lunch voucher, all-day rental, and return options.",
  "2630SUN":
    "Cruise San Francisco Bay at sunset or after dark on a two-hour waterfront sailing with Golden Gate Bridge, Alcatraz, Bay Bridge, and Pier 43 1/2 return.",
  "276551P2":
    "Bike New Orleans on a guided city ride through the French Quarter, Jackson Square, Congo Square, Garden District, and Lafayette Cemetery No. 1.",
  "58347P1":
    "Ride beyond the French Quarter on a small-group New Orleans bike tour through Faubourg Marigny, Bywater, Treme, Jackson Square, and St. Roch.",
  "6455NOLAAIR":
    "Ride by airboat through Lafitte-area cypress swamp near New Orleans, with wildlife viewing, captain commentary, and optional hotel transportation.",
  "15200P6":
    "Travel from New Orleans to a Louisiana swamp for a narrated boat tour with pickup, bayou scenery, and seasonal wildlife viewing.",
  "3780P45":
    "Cruise the Mississippi River from New Orleans on a 75-minute narrated riverboat route past French Quarter waterfront landmarks.",
  "3780SUPER":
    "Explore New Orleans in a day with a French Quarter walk, French Market lunch break, 75-minute riverboat cruise, and narrated city bus tour.",
  "6953SWAMPTRANS":
    "Travel from New Orleans to Honey Island Swamp for a guided flat-bottom boat tour through protected wetlands, bayou passages, and Cajun village scenery.",
  "15200P2":
    "Ride a large airboat through Louisiana swamp waterways with downtown New Orleans hotel pickup, captain narration, photo stops, and seasonal wildlife viewing.",
  "273720P1":
    "Ride a flat-bottom boat through Lafitte-area cypress swamp near New Orleans, with captain narration, wildlife viewing, and optional pickup.",
  "194901P4":
    "Explore the Oregon Coast from Portland on a full-day small-group tour with Ecola State Park, Cannon Beach, Haystack Rock, and a naturalist guide.",
  "378720P1":
    "See Portland on a guided city tour with Pittock Mansion, the International Rose Test Garden, historic districts, and Willamette River bridge views.",
  "18277P2":
    "Visit popular Portland attractions on a guided small-group tour with stops at Voodoo Doughnut, Hoyt Arboretum, Pittock Mansion, and the International Rose Test Garden.",
  "194901P3":
    "Visit Portland parks and neighborhoods on a small-group tour with a local guide who explains city history and culture while visiting Washington Park and Pittock Mansion.",
  "9634P1":
    "Explore Portland's top sights on a half-day guided tour through historic districts, riverfront viewpoints, and Washington Park landmarks with a local guide.",
  "5765P10":
    "Explore Portland on a morning city sightseeing tour from downtown to the Pearl District and Nob Hill with stops at Pioneer Courthouse Square and the Rose Garden.",
  "5765P14":
    "See Portland on an afternoon city sightseeing tour with stops at Pioneer Courthouse Square, the Pearl District, Nob Hill, and the International Rose Test Garden.",
  "9634P2":
    "Travel from Portland along the Historic Columbia River Highway to Crown Point, Latourell Falls, and Multnomah Falls on a small-group gorge waterfall tour.",
  "126203P10":
    "Head to the Columbia River Gorge for a half-day tour of cascading waterfalls and scenic overlooks from Portland, including Multnomah Falls and Latourell Falls.",
  "18277P1":
    "Explore the Columbia River Gorge on a half-day small-group tour from Portland with stops at Multnomah Falls, Latourell Falls, and Vista House.",
  "5765P9":
    "Escape Portland for a guided waterfall tour along the Columbia River Highway with stops at Multnomah Falls, Latourell Falls, and Horsetail Falls.",
  "9634P6":
    "Combine the Columbia River Gorge and Mount Hood on a full-day tour from Portland with waterfall stops, mountain viewpoints, and scenic foothill driving.",
  "194901P2":
    "Spend a full day touring Columbia River Gorge waterfalls and Mount Hood from Portland with a naturalist guide, van transport, and scenic driving.",
  "5765MTHOOD":
    "Take a full-day Mount Hood trip from Portland with stops at Multnomah Falls, Hood River, and scenic viewpoints along the Columbia River Gorge.",
  "401191P1":
    "Explore downtown Portland on a guided food tour with tastings at local favorites across the city center with neighborhood history and food culture commentary.",
  "67842P3":
    "Discover Portland's food-cart culture on a guided tour of pods, patios, and cart clusters across the city with tastings from multiple vendors.",
  "5396P10":
    "Explore Seattle on a guided three-hour city tour with stops at Pioneer Square, the Ballard Locks, and Kerry Park for skyline views with a local guide.",
  "40943P1":
    "See Seattle highlights on a small-group bus tour with stops at Pike Place Market, Kerry Park, the Space Needle, and the Fremont Troll sculpture.",
  "479383P1":
    "Get oriented to Seattle on a guided walking tour through downtown and Pioneer Square plus a scenic ride on the historic Seattle Monorail.",
  "36129P1":
    "Explore Pioneer Square on a guided walking tour through Seattle's historic underground passageways built after the Great Seattle Fire.",
  "2956PIKEPL":
    "Sample Pike Place Market on a guided food and culture walking tour with tastings from local vendors and market history commentary.",
  "23161P1":
    "Tour Pike Place Market with a chef guide who introduces vendor relationships, seasonal ingredients, and Pacific Northwest tastings.",
  "2956EXCLUSIVE":
    "Explore Pike Place Market before peak crowds on an early-access guided tasting tour with smoked salmon, chocolate, and market specialties.",
  "7812P115":
    "Discover Pike Place Market on a Secret Food Tours route with eight local tastings including clam chowder, piroshki, and artisan sweets.",
  "2960HARBOR":
    "Cruise Elliott Bay and Seattle Harbor on a one-hour narrated boat tour from Pier 55 with skyline, shipping-terminal, and mountain views.",
  "3657RAINIER":
    "Travel from Seattle to Mount Rainier National Park on a full-day guided tour with stops at Narada Falls, Paradise, and Longmire.",
  "5396MTR":
    "Visit Mount Rainier National Park on a full-day small-group tour from Seattle with seasonal routes through forests, waterfalls, and alpine viewpoints.",
  "351474P1":
    "Combine a Mount Rainier National Park tour from Seattle with guided hiking on alpine trails, waterfall stops, and glacier viewpoints.",
  "3132SMB":
    "Travel from downtown Seattle to the Boeing Future of Flight facility for a guided factory tour with round-trip transport from the Hyatt Regency.",
  "8647P594":
    "Explore Seattle and Snoqualmie Falls on a private five-hour tour with a dedicated driver-guide covering city landmarks and the 268-foot falls overlook.",
};
const ENGINE6_ITINERARY_SECTION_SUPPRESSED_PRODUCT_CODES = new Set([
  "447486P8",
  "273720P1",
]);

const ENGINE6_LIVE_ITINERARY_MERGE_SUPPRESSED_PRODUCT_CODES = new Set([
  "415653P2",
  "3780SUPER",
]);

const ENGINE6_CLASSIFICATION_OVERRIDES: Record<
  string,
  {
    primaryCategory: string;
    categories: string[];
    primaryDisplayCategory: string;
    activityCategories: Array<{ slug: string; label: string }>;
  }
> = {
  "3780SUPER": {
    primaryCategory: "sightseeing-city-tours",
    categories: ["sightseeing-city-tours"],
    primaryDisplayCategory: "Sightseeing & City Tours",
    activityCategories: [
      { slug: "sightseeing-city-tours", label: "Sightseeing & City Tours" },
    ],
  },
  "194901P4": {
    primaryCategory: "sightseeing-city-tours",
    categories: ["sightseeing-city-tours"],
    primaryDisplayCategory: "Sightseeing & City Tours",
    activityCategories: [
      { slug: "sightseeing-city-tours", label: "Sightseeing & City Tours" },
    ],
  },
  "401191P1": {
    primaryCategory: "food-wine",
    categories: ["food-wine"],
    primaryDisplayCategory: "Food & Wine",
    activityCategories: [{ slug: "food-wine", label: "Food & Wine" }],
  },
  "67842P3": {
    primaryCategory: "food-wine",
    categories: ["food-wine"],
    primaryDisplayCategory: "Food & Wine",
    activityCategories: [{ slug: "food-wine", label: "Food & Wine" }],
  },
  "2956PIKEPL": {
    primaryCategory: "food-wine",
    categories: ["food-wine"],
    primaryDisplayCategory: "Food & Wine",
    activityCategories: [{ slug: "food-wine", label: "Food & Wine" }],
  },
  "23161P1": {
    primaryCategory: "food-wine",
    categories: ["food-wine"],
    primaryDisplayCategory: "Food & Wine",
    activityCategories: [{ slug: "food-wine", label: "Food & Wine" }],
  },
  "2956EXCLUSIVE": {
    primaryCategory: "food-wine",
    categories: ["food-wine"],
    primaryDisplayCategory: "Food & Wine",
    activityCategories: [{ slug: "food-wine", label: "Food & Wine" }],
  },
  "7812P115": {
    primaryCategory: "food-wine",
    categories: ["food-wine"],
    primaryDisplayCategory: "Food & Wine",
    activityCategories: [{ slug: "food-wine", label: "Food & Wine" }],
  },
  "2960HARBOR": {
    primaryCategory: "water-activities",
    categories: ["water-activities"],
    primaryDisplayCategory: "Water Activities",
    activityCategories: [
      { slug: "water-activities", label: "Water Activities" },
    ],
  },
};

export const isEngine6ItinerarySectionSuppressed = (productCode: string) =>
  ENGINE6_ITINERARY_SECTION_SUPPRESSED_PRODUCT_CODES.has(productCode);

export const isEngine6LiveItineraryMergeSuppressed = (productCode: string) =>
  ENGINE6_LIVE_ITINERARY_MERGE_SUPPRESSED_PRODUCT_CODES.has(productCode);

const ENGINE6_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "5569HIKE":
    "Hike through Griffith Park on a guided route to Mount Hollywood, Griffith Observatory, and Hollywood Sign viewpoints. This Los Angeles outing focuses on city panoramas, film-location context, and photo stops from the Hollywood Hills. The route includes the Greek Theatre meeting area, Griffith Park trails, Griffith Observatory, and Tiffany Point for Hollywood Sign views.",
  "447486P8":
    "Discover Santa Barbara Cruise is a narrated coastal yacht experience along the Santa Barbara waterfront, offering coastal views, fresh ocean air, and a relaxed sightseeing atmosphere. Departing near Santa Barbara Harbor, this boat tour trades city streets for open water, marina scenery, shoreline views, and the Santa Ynez Mountain backdrop. Guests can unwind onboard while the captain cruises calm coastal routes past the harbor, Stearns Wharf, East Beach, and the Santa Barbara coastline. The route is harbor-based rather than a multi-stop land itinerary.",
  "6007P5":
    "This San Francisco bicycle tour pairs a guided ride to Sausalito with a lunch voucher and all-day bike rental. After check-in and fitting at 721 Beach Street, the guide leads a paced route toward the Golden Gate Bridge with time for photos and practical orientation. The ride continues across the bridge and ends in Sausalito near the lunch stop, where travelers can use the voucher before choosing whether to bike back or arrange the ferry return separately.",
  "2630SUN":
    "San Francisco Bay Sunset & City Lights Cruise is a two-hour harbor cruise departing from Pier 43 1/2 near Fisherman’s Wharf. The experience stays on the bay, using seasonal evening light to frame views of the Golden Gate Bridge area, Alcatraz, the city skyline, and the Bay Bridge. It is a relaxed round-trip boat outing with indoor and outdoor viewing areas rather than a narrated city tour or multi-stop itinerary.",
  "6455NOLAAIR":
    "Ride by airboat through cypress swamp and bayou waterways near Jean Lafitte National Historical Park and Preserve. This New Orleans-area tour focuses on marsh scenery, local wildlife, and captain-led interpretation, with optional hotel transportation on selected bookings and a direct meeting point in Lafitte. The route is water-based rather than a city sightseeing loop, so the experience centers on the airboat launch, swamp channels, and wildlife viewing conditions on the day of travel. Guests depart from Lafitte, south of New Orleans, for a bayou outing shaped by water level, weather, and seasonal wildlife activity.",
  "15200P6":
    "Travel from New Orleans to a Louisiana swamp for a narrated boat tour through bayou waterways and wetland scenery. This experience includes selected hotel pickup and drop-off, then continues to the launch area for time on the water with a local captain. The route is water-based rather than a city sightseeing loop, so conditions, wildlife activity, and captain routing shape what guests see during the outing. Expect marsh and cypress landscapes, opportunities for wildlife viewing, and practical transportation logistics suited to travelers who want a swamp experience without arranging a separate drive from New Orleans.",
  "3780P45":
    "Board the Riverboat CITY of NEW ORLEANS for a 75-minute Mississippi River sightseeing cruise from the French Quarter riverfront. The route stays on the water with live captain narration, open river views, and a round-trip departure behind JAX Brewery. From the vessel, travelers can see the French Quarter riverfront, Jackson Square, St. Louis Cathedral, the Crescent City Connection, the Aquarium of the Americas, Mardi Gras World, Caesars Casino, and Woldenberg Riverfront Park before returning to the same dock.",
  "3780SUPER":
    "Explore New Orleans in one extended sightseeing outing with a guided French Quarter walk, independent lunch time at the French Market, a 75-minute Mississippi River cruise aboard the Riverboat CITY of NEW ORLEANS, and a narrated city highlights bus tour. The route begins at Cafe Beignet in the JAX Brewery Building and combines walking, coach, and riverboat perspectives on Jackson Square, the Garden District, City Park, the National WWII Museum, Audubon Aquarium, and the downtown riverfront.",
  "6953SWAMPTRANS":
    "Travel from downtown New Orleans across Lake Pontchartrain to Honey Island Swamp for a guided flat-bottom boat tour through protected Louisiana wetlands. The route moves through narrow bayou passages where the captain explains swamp ecology, Cajun culture, and local preservation efforts. Travelers may see alligators, birds, turtles, raccoons, wild boar, and other wildlife depending on conditions, and the route includes views of a Cajun village reachable only by boat before returning to shore and the New Orleans pickup point.",
  "15200P2":
    "Travel from downtown New Orleans by hotel pickup toward the swamp for a large-airboat ride on Louisiana waterways. After the drive along the Mississippi River corridor, board a 16-passenger airboat with a captain who narrates the route, explains local wildlife and flora, and balances faster runs with slower photo stops. Wildlife sightings vary by season and conditions, but the outing is designed around swamp scenery, alligator habitat, and a coordinated return transfer back to New Orleans.",
  "273720P1":
    "Ride a flat-bottom pontoon boat through tidewater cypress swamp near Jean Lafitte National Historical Park and Preserve. This New Orleans-area bayou tour departs from Lafitte, with pickup available on selected bookings, and focuses on marsh scenery, captain narration, and wildlife viewing. The route moves through shallow bayou waterways where alligators, turtles, snakes, herons, egrets, ibis, hawks, owls, and bald eagles may appear depending on season and conditions. Travelers finish back at the Lafitte meeting point or use the selected return transportation option to New Orleans.",
  "194901P4":
    "Travel from Portland to the northern Oregon Coast on a full-day small-group outing led by a naturalist guide. Ride in an air-conditioned minivan with bottled water and light snacks while the route links Ecola State Park overlooks, Indian Beach, Cannon Beach, and Haystack Rock along scenic Highway 101. Depending on tides and conditions, the day may include stops at Hug Point or Oswald West State Park before a Neahkahnie Mountain viewpoint when time allows. The structured coastal itinerary covers key north-coast landmarks without self-driving from Portland, with pickup available at select downtown hotels or South Waterfront Park.",
  "378720P1":
    "Explore Portland on a guided city tour that introduces the city's history, architecture, and evolving neighborhoods in roughly three hours. A local guide narrates the route from pioneer-era settlement through today's districts, crossing the Willamette River on an iconic bridge and visiting Pittock Mansion for Mount Hood views. The outing includes a stop at the International Rose Test Garden in Washington Park, drive-by perspectives on Old Town and downtown corridors, and east-side neighborhoods that reflect Portland's local character and ongoing change.",
  "18277P2":
    "Visit popular Portland attractions on a guided small-group tour with stops at Voodoo Doughnut, Hoyt Arboretum, Pittock Mansion, and the International Rose Test Garden. A local guide narrates the route through parks, viewpoints, and city landmarks before returning to your hotel pickup point.",
  "194901P3":
    "Visit Portland parks and neighborhoods on a small-group tour with a local guide who explains city history and culture. The route includes Waterfront Park, Pioneer Square, the South Park Blocks, Washington Park, the International Rose Test Garden, and Pittock Mansion for panoramic views.",
  "9634P1":
    "Explore Portland's top sights on a half-day guided tour through historic districts, riverfront viewpoints, and Washington Park. The route introduces city history and culture while visiting landmarks such as Pittock Mansion and the International Rose Test Garden with a knowledgeable local guide.",
  "5765P10":
    "Explore Portland on a morning city sightseeing tour from downtown to the Pearl District and Nob Hill. Visit Pioneer Courthouse Square, NW 23rd Avenue, the South Park Blocks, and the International Rose Test Garden in Washington Park with hotel pickup and drop-off included.",
  "5765P14":
    "See Portland on an afternoon city sightseeing tour with stops at Pioneer Courthouse Square, the Pearl District, Nob Hill, and the International Rose Test Garden. A local guide shares Portland history and culture during a Mercedes-Benz Sprinter route with downtown hotel pickup.",
  "9634P2":
    "Travel from Portland along the Historic Columbia River Highway to Crown Point, Latourell Falls, and Multnomah Falls. This small-group outing visits Vista House overlooks and gorge waterfalls with time for photos and short walks when trail conditions allow.",
  "126203P10":
    "Head to the Columbia River Gorge for a half-day tour of cascading waterfalls and scenic overlooks from Portland. Visit Multnomah Falls, Latourell Falls, Vista House, Bridal Veil Falls, and Portland Women's Forum viewpoints with optional mini-hikes when conditions allow.",
  "18277P1":
    "Explore the Columbia River Gorge on a half-day small-group tour from Portland with stops at Multnomah Falls, Latourell Falls, and Vista House. A local guide handles transportation from downtown hotels so you can focus on gorge scenery and waterfall viewpoints.",
  "5765P9":
    "Escape Portland for a guided waterfall tour along the Columbia River Highway National Scenic Byway. Stops typically include Portland Women's Forum viewpoints, Wahkeena Falls, Latourell Falls, Multnomah Falls, and Horsetail Falls with hotel pickup in a Mercedes-Benz Sprinter van.",
  "9634P6":
    "Combine the Columbia River Gorge and Mount Hood on a full-day tour from Portland with waterfall stops and mountain viewpoints. The route links gorge landmarks such as Multnomah Falls with Mount Hood scenery, fruit-stand stops, and scenic driving through Oregon's Cascade foothills.",
  "194901P2":
    "Spend a full day touring Columbia River Gorge waterfalls and Mount Hood from Portland with a naturalist guide. The outing combines gorge overlooks, waterfall walks, and Mount Hood viewpoints with van transport, bottled water, and light snacks throughout the day.",
  "5765MTHOOD":
    "Take a full-day Mount Hood trip from Portland with stops at Multnomah Falls, Hood River, and scenic viewpoints along the Columbia River Gorge. Travel by Mercedes-Benz Sprinter with a local guide, hotel pickup, and time for photos at waterfall and mountain overlooks.",
  "401191P1":
    "Explore downtown Portland on a guided food tour with tastings at local favorites across the city center. A guide leads a walking route through central districts while sharing Portland food culture, neighborhood history, and stories behind each stop.",
  "67842P3":
    "Discover Portland's food-cart culture on a guided tour of pods, patios, and cart clusters across the city. Sample dishes from multiple vendors while a local guide explains how Portland's cart scene shaped the city's dining identity.",
  "5396P10":
    "Explore Seattle on a guided three-hour city tour with stops at Pioneer Square, the Ballard Locks, and Kerry Park for skyline views. A local guide narrates the route through waterfront districts, historic neighborhoods, and landmark corridors before ending near the Space Needle.",
  "40943P1":
    "See Seattle highlights on a small-group bus tour with stops at Pike Place Market, Kerry Park, the Space Needle, and the Fremont Troll. A local guide covers Chinatown, Pioneer Square, and Lake Union viewpoints on a compact city route.",
  "479383P1":
    "Get oriented to Seattle on a guided walking tour through downtown and Pioneer Square, plus a scenic ride on the historic Seattle Monorail. A local guide introduces major neighborhoods, city history, and landmark viewpoints in a few hours.",
  "36129P1":
    "Explore Pioneer Square on a guided walking tour through Seattle's historic underground passageways built after the Great Seattle Fire. A local guide shares stories of the city's early settlement, architecture, and subterranean corridors beneath modern streets.",
  "2956PIKEPL":
    "Sample Pike Place Market on a guided food and culture walking tour with tastings from local vendors. The route covers market stalls, specialty foods, and the history of Seattle's most famous public market.",
  "23161P1":
    "Tour Pike Place Market with a chef guide who introduces vendor relationships, seasonal ingredients, and behind-the-scenes market culture. Tastings highlight Pacific Northwest flavors across multiple stops in the historic market.",
  "2956EXCLUSIVE":
    "Explore Pike Place Market before peak crowds on an early-access guided tasting tour. Sample smoked salmon, local chocolate, and market specialties while vendors prepare for the day in a quieter market setting.",
  "7812P115":
    "Discover Pike Place Market on a Secret Food Tours walking route with eight authentic local tastings including clam chowder, piroshki, and artisan sweets. The tour explores main market levels and the DownUnder area with a licensed market guide.",
  "2960HARBOR":
    "Cruise Elliott Bay and Seattle Harbor on a one-hour narrated boat tour departing from Pier 55. The route offers skyline views, shipping-terminal perspectives, and mountain backdrops including the Cascades, Olympics, and Mount Rainier when visible.",
  "3657RAINIER":
    "Travel from Seattle to Mount Rainier National Park on a full-day guided tour with stops at Narada Falls, Paradise, and Longmire. A narrated drive crosses lakes and foothill scenery before exploring the park's waterfalls and mountain viewpoints.",
  "5396MTR":
    "Visit Mount Rainier National Park on a full-day small-group tour from Seattle with a professional guide. Seasonal routes include old-growth forests, wildflower meadows, waterfalls, and optional short hikes with flexible pacing for all abilities.",
  "351474P1":
    "Combine a Mount Rainier National Park tour from Seattle with guided hiking on alpine trails. The outing includes old-growth forest walks, waterfall stops, and glacier viewpoints with trekking poles and seasonal snowshoes provided when needed.",
  "3132SMB":
    "Travel from downtown Seattle to the Boeing Future of Flight facility for a guided factory tour of the world's largest building by volume. Explore assembly-line viewing areas and aviation exhibits with round-trip transport from the Hyatt Regency Seattle.",
  "8647P594":
    "Explore Seattle and Snoqualmie Falls on a private five-hour tour with a dedicated driver-guide. The flexible route covers city landmarks such as Kerry Park and Pike Place Market before continuing east to the 268-foot Snoqualmie Falls overlook.",
};

const ENGINE6_OVERVIEW_OVERRIDES: Record<
  string,
  (args: { city: string; state: string; sourceOverview: string }) => string
> = {
  "5569HIKE": () =>
    "Hike through Griffith Park on a guided route to Mount Hollywood, Griffith Observatory, and Hollywood Sign viewpoints. This Los Angeles outing focuses on city panoramas, film-location context, and photo stops from the Hollywood Hills. The route includes the Greek Theatre meeting area, Griffith Park trails, Griffith Observatory, and Tiffany Point for Hollywood Sign views.",
  "6740JTREE": () =>
    "Skip the crowds and see a wilder side of Joshua Tree on a guide-led backroads outing from Palm Springs and the Coachella Valley. Riding in an open-air Hummer, you travel through high-desert terrain where Joshua tree forests, granite piles, broad valleys, and distant mountain lines open up in every direction. The pace stays relaxed, with time for pullouts, photos, and short walks at signature spots such as Keys View, Barker Dam, and Cap Rock when conditions allow. Along the way, your guide connects what you are seeing to the park’s geology, wildlife, and human history without turning the day into a lecture. It’s a scenic, low-stress way to experience Joshua Tree National Park while still getting off the usual highway rhythm.",
  "2335P1": () =>
    "Explore one of the Coachella Valley’s defining geologic landscapes on this guided off-road Jeep tour into the San Andreas Fault zone near Palm Springs. The route travels through desert canyons and washes shaped by active tectonic forces, where your naturalist guide interprets fault movement, earthquake geology, and the landforms that reveal how the valley evolved over time. Along the way, you experience rugged terrain and wide desert vistas while learning how climate, erosion, and plate dynamics interact across this section of Southern California. Designed as a destination-first geology adventure rather than a standard city sightseeing loop, this small-group experience combines outdoor exploration with clear scientific context in one of the region’s most consequential fault environments.",
  "6455NOLAAIR": () =>
    "Ride by airboat through cypress swamp and bayou waterways near Jean Lafitte National Historical Park and Preserve. This New Orleans-area tour focuses on marsh scenery, local wildlife, and captain-led interpretation, with optional hotel transportation on selected bookings and a direct meeting point in Lafitte. The route is water-based rather than a city sightseeing loop, so the experience centers on the airboat launch, swamp channels, and wildlife viewing conditions on the day of travel. Guests depart from Lafitte, south of New Orleans, for a bayou outing shaped by water level, weather, and seasonal wildlife activity.",
  "335698P7": () =>
    "Short on time but want a solid first look at Joshua Tree National Park? This half-day small-group tour from the Palm Springs region covers key landscapes efficiently while keeping the experience personal and unhurried. You ride between major viewpoints and iconic rock areas, then get out for brief walks and interpretive stops at places such as Hidden Valley, Cap Rock, or Keys View depending on timing and conditions. Your guide handles routing and park logistics so you can focus on the scenery: twisted Joshua trees, rounded granite monoliths, open desert basins, and long mountain horizons. Commentary is approachable and useful, touching on geology, plants, and park history without overloading the outing. It’s ideal for first-time visitors, photographers, and anyone seeking the highlights in a compact format.",
  "237571P2": () =>
    "If you want real trail time in Joshua Tree rather than a drive-through overview, this full-day guided hike delivers. Starting from the Palm Springs area, you head into the park with a naturalist guide who sets a route to match conditions and group pace, then leads you across desert paths framed by Joshua trees, sculpted granite, and open basins. Expect sustained walking, frequent interpretation, and plenty of chances to look closely at the details most visitors miss—from weathered rock textures and fault-shaped landforms to hardy plant communities and signs of desert wildlife. Breaks are built in for water, photos, and big-view moments, but the focus stays on being out on the trail. It’s a strong choice for travelers who want both movement and meaningful park context.",
  "335698P13": () =>
    "This Joshua Tree experience is built around movement: climbing, stepping, and scrambling through the park’s granite world with a guide who coaches technique and pacing as you go. Instead of staying on flat viewpoints, you work through boulder clusters and natural rock corridors, using hands and feet to reach higher perches with wide Mojave and Colorado Desert views. The route emphasizes active problem-solving and body awareness, with options that keep adventurous beginners engaged while still rewarding more experienced hikers. Between scrambles, your guide shares practical insight into how wind, water, and tectonic forces shaped these formations and why desert life survives here. From the Palm Springs/Joshua Tree area, it’s an energetic half-day outdoors for travelers who want something more physical than a standard scenic stop circuit.",
  "3351P15": () =>
    "Explore Indian Canyons on a guided bike-and-hike experience from Palm Springs that combines cycling sections with on-foot trail segments through canyon corridors and desert scenery. The route emphasizes the area’s canyon landscape, native palm oasis setting, and the broader Coachella Valley desert environment while logistics and pacing are managed by your guide. As an active, structured outing, it is a practical choice for travelers who want a single experience that blends sightseeing, light interpretation of local desert ecology and geology, and hands-on outdoor movement.",
  "142924P6": () =>
    "Ride a guided electric bike tour across Coronado Island on flat, car-free paths with views of the Coronado Bridge, Hotel del Coronado, and San Diego Bay. The route follows separated bike lanes through Victorian neighborhoods and the Silver Strand shoreline while your guide shares local history and takes photos along the way.",
  "69764P1": () =>
    "This 3-hour whale watching cruise from San Diego follows the local coastline for seasonal marine-life viewing and open-ocean scenery. Depending on conditions, sightings can include whales, dolphins, and seabirds while your crew shares practical context about local waters and wildlife behavior, including naturalist or captain commentary when offered onboard. The classic coastal outing offers broad photo opportunities from the boat. It is a strong fit for families, couples, and first-time visitors who want a dependable San Diego ocean activity centered on wildlife and views.",
  "18125P5": () =>
    "This private Segway tour offers a fun, efficient way to explore Balboa Park with a dedicated guide in San Diego. You glide through the park to see gardens, museum exteriors, Spanish Colonial Revival architecture, and other landmark areas while covering more ground than a typical walking route. The private format supports a more personalized pace and commentary tailored to your group. It is a strong fit for visitors who want an engaging overview of Balboa Park without spending the day on foot.",
  "173946P1": () =>
    "This half-day 4x4 adventure near San Diego takes you into inland backcountry terrain for a guide-led, outdoor-focused route. The experience explores changing dirt tracks, elevation gains, and scenic overlooks in the Otay wilderness area, creating a rugged alternative to standard city sightseeing. Travel is managed by a guide with route pacing adjusted to conditions and group comfort. With a private format and guide-managed routing, it is a strong fit for travelers who want a more active outing that prioritizes terrain, landscape views, and hands-on adventure over typical urban tour stops.",
  "3885SW303BS": ({ city, state, sourceOverview }) => {
    const supportsLucerne = /lucerne/i.test(sourceOverview);
    const supportsTitlis = /\b(mt\.?\s*titlis|mount titlis)\b/i.test(
      sourceOverview
    );
    const destinationClause = [
      supportsLucerne ? "Lucerne" : null,
      supportsTitlis ? "Mount Titlis" : null,
    ]
      .filter(Boolean)
      .join(" and ");

    return [
      `Mount Titlis and Lucerne Day Trip from Zurich is a full-day guided excursion from ${city}, ${state} that combines lake-city sightseeing with high-alpine mountain scenery.`,
      destinationClause
        ? `Travel through central Switzerland toward ${destinationClause}, following a structured day-trip format that keeps transfers and timing coordinated.`
        : "Travel through central Switzerland on a structured day-trip format that keeps transfers and timing coordinated.",
      "The outing focuses on efficient mountain access, panoramic viewpoints, and clear guided logistics, making it a practical option for travelers who want major Swiss highlights in one day.",
      "It is designed for visitors who prefer a single organized itinerary instead of arranging separate rail and lift connections on their own.",
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  },
  "304471P122": () =>
    "San Francisco Alcatraz App Guided Tour Cruise Jail House Tour is an app-guided Alcatraz experience that includes ferry transportation from San Francisco and on-island exploration focused on prison history and site context.",
  "163975P1": () =>
    "Santa Barbara Trolley Tour is a relaxed city overview that pairs coastal scenery with historic landmarks in a comfortable, open-air style ride. As the trolley rolls through town, you pass waterfront icons like Stearns Wharf and East Beach, continue by the Andrée Clark Bird Refuge and Butterfly Beach, and take in the city’s Spanish-influenced architecture around the courthouse and El Presidio district. The route also includes a dedicated stop at Old Mission Santa Barbara, where you have about 10 minutes to look around before rejoining the tour. Along the way, your guide adds practical local context on neighborhoods, history, and daily life, so the experience feels more personal than a standard transfer. It’s an easy way to understand Santa Barbara’s scenic, coastal, and historic character early in your visit.",
  "447486P8": () =>
    "Discover Santa Barbara Cruise is a narrated coastal yacht experience along the Santa Barbara waterfront, offering coastal views, fresh ocean air, and a relaxed sightseeing atmosphere. Departing near Santa Barbara Harbor, this boat tour trades city streets for open water, marina scenery, shoreline views, and the Santa Ynez Mountain backdrop. Guests can unwind onboard while the captain cruises calm coastal routes past the harbor, Stearns Wharf, East Beach, and the Santa Barbara coastline. The route is harbor-based rather than a multi-stop land itinerary.",
  "117409P1": () =>
    "Santa Ynez Valley Tour is a full-day wine-country outing from Santa Barbara that trades shoreline views for inland ranchland, vineyard slopes, and small-town main streets. The route usually follows Highway 154 over San Marcos Pass into the Santa Ynez Valley, then moves between tasting stops in communities such as Solvang, Los Olivos, and Santa Ynez depending on the day’s winery lineup. Your guide handles driving and timing, so you can focus on scenery, local wine styles, and a relaxed pace between pours. Expect a social small-group format with structured stops, practical destination context, and enough free moments to browse tasting rooms or village blocks. It’s an easy way to experience one of Santa Barbara County’s best-known wine regions without self-driving logistics.",
  "15073P5": () =>
    "Explore Grand Teton National Park on a guided half-day tour from Jackson Hole along the Gros Ventre River toward Mormon Row Historic District and Moose Junction. Use spotting scopes and field glasses to observe moose, elk, and eagles while your naturalist guide explains Wyoming wildlife and ranching history. The driving route emphasizes Grand Teton, Jackson Lake, Oxbow Bend, Mormon Row Historic District, Jenny Lake, and Menor's Ferry Historical Trail with photo opportunities at each scenic pullout. Scheduled stops include Grand Teton, Jackson Lake, Oxbow Bend, Mormon Row Historic District, Jenny Lake, and Menor's Ferry Historical Trail before optional views along Signal Mountain Summit Road. Transportation, safety gear, and local commentary are coordinated from Jackson Hole or Teton Village pickup points for travelers who want a structured Teton introduction without self-driving mountain roads.",
  "334588P3": () =>
    "Discover the rugged beauty and ancient legends of Canyonlands National Park on this private half-day Moab backcountry tour. Go off-roading in a sturdy vehicle to reach the Island in the Sky district and other remote areas, where the Colorado River slices through steep ravines and ancient petroglyphs decorate sandstone cliffs. Stops include Canyonlands National Park, Potash Road, Utah Scenic Byway 279 Rock Art Sites, Shafer Trail Viewpoint, Musselman Arch, and Island in the Sky. Fill your camera roll with red-rock arches and towering pinnacles while your local guide explains the area's geology and history.",
  "6896P1": () =>
    "Join a small-group 4x4 adventure through Arches and Canyonlands National Parks from Moab, reaching backcountry terrain that standard vehicles cannot access. The day balances shared-group efficiency with guided off-road pacing, plus a provided lunch and ice water. Stops include Island in the Sky, Shafer Trail, Arches National Park, Marching Men, Tower Arch, and Eye of the Whale. Local commentary covers geology and route logistics so travelers can focus on arches, viewpoints, and photography without managing timed entry or trailhead planning alone.",
  "24134P16": () =>
    "Ride a guided van sightseeing circuit through Arches National Park on a pavement-focused morning or afternoon outing of about 4.5 hours. The format emphasizes classic overlooks and short walks rather than jeep backcountry trails, with a local guide handling park pacing and commentary. Stops include Windows Section, Balanced Rock, Delicate Arch Overlook, Sand Dune Arch, Panorama Point, and Park Avenue. It is a practical Arches introduction for visitors basing in Moab who want landmark coverage without coordinating timed entry or backcountry logistics on their own.",
  "265766P60": () =>
    "Join Master Naturalist guides for a full-day private tour and hike focused on Canyonlands National Park. The itinerary stops at natural arches and sandstone formations, with time for off-the-beaten-path features when conditions allow. Stops include Mesa Arch, Grand View Point Overlook, Green River Overlook, and Upheaval Dome. Guides share the park's human and geological history along with flora and fauna context throughout the day so visitors can focus on Island in the Sky hiking without coordinating park logistics alone.",
};

export const hasEngine6ReviewedOverviewOverride = (productCode: string) =>
  Boolean(
    ENGINE6_OVERVIEW_OVERRIDES[productCode.trim()] ||
      getMexicoCityTargetedNarrativeDescription(productCode)
  );

const toSentence = (value: string) => {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const stripMarketingLanguage = (value: string) =>
  value
    .replace(/\bonce in a lifetime\b/gi, "")
    .replace(/\btrip of a lifetime\b/gi, "")
    .replace(/\bmust-?do\b/gi, "notable")
    .replace(/\bbucket list\b/gi, "popular");

const buildAuthoritativeOverview = ({
  title,
  city,
  state,
  categoryLabel,
  durationText,
  highlights,
  itinerary,
  meetingPointText,
  sourceOverview,
}: {
  title: string;
  city: string;
  state: string;
  categoryLabel: string | null;
  durationText: string | null;
  highlights: string[];
  itinerary: Array<{ title: string }>;
  meetingPointText: string | null;
  sourceOverview: string;
}) => {
  const normalizedLocation = `${city}, ${state}`;
  const activityLabel =
    categoryLabel?.toLowerCase().replace(/\s+tour$/i, " tour") ?? "guided tour";
  const cleanedSourceOverview = stripMarketingLanguage(sourceOverview)
    .replace(/\s+/g, " ")
    .trim();
  const highlightText = highlights
    .slice(0, 3)
    .map(item => item.replace(/\.$/, "").trim())
    .filter(Boolean)
    .join(", ");
  const stopText = itinerary
    .slice(0, 3)
    .map(stop => stop.title.replace(/\.$/, "").trim())
    .filter(Boolean)
    .join(", ");
  const sourceSnippet = cleanedSourceOverview
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .trim();

  const opening = toSentence(
    `Set in ${normalizedLocation}, ${title} is a ${activityLabel} built around a guide-led experience and practical local context`
  );
  const middleA = toSentence(
    [
      highlightText
        ? `During the outing, you can expect activities such as ${highlightText}`
        : "The experience blends local interpretation with hands-on activity",
      stopText ? `with scheduled stops such as ${stopText}` : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  const logistics = toSentence(
    [
      "The format is guided and follows a structured itinerary",
      durationText ? `with a typical duration of ${durationText}` : "",
      meetingPointText
        ? `and departure details centered on ${meetingPointText}`
        : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  const closer = toSentence(
    `Overall, this ${city} experience balances clear guidance, real destination context, and a relaxed pace suited to small groups`
  );

  const parts = [opening, middleA, logistics, sourceSnippet, closer].filter(
    Boolean
  );
  const withLimit = () => {
    const limited: string[] = [];
    for (const part of parts) {
      const next = [...limited, part].join(" ");
      if (countWords(next) > 150) break;
      limited.push(part);
    }
    return limited.join(" ");
  };

  let summary = withLimit();
  if (countWords(summary) < 100) {
    const expansion = toSentence(
      `Expect accurate location details, on-the-ground orientation, and enough flexibility to enjoy each stop without feeling rushed`
    );
    const expanded = `${summary} ${expansion}`.trim();
    summary = countWords(expanded) <= 150 ? expanded : summary;
  }

  return summary;
};

const ENGINE6_CANONICAL_PATH_PATTERN =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/[^/]+$/;

const slugToLabel = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const ENGINE6_ITINERARY_DESCRIPTION_OVERRIDES: Record<string, string[]> = {
  "163975P1": [
    "Roll past Stearns Wharf for broad harbor views, fishing-pier history, and a classic first look at Santa Barbara’s shoreline.",
    "Continue along East Beach, where palms, volleyball courts, and mountain-meets-ocean scenery define the city’s laid-back coastal mood.",
    "Pass the Andrée Clark Bird Refuge to see lagoon habitat, walking paths, and one of the quieter nature pockets near the waterfront.",
    "Glide by Butterfly Beach, a scenic Montecito stretch known for calm surf, ocean light, and postcard-worthy coastal homes.",
    "Travel past the Santa Barbara Museum of Natural History, a longtime local institution set near native landscape and oak-lined grounds.",
    "Stop at Old Mission Santa Barbara for about 10 minutes to view the landmark church and grounds; admission ticket is not included.",
    "Pass the Santa Barbara County Courthouse to admire its Spanish Colonial Revival design and one of downtown’s signature civic landmarks.",
    "Ride by El Presidio de Santa Barbara State Historic Park, where preserved adobe-era structures reflect the city’s early colonial roots.",
    "Finish along the Santa Barbara waterfront with marina views, palm-lined promenades, and a final sweep of the coast.",
  ],
  "117409P1": [
    "Leave Santa Barbara and climb over San Marcos Pass on Highway 154, where coastal terrain gives way to ranchlands and vineyard valleys.",
    "Arrive in Santa Ynez Valley wine country for guided tasting-stop rotations based on the day’s participating wineries.",
    "Spend time in Solvang to explore Danish-style streets, local shops, and tasting rooms between winery visits.",
    "Continue through Los Olivos for small-town wine-country atmosphere and additional tasting opportunities when scheduled.",
    "Travel through Santa Ynez with route commentary on valley history, agriculture, and regional winemaking styles.",
    "Return to Santa Barbara with a final scenic drive back over the pass after the day’s tasting itinerary wraps.",
  ],
  "3780SUPER": [
    "Meet outside Cafe Beignet in the JAX Brewery Building on Decatur Street for check-in and the start of the day.",
    "Walk through the historic French Quarter with guide-led context on New Orleans culture, architecture, and early city history.",
    "Pass Jackson Square while moving through the French Quarter portion of the sightseeing route.",
    "Pause at the French Market for independent lunch time before continuing the combined sightseeing experience.",
    "Board the Riverboat CITY of NEW ORLEANS for a 75-minute Mississippi River sightseeing cruise with captain narration.",
    "Continue by narrated coach through city highlight areas including the Garden District, St. Charles Avenue, and above-ground cemetery scenery.",
    "Pass Audubon Aquarium along the downtown riverfront during the city highlights sequence.",
    "Pass New Orleans City Park as the coach route introduces broader city neighborhoods beyond the French Quarter.",
    "Travel through the Garden District for views of historic homes and neighborhood streets from the coach route.",
    "Pass the National WWII Museum during the narrated city highlights portion of the tour.",
  ],
  "3780P45": [
    "Board at 101 Saint Louis Street behind JAX Brewery for the round-trip riverboat cruise departure.",
    "Cruise along the French Quarter riverfront while the captain narrates the Mississippi River setting.",
    "Pass Jackson Square and St. Louis Cathedral from the water along the downtown riverfront.",
    "View the Crescent City Connection from the Mississippi River during the sightseeing route.",
    "Pass the Aquarium of the Americas along the central New Orleans riverfront.",
    "Pass Mardi Gras World while the boat continues along the riverfront corridor.",
    "Cruise by Woldenberg Riverfront Park before returning to the French Quarter dock.",
  ],
  "447486P8": [
    "Depart from Santa Barbara Harbor and settle in for a relaxed narrated coastal yacht cruise.",
    "Glide past Stearns Wharf for classic waterfront views from the water.",
    "Cruise along East Beach and the Santa Barbara coastline with open-ocean breezes.",
    "Take in channel and mountain sunset views as golden-hour light builds offshore.",
    "Return to Santa Barbara Harbor to finish the coastal yacht experience.",
  ],
  "6007P5": [
    "Check in at the Beach Street bike shop for fitting, equipment, and a concise route orientation before departure.",
    "Follow the guide toward the bridge on bike-friendly corridors with photo pauses and group pacing built into the ride.",
    "Cross the Golden Gate Bridge on the bicycle route with guide-managed transitions and time to take in the bay setting.",
    "End the hosted portion in Sausalito for lunch, then keep the rental bike for the independent return plan selected that day.",
  ],
  "2630SUN": [
    "Board at Pier 43½ on the Fisherman’s Wharf waterfront for the round-trip bay cruise departure.",
    "Pass the Golden Gate Bridge from the water during the western bay portion of the route.",
    "Cross San Francisco Bay between the waterfront, bridge corridors, and island landmarks.",
    "Pass the Marina District shoreline while the vessel follows the northern San Francisco waterfront.",
    "Pass Fort Mason, a former military post on the waterfront west of Fisherman’s Wharf.",
    "View Coit Tower above Telegraph Hill as the cruise returns toward the downtown waterfront.",
    "See the Bay Bridge where it spans the bay between San Francisco and the East Bay.",
    "Pass near Yerba Buena Island along the Bay Bridge corridor.",
    "Keep Treasure Island in the central bay sightseeing sequence near the Bay Bridge route.",
  ],
  "5096P30": [
    "Begin your sightseeing loop on Hollywood Boulevard at the Big Bus Welcome Center, where departures run throughout the day.",
    "Pass the TCL Chinese Theatre to see one of Hollywood’s signature landmarks with its famous celebrity handprints.",
    "See the Rockwalk at Guitar Center, a Sunset Strip tribute honoring influential musicians.",
    "Cruise past The Comedy Store, the iconic club that helped launch generations of stand-up talent.",
    "Take in Sunset Plaza’s upscale mix of boutiques, restaurants, and classic Sunset Strip views.",
    "Ride through West Hollywood’s high-energy district known for nightlife, culture, and celebrity hotspots.",
    "Stop near Beverly Gardens Park for Beverly Hills sign photos and manicured garden views.",
    "Visit Beverly Center, one of Los Angeles’s best-known destinations for premium retail shopping.",
    "Pass Museum Row, a major LA arts corridor anchored by museums such as LACMA and the Petersen Automotive Museum.",
    "Explore The Grove and the Original Farmers Market for open-air shopping, dining, and local food favorites.",
  ],
  "67760P2": [
    "Stroll Santa Monica Pier for ocean panoramas, lively boardwalk energy, and easy access to nearby shopping streets.",
    "Sample Los Angeles food options with time to browse popular retail spots such as The Grove.",
    "Take in close-up Hollywood Sign views while exploring science-focused exhibits and hilltop city vistas.",
    "Walk Hollywood’s iconic theater district, including landmark venues and classic Walk of Fame photo moments.",
  ],
  "32779P6": [
    "Travel deep into Catalina’s interior for sweeping island viewpoints and frequent wildlife sightings across protected terrain.",
  ],
  "5144BRUNCH": [
    "Settle into a relaxed bay cruise with live onboard ambiance, skyline views, and a polished Sunday brunch setting.",
    "Cruise beneath the Coronado Bridge past Seaport Village and the USS Midway along San Diego’s iconic waterfront corridor.",
    "Watch downtown skyline views broaden from the dining deck as the yacht glides through central harbor waters.",
    "Take in open-water panoramas while brunch service and live entertainment continue throughout the sailing.",
    "Pass naval installations, Shelter Island marinas, and Cabrillo’s coastal point on the scenic return across San Diego Bay.",
  ],
  "6455NOLAAIR": [
    "Use the selected pickup option from New Orleans or travel independently toward the Lafitte launch area before the airboat portion begins.",
    "Board at the Lafitte airboat launch after check-in and practical orientation for the selected boat size.",
    "Travel through tidewater cypress swamp near Jean Lafitte National Historical Park and Preserve, with wildlife viewing shaped by the day’s conditions.",
    "Return to the Lafitte launch area before continuing independently or using the booked transportation option back toward New Orleans.",
  ],
  "15200P6": [
    "Begin with confirmed pickup from a selected New Orleans hotel or designated pickup point before traveling to the swamp boat launch.",
    "Check in at the launch area and board the swamp boat for a captain-led outing on the water.",
    "Cruise through swamp and bayou channels where wetland scenery and wildlife viewing vary by season and conditions.",
    "Use the included transportation back toward the selected New Orleans drop-off point after the boat portion.",
  ],
  "6953SWAMPTRANS": [
    "Meet at the assigned French Quarter pickup point before traveling toward Honey Island Swamp.",
    "Travel across Lake Pontchartrain on the way from New Orleans to the swamp region.",
    "Board a quiet flat-bottom boat for a captain-led route through protected wetland passages and bayou scenery.",
    "See a Cajun village reachable only from the water while learning how local communities have used the swamp.",
    "Return to shore after the boat tour, then continue back to the downtown pickup point.",
  ],
  "15200P2": [
    "Begin with confirmed pickup from a selected downtown hotel before traveling toward the swamp.",
    "Travel by air-conditioned vehicle along the Mississippi River corridor on the way to the airboat launch.",
    "Board a large 16-passenger airboat for a captain-narrated route through swamp waterways, photo stops, and wildlife habitat.",
    "After the airboat portion, use the coordinated transfer back to the selected New Orleans hotel pickup location.",
  ],
};

const ENGINE6_REVIEWED_ITINERARY_DESCRIPTION_OVERRIDES: Record<
  string,
  Array<string | undefined>
> = {
  "103533P1": [
    undefined,
    undefined,
    "Battery Park City remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "106439P1": [
    undefined,
    undefined,
    undefined,
    "Beverly Gardens Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    "Beverly Canon Gardens remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "190492P3": [
    undefined,
    "Bryce Canyon National Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "233384P2": [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "Brooklyn Navy Yard remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "2630SUN": [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "Yerba Buena Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Treasure Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "2660SFOWIN": [
    undefined,
    "Napa Valley remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "28758P1": [
    undefined,
    "Tijuana Walking Tour remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "3097SDZSP_2VISIT": [
    undefined,
    "San Diego Zoo Safari Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "3454YE3D": [
    "San Francisco departure remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    undefined,
    undefined,
    undefined,
    "Yosemite Village free time remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "Valley activity time remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "3533P14": [
    undefined,
    undefined,
    undefined,
    undefined,
    "Willow Springs area remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "354611P1": [
    undefined,
    undefined,
    "Historic Railroad Trail remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "36001P14": [
    "Pacific Coast Highway remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    "Cannery Row remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "17-Mile Drive remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Carmel-by-the-Sea remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "3780P45": [
    undefined,
    "French Quarter riverfront remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    "Crescent City Connection remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    "Mardi Gras World remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "3857PHI": [
    undefined,
    "Amish Country remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "388361P1": [
    undefined,
    undefined,
    undefined,
    "San Diego Bay Walk remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    undefined,
    "Coronado Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Shelter Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Coronado Bridge remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "The Embarcadero remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Rady Shell remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "3885SW303BS": [
    undefined,
    "Luzern Altstadt remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "411138P3": [
    undefined,
    "Earthquake Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "424070P1": [
    undefined,
    undefined,
    undefined,
    "Coronado Bridge remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "447234P3": [
    undefined,
    undefined,
    "Skull Rock remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Keys View remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Hidden Valley remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "47235P1": [
    undefined,
    "Beverly Hills remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "474891P3": [
    undefined,
    undefined,
    "St. Patrick's Cathedral remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "5144BRUNCH": [
    "Sunday Brunch Cruise remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "53474P8": [
    undefined,
    "Chester Creek Greenbelt remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "5553984P5": [
    "Zurich Old Town remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "5584233P1": [
    undefined,
    "San Diego Bay remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    undefined,
    "Cabrillo National Monument remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "5598628P3": [
    undefined,
    "Coronado Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Seaport Village remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Point Loma remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Sunset Cliffs Natural Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    "Shelter Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Waterfront Park Downtown San Diego remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "5602P25": [
    undefined,
    undefined,
    "Day 3: Monument Valley remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "62527P11": [
    "Midtown Manhattan Departure remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    undefined,
    undefined,
    undefined,
    "It remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "6288P29": [
    undefined,
    undefined,
    undefined,
    "Ellis Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "6953SWAMPTRANS": [
    "Downtown New Orleans pickup remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
  "7081NYCDAY": [
    undefined,
    "Rockefeller Center remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Fifth Avenue remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    "Gansevoort Liberty Market remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
    undefined,
    "New York Harbor remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  ],
};

const ENGINE6_ITINERARY_ITEM_OVERRIDES: Record<
  string,
  Array<{ title: string; description: string; stopType: "pass-by" | "stop" }>
> = {
  "3454YE3D": [
    {
      title: "San Francisco departure",
      description:
        "Leave San Francisco for Yosemite with an eastbound Bay Bridge crossing and Sierra-bound drive.",
      stopType: "stop",
    },
    {
      title: "Bay Bridge crossing",
      description:
        "Cross the Bay Bridge for views toward Alcatraz Island, Angel Island, and the wider San Francisco Bay.",
      stopType: "pass-by",
    },
    {
      title: "Yosemite National Park entrance",
      description:
        "Arrive at Yosemite National Park after the drive from San Francisco and begin the park portion of the trip.",
      stopType: "stop",
    },
    {
      title: "Tuolumne Grove",
      description:
        "Walk the Tuolumne Grove route to see mature giant sequoias in a quieter Yosemite forest setting.",
      stopType: "stop",
    },
    {
      title: "Yosemite Valley orientation",
      description:
        "Travel through Yosemite Valley for an overview of its glacier-shaped cliffs, meadows, and central landmarks.",
      stopType: "pass-by",
    },
    {
      title: "Yosemite Village free time",
      description:
        "Use free time in Yosemite Village for independent walking, food, photos, or nearby valley exploration.",
      stopType: "stop",
    },
    {
      title: "Yosemite Falls",
      description:
        "Visit the Yosemite Falls area during valley time to see one of the park’s signature waterfall landmarks.",
      stopType: "stop",
    },
    {
      title: "Ansel Adams Gallery",
      description:
        "Browse the Ansel Adams Gallery for photography-focused Yosemite history and park-inspired artwork.",
      stopType: "stop",
    },
    {
      title: "Yosemite campsite",
      description:
        "Settle into the Yosemite campsite as camping equipment is distributed and the overnight base is introduced.",
      stopType: "stop",
    },
    {
      title: "Yosemite High Country",
      description:
        "Spend the second day in Yosemite High Country with alpine scenery shaped by lakes, granite, and open meadows.",
      stopType: "stop",
    },
    {
      title: "High-country hiking",
      description:
        "Follow high-country hiking options selected around group pace, seasonal access, and mountain conditions.",
      stopType: "stop",
    },
    {
      title: "Yosemite Valley return",
      description:
        "Return to Yosemite Valley on the final day for another block of independent park time.",
      stopType: "stop",
    },
    {
      title: "Valley activity time",
      description:
        "Choose a valley activity such as a waterfall walk, bicycle rental, museum visit, or Merced River break.",
      stopType: "stop",
    },
    {
      title: "El Capitan Meadow",
      description:
        "Stop at El Capitan Meadow to view the granite wall and watch climbers when conditions allow.",
      stopType: "stop",
    },
    {
      title: "San Francisco Drop-off",
      description:
        "Travel back from Yosemite to the San Francisco Hilton after the final day in the park.",
      stopType: "stop",
    },
  ],
  "447486P8": [
    {
      title: "Santa Barbara Harbor departure",
      description:
        "Depart from Santa Barbara Harbor and settle in for a relaxed narrated coastal yacht cruise.",
      stopType: "stop",
    },
    {
      title: "Stearns Wharf waterfront views",
      description:
        "Glide past Stearns Wharf for classic waterfront views from the water.",
      stopType: "pass-by",
    },
    {
      title: "East Beach coastline views",
      description:
        "Cruise along East Beach and the Santa Barbara coastline with open-ocean breezes.",
      stopType: "pass-by",
    },
    {
      title: "Channel and mountain sunset views",
      description:
        "Take in channel and mountain sunset views as golden-hour light builds offshore.",
      stopType: "pass-by",
    },
    {
      title: "Return to Santa Barbara Harbor",
      description:
        "Return to Santa Barbara Harbor to finish the coastal yacht experience.",
      stopType: "stop",
    },
  ],
};

const rewriteItineraryDescriptionToSingleSentence = (args: {
  productCode: string;
  item: NonNullable<Engine6ApiResponse["extracted"]["itinerary"]>[number];
  index: number;
}) => {
  const override =
    ENGINE6_REVIEWED_ITINERARY_DESCRIPTION_OVERRIDES[args.productCode]?.[
      args.index
    ] ??
    ENGINE6_ITINERARY_DESCRIPTION_OVERRIDES[args.productCode]?.[args.index];
  if (override) {
    return override;
  }

  const { item } = args;
  const title = item.title?.trim() || "This stop";
  const duration = item.duration?.trim();
  const sourceDescription = item.description?.trim() ?? "";
  const cleanedSource = stripEngine6AdmissionArtifacts(sourceDescription)
    .replace(/\s+/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(you will|you'll|we will|we'll)\b/gi, "")
    .trim();
  const sourceSentence =
    cleanedSource
      .split(/(?<!\b\d)[.!?]/)
      .map(part => part.trim())
      .find(Boolean) ?? "";
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const normalizedSentence = sourceSentence
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const repeatsTitle =
    normalizedTitle.length > 0 &&
    normalizedSentence.length > 0 &&
    (normalizedSentence === normalizedTitle ||
      normalizedSentence.includes(normalizedTitle));
  const polishedSourceSentence = sourceSentence
    .replace(/^(enjoy|experience|discover|visit|explore|see)\s+/i, "")
    .replace(/^take in\s+/i, "")
    .replace(/^check out\s+/i, "")
    .replace(/^pass(?: by)?\s+/i, "")
    .replace(/^you(?:'ll| will)\s+/i, "")
    .replace(/^he\s+(?=[A-Z])/, "The ")
    .replace(/^[a-z]/, m => m.toUpperCase())
    .replace(/[;:,]\s*$/, "")
    .trim();

  const durationClause = duration
    ? ` during the ${duration.replace(/[.!?]+$/g, "")} stop`
    : "";

  if (polishedSourceSentence && !repeatsTitle) {
    return stripEngine6AdmissionArtifacts(`${polishedSourceSentence}.`)
      .replace(/\s+/g, " ")
      .replace(/\s+([;,.])/g, "$1")
      .replace(/\.\./g, ".")
      .trim();
  }

  const fallbackTitle = title
    .replace(
      /^(?:enjoy|experience|discover|visit|explore|see|head to|head|take in|check out|pass(?: by)?)\s+/i,
      ""
    )
    .replace(/^he\s+(?=[A-Z])/, "The ")
    .replace(/^[a-z]/, m => m.toUpperCase())
    .trim();
  const fallbackLead =
    item.stopType === "pass-by"
      ? `Pass ${fallbackTitle || title} as part of the route`
      : `Visit ${fallbackTitle || title}${durationClause}`;

  return stripEngine6AdmissionArtifacts(`${fallbackLead}.`)
    .replace(/\s+/g, " ")
    .replace(/\s+([;,.])/g, "$1")
    .replace(/\.\./g, ".")
    .trim();
};

export const mapViatorToEngine6Tour = (
  payload: Engine6ApiResponse
): Engine6Tour => {
  const title =
    payload.extracted.title ?? `Outdoor Adventure ${payload.rawProductCode}`;
  const generatedCanonicalPath = buildEngine6CanonicalPath({
    state: payload.extracted.state ?? "destination",
    city: payload.extracted.city ?? "destination",
    title,
  });
  const canonicalPath =
    resolveEngine6PathForProductCode(payload.rawProductCode) ??
    generatedCanonicalPath;
  const [, routeStateSlug = "", routeCitySlug = ""] =
    ENGINE6_CANONICAL_PATH_PATTERN.exec(canonicalPath) ?? [];
  const routeCityLabel = slugToLabel(routeCitySlug) ?? null;
  const routeStateLabel = slugToLabel(routeStateSlug) ?? null;
  const city = routeCityLabel ?? payload.extracted.city ?? "Destination";
  const state = routeStateLabel ?? payload.extracted.state ?? "Destination";

  if (
    shouldLogEngine6LocationDiagnostics() &&
    (!payload.extracted.city || !payload.extracted.state)
  ) {
    console.warn("[engine6-location] missing explicit location fields", {
      productCode: payload.rawProductCode,
      extractedCity: payload.extracted.city,
      extractedState: payload.extracted.state,
      fallbackCity: city,
      fallbackState: state,
    });
  }
  const finalHeroImageUrl =
    typeof payload.extracted.heroImageUrl === "string" &&
    /^https?:\/\//i.test(payload.extracted.heroImageUrl) &&
    !payload.extracted.heroImageUrl.includes("/hero.jpg") &&
    !payload.extracted.heroImageUrl.includes("/images/hiking-hero.jpg")
      ? payload.extracted.heroImageUrl
      : null;
  const strictResolvedHero =
    finalHeroImageUrl &&
    payload.diagnostics.heroSourceProductCode &&
    payload.diagnostics.heroSourceProductUrl &&
    payload.diagnostics.heroSourceFieldPath &&
    payload.diagnostics.heroHost &&
    payload.diagnostics.heroSourceFieldPath.startsWith(
      "product.media.images"
    ) &&
    payload.diagnostics.heroSourceProductCode.toUpperCase() ===
      payload.rawProductCode.toUpperCase() &&
    payload.diagnostics.finalHeroUrl === finalHeroImageUrl
      ? {
          url: finalHeroImageUrl,
          sourceProductCode: payload.diagnostics.heroSourceProductCode,
          sourceProductUrl: payload.diagnostics.heroSourceProductUrl,
          sourceFieldPath: payload.diagnostics.heroSourceFieldPath,
          host: payload.diagnostics.heroHost,
        }
      : null;

  if (!strictResolvedHero) {
    throw new Error(
      `Engine6 strict hero contract violation for ${payload.rawProductCode}: resolved hero must be exact-product product.media.images with full provenance`
    );
  }
  const sourceOverviewText = cleanEngine6Description(
    payload.extracted.overviewText ?? ""
  );
  const highlights = payload.extracted.highlights ?? [];
  const suppressItinerarySection = isEngine6ItinerarySectionSuppressed(
    payload.rawProductCode
  );
  const itineraryOverride =
    ENGINE6_ITINERARY_ITEM_OVERRIDES[payload.rawProductCode] ?? null;
  const itinerary = suppressItinerarySection
    ? []
    : itineraryOverride
      ? itineraryOverride.map((item, index) => ({
          title: item.title,
          description:
            ENGINE6_REVIEWED_ITINERARY_DESCRIPTION_OVERRIDES[
              payload.rawProductCode
            ]?.[index] ?? item.description,
          stopType: item.stopType,
          duration: undefined,
          admissionNote: undefined,
        }))
      : (payload.extracted.itinerary?.map(
          ({ titleSource: _titleSource, ...item }, index) => ({
            ...item,
            description: rewriteItineraryDescriptionToSingleSentence({
              productCode: payload.rawProductCode,
              item,
              index,
            }),
          })
        ) ?? []);
  const itinerarySummaryText = suppressItinerarySection
    ? null
    : (payload.extracted.itinerarySummaryText ?? null);
  const faqs = payload.extracted.faqs ?? [];
  const included = payload.extracted.included ?? [];
  const requirements = payload.extracted.requirements ?? [];
  const classificationOverride =
    ENGINE6_CLASSIFICATION_OVERRIDES[payload.rawProductCode];
  const categories =
    classificationOverride?.categories ?? payload.extracted.categories ?? [];
  const primaryCategory =
    classificationOverride?.primaryCategory ??
    payload.extracted.primaryCategory ??
    categories[0] ??
    null;
  const primaryDisplayCategory =
    classificationOverride?.primaryDisplayCategory ??
    payload.extracted.primaryDisplayCategory ??
    formatEngine6CategoryLabel(primaryCategory);
  const activityCategories =
    classificationOverride?.activityCategories ??
    payload.extracted.activityCategories ??
    [];
  const categoryLabel = primaryDisplayCategory;
  const rawDescription =
    payload.extracted.overviewText ??
    payload.extracted.seoDescription ??
    `Explore ${title} with local guides in ${city}, ${state}.`;
  const cleanedDescription = cleanEngine6Description(rawDescription);
  const descriptionBody = cleanedDescription.replace(/\s+/g, " ").trim();
  const descriptionOverride =
    ENGINE6_DESCRIPTION_OVERRIDES[payload.rawProductCode];
  const description = descriptionOverride ?? descriptionBody;
  const metaDescription = buildEngine6SeoDescription({
    title,
    city,
    categoryLabel,
    sourceDescription: description,
    sourceDescriptions: [
      sourceOverviewText,
      payload.extracted.seoDescription,
      itinerarySummaryText,
      highlights.join(". "),
      descriptionOverride,
    ],
  });
  const governedMetaDescription =
    ENGINE6_META_DESCRIPTION_OVERRIDES[payload.rawProductCode] ??
    metaDescription;
  const aggregateRating = normalizeEngine6AggregateRating(
    payload.extracted.aggregateRating
  );
  const bookingUrl = buildEngine6ViatorBookingUrl(
    payload.rawProductCode,
    payload.extracted.productUrl
  );
  const ctaOwner = "viator";
  const fallbackFieldNames = [
    !payload.extracted.title ? "title" : null,
    !payload.extracted.city ? "city" : null,
    !payload.extracted.state ? "state" : null,
    !payload.extracted.heroImageUrl ? "heroImageUrl" : null,
    !payload.extracted.priceFormatted ? "priceFormatted" : null,
    !payload.extracted.meetingPointText ? "meetingPointText" : null,
  ].filter((value): value is string => Boolean(value));

  const extractedCurrency = normalizeIsoCurrency(
    payload.extracted.priceCurrency
  );
  const usdCommercialAmount =
    extractedCurrency && extractedCurrency !== "USD"
      ? null
      : payload.extracted.priceAmount;
  const formattedStartingPrice =
    formatEngine6StartingPriceLabel(usdCommercialAmount);
  const synthesizedOverview = buildAuthoritativeOverview({
    title,
    city,
    state,
    categoryLabel,
    durationText: payload.extracted.durationText ?? null,
    highlights,
    itinerary,
    meetingPointText: payload.extracted.meetingPointText ?? null,
    sourceOverview: sourceOverviewText,
  });
  const overriddenOverview =
    ENGINE6_OVERVIEW_OVERRIDES[payload.rawProductCode]?.({
      city,
      state,
      sourceOverview: sourceOverviewText,
    }) ?? getMexicoCityTargetedNarrativeDescription(payload.rawProductCode);
  const governedOverview =
    isEngine6NewBuildProductCode(payload.rawProductCode) &&
    !hasEngine6ReviewedOverviewOverride(payload.rawProductCode)
      ? rewriteEngine6Overview({
          title,
          city,
          state,
          categoryLabel,
          durationText: payload.extracted.durationText ?? null,
          highlights,
          itinerary,
          sourceOverview: sourceOverviewText,
        })
      : null;
  const normalizedOverview =
    overriddenOverview ||
    governedOverview ||
    (!isEngine6NewBuildProductCode(payload.rawProductCode)
      ? sourceOverviewText
      : null) ||
    synthesizedOverview;

  if (payload.rawProductCode === "335698P13") {
    const requiredReviewCount = 86;
    if (payload.extracted.reviewCount !== requiredReviewCount) {
      throw new Error(
        `Engine6 hard-fail: 335698P13 must render ${requiredReviewCount} reviews above the fold; received ${payload.extracted.reviewCount ?? "null"}`
      );
    }
  }

  return {
    productCode: payload.rawProductCode,
    title,
    seoTitle:
      ENGINE6_SEO_TITLE_OVERRIDES[payload.rawProductCode] ??
      buildEngine6SeoTitle({ title, city, state }),
    seoDescription: governedMetaDescription,
    description,
    metaDescription: governedMetaDescription,
    city,
    state,
    resolvedImageUrl: strictResolvedHero.url,
    heroImageUrl: strictResolvedHero.url,
    resolvedHero: strictResolvedHero,
    priceAmount: usdCommercialAmount,
    priceFormatted: formattedStartingPrice,
    priceCurrency: usdCommercialAmount !== null ? "USD" : extractedCurrency,
    aggregateRating,
    reviewCount: payload.extracted.reviewCount,
    durationText: payload.extracted.durationText ?? null,
    meetingPointText:
      payload.extracted.meetingPointText ?? "See booking details",
    overviewText: normalizedOverview || null,
    highlights,
    itinerary,
    itinerarySummaryText,
    faqs,
    included,
    requirements,
    primaryCategory,
    categories,
    primaryDisplayCategory,
    activityCategories,
    categoryLabel,
    pagePath: canonicalPath,
    canonicalPath,
    bookingUrl,
    ownership: {
      routeOwner: ctaOwner,
      ctaOwner,
      presentationOwner: "engine6",
      commercialOwner: "viator",
      commercialFallbackReason: "none",
    },
    diagnostics: {
      source: payload.source,
      commercialPriceFieldPath: payload.diagnostics.commercialPriceFieldPath,
      commercialPriceRawValue: payload.diagnostics.commercialPriceRawValue,
      priceSourceUsed: payload.diagnostics.priceSourceUsed,
      heroImageFieldPath: payload.diagnostics.heroImageFieldPath,
      heroVariantFieldPath: payload.diagnostics.heroVariantFieldPath,
      selectedHeroWidth: payload.diagnostics.selectedHeroWidth,
      selectedHeroHeight: payload.diagnostics.selectedHeroHeight,
      imageSourceUsed: payload.diagnostics.imageSourceUsed,
      heroSourceType: payload.diagnostics.heroSourceType,
      heroQualityClassification: payload.diagnostics.heroQualityClassification,
      finalHeroUrl: payload.diagnostics.finalHeroUrl,
      heroFallbackTriggered: payload.diagnostics.heroFallbackTriggered,
      heroCandidatesPresent: payload.diagnostics.heroCandidatesPresent,
      heroCandidateCount: payload.diagnostics.heroCandidateCount,
      heroCandidateCountBeforeFiltering:
        payload.diagnostics.heroCandidateCountBeforeFiltering,
      heroCandidateCountAfterFiltering:
        payload.diagnostics.heroCandidateCountAfterFiltering,
      heroPlaceholderFallbackReason:
        payload.diagnostics.heroPlaceholderFallbackReason,
      captionPrecedenceApplied: payload.diagnostics.captionPrecedenceApplied,
      candidateFamilyIdentityDeterminable:
        payload.diagnostics.candidateFamilyIdentityDeterminable,
      heroSurfaceParity: payload.diagnostics.heroSurfaceParity,
      rejectedForeignHeroCandidates:
        payload.diagnostics.rejectedForeignHeroCandidates,
      heroSourceProductCode: payload.diagnostics.heroSourceProductCode,
      heroSourceProductUrl: payload.diagnostics.heroSourceProductUrl,
      heroSourceFieldPath: payload.diagnostics.heroSourceFieldPath,
      heroHost: payload.diagnostics.heroHost,
      productUrlFieldPath: payload.diagnostics.productUrlFieldPath,
      bookingUrlSource:
        payload.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      ratingFieldPath: payload.diagnostics.ratingFieldPath,
      reviewCountFieldPath: payload.diagnostics.reviewCountFieldPath,
      durationFieldPath: payload.diagnostics.durationFieldPath ?? null,
      overviewFieldPath: payload.diagnostics.overviewFieldPath,
      highlightsFieldPath: payload.diagnostics.highlightsFieldPath,
      meetingPointFieldPath: payload.diagnostics.meetingPointFieldPath,
      itineraryFieldPath: payload.diagnostics.itineraryFieldPath,
      itineraryItemCount: payload.diagnostics.itineraryItemCount,
      itinerarySourceUsed: payload.diagnostics.itinerarySourceUsed,
      itineraryStructuredSourceUsed:
        payload.diagnostics.itineraryStructuredSourceUsed,
      itineraryFallbackSummaryUsed:
        payload.diagnostics.itineraryFallbackSummaryUsed,
      itinerarySummaryFieldPath:
        payload.diagnostics.itinerarySummaryFieldPath ?? null,
      faqsFieldPath: payload.diagnostics.faqsFieldPath,
      faqFieldPath: payload.diagnostics.faqFieldPath,
      faqCount: payload.diagnostics.faqCount,
      faqSourceUsed: payload.diagnostics.faqSourceUsed,
      requirementsFieldPath: payload.diagnostics.requirementsFieldPath,
      highlightClassificationReason:
        payload.diagnostics.highlightClassificationReason,
      classificationFieldPath: payload.diagnostics.classificationFieldPath,
      fieldLevelFallbackUsed: fallbackFieldNames.length > 0,
      fallbackFieldNames,
    },
  };
};
