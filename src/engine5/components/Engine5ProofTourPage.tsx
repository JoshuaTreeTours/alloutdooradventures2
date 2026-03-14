import { useEffect, useState } from "react";

import Engine4TourPage from "../../engine4/components/Engine4TourPage";
import type { Engine4TourViewModel } from "../../engine4/types";
import { engine5ProofViatorRecord } from "../viator/record";
import { resolveEngine5Tour } from "../viator/resolveEngine5Tour";

export default function Engine5ProofTourPage() {
  const [tour, setTour] = useState<Engine4TourViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resolveEngine5Tour(engine5ProofViatorRecord)
      .then(resolved => {
        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[engine5][${engine5ProofViatorRecord.productCode}] hero diagnostics`,
            resolved.normalized.diagnostics
          );
        }
        setTour(resolved.page);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        Engine5 failed loudly: {error}
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        Loading Engine5 API product…
      </main>
    );
  }

  return <Engine4TourPage tour={tour} />;
}
