import type { Engine6Tour } from "../types";

export default function Engine6DebugPanel({ tour }: { tour: Engine6Tour }) {
  return (
    <section
      className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700"
      data-testid="engine6-debug-diagnostics"
      data-engine="engine6"
      data-product-code={tour.productCode}
      data-hero-source="api.photos"
      data-hero-variant={tour.diagnostics.heroQualityClassification}
      data-hero-size={`${tour.diagnostics.selectedHeroWidth ?? 0}x${tour.diagnostics.selectedHeroHeight ?? 0}`}
      data-hero-url={tour.diagnostics.finalHeroUrl ?? ""}
      data-content-status={
        tour.overviewText &&
        tour.highlights.length > 0 &&
        tour.itinerary.length > 0 &&
        tour.faqs.length > 0
          ? "complete"
          : "partial"
      }
      aria-label="Engine6 diagnostics"
    >
      <p>
        <strong>Source product ID:</strong> {tour.productCode}
      </p>
      <p>
        <strong>Source product URL:</strong>{" "}
        {tour.diagnostics.heroSourceProductUrl ?? "none"}
      </p>
      <p>
        <strong>Resolved hero source:</strong> {tour.diagnostics.heroSourceType}
      </p>
      <p>
        <strong>Final hero URL:</strong> {tour.diagnostics.finalHeroUrl ?? "none"}
      </p>
      <p>
        <strong>Hero source product code:</strong>{" "}
        {tour.diagnostics.heroSourceProductCode ?? "none"}
      </p>
      <p>
        <strong>Hero source product URL:</strong>{" "}
        {tour.diagnostics.heroSourceProductUrl ?? "none"}
      </p>
      <p>
        <strong>Fallback fired:</strong>{" "}
        {tour.diagnostics.heroFallbackTriggered ? "yes" : "no"}
      </p>
      <p>
        <strong>Hero candidates present:</strong>{" "}
        {tour.diagnostics.heroCandidatesPresent ? "yes" : "no"}
      </p>
      <p>
        <strong>Hero candidate count:</strong> {tour.diagnostics.heroCandidateCount}
      </p>
      <p>
        <strong>Placeholder fallback reason:</strong>{" "}
        {tour.diagnostics.heroPlaceholderFallbackReason ?? "n/a"}
      </p>
      <p>
        <strong>Hero quality:</strong> {tour.diagnostics.heroQualityClassification}
      </p>
      <p>
        <strong>Caption precedence applied:</strong>{" "}
        {tour.diagnostics.captionPrecedenceApplied ? "yes" : "no"}
      </p>
      <p>
        <strong>Candidate family determinable:</strong>{" "}
        {tour.diagnostics.candidateFamilyIdentityDeterminable ? "yes" : "no"}
      </p>
      <p>
        <strong>Hero parity (page/card/schema):</strong>{" "}
        {(tour.diagnostics.heroSurfaceParity?.page ?? false) &&
        (tour.diagnostics.heroSurfaceParity?.card ?? false) &&
        (tour.diagnostics.heroSurfaceParity?.schema ?? false)
          ? "yes"
          : "no"}
      </p>
      <p>
        <strong>Price field path:</strong>{" "}
        {tour.diagnostics.commercialPriceFieldPath ?? "none"}
      </p>
      <p>
        <strong>Raw API price value:</strong>{" "}
        {tour.diagnostics.commercialPriceRawValue ?? "none"}
      </p>
      <p>
        <strong>Displayed price:</strong> {tour.priceFormatted}
      </p>
      <p>
        <strong>Used price fallback:</strong>{" "}
        {tour.diagnostics.priceSourceUsed === "fallback" ? "yes" : "no"}
      </p>
      <p>
        <strong>Rating field path:</strong>{" "}
        {tour.diagnostics.ratingFieldPath ?? "none"}
      </p>
      <p>
        <strong>Review count field path:</strong>{" "}
        {tour.diagnostics.reviewCountFieldPath ?? "none"}
      </p>
      <p>
        <strong>Meeting summary field path:</strong>{" "}
        {tour.diagnostics.meetingPointFieldPath ?? "none"}
      </p>
      <p>
        <strong>Meeting summary applied:</strong>{" "}
        {tour.diagnostics.meetingPointSummaryApplied ? "yes" : "no"}
      </p>
      <p>
        <strong>Meeting summary reason:</strong>{" "}
        {tour.diagnostics.meetingPointSummaryReason ?? "n/a"}
      </p>
      <p>
        <strong>Final CTA URL:</strong> {tour.bookingUrl}
      </p>
      <p>
        <strong>Offer URL:</strong> {tour.bookingUrl}
      </p>
      <p>
        <strong>Route path:</strong> {tour.canonicalPath}
      </p>
    </section>
  );
}
