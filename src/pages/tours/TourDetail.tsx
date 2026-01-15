import { Link } from "wouter";

import Image from "../../components/Image";
import { getTourBySlug } from "../../data/tourRegistry";

type TourDetailProps = {
  params: {
    destination: string;
    slug: string;
  };
};

export default function TourDetail({ params }: TourDetailProps) {
  const tour = getTourBySlug(params.destination, params.slug);

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

  const destinationLabel = tour.destination
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Link href={`/destinations/${tour.destination}`}>
          <a className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Back to {destinationLabel}
          </a>
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm">
              <Image
                src={tour.image}
                fallbackSrc="/hero.jpg"
                alt={tour.title}
                className="h-72 w-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                {tour.categories.join(" • ")}
              </p>
              <h1 className="text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
                {tour.title}
              </h1>
              <p className="text-sm text-[#405040] md:text-base">
                {tour.blurb}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1f2a1f]">
              Ready to book?
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              Book instantly through our Viator partner link. You’ll be taken to
              the official booking page for availability and pricing.
            </p>
            <a
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f4a2f] px-6 py-3 text-sm font-semibold text-white"
              href={tour.outboundUrl}
              rel="noreferrer"
              target="_blank"
            >
              Book now
            </a>
            <div className="mt-6 rounded-xl border border-dashed border-black/10 bg-white/60 p-4 text-xs text-[#405040]">
              Viator product code:{" "}
              <span className="font-semibold">{tour.viatorProductCode}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
