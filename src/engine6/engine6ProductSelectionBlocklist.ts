import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS } from "./viatorPublicAvailability.js";

export type Engine6ProductSelectionPermanentBlocklistEntry = {
  sourceUrl: string;
  title: string;
  reason: string;
  rejectedAt: string;
  destinationLabel?: string;
};

export type Engine6ProductSelectionPermanentBlocklist = Record<
  string,
  Engine6ProductSelectionPermanentBlocklistEntry
>;

export const ENGINE6_PRODUCT_SELECTION_PERMANENT_BLOCKLIST_RELATIVE_PATH =
  "data/engine6/product-selection-permanent-blocklist.json";

export const resolveEngine6ProductSelectionPermanentBlocklistPath = () =>
  path.resolve(ENGINE6_PRODUCT_SELECTION_PERMANENT_BLOCKLIST_RELATIVE_PATH);

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

export const readEngine6ProductSelectionPermanentBlocklist =
  (): Engine6ProductSelectionPermanentBlocklist => {
    const blocklistPath = resolveEngine6ProductSelectionPermanentBlocklistPath();
    if (!existsSync(blocklistPath)) {
      return {};
    }

    const parsed = JSON.parse(
      readFileSync(blocklistPath, "utf8")
    ) as Engine6ProductSelectionPermanentBlocklist;

    return parsed && typeof parsed === "object" ? parsed : {};
  };

export const isEngine6KnownUnavailableProduct = (productCode: string) =>
  normalizeProductCode(productCode) in ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS;

export const isEngine6PersistedSelectionBlocklisted = (productCode: string) =>
  normalizeProductCode(productCode) in readEngine6ProductSelectionPermanentBlocklist();

export const isEngine6ProductSelectionBlocklistedProduct = (productCode: string) =>
  isEngine6KnownUnavailableProduct(productCode) ||
  isEngine6PersistedSelectionBlocklisted(productCode);

export type Engine6ProductSelectionBlocklistCandidate = {
  productCode: string;
  sourceUrl: string;
  title?: string;
  reason: string;
  destinationLabel?: string;
  rejectedAt?: string;
};

export const shouldPermanentlyBlocklistProductSelectionRejection = (args: {
  reason: string;
  detail: string;
  validationReason?: string | null;
}) => {
  if (args.reason === "cross-destination") {
    return true;
  }

  if (args.reason === "duplicate-engine6-assignment") {
    return true;
  }

  if (
    args.reason === "inactive" ||
    args.reason === "unavailable" ||
    args.reason === "removed" ||
    args.reason === "reassigned"
  ) {
    return true;
  }

  if (args.reason === "blocklisted") {
    return false;
  }

  if (args.reason === "missing-commercial-fields") {
    return false;
  }

  if (args.reason === "duplicate-product") {
    return false;
  }

  const combined = [args.detail, args.validationReason ?? ""]
    .join(" ")
    .toLowerCase();

  if (
    /api key not configured|credentials (are )?missing|could not resolve a git base ref/i.test(
      combined
    )
  ) {
    return false;
  }

  if (
    /bot protection/i.test(combined) &&
    !/inactive|http 404|missing product body|unavailable|removed|not currently bookable|known-unavailable/i.test(
      combined
    )
  ) {
    return false;
  }

  return /inactive|unavailable|removed|discontinued|not_available|reassigned|cross-destination|known-unavailable|not currently bookable|product code mismatch|does not match configured source url|http 404|missing product body|unusable hero/.test(
    combined
  );
};

export const collectEngine6ProductSelectionBlocklistAdditions = (args: {
  rejected: Array<{
    productCode: string;
    sourceUrl: string;
    experienceType: string;
    reason: string;
    detail: string;
    validationResult?: { reason: string | null };
  }>;
  destinationLabel: string;
  generatedAt: string;
  candidateTitlesByCode?: Record<string, string>;
}) => {
  const existing = readEngine6ProductSelectionPermanentBlocklist();
  const additions: Engine6ProductSelectionBlocklistCandidate[] = [];

  for (const rejection of args.rejected) {
    if (
      !shouldPermanentlyBlocklistProductSelectionRejection({
        reason: rejection.reason,
        detail: rejection.detail,
        validationReason: rejection.validationResult?.reason,
      })
    ) {
      continue;
    }

    const productCode = normalizeProductCode(rejection.productCode);
    if (
      productCode in existing ||
      productCode in ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS
    ) {
      continue;
    }

    additions.push({
      productCode,
      sourceUrl: rejection.sourceUrl,
      title:
        args.candidateTitlesByCode?.[productCode] ??
        args.candidateTitlesByCode?.[rejection.productCode] ??
        rejection.productCode,
      reason: `${rejection.reason}: ${rejection.detail}`,
      destinationLabel: args.destinationLabel,
      rejectedAt: args.generatedAt,
    });
  }

  return additions;
};

export const persistEngine6ProductSelectionBlocklistAdditions = (
  additions: Engine6ProductSelectionBlocklistCandidate[]
) => {
  if (additions.length === 0) {
    return {
      persistedCount: 0,
      blocklistPath: resolveEngine6ProductSelectionPermanentBlocklistPath(),
    };
  }

  const blocklistPath = resolveEngine6ProductSelectionPermanentBlocklistPath();
  const existing = readEngine6ProductSelectionPermanentBlocklist();
  let persistedCount = 0;

  for (const addition of additions) {
    const productCode = normalizeProductCode(addition.productCode);
    if (
      productCode in existing ||
      productCode in ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS
    ) {
      continue;
    }

    existing[productCode] = {
      sourceUrl: addition.sourceUrl,
      title: addition.title ?? productCode,
      reason: addition.reason,
      rejectedAt: addition.rejectedAt ?? new Date().toISOString(),
      destinationLabel: addition.destinationLabel,
    };
    persistedCount += 1;
  }

  writeFileSync(blocklistPath, `${JSON.stringify(existing, null, 2)}\n`);

  return {
    persistedCount,
    blocklistPath,
  };
};
