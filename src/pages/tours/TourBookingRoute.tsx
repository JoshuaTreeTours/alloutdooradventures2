import { useMemo } from "react";
import { Link } from "wouter";

import ListingUnavailable from "../../components/ListingUnavailable";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { buildBookingEmbedUrl } from "../../lib/booking/buildBookingEmbedUrl";
import { getTourById } from "../../lib/tours/getTourById";
import { extractIdFromSlug } from "../../lib/routing/extractId";
import { buildMetaDescription } from "../../utils/seo";
import {
  buildReserveActionStructuredData,
  buildWebPageStructuredData,
} from "../../utils/structuredData";

type TourBookingRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    slug: string;
  };
};

export default function TourBookingRoute({ params }: TourBookingRouteProps) {
  const id = extractIdFromSlug(params.slug);
  const tour = id ? getTourById(id) : null;

  if (!tour) {
    return <ListingUnavailable statusCode={410} />;
  }

  const bookingEmbedUrl = buildBookingEmbedUrl(tour);

  if (!bookingEmbedUrl) {
    return <ListingUnavailable statusCode={410} />;
  }

  const detailUrl = `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`;
  const bookingUrl = `${detailUrl}/book`;
  const metaDescription = buildMetaDescription(
    `Reserve ${tour.title} in ${tour.destination.city}, ${tour.destination.state}.`,
    tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
  );

  const structuredDataNodes = useMemo(
    () => [
      buildWebPageStructuredData({
        url: bookingUrl,
        name: `${tour.title} booking`,
        description: metaDescription,
      }),
      buildReserveActionStructuredData({
        bookingUrl,
        tourDetailUrl: detailUrl,
        tourName: tour.title,
      }),
    ],
    [bookingUrl, detailUrl, metaDescription, tour.title],
  );

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] px-6 py-12 text-[#1f2a1f]">
      <Seo
        title={`${tour.title} Booking | All Outdoor Adventures`}
        description={metaDescription}
        url={bookingUrl}
      />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">{tour.title}</h1>
        <p className="mt-3 text-sm text-[#405040]">
          Reserve your spot below. If the embed does not load, use the direct booking link.
        </p>
        <div className="mt-4">
          <a className="text-sm font-semibold underline" href={bookingEmbedUrl} target="_blank" rel="noreferrer">
            Open booking in a new tab
          </a>
          <span className="mx-2">·</span>
          <Link href={detailUrl}>
            <a className="text-sm font-semibold underline">Back to tour details</a>
          </Link>
        </div>
        <div className="mt-6 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <iframe
            title={`${tour.title} booking`}
            src={bookingEmbedUrl}
            className="h-[820px] w-full rounded-lg border-0"
            allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
          />
        </div>
      </div>
    </main>
  );
}
