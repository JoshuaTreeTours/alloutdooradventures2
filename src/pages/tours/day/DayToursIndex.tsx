import { Link } from "wouter";

import Seo from "../../../components/Seo";
import { buildMetaDescription } from "../../../utils/seo";

export default function DayToursIndex() {
  const title = "Day Tours | All Outdoor Adventures";
  const description = buildMetaDescription(
    "Choose a short outdoor adventure with curated half-day and full-day tours across top destinations.",
    "Browse day tours by activity, compare guide options, and book outdoor experiences that fit your schedule.",
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <Seo title={title} description={description} url="/tours/day" />
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Tours
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Day Tours
      </h1>
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
