import { useEffect, useState } from "react";

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

  useEffect(() => {
    const record = getEngine6RecordBySlug(params.tourSlug);
    if (!record || record.slug !== engine6HiloVolcanoRecord.slug) {
      setError(`Engine6 pilot route mismatch for slug: ${params.tourSlug}`);
      return;
    }

    getEngine6ViatorTourData(record)
      .then(setPage)
      .catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, [params.tourSlug]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Engine6 pilot failed visibly</h1>
        <p className="mt-3 text-sm text-[#405040]">{error}</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        Loading Engine6 API-first product page…
      </main>
    );
  }

  return <Engine6TourPage page={page} />;
}
