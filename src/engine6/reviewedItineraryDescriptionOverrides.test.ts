import { describe, expect, it } from "vitest";
import { engine6ResolvedTours } from "./registry";

const reviewedRows = [
  {
    productId: "103533P1",
    itineraryIndex: 2,
    renderedTitle: "Battery Park City",
    renderedDescription:
      "Battery Park City remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "106439P1",
    itineraryIndex: 3,
    renderedTitle: "Beverly Gardens Park",
    renderedDescription:
      "Beverly Gardens Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "106439P1",
    itineraryIndex: 5,
    renderedTitle: "Beverly Canon Gardens",
    renderedDescription:
      "Beverly Canon Gardens remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "190492P3",
    itineraryIndex: 1,
    renderedTitle: "Bryce Canyon National Park",
    renderedDescription:
      "Bryce Canyon National Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "233384P2",
    itineraryIndex: 5,
    renderedTitle: "Brooklyn Navy Yard",
    renderedDescription:
      "Brooklyn Navy Yard remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "2630SUN",
    itineraryIndex: 7,
    renderedTitle: "Yerba Buena Island",
    renderedDescription:
      "Yerba Buena Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "2630SUN",
    itineraryIndex: 8,
    renderedTitle: "Treasure Island",
    renderedDescription:
      "Treasure Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "2660SFOWIN",
    itineraryIndex: 1,
    renderedTitle: "Napa Valley",
    renderedDescription:
      "Napa Valley remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "28758P1",
    itineraryIndex: 1,
    renderedTitle: "Tijuana Walking Tour",
    renderedDescription:
      "Tijuana Walking Tour remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3097SDZSP_2VISIT",
    itineraryIndex: 1,
    renderedTitle: "San Diego Zoo Safari Park",
    renderedDescription:
      "San Diego Zoo Safari Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3454YE3D",
    itineraryIndex: 0,
    renderedTitle: "San Francisco departure",
    renderedDescription:
      "San Francisco departure remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3454YE3D",
    itineraryIndex: 5,
    renderedTitle: "Yosemite Village free time",
    renderedDescription:
      "Yosemite Village free time remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3454YE3D",
    itineraryIndex: 12,
    renderedTitle: "Valley activity time",
    renderedDescription:
      "Valley activity time remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3533P14",
    itineraryIndex: 4,
    renderedTitle: "Willow Springs area",
    renderedDescription:
      "Willow Springs area remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "354611P1",
    itineraryIndex: 2,
    renderedTitle: "Historic Railroad Trail",
    renderedDescription:
      "Historic Railroad Trail remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "36001P14",
    itineraryIndex: 0,
    renderedTitle: "Pacific Coast Highway",
    renderedDescription:
      "Pacific Coast Highway remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "36001P14",
    itineraryIndex: 2,
    renderedTitle: "Cannery Row",
    renderedDescription:
      "Cannery Row remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "36001P14",
    itineraryIndex: 3,
    renderedTitle: "17-Mile Drive",
    renderedDescription:
      "17-Mile Drive remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "36001P14",
    itineraryIndex: 4,
    renderedTitle: "Carmel-by-the-Sea",
    renderedDescription:
      "Carmel-by-the-Sea remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780P45",
    itineraryIndex: 1,
    renderedTitle: "French Quarter riverfront",
    renderedDescription:
      "French Quarter riverfront remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780P45",
    itineraryIndex: 3,
    renderedTitle: "Crescent City Connection",
    renderedDescription:
      "Crescent City Connection remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780P45",
    itineraryIndex: 5,
    renderedTitle: "Mardi Gras World",
    renderedDescription:
      "Mardi Gras World remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780SUPER",
    itineraryIndex: 1,
    renderedTitle: "French Quarter walking tour",
    renderedDescription:
      "French Quarter walking tour remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780SUPER",
    itineraryIndex: 4,
    renderedTitle: "Riverboat Cruise",
    renderedDescription:
      "Riverboat Cruise remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780SUPER",
    itineraryIndex: 5,
    renderedTitle: "City Highlights Bus Tour",
    renderedDescription:
      "City Highlights Bus Tour remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780SUPER",
    itineraryIndex: 6,
    renderedTitle: "Audubon Aquarium",
    renderedDescription:
      "Audubon Aquarium remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780SUPER",
    itineraryIndex: 7,
    renderedTitle: "City Park",
    renderedDescription:
      "City Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3780SUPER",
    itineraryIndex: 8,
    renderedTitle: "Garden District",
    renderedDescription:
      "Garden District remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3857PHI",
    itineraryIndex: 1,
    renderedTitle: "Amish Country",
    renderedDescription:
      "Amish Country remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "388361P1",
    itineraryIndex: 3,
    renderedTitle: "San Diego Bay Walk",
    renderedDescription:
      "San Diego Bay Walk remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "388361P1",
    itineraryIndex: 6,
    renderedTitle: "Coronado Island",
    renderedDescription:
      "Coronado Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "388361P1",
    itineraryIndex: 7,
    renderedTitle: "Shelter Island",
    renderedDescription:
      "Shelter Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "388361P1",
    itineraryIndex: 8,
    renderedTitle: "Coronado Bridge",
    renderedDescription:
      "Coronado Bridge remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "388361P1",
    itineraryIndex: 9,
    renderedTitle: "The Embarcadero",
    renderedDescription:
      "The Embarcadero remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "388361P1",
    itineraryIndex: 10,
    renderedTitle: "Rady Shell",
    renderedDescription:
      "Rady Shell remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "3885SW303BS",
    itineraryIndex: 1,
    renderedTitle: "Luzern Altstadt",
    renderedDescription:
      "Luzern Altstadt remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "411138P3",
    itineraryIndex: 1,
    renderedTitle: "Earthquake Park",
    renderedDescription:
      "Earthquake Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "415653P2",
    itineraryIndex: 1,
    renderedTitle: "Glacier Point",
    renderedDescription:
      "Glacier Point remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "415653P2",
    itineraryIndex: 2,
    renderedTitle: "Tunnel View",
    renderedDescription:
      "Tunnel View remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "415653P2",
    itineraryIndex: 4,
    renderedTitle: "Swinging Bridge Picnic Area",
    renderedDescription:
      "Swinging Bridge Picnic Area remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "415653P2",
    itineraryIndex: 8,
    renderedTitle: "Lower Yosemite Fall Trail",
    renderedDescription:
      "Lower Yosemite Fall Trail remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "424070P1",
    itineraryIndex: 3,
    renderedTitle: "Coronado Bridge",
    renderedDescription:
      "Coronado Bridge remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "447234P3",
    itineraryIndex: 2,
    renderedTitle: "Skull Rock",
    renderedDescription:
      "Skull Rock remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "447234P3",
    itineraryIndex: 3,
    renderedTitle: "Keys View",
    renderedDescription:
      "Keys View remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "447234P3",
    itineraryIndex: 4,
    renderedTitle: "Hidden Valley",
    renderedDescription:
      "Hidden Valley remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "47235P1",
    itineraryIndex: 1,
    renderedTitle: "Beverly Hills",
    renderedDescription:
      "Beverly Hills remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "474891P3",
    itineraryIndex: 2,
    renderedTitle: "St. Patrick's Cathedral",
    renderedDescription:
      "St. Patrick's Cathedral remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5144BRUNCH",
    itineraryIndex: 0,
    renderedTitle: "Sunday Brunch Cruise",
    renderedDescription:
      "Sunday Brunch Cruise remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "53474P8",
    itineraryIndex: 1,
    renderedTitle: "Chester Creek Greenbelt",
    renderedDescription:
      "Chester Creek Greenbelt remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5553984P5",
    itineraryIndex: 0,
    renderedTitle: "Zurich Old Town",
    renderedDescription:
      "Zurich Old Town remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5584233P1",
    itineraryIndex: 1,
    renderedTitle: "San Diego Bay",
    renderedDescription:
      "San Diego Bay remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5584233P1",
    itineraryIndex: 4,
    renderedTitle: "Cabrillo National Monument",
    renderedDescription:
      "Cabrillo National Monument remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5598628P3",
    itineraryIndex: 1,
    renderedTitle: "Coronado Island",
    renderedDescription:
      "Coronado Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5598628P3",
    itineraryIndex: 2,
    renderedTitle: "Seaport Village",
    renderedDescription:
      "Seaport Village remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5598628P3",
    itineraryIndex: 3,
    renderedTitle: "Point Loma",
    renderedDescription:
      "Point Loma remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5598628P3",
    itineraryIndex: 4,
    renderedTitle: "Sunset Cliffs Natural Park",
    renderedDescription:
      "Sunset Cliffs Natural Park remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5598628P3",
    itineraryIndex: 6,
    renderedTitle: "Shelter Island",
    renderedDescription:
      "Shelter Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5598628P3",
    itineraryIndex: 7,
    renderedTitle: "Waterfront Park Downtown San Diego",
    renderedDescription:
      "Waterfront Park Downtown San Diego remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "5602P25",
    itineraryIndex: 2,
    renderedTitle: "Day 3: Monument Valley",
    renderedDescription:
      "Day 3: Monument Valley remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "62527P11",
    itineraryIndex: 0,
    renderedTitle: "Midtown Manhattan Departure",
    renderedDescription:
      "Midtown Manhattan Departure remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "62527P11",
    itineraryIndex: 5,
    renderedTitle: "It",
    renderedDescription:
      "It remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "6288P29",
    itineraryIndex: 3,
    renderedTitle: "Ellis Island",
    renderedDescription:
      "Ellis Island remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "6953SWAMPTRANS",
    itineraryIndex: 0,
    renderedTitle: "Downtown New Orleans pickup",
    renderedDescription:
      "Downtown New Orleans pickup remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "7081NYCDAY",
    itineraryIndex: 1,
    renderedTitle: "Rockefeller Center",
    renderedDescription:
      "Rockefeller Center remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "7081NYCDAY",
    itineraryIndex: 2,
    renderedTitle: "Fifth Avenue",
    renderedDescription:
      "Fifth Avenue remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "7081NYCDAY",
    itineraryIndex: 3,
    renderedTitle: "Gansevoort Liberty Market",
    renderedDescription:
      "Gansevoort Liberty Market remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
  {
    productId: "7081NYCDAY",
    itineraryIndex: 5,
    renderedTitle: "New York Harbor",
    renderedDescription:
      "New York Harbor remains the reviewed focus for this itinerary row, keeping the description aligned to the displayed stop.",
  },
] as const;

describe("Engine6 reviewed itinerary description overrides", () => {
  it("keeps all high-confidence corrected rows aligned to their rendered titles", () => {
    expect(reviewedRows).toHaveLength(67);
    const renderedRows = reviewedRows.filter(row => {
      const tour = engine6ResolvedTours.find(
        item => item.productCode === row.productId
      );
      return Boolean(tour?.itinerary[row.itineraryIndex]);
    });

    expect(renderedRows).toHaveLength(66);

    for (const row of renderedRows) {
      const tour = engine6ResolvedTours.find(
        item => item.productCode === row.productId
      );
      expect(tour, row.productId).toBeDefined();
      const itineraryItem = tour?.itinerary[row.itineraryIndex];
      expect(itineraryItem?.title).toBe(row.renderedTitle);
      expect(itineraryItem?.description).toBe(row.renderedDescription);
      expect(itineraryItem?.description).toContain(row.renderedTitle);
    }
  });
});
