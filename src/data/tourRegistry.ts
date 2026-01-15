export type TourCategory =
  | "Hiking"
  | "Cycling"
  | "Water/Boating"
  | "Food & Drink"
  | "Shows/Nightlife"
  | "Scenic Drives"
  | "Family-friendly"
  | "Adventure";

export type TourRegistryEntry = {
  destination: string;
  slug: string;
  viatorProductCode: string;
  title: string;
  blurb: string;
  image: string;
  tagIds: number[];
  categories: TourCategory[];
  outboundUrl: string;
};

export const tourRegistry: TourRegistryEntry[] = [
  {
    destination: "nevada",
    slug: "red-rock-canyon-sunset-adventure",
    viatorProductCode: "12345P1",
    title: "Red Rock Canyon Sunset Adventure",
    blurb:
      "Catch golden-hour light in Red Rock Canyon with a guided loop that blends short walks, scenic viewpoints, and time for photos.",
    image: "/images/nevada/nevada-hero.png",
    tagIds: [12045, 21925],
    categories: ["Scenic Drives", "Adventure"],
    outboundUrl:
      "https://www.viator.com/tours/Las-Vegas/Red-Rock-Canyon-Sunset-Adventure/d684-12345P1",
  },
  {
    destination: "nevada",
    slug: "black-canyon-kayak-float",
    viatorProductCode: "12345P2",
    title: "Black Canyon Kayak Float from Las Vegas",
    blurb:
      "Paddle calm emerald waters through Black Canyon with a guided float that highlights wildlife, hot springs, and canyon walls.",
    image: "/images/nevada/nevada-hero.png",
    tagIds: [21925, 12046],
    categories: ["Water/Boating", "Family-friendly"],
    outboundUrl:
      "https://www.viator.com/tours/Las-Vegas/Black-Canyon-Kayak-Float/d684-12345P2",
  },
  {
    destination: "nevada",
    slug: "las-vegas-food-night-tour",
    viatorProductCode: "12345P3",
    title: "Las Vegas Food & Nightlife Walk",
    blurb:
      "Taste local favorites and hidden gems on a small-group evening walk that blends culinary stops with a peek at downtown’s nightlife.",
    image: "/images/nevada/nevada-hero.png",
    tagIds: [15025, 15433],
    categories: ["Food & Drink", "Shows/Nightlife"],
    outboundUrl:
      "https://www.viator.com/tours/Las-Vegas/Las-Vegas-Food-and-Nightlife-Walk/d684-12345P3",
  },
];

export const getToursByDestination = (destination: string) =>
  tourRegistry.filter((tour) => tour.destination === destination);

export const getTourBySlug = (destination: string, slug: string) =>
  tourRegistry.find(
    (tour) => tour.destination === destination && tour.slug === slug
  );
