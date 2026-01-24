export const cityContext: Record<
  string,
  {
    type:
      | "urban"
      | "mountain-town"
      | "coastal-town"
      | "desert-town"
      | "historic-district";
    anchors: string[];
    nearby: string[];
  }
> = {
  "central-city-co": {
    type: "mountain-town",
    anchors: [
      "the closed historic main street",
      "19th-century mining buildings",
      "opera house and heritage district",
      "walkable casino strip",
    ],
    nearby: [
      "Boulder",
      "Nederland",
      "the Peak-to-Peak Scenic Byway",
      "Front Range foothills",
    ],
  },
  "portland-or": {
    type: "urban",
    anchors: ["NW / Nob Hill", "Pearl District", "Hawthorne"],
    nearby: ["Columbia River Gorge", "Mount Hood"],
  },
  "denver-co": {
    type: "urban",
    anchors: [
      "LoDo",
      "RiNo",
      "Capitol Hill",
      "Cherry Creek",
      "Highlands",
      "Platte River Trail",
    ],
    nearby: ["Boulder", "Golden", "Red Rocks", "Front Range foothills"],
  },
};
