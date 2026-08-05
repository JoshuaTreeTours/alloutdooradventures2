import { getStateBySlug } from "../data/destinations.js";
import { getStateCityOptions } from "../data/stateCityOptions.js";
import { states } from "../data/destinations.js";
import {
  ENGINE6_DESTINATION_VALIDATION_COHORTS,
  type Engine6DestinationValidationCohort,
} from "./engine6DestinationValidationCohorts.js";
import {
  ENGINE6_DESTINATION_SLUG_COHORT_LABELS,
  resolveEngine6DestinationLabelsForSlug,
} from "./resolveEngine6GovernanceScope.js";
import {
  resolveEngine6CanonicalCityHero,
  isDisplayableEngine6HeroUrl,
} from "./displayHero.js";
import {
  ENGINE6_CONFIGURED_PRODUCT_CODES,
  resolveEngine6PathForProductCode,
} from "./routes.js";

export type Engine6DestinationInfrastructureCheckId =
  | "state-registry"
  | "city-registry"
  | "tours-state-selector"
  | "tours-city-selector"
  | "route-prefix"
  | "governance-scope"
  | "canonical-hero-fallback"
  | "validation-cohort"
  | "fixture-target-path";

export type Engine6DestinationInfrastructureCheck = {
  id: Engine6DestinationInfrastructureCheckId;
  pass: boolean;
  message: string;
  detail?: string;
};

export type Engine6DestinationInfrastructureSpec = {
  destinationLabel: string;
  destinationCitySlug: string;
  stateSlug: string;
  citySlug: string;
};

/** Register each new Engine6 destination before fixture generation or deploy. */
export const ENGINE6_DESTINATION_INFRASTRUCTURE_SPECS: Partial<
  Record<string, Engine6DestinationInfrastructureSpec>
> = {
  chicago: {
    destinationLabel: "Chicago",
    destinationCitySlug: "chicago",
    stateSlug: "illinois",
    citySlug: "chicago",
  },
  boston: {
    destinationLabel: "Boston",
    destinationCitySlug: "boston",
    stateSlug: "massachusetts",
    citySlug: "boston",
  },
  philadelphia: {
    destinationLabel: "Philadelphia",
    destinationCitySlug: "philadelphia",
    stateSlug: "pennsylvania",
    citySlug: "philadelphia",
  },
  "jackson-hole": {
    destinationLabel: "Jackson Hole",
    destinationCitySlug: "jackson-hole",
    stateSlug: "wyoming",
    citySlug: "jackson",
  },
  "rocky-mountain-national-park": {
    destinationLabel: "Rocky Mountain National Park",
    destinationCitySlug: "rocky-mountain-national-park",
    stateSlug: "colorado",
    citySlug: "rocky-mountain-national-park",
  },
  moab: {
    destinationLabel: "Moab",
    destinationCitySlug: "moab",
    stateSlug: "utah",
    citySlug: "moab",
  },
  "arches-national-park": {
    destinationLabel: "Arches National Park",
    destinationCitySlug: "arches-national-park",
    stateSlug: "utah",
    citySlug: "arches-national-park",
  },
  "canyonlands-national-park": {
    destinationLabel: "Canyonlands National Park",
    destinationCitySlug: "canyonlands-national-park",
    stateSlug: "utah",
    citySlug: "canyonlands-national-park",
  },
  "acadia-national-park": {
    destinationLabel: "Acadia National Park",
    destinationCitySlug: "acadia-national-park",
    stateSlug: "maine",
    citySlug: "acadia-national-park",
  },
  "key-west": {
    destinationLabel: "Key West",
    destinationCitySlug: "key-west",
    stateSlug: "florida",
    citySlug: "key-west",
  },
  honolulu: {
    destinationLabel: "Honolulu",
    destinationCitySlug: "honolulu",
    stateSlug: "hawaii",
    citySlug: "honolulu",
  },
  maui: {
    destinationLabel: "Maui",
    destinationCitySlug: "maui",
    stateSlug: "hawaii",
    citySlug: "maui",
  },
  kauai: {
    destinationLabel: "Kauai",
    destinationCitySlug: "kauai",
    stateSlug: "hawaii",
    citySlug: "kauai",
  },
  kona: {
    destinationLabel: "Kona",
    destinationCitySlug: "kona",
    stateSlug: "hawaii",
    citySlug: "kona",
  },
  denver: {
    destinationLabel: "Denver",
    destinationCitySlug: "denver",
    stateSlug: "colorado",
    citySlug: "denver",
  },
  aspen: {
    destinationLabel: "Aspen",
    destinationCitySlug: "aspen",
    stateSlug: "colorado",
    citySlug: "aspen",
  },
  boulder: {
    destinationLabel: "Boulder",
    destinationCitySlug: "boulder",
    stateSlug: "colorado",
    citySlug: "boulder",
  },
  "hawaii-volcanoes-national-park": {
    destinationLabel: "Hawaii Volcanoes National Park",
    destinationCitySlug: "hawaii-volcanoes-national-park",
    stateSlug: "hawaii",
    citySlug: "hawaii-volcanoes-national-park",
  },
  orlando: {
    destinationLabel: "Orlando",
    destinationCitySlug: "orlando",
    stateSlug: "florida",
    citySlug: "orlando",
  },
  "fort-lauderdale": {
    destinationLabel: "Fort Lauderdale",
    destinationCitySlug: "fort-lauderdale",
    stateSlug: "florida",
    citySlug: "fort-lauderdale",
  },
  naples: {
    destinationLabel: "Naples",
    destinationCitySlug: "naples",
    stateSlug: "florida",
    citySlug: "naples",
  },
};

