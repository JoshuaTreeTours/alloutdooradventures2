import { describe, expect, it } from "vitest";
import { classifyTourCategories } from "./tourCategoryClassifier";

const slugsFor = (input: Parameters<typeof classifyTourCategories>[0]) =>
  classifyTourCategories(input).matchedCategorySlugs;

describe("classifyTourCategories", () => {
  it("classifies Jet Ski as Water Sports", () => {
    expect(slugsFor({ title: "Jet Ski Adventure" })).toEqual(["water-sports"]);
  });

  it("classifies snorkeling and underwater fish viewing as Water Sports, not Fishing", () => {
    [
      "Snorkeling with tropical fish",
      "Guided reef snorkeling",
      "Swim among colorful fish",
      "Snorkel tour",
      "Coral reef snorkeling",
      "Underwater viewing",
    ].forEach(title => {
      const slugs = slugsFor({ title, categories: ["Fishing"] });

      expect(slugs[0]).toBe("water-sports");
      expect(slugs).toContain("water-sports");
      expect(slugs).not.toContain("fishing");
    });
  });

  it("classifies Dolphin Jet Ski as Water Sports and Wildlife", () => {
    expect(slugsFor({ title: "Dolphin Jet Ski Safari" })).toEqual([
      "water-sports",
      "wildlife",
    ]);
  });

  it("classifies marine wildlife intent as Wildlife instead of Sailing", () => {
    [
      "whale watching sail",
      "dolphin watching catamaran",
      "orca watching schooner",
      "sea life viewing yacht",
      "marine wildlife cruise",
      "wildlife cruise",
      "manatee watching boat tour",
      "seal watching boat tour",
      "turtle watching catamaran",
    ].forEach(title => {
      const slugs = slugsFor({ title, categories: ["Sailing"] });

      expect(slugs[0]).toBe("wildlife");
      expect(slugs).toContain("wildlife");
      expect(slugs).not.toContain("sailing");
    });
  });

  it("keeps primary sailing experiences classified as Sailing", () => {
    [
      "sunset sail",
      "private sailing charter",
      "sailing charter",
      "sailboat cruise",
      "catamaran sail",
      "yacht sailing",
      "private sailing experience",
    ].forEach(title => {
      expect(slugsFor({ title })).toEqual(["sailing"]);
    });
  });

  it("classifies vessel-based sightseeing as Boating before broad sightseeing", () => {
    [
      "boat tour",
      "sightseeing boat tour",
      "harbor cruise",
      "bay cruise",
      "river cruise",
      "riverboat sightseeing cruise",
      "lake cruise",
      "canal cruise",
      "speedboat sightseeing tour",
      "speed boat adventure",
      "Duffy boat rental",
      "adventure boat tour",
      "electric boat rental and tour",
      "pontoon boat tour",
      "private boat charter",
      "yacht cruise",
      "Houston Party Barge Cruise",
      "Tampa Bay Sandbar Cruise",
      "amphibious seal tour",
      "water taxi-style sightseeing tour",
    ].forEach(title => {
      const slugs = slugsFor({ title });

      expect(slugs[0]).toBe("boating");
      expect(slugs).toContain("boating");
      expect(slugs).not.toContain("sightseeing-city-tours");
    });
  });

  it("keeps land-based and cycling tours out of Boating", () => {
    const examples: Array<
      [Parameters<typeof classifyTourCategories>[0], string[]]
    > = [
      [
        { title: "Joshua Tree National Park Day Trip from San Diego" },
        ["sightseeing-city-tours"],
      ],
      [
        { title: "Private City Tour of San Francisco" },
        ["sightseeing-city-tours"],
      ],
      [
        { title: "Giant Shopping Cart Limo Ride in Las Vegas" },
        ["sightseeing-city-tours"],
      ],
      [
        { title: "GoCar After Dark - 2 hr. Gaslamp and Balboa Park Tour" },
        ["sightseeing-city-tours"],
      ],
      [
        {
          title:
            "Islands & Harbor Sightseeing Bike Tour - Explore the Must-See Sites",
        },
        ["cycling", "sightseeing-city-tours"],
      ],
      [{ title: "city bus sightseeing tour" }, ["sightseeing-city-tours"]],
      [{ title: "Coastal Cruise Bike Tour" }, ["cycling"]],
      [{ title: "Hike & Camp", categories: ["Boat Rental"] }, ["hiking"]],
      [
        {
          title: "Hiking Tour to San Fruttuoso, Full day Private Experience",
          categories: ["Ferry Transfer", "Boat Rental"],
        },
        ["hiking"],
      ],
    ];

    examples.forEach(([input, expected]) => {
      expect(slugsFor(input)).toEqual(expected);
      expect(slugsFor(input)).not.toContain("boating");
    });
  });

  it("does not use loose cruise wording alone as a Boating signal", () => {
    expect(slugsFor({ title: "UPCOUNTRY FOOD CRUISE" })).toEqual(["food-wine"]);
    expect(slugsFor({ title: "Coastal Cruise Bike Tour" })).toEqual([
      "cycling",
    ]);
  });

  it("keeps primary boat tours in Boating when bicycle rental is only an add-on", () => {
    expect(
      slugsFor({
        title: "Miami Boat Tour with FREE South Beach Bicycle Rental",
      })
    ).toEqual(["boating"]);
  });

  it("keeps higher-priority water taxonomy categories out of Boating", () => {
    const examples: Array<[string, string]> = [
      ["whale watching cruise", "wildlife"],
      ["dolphin watching boat tour", "wildlife"],
      ["fishing charter", "fishing"],
      ["sunset sail", "sailing"],
      ["private sailing charter", "sailing"],
      ["kayak tour", "paddle-sports"],
      ["snorkel tour", "water-sports"],
    ];

    examples.forEach(([title, expectedSlug]) => {
      const slugs = slugsFor({ title });

      expect(slugs[0]).toBe(expectedSlug);
      expect(slugs).toContain(expectedSlug);
      expect(slugs).not.toContain("boating");
    });
  });

  it("keeps land-based sightseeing in Sightseeing & City Tours", () => {
    expect(slugsFor({ title: "city bus sightseeing tour" })).toEqual([
      "sightseeing-city-tours",
    ]);
  });

  it("classifies an e-bike wine tour as Cycling and Food & Wine", () => {
    expect(slugsFor({ title: "E-bike wine tour through vineyards" })).toEqual([
      "cycling",
      "food-wine",
    ]);
  });

  it("classifies a helicopter wildlife tour as Air Tours and Wildlife", () => {
    expect(slugsFor({ title: "Helicopter wildlife tour" })).toEqual([
      "air-tours",
      "wildlife",
    ]);
  });

  it("classifies a Jeep tour as Jeep & Off-Road", () => {
    expect(slugsFor({ title: "Jeep tour through red rock canyons" })).toEqual([
      "jeep-off-road",
    ]);
  });

  it("classifies a stargazing tour as Stargazing", () => {
    expect(slugsFor({ title: "Night sky stargazing tour" })).toEqual([
      "stargazing",
    ]);
  });

  it("classifies equestrian riding inventory as Horseback Riding before broad activity buckets", () => {
    [
      "Horseback trail ride",
      "Sunset ranch ride",
      "Equestrian tour through the foothills",
      "Mule ride canyon sightseeing tour",
      "Horseback riding hiking trail tour",
    ].forEach(title => {
      const slugs = slugsFor({
        title,
        categories: ["Hiking", "Walking Tours", "Sightseeing & City Tours"],
      });

      expect(slugs[0]).toBe("horseback-riding");
      expect(slugs).not.toContain("hiking");
      expect(slugs).not.toContain("walking-tours");
      expect(slugs).not.toContain("sightseeing-city-tours");
    });
  });

  it("does not classify hiking or non-riding horse mentions as Horseback Riding", () => {
    expect(slugsFor({ title: "Hiking trail tour" })).toEqual(["hiking"]);
    expect(slugsFor({ title: "Historic horse carriage ride" })).not.toContain(
      "horseback-riding"
    );
    expect(
      slugsFor({ title: "Horse racing spectator experience" })
    ).not.toContain("horseback-riding");
    expect(
      slugsFor({ title: "Historical tour about frontier horses" })
    ).not.toContain("horseback-riding");
    expect(
      slugsFor({ title: "Working ranch tour without riding" })
    ).not.toContain("horseback-riding");
  });

  it("classifies fishing inventory as Fishing before broader activities", () => {
    [
      "Private fishing charter",
      "Deep sea fishing adventure",
      "Deep sea fishing charter",
      "Sportfishing trip",
      "Fly fishing excursion",
      "Fly fishing guided hike",
      "Reef fishing sightseeing tour",
      "Angling boat tour",
      "Lake fishing excursion",
      "River fishing city highlights tour",
    ].forEach(title => {
      const slugs = slugsFor({ title });

      expect(slugs[0]).toBe("fishing");
      expect(slugs).toContain("fishing");
    });
  });

  it("does not classify non-fishing boat cruises or food walks as Fishing", () => {
    expect(slugsFor({ title: "Private harbor boat cruise" })).not.toContain(
      "fishing"
    );
    expect(
      slugsFor({ title: "Pizza, pasta and piazzas", categories: ["Fishing"] })
    ).not.toContain("fishing");
  });

  it("classifies urban walking experiences as Walking Tours instead of Hiking", () => {
    [
      "Historic city walking tour",
      "Ghost walk",
      "Architecture walking tour",
      "Neighborhood walking tour",
      "Street art walking tour",
      "Cultural walking tour",
      "Urban exploration walk",
    ].forEach(title => {
      const slugs = slugsFor({ title });

      expect(slugs).toContain("walking-tours");
      expect(slugs).not.toContain("hiking");
    });
  });

  it("keeps food walking tours in Food & Wine when food is primary", () => {
    expect(
      slugsFor({ title: "Food walking tour with pizza and gelato" })
    ).toEqual(["food-wine"]);
  });

  it("keeps true hiking and trail inventory in Hiking instead of Walking Tours", () => {
    [
      "National park guided hike",
      "Canyon trail trekking tour",
      "Mountain hiking trail adventure",
    ].forEach(title => {
      const slugs = slugsFor({ title });

      expect(slugs).toContain("hiking");
      expect(slugs).not.toContain("walking-tours");
    });
  });

  it("keeps bus sightseeing tours in Sightseeing & City Tours", () => {
    expect(slugsFor({ title: "Bus sightseeing tour" })).toEqual([
      "sightseeing-city-tours",
    ]);
  });

  it("classifies a generic city bus tour as Sightseeing & City Tours", () => {
    expect(slugsFor({ title: "Generic city bus tour" })).toEqual([
      "sightseeing-city-tours",
    ]);
  });

  it("keeps generic Sightseeing after more specific category matches", () => {
    expect(slugsFor({ title: "City highlights tour by bike" })).toEqual([
      "cycling",
      "sightseeing-city-tours",
    ]);
  });

  it("does not infer activities from Santa Barbara trolley route location names", () => {
    expect(
      slugsFor({
        title: "Santa Barbara Trolley Tour",
        overview:
          "See Santa Barbara highlights by trolley with local narration.",
        itinerary: [
          { title: "Stearns Wharf" },
          { title: "Andrée Clark Bird Refuge" },
          { title: "East Beach waterfront" },
        ],
      })
    ).toEqual(["sightseeing-city-tours"]);
  });

  it("uses Jeep & Off-Road as primary when off-road and trail language both appear", () => {
    expect(
      slugsFor({
        title: "Off Road Las Vegas Tour",
        overview:
          "Ride a 4x4 off-road route near Las Vegas with desert trail scenery.",
      })
    ).toEqual(["jeep-off-road"]);
  });
});
