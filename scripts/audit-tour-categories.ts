import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getAllEngine3ListingEntries } from "../src/engine3/listing/getEngine3ListingEntries";
import { getAllEngine4ListingEntries } from "../src/engine4/listing/getEngine4ListingEntries";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { legacyFhMigratedTours } from "../src/engine6/legacyFh/registry";
import { tours as routeBackedTours } from "../src/data/tours";
import type { Tour } from "../src/data/tours.types";
import {
  classifyTourCategories,
  TOUR_ACTIVITY_CATEGORIES,
} from "../src/lib/tourCategoryClassifier";

export type CategoryAuditSource =
  | "Engine6"
  | "FareHarbor/legacy"
  | "Engine2"
  | "Engine3"
  | "Engine4"
  | "other generated";

export type CategoryAuditRecord = {
  id: string;
  source: CategoryAuditSource;
  title: string;
  path: string;
  city: string;
  state: string;
  stateSlug: string;
  primaryDisplayCategory: string | null;
  activityCategories: Array<{ slug: string; label: string }>;
};

export type FullInventoryCategoryAudit = {
  records: CategoryAuditRecord[];
  totalRouteBackedTours: number;
  totalClassifiedTours: number;
  totalCategoryAssignments: number;
  unclassifiedTours: number;
  countsBySource: Record<CategoryAuditSource, number>;
  categoryCounts: Record<string, number>;
  examplesByCategory: Record<string, CategoryAuditRecord[]>;
  californiaCyclingExamples: CategoryAuditRecord[];
};

const SOURCES: CategoryAuditSource[] = [
  "Engine6",
  "FareHarbor/legacy",
  "Engine2",
  "Engine3",
  "Engine4",
  "other generated",
];

const getTourPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

const classifyTourRecord = ({
  id,
  source,
  title,
  path,
  city,
  state,
  stateSlug,
  overview,
  description,
  highlights,
  itinerary,
  categories,
}: {
  id: string;
  source: CategoryAuditSource;
  title: string;
  path: string;
  city: string;
  state: string;
  stateSlug: string;
  overview?: string | null;
  description?: string | null;
  highlights?: string[] | null;
  itinerary?: Array<{
    title?: string | null;
    description?: string | null;
  }> | null;
  categories?: string[] | null;
}): CategoryAuditRecord => {
  const classification = classifyTourCategories({
    title,
    overview,
    description,
    highlights,
    itinerary,
    categories,
  });

  return {
    id,
    source,
    title,
    path,
    city,
    state,
    stateSlug,
    primaryDisplayCategory: classification.primaryDisplayCategory,
    activityCategories: classification.activityCategories,
  };
};

const recordFromTour = (
  tour: Tour,
  source: CategoryAuditSource
): CategoryAuditRecord =>
  classifyTourRecord({
    id: tour.productCode ?? tour.id,
    source,
    title: tour.title,
    path: getTourPath(tour),
    city: tour.destination.city,
    state: tour.destination.state || tour.destination.country || "",
    stateSlug: tour.destination.stateSlug,
    overview: tour.shortDescription ?? tour.content?.overview,
    description: tour.longDescription,
    highlights: [
      ...(tour.content?.highlights ?? []),
      ...(tour.tags ?? []),
      ...(tour.tagPills ?? []),
    ],
    categories: tour.categories ?? tour.activitySlugs,
  });

const buildEngine6Records = (): CategoryAuditRecord[] =>
  engine6ResolvedTours.map(tour => ({
    id: tour.productCode,
    source: "Engine6",
    title: tour.title,
    path: tour.canonicalPath,
    city: tour.city,
    state: tour.state,
    stateSlug: tour.canonicalPath.split("/")[2] ?? "",
    primaryDisplayCategory: tour.primaryDisplayCategory,
    activityCategories: tour.activityCategories,
  }));

