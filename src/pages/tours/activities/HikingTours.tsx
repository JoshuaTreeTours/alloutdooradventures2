import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ACTIVITY_PAGES } from "../../../data/tourCatalog";

const hiking = ACTIVITY_PAGES.find((activity) => activity.slug === "hiking");

export default function HikingTours() {
  if (!hiking) {
    return null;
  }

  return (
    <ActivityCatalogTemplate
      title={hiking.title}
      description={hiking.description}
      image={hiking.image}
      activitySlug={hiking.slug}
    />
  );
}
