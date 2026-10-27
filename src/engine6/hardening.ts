import type { Tour } from "../data/tours.types";
import type { Engine6Tour } from "./types";

const FORBIDDEN_ENGINE6_HEROES = new Set([
  "/hero.jpg",
  "/images/hiking-hero.jpg",
]);

const assertCondition = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(`[engine6-hardening] ${message}`);
  }
};

export const assertEngine6RendererSupremacy = ({
  tourEngine,
  renderer,
}: {
  tourEngine: Tour["engine"] | Engine6Tour["diagnostics"]["source"];
  renderer: "engine2" | "engine3" | "engine4" | "engine6" | "legacy" | "converter";
}) => {
  if (tourEngine === "engine6") {
    assertCondition(renderer === "engine6", "renderer must be engine6 for engine6 tour");
  }
};

export const assertEngine6NoFallbackContamination = ({
  heroUrl,
  usesLegacyGallery,
  usesLegacyRenderer,
}: {
  heroUrl: string;
  usesLegacyGallery: boolean;
  usesLegacyRenderer: boolean;
}) => {
  assertCondition(!FORBIDDEN_ENGINE6_HEROES.has(heroUrl), "forbidden fallback hero image detected");
  assertCondition(!usesLegacyGallery, "legacy gallery logic cannot run on engine6");
  assertCondition(!usesLegacyRenderer, "legacy renderer cannot run on engine6");
};

export const assertEngine6ImageDeterminism = ({
  heroImage,
  cardImage,
  schemaImage,
}: {
  heroImage: string;
  cardImage: string;
  schemaImage: string | null | undefined;
}) => {
  const normalizedHeroImage = heroImage.trim() || null;
  const normalizedCardImage = cardImage.trim() || null;
  const normalizedSchemaImage = schemaImage?.trim() || null;

  assertCondition(
    Boolean(normalizedHeroImage),
    "engine6 hero image must resolve from exact-product media"
  );
  assertCondition(
    normalizedHeroImage === normalizedCardImage,
    "hero image must match listing card image"
  );
  assertCondition(
    normalizedSchemaImage === normalizedHeroImage,
    "schema image must match engine6 hero image"
  );
};

export const assertEngine6DataSource = (dataSource: string) => {
  assertCondition(
    dataSource === "engine6-native",
    "engine6 pages must use a single source of truth: engine6-native"
  );
};

export const assertEngine6CtaIntegrity = ({
  ctaOwner,
  ctaUrl,
}: {
  ctaOwner: "fareharbor" | "viator";
  ctaUrl: string;
}) => {
  assertCondition(ctaOwner === "viator", "engine6 routes must use Viator CTA ownership");
  assertCondition(ctaUrl.includes("pid=P00290915"), "cta URL must include affiliate pid parameter");
  assertCondition(ctaUrl.includes("uid=U00174482"), "cta URL must include affiliate uid parameter");
  assertCondition(ctaUrl.includes("mcid=58086"), "cta URL must include affiliate mcid parameter");
  assertCondition(ctaUrl.includes("medium=link"), "cta URL must include medium=link parameter");
  assertCondition(ctaUrl.includes("currency=USD"), "cta URL must include currency=USD parameter");
  assertCondition(!ctaUrl.includes("/search/"), "cta URL cannot point to a search page");
};

/**
 * Enhanced FareHarbor products use the Engine6 visual renderer, not Engine6
 * Viator ownership. Validate their distinct attributed product-level CTA
 * without weakening the native Engine6 Viator CTA contract.
 */
export const assertFareHarborGoldCtaIntegrity = ({
  ctaOwner,
  ctaUrl,
}: {
  ctaOwner: "fareharbor" | "viator";
  ctaUrl: string;
}) => {
  assertCondition(ctaOwner === "fareharbor", "Gold FH routes must use FareHarbor CTA ownership");
  let parsed: URL;
  try {
    parsed = new URL(ctaUrl);
  } catch {
    throw new Error("[engine6-hardening] Gold FH CTA must be an absolute URL");
  }
  assertCondition(
    parsed.protocol === "https:" && parsed.hostname === "fareharbor.com",
    "Gold FH CTA must use secure FareHarbor checkout"
  );
  assertCondition(
    /^\/embeds\/book\/[a-zA-Z0-9_-]+\/items\/\d+\/$/.test(parsed.pathname),
    "Gold FH CTA must target a specific FareHarbor bookable item"
  );
  assertCondition(
    parsed.searchParams.get("asn") === "fhdn" &&
      parsed.searchParams.get("asn-ref") === "alloutdooradventures",
    "Gold FH CTA must preserve AOA affiliate attribution"
  );
  assertCondition(
    parsed.searchParams.get("ref") === "https://www.alloutdooradventures.com" &&
      parsed.searchParams.get("marketplace") === "yes",
    "Gold FH CTA must preserve AOA referral parameters"
  );
};

export const assertUniqueByCanonicalPath = (value: boolean) => {
  assertCondition(value === true, "listing entries must be unique by canonical path");
};
