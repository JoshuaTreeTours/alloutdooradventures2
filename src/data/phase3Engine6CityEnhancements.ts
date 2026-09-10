import type { GuidePageData } from "../utils/loadGuide";

type Phase3Treatment = "full" | "surgical" | "targeted";

type CityEnhancement = {
  treatment: Phase3Treatment;
  overview: string;
  highlights: [string, string][];
  things?: [string, string][];
  seasons: string[];
  tips: string[];
  faq: [string, string][];
  tourism: string;
  subheadline: string;
  dropAbout?: boolean;
};

export const PHASE3_ENGINE6_CITY_KEYS = new Set([
  "florida/fort-lauderdale",
  "florida/orlando",
  "new-york/new-york",
  "oregon/portland",
  "colorado/boulder",
  "california/napa",
  "florida/miami",
]);

const cities: Record<string, CityEnhancement> = {
  "florida/fort-lauderdale": {
    treatment: "full",
    overview: "Fort Lauderdale is best understood through water: the New River crosses downtown, canals reach deep into residential districts, the Intracoastal Waterway parallels the coast, and the Atlantic beach forms a separate waterfront zone east of the central city. A strong visit links those landscapes rather than treating the beach as the whole destination. Las Olas Boulevard, Riverwalk, historic buildings and downtown museums provide the urban story, while Bonnet House and Hugh Taylor Birch State Park preserve very different pieces of coastal Florida near the ocean. Boating, beach weather, bridge openings, seasonal heat and South Florida traffic all affect pacing, so grouping stops by waterway and district makes the city far easier to experience.",
    highlights: [
      ["A city organized by water", "The New River, canals, Intracoastal Waterway and Atlantic shoreline explain Fort Lauderdale's layout, transportation and recreational identity."],
      ["Beach and downtown are different experiences", "The oceanfront, Las Olas corridor and riverfront downtown connect naturally but deserve enough time to appreciate their distinct settings."],
      ["Coastal history still survives", "Bonnet House and Stranahan House preserve layers of Fort Lauderdale that are easy to miss among marinas, hotels and newer development."]
    ],
    things: [
      ["Fort Lauderdale Beach and the beachfront promenade", "Fort Lauderdale Beach gives the city its best-known Atlantic setting, with a broad public shoreline, a pedestrian promenade and easy connections to restaurants and hotels along the oceanfront. Early morning is especially useful for walking, swimming or cycling before heat and beach traffic build. The beach district is separated from downtown by the Intracoastal Waterway and intervening neighborhoods, so it works best as a defined waterfront block rather than a quick add-on between inland stops. Check surf, lightning and marine conditions before entering the water, particularly during the warm storm-prone season."],
      ["Las Olas Boulevard", "Las Olas Boulevard links downtown Fort Lauderdale with the barrier-island beach district through a sequence of restaurants, galleries, shops, residential canals and waterfront crossings. The most walkable commercial section sits near the downtown and riverfront core, where it can be paired with Riverwalk without moving a car. Continuing east reveals how the city transitions from the New River and canal neighborhoods toward the Intracoastal and Atlantic. Traffic and drawbridge delays can make short map distances take longer than expected, so avoid repeatedly crossing the corridor in one day."],
      ["Riverwalk and the New River", "Riverwalk follows the New River through central Fort Lauderdale and ties together parks, cultural venues, historic sites and active boat traffic. Walking here makes the city's water-based geography immediately understandable because yachts, bridges and downtown buildings share the same narrow river corridor. The route also connects naturally to Las Olas Boulevard and several museums, making it one of the easiest car-light parts of the city. Allow time to stop along the river rather than treating Riverwalk only as a path between attractions."],
      ["Bonnet House Museum & Gardens", "Bonnet House Museum & Gardens preserves a historic estate near the beach amid gardens and a surviving pocket of coastal vegetation. The property combines architecture, art, family history and landscape design in a setting that feels very different from the nearby high-rise oceanfront. Guided or self-paced visiting works best when there is enough time to see both the house and grounds rather than rushing through a single room or photo stop. Because the estate is close to Fort Lauderdale Beach and Hugh Taylor Birch State Park, those three sites form a logical coastal cluster."],
      ["Hugh Taylor Birch State Park", "Hugh Taylor Birch State Park occupies green space between the Intracoastal Waterway and the Atlantic beach zone, offering trails, shaded picnic areas and opportunities for paddling and wildlife observation. Its compact setting provides a useful contrast to the intensely developed coastline immediately around it. Visitors can combine the park with the beach or Bonnet House without driving back through downtown, which makes it efficient as part of a coastal day. Heat, mosquitoes, storms and water conditions vary by season, so bring water and check current park guidance before longer outdoor plans."],
      ["Historic Stranahan House Museum", "Stranahan House stands on the New River and preserves one of the clearest physical links to Fort Lauderdale's early twentieth-century development. The building evolved from a trading-post and community gathering place into a residence, giving visitors a human-scale view of settlement, commerce and transportation before the modern canal city emerged. Its downtown location makes it easy to combine with Riverwalk and Las Olas Boulevard instead of assigning a separate driving block. A guided visit adds useful context because much of the site's significance comes from the people and changes associated with the building rather than its exterior alone."],
      ["NSU Art Museum Fort Lauderdale", "NSU Art Museum Fort Lauderdale anchors the downtown arts district with modern, contemporary and regional exhibitions in a purpose-built cultural setting. It provides a strong indoor counterpoint to beach and boating plans, especially during afternoon heat or thunderstorms. The museum sits close enough to Riverwalk, Las Olas and other downtown cultural sites to build a compact walking itinerary around it. Check current exhibitions before visiting because rotating shows can substantially change the emphasis of a particular trip."],
      ["Intracoastal Waterway and canal cruise", "Seeing Fort Lauderdale from a boat reveals a street network that land-based touring cannot fully explain, with canals, marinas, bridges and waterfront neighborhoods opening onto the Intracoastal Waterway. Water-taxi or sightseeing-cruise routes can function as both orientation and transportation depending on the service chosen. The experience is most useful when paired with places already on the day's route rather than treated as an isolated loop that duplicates later driving. Weather, bridge schedules, tides and marine traffic can affect timing, so keep some flexibility around any fixed waterfront reservation."]
    ],
    seasons: [
      "Late fall through early spring generally brings lower humidity and the most comfortable conditions for walking, boating and beach time.",
      "Summer and early fall are hot, humid and thunderstorm-prone, with tropical-weather risk requiring flexible outdoor and marine plans.",
      "Winter is the busiest visitor season, so popular cruises, waterfront dining and holiday-period activities benefit from advance reservations."
    ],
    tips: [
      "Group Riverwalk, downtown museums and the central Las Olas corridor together, then handle the beach, Bonnet House and Birch State Park as a separate coastal cluster.",
      "Build extra time around Intracoastal bridges and peak traffic because short east-west trips can slow unexpectedly.",
      "Use early mornings for exposed beach or park activity during the warmer months and keep an indoor alternative for afternoon storms.",
      "Check marine forecasts and lightning conditions before boating, paddling or swimming rather than relying only on a general city forecast."
    ],
    faq: [
      ["How many days should I spend in Fort Lauderdale?", "Two to three days is enough for the riverfront and downtown, a coastal day around the beach and historic estates, and one boating or canal-focused experience."],
      ["Do I need a car in Fort Lauderdale?", "Not for every part of a visit. Walking, rideshare and water-based transportation can cover several central and coastal clusters, while a car is useful for farther regional trips."],
      ["Is Fort Lauderdale mainly a beach destination?", "The beach is important, but the New River, canals, historic sites, museums and downtown districts are essential to understanding why Fort Lauderdale is different from a generic South Florida beach stop."]
    ],
    tourism: "https://www.visitlauderdale.com/",
    subheadline: "Explore Fort Lauderdale through the New River, Atlantic beach, canals, historic estates, arts and water-based city life."
  },

  "florida/orlando": {
    treatment: "full",
    overview: "Orlando is both an incorporated Central Florida city and the name visitors commonly use for a much larger tourism region, and a useful guide has to keep those two scales distinct. Downtown Orlando centers on Lake Eola, performing arts, neighborhoods and a chain of lakes, while the major resort corridors sit well to the southwest and can consume entire days on their own. Nearby Winter Park is a separate city, and spring systems such as Wekiwa are protected landscapes outside the downtown core. A strong itinerary therefore groups Orlando by zones rather than crossing the metropolitan area repeatedly. Heat, thunderstorms, theme-park crowds and highway congestion can change daily pacing far more than simple mileage suggests.",
    highlights: [
      ["A real city beyond the resorts", "Downtown, Lake Eola, Mills 50, museums and gardens give Orlando a civic and neighborhood identity that is separate from the theme-park complexes."],
      ["The visitor region is geographically large", "Disney, Universal, International Drive, Winter Park and spring country should be treated as distinct zones rather than stops on one continuous city loop."],
      ["Central Florida water matters", "Lakes, wetlands and nearby spring systems explain the natural landscape beneath the metropolitan tourism infrastructure."]
    ],
    things: [
      ["Lake Eola Park and downtown Orlando", "Lake Eola Park is the clearest orientation point for the incorporated City of Orlando, surrounded by downtown streets, residential towers, public art and civic activity. The loop around the lake is compact enough for an easy walk and connects naturally to restaurants, the performing-arts district and nearby neighborhoods. Visiting here establishes what Orlando itself feels like before the itinerary expands toward distant resort corridors. Morning and evening are more comfortable during hot months, while festivals and weekend events can make the park much busier than a normal weekday."],
      ["Mills 50 and the east-central neighborhoods", "Mills 50 gives visitors a neighborhood-scale view of Orlando through independent restaurants, murals, small businesses and a strong Vietnamese-American and broader Asian food presence. The district is not a theme-park simulation, which makes it especially valuable for travelers trying to understand local Orlando. It pairs naturally with nearby Ivanhoe Village, Audubon Park or downtown rather than with a cross-region resort day. Walkable segments are interspersed with busy roads, so use care when moving between blocks and do not assume every destination is comfortably connected on foot."],
      ["Harry P. Leu Gardens", "Harry P. Leu Gardens preserves a large subtropical garden landscape north of downtown with palms, camellias, flowering trees and shaded paths around a historic property. The gardens provide an accessible introduction to Central Florida plant life without requiring a full-day drive to a state park or spring. Because the site is close to several central neighborhoods, it fits well after brunch or before an evening downtown rather than as a stand-alone regional excursion. Heat, rain and seasonal blooms change the experience considerably, so earlier hours are often preferable in summer."],
      ["Loch Haven Cultural Park", "Loch Haven Cultural Park concentrates several Orlando cultural institutions in one area north of downtown, including museums, theaters and science-oriented attractions. The cluster makes it possible to build an indoor cultural block without repeatedly driving between unrelated parts of the city. Families can devote several hours to the science center, while art and performance visitors can choose institutions that fit current exhibitions or schedules. Check operating days and event calendars in advance because programming varies more than at a single permanent attraction."],
      ["Walt Disney World resort area — outside the City of Orlando", "Walt Disney World is the region's largest visitor complex but it is not in downtown Orlando and should not be described as an ordinary city attraction. Its parks and resorts occupy a vast area southwest of the city, where a single park usually deserves most or all of a day. Transportation, parking, security and advance reservations add substantial time beyond the attractions themselves. Treat Disney as its own itinerary zone so a park day is not weakened by unrealistic plans to return repeatedly to central Orlando."],
      ["Universal Orlando and the International Drive corridor", "Universal Orlando and the International Drive area form another major visitor zone southwest of downtown, with theme parks, hotels, restaurants and entertainment concentrated along busy arterial roads. The area is geographically separate from the Lake Eola and neighborhood-oriented city experience, even when both are marketed under the Orlando name. A park or resort day should therefore be planned around that zone rather than combined with distant downtown appointments. Peak arrival and departure periods can produce heavy traffic, so build transit time into any reservation or evening plan."],
      ["Winter Park — a separate city", "Winter Park lies north of Orlando as its own municipality, with Park Avenue, museums, Rollins College and a linked chain of lakes forming a compact visitor district. Its historic center and tree-lined streets feel markedly different from both downtown Orlando and the resort corridors. Because it is close enough for a half-day excursion, visitors often combine it with Orlando, but the guide should keep the municipal distinction clear. Boat tours and museum visits can have limited schedules, so check current times before structuring the day around them."],
      ["Wekiwa Springs State Park", "Wekiwa Springs State Park lies north of Orlando and protects spring-fed water, hammocks, wetlands and trail networks that show a natural side of Central Florida far removed from the resort environment. Swimming, paddling and hiking are popular, with conditions varying by weather, water level and visitor demand. The park can reach capacity during busy periods, making early arrival and current-condition checks important. Treat it as a dedicated regional outdoor block with its own access rules rather than a casual city-park stop between downtown attractions."]
    ],
    seasons: [
      "Late fall through early spring usually provides the most comfortable weather for outdoor neighborhoods, gardens and spring-country excursions.",
      "Summer is hot, humid and storm-prone, and afternoon lightning can disrupt theme parks, pools, trails and outdoor events even when mornings are clear.",
      "Holiday weeks, school breaks and major event periods can sharply increase resort demand, traffic and lodging costs, so advance planning matters."
    ],
    tips: [
      "Organize days by zone: downtown and central neighborhoods, Universal/I-Drive, Disney-area resorts, Winter Park and spring country should not be mixed casually.",
      "Allow more travel time than mileage suggests because Orlando's visitor region is spread across several highways and congested corridors.",
      "Keep a weather-flexible plan during the warm season, with indoor museums or dining available when thunderstorms interrupt outdoor activities.",
      "Label Winter Park, Walt Disney World and state-park excursions accurately instead of treating the entire metropolitan tourism region as the City of Orlando."
    ],
    faq: [
      ["Is Walt Disney World actually in Orlando?", "It is part of the greater Orlando visitor region but lies southwest of the incorporated city, so it should be planned as a separate resort-area destination rather than a downtown stop."],
      ["How many days should I spend in Orlando?", "A city-focused visit can work in two or three days, but every major theme-park day or larger regional excursion should be added separately rather than squeezed into that base."],
      ["Can I visit Orlando without a car?", "Some downtown and resort areas have useful local transportation, but moving efficiently among widely separated city, resort and nature zones often requires a car, rideshare or organized transfer."]
    ],
    tourism: "https://www.visitorlando.com/",
    subheadline: "Explore Orlando as a real Central Florida city while planning the theme parks, neighboring cities and spring country as distinct visitor zones."
  },

  "new-york/new-york": {
    treatment: "surgical",
    overview: "New York City is not one continuous checklist but five boroughs linked by an enormous transit system, with the densest first-time visitor circuit concentrated in Manhattan and substantial destinations across Brooklyn, Queens, the Bronx and Staten Island. The existing guide already contains strong attraction-level material, so the right improvement is to remove repetitive machine-added suffixes and make the planning framework more geographically intelligent. Build days around clusters such as Lower Manhattan and the harbor, Midtown and the Theater District, Central Park and Museum Mile, or Brooklyn Bridge and DUMBO. That approach reduces subway backtracking and leaves enough time for neighborhoods to feel like places rather than transfer points between famous landmarks.",
    highlights: [
      ["Five boroughs, not one district", "Manhattan holds many headline sights, but New York City also includes Brooklyn, Queens, the Bronx and Staten Island, each with its own neighborhoods and visitor experiences."],
      ["Plan by geographic cluster", "Lower Manhattan, Midtown, Central Park, the West Side and Brooklyn waterfront each work better as coherent blocks than as isolated attractions."],
      ["Transit is part of the itinerary", "Subways, ferries and walking usually outperform repeated car trips for the core visitor districts, especially when stops are grouped intelligently."]
    ],
    seasons: [
      "Spring and fall generally provide the easiest combination of walking weather, park conditions and outdoor dining, though popular weeks can still be very busy.",
      "Summer is hot and humid but supports long evenings, waterfront activity and outdoor events; museums and shaded parks are useful during midday heat.",
      "Winter can be cold and windy, yet museums, theaters and indoor attractions remain strong, while the holiday period creates unusually heavy demand in Midtown."
    ],
    tips: [
      "Group attractions by borough and neighborhood before deciding on transit; a shorter list with less backtracking produces a better New York day.",
      "Use the subway for most Manhattan and Brooklyn movement, but consider ferries when the harbor or waterfront is part of the experience.",
      "Reserve crown, pedestal, theater and other capacity-limited experiences in advance when they are essential to the trip.",
      "Leave time for at least one neighborhood walk that is not simply a route between two ticketed attractions."
    ],
    faq: [
      ["How many days should I spend in New York City?", "Four to five days gives a first-time visitor enough room for several major Manhattan clusters plus meaningful time in at least one outer-borough neighborhood; longer stays reduce the need to rush."],
      ["Do I need a car in New York City?", "Usually not for the core visitor areas. Subway, bus, ferry and walking are generally more practical, while a car often adds parking cost and traffic delay."],
      ["Should I try to see every famous landmark on a first trip?", "No. New York rewards geographic focus, and two or three well-connected anchors in a day usually produce a richer experience than crossing the city repeatedly for a checklist."]
    ],
    tourism: "https://www.nyctourism.com/",
    subheadline: "Plan New York City by borough and neighborhood, keeping the strong landmark detail while eliminating repetitive machine-added itinerary padding."
  },

  "oregon/portland": {
    treatment: "surgical",
    overview: "Portland is a river city framed by the West Hills, the Willamette and Columbia rivers, and an unusually large network of parks, neighborhood commercial streets and bicycle routes. The existing guide already has strong destination-specific attraction descriptions, but synthetic appendages obscure that good material, so Phase III removes the machine padding rather than replacing the useful cores. A first visit works well when Washington Park and the West Hills form one block, downtown and the Pearl District another, and east-side neighborhoods a third. The Columbia River Gorge is a separate federally designated scenic landscape east of the city and should remain clearly identified as a regional day trip rather than being presented as a Portland neighborhood attraction.",
    highlights: [
      ["City and nature overlap", "Forest Park, Washington Park, riverfront paths and neighborhood greenways make outdoor access part of Portland's urban structure rather than a distant excursion."],
      ["Neighborhoods matter as much as downtown", "The Pearl, Alberta, east-side commercial streets and other districts each have distinct identities that reward walking instead of constant cross-city driving."],
      ["The Gorge is regional, not urban", "The Columbia River Gorge is one of Portland's most important nearby excursions, but it is a separate National Scenic Area east of the city and needs its own travel block."]
    ],
    seasons: [
      "Late spring through early fall offers the driest conditions for parks, cycling, neighborhood walking and Columbia Gorge excursions.",
      "Summer is generally warm and dry but can bring heat waves and wildfire smoke, especially later in the season, so air-quality checks matter for outdoor plans.",
      "Fall through spring is wetter, making gardens, bookstores, museums and food-oriented neighborhoods useful anchors while trails can be muddy or slippery."
    ],
    tips: [
      "Use MAX, streetcar, buses, walking and cycling for central districts before assuming every Portland day needs a car.",
      "Treat Washington Park as a multi-attraction district and choose a realistic subset instead of trying to rush every garden, museum and trail in one short visit.",
      "Check wildfire, air-quality, road and trail conditions before Columbia Gorge or other regional outdoor excursions.",
      "Keep the Columbia River Gorge geographically distinct from Portland itself even when using the city as the natural base for a day trip."
    ],
    faq: [
      ["How many days should I spend in Portland?", "Three days covers central neighborhoods, Washington Park or Forest Park, and an east-side or river-focused day; add a separate day for the Columbia River Gorge if it is a priority."],
      ["Can I explore Portland without a car?", "Yes for much of the city. Transit, walking and cycling cover many major districts, while a car or guided tour becomes more useful for the Gorge and farther regional landscapes."],
      ["Is the Columbia River Gorge inside Portland?", "No. It is a separate regional scenic area east of the city, close enough for a day trip but important enough to plan with its own driving, trail and condition checks."]
    ],
    tourism: "https://www.travelportland.com/",
    subheadline: "Explore Portland through parks, rivers and distinctive neighborhoods while keeping the strong existing attraction copy and removing synthetic padding."
  },

  "colorado/boulder": {
    treatment: "targeted",
    overview: "Boulder sits at the abrupt meeting of the Great Plains and Colorado's Front Range, which is why a walkable university city can transition into steep foothill trails within minutes. The existing guide already gets that identity right; Phase III expands it rather than replacing it. Chautauqua and the Flatirons remain the outdoor anchor, Pearl Street and Boulder Creek organize the urban core, and the University of Colorado adds museums, research and year-round activity. Flagstaff Mountain, the Mesa Laboratory and nearby state-park landscapes extend the story into the foothills. Altitude, intense sun, afternoon thunderstorms, winter ice and crowded trailheads matter throughout the year, so current conditions and realistic pacing are more useful than a generic mountain-town checklist.",
    highlights: [
      ["Plains meet mountains", "Boulder's geography changes abruptly at the foothills, putting major trails and rock formations almost directly against the city grid."],
      ["Outdoor access without leaving town", "Chautauqua, Boulder Creek and open-space trails provide real recreation close to downtown, while regional parks deserve separate planning."],
      ["University and research culture", "CU Boulder, museums and scientific institutions add a substantial intellectual and cultural layer to the city's outdoor reputation."]
    ],
    things: [
      ["Chautauqua and the Flatirons", "Chautauqua is Boulder's classic foothill starting point, where open meadows lead toward steep trails beneath the tilted sandstone Flatirons. Visitors can choose an easy scenic walk or a much more demanding climb, making route selection more important than simply checking the site off a list. The historic Chautauqua grounds also provide cultural and architectural context that is easy to miss when attention goes only to the trailheads. Parking fills quickly on popular days, so early arrival or local transit can make the entire outing calmer."],
      ["Pearl Street and downtown Boulder", "Pearl Street's pedestrian blocks form Boulder's most concentrated downtown district, with restaurants, independent shops, public art and street activity under frequent views toward the foothills. It works particularly well after a morning hike because visitors can shift into an unstructured meal, shopping or evening block without another major drive. Side streets extend the experience beyond the pedestrian mall into historic commercial and residential areas. Weekends and events can become crowded, so walking or transit is often easier than searching repeatedly for central parking."],
      ["Boulder Creek Path", "Boulder Creek and its adjacent multi-use path create a green east-west corridor through the city for walking and cycling. The route connects parks, university areas and downtown edges while offering a gentler outdoor option than the steep foothill trails nearby. Water levels rise during spring runoff, and summer storms can change creek conditions quickly, so recreation in or near the water deserves caution. Use the path as transportation as well as scenery when it fits the day's route, reducing short vehicle trips through the center of town."],
      ["University of Colorado Boulder", "The University of Colorado Boulder campus contributes museums, distinctive sandstone architecture, lawns and year-round academic activity immediately south of central Boulder. Walking the campus helps explain why the city feels different from a purely resort-oriented mountain town. Cultural and scientific collections can turn the campus into a substantial indoor stop when weather interrupts hiking plans. It connects easily with the Boulder Creek corridor and downtown, so combine these areas rather than treating the university as a remote excursion."],
      ["Flagstaff Mountain", "Flagstaff Mountain rises directly west of Boulder and provides overlooks, picnic areas and trail connections above the city. The winding access road gains elevation quickly, giving visitors a broad view over the plains while remaining close to town. Weather, snow, ice and seasonal restrictions can change road or trail conditions even when downtown streets seem clear. Avoid rushing the drive, and check current local guidance before relying on a particular overlook or parking area."],
      ["Museum of Boulder", "The Museum of Boulder focuses on the city's local history, communities, innovation and changing relationship with its Front Range setting. Its downtown location makes it easy to add historical context to a Pearl Street day without creating another transportation block. Rotating exhibitions mean the museum can address contemporary Boulder as well as older settlement and civic history. A visit is especially useful for travelers who want to understand how open-space policy, university growth and cultural change shaped the modern city rather than seeing Boulder only as a trailhead."],
      ["NCAR Mesa Laboratory", "The Mesa Laboratory of the National Center for Atmospheric Research occupies a striking I. M. Pei-designed complex against the foothills south of central Boulder. Public exhibits and surrounding paths connect atmospheric science with direct views of the landscape that researchers study. The site is reached by a separate road and sits above residential areas, so it works best as a deliberate foothill stop rather than a casual downtown walk. Access policies can change for research facilities, making a current visitor-information check worthwhile before going."],
      ["Eldorado Canyon State Park — a regional outing", "Eldorado Canyon State Park lies south of Boulder and protects a dramatic sandstone canyon known for climbing, hiking and views along South Boulder Creek. It is a separate Colorado state park rather than part of Boulder's municipal open-space system, so its parking, entry and reservation rules need to be treated independently. The narrow approach and limited parking can make peak periods difficult, while winter ice and summer storms change trail conditions quickly. Give the park a dedicated outdoor block instead of trying to squeeze it between downtown appointments."]
    ],
    seasons: [
      "Late spring through fall offers the broadest trail access, but spring mud and lingering snow can remain on shaded or higher routes.",
      "Summer favors early starts because strong sun, heat and afternoon thunderstorms can make exposed foothill trails uncomfortable or unsafe later in the day.",
      "Winter can provide excellent clear-weather walking, but snow and ice often require traction and more conservative route choices even when city streets are dry."
    ],
    tips: [
      "Acclimate to Boulder's elevation before pushing hard on steep trails, especially if arriving directly from near sea level.",
      "Carry water, sun protection and an extra layer because foothill conditions can change far faster than the downtown forecast suggests.",
      "Check City of Boulder Open Space and Mountain Parks plus any separate state-park guidance for closures, fire restrictions, wildlife rules and parking changes.",
      "Use walking, cycling or transit for the downtown–campus–creek corridor and save driving for foothill or regional destinations."
    ],
    faq: [
      ["How many days should I spend in Boulder?", "Two to three days works well for downtown, the university and creek corridor plus one or two substantial foothill outings."],
      ["Do I need a car in Boulder?", "Not for much of the central city, but a car, shuttle or tour is useful for Flagstaff Mountain, Eldorado Canyon and some trailheads."],
      ["Is Boulder suitable for beginner hikers?", "Yes, because the open-space network includes easy walks as well as steep routes, but altitude, weather and trail conditions should guide the choice rather than distance alone."]
    ],
    tourism: "https://www.bouldercoloradousa.com/",
    subheadline: "Explore Boulder through the Flatirons, creek paths, university culture and foothill science without losing sight of altitude and mountain conditions."
  },

  "california/napa": {
    treatment: "targeted",
    overview: "Napa is both an incorporated city on the Napa River and the southern urban gateway to the much larger Napa Valley wine region, and those two meanings should not be blurred. The existing guide had corrupted attraction titles and repetitive template prose, so Phase III replaces that broken material while preserving the page's tour bindings and destination identity. Downtown Napa, Oxbow Public Market, the riverfront and CIA at Copia form a compact city cluster, while nearby parks provide local outdoor time. Winery districts such as Carneros and the communities farther up-valley are regional excursions beyond central Napa. A strong itinerary therefore combines a walkable city day with deliberately planned valley travel instead of treating every winery, town and vineyard as if it sits downtown.",
    highlights: [
      ["City of Napa versus Napa Valley", "Downtown Napa is a real city with its own riverfront, markets and cultural sites, while the famous wine valley extends far beyond municipal boundaries."],
      ["Walkable urban core", "First Street, Oxbow Public Market, CIA at Copia and the Napa River can be combined without spending the day driving between distant wineries."],
      ["Wine-country travel needs pacing", "Carneros and up-valley destinations require realistic driving time, reservations and a transportation plan that does not depend on an impaired driver."]
    ],
    things: [
      ["Downtown Napa and First Street", "Downtown Napa centers on a walkable grid around First Street, Main Street and the Napa River, with restaurants, tasting rooms, shops, public art and restored historic buildings. It provides a useful counterweight to the common idea that a Napa trip must consist entirely of driving from winery to winery. Several major city attractions sit within an easy walk, so parking once and exploring on foot can simplify a first day. Evening is especially pleasant when visitors can move between dinner, the riverfront and downtown venues without another long transfer."],
      ["Oxbow Public Market", "Oxbow Public Market sits near the Napa River east of the main downtown grid and brings local food vendors, produce, specialty shops and casual dining into one compact hall. The market works best as part of a broader city walk because the riverfront and CIA at Copia are close by. It is especially useful for groups whose members want different foods without committing to a single restaurant reservation. Peak meal periods can be crowded, so arriving slightly before or after the busiest lunch window makes browsing easier."],
      ["Napa Riverfront", "The Napa River runs directly beside downtown, and the riverfront paths and bridges make it possible to understand the city's physical setting before heading into the wider valley. Flood-control and redevelopment projects have reshaped this edge over time, creating public spaces that now connect restaurants, parks and commercial streets. A river walk is easy to pair with Oxbow Public Market or First Street without moving a vehicle. Seasonal rain and heat affect comfort, so morning or evening can be preferable to the middle of a hot summer day."],
      ["CIA at Copia", "The Culinary Institute of America at Copia occupies a food and wine education campus near Oxbow Public Market and the Napa River. Classes, demonstrations, exhibitions and dining programs vary, but the site consistently adds culinary context to a destination too often described only through vineyard visits. Its location makes it one of the easiest substantial attractions to integrate into a car-light downtown day. Check the current calendar before visiting because public programming and reservation requirements change throughout the year."],
      ["Napa Valley Wine Train", "The Napa Valley Wine Train departs from Napa and travels north through the valley on a historic rail corridor, combining transportation, scenery and a structured visitor experience. It is useful for travelers who want to see more of the valley without personally driving between multiple stops. Different packages vary in duration and inclusions, so the rail experience should be chosen as a major block rather than squeezed between unrelated reservations. Advance booking is important during busy seasons, and travelers should verify the exact itinerary before assuming a particular winery or stop is included."],
      ["Westwood Hills Park", "Westwood Hills Park lies on the western side of Napa and provides local foothill trails with broad views over the city and surrounding valley. The outing is far more compact than a full wine-country drive, making it useful for travelers who want outdoor time before returning to downtown. Trails include elevation and exposed sections, so summer heat can make an otherwise modest walk much more demanding. Start early, carry water and respect posted trail or fire restrictions during dry conditions."],
      ["Skyline Wilderness Park", "Skyline Wilderness Park on the southeast side of Napa offers a larger network of hiking and mountain-biking routes through oak woodland, grassland and hill country. It provides a genuine outdoor destination close to the city without pretending that vineyard touring is the only landscape experience available. Routes vary in length and climbing, and dry-season heat can be significant on exposed slopes. Check current access, event and fire information before setting out, particularly if a longer trail day is planned."],
      ["Carneros and the wider Napa Valley — a regional wine-country day", "The Carneros district begins south and west of central Napa and extends across parts of Napa and Sonoma counties, while additional wine communities continue north through the valley. These are regional destinations rather than downtown Napa attractions, and visiting several producers can involve meaningful driving time and advance reservations. A guided tour, hired driver or other responsible transportation plan is the sensible choice when wine tasting is central to the day. Limit the number of stops so there is time to appreciate landscape, food and individual properties rather than turning the valley into a rushed sequence of appointments."]
    ],
    seasons: [
      "Spring brings green hills, mild temperatures and active vineyard growth, making it one of the easiest periods for combining town and outdoor plans.",
      "Late summer through fall is associated with harvest activity and heavy visitor demand, so lodging, restaurants and popular wine experiences often require earlier reservations.",
      "Winter is quieter and can be rainy, but downtown dining and indoor wine or culinary experiences remain strong while the valley landscape takes on a different character."
    ],
    tips: [
      "Keep the City of Napa and the larger Napa Valley geographically distinct when planning; St. Helena, Yountville, Calistoga and vineyard districts are not downtown neighborhoods.",
      "Use downtown walking for First Street, Oxbow, Copia and the riverfront before committing to a vehicle for valley excursions.",
      "Reserve high-demand winery, restaurant and rail experiences in advance, especially during harvest season and weekends.",
      "Arrange a sober driver, guided tour or other responsible transportation whenever wine tasting is a significant part of the itinerary."
    ],
    faq: [
      ["Is Napa the same thing as Napa Valley?", "No. Napa is an incorporated city at the southern end of the valley, while Napa Valley is a much larger geographic and wine region containing multiple towns and rural districts."],
      ["How many days should I spend in Napa?", "Two to three days allows a city-focused block, one carefully paced wine-country day and either another valley excursion or local outdoor time."],
      ["Do I need a car in downtown Napa?", "Not for the central city cluster, but a car, guided tour or hired transportation becomes useful for Carneros and destinations farther up the valley."]
    ],
    tourism: "https://www.visitnapavalley.com/",
    subheadline: "Explore the City of Napa on foot, then treat Carneros and the wider Napa Valley as deliberate regional wine-country excursions.",
    dropAbout: true
  },

  "florida/miami": {
    treatment: "targeted",
    overview: "Miami is a mainland South Florida city shaped by Biscayne Bay, migration from across the Caribbean and Latin America, global commerce, tropical architecture and sharply distinct neighborhoods. The existing guide already makes an important geographic correction by separating Miami from Miami Beach and nearby national parks; Phase III keeps that strength while adding depth. Little Havana, Wynwood, Downtown and Brickell, Coconut Grove and the bayfront each deserve their own context, while South Beach belongs to the separate City of Miami Beach. Everglades National Park is a major regional excursion rather than a city park. Heat, thunderstorms, cross-bay traffic and long metropolitan distances all make neighborhood clustering essential for a realistic Miami itinerary.",
    highlights: [
      ["A city shaped by migration", "Cuban, Caribbean, Latin American and global influences are central to Miami's food, music, neighborhoods and civic identity."],
      ["Biscayne Bay organizes the landscape", "Downtown, Brickell, Coconut Grove and cross-bay trips make more sense when the bay is treated as geography rather than background scenery."],
      ["Miami is not Miami Beach", "South Beach and the Art Deco district sit in a separate municipality, while the Everglades are a separate National Park Service landscape well beyond the city core."]
    ],
    things: [
      ["Little Havana and Calle Ocho", "Little Havana centers on Calle Ocho, where Cuban-American restaurants, bakeries, music, cigar businesses, murals and Máximo Gómez Park create one of Miami's most recognizable neighborhood districts. The area rewards walking because its cultural identity is spread across storefronts, public spaces and everyday street life rather than contained in one ticketed attraction. Food and music are central, but the neighborhood also reflects several generations of migration and political history. Visit with enough time to sit, eat and observe rather than treating Calle Ocho as a quick photograph between distant parts of the city."],
      ["Wynwood", "Wynwood developed from a warehouse and industrial district into a major center for murals, galleries, restaurants and creative businesses. Large-scale street art remains the visual signature, but the neighborhood changes quickly as new development arrives, making it useful to look beyond a single enclosed mural venue. The nearby Design District can be combined with Wynwood when interests and time allow, though they are distinct areas. Midday heat can be intense on exposed streets, so morning or later afternoon often works better for a longer walking circuit."],
      ["Vizcaya Museum and Gardens", "Vizcaya Museum and Gardens preserves an early twentieth-century estate on Biscayne Bay, combining elaborate interiors, European-influenced architecture, formal gardens and direct waterfront views. The site provides historical contrast to Miami's modern skyline and helps explain an earlier era of South Florida development and wealth. Both house and gardens deserve time, and outdoor sections can feel demanding during hot or humid weather. Vizcaya sits south of downtown near Coconut Grove, so pair those areas instead of returning across the city between visits."],
      ["Pérez Art Museum Miami and Museum Park", "Pérez Art Museum Miami stands on the bayfront in the central city with collections and exhibitions focused on modern and contemporary art, including strong connections to the Americas and Caribbean. Its shaded terraces and waterfront setting make the architecture and Biscayne Bay part of the visit rather than mere background. The neighboring Frost Science complex and Metromover access allow visitors to build a substantial museum block without moving a car. Check current exhibitions and ticketing before arrival because special programs can change the best way to allocate time."],
      ["Downtown, Brickell and the bayfront", "Downtown Miami and Brickell form the city's densest high-rise core along Biscayne Bay and the Miami River, mixing finance, government, residential towers, restaurants and cultural venues. Metromover provides a useful free circulation option through much of the core and can eliminate several short rideshare trips. Bayfront walks and bridges reveal the relationship between the skyline, river and port activity more clearly than driving through the district. Rush-hour congestion is substantial, so central transit and walking are often the better choice once you have arrived."],
      ["Coconut Grove", "Coconut Grove is one of Miami's oldest continuously settled neighborhoods, with a leafy street pattern, marinas, parks, restaurants and a strong relationship to Biscayne Bay. Its lower-rise character feels different from Brickell despite being only a few miles away, which makes it worth treating as its own district. The neighborhood pairs naturally with Vizcaya or other south-city stops and can provide a slower evening after a museum or sightseeing day. Waterfront access and events vary, so choose a few specific anchors rather than assuming every block faces the bay."],
      ["South Beach — in the separate City of Miami Beach", "South Beach lies across Biscayne Bay in the City of Miami Beach, not within the City of Miami, and that distinction matters for realistic routing. The Art Deco Historic District, Ocean Drive, Lummus Park and Atlantic beach create a dense visitor zone that can easily occupy half a day or more. Cross-bay traffic and parking can be frustrating, making transit, rideshare or a dedicated beach-day plan preferable to repeated crossings. Treat South Beach as a separate municipal destination while still recognizing that it is central to the broader Miami visitor experience."],
      ["Everglades National Park — a regional day trip", "Everglades National Park protects a vast subtropical wetland landscape west and south of the Miami metropolitan area and is not a Miami city park. Different entrances lead to very different experiences, from sawgrass wetlands and wildlife viewing to longer drives toward mangrove and coastal environments. Travel time, heat, mosquitoes, water levels and seasonal storms all affect what is practical, so a park visit deserves advance planning rather than a spare afternoon. Guided tours can simplify transportation and interpretation, but visitors should still check National Park Service conditions before departure."]
    ],
    seasons: [
      "Late fall through early spring generally brings lower humidity and the most comfortable conditions for neighborhood walking, outdoor dining and regional nature trips.",
      "Summer and early fall are hot, humid and thunderstorm-prone, with tropical-weather risk that can disrupt boating, beach plans and Everglades excursions.",
      "Winter is peak visitor season, so popular restaurants, boat trips, cultural events and Miami Beach lodging often benefit from earlier reservations."
    ],
    tips: [
      "Group Little Havana, Wynwood, the downtown–Brickell core, Coconut Grove and Miami Beach into sensible geographic blocks instead of crossing the metro repeatedly.",
      "Use Metromover and walking within the central core when practical; cross-bay and regional trips usually require separate transportation planning.",
      "Keep Miami Beach and Everglades National Park accurately labeled as separate destinations rather than neighborhoods or city parks within Miami.",
      "Use early mornings for exposed outdoor activity in the warm season and keep a museum or food-focused alternative available for afternoon thunderstorms."
    ],
    faq: [
      ["Is South Beach in the City of Miami?", "No. South Beach is in the separate City of Miami Beach across Biscayne Bay, although it is part of the broader Miami visitor region."],
      ["How many days should I spend in Miami?", "Three to four days allows meaningful time for several city neighborhoods and the bayfront, with an additional day if the Everglades or another major regional excursion is a priority."],
      ["Do I need a car in Miami?", "Not for every central-city day, but a car, rideshare or guided transfer is often useful for Miami Beach, the Everglades and other widely separated regional destinations."]
    ],
    tourism: "https://www.miamiandbeaches.com/",
    subheadline: "Explore Miami through Biscayne Bay and distinct mainland neighborhoods while keeping Miami Beach and the Everglades geographically accurate."
  }
};

