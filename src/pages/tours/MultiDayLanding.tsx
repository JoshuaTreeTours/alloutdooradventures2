import { Link } from "wouter";

export default function MultiDayLanding() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Tours
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Multi-Day Adventures
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        Plan longer itineraries with multi-day guided trips and overnights.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours/activities/multi-day">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Explore multi-day tours
          </a>
        </Link>
        <Link href="/tours">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Back to tours
          </a>
        </Link>
      </div>
    </main>
  );
}
