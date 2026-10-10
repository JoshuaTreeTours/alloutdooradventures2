import type { Engine6Tour } from "../types";
import { isExcludedProductCode } from "../../data/excludedProductCodes";
import { getFareHarborProofByPath } from "../../data/fareharborLeadToGoldProof";
import { centralParkBikeToursMigratedRecord } from "./fixtures/centralParkBikeTours";
import { mapLegacyFhRecordToEngine6Tour } from "./mapLegacyFhRecordToEngine6Tour";
import type { LegacyFhMigratedProductRecord } from "./types";

export const legacyFhMigratedProductRecords: LegacyFhMigratedProductRecord[] = [
  centralParkBikeToursMigratedRecord,
];

export const legacyFhMigratedTours: Engine6Tour[] =
  legacyFhMigratedProductRecords
    .map(mapLegacyFhRecordToEngine6Tour)
    .filter(tour => !isExcludedProductCode(tour.productCode));

const legacyFhMigratedTourByCanonicalPath = new Map<string, Engine6Tour>(
  legacyFhMigratedTours.map(tour => [tour.canonicalPath, tour])
);

export const getLegacyFhMigratedTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  legacyFhMigratedTourByCanonicalPath.get(
    `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
  ) ?? null;

export const getLegacyFhMigratedTourByCanonicalPath = (canonicalPath: string) =>
  legacyFhMigratedTourByCanonicalPath.get(canonicalPath) ?? null;


export const getProofBackedFareHarborTourByCanonicalPath = (
  canonicalPath: string
): Engine6Tour | null => {
  const proof = getFareHarborProofByPath(canonicalPath);
  if (!proof || isExcludedProductCode(proof.itemId.toUpperCase())) {
    return null;
  }

  const slug = proof.publicPath.split("/").filter(Boolean).at(-1) ?? proof.itemId;
  const priceAmount = proof.offer ? Number(proof.offer.price) : null;
  const record: LegacyFhMigratedProductRecord = {
    slug,
    canonicalPath: proof.publicPath,
    bookingPath: `${proof.publicPath}/book`,
    title: proof.title,
    operator: proof.company || null,
    heroImageUrl: proof.productImage ?? proof.galleryImages[0] ?? null,
    galleryImages: proof.galleryImages,
    priceSnapshot: {
      amount:
        typeof priceAmount === "number" && Number.isFinite(priceAmount)
          ? priceAmount
          : null,
      currency: proof.offer?.priceCurrency ?? "USD",
      label: proof.visiblePriceLabel ?? null,
      options: proof.priceRows
        .map(row => ({
          label: row.label,
          amount: Number(row.amountLabel.replace(/[^0-9.]/g, "")),
        }))
        .filter(row => Number.isFinite(row.amount)),
    },
    ratingSnapshot: {
      rating: proof.aggregateRating?.ratingValue ?? null,
      reviewCount: proof.aggregateRating?.reviewCount ?? null,
    },
    overview:
      proof.paragraphs.length > 0
        ? proof.paragraphs.join("\n\n")
        : proof.schemaDescription,
    highlights: proof.highlights,
    itinerary: [],
    inclusions: [],
    exclusions: [],
    meetingInfo: proof.meetingLocation ?? null,
    durationText: proof.durationLabel ?? null,
    additionalInfo: proof.pricingNotes,
    cancellationSummary: null,
    sourceType: "legacy_fh_migrated",
  };

  return mapLegacyFhRecordToEngine6Tour(record);
};
