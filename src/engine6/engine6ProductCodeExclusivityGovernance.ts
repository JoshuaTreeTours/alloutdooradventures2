import { parseEngine6StateCityFromCanonicalPath } from "./displayHero.js";
import { isProductBoundToSameEngine6Destination } from "./engine6DestinationProductBinding.js";
import { resolveEngine6DestinationLabelsForSlug } from "./resolveEngine6GovernanceScope.js";
import {
  ENGINE6_CONFIGURED_PRODUCT_CODES,
  resolveEngine6PathForProductCode,
} from "./routes.js";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures.js";

export const ENGINE6_PRODUCT_CODE_ALLOWLIST_ENV = "ENGINE6_PRODUCT_CODE_ALLOWLIST";

export type Engine6ProductCodeRegistrySource = "routes" | "validation-fixtures";

export type Engine6ProductCodeRegistryEntry = {
  productCode: string;
  destinationCitySlug: string;
  destinationLabel: string;
  canonicalPath: string | null;
  sources: Engine6ProductCodeRegistrySource[];
};

export type Engine6ProductCodeExclusivityAssessment = {
  accepted: boolean;
  violation: "duplicate-engine6-assignment" | null;
  detail: string | null;
  existingOwner: Engine6ProductCodeRegistryEntry | null;
  allowlisted: boolean;
};

export type Engine6ProductCodeExclusivityReportEntry = {
  productCode: string;
  status: "unique" | "accepted-same-destination" | "allowlisted" | "rejected";
  existingOwnerLabel?: string;
  replacementProductCode?: string | null;
};

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

const titleCaseDestinationSlug = (citySlug: string) =>
  citySlug
    .split("-")
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

export const resolveEngine6DestinationLabelForCitySlug = (citySlug: string) => {
  const labels = resolveEngine6DestinationLabelsForSlug(citySlug);
  if (labels.length > 0) {
    return labels[0];
  }

  return titleCaseDestinationSlug(citySlug);
};

const upsertRegistryEntry = (
  registry: Map<string, Engine6ProductCodeRegistryEntry>,
  args: {
    productCode: string;
    destinationCitySlug: string;
    canonicalPath: string | null;
    source: Engine6ProductCodeRegistrySource;
  }
) => {
  const productCode = normalizeProductCode(args.productCode);
  const destinationCitySlug = args.destinationCitySlug.trim().toLowerCase();
  const existing = registry.get(productCode);

  if (existing) {
    if (!existing.sources.includes(args.source)) {
      existing.sources.push(args.source);
    }

    if (!existing.canonicalPath && args.canonicalPath) {
      existing.canonicalPath = args.canonicalPath;
    }

    return;
  }

  registry.set(productCode, {
    productCode,
    destinationCitySlug,
    destinationLabel: resolveEngine6DestinationLabelForCitySlug(
      destinationCitySlug
    ),
    canonicalPath: args.canonicalPath,
    sources: [args.source],
  });
};

export const buildEngine6ProductCodeRegistry = () => {
  const registry = new Map<string, Engine6ProductCodeRegistryEntry>();

  for (const productCode of ENGINE6_CONFIGURED_PRODUCT_CODES) {
    const canonicalPath = resolveEngine6PathForProductCode(productCode);
    const destinationCitySlug = canonicalPath
      ? parseEngine6StateCityFromCanonicalPath(canonicalPath).citySlug
      : "";

    if (!destinationCitySlug) {
      continue;
    }

    upsertRegistryEntry(registry, {
      productCode,
      destinationCitySlug,
      canonicalPath,
      source: "routes",
    });
  }

  for (const fixture of ENGINE6_VALIDATION_FIXTURES) {
    const canonicalPath = resolveEngine6PathForProductCode(fixture.productCode);
    const destinationCitySlug = canonicalPath
      ? parseEngine6StateCityFromCanonicalPath(canonicalPath).citySlug
      : "";

    if (!destinationCitySlug) {
      continue;
    }

    upsertRegistryEntry(registry, {
      productCode: fixture.productCode,
      destinationCitySlug,
      canonicalPath,
      source: "validation-fixtures",
    });
  }

  return registry;
};

let cachedRegistry: ReadonlyMap<string, Engine6ProductCodeRegistryEntry> | null =
  null;

export const getEngine6ProductCodeRegistry = () => {
  if (!cachedRegistry) {
    cachedRegistry = buildEngine6ProductCodeRegistry();
  }

  return cachedRegistry;
};

export const resetEngine6ProductCodeRegistryCacheForTests = () => {
  cachedRegistry = null;
};

export const readEngine6ProductCodeAllowlist = (
  envValue = process.env[ENGINE6_PRODUCT_CODE_ALLOWLIST_ENV]
): ReadonlySet<string> => {
  if (!envValue?.trim()) {
    return new Set();
  }

  return new Set(
    envValue
      .split(",")
      .map(entry => normalizeProductCode(entry))
      .filter(Boolean)
  );
};

export const resolveEngine6ProductCodeOwner = (
  productCode: string,
  registry: ReadonlyMap<string, Engine6ProductCodeRegistryEntry> = getEngine6ProductCodeRegistry()
) => registry.get(normalizeProductCode(productCode)) ?? null;

