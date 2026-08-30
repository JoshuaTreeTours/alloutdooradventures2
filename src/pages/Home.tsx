import {
  useEffect,
  useMemo,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "wouter";

import DestinationCard from "../components/DestinationCard";
import Image from "../components/Image";
import RegionDropdownButton from "../components/RegionDropdownButton";
import Seo from "../components/Seo";
import TourCard from "../components/TourCard";
import { featuredDestinations } from "../data/destinations";
import { engine6ListingTours } from "../engine6/listing";
import { countriesWithTours } from "../data/europeIndex";
import type { Tour } from "../data/tours.types";
import { worldCountriesWithTours } from "../data/worldIndex";
import { canonicalHref, getStateGuidePath } from "../utils/guidePaths";
import { SITE_BRAND_NAME } from "../utils/site";
import { DEFAULT_SEO, ROOT_OG_IMAGE } from "../utils/seo";

const HERO_IMAGE_URL = ROOT_OG_IMAGE;

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
    image: "/images/hiking-hero3.jpg",
  },
  {
    title: "Paddle Sports",
    description: "Worldwide paddle adventures",
    slug: "canoeing",
    image: "/images/canoe-hero.jpg",
  },
];

type FeaturedTourEntry = {
  href: string;
  tour: Tour;
};

export const FEATURED_BEST_SELLING_TOUR_ROUTES = [
  "/destinations/arizona/grand-canyon-national-park/tours/grand-entrance-jeep-tour-3272GCSR2",
  "/destinations/utah/zion-national-park/tours/narrows-zion-private-guided-hike-199627P1",
  "/destinations/montana/glacier-national-park/tours/half-day-whitewater-rafting-123783P1",
  "/destinations/wyoming/yellowstone-national-park/tours/private-yellowstone-tour-iconic-sites-wildlife-family-f-151830P1",
  "/destinations/washington/olympic-national-park/tours/olympic-national-park-small-group-day-tour-w-sceni-132218P140",
  "/destinations/florida/fort-lauderdale/tours/reef-and-snorkel-paddle-tour-89173p8",
  "/destinations/california/joshua-tree/tours/joshua-tree-scenic-tour-6740p7",
  "/destinations/california/yosemite/tours/guided-yosemite-hiking-excursion-6004HIKE",
  "/destinations/colorado/rocky-mountain-national-park/tours/retractable-glass-top-tour-in-rocky-mountain-national-p-424860P1",
] as const;

const engine6ToursByRoute = new Map(
  engine6ListingTours.map(tour => [
    `/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`,
    tour,
  ])
);

export const FEATURED_BEST_SELLING_TOURS: FeaturedTourEntry[] =
  FEATURED_BEST_SELLING_TOUR_ROUTES.map(href => {
    const routeMatch = href.match(
      /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/
    );
    const lookupKey = routeMatch
      ? `/${routeMatch[1]}/${routeMatch[2]}/${routeMatch[3]}`
      : href;
    const tour = engine6ToursByRoute.get(lookupKey);

    if (!tour) {
      throw new Error(`Missing Engine6 featured best-selling tour for ${href}`);
    }

    return { href, tour };
  });

