import {
  ENGINE6_DESTINATION_VALIDATION_COHORTS,
  type Engine6DestinationValidationCohort,
} from "./engine6DestinationValidationCohorts.js";
import type { Engine6Tour } from "./types.js";
import {
  parseGitNameStatusOutput,
  resolveEngine6ProductScopeFromChangedFiles,
  type Engine6GitChangedFile,
  verifyGitRefExists,
} from "./resolveEngine6ChangedProductCodes.js";
import { execFileSync, execSync } from "node:child_process";

const ENGINE6_DESTINATION_ARTIFACT_PATH =
  /^scripts\/(?:(?:generate-)?([a-z0-9-]+(?:-[a-z0-9-]+)*)-(?:engine6(?:-fixtures)?|product-selection)(?:\.ts|\.mjs|\.js)?|([a-z0-9-]+)-product-selection\.json)$/i;

const ENGINE6_DESTINATION_DATA_PATH =
  /^data\/engine6\/(?:destinations\/)?([a-z0-9-]+(?:-[a-z0-9-]+)*)\//i;

/** Maps destination slug fragments to validation cohort labels. */
export const ENGINE6_DESTINATION_SLUG_COHORT_LABELS: Record<string, readonly string[]> =
  {
    monterey: ["Monterey", "Monterey editorial narrative"],
    napa: ["Napa", "Napa editorial narrative"],
    "lake-tahoe": ["Lake Tahoe"],
    yosemite: ["Yosemite"],
    "grand-canyon-national-park": ["Grand Canyon"],
    "yellowstone-national-park": ["Yellowstone"],
    "zion-national-park": ["Zion"],
    "bryce-canyon-national-park": ["Bryce Canyon"],
    "arches-national-park": ["Arches"],
    "canyonlands-national-park": ["Canyonlands"],
    "acadia-national-park": ["Acadia"],
    maine: ["Acadia"],
    "olympic-national-park": ["Olympic"],
    glacier: ["Glacier"],
    "great-smoky-mountains-national-park": ["Great Smoky Mountains"],
    sedona: ["Sedona"],
    chicago: ["Chicago"],
    illinois: ["Chicago"],
    london: ["London"],
    "united-kingdom": ["London"],
    paris: ["Paris"],
    france: ["Paris"],
    barcelona: ["Barcelona"],
    spain: ["Barcelona"],
    rome: ["Rome"],
    venice: ["Venice"],
    italy: ["Rome", "Venice"],
    "jackson-hole": ["Jackson Hole"],
    jackson: ["Jackson Hole"],
    wyoming: ["Jackson Hole"],
    "rocky-mountain-national-park": ["Rocky Mountain National Park"],
    denver: ["Denver"],
    aspen: ["Aspen"],
    boulder: ["Boulder"],
    austin: ["Austin"],
    houston: ["Houston"],
    texas: ["Austin", "Houston"],
    colorado: ["Rocky Mountain National Park", "Denver", "Aspen", "Boulder"],
    philadelphia: ["Philadelphia"],
    pennsylvania: ["Philadelphia"],
    moab: ["Moab"],
    utah: ["Moab"],
    "key-west": ["Key West"],
    orlando: ["Orlando"],
    "fort-lauderdale": ["Fort Lauderdale"],
    naples: ["Naples"],
    florida: ["Key West", "Orlando", "Fort Lauderdale", "Naples"],
    honolulu: ["Honolulu"],
    maui: ["Maui"],
    kauai: ["Kauai"],
    kona: ["Kona"],
    "hawaii-volcanoes": ["Hawaii Volcanoes National Park"],
    "hawaii-volcanoes-national-park": ["Hawaii Volcanoes National Park"],
    hawaii: ["Honolulu", "Maui", "Kauai", "Kona", "Hawaii Volcanoes National Park"],
    "washington-dc": ["Washington, D.C."],
    washington: ["Washington, D.C."],
    miami: ["Miami editorial narrative"],
    "new-york": ["New York editorial narrative"],
  };

export const extractEngine6DestinationSlugFromChangedPath = (filePath: string) => {
  for (const pattern of [ENGINE6_DESTINATION_ARTIFACT_PATH, ENGINE6_DESTINATION_DATA_PATH]) {
    const match = filePath.match(pattern);
    if (!match) {
      continue;
    }

    const slug = (match[1] ?? match[2] ?? "").trim().toLowerCase();
    if (slug) {
      return slug;
    }
  }

  return null;
};

export const resolveEngine6DestinationLabelsForSlug = (slug: string) => {
  const normalized = slug.trim().toLowerCase();
  const direct = ENGINE6_DESTINATION_SLUG_COHORT_LABELS[normalized];
  if (direct) {
    return [...direct];
  }

  for (const [key, labels] of Object.entries(ENGINE6_DESTINATION_SLUG_COHORT_LABELS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return [...labels];
    }
  }

  return [];
};

export const extractEngine6DestinationLabelsFromChangedFiles = (
  changedFiles: readonly Engine6GitChangedFile[]
) => {
  const labels = new Set<string>();

  for (const file of changedFiles) {
    if (file.status === "D") {
      continue;
    }

    const slug = extractEngine6DestinationSlugFromChangedPath(file.path);
    if (!slug) {
      continue;
    }

    for (const label of resolveEngine6DestinationLabelsForSlug(slug)) {
      labels.add(label);
    }
  }

  return [...labels].sort();
};

