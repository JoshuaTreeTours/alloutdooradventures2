import { useMemo } from "react";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { buildBreadcrumbList } from "../../utils/structuredData";
import type { Engine6ResolvedTourPageData } from "../types";
import Engine6FactsCard from "./Engine6FactsCard";
import Engine6FaqSection from "./Engine6FaqSection";
import Engine6IncludedSection from "./Engine6IncludedSection";
import Engine6ItinerarySection from "./Engine6ItinerarySection";

const formatFromPriceLabel = (page: Engine6ResolvedTourPageData) => {
  if (typeof page.fromPrice === "number" && page.fromPrice > 0) {
    try {
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: page.currency ?? "USD",
        maximumFractionDigits: 0,
      }).format(page.fromPrice);
      return `From ${formatted} per person`;
    } catch {
      return `From $${Math.round(page.fromPrice)} per person`;
    }
  }

  if (page.fromPriceText?.trim()) {
    const normalized = page.fromPriceText.trim();
    const parsed = Number.parseFloat(normalized.replace(/[^0-9.]/g, ""));

    if (Number.isFinite(parsed) && parsed > 0) {
      const wantsUsdSymbol =
        normalized.toUpperCase().includes("USD") ||
        normalized.includes("$") ||
        !page.currency ||
        page.currency === "USD";

      if (wantsUsdSymbol) {
        return `From $${Math.round(parsed)} per person`;
      }

      return `From ${normalized} per person`;
    }
  }

  return undefined;
};

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

  const fromPriceLabel = formatFromPriceLabel(page);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={page.seo.title}
        description={page.seo.description}
        url={page.seo.canonicalUrl}
        image={page.seo.ogImage}
      />
      <section className="bg-[#f3eee5]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#5c6d5b]">
                {page.destinationLabel}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-5xl">
                {page.title}
              </h1>
              {fromPriceLabel ? (
                <p className="mt-4 text-2xl font-semibold text-[#1f6b2b]">
                  {fromPriceLabel}
                </p>
              ) : null}

              <div className="mt-5 max-w-xl">
                <Engine6FactsCard page={page} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/10 shadow-sm">
              {page.heroImage ? (
                <Image
                  src={page.heroImage}
                  fallbackSrc={page.heroImage}
                  alt={page.title}
                  className="h-64 w-full object-cover md:h-[360px]"
                />
              ) : (
                <div className="h-64 w-full bg-white/10 md:h-[360px]" />
              )}
            </div>
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
      </section>
    </main>
  );
}
