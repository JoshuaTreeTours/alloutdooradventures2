import ActivityExplorerTemplate from "../../../templates/ActivityExplorerTemplate";
import { ADVENTURE_ACTIVITY_PAGES } from "../../../data/tourCatalog";

const hiking = ADVENTURE_ACTIVITY_PAGES.find(
  (activity) => activity.slug === "hiking"
);

export default function HikingTours() {
  if (!hiking) {
    return null;
  }

  return (
    <ActivityExplorerTemplate
      title={hiking.title}
      description={hiking.description}
      image={hiking.image}
      activitySlug={hiking.slug}
    />
  );
}
