import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ACTIVITY_PAGES } from "../../../data/tourCatalog";

const multiDay = ACTIVITY_PAGES.find(
  (activity) => activity.slug === "multi-day"
);

export default function MultiDayTours() {
  if (!multiDay) {
    return null;
  }

  return (
    <ActivityCatalogTemplate
      title={multiDay.title}
      description={multiDay.description}
      image={multiDay.image}
      activitySlug={multiDay.slug}
    />
  );
}
