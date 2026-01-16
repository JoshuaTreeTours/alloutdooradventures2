import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ADVENTURE_ACTIVITY_PAGES } from "../../../data/tourCatalog";

const canoeing = ADVENTURE_ACTIVITY_PAGES.find(
  (activity) => activity.slug === "canoeing"
);

export default function CanoeingTours() {
  if (!canoeing) {
    return null;
  }

  return (
    <ActivityCatalogTemplate
      title={canoeing.title}
      description={canoeing.description}
      image={canoeing.image}
      activitySlug={canoeing.slug}
    />
  );
}
