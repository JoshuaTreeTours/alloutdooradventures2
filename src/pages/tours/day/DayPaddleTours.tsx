import { Link } from "wouter";

import Seo from "../../../components/Seo";
import { buildMetaDescription } from "../../../utils/seo";

export default function DayPaddleTours() {
  const title = "Paddle Sports Day Tours | All Outdoor Adventures";
  const description = buildMetaDescription(
    "Browse paddle sports day tours with kayaking, canoeing, and SUP adventures led by local guides.",
    "Discover half-day and full-day paddle tours across rivers, lakes, and coastal waterways.",
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <Seo title={title} description={description} url="/tours/day/paddle" />
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Day Tours
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Paddle Sports Day Tours
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        Browse paddle sports day tours available now.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours/canoeing">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            View paddle sports tours
          </a>
        </Link>
        <Link href="/tours/day">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Back to day tours
          </a>
        </Link>
      </div>
    </main>
  );
}
