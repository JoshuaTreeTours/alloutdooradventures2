import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import BookingCtaLink from "../../components/BookingCtaLink";
import { useStructuredData } from "../../components/StructuredDataProvider";
import type { Engine2Tour } from "../data/loadEngine2";
import { buildSchemaGraph } from "../schema/buildSchemaGraph";

type Engine2TourPageProps = {
  tour: Engine2Tour;
};

export default function Engine2TourPage({ tour }: Engine2TourPageProps) {
  useStructuredData(buildSchemaGraph(tour));

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={tour.seo.title}
        description={tour.seo.description}
        url={tour.seo.canonicalPath}
        image={tour.images.hero}
      />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {tour.geo.city}, {tour.geo.region}
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{tour.name}</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
            Operated by {tour.provider.name}
          </p>
          <div className="mt-6 flex gap-3">
            <BookingCtaLink
              href={tour.booking.regularLink}
              className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            >
              BOOK
            </BookingCtaLink>
            <Link href="/destinations/california/palm-springs/tours">
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to tours
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <Image
            src={tour.images.hero}
            fallbackSrc={tour.images.hero}
            alt={tour.name}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">What you'll experience</h2>
        <p className="mt-4 text-sm leading-relaxed text-[#405040]">{tour.content.experienceText}</p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[#405040]">
          {tour.content.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        {tour.images.gallery.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tour.images.gallery.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <Image
                  src={image}
                  fallbackSrc={image}
                  alt={`${tour.name} gallery`}
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
