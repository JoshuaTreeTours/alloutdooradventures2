import {
  buildEngine6RichProductDescription,
  stripEngine6GeneratedDescriptionPrefix,
} from "./seo";

export const MERCHANT_APPROVED_DESCRIPTIONS: Record<string, string> = {
  "152424P1":
    "Half-day small-group tour from San Francisco to Muir Woods National Monument and Sausalito, including scenic views and free time to explore.",
  "63657P1":
    "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara.",
  "327321P1":
    "Guided pre-dawn hike with sunrise views and a meditation session in the Palm Springs mountains.",
  "5119P13":
    "Full-day West Rim experience from Las Vegas with scenic stops and optional helicopter landing near the Colorado River.",
  "190492P3":
    "Full-day guided visit to Bryce Canyon and Zion National Park with scenic stops and interpretation.",
  "7079RREBIKE":
    "Guided e-bike ride through Red Rock Canyon with scenic stops and desert interpretation.",
  "191767P5":
    "Off-road exploration of Valley of Fire featuring key formations and desert terrain.",
  "3533P14":
    "4x4 tour through Red Rock Canyon and Rocky Gap backcountry with scenic viewpoints.",
  "60136P1":
    "Full-day trip including Horseshoe Bend and Antelope Canyon with guided access and transport.",
  "26719P8":
    "Guided kayaking experience to Emerald Cave along a scenic section of the Colorado River.",
  "13920P12":
    "Guided off-road adventure through desert terrain with varied trail conditions.",
  "233384P2":
    "Guided bike tour linking Lower Manhattan and Brooklyn waterfront viewpoints.",
  "7081NYCDAY":
    "Full-day NYC tour including major landmarks and ferry views of the Statue of Liberty.",
  "62527P11":
    "Full-day guided trip to Niagara Falls with transportation and scenic viewpoints.",
  "5250LIBERTYELLIS":
    "Guided visit to Liberty Island and Ellis Island with ferry access and historical context.",
  "5614063P8":
    "Full-day guided tour to Washington, D.C. with major landmark stops.",
  "3857PHI":
    "Day trip to Philadelphia and Amish Country featuring history and rural scenery.",
  "5024MANSKY":
    "Short helicopter flight offering aerial views of Manhattan skyline and landmarks.",
  "103533P1":
    "Boat tour showcasing NYC skyline, bridges, and harbor landmarks with narration.",
  "6288P29":
    "90-minute sightseeing cruise around New York Harbor with skyline and Statue of Liberty views.",
  "122012P17":
    "Half-day guided bus tour covering major New York City landmarks with photo stops.",
  "474891P3":
    "Private walking tour of Manhattan tailored to your interests with a local guide.",
  "5515296P1":
    "Gourmet dining experience aboard a panoramic bus with views of NYC landmarks.",
  "173946P1":
    "Trade the coast for San Diego's inland backcountry on a guided 4x4 outing built for travelers who want rugged terrain and panoramic ridgeline views. The route explores dirt tracks and elevation changes in the Otay wilderness region with a guide leading the pace and terrain choices. It is an adventure-forward experience that showcases a very different side of Southern California beyond beaches and boardwalks.",
  "18125P5":
    "Explore Balboa Park on a private guided Segway tour designed for visitors who want to cover more ground than walking while still getting context from a local guide. Glide through one of San Diego's signature cultural districts to see gardens, museum exteriors, Spanish Colonial Revival architecture, and major park landmarks. The private format allows a more personalized pace with commentary tailored to your group. This tour is a strong fit for travelers who want a fun, efficient overview of Balboa Park in a single outing.",
  "191303P1":
    "Explore Coronado Island on a guided electric bike tour aboard custom Fat Woody beach cruisers. Cruise the Glorietta Bay Promenade, Coronado Beach, and Coronado Ferry Landing while your guide shares local history, takes photos, and keeps the pace comfortable for a small group. Each rider gets a color-matched helmet, bottled water, and a bike with an integrated speaker system for beach tunes along the route.",
  "21165P1":
    "Paddle the La Jolla Ecological Reserve on a guided sea-cave kayak adventure designed for first-timers and active travelers alike. Your guide leads the route through rocky shoreline features, giant kelp habitat, and wildlife-rich water where sea lions, seals, and coastal birds are common. Ocean conditions permitting, the tour approaches the sea cave zone for dramatic coastal views while keeping safety front and center.",
  "28758P1": "Visit Tijuana with a guide to help you find your way around",
  "3097SDZSP_2VISIT":
    "View over 4,000 animals roaming in large enclosures on a 2-day visit to the San Diego Zoo and San Diego Zoo Safari Park. This admission ticket allows you to spend two days at the Zoo or Safari Park or split your time between the two. Access to all shows and exhibits and all in-park transportation are included. With mobile tickets, scan your phone for direct entry into the San Diego Zoo and Safari Park.",
  "31015P9":
    "Set out on a private San Diego Bay sail crafted for your group only, with a captain handling navigation while you enjoy skyline views and harbor landmarks from the water. This charter is ideal for celebrations, date nights, and small-group outings that want a more premium, uncrowded format. You can follow a captain-recommended route or tailor the pace and atmosphere to your occasion.",
  "388361P1": "Perfect way to get San Diego sunset shots",
  "424070P1": "Discover the best of San Diego on this guided tour",
  "447234P3":
    "Take a private day trip from San Diego to Joshua Tree National Park with hotel, airport, or cruise terminal pickup options. The route includes time at the Joshua Tree National Park Visitor Center and park landmarks including Skull Rock, Keys View, Jumbo Rocks, and Hidden Valley, with flexibility for short walks based on your group.",
  "5257BOAT":
    "Experience the thrill of driving a speedboat—and enjoy a new way to sightsee—on this two-in-one San Diego Harbor tour. Learn the basics of boating from your guide before following their boat around the harbor, cruising past highlights such as the USS Midway, Coronado Bridge, the San Diego Maritime Museum, and more. Discover the stories behind the landmarks via the on-board, two-way communication system, and stop for photo ops.",
  "5584233P1":
    "Sail San Diego Bay at sunset with a captain who shares local stories and wildlife insight along the way. This approximately two-hour experience offers skyline views from the water, a relaxed pace, and the option to book a private sailing if preferred.",
  "5598628P3":
    "Board a classic French yacht for a small-group sailing experience on San Diego Bay with skyline views, harbor landmarks, and relaxed onboard hospitality. The route highlights well-known waterfront points such as Coronado Bridge, Seaport Village, and Point Loma while your captain handles navigation. This experience is designed for travelers who want scenic sailing time, local photo opportunities, and a flexible on-the-water pace.",
  "69764P1": "3-hour whale watching cruise from San Diego.",
  "5046PRTSANSEA":
    "Cruise the waters of San Diego Bay aboard an amphibious sightseeing vehicle while exploring waterfront landmarks, maritime history, and coastal marine wildlife.",
  "6740JTREE":
    "Experience Joshua Tree National Park from the open air aboard a custom Hummer built for desert touring. This guided small-group adventure travels from the Greater Palm Springs area into one of California’s most iconic national parks, where dramatic rock formations, Joshua tree forests, rugged desert valleys, and wide Mojave views define the landscape. With pickup and departure options available from Palm Desert, Palm Springs, and Yucca Valley, the tour is designed for convenient access from across the Coachella Valley and High Desert. Along the way, your guide shares insight into the park’s geology, desert ecology, wildlife, and cultural history while making time for scenic viewpoints and photo stops, including highlights such as Joshua Tree National Park, Keys View, Barker Dam Trail, and Cap Rock Trail. The open-air Hummer format gives guests a more immersive way to experience the desert than a traditional bus or enclosed vehicle, with elevated views, fresh desert air, and a close connection to the terrain throughout the journey.",
  "2335P1":
    "Only Red Jeep Tours can take you to Metate Ranch, located in the heart of the San Andreas Fault Zone. On this awe-inspiring OPEN-AIR Jeep Tour, you will travel deep into the heart of California’s world-famous San Andreas Fault and witness the forces of nature that have created amazing, steep-walled canyons and the most twisted and tormented landscapes on Earth! You will be awestruck by the spectacular scenery as your Jeep winds its way through the bones of the earth. During your adventure, you will stop several times for short nature walks, including a short hike through a slot canyon, if desired. This tour also stops at a natural palm oasis, where water bubbles up from the ground year-round. Here you will learn about how the Cahuilla Indians used desert plants to survive in this inhospitable environment. A final highlight is a guided tour of our recreated Cahuilla Indian Village that showcases the lifestyle and culture of the Cahuilla people.",
  "3351P13":
    "A paved road, downhill bicycle tour through a Federally protected Wilderness zone along the San Andreas Fault. Riders will be treated to magnificent vistas of the wide open Colorado Desert, enter a tortured badlands canyon, then finish off with views of the Santa Rosa Mountains and ride through the agricultural fields of the Eastern Coachella Valley. Age limit is 12 years old. This is a group tour. This activity has a 2 person requirement for the tour to run. If you are a single rider, please call first.",
  "3351P15":
    "Explore the Indian Canyons area on a guided bike-and-hike adventure from Palm Springs. This active outing combines cycling and short guided walking segments through canyon landscapes, desert scenery, and native palm oasis terrain while your guide manages route pacing and logistics.",
  "6740P7":
    "This Joshua Tree Scenic Tour gives guests a guided, backroads-focused way to experience the national park from Palm Springs without the pressure of planning every turn. Travel in a rugged Hummer H2 or Adventure Van with a guide who links major desert landmarks to useful context on geology, ecology, and regional history. The day is structured around scenic drive segments plus regular stops for photos and short walks, so you get close to the landscape rather than only viewing it from the road. Compared with ordinary self-drive sightseeing, the format combines easier logistics, local interpretation, and access to route choices that feel more immersive and less rushed. It suits first-time Joshua Tree visitors, couples, families with older kids, and photographers who want a comfortable pace with strong scenery and clear storytelling throughout the outing.",
  "237571P2":
    "I am a 20 year resident of the Mojave Desert and log 200 miles annually on foot within Joshua Tree National Park. Over the years and miles I've cultivated an awareness of landscape, ecological systems, and local culture that when contextualized by the trail becomes a narrative experience I'm eager to share.  I landed in Joshua Tree after dropping out of college in 2001. Back then you arrived by chance or a friend of a friend said you had to check out the rocks, feel the energy, and camp under the stars. I fell in with the gathering characters, an assortment of dirtbag climbers, avant artists, practical new age visionaries, and entrepreneurs...an amalgam of identities that would go on to create the image of the High Desert that is so coveted today. I am legally permitted to guide within Joshua Tree National Park and happy to host you. I know my stuff and I want you to know it too.",
  "335698P13":
    "Rock Scrambling Adventures in Joshua Tree National Park is a guided, small-group outing designed for active travelers who want to move through the park’s granite landscapes on foot. Instead of technical rope climbing, the experience focuses on coached scrambling across boulders, slabs, and natural rock corridors at a pace set by the group. As you travel through Joshua Tree National Park, your guide shares practical insight into local geology, desert ecology, and how weather and erosion shaped these formations over time. The route balances challenge and approachability, with regular stops for photos and wide desert views. It is a strong fit for visitors who want a hands-on outdoor adventure that goes beyond scenic driving and introduces the park through movement, terrain, and guided exploration.",
  "335698P7":
    "Joshua Tree National Park Half-Day Small-Group Guided Tour gives visitors an easy, scenic way to experience the park’s signature landscapes without planning the route themselves. Travel with a guide through high-desert terrain shaped by granite boulders, open valleys, Joshua tree groves, and wide desert views.  This small-group tour is built for travelers who want the highlights of Joshua Tree National Park in a comfortable half-day format. Along the way, stop for short optional walks, scenic viewpoints, and photo opportunities while learning about the park’s geology, desert plants, wildlife, and history.  Possible highlights include the boulder fields near Quail Springs, the rock corridors of Hidden Valley, the sweeping overlook at Keys View, and classic Joshua Tree scenery near Cap Rock or Skull Rock. It is a strong fit for first-time visitors, photographers, and anyone who wants a guided park overview without a full-day hiking commitment.",
  "445161P1":
    "Spend an evening beneath the dark desert skies of Joshua Tree on a guided stargazing experience designed for both beginners and longtime astronomy enthusiasts. Far from the glow of city lights, Joshua Tree National Park offers exceptional night-sky visibility, creating ideal conditions for observing constellations, planets, star clusters, and seasonal celestial events. Your guide helps interpret the sky using laser pointers and professionally prepared telescopes, making it easy to understand what you are seeing without the frustration of complicated equipment setup. Throughout the session, guests can move between telescope viewing and relaxed naked-eye observation while learning about astronomy, navigation, and the unique conditions that make the high desert one of Southern California’s best stargazing locations. The experience combines science, storytelling, and the quiet atmosphere of the desert after dark into a memorable nighttime adventure near Palm Springs and Joshua Tree.",
  "163975P1":
    "All Aboard Santa Barbara’s Original & Longest Running Trolley Tour and Charter Services See the American Riviera in 90 minutes Santa Barbara sightseeing at its finest on the original, fully narrated Santa Barbara Trolley Tour. For 30 years, we've been providing trolley tours in the Santa Barbara community. Join us as we visit local hot spots such as the Santa Barbara Courthouse, Santa Barbara Zoo, Museum of Natural History, the historic Santa Barbara Mission, and more, all fully narrated by our energetic and knowledgeable tour guides! Our pick up location is only a 10 minute walk from Stearns Wharf, at 1 Garden St.",
  "447486P2":
    "Join a spectacular outing on a Yacht for a relaxing sunset cruise along the Santa Barbara waterfront, offering panoramic coastal views, fresh ocean air, and a social golden-hour atmosphere. Departing near Santa Barbara Harbor, this yacht experience trades crowded city streets for calm open water, scenic marina views, and sweeping vistas of the Santa Ynez Mountains. Guests can unwind with friends, enjoy smooth coastal sailing, and experience Santa Barbara from a unique on-the-water perspective while cruising past the harbor and shoreline landmarks.",
  "447486P4":
    "The only all-electric Duffy charter boat in Santa Barbara. Price includes captain. Whisper is USCG certified to carry up to 6 passengers (max). Trip is fully private with your guests only. Bring your own appetizers, beer, and wine (no corkage fee!) This is primarily a harbor-based cruise. When conditions are favorable, Whisper can also go out around Stearns Wharf. Boarding is 5 mins prior to departure. If you miss scheduled departure time, the tour is not extended.",
  "117409P1":
    "Taste some of California's best wines on this award-winning tour of Santa Barbara Wine Country. Enjoy breathtaking views on the way to Santa Ynez Valley on board a luxury passenger van. Our knowledgeable guide will share facts and history about our amazing wine region while you visit our partner wineries.",
  "421920P3":
    "For those seeking a fun and challenging adventure, spend up to 2 hours on this epic Adventure Course! This course features 80+ obstacles at heights up to 60 feet above the ground, built within an old growth oak grove. There are 4 main routes among 2 different levels, with obstacles ranging in difficulty from easy to very difficult. Challenge yourself at Highline Adventures!",
  "331438P1":
    "Our expert captains are all licensed by the United States Coast Guard and are sure to offer your family the safest experience while flying high over the water. We’re located at the end of the historic Stearns Wharf, Santa Barbara’s #1 attraction. There’s plenty to see and do before and after your parasailing flight. Ready for an adventure? Book now for an unforgettable experience.",
  "5603847P4":
    "Experience the night sky with a PhD-level astronomy guide who brings the cosmos to life through storytelling and expert insight. Escape the city lights and experience Santa Barbara’s night sky on a PhD-led stargazing tour. Travel to a dark sky location where your astronomy guide brings the cosmos to life through telescope viewing and storytelling. View planets, stars, nebulae, and galaxies through a high-powered telescope with guided explanations. Enjoy a comfortable, small-group experience with luxury transportation, hot drinks, and warm gear provided.",
  "5753P14":
    "Learn to surf in beautiful Santa Barbara! Your expert instructor will teach you how to stand up on your board and ride the perfect wave, offering tips on balance while ensuring your safety. All skill levels are welcome, and equipment rental is included. This Southern California city offers great outdoor activities like surfing year-round.",
};