export type Engine6DestinationInfrastructureReport = {
  destinationLabel: string;
  destinationCitySlug: string;
  stateSlug: string;
  citySlug: string;
  routePrefix: string;
  pass: boolean;
  checks: Engine6DestinationInfrastructureCheck[];
  blockingFailures: Engine6DestinationInfrastructureCheck[];
};

export const buildEngine6DestinationRoutePrefix = (args: {
  stateSlug: string;
  citySlug: string;
}) => `/destinations/${args.stateSlug.trim()}/${args.citySlug.trim()}/tours/`;

export const resolveEngine6ConfiguredPathsForRoutePrefix = (routePrefix: string) =>
  ENGINE6_CONFIGURED_PRODUCT_CODES.map(productCode =>
    resolveEngine6PathForProductCode(productCode)
  ).filter((path): path is string => Boolean(path?.startsWith(routePrefix)));

export const isEngine6StateInToursSelector = (stateSlug: string) => {
  const normalized = stateSlug.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (states.some(state => state.slug === normalized)) {
    return true;
  }

  return resolveEngine6ConfiguredPathsForRoutePrefix(
    `/destinations/${normalized}/`
  ).length > 0;
};

export const resolveEngine6ValidationCohortsForDestinationSlug = (
  destinationCitySlug: string
): Engine6DestinationValidationCohort[] => {
  const labels = new Set(
    resolveEngine6DestinationLabelsForSlug(destinationCitySlug)
  );

  if (labels.size === 0) {
    return [];
  }

  return ENGINE6_DESTINATION_VALIDATION_COHORTS.filter(cohort =>
    labels.has(cohort.label)
  );
};

