import ActivityExplorerTemplate from "../../../templates/ActivityExplorerTemplate";
import { ADVENTURE_ACTIVITY_PAGES } from "../../../data/tourCatalog";

const hiking = ADVENTURE_ACTIVITY_PAGES.find(
  (activity) => activity.slug === "hiking"
);

export default function HikingTours() {
  if (!hiking) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Hiking tours coming soon</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We’re still loading this activity page. Check back shortly for new
          hiking experiences.
        </p>
      </main>
    );
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