export const assessEngine6ProductCodeExclusivity = (args: {
  productCode: string;
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
  configPathSlug?: string | null;
  destinationLabel?: string | null;
  allowlist?: ReadonlySet<string>;
  registry?: ReadonlyMap<string, Engine6ProductCodeRegistryEntry>;
}): Engine6ProductCodeExclusivityAssessment => {
  const productCode = normalizeProductCode(args.productCode);
  const allowlist = args.allowlist ?? readEngine6ProductCodeAllowlist();
  const registry = args.registry ?? getEngine6ProductCodeRegistry();
  const existingOwner = registry.get(productCode) ?? null;

  if (allowlist.has(productCode)) {
    return {
      accepted: true,
      violation: null,
      detail: existingOwner
        ? `product ${productCode} is allowlisted for duplicate ownership`
        : null,
      existingOwner,
      allowlisted: true,
    };
  }

  if (!existingOwner) {
    return {
      accepted: true,
      violation: null,
      detail: null,
      existingOwner: null,
      allowlisted: false,
    };
  }

  if (
    isProductBoundToSameEngine6Destination({
      boundCitySlug: existingOwner.destinationCitySlug,
      destinationCitySlug: args.destinationCitySlug,
      viatorDestinationSlug: args.viatorDestinationSlug,
      configPathSlug: args.configPathSlug,
    })
  ) {
    return {
      accepted: true,
      violation: null,
      detail: null,
      existingOwner,
      allowlisted: false,
    };
  }

  return {
    accepted: false,
    violation: "duplicate-engine6-assignment",
    detail: `product ${productCode} is already owned by ${existingOwner.destinationLabel}`,
    existingOwner,
    allowlisted: false,
  };
};

export const buildEngine6ProductCodeExclusivityReportEntry = (args: {
  productCode: string;
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
  configPathSlug?: string | null;
  destinationLabel?: string | null;
  allowlist?: ReadonlySet<string>;
  registry?: ReadonlyMap<string, Engine6ProductCodeRegistryEntry>;
  replacementProductCode?: string | null;
}): Engine6ProductCodeExclusivityReportEntry => {
  const assessment = assessEngine6ProductCodeExclusivity(args);

  if (assessment.allowlisted) {
    return {
      productCode: normalizeProductCode(args.productCode),
      status: "allowlisted",
    };
  }

  if (!assessment.existingOwner) {
    return {
      productCode: normalizeProductCode(args.productCode),
      status: "unique",
    };
  }

  if (assessment.accepted) {
    return {
      productCode: normalizeProductCode(args.productCode),
      status: "accepted-same-destination",
      existingOwnerLabel: assessment.existingOwner.destinationLabel,
    };
  }

  return {
    productCode: normalizeProductCode(args.productCode),
    status: "rejected",
    existingOwnerLabel: assessment.existingOwner.destinationLabel,
    replacementProductCode: args.replacementProductCode ?? null,
  };
};

export const formatEngine6ProductCodeExclusivityGovernanceReport = (args: {
  destinationLabel: string;
  entries: readonly Engine6ProductCodeExclusivityReportEntry[];
}) => {
  const lines = [
    "Engine6 product code exclusivity governance",
    `Destination: ${args.destinationLabel}`,
    "",
  ];

  for (const entry of args.entries) {
    switch (entry.status) {
      case "unique":
        lines.push(`✓ Product ${entry.productCode} unique`);
        break;
      case "accepted-same-destination":
        lines.push(
          `✓ Product ${entry.productCode} already owned by ${entry.existingOwnerLabel ?? args.destinationLabel} (regeneration allowed)`
        );
        break;
      case "allowlisted":
        lines.push(`✓ Product ${entry.productCode} allowlisted duplicate`);
        break;
      case "rejected":
        lines.push(
          `✗ Product ${entry.productCode} already owned by ${entry.existingOwnerLabel ?? "another destination"}`
        );
        lines.push("→ rejected");
        if (entry.replacementProductCode) {
          lines.push(`→ replacement: ${entry.replacementProductCode}`);
        }
        break;
      default:
        break;
    }
  }

  return lines.join("\n");
};

export const buildEngine6ProductCodeExclusivityReportFromSelection = (args: {
  destinationLabel: string;
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
  configPathSlug?: string | null;
  evaluatedProductCodes: readonly string[];
  rejected: readonly {
    productCode: string;
    reason: string;
  }[];
  replacements: readonly {
    rejectedProductCode: string;
    selectedProductCode: string;
  }[];
  allowlist?: ReadonlySet<string>;
  registry?: ReadonlyMap<string, Engine6ProductCodeRegistryEntry>;
}) => {
  const replacementByRejected = new Map(
    args.replacements.map(replacement => [
      normalizeProductCode(replacement.rejectedProductCode),
      normalizeProductCode(replacement.selectedProductCode),
    ])
  );
  const rejectedOwnershipCodes = new Set(
    args.rejected
      .filter(entry => entry.reason === "duplicate-engine6-assignment")
      .map(entry => normalizeProductCode(entry.productCode))
  );

  const entries = args.evaluatedProductCodes.map(productCode => {
    const normalized = normalizeProductCode(productCode);
    return buildEngine6ProductCodeExclusivityReportEntry({
      productCode: normalized,
      destinationCitySlug: args.destinationCitySlug,
      viatorDestinationSlug: args.viatorDestinationSlug,
      configPathSlug: args.configPathSlug,
      destinationLabel: args.destinationLabel,
      allowlist: args.allowlist,
      registry: args.registry,
      replacementProductCode: rejectedOwnershipCodes.has(normalized)
        ? (replacementByRejected.get(normalized) ?? null)
        : null,
    });
  });

  return formatEngine6ProductCodeExclusivityGovernanceReport({
    destinationLabel: args.destinationLabel,
    entries,
  });
};
