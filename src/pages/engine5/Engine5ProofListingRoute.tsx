import { useEffect, useState } from "react";
import { Link } from "wouter";

import TourCard from "../../components/TourCard";
import type { Tour } from "../../data/tours.types";
import { getEngine5ViatorTourData } from "../../engine5/viator/getEngine5ViatorTourData";
import { mapViatorToEngine5Tour } from "../../engine5/viator/mapViatorToEngine5Tour";
import { engine5ProofViatorRecord } from "../../engine5/viator/record";

export default function Engine5ProofListingRoute() {
  const [tour, setTour] = useState<Tour | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngine5ViatorTourData(engine5ProofViatorRecord.productCode)
      .then(apiTour => {
        const mapped = mapViatorToEngine5Tour(engine5ProofViatorRecord, apiTour);
        if (process.env.NODE_ENV !== "production") {
          console.info("[engine5][132218P209] listing diagnostics", mapped.normalized.diagnostics);
        }
        setTour(mapped.listing);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Engine5 Los Angeles proof tours</h1>
      {error ? <p className="mt-4">Engine5 failed loudly: {error}</p> : null}
      {tour ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <TourCard
            tour={tour}
            href={`/engine5/california/los-angeles/tours/${tour.slug}`}
          />
        </div>
      ) : (
        <p className="mt-4">Loading API-only listing…</p>
      )}
      <Link href="/destinations/california/los-angeles/tours">
        Back to normal tours
      </Link>
    </main>
  );
}
