import ActivityCatalogTemplate from "../../../templates/ActivityCatalogTemplate";
import { ACTIVITY_PAGES } from "../../../data/tourCatalog";

const detours = ACTIVITY_PAGES.find((activity) => activity.slug === "detours");

export default function DetoursTours() {
  if (!detours) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Detours coming soon</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We’re still loading this activity page. Check back shortly for new
          detours and quick-hit adventures.
        </p>
      </main>
    );
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
