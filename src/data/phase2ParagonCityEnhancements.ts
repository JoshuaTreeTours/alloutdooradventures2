import type { GuidePageData } from "../utils/loadGuide";

type CityEnhancement = {
  overview: string;
  highlights: [string, string][];
  things: [string, string][];
  seasons: string[];
  tips: string[];
  faq: [string, string][];
  tourism: string;
  subheadline: string;
};

export const PHASE2_PARAGON_CITY_KEYS = new Set([
  "wisconsin/milwaukee",
  "minnesota/minneapolis",
  "pennsylvania/pittsburgh",
  "maryland/baltimore",
  "georgia/atlanta",
  "michigan/detroit",
  "utah/salt-lake-city",
  "montana/bozeman",
  "montana/missoula",
]);

const cities: Record<string, CityEnhancement> = {
  "wisconsin/milwaukee": {
    overview: "Milwaukee is a Lake Michigan city whose strongest visitor story combines freshwater geography, immigration, brewing, industrial design, public markets, museums and a compact collection of walkable neighborhoods. Downtown, the Historic Third Ward, the lakefront and the Milwaukee River fit together naturally, while farther-flung residential districts deserve separate routing. The city is often reduced to beer and motorcycles, but that misses its major art institutions, architectural legacy, riverfront redevelopment and enduring Polish, German, Black, Latino and other community histories. A useful itinerary follows the water and street grid, then uses museums and neighborhood stops to explain how a manufacturing port became a modern Great Lakes cultural center.",
    highlights: [
      ["Great Lakes city", "Lake Michigan, the harbor and the Milwaukee River are not scenery around the city; they explain its transportation, industry, recreation and contemporary public spaces."],
      ["Industry transformed", "Breweries, factories and warehouses have been reused as museums, markets, housing and entertainment districts without erasing the city's working history."],
      ["Compact cultural core", "Several major museums, downtown landmarks and waterfront districts can be linked on foot or by short transit trips instead of repeated driving."]
    ],
    things: [
      ["Milwaukee Art Museum and the lakefront", "The Milwaukee Art Museum is one of the city's defining architectural and cultural landmarks, set directly on Lake Michigan beside the downtown waterfront. Its Quadracci Pavilion, designed by Santiago Calatrava, is famous for the movable Burke Brise Soleil, but the collections inside span far more than the building itself. Pair the museum with a lakefront walk so the relationship between architecture, harbor infrastructure and open water remains visible. Weather off Lake Michigan can change quickly, so even a museum-centered day benefits from an extra layer."],
      ["Historic Third Ward", "The Historic Third Ward is a former warehouse and wholesale district south of downtown that now concentrates galleries, restaurants, residences and design-oriented businesses in preserved industrial buildings. Its street grid and brick architecture make it one of Milwaukee's easiest districts to explore on foot. The neighborhood also connects naturally to the Milwaukee Public Market and the riverwalk system, so it should be treated as a coherent urban district rather than a single attraction. Spend enough time to notice the adaptive reuse that turned freight-era buildings into a contemporary mixed-use neighborhood."],
      ["Milwaukee Public Market", "Milwaukee Public Market sits at the edge of the Historic Third Ward and brings food vendors, specialty merchants and casual dining together in a compact indoor hall. It works best as part of a broader neighborhood walk rather than as a drive-in meal stop, because riverfront paths, galleries and historic warehouses are only minutes away. The market is especially useful in poor weather when visitors want local food without committing to a long sit-down meal. Busy lunch periods can feel crowded, so arriving earlier or later makes browsing easier."],
      ["Harley-Davidson Museum", "The Harley-Davidson Museum occupies a riverfront campus southwest of downtown and uses motorcycles, archival material and industrial design to tell a story that is closely tied to Milwaukee manufacturing. Even visitors who are not dedicated motorcycle enthusiasts can follow changes in engineering, branding, labor and American road culture through the exhibits. The museum sits outside the tightest downtown walking loop, so give it a distinct block of time instead of squeezing it between Third Ward stops. Its river setting also shows how former industrial land has been repurposed along Milwaukee's waterways."],
      ["Milwaukee RiverWalk", "The Milwaukee RiverWalk threads through downtown and adjoining districts beside the Milwaukee River, connecting restaurants, public art, bridges and historic commercial buildings. Walking a substantial segment reveals how the river once served industrial traffic and now functions as a civic promenade through the center of the city. The route changes character between downtown, the Third Ward and neighborhoods to the north, so choose a section that fits the rest of your day. Seasonal weather, river levels and construction can affect comfort or access along individual stretches."],
      ["Pabst Mansion and the brewing-era city", "The Pabst Mansion preserves the elaborate former home of brewer Frederick Pabst west of downtown and provides a domestic counterpoint to Milwaukee's surviving brewery complexes and industrial buildings. Interior tours connect craftsmanship and architecture with the wealth generated by the city's late-nineteenth-century brewing economy. The mansion is not in the same pedestrian cluster as the lakefront museums, so it pairs more logically with nearby Marquette-area or west-downtown stops. Use it to understand the social world behind the brewery names rather than merely adding another beer-related label to the itinerary."],
      ["Lakeshore State Park", "Lakeshore State Park occupies a small peninsula and connected trails beside Milwaukee's harbor, immediately east of downtown. The park offers skyline and Lake Michigan views, prairie plantings, fishing access and a route that ties into the broader lakefront path network. Its compact scale makes it an easy outdoor complement to nearby museums rather than an all-day wilderness destination. Wind exposure is significant, and conditions can feel much colder here than a few blocks inland during spring, fall and winter."],
      ["Mitchell Park Domes", "The Mitchell Park Horticultural Conservatory, commonly called the Domes, contains three large glass conservatory structures west of downtown with desert, tropical and rotating floral environments. The site is one of Milwaukee's most recognizable examples of mid-twentieth-century civic architecture as well as a year-round indoor garden destination. Because the conservatory is outside the central lakefront cluster, it deserves deliberate transportation planning. Check current operating information before visiting, since maintenance and restoration work can affect access to individual areas."]
    ],
    seasons: [
      "Late spring through early fall offers the easiest weather for lakefront walking, festivals and riverfront activity.",
      "Summer is Milwaukee's busiest outdoor season, with warm days but occasional storms and cooler conditions directly beside Lake Michigan.",
      "Winter is cold and snowy, making museums, markets and indoor cultural sites especially valuable while lakefront wind can be severe."
    ],
    tips: [
      "Group the lakefront museums, Third Ward, Public Market and downtown RiverWalk into one largely car-light day.",
      "Expect noticeably cooler and windier conditions beside Lake Michigan than inland neighborhoods.",
      "Use the Hop streetcar, buses and walking where practical before moving a car between central attractions.",
      "Treat Milwaukee's brewing and manufacturing history as part of a broader immigration, labor, design and Great Lakes story."
    ],
    faq: [
      ["How many days should I spend in Milwaukee?", "Two to three days gives time for the lakefront, downtown and Third Ward, one major museum block and at least one neighborhood or industrial-history stop."],
      ["Can I visit Milwaukee without a car?", "Yes for much of the central city. Walking, the Hop streetcar and buses work well downtown, while a car or rideshare becomes more useful for farther neighborhoods."],
      ["Is Milwaukee only a beer-focused destination?", "No. Brewing history matters, but the city also offers major art and design institutions, Great Lakes recreation, architecture, food markets and diverse neighborhood history."]
    ],
    tourism: "https://www.visitmilwaukee.org/",
    subheadline: "Explore Milwaukee through Lake Michigan, riverfront neighborhoods, industrial history, art and Great Lakes culture."
  },

  "minnesota/minneapolis": {
    overview: "Minneapolis is a Mississippi River city where waterfalls, flour-milling history, lakes, parks, modern art and neighborhood culture sit unusually close together. The strongest itinerary follows geography rather than generic city categories: St. Anthony Falls and the river explain the city's industrial origins, while the Chain of Lakes and extensive park system show why outdoor recreation is central to everyday life. Downtown and the riverfront are compact, but Uptown, the lakes and Minnehaha Falls require separate routing. A useful guide also treats Minneapolis and neighboring Saint Paul as distinct cities, even though visitors often combine the Twin Cities in one trip.",
    highlights: [
      ["River made the city", "St. Anthony Falls powered the milling economy, and the Mississippi riverfront remains the best place to connect industrial history with modern public space."],
      ["City of lakes and parks", "The Chain of Lakes, Minnehaha Creek and interconnected trails make outdoor recreation part of the urban fabric rather than a distant day trip."],
      ["Twin Cities, two cities", "Minneapolis and Saint Paul share a metropolitan area but have different histories, neighborhoods and attractions that should not be collapsed into one place."]
    ],
    things: [
      ["St. Anthony Falls and the Mississippi riverfront", "St. Anthony Falls is the only major natural waterfall on the Mississippi River and the geographic reason Minneapolis developed where it did. Waterpower supported sawmills and then flour mills, transforming the riverbanks into one of the country's most important industrial districts. Today bridges, paths, parks and preserved structures let visitors read that history while walking beside an active urban river. Start here early in a visit because the river explains far more about Minneapolis than a generic skyline tour can."],
      ["Stone Arch Bridge and Mill District", "The Stone Arch Bridge crosses the Mississippi beside the former milling district and provides one of the clearest views of St. Anthony Falls, downtown and surviving industrial buildings. Built for railroad traffic in the nineteenth century, the bridge has become a major pedestrian and cycling connection as the riverfront was reclaimed for public use. Nearby ruins, parks and museums make the crossing part of a larger historical landscape rather than a standalone photo stop. Check current bridge access because rehabilitation work can temporarily change pedestrian routing."],
      ["Mill City Museum", "Mill City Museum occupies the ruins and reconstructed portions of the Washburn A Mill complex beside the river. Exhibits explain how grain, waterpower, railroads and mechanized milling turned Minneapolis into a global flour-production center. The museum's location makes the surrounding historic district part of the interpretation, so combine indoor galleries with a riverfront walk before or afterward. Visitors interested in urban history should allow more time than the building's compact footprint suggests."],
      ["Minneapolis Institute of Art", "The Minneapolis Institute of Art holds a broad collection spanning ancient cultures, Asian art, European painting, African art, decorative arts and American works. General collection access is unusually approachable for a museum of its scale, making it easy to build a focused visit around several galleries instead of trying to consume everything. The museum sits south of downtown and pairs well with nearby neighborhoods rather than with a tightly scheduled riverfront loop. Check current special exhibitions if a particular artist or period matters to you."],
      ["Walker Art Center and Minneapolis Sculpture Garden", "The Walker Art Center is a major contemporary-art institution immediately beside the Minneapolis Sculpture Garden. Indoor galleries, performance programming and the outdoor garden create a flexible visit that can range from an hour to most of a day. The garden's famous Spoonbridge and Cherry is only one work among many, so the site rewards slower exploration beyond the signature photograph. From here, downtown and the lakes are both relatively close, making the museum a useful hinge between urban and outdoor itineraries."],
      ["Chain of Lakes", "Minneapolis's Chain of Lakes links Bde Maka Ska, Lake Harriet and other lakes through parkways, walking paths and cycling routes southwest of downtown. Beaches, paddling, sailing and neighborhood parks make this one of the best places to experience the city's everyday outdoor culture. The full system covers substantial distance, so visitors should choose one or two lakes or rent a bicycle rather than assuming it is a short stroll. Seasonal conditions matter greatly, with summer water use giving way to winter ice and snow recreation."],
      ["Minnehaha Regional Park", "Minnehaha Regional Park follows Minnehaha Creek toward the Mississippi and is best known for the 53-foot Minnehaha Falls. Trails, limestone bluffs and river connections make the park more substantial than a quick waterfall overlook, especially when water levels are strong. The falls can freeze dramatically in winter, while spring runoff and summer greenery create very different experiences. It lies south of central Minneapolis, so combine it with other south-city stops rather than repeatedly crossing downtown."],
      ["North Loop", "The North Loop is a former warehouse district northwest of downtown that now mixes preserved industrial buildings with restaurants, shops, residences and contemporary offices. Walking the neighborhood shows another phase of Minneapolis's economic history after the riverfront mills, with freight-era structures adapted rather than erased. It pairs naturally with Target Field, downtown or riverfront paths depending on the day's route. The district is most rewarding when treated as a neighborhood to walk and eat in rather than a single named attraction."]
    ],
    seasons: [
      "Late spring through early fall is ideal for lakes, cycling, riverfront walking and outdoor festivals.",
      "Summer can be warm and humid, with thunderstorms possible, but long daylight makes outdoor itineraries especially flexible.",
      "Winter is genuinely cold and snowy, yet museums, indoor culture and well-used winter trails make it a distinct season rather than a complete shutdown."
    ],
    tips: [
      "Use the Mississippi riverfront as the historical backbone of a first visit, then devote a separate block to the lakes and parks.",
      "Keep Minneapolis and Saint Paul geographically distinct even when planning a combined Twin Cities itinerary.",
      "Use Metro Transit, walking and cycling for many central and south-city routes before defaulting to a car.",
      "Dress for fast seasonal changes; lake and river exposure can amplify wind and cold."
    ],
    faq: [
      ["How many days should I spend in Minneapolis?", "Three days gives a strong first visit with river history, major museums, the lakes and one neighborhood-focused outing; add time if you also want Saint Paul."],
      ["Are Minneapolis and Saint Paul the same city?", "No. They are separate cities in the same metropolitan area, each with its own downtown, government, neighborhoods and cultural institutions."],
      ["Is Minneapolis good for outdoor travelers?", "Yes. Lakes, river trails, waterfalls, cycling infrastructure and a large park system make outdoor activity unusually accessible inside the city."]
    ],
    tourism: "https://www.minneapolis.org/",
    subheadline: "Explore Minneapolis through the Mississippi River, milling history, lakes, parks, art and distinct urban neighborhoods."
  },

  "pennsylvania/pittsburgh": {
    overview: "Pittsburgh is a city of three rivers, steep hills and tightly packed neighborhoods whose geography explains both its industrial rise and its modern character. The Monongahela and Allegheny meet at the Ohio River beneath downtown, while bridges, inclines and hillside streets connect districts that can feel surprisingly separate despite short map distances. A strong itinerary balances steel and labor history with major museums, contemporary art, food markets, parks and river trails. The city rewards geographic planning: downtown and the North Shore form one cluster, the Strip District another, and Oakland's universities and cultural institutions deserve a separate block.",
    highlights: [
      ["Three rivers, many neighborhoods", "Use rivers, bridges and hills to organize the city; Pittsburgh makes far more sense once its topography becomes part of the itinerary."],
      ["Industrial history without nostalgia", "Steel, immigration and labor shaped the city, but museums and reused riverfronts also show how Pittsburgh changed after heavy industry declined."],
      ["Cultural heavyweight", "Carnegie institutions, contemporary art and university districts give the city far more museum depth than its size might suggest."]
    ],
    things: [
      ["Point State Park", "Point State Park occupies the triangular tip of downtown where the Allegheny and Monongahela rivers meet to form the Ohio. The site includes remains and interpretation connected to Fort Pitt and earlier colonial conflict, but its broad lawns and fountain also make it the clearest place to understand Pittsburgh's river geography. Walk the river edges rather than stopping only at the fountain, because views toward bridges, stadiums and Mount Washington explain the surrounding city. The park connects naturally to downtown and riverfront trails."],
      ["Duquesne Incline and Mount Washington", "The Duquesne Incline climbs from the Monongahela riverfront to Mount Washington in a historic cable car, preserving a transportation system once essential to hillside neighborhoods. At the top, overlooks provide one of the best comprehensive views of downtown, the three rivers and Pittsburgh's dense bridge network. The experience works because the ride and the view explain the city's topography together. Evening can be especially striking, but check operating hours and transit connections before building a fixed schedule."],
      ["Carnegie Museum of Natural History and Carnegie Museum of Art", "The Carnegie museums in Oakland share a large cultural complex near major universities and can absorb most of a day for visitors interested in science and art. The natural history museum is especially known for dinosaur collections, while the art museum spans historic and contemporary work. Their shared location makes them efficient to combine, but trying to rush both reduces the value of each. Pair the museums with an Oakland walk instead of returning downtown between stops."],
      ["Phipps Conservatory and Botanical Gardens", "Phipps Conservatory sits in Schenley Park near the Oakland museum and university district, combining historic glasshouses with indoor gardens and rotating horticultural displays. The conservatory provides a strong year-round destination and an especially useful indoor break during winter or humid summer weather. Its setting in Schenley Park allows visitors to add outdoor walking without another cross-city transfer. Seasonal flower shows can materially change the experience, so current programming is worth checking in advance."],
      ["Strip District", "The Strip District follows a former produce, wholesale and industrial corridor northeast of downtown that now mixes food markets, specialty grocers, restaurants and converted warehouse space. Morning is the best time to see the district's market character before restaurants and nightlife become the dominant rhythm. Walking several blocks reveals layers of immigrant commerce and industrial reuse that are easy to miss from a car. The Strip pairs well with riverfront trails or a continuation toward Lawrenceville rather than a separate isolated visit."],
      ["Andy Warhol Museum", "The Andy Warhol Museum on the North Shore holds an extensive collection devoted to the Pittsburgh-born artist's life and work. Its galleries trace painting, printmaking, film, photography and archival material, giving much more context than the familiar celebrity portraits alone. The museum is close to the river, stadiums and downtown bridges, so it fits naturally into a North Shore walking day. Visitors interested in contemporary culture should allow enough time for the moving-image and archival material instead of treating the museum as a one-room pop-art stop."],
      ["Three Rivers Heritage Trail", "The Three Rivers Heritage Trail follows many miles of riverfront through Pittsburgh and neighboring communities, connecting parks, stadiums, bridges and former industrial sites. Walking or cycling even a short central segment shows how aggressively the city has reclaimed portions of its waterfront for public use. Trail conditions and construction can vary by section, so choose a route that matches the day's neighborhood plan. The trail is especially useful for linking downtown with the North Shore or South Side without losing sight of the rivers that organize the city."],
      ["Heinz History Center", "The Senator John Heinz History Center in the Strip District is the Smithsonian-affiliated regional history museum for western Pennsylvania. Exhibits cover industry, immigration, innovation, sports and everyday life, providing the context that makes many of Pittsburgh's neighborhoods and landmarks more meaningful afterward. Its location allows an easy combination with the Strip District rather than another transportation leg. Give the museum enough time to move beyond famous brands and teams into the region's labor, community and industrial history."]
    ],
    seasons: [
      "Spring and fall are especially comfortable for hill walks, river trails and neighborhood exploration.",
      "Summer can be warm and humid, but long evenings work well for inclines, baseball, riverfront activity and outdoor events.",
      "Winter is cold and often gray, making the city's museums, conservatory and indoor cultural institutions particularly valuable."
    ],
    tips: [
      "Plan by neighborhood and elevation; a short straight-line distance can involve a river crossing, steep hill or indirect street route.",
      "Use inclines, buses, light rail and walking where they fit instead of moving a car between every central district.",
      "Group Oakland museums together and keep the Strip District/North Shore/downtown clusters geographically coherent.",
      "Give riverfront trails real time in the itinerary because the three rivers are the key to understanding Pittsburgh's layout."
    ],
    faq: [
      ["How many days should I spend in Pittsburgh?", "Three days is enough for a strong first visit covering the rivers and inclines, Oakland museums, the Strip District and at least one neighborhood or trail block."],
      ["Do I need a car in Pittsburgh?", "Not for many central attractions, though hills and dispersed neighborhoods make transit or rideshare useful. A car is more helpful for suburban or regional excursions."],
      ["Why are Pittsburgh's inclines worth riding?", "They are historic transportation systems and one of the best ways to understand the steep topography that separates neighborhoods from the river valleys below."]
    ],
    tourism: "https://www.visitpittsburgh.com/",
    subheadline: "Explore Pittsburgh through its three rivers, hills, industrial history, major museums and tightly knit neighborhoods."
  },

  "maryland/baltimore": {
    overview: "Baltimore is a Chesapeake Bay port city whose strongest guide moves beyond the Inner Harbor to connect maritime history, Black history, immigration, rowhouse neighborhoods, major art museums and the working waterfront. The harbor remains an important orientation point, but Fells Point, Mount Vernon, Federal Hill and Fort McHenry each tell different parts of the city's story. A useful itinerary distinguishes Baltimore's urban attractions from broader Chesapeake destinations and groups sights by waterfront district rather than repeatedly crossing town. The city is compact enough for several car-light days when walking, buses, light rail and water-based transportation are used strategically.",
    highlights: [
      ["Working harbor, not just an attraction zone", "Baltimore's waterfront developed through shipping, shipbuilding and industry, and the best visits connect public promenades with that deeper maritime history."],
      ["Neighborhood history", "Fells Point, Mount Vernon and rowhouse districts reveal immigration, architecture and everyday city life beyond the visitor-oriented harbor core."],
      ["National stories", "Fort McHenry, major Black cultural institutions and internationally important art collections give Baltimore significance far beyond its metropolitan size."]
    ],
    things: [
      ["Inner Harbor and waterfront promenade", "Baltimore's Inner Harbor is the most recognizable visitor district and an effective orientation point for the city's waterfront geography. Promenades link museums, piers and neighborhoods while revealing how former industrial harbor edges were redeveloped for public use. The area is best treated as a connector rather than the entire destination, because some of Baltimore's strongest neighborhoods begin just beyond it. Walk toward Federal Hill or east toward Harbor East and Fells Point to see how the character changes along the water."],
      ["Fort McHenry National Monument and Historic Shrine", "Fort McHenry guards the Patapsco River approach to Baltimore and is nationally known for its role in the War of 1812, when the defense of the fort inspired Francis Scott Key's words that became the U.S. national anthem. National Park Service exhibits, ramparts and waterfront grounds provide much more context than the flag story alone. The fort sits southeast of the Inner Harbor and deserves a dedicated visit rather than a rushed add-on. Check current NPS hours, programs and transportation options before planning the day."],
      ["Fells Point", "Fells Point is a historic waterfront neighborhood east of the Inner Harbor with cobbled streets, rowhouses, former maritime buildings, restaurants and active nightlife. Its eighteenth- and nineteenth-century street pattern reflects Baltimore's long shipbuilding and port history, while later immigration added new layers to the district. Walking is essential because the neighborhood's scale and waterfront alleys are the attraction. Pair it with Harbor East or a longer waterfront route instead of treating it as a drive-by dining district."],
      ["National Aquarium", "The National Aquarium anchors the Inner Harbor with large aquatic exhibits focused on marine and freshwater ecosystems. Its multi-level design and popular timed entry can create crowding, so advance planning is worthwhile during weekends and school holidays. The aquarium is substantial enough to consume several hours and should not be stacked casually with multiple other major museums. Because it sits directly on the promenade, it combines easily with an outdoor harbor walk before or after the indoor visit."],
      ["American Visionary Art Museum", "The American Visionary Art Museum near Federal Hill focuses on self-taught and intuitive artists, presenting work that sits outside conventional academic art categories. Its playful exterior and unusual installations make it one of Baltimore's most distinctive museums, but the collections also invite serious attention to personal narrative and creative practice. The museum's location beside the harbor and Federal Hill Park makes a coherent south-waterfront block. Allow time for the galleries rather than reducing the stop to its colorful facade."],
      ["Walters Art Museum and Mount Vernon", "The Walters Art Museum in Mount Vernon holds a wide-ranging collection of ancient, medieval, Asian, European and decorative arts. The surrounding neighborhood adds nineteenth-century architecture, churches, cultural institutions and the Washington Monument, making the district a strong contrast with the harbor. Because the museum's permanent collection is broad, visitors should choose several areas of interest rather than attempting an exhaustive sweep. Walk the neighborhood before or after the museum so the visit includes the urban setting that supported Baltimore's cultural institutions."],
      ["Baltimore Museum of Art", "The Baltimore Museum of Art sits near Johns Hopkins University and is especially notable for its modern and contemporary holdings, including a major collection of works associated with Henri Matisse. The museum is north of the downtown harbor districts and therefore deserves its own routing rather than being squeezed between waterfront stops. Sculpture gardens and surrounding university areas add outdoor space to a museum-focused half day. Check current exhibitions because temporary shows can substantially change what deserves the most time."],
      ["Lexington Market and west-downtown food history", "Lexington Market has served central Baltimore for generations and remains an important place to encounter local food traditions and everyday city commerce. The renovated market hall sits west of the Inner Harbor and can be combined with nearby downtown institutions rather than treated as a suburban-style food destination. Use the visit to sample local specialties while also recognizing the market's role in the changing commercial geography of the city. Midday is lively, but busy periods reward patience and a willingness to browse before choosing a vendor."]
    ],
    seasons: [
      "Spring and fall are ideal for waterfront walking and neighborhood exploration with generally moderate temperatures.",
      "Summer is hot and humid, so museums and indoor attractions provide useful breaks from midday heat.",
      "Winter is colder and quieter, with fewer waterfront crowds but occasional snow or ice affecting walking conditions."
    ],
    tips: [
      "Use the waterfront promenade to connect the Inner Harbor, Federal Hill, Harbor East and Fells Point instead of viewing them as unrelated stops.",
      "Check National Park Service information before visiting Fort McHenry, especially for programs and seasonal hours.",
      "Group Mount Vernon and north-city museums separately from the harbor districts to reduce backtracking.",
      "Do not let the Inner Harbor stand in for the whole city; Baltimore's neighborhood history is essential to a worthwhile visit."
    ],
    faq: [
      ["How many days should I spend in Baltimore?", "Two to three days gives time for the harbor and Fort McHenry, one major art or cultural museum block, and at least one historic neighborhood."],
      ["Is Fort McHenry in Baltimore?", "Yes. It is within Baltimore but is a federally managed National Park Service site, so its visitor operations differ from ordinary city attractions."],
      ["Can I explore Baltimore without a car?", "Yes for many central districts. Walking, local transit and water-oriented routes work well around the harbor, while rideshare can help with more distant museums."]
    ],
    tourism: "https://baltimore.org/",
    subheadline: "Explore Baltimore through the Chesapeake waterfront, Fort McHenry, rowhouse neighborhoods, Black history and major museums."
  },

  "georgia/atlanta": {
    overview: "Atlanta is a fast-growing Piedmont city whose visitor story spans civil rights history, railroads, Black culture, major corporate institutions, universities, contemporary art and an expanding network of parks and trails. Its attractions are geographically dispersed, so a strong itinerary groups downtown, Sweet Auburn, Midtown and east-side neighborhoods rather than treating the city as a single walkable center. The Martin Luther King Jr. National Historical Park provides essential context, but Atlanta's identity also emerges through the BeltLine, historic neighborhoods, museums and public spaces. Traffic and heat can punish careless scheduling, making transit, walking segments and neighborhood-based days more effective than constant cross-city driving.",
    highlights: [
      ["Civil rights history in place", "Sweet Auburn and the Martin Luther King Jr. National Historical Park connect national civil rights history to the streets, churches and neighborhood institutions where it unfolded."],
      ["A city of neighborhoods", "Midtown, Old Fourth Ward, downtown and east-side districts have distinct identities and should be grouped rather than crossed repeatedly in traffic."],
      ["Rail city becoming trail city", "Atlanta's transportation history began with rail, while the BeltLine now reshapes how residents and visitors move between neighborhoods on foot and bicycle."]
    ],
    things: [
      ["Martin Luther King Jr. National Historical Park", "The Martin Luther King Jr. National Historical Park in the Sweet Auburn area preserves places associated with King's life, family, ministry and the wider civil rights movement. Sites include his birth home area, Ebenezer Baptist Church and interpretive facilities managed by the National Park Service. The value of the district comes from walking between real neighborhood locations rather than treating the experience as a single museum exhibit. Check current NPS tour access and reservation procedures because individual historic buildings may have limited capacity."],
      ["Atlanta BeltLine Eastside Trail", "The Atlanta BeltLine converts former rail corridors into a growing network of multiuse trails, parks and neighborhood connections. The Eastside Trail is one of the most developed sections, linking areas such as Old Fourth Ward, Poncey-Highland and Inman Park with public art, restaurants and green space. Walking or cycling it reveals contemporary Atlanta's redevelopment patterns more clearly than driving the same districts. Choose a manageable section and combine it with nearby neighborhood stops rather than trying to cover the entire BeltLine project in one outing."],
      ["Piedmont Park", "Piedmont Park is Atlanta's major central green space beside Midtown, with skyline views, lawns, trails, recreation facilities and connections to the BeltLine. The park's rolling terrain reflects the Piedmont landscape and provides a useful break from museums and dense commercial streets. It works naturally with the Atlanta Botanical Garden or Midtown cultural institutions instead of requiring a separate cross-city trip. Summer heat and humidity make mornings and evenings the most comfortable times for longer walks."],
      ["High Museum of Art", "The High Museum of Art anchors the Woodruff Arts Center in Midtown and holds collections ranging from American and European art to photography, decorative arts and contemporary work. Architecture by Richard Meier and later additions by Renzo Piano makes the building itself part of the visit. The museum is easily reached by MARTA and belongs in a Midtown cultural block with nearby parks and performance venues. Check special exhibitions in advance because they can materially affect how much time the museum deserves."],
      ["Atlanta History Center", "The Atlanta History Center in Buckhead uses exhibitions, historic houses, gardens and archival collections to examine the city's and region's past. Civil War interpretation, local communities, transportation, sports and everyday life broaden the story well beyond a single period. The campus is north of Midtown and downtown, so it should be given a dedicated half day rather than inserted between central attractions. Its outdoor areas also make weather an important factor in deciding how long to stay."],
      ["Oakland Cemetery", "Historic Oakland Cemetery east of downtown is both a burial ground and a landscaped record of Atlanta's nineteenth- and early-twentieth-century history. Monuments and sections associated with different communities reveal patterns of segregation, migration, wealth and civic memory. The grounds reward a guided or carefully interpreted walk because the history extends far beyond the names of famous residents. Pair the cemetery with nearby Grant Park or east-side neighborhoods to keep the day geographically coherent."],
      ["Ponce City Market and Old Fourth Ward", "Ponce City Market occupies the adapted former Sears, Roebuck complex on Ponce de Leon Avenue and connects directly to the BeltLine's Eastside Trail. Food, retail and rooftop attractions draw visitors, but the building is also a major example of industrial reuse in a rapidly changing neighborhood. Combine the market with a BeltLine walk and Old Fourth Ward stops rather than driving there only for a meal. Peak evenings and weekends can be crowded, so earlier visits offer more room to appreciate the structure and surrounding district."],
      ["National Center for Civil and Human Rights", "The National Center for Civil and Human Rights in downtown Atlanta connects the American civil rights movement with broader human-rights themes through immersive exhibitions and archival material. Its location near Centennial Olympic Park and other downtown attractions makes it easy to include in a central-city day without another long transfer. The subject matter deserves enough time for reflection, so avoid stacking it between several high-energy attractions on a rushed schedule. Check current exhibition and ticket information before visiting."]
    ],
    seasons: [
      "Spring and fall generally offer the most comfortable weather for BeltLine walks, parks and neighborhood exploration.",
      "Summer is hot and humid with frequent thunderstorms, so outdoor activity works best earlier or later in the day.",
      "Winter is usually mild by northern U.S. standards but can include cold snaps and occasional disruptive ice."
    ],
    tips: [
      "Group downtown, Sweet Auburn, Midtown and east-side BeltLine neighborhoods into separate geographic blocks.",
      "Use MARTA where routes fit, especially for airport, downtown and Midtown travel, to reduce time lost in traffic and parking.",
      "Check National Park Service access rules for MLK historic buildings before relying on a specific timed tour.",
      "Treat summer heat and afternoon storms as real scheduling constraints for parks and the BeltLine."
    ],
    faq: [
      ["How many days should I spend in Atlanta?", "Three days gives a useful first visit with civil rights history, Midtown culture, the BeltLine and one deeper neighborhood or history-center day."],
      ["Can I visit Atlanta without a car?", "Yes for a well-planned central itinerary using MARTA, walking and rideshare, though a car can become useful for farther-flung neighborhoods and regional excursions."],
      ["Is the Martin Luther King Jr. site a city museum?", "No. The core historic sites are part of a National Park Service unit within Atlanta, so federal visitor procedures can apply."]
    ],
    tourism: "https://discoveratlanta.com/",
    subheadline: "Explore Atlanta through civil rights history, the BeltLine, major museums, Piedmont parks and distinct urban neighborhoods."
  },

  "michigan/detroit": {
    overview: "Detroit is a Detroit River city whose strongest visitor story connects automobile manufacturing, Black music, architecture, labor, immigration, art and one of the most consequential industrial histories in the United States. Downtown and the riverfront form a useful starting cluster, while Midtown, Eastern Market, Corktown and Belle Isle deserve separate blocks. The city should not be reduced to either decline narratives or automotive nostalgia; its museums, restored buildings, neighborhoods and public spaces show continuous reinvention alongside difficult economic history. A good guide also keeps regional attractions such as The Henry Ford in Dearborn geographically distinct from Detroit itself.",
    highlights: [
      ["Industry changed the world", "Automobiles and mass production transformed Detroit, but labor, migration and design are essential parts of that story rather than background details."],
      ["Music and Black cultural history", "Motown and other musical traditions grew from neighborhoods and institutions that make Detroit central to twentieth-century American culture."],
      ["Riverfront metropolis", "The Detroit River, Belle Isle and international views toward Windsor make the city's border geography visible throughout a visit."]
    ],
    things: [
      ["Detroit Institute of Arts", "The Detroit Institute of Arts in Midtown holds one of the country's major art collections, spanning ancient cultures, European painting, African art, American work and much more. Diego Rivera's Detroit Industry murals are especially important because they turn the museum's central court into a monumental interpretation of factories, workers and modern production. The museum deserves several focused hours rather than a hurried visit to one famous room. Pair it with other Midtown institutions so the cultural district becomes a coherent part of the day."],
      ["Motown Museum", "The Motown Museum preserves the house and studio complex known as Hitsville U.S.A., where Berry Gordy built the record company that transformed American popular music. Small studio spaces and artifacts make the scale of the operation surprisingly tangible compared with Motown's enormous cultural influence. Timed tickets can be in high demand, so reservations are important. The museum is northwest of downtown and should be grouped with a Midtown or New Center day rather than inserted between riverfront stops."],
      ["Detroit RiverWalk", "The Detroit RiverWalk follows the city's international riverfront with paths, parks, public art and views across to Windsor, Ontario. Walking selected segments reveals Detroit as a border city and working Great Lakes transportation hub rather than an inland industrial metropolis. The riverfront has been steadily redeveloped for public access, creating connections between downtown, plazas and green spaces. Wind off the river can change comfort quickly, especially outside summer, so dress for conditions that may differ from inland streets."],
      ["Eastern Market", "Eastern Market is a large historic market district northeast of downtown where food wholesalers, farmers, restaurants, murals and small businesses occupy a broad collection of sheds and commercial streets. Market days offer the fullest experience, but the neighborhood remains worth exploring at other times for public art and food. Its scale is larger than a single indoor market hall, so comfortable shoes and a clear plan help. Pair it with nearby neighborhoods rather than treating it as a quick grocery stop on the way elsewhere."],
      ["Belle Isle Park", "Belle Isle is a large island park in the Detroit River between Detroit and Windsor, with trails, waterfront views, historic structures, gardens and cultural facilities. The island's position makes the international border and river system impossible to miss, while broad open spaces offer a different pace from downtown. Because park operations and vehicle-entry requirements can change, check current Michigan state park information before visiting. Give Belle Isle its own half-day block if you want more than a brief skyline photograph."],
      ["Guardian Building and downtown architecture", "The Guardian Building is one of downtown Detroit's great architectural landmarks, known for colorful tile, geometric ornament and a dramatic interior associated with the city's Art Deco era. A visit works best as part of a broader downtown architecture walk that also considers skyscrapers, civic buildings and restored commercial landmarks. Public access can depend on building operations, so current entry conditions should be checked. Looking closely at interiors and materials helps counter the tendency to see Detroit architecture only through abandoned-building imagery."],
      ["Corktown and Michigan Central", "Corktown is one of Detroit's oldest neighborhoods and has long been associated with immigrant settlement, residential streets and the Michigan Avenue corridor. The restoration and redevelopment of Michigan Central Station has transformed a structure once used as a symbol of decline into a major contemporary landmark. Walking the area reveals both historic housing and rapid reinvestment, which makes the neighborhood more informative than a single before-and-after photograph. Combine it with nearby southwest Detroit destinations rather than bouncing back to Midtown between stops."],
      ["The Henry Ford in Dearborn as a regional excursion", "The Henry Ford museum complex and Greenfield Village are in Dearborn, not Detroit, and should be planned as a separate regional day. The collections examine transportation, manufacturing, technology and American social history on a scale that can absorb many hours. Its automotive relevance makes it an obvious complement to Detroit, but geographic accuracy matters when estimating travel time and describing the destination. Allow most of a day if you want to experience both the indoor museum and the outdoor village rather than rushing through highlights."]
    ],
    seasons: [
      "Late spring through early fall offers the easiest weather for riverfront walking, Belle Isle and neighborhood exploration.",
      "Summer is warm and active with major festivals and outdoor events, while humidity and thunderstorms remain possible.",
      "Winter is cold and snowy, making museums, music history and architecture-focused days especially useful."
    ],
    tips: [
      "Group downtown and riverfront attractions separately from Midtown, Eastern Market and Corktown to reduce unnecessary driving.",
      "Reserve Motown Museum tickets ahead when possible because capacity can be limited.",
      "Keep Dearborn attractions such as The Henry Ford geographically distinct from Detroit proper.",
      "Use the People Mover, QLINE, buses, walking and rideshare selectively where they make central routes easier."
    ],
    faq: [
      ["How many days should I spend in Detroit?", "Three days allows time for downtown and the riverfront, Midtown museums and music history, plus a neighborhood or Belle Isle day; add another day for Dearborn."],
      ["Is The Henry Ford in Detroit?", "No. The Henry Ford is in neighboring Dearborn and should be planned as a separate regional excursion."],
      ["What is the best way to understand Detroit's automotive history?", "Combine industrial and design interpretation in Detroit with a dedicated Dearborn visit, while also including labor, migration and Black cultural history rather than focusing only on car brands."]
    ],
    tourism: "https://visitdetroit.com/",
    subheadline: "Explore Detroit through the riverfront, automotive and labor history, Motown, major art and neighborhood reinvention."
  },

  "utah/salt-lake-city": {
    overview: "Salt Lake City sits on the floor of the Salt Lake Valley between the Wasatch Mountains and the Great Salt Lake, giving the city an unusually visible relationship between urban streets, mountain terrain and a vast saline lake. Its history is strongly tied to Latter-day Saint settlement and institutions, but a complete guide also includes state government, natural history, university culture, trails, gardens and the wider ecology of the Great Basin. Downtown is relatively compact, while mountain trailheads and Great Salt Lake destinations require separate transportation. A strong itinerary keeps Salt Lake City attractions distinct from Antelope Island, ski resorts and other regional destinations even when they are marketed from the city.",
    highlights: [
      ["Mountain-and-basin geography", "The Wasatch Front and Great Salt Lake explain the city's climate, views, recreation and environmental challenges better than any generic downtown description."],
      ["Religious and civic history", "Temple Square is important, but state institutions, museums and neighborhoods provide a broader account of the city and Utah."],
      ["Outdoor access with real distances", "Foothill trails begin close to town, while Antelope Island and ski areas are separate regional trips that need honest drive-time planning."]
    ],
    things: [
      ["Temple Square and the downtown historic core", "Temple Square is the historic center of the Church of Jesus Christ of Latter-day Saints and one of Salt Lake City's defining landmarks. The surrounding blocks include religious, civic and commercial institutions that help explain the nineteenth-century settlement pattern of the city. Major construction and restoration projects can affect access to buildings and plazas, so current visitor information matters more here than an old static guide. Pair the area with a broader downtown walk rather than treating one religious site as the entire story of Salt Lake City."],
      ["Natural History Museum of Utah", "The Natural History Museum of Utah sits in the foothills above the University of Utah and interprets geology, paleontology, archaeology, biology and Indigenous cultures across the region. Its location is especially appropriate because large windows and terraces connect museum exhibits to the Basin and Range landscape outside. Dinosaur and fossil collections are major draws, but the broader galleries explain the environmental systems travelers encounter throughout Utah. The museum pairs naturally with Red Butte Garden and university-area stops rather than a return to downtown between visits."],
      ["Utah State Capitol", "The Utah State Capitol crowns Capitol Hill north of downtown and offers architecture, public-history exhibits and broad views across the Salt Lake Valley. Walking the grounds helps visitors understand the city's street grid and mountain setting while adding a state-government perspective that differs from nearby religious institutions. Interior access and tours depend on government schedules and events, so check current information. The Capitol can be combined with nearby historic districts or a downhill walk toward downtown when weather is comfortable."],
      ["Red Butte Garden", "Red Butte Garden is a botanical garden and natural area in the foothills beside the University of Utah. Cultivated gardens transition into trails and native landscapes, making the site a useful bridge between urban cultural attractions and the Wasatch foothills. Seasonal blooms and summer events change the experience substantially over the year. Combine it with the Natural History Museum for an efficient east-side day, and carry water because elevation and dry air can make even moderate walking feel more demanding."],
      ["Liberty Park and Tracy Aviary", "Liberty Park is one of Salt Lake City's major urban parks, with broad lawns, walking paths and recreational areas south of downtown. Tracy Aviary within the park adds a concentrated collection of birds and conservation-oriented programming, making the park more than a generic green-space stop. The combination works well for families or for travelers who want a slower half day between museums and mountain outings. Summer shade is valuable, while winter conditions can alter the amount of time you want to spend outdoors."],
      ["Bonneville Shoreline Trail", "The Bonneville Shoreline Trail follows benches and foothills that roughly trace ancient Lake Bonneville shorelines above the Salt Lake Valley. Access points near the city provide hiking, running and cycling with broad views over downtown and the Great Salt Lake basin. The route is exposed and can be hot in summer, muddy in spring or snowy in winter, so current trail conditions matter. Choose a short segment suited to your fitness and daylight rather than treating the entire regional trail system as one city walk."],
      ["Great Salt Lake and Antelope Island State Park", "Antelope Island State Park lies northwest of Salt Lake City within the Great Salt Lake and is a separate Utah state park rather than an urban attraction. The island offers shoreline views, wildlife, trails and one of the clearest places to experience the lake's immense scale. Water levels, insects, heat and seasonal conditions can materially affect a visit, so check current state park information before driving out. Give the island most of a day instead of presenting it as a quick downtown detour."],
      ["City Creek Canyon and Memory Grove", "Memory Grove and the lower City Creek corridor begin close to downtown and provide a transition from civic monuments into foothill greenery. Paths and roads follow the canyon northward, giving walkers and cyclists a convenient taste of the Wasatch Front without a long drive. Access rules can vary for vehicles and bicycles farther into the canyon, so current local guidance is useful. The area pairs well with Capitol Hill and makes a strong outdoor counterpoint to downtown architecture and museums."]
    ],
    seasons: [
      "Spring and fall provide comfortable city walking and foothill hiking, though spring mud and rapidly changing mountain weather are possible.",
      "Summer is hot, sunny and dry in the valley; early starts, water and sun protection are essential for exposed trails and Great Salt Lake trips.",
      "Winter brings snow to the valley and major snowfall to the nearby Wasatch, making ski access important while some hiking routes become icy or snow-covered."
    ],
    tips: [
      "Check current Temple Square construction and access information before relying on specific building interiors.",
      "Treat Antelope Island, ski resorts and higher mountain destinations as separate regional excursions rather than Salt Lake City attractions.",
      "Carry water and sun protection year-round in the dry, high-elevation environment, especially on exposed foothill trails.",
      "Use TRAX and buses for many central routes, including airport-to-downtown travel, before defaulting to a car."
    ],
    faq: [
      ["How many days should I spend in Salt Lake City?", "Three days gives time for downtown and civic history, east-side museums and gardens, plus one foothill or Great Salt Lake outing; add time for ski or mountain excursions."],
      ["Is Antelope Island in Salt Lake City?", "No. Antelope Island State Park is a separate regional destination in the Great Salt Lake and requires its own drive and planning."],
      ["Do I need a car?", "Not for much of downtown and the university corridor, where transit works well. A car becomes useful for Antelope Island, many trailheads and mountain destinations."]
    ],
    tourism: "https://www.visitsaltlake.com/",
    subheadline: "Explore Salt Lake City through Wasatch geography, civic and religious history, natural science, foothill trails and the Great Salt Lake."
  },

  "montana/bozeman": {
    overview: "Bozeman is a university town in Montana's Gallatin Valley where a lively historic center sits within sight of mountain ranges and unusually rich paleontological, geological and outdoor resources. It is often marketed as a gateway to Yellowstone, but Yellowstone National Park is far enough away that treating it as a Bozeman attraction creates poor planning. The city itself offers major museums, local trails, university culture and a walkable downtown, while Hyalite Canyon, the Gallatin River and Bridger Mountains are separate regional outings. Seasonal snow, wildfire smoke, river conditions and rapidly changing mountain weather strongly influence what is practical outdoors.",
    highlights: [
      ["More than a gateway", "Bozeman has enough museums, downtown life and local recreation to deserve attention before the itinerary expands toward Yellowstone or distant mountain destinations."],
      ["Science meets landscape", "Museum of the Rockies and the surrounding geology make fossils, tectonics and Rocky Mountain ecology unusually accessible to visitors."],
      ["Outdoor planning matters", "Snow, runoff, wildfire smoke and mountain weather can change trail and river plans quickly, so current conditions matter more than a generic seasonal paragraph."]
    ],
    things: [
      ["Museum of the Rockies", "Museum of the Rockies at Montana State University is one of Bozeman's essential institutions, with major dinosaur and paleontology collections alongside exhibits on regional history and science. Its fossil holdings are especially relevant because Montana's sedimentary rocks preserve some of North America's most important dinosaur sites. The museum is substantial enough to deserve several hours and provides useful context before road trips through the surrounding region. Pair it with university-area stops instead of rushing back downtown between attractions."],
      ["Downtown Bozeman and Main Street", "Downtown Bozeman centers on Main Street, where historic commercial buildings now hold restaurants, shops, galleries and local businesses. Walking several blocks reveals a genuine small-city center rather than a purpose-built resort village, and the district remains active beyond peak visitor season. Historic architecture and mountain views help connect the city's agricultural and railroad-era past with its modern tourism and technology economy. Evening is a good time to return after outdoor activities because most of the central district can be explored on foot."],
      ["Gallatin History Museum", "The Gallatin History Museum occupies the former county jail downtown and interprets local settlement, transportation, agriculture and community history. Its scale is modest compared with Museum of the Rockies, but it provides more direct context for Bozeman and Gallatin County itself. A visit works naturally with a downtown walking day and helps prevent regional history from being reduced to Yellowstone narratives. Check current hours because smaller local museums may operate on more limited schedules than major attractions."],
      ["Montana State University campus and arboretum", "Montana State University shapes Bozeman's identity as a year-round college town and research center. Walking the campus and the Montana Arboretum and Gardens provides a quieter look at regional plants, academic life and the city's relationship with science and agriculture. The campus sits south of downtown and pairs naturally with Museum of the Rockies. Seasonal weather determines how much outdoor time is comfortable, but even a short walk adds context to a city increasingly known for both recreation and research."],
      ["Drinking Horse Mountain and local foothill trails", "Drinking Horse Mountain is a popular trail area close to Bozeman that climbs through foothill terrain to broad views over the Gallatin Valley and Bridger Range. The outing provides a real mountain hike without committing to a full-day drive, but elevation gain and exposed sections make conditions important. Snow, mud and summer heat can all change the character of the trail, so check local reports before starting. Arrive early during busy periods because close-to-town trailheads can fill quickly."],
      ["Hyalite Canyon", "Hyalite Canyon lies south of Bozeman in the Custer Gallatin National Forest and offers a reservoir, waterfalls, trails and mountain access in a dramatic glaciated landscape. It is outside the city and deserves its own half-day or full-day block, especially when road conditions or snow slow travel. Hiking choices range widely in difficulty, and winter changes the canyon into a snow-recreation destination. Check Forest Service conditions, fire restrictions and seasonal access rather than assuming the road and trails are always equally available."],
      ["Gallatin River", "The Gallatin River flows through the valley southwest of Bozeman and supports fishing, rafting and scenic recreation under conditions that vary strongly with runoff and season. Guided trips can help visitors understand access, safety and local regulations, especially when water levels are high or cold. The river is a regional landscape rather than a downtown attraction, so driving and activity time need to be included honestly. Wildlife, weather and water temperature all deserve respect even on warm summer days."],
      ["Bridger Bowl and the Bridger Mountains", "Bridger Bowl ski area and the surrounding Bridger Mountains lie northeast of Bozeman and provide winter skiing plus summer access to mountain scenery when conditions allow. The area is separate from the city, and travel time grows when snow or event traffic is present. In winter, road conditions and avalanche awareness become important considerations for broader backcountry plans. Treat the mountains as a dedicated regional outing rather than an item to squeeze between downtown museums."]
    ],
    seasons: [
      "Summer offers broad trail and river access but also peak visitor demand, thunderstorms and possible wildfire smoke.",
      "Fall brings cooler weather and beautiful valley conditions, with the possibility of early snow at higher elevations.",
      "Winter centers on skiing and snow recreation, while spring can bring mud, lingering snow and high river runoff."
    ],
    tips: [
      "Do not label Yellowstone National Park as a Bozeman attraction; it is a major regional destination requiring substantial travel time.",
      "Check Forest Service, weather, smoke, river and road conditions before committing to mountain or water outings.",
      "Use downtown walking for the central city and save driving for trailheads and regional landscapes.",
      "Build altitude, sun exposure and cold water into outdoor planning even when the weather feels mild in town."
    ],
    faq: [
      ["How many days should I spend in Bozeman?", "Three days allows time for downtown and Museum of the Rockies, one local trail or university block, and one larger regional outing such as Hyalite Canyon or the Gallatin River."],
      ["Is Yellowstone National Park in Bozeman?", "No. Bozeman is a gateway for some Yellowstone trips, but the park is a separate National Park Service destination requiring significant driving time."],
      ["Do I need a car?", "Downtown is walkable, but a car or guided tour is useful for most mountain, river and national-forest outings around the Gallatin Valley."]
    ],
    tourism: "https://visitbozeman.com/",
    subheadline: "Explore Bozeman through fossils, university culture, a walkable downtown and carefully planned Gallatin Valley mountain outings."
  },

  "montana/missoula": {
    overview: "Missoula sits where several mountain valleys meet along the Clark Fork River in western Montana, giving the city a strong relationship with rivers, forests, university life and regional conservation history. Downtown, the riverfront and the University of Montana are close enough to combine without constant driving, while national-forest trailheads and other regional sites deserve separate planning. Missoula is not simply a gateway to somewhere else: museums, markets, public art, local trails and a strong literary and music culture make the city itself worth time. Wildfire smoke, winter snow, spring runoff and fast-changing mountain weather materially affect outdoor plans throughout the year.",
    highlights: [
      ["River city in a mountain valley", "The Clark Fork and surrounding ridges organize Missoula's geography and explain much of its recreation, transportation and sense of place."],
      ["University and community culture", "The University of Montana, downtown institutions, markets and arts venues give Missoula a civic life that is distinct from its role as an outdoor base."],
      ["Easy local outdoors, bigger regional outings", "River paths and Mount Sentinel begin near town, while Rattlesnake and forest destinations require more deliberate trail and condition planning."]
    ],
    things: [
      ["Clark Fork Riverfront and downtown trail system", "The Clark Fork River runs directly through Missoula and is bordered by paths, parks, bridges and recreation areas that tie downtown to the university district. Walking or cycling the riverfront is the simplest way to understand the city's geography without needing a car. The route passes both quiet green space and active urban edges, showing how closely recreation and everyday transportation overlap. Spring runoff can make the river powerful and cold, so admire the water with the same respect you would give a more remote mountain river."],
      ["Caras Park and downtown Missoula", "Caras Park sits beside the Clark Fork near the heart of downtown and hosts markets, festivals, performances and community events throughout the warmer months. Nearby streets contain local restaurants, shops, galleries and historic commercial buildings, making the park a useful anchor for a broader downtown walk. The adjacent carousel and riverfront paths add family-friendly options without another transportation leg. Check the event calendar because a quiet weekday park and a festival weekend can feel like entirely different places."],
      ["University of Montana and Mount Sentinel", "The University of Montana campus lies just east of downtown beneath Mount Sentinel, whose large hillside 'M' is visible from much of the valley. Trails climb steeply from near campus to the M and higher viewpoints, providing immediate elevation and broad views without leaving the city. The climb is short in distance but demanding in grade and exposure, especially on hot afternoons. Combine the hike with a campus walk so the outing connects Missoula's university identity with its mountain setting."],
      ["Missoula Art Museum", "The Missoula Art Museum focuses on contemporary art with strong attention to artists and communities of the American West and Montana. Its downtown location makes it easy to include between riverfront and commercial-district stops rather than treating art as a separate suburban excursion. Rotating exhibitions mean the experience changes substantially through the year. The museum is compact enough for a focused visit but significant enough to add cultural depth to an itinerary otherwise dominated by trails and rivers."],
      ["Historical Museum at Fort Missoula", "The Historical Museum at Fort Missoula occupies part of a former military post southwest of the city center and interprets military, community and regional history across multiple historic structures. The site includes stories connected to western expansion, Indigenous displacement, immigration and later uses of the fort, which deserve more context than a simple collection of old buildings. Outdoor components make weather relevant to the visit. Because the museum lies away from downtown, combine it with nearby south-side stops rather than crossing the city repeatedly."],
      ["Montana Natural History Center", "The Montana Natural History Center provides exhibits and educational programs focused on the ecology and geology of western Montana. It is especially useful before hiking because it gives names and context to the plants, animals, rocks and landscapes visitors will encounter outside town. The center's scale is modest, so it pairs naturally with another central-city activity rather than consuming an entire day. Families and geology-minded travelers can use it as an interpretive starting point for the larger Missoula valley."],
      ["Rattlesnake National Recreation Area", "The Rattlesnake National Recreation Area lies north of Missoula and provides trail access into forested foothills and mountain terrain. It is managed as public land outside the central city, so trail conditions, wildlife, fire restrictions and seasonal closures deserve attention. Routes vary from easy lower-corridor walks to much longer backcountry outings, making it important to choose a realistic distance. Treat the area as a dedicated outdoor block rather than assuming proximity to town makes every hike casual."],
      ["Smokejumper Visitor Center and aerial-firefighting history", "Missoula has long been associated with smokejumping and wildland-fire management, and the Smokejumper Visitor Center near the airport interprets the specialized work of firefighters who parachute into remote areas. Exhibits and tours, when available, connect aviation, forest management and wildfire history to a region where fire remains a major environmental force. The center is outside the downtown walking core and has seasonal or operational constraints, so verify current public access before going. It adds a distinctive regional story that complements rather than duplicates Missoula's museums and trails."]
    ],
    seasons: [
      "Late spring through early fall supports the broadest trail, river and event schedule, but summer can bring heat, thunderstorms and wildfire smoke.",
      "Fall is cooler and often excellent for hiking, though early snow can arrive in surrounding mountains.",
      "Winter is cold and snowy with active skiing and winter recreation, while spring runoff can make rivers high, cold and dangerous."
    ],
    tips: [
      "Use the Clark Fork paths to connect downtown and the university before driving to outer trailheads.",
      "Check air-quality, wildfire, trail and river conditions during summer and early fall.",
      "Do not underestimate short local hikes such as Mount Sentinel; steep grades, sun and winter ice can make them demanding.",
      "Treat national-forest outings as real mountain trips with water, layers and current-condition checks even when trailheads are close to town."
    ],
    faq: [
      ["How many days should I spend in Missoula?", "Two to three days gives time for downtown and the river, university and local trails, cultural institutions and one larger forest or regional outing."],
      ["Can I explore Missoula without a car?", "Yes for downtown, the riverfront and university area. A car, bicycle or rideshare becomes more useful for Fort Missoula, Rattlesnake trailheads and farther regional destinations."],
      ["When is wildfire smoke most likely to affect a visit?", "Smoke is most often a concern during the warmer dry season, especially later summer, but conditions vary widely each year and should be checked close to the visit."]
    ],
    tourism: "https://destinationmissoula.org/",
    subheadline: "Explore Missoula through the Clark Fork, university life, local trails, western Montana ecology and a genuine mountain-town cultural core."
  }
};