export const validateEngine6DestinationInfrastructure = (args: {
  spec: Engine6DestinationInfrastructureSpec;
  deployScopedProductCodes?: readonly string[];
  requireCanonicalHero?: boolean;
}): Engine6DestinationInfrastructureReport => {
  const { spec } = args;
  const routePrefix = buildEngine6DestinationRoutePrefix({
    stateSlug: spec.stateSlug,
    citySlug: spec.citySlug,
  });
  const checks: Engine6DestinationInfrastructureCheck[] = [];

  const state = getStateBySlug(spec.stateSlug);
  checks.push({
    id: "state-registry",
    pass: Boolean(state),
    message: state
      ? `State registry includes ${spec.stateSlug}`
      : `State registry missing required state: ${spec.stateSlug}`,
    detail: state
      ? undefined
      : "Register the state in destinations.ts before generating Engine6 fixtures.",
  });

  const cityOptions = getStateCityOptions(spec.stateSlug);
  const cityInRegistry =
    Boolean(state?.cities.some(city => city.slug === spec.citySlug)) ||
    cityOptions.some(option => option.slug === spec.citySlug);
  checks.push({
    id: "city-registry",
    pass: cityInRegistry,
    message: cityInRegistry
      ? `City registry includes ${spec.citySlug}`
      : `City registry missing required city: ${spec.stateSlug}/${spec.citySlug}`,
    detail: cityInRegistry
      ? undefined
      : "Register the city under the state destination before generating Engine6 fixtures.",
  });

  const stateInSelector = isEngine6StateInToursSelector(spec.stateSlug);
  checks.push({
    id: "tours-state-selector",
    pass: stateInSelector,
    message: stateInSelector
      ? `Tours page state selector includes ${spec.stateSlug}`
      : `Tours page state selector missing state: ${spec.stateSlug}`,
  });

  const cityInSelector = cityOptions.some(option => option.slug === spec.citySlug);
  checks.push({
    id: "tours-city-selector",
    pass: cityInSelector,
    message: cityInSelector
      ? `Tours page city selector includes ${spec.citySlug}`
      : `Tours page city selector missing city: ${spec.citySlug}`,
    detail: cityInSelector
      ? undefined
      : "City must appear after selecting the state on /tours.",
  });

  const configuredPaths = resolveEngine6ConfiguredPathsForRoutePrefix(routePrefix);
  checks.push({
    id: "route-prefix",
    pass: configuredPaths.length > 0,
    message:
      configuredPaths.length > 0
        ? `Route prefix registered (${configuredPaths.length} tour route(s))`
        : `Route prefix missing: ${routePrefix}`,
    detail:
      configuredPaths.length > 0
        ? undefined
        : "Register Engine6 routes in routes.ts before fixture generation.",
  });

  const governanceLabels = resolveEngine6DestinationLabelsForSlug(
    spec.destinationCitySlug
  );
  const governanceScopeRegistered =
    governanceLabels.length > 0 ||
    Object.prototype.hasOwnProperty.call(
      ENGINE6_DESTINATION_SLUG_COHORT_LABELS,
      spec.destinationCitySlug.trim().toLowerCase()
    );
  checks.push({
    id: "governance-scope",
    pass: governanceScopeRegistered,
    message: governanceScopeRegistered
      ? `Governance scope mapping resolves for ${spec.destinationCitySlug}`
      : `Governance scope mapping missing for ${spec.destinationCitySlug}`,
    detail: governanceScopeRegistered
      ? undefined
      : "Add ENGINE6_DESTINATION_SLUG_COHORT_LABELS entry before deploy-scoped governance can run.",
  });

  const canonicalHero = resolveEngine6CanonicalCityHero(
    spec.stateSlug,
    spec.citySlug
  );
  const canonicalHeroReady = isDisplayableEngine6HeroUrl(canonicalHero);
  const requireCanonicalHero = args.requireCanonicalHero ?? true;
  checks.push({
    id: "canonical-hero-fallback",
    pass: !requireCanonicalHero || canonicalHeroReady,
    message: canonicalHeroReady
      ? "Canonical city hero fallback resolves"
      : `Canonical city hero fallback missing for ${spec.stateSlug}/${spec.citySlug}`,
    detail: canonicalHeroReady
      ? undefined
      : "Register a canonical city hero in displayHero.ts as the last-resort fallback.",
  });

  const validationCohorts = resolveEngine6ValidationCohortsForDestinationSlug(
    spec.destinationCitySlug
  );
  const heroCohortReady = validationCohorts.some(
    cohort => cohort.requireUniqueListingHeroes
  );
  checks.push({
    id: "validation-cohort",
    pass: validationCohorts.length > 0 && heroCohortReady,
    message:
      validationCohorts.length > 0 && heroCohortReady
        ? `Validation cohort registered (${validationCohorts.map(c => c.label).join(", ")})`
        : `Validation cohort missing for ${spec.destinationCitySlug}`,
    detail:
      validationCohorts.length > 0 && heroCohortReady
        ? undefined
        : "Add destination validation cohort(s) in engine6DestinationValidationCohorts.ts.",
  });

  const deployScoped = (args.deployScopedProductCodes ?? [])
    .map(code => code.trim().toUpperCase())
    .filter(Boolean);
  const scopedPaths = deployScoped
    .map(code => resolveEngine6PathForProductCode(code))
    .filter((path): path is string => Boolean(path));
  const unresolvedDeployScoped = deployScoped.filter(
    code => !resolveEngine6PathForProductCode(code)
  );
  const fixtureTargetDeployScoped =
    deployScoped.length === 0 ||
    (unresolvedDeployScoped.length === 0 &&
      scopedPaths.every(path => path.startsWith(routePrefix)));
  checks.push({
    id: "fixture-target-path",
    pass: fixtureTargetDeployScoped,
    message: fixtureTargetDeployScoped
      ? "Fixture generation target paths are deploy-scoped to the destination route prefix"
      : unresolvedDeployScoped.length > 0
        ? `Deploy-scoped product codes missing routes: ${unresolvedDeployScoped.join(", ")}`
        : "Fixture generation includes product codes outside the destination route prefix",
    detail: fixtureTargetDeployScoped
      ? undefined
      : `All deploy-scoped product codes must resolve under ${routePrefix}`,
  });

  const blockingFailures = checks.filter(check => !check.pass);

  return {
    destinationLabel: spec.destinationLabel,
    destinationCitySlug: spec.destinationCitySlug,
    stateSlug: spec.stateSlug,
    citySlug: spec.citySlug,
    routePrefix,
    pass: blockingFailures.length === 0,
    checks,
    blockingFailures,
  };
};

