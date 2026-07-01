import {
  getEngine6CuratedProductHeroCandidates,
  isDisplayableEngine6HeroUrl,
  resolveEngine6CanonicalCityHero,
  resolveEngine6DisplayHeroFallback,
  ENGINE6_GLOBAL_FALLBACK_HERO_URL,
} from "./displayHero.js";
import {
  areEngine6ExperienceTypesMateriallyCompatible,
  describeEngine6ExperienceTypeMismatch,
  inferEngine6PrincipalExperienceTypeFromProduct,
  normalizeEngine6PrincipalExperienceType,
  type Engine6PrincipalExperienceType,
} from "./engine6PrincipalExperienceType.js";

export type Engine6HeroSourceTier =
  | "product-primary"
  | "product-alternate"
  | "curated-product"
  | "destination-canonical"
  | "global-fallback";

export type Engine6HeroCandidateInput = {
  url: string;
  tier: Engine6HeroSourceTier;
  /** When set, hero inherits this experience type instead of URL inference. */
  experienceType?: Engine6PrincipalExperienceType;
};

export type Engine6HeroIntegrityProductInput = {
  productCode: string;
  title: string;
  experienceType: string;
  categoryLabel?: string | null;
  categories?: string[];
  /** Validated primary hero from the Viator product. */
  productPrimaryHeroUrl?: string | null;
  /** Additional validated product-specific hero URLs from the same product. */
  productAlternateHeroUrls?: string[];
  stateSlug?: string;
  citySlug?: string;
};

export type Engine6HeroIntegrityFailureReason =
  | "missing-hero"
  | "experience-mismatch"
  | "product-hero-bypassed"
  | "itinerary-incidental-hero"
  | "non-displayable-hero";

export type Engine6HeroIntegrityFinding = {
  productCode: string;
  reason: Engine6HeroIntegrityFailureReason;
  detail: string;
  rejectedHeroUrl?: string;
  productExperienceType: Engine6PrincipalExperienceType;
  heroExperienceType?: Engine6PrincipalExperienceType;
};

export type Engine6HeroIntegrityResolution = {
  productCode: string;
  resolvedHeroUrl: string;
  sourceTier: Engine6HeroSourceTier;
  productExperienceType: Engine6PrincipalExperienceType;
  heroExperienceType: Engine6PrincipalExperienceType;
  replacedHeroUrl?: string;
  replacementReason?: string;
};

export type Engine6HeroIntegrityGovernanceReport = {
  generatedAt: string;
  productsEvaluated: number;
  productsPassed: number;
  productsFailed: number;
  heroesReplaced: number;
  findings: Engine6HeroIntegrityFinding[];
  resolutions: Engine6HeroIntegrityResolution[];
  passed: boolean;
};

/** Known hero URLs tagged with principal experience types for fallback validation. */
export const ENGINE6_TAGGED_HERO_EXPERIENCE_TYPES: Record<
  string,
  Engine6PrincipalExperienceType
> = {
  // Glacier failure-mode exemplars — rafting hero must not serve driving tours.
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg":
    "rafting",
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/f7/e9/9d.jpg":
    "kayak-rental",
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/8d/68/f9.jpg":
    "hiking",
};

/** Hero URLs known to be incidental/itinerary images that misrepresent the main activity. */
export const ENGINE6_ITINERARY_INCIDENTAL_HERO_URLS = new Set<string>([
  // Populated as known bad actors are discovered; empty at introduction.
]);

const HERO_URL_EXPERIENCE_PATTERNS: Array<{
  pattern: RegExp;
  experienceType: Engine6PrincipalExperienceType;
}> = [
  { pattern: /raft|whitewater|paddle-wheel/i, experienceType: "rafting" },
  { pattern: /kayak|canoe|paddleboard|\bsup\b/i, experienceType: "kayak-rental" },
  { pattern: /helicopter|flightseeing|aerial/i, experienceType: "helicopter-tour" },
  { pattern: /hiking|trailhead|trek/i, experienceType: "hiking" },
  { pattern: /wildlife|safari|bear-view/i, experienceType: "wildlife-tour" },
  { pattern: /bike|cycl/i, experienceType: "bike-tour" },
  { pattern: /boat|cruise|ferry|sail/i, experienceType: "boat-tour" },
  { pattern: /wine|vineyard|food-tour/i, experienceType: "food-wine-cultural-tour" },
  { pattern: /van-tour|red-bus|going-to-the-sun|scenic-drive/i, experienceType: "driving-tour" },
];

