import Seo from "../components/Seo";
import { buildMetaDescription } from "../utils/seo";

export default function Disclosure() {
  const title = "Affiliate Disclosure | All Outdoor Adventures";
  const description = buildMetaDescription(
    "Read our affiliate disclosure to understand how All Outdoor Adventures partners with tour operators and booking platforms.",
    "Learn how affiliate links support curated outdoor experiences and transparent tour recommendations.",
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <Seo title={title} description={description} url="/disclosure" />
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Disclosure
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Affiliate &amp; Partner Disclosure
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        Outdoor Adventures curates tours and experiences from trusted partners.
        When you book through links on our site, we may earn a commission at no
        additional cost to you. This helps us keep our guides and planning
        resources free.
      </p>

      <section className="mt-10 space-y-6 text-sm text-[#405040] md:text-base">
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Booking partners
          </h2>
          <p className="mt-2">
            We work with platforms such as FareHarbor, Viator, and other vetted
            operators to process reservations. Your booking is completed on
            their secure systems, and their policies apply to payments,
            cancellations, and refunds.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Editorial independence
          </h2>
          <p className="mt-2">
            We prioritize experiences that align with our values—small groups,
            knowledgeable guides, and memorable locations. Partner
            relationships do not influence our editorial recommendations.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Questions
          </h2>
          <p className="mt-2">
            If you have questions about our partnerships, contact us at
            hello@alloutdooradventures.com.
          </p>
        </div>
      </section>
    </main>
  );
}
