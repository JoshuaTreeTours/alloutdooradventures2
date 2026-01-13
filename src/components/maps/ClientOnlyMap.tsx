import { lazy, Suspense, useEffect, useState } from "react";

import type { MapMarker } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

type ClientOnlyMapProps = {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  heightClassName?: string;
};

export default function ClientOnlyMap(props: ClientOnlyMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl bg-white/70 ${
          props.heightClassName ?? "h-96"
        }`}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div
          className={`w-full overflow-hidden rounded-2xl bg-white/70 ${
            props.heightClassName ?? "h-96"
          }`}
        />
      }
    >
      <LeafletMap {...props} />
    </Suspense>
  );
}
