import Seo from "../components/Seo";
import { buildMetaDescription } from "../utils/seo";

export default function Privacy() {
  const title = "Privacy Policy | All Outdoor Adventures";
  const description = buildMetaDescription(
    "Read how All Outdoor Adventures collects, uses, and protects your information when you browse destinations or book tours.",
    "Learn about data handling, cookies, and privacy choices for travelers planning outdoor experiences with our partners.",
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <Seo title={title} description={description} url="/privacy" />
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Privacy Policy
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Privacy at Outdoor Adventures
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        We respect your privacy and handle your information with care. This
        policy explains what we collect, how we use it, and the choices you
        have when planning outdoor experiences with us.
      </p>

      <section className="mt-10 space-y-6 text-sm text-[#405040] md:text-base">
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Information we collect
          </h2>
          <p className="mt-2">
            We collect the details you provide when requesting a tour or
            subscribing to updates, such as your name, email, phone number,
            trip preferences, and travel dates. We also receive booking details
            from trusted partners like FareHarbor or Viator to confirm your
            reservation.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Cookies &amp; analytics
          </h2>
          <p className="mt-2">
            We use cookies and analytics tools to understand how visitors use
            the site, improve performance, and personalize recommendations. You
            can adjust cookie preferences in your browser settings at any time.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            How we use your data
          </h2>
          <p className="mt-2">
            Your information helps us respond to inquiries, tailor trip
            proposals, communicate confirmations, and deliver customer support.
            We only share data with booking partners or service providers when
            it is necessary to fulfill your request.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Your choices
          </h2>
          <p className="mt-2">
            You can request access, updates, or deletion of your information by
            contacting us at privacy@alloutdooradventures.com. We honor all
            applicable data protection laws and respond within a reasonable
            timeframe.
          </p>
        </div>
      </section>
    </main>
  );
}
