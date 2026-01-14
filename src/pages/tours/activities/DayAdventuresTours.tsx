import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ACTIVITY_PAGES } from "../../../data/tourCatalog";

const dayAdventures = ACTIVITY_PAGES.find(
  (activity) => activity.slug === "day-adventures"
);

export default function DayAdventuresTours() {
  if (!dayAdventures) {
    return null;
  }

  return (
    <ActivityCatalogTemplate
      title={dayAdventures.title}
      description={dayAdventures.description}
      image={dayAdventures.image}
      activitySlug={dayAdventures.slug}
    />
  );
}