const buildLegacyRecords = (): CategoryAuditRecord[] => {
  const standardLegacyRecords = routeBackedTours
    .filter(
      tour =>
        !["engine2", "engine3", "engine4", "engine6"].includes(
          tour.engine ?? ""
        )
    )
    .map(tour => recordFromTour(tour, "FareHarbor/legacy"));

  const migratedRecords = legacyFhMigratedTours.map(tour => ({
    id: tour.productCode,
    source: "FareHarbor/legacy" as const,
    title: tour.title,
    path: tour.canonicalPath,
    city: tour.city,
    state: tour.state,
    stateSlug: tour.canonicalPath.split("/")[2] ?? "",
    primaryDisplayCategory: tour.primaryDisplayCategory,
    activityCategories: tour.activityCategories,
  }));

  return [...standardLegacyRecords, ...migratedRecords];
};

const buildEngine2Records = (): CategoryAuditRecord[] =>
  getAllEngine2Tours()
    .filter(tour => Boolean(tour.seo.canonicalPath && tour.bookingUrl))
    .map(tour =>
      classifyTourRecord({
        id: tour.id,
        source: "Engine2",
        title: tour.name,
        path: tour.seo.canonicalPath,
        city: tour.geo.city,
        state: tour.geo.region || tour.geo.country,
        stateSlug: tour.seo.canonicalPath.split("/")[2] ?? "",
        overview: tour.content.overview ?? tour.seo.description,
        description: tour.content.experienceText,
        highlights: tour.content.highlights,
        itinerary: tour.content.itinerary,
        categories: tour.type === "rental" ? ["rentals"] : ["adventure"],
      })
    );

const buildEngine3Records = (): CategoryAuditRecord[] =>
  getAllEngine3ListingEntries().map(entry =>
    recordFromTour(entry.tour, "Engine3")
  );

const buildEngine4Records = (): CategoryAuditRecord[] =>
  getAllEngine4ListingEntries().map(entry =>
    recordFromTour(entry.tour, "Engine4")
  );

const sortByTitle = (records: CategoryAuditRecord[]) =>
  [...records].sort((a, b) => a.title.localeCompare(b.title));

export const buildFullInventoryCategoryAudit =
  (): FullInventoryCategoryAudit => {
    const records = [
      ...buildEngine6Records(),
      ...buildLegacyRecords(),
      ...buildEngine2Records(),
      ...buildEngine3Records(),
      ...buildEngine4Records(),
    ];

    const countsBySource = Object.fromEntries(
      SOURCES.map(source => [source, 0])
    ) as Record<CategoryAuditSource, number>;
    const categoryCounts: Record<string, number> = Object.fromEntries(
      TOUR_ACTIVITY_CATEGORIES.map(category => [category.label, 0])
    );
    const examplesByCategory: Record<string, CategoryAuditRecord[]> =
      Object.fromEntries(
        TOUR_ACTIVITY_CATEGORIES.map(category => [category.label, []])
      );

    for (const record of records) {
      countsBySource[record.source] += 1;

      for (const category of record.activityCategories) {
        categoryCounts[category.label] =
          (categoryCounts[category.label] ?? 0) + 1;
        const examples = examplesByCategory[category.label] ?? [];
        if (examples.length < 5) {
          examples.push(record);
        }
      }
    }

    const totalClassifiedTours = records.filter(
      record => record.activityCategories.length > 0
    ).length;
    const totalCategoryAssignments = records.reduce(
      (total, record) => total + record.activityCategories.length,
      0
    );
    const californiaCyclingExamples = sortByTitle(
      records.filter(
        record =>
          record.stateSlug === "california" &&
          record.activityCategories.some(
            category => category.slug === "cycling"
          )
      )
    ).slice(0, 15);

    return {
      records,
      totalRouteBackedTours: records.length,
      totalClassifiedTours,
      totalCategoryAssignments,
      unclassifiedTours: records.length - totalClassifiedTours,
      countsBySource,
      categoryCounts,
      examplesByCategory,
      californiaCyclingExamples,
    };
  };

const renderRecordLink = (record: CategoryAuditRecord) =>
  `[${record.title.replace(/\|/g, "\\|")}](${record.path})`;