export const formatEngine6DestinationInfrastructureReport = (
  report: Engine6DestinationInfrastructureReport
) => {
  const lines = [
    `# Engine6 Destination Infrastructure Validation`,
    "",
    `Destination: ${report.destinationLabel}`,
    `Slug: ${report.destinationCitySlug}`,
    `Route prefix: ${report.routePrefix}`,
    `Pass: ${report.pass ? "yes" : "no"}`,
    "",
    "## Checks",
    "",
    ...report.checks.map(
      check =>
        `- [${check.pass ? "x" : " "}] **${check.id}**: ${check.message}${
          check.detail ? ` (${check.detail})` : ""
        }`
    ),
  ];

  if (report.blockingFailures.length > 0) {
    lines.push("", "## Blocking failures", "");
    for (const failure of report.blockingFailures) {
      lines.push(`- **${failure.id}**: ${failure.message}`);
      if (failure.detail) {
        lines.push(`  - ${failure.detail}`);
      }
    }
  }

  return lines.join("\n");
};

export class Engine6DestinationInfrastructureError extends Error {
  readonly report: Engine6DestinationInfrastructureReport;

  constructor(report: Engine6DestinationInfrastructureReport) {
    super(
      `Engine6 destination infrastructure validation failed for ${report.destinationLabel}: ${report.blockingFailures
        .map(failure => failure.id)
        .join(", ")}`
    );
    this.name = "Engine6DestinationInfrastructureError";
    this.report = report;
  }
}

export const assertEngine6DestinationInfrastructureReady = (args: {
  spec: Engine6DestinationInfrastructureSpec;
  deployScopedProductCodes?: readonly string[];
  requireCanonicalHero?: boolean;
}) => {
  const report = validateEngine6DestinationInfrastructure(args);
  if (!report.pass) {
    throw new Engine6DestinationInfrastructureError(report);
  }
  return report;
};
