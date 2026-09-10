import type { GuideContent } from "./guideData";
import { getTier1IntlPoisForCity } from "./cityPois/tier1/world";

type Poi = { title: string; description: string };

type InternationalGuideProfile = {
  overview: string;
  context: string;
  planning: string;
  season: string;
  pack: string;
  pois?: Poi[];
};

const profiles: Record<string, InternationalGuideProfile> = {
  "australia/sydney": {
    overview:
      "Sydney is best understood as a harbor city first: sandstone headlands, drowned river valleys and Pacific beaches shape how its neighborhoods, ferries and landmarks fit together. A strong first visit combines the central harbor with at least one coastal walk so the city is experienced as a landscape rather than a checklist of icons.",
    context:
      "The Sydney Opera House and Harbour Bridge sit on opposite edges of Sydney Cove, while ferries radiate from Circular Quay to waterfront districts and beaches. That geography makes the harbor itself one of the city's most useful pieces of public transport and one of its defining visitor experiences.",
    planning:
      "Group Circular Quay, The Rocks, the Opera House and Royal Botanic Garden on foot, then use ferries or trains for farther districts. Allow separate time for a coastal walk because Bondi, Coogee and the harbor foreshore reveal a very different side of Sydney from the central business district.",
    season:
      "Sydney is a year-round destination, with warm summers, mild winters and stronger beach demand from roughly December through February. Spring and autumn are especially comfortable for long walks and harbor sightseeing.",
    pack:
      "Bring sun protection, comfortable walking shoes and a light layer for ferry decks and coastal wind. Swimwear is useful if beaches are part of the day, but ocean conditions should always be checked locally.",
  },
  "austria/vienna": {
    overview:
      "Vienna layers an imperial capital, a dense museum quarter, coffeehouse culture and large public parks around a highly usable tram and metro network. The most rewarding itinerary moves between the historic center and former Habsburg complexes rather than treating every palace and church as an isolated stop.",
    context:
      "The Ringstrasse encircles the old city and links many nineteenth-century civic buildings, while the Hofburg, Schönbrunn Palace and Belvedere preserve different chapters of Habsburg rule. Vienna's music history is equally tangible in concert halls, churches and former residences woven into ordinary streets.",
    planning:
      "Walk the Innere Stadt and Ringstrasse as one cluster, then reserve separate half-days for major palace or museum complexes. Public transport is frequent enough that a car is unnecessary for nearly all central sightseeing.",
    season:
      "Late spring and early autumn offer mild weather for walking, while December is popular for Christmas markets and indoor cultural visits. Summer can be warm, so early starts help on palace grounds and exposed plazas.",
    pack:
      "Pack comfortable shoes for stone streets, a light rain layer and clothing suitable for churches and formal cultural venues. In winter, add warm layers for long periods outdoors at markets and palace grounds.",
  },
  "france/paris": {
    overview:
      "Paris grew around the Seine, and the river remains the easiest way to understand the relationship among the historic core, grand monuments, museums and neighborhoods. A useful first visit groups sights by arrondissement and leaves enough unstructured time for markets, parks and street life between major reservations.",
    context:
      "The Île de la Cité contains the medieval heart of Paris, while later royal, imperial and republican projects spread monumental axes westward through the Louvre, Tuileries and Champs-Élysées. The city's museums occupy everything from former palaces to railway stations, so architecture and collections are often inseparable parts of the visit.",
    planning:
      "Reserve timed-entry attractions before arrival, then cluster nearby landmarks rather than crossing the city repeatedly. The Metro and RER handle longer hops efficiently, but many of the most memorable connections between sights are short walks along the Seine or through adjoining neighborhoods.",
    season:
      "Late spring and early autumn usually bring comfortable walking weather and long daylight, while summer has the highest visitor pressure at headline attractions. Winter is colder and darker but works well for museum-heavy itineraries.",
    pack:
      "Bring supportive walking shoes, a compact rain layer and a small day bag that works with museum security rules. A light layer is useful year-round for evenings along the Seine.",
  },
  "germany/berlin": {
    overview:
      "Berlin is a city where twentieth-century history, Prussian monuments, contemporary culture and large green spaces sit side by side rather than in a single old-town core. The strongest guide therefore connects specific sites to the political eras and neighborhoods that shaped them.",
    context:
      "Museum Island and the Brandenburg Gate represent older monumental Berlin, while the Reichstag, remnants of the Wall and Cold War sites document the city's division and reunification. Former industrial and residential districts now contain many of the galleries, music venues and food scenes that define contemporary Berlin.",
    planning:
      "Use the U-Bahn, S-Bahn and trams to connect districts, but walk within each cluster to keep the history legible. Pair major memorials with museums or neighborhood stops so difficult historical material is not reduced to a rapid photo circuit.",
    season:
      "Late spring through early autumn gives the best conditions for parks, riverfronts and long neighborhood walks. Winter is cold but well suited to museums, concerts and indoor cultural sites.",
    pack:
      "Bring comfortable shoes, a weatherproof layer and transit-ready day gear. Berlin's weather can shift quickly, so a compact umbrella or rain shell is useful outside midsummer.",
  },
  "italy/florence": {
    overview:
      "Florence is unusually compact for a city with such an outsized role in Renaissance art and architecture. The historic center can be crossed on foot, but its museums, churches and viewpoints deserve deliberate pacing rather than an attempt to collect masterpieces in a single day.",
    context:
      "The Duomo, Palazzo Vecchio, Uffizi and Ponte Vecchio form a tight civic core shaped by the wealth and politics of medieval and Renaissance Florence. Across the Arno, Oltrarno adds workshops, gardens and elevated viewpoints that balance the monument-heavy center.",
    planning:
      "Book the Uffizi, Accademia and major dome or tower climbs ahead when they are priorities. Walk nearly everything in the center and use early mornings or evenings for plazas and bridges when day-trip crowds are lighter.",
    season:
      "Spring and autumn are generally most comfortable for walking, while summer is hot and crowded in the historic center. Winter is quieter and can be excellent for museums.",
    pack:
      "Wear supportive shoes for stone paving and bring shoulder-and-knee coverage for churches. A refillable water bottle and sun protection are useful in the warmer months.",
  },
  "italy/rome": {
    overview:
      "Rome is less a single historic center than a stack of cities built across more than two millennia, from Republican and Imperial ruins to papal Rome and the modern capital. A good itinerary connects nearby layers on foot instead of treating the Colosseum, Vatican and baroque center as unrelated attractions.",
    context:
      "Ancient Rome is concentrated around the Colosseum, Forum and Palatine, while the Pantheon and Piazza Navona show how later city life absorbed classical structures. Across the Tiber, Vatican City forms a separate sovereign state whose museums and basilica require their own planning window.",
    planning:
      "Reserve the Colosseum archaeological area and Vatican Museums in advance, and avoid scheduling both as rushed half-visits on the same day. Central Rome rewards walking, but buses and Metro lines are useful when moving between distant clusters.",
    season:
      "Spring and autumn are usually the most comfortable seasons for long walks and archaeological sites. Summer can be very hot and crowded, so early entries and shaded midday breaks matter.",
    pack:
      "Bring excellent walking shoes, sun protection and a refillable bottle. Churches require respectful dress, so carry a light layer that can cover shoulders and knees when needed.",
  },
  "italy/venice": {
    overview:
      "Venice is a lagoon city built across islands, canals and pedestrian lanes where water transport replaces ordinary roads. Its character becomes clearer when visitors move beyond Piazza San Marco and use vaporetto routes and neighborhood walks to understand how the city actually functions.",
    context:
      "The Grand Canal curves through the historic city and is lined by palaces that document centuries of mercantile wealth. San Marco represents the ceremonial center, while districts such as Cannaregio, Dorsoduro and Castello reveal quieter residential, religious and maritime layers.",
    planning:
      "Walk between adjoining sestieri and use vaporetti for longer crossings or lagoon islands. Allow extra time for navigation because bridges, dead ends and narrow lanes are part of the experience rather than an inconvenience to eliminate.",
    season:
      "Spring and autumn balance moderate temperatures with somewhat lighter crowds than peak summer. Winter can be atmospheric and quieter, though high-water events and cold damp weather remain possible.",
    pack:
      "Wear shoes that can handle long walks over stone bridges and occasional wet pavement. Pack light because stairs, boats and narrow lanes make large luggage especially awkward.",
  },
  "netherlands/amsterdam": {
    overview:
      "Amsterdam's seventeenth-century canal belt gives the city a clear physical structure, with major museums, historic houses and neighborhood streets packed into a relatively small area. Walking, trams and bicycles make the center easy to explore without a car, but cycling lanes require attentive pedestrian behavior.",
    context:
      "The concentric canals were part of a planned expansion during the Dutch Golden Age and remain lined with narrow merchant houses, bridges and former warehouses. Museumplein forms a separate cultural cluster, while Jordaan and De Pijp offer different residential and commercial textures.",
    planning:
      "Reserve the Anne Frank House and major art museums well in advance, then group the canal belt, Jordaan and central station area on foot. Use trams for longer cross-city moves and never treat a bicycle lane as an extension of the sidewalk.",
    season:
      "Late spring through early autumn provides long daylight and the easiest canal-side walking weather. Winter is colder and wetter but quieter, with museums and cafés taking on more of the itinerary.",
    pack:
      "Bring rain protection, comfortable shoes and layers for wind along canals. If cycling, use a properly fitted rental bicycle and follow local traffic rules rather than improvising as a pedestrian on wheels.",
  },
  "portugal/lisbon": {
    overview:
      "Lisbon rises over a series of steep hills above the Tagus estuary, so viewpoints, funiculars, tiled facades and waterfront districts are part of the city's basic geography. The most useful itinerary separates the medieval hill neighborhoods from monumental Belém and allows extra time for elevation changes.",
    context:
      "Alfama preserves a dense street pattern below São Jorge Castle, while Baixa reflects the planned rebuilding that followed the 1755 earthquake. Belém, farther west, concentrates monuments associated with Portugal's maritime expansion and is best treated as its own half-day district.",
    planning:
      "Use trams, Metro, funiculars and elevators strategically, but expect substantial walking on cobbles and slopes. Visit the most famous miradouros early or late, when the light is better and tour groups are thinner.",
    season:
      "Spring and autumn offer warm but generally manageable walking weather. Summer is dry and sunny but can be hot on exposed hills, while winter is mild with more rain.",
    pack:
      "Wear shoes with good grip for polished cobblestones and carry sun protection. A light rain shell is useful outside summer, and layers help when Atlantic wind reaches the hilltops.",
  },
  "scotland/edinburgh": {
    overview:
      "Edinburgh is defined by dramatic volcanic topography: the Old Town occupies a ridge running from Edinburgh Castle to Holyrood, while Arthur's Seat and Salisbury Crags rise immediately beside the historic core. That physical setting makes the city as much a landscape destination as an architectural one.",
    context:
      "The medieval Old Town and Georgian New Town form a UNESCO-listed urban ensemble separated by the gardens below Princes Street. The Royal Mile links castle, closes, civic buildings and Holyrood, while nearby hills provide unusually immediate views over the Firth of Forth and surrounding countryside.",
    planning:
      "Walk the Old Town ridge in one direction rather than repeatedly climbing it, then give the New Town or Arthur's Seat a separate block of time. Festival season transforms crowd levels and accommodation demand, so August requires especially early planning.",
    season:
      "Late spring and early autumn offer long daylight with somewhat lower demand than the August festival peak. Weather is changeable in every season, and winter days are short.",
    pack:
      "Bring waterproof outerwear, layers and shoes with reliable traction for stone streets and hill paths. Wind protection matters on exposed viewpoints even when central streets feel mild.",
  },
  "spain/barcelona": {
    overview:
      "Barcelona combines a Roman and medieval core, the gridded Eixample, modernist architecture and a Mediterranean waterfront beneath the Collserola hills. Its best-known buildings make more sense when paired with the neighborhoods and planning history around them.",
    context:
      "The Gothic Quarter preserves the oldest urban layers, while the nineteenth-century Eixample created the broad blocks that became a showcase for Gaudí and other Catalan modernists. Montjuïc and the waterfront add large-scale parks, museums and views that broaden the city beyond architecture alone.",
    planning:
      "Book Sagrada Família and Park Güell ahead, then group nearby Eixample architecture rather than crisscrossing the city. Metro service is extensive, but walking within the Gothic Quarter, Eixample and waterfront clusters reveals the city plan far better.",
    season:
      "Spring and autumn are usually ideal for walking, with warm weather and less heat than midsummer. Summer brings beach demand and heavy visitor pressure at major monuments.",
    pack:
      "Bring comfortable shoes, sun protection and a light layer for churches and evening sea breezes. Keep valuables secure in crowded transit and landmark areas.",
  },
  "spain/madrid": {
    overview:
      "Madrid is an inland capital organized around grand boulevards, royal spaces, major art museums and extensive urban parks rather than a single medieval showpiece. The Prado-Recoletos corridor and the historic center provide two natural sightseeing clusters.",
    context:
      "The Royal Palace and Plaza Mayor reflect Habsburg and Bourbon Madrid, while the Prado, Thyssen and Reina Sofía form one of Europe's strongest concentrations of art museums. Retiro Park and neighborhood markets keep the city from feeling like a procession of formal monuments.",
    planning:
      "Choose one major museum per half-day and pair it with Retiro or nearby streets rather than stacking galleries back to back. The Metro is fast for cross-city moves, while the central core remains highly walkable.",
    season:
      "Spring and autumn provide the most comfortable temperatures for walking. Summer can be intensely hot in the afternoon, while winter is cool but often bright and well suited to museums.",
    pack:
      "Bring supportive shoes, sun protection and a refillable water bottle in warm weather. A light jacket is useful for cooler evenings and heavily air-conditioned museums.",
  },
  "united-kingdom/london": {
    overview:
      "London is a network of historic centers rather than one compact downtown, with royal Westminster, the old City, museum districts and river neighborhoods spread along the Thames. Successful planning depends on grouping nearby places and using the Underground between clusters.",
    context:
      "Westminster concentrates Parliament, the abbey and major royal spaces, while the City of London preserves the medieval commercial core around St Paul's and the Tower. The Thames ties these districts together and makes walking or river transport especially useful for understanding their relationship.",
    planning:
      "Build days around geographic clusters such as Westminster, the South Bank, the City or South Kensington. Reserve high-demand attractions when required, but leave room for parks, markets and neighborhood walks that show London beyond its ceremonial landmarks.",
    season:
      "Late spring through early autumn gives long daylight and the easiest park weather, although rain is possible year-round. Winter offers shorter days but strong museum, theatre and indoor cultural options.",
    pack:
      "Carry a waterproof layer, comfortable walking shoes and adaptable layers. Contactless payment works widely on public transport, reducing the need to manage separate tickets for most city travel.",
  },
  "greece/athens": {
    overview:
      "Athens is one of the clearest places in Europe to read an ancient city inside a modern capital, with the Acropolis rising above archaeological sites, neoclassical districts and dense contemporary neighborhoods. The best first visit connects the monuments by foot so their relationship across the basin remains visible.",
    context:
      "Classical Athens is concentrated around the Acropolis, Agora and civic spaces below the hill, while later Roman, Byzantine and Ottoman layers survive throughout the center. Modern Athens spreads far beyond those ruins, but districts such as Plaka and Monastiraki keep many major sites within a walkable core.",
    planning:
      "Visit the Acropolis early to avoid the strongest heat and crowding, then continue through the Agora, museum and lower historic neighborhoods. Metro service is useful for longer trips, but central archaeological Athens is best understood on foot.",
    season:
      "Spring and autumn are the most comfortable seasons for exposed archaeological sites. Summer can be extremely hot, so morning visits, water and shade breaks are essential.",
    pack:
      "Bring sun protection, plenty of water and shoes with grip for polished stone. A light layer is useful for churches, museums and evenings after the heat drops.",
    pois: [
      { title: "Acropolis and Parthenon", description: "The Acropolis rises on a limestone hill above central Athens and contains the Parthenon, Erechtheion, Propylaea and Temple of Athena Nike. These fifth-century BCE monuments formed the ceremonial heart of Classical Athens and still provide the clearest overview of the ancient city's setting. Visit early because the exposed rock becomes hot and crowded later in the day." },
      { title: "Acropolis Museum", description: "The Acropolis Museum stands at the south foot of the hill and displays sculpture and architectural material excavated from the Acropolis. Glass floors reveal archaeological remains beneath the modern building, while the top gallery aligns visually with the Parthenon above. Visiting the museum before or after the site gives far more context than seeing the ruins alone." },
      { title: "Ancient Agora", description: "The Ancient Agora was the civic and commercial center of Classical Athens, where political, legal, religious and everyday life overlapped. The exceptionally preserved Temple of Hephaestus stands above the site, and the reconstructed Stoa of Attalos houses the Agora Museum. Walking the grounds makes Athenian democracy feel spatial rather than abstract." },
      { title: "Plaka and Anafiotika", description: "Plaka spreads across the lower slopes north and east of the Acropolis with narrow streets, neoclassical houses, small churches and archaeological fragments. Within it, Anafiotika is a tiny nineteenth-century quarter built by island craftsmen and known for whitewashed lanes that resemble Cycladic villages. The area works best as a walking district rather than a single photo stop." },
      { title: "National Archaeological Museum", description: "The National Archaeological Museum holds Greece's largest collection of ancient Greek art and archaeology, including Mycenaean gold, sculpture, pottery and bronzes. Its collections extend far beyond Athens and place the Acropolis monuments within the broader development of Greek civilization. Allow several hours if archaeology is a major reason for the trip." },
      { title: "Mount Lycabettus", description: "Mount Lycabettus rises above central Athens to a summit roughly 277 meters above sea level. Paths and a funicular provide access to a viewpoint over the Acropolis, Saronic Gulf and surrounding mountains. Late afternoon makes the city's basin geography especially easy to read." },
    ],
  },
  "hungary/budapest": {
    overview:
      "Budapest is two historic urban halves joined across the Danube: hilly Buda on the west bank and flatter Pest on the east. Bridges, thermal springs and a dramatic riverfront shape the city as strongly as its individual monuments.",
    context:
      "Castle Hill and older Buda occupy high ground above the river, while Parliament, boulevards and much of the commercial city spread across Pest. The thermal-bath tradition reflects natural hot springs beneath the region and is a living part of Budapest rather than a decorative historic theme.",
    planning:
      "Walk Castle Hill and the Danube banks as linked districts, then use trams or Metro lines for baths, museums and farther neighborhoods. Evening river views are important enough to reserve time for rather than treating them as incidental transit.",
    season:
      "Spring and autumn are especially comfortable for riverfront walking. Summer is lively and warm, while winter is cold but pairs naturally with thermal baths and indoor cultural sites.",
    pack:
      "Bring comfortable shoes, layers for river wind and swimwear if thermal baths are planned. A small towel and sandals may be useful depending on the bath complex and ticket type.",
    pois: [
      { title: "Hungarian Parliament Building", description: "The Hungarian Parliament Building stretches along the Pest bank of the Danube and is one of Europe's largest parliamentary complexes. Completed around the turn of the twentieth century, its Gothic Revival exterior and riverfront dome dominate central Budapest. Guided interior visits reveal the grand staircase, legislative chambers and Hungarian Crown Jewels." },
      { title: "Buda Castle and Castle Hill", description: "Castle Hill contains the former royal palace complex, medieval streets and major museums above the west bank of the Danube. Rebuilding across centuries means the district is a layered record of Hungarian royal, Habsburg and wartime history rather than a single-period castle. Walk the hill slowly because viewpoints open repeatedly toward Pest and the river." },
      { title: "Fisherman's Bastion and Matthias Church", description: "Fisherman's Bastion is a late nineteenth-century terrace built beside the much older Matthias Church on Castle Hill. Its arcades frame some of the best views across the Danube to Parliament, while the church preserves a long history of coronations and reconstruction. The pair is most rewarding early or near dusk when the terrace is less congested." },
      { title: "Széchenyi Thermal Bath", description: "Széchenyi is one of Budapest's largest thermal-bath complexes and occupies a grand Neo-Baroque building in City Park. Indoor and outdoor pools are supplied by hot mineral water drawn from deep wells beneath the city. The visit is both architectural and social, showing how Budapest's geothermal resources became part of everyday urban culture." },
      { title: "Great Market Hall", description: "The Great Market Hall opened in the late nineteenth century near the Pest end of Liberty Bridge. Its iron-and-brick interior remains an active food market with produce, meat, spices and prepared foods alongside visitor-oriented stalls. Go in the morning to see more of its ordinary market function before the busiest sightseeing period." },
      { title: "Danube Promenade and Chain Bridge", description: "The central Danube embankments provide direct views between Buda Castle, Parliament and the bridges that physically unified the city. The Széchenyi Chain Bridge, opened in 1849, was the first permanent bridge linking Buda and Pest. Walking this river corridor after dark reveals why Budapest's illuminated skyline is inseparable from the Danube itself." },
    ],
  },
  "denmark/copenhagen": {
    overview:
      "Copenhagen combines a royal capital, working harbor, strong cycling culture and compact historic center around waterways that were once central to trade and defense. The city is easiest to understand on foot, bicycle and harbor transit rather than from a car.",
    context:
      "Indre By contains royal palaces, churches and the old commercial core, while former harbor and industrial areas have been reshaped into promenades, swimming areas and cultural districts. The result is a city where historic architecture and contemporary public-space design constantly overlap.",
    planning:
      "Walk the central core and Nyhavn, then use Metro, harbor buses or bicycles for farther districts. Build in time for parks and waterfronts because Copenhagen's public realm is one of its main attractions, not merely space between monuments.",
    season:
      "Late spring through early autumn offers long daylight and the best conditions for cycling and waterfront time. Winter is dark and cold but atmospheric, with museums, cafés and holiday markets taking a larger role.",
    pack:
      "Bring a windproof rain layer, comfortable shoes and gloves outside summer. If cycling, follow local lane etiquette carefully because bicycle traffic is fast and highly organized.",
    pois: [
      { title: "Nyhavn", description: "Nyhavn is a seventeenth-century canal lined with brightly painted townhouses, historic wooden vessels and restaurants. It was developed as a commercial harbor linking the inner city to the sea and later became one of Copenhagen's most recognizable public spaces. Walk the canal early to appreciate the architecture before restaurant traffic peaks." },
      { title: "Rosenborg Castle and King's Garden", description: "Rosenborg Castle was built in the early seventeenth century for Christian IV and now houses royal collections including the Danish Crown Jewels. The surrounding King's Garden is Copenhagen's oldest royal garden and one of the city's most used green spaces. The castle and park together show how royal architecture became part of everyday public life." },
      { title: "Christiansborg Palace", description: "Christiansborg Palace occupies Slotsholmen, a small island that has been a center of Danish government for centuries. The complex houses Parliament, the Prime Minister's Office and Supreme Court alongside royal reception rooms. Excavated ruins beneath the palace reveal earlier castles on the same strategic site." },
      { title: "Tivoli Gardens", description: "Tivoli opened in 1843 just outside the old city walls and remains one of the world's oldest operating amusement parks. Gardens, restaurants, performance spaces and rides create a more layered experience than a modern theme park alone. Evening illumination is a major part of Tivoli's atmosphere." },
      { title: "National Museum of Denmark", description: "The National Museum occupies the Prince's Palace near Christiansborg and traces Danish history from prehistory through the Viking Age and later monarchy. Its archaeological collections include some of the country's most important objects and provide context for sites seen elsewhere in Copenhagen. It is especially useful on poor-weather days or before excursions to historic sites outside the city." },
      { title: "The Little Mermaid and Kastellet", description: "The Little Mermaid sculpture sits on the harbor edge beside Kastellet, a well-preserved star-shaped fortress. The statue is small, but the surrounding walk through ramparts, moat and waterfront makes the stop more substantial than the monument alone. Continue through nearby Churchill Park and the harbor for a coherent northern waterfront loop." },
    ],
  },
  "ireland/dublin": {
    overview:
      "Dublin is a compact capital shaped by the River Liffey, Georgian expansion, literary culture and institutions that tell the story of Irish independence. Many major sites lie within walking distance, but the strongest itinerary balances historic interiors with ordinary streets, parks and river crossings.",
    context:
      "The medieval core grew south of the Liffey, Georgian Dublin expanded around broad squares and terraces, and the Docklands now occupy former port and warehouse districts to the east. Museums, churches and former prisons provide unusually direct access to the political and social history of modern Ireland.",
    planning:
      "Group Trinity, Dublin Castle, St Patrick's and the central museums on foot, then reserve separate time for Kilmainham or the Docklands. Book Kilmainham Gaol well ahead because capacity is limited and demand is high.",
    season:
      "Late spring through early autumn provides the longest daylight, though rain remains possible at any time. Winter is cool and damp but well suited to museums, pubs and indoor cultural visits.",
    pack:
      "Bring a waterproof outer layer and comfortable shoes for uneven streets. Layers are more useful than a single heavy garment because temperatures and wind can change quickly.",
    pois: [
      { title: "Trinity College and the Book of Kells", description: "Trinity College was founded in 1592 and occupies a historic campus in the center of Dublin. Its Old Library is famous for the medieval Book of Kells and the long barrel-vaulted room traditionally known as the Long Room. Timed entry helps manage crowds around one of Ireland's most visited cultural treasures." },
      { title: "Dublin Castle", description: "Dublin Castle developed from a medieval fortress into the center of British administration in Ireland. State Apartments, courtyards and archaeological remains show how the complex changed across centuries before becoming a ceremonial site of the Irish state. It provides essential political context for many other Dublin landmarks." },
      { title: "St Patrick's Cathedral", description: "St Patrick's is Ireland's largest cathedral and stands near a site traditionally associated with the country's patron saint. The present Gothic building dates largely from the medieval period and contains memorials connected to Irish history, including Jonathan Swift, who served as dean. The surrounding green provides a useful pause in the dense south-central city." },
      { title: "Kilmainham Gaol", description: "Kilmainham Gaol held political prisoners and ordinary inmates from the late eighteenth century until its closure in 1924. Leaders of the 1916 Easter Rising were imprisoned and executed here, making the site central to understanding Irish independence. Guided visits are structured and often sell out, so advance booking is important." },
      { title: "National Museum of Ireland — Archaeology", description: "The archaeology branch of the National Museum displays prehistoric gold, Viking material and objects from early medieval Ireland. The collections include bog bodies and metalwork that connect Dublin to landscapes and societies across the island. Admission is free, making it one of the city's highest-value historical stops." },
      { title: "EPIC and the Docklands", description: "EPIC The Irish Emigration Museum occupies restored vaults in the nineteenth-century Custom House Quarter. Its exhibits examine the global Irish diaspora, while the surrounding Docklands show how former port infrastructure has been converted into offices, housing and public space. Walking here adds a modern chapter to a city itinerary dominated by older monuments." },
    ],
  },
  "germany/munich": {
    overview:
      "Munich combines a royal Bavarian capital, major museums, beer-hall traditions and broad green spaces at the northern edge of the Alps. Its historic center is compact, but palace grounds and the English Garden expand the visitor geography well beyond Marienplatz.",
    context:
      "The Wittelsbach dynasty shaped the Residenz, Nymphenburg and much of central Munich, while nineteenth-century boulevards and museums reflect Bavaria's rise as a kingdom. Modern Munich also carries difficult twentieth-century history that is interpreted at sites throughout the center.",
    planning:
      "Walk Marienplatz, the Residenz and Viktualienmarkt as one central cluster, then use U-Bahn, tram or S-Bahn for Nymphenburg and farther districts. Keep one flexible block for the English Garden or Isar when weather is good.",
    season:
      "Late spring through early autumn is best for parks and beer gardens, while late September and early October bring Oktoberfest crowds and sharply higher accommodation demand. Winter is cold but strong for museums and Christmas markets.",
    pack:
      "Bring comfortable shoes, a rain layer and warmer clothing outside summer. If visiting churches or formal concert venues, carry clothing suitable for quieter indoor settings.",
    pois: [
      { title: "Marienplatz and Neues Rathaus", description: "Marienplatz has served as Munich's central square since the city's medieval period. The ornate New Town Hall dominates the north side and contains the famous Glockenspiel, while nearby lanes lead directly to major churches and markets. It is the best orientation point for understanding the compact historic center." },
      { title: "Munich Residenz", description: "The Munich Residenz grew over centuries as the main palace of Bavaria's Wittelsbach rulers. State rooms, courtyards, the Treasury and the richly decorated Antiquarium make it one of Europe's largest urban palace complexes. Allow several hours because the site is far more extensive than its street frontage suggests." },
      { title: "English Garden", description: "The English Garden is one of the world's largest urban parks and stretches north from near the historic center along the Isar. Meadows, wooded paths, beer gardens and the Eisbach wave give it a distinctly local recreational character. Walking or cycling through it provides a needed contrast to palace and museum interiors." },
      { title: "Deutsches Museum", description: "The Deutsches Museum occupies an island in the Isar and is one of the world's major museums of science and technology. Collections range across aviation, engineering, physics and transportation, with many exhibits designed around how things work rather than static display alone. It is easily a half-day stop for visitors interested in science or industrial history." },
      { title: "Nymphenburg Palace", description: "Nymphenburg Palace began as a seventeenth-century summer residence west of central Munich and expanded into a vast baroque complex. Formal gardens, canals, pavilions and royal interiors spread across a landscape large enough to justify a separate half-day. Trams provide straightforward access from the center." },
      { title: "Viktualienmarkt", description: "Viktualienmarkt is a daily food market just south of Marienplatz with produce, cheese, meat, flowers and prepared specialties. It developed from Munich's older central market and remains integrated into ordinary city life rather than functioning only as a visitor attraction. Mid-morning is a good time to see the market active before lunch crowds peak." },
    ],
  },
  "portugal/porto": {
    overview:
      "Porto descends steeply to the Douro River, with granite streets, tiled facades and bridges revealing how trade shaped the city. The historic center and Vila Nova de Gaia face each other across the river, so viewpoints and crossings are essential parts of the itinerary.",
    context:
      "Ribeira occupies the old riverfront below the cathedral and commercial center, while Gaia developed as the traditional location of port-wine lodges. The Dom Luís I Bridge physically links the two and provides one of the clearest views of the Douro gorge-like urban setting.",
    planning:
      "Walk downhill through the historic center, cross the Dom Luís I Bridge and use Metro or funicular options to avoid repeating every steep climb. Reserve cellar visits if port wine is a priority, particularly during busy weekends.",
    season:
      "Spring and early autumn are especially pleasant for walking, while summer is warm and busy along the river. Winter is mild but wetter, making museums, churches and cellar visits useful anchors.",
    pack:
      "Wear shoes with good grip for steep stone streets and bring a light rain layer outside summer. Sun protection is useful on exposed riverfront walks and bridge crossings.",
    pois: [
      { title: "Ribeira", description: "Ribeira is Porto's historic riverfront quarter, where narrow medieval streets descend to the Douro beside tall, tightly packed houses. Cafés and boats now fill the waterfront, but the district's form still reflects centuries of river trade. Walk both the upper lanes and quay to understand how sharply the city rises from the water." },
      { title: "Dom Luís I Bridge", description: "The double-deck Dom Luís I Bridge opened in the nineteenth century and spans the Douro between Porto and Vila Nova de Gaia. Its iron arch is one of the defining structures of the city, and the upper deck provides broad pedestrian views over Ribeira, Gaia and the river. Crossing at one level and returning at the other creates a useful loop." },
      { title: "São Bento Railway Station", description: "São Bento Station occupies the site of a former monastery in central Porto and is famous for blue-and-white azulejo panels in its entrance hall. The scenes depict episodes of Portuguese history and regional life, turning a working railway station into a major artistic landmark. It is especially effective as a short stop between the cathedral area and lower city." },
      { title: "Clérigos Tower", description: "The baroque Clérigos Church and its tall granite bell tower were designed by Nicolau Nasoni in the eighteenth century. Climbing the narrow tower gives a 360-degree view over Porto's roofs, the Douro and surrounding hills. Timed entry can reduce congestion on the tight stairway." },
      { title: "Palácio da Bolsa", description: "The nineteenth-century Stock Exchange Palace was built by Porto's Commercial Association near the riverfront. Its interiors culminate in the richly decorated Arab Room, reflecting the wealth generated by trade and finance. Guided visits make the building's ceremonial spaces far more meaningful than viewing the exterior alone." },
      { title: "Livraria Lello", description: "Livraria Lello is a historic bookshop known for its Neo-Gothic facade, carved interior and dramatic central staircase. Its fame now produces heavy visitor traffic and timed ticketing, so it should be approached as an architectural interior as much as a browsing bookstore. Early reservations offer the calmest experience." },
    ],
  },
  "czech-republic/prague": {
    overview:
      "Prague is organized around the Vltava River and a remarkably intact sequence of medieval, baroque and nineteenth-century districts. Castle Hill, Malá Strana, Charles Bridge and Old Town form a natural walking spine that gives the city far more coherence than a list of isolated monuments.",
    context:
      "Prague Castle dominates the west bank, while Old Town and the Jewish Quarter developed on the opposite side of the river. Gothic churches, baroque palaces and later civic buildings overlap throughout the center because Prague escaped much of the large-scale wartime destruction experienced by many European capitals.",
    planning:
      "Start early on the Charles Bridge or Castle Hill, then work downhill through adjoining districts rather than repeatedly crossing the river. Trams are especially useful for climbing back to higher neighborhoods and reaching sites beyond the central walking zone.",
    season:
      "Late spring and early autumn offer comfortable temperatures with somewhat less crowd pressure than midsummer. Winter is cold but atmospheric, especially around the old center and Christmas markets.",
    pack:
      "Bring supportive shoes for cobblestones, layers and a rain-resistant outer shell. Winter visits require warm footwear and gloves because long outdoor walks are central to the experience.",
    pois: [
      { title: "Prague Castle and St Vitus Cathedral", description: "Prague Castle is a vast hilltop complex that has served Bohemian kings, Holy Roman emperors and Czech presidents. St Vitus Cathedral rises at its center with Gothic architecture, royal tombs and stained glass spanning centuries of construction. Arrive early and allow time for courtyards, churches and viewpoints rather than treating the complex as one building." },
      { title: "Charles Bridge", description: "Charles Bridge crosses the Vltava between Old Town and Malá Strana on a stone structure begun in the fourteenth century. Baroque statues line the parapets, while views open toward Prague Castle and river islands. Dawn or early morning is dramatically calmer than midday and makes the bridge's urban role easier to appreciate." },
      { title: "Old Town Square and Astronomical Clock", description: "Old Town Square is framed by medieval and baroque facades, the Church of Our Lady before Týn and the Old Town Hall. The astronomical clock dates to the early fifteenth century and performs an hourly mechanical display. Explore the surrounding lanes rather than leaving immediately after the clock strikes." },
      { title: "Josefov, the Jewish Quarter", description: "Josefov preserves major sites of Prague's historic Jewish community, including synagogues, the Old Jewish Cemetery and the Jewish Museum collections. The district's surviving religious buildings document centuries of community life, persecution and resilience. A combined museum ticket is useful because the principal sites are distributed across several streets." },
      { title: "Vyšehrad", description: "Vyšehrad is a historic fortified hill above the Vltava south of the busiest center. Ramparts, the Basilica of St Peter and St Paul and the national cemetery provide history and broad river views with fewer crowds than Castle Hill. The site also reveals how Prague's defensive geography extended beyond the famous castle." },
      { title: "Petřín Hill", description: "Petřín is a large green hill west of the river with gardens, wooded paths and a lookout tower inspired by the Eiffel Tower. A funicular normally links the lower city with the upper park when in service. Walking the ridge gives a quieter perspective on Prague's red roofs and church towers." },
    ],
  },
  "iceland/reykjavik": {
    overview:
      "Reykjavik is a small North Atlantic capital whose cultural life sits directly beside a working harbor and a geologically active landscape. The city itself can be explored quickly, but its museums and viewpoints are valuable preparation for understanding Iceland beyond the tour bus window.",
    context:
      "The old center developed around the harbor, while Hallgrímskirkja rises on higher ground and acts as a visual reference across the city. Geothermal energy, fishing and Iceland's settlement history appear repeatedly in museums, public pools and daily infrastructure.",
    planning:
      "Walk the center, waterfront and harbor in one compact loop, then use buses or taxis for farther museums if weather is poor. Keep enough flexibility for rapidly changing wind and precipitation, especially when city time is paired with excursions outside Reykjavik.",
    season:
      "Summer brings very long daylight and milder temperatures, while winter offers short days and the possibility of northern lights under clear dark skies. Weather can change quickly in every season.",
    pack:
      "Bring windproof and waterproof layers, warm mid-layers and shoes that handle wet pavement. Even summer visitors should carry more insulation than they would for a similarly mild temperature in a sheltered continental city.",
    pois: [
      { title: "Hallgrímskirkja", description: "Hallgrímskirkja is Reykjavik's landmark Lutheran church, designed with vertical forms inspired by Icelandic basalt landscapes. The tower rises above the low city and provides one of the best orientation views over colorful roofs, Faxaflói Bay and surrounding mountains. The interior is restrained compared with the dramatic exterior." },
      { title: "Harpa Concert Hall", description: "Harpa stands on the waterfront with a geometric glass facade designed to interact with changing North Atlantic light. It houses the Iceland Symphony Orchestra and major performance spaces, but the public interior is worth entering even without a concert ticket. The building anchors the modern redevelopment of the old harbor edge." },
      { title: "Sun Voyager", description: "The Sun Voyager is a stainless-steel sculpture by Jón Gunnar Árnason on the waterfront east of Harpa. Its ship-like form faces the bay and mountains, making the surrounding setting as important as the sculpture itself. Early morning or evening light produces the strongest views across the water." },
      { title: "National Museum of Iceland", description: "The National Museum traces Icelandic history from settlement in the ninth century through the modern republic. Archaeological objects, religious art and everyday material culture explain how communities adapted to a remote volcanic island. It is one of the best places to build context before visiting historic landscapes elsewhere in the country." },
      { title: "Perlan", description: "Perlan occupies a hilltop complex built around geothermal hot-water storage tanks. Exhibits focus on Icelandic glaciers, volcanoes, water and natural systems, while the observation deck provides broad views over Reykjavik. It works especially well when bad weather limits outdoor excursions but geology remains a priority." },
      { title: "Old Harbor", description: "Reykjavik's Old Harbor remains connected to fishing while also supporting museums, restaurants and whale-watching departures. Walking the quays reveals the maritime economy that preceded the city's modern tourism boom. The nearby Maritime Museum adds useful detail on boats, fisheries and coastal life." },
    ],
  },
  "switzerland/zurich": {
    overview:
      "Zurich sits where the Limmat River leaves Lake Zurich, giving the old town, lakefront and surrounding hills a compact and legible geography. The city is a financial center, but medieval streets, major museums and easy access to viewpoints make it more than a business stop.",
    context:
      "The Altstadt spreads along both banks of the Limmat, anchored by historic churches and guild houses, while nineteenth-century Bahnhofstrasse connects the main station to the lake. Uetliberg rises immediately southwest of the city and provides a natural overlook toward the lake and Alps.",
    planning:
      "Walk the old town and lakefront together, then use trams or trains for museums and Uetliberg. Zurich's transit system is excellent, so a car adds little value inside the city.",
    season:
      "Late spring through early autumn is best for lakefront walking and viewpoints, while winter supports museums, old-town walks and easy rail connections to snowy mountain areas. Rain is possible throughout the year.",
    pack:
      "Bring comfortable walking shoes, layers and a rain shell. In cooler seasons, add warm clothing for exposed lakefronts and hilltop viewpoints.",
    pois: [
      { title: "Altstadt and the Limmat", description: "Zurich's Altstadt occupies both banks of the Limmat between the main station and the lake. Narrow lanes, guild houses, churches and small squares preserve the medieval street pattern even as the district remains an active commercial center. Crossing the river repeatedly on foot is the best way to understand the old city's two halves." },
      { title: "Grossmünster", description: "The twin-towered Grossmünster is one of Zurich's defining churches and is closely associated with the Swiss Reformation led by Huldrych Zwingli. Parts of the Romanesque church date to the twelfth century, while later additions reflect centuries of change. Climbing a tower provides a compact view over the Limmat and old roofs." },
      { title: "Kunsthaus Zürich", description: "Kunsthaus Zürich is Switzerland's largest art museum by collection area and holds works ranging from medieval art to major modern movements. Swiss artists sit alongside European masters, giving the museum both national and international range. Its location just east of the old town makes it easy to pair with central walking routes." },
      { title: "Lake Zurich Promenade", description: "The promenades around the north end of Lake Zurich connect parks, boat landings and public waterfront spaces within minutes of the old town. Ferries and excursion boats extend the experience onto the lake and reveal the basin's relationship to the surrounding hills. Clear days can bring distant Alpine views beyond the water." },
      { title: "Uetliberg", description: "Uetliberg rises to 871 meters on the southwest edge of Zurich and is reached easily by suburban train and a short walk. The summit viewpoint looks over the city, lake and, in clear weather, the Alps. Hiking paths continue along the ridge, making it a genuine outdoor excursion rather than only an observation deck." },
      { title: "Swiss National Museum", description: "The Swiss National Museum stands beside Zurich Hauptbahnhof in a castle-like nineteenth-century building with a modern extension. Exhibits cover Swiss archaeology, political history, crafts and everyday life across the country's regions. Its location makes it an efficient first or last stop when arriving by rail." },
    ],
  },
  "mexico/cancun": {
    overview:
      "Cancun is a purpose-built Caribbean resort city divided between the mainland urban center and the long Hotel Zone barrier island. A useful guide should distinguish beaches and archaeological sites from nearby islands and Riviera Maya excursions rather than treating the entire region as one place.",
    context:
      "The Hotel Zone wraps around Nichupté Lagoon with Caribbean beaches on its seaward side, while downtown Cancun developed on the mainland to support the rapidly growing tourism center. Maya archaeological remains survive within the resort corridor itself, providing direct evidence that the region's history long predates modern hotels.",
    planning:
      "Use buses or taxis along the Hotel Zone and group beach, museum and archaeology stops by location. Treat Isla Mujeres and mainland Riviera Maya destinations as separate excursions with their own transport time.",
    season:
      "December through April is generally drier and less humid, while summer and early autumn are hotter, wetter and overlap with Atlantic hurricane season. Seaweed conditions on Caribbean beaches can vary significantly by season and weather.",
    pack:
      "Bring strong sun protection, breathable clothing and reef-conscious water gear. Hydration matters in the heat, and a light rain layer is useful during the wetter part of the year.",
    pois: [
      { title: "Museo Maya de Cancún", description: "Museo Maya de Cancún presents archaeology from Quintana Roo and the wider Maya world inside the Hotel Zone. The museum shares its grounds with the San Miguelito archaeological site, where pathways pass foundations and temple remains beneath tropical vegetation. This pairing gives Cancun much-needed historical depth beyond the resort strip." },
      { title: "San Miguelito Archaeological Site", description: "San Miguelito preserves a Maya settlement directly within Cancun's Hotel Zone and is entered through the Maya Museum complex. Residential platforms and ceremonial structures show that this coast was occupied long before twentieth-century resort development. The shaded paths also provide a quieter contrast to nearby hotels and beaches." },
      { title: "El Rey Archaeological Zone", description: "El Rey is another Maya site in the southern Hotel Zone, with dozens of low stone structures arranged along a central axis. The settlement likely had connections to coastal trade and regional communities before European contact. Its location makes it easy to combine archaeology with a beach day without leaving Cancun proper." },
      { title: "Playa Delfines", description: "Playa Delfines is one of the broadest public beaches in Cancun's Hotel Zone and is known for open Caribbean views and fewer large hotel towers immediately behind the sand. Conditions can include strong surf, so posted lifeguard flags deserve attention. The elevated roadside overlook is also one of the classic views along the resort corridor." },
      { title: "Nichupté Lagoon", description: "Nichupté is a large lagoon system separating much of the Hotel Zone from the mainland. Mangroves, channels and sheltered water support boat, kayak and wildlife experiences that differ completely from the open Caribbean side. Seeing both sides of the barrier island makes Cancun's physical geography much easier to understand." },
      { title: "Mercado 28 and Downtown Cancun", description: "Mercado 28 sits in mainland Cancun and provides a very different setting from the Hotel Zone, with craft stalls, restaurants and surrounding city streets. The market is visitor-oriented, but the downtown trip helps establish that Cancun is also a functioning mainland city. Use normal bargaining judgment and compare prices rather than assuming every stall offers a unique handmade item." },
    ],
  },
};

