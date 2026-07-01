import {
  buildMerchantFeedBranchScopedGovernanceByProductCode,
  buildMerchantFeedPublishedBaselineCatalog,
  type MerchantFeedGovernanceTier,
} from "../../api/engine6/merchantFeedBaselineGovernance.js";
import { parseMerchantFeedCsvRows } from "../../api/engine6/merchantFeedChangeScopeGovernance.js";
import { MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE } from "../../api/engine6/merchantFeedCommercialRefreshGovernance.js";
import { partitionMerchantFeedParityFailuresByBuildScope } from "../../scripts/generate-merchant-feed.js";
import { toEngine6Card } from "./cards.js";
import {
  buildEngine6CardDescription,
  hasEngine6CardForbiddenTemplatePhrase,
  isEngine6CardDescriptionDerivedFromGovernedSource,
  resolveEngine6GovernedProductDescription,
  resolveEngine6SchemaProductDescription,
} from "./governedEditorialDescriptions.js";
import {
  formatEngine6LiveViatorProductionValidationReport,
  type Engine6LiveViatorProductionValidationReport,
  type Engine6LiveViatorValidationMode,
} from "./engine6LiveViatorProductionValidation.js";
import { buildEngine6ItineraryGovernanceAudit } from "./itineraryGovernanceAudit.js";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility.js";
import { engine6ListingTours } from "./listing.js";
import {
  applyMerchantFeedImageGovernance,
  type MerchantFeedImageGovernanceReport,
  type ValidateEngine6MerchantFeedImageUrl,
} from "./merchantFeedImageGovernance.js";
import {
  auditEngine6MerchantFeedCommercialParity,
  auditEngine6MerchantFeedSchemaParity,
  compareMerchantFeedRowToProductSchema,
} from "./merchantFeedParity.js";
import {
  hasEngine6SupplierNarrativeMarketingBoilerplate,
  ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS,
} from "./normalizeEngine6SupplierNarrative.js";
import { resolveEngine6ProductCodesChangedSinceRefSafe } from "./resolveEngine6ChangedProductCodes.js";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph.js";
import { ENGINE6_CONFIGURED_PRODUCT_CODES } from "./routes.js";
import type { Engine6Tour } from "./types.js";
import { ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS } from "./viatorPublicAvailability.js";
import {
  isEngine6ProductSelectionBlocklisted,
  type Engine6ProductSelectionGovernanceReport,
} from "./engine6ProductSelectionGovernance.js";

export type Engine6Stage2GovernanceAuditMode = Engine6LiveViatorValidationMode;

export type Engine6Stage2GovernanceArea =
  | "live-viator"
  | "product-selection"
  | "merchant-feed-commercial-refresh"
  | "merchant-feed-image"
  | "description-title"
  | "itinerary-title"
  | "route-sitemap-merchant-feed-parity"
  | "product-code-blocklist"
  | "destination-cohort";

export type Engine6Stage2GovernanceFindingSeverity = "blocking" | "legacy";

export type Engine6Stage2GovernanceFinding = {
  area: Engine6Stage2GovernanceArea;
  productCode: string | null;
  severity: Engine6Stage2GovernanceFindingSeverity;
  message: string;
};

export type Engine6Stage2GovernanceAreaSummary = {
  area: Engine6Stage2GovernanceArea;
  blockingCount: number;
  legacyCount: number;
  pass: boolean;
};

export type Engine6Stage2GovernanceAuditReport = {
  generatedAt: string;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: string[];
  blockingPassed: boolean;
  passed: boolean;
  totals: {
    blockingFindings: number;
    legacyFindings: number;
    areasAudited: number;
    areasPassed: number;
  };
  areaSummaries: Engine6Stage2GovernanceAreaSummary[];
  findings: Engine6Stage2GovernanceFinding[];
  liveViator?: Engine6LiveViatorProductionValidationReport;
  productSelection?: Engine6ProductSelectionGovernanceReport;
  merchantFeedImage?: MerchantFeedImageGovernanceReport;
  notes: string[];
};

export type Engine6DestinationValidationCohort = {
  label: string;
  matches: (tour: Engine6Tour) => boolean;
  /** When set, every listing-card hero in the cohort must be unique. */
  requireUniqueListingHeroes?: boolean;
};

