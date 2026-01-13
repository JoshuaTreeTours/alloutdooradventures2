import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import DestinationCard from "../components/DestinationCard";
import Image from "../components/Image";
import { featuredDestinations } from "../data/destinations";

const HERO_IMAGE_URL = "/hero.jpg"; // put your hero image in /public/hero.jpg

export default function Home() {
  const isDebugEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugImages") === "1" &&
    import.meta.env.MODE !== "production" &&
    import.meta.env.VERCEL_ENV !== "production";
  const featuredDestinationsPreview = useMemo(
    () => featuredDestinations.slice(0, 6),
    [],
  );
  const debugImages = useMemo(
    () => [
      { label: "Hero", src: HERO_IMAGE_URL },
      ...featuredDestinationsPreview.map((destination) => ({
        label: `Featured: ${destination.name}`,
        src: destination.image,
      })),
    ],
    [featuredDestinationsPreview],
  );
  const [debugResults, setDebugResults] = useState<
    Record<
      string,
      { resolvedSrc: string; status?: number; ok?: boolean; error?: string }
    >
  >({});

  useEffect(() => {
    if (typeof window === "undefined" || !isDebugEnabled) {
      return;
    }

    const controller = new AbortController();
    const origin = window.location.origin;

    const checkImages = async () => {
      const results = await Promise.all(
        debugImages.map(async ({ label, src }) => {
          const resolvedSrc = src.startsWith("http")
            ? src
            : new URL(src, origin).href;

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
        }),
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
          <div className="relative overflow-hidden rounded-none md:rounded-md min-h-[80vh] md:min-h-[70vh]">

            {/* Background image */}
            <Image
              src={HERO_IMAGE_URL}
              fallbackSrc="/hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Dark overlay for readable text */}
            <div className="absolute inset-0 bg-black/35" />

            {/* Content */}
            <div className="relative px-6 py-20 md:px-16 md:py-28 text-center text-white">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
                Find Your Next Adventure
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-white/90 leading-relaxed">
                The ultimate field guide to outdoor experiences across America.
                <br />
                From desert canyons to mountain peaks, we help you explore the wild.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/destinations">
                  <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#294129] transition">
                    Explore Destinations
                  </a>
                </Link>

                <Link href="/tours">
                  <a className="inline-flex items-center justify-center rounded-md bg-white/25 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30 transition">
                    View Tours
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Why choose">
          <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Why Choose Outdoor Adventures?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm md:text-base text-[#405040] leading-relaxed">
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

        {/* FEATURED DESTINATIONS (Codex section) */}
        <section className="mx-auto max-w-6xl px-6 pb-20" aria-label="Featured destinations">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
              Featured Destinations
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Plan your next escape
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
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
      <p className="mt-2 text-sm text-[#405040] leading-relaxed">{body}</p>
    </div>
  );
}