export const inferEngine6HeroExperienceType = (args: {
  heroUrl: string;
  sourceTier: Engine6HeroSourceTier;
  productExperienceType: Engine6PrincipalExperienceType;
  explicitExperienceType?: Engine6PrincipalExperienceType;
}): Engine6PrincipalExperienceType => {
  if (args.explicitExperienceType) {
    return args.explicitExperienceType;
  }

  const tagged = ENGINE6_TAGGED_HERO_EXPERIENCE_TYPES[args.heroUrl.trim()];
  if (tagged) {
    return tagged;
  }

  if (
    args.sourceTier === "product-primary" ||
    args.sourceTier === "product-alternate"
  ) {
    return args.productExperienceType;
  }

  if (args.sourceTier === "destination-canonical") {
    return "neutral-destination";
  }

  if (args.sourceTier === "global-fallback") {
    return "neutral-destination";
  }

  for (const { pattern, experienceType } of HERO_URL_EXPERIENCE_PATTERNS) {
    if (pattern.test(args.heroUrl)) {
      return experienceType;
    }
  }

  if (args.sourceTier === "curated-product") {
    return args.productExperienceType;
  }

  return "generic-tour";
};

export const buildEngine6HeroCandidateQueue = (
  product: Engine6HeroIntegrityProductInput
): Engine6HeroCandidateInput[] => {
  const candidates: Engine6HeroCandidateInput[] = [];

  if (isDisplayableEngine6HeroUrl(product.productPrimaryHeroUrl)) {
    candidates.push({
      url: product.productPrimaryHeroUrl,
      tier: "product-primary",
    });
  }

  for (const alternateUrl of product.productAlternateHeroUrls ?? []) {
    if (isDisplayableEngine6HeroUrl(alternateUrl)) {
      candidates.push({
        url: alternateUrl,
        tier: "product-alternate",
      });
    }
  }

  for (const curatedUrl of getEngine6CuratedProductHeroCandidates(
    product.productCode
  )) {
    if (isDisplayableEngine6HeroUrl(curatedUrl)) {
      candidates.push({
        url: curatedUrl,
        tier: "curated-product",
        experienceType: ENGINE6_TAGGED_HERO_EXPERIENCE_TYPES[curatedUrl],
      });
    }
  }

  const cityHero = resolveEngine6CanonicalCityHero(
    product.stateSlug,
    product.citySlug
  );
  if (isDisplayableEngine6HeroUrl(cityHero)) {
    candidates.push({
      url: cityHero,
      tier: "destination-canonical",
      experienceType: "neutral-destination",
    });
  }

  if (isDisplayableEngine6HeroUrl(ENGINE6_GLOBAL_FALLBACK_HERO_URL)) {
    candidates.push({
      url: ENGINE6_GLOBAL_FALLBACK_HERO_URL,
      tier: "global-fallback",
      experienceType: "neutral-destination",
    });
  }

  return candidates;
};