const BANNED_PHRASES = [
  "quick way to add variety",
  "easy change of scenery",
  "recognized destination connected to tours",
  "build this stop into the day",
  "generic checklist item",
  "practical stop for understanding",
  "regional park and preserve trails",
];

const sentenceCount = (value: string) =>
  (value.match(/[.!?](?:\s|$)/g) ?? []).length;

const resolveTier1Pois = (countrySlug: string, citySlug: string): Poi[] => {
  const direct = getTier1IntlPoisForCity(countrySlug, citySlug);
  const resolved =
    direct.length || `${countrySlug}/${citySlug}` !== "united-kingdom/edinburgh"
      ? direct
      : getTier1IntlPoisForCity("scotland", "edinburgh");

  return resolved.map(poi => ({
    title: poi.name,
    description: poi.description,
  }));
};

const assertQuality = (key: string, profile: InternationalGuideProfile, pois: Poi[]) => {
  if (sentenceCount(profile.overview) < 2) {
    throw new Error(`${key} international guide overview is too thin.`);
  }
  if (pois.length < 6) {
    throw new Error(`${key} international guide requires at least six asserted POIs.`);
  }

  const seen = new Set<string>();
  for (const poi of pois) {
    const normalized = poi.title.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      throw new Error(`${key} international guide contains a duplicate or empty POI title.`);
    }
    seen.add(normalized);

    if (sentenceCount(poi.description) < 2 || poi.description.length < 150) {
      throw new Error(`${key} international guide POI is too thin: ${poi.title}`);
    }

    const combined = `${poi.title} ${poi.description}`.toLowerCase();
    const banned = BANNED_PHRASES.find(phrase => combined.includes(phrase));
    if (banned) {
      throw new Error(`${key} international guide contains banned boilerplate: ${banned}`);
    }
  }
};

export const enhanceInternationalGuide = (
  countrySlug: string,
  citySlug: string,
  guide: GuideContent,
): GuideContent => {
  const key = `${countrySlug}/${citySlug}`;
  const profile = profiles[key];
  if (!profile) return guide;

  const pois = profile.pois ?? resolveTier1Pois(countrySlug, citySlug);
  assertQuality(key, profile, pois);

  return {
    ...guide,
    intro: profile.overview,
    topThingsToDo: pois.map(poi => ({
      title: poi.title,
      description: poi.description,
    })),
    thingsToDoSections: [
      {
        title: `Why ${guide.name} is worth exploring`,
        paragraphs: [profile.context],
      },
      {
        title: `How to plan ${guide.name}`,
        paragraphs: [profile.planning],
      },
    ],
    bestTimeToVisit: profile.season,
    whatToPack: profile.pack,
  };
};

export const INTERNATIONAL_PARAGON_GUIDE_KEYS = Object.freeze(
  Object.keys(profiles).sort(),
);
