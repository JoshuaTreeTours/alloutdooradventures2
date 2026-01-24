import { Link } from "wouter";

export default function Contact() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Contact
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Contact Outdoor Adventures
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        All Outdoor Adventures is a Santa Barbara–based service business
        offering curated tours and custom journeys worldwide.
      </p>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        We design custom journeys, private group experiences, and multi-day
        adventures tailored to your pace and interests. Tell us what you&apos;re
        dreaming about, and we&apos;ll build a plan around it.
        {" "}
        All Outdoor Adventures is a Santa Barbara–based service business
        offering curated tours and custom journeys worldwide.
      </p>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2f4a2f]">Call us</h2>
          <p className="mt-2 text-sm text-[#405040]">
            Speak with our travel team weekdays from 8am–6pm PT.
          </p>
          <a
            href="tel:+18553148687"
            className="mt-4 inline-flex items-center rounded-full border border-[#2f4a2f]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
          >
            855-314-TOUR
          </a>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2f4a2f]">Email Us</h2>
          <p className="mt-2 text-sm text-[#405040]">
            Send us the dates, group size, and your must-see highlights.
          </p>
          <a
            href="mailto:jerry@alloutdooradventures.com"
            className="mt-4 inline-flex items-center text-sm font-semibold text-[#2f4a2f] underline"
          >
            Email us
          </a>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-[#2f4a2f]">
          What happens next
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-[#405040]">
          <li>• A planning specialist reviews your request within 1 business day.</li>
          <li>• We curate a short list of trusted guides and partners.</li>
          <li>• You receive a tailored itinerary with clear pricing and timing.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/journeys">
            <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Explore Journeys
            </a>
          </Link>
          <Link href="/tours">
            <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Browse Tours
            </a>
          </Link>
        </div>
      </section>
    </main>
  );
}
