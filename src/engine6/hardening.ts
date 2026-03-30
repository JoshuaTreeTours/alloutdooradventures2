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
  heroUrl: string | null;
  usesLegacyGallery: boolean;
  usesLegacyRenderer: boolean;
}) => {
  if (!heroUrl) {
    return;
  }
  assertCondition(!FORBIDDEN_ENGINE6_HEROES.has(heroUrl), "forbidden fallback hero image detected");
  assertCondition(!usesLegacyGallery, "legacy gallery logic cannot run on engine6");
  assertCondition(!usesLegacyRenderer, "legacy renderer cannot run on engine6");
};

export const assertEngine6ImageDeterminism = ({
  heroImage,
  cardImage,
  schemaImage,
}: {
  heroImage: string | null;
  cardImage: string | null;
  schemaImage: string | null | undefined;
}) => {
  const normalizedHeroImage = heroImage?.trim() || null;
  const normalizedCardImage = cardImage?.trim() || null;
  const normalizedSchemaImage = schemaImage?.trim() || null;

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

export const assertEngine6CtaIntegrity = (ctaUrl: string) => {
  assertCondition(ctaUrl.includes("pid="), "cta URL must include affiliate pid parameter");
  assertCondition(!ctaUrl.includes("/search/"), "cta URL cannot point to a search page");
};

export const assertUniqueByCanonicalPath = (value: boolean) => {
  assertCondition(value === true, "listing entries must be unique by canonical path");
};
