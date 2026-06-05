import { useMemo } from "react";
import { Link } from "wouter";

import Image from "../components/Image";
import Seo from "../components/Seo";
import { useStructuredData } from "../components/StructuredDataProvider";
import { getActivityIndexCards } from "../data/activityDiscovery";
import { SITE_BRAND_NAME } from "../utils/site";
import {
  buildBreadcrumbList,
  buildItemList,
  buildWebPageStructuredData,
} from "../utils/structuredData";
import { buildCanonicalUrl } from "../utils/seo";

const PAGE_PATH = "/activities";
const PAGE_TITLE = `Explore Outdoor Activities | ${SITE_BRAND_NAME}`;
const PAGE_DESCRIPTION =
  "Browse outdoor tours by activity type, from hiking and cycling to paddle sports, wildlife, stargazing, food and wine, sailing, air tours, and city sightseeing.";

const formatTourCount = (count: number) =>
  count === 1 ? "1 tour" : `${count} tours`;

export default function ActivitiesIndex() {
  const activityCards = useMemo(() => getActivityIndexCards(), []);
  const heroImage =
    activityCards.find(card => card.image)?.image ?? "/hero.jpg";
  const canonicalUrl = buildCanonicalUrl(PAGE_PATH);

  const structuredDataNodes = useMemo(
    () => [
      buildBreadcrumbList([{ name: "Activities", url: PAGE_PATH }]),
      buildWebPageStructuredData({
        url: canonicalUrl,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        image: heroImage,
        mainEntityId: `${canonicalUrl}#activity-list`,
      }),
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#activity-list`,
        name: "Outdoor activity tour categories",
        description: PAGE_DESCRIPTION,
        url: canonicalUrl,
        hasPart: activityCards.map(card => ({
          "@type": "CollectionPage",
          name: card.label,
          description: card.description,
          url: card.href,
          numberOfItems: card.tourCount,
          ...(card.image ? { image: card.image } : {}),
        })),
      },
      buildItemList(
        activityCards.map(card => ({
          name: card.label,
          url: card.href,
          image: card.image ? [card.image] : undefined,
        }))
      ),
    ],
    [activityCards, canonicalUrl, heroImage]
  );

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        url={PAGE_PATH}
        image={heroImage}
      />
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        {heroImage ? (
          <Image
            src={heroImage}
            fallbackSrc={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-white md:py-24">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
              Activity discovery
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Explore Outdoor Activities
            </h1>
            <p className="text-base leading-7 text-white/90 md:text-lg">
              Browse tours by activity type and jump into crawlable activity
              tour pages for hiking, cycling, paddling, wildlife watching, air
              tours, food and wine experiences, city sightseeing, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7a8a6b]">
              {activityCards.length} activity categories
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Find tours by the way you like to explore
            </h2>
          </div>
          <Link
            href="/tours"
            className="text-sm font-semibold text-[#2f4a2f] underline underline-offset-4"
          >
            View all tours
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activityCards.map(card => (
            <Link
              key={card.slug}
              href={card.href}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#d8cdbb]">
                {card.image ? (
                  <Image
                    src={card.image}
                    fallbackSrc={card.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4a2f]">
                  {formatTourCount(card.tourCount)}
                </span>
              </div>
              <div className="space-y-3 p-6">
                <h3 className="text-xl font-semibold text-[#1f2a1f]">
                  {card.label}
                </h3>
                <p className="text-sm leading-6 text-[#405040]">
                  {card.description}
                </p>
                <span className="inline-flex text-sm font-semibold text-[#2f4a2f]">
                  Explore {card.label} tours →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
