import { Link } from "wouter";

import Image from "../../components/Image";
import TourCard from "../../components/TourCard";
import { tours } from "../../data/tours";
import { ADVENTURE_ACTIVITY_PAGES, slugify } from "../../data/tourCatalog";

type ActivityStateToursProps = {
  params: {
    activitySlug: string;
    stateSlug: string;
  };
};

export default function ActivityStateTours({
  params,
}: ActivityStateToursProps) {
  const activity = ADVENTURE_ACTIVITY_PAGES.find(
    (item) => item.slug === params.activitySlug,
  );

  if (!activity) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Activity not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that activity. Head back to tours to keep exploring.
        </p>
      </main>
    );
  }

  const stateTours = tours.filter(
    (tour) =>
      tour.activitySlugs.includes(activity.slug) &&
      slugify(tour.destination.state) === params.stateSlug,
  );
  const stateName = stateTours[0]?.destination.state ?? "this state";

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={activity.image}
          fallbackSrc="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/tours">
              <a>Tours</a>
            </Link>
            <span>/</span>
            <Link href={`/tours/${activity.slug}`}>
              <a>{activity.title}</a>
            </Link>
            <span>/</span>
            <span className="text-white">{stateName}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {activity.title} tours
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {activity.title} in {stateName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              Browse {activity.title.toLowerCase()} tours available in{" "}
              {stateName}. Book directly through our live inventory.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/tours/${activity.slug}`}
              className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/25"
            >
              Back to {activity.title}
            </Link>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-md bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
            >
              Tours home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {stateTours.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stateTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[#405040]">
            New {activity.title.toLowerCase()} tours are on the way for{" "}
            {stateName}. Check back soon.
          </p>
        )}
      </section>
    </main>
  );
}
