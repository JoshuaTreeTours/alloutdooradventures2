import fs from "node:fs";
import path from "node:path";

type GuideThing = {
  title: string;
  description: string;
  wikiUrl: string;
};

type GuideJson = {
  city?: string;
  thingsToDo?: GuideThing[];
};

type Landmark = {
  title: string;
  wikiPath: string;
  what: string;
  why: string;
  doThere: string;
};

const ROOT = path.resolve("src/data/guides/us/utah");
const SKIP = "salt-lake-city";

const DATA: Record<string, Landmark[]> = {
  "bryce-canyon-city": [
    { title: "Bryce Canyon National Park", wikiPath: "Bryce_Canyon_National_Park", what: "a high-elevation national park on the Paunsaugunt Plateau known for amphitheaters of hoodoos carved into Claron Formation rock", why: "its geology and elevation create one of Utah's most distinctive erosional landscapes and make the park a core gateway stop in southern Utah itineraries", doThere: "Visitors usually drive the rim road, stop at viewpoint overlooks, and hike routes such as Navajo Loop or Queen's Garden to move between the rim and canyon floor." },
    { title: "Inspiration Point", wikiPath: "Bryce_Canyon_National_Park", what: "a major rim overlook within Bryce Canyon where multiple amphitheaters and hoodoo fields can be seen in one wide panorama", why: "it is one of the clearest places to understand the scale of Bryce's erosional basins and the stratified rock layers that define the park", doThere: "Most travelers visit for sunrise or late-afternoon light, use the short access path from the parking area, and connect it with nearby overlooks along the rim." },
    { title: "Sunset Point", wikiPath: "Bryce_Canyon_National_Park", what: "a central Bryce Canyon viewpoint above the main amphitheater and a common starting point for the Navajo Loop trail system", why: "the overlook frames landmark formations and gives a strong orientation to the park's layout, elevation changes, and trail network", doThere: "People typically begin rim walks here, descend switchbacks into hoodoo corridors, and return to the rim for changing light on the amphitheater walls." },
    { title: "Navajo Loop Trail", wikiPath: "Bryce_Canyon_National_Park", what: "a steep loop trail descending from Bryce's rim into narrow rock corridors and tall hoodoo formations", why: "it offers one of the park's best short-distance examples of how freeze-thaw erosion and drainage shape the canyon's signature landforms", doThere: "Hikers use the loop for a compact but challenging route, often pairing it with Queen's Garden for a longer circuit through the main amphitheater." },
    { title: "Grand Staircase–Escalante National Monument", wikiPath: "Grand_Staircase%E2%80%93Escalante_National_Monument", what: "a vast federal monument east and south of Bryce that protects canyon systems, slickrock benches, and significant paleontological and geologic resources", why: "its scale and protected status make it central to understanding regional land management, scientific research, and backcountry travel in southern Utah", doThere: "Visitors use scenic byways and trailheads to explore overlooks, slot canyons, and remote routes that complement Bryce Canyon's more developed park corridor." },
  ],
  hurricane: [
    { title: "Sand Hollow State Park", wikiPath: "Sand_Hollow_State_Park", what: "a Utah state park centered on Sand Hollow Reservoir with red sandstone terrain and open desert riding areas", why: "it anchors Hurricane's outdoor economy by combining boating water access with nearby OHV terrain in one managed recreation zone", doThere: "Common activities include paddling and boating on the reservoir, beach access along the shoreline, and guided or self-guided off-road routes in surrounding dunes." },
    { title: "Quail Creek State Park", wikiPath: "Quail_Creek_State_Park", what: "a reservoir park west of Hurricane set below volcanic hills and managed for warm-water recreation and fishing", why: "the lake is a stable, accessible water site in a desert region and plays a practical role in regional recreation planning", doThere: "Visitors typically swim or paddle near boat ramps, fish for stocked species, and use day-use facilities for short stops between Zion-area and St. George routes." },
    { title: "Toquerville Falls", wikiPath: "Toquerville_Falls", what: "a waterfall feature in the Hurricane area reached by backcountry roads in a desert drainage landscape", why: "it is a well-known local contrast point where perennial flow and rock shelves create a rare water-focused stop in otherwise arid terrain", doThere: "Travelers usually arrive by high-clearance vehicle, view the falls from the natural rock basin, and combine the stop with other nearby off-pavement routes." },
    { title: "Gooseberry Mesa", wikiPath: "Gooseberry_Mesa", what: "a mesa south of Zion known for technical slickrock mountain-bike routes and broad desert-and-canyon viewpoints", why: "it is a nationally recognized riding destination that shaped Hurricane's reputation in the Southwest bike-trail network", doThere: "Riders use signed loops and connectors across slickrock shelves, while non-riders use trailheads and overlooks for short hikes and landscape photography." },
    { title: "Virgin River", wikiPath: "Virgin_River", what: "a tributary of the Colorado River that flows through southwest Utah and the Hurricane basin before entering Arizona and Nevada", why: "the river system is fundamental to local settlement, irrigation history, and the canyon geomorphology that defines this part of the state", doThere: "Visitors encounter it at parks, trail crossings, and scenic corridors, where it provides habitat context and links Hurricane to Zion and downstream desert communities." },
  ],
  moab: [
    { title: "Arches National Park", wikiPath: "Arches_National_Park", what: "a national park north of Moab protecting a dense concentration of natural sandstone arches, fins, and balanced rock formations", why: "its protected geology and accessibility make it one of Utah's most documented desert landscapes and a cornerstone of the region's tourism economy", doThere: "Visitors drive the main park road to trailheads, hike to formations such as Delicate Arch and Landscape Arch, and use viewpoints to read the basin-and-range terrain around Moab." },
    { title: "Canyonlands National Park", wikiPath: "Canyonlands_National_Park", what: "a large national park near Moab where the Colorado and Green rivers cut deep canyon districts including Island in the Sky and The Needles", why: "it presents a broad cross-section of Colorado Plateau geology and is essential for understanding why Moab functions as a base for multi-day desert exploration", doThere: "Travelers use district-specific roads and overlooks, then hike mesa-edge trails or backcountry routes that reveal river confluences and layered sandstone topography." },
    { title: "Dead Horse Point State Park", wikiPath: "Dead_Horse_Point_State_Park", what: "a Utah state park west of Moab on a high mesa overlooking a dramatic entrenched meander of the Colorado River", why: "its iconic viewpoint and protected rim environment make it one of the clearest interpretive sites for river incision and canyon development on the plateau", doThere: "Most visitors use the central overlook and rim trails, with additional options for mountain biking and sunset photography over the canyon basin below." },
    { title: "Colorado River", wikiPath: "Colorado_River", what: "a major river of the American Southwest flowing through the Moab area in a corridor bordered by cliffs, mesas, and desert tributaries", why: "the river's hydrology and erosional force shaped regional settlement, transport history, and the canyon terrain that supports modern recreation around town", doThere: "People raft or paddle designated sections, drive river-road viewpoints, and use adjacent trail systems to connect water access with geologic overlooks." },
    { title: "La Sal Mountains", wikiPath: "La_Sal_Mountains", what: "a mountain range southeast of Moab formed by intrusive igneous geology and rising sharply above surrounding desert basins", why: "the elevation contrast drives local climate differences and provides key context for understanding Moab's terrain, watersheds, and seasonal recreation patterns", doThere: "Visitors use mountain roads and trail networks for hiking, alpine viewpoints, and cooler-weather excursions that complement lower-elevation park visits in summer." },
  ],
  springdale: [
    { title: "Zion National Park", wikiPath: "Zion_National_Park", what: "a national park bordering Springdale that protects steep Navajo Sandstone canyons, mesas, and riparian corridors along the Virgin River", why: "it is the defining natural asset of the town and one of the most visited national parks in the country, shaping local transit and lodging patterns", doThere: "Visitors usually use the seasonal shuttle system, hike canyon and rim routes, and combine scenic drives with ranger interpretation focused on geology and ecology." },
    { title: "The Narrows", wikiPath: "The_Narrows_(Zion_National_Park)", what: "a narrow Zion canyon section where the Virgin River flows between high sandstone walls and much of the route is in the water", why: "it is one of the park's most distinctive hydrologic landscapes and a signature example of river incision through resistant sandstone", doThere: "Travelers rent canyon footwear and poles, then walk upstream from Riverside Walk while monitoring weather and flash-flood safety guidance." },
    { title: "Angels Landing", wikiPath: "Angels_Landing", what: "a prominent Zion rock fin reached by a steep trail from canyon floor switchbacks to an exposed summit ridge", why: "the route has become one of the park's most recognized hikes because of its engineering, elevation gain, and commanding canyon views", doThere: "Hikers complete permit-managed access, climb Walter's Wiggles, and continue along chained sections to the summit for broad panoramas of Zion Canyon." },
    { title: "Emerald Pools", wikiPath: "Zion_National_Park", what: "a Zion trail area with lower, middle, and upper pool destinations formed by seep-fed sandstone alcoves and short canyon benches", why: "the pools illustrate how water, cliff structure, and shade create microhabitats that differ from the drier slopes around central Zion Canyon", doThere: "Visitors use interconnected trails from the lodge area, stopping at pool overlooks and alcoves before linking the walk to shuttle stops and nearby viewpoints." },
    { title: "Virgin River", wikiPath: "Virgin_River", what: "the principal river corridor running through Springdale and Zion, carving the canyon system that defines the town's setting", why: "its flow regime and flood history are central to Zion geology, park management, and the location of roads, trails, and visitor facilities", doThere: "Travelers observe it from bridges and riverside paths, or enter the channel in permitted sections such as The Narrows under seasonal safety conditions." },
  ],
  "st-george": [
    { title: "St. George Utah Temple", wikiPath: "St._George_Utah_Temple", what: "a historic Latter-day Saint temple completed in the nineteenth century and one of the most recognizable buildings in St. George", why: "its architecture and chronology connect directly to early settlement history in Utah's southwest and to the city's civic identity", doThere: "Visitors view the exterior grounds, tour nearby historical interpretation sites, and use downtown walking routes to connect the temple district with other heritage landmarks." },
    { title: "Snow Canyon State Park", wikiPath: "Snow_Canyon_State_Park", what: "a state park north of St. George featuring red and white Navajo sandstone, lava flows, and cinder cones within a compact canyon basin", why: "its geology offers a concentrated cross-section of regional volcanic and sedimentary history and serves as a major day-use landscape for residents and visitors", doThere: "People drive the scenic road, hike marked trails through petrified dunes and lava tubes, and use climbing or biking routes where permitted." },
    { title: "Pioneer Park", wikiPath: "St._George,_Utah", what: "a city park landscape of red slickrock outcrops and short trail connections above central St. George neighborhoods", why: "it is a practical urban-access point for reading local geology and understanding how the city expanded around exposed sandstone terrain", doThere: "Visitors walk short loop paths, climb to overlook points, and pair the stop with downtown museums and historic district visits." },
    { title: "Red Cliffs Desert Reserve", wikiPath: "Red_Cliffs_Desert_Reserve", what: "a protected reserve system northeast of St. George established to conserve Mojave Desert habitat and associated species corridors", why: "its conservation framework is a key part of land-use planning in a fast-growing desert metro area with competing recreation and development demands", doThere: "Travelers use designated trailheads for hiking and wildlife observation while following posted guidance that protects sensitive habitat and restoration areas." },
    { title: "Dinosaur Discovery Site at Johnson Farm", wikiPath: "Dinosaur_Discovery_Site_at_Johnson_Farm", what: "a paleontological museum site in St. George preserving track-bearing rock surfaces and interpreted dinosaur-era sediment features", why: "the preserved tracks provide direct evidence of Jurassic environments in southwest Utah and make the city important to regional science education", doThere: "Visitors tour indoor exhibits and in-situ track slabs, then use interpretive displays to connect fossil evidence with the broader geologic history of the area." },
  ],
};

