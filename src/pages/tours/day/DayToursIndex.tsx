import { useEffect } from "react";
import { Link } from "wouter";

import RemovedListing from "../../../components/RemovedListing";
import { maybeResolveLegacyDayTourPath } from "./dayTourRouteGuard";

export default function DayToursIndex() {
  const resolution =
    typeof window === "undefined"
      ? null
      : maybeResolveLegacyDayTourPath(window.location.pathname);

  useEffect(() => {
    if (!resolution || resolution.removed) {
      return;
    }

    if (resolution.canonicalPath !== window.location.pathname) {
      window.location.replace(resolution.canonicalPath);
    }
  }, [resolution]);

  if (resolution?.removed) {
    console.warn("Tour not found", {
      id: resolution.id,
      url: typeof window !== "undefined" ? window.location.pathname : "ssr",
    });
    return <RemovedListing />;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">Tours</p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Day Tours</h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        Choose a short adventure for a focused half-day or full-day experience.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours/day/cycling">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Cycling
          </a>
        </Link>
        <Link href="/tours/day/hiking">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Hiking
          </a>
        </Link>
        <Link href="/tours/day/paddle">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Paddle Sports
          </a>
        </Link>
      </div>
    </main>
  );
}
