type Engine6ItineraryTitleOverrideInput = {
  productCode: string | null;
  rowIndex: number;
};

// Product-scoped itinerary title repairs confirmed by Engine6 itinerary
// prose-quality and missing-title audits. These rows have stable order and no
// usable raw title/name fields in the affected payloads; use these only as
// conservative fallbacks before the description-derived title heuristic.
const PRODUCT_ROW_TITLE_OVERRIDES: Record<string, Record<number, string>> = {
  "3885SW303BS": {
    0: "Sihlquai Bus Station departure",
    1: "Lucerne orientation drive",
    2: "Mount Titlis cable car ascent",
    3: "Glacier Cave and Titlis Cliff Walk",
    4: "Sihlquai Coach Terminal return",
  },
  "3885GRINDEL_ZUR": {
    0: "Zurich departure",
    1: "Interlaken",
    2: "Grindelwald",
    3: "Lauterbrunnen",
    4: "Return to Zurich",
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
};

export const getEngine6ItineraryTitleOverride = ({
  productCode,
  rowIndex,
}: Engine6ItineraryTitleOverrideInput): string | null => {
  if (!productCode) return null;
  return PRODUCT_ROW_TITLE_OVERRIDES[productCode]?.[rowIndex] ?? null;
};
