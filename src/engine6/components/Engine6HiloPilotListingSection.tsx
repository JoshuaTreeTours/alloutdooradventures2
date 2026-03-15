import { useEffect, useState } from "react";

import type { Engine6ListingItem } from "../types";
import {
  getEngine6ViatorTourData,
  mapEngine6PageToListingItem,
} from "../viator/getEngine6ViatorTourData";
import {
  engine6HiloVolcanoRecord,
  getEngine6PilotFallbackListingItem,
} from "../viator/records";
import Engine6ListingCard from "./Engine6ListingCard";

export default function Engine6HiloPilotListingSection({
  heading = "Engine6 API-first pilot",
  embedded = false,
}: {
  heading?: string;
  embedded?: boolean;
}) {
  const [item, setItem] = useState<Engine6ListingItem>(
    getEngine6PilotFallbackListingItem()
  );

  useEffect(() => {
    let isActive = true;

    getEngine6ViatorTourData(engine6HiloVolcanoRecord)
      .then(page => {
        if (!isActive) return;
        setItem(mapEngine6PageToListingItem(page));
      })
      .catch(() => {
        if (!isActive) return;
        setItem(getEngine6PilotFallbackListingItem());
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (embedded) {
    return <Engine6ListingCard item={item} />;
  }

  return (
    <section className="mx-auto mt-8 max-w-6xl px-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
        {heading}
      </p>
      <Engine6ListingCard item={item} />
    </section>
  );
}
