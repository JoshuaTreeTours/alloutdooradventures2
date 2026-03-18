import { useEffect, useState } from "react";

import Engine6TourPage from "../../engine6/components/Engine6TourPage";
import { mapViatorToEngine6Tour } from "../../engine6/mapViatorToEngine6Tour";
import { ENGINE6_SPECIMEN_PRODUCT_CODE } from "../../engine6/routes";
import type { Engine6ApiResponse, Engine6Tour } from "../../engine6/types";

export default function Engine6SpecimenRoute() {
  const [tour, setTour] = useState<Engine6Tour | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engine6/viator-product?productCode=${ENGINE6_SPECIMEN_PRODUCT_CODE}`)
      .then(async response => {
        const payload = (await response.json()) as Engine6ApiResponse;
        if (!response.ok) {
          throw new Error((payload as any).error ?? "Engine6 API failed");
        }
        setTour(mapViatorToEngine6Tour(payload));
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  if (error) {
    return <main className="mx-auto max-w-4xl px-6 py-16">Engine6 failed loudly: {error}</main>;
  }

  if (!tour) {
    return <main className="mx-auto max-w-4xl px-6 py-16">Loading Engine6 tour…</main>;
  }

  return <Engine6TourPage tour={tour} />;
}
