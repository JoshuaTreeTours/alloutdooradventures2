import Seo from "../../components/Seo";
import type { Engine6PageData } from "../types";
import Engine6FactsCard from "./Engine6FactsCard";
import Engine6FaqSection from "./Engine6FaqSection";
import Engine6IncludedSection from "./Engine6IncludedSection";
import Engine6ItinerarySection from "./Engine6ItinerarySection";

type Props = { data: Engine6PageData };

const BOOK_CTA_CLASSES =
  "inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]";

export default function Engine6TourPage({ data }: Props) {
  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={data.seo.title}
        description={data.seo.description}
        url={data.seo.canonical}
        image={data.seo.ogImage}
      />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              Santa Barbara, California
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{data.title}</h1>
            <Engine6FactsCard data={data} />
            <a href="#book" className={`mt-6 ${BOOK_CTA_CLASSES}`}>
              Check Availability
            </a>
          </div>
          <img
            src={data.heroImage}
            alt={data.title}
            className="h-80 w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-3 leading-7 text-[#334433]">{data.overview}</p>

        {data.highlights.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {data.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        <Engine6IncludedSection data={data} />

        {data.additionalInfo.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Good to Know / Additional Info</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {data.additionalInfo.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {data.meetingPointFull ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Meeting &amp; Pickup</h2>
            <p className="mt-3 text-[#334433]">{data.meetingPointFull}</p>
          </>
        ) : null}

        {data.cancellationText ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Cancellation Policy</h2>
            <p className="mt-3 text-[#334433]">{data.cancellationText}</p>
          </>
        ) : null}

        <Engine6ItinerarySection data={data} />
        <Engine6FaqSection data={data} />

        <div id="book" className="mt-10 text-center">
          <a
            href={`https://www.viator.com/tours/Santa-Barbara/Epic-Zipline-Tour-Over-The-Santa-Ynez-Valley/d4372-${data.productCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className={BOOK_CTA_CLASSES}
          >
            Book This Tour
          </a>
        </div>
      </section>
    </main>
  );
}
