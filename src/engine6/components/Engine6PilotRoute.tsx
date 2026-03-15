import { useEffect, useState } from "react";
import Engine6TourPage from "./Engine6TourPage";
import { getEngine6ViatorTourData } from "../viator/getEngine6ViatorTourData";
import { mapViatorToEngine6PageData } from "../viator/mapViatorToEngine6PageData";
import { ENGINE6_PILOT_PRODUCT_CODE } from "../routes";
import type { Engine6PageData } from "../types";

export default function Engine6PilotRoute() {
  const [page, setPage] = useState<Engine6PageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getEngine6ViatorTourData(ENGINE6_PILOT_PRODUCT_CODE)
      .then(payload => {
        if (!active) return;
        setPage(mapViatorToEngine6PageData(payload));
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-red-700">
        <h1 className="text-2xl font-semibold">Engine6 pilot failed</h1>
        <p className="mt-3">{error}</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p>Loading tour details…</p>
      </main>
    );
  }

  return <Engine6TourPage data={page} />;
}
