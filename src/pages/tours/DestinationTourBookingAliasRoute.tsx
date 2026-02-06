import RouteRedirect from "../../components/RouteRedirect";
import ListingUnavailable from "../../components/ListingUnavailable";
import { extractIdFromSlug } from "../../lib/routing/extractId";
import { getTourById } from "../../lib/tours/getTourById";

type DestinationTourBookingAliasRouteProps = {
  params: {
    tourSlug: string;
  };
};

export default function DestinationTourBookingAliasRoute({
  params,
}: DestinationTourBookingAliasRouteProps) {
  const id = extractIdFromSlug(params.tourSlug);
  const tour = id ? getTourById(id) : null;

  if (!tour) {
    return <ListingUnavailable statusCode={410} />;
  }

  return (
    <RouteRedirect
      to={`/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}/book`}
    />
  );
}
