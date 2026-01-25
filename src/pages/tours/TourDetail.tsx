import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import {
  getAffiliateDisclosure,
  getProviderLabel,
  getCityTourBookingPath,
  getTourBySlugs,
  getTourDetailPath,
} from "../../data/tours";
import { formatStartingPrice } from "../../lib/pricing";
import {
  getExpandedTourDescription,
  getTourHighlights,
} from "../../data/tourNarratives";
import { buildMetaDescription } from "../../utils/seo";

type TourDetailProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    slug: string;
  };
};

export default function TourDetail({ params }: TourDetailProps) {
  const tour = getTourBySlugs(params.stateSlug, params.citySlug, params.slug);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Browse the destination page to explore
          other options.
        </p>
      </main>
    );
  }

  const regionLabel =
    tour.destination.state || tour.destination.country || "";
  const destinationLabel = regionLabel
    ? `${tour.destination.city}, ${regionLabel}`
    : tour.destination.city;
  const title = `${tour.title} | ${destinationLabel} Outdoor Tour`;
  const description = buildMetaDescription(
    tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
    `Book ${tour.title} in ${destinationLabel} with curated outdoor tours and trusted local guides.`,
  );
  const disclosure = getAffiliateDisclosure(tour);
  const providerLabel = getProviderLabel(tour.bookingProvider);
  const highlights = getTourHighlights(tour);
  const startingPriceLabel = formatStartingPrice(
    tour.startingPrice,
    tour.currency,
  );

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={title}
        description={description}
        url={getTourDetailPath(tour)}
      />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          <Link href="/tours">
            <a>Back to tours</a>
          </Link>
          <span>/</span>
          <Link
            href={`/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours`}
          >
            <a>{destinationLabel}</a>
          </Link>
        </div>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm">
              <Image
                src={tour.heroImage}
                fallbackSrc="/hero.jpg"
                alt={tour.title}
                className="h-72 w-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                {destinationLabel}
              </p>
              <h1 className="text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
                {tour.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#1f2a1f]">
                {tour.badges.duration ? (
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1">
                    {tour.badges.duration}
                  </span>
                ) : null}
                {tour.badges.likelyToSellOut ? (
                  <span className="inline-flex items-center rounded-full bg-[#ffedd5] px-3 py-1 text-[#9a3412]">
                    Likely to sell out
                  </span>
                ) : null}
              </div>
              {tour.badges.tagline ? (
                <p className="text-sm text-[#405040] md:text-base">
                  {tour.badges.tagline}
                </p>
              ) : null}
              {tour.tagPills?.length ? (
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4a2f]">
                  {tour.tagPills.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#2f4a2f]/20 bg-white px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1f2a1f]">
                Ready to book?
              </h2>
              <p className="mt-3 text-sm text-[#405040]">
                Book instantly through our {providerLabel} partner link. You’ll
                be taken to the official booking page for availability and
                pricing.
              </p>
              {startingPriceLabel ? (
                <p className="mt-4 text-sm font-semibold text-[#1f2a1f]">
                  From {startingPriceLabel}
                </p>
              ) : null}
              <Link href={getCityTourBookingPath(tour)}>
                <a className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                  BOOK
                </a>
              </Link>
              <div className="mt-6 space-y-2 text-xs text-[#405040]">
                {disclosure ? <p>{disclosure}</p> : null}
                <p className="rounded-xl border border-dashed border-black/10 bg-white/60 p-4">
                  Provider:{" "}
                  <span className="font-semibold">{providerLabel}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 space-y-4 text-sm text-[#405040] md:text-base">
          <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#1f2a1f]">
              Tour highlights
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040] md:text-base">
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
          {getExpandedTourDescription(tour).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {tour.galleryImages?.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tour.galleryImages.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <Image
                  src={image}
                  fallbackSrc="/hero.jpg"
                  alt={`${tour.title} gallery`}
                  className="h-56 w-full object-cover md:h-72"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
