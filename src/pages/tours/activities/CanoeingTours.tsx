import ActivityExplorerTemplate from "../../../templates/ActivityExplorerTemplate";
import { ADVENTURE_ACTIVITY_PAGES } from "../../../data/tourCatalog";

const canoeing = ADVENTURE_ACTIVITY_PAGES.find(
  (activity) => activity.slug === "canoeing"
);

export default function CanoeingTours() {
  if (!canoeing) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Canoeing tours coming soon</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We’re still loading this activity page. Check back shortly for new
          canoeing adventures.
        </p>
      </main>
    );
  }

  return (
    <ActivityExplorerTemplate
      title={canoeing.title}
      description={canoeing.description}
      image={canoeing.image}
      activitySlug={canoeing.slug}
    />
  );
}
