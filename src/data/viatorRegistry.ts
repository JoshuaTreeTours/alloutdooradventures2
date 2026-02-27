import viatorRegistryRaw from "../../data/generated/viatorRegistry.json";
import type { ViatorRegistryEntry } from "../utils/viator/types";
import type { Tour } from "./tours.types";
import { buildImageProxyUrl } from "../utils/images/buildImageProxyUrl";

const registry = (viatorRegistryRaw as ViatorRegistryEntry[]) ?? [];

export const getViatorRegistry = () => registry;

export const getViatorTourBySlugs = (
  regionSlug: string,
  destinationSlug: string,
  slug: string
) =>
  registry.find(
    item =>
      item.regionSlug === regionSlug &&
      item.destinationSlug === destinationSlug &&
      item.slug === slug
  ) ?? null;

export const getViatorToursByDestination = (
  regionSlug: string,
  destinationSlug: string
) =>
  registry.filter(
    item =>
      item.regionSlug === regionSlug && item.destinationSlug === destinationSlug
  );

export const toViatorListingTour = (item: ViatorRegistryEntry): Tour => ({
  id: `viator-${item.slug}`,
  slug: item.slug,
  title: item.parsed.title ?? item.slug,
  shortDescription: item.derived.highlights[0],
  operator: "Viator partner",
  categories: ["adventure"],
  primaryCategory: "adventure",
  destination: {
    country: "United States",
    state: item.regionSlug,
    stateSlug: item.regionSlug,
    city: item.destinationSlug,
    citySlug: item.destinationSlug,
  },
  heroImage: buildImageProxyUrl(item.heroImageUrl) ?? item.heroImageUrl ?? "",
  badges: {
    duration: item.parsed.durationText,
    priceFrom:
      typeof item.parsed.priceFrom === "number"
        ? `From $${item.parsed.priceFrom}`
        : undefined,
  },
  startingPrice: item.parsed.priceFrom,
  currency: item.parsed.currency,
  activitySlugs: ["adventure"],
  bookingProvider: "viator",
  bookingUrl: item.viatorUrl,
  longDescription: item.derived.description,
});
