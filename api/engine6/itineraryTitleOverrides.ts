type Engine6ItineraryTitleOverrideInput = {
  productCode: string | null;
  rowIndex: number;
  currentTitle?: string | null;
};

type ConditionalTitleOverride = {
  title: string;
  currentTitleStartsWith: readonly string[];
};

// Product-scoped itinerary title repairs confirmed by Engine6 itinerary title
// audits/manual review. These products have stable row order and no safe
// count-aligned public JSON-LD title list; use these only as conservative
// product-scoped repairs after aligned JSON-LD and before supplier prose.
const PRODUCT_ROW_TITLE_OVERRIDES: Record<string, Record<number, string>> = {
  "63657P1": {
    0: "Santa Barbara Wine Tours",
  },
  "5603847P4": {
    0: "Santa Barbara Stargazing",
  },
  "5602P25": {
    0: "Las Vegas to Zion",
    1: "Bryce Canyon",
    3: "Antelope Canyon and Horseshoe Bend",
    4: "Grand Canyon",
    5: "Route 66 Corridor",
    6: "Las Vegas Return",
  },

  "118958P8": {
    0: "Fort Lauderdale Marina",
    1: "Offshore Fishing Grounds",
    2: "Harbor Arrival",
  },
  "15200P2": {
    3: "Hotel Drop-off",
  },
  "15200P6": {
    3: "New Orleans Drop-off",
  },
  "327321P1": {
    3: "Trailhead Descent",
  },
  "3454YE3D": {
    0: "San Francisco departure",
    1: "Bay Bridge crossing",
    2: "Yosemite National Park entrance",
    3: "Tuolumne Grove",
    4: "Yosemite Valley orientation",
    5: "Yosemite Village free time",
    6: "Yosemite Falls",
    7: "Ansel Adams Gallery",
    8: "Yosemite campsite",
    10: "High-country hiking",
    12: "Valley activity time",
    13: "El Capitan Meadow",
    14: "San Francisco Drop-off",
  },
  "190492P3": {
    2: "Zion Scenic Transfer",
    4: "Las Vegas Drop-off",
  },
  "5516ST5": {
    3: "Sphere and LINQ District",
    4: "Allegiant Stadium Flyover",
    6: "Terminal Return",
  },
  "470339P1": {
    2: "Las Vegas Sign",
  },
  "411138P3": {
    4: "Girdwood",
  },
  "53474P8": {
    0: "Campbell Creek Trail",
    1: "Chester Creek Trail",
    2: "Westchester Lagoon",
    3: "Earthquake Park",
    4: "Kincaid Park",
    5: "Point Woronzof",
    6: "Tony Knowles Coastal Trail",
  },
  "7079RREBIKE": {
    0: "Bike Setup",
    1: "Red Rock Scenic Drive",
  },
  "3533RRC": {
    0: "Las Vegas Pickup",
    3: "Red Rock Visitor Area",
  },
  "3533P14": {
    1: "Scenic Loop Entry",
    6: "Rocky Gap Road",
    7: "Las Vegas Transfer",
  },
  "5119P13": {
    4: "Grand Canyon West",
  },
  "5615689P4": {
    1: "Las Vegas Arts District",
  },
  "6007P5": {
    3: "Sausalito Lunch",
  },
  "3454P57": {
    3: "Sausalito Handoff",
  },
  "415653P2": {
    4: "Swinging Bridge Picnic Area",
  },
  "5096P30": {
    0: "Big Bus Welcome Center",
  },
  "32779P6": {
    0: "Catalina Island Interior",
  },
  "106439P1": {
    1: "Rodeo Drive",
    2: "Greystone Mansion",
    3: "Beverly Gardens Park",
    5: "Beverly Canon Gardens",
    6: "Beverly Hills Civic Center",
    7: "Golden Triangle and Platinum Triangle",
    8: "Sunset Boulevard",
    9: "Celebrity Homes Neighborhoods",
    10: "Beverly Hills Hotel",
  },
  "5569HIKE": {
    0: "Safety Briefing",
    1: "Greek Theatre Meeting Point",
    2: "Hollywood Hills Trail",
    3: "Griffith Observatory",
    4: "Tiffany Point",
    7: "LA River Views",
    8: "Griffith Park",
    9: "Santa Monica Mountains",
    10: "Mount Hollywood",
    11: "Hollywood Sign",
    12: "Century City Views",
    13: "Warner Bros. Studios",
    14: "Downtown Los Angeles Views",
    16: "Hollywood Views",
    17: "Los Angeles Zoo",
    18: "Autry Museum",
    19: "Griffith Park Bird Sanctuary",
    20: "Walt Disney Studios",
  },

  "6029_4DAYPARK": {
    0: "Grand Teton Dusk",
    1: "Yellowstone Wildlife",
    2: "Buffalo Bill Museum",
    3: "Lamar Valley and Old Faithful",
  },
  "7081NYCDAY": {
    4: "9/11 Memorial and Museum",
  },
  "5024MANSKY": {
    8: "Manhattan Skyline Return",
  },

  "5503P10": {
    2: "Marina Arrival",
  },
  "6331BAHA": {
    3: "Florida Ferry Crossing",
  },
  "44152P18": {
    0: "Miami",
    1: "Everglades Region",
    2: "Florida Keys",
  },
  "58347P1": {
    0: "Flambeaux Bicycle Tours",
  },
  "6455NOLAAIR": {
    2: "Jean Lafitte Preserve Area",
    3: "Lafitte Launch Area",
  },
  "3780P45": {
    0: "Riverboat Boarding",
    2: "Jackson Square",
  },
  "122012P17": {
    20: "Chelsea Piers",
  },
  "474891P3": {
    3: "New York Public Library",
  },
  "77348P8": {
    0: "DreamWorks Water Park",
    1: "Blacklight Mini Golf",
  },
  "5144BRUNCH": {
    0: "Sunday Brunch Cruise",
    1: "Coronado Bridge",
    2: "San Diego Waterfront",
    3: "San Diego Bay Open-Water Panoramas",
    4: "North Island Naval Air Station",
  },
  "69764P1": {
    0: "San Diego Bay Departure",
    1: "San Diego Coastline Wildlife Viewing",
  },
  "18125P5": {
    0: "Balboa Park",
    1: "Spanish Village Art Center",
    2: "Alcazar Garden",
  },
  "37126P9": {
    0: "Star of India",
    1: "USS Midway",
    5: "Rady Shell",
    6: "San Diego Convention Center",
  },
  "28758P1": {
    0: "Tijuana",
    1: "Tijuana Walking Tour",
    2: "Tijuana Historic Center",
  },
  "5553984P5": {
    0: "Zurich Old Town",
    1: "Zurich Main Station",
    2: "Lindenhof",
    3: "Zurich Old Town (Altstadt)",
    4: "Fraumünster",
    5: "Bahnhofstrasse",
    6: "Lake Zurich Cruise",
    7: "Lindt Home of Chocolate",
    8: "Paradeplatz",
  },

  "6953SWAMPTRANS": {
    4: "Downtown Drop-off",
  },
  "76145P2": {
    0: "Everglades Launch Area",
    1: "Everglades Wetlands",
    2: "Dock Arrival",
  },
  "8836P2": {
    2: "Departure Pier",
  },
  "89173P10": {
    3: "Launch Paddle",
  },
  "447234P3": {
    0: "Joshua Tree Visitor Center",
  },
  "5046SAN_SEA": {
    0: "San Diego Bay Cruise",
  },
  "388361P1": {
    10: "Rady Shell",
  },
  "335698P7": {
    3: "Cap Rock or Skull Rock",
  },
  "335698P13": {
    0: "Park Entry Orientation",
    3: "Secondary Scrambling Zone",
  },
  "3156P13": {
    3: "Central Park South",
  },
  "5559561P1": {
    0: "Check-in",
    1: "Fort Lauderdale Waterways",
  },
  "214880P12": {
    1: "Coastal Cultural Stops",
  },
  "6400P7": {
    0: "Lake Lucerne",
  },
};

