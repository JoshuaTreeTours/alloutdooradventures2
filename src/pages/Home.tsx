import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import CollectionGrid from "../components/CollectionGrid";
import DestinationCard from "../components/DestinationCard";
import EditorialSpotlight from "../components/EditorialSpotlight";
import Image from "../components/Image";
import { featuredDestinations } from "../data/destinations";
import { ACTIVITY_PAGES } from "../data/tourCatalog";

const HERO_IMAGE_URL = "/hero.jpg"; // Put your hero image in /public/hero.jpg

const HERO_ACTIVITY_SPOTLIGHTS = [
  {
    title: "Cycling",
    description: "Road rides, gravel loops, and guided bike tours.",
    slug: "cycling",
    image: "/images/cycling-hero.jpg",
  },
  {
    title: "Hiking",
    description: "Trail days with alpine views and lakeside vistas.",
    slug: "hiking",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Canoeing",
    description: "Worldwide paddle adventures",
    slug: "sailing-boat",
    image:
      ACTIVITY_PAGES.find((activity) => activity.slug === "sailing-boat")
        ?.image ?? "/images/canoe-hero.jpg",
  },
];

const COLLECTIONS = [
  {
    title: "Epic weekend loops",
    description:
      "Two- and three-day itineraries that maximize big views without the long haul.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations?collection=weekend-loops",
    badge: "3 days",
  },
  {
    title: "Iconic scenic drives",
    description:
      "Switchbacks, coastal byways, and sunrise pullouts that define the American West.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations?collection=scenic-drives",
    badge: "Road trip",
  },
  {
    title: "Mountain town basecamps",
    description:
      "Stay in cozy trail towns with quick access to lakes, peaks, and hot springs.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations?collection=mountain-towns",
    badge: "Basecamp",
  },
];

const SPOTLIGHT = {
  eyebrow: "Trip planning",
  title: "Build a trip that feels custom, not cookie-cutter",
  description:
    "We mix local insight with flexible planning so you can stack the right hikes, drives, and tours into one seamless itinerary.",
  bullets: [
    "Seasonal guidance for trail access and weather shifts.",
    "Mix-and-match day plans curated by local experts.",
    "Suggested stays that keep you close to the action.",
  ],
  ctaLabel: "Start planning",
  ctaHref: "/destinations",
  image:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
};