export default function Home() {
  const getFeaturedRegionLabel = (region: string) => {
    if (region === "West") return "West Coast";
    if (region === "Northeast") return "East Coast";
    if (region === "Deep South") return "Southern";
    return region;
  };

  const isDebugEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugImages") === "1" &&
    import.meta.env.MODE !== "production" &&
    import.meta.env.VERCEL_ENV !== "production";

  const featuredDestinationsByRegion = useMemo(() => {
    const regionOrder = ["West", "Northeast", "Deep South"];
    const grouped = featuredDestinations.reduce<
      Record<string, typeof featuredDestinations>
    >((accumulator, destination) => {
      const region = destination.region ?? "Other";
      accumulator[region] = accumulator[region] ?? [];
      accumulator[region].push(destination);
      return accumulator;
    }, {});

    return regionOrder
      .map(region => ({
        region,
        destinations: (grouped[region] ?? []).slice(0, 2),
      }))
      .filter(group => group.destinations.length > 0);
  }, []);

  const rockyMountainDestinations = useMemo(
    () =>
      featuredDestinations.filter(destination =>
        ["montana", "colorado"].includes(destination.stateSlug)
      ),
    []
  );

  const featuredDestinationsPreview = useMemo(
    () => featuredDestinationsByRegion.flatMap(group => group.destinations),
    [featuredDestinationsByRegion]
  );

  const internationalDestinationOptions = useMemo(() => {
    const options = [
      ...countriesWithTours.map(country => ({
        name: country.name,
        slug: `europe:${country.slug}`,
      })),
      ...worldCountriesWithTours.map(country => ({
        name: country.name,
        slug: `world:${country.slug}`,
      })),
    ];
    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const debugImages = useMemo(
    () => [
      { label: "Hero", src: HERO_IMAGE_URL },
      ...featuredDestinationsPreview.map(destination => ({
        label: `Featured: ${destination.name}`,
        src: destination.image,
      })),
    ],
    [featuredDestinationsPreview]
  );

  const [debugResults, setDebugResults] = useState<
    Record<
      string,
      { resolvedSrc: string; status?: number; ok?: boolean; error?: string }
    >
  >({});

  const featuredBestSellingTours = useMemo(
    () => FEATURED_BEST_SELLING_TOURS,
    []
  );
  const featuredBestSellingHighlights = useMemo(
    () => FEATURED_BEST_SELLING_TOURS.slice(0, 3),
    []
  );
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [
    selectedInternationalDestination,
    setSelectedInternationalDestination,
  ] = useState("");

  const selectedInternationalName = useMemo(
    () =>
      internationalDestinationOptions.find(
        option => option.slug === selectedInternationalDestination
      )?.name,
    [internationalDestinationOptions, selectedInternationalDestination]
  );

  const featuredTourPages = useMemo(() => {
    const pages: FeaturedTourEntry[][] = [];
    for (let i = 0; i < featuredBestSellingTours.length; i += itemsPerPage) {
      pages.push(featuredBestSellingTours.slice(i, i + itemsPerPage));
    }
    return pages.length ? pages : [featuredBestSellingTours];
  }, [featuredBestSellingTours, itemsPerPage]);

  const totalPages = featuredTourPages.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const getResponsiveCount = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) return 3;
      if (window.matchMedia("(min-width: 640px)").matches) return 2;
      return 1;
    };
    const updateItemsPerPage = () => setItemsPerPage(getResponsiveCount());
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    setActivePage(prev => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const interval = window.setInterval(() => {
      setActivePage(prev => (prev + 1) % totalPages);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isPaused, totalPages]);

  const handlePrevious = () => {
    setActivePage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setActivePage(prev => (prev + 1) % totalPages);
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };

  const handleCarouselBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsPaused(false);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !isDebugEnabled) return;

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
      <Seo
        title={DEFAULT_SEO.title}
        description={DEFAULT_SEO.description}
        url="/"
        image={ROOT_OG_IMAGE}
      />
      <main>
        {/* HERO */}
        <section
          className="relative mx-auto max-w-[1400px] px-6 pt-6"
          aria-label="Hero"
        >
          <div className="relative min-h-[80vh] overflow-hidden rounded-none md:min-h-[70vh] md:rounded-md">
            {/* Background image */}
            {HERO_IMAGE_URL ? (
              <Image
                src={HERO_IMAGE_URL}
                fallbackSrc={HERO_IMAGE_URL}
                alt=""
                className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110"
              />
            ) : null}

            {/* Light overlay for readable text */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Content */}
            <div className="relative px-6 py-20 text-center text-white md:px-16 md:py-28">
              <h1 className="text-4xl font-semibold tracking-tight text-white drop-shadow-md md:text-6xl">
                Find Your Next Adventure
              </h1>
              <p className="mx-auto mt-5 max-w-2xl rounded-lg bg-black/4 backdrop-blur-sm px-5 py-4 text-base leading-relaxed text-white drop-shadow md:text-lg">
                Unforgettable experiences around the world,
                <br />
                from desert canyons to mountain peaks.
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
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-6 py-10 text-center md:py-14">
          <p className="text-xl font-semibold text-[#2f4a2f] md:text-3xl">
            To think out of the box, you must first get out of it.
          </p>
        </section>

        {/* WHY CHOOSE */}
        <section
          className="mx-auto max-w-6xl px-6 py-16"
          aria-label="Why choose"
        >
          <h2 className="text-center text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Why Choose {SITE_BRAND_NAME}?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-[#405040] md:text-base">
            We curate the best outdoor experiences, vetted by locals and
            seasoned travelers. No tourist traps—just authentic adventures.
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

        {/* ACTIVITIES */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Choose Your Adventure
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HERO_ACTIVITY_SPOTLIGHTS.map(activity => (
              <Link key={activity.title} href={`/tours/${activity.slug}`}>
                <a className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/80 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-44">
                    <Image
                      src={activity.image}
                      fallbackSrc={activity.image}
                      alt={activity.title}
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

        <section
          className="mx-auto max-w-6xl px-6 py-16"
          aria-label="Featured best selling tours"
        >
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
              This week’s specials
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Featured Best Selling Tours
            </h2>
          </div>

          <div
            className="mt-10 flex flex-col gap-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={handleCarouselBlur}
            onKeyDown={handleCarouselKeyDown}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Featured best selling tours carousel"
          >
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                aria-label="View previous tours"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#2f4a2f] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="View next tours"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#294129]"
              >
                Next
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activePage * 100}%)` }}
              >
                {featuredTourPages.map((page, pageIndex) => (
                  <div
                    key={`featured-page-${pageIndex}`}
                    className="w-full flex-shrink-0"
                    aria-hidden={activePage !== pageIndex}
                  >
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {page.map(({ tour, href }) => (
                        <TourCard key={tour.id} tour={tour} href={href} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2" role="tablist">
              {featuredTourPages.map((_, index) => (
                <button
                  key={`featured-dot-${index}`}
                  type="button"
                  onClick={() => setActivePage(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-pressed={activePage === index}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    activePage === index ? "bg-[#2f4a2f]" : "bg-[#c9d4c0]"
                  }`}
                />
              ))}
            </div>
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
              Plan your next escape across the American West, Northeast, and
              Deep South
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#405040] md:text-base">
              Explore handcrafted itineraries across three regions—each
              destination blends signature landscapes with local-guided
              adventure.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {featuredDestinationsByRegion.map(group => (
              <div key={group.region} className="space-y-6">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                    {getFeaturedRegionLabel(group.region)}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-[#2f4a2f] md:text-2xl">
                    Featured {getFeaturedRegionLabel(group.region)} States
                  </h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {group.destinations.map(destination => (
                    <DestinationCard
                      key={`${group.region}-${destination.name}`}
                      destination={{
                        ...destination,
                        href: canonicalHref(
                          getStateGuidePath(destination.stateSlug)
                        ),
                      }}
                      ctaLabel="Discover"
                      headingLevel="h4"
                      descriptionVariant="featured"
                    />
                  ))}
                </div>
              </div>
            ))}
            {rockyMountainDestinations.length > 0 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                    Rocky Mountain
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-[#2f4a2f] md:text-2xl">
                    Featured Rocky Mountain States
                  </h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {rockyMountainDestinations.map(destination => (
                    <DestinationCard
                      key={`rocky-mountain-${destination.name}`}
                      destination={{
                        ...destination,
                        href: canonicalHref(
                          getStateGuidePath(destination.stateSlug)
                        ),
                      }}
                      ctaLabel="Discover"
                      headingLevel="h4"
                      descriptionVariant="featured"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 pb-20"
          aria-label="International tours"
        >
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
              International
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              International Tours
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#405040] md:text-base">
              Explore tours across Europe, Latin America, and beyond.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-md">
            <RegionDropdownButton
              label="Select a country…"
              options={internationalDestinationOptions}
              selectedName={selectedInternationalName}
              onSelect={slug => {
                const [region, countrySlug] = slug.split(":");
                if (!countrySlug) {
                  return;
                }
                setSelectedInternationalDestination(slug);
                const basePath =
                  region === "world"
                    ? "/destinations/world"
                    : "/destinations/europe";
                window.location.assign(`${basePath}/${countrySlug}`);
              }}
            />
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
                Shows resolved image URLs and HEAD status codes to diagnose
                Safari loading issues.
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
