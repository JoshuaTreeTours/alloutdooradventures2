import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ACTIVITY_PAGES } from "../../../data/tourCatalog";

const dayAdventures = ACTIVITY_PAGES.find(
  (activity) => activity.slug === "day-adventures"
);

export default function DayAdventuresTours() {
  if (!dayAdventures) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Day adventures coming soon</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We’re still loading this activity page. Check back shortly for new
          day adventures.
        </p>
      </main>
    );
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
