import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ACTIVITY_PAGES } from "../../../data/tourCatalog";

const detours = ACTIVITY_PAGES.find((activity) => activity.slug === "detours");

export default function DetoursTours() {
  if (!detours) {
    return null;
  }

  return (
    <ActivityCatalogTemplate
      title={detours.title}
      description={detours.description}
      image={detours.image}
      activitySlug={detours.slug}
    />
  );
}