export const ENGINE6_DESTINATION_VALIDATION_COHORTS: Engine6DestinationValidationCohort[] =
  [
    {
      label: "Monterey",
      matches: tour =>
        /\/monterey\//i.test(tour.canonicalPath) ||
        /\bmonterey\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Napa",
      matches: tour =>
        /\/napa\//i.test(tour.canonicalPath) || /\bnapa\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Lake Tahoe",
      matches: tour =>
        /\/lake-tahoe\//i.test(tour.canonicalPath) ||
        /\blake tahoe\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Yosemite",
      matches: tour =>
        /\/yosemite\//i.test(tour.canonicalPath) ||
        /\byosemite\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Grand Canyon",
      matches: tour =>
        /\/grand-canyon-national-park\//i.test(tour.canonicalPath) ||
        /\bgrand canyon\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Yellowstone",
      matches: tour =>
        /\/yellowstone-national-park\//i.test(tour.canonicalPath) ||
        /\byellowstone\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Zion",
      matches: tour =>
        /\/zion-national-park\//i.test(tour.canonicalPath) ||
        /\bzion\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Napa editorial narrative",
      matches: tour =>
        /\/napa\//i.test(tour.canonicalPath) || /\bnapa\b/i.test(tour.city),
    },
    {
      label: "Monterey editorial narrative",
      matches: tour =>
        /\/monterey\//i.test(tour.canonicalPath) ||
        /\bmonterey\b/i.test(tour.city),
    },
    {
      label: "Miami editorial narrative",
      matches: tour =>
        /\/miami\//i.test(tour.canonicalPath) || /\bmiami\b/i.test(tour.city),
    },
    {
      label: "New York editorial narrative",
      matches: tour =>
        /\/new-york\//i.test(tour.canonicalPath) ||
        /\bnew york\b/i.test(tour.city),
    },
  ];

const STAGE2_AREAS: Engine6Stage2GovernanceArea[] = [
  "live-viator",
  "product-selection",
  "merchant-feed-commercial-refresh",
  "merchant-feed-image",
  "description-title",
  "itinerary-title",
  "route-sitemap-merchant-feed-parity",
  "product-code-blocklist",
  "destination-cohort",
];

const normalizeProductCode = (productCode: string | null | undefined) =>
  productCode?.trim().toUpperCase() ?? "";

const AOA_ORIGIN = "https://www.alloutdooradventures.com";

export const resolveEngine6Stage2ScopedProductCodes = (args?: {
  mode?: Engine6Stage2GovernanceAuditMode;
  branchModifiedProductCodes?: ReadonlySet<string>;
  headRef?: string;
}): {
  scopedProductCodes: string[];
  baseRef: string | null;
  warning: string | null;
} => {
  const branchModified = args?.branchModifiedProductCodes ?? new Set<string>();
  const scoped = new Set<string>();

  for (const code of branchModified) {
    const normalized = normalizeProductCode(code);
    if (normalized) {
      scoped.add(normalized);
    }
  }

  if ((args?.mode ?? "pr-scoped") === "pr-scoped") {
    const resolution = resolveEngine6ProductCodesChangedSinceRefSafe({
      headRef: args?.headRef,
    });

    for (const code of resolution.productCodes) {
      scoped.add(normalizeProductCode(code));
    }

    return {
      scopedProductCodes: [...scoped].sort(),
      baseRef: resolution.baseRef,
      warning: resolution.warning,
    };
  }

  return {
    scopedProductCodes: [...scoped].sort(),
    baseRef: null,
    warning: null,
  };
};

export const isEngine6Stage2StrictScopeProduct = (
  productCode: string | null | undefined,
  scopedProductCodes: ReadonlySet<string>
) => {
  const normalized = normalizeProductCode(productCode);
  if (!normalized) {
    return false;
  }

  return scopedProductCodes.has(normalized);
};

