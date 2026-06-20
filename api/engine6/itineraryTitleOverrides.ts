type Engine6ItineraryTitleOverrideInput = {
  productCode: string | null;
  rowIndex: number;
};

// Product-scoped itinerary title repairs confirmed by Engine6 itinerary title
// audits/manual review. These products have stable row order and no safe
// count-aligned public JSON-LD title list; use these only as conservative
// fallbacks before the description-derived title heuristic.
const PRODUCT_ROW_TITLE_OVERRIDES: Record<string, Record<number, string>> = {
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
  "414460P1": {
    0: "Wollman Rink",
    1: "Central Park Carousel",
    2: "Chess & Checkers House",
    3: "Literary Walk",
    4: "Balto Statue",
    5: "Conservatory Water",
    6: "Central Park Boathouse",
    7: "Bethesda Fountain",
    8: "Cherry Hill",
    9: "Bow Bridge",
    10: "The Lake",
    11: "Daniel Webster Monument",
    12: "The Dakota",
    13: "Tavern on the Green",
    14: "Sheep Meadow",
    15: "Pinebank Arch",
    16: "Columbus Circle",
  },
  "5569HIKE": {
    0: "Safety Briefing",
    2: "Hollywood Hills Trail",
    3: "Griffith Observatory",
    4: "Tiffany Point",
    8: "Griffith Park",
    9: "Santa Monica Mountains",
    10: "Mount Hollywood",
    11: "Hollywood Sign",
    12: "Century City Views",
    13: "Warner Bros. Studios",
    14: "Downtown Los Angeles Views",
    16: "Hollywood Views",
    17: "Los Angeles Zoo",
    18: "Autry Museum of the American West",
    19: "Griffith Park Bird Sanctuary",
    20: "Walt Disney Studios",
  },
  "5144BRUNCH": {
    3: "San Diego Bay Open-Water Panoramas",
  },
  "69764P1": {
    0: "San Diego Bay Departure",
    1: "San Diego Coastline Wildlife Viewing",
  },
  "18125P5": {
    0: "Balboa Park",
    2: "Alcazar Garden",
  },
  "37126P9": {
    0: "Star of India",
  },
  "28758P1": {
    0: "Tijuana",
    1: "Tijuana Walking Tour",
    2: "Tijuana Historic Center",
  },
  "5553984P5": {
    0: "Zurich Old Town",
    2: "Lindenhof",
    3: "Zurich Old Town (Altstadt)",
    5: "Bahnhofstrasse",
    6: "Lake Zurich Cruise",
    8: "Paradeplatz",
  },
};

export const getEngine6ItineraryTitleOverride = ({
  productCode,
  rowIndex,
}: Engine6ItineraryTitleOverrideInput): string | null => {
  if (!productCode) return null;
  return PRODUCT_ROW_TITLE_OVERRIDES[productCode]?.[rowIndex] ?? null;
};
