import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors.js";
import Engine6TourPage from "./components/Engine6TourPage.js";
import { toEngine6Card } from "./cards.js";
import {
  isDisplayableEngine6HeroUrl,
  resolveEngine6DisplayHero,
} from "./displayHero.js";
import {
  resolveEngine6AuthoritativeHeroCandidates,
  selectEngine6AuthoritativeProductHero,
} from "./engine6ExactProductFixtureGovernance.js";
import type { Engine6Tour } from "./types.js";
import type {
  Engine6MerchantFeedImageValidationResult,
  ValidateEngine6MerchantFeedImageUrl,
} from "./merchantFeedImageGovernance.js";

export type Engine6ProductHeroGovernanceFinding = {
  productCode: string;
  message: string;
  severity: "blocking" | "legacy";
  attemptedHeroUrls: string[];
};

export type Engine6ProductHeroGovernanceReport = {
  auditedProductCodes: string[];
  findings: Engine6ProductHeroGovernanceFinding[];
  pass: boolean;
};

const parseStateCityFromCanonicalPath = (canonicalPath: string) => {
  const [, stateSlug = "", citySlug = ""] =
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(canonicalPath) ??
    [];
  return { stateSlug, citySlug };
};

export const auditEngine6ProductHeroUsesAuthoritativeSource = (args: {
  tour: Engine6Tour;
  rawPayload: Record<string, unknown>;
}) => {
  const findings: string[] = [];
  const heroSelection = selectEngine6AuthoritativeProductHero({
    productCode: args.tour.productCode,
    rawPayload: args.rawPayload,
  });

  if (!heroSelection.ok) {
    findings.push(heroSelection.message);
    return {
      findings,
      attemptedHeroUrls: heroSelection.attemptedHeroUrls,
    };
  }

  if (args.tour.heroImageUrl !== heroSelection.heroUrl) {
    findings.push(
      "Rendered hero does not match authoritative product.media.images hero"
    );
  }

  if (
    !args.tour.diagnostics.heroSourceFieldPath?.startsWith("product.media.images")
  ) {
    findings.push("Hero provenance must originate from product.media.images");
  }

  return {
    findings,
    attemptedHeroUrls: heroSelection.attemptedHeroUrls,
  };
};

export const auditEngine6ProductHeroAvoidsRuntimeFallback = (args: {
  tour: Engine6Tour;
}) => {
  const findings: string[] = [];
  const { stateSlug, citySlug } = parseStateCityFromCanonicalPath(
    args.tour.canonicalPath
  );

  const resolvedDisplayHero = resolveEngine6DisplayHero({
    productCode: args.tour.productCode,
    productHeroUrl: args.tour.heroImageUrl,
    stateSlug,
    citySlug,
  });

  if (resolvedDisplayHero !== args.tour.heroImageUrl) {
    findings.push(
      "Product preview would trigger runtime image fallback instead of product hero"
    );
  }

  const pageHtml = renderToString(
    createElement(Engine6TourPage, { tour: args.tour })
  );
  const card = toEngine6Card(args.tour);

  if (card.imageUrl !== args.tour.heroImageUrl) {
    findings.push("Card hero diverged from detail hero");
  }

  if (
    args.tour.heroImageUrl &&
    !pageHtml.includes(args.tour.heroImageUrl.replace(/&/g, "&amp;"))
  ) {
    findings.push("Rendered product page does not include the product hero URL");
  }

  return findings;
};

export const auditEngine6ProductHeroGovernance = async (args: {
  tours: Engine6Tour[];
  rawPayloadByProductCode: Map<string, Record<string, unknown>>;
  scopedProductCodes: ReadonlySet<string>;
  validateImageUrl?: ValidateEngine6MerchantFeedImageUrl;
}) => {
  const findings: Engine6ProductHeroGovernanceFinding[] = [];
  const validateImageUrl = args.validateImageUrl;

  for (const tour of args.tours) {
    const productCode = tour.productCode.trim().toUpperCase();
    const isScoped = args.scopedProductCodes.has(productCode);
    const rawPayload = args.rawPayloadByProductCode.get(productCode);

    if (!rawPayload) {
      if (isScoped) {
        findings.push({
          productCode,
          message: "Deploy-scoped product is missing exact-product fixture payload",
          severity: "blocking",
          attemptedHeroUrls: [],
        });
      }
      continue;
    }

    const authoritative = auditEngine6ProductHeroUsesAuthoritativeSource({
      tour,
      rawPayload,
    });

    for (const message of authoritative.findings) {
      findings.push({
        productCode,
        message,
        severity: isScoped ? "blocking" : "legacy",
        attemptedHeroUrls: authoritative.attemptedHeroUrls,
      });
    }

    const heroUrl = tour.heroImageUrl?.trim();
    if (heroUrl && validateImageUrl) {
      const validation: Engine6MerchantFeedImageValidationResult =
        await validateImageUrl(heroUrl);
      if (!validation.valid) {
        findings.push({
          productCode,
          message:
            validation.message ??
            `Hero URL failed merchant-feed image validation (${validation.reason ?? "invalid"})`,
          severity: isScoped ? "blocking" : "legacy",
          attemptedHeroUrls: authoritative.attemptedHeroUrls,
        });
      }
    } else if (heroUrl && !isDisplayableEngine6HeroUrl(heroUrl)) {
      findings.push({
        productCode,
        message: "Hero URL is not displayable",
        severity: isScoped ? "blocking" : "legacy",
        attemptedHeroUrls: authoritative.attemptedHeroUrls,
      });
    }

    for (const message of auditEngine6ProductHeroAvoidsRuntimeFallback({ tour })) {
      findings.push({
        productCode,
        message,
        severity: isScoped ? "blocking" : "legacy",
        attemptedHeroUrls: authoritative.attemptedHeroUrls,
      });
    }

    const extracted = extractEngine6Product(rawPayload);
    const hasAuthoritativeImages = authoritative.attemptedHeroUrls.length > 0;
    if (
      hasAuthoritativeImages &&
      tour.heroImageUrl &&
      !authoritative.attemptedHeroUrls.includes(tour.heroImageUrl) &&
      !extracted.extracted.heroImageUrl
    ) {
      findings.push({
        productCode,
        message:
          "Hero URL is not product-specific despite authoritative product images existing",
        severity: isScoped ? "blocking" : "legacy",
        attemptedHeroUrls: authoritative.attemptedHeroUrls,
      });
    }
  }

  const blockingFindings = findings.filter(
    finding => finding.severity === "blocking"
  );

  return {
    auditedProductCodes: args.tours.map(tour => tour.productCode),
    findings,
    pass: blockingFindings.length === 0,
  } satisfies Engine6ProductHeroGovernanceReport;
};

export const resolveEngine6AuthoritativeHeroFromPayload = (
  rawPayload: Record<string, unknown>
) => resolveEngine6AuthoritativeHeroCandidates(rawPayload);
