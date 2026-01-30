export type LocalPoi = {
  id: string;
  name: string;
  category:
    | "park"
    | "viewpoint"
    | "trail"
    | "boulder-area"
    | "historic-site"
    | "visitor-center";
  lat: number;
  lng: number;
  source: "curated";
  url?: string;
  citySlug: string;
  stateSlug: string;
};

export const cityLocalPois: LocalPoi[] = [
  {
    id: "joshua-tree-west-entrance",
    name: "Joshua Tree National Park (West Entrance)",
    category: "park",
    lat: 34.011,
    lng: -116.1667,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "hidden-valley",
    name: "Hidden Valley",
    category: "boulder-area",
    lat: 34.0124,
    lng: -116.1669,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "keys-view",
    name: "Keys View",
    category: "viewpoint",
    lat: 33.9249,
    lng: -116.1683,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "barker-dam",
    name: "Barker Dam",
    category: "trail",
    lat: 34.0205,
    lng: -116.1447,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "skull-rock",
    name: "Skull Rock",
    category: "boulder-area",
    lat: 33.9992,
    lng: -116.0527,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "cholla-cactus-garden",
    name: "Cholla Cactus Garden",
    category: "trail",
    lat: 33.9242,
    lng: -115.9247,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "ryan-mountain-trailhead",
    name: "Ryan Mountain Trailhead",
    category: "trail",
    lat: 34.0133,
    lng: -116.1552,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "cap-rock",
    name: "Cap Rock",
    category: "trail",
    lat: 33.9863,
    lng: -116.043,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "indian-cove",
    name: "Indian Cove",
    category: "boulder-area",
    lat: 34.0812,
    lng: -116.1564,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
  {
    id: "joshua-tree-visitor-center",
    name: "Joshua Tree Visitor Center",
    category: "visitor-center",
    lat: 34.1349,
    lng: -116.3153,
    source: "curated",
    citySlug: "joshua-tree",
    stateSlug: "california",
  },
];
