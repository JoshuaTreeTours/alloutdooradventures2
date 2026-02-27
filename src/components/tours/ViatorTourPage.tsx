import { Link } from "wouter";

import Seo from "../Seo";
import Image from "../Image";
import { useStructuredData } from "../StructuredDataProvider";
import BookItButton from "./BookItButton";
import TourBottomPhotoRow from "./TourBottomPhotoRow";
import { buildImageProxyUrl } from "../../utils/images/buildImageProxyUrl";
import type { ViatorRegistryEntry } from "../../utils/viator/types";
import { mapViatorToTourModel } from "../../utils/viator/mapViatorToTourModel";

type ViatorTourPageProps = {
  entry: ViatorRegistryEntry;
};

export default function ViatorTourPage({ entry }: ViatorTourPageProps) {
  const { parsed, derived, viatorUrl, pagePath, regionSlug, destinationSlug } =
    entry;
  const model = mapViatorToTourModel({
    parsed,
    media: entry.media,
    operatorImages: entry.operatorImages,
    derived,
    viatorUrl,
    regionSlug,
    destinationSlug,
    heroImageUrl: entry.heroImageUrl,
    bottomImageUrl: entry.bottomImageUrl,
  });

  const proxiedHeroImageUrl =
    buildImageProxyUrl(model.heroImageUrl) ?? model.heroImageUrl;
  const proxiedBottomImageUrl = model.bottomImageUrl
    ? (buildImageProxyUrl(model.bottomImageUrl) ?? model.bottomImageUrl)
    : undefined;

  const productNode: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: parsed.title,
    description: derived.description,
    offers: {
      "@type": "Offer",
      url: viatorUrl,
      ...(typeof parsed.priceFrom === "number"
        ? { price: parsed.priceFrom }
        : {}),
      ...(parsed.currency ? { priceCurrency: parsed.currency } : {}),
    },
  };

  if (
    typeof parsed.ratingValue === "number" &&
    typeof parsed.reviewCount === "number"
  ) {
    productNode.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: parsed.ratingValue,
      reviewCount: parsed.reviewCount,
    };
  }

  const faqNode =
    parsed.faqs && parsed.faqs.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: parsed.faqs.map(faq => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }
      : null;

  useStructuredData([productNode, ...(faqNode ? [faqNode] : [])]);

  const stateHref = `/destinations/states/${regionSlug}`;
  const cityHref = `${stateHref}/cities/${destinationSlug}`;
  const toursHref = `/destinations/${regionSlug}/${destinationSlug}/tours`;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={parsed.title ?? "Tour"}
        description={derived.description}
        canonicalUrl={pagePath}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href={stateHref}>
              <a>{regionSlug.replace(/-/g, " ")}</a>
            </Link>
            <span>/</span>
            <Link href={cityHref}>
              <a>{destinationSlug.replace(/-/g, " ")}</a>
            </Link>
            <span>/</span>
            <Link href={toursHref}>
              <a>Tours</a>
            </Link>
            <span>/</span>
            <span className="text-white">{model.title}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {model.destinationText ?? destinationSlug.replace(/-/g, " ")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {model.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
              {model.durationText ? (
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1">
                  {model.durationText}
                </span>
              ) : null}
            </div>
            {typeof model.priceFrom === "number" ? (
              <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
                Prices starting at {model.currency ?? "USD"} {model.priceFrom}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <BookItButton href={model.bookingUrl} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            {model.heroImageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                <Image
                  src={proxiedHeroImageUrl}
                  fallbackSrc={proxiedHeroImageUrl}
                  alt={model.title}
                  className="h-64 w-full object-cover md:h-80"
                />
              </div>
            ) : null}

            <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
              What you’ll experience
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#405040]">
              {model.longDescription}
            </p>

            {model.highlights.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Highlights
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#405040]">
                  {model.highlights.map(highlight => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2f8a3d]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {model.meetingPoint ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Meeting point
                </h3>
                <p className="mt-3 text-sm text-[#405040]">
                  {[
                    model.meetingPoint.name,
                    model.meetingPoint.address,
                    model.meetingPoint.notes,
                  ]
                    .filter(Boolean)
                    .join(" — ")}
                </p>
              </>
            ) : null}

            {model.itinerary.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Itinerary
                </h3>
                <ul className="mt-3 space-y-3 text-sm text-[#405040]">
                  {model.itinerary.map(stop => (
                    <li key={`${stop.title}-${stop.duration ?? ""}`}>
                      <strong>{stop.title}</strong>
                      {stop.duration ? ` — ${stop.duration}` : ""}
                      {stop.details ? `: ${stop.details}` : ""}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {model.faqs.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  FAQs
                </h3>
                <div className="mt-4 space-y-4">
                  {model.faqs.map(item => (
                    <div
                      key={item.q}
                      className="rounded-xl border border-black/10 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-[#1f2a1f]">
                        {item.q}
                      </p>
                      <p className="mt-2 text-sm text-[#405040]">{item.a}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="space-y-6">
            {model.included?.length || model.notIncluded?.length ? (
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#1f2a1f]">
                  What’s included
                </h3>
                <div className="mt-4 space-y-4 text-sm text-[#405040]">
                  {model.included?.length ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                        Included
                      </p>
                      <ul className="mt-2 space-y-1">
                        {model.included.map(item => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {model.notIncluded?.length ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                        Not included
                      </p>
                      <ul className="mt-2 space-y-1">
                        {model.notIncluded.map(item => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <TourBottomPhotoRow
          imageUrls={proxiedBottomImageUrl ? [proxiedBottomImageUrl] : []}
        />

        <div className="mt-12 text-center">
          <BookItButton href={model.bookingUrl} />
        </div>
      </section>
    </main>
  );
}