export const classifyEngine6Stage2FindingSeverity = (args: {
  mode: Engine6Stage2GovernanceAuditMode;
  productCode: string | null | undefined;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFindingSeverity => {
  if (args.mode === "strict") {
    return "blocking";
  }

  return isEngine6Stage2StrictScopeProduct(
    args.productCode,
    args.scopedProductCodes
  )
    ? "blocking"
    : "legacy";
};

export const createEngine6Stage2GovernanceFinding = (args: {
  area: Engine6Stage2GovernanceArea;
  productCode: string | null;
  message: string;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding => ({
  area: args.area,
  productCode: args.productCode,
  message: args.message,
  severity: classifyEngine6Stage2FindingSeverity({
    mode: args.mode,
    productCode: args.productCode,
    scopedProductCodes: args.scopedProductCodes,
  }),
});

export const parseSitemapTourPaths = (sitemapXml: string) => {
  const paths = new Set<string>();

  for (const match of sitemapXml.matchAll(
    /<loc>https:\/\/www\.alloutdooradventures\.com([^<]+)<\/loc>/g
  )) {
    paths.add(match[1].replace(/\/$/, ""));
  }

  return paths;
};

export const auditEngine6DescriptionTitleGovernance = (args: {
  tours: Engine6Tour[];
  merchantRowsByProductCode: Map<string, Record<string, string>>;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];

  for (const tour of args.tours) {
    const row = args.merchantRowsByProductCode.get(tour.productCode);
    const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
      Record<string, unknown>
    >;
    const productNode = graph.find(node => node["@type"] === "Product");
    const productName =
      typeof productNode?.name === "string" ? productNode.name.trim() : "";
    const schemaDescription = resolveEngine6SchemaProductDescription(tour);
    const governedDescription = resolveEngine6GovernedProductDescription(tour);
    const card = toEngine6Card(tour);
    const cardDescription = buildEngine6CardDescription(tour);

    if (row && row.title && productName && row.title !== productName) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "description-title",
          productCode: tour.productCode,
          message: `merchant feed title does not match Product JSON-LD name (${row.title} != ${productName})`,
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }

    if (
      row &&
      row.description &&
      governedDescription &&
      row.description !== governedDescription
    ) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "description-title",
          productCode: tour.productCode,
          message: "merchant feed description does not match governed editorial description",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }

    if (
      card.description &&
      !isEngine6CardDescriptionDerivedFromGovernedSource(
        card.description,
        governedDescription
      )
    ) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "description-title",
          productCode: tour.productCode,
          message: "listing card description is not derived from governed editorial description",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }

    if (
      cardDescription &&
      card.description &&
      card.description !== cardDescription
    ) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "description-title",
          productCode: tour.productCode,
          message: "listing card description diverges from buildEngine6CardDescription output",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }

    for (const value of [card.description, schemaDescription, row?.description]) {
      if (!value) {
        continue;
      }

      if (hasEngine6CardForbiddenTemplatePhrase(value)) {
        findings.push(
          createEngine6Stage2GovernanceFinding({
            area: "description-title",
            productCode: tour.productCode,
            message: "forbidden editorial template phrase detected in published description surface",
            mode: args.mode,
            scopedProductCodes: args.scopedProductCodes,
          })
        );
        break;
      }
    }

    if (
      schemaDescription &&
      hasEngine6SupplierNarrativeMarketingBoilerplate(schemaDescription)
    ) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "description-title",
          productCode: tour.productCode,
          message: "schema description retains supplier marketing boilerplate",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }
  }

  return findings;
};

export const auditEngine6ItineraryTitleGovernanceFindings = (args: {
  tours: Engine6Tour[];
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
  generatedAt?: string;
}): Engine6Stage2GovernanceFinding[] => {
  const audit = buildEngine6ItineraryGovernanceAudit(
    args.tours,
    args.generatedAt
  );
  const findings: Engine6Stage2GovernanceFinding[] = [];

  for (const row of audit.rows) {
    for (const finding of row.findings) {
      if (finding.severity !== "critical") {
        continue;
      }

      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "itinerary-title",
          productCode: row.productId,
          message: `itinerary stop ${row.itineraryIndex + 1}: ${finding.reason}`,
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }
  }

  return findings;
};