export const resolveEngine6DestinationLabelsForProductCodes = (
  productCodes: readonly string[],
  tours: readonly Engine6Tour[]
) => {
  const labels = new Set<string>();
  const codeSet = new Set(
    productCodes.map(code => code.trim().toUpperCase()).filter(Boolean)
  );

  for (const tour of tours) {
    if (!codeSet.has(tour.productCode.trim().toUpperCase())) {
      continue;
    }

    for (const cohort of ENGINE6_DESTINATION_VALIDATION_COHORTS) {
      if (cohort.matches(tour)) {
        labels.add(cohort.label);
      }
    }
  }

  return [...labels].sort();
};

export type Engine6GovernanceScopeResolution = {
  scopedProductCodes: string[];
  branchModifiedProductCodes: string[];
  removedProductCodes: string[];
  scopedDestinationLabels: string[];
  fullSiteValidation: boolean;
  changedFiles: Engine6GitChangedFile[];
  baseRef: string | null;
  warning: string | null;
};

export const resolveEngine6GovernanceScope = (args?: {
  headRef?: string;
  branchModifiedProductCodes?: ReadonlySet<string>;
  fullSiteValidation?: boolean;
  tours?: readonly Engine6Tour[];
  execImpl?: typeof execSync;
  execFileImpl?: typeof execFileSync;
}): Engine6GovernanceScopeResolution => {
  const execImpl = args?.execImpl ?? execSync;
  const execFileImpl = args?.execFileImpl ?? execFileSync;
  const headRef = args?.headRef ?? "HEAD";
  const fullSiteValidation = args?.fullSiteValidation ?? false;
  const scopedProducts = new Set<string>();
  const branchModifiedProducts = new Set<string>();
  const removedProducts = new Set<string>();

  for (const code of args?.branchModifiedProductCodes ?? []) {
    const normalized = code.trim().toUpperCase();
    if (normalized) {
      scopedProducts.add(normalized);
      branchModifiedProducts.add(normalized);
    }
  }

  let changedFiles: Engine6GitChangedFile[] = [];
  let baseRef: string | null = null;
  let warning: string | null = null;

  const baseRefEnv = process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF?.trim();
  const candidates = [
    baseRefEnv,
    process.env.ENGINE6_GOVERNANCE_BASE_REF?.trim(),
    "origin/main",
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const candidate of candidates) {
    if (verifyGitRefExists(candidate, execFileImpl)) {
      baseRef = candidate;
      break;
    }
  }

  if (!baseRef) {
    warning =
      "Engine6 governance scope could not resolve a git base ref; destination cohort checks are limited to explicit branch product codes.";
  } else if (verifyGitRefExists(headRef, execFileImpl)) {
    const range = `${baseRef}...${headRef}`;
    const nameStatusOutput = execImpl(`git diff --name-status ${range}`, {
      encoding: "utf8",
    });
    changedFiles = parseGitNameStatusOutput(nameStatusOutput);

    const catalogDiffs: Record<string, string> = {};
    for (const file of changedFiles) {
      if (
        (file.status === "A" || file.status === "M") &&
        /^(?:src\/engine6\/(?:validationFixtures\.ts|routes\.ts|.*ViatorPublicRatings\.ts)|data\/merchantFeed\.csv)$/.test(
          file.path
        )
      ) {
        catalogDiffs[file.path] = execImpl(`git diff ${range} -- ${file.path}`, {
          encoding: "utf8",
        });
      }
    }

    const productScope = resolveEngine6ProductScopeFromChangedFiles({
      changedFiles,
      catalogDiffs,
    });

    for (const code of productScope.deployScoped) {
      scopedProducts.add(code);
    }
    for (const code of productScope.addedOrModified) {
      branchModifiedProducts.add(code);
    }
    for (const code of productScope.removedOnly) {
      removedProducts.add(code);
    }
  }

  const destinationLabelsFromFiles =
    extractEngine6DestinationLabelsFromChangedFiles(changedFiles);
  const destinationLabelsFromProducts = args?.tours
    ? resolveEngine6DestinationLabelsForProductCodes(
        [...scopedProducts],
        args.tours
      )
    : [];

  const scopedDestinationLabels = fullSiteValidation
    ? ENGINE6_DESTINATION_VALIDATION_COHORTS.map(cohort => cohort.label)
    : [
        ...new Set([
          ...destinationLabelsFromFiles,
          ...destinationLabelsFromProducts,
        ]),
      ].sort();

  return {
    scopedProductCodes: [...scopedProducts].sort(),
    branchModifiedProductCodes: [...branchModifiedProducts].sort(),
    removedProductCodes: [...removedProducts].sort(),
    scopedDestinationLabels,
    fullSiteValidation,
    changedFiles,
    baseRef,
    warning,
  };
};

export const resolveEngine6DestinationValidationCohortsForScope = (args: {
  cohorts?: readonly Engine6DestinationValidationCohort[];
  scopedDestinationLabels?: readonly string[];
  fullSiteValidation?: boolean;
}): Engine6DestinationValidationCohort[] => {
  const cohorts = [...(args.cohorts ?? ENGINE6_DESTINATION_VALIDATION_COHORTS)];

  if (args.fullSiteValidation) {
    return cohorts;
  }

  const scopedLabels = new Set(args.scopedDestinationLabels ?? []);
  if (scopedLabels.size === 0) {
    return [];
  }

  return cohorts.filter(cohort => scopedLabels.has(cohort.label));
};