const buildDescription = (landmark: Landmark, city: string) => {
  const description = `${landmark.title} is ${landmark.what}. ${landmark.why}. ${landmark.doThere} For ${city} itineraries, this stop gives concrete context for how natural systems and public infrastructure shape the region's travel patterns, seasonal timing, and visitor access. It also clarifies how this part of Utah links protected landscapes to nearby communities, road corridors, and visitor infrastructure used across multi-stop trips. Spending time here is most useful when combined with maps, interpretation signs, and adjacent neighborhoods so you understand both the landmark itself and the wider geography around it.`;
  return description.replace(/\s+/g, " ").trim();
};

const run = () => {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.json') && f !== 'index.json');
  const updated: string[] = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, "");
    if (slug === SKIP) continue;

    const guidePath = path.join(ROOT, file);
    const guide = JSON.parse(fs.readFileSync(guidePath, "utf8")) as GuideJson;
    const landmarks = DATA[slug] ?? [];
    if (!guide.city || !landmarks.length) continue;

    guide.thingsToDo = landmarks.map(item => ({
      title: item.title,
      description: buildDescription(item, guide.city!),
      wikiUrl: `https://en.wikipedia.org/wiki/${item.wikiPath}`,
    }));

    fs.writeFileSync(guidePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    updated.push(slug);
  }

  console.log(`Utah guides updated: ${updated.length}`);
};

run();
