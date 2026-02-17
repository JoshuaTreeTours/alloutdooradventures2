import { useMemo } from "react";
import { Link } from "wouter";

import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { buildBreadcrumbList, getSiteStructuredDataNodes } from "../../utils/structuredData";
import BookingCtaLink from "../../components/BookingCtaLink";
import type { Engine2Tour } from "../data/loadEngine2";
import { buildEngine2Seo } from "../seo/buildEngine2Seo";
import { buildFareHarborUrl, normalizeFareHarborUrl } from "../utils/buildFareHarborUrl";

type Engine2TourBookingPageProps = {
  tour: Engine2Tour;
};

export default function Engine2TourBookingPage({
  tour,
}: Engine2TourBookingPageProps) {
  const cityHubPath = tour.seo.canonicalPath.replace(/\/tours\/[^/]+$/, "");
  const provinceHubPath = cityHubPath.split("/").slice(0, -1).join("/");
  const countryHubPath = provinceHubPath.split("/").slice(0, -1).join("/");
  const seo = useMemo(() => buildEngine2Seo(tour), [tour]);
  const bookingArgs = tour.booking.fareharbor;

  const generatedCalendarUrl = bookingArgs
    ? buildFareHarborUrl({
        company: bookingArgs.shortname,
        itemId: bookingArgs.itemId,
        calendarPath: tour.booking.bookingUrl,
      })
    : normalizeFareHarborUrl(tour.booking.bookingUrl);
  const iframeUrl = generatedCalendarUrl;
  const fallbackUrl = generatedCalendarUrl;

  const structuredDataNodes = useMemo(
    () => [
      ...getSiteStructuredDataNodes(),
      {
        "@type": "Organization",
        "@id": `${seo.canonical}/book#provider`,
        name: tour.provider.name,
      },
      buildBreadcrumbList([
        { name: "Destinations", url: "/destinations" },
        { name: tour.geo.country === "canada" ? "Canada" : tour.geo.region, url: countryHubPath },
        { name: tour.geo.region, url: provinceHubPath },
        { name: tour.geo.city, url: cityHubPath },
        { name: "Tours", url: `${cityHubPath}/tours` },
        { name: tour.name, url: tour.seo.canonicalPath },
        { name: "Book", url: `${tour.seo.canonicalPath}/book` },
      ]),
      {
        "@type": "Product",
        "@id": `${seo.canonical}/book#product`,
        name: `${tour.name} booking`,
        description: `Book ${tour.name} in ${tour.geo.city}, ${tour.geo.region}.`,
        image: [seo.og.image],
        offers: {
          "@type": "Offer",
          url: `${seo.canonical}/book`,
          availability: "https://schema.org/InStock",
          price: tour.pricing?.price ?? "129.00",
          priceCurrency: tour.pricing?.currency ?? "USD",
        },
      },
    ],
    [cityHubPath, countryHubPath, provinceHubPath, seo.canonical, seo.og.image, tour]
  );

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={`${seo.title} | Book`}
        description={`Book ${tour.name} in ${tour.geo.city}, ${tour.geo.region}.`}
        url={`${seo.canonical}/book`}
        image={seo.og.image}
        robots="noindex,follow,max-image-preview:large"
        googlebot="noindex,follow,max-image-preview:large"
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Booking
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            {tour.name}
          </h1>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
          <iframe
            title={`${tour.name} booking`}
            src={iframeUrl}
            className="h-[720px] w-full rounded-xl border-0 md:h-[820px]"
            allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            loading="lazy"
          />
        </div>

        <div className="rounded-2xl border border-dashed border-[#2f4a2f]/30 bg-white/80 p-6 text-[#1f2a1f]">
          <p className="text-sm text-[#405040]">
            Having trouble with the embed? Open the booking page in a new tab.
          </p>
          <BookingCtaLink
            className="mt-4 inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            href={fallbackUrl}
          >
            BOOK
          </BookingCtaLink>
          <Link href={tour.seo.canonicalPath}>
            <a className="mt-4 inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#f2ebe0]">
              Back to tour details
            </a>
          </Link>
        </div>
      </section>
    </main>
  );
}
