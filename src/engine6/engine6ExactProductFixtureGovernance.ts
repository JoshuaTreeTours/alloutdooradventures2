import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors.js";
import { isDisplayableEngine6HeroUrl } from "./displayHero.js";
import { resolveEngine6PathForProductCode } from "./routes.js";

export type Engine6FixtureNamespaceCollision = {
  productCode: string;
  fixturePath: string;
  existingOwnerDestination: string | null;
  requestedDestinationCitySlug: string;
  message: string;
};

export type Engine6FixtureWriteDecision =
  | {
      action: "write";
      productCode: string;
      fixturePath: string;
      heroUrl: string;
      heroSourceFieldPath: string;
    }
  | {
      action: "skip-collision";
      productCode: string;
      fixturePath: string;
      collision: Engine6FixtureNamespaceCollision;
    }
  | {
      action: "report-invalid-hero";
      productCode: string;
      fixturePath: string;
      message: string;
      attemptedHeroUrls: string[];
    };

const EXACT_PRODUCT_DIR = path.join("data", "engine6", "viator");

export const resolveEngine6ExactProductFixturePath = (productCode: string) =>
  path.join(EXACT_PRODUCT_DIR, `${productCode.trim().toUpperCase()}.exact-product.json`);

const readExistingFixturePayload = (fixturePath: string) => {
  if (!existsSync(fixturePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const inferEngine6FixtureOwnerDestinationSlug = (args: {
  productCode: string;
  rawPayload?: Record<string, unknown> | null;
}) => {
  const configuredPath = resolveEngine6PathForProductCode(args.productCode);
  if (configuredPath) {
    const match = /^\/destinations\/[^/]+\/([^/]+)\/tours\//.exec(configuredPath);
    if (match?.[1]) {
      return match[1].trim().toLowerCase();
    }
  }

  const payload = args.rawPayload;
  if (!payload) {
    return null;
  }

  const product = (payload.product ?? payload) as Record<string, unknown>;
  const location = product.location as Record<string, unknown> | undefined;
  const city = typeof location?.city === "string" ? location.city.trim() : "";
  if (city) {
    return city.toLowerCase().replace(/\s+/g, "-");
  }

  const publicUrl =
    typeof payload.publicUrl === "string"
      ? payload.publicUrl
      : typeof product.productUrl === "string"
        ? product.productUrl
        : "";
  const urlMatch = /\/tours\/[^/]+\/d\d+-/i.exec(publicUrl);
  if (urlMatch) {
    const segment = publicUrl
      .slice(publicUrl.indexOf("/tours/") + "/tours/".length)
      .split("/")[0]
      ?.trim();
    if (segment) {
      return segment.toLowerCase();
    }
  }

  return null;
};

export const resolveEngine6AuthoritativeHeroCandidates = (
  rawPayload: Record<string, unknown>
) => {
  const extracted = extractEngine6Product(rawPayload);
  const candidates = [
    extracted.extracted.heroImageUrl,
    ...extracted.heroCandidates.map(candidate => candidate.url),
  ].filter((url): url is string => isDisplayableEngine6HeroUrl(url));

  const unique = [...new Set(candidates)];
  const fieldPath = extracted.diagnostics.heroSourceFieldPath?.trim() ?? "";

  return {
    candidates: unique,
    heroSourceFieldPath: fieldPath.startsWith("product.media.images")
      ? fieldPath
      : unique.length > 0
        ? "product.media.images"
        : "",
    diagnostics: extracted.diagnostics,
  };
};

export const selectEngine6AuthoritativeProductHero = (args: {
  productCode: string;
  rawPayload: Record<string, unknown>;
  validateHeroUrl?: (url: string) => Promise<boolean>;
}) => {
  const { candidates, heroSourceFieldPath } =
    resolveEngine6AuthoritativeHeroCandidates(args.rawPayload);

  if (candidates.length === 0 || !heroSourceFieldPath) {
    return {
      ok: false as const,
      message:
        "No authoritative product hero candidates found in product.media.images",
      attemptedHeroUrls: candidates,
    };
  }

  return {
    ok: true as const,
    heroUrl: candidates[0],
    heroSourceFieldPath,
    attemptedHeroUrls: candidates,
  };
};

export const resolveEngine6ExactProductFixtureWriteDecision = (args: {
  productCode: string;
  destinationCitySlug: string;
  proposedPayload: Record<string, unknown>;
  cwd?: string;
}): Engine6FixtureWriteDecision => {
  const productCode = args.productCode.trim().toUpperCase();
  const fixturePath = resolveEngine6ExactProductFixturePath(productCode);
  const absolutePath = path.resolve(args.cwd ?? process.cwd(), fixturePath);
  const requestedDestination = args.destinationCitySlug.trim().toLowerCase();

  const existingPayload = readExistingFixturePayload(absolutePath);
  if (existingPayload) {
    const existingOwner = inferEngine6FixtureOwnerDestinationSlug({
      productCode,
      rawPayload: existingPayload,
    });

    if (existingOwner && existingOwner !== requestedDestination) {
      return {
        action: "skip-collision",
        productCode,
        fixturePath,
        collision: {
          productCode,
          fixturePath,
          existingOwnerDestination: existingOwner,
          requestedDestinationCitySlug: requestedDestination,
          message:
            `Refusing to overwrite exact-product fixture ${productCode}: ` +
            `owned by ${existingOwner}, not ${requestedDestination}`,
        },
      };
    }
  }

  const heroSelection = selectEngine6AuthoritativeProductHero({
    productCode,
    rawPayload: args.proposedPayload,
  });

  if (!heroSelection.ok) {
    return {
      action: "report-invalid-hero",
      productCode,
      fixturePath,
      message: heroSelection.message,
      attemptedHeroUrls: heroSelection.attemptedHeroUrls,
    };
  }

  return {
    action: "write",
    productCode,
    fixturePath,
    heroUrl: heroSelection.heroUrl,
    heroSourceFieldPath: heroSelection.heroSourceFieldPath,
  };
};

export type Engine6ExactProductFixtureGenerationReport = {
  written: string[];
  preserved: string[];
  namespaceCollisions: Engine6FixtureNamespaceCollision[];
  invalidHeroReports: Array<{
    productCode: string;
    message: string;
    attemptedHeroUrls: string[];
  }>;
};

export const summarizeEngine6ExactProductFixtureDecisions = (
  decisions: Engine6FixtureWriteDecision[]
): Engine6ExactProductFixtureGenerationReport => {
  const written: string[] = [];
  const preserved: string[] = [];
  const namespaceCollisions: Engine6FixtureNamespaceCollision[] = [];
  const invalidHeroReports: Engine6ExactProductFixtureGenerationReport["invalidHeroReports"] =
    [];

  for (const decision of decisions) {
    if (decision.action === "write") {
      written.push(decision.productCode);
      continue;
    }

    if (decision.action === "skip-collision") {
      preserved.push(decision.productCode);
      namespaceCollisions.push(decision.collision);
      continue;
    }

    invalidHeroReports.push({
      productCode: decision.productCode,
      message: decision.message,
      attemptedHeroUrls: decision.attemptedHeroUrls,
    });
  }

  return {
    written,
    preserved,
    namespaceCollisions,
    invalidHeroReports,
  };
};