export const validateEngine6HeroCandidate = (args: {
  product: Engine6HeroIntegrityProductInput;
  candidate: Engine6HeroCandidateInput;
  hasValidProductPrimaryHero: boolean;
}): Engine6HeroIntegrityFinding | null => {
  const productExperienceType = inferEngine6PrincipalExperienceTypeFromProduct({
    experienceType: args.product.experienceType,
    title: args.product.title,
    categoryLabel: args.product.categoryLabel,
    categories: args.product.categories,
  });

  if (!isDisplayableEngine6HeroUrl(args.candidate.url)) {
    return {
      productCode: args.product.productCode,
      reason: "non-displayable-hero",
      detail: `hero URL is not displayable: ${args.candidate.url}`,
      rejectedHeroUrl: args.candidate.url,
      productExperienceType,
    };
  }

  if (ENGINE6_ITINERARY_INCIDENTAL_HERO_URLS.has(args.candidate.url)) {
    return {
      productCode: args.product.productCode,
      reason: "itinerary-incidental-hero",
      detail: "itinerary/incidental image misrepresents the main activity",
      rejectedHeroUrl: args.candidate.url,
      productExperienceType,
    };
  }

  const heroExperienceType = inferEngine6HeroExperienceType({
    heroUrl: args.candidate.url,
    sourceTier: args.candidate.tier,
    productExperienceType,
    explicitExperienceType: args.candidate.experienceType,
  });

  if (
    !areEngine6ExperienceTypesMateriallyCompatible({
      productExperienceType,
      heroExperienceType,
    })
  ) {
    return {
      productCode: args.product.productCode,
      reason: "experience-mismatch",
      detail: describeEngine6ExperienceTypeMismatch({
        productExperienceType,
        heroExperienceType,
      }),
      rejectedHeroUrl: args.candidate.url,
      productExperienceType,
      heroExperienceType,
    };
  }

  if (
    args.hasValidProductPrimaryHero &&
    args.candidate.tier !== "product-primary" &&
    args.candidate.tier !== "product-alternate" &&
    args.candidate.tier !== "curated-product" &&
    heroExperienceType !== "neutral-destination" &&
    heroExperienceType !== args.productExperienceType
  ) {
    return {
      productCode: args.product.productCode,
      reason: "product-hero-bypassed",
      detail:
        "product-specific hero exists but an unrelated activity image was selected",
      rejectedHeroUrl: args.candidate.url,
      productExperienceType,
      heroExperienceType,
    };
  }

  return null;
};

export const resolveEngine6HeroWithIntegrityGovernance = (args: {
  product: Engine6HeroIntegrityProductInput;
  /** Current hero URL assigned before governance (may be invalid). */
  currentHeroUrl?: string | null;
}): {
  resolution: Engine6HeroIntegrityResolution | null;
  findings: Engine6HeroIntegrityFinding[];
} => {
  const productExperienceType = inferEngine6PrincipalExperienceTypeFromProduct(
    {
      experienceType: args.product.experienceType,
      title: args.product.title,
      categoryLabel: args.product.categoryLabel,
      categories: args.product.categories,
    }
  );

  const candidates = buildEngine6HeroCandidateQueue(args.product);
  const hasValidProductPrimaryHero = candidates.some(
    candidate => candidate.tier === "product-primary"
  );
  const findings: Engine6HeroIntegrityFinding[] = [];

  if (args.currentHeroUrl?.trim()) {
    const currentFinding = validateEngine6HeroCandidate({
      product: args.product,
      candidate: {
        url: args.currentHeroUrl,
        tier: hasValidProductPrimaryHero ? "product-primary" : "curated-product",
      },
      hasValidProductPrimaryHero,
    });
    if (currentFinding) {
      findings.push(currentFinding);
    } else {
      const heroExperienceType = inferEngine6HeroExperienceType({
        heroUrl: args.currentHeroUrl,
        sourceTier: "product-primary",
        productExperienceType,
      });
      return {
        resolution: {
          productCode: args.product.productCode,
          resolvedHeroUrl: args.currentHeroUrl,
          sourceTier: "product-primary",
          productExperienceType,
          heroExperienceType,
        },
        findings,
      };
    }
  }

  for (const candidate of candidates) {
    const finding = validateEngine6HeroCandidate({
      product: args.product,
      candidate,
      hasValidProductPrimaryHero,
    });
    if (finding) {
      findings.push(finding);
      continue;
    }

    const heroExperienceType = inferEngine6HeroExperienceType({
      heroUrl: candidate.url,
      sourceTier: candidate.tier,
      productExperienceType,
      explicitExperienceType: candidate.experienceType,
    });

    const replacedHeroUrl =
      args.currentHeroUrl?.trim() &&
      args.currentHeroUrl.trim() !== candidate.url
        ? args.currentHeroUrl.trim()
        : undefined;

    return {
      resolution: {
        productCode: args.product.productCode,
        resolvedHeroUrl: candidate.url,
        sourceTier: candidate.tier,
        productExperienceType,
        heroExperienceType,
        replacedHeroUrl,
        replacementReason: replacedHeroUrl
          ? findings.find(entry => entry.rejectedHeroUrl === replacedHeroUrl)
              ?.detail
          : undefined,
      },
      findings,
    };
  }

  const fallbackHero = resolveEngine6DisplayHeroFallback({
    stateSlug: args.product.stateSlug,
    citySlug: args.product.citySlug,
  });

  if (isDisplayableEngine6HeroUrl(fallbackHero)) {
    return {
      resolution: {
        productCode: args.product.productCode,
        resolvedHeroUrl: fallbackHero,
        sourceTier: "destination-canonical",
        productExperienceType,
        heroExperienceType: "neutral-destination",
        replacedHeroUrl: args.currentHeroUrl?.trim() || undefined,
        replacementReason: "downgraded to neutral destination hero",
      },
      findings,
    };
  }

  findings.push({
    productCode: args.product.productCode,
    reason: "missing-hero",
    detail: "no appropriate hero exists for the selected product experience type",
    productExperienceType,
  });

  return { resolution: null, findings };
};

