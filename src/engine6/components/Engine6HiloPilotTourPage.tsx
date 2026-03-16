import { useEffect, useState } from "react";

import Engine4TourPage from "../../engine4/components/Engine4TourPage";
import type { Engine4TourViewModel } from "../../engine4/types";
import { ENGINE6_HILO_PILOT_PRODUCT_CODE } from "../hiloPilot";
import { getEngine6ViatorTourData } from "../viator/getEngine6ViatorTourData";
import { mapViatorToEngine6PageData } from "../viator/mapViatorToEngine6PageData";

const isNonZeroPrice = (fromPrice?: string) => {
  if (!fromPrice) return false;
  const numeric = Number(fromPrice.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0;
};

export default function Engine6HiloPilotTourPage() {
  const [tour, setTour] = useState<Engine4TourViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngine6ViatorTourData(ENGINE6_HILO_PILOT_PRODUCT_CODE)
      .then(({ product }) => {
        const mapped = mapViatorToEngine6PageData(product);

        if (!isNonZeroPrice(mapped.page.facts.priceFrom)) {
          throw new Error(
            `Engine6 price resolution failed for ${ENGINE6_HILO_PILOT_PRODUCT_CODE}: expected non-zero price, received "${mapped.page.facts.priceFrom ?? "<missing>"}". Paths tried: ${mapped.priceDiagnostics.pathsTried.join(", ")}`
          );
        }

        setTour(mapped.page);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-red-900">
        Engine6 Hilo pilot failed visibly: {error}
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        Loading Engine6 Hilo pilot from Viator API…
      </main>
    );
  }

  return <Engine4TourPage tour={tour} />;
}
