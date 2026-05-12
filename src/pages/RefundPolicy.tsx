import Seo from "../components/Seo";
import { getStaticPageSeo } from "../utils/seo";

const REFUND_ELIGIBILITY_POINTS = [
  "A tour is canceled by the operator.",
  "A booking cannot be fulfilled.",
  "Severe weather or safety conditions prevent operation.",
  "A customer cancels within the allowed cancellation window.",
  "The operator’s policy allows a refund.",
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
              Refund &amp; Cancellation Policy
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              Refund &amp; Cancellation Policy
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
            <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-5">
              <p className="text-sm text-[#405040]">
                All Outdoor Adventures provides travel experiences, guided tours,
                cruises, outdoor activities, and sightseeing reservations. These
                are scheduled services rather than shipped physical merchandise.
              </p>
              <p className="text-sm text-[#405040]">
                Traditional mailed product returns do not apply because no
                physical goods are shipped.
              </p>

              <div>
                <h2 className="text-xl font-semibold text-[#1f2a1f]">
                  Cancellation Policy
                </h2>
                <div className="mt-3 space-y-2 text-sm text-[#405040]">
                  <p>Cancellation eligibility varies by operator and tour.</p>
                  <p>
                    Cancellation windows and refund eligibility are shown before
                    checkout.
                  </p>
                  <p>
                    Some bookings may be non-refundable after confirmation.
                  </p>
                  <p>
                    Operator-specific cancellation rules govern each booking.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#1f2a1f]">
                  Refund Eligibility
                </h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#405040]">
                  {REFUND_ELIGIBILITY_POINTS.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#1f2a1f]">
                  Refund Processing
                </h2>
                <div className="mt-3 space-y-2 text-sm text-[#405040]">
                  <p>Approved refunds are generally processed within 5 business days.</p>
                  <p>Refunds are returned to the original payment method.</p>
                  <p>Processing times may vary by bank or card issuer.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#1f2a1f]">
                  Customer Support
                </h2>
                <div className="mt-3 space-y-2 text-sm text-[#405040]">
                  <p>
                    <a href="mailto:support@alloutdooradventures.com" className="font-medium text-[#2f4a2f] underline">
                      support@alloutdooradventures.com
                    </a>
                  </p>
                  <p>
                    <a href="tel:+18553148687" className="font-medium text-[#2f4a2f] underline">
                      (855) 314-8687
                    </a>
                  </p>
                  <p>Support inquiries are typically answered within 1 business day.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