export const auditEngine6RouteSitemapMerchantFeedParity = (args: {
  tours: Engine6Tour[];
  merchantRowsByProductCode: Map<string, Record<string, string>>;
  sitemapTourPaths: ReadonlySet<string>;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];
  const eligibleByCode = new Map(
    merchantFeedEligibleTours.map(tour => [tour.productCode, tour])
  );

  for (const tour of merchantFeedEligibleTours) {
    const row = args.merchantRowsByProductCode.get(tour.productCode);
    const canonicalUrl = `${AOA_ORIGIN}${tour.canonicalPath}`;

    if (!row) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "route-sitemap-merchant-feed-parity",
          productCode: tour.productCode,
          message: "merchant feed eligible tour is missing a merchantFeed.csv row",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
      continue;
    }

    if (row.link !== canonicalUrl) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "route-sitemap-merchant-feed-parity",
          productCode: tour.productCode,
          message: `merchant feed link does not match canonical route (${row.link} != ${canonicalUrl})`,
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }

    if (!args.sitemapTourPaths.has(tour.canonicalPath)) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "route-sitemap-merchant-feed-parity",
          productCode: tour.productCode,
          message: `canonical route missing from sitemap-tours.xml (${tour.canonicalPath})`,
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }
  }

  for (const [productCode, row] of args.merchantRowsByProductCode.entries()) {
    const tour = eligibleByCode.get(productCode) ?? args.tours.find(
      candidate => candidate.productCode === productCode
    );

    if (!tour) {
      continue;
    }

    const parity = compareMerchantFeedRowToProductSchema(
      tour,
      row as Record<string, string>
    );
    if (!parity.pass) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "route-sitemap-merchant-feed-parity",
          productCode,
          message: `merchant feed row diverged from Product JSON-LD (${parity.mismatches.join("; ")})`,
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }
  }

  return findings;
};

export const auditEngine6ProductCodeBlocklistEnforcement = (args: {
  tours: Engine6Tour[];
  merchantRowsByProductCode: Map<string, Record<string, string>>;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];
  const blocklistedCodes = Object.keys(
    ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS
  );

  for (const productCode of blocklistedCodes) {
    if (ENGINE6_CONFIGURED_PRODUCT_CODES.includes(productCode)) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "product-code-blocklist",
          productCode,
          message:
            "known-unavailable Viator product remains configured in ENGINE6_CONFIGURED_PRODUCT_CODES",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }

    if (args.merchantRowsByProductCode.has(productCode)) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "product-code-blocklist",
          productCode,
          message:
            "known-unavailable Viator product still has a merchantFeed.csv row",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }

    const activeTour = args.tours.find(
      tour => tour.productCode === productCode
    );
    if (activeTour && merchantFeedEligibleTours.some(
      tour => tour.productCode === productCode
    )) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "product-code-blocklist",
          productCode,
          message:
            "known-unavailable Viator product remains merchant-feed eligible in resolved catalog",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }
  }

  return findings;
};

export const auditEngine6DestinationCohortConsistency = (args: {
  tours: Engine6Tour[];
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
  cohorts?: Engine6DestinationValidationCohort[];
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];
  const cohorts = args.cohorts ?? ENGINE6_DESTINATION_VALIDATION_COHORTS;
  const seenHeroCohorts = new Set<string>();

  for (const cohort of cohorts) {
    const cohortTours = args.tours.filter(cohort.matches);
    if (cohortTours.length === 0) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "destination-cohort",
          productCode: null,
          message: `${cohort.label} validation cohort has zero resolved tours`,
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
      continue;
    }

    if (
      cohort.requireUniqueListingHeroes &&
      !seenHeroCohorts.has(`${cohort.label}:heroes`)
    ) {
      seenHeroCohorts.add(`${cohort.label}:heroes`);
      const cohortProductCodes = new Set(
        cohortTours.map(tour => tour.productCode)
      );
      const listingTours = engine6ListingTours.filter(
        listing =>
          listing.engine === "engine6" &&
          listing.productCode &&
          cohortProductCodes.has(listing.productCode)
      );
      const heroCounts = listingTours.reduce<Map<string, number>>(
        (counts, tour) => {
          const hero = tour.heroImage?.trim() || "";
          counts.set(hero, (counts.get(hero) ?? 0) + 1);
          return counts;
        },
        new Map()
      );

      const duplicateHeroes = [...heroCounts.entries()].filter(
        ([, count]) => count > 1
      );
      if (duplicateHeroes.length > 0) {
        for (const [hero, count] of duplicateHeroes) {
          findings.push(
            createEngine6Stage2GovernanceFinding({
              area: "destination-cohort",
              productCode: null,
              message: `${cohort.label} cohort repeats listing-card hero ${count}x (${hero})`,
              mode: args.mode,
              scopedProductCodes: args.scopedProductCodes,
            })
          );
        }
      }
    }

    if (!cohort.label.includes("editorial narrative")) {
      continue;
    }

    for (const tour of cohortTours) {
      const schemaDescription = resolveEngine6SchemaProductDescription(tour);
      if (
        hasEngine6SupplierNarrativeMarketingBoilerplate(schemaDescription)
      ) {
        findings.push(
          createEngine6Stage2GovernanceFinding({
            area: "destination-cohort",
            productCode: tour.productCode,
            message: `${cohort.label}: schema description retains supplier marketing boilerplate`,
            mode: args.mode,
            scopedProductCodes: args.scopedProductCodes,
          })
        );
      }

      for (const pattern of ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS) {
        if (pattern.test(schemaDescription)) {
          findings.push(
            createEngine6Stage2GovernanceFinding({
              area: "destination-cohort",
              productCode: tour.productCode,
              message: `${cohort.label}: schema description matches banned supplier narrative pattern`,
              mode: args.mode,
              scopedProductCodes: args.scopedProductCodes,
            })
          );
          break;
        }
      }
    }
  }

  return findings;
};

