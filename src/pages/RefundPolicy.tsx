import Seo from "../components/Seo";
import { getStaticPageSeo } from "../utils/seo";

const POLICY_POINTS = [
  "a tour or activity is canceled by the operator",
  "a booking cannot be fulfilled",
  "severe weather or safety conditions prevent operation",
  "a customer cancels within the cancellation window shown at checkout",
  "the specific operator policy for that experience allows a refund",
];

export default function RefundPolicy() {
  const seo = getStaticPageSeo("/refund-policy");

  return (
    <>
      {seo ? (
        <Seo
          title={seo.title}
          description={seo.description}
          url={seo.url}
          image={seo.image}
        />
      ) : null}
      <main className="bg-[#f6f1e8] text-[#1f2a1f]">
        <section className="bg-[#2f4a2f] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Refund Policy
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              Booking Cancellation &amp; Refund Policy
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <p className="text-sm text-[#405040]">
                All Outdoor Adventures offers bookings for guided tours, cruises,
                sightseeing experiences, outdoor adventures, and activity
                reservations. These experiences are scheduled services, not
                physical goods.
              </p>
              <p className="mt-3 text-sm text-[#405040]">
                Because tours and activities are scheduled experiences, we do not
                accept physical product returns or exchanges.
              </p>
              <p className="mt-3 text-sm text-[#405040]">
                Refunds may be available when:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#405040]">
                {POLICY_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-[#405040]">
                Some tours and activities may be non-refundable once booked.
                Cancellation rules vary by tour and are shown on each product
                page, during checkout, or by the booking provider before
                purchase.
              </p>
              <p className="mt-3 text-sm text-[#405040]">
                Customers requesting a cancellation, booking change, or refund
                review should contact customer support as soon as possible and
                include their name, tour date, booking reference, and the
                experience purchased.
              </p>
              <p className="mt-3 text-sm text-[#405040]">
                Approved refunds are generally processed within 5 business days
                after approval, though the time for funds to appear may depend
                on the customer&rsquo;s payment provider.
              </p>
              <p className="mt-3 text-sm text-[#405040]">
                We do not accept returns by mail because our products are tour
                bookings and scheduled experiences rather than shipped physical
                goods.
              </p>
              <p className="mt-3 text-sm text-[#405040]">For questions, contact:</p>
              <p className="mt-1 text-sm text-[#405040]">
                <a
                  href="mailto:support@alloutdooradventures.com"
                  className="font-medium text-[#2f4a2f] underline"
                >
                  support@alloutdooradventures.com
                </a>
              </p>
              <p className="mt-2 text-sm text-[#405040]">or call:</p>
              <p className="mt-1 text-sm text-[#405040]">
                <a
                  href="tel:+18553148687"
                  className="font-medium text-[#2f4a2f] underline"
                >
                  (855) 314-8687
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
