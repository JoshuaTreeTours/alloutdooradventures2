import { useMemo } from "react";

import Seo from "../../components/Seo";
import TourRating from "../../engine2/components/TourRating";
import { useStructuredData } from "../../components/StructuredDataProvider";
import {
  buildTourProductNodeId,
  buildWebPageStructuredData,
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
} from "../../utils/structuredData";
import { buildTourSchemaGraph } from "../../schema/buildTourSchemaGraph";
import type { Engine3TourViewModel } from "../types";

type Engine3TourPageProps = {
  tour: Engine3TourViewModel;
};

const EXTERNAL_CTA_REL = "nofollow sponsored noopener noreferrer";

const priceLabel = (priceFrom?: string) => {
  if (!priceFrom) {
    return undefined;
  }

  return /^prices?\s+starting/i.test(priceFrom)
    ? priceFrom
    : `Prices starting at ${priceFrom}`;
};

export default function Engine3TourPage({ tour }: Engine3TourPageProps) {
  const hasMeetingPoint = Boolean(tour.meetingPointDescription);
  const pageDescription = `${tour.title} in ${tour.city}, ${tour.region}`;
  const productNodeId = buildTourProductNodeId(tour.tourId);

  const structuredDataNodes = useMemo(() => {
    const tourSchemaNodes = buildTourSchemaGraph({
      url: tour.canonicalPath,
      pageName: tour.title,
      pageDescription,
      heroImage: tour.heroImageUrl,
      derivedImages: tour.heroImageUrl ? [tour.heroImageUrl] : [],
      place: {
        city: tour.city,
        region: tour.region,
      },
      product: {
        id: productNodeId,
        name: tour.title,
        description: pageDescription,
      },
      trip: {
        id: `${tour.canonicalPath}#trip`,
        name: tour.title,
        description: pageDescription,
        duration: tour.duration,
        touristType: "Adventure travelers",
        departureLocation: null,
      },
      offers: {
        url: tour.bookingUrl,
        priceCurrency: "USD",
      },
      brandOrgIds: {
        orgId: SITE_ORGANIZATION_ID,
        brandId: SITE_BRAND_ID,
        websiteId: SITE_WEBSITE_ID,
      },
    })["@graph"] as Record<string, unknown>[];

    const webPageNode = buildWebPageStructuredData({
      url: tour.canonicalPath,
      name: tour.title,
      description: pageDescription,
      image: tour.heroImageUrl,
      mainEntityId: productNodeId,
    });

    return [
      ...tourSchemaNodes.filter(node => node["@type"] !== "WebPage"),
      webPageNode,
    ];
  }, [pageDescription, productNodeId, tour]);

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={tour.title}
        description={pageDescription}
        url={tour.canonicalPath}
        image={tour.heroImageUrl}
      />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {tour.city}, {tour.region}
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            {tour.title}
          </h1>
          {tour.duration ? (
            <p className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]">
              {tour.duration}
            </p>
          ) : null}
          {priceLabel(tour.priceFrom) ? (
            <p className="mt-4 text-sm font-semibold text-white/90">
              {priceLabel(tour.priceFrom)}
            </p>
          ) : null}
          {tour.rating && tour.reviewCount ? (
            <TourRating rating={tour.rating} reviewCount={tour.reviewCount} />
          ) : null}
          <div className="mt-6">
            <a
              href={tour.bookingUrl}
              target="_blank"
              rel={EXTERNAL_CTA_REL}
              className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            >
              Book This Tour
            </a>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-14">
        {tour.heroImageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <img
              src={tour.heroImageUrl}
              alt={tour.title}
              referrerPolicy="no-referrer"
              loading="eager"
              className="h-64 w-full object-cover md:h-80"
            />
          </div>
        ) : null}

        {tour.highlights?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Highlights
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {tour.highlights.map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </>
        ) : null}

        {tour.included?.length || tour.notIncluded?.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {tour.included?.length ? (
              <div>
                <h2 className="text-xl font-semibold text-[#2f4a2f]">
                  Included
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                  {tour.included.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {tour.notIncluded?.length ? (
              <div>
                <h2 className="text-xl font-semibold text-[#2f4a2f]">
                  Not included
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                  {tour.notIncluded.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasMeetingPoint ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Meeting and pickup
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              {tour.meetingPointDescription}
            </p>
          </>
        ) : null}

        {tour.itinerary?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Itinerary
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#405040]">
              {tour.itinerary.map(step => (
                <li key={step.title}>
                  {step.title}
                  {step.duration ? ` (${step.duration})` : ""}
                  {step.description ? ` — ${step.description}` : ""}
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {tour.faqs?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">FAQs</h2>
            <div className="mt-4 space-y-4">
              {tour.faqs.map(item => (
                <article
                  key={item.question}
                  className="rounded-lg border border-black/10 bg-white p-4"
                >
                  <h3 className="text-sm font-semibold text-[#2f4a2f]">
                    {item.question}
                  </h3>
                  <p className="mt-1 text-sm text-[#405040]">{item.answer}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}

        <div className="mt-10">
          <a
            href={tour.bookingUrl}
            target="_blank"
            rel={EXTERNAL_CTA_REL}
            className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
          >
            Book This Tour
          </a>
        </div>
      </section>
    </main>
  );
}
