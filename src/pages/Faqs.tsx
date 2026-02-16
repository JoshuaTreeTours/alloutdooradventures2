import { useLayoutEffect } from "react";

import Seo from "../components/Seo";
import { SITE_BRAND_NAME } from "../utils/site";
import { getStaticPageSeo } from "../utils/seo";

const RETURN_POLICY_SCHEMA_ID = "merchant-return-policy-schema";

const RETURN_POLICY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "MerchantReturnPolicy",
  name: "All Outdoor Adventures Return Policy",
  url: "https://www.alloutdooradventures.com/faqs",
  returnPolicyCategory:
    "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 1,
  returnFees: "https://schema.org/FreeReturn",
  refundType: "https://schema.org/FullRefund",
  returnMethod: "https://schema.org/ReturnByMail",
};

const FAQ_SECTIONS = [
  {
    title: "Planning & Booking",
    items: [
      {
        question: "How do I book a tour?",
        answer:
          "Select a tour and choose your date on the booking page. Availability and pricing are shown in real time before you confirm.",
      },
      {
        question: "Do I pay more by booking here?",
        answer:
          "No. You book directly through our partner operators at their listed prices.",
      },
      {
        question: "What happens after I book?",
        answer:
          "You receive a confirmation from the tour operator with meeting details, what to bring, and contact information.",
      },
    ],
  },
  {
    title: "Cancellations & Changes",
    items: [
      {
        question: "What if I need to change my reservation?",
        answer:
          "Changes are handled by the tour operator. Use the confirmation email to contact them directly for rescheduling options.",
      },
      {
        question: "What if the weather is bad?",
        answer:
          "Operators will advise on weather-related changes and safety decisions. If a tour is affected, they will contact you with next steps.",
      },
      {
        question: "Can I cancel my booking?",
        answer:
          "Cancellation policies vary by operator. Review the policy shown at checkout and in your confirmation email.",
      },
    ],
  },
  {
    title: "Tours & Safety",
    items: [
      {
        question: "Are tours suitable for beginners?",
        answer:
          "Many tours are beginner-friendly and list experience levels. Check the tour details and activity notes before booking.",
      },
      {
        question: "Who runs the tours?",
        answer:
          `Tours are operated by vetted local partners. ${SITE_BRAND_NAME} provides the planning hub and booking access.`,
      },
      {
        question: "Is equipment included?",
        answer:
          "It depends on the tour. Most guided experiences include essential gear, with specifics listed in the tour details.",
      },
    ],
  },
  {
    title: "International Travel",
    items: [
      {
        question: "Do you offer tours outside the U.S.?",
        answer:
          "Yes. We list international tours where trusted operators have availability.",
      },
      {
        question: "Are tours available year-round?",
        answer:
          "Seasonality varies by destination and activity. Check the live calendar on each tour page for current availability.",
      },
      {
        question: "Do I need travel insurance?",
        answer:
          "Travel insurance is optional, but it can help cover unexpected changes. Review your coverage options based on your trip.",
      },
    ],
  },
];

export default function Faqs() {
  const seo = getStaticPageSeo("/faqs");

  useLayoutEffect(() => {
    let script = document.head.querySelector<HTMLScriptElement>(
      `script#${RETURN_POLICY_SCHEMA_ID}`,
    );

    if (!script) {
      script = document.createElement("script");
      script.id = RETURN_POLICY_SCHEMA_ID;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.text = JSON.stringify(RETURN_POLICY_SCHEMA);
  }, []);

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
              FAQs
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              Travel & Booking Questions
            </h1>
            <p className="max-w-3xl text-sm text-white/90 md:text-base">
              Clear answers to common planning questions so you can book with
              confidence.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-8">
            {FAQ_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10"
              >
                <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-6 grid gap-4">
                  {section.items.map((item) => (
                    <div
                      key={item.question}
                      className="rounded-2xl border border-black/5 bg-white p-5"
                    >
                      <h3 className="text-base font-semibold text-[#1f2a1f]">
                        {item.question}
                      </h3>
                      <p className="mt-2 text-sm text-[#405040]">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
              <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
                Returns &amp; Refund Policy
              </h2>
              <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5">
                <p className="text-sm text-[#405040]">
                  All Outdoor Adventures sells tour experiences and activity
                  bookings.
                </p>
                <p className="mt-3 text-sm text-[#405040]">
                  Because tours are scheduled services rather than physical
                  goods, we do not accept product returns or exchanges.
                </p>
                <p className="mt-3 text-sm text-[#405040]">
                  Refunds may be issued only in the following situations:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#405040]">
                  <li>If a tour is cancelled by the operator</li>
                  <li>If a booking cannot be fulfilled</li>
                  <li>If a service is defective or unavailable</li>
                </ul>
                <p className="mt-3 text-sm text-[#405040]">
                  Customers should contact support within 24 hours of booking
                  for assistance. Refunds are processed within 5 business days
                  when approved.
                </p>
                <p className="mt-3 text-sm text-[#405040]">
                  For booking changes or cancellations, please refer to the
                  cancellation terms shown at checkout for each tour.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
