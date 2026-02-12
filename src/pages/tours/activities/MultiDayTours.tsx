import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ACTIVITY_PAGES } from "../../../data/tourCatalog";

const multiDay = ACTIVITY_PAGES.find(
  (activity) => activity.slug === "multi-day"
);

export default function MultiDayTours() {
  if (!multiDay) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Multi-day tours coming soon</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We’re still loading this activity page. Check back shortly for
          multi-day adventures.
        </p>
      </main>
    );
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