const banned = [
  "one of the most valuable things to do",
  "article set",
  "lexical anchors",
  "validation and traceability",
  "generic checklist item",
  "build this stop into the day",
];

const sentenceCount = (text: string) => (text.match(/[.!?](?:\s|$)/g) ?? []).length;
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const assertQuality = (key: string, e: CityEnhancement) => {
  if (wordCount(e.overview) < 80) throw new Error(`${key}: overview is below paragon depth`);
  if (e.things.length < 8) throw new Error(`${key}: fewer than eight Things to Do entries`);
  if (e.highlights.length < 2) throw new Error(`${key}: weak highlights coverage`);
  if (e.seasons.length < 3) throw new Error(`${key}: weak seasonal guidance`);
  if (e.tips.length < 3) throw new Error(`${key}: weak travel tips`);
  if (e.faq.length < 2) throw new Error(`${key}: weak FAQ coverage`);

  const descriptions = new Set<string>();
  for (const [title, description] of e.things) {
    if (sentenceCount(description) < 4) throw new Error(`${key}: ${title} has fewer than four substantive sentences`);
    if (description.length < 240) throw new Error(`${key}: ${title} description is too thin`);
    const lower = description.toLowerCase();
    if (banned.some(phrase => lower.includes(phrase))) throw new Error(`${key}: ${title} contains banned template prose`);
    if (descriptions.has(lower)) throw new Error(`${key}: duplicate landmark description`);
    descriptions.add(lower);
  }
};

export const enhancePhase2ParagonCityGuide = (
  stateSlug: string,
  citySlug: string,
  guide: GuidePageData
): GuidePageData => {
  const key = `${stateSlug}/${citySlug}`;
  const e = cities[key];
  if (!e) return guide;

  assertQuality(key, e);
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
    thingsToDo: e.things.map(([title, description]) => ({ title, description })),
    bestTimeToVisit: {
      title: `When to visit ${place}`,
      bullets: e.seasons,
    },
    travelTips: e.tips,
    faq: e.faq.map(([q, a]) => ({ q, a })),
    seoLinks: { officialTourism: e.tourism },
    aboutCity: undefined,
  };
};
