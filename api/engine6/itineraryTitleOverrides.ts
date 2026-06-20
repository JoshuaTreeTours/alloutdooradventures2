type Engine6ItineraryTitleOverrideInput = {
  productCode: string | null;
  rowIndex: number;
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
  "3780SUPER": {
    4: "Riverboat Cruise",
    5: "City Highlights Bus Tour",
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
  },
  "214880P12": {
    1: "Coastal Cultural Stops",
  },
  "6400P7": {
    0: "Lake Lucerne",
  },
};

export const getEngine6ItineraryTitleOverride = ({
  productCode,
  rowIndex,
}: Engine6ItineraryTitleOverrideInput): string | null => {
  if (!productCode) return null;
  return PRODUCT_ROW_TITLE_OVERRIDES[productCode]?.[rowIndex] ?? null;
};
