export type Destination = {
  name: string;
  stateSlug: string;
  description: string;
  featuredDescription?: string;
  image: string;
  href: string;
};

export const destinations: Destination[] = [
  {
    name: "California",
    stateSlug: "california",
    description: "Coastal drives, alpine hikes, and redwood escapes.",
    featuredDescription:
      "Surf to summit with coastal cliffs, redwood groves, and alpine trails.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/california",
  },
  {
    name: "Arizona",
    stateSlug: "arizona",
    description: "Desert sunrises, canyon overlooks, and stargazing nights.",
    featuredDescription:
      "Sunrise hikes, canyon overlooks, and desert skies that glow at dusk.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/arizona",
  },
  {
    name: "Nevada",
    stateSlug: "nevada",
    description: "Hidden hot springs, high desert trails, and open skies.",
    featuredDescription: "Wide-open basins, rugged ranges, and hidden hot springs.",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/nevada",
  },
  {
    name: "Utah",
    stateSlug: "utah",
    description: "Slot canyons, iconic arches, and sandstone vistas.",
    featuredDescription:
      "Iconic arches, canyon slots, and sandstone trails made for exploration.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/utah",
  },
  {
    name: "Oregon",
    stateSlug: "oregon",
    description: "Waterfalls, misty forests, and volcanic ridgelines.",
    featuredDescription:
      "Waterfalls, misty forests, and volcanic peaks around every bend.",
    image:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/oregon",
  },
  {
    name: "Washington",
    stateSlug: "washington",
    description: "Rainforests, alpine lakes, and glacier-capped peaks.",
    featuredDescription:
      "Coastal rainforests, alpine lakes, and glacier-capped peaks to explore.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/washington",
  },
];

export const featuredDestinations = destinations;