export const auditEngine6MerchantFeedCommercialRefreshGovernance = (args: {
  tours: Engine6Tour[];
  merchantRowsByProductCode: Map<string, Record<string, string>>;
  baselineRows: Array<Record<string, string>>;
  governanceByProductCode: Map<string, MerchantFeedGovernanceTier>;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];

  for (const row of args.baselineRows) {
    const productCode = normalizeProductCode(row.id);
    if (!productCode) {
      continue;
    }

    const reviewCount = row.review_count ?? "";
    const ratingCount = row.rating_count ?? "";
    if (reviewCount !== ratingCount) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "merchant-feed-commercial-refresh",
          productCode,
          message:
            "merchant feed rating_count is not synchronized with review_count",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }
  }

  const schemaParity = auditEngine6MerchantFeedSchemaParity(
    args.tours,
    args.merchantRowsByProductCode
  );
  const commercialParity = auditEngine6MerchantFeedCommercialParity(
    args.tours,
    args.merchantRowsByProductCode
  );

  const schemaScope = partitionMerchantFeedParityFailuresByBuildScope(
    schemaParity.failures,
    args.governanceByProductCode
  );
  const commercialScope = partitionMerchantFeedParityFailuresByBuildScope(
    commercialParity.failures,
    args.governanceByProductCode
  );

  const pushCommercialFinding = (
    failure: string,
    severity: Engine6Stage2GovernanceFindingSeverity
  ) => {
    findings.push({
      area: "merchant-feed-commercial-refresh",
      productCode: parseMerchantFeedParityFailureProductCode(failure) || null,
      message: failure,
      severity,
    });
  };

  for (const failure of [
    ...schemaScope.blockingFailures,
    ...commercialScope.blockingFailures,
  ]) {
    pushCommercialFinding(failure, "blocking");
  }

  for (const failure of [
    ...schemaScope.informationalLegacyFailures,
    ...commercialScope.informationalLegacyFailures,
  ]) {
    pushCommercialFinding(
      failure,
      args.mode === "strict" ? "blocking" : "legacy"
    );
  }

  return findings;
};

const parseMerchantFeedParityFailureProductCode = (failure: string) => {
  const [productCode = ""] = failure.split(/[:.]/);
  return normalizeProductCode(productCode);
};