export const runEngine6HeroIntegrityGovernance = (args: {
  products: Engine6HeroIntegrityProductInput[];
  currentHeroUrlsByProductCode?: Record<string, string | null | undefined>;
  generatedAt?: string;
}): Engine6HeroIntegrityGovernanceReport => {
  const findings: Engine6HeroIntegrityFinding[] = [];
  const resolutions: Engine6HeroIntegrityResolution[] = [];
  let heroesReplaced = 0;

  for (const product of args.products) {
    const currentHeroUrl =
      args.currentHeroUrlsByProductCode?.[product.productCode] ??
      product.productPrimaryHeroUrl;

    const result = resolveEngine6HeroWithIntegrityGovernance({
      product,
      currentHeroUrl,
    });

    findings.push(...result.findings);

    if (result.resolution) {
      resolutions.push(result.resolution);
      if (result.resolution.replacedHeroUrl) {
        heroesReplaced += 1;
      }
    }
  }

  const productsFailed = args.products.filter(product =>
    findings.some(
      finding =>
        finding.productCode === product.productCode &&
        finding.reason !== "experience-mismatch"
    )
  ).length;

  const unresolvedProducts = args.products.filter(
    product => !resolutions.some(entry => entry.productCode === product.productCode)
  );

  return {
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    productsEvaluated: args.products.length,
    productsPassed: resolutions.length,
    productsFailed: unresolvedProducts.length,
    heroesReplaced,
    findings,
    resolutions,
    passed: unresolvedProducts.length === 0,
  };
};

export const formatEngine6HeroIntegrityGovernanceReport = (
  report: Engine6HeroIntegrityGovernanceReport
) => {
  const lines = [
    `Engine6 hero integrity governance (${report.generatedAt})`,
    "",
    "## Summary",
    `- Products evaluated: ${report.productsEvaluated}`,
    `- Products passed: ${report.productsPassed}`,
    `- Products failed: ${report.productsFailed}`,
    `- Heroes automatically replaced: ${report.heroesReplaced}`,
    `- Passed: ${report.passed}`,
  ];

  if (report.resolutions.length > 0) {
    lines.push("", "## Resolved heroes");
    for (const resolution of report.resolutions) {
      lines.push(
        `- ${resolution.productCode}: ${resolution.resolvedHeroUrl} (${resolution.sourceTier}, ${resolution.heroExperienceType})`
      );
      if (resolution.replacedHeroUrl) {
        lines.push(
          `  replaced ${resolution.replacedHeroUrl}: ${resolution.replacementReason ?? "auto-replaced"}`
        );
      }
    }
  }

  if (report.findings.length > 0) {
    lines.push("", "## Findings");
    for (const finding of report.findings.slice(0, 50)) {
      lines.push(
        `- ${finding.productCode} (${finding.reason}): ${finding.detail}`
      );
    }
    if (report.findings.length > 50) {
      lines.push(`- ...and ${report.findings.length - 50} additional finding(s).`);
    }
  }

  return lines.join("\n");
};

export const normalizeEngine6ParagonExperienceType = normalizeEngine6PrincipalExperienceType;
