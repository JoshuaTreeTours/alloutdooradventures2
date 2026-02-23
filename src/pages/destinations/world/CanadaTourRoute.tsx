import Engine2TourPage from "../../../engine2/pages/Engine2TourPage";
import { getEngine2CanadaTourBySlug } from "../../../engine2/data/loadEngine2";

type Props = { params: { province: string; city: string; tourSlug: string } };

export default function CanadaTourRoute({ params }: Props) {
  const tour = getEngine2CanadaTourBySlug(
    params.province,
    params.city,
    params.tourSlug
  );
  if (!tour)
    return <main className="mx-auto max-w-4xl px-6 py-16">Tour not found</main>;
  return <Engine2TourPage tour={tour} isPspBookRewriteEnabled={false} />;
}