export const auditEngine6ProductSelectionGovernanceFindings = (args: {
  report?: Engine6ProductSelectionGovernanceReport;
  tours: Engine6Tour[];
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];

  for (const tour of args.tours) {
    if (isEngine6ProductSelectionBlocklisted(tour.productCode)) {
      findings.push(
        createEngine6Stage2GovernanceFinding({
          area: "product-selection",
          productCode: tour.productCode,
          message:
            "configured tour uses a product on the permanent product-selection blocklist",
          mode: args.mode,
          scopedProductCodes: args.scopedProductCodes,
        })
      );
    }
  }

  if (!args.report) {
    return findings;
  }

  if (!args.report.buildOrderPreserved) {
    findings.push(
      createEngine6Stage2GovernanceFinding({
        area: "product-selection",
        productCode: null,
        message: "deterministic Engine6 build order was not preserved",
        mode: args.mode,
        scopedProductCodes: args.scopedProductCodes,
      })
    );
  }

  if (args.mode === "pr-scoped" && !args.report.onlyNewProductsCouldBlock) {
    findings.push(
      createEngine6Stage2GovernanceFinding({
        area: "product-selection",
        productCode: null,
        message:
          "product selection governance did not restrict blocking to PR-scoped products",
        mode: args.mode,
        scopedProductCodes: args.scopedProductCodes,
      })
    );
  }

  for (const failure of args.report.blockingFailures) {
    findings.push(
      createEngine6Stage2GovernanceFinding({
        area: "product-selection",
        productCode: failure.productCode,
        message: failure.detail,
        mode: args.mode,
        scopedProductCodes: args.scopedProductCodes,
      })
    );
  }

  for (const slot of args.report.unfilledSlots) {
    findings.push(
      createEngine6Stage2GovernanceFinding({
        area: "product-selection",
        productCode: null,
        message: `${slot.experienceType} slot unfilled (${slot.acceptedCount}/${slot.desiredCount})`,
        mode: args.mode,
        scopedProductCodes: args.scopedProductCodes,
      })
    );
  }

  return findings;
};

export const auditEngine6LiveViatorGovernanceFindings = (args: {
  report: Engine6LiveViatorProductionValidationReport;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];

  for (const failure of args.report.blockingFailures) {
    findings.push({
      area: "live-viator",
      productCode: failure.productCode,
      message: failure.reason ?? "live Viator validation failed",
      severity: "blocking",
    });
  }

  for (const failure of args.report.legacyFailures) {
    findings.push({
      area: "live-viator",
      productCode: failure.productCode,
      message: failure.reason ?? "live Viator validation failed",
      severity: args.mode === "strict" ? "blocking" : "legacy",
    });
  }

  return findings;
};

export const auditEngine6MerchantFeedImageGovernanceFindings = (args: {
  report: MerchantFeedImageGovernanceReport;
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: ReadonlySet<string>;
}): Engine6Stage2GovernanceFinding[] => {
  const findings: Engine6Stage2GovernanceFinding[] = [];

  for (const failure of args.report.failures) {
    findings.push({
      area: "merchant-feed-image",
      productCode: failure.productCode,
      message: `unrecoverable merchant feed image failure (${failure.lastReason ?? "invalid"}; attempted ${failure.attemptedUrls.length} URL(s))`,
      severity: "blocking",
    });
  }

  for (const productCode of args.report.informationalLegacyProductCodes) {
    findings.push({
      area: "merchant-feed-image",
      productCode,
      message: "legacy merchant feed image could not be validated or repaired",
      severity: args.mode === "strict" ? "blocking" : "legacy",
    });
  }

  return findings;
};

const summarizeAreas = (
  findings: Engine6Stage2GovernanceFinding[]
): Engine6Stage2GovernanceAreaSummary[] =>
  STAGE2_AREAS.map(area => {
    const areaFindings = findings.filter(finding => finding.area === area);
    const blockingCount = areaFindings.filter(
      finding => finding.severity === "blocking"
    ).length;
    const legacyCount = areaFindings.filter(
      finding => finding.severity === "legacy"
    ).length;

    return {
      area,
      blockingCount,
      legacyCount,
      pass: blockingCount === 0,
    };
  });

export const buildEngine6Stage2GovernanceAuditReport = (args: {
  mode: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes: string[];
  findings: Engine6Stage2GovernanceFinding[];
  generatedAt?: string;
  liveViator?: Engine6LiveViatorProductionValidationReport;
  productSelection?: Engine6ProductSelectionGovernanceReport;
  merchantFeedImage?: MerchantFeedImageGovernanceReport;
  notes?: string[];
}): Engine6Stage2GovernanceAuditReport => {
  const areaSummaries = summarizeAreas(args.findings);
  const blockingFindings = args.findings.filter(
    finding => finding.severity === "blocking"
  ).length;
  const legacyFindings = args.findings.filter(
    finding => finding.severity === "legacy"
  ).length;
  const blockingPassed = blockingFindings === 0;

  return {
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    mode: args.mode,
    scopedProductCodes: [...args.scopedProductCodes].sort(),
    blockingPassed,
    passed: args.mode === "strict" ? blockingFindings === 0 : blockingPassed,
    totals: {
      blockingFindings,
      legacyFindings,
      areasAudited: STAGE2_AREAS.length,
      areasPassed: areaSummaries.filter(summary => summary.pass).length,
    },
    areaSummaries,
    findings: args.findings,
    liveViator: args.liveViator,
    productSelection: args.productSelection,
    merchantFeedImage: args.merchantFeedImage,
    notes: args.notes ?? [],
  };
};

