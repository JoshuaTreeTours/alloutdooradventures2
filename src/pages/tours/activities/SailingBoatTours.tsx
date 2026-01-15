import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ADVENTURE_ACTIVITY_PAGES } from "../../../data/tourCatalog";

const sailingBoat = ADVENTURE_ACTIVITY_PAGES.find(
  (activity) => activity.slug === "sailing-boat"
);

export default function SailingBoatTours() {
  if (!sailingBoat) {
    return null;
  }

  return (
    <ActivityCatalogTemplate
      title={sailingBoat.title}
      description={sailingBoat.description}
      image={sailingBoat.image}
      activitySlug={sailingBoat.slug}
    />
  );
}
