import type { Engine6ListingItem, Engine6ProductRecord } from "../types";

export const engine6HiloVolcanoRecord: Engine6ProductRecord = {
  productCode: "11069P1",
  slug: "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1",
  canonicalPath:
    "/destinations/hawaii/hilo/tours/private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1",
  destination: {
    country: "United States",
    state: "Hawaii",
    city: "Hilo",
    stateSlug: "hawaii",
    citySlug: "hilo",
  },
};

export const ENGINE6_PRODUCT_RECORDS = [engine6HiloVolcanoRecord] as const;

export const getEngine6RecordBySlug = (slug: string) =>
  ENGINE6_PRODUCT_RECORDS.find(record => record.slug === slug);

export const getEngine6PilotFallbackListingItem = (): Engine6ListingItem => ({
  id: `engine6-${engine6HiloVolcanoRecord.productCode}`,
  title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
  shortDescription:
    "Private full-day exploration of Hawaii Volcanoes National Park from Hilo with an eco-focused itinerary.",
  href: engine6HiloVolcanoRecord.canonicalPath,
});
