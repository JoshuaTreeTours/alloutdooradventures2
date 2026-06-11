import { useEffect, useMemo } from "react";
import { Link } from "wouter";

import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import {
  buildBreadcrumbList,
  getSiteStructuredDataNodes,
} from "../../utils/structuredData";
import BookingCtaLink from "../../components/BookingCtaLink";
import type { Engine2Tour } from "../data/loadEngine2";
import { buildEngine2Seo } from "../seo/buildEngine2Seo";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../utils/buildFareHarborUrl";
import {
  OPT_OUT_OPERATOR_SLUGS,
  recordBlockedFareharborEmbed,
} from "../../utils/fareharbor/optOutOperators";
import { resolveInternationalGuideBreadcrumb } from "../../utils/guides/internationalGuideBreadcrumbs";

type Engine2TourBookingPageProps = {
  tour: Engine2Tour;
};

export const getDestinationBreadcrumbs = (tour: Engine2Tour) => {
  if (tour.sourceCountrySlug === "canada") {
    return [
      { name: "Canada", url: "/destinations/world/canada" },
      {
        name: tour.geo.region,
        url: `/destinations/world/canada/${tour.sourceProvinceSlug}`,
      },
      {
        name: tour.geo.city,
        url: `/destinations/world/canada/${tour.sourceProvinceSlug}/${tour.sourceCitySlug}`,
      },
    ];
  }

  if (tour.sourceCountrySlug === "mexico") {
    return [
      { name: "Mexico", url: "/destinations/mexico" },
      {
        name: tour.geo.city,
        url: `/destinations/mexico/${tour.sourceCitySlug}`,
      },
      {
        name: "Tours",
        url: `/destinations/mexico/${tour.sourceCitySlug}/tours`,
      },
    ];
  }

  if (tour.sourceCountrySlug && tour.sourceCountrySlug !== "united-states") {
    const safeGuideBreadcrumb = resolveInternationalGuideBreadcrumb({
      countrySlug: tour.sourceCountrySlug,
      citySlug: tour.sourceCitySlug,
      countryName: tour.geo.country,
      cityName: tour.geo.city,
    });
    const destinationPath = `/destinations/${tour.sourceCountrySlug}/${tour.sourceCitySlug}`;
    const destinationCrumbs = safeGuideBreadcrumb
      ? [safeGuideBreadcrumb]
      : [
          {
            name: tour.geo.country,
            url: `/destinations/${tour.sourceCountrySlug}`,
          },
          {
            name: tour.geo.city,
            url: destinationPath,
          },
        ];

    return [
      ...destinationCrumbs,
      {
        name: "Tours",
        url: `${destinationPath}/tours`,
      },
    ];
  }

  return [
    { name: "California", url: "/destinations/california" },
    {
      name: tour.geo.city,
      url: `/destinations/california/${tour.sourceCitySlug}`,
    },
    {
      name: "Tours",
      url: `/destinations/california/${tour.sourceCitySlug}/tours`,
    },
  ];
};

export default function Engine2TourBookingPage({
  tour,
}: Engine2TourBookingPageProps) {
  const isRental = tour.type === "rental";
  const seo = useMemo(() => buildEngine2Seo(tour), [tour]);
  const bookingArgs = tour.booking.fareharbor;
  const fareharborOperatorSlug = bookingArgs?.shortname ?? null;
  const isBlockedFareharborEmbed =
    !!fareharborOperatorSlug &&
    OPT_OUT_OPERATOR_SLUGS.has(fareharborOperatorSlug);

  const generatedCalendarUrl = bookingArgs
    ? buildFareHarborUrl({
        company: bookingArgs.shortname,
        itemId: bookingArgs.itemId,
        calendarPath: tour.bookingUrl ?? tour.booking.bookingUrl,
      })
    : normalizeFareHarborUrl(tour.bookingUrl ?? tour.booking.bookingUrl);
  const iframeUrl = isBlockedFareharborEmbed ? "" : generatedCalendarUrl;
  const fallbackUrl = generatedCalendarUrl;

  useEffect(() => {
    if (!isBlockedFareharborEmbed || !fareharborOperatorSlug) {
      return;
    }

    recordBlockedFareharborEmbed(fareharborOperatorSlug);
  }, [fareharborOperatorSlug, isBlockedFareharborEmbed]);

  const structuredDataNodes = useMemo(
    () => [
      ...getSiteStructuredDataNodes(),
      buildBreadcrumbList([
        { name: "Destinations", url: "/destinations" },
        ...getDestinationBreadcrumbs(tour),
        { name: tour.name, url: tour.seo.canonicalPath },
        { name: "Book", url: `${tour.seo.canonicalPath}/book` },
      ]),
      {
        "@type": "Product",
        "@id": `${seo.canonical}/book#product`,
        name: `${tour.name} booking`,
        description: isRental
          ? `Reserve ${tour.name} rental in ${tour.geo.city}, ${tour.geo.region}.`
          : `Book ${tour.name} in ${tour.geo.city}, ${tour.geo.region}.`,
        ...(isRental ? { category: "EquipmentRental" } : {}),
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
    [isRental, seo.canonical, seo.og.image, tour]
  );

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={`${seo.title} | Book`}
        description={
          isRental
            ? `Reserve ${tour.name} rental in ${tour.geo.city}, ${tour.geo.region}.`
            : `Book ${tour.name} in ${tour.geo.city}, ${tour.geo.region}.`
        }
        url={`${seo.canonical}/book`}
        image={seo.og.image}
        robots="noindex,follow,max-image-preview:large"
        googlebot="noindex,follow,max-image-preview:large"
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {isRental ? "Equipment Rental" : "Booking"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            {tour.name}
          </h1>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        {isRental ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1f2a1f]">
              Equipment Rental
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#405040]">
              <li>Self-guided experience — explore at your own pace.</li>
              <li>Flexible duration options are available at checkout.</li>
              <li>Pickup details and rental terms are shown before payment.</li>
            </ul>
          </div>
        ) : null}

        {isBlockedFareharborEmbed ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1f2a1f]">
              Unavailable
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              This operator is temporarily unavailable through our embedded
              booking flow.
            </p>
            <Link href={tour.seo.canonicalPath}>
              <a className="mt-4 inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#f2ebe0]">
                Back to tour details
              </a>
            </Link>
          </div>
        ) : (
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
        )}

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
