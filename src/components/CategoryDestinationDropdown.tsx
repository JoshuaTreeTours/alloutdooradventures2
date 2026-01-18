import { countriesWithTours, toursByCountry } from "../data/europeIndex";
import type { Tour } from "../data/tours.types";

const PADDLE_KEYWORDS = ["canoe", "kayak", "paddle", "rafting"];

const getCategoryMatch = (activitySlug: string) => {
  if (activitySlug === "cycling") {
    return (tour: Tour) => tour.activitySlugs.includes("cycling");
  }
  if (activitySlug === "hiking") {
    return (tour: Tour) => tour.activitySlugs.includes("hiking");
  }
  if (activitySlug === "canoeing") {
    return (tour: Tour) => {
      if (tour.activitySlugs.includes("canoeing")) {
        return true;
      }
      const tagText = (tour.tags ?? []).join(" ").toLowerCase();
      return PADDLE_KEYWORDS.some((keyword) => tagText.includes(keyword));
    };
  }
  return () => false;
};

const getEuropeCategorySlug = (activitySlug: string) =>
  activitySlug === "canoeing" ? "paddle-sports" : activitySlug;

type CategoryDestinationDropdownProps = {
  activitySlug: string;
};

export default function CategoryDestinationDropdown({
  activitySlug,
}: CategoryDestinationDropdownProps) {
  const matchesCategory = getCategoryMatch(activitySlug);
  const europeCategorySlug = getEuropeCategorySlug(activitySlug);
  const europeCountries = countriesWithTours.filter((country) =>
    (toursByCountry[country.slug] ?? []).some((tour) =>
      matchesCategory(tour),
    ),
  );

  if (!europeCountries.length) {
    return null;
  }

  return (
    <section className="mt-10 space-y-6" aria-label="International destinations">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          International
        </span>
        <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
          Explore Europe by country
        </h2>
        <p className="mt-3 text-sm text-[#405040] md:text-base">
          Jump to country-specific {activitySlug.replace("-", " ")} tours.
        </p>
      </div>

      <details className="group rounded-2xl border border-[#d6decf] bg-white/80 p-6 shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-[#2f4a2f]">
          <span>Europe</span>
          <span
            aria-hidden="true"
            className="text-[#7a8a6b] transition-transform duration-200 group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <p className="mt-2 text-sm text-[#405040] md:text-base">
          Browse country hubs with live {activitySlug.replace("-", " ")} tours.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-[#2f4a2f] sm:grid-cols-2 lg:grid-cols-3">
          {europeCountries.map((country) => (
            <li key={country.slug}>
              <a
                className="flex items-center gap-2 rounded-full border border-[#d6decf] px-4 py-2 transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]"
                href={`/destinations/europe/${country.slug}/${europeCategorySlug}`}
              >
                {country.name}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
