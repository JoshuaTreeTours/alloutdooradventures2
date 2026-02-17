import Engine2TourBookingPage from "../../../engine2/pages/Engine2TourBookingPage";
import { getEngine2CanadaTourBySlug, getEngine2CanadaTourByTourSlug } from "../../../engine2/data/loadEngine2";

type Props = { params: { province?: string; city?: string; tourSlug: string } };

export default function CanadaTourBookingRoute({ params }: Props) {
  const tour = params.province && params.city
    ? getEngine2CanadaTourBySlug(params.province, params.city, params.tourSlug)
    : getEngine2CanadaTourByTourSlug(params.tourSlug);
  if (!tour) return <main className="mx-auto max-w-4xl px-6 py-16">Booking not found</main>;
  return <Engine2TourBookingPage tour={tour} />;
}
