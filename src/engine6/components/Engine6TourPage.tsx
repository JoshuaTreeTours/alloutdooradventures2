import { useEffect, useState } from "react";
import { Link } from "wouter";

import Seo from "../../components/Seo";
import {
  ENGINE6_PILOT_CANONICAL_PATH,
  ENGINE6_PILOT_PRODUCT_CODE,
} from "../routes";
import type { Engine6PageData } from "../types";
import { getEngine6ViatorTourData } from "../viator/getEngine6ViatorTourData";
import { mapViatorToEngine6PageData } from "../viator/mapViatorToEngine6PageData";
import Engine6FactsCard from "./Engine6FactsCard";
import Engine6FaqSection from "./Engine6FaqSection";
import Engine6IncludedSection from "./Engine6IncludedSection";
import Engine6ItinerarySection from "./Engine6ItinerarySection";

export default function Engine6TourPage() {
  const [page, setPage] = useState<Engine6PageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await getEngine6ViatorTourData();
        const mapped = mapViatorToEngine6PageData(payload);
        if (mounted) {
          setPage(mapped);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message ?? "Unable to load pilot tour.");
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Engine6 Pilot Unavailable</h1>
        <p className="mt-3 text-red-700">{error}</p>
        <p className="mt-2 text-sm text-[#334433]">
          Pilot product code: {ENGINE6_PILOT_PRODUCT_CODE}
        </p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p>Loading Hilo pilot tour details…</p>
      </main>
    );
  }

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={page.seo.title}
        description={page.seo.description}
        url={page.seo.canonical}
        image={page.seo.ogImage}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <nav className="text-xs text-white/80">
              <Link href="/destinations">
                <a>Destinations</a>
              </Link>{" "}
              / Hawaii / Hilo
            </nav>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/75">
              Hilo, Hawaii
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {page.title}
            </h1>
            <Engine6FactsCard
              fromPrice={page.fromPrice}
              currency={page.currency}
              ratingValue={page.ratingValue}
              reviewCount={page.reviewCount}
              meetingPoint={page.meetingPointShort}
              duration={page.durationText}
              cancellation={page.cancellationText}
            />
            <a
              href={page.bookingUrl ?? "https://www.viator.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            >
              Book This Tour
            </a>
          </div>
          <img
            src={page.heroImage || undefined}
            alt={page.title}
            className="h-80 w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-3 leading-7 text-[#334433]">{page.overview}</p>

        {page.highlights.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Highlights</h2>
            <ul className="mt-3 list-disc pl-6 text-[#334433]">
              {page.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        <Engine6IncludedSection
          inclusions={page.inclusions}
          exclusions={page.exclusions}
        />

        {page.additionalInfo.length ? (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Good to Know / Additional Info</h2>
            <ul className="mt-3 list-disc pl-6 text-[#334433]">
              {page.additionalInfo.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Meeting &amp; Pickup</h2>
          <p className="mt-3 text-[#334433]">{page.meetingPointFull}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Cancellation Policy</h2>
          <p className="mt-3 text-[#334433]">{page.cancellationText}</p>
        </section>

        <Engine6ItinerarySection itinerary={page.itinerary} />
        <Engine6FaqSection faqs={page.faqs} />

        <details className="mt-10 rounded-lg bg-white p-3 text-xs">
          <summary>Engine6 pilot field-path debug</summary>
          <p className="mt-2">price: {page.fieldPathAudit.pricePath}</p>
          <p>rating: {page.fieldPathAudit.ratingPath}</p>
          <p>reviews: {page.fieldPathAudit.reviewCountPath}</p>
          <p>itinerary: {page.fieldPathAudit.itineraryPath}</p>
          <p>canonical: {ENGINE6_PILOT_CANONICAL_PATH}</p>
        </details>
      </section>
    </main>
  );
}
