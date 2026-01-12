import { featuredDestinations } from "../src/data/destinations";

const missingImages = featuredDestinations.filter(
  (destination) => !destination.image?.trim(),
);

if (missingImages.length > 0) {
  const names = missingImages.map((destination) => destination.name).join(", ");
  throw new Error(`Featured destinations missing images: ${names}`);
}
