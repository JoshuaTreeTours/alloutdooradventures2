import { buildSchemaGraph } from "../src/engine2/schema/buildSchemaGraph";
import { buildEngine2Seo } from "../src/engine2/seo/buildEngine2Seo";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import type { Tour } from "../src/data/tours.types";
import {
  buildTourProductStructuredData,
  buildTourTripStructuredData,
  buildWebPageStructuredData,
  getSiteStructuredDataNodes,
  normalizeStructuredData,
} from "../src/utils/structuredData";

const ALLOWED_ADDITIONS: Record<string, Set<string>> = {
  Product: new Set([
    "duration",
    "areaServed",
    "isRelatedTo",
    "aggregateRating",
  ]),
  TouristTrip: new Set(["duration", "areaServed", "isRelatedTo"]),
};

const stableSort = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stableSort);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    return Object.fromEntries(
      entries.map(([key, entryValue]) => [key, stableSort(entryValue)])
    );
  }
  return value;
};

const stableStringify = (value: unknown) => JSON.stringify(stableSort(value));

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const getGraph = (payload: unknown) => {
  const parsed = JSON.parse(JSON.stringify(payload)) as {
    "@graph"?: unknown[];
  };
  const graph = Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [];
  return graph.filter(
    (node): node is Record<string, unknown> =>
      !!node && typeof node === "object"
  );
};

const getNodeType = (node: Record<string, unknown>) => {
  const type = node["@type"];
  return typeof type === "string"
    ? type
    : Array.isArray(type)
      ? String(type[0])
      : "unknown";
};

const getIds = (graph: Record<string, unknown>[]) =>
  graph
    .map(node => node["@id"])
    .filter((id): id is string => typeof id === "string")
    .sort();

const getTypes = (graph: Record<string, unknown>[]) =>
  graph.map(getNodeType).sort();

const compareNode = (
  baseline: Record<string, unknown>,
  candidate: Record<string, unknown>,
  nodeType: string,
  path = ""
) => {
  for (const [key, value] of Object.entries(baseline)) {
    assert(key in candidate, `${nodeType}${path}: missing key ${key}`);
    const candidateValue = candidate[key];
    const currentPath = `${path}.${key}`;
    if (
      value &&
      candidateValue &&
      typeof value === "object" &&
      typeof candidateValue === "object" &&
      !Array.isArray(value) &&
      !Array.isArray(candidateValue)
    ) {
      compareNode(
        value as Record<string, unknown>,
        candidateValue as Record<string, unknown>,
        nodeType,
        currentPath
      );
      continue;
    }
    assert(
      stableStringify(value) === stableStringify(candidateValue),
      `${nodeType}${currentPath}: value changed`
    );
  }

  const allowedTopLevel = ALLOWED_ADDITIONS[nodeType] ?? new Set<string>();
  for (const key of Object.keys(candidate)) {
    if (key in baseline) {
      continue;
    }
    assert(
      path === "",
      `${nodeType}${path}: unexpected nested addition ${key}`
    );
    assert(
      allowedTopLevel.has(key),
      `${nodeType}: unexpected additive key ${key}`
    );
  }
};

const compareGraphs = (
  name: string,
  baselinePayload: unknown,
  safePayload: unknown
) => {
  const baselineGraph = getGraph(baselinePayload);
  const safeGraph = getGraph(safePayload);

  assert(
    stableStringify(getTypes(baselineGraph)) ===
      stableStringify(getTypes(safeGraph)),
    `${name}: @type set changed`
  );
  assert(
    stableStringify(getIds(baselineGraph)) ===
      stableStringify(getIds(safeGraph)),
    `${name}: @id set changed`
  );

  const safeById = new Map<string, Record<string, unknown>>();
  safeGraph.forEach(node => {
    const id = node["@id"];
    if (typeof id === "string") {
      safeById.set(id, node);
    }
  });

  baselineGraph.forEach((baselineNode, index) => {
    const id = baselineNode["@id"];
    const safeNode =
      typeof id === "string" ? safeById.get(id) : safeGraph[index];
    assert(safeNode, `${name}: missing node match at index ${index}`);
    compareNode(
      baselineNode,
      safeNode as Record<string, unknown>,
      getNodeType(baselineNode)
    );
  });
};

const buildLegacyGraph = (tour: Tour, detailUrl: string) => {
  const graph = [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: detailUrl,
      name: tour.title,
      description: tour.longDescription,
      mainEntityId: `${detailUrl}#product`,
    }),
    buildTourProductStructuredData({
      tour,
      detailUrl,
      bookingUrl: tour.bookingUrl,
      description: tour.longDescription,
    }),
    buildTourTripStructuredData({
      tour,
      detailUrl,
      bookingUrl: tour.bookingUrl,
      description: tour.longDescription,
    }),
  ];

  return normalizeStructuredData({
    "@context": "https://schema.org",
    "@graph": graph,
  });
};

const engine2Tour = getAllEngine2Tours()[0];
assert(engine2Tour, "Could not load representative Engine2 tour sample");

const legacyTour: Tour = {
  id: "schema-diff-tour",
  slug: "schema-diff-tour",
  title: "Schema Diff Tour",
  destination: {
    state: "California",
    stateSlug: "california",
    city: "San Diego",
    citySlug: "san-diego",
    country: "United States",
  },
  heroImage: "https://example.com/hero.jpg",
  galleryImages: ["https://example.com/gallery.jpg"],
  badges: {
    duration: "2 hours",
    rating: 4.7,
    reviewCount: 110,
  },
  activitySlugs: ["hiking"],
  bookingProvider: "viator",
  bookingUrl: "https://booking.example.com/schema-diff-tour",
  longDescription: "Schema diff tour description",
  startingPrice: 99,
  currency: "USD",
};

const run = () => {
  process.env.ENABLE_RATINGS_SCHEMA = "false";

  process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1 = "false";
  const legacyBaseline = buildLegacyGraph(
    legacyTour,
    "https://www.alloutdooradventures.com/tours/california/san-diego/schema-diff-tour"
  );
  const engine2Baseline = normalizeStructuredData({
    "@context": "https://schema.org",
    "@graph": buildSchemaGraph(
      engine2Tour,
      buildEngine2Seo(engine2Tour),
      null,
      false,
      undefined,
      undefined,
      true,
      {
        whatYoullExperience: ["x"],
        highlights: ["y"],
        schemaDescription: "desc",
        durationISO: "PT3H",
      }
    ),
  });

  process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1 = "true";
  const legacySafe = buildLegacyGraph(
    legacyTour,
    "https://www.alloutdooradventures.com/tours/california/san-diego/schema-diff-tour"
  );
  const engine2Safe = normalizeStructuredData({
    "@context": "https://schema.org",
    "@graph": buildSchemaGraph(
      engine2Tour,
      buildEngine2Seo(engine2Tour),
      null,
      false,
      undefined,
      undefined,
      true,
      {
        whatYoullExperience: ["x"],
        highlights: ["y"],
        schemaDescription: "desc",
        durationISO: "PT3H",
      }
    ),
  });

  compareGraphs("legacy tour schema", legacyBaseline, legacySafe);
  compareGraphs("engine2 tour schema", engine2Baseline, engine2Safe);
  console.log("schema diff checks passed for representative tour pages");
};

run();
