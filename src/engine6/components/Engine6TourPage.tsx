import { useMemo } from "react";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import RatingStars from "../../engine4/components/RatingStars";
import { buildBreadcrumbList } from "../../utils/structuredData";
import type { Engine6ResolvedTourPageData } from "../types";
import Engine6FaqSection from "./Engine6FaqSection";
import Engine6IncludedSection from "./Engine6IncludedSection";
import Engine6ItinerarySection from "./Engine6ItinerarySection";

export default function Engine6TourPage({
  page,
}: {
  page: Engine6ResolvedTourPageData;
}) {
  const structuredDataNodes = useMemo(() => {
    const breadcrumbs = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: "Hawaii", url: "/destinations/hawaii" },
      { name: "Hilo", url: "/destinations/hawaii/hilo" },
      { name: "Tours", url: "/destinations/hawaii/hilo/tours" },
      { name: page.title, url: page.canonicalPath },
    ]);

    const productNode: Record<string, unknown> = {
      "@type": "Product",
      name: page.schema.productName,
      description: page.schema.description,
      image: page.schema.image,
      brand: { "@type": "Brand", name: "Viator" },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: page.schema.offer?.url,
        price: page.schema.offer?.price,
        priceCurrency: page.schema.offer?.priceCurrency ?? "USD",
      },
    };

    if (page.schema.aggregateRating) {
      productNode.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: page.schema.aggregateRating.ratingValue,
        reviewCount: page.schema.aggregateRating.reviewCount,
      };
    }

    return [breadcrumbs, productNode];
  }, [page]);

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={page.seo.title}
        description={page.seo.description}
        url={page.seo.canonicalUrl}
        image={page.seo.ogImage}
      />
      <section className="bg-[#152c17] text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">
              {page.destinationLabel}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-[#9effa8]">
              {page.fromPriceText
                ? `From ${page.fromPriceText}`
                : "From live pricing"}
            </p>
            <dl className="mt-4 grid gap-3 text-sm text-white/90 sm:grid-cols-2">
              {page.durationText ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-white/70">
                    Duration
                  </dt>
                  <dd>{page.durationText}</dd>
                </div>
              ) : null}
              {page.meetingPointShort ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-white/70">
                    Meeting point
                  </dt>
                  <dd>{page.meetingPointShort}</dd>
                </div>
              ) : null}
              {page.cancellationText ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.16em] text-white/70">
                    Cancellation
                  </dt>
                  <dd>{page.cancellationText}</dd>
                </div>
              ) : null}
            </dl>
            {typeof page.ratingValue === "number" ? (
              <div className="mt-4">
                <RatingStars
                  ratingValue={page.ratingValue}
                  reviewCount={page.reviewCount}
                  className="text-[#9effa8]"
                />
              </div>
            ) : null}
            <a
              href={page.bookingUrl}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 font-semibold text-white transition hover:bg-[#287a35]"
            >
              Reserve this tour
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-black/20">
            {page.heroImage ? (
              <Image
                src={page.heroImage}
                fallbackSrc={page.heroImage}
                alt={page.title}
                className="h-64 w-full object-cover md:h-[420px]"
              />
            ) : (
              <div className="h-64 w-full bg-white/10 md:h-[420px]" />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6 md:py-12">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="mt-4 leading-7 text-[#405040]">{page.overview}</p>
        </section>

        {page.highlights.length ? (
          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Highlights</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[#405040]">
              {page.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <Engine6IncludedSection
          inclusions={page.inclusions}
          exclusions={page.exclusions}
        />

        {(page.meetingPointFull || page.meetingPointShort) && (
          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Meeting & Pickup</h2>
            <p className="mt-4 text-[#405040]">
              {page.meetingPointFull ?? page.meetingPointShort}
            </p>
          </section>
        )}

        <Engine6ItinerarySection itinerary={page.itinerary} />

        {page.additionalInfo.length ? (
          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Good to Know</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[#405040]">
              {page.additionalInfo.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <Engine6FaqSection faqs={page.faqs} />

        <section className="rounded-2xl border border-[#2f8a3d]/30 bg-[#e9f7ec] p-6 text-center">
          <h2 className="text-2xl font-semibold">
            Ready to explore Volcanoes National Park?
          </h2>
          <a
            href={page.bookingUrl}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 font-semibold text-white transition hover:bg-[#287a35]"
          >
            Reserve this Hilo tour
          </a>
        </section>

        <section className="rounded-xl border border-dashed border-[#2f8a3d] bg-[#f4fff6] p-4 text-xs text-[#2f4a2f]">
          <h3 className="font-semibold uppercase tracking-[0.16em]">
            Engine6 Pilot Debug
          </h3>
          <ul className="mt-2 space-y-1">
            <li>fromPrice: {page.fromPriceText ?? "n/a"}</li>
            <li>meetingPointShort: {page.meetingPointShort ?? "n/a"}</li>
            <li>durationText: {page.durationText ?? "n/a"}</li>
            <li>itinerary length: {page.itinerary.length}</li>
            <li>faqs length: {page.faqs.length}</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