const GENERATED_DESCRIPTION_BLOCKLIST = [
  /scenic stops/i,
  /local guide insight/i,
  /memorable destination highlights/i,
  /destination highlights/i,
  /destination-agnostic/i,
];

export const hasGenericMerchantDescriptionBoilerplate = (value: string) =>
  GENERATED_DESCRIPTION_BLOCKLIST.some(pattern => pattern.test(value));

const normalizeMerchantDescriptionCandidate = (
  value: string | null | undefined
) => {
  if (!value) {
    return null;
  }

  const normalized = stripEngine6GeneratedDescriptionPrefix(
    value.replace(/\s+/g, " ").trim()
  );
  return normalized.length > 0 ? normalized : null;
};

const buildProductSpecificFallback = (args: {
  title: string;
  city: string;
  categoryLabel?: string | null;
}) => {
  const title = args.title.trim();
  const city = args.city.trim();
  const activity =
    args.categoryLabel?.trim().toLowerCase() || "guided experience";
  const destination = city ? ` in ${city}` : "";

  return `${title} is a ${activity}${destination} with details aligned to the product page and booking experience.`;
};

export const resolveMerchantDescription = (args: {
  productCode: string;
  title: string;
  city: string;
  categoryLabel?: string | null;
  productOverviewDescription?: string | null;
  pageMetadataDescription?: string | null;
  jsonLdProductDescription?: string | null;
  viatorApiDescription?: string | null;
  itineraryStops?: Array<{ title: string; description?: string | null }>;
  highlights?: string[];
  included?: string[];
  durationText?: string | null;
}) => {
  const approvedDescription = MERCHANT_APPROVED_DESCRIPTIONS[args.productCode];

  if (approvedDescription) {
    return approvedDescription;
  }

  const sourceCandidates = [
    args.productOverviewDescription,
    args.pageMetadataDescription,
    args.jsonLdProductDescription,
    args.viatorApiDescription,
  ];

  for (const candidate of sourceCandidates) {
    const normalized = normalizeMerchantDescriptionCandidate(candidate);
    if (normalized && !hasGenericMerchantDescriptionBoilerplate(normalized)) {
      return buildEngine6RichProductDescription({
        title: args.title,
        city: args.city,
        categoryLabel: args.categoryLabel,
        overviewText:
          args.productOverviewDescription ?? args.viatorApiDescription,
        description: normalized,
        itineraryStops: args.itineraryStops,
        highlights: args.highlights,
        included: args.included,
        durationText: args.durationText,
      });
    }
  }

  return buildEngine6RichProductDescription({
    title: args.title,
    city: args.city,
    categoryLabel: args.categoryLabel,
    description: buildProductSpecificFallback({
      title: args.title,
      city: args.city,
      categoryLabel: args.categoryLabel,
    }),
    itineraryStops: args.itineraryStops,
    highlights: args.highlights,
    included: args.included,
    durationText: args.durationText,
  });
};
