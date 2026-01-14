export const ACTIVITY_PAGES = [
  {
    slug: "cycling",
    title: "Cycling Adventures",
    description:
      "Ride iconic roads, coastal loops, and cross-country routes with local guides.",
    image:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "hiking",
    title: "Hiking Adventures",
    description:
      "Guided day hikes with big views, alpine lakes, and can’t-miss trailheads.",
    image:
      "/images/hiking-hero2.jpg",
  },
  {
    slug: "day-adventures",
    title: "Day Adventures",
    description:
      "Half-day escapes, scenic outings, and easy add-ons that fit any schedule.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "detours",
    title: "Detours & Highlights",
    description:
      "Short trips, food stops, and quick excursions to layer into longer plans.",
    image:
      "https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "multi-day",
    title: "Multi-day Tours",
    description:
      "Overnight routes, hut-to-hut treks, and multi-day guided itineraries.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "sailing-boat",
    title: "Sailing & Boat Tours",
    description:
      "Multi-day sailing excursions, island hops, and easygoing Carnival-style cruises.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  },
];

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export const EUROPE_CITIES = [
  {
    region: "United Kingdom",
    cities: ["London", "Edinburgh", "Bath", "Manchester", "Bristol"],
  },
  {
    region: "France",
    cities: ["Paris", "Nice", "Lyon", "Bordeaux", "Chamonix"],
  },
  {
    region: "Italy",
    cities: ["Rome", "Florence", "Milan", "Venice", "Naples"],
  },
  {
    region: "Spain",
    cities: ["Barcelona", "Madrid", "Seville", "Valencia", "Bilbao"],
  },
  {
    region: "Portugal",
    cities: ["Lisbon", "Porto", "Madeira", "Faro"],
  },
  {
    region: "Switzerland",
    cities: ["Zurich", "Lucerne", "Interlaken", "Zermatt"],
  },
  {
    region: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Cologne"],
  },
  {
    region: "Netherlands",
    cities: ["Amsterdam", "Rotterdam", "Utrecht"],
  },
  {
    region: "Greece",
    cities: ["Athens", "Santorini", "Crete"],
  },
  {
    region: "Nordics",
    cities: ["Copenhagen", "Stockholm", "Oslo", "Reykjavik", "Helsinki"],
  },
];

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
