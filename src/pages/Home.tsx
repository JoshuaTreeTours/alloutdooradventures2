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
import TourCard from "../components/TourCard";
import { featuredDestinations } from "../data/destinations";
import { countriesWithTours } from "../data/europeIndex";
import type { Tour } from "../data/tours.types";
import { worldCountriesWithTours } from "../data/worldIndex";

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
      "/images/hiking-hero3.jpg",
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

const FEATURED_BEST_SELLING_TOURS: FeaturedTourEntry[] = [
  {
    href:
      "https://www.alloutdooradventures.com/destinations/montana/kalispell/tours/4-nights-3-days-all-inclusive-snowbike-adventure-268283",
    tour: {
      id: "snowbikenation-268283",
      slug: "4-nights-3-days-all-inclusive-snowbike-adventure-268283",
      title: "4 Nights / 3 Days All-Inclusive Snowbike Adventure",
      operator: "SnowBike Nation",
      categories: ["snowmobile-winter-activities"],
      primaryCategory: "snowmobile-winter-activities",
      destination: {
        state: "Montana",
        stateSlug: "montana",
        city: "Kalispell",
        citySlug: "kalispell",
      },
      heroImage: "https://cdn.filestackcontent.com/4TkuKhVREm0gY04ZHZsg",
      galleryImages: ["https://cdn.filestackcontent.com/4TkuKhVREm0gY04ZHZsg"],
      badges: {
        tagline: "Snowmobile winter activities",
      },
      activitySlugs: ["snowmobile-winter-activities"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/snowbikenation/items/268283/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/snowbikenation/items/268283/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "4 Nights / 3 Days All-Inclusive Snowbike Adventure is a multi-day winter experience based in Kalispell, Montana.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/tours/hawaii/honolulu/canoe-surfing-68065",
    tour: {
      id: "waikikibeachservices-68065",
      slug: "canoe-surfing-68065",
      title: "Canoe Surfing",
      operator: "Waikiki Beach Services",
      categories: ["canoe-surf"],
      primaryCategory: "canoe-surf",
      destination: {
        state: "Hawaii",
        stateSlug: "hawaii",
        city: "Honolulu",
        citySlug: "honolulu",
      },
      heroImage: "https://cdn.filestackcontent.com/Rzl3DMG0StG5dCHeGclL",
      galleryImages: ["https://cdn.filestackcontent.com/Rzl3DMG0StG5dCHeGclL"],
      badges: {
        tagline: "Canoe surf",
      },
      activitySlugs: ["canoe-surf"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/waikikibeachservices/items/68065/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/waikikibeachservices/items/68065/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Canoe Surfing is a guided ocean adventure based in Honolulu, Hawaii that highlights Waikiki waters.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/tours/monument-valley-air-ground-tour-f-mvj-164143",
    tour: {
      id: "westwindairservice-164143",
      slug: "monument-valley-air-ground-tour-f-mvj-164143",
      title: "Monument Valley Air & Ground Tour (F-MVJ)",
      operator: "Westwind Air Service",
      categories: ["guided-tour"],
      primaryCategory: "guided-tour",
      destination: {
        state: "Arizona",
        stateSlug: "arizona",
        city: "Flagstaff",
        citySlug: "flagstaff",
      },
      heroImage: "https://cdn.filestackcontent.com/V8REZ4EpRc22gTUzzgXx",
      galleryImages: ["https://cdn.filestackcontent.com/V8REZ4EpRc22gTUzzgXx"],
      badges: {
        tagline: "Guided tour",
      },
      activitySlugs: ["guided-tour"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/westwindairservice/items/164143/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/westwindairservice/items/164143/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Monument Valley Air & Ground Tour (F-MVJ) is a guided air and land experience based in Flagstaff, Arizona.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/tours/vermont/hartford/quechee-balloon-festival-e-bike-ride-625942",
    tour: {
      id: "vtbikeandbrew-625942",
      slug: "quechee-balloon-festival-e-bike-ride-625942",
      title: "Quechee Balloon Festival E-Bike Ride",
      operator: "Vermont Bike and Brew",
      categories: ["e-bike"],
      primaryCategory: "e-bike",
      destination: {
        state: "Vermont",
        stateSlug: "vermont",
        city: "Hartford",
        citySlug: "hartford",
      },
      heroImage: "https://cdn.filestackcontent.com/9oH85KRaWWcqX4Zv1XZQ",
      galleryImages: ["https://cdn.filestackcontent.com/9oH85KRaWWcqX4Zv1XZQ"],
      badges: {
        tagline: "E-bike ride",
      },
      activitySlugs: ["e-bike"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/vtbikeandbrew/items/625942/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/vtbikeandbrew/items/625942/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Quechee Balloon Festival E-Bike Ride is a guided e-bike outing based in Hartford, Vermont.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/destinations/colorado/denver/tours/switzerland-trail-tour-656031",
    tour: {
      id: "mountainhighbicycletours-656031",
      slug: "switzerland-trail-tour-656031",
      title: "Switzerland Trail Tour",
      operator: "Mountain High Bicycle Tours LLC",
      categories: ["bike-tour"],
      primaryCategory: "bike-tour",
      destination: {
        state: "Colorado",
        stateSlug: "colorado",
        city: "Denver",
        citySlug: "denver",
      },
      heroImage: "https://cdn.filestackcontent.com/7eE3CbORiiBd6vh2rR45",
      galleryImages: ["https://cdn.filestackcontent.com/7eE3CbORiiBd6vh2rR45"],
      badges: {
        tagline: "Bike tour",
      },
      activitySlugs: ["bike-tour"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/mountainhighbicycletours/items/656031/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/mountainhighbicycletours/items/656031/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Switzerland Trail Tour is a guided cycling adventure based in Denver, Colorado.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241",
    tour: {
      id: "celebrationsantabarbara-4241",
      slug: "coastal-cruise-azure-seas-4241",
      title: "Coastal Cruise (Azure Seas)",
      operator: "Celebration Cruises",
      categories: ["boat-tour"],
      primaryCategory: "boat-tour",
      destination: {
        state: "California",
        stateSlug: "california",
        city: "Santa Barbara",
        citySlug: "santa-barbara",
      },
      heroImage: "https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS",
      galleryImages: ["https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"],
      badges: {
        tagline: "Boat tour",
      },
      activitySlugs: ["boat-tour"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/celebrationsantabarbara/items/4241/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/celebrationsantabarbara/items/4241/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Coastal Cruise (Azure Seas) is a coastal sightseeing escape based in Santa Barbara, California.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/tours/italy/la-spezia/mountain-e-bike-private-tour-la-spezia---cinque-terre-119344",
    tour: {
      id: "arbaspaa-119344",
      slug: "mountain-e-bike-private-tour-la-spezia---cinque-terre-119344",
      title: "Mountain E-Bike Private tour: La Spezia - Cinque Terre",
      operator: "Arbaspaa",
      categories: ["bike-tour", "e-bike", "train"],
      primaryCategory: "e-bike",
      destination: {
        state: "Italy",
        stateSlug: "italy",
        city: "La Spezia",
        citySlug: "la-spezia",
      },
      heroImage: "https://cdn.filestackcontent.com/dMQQ1xKTRiY2cOpIYZED",
      galleryImages: ["https://cdn.filestackcontent.com/dMQQ1xKTRiY2cOpIYZED"],
      badges: {
        tagline: "E-bike tour",
      },
      activitySlugs: ["e-bike", "bike-tour"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/arbaspaa/items/119344/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/arbaspaa/items/119344/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Mountain E-Bike Private tour: La Spezia - Cinque Terre is a private cycling experience based in La Spezia, Italy.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/tours/switzerland/interlaken/grand-tour-of-interlaken-617564",
    tour: {
      id: "alpinbikes-617564",
      slug: "grand-tour-of-interlaken-617564",
      title: "Grand Tour of Interlaken",
      operator: "AlpinBike Adventures",
      categories: ["bike-tour"],
      primaryCategory: "bike-tour",
      destination: {
        state: "Switzerland",
        stateSlug: "switzerland",
        city: "Interlaken",
        citySlug: "interlaken",
      },
      heroImage: "https://cdn.filestackcontent.com/18yO7MQtS4Ga9RQ0wHt6",
      galleryImages: ["https://cdn.filestackcontent.com/18yO7MQtS4Ga9RQ0wHt6"],
      badges: {
        tagline: "Bike tour",
      },
      activitySlugs: ["bike-tour"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/alpinbikes/items/617564/?asn=fhdn-chf&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/alpinbikes/items/617564/?asn=fhdn-chf&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Grand Tour of Interlaken is a guided cycling experience based in Interlaken, Switzerland.",
    },
  },
  {
    href:
      "https://www.alloutdooradventures.com/tours/california/san-diego/stand-up-paddle-sup-board-453896",
    tour: {
      id: "actionsportrentals-paradisepointresort-453896",
      slug: "stand-up-paddle-sup-board-453896",
      title: "Stand Up Paddle (SUP) Board",
      operator: "Action Sport Rentals - Paradise Point Resort",
      categories: ["sup"],
      primaryCategory: "sup",
      destination: {
        state: "California",
        stateSlug: "california",
        city: "San Diego",
        citySlug: "san-diego",
      },
      heroImage: "https://cdn.filestackcontent.com/uWaG3LcTDKPYbvtVaXFk",
      galleryImages: ["https://cdn.filestackcontent.com/uWaG3LcTDKPYbvtVaXFk"],
      badges: {
        tagline: "Stand up paddle",
      },
      activitySlugs: ["sup"],
      bookingProvider: "fareharbor",
      bookingUrl:
        "https://fareharbor.com/embeds/book/actionsportrentals-paradisepointresort/items/453896/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      bookingWidgetUrl:
        "https://fareharbor.com/embeds/calendar/actionsportrentals-paradisepointresort/items/453896/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
      longDescription:
        "Stand Up Paddle (SUP) Board is a water rental experience based in San Diego, California.",
    },
  },
];

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
      .map((region) => ({
        region,
        destinations: (grouped[region] ?? []).slice(0, 2),
      }))
      .filter((group) => group.destinations.length > 0);
  }, []);

  const rockyMountainDestinations = useMemo(
    () =>
      featuredDestinations.filter((destination) =>
        ["montana", "colorado"].includes(destination.stateSlug)
      ),
    []
  );

  const featuredDestinationsPreview = useMemo(
    () => featuredDestinationsByRegion.flatMap((group) => group.destinations),
    [featuredDestinationsByRegion]
  );

  const internationalDestinationOptions = useMemo(() => {
    const options = [
      ...countriesWithTours.map((country) => ({
        name: country.name,
        slug: `europe:${country.slug}`,
      })),
      ...worldCountriesWithTours.map((country) => ({
        name: country.name,
        slug: `world:${country.slug}`,
      })),
    ];
    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

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
  const [selectedInternationalDestination, setSelectedInternationalDestination] =
    useState("");

  const selectedInternationalName = useMemo(
    () =>
      internationalDestinationOptions.find(
        (option) => option.slug === selectedInternationalDestination,
      )?.name,
    [internationalDestinationOptions, selectedInternationalDestination],
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
    setActivePage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const interval = window.setInterval(() => {
      setActivePage((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isPaused, totalPages]);

  const handlePrevious = () => {
    setActivePage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setActivePage((prev) => (prev + 1) % totalPages);
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

        {/* ACTIVITIES */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Choose Your Adventure
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HERO_ACTIVITY_SPOTLIGHTS.map((activity) => (
              <Link
                key={activity.title}
                href={`/tours/${activity.slug}`}
              >
                <a className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/80 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-44">
                    <Image
                      src={activity.image}
                      fallbackSrc="/hero.jpg"
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
              Explore handcrafted itineraries across three regions—each destination
              blends signature landscapes with local-guided adventure.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {featuredDestinationsByRegion.map((group) => (
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
                  {group.destinations.map((destination) => (
                    <DestinationCard
                      key={`${group.region}-${destination.name}`}
                      destination={destination}
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
                  {rockyMountainDestinations.map((destination) => (
                    <DestinationCard
                      key={`rocky-mountain-${destination.name}`}
                      destination={destination}
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
              onSelect={(slug) => {
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