export type BuildEngine6Stage2GovernanceAuditArgs = {
  tours: Engine6Tour[];
  merchantFeedCsvContent: string;
  sitemapTourXmlContent: string;
  mode?: Engine6Stage2GovernanceAuditMode;
  scopedProductCodes?: string[];
  branchModifiedProductCodes?: ReadonlySet<string>;
  generatedAt?: string;
  validateImageUrl?: ValidateEngine6MerchantFeedImageUrl;
  liveViator?: Engine6LiveViatorProductionValidationReport;
  productSelection?: Engine6ProductSelectionGovernanceReport;
  skipAsyncImageAudit?: boolean;
};

export const buildEngine6Stage2GovernanceAudit = async (
  args: BuildEngine6Stage2GovernanceAuditArgs
): Promise<Engine6Stage2GovernanceAuditReport> => {
  const mode = args.mode ?? "pr-scoped";
  const scopeResolution = resolveEngine6Stage2ScopedProductCodes({
    mode,
    branchModifiedProductCodes: args.branchModifiedProductCodes,
  });
  const scopedProductCodes =
    args.scopedProductCodes ?? scopeResolution.scopedProductCodes;
  const scopedSet = new Set(
    scopedProductCodes.map(code => normalizeProductCode(code))
  );
  const notes = [...(scopeResolution.warning ? [scopeResolution.warning] : [])];
  notes.push(MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE);

  const merchantRows = parseMerchantFeedCsvRows(args.merchantFeedCsvContent);
  const merchantRowsByProductCode = new Map(
    merchantRows.map(row => [row.id, row as Record<string, string>])
  );
  const baselineCatalog = buildMerchantFeedPublishedBaselineCatalog(merchantRows);
  const governanceByProductCode =
    buildMerchantFeedBranchScopedGovernanceByProductCode(
      merchantRows,
      baselineCatalog,
      args.branchModifiedProductCodes ?? scopedSet
    );
  const sitemapTourPaths = parseSitemapTourPaths(args.sitemapTourXmlContent);
  const eligibleTours = merchantFeedEligibleTours;

  const findings: Engine6Stage2GovernanceFinding[] = [
    ...auditEngine6MerchantFeedCommercialRefreshGovernance({
      tours: eligibleTours,
      merchantRowsByProductCode,
      baselineRows: merchantRows,
      governanceByProductCode,
      mode,
      scopedProductCodes: scopedSet,
    }),
    ...auditEngine6DescriptionTitleGovernance({
      tours: args.tours,
      merchantRowsByProductCode,
      mode,
      scopedProductCodes: scopedSet,
    }),
    ...auditEngine6ItineraryTitleGovernanceFindings({
      tours: args.tours,
      mode,
      scopedProductCodes: scopedSet,
      generatedAt: args.generatedAt,
    }),
    ...auditEngine6RouteSitemapMerchantFeedParity({
      tours: args.tours,
      merchantRowsByProductCode,
      sitemapTourPaths,
      mode,
      scopedProductCodes: scopedSet,
    }),
    ...auditEngine6ProductCodeBlocklistEnforcement({
      tours: args.tours,
      merchantRowsByProductCode,
      mode,
      scopedProductCodes: scopedSet,
    }),
    ...auditEngine6DestinationCohortConsistency({
      tours: args.tours,
      mode,
      scopedProductCodes: scopedSet,
    }),
  ];

  let merchantFeedImage: MerchantFeedImageGovernanceReport | undefined;
  if (!args.skipAsyncImageAudit) {
    const imageRows = merchantRows.map(row => ({
      id: row.id,
      image_link: row.image_link ?? "",
    }));
    const imageResult = await applyMerchantFeedImageGovernance({
      rows: imageRows,
      toursByProductCode: new Map(
        args.tours.map(tour => [normalizeProductCode(tour.productCode), tour])
      ),
      governanceByProductCode,
      branchModifiedProductCodes: scopedSet,
      validateImageUrl: args.validateImageUrl,
    });
    merchantFeedImage = imageResult.report;
    findings.push(
      ...auditEngine6MerchantFeedImageGovernanceFindings({
        report: imageResult.report,
        mode,
        scopedProductCodes: scopedSet,
      })
    );
  }

  if (args.liveViator) {
    findings.push(
      ...auditEngine6LiveViatorGovernanceFindings({
        report: args.liveViator,
        mode,
        scopedProductCodes: scopedSet,
      })
    );
  }

  findings.push(
    ...auditEngine6ProductSelectionGovernanceFindings({
      report: args.productSelection,
      tours: args.tours,
      mode,
      scopedProductCodes: scopedSet,
    })
  );

  return buildEngine6Stage2GovernanceAuditReport({
    mode,
    scopedProductCodes,
    findings,
    generatedAt: args.generatedAt,
    liveViator: args.liveViator,
    productSelection: args.productSelection,
    merchantFeedImage,
    notes,
  });
};