export default function Home() {
  const isDebugEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugImages") === "1" &&
    import.meta.env.MODE !== "production" &&
    import.meta.env.VERCEL_ENV !== "production";

  const featuredDestinationsPreview = useMemo(
    () => featuredDestinations.slice(0, 6),
    []
  );

  const debugImages = useMemo(
    () => [
      { label: "Hero", src: HERO_IMAGE_URL },
      ...featuredDestinationsPreview.map((destination) => ({
        label: `Featured: ${destination.name}`,
        src: destination.image,
      })),
    ],
    [featuredDestinationsPreview]
  );

  const [debugResults, setDebugResults] = useState<
    Record<string, { resolvedSrc: string; status?: number; ok?: boolean; error?: string }>
  >({});

  useEffect(() => {
    if (typeof window === "undefined" || !isDebugEnabled) return;

    const controller = new AbortController();
    const origin = window.location.origin;

    const checkImages = async () => {
      const results = await Promise.all(
        debugImages.map(async ({ label, src }) => {
          const resolvedSrc = src.startsWith("http") ? src : new URL(src, origin).href;

          try {
            const response = await fetch(resolvedSrc, {
              method: "HEAD",
              cache: "no-store",
              signal: controller.signal,
            });

            return [
              label,
              {
                resolvedSrc,
                status: response.status,
                ok: response.ok,
              },
            ] as const;
          } catch (error) {
            return [
              label,
              {
                resolvedSrc,
                error: error instanceof Error ? error.message : String(error),
              },
            ] as const;
          }
        })
      );

      setDebugResults(Object.fromEntries(results));
    };

    void checkImages();

    return () => {
      controller.abort();
    };
  }, [debugImages, isDebugEnabled]);

  return (
    <div>
      <main>
        {/* HERO */}
        <section
          className="relative mx-auto max-w-[1400px] px-6 pt-6"
          aria-label="Hero"
        >
          <div className="relative min-h-[80vh] overflow-hidden rounded-none md:min-h-[70vh] md:rounded-md">
            {/* Background image */}
            <Image
              src={HERO_IMAGE_URL}
              fallbackSrc="/hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110"
            />

            {/* Light overlay for readable text */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Content */}
            <div className="relative px-6 py-20 text-center text-white md:px-16 md:py-28">
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                Find Your Next Adventure
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                The ultimate field guide to outdoor experiences across America.
                <br />
                From desert canyons to mountain peaks, we help you explore the wild.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/destinations">
                  <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294129]">
                    Explore Destinations
                  </a>
                </Link>

                <Link href="/tours">
                  <a className="inline-flex items-center justify-center rounded-md bg-white/25 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/30">
                    View Tours
                  </a>
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {HERO_ACTIVITY_SPOTLIGHTS.map((activity) => (
                  <Link
                    key={activity.title}
                    href={`/tours/activities/${activity.slug}`}
                  >
                    <a className="group overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-left shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/15">
                      <div className="relative h-28 sm:h-32">
                        <Image
                          src={activity.image}
                          fallbackSrc="/hero.jpg"
                          alt={activity.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-1 px-4 py-3">
                        <div className="text-sm font-semibold">
                          {activity.title}
                        </div>
                        <div className="text-xs text-white/80">
                          {activity.description}
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVITIES */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Find your next tour
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              How Long?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#405040] md:text-base">
              Choose a tour style to explore the destinations and itineraries that fit
              your pace.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ACTIVITY_PAGES.map((activity) => (
              <Link key={activity.slug} href={`/tours/activities/${activity.slug}`}>
                <a className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-44">
                    <Image
                      src={activity.image}
                      fallbackSrc="/hero.jpg"
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="text-base font-semibold text-[#1f2a1f]">
                      {activity.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#405040]">
                      {activity.description}
                    </p>
                    <span className="mt-auto text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                      Explore {activity.title} →
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </section>

        <CollectionGrid
          eyebrow="Curated collections"
          title="Trending tours"
          description="I’ll be featuring the best-selling tours."
          items={COLLECTIONS}
        />

        <EditorialSpotlight {...SPOTLIGHT} />

        {/* WHY CHOOSE */}
        <section
          className="mx-auto max-w-6xl px-6 py-16"
          aria-label="Why choose"
        >
          <h2 className="text-center text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Why Choose Outdoor Adventures?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-[#405040] md:text-base">
            We curate the best outdoor experiences, vetted by locals and seasoned
            travelers. No tourist traps—just authentic adventures.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card
              title="Curated Experiences"
              body="Handpicked tours and activities with a focus on quality, safety, and unforgettable scenery."
            />
            <Card
              title="Local Knowledge"
              body="We work with operators who know their terrain—so you get the real story, not brochure fluff."
            />
            <Card
              title="Easy Discovery"
              body="Browse destinations and tours fast, then book with confidence. Simple choices, great outcomes."
            />
          </div>
        </section>

        {/* FEATURED DESTINATIONS */}
        <section
          className="mx-auto max-w-6xl px-6 pb-20"
          aria-label="Featured destinations"
        >
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
              Featured Destinations
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Plan your next escape to visit the great American West
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#405040] md:text-base">
              Explore handcrafted itineraries across the West—each destination blends
              signature landscapes with local-guided adventure.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featuredDestinationsPreview.map((destination) => (
              <DestinationCard
                key={destination.name}
                destination={destination}
                ctaLabel="Discover"
                headingLevel="h3"
                descriptionVariant="featured"
              />
            ))}
          </div>
        </section>

        {isDebugEnabled ? (
          <section
            className="mx-auto max-w-6xl px-6 pb-20"
            aria-label="Image debug overlay"
          >
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-950 shadow-sm">
              <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-amber-800">
                Image Debug Overlay
              </h2>
              <p className="mt-2 text-xs text-amber-800/80">
                Shows resolved image URLs and HEAD status codes to diagnose Safari
                loading issues.
              </p>

              <div className="mt-4 space-y-4">
                {debugImages.map(({ label, src }) => {
                  const result = debugResults[label];

                  return (
                    <div
                      key={`${label}-${src}`}
                      className="rounded-md border border-amber-200 bg-white/80 p-3"
                    >
                      <div className="text-xs font-semibold text-amber-900">
                        {label}
                      </div>

                      <div className="mt-1 break-all text-[0.7rem] text-amber-800">
                        src: <code>{src}</code>
                      </div>

                      <div className="mt-1 break-all text-[0.7rem] text-amber-800">
                        resolved:{" "}
                        <code>{result?.resolvedSrc ?? "Checking..."}</code>
                      </div>

                      <div className="mt-1 text-[0.7rem] text-amber-800">
                        HEAD status:{" "}
                        {result?.status !== undefined
                          ? `${result.status}${result.ok ? " (ok)" : ""}`
                          : result?.error
                            ? `Error: ${result.error}`
                            : "Checking..."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-[#405040]">
          © {new Date().getFullYear()} Outdoor Adventures
        </div>
      </footer>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/55 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-[#1f2a1f]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#405040]">{body}</p>
    </div>
  );
}