const banned = [
  "one of the most valuable things to do",
  "article set",
  "lexical anchors",
  "validation and traceability",
  "generic checklist item",
  "build this stop into the day",
  "primary visitor circuit",
  "reserve at least ninety minutes on site",
  "coverage for",
];

const sentenceCount = (text: string) => (text.match(/[.!?](?:\s|$)/g) ?? []).length;
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const removeSyntheticSuffix = (description: string) => {
  const lower = description.toLowerCase();
  for (const marker of [" is part of the primary visitor circuit in ", " coverage for "]) {
    const index = lower.indexOf(marker);
    if (index < 0) continue;
    const previousSentence = description.lastIndexOf(". ", index);
    if (previousSentence >= 0) return description.slice(0, previousSentence + 1).trim();
  }
  return description.trim();
};

const effectiveThings = (guide: GuidePageData, e: CityEnhancement) =>
  e.things
    ? e.things.map(([title, description]) => ({ title, description }))
    : (guide.thingsToDo ?? []).map(item => ({
        ...item,
        description: removeSyntheticSuffix(item.description ?? ""),
      }));

const assertQuality = (key: string, guide: GuidePageData, e: CityEnhancement) => {
  if (wordCount(e.overview) < 80) throw new Error(`${key}: overview is below Phase III depth`);
  if (e.highlights.length < 3) throw new Error(`${key}: weak highlights coverage`);
  if (e.seasons.length < 3) throw new Error(`${key}: weak seasonal guidance`);
  if (e.tips.length < 4) throw new Error(`${key}: weak travel tips`);
  if (e.faq.length < 3) throw new Error(`${key}: weak FAQ coverage`);

  const things = effectiveThings(guide, e);
  if (things.length < 8) throw new Error(`${key}: fewer than eight Things to Do entries`);

  const descriptions = new Set<string>();
  for (const item of things) {
    const title = item.title ?? "Untitled";
    const description = item.description ?? "";
    if (sentenceCount(description) < 4) throw new Error(`${key}: ${title} has fewer than four substantive sentences`);
    if (description.length < 240) throw new Error(`${key}: ${title} description is too thin`);
    const lower = description.toLowerCase();
    if (banned.some(phrase => lower.includes(phrase))) throw new Error(`${key}: ${title} contains banned template prose`);
    if (descriptions.has(lower)) throw new Error(`${key}: duplicate attraction description`);
    descriptions.add(lower);
  }
};

export const enhancePhase3Engine6CityGuide = (
  stateSlug: string,
  citySlug: string,
  guide: GuidePageData
): GuidePageData => {
  const key = `${stateSlug}/${citySlug}`;
  const e = cities[key];
  if (!e) return guide;

  assertQuality(key, guide, e);
  const place = guide.city ?? citySlug;
  const state = guide.state ?? stateSlug;

  return {
    ...guide,
    hero: {
      ...guide.hero,
      alt: `${place}, ${state} travel guide`,
      subheadline: e.subheadline,
    },
    overview: [e.overview],
    highlights: e.highlights.map(([title, description]) => ({ title, description })),
    thingsToDo: effectiveThings(guide, e),
    bestTimeToVisit: {
      title: `When to visit ${place}`,
      bullets: e.seasons,
    },
    travelTips: e.tips,
    faq: e.faq.map(([q, a]) => ({ q, a })),
    seoLinks: {
      ...guide.seoLinks,
      officialTourism: e.tourism,
    },
    aboutCity: e.dropAbout ? undefined : guide.aboutCity,
  };
};
