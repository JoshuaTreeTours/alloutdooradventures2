import { useEffect, useMemo, useState } from "react";

import Engine6TourPage from "../../engine6/components/Engine6TourPage";
import { getEngine6ViatorTourData } from "../../engine6/viator/getEngine6ViatorTourData";
import {
  engine6HiloVolcanoRecord,
  getEngine6RecordBySlug,
} from "../../engine6/viator/records";
import type { Engine6ResolvedTourPageData } from "../../engine6/types";

export default function Engine6HiloTourRoute({
  params,
}: {
  params: { tourSlug: string };
}) {
  const [page, setPage] = useState<Engine6ResolvedTourPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const routeDiagnostics = useMemo(() => {
    const expectedSlug = engine6HiloVolcanoRecord.slug;
    const requestedSlug = params.tourSlug ?? "";
    const routeMatched = requestedSlug === expectedSlug;

    return {
      routeMatched,
      requestedSlug,
      expectedSlug,
      productCode: engine6HiloVolcanoRecord.productCode,
      resolverReached: routeMatched,
    };
  }, [params.tourSlug]);

  useEffect(() => {
    const record = getEngine6RecordBySlug(params.tourSlug);
    if (!record || record.slug !== engine6HiloVolcanoRecord.slug) {
      setError(`Engine6 pilot route mismatch for slug: ${params.tourSlug}`);
      return;
    }

    getEngine6ViatorTourData(record)
      .then(resolvedPage => {
        if (record.productCode === "11069P1") {
          console.info("[engine6][11069P1] resolved page fields", {
            title: resolvedPage.title,
            heroImage: resolvedPage.heroImage,
            fromPrice: resolvedPage.fromPrice,
            galleryImagesLength: resolvedPage.galleryImages.length,
            itineraryLength: resolvedPage.itinerary.length,
            faqsLength: resolvedPage.faqs.length,
          });
        }

        if (!(typeof resolvedPage.fromPrice === "number" && resolvedPage.fromPrice > 0)) {
          const attempts = resolvedPage.priceDebug?.attemptedPaths?.join(", ") ??
            "product.pricingSummary.fromPrice.amount, product.pricingInfo.summary.fromPrice, product.pricingInfo.fromPrice, product.ticketTypes[].pricingInfo.summary.fromPrice";
          const resolvedPath = resolvedPage.priceDebug?.resolvedPath ?? "none";

          setError(
            `Engine6 pilot missing non-zero price for ${record.productCode}. Attempted paths: ${attempts}. Resolved path: ${resolvedPath}.`
          );
          return;
        }

        setPage(resolvedPage);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, [params.tourSlug]);

  const diagnosticsBlock = (
    <section className="mt-6 rounded-xl border border-dashed border-[#2f8a3d] bg-[#f4fff6] p-4 text-xs text-[#2f4a2f]">
      <h2 className="font-semibold uppercase tracking-[0.16em]">
        Engine6 Route Diagnostics
      </h2>
      <ul className="mt-2 space-y-1">
        <li>route matched: {routeDiagnostics.routeMatched ? "yes" : "no"}</li>
        <li>requested slug: {routeDiagnostics.requestedSlug || "(empty)"}</li>
        <li>expected slug: {routeDiagnostics.expectedSlug}</li>
        <li>productCode: {routeDiagnostics.productCode}</li>
        <li>
          Engine6 resolver reached:{" "}
          {routeDiagnostics.resolverReached ? "yes" : "no"}
        </li>
      </ul>
    </section>
  );

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Engine6 pilot failed visibly</h1>
        <p className="mt-3 text-sm text-[#405040]">{error}</p>
        {diagnosticsBlock}
      </main>
    );
  }

  if (!page) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        Loading Engine6 API-first product page…
        {diagnosticsBlock}
      </main>
    );
  }

  return (
    <>
      <Engine6TourPage page={page} />
      <div className="mx-auto max-w-6xl px-4 pb-10 md:px-6">
        {diagnosticsBlock}
      </div>
    </>
  );
}
