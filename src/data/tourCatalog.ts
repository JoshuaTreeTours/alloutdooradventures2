export const ACTIVITY_PAGES = [
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
    title: "Day Tours & Highlights",
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
];

export const ADVENTURE_ACTIVITY_PAGES = [
  {
    slug: "cycling",
    title: "Cycling",
    description: "Road rides, gravel loops, and guided bike tours.",
    image: "/images/cycling-hero.jpg",
  },
  {
    slug: "hiking",
    title: "Hiking",
    description: "Trail days with alpine views and lakeside vistas.",
    image: "/images/hiking-hero3.jpg",
  },
  {
    slug: "sailing-boat",
    title: "Canoeing",
    description: "Worldwide paddle adventures.",
    image: "/images/canoe-hero.jpg",
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