export const renderFullInventoryCategoryAuditMarkdown = (
  audit: FullInventoryCategoryAudit
) => {
  const lines = [
    "# Tour Category Classification Audit",
    "",
    "Generated across all available route-backed tour inventories, including Engine6, migrated FareHarbor/legacy, Engine2, Engine3, Engine4, and generated legacy tour records.",
    "",
    "## Summary",
    "",
    `- Total route-backed tour records audited: ${audit.totalRouteBackedTours}`,
    `- Total classified tours: ${audit.totalClassifiedTours}`,
    `- Total category assignments: ${audit.totalCategoryAssignments}`,
    `- Unclassified tours: ${audit.unclassifiedTours}`,
    "",
    "## Counts by source",
    "",
    "| Source | Route-backed records |",
    "| --- | ---: |",
    ...SOURCES.map(source => `| ${source} | ${audit.countsBySource[source]} |`),
    "",
    "## Category counts across full inventory",
    "",
    "| Category | Tour assignments |",
    "| --- | ---: |",
    ...TOUR_ACTIVITY_CATEGORIES.map(
      category =>
        `| ${category.label} | ${audit.categoryCounts[category.label] ?? 0} |`
    ),
    "",
    "## Examples by category",
    "",
    ...TOUR_ACTIVITY_CATEGORIES.flatMap(category => {
      const examples = audit.examplesByCategory[category.label] ?? [];
      return [
        `### ${category.label}`,
        "",
        examples.length
          ? examples
              .map(record => `- ${record.source}: ${renderRecordLink(record)}`)
              .join("\n")
          : "- No examples classified.",
        "",
      ];
    }),
    "## California Cycling examples",
    "",
    audit.californiaCyclingExamples.length
      ? audit.californiaCyclingExamples
          .map(record => `- ${record.source}: ${renderRecordLink(record)}`)
          .join("\n")
      : "- No California cycling examples found.",
    "",
    "## Card badge audit",
    "",
    "Tour cards and listing surfaces that use the shared `TourCard` component now prefer `primaryDisplayCategory` for the single visible badge, falling back to existing `tagPills`/category label behavior when classification is absent.",
    "",
    "Updated card/listing consumers include:",
    "",
    "- `src/components/TourCard.tsx` shared tour card badge rendering",
    "- Engine6 listing cards via `src/engine6/listing.ts`",
    "- City, state, destination, guide, related-tour, booking-page, and tour-index grids that render `TourCard`",
    "",
    "## Before/after card badge examples",
    "",
    "| Example | Previous badge source | New visible badge |",
    "| --- | --- | --- |",
    "| Santa Barbara Vineyard to Table Taste Tour by E-Bike | Engine/category tag | Cycling |",
    "| Dolphin Jet Ski Safari | Water/adventure fallback | Water Sports |",
    "| Santa Barbara Trolley Tour | Detours or generic tag | Sightseeing & City Tours |",
    "| Off Road Las Vegas Tour | Hiking/adventure fallback | Jeep & Off-Road |",
    "| Night Sky Stargazing Tour | Existing fallback tag | Stargazing |",
    "",
    "## Notes",
    "",
    "- Counts are category assignments, so one tour can increment multiple categories.",
    "- `primaryDisplayCategory` remains a single value for card/listing badge surfaces; `activityCategories` stores structured multi-category metadata for future filters.",
    "- Classifier text excludes destination/city/state names and itinerary stop titles to avoid deriving activities from location names alone.",
  ];

  return `${lines.join("\n")}\n`;
};

export const writeFullInventoryCategoryAudit = () => {
  const audit = buildFullInventoryCategoryAudit();
  const report = renderFullInventoryCategoryAuditMarkdown(audit);
  const outputPath = resolve("docs/tour-category-audit.md");
  writeFileSync(outputPath, report);
  console.log(report);
  console.log(`Wrote ${outputPath}`);
  return audit;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFullInventoryCategoryAudit();
}