export const formatEngine6Stage2GovernanceAuditMarkdown = (
  report: Engine6Stage2GovernanceAuditReport
) => {
  const escapeCell = (value: string | number | null) =>
    String(value ?? "")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, " ");

  const lines = [
    "# Engine6 Stage 2 Governance Audit",
    "",
    "Permanent consolidated audit across Engine6 publishing contracts. Report-only by default; blocking applies only to new or modified products in pr-scoped mode.",
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Blocking passed: ${report.blockingPassed}`,
    `Overall passed: ${report.passed}`,
    "",
    "## Scope",
    "",
    `- Deploy-scoped blocking products: ${report.scopedProductCodes.length}`,
    report.scopedProductCodes.length > 0
      ? `- Scoped product codes: ${report.scopedProductCodes.join(", ")}`
      : "- Scoped product codes: none",
    "",
    "## Totals",
    "",
    `- Blocking findings: ${report.totals.blockingFindings}`,
    `- Legacy findings (report-only): ${report.totals.legacyFindings}`,
    `- Areas audited: ${report.totals.areasAudited}`,
    `- Areas passed (no blocking findings): ${report.totals.areasPassed}`,
    "",
    "## Area summary",
    "",
    "| Area | Blocking | Legacy | Pass |",
    "| --- | ---: | ---: | --- |",
    ...report.areaSummaries.map(
      summary =>
        `| ${escapeCell(summary.area)} | ${summary.blockingCount} | ${summary.legacyCount} | ${summary.pass ? "yes" : "no"} |`
    ),
    "",
  ];

  if (report.notes.length > 0) {
    lines.push("## Notes", "");
    for (const note of report.notes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  const blockingFindings = report.findings.filter(
    finding => finding.severity === "blocking"
  );
  if (blockingFindings.length > 0) {
    lines.push("## Blocking findings", "");
    for (const finding of blockingFindings.slice(0, 100)) {
      lines.push(
        `- **${finding.area}**${finding.productCode ? ` (\`${finding.productCode}\`)` : ""}: ${finding.message}`
      );
    }
    if (blockingFindings.length > 100) {
      lines.push(
        `- ...and ${blockingFindings.length - 100} additional blocking finding(s).`
      );
    }
    lines.push("");
  }

  const legacyFindings = report.findings.filter(
    finding => finding.severity === "legacy"
  );
  if (legacyFindings.length > 0) {
    lines.push("## Legacy findings (report-only)", "");
    for (const finding of legacyFindings.slice(0, 100)) {
      lines.push(
        `- **${finding.area}**${finding.productCode ? ` (\`${finding.productCode}\`)` : ""}: ${finding.message}`
      );
    }
    if (legacyFindings.length > 100) {
      lines.push(
        `- ...and ${legacyFindings.length - 100} additional legacy finding(s).`
      );
    }
    lines.push("");
  }

  if (report.liveViator) {
    lines.push("## Live Viator validation excerpt", "", "```text");
    lines.push(formatEngine6LiveViatorProductionValidationReport(report.liveViator));
    lines.push("```", "");
  }

  lines.push(
    "See `reports/engine6-stage2-governance-audit.json` for the full machine-readable report."
  );

  return lines.join("\n");
};
