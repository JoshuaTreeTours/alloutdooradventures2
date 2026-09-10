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

export const PHASE1_PARAGON_CITY_KEYS = new Set([
  "georgia/savannah",
  "tennessee/nashville",
  "pennsylvania/philadelphia",
  "wyoming/jackson",
  "michigan/traverse-city",
  "south-dakota/rapid-city",
  "massachusetts/boston",
  "illinois/chicago",
  "texas/austin",
]);

const cities: Record<string, CityEnhancement> = {
  "georgia/savannah": {
    overview: "Savannah is a riverfront city whose historic core is organized around a distinctive network of public squares, shaded streets and civic landmarks rather than a single attraction strip. A useful visit connects the 1733 town plan, port and maritime history, African American and Gullah Geechee heritage, architecture, parks and the tidal landscape of coastal Georgia. Most central sights are close enough to explore on foot, while Bonaventure Cemetery and coastal excursions require more planning. Tybee Island is a separate incorporated city east of Savannah, so it belongs in the guide as a nearby excursion rather than as a Savannah neighborhood.",
    highlights: [
      ["A city built around squares", "Use Savannah's public squares and connected streets as the framework for understanding the historic district instead of racing between isolated landmarks."],
      ["River, port and coast", "The Savannah River shaped commerce and urban growth, while the Atlantic coast and tidal marshes explain the broader Lowcountry setting."],
      ["Layered human history", "Architecture and scenery make more sense when the story also includes slavery, emancipation, Black institutions and the communities that built and sustained the city."]
    ],
    things: [
      ["Savannah Historic District and its squares", "Walk the historic district as a connected urban landscape built around a repeating pattern of squares, streets and civic lots. Chippewa, Monterey and Johnson squares each reveal a different combination of monuments, churches, homes and public space. The pleasure is in moving between them slowly enough to notice how shade, street width and building placement shape the city. A walking route through several adjoining squares gives far more context than treating each square as an unrelated photo stop."],
      ["Forsyth Park", "Forsyth Park is the large green space at the southern end of Savannah's best-known historic streets, with lawns, live oaks, paths and the frequently photographed fountain near its north side. It works well as the endpoint of a walk south through the squares rather than as an isolated destination. The surrounding streets contain historic residential architecture that shows how the city expanded beyond its earliest ward plan. Morning and late afternoon are especially comfortable when heat and humidity make midday walking less appealing."],
      ["River Street and Factors Walk", "River Street occupies the lower bluff beside the Savannah River, where former warehouses and commercial buildings recall the city's long role as a port. Above it, Factors Walk and the old ramps, bridges and retaining walls show how the bluff connected river commerce with the higher city streets. Watching modern cargo traffic helps place the preserved waterfront inside a port that is still economically active. Uneven paving and steep connections between levels make sturdy footwear useful, especially for travelers combining the waterfront with a long walking day."],
      ["Telfair Museums and the Owens-Thomas House & Slave Quarters", "Telfair Museums connects art and architecture with a more difficult part of Savannah's social history. The Owens-Thomas House & Slave Quarters preserves an elite Regency-era residence together with spaces occupied by enslaved people, making the site particularly valuable for understanding who created and maintained wealthy households. The Telfair Academy and Jepson Center add very different art collections and exhibitions. Visiting at least two of the museum's sites gives a broader picture than using historic architecture merely as decorative scenery."],
      ["Bonaventure Cemetery", "Bonaventure Cemetery sits east of the historic core on a bluff above the Wilmington River and is known for elaborate monuments, mature trees and a landscape-garden setting. The cemetery contains the graves of prominent local figures, but its larger value is as a record of changing funerary art, family history and the city's nineteenth- and twentieth-century communities. It is too far from the central squares to fold casually into a downtown walking loop. Allow separate transportation and enough time to explore respectfully rather than treating the grounds as a quick movie-location stop."],
      ["Cathedral Basilica of St. John the Baptist", "The Cathedral Basilica of St. John the Baptist is one of the historic district's major religious and architectural landmarks, with twin spires visible from several nearby streets. Its interior, stained glass and decorative program reward a quiet visit when services or events do not limit access. The building also provides a useful entry point into the history of Catholic immigration and institutions in a city often described mainly through its colonial Anglican past. Pair it with nearby Lafayette Square so the visit stays geographically coherent."],
      ["SCAD Museum of Art and the western historic district", "The SCAD Museum of Art occupies adapted historic railroad and warehouse structures near the western side of Savannah's downtown. Its contemporary exhibitions create a deliberate contrast with the eighteenth- and nineteenth-century architecture that dominates many visitor itineraries. The museum also demonstrates how preservation and reuse continue to reshape older industrial buildings rather than freezing the city in one historical period. It pairs naturally with a walk toward City Market or the riverfront without requiring a separate cross-city transfer."],
      ["Tybee Island as a coastal day trip", "Tybee Island offers Atlantic beach, coastal ecology and lighthouse history about a half-hour drive east of central Savannah under light traffic. It is a separate city, not part of Savannah proper, and the distinction matters when planning transportation and describing local attractions accurately. A beach or lighthouse visit can complement Savannah's riverfront and historic-district focus with a direct look at the barrier-island environment. Summer weekends can bring heavy traffic and parking pressure, so the excursion works best when given its own block of time."]
    ],
    seasons: [
      "Spring and fall usually offer the best balance of comfortable walking weather and active street life.",
      "Summer is hot and humid, with afternoon thunderstorms possible; plan longer outdoor walks earlier in the day.",
      "Winter is generally mild and can be excellent for architecture, museums and walking with fewer peak-season crowds."
    ],
    tips: [
      "Walk the historic core when possible, but wear shoes suited to brick, cobblestone and uneven pavement.",
      "Treat Tybee Island and other coastal sites as separate excursions rather than implying they are Savannah neighborhoods.",
      "Use museums and interpreted historic sites to balance beautiful streetscapes with the full history of slavery, emancipation and Black Savannah.",
      "Build downtown days around adjacent squares and districts so short walks replace repeated driving and parking."
    ],
    faq: [
      ["How many days should I spend in Savannah?", "Two to three days covers the historic core, museums and riverfront at a comfortable pace; add another day if Tybee Island or a deeper coastal excursion matters to you."],
      ["Do I need a car in Savannah?", "Not for most of the historic district. A car, rideshare or tour becomes more useful for Bonaventure Cemetery, Tybee Island and other destinations beyond the central walking area."],
      ["Is Tybee Island part of Savannah?", "No. Tybee Island is a separate incorporated city east of Savannah, although it is commonly visited as a coastal day trip from the city."]
    ],
    tourism: "https://visitsavannah.com/",
    subheadline: "Explore Savannah through its squares, riverfront, layered history and coastal Georgia setting."
  },

  "tennessee/nashville": {
    overview: "Nashville is Tennessee's capital and a Cumberland River city whose visitor identity is inseparable from music, but the strongest guide goes well beyond the neon blocks of Lower Broadway. Country music institutions sit beside major museums, Black music history, state-government landmarks, university districts, neighborhoods and surprisingly accessible green space. Downtown sights cluster well enough for walking, while places such as Centennial Park, East Nashville and Radnor Lake require deliberate routing. A balanced itinerary uses music as one thread in a larger story of publishing, recording, migration, civil rights, education and the city's rapid modern growth.",
    highlights: [
      ["More than Lower Broadway", "Use the honky-tonk district as one piece of Nashville rather than allowing it to stand in for the entire city."],
      ["Music has many lineages", "Country, gospel, blues, R&B, soul and other traditions overlap here, and several institutions help visitors understand those connections."],
      ["City and landscape", "The Cumberland River, urban parks and nearby natural areas provide a useful counterweight to museums, venues and nightlife."]
    ],
    things: [
      ["Ryman Auditorium", "The Ryman Auditorium is one of Nashville's defining performance spaces and an essential place to understand how the city's music reputation developed. Its history reaches from religious gatherings to touring performers and the long period when it hosted the Grand Ole Opry. A daytime tour reveals the building's unusual acoustics, balcony layout and backstage story, while an evening performance shows why the room still matters as a living venue. Pair it with nearby Lower Broadway and the Country Music Hall of Fame to keep the day compact."],
      ["Country Music Hall of Fame and Museum", "The Country Music Hall of Fame and Museum uses recordings, instruments, costumes, archives and rotating exhibitions to place individual stars inside a much larger musical history. It is most valuable when visitors allow enough time to follow how commercial recording, radio, songwriting and touring turned Nashville into an industry center. The museum's downtown location makes it easy to combine with the Ryman and nearby performance districts on foot. Music fans should check current exhibitions because temporary displays can materially change what deserves the most time."],
      ["National Museum of African American Music", "The National Museum of African American Music examines the many Black musical traditions that shaped American popular culture, including gospel, blues, jazz, R&B and hip-hop. In Nashville, that perspective is particularly important because a country-music-only itinerary can obscure the city's broader musical inheritance. Interactive galleries connect genres, performers and historical periods rather than presenting them as isolated categories. Its central downtown location makes the museum easy to add to a walking day without another long transfer."],
      ["Lower Broadway and the honky-tonk district", "Lower Broadway is Nashville's loudest visitor district, lined with live-music venues, bars and historic commercial buildings between the river and downtown. It is worth seeing, but its intense nightlife atmosphere is only one version of the city and can be crowded even outside major event weekends. Visit earlier if you want to study the streetscape and hear music without the heaviest late-night crowds, or return after dark if the nightlife itself is the point. Walking is the sensible way to experience the core because traffic and parking can become part of the entertainment for all the wrong reasons."],
      ["Centennial Park and the Parthenon", "Centennial Park provides broad lawns, walking paths and one of Nashville's strangest landmarks: a full-scale Parthenon replica created from the legacy of the Tennessee Centennial Exposition. Inside, the building functions as an art museum and contains the monumental Athena statue, turning a park visit into an encounter with the city's late-nineteenth-century civic ambitions. The park is west of downtown and works naturally with nearby university areas rather than with an east-side itinerary. Give the grounds and building enough time to register as more than a novelty photo stop."],
      ["Tennessee State Museum and Bicentennial Capitol Mall", "The Tennessee State Museum and adjacent Bicentennial Capitol Mall create one of the best places to put Nashville inside the history and geography of the state. Museum galleries address Indigenous history, settlement, slavery, the Civil War, social change and Tennessee culture, while the outdoor mall uses maps, monuments and landscape design to interpret the state. The complex sits just north of downtown near the State Capitol, so several civic sites can be grouped in one walking-oriented block. This is an especially useful stop for visitors who want context beyond the entertainment districts."],
      ["East Nashville", "East Nashville is a collection of neighborhoods across the Cumberland River rather than a single attraction, known for historic homes, restaurants, small businesses and music venues. The area's appeal comes from street-level local life and the contrast with the purpose-built visitor intensity of Lower Broadway. Choose a specific corridor or destination before crossing the river instead of driving aimlessly through a large district. Combining a meal, a neighborhood walk and a scheduled venue produces a more coherent visit than checking off the phrase 'East Nashville' by itself."],
      ["Radnor Lake State Natural Area", "Radnor Lake State Natural Area protects forest, lake habitat and wildlife south of central Nashville and offers a genuine nature outing without requiring a long regional drive. Trails range from gentle lakeside walking to steeper wooded routes, and the area is managed for conservation rather than as a conventional recreation park. Parking can fill during popular periods, so early arrival and current access information matter. Treat Radnor Lake as a separate half-day outdoor block instead of squeezing it between downtown attractions."]
    ],
    seasons: [
      "Spring and fall bring comfortable walking weather and a dense calendar of music and cultural events.",
      "Summer is hot and humid, so museums and indoor venues are useful during the warmest part of the day.",
      "Winter is quieter and can be rewarding for music, museums and food, although occasional cold snaps affect outdoor plans."
    ],
    tips: [
      "Group the Ryman, Country Music Hall of Fame, Lower Broadway and downtown museums into the same walking day.",
      "Do not treat Lower Broadway as a complete picture of Nashville; build in at least one museum, neighborhood or outdoor area.",
      "Reserve high-demand performances in advance, especially on weekends and during major events.",
      "Use rideshare or transit strategically for neighborhoods and parks rather than moving a car between every downtown stop."
    ],
    faq: [
      ["How many days should I spend in Nashville?", "Three days gives enough time for the downtown music core, a major museum or two, a neighborhood and an outdoor or civic-history block without turning the trip into a venue marathon."],
      ["Is Nashville only for country-music fans?", "No. Country music is central to the city's identity, but Nashville also offers Black music history, state history, visual art, food, neighborhoods, universities and substantial park access."],
      ["Should I stay downtown?", "Downtown is convenient for first-time visitors focused on major music attractions, but other neighborhoods can be quieter and more local if you are comfortable using rideshare, transit or a car."]
    ],
    tourism: "https://www.visitmusiccity.com/",
    subheadline: "Explore Nashville through music history, neighborhoods, civic landmarks and the Cumberland River landscape."
  },

  "pennsylvania/philadelphia": {
    overview: "Philadelphia is a walkable East Coast city where the founding era of the United States sits beside major art institutions, dense rowhouse neighborhoods, markets, river trails and a strong contemporary food culture. The best itinerary does not reduce the city to the Liberty Bell: Independence National Historical Park is one concentrated historical district, while the Parkway museums, South Philadelphia, the Schuylkill and neighborhoods such as Fishtown require separate geographic blocks. Philadelphia's street grid and transit make car-light travel practical in the core. Its story becomes richer when colonial politics are considered alongside immigration, industry, incarceration, Black history and the city's continuing reinvention.",
    highlights: [
      ["Founding history in context", "Independence Hall and the Liberty Bell are strongest when treated as part of a larger federal historic district rather than isolated icons."],
      ["A major museum city", "The Benjamin Franklin Parkway and nearby institutions can fill an entire day for travelers who care about art, science or cultural history."],
      ["Neighborhood scale", "Markets, rowhouses, river paths and local commercial corridors reveal a city that rewards walking beyond the monumental center."]
    ],
    things: [
      ["Independence National Historical Park", "Independence National Historical Park concentrates many of Philadelphia's best-known founding-era sites in a compact section of the Old City. Independence Hall is where delegates debated and adopted the Declaration of Independence and later framed the U.S. Constitution, while nearby buildings add political, legal and everyday context. Because the area is managed by the National Park Service, timed-entry procedures and security requirements can differ from ordinary city attractions. Plan the district as a coherent historical block rather than sprinting to a single famous building and leaving."],
      ["Liberty Bell Center and Old City", "The Liberty Bell Center presents the bell together with exhibits about the changing meanings attached to it, including abolition, civil rights and national memory. Its location directly across from Independence Hall makes it naturally part of the same walking day, not a separate cross-city event. Continue east into Old City for historic streets, early commercial buildings and institutions that extend the story beyond the bell itself. Crowds are often lighter early in the day, which can make the entire district easier to understand at a human pace."],
      ["Reading Terminal Market", "Reading Terminal Market brings dozens of food vendors and merchants together under one roof near the Pennsylvania Convention Center and Center City. The market is both a practical meal stop and a window into Philadelphia's immigrant, regional and everyday food traditions. Arriving outside the busiest lunch period makes it easier to browse before deciding what to eat instead of joining whichever line happens to block your path. Its central location pairs well with City Hall, Chinatown or a walk east toward the historic district."],
      ["Philadelphia Museum of Art and the Parkway", "The Philadelphia Museum of Art crowns the northwest end of the Benjamin Franklin Parkway and contains collections large enough to justify several focused hours. Visitors who only run up the famous front steps miss galleries spanning European, American and Asian art, decorative arts and period rooms. The surrounding Parkway also connects institutions such as the Rodin Museum and Barnes Foundation, making this a natural museum district. Choose one or two institutions rather than trying to consume the entire cultural corridor in a single breathless afternoon."],
      ["Barnes Foundation", "The Barnes Foundation presents an idiosyncratic collection of modern and post-impressionist art in ensembles that deliberately mix paintings, metalwork, furniture and other objects. That arrangement is part of the experience and differs sharply from a conventional chronological museum display. Its Parkway location means it can be paired with nearby museums, but the density of the galleries rewards giving the collection its own substantial block of time. Advance tickets are sensible during busy periods because capacity and special exhibitions can affect availability."],
      ["Eastern State Penitentiary", "Eastern State Penitentiary preserves the massive radial cellblock complex that became one of the most influential prison designs of the nineteenth century. Exhibits address architecture and famous inmates, but they also examine incarceration, punishment and the long history of the American prison system. The site is partly ruinous and more physically demanding than a conventional indoor museum, so weather and accessibility deserve attention. Its Fairmount location works well with nearby neighborhood stops or a museum-area day rather than with a tightly scheduled Old City loop."],
      ["Italian Market and South Philadelphia", "The Italian Market corridor along South Ninth Street reflects generations of immigration, food commerce and neighborhood change in South Philadelphia. Long-established Italian businesses now share the area with Mexican, Vietnamese and other communities, making the market more interesting than a nostalgic single-ethnicity label suggests. Walk the corridor, stop for food and pay attention to the rowhouse streets that connect it with surrounding neighborhoods. It combines naturally with nearby South Street or Passyunk-area dining if you want a neighborhood-focused half day."],
      ["Schuylkill River Trail and Fairmount Park", "The Schuylkill River Trail gives walkers and cyclists a linear route along the river beside Center City and toward the larger Fairmount Park system. It is an efficient way to add outdoor time without leaving the urban core and provides a different perspective on bridges, boathouses and the city skyline. The trail can connect museum-area sightseeing with a longer walk or ride, but distances grow quickly once you continue northwest. Decide whether you want a short riverfront interlude or a real cycling outing before committing to the route."]
    ],
    seasons: [
      "Spring and fall are excellent for long walking days, neighborhood exploration and the river trails.",
      "Summer can be hot and humid; combine outdoor historic sites with museums and markets during the warmest hours.",
      "Winter is colder but often less crowded at major museums and historical attractions."
    ],
    tips: [
      "Use SEPTA, walking and regional rail before defaulting to a car in Center City, where parking can be expensive and inconvenient.",
      "Group Old City, the Parkway museums, South Philadelphia and the Schuylkill into separate geographic blocks.",
      "Check National Park Service entry procedures for Independence Hall before building a fixed schedule.",
      "Leave room for food markets and neighborhood walking; Philadelphia's value is not confined to ticketed attractions."
    ],
    faq: [
      ["How many days should I spend in Philadelphia?", "Three days gives a strong first visit: one day for Old City and founding history, one for museums and the Parkway, and one for neighborhoods, markets or the river."],
      ["Can I visit Philadelphia without a car?", "Yes. The central city is highly walkable and SEPTA rail, subway, trolley and bus service covers many visitor districts."],
      ["Are Independence Hall and the Liberty Bell city attractions?", "They are in Philadelphia, but the core historic sites are part of Independence National Historical Park and are managed by the National Park Service."]
    ],
    tourism: "https://www.visitphilly.com/",
    subheadline: "Explore Philadelphia through founding history, world-class museums, markets, neighborhoods and riverfront trails."
  },

  "wyoming/jackson": {
    overview: "Jackson is an incorporated town in western Wyoming and the commercial center of Jackson Hole, the broad valley between the Teton and Gros Ventre ranges. The distinction matters: Jackson is the town, Jackson Hole is the larger valley, and Grand Teton National Park, Teton Village and the National Elk Refuge are separate places or jurisdictions nearby. A strong guide therefore combines Town Square, museums, local trails and cultural institutions with clearly labeled regional excursions. Seasonal wildlife, snow, mountain weather and heavy national-park visitation strongly influence transportation, reservations and the amount of ground that can realistically be covered in a day.",
    highlights: [
      ["Town versus valley", "Keep Jackson, Jackson Hole, Teton Village and Grand Teton National Park geographically distinct so the guide remains useful and accurate."],
      ["Wildlife at the edge of town", "The National Elk Refuge and surrounding public lands put major wildlife habitat unusually close to Jackson's developed core."],
      ["Mountain gateway logistics", "Weather, snow, wildlife movement and peak-season traffic can change travel times dramatically, so route planning matters more here than mileage alone suggests."]
    ],
    things: [
      ["Jackson Town Square", "Jackson Town Square is the compact civic and commercial center of town, marked by its four elk-antler arches and surrounded by shops, galleries, restaurants and historic buildings. It is the logical orientation point for a first walk because much of central Jackson is reachable within a few blocks. The square also makes clear that Jackson itself is a small town rather than the entire Jackson Hole valley. Use it as the beginning of a downtown loop, then save national-park and mountain-resort excursions for separate blocks."],
      ["National Elk Refuge", "The National Elk Refuge begins immediately north of Jackson and protects crucial habitat used by elk and other wildlife in the greater Yellowstone ecosystem. Winter brings the refuge's most famous elk concentrations, while other seasons offer a different mix of habitat, birds and broad views toward the Tetons. It is federally managed by the U.S. Fish and Wildlife Service, not a Jackson town park, so access and wildlife rules deserve careful attention. The refuge's proximity to downtown makes it easy to appreciate how abruptly the built town meets protected open land."],
      ["National Museum of Wildlife Art", "The National Museum of Wildlife Art sits on a hillside overlooking the National Elk Refuge just north of town. Its collections use painting, sculpture and works on paper to explore how artists have represented wildlife and landscapes across different periods and cultures. The setting is part of the experience because refuge views connect the art directly to the living ecosystem outside. Combine the museum with a refuge-oriented outing rather than crossing the valley repeatedly between unrelated stops."],
      ["Snow King Mountain", "Snow King Mountain rises directly above the south side of Jackson and functions as the town's closest major recreation hill. Depending on season, visitors may find skiing, hiking, scenic access and other mountain activities with views over town and the valley. Because conditions, operations and activity offerings change through the year, the mountain works best when checked as a current seasonal destination rather than described as one fixed attraction. Its location allows an outdoor half day without the longer drive to Teton Village."],
      ["Cache Creek and local trail network", "Cache Creek provides trail access from the east side of Jackson into foothill terrain used by hikers, runners, cyclists and winter recreationists. The network offers a more local outdoor experience than driving immediately to a national park, while still delivering sagebrush, forest and mountain views. Trail conditions vary with snow, mud, wildlife and seasonal management, so current local guidance matters. Start early on warm summer days and remember that even close-to-town terrain can feel remote once you leave the trailhead."],
      ["Center for the Arts", "Jackson's Center for the Arts brings theater, music, film, lectures and community organizations together near the center of town. It is a useful reminder that Jackson is not merely a staging area for national parks and ski trips but a year-round community with a substantial cultural life. A scheduled performance can anchor an evening after outdoor activities and reduce the temptation to overfill daylight hours with driving. Check the calendar rather than assuming the same programming is available every week of the year."],
      ["Grand Teton National Park day trip", "Grand Teton National Park begins north of Jackson and protects the dramatic Teton Range, lakes, river corridors and wildlife habitat that draw many travelers to the valley. It is a separate National Park Service unit, not part of the town of Jackson, and deserves a dedicated day rather than a casual add-on between downtown stops. Distances can look short on a map while wildlife traffic, construction and crowded trailheads lengthen the day. Choose a limited set of park areas and check current road, trail and reservation information before leaving town."],
      ["Teton Village and Jackson Hole Mountain Resort", "Teton Village lies northwest of Jackson at the base of Jackson Hole Mountain Resort and is a separate resort community from the town. In winter it is a major skiing destination, while summer brings lift-served sightseeing, hiking and other mountain activities when operations allow. The road between town and the village can become busy during peak periods, so grouping village activities together is more efficient than shuttling back and forth. Naming the location accurately also prevents the common mistake of treating every Jackson Hole attraction as though it were in downtown Jackson."]
    ],
    seasons: [
      "Summer offers the broadest road and trail access but also brings the heaviest national-park traffic and strongest reservation pressure.",
      "Fall can be spectacular for color and wildlife, with colder nights and an increasing chance of early snow.",
      "Winter transforms travel around skiing and wildlife viewing; snow, ice and seasonal road closures materially change what is practical.",
      "Spring is quieter but can bring mud, lingering snow and limited access in higher terrain."
    ],
    tips: [
      "Distinguish Jackson the town from Jackson Hole the valley, Teton Village and Grand Teton National Park in every itinerary.",
      "Check road, trail, weather and wildlife conditions before mountain outings because conditions can change quickly.",
      "Use START bus service where it fits, especially between town and major valley destinations, to reduce parking pressure.",
      "Reserve high-demand summer lodging, park activities and winter ski services well ahead."
    ],
    faq: [
      ["Is Jackson the same as Jackson Hole?", "No. Jackson is the incorporated town; Jackson Hole is the larger valley that includes Jackson, Teton Village and other communities and landscapes."],
      ["How many days should I spend in Jackson?", "Allow at least three to four days if you want time for the town plus Grand Teton National Park, wildlife and one additional mountain or cultural outing."],
      ["Is Grand Teton National Park in Jackson?", "No. The park is a separate federally managed National Park Service unit north of town, although Jackson is one of its main gateway communities."]
    ],
    tourism: "https://www.visitjacksonhole.com/",
    subheadline: "Use Jackson as a mountain gateway while keeping the town, Jackson Hole valley and surrounding protected lands distinct."
  },

  "michigan/traverse-city": {
    overview: "Traverse City sits at the head of Grand Traverse Bay in northwest Lower Michigan, where a compact downtown meets beaches, the Boardman River, agricultural peninsulas and a broad regional trail network. Its appeal comes from combining a real small-city center with easy access to freshwater landscapes, wineries, orchards and protected Lake Michigan shore. The guide should distinguish places in Traverse City from Old Mission Peninsula, Leelanau County and Sleeping Bear Dunes National Lakeshore, all of which are worthwhile but geographically separate. Seasonal lake weather, summer demand and fall color strongly shape traffic and reservations, so a focused itinerary works better than a loose list of generic scenic drives.",
    highlights: [
      ["Freshwater city", "Grand Traverse Bay and the Boardman River shape downtown recreation and make water part of the city's everyday geography."],
      ["A compact urban core", "Front Street, parks, beaches and cultural venues can be explored without turning every hour into another drive."],
      ["Regional excursions with boundaries", "Old Mission Peninsula and Sleeping Bear Dunes are excellent nearby trips, but they should be labeled as regional destinations rather than Traverse City landmarks."]
    ],
    things: [
      ["Downtown Traverse City and Front Street", "Front Street and the surrounding downtown blocks form Traverse City's most walkable concentration of restaurants, shops, theaters and historic commercial buildings. The district sits close to the Boardman River and Grand Traverse Bay, so a downtown walk can connect naturally with waterfront paths. Spending time here before driving the peninsulas gives visitors a sense of the city itself rather than treating Traverse City as a parking lot for regional excursions. Evenings are lively in summer, when parking demand makes walking from one central location especially sensible."],
      ["Clinch Park and Grand Traverse Bay", "Clinch Park places a public beach, marina access and waterfront trail directly beside downtown on West Grand Traverse Bay. It is one of the easiest places to understand why Traverse City's identity is tied so closely to freshwater recreation. Swimming and paddling conditions depend on weather, wind and water temperature, which can remain cool even on warm days. Pair the park with downtown rather than driving to it as a separate attraction because the two areas are only a short walk apart."],
      ["Boardman River and Boardman Lake Loop", "The Boardman-Ottaway River flows through Traverse City and connects the urban core with a wider watershed extending inland. Paths around Boardman Lake and along portions of the river give walkers and cyclists an accessible way to explore the city's water landscape without leaving town. The route also passes through changing residential, park and natural settings rather than repeating the same generic waterfront view. Choose a distance that fits your day because a full loop is a real outing, not simply a five-minute scenic stop."],
      ["The Village at Grand Traverse Commons", "The Village at Grand Traverse Commons occupies the extensive former Northern Michigan Asylum campus west of downtown, where historic institutional buildings have been adapted for shops, restaurants, offices and residences. Trails climb into surrounding wooded hills, creating an unusual combination of architectural history and outdoor recreation. Guided or self-guided interpretation helps visitors understand the original hospital landscape instead of seeing only an attractive redevelopment. Allow time for both the buildings and nearby trails if you want the site to make sense as more than a shopping stop."],
      ["Dennos Museum Center", "The Dennos Museum Center at Northwestern Michigan College offers visual art, rotating exhibitions and a notable collection of Inuit art. It adds cultural depth to an itinerary that can otherwise become dominated by beaches, wineries and scenic driving. Because the museum is compact compared with major metropolitan institutions, it pairs well with another in-town activity rather than demanding an entire day. Check the current exhibition schedule to see which galleries or programs deserve priority during your visit."],
      ["Old Mission Peninsula", "Old Mission Peninsula extends north between the east and west arms of Grand Traverse Bay and is known for orchards, vineyards, shoreline views and the Mission Point area. Much of the peninsula lies outside Traverse City proper, so it should be planned as a regional excursion with its own driving time. Winery visits often require reservations or thoughtful pacing, and the narrow road network can become busy during summer and fall weekends. Choose a handful of stops instead of trying to collect every tasting room and overlook in one pass."],
      ["Sleeping Bear Dunes National Lakeshore", "Sleeping Bear Dunes National Lakeshore lies west of Traverse City along Lake Michigan and protects towering dunes, beaches, forests and historic landscapes. It is a separate National Park Service unit and deserves at least a substantial half day, usually more, because driving from the city and moving between trailheads takes time. Weather on the exposed lakeshore can differ sharply from conditions downtown, and dune hikes are far more strenuous than their short distances suggest. Treat the national lakeshore as a destination day rather than listing it as though it were an urban park in Traverse City."],
      ["Leelanau Peninsula and Suttons Bay corridor", "The Leelanau Peninsula northwest of Traverse City adds villages, wineries, farm landscapes and Lake Michigan shoreline to a longer regional day. Suttons Bay provides a convenient focal point, while farther routes can continue toward coastal parks or small communities depending on time. This is outside Traverse City and should be described that way, especially when estimating drive times. A selective route with two or three meaningful stops is usually more satisfying than spending the entire day moving from tasting room to tasting room."]
    ],
    seasons: [
      "Summer is prime beach and boating season, with the highest lodging demand and busiest roads.",
      "Fall brings color, harvest activity and popular wine-country weekends, often with cool nights.",
      "Spring is quieter and variable, while winter supports snow-based recreation but limits some warm-season attractions."
    ],
    tips: [
      "Keep downtown Traverse City, Old Mission Peninsula, Leelanau Peninsula and Sleeping Bear Dunes geographically distinct.",
      "Reserve lodging, popular restaurants and winery experiences early for summer and peak fall weekends.",
      "Carry layers near the lakes because wind and water temperatures can make the shoreline feel much cooler than inland areas.",
      "Use walking and cycling for downtown and Boardman-area outings before committing to another regional drive."
    ],
    faq: [
      ["How many days should I spend in Traverse City?", "Three days is a good minimum for downtown and the bay, one peninsula excursion and a separate Sleeping Bear Dunes or Leelanau day."],
      ["Is Sleeping Bear Dunes in Traverse City?", "No. Sleeping Bear Dunes National Lakeshore is a separate National Park Service site west of Traverse City and requires meaningful driving time."],
      ["Do I need a car?", "You can enjoy downtown and nearby waterfront areas on foot or bicycle, but a car or tour is useful for the peninsulas, wineries and national lakeshore."]
    ],
    tourism: "https://www.traversecity.com/",
    subheadline: "Explore Traverse City as a freshwater city, then use it thoughtfully for peninsula and Lake Michigan excursions."
  },

  "south-dakota/rapid-city": {
    overview: "Rapid City sits at the eastern edge of the Black Hills and functions as both a real regional city and a gateway to some of South Dakota's most famous protected landscapes. The strongest guide keeps those roles separate: downtown museums, public art, parks and local trails belong to Rapid City, while Mount Rushmore, Custer State Park and Badlands National Park are substantial excursions under different jurisdictions. The Black Hills are also Paha Sapa, a landscape of deep cultural significance to Lakota people, so the region should not be reduced to monuments and scenic drives. Weather, wildfire conditions, rally traffic and long regional distances all affect practical planning.",
    highlights: [
      ["Gateway, not the attraction itself", "Rapid City is the service and cultural hub; Mount Rushmore, Custer State Park and Badlands National Park are separate destinations that need their own travel time."],
      ["Black Hills context", "Geology, Indigenous history, mining, settlement and tourism all intersect here, making museums and interpreted sites especially useful."],
      ["Local outdoor access", "Skyline Drive and in-town trail systems let visitors experience hills and views without spending every day on a regional highway."]
    ],
    things: [
      ["Downtown Rapid City and Main Street Square", "Main Street Square anchors a walkable portion of downtown Rapid City with public space, events, restaurants and local businesses. Nearby streets contain the City of Presidents sculptures, which can be encountered as part of an ordinary downtown walk rather than hunted one by one. The district is useful as an evening or arrival-day activity after longer Black Hills excursions. Walking several blocks also gives a better feel for Rapid City as a living regional center instead of treating it only as a hotel base."],
      ["The Journey Museum and Learning Center", "The Journey Museum and Learning Center brings together geology, archaeology, Lakota culture and regional history in a format designed to explain the Black Hills and western South Dakota. It is particularly valuable before major road trips because the exhibits provide context for landscapes visitors will later see in the field. A museum stop also helps counter the tendency to interpret the region only through presidential monuments or mining-era tourism. Give the exhibits time to build a chronological and cultural framework rather than using the museum as a rainy-day afterthought."],
      ["Museum of Geology at South Dakota Mines", "The Museum of Geology at South Dakota Mines is a compact but rewarding stop for fossils, minerals and the geological history of the northern Great Plains and Black Hills region. Its collections can sharpen what visitors notice later in badlands, uplifted hills and fossil-bearing formations around western South Dakota. Because the museum is associated with a university, schedules and access can follow academic patterns rather than conventional attraction hours. Geology-minded travelers can pair it with an in-town day and then use regional excursions as the field portion of the lesson."],
      ["Dinosaur Park and Skyline Drive", "Dinosaur Park occupies a ridge above Rapid City and combines quirky Depression-era dinosaur sculptures with broad views across the city and toward the Black Hills. The drive and overlooks show clearly how Rapid City sits where plains meet uplifted terrain. It is a short local outing, but steep grades and weather can affect access and walking comfort. Treat it as a viewpoint and piece of local roadside history rather than as a scientific dinosaur museum."],
      ["Hanson-Larsen Memorial Park", "Hanson-Larsen Memorial Park protects a network of trails on hills immediately beside Rapid City's urban core. Hiking and mountain biking routes provide local exercise, views and exposed Black Hills terrain without the drive to a distant state or national park. Trail surfaces and difficulty vary, and summer heat or winter ice can make a short route more demanding than expected. The park is an excellent option when you want genuine outdoor time but do not have enough daylight for a long regional circuit."],
      ["Mount Rushmore National Memorial", "Mount Rushmore National Memorial lies south of Rapid City in the Black Hills and is managed by the National Park Service. It is not a Rapid City park, and travel time plus parking and crowd conditions justify planning it as part of a dedicated Black Hills day. The site includes trails and interpretive exhibits that address construction and some of the broader historical setting, although visitors should also seek Indigenous perspectives on the Black Hills elsewhere in the region. Pairing the memorial with only one or two additional nearby stops usually produces a less rushed day."],
      ["Custer State Park", "Custer State Park is a large South Dakota state park south of Rapid City known for granite peaks, wildlife, lakes and scenic roads. Wildlife Loop Road, Needles Highway and Sylvan Lake are separated by enough distance that trying to cover every headline feature in a few hours leads to windshield tourism. Seasonal road conditions, bison traffic and summer congestion can all expand drive times. Choose the portion of the park that matches your interests and treat it as a separate state-park excursion rather than a Rapid City attraction."],
      ["Badlands National Park", "Badlands National Park lies east of Rapid City and protects a deeply eroded landscape of colorful sedimentary formations, mixed-grass prairie and important fossil resources. The park is a separate National Park Service destination and usually deserves most of a day once the round-trip drive and stops are included. Heat, wind and exposed terrain make water and sun protection important even when hikes are short. Geology comes alive here, so allow time for overlooks and a trail rather than merely driving the scenic road and returning to the interstate."]
    ],
    seasons: [
      "Late spring through early fall offers the broadest access to Black Hills roads and attractions.",
      "Summer is busiest, with hot exposed conditions possible in the Badlands and major traffic spikes around large regional events.",
      "Winter and shoulder seasons are quieter but can bring snow, ice and seasonal road or attraction closures."
    ],
    tips: [
      "Treat Mount Rushmore, Custer State Park and Badlands National Park as separate regional excursions, not Rapid City neighborhoods or municipal parks.",
      "Check weather and road conditions before long Black Hills loops because elevation changes can produce very different conditions.",
      "Allow more driving time than mileage alone suggests when wildlife, construction or event traffic is present.",
      "Use local museums to add Lakota, geological and regional context before reducing the Black Hills to a sequence of monument photographs."
    ],
    faq: [
      ["How many days should I spend in Rapid City?", "Three to four days lets you spend time in Rapid City itself and still devote separate days to the Black Hills and Badlands without rushing."],
      ["Is Mount Rushmore in Rapid City?", "No. Mount Rushmore National Memorial is a separate National Park Service site south of Rapid City in the Black Hills."],
      ["Can I visit the Badlands and Mount Rushmore in one day?", "It is possible, but the combined driving and sightseeing can make for a very long day. Separate days generally produce a better experience if your schedule allows."]
    ],
    tourism: "https://www.visitrapidcity.com/",
    subheadline: "Use Rapid City as a Black Hills gateway while keeping its museums, trails and surrounding protected lands geographically honest."
  },

  "massachusetts/boston": {
    overview: "Boston is a compact Atlantic city where colonial streets, nineteenth-century neighborhoods, major universities, immigrant history, waterfront redevelopment and world-class cultural institutions overlap within a surprisingly walkable core. The Freedom Trail is an excellent organizing device, but it should not flatten the city into a Revolutionary War theme park: Beacon Hill, the North End, the Back Bay, Fenway, the Harborwalk and the harbor islands each reveal different periods and communities. Public transit makes many itineraries practical without a car. A strong visit groups sights by neighborhood and uses museums, historic sites, parks and waterfront walks to connect political history with the modern city.",
    highlights: [
      ["History across several centuries", "Use the Freedom Trail as a framework, then extend the story into Black history, immigration, industry, universities and modern waterfront change."],
      ["Built for walking and transit", "Many major districts connect naturally on foot or by the MBTA, making Boston one of the easier U.S. cities to explore without a car."],
      ["Harbor city", "The waterfront and islands explain Boston's geography and maritime history just as clearly as its brick streets and meetinghouses."]
    ],
    things: [
      ["Freedom Trail", "The Freedom Trail links a concentrated sequence of sites associated with colonial Boston, the American Revolution and the early United States. Walking the route turns street geography into part of the history, connecting Boston Common, meetinghouses, burying grounds, the North End and Charlestown rather than isolating each landmark. The full trail is longer and denser than many visitors expect once museum stops are included. Break it into logical sections if you want time to enter buildings and read interpretation instead of simply following the painted line."],
      ["Boston Common and Public Garden", "Boston Common and the adjoining Public Garden form a broad green hinge between downtown, Beacon Hill and the Back Bay. The Common has served civic, military, recreational and protest functions over centuries, while the Public Garden reflects a later landscaped-park tradition. Walking through both spaces makes an easy transition between historic downtown and residential or shopping districts. Seasonal events, winter ice and summer crowds change the atmosphere, so the parks reward repeat passes rather than a single obligatory photograph."],
      ["Black Heritage Trail and Beacon Hill", "The Black Heritage Trail on the north slope of Beacon Hill connects sites associated with Boston's nineteenth-century Black community, abolition and the struggle against slavery. It adds essential context to a city often narrated almost entirely through white Revolutionary leaders. The neighborhood's steep streets and preserved architecture also reveal the social geography of a growing nineteenth-century city. Combine trail interpretation with a broader Beacon Hill walk, but remember that many historic buildings have specific access schedules."],
      ["North End", "Boston's North End layers colonial landmarks with generations of immigrant history, especially the Italian American community that reshaped the neighborhood in the nineteenth and twentieth centuries. Narrow streets connect Old North Church and the Paul Revere House with bakeries, restaurants, churches and dense residential blocks. The neighborhood is best experienced on foot and rewards wandering beyond whichever pastry shop has the longest line. Pair it with the northern Freedom Trail or waterfront so the day remains compact and the historical layers reinforce one another."],
      ["Museum of Fine Arts, Boston", "The Museum of Fine Arts is large enough to overwhelm a casual checklist, with collections spanning ancient cultures, Asian art, European painting, American art, textiles and much more. A better strategy is to choose several collection areas or a special exhibition and leave room to look carefully. The museum sits in the Fenway cultural district and is reachable by public transit, making a car unnecessary for most visitors. It pairs well with the nearby Isabella Stewart Gardner Museum if art is a major priority, though doing both thoroughly can consume most of a day."],
      ["Isabella Stewart Gardner Museum", "The Isabella Stewart Gardner Museum presents art in a highly personal palazzo-style setting organized around a central courtyard. The arrangement reflects Gardner's collecting vision, so rooms combine paintings, sculpture, furniture and architectural fragments rather than following a standard museum chronology. That makes the building itself part of the interpretation and encourages slower looking. Timed tickets are wise during busy periods, and the museum can be paired with the Museum of Fine Arts without changing neighborhoods."],
      ["Boston Harborwalk", "The Boston Harborwalk traces long stretches of the city's waterfront through downtown, the Seaport and other harbor neighborhoods. Walking selected sections reveals working harbor infrastructure, new development, historic wharves and public spaces while keeping the Atlantic geography visible. The route is not one continuous sightseeing strip, so choose a segment that fits the rest of your day rather than trying to walk every mile. Wind and changing weather near the water can make layers useful even when inland streets feel comfortable."],
      ["Boston Harbor Islands", "The Boston Harbor Islands include a network of islands and peninsulas with natural, military and maritime history, some reached by seasonal ferry service. Georges Island and other accessible sites can turn the harbor from a backdrop into the main landscape of the day. Ferry schedules, seasonal operations and weather determine what is practical, so this is one Boston experience that should be planned around transportation rather than improvised. Allow enough time on shore that the outing is more than a boat ride with a hurried turnaround."]
    ],
    seasons: [
      "Late spring and fall are especially comfortable for long walking days and neighborhood exploration.",
      "Summer brings the fullest harbor and outdoor-event schedules along with heat, humidity and heavier crowds.",
      "Winter is cold but rewarding for museums, historic interiors and a quieter city, with snow occasionally affecting walking and transit."
    ],
    tips: [
      "Use the MBTA and walking instead of a car for most central neighborhoods; parking is expensive and street layouts can be confusing.",
      "Break the Freedom Trail into sections if you intend to enter museums and historic buildings.",
      "Reserve high-demand museum and harbor experiences when timed tickets or seasonal ferry capacity matter.",
      "Carry layers because harbor wind and fast-changing New England weather can make conditions vary across the day."
    ],
    faq: [
      ["How many days should I spend in Boston?", "Three to four days gives time for the historic core, one major museum area, neighborhoods and either the waterfront or harbor islands without turning the trip into a race."],
      ["Do I need a car in Boston?", "Usually not for a first visit. Walking and the MBTA cover most central attractions more efficiently than driving and parking."],
      ["Is the Freedom Trail enough to understand Boston?", "It is an excellent introduction to Revolutionary history, but a fuller visit should also include Black history, immigrant neighborhoods, museums and the harbor."]
    ],
    tourism: "https://www.meetboston.com/",
    subheadline: "Explore Boston through Revolutionary history, Black heritage, immigrant neighborhoods, museums and the harbor."
  },

  "illinois/chicago": {
    overview: "Chicago is a Lake Michigan metropolis whose architecture, river engineering, immigrant neighborhoods, museums, music and public lakefront are best understood geographically rather than through a generic list of downtown landmarks. The Loop and Near North Side contain many first-visit highlights, but the city extends far beyond them into neighborhoods with distinct cultural histories and commercial streets. The Chicago River and lakefront trail provide two powerful organizing landscapes, while the 'L' makes a car unnecessary for many itineraries. A strong guide balances skyline icons with art, neighborhood institutions, parks and the infrastructure that helped Chicago become one of North America's great transportation and industrial centers.",
    highlights: [
      ["Architecture as city history", "Buildings, bridges and the river reveal how fire, engineering, commerce and design repeatedly reshaped central Chicago."],
      ["A public lakefront", "Parks, beaches and trails keep Lake Michigan central to the visitor experience rather than treating it as a skyline backdrop."],
      ["Neighborhood depth", "Chicago's cultural identity is distributed across many communities, so at least one neighborhood-focused outing belongs beside the downtown classics."]
    ],
    things: [
      ["Millennium Park and the Loop", "Millennium Park occupies a prominent section of downtown beside Michigan Avenue and combines major public art, performance space, gardens and access to the broader lakefront. Cloud Gate draws the cameras, but the Pritzker Pavilion, Crown Fountain and surrounding landscape make the park more than a single sculpture stop. From here, the Loop's architecture and the Art Institute are only a short walk away. Start early if you want quieter public spaces, then let the park serve as the beginning of a larger downtown walking route."],
      ["Art Institute of Chicago", "The Art Institute of Chicago holds one of the country's major encyclopedic art collections, with especially strong holdings in Impressionism, modern art, American art, decorative arts and works from many world cultures. Its Michigan Avenue location beside Millennium Park makes it easy to reach, but the collection is far too large to treat casually between other stops. Choose galleries or exhibitions in advance and give yourself permission not to see everything. Museum time pairs well with an architecture or lakefront walk before or afterward, creating a day with both indoor and outdoor texture."],
      ["Chicago Riverwalk and architecture cruise", "The Chicago Riverwalk places pedestrians directly beside the river canyon that defines much of the central city's architecture. Walking it reveals movable bridges, towers from different eras and the engineered waterway that underpinned Chicago's commercial growth. An architecture cruise adds a guided view from water level and is one of the rare sightseeing formats where the transportation itself materially improves the explanation. Reserve popular departures during peak season and allow extra time around the river instead of treating the cruise as an isolated one-hour ticket."],
      ["Lakefront Trail and Grant Park", "Chicago's lakefront is a continuous civic asset rather than a private wall of development, and the Lakefront Trail provides miles of walking and cycling beside Lake Michigan. Grant Park, Buckingham Fountain and Museum Campus create an especially useful central section with broad skyline views. Wind and lake-effect weather can make conditions feel very different from streets a few blocks inland. Choose a manageable segment on foot or bicycle rather than assuming the entire trail is a casual downtown stroll."],
      ["Museum Campus", "Museum Campus groups the Field Museum, Shedd Aquarium and Adler Planetarium beside the lake south of downtown. Each institution can absorb several hours, so trying to complete all three in one day usually turns excellent museums into a conveyor belt. The campus itself offers some of the city's best skyline views and connects to lakefront paths, making outdoor time easy to add between interiors. Pick the institution that best matches your interests and use the rest of the area as part of a coherent lakefront day."],
      ["Lincoln Park", "Lincoln Park stretches along the North Side lakefront and contains the Lincoln Park Zoo, conservatory, beaches, paths and landscaped open space. Its scale makes it better understood as a district of recreational choices than as one point on a map. The adjacent neighborhood adds restaurants, residential streets and cultural venues, allowing visitors to combine park time with a more local urban experience. Transit and walking are usually easier than trying to move a car between every stop in this busy part of the city."],
      ["Pilsen and the National Museum of Mexican Art", "Pilsen is a Lower West Side neighborhood shaped by successive immigrant communities and especially by a strong Mexican and Mexican American cultural presence. Murals, restaurants, small businesses and the National Museum of Mexican Art make the neighborhood worth visiting for more than a quick food stop. The museum's exhibitions provide historical and artistic context that makes the surrounding public art more meaningful. Arrive by the 'L' or bus when practical and spend time walking a defined area rather than treating the neighborhood as a drive-through backdrop."],
      ["Pullman National Historical Park", "Pullman National Historical Park on Chicago's Far South Side preserves and interprets the planned industrial community created around the Pullman railcar works. Its history links architecture, labor, company towns, race and the Pullman porters, making it one of the city's most important sites for understanding national industrial and labor history. The site is far from the Loop compared with most first-visit attractions, so transportation and opening hours need to be planned deliberately. Give it a dedicated half-day block rather than attaching it casually to a downtown itinerary."]
    ],
    seasons: [
      "Late spring through early fall is ideal for river cruises, lakefront cycling and outdoor festivals.",
      "Summer can be hot and crowded but offers the fullest outdoor schedule and beach season.",
      "Winter is cold and windy, yet museums, food, architecture and indoor cultural life remain strong reasons to visit."
    ],
    tips: [
      "Use the CTA 'L', buses and walking for central neighborhoods before considering a car.",
      "Group the Loop, river, Museum Campus and North Side into separate geographic blocks to avoid unnecessary backtracking.",
      "Reserve architecture cruises and high-demand museum entries during busy travel periods.",
      "Expect the lakefront to be windier and cooler than inland streets, especially in spring and fall."
    ],
    faq: [
      ["How many days should I spend in Chicago?", "Four days gives a strong first visit with downtown architecture, one major museum block, lakefront time and at least one neighborhood-focused day."],
      ["Do I need a car in Chicago?", "Not for most central sightseeing. The CTA and walking are usually easier, while a car becomes more useful only for specific outer-neighborhood or regional plans."],
      ["What is the best way to experience Chicago architecture?", "Combine a river architecture cruise with walking in the Loop or along the Riverwalk so you see both the skyline composition and street-level details."]
    ],
    tourism: "https://www.choosechicago.com/",
    subheadline: "Explore Chicago through architecture, the river, Lake Michigan, major museums and neighborhood culture."
  },

  "texas/austin": {
    overview: "Austin is Texas's capital, a fast-growing city on the Colorado River whose identity mixes state politics, live music, university culture, swimming holes, trails and a distinctive limestone Hill Country setting. The strongest itinerary keeps central Austin compact: the Capitol, downtown, South Congress, Lady Bird Lake and several music districts can be grouped without constant driving. Other places marketed with Austin, including Hamilton Pool Preserve, lie well outside the central city and should be labeled as regional excursions. Heat is a major planning variable for much of the year, so early outdoor activity, shade, swimming and deliberate midday indoor time often produce a better visit than a generic all-day sightseeing schedule.",
    highlights: [
      ["Capital city and creative city", "Government, the University of Texas and music culture overlap here, giving Austin more depth than its nightlife slogans suggest."],
      ["River and limestone landscape", "Lady Bird Lake, Barton Springs and Hill Country topography put water and geology near the center of urban recreation."],
      ["Plan around heat and distance", "Central districts can be grouped efficiently, but hot weather and far-flung regional attractions punish careless scheduling."]
    ],
    things: [
      ["Texas State Capitol", "The Texas State Capitol anchors the north end of downtown and remains a working seat of state government as well as a major historic landmark. The building, grounds and visitor interpretation provide a direct introduction to Texas political history and civic architecture. From the Capitol, Congress Avenue creates a natural walking line south toward downtown and the river, so there is little reason to treat the site as an isolated driving stop. Check current tour and security procedures if you want more than an exterior walk."],
      ["Lady Bird Lake and the Butler Hike-and-Bike Trail", "Lady Bird Lake is the dammed section of the Colorado River through central Austin and is bordered by the Ann and Roy Butler Hike-and-Bike Trail. Walking, running, cycling and paddling here provide skyline views while revealing how closely the city's recreation is tied to the river corridor. The loop is much longer than a casual visitor may expect, so choose a section or crossing that fits the rest of your day. Early morning is especially valuable in warm months before heat and sun build over exposed portions of the trail."],
      ["Zilker Metropolitan Park and Barton Springs Pool", "Zilker Metropolitan Park is Austin's best-known central green space and the setting for Barton Springs Pool, a large spring-fed swimming area supplied by the Edwards Aquifer system. The water stays cool enough to be a genuine refuge during hot weather, while the surrounding park connects to trails, lawns and the river corridor. Admission, closures and environmental protections can affect swimming access, so check current conditions before building the day around the pool. Pair Zilker with the Butler Trail or nearby South Austin rather than driving back and forth across town."],
      ["Congress Avenue Bridge bats", "The Congress Avenue Bridge hosts a famous seasonal colony of Mexican free-tailed bats that often emerges around dusk during the warmer part of the year. Viewing from the bridge, riverbanks or a boat turns an ordinary piece of transportation infrastructure into one of Austin's most unusual wildlife experiences. Emergence timing varies with season and conditions, and the bats are not a guaranteed year-round performance. Arrive early enough to choose a safe viewing location and combine the evening with downtown or South Congress rather than creating a separate cross-city trip."],
      ["LBJ Presidential Library", "The LBJ Presidential Library on the University of Texas campus interprets Lyndon B. Johnson's presidency, civil rights legislation, the Great Society, Vietnam and the political conflicts of the 1960s. Exhibitions place major national events alongside archival material and the institutional history of the presidency. The library works well with other university-area destinations and provides an air-conditioned midday block during hot weather. Visitors interested in politics or twentieth-century history should allow enough time to read rather than treating it as a quick campus landmark."],
      ["South Congress Avenue", "South Congress is a busy commercial corridor south of downtown with shops, restaurants, music, street activity and a clear view back toward the Capitol. Its appeal comes from walking a manageable stretch and choosing a few places that interest you, not from checking off every storefront associated with an Austin postcard. Traffic and parking can be frustrating during peak periods, making rideshare, transit or a longer walk attractive. Late afternoon into evening pairs naturally with food and live music while avoiding some of the strongest midday heat."],
      ["Live music districts", "Austin's live-music reputation is spread across multiple districts and venues rather than contained in one official street. Downtown and the Red River Cultural District offer dense choices, while South Congress, East Austin and other areas support very different scenes. Pick performances from current calendars instead of wandering toward whichever doorway is loudest, especially if a particular genre matters to you. Building one evening around a small number of venues usually produces a better experience than racing across the city collecting stage time."],
      ["Mount Bonnell and west Austin viewpoints", "Mount Bonnell provides a short climb to a high overlook above the Colorado River and west Austin hills. The viewpoint reveals limestone topography and a greener, more dissected landscape than the flat downtown grid suggests. Parking is limited and the exposed stairs can be uncomfortable in summer heat, so early morning or near-sunset timing is usually more pleasant. Treat it as part of a west-side outing rather than bouncing from the overlook back to downtown between every attraction."]
    ],
    seasons: [
      "Spring is especially popular for comfortable outdoor weather, wildflowers and events, though stormy periods are possible.",
      "Summer is very hot; plan strenuous outdoor activity early, use water and shade, and reserve midday for swimming or indoor attractions.",
      "Fall remains warm and active, while winter is generally mild but can include abrupt cold spells."
    ],
    tips: [
      "Group the Capitol, downtown, Lady Bird Lake and South Congress rather than making repeated cross-city drives.",
      "Treat heat as a scheduling constraint from late spring through early fall and carry more water than you think you need.",
      "Check current Barton Springs access and bat-season conditions before relying on either experience.",
      "Use transit, rideshare, walking and cycling selectively because central parking and traffic can erase the apparent convenience of a car."
    ],
    faq: [
      ["How many days should I spend in Austin?", "Three days gives time for the central city, music and food, river recreation and one university or west-side outing; add time for Hill Country excursions."],
      ["Can I explore Austin without a car?", "Central Austin can be explored with walking, transit, cycling and rideshare, but a car becomes more useful for distant Hill Country or regional destinations."],
      ["Is Hamilton Pool in Austin?", "No. Hamilton Pool Preserve is in western Travis County outside central Austin and should be planned as a separate regional excursion with its own access rules."]
    ],
    tourism: "https://www.austintexas.org/",
    subheadline: "Explore Austin through state history, live music, the Colorado River, limestone springs and walkable central districts."
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

export const enhancePhase1ParagonCityGuide = (
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
