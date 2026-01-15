import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ADVENTURE_ACTIVITY_PAGES } from "../../../data/tourCatalog";

const cycling = ADVENTURE_ACTIVITY_PAGES.find(
  (activity) => activity.slug === "cycling"
);

export default function CyclingTours() {
  if (!cycling) {
    return null;
  }

  return (
    <ActivityCatalogTemplate
      title={cycling.title}
      description={cycling.description}
      image={cycling.image}
      activitySlug={cycling.slug}
    />
  );
}