const PRODUCT_ROW_CONDITIONAL_TITLE_OVERRIDES: Record<
  string,
  Record<number, readonly ConditionalTitleOverride[]>
> = {
  "414460P1": {
    0: [
      {
        title: "Wollman Rink",
        currentTitleStartsWith: ["Winter time", "In winter guests"],
      },
    ],
    1: [
      {
        title: "Central Park Carousel",
        currentTitleStartsWith: ["Iconic carousel", "The 1908 carousel"],
      },
    ],
    2: [
      {
        title: "Chess & Checkers House",
        currentTitleStartsWith: ["24 game tables", "The 24 game tables"],
      },
      {
        title: "Strawberry Fields",
        currentTitleStartsWith: ["Strawberry Fields, John Lennon Memorial"],
      },
    ],
    3: [
      {
        title: "Literary Walk",
        currentTitleStartsWith: ["Statues of Shakespeare"],
      },
    ],
    4: [
      {
        title: "Literary Walk",
        currentTitleStartsWith: ["Statues of Shakespeare"],
      },
      {
        title: "Balto Statue",
        currentTitleStartsWith: ["Balto was"],
      },
    ],
    5: [
      {
        title: "Balto Statue",
        currentTitleStartsWith: ["Balto was"],
      },
      {
        title: "Conservatory Water",
        currentTitleStartsWith: ["Remote-control model boats"],
      },
    ],
    6: [
      {
        title: "Rumsey Playfield",
        currentTitleStartsWith: ["Rumsey Playfield"],
      },
      {
        title: "Loeb Boathouse",
        currentTitleStartsWith: [
          "This lakeside restaurant & bar",
          "This lakeside restaurant and bar",
        ],
      },
    ],
    7: [
      {
        title: "Conservatory Water",
        currentTitleStartsWith: ["Man-made pond"],
      },
      {
        title: "Bethesda Fountain",
        currentTitleStartsWith: ["Bethesda Terrace and its famous fountain"],
      },
    ],
    8: [
      {
        title: "Loeb Boathouse",
        currentTitleStartsWith: ["American restaurant & bar"],
      },
      {
        title: "Cherry Hill",
        currentTitleStartsWith: ["Cherry trees and the Friends Fountain"],
      },
    ],
    9: [
      {
        title: "Bethesda Fountain",
        currentTitleStartsWith: ["Bethesda Terrace Fountain"],
      },
      {
        title: "Bow Bridge",
        currentTitleStartsWith: ["This Victorian bridge", "Built in 1862"],
      },
    ],
    10: [
      {
        title: "Bow Bridge",
        currentTitleStartsWith: ["This Victorian bridge"],
      },
      {
        title: "The Lake",
        currentTitleStartsWith: ["The second-largest", "The second largest"],
      },
    ],
    11: [
      {
        title: "Daniel Webster Monument",
        currentTitleStartsWith: ["The Daniel Webster monument"],
      },
      {
        title: "The Lake",
        currentTitleStartsWith: ["The second-largest", "The second largest"],
      },
      {
        title: "Cherry Hill",
        currentTitleStartsWith: ["Named for the cherry trees"],
      },
    ],
    12: [
      {
        title: "The Dakota",
        currentTitleStartsWith: ["The Dakota building", "Dakota building"],
      },
      {
        title: "Daniel Webster Monument",
        currentTitleStartsWith: [
          "The Daniel Webster monument",
          "The monument to American lawyer",
        ],
      },
      {
        title: "Bow Bridge",
        currentTitleStartsWith: ["Built in 1862"],
      },
    ],
    13: [
      {
        title: "Tavern on the Green",
        currentTitleStartsWith: ["Tavern on the Green is"],
      },
      {
        title: "The Dakota",
        currentTitleStartsWith: ["The Dakota building", "Dakota building"],
      },
      {
        title: "The Lake",
        currentTitleStartsWith: ["The second largest man-made body of water"],
      },
    ],
    14: [
      {
        title: "Sheep Meadow",
        currentTitleStartsWith: ["The largest lawn", "Park's largest lawn"],
      },
      {
        title: "Tavern on the Green",
        currentTitleStartsWith: ["Tavern on the Green is"],
      },
      {
        title: "Daniel Webster Monument",
        currentTitleStartsWith: ["The monument to American lawyer"],
      },
    ],
    15: [
      {
        title: "Sheep Meadow",
        currentTitleStartsWith: ["The largest lawn", "Park's largest lawn"],
      },
      {
        title: "Pinebank Arch",
        currentTitleStartsWith: ["Pinebank Arch is"],
      },
    ],
    16: [
      {
        title: "The Dakota",
        currentTitleStartsWith: ["Dakota building", "The Dakota building"],
      },
      {
        title: "Columbus Circle",
        currentTitleStartsWith: ["A traffic circle with the Christopher Columbus monument"],
      },
    ],
    17: [
      {
        title: "Tavern on the Green",
        currentTitleStartsWith: ["Tavern on the Green is an American cuisine"],
      },
    ],
    18: [
      {
        title: "Sheep Meadow",
        currentTitleStartsWith: ["Park's largest lawn"],
      },
    ],
    20: [
      {
        title: "Columbus Circle",
        currentTitleStartsWith: ["Busy traffic circle"],
      },
    ],
  },
  "3156P13": {
    0: [
      {
        title: "City Hall & Civic Center",
        currentTitleStartsWith: ["Once we make sure you are comfortable"],
      },
    ],
    1: [
      {
        title: "Central Park",
        currentTitleStartsWith: ["Explore Central Park"],
      },
    ],
    2: [
      {
        title: "The Vessel",
        currentTitleStartsWith: ["See the new vessel"],
      },
    ],
  },
  "5614063P8": {
    0: [
      {
        title: "Departure from New York",
        currentTitleStartsWith: ["Our tour begins when you leave Manhattan"],
      },
    ],
    1: [
      {
        title: "Delaware Rest Stop",
        currentTitleStartsWith: ["When we meet in Delaware"],
      },
    ],
    2: [
      {
        title: "Pentagon",
        currentTitleStartsWith: [
          "Then we will head to the state of Virginia to border the Pentagon",
        ],
      },
    ],
    3: [
      {
        title: "Arlington National Cemetery",
        currentTitleStartsWith: ["Our first stop will be Arlington National Cemetery"],
      },
    ],
    4: [
      {
        title: "Iwo Jima Memorial",
        currentTitleStartsWith: ["Our next stop will be the Iwo Jima Memorial"],
      },
    ],
    5: [
      {
        title: "National Mall",
        currentTitleStartsWith: ["We will arrive at the National Mall"],
      },
    ],
    6: [
      {
        title: "Washington Monument",
        currentTitleStartsWith: ["We will continue the tour past the federal reserve"],
      },
    ],
    7: [
      {
        title: "White House",
        currentTitleStartsWith: ["We will reach the outside of the white house"],
      },
    ],
    8: [
      {
        title: "Ford's Theatre",
        currentTitleStartsWith: ["We'll visit the Ford Theater"],
      },
    ],
    9: [
      {
        title: "U.S. Capitol",
        currentTitleStartsWith: ["We will visit the southern exterior of the National Capitol"],
      },
    ],
    10: [
      {
        title: "Smithsonian Museums",
        currentTitleStartsWith: ["After this you will have free time to eat"],
      },
    ],
    11: [
      {
        title: "Times Square Return",
        currentTitleStartsWith: ["We will be back in Manhattan between"],
      },
    ],
  },
  "3857PHI": {
    0: [
      {
        title: "Departure from New York",
        currentTitleStartsWith: ["Depart New York through New Jersey"],
      },
    ],
    1: [
      {
        title: "Liberty Bell",
        currentTitleStartsWith: ["Arriving in the historical center of Philadelphia"],
      },
    ],
    2: [
      {
        title: "Elfreth's Alley",
        currentTitleStartsWith: ["Stroll Elfreth"],
      },
    ],
    3: [
      {
        title: "Philadelphia Highlights",
        currentTitleStartsWith: ["Continue on a panoramic tour of Philadelphia"],
      },
    ],
    4: [
      {
        title: "Amish Country",
        currentTitleStartsWith: ["Start your time in Amish country"],
      },
    ],
  },
  "5119P13": {
    0: [
      {
        title: "Hoover Dam",
        currentTitleStartsWith: ["Your full-day guided Grand Canyon West Tour"],
      },
    ],
    1: [
      {
        title: "Grand Canyon West",
        currentTitleStartsWith: ["Your adventure continues as you journey"],
      },
    ],
    2: [
      {
        title: "Eagle Point and Guano Point",
        currentTitleStartsWith: ["At Eagle Point"],
      },
    ],
    3: [
      {
        title: "Guano Point",
        currentTitleStartsWith: ["Guano Point"],
      },
    ],
    4: [
      {
        title: "Grand Canyon West",
        currentTitleStartsWith: ["At Grand Canyon West"],
      },
    ],
  },
  "5516ST5": {
    0: [
      {
        title: "Las Vegas Strip",
        currentTitleStartsWith: ["As your helicopter lifts off"],
      },
    ],
    1: [
      {
        title: "High Roller",
        currentTitleStartsWith: ["Soaring above the skyline, the High Roller"],
      },
    ],
    2: [
      {
        title: "Sphere",
        currentTitleStartsWith: ["Nothing prepares you for the sight of Sphere"],
      },
    ],
    5: [
      {
        title: "Bellagio Fountains",
        currentTitleStartsWith: ["From above, the Bellagio fountains"],
      },
    ],
    7: [
      {
        title: "Luxor",
        currentTitleStartsWith: [
          "As your flight begins its return toward the heliport, the unmistakable pyramid of Luxor",
        ],
      },
    ],
    8: [
      {
        title: "Pampas Brazilian Grille",
        currentTitleStartsWith: [
          "Upgrade your experience with a traditional Brazilian churrascaria dinner at Pampas",
        ],
      },
    ],
  },
  "3533P14": {
    0: [
      {
        title: "Red Rock Canyon",
        currentTitleStartsWith: ["Drive from the LV Strip to Red Rock Canyon"],
      },
    ],
    2: [
      {
        title: "Spring Mountains",
        currentTitleStartsWith: [
          "Home to an impressive array of plants and wildlife, The Spring Mountains",
        ],
      },
    ],
    3: [
      {
        title: "Calico Hills",
        currentTitleStartsWith: ["The kaleidoscopic colors of Calico Hills"],
      },
    ],
    4: [
      {
        title: "Rocky Gap Road",
        currentTitleStartsWith: ["Make your way up Rocky Gap Road"],
      },
    ],
    5: [
      {
        title: "Willow Springs",
        currentTitleStartsWith: ["Stop by Willow Springs"],
      },
    ],
  },
  "60136P1": {
    0: [
      {
        title: "Virgin River Gorge",
        currentTitleStartsWith: ["Drive through the Virgin River Gorge"],
      },
    ],
    1: [
      {
        title: "Kanab",
        currentTitleStartsWith: ["Pass through the town of Kanab"],
      },
    ],
    2: [
      {
        title: "Glen Canyon Dam & Lake Powell",
        currentTitleStartsWith: ["See views of Glen Canyon Dam and Lake Powell"],
      },
    ],
    3: [
      {
        title: "Lake Powell",
        currentTitleStartsWith: ["Enjoy views of the 181 mile long Lake Powell"],
      },
    ],
    4: [
      {
        title: "Grand Staircase-Escalante",
        currentTitleStartsWith: [
          "Enjoy views of colorful rock formation and 80 mile views across the largest National Monument",
        ],
      },
    ],
    5: [
      {
        title: "Horseshoe Bend",
        currentTitleStartsWith: [
          "Enjoy views of the Colorado River in Glen Canyon's Horseshoe Bend",
        ],
      },
    ],
    6: [
      {
        title: "Antelope Canyon",
        currentTitleStartsWith: ["Antelope Canyon"],
      },
    ],
  },
  "26719P8": {
    0: [
      {
        title: "Willow Beach Marina",
        currentTitleStartsWith: ["Begin your kayak adventure at Willow Beach Marina"],
      },
    ],
    1: [
      {
        title: "Black Canyon",
        currentTitleStartsWith: [
          "Immerse yourself in the breathtaking scenery of Black Canyon",
        ],
      },
    ],
    2: [
      {
        title: "Emerald Cove",
        currentTitleStartsWith: ["Discover the magic of Emerald Cove"],
      },
    ],
  },
  "411138P3": {
    4: [
      {
        title: "Girdwood",
        currentTitleStartsWith: ["In Girdwood"],
      },
    ],
    5: [
      {
        title: "Explorer Glacier",
        currentTitleStartsWith: ["Explorer Glacier"],
      },
    ],
    6: [
      {
        title: "Byron Glacier",
        currentTitleStartsWith: ["Seasonal Self-Guided", "Byron Glacier"],
      },
    ],
  },
  "53474P8": {
    0: [
      {
        title: "Campbell Creek Trail",
        currentTitleStartsWith: [
          "The southernmost of Anchorage’s cross-city trails",
          "The southernmost of Anchorage's cross-city trails",
        ],
      },
    ],
    1: [
      {
        title: "Chester Creek Trail",
        currentTitleStartsWith: ["The Lanie Fleischer Chester Creek Trail"],
      },
    ],
    2: [
      {
        title: "Westchester Lagoon",
        currentTitleStartsWith: ["Stop by Westchester Lagoon"],
      },
    ],
    3: [
      {
        title: "Earthquake Park",
        currentTitleStartsWith: ["Earthquake Park gives visitors insight"],
      },
    ],
  },
};

const normalizeTitleForMatch = (value: string | null | undefined): string =>
  (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();

export const getEngine6ItineraryTitleOverride = ({
  productCode,
  rowIndex,
  currentTitle,
}: Engine6ItineraryTitleOverrideInput): string | null => {
  if (!productCode) return null;
  const normalizedProductCode = productCode.toUpperCase();
  const normalizedCurrentTitle = normalizeTitleForMatch(currentTitle);
  const conditionalOverride =
    PRODUCT_ROW_CONDITIONAL_TITLE_OVERRIDES[normalizedProductCode]?.[
      rowIndex
    ]?.find(override =>
      override.currentTitleStartsWith.some(prefix =>
        normalizedCurrentTitle.startsWith(normalizeTitleForMatch(prefix))
      )
    )?.title ?? null;
  return (
    conditionalOverride ??
    PRODUCT_ROW_TITLE_OVERRIDES[normalizedProductCode]?.[rowIndex] ??
    null
  );
};
