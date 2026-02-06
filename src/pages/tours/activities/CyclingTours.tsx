import ActivityExplorerTemplate from "../../../templates/ActivityExplorerTemplate";
import { ADVENTURE_ACTIVITY_PAGES } from "../../../data/tourCatalog";

const cycling = ADVENTURE_ACTIVITY_PAGES.find(
  (activity) => activity.slug === "cycling"
);

export default function CyclingTours() {
  if (!cycling) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Cycling tours coming soon</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We’re still loading this activity page. Check back shortly for new
          cycling experiences.
        </p>
      </main>
    );
  }

  return (
    <ActivityExplorerTemplate
      title={cycling.title}
      description={cycling.description}
      image={cycling.image}
      activitySlug={cycling.slug}
    />
  );
}
