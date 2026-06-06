import { useEffect, useMemo, useState } from "react";

import {
  fetchEngine6LiveProductFields,
  hydrateEngine6TourCardEntries,
  type Engine6LiveProductFields,
  type Engine6TourCardEntry,
} from "./liveProductFields";

export const getEngine6ProductCodesForTourCards = (
  entries: Engine6TourCardEntry[]
) =>
  Array.from(
    new Set(
      entries
        .map(entry => entry.tour)
        .filter(tour => tour.engine === "engine6" && Boolean(tour.productCode))
        .map(tour => tour.productCode as string)
    )
  );

export const useEngine6LiveTourCardHydration = <
  TEntry extends Engine6TourCardEntry,
>(
  entries: TEntry[]
): TEntry[] => {
  const [liveByProductCode, setLiveByProductCode] = useState<
    Record<string, Engine6LiveProductFields>
  >({});

  const productCodesKey = getEngine6ProductCodesForTourCards(entries).join("|");
  const productCodes = useMemo(
    () => (productCodesKey ? productCodesKey.split("|") : []),
    [productCodesKey]
  );

  useEffect(() => {
    let cancelled = false;
    if (productCodes.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    Promise.all(
      productCodes.map(async productCode => {
        const fields = await fetchEngine6LiveProductFields(productCode);
        if (!fields) return null;
        return [productCode, fields] as const;
      })
    )
      .then(results => {
        if (cancelled) return;
        const next: Record<string, Engine6LiveProductFields> = {};
        for (const result of results) {
          if (!result) continue;
          next[result[0]] = result[1];
        }
        if (Object.keys(next).length > 0) {
          setLiveByProductCode(previous => ({
            ...previous,
            ...next,
          }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [productCodes]);

  return useMemo(
    () => hydrateEngine6TourCardEntries(entries, liveByProductCode),
    [entries, liveByProductCode]
  );
};
