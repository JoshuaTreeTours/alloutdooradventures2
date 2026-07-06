export const MERCHANT_COMMERCIAL_REFRESH_METADATA_PATH =
  "data/merchantFeed-commercial-refresh-metadata.json";

export const MERCHANT_COMMERCIAL_REFRESH_MAX_AGE_DAYS = 7;

export type MerchantCommercialRefreshMetadata = {
  lastSuccessfulCommercialRefreshAt: string;
  source: string;
  cadenceDays: number;
};

export type MerchantCommercialRefreshStalenessResult = {
  pass: boolean;
  ageDays: number | null;
  message: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const buildMerchantCommercialRefreshMetadata = (
  refreshedAt = new Date()
): MerchantCommercialRefreshMetadata => ({
  lastSuccessfulCommercialRefreshAt: refreshedAt.toISOString(),
  source:
    "merchant feed generation + shared Engine6 commercial resolver + commercial parity audit",
  cadenceDays: MERCHANT_COMMERCIAL_REFRESH_MAX_AGE_DAYS,
});

export const assessMerchantCommercialRefreshStaleness = (
  metadata: MerchantCommercialRefreshMetadata | null,
  now = new Date(),
  maxAgeDays = MERCHANT_COMMERCIAL_REFRESH_MAX_AGE_DAYS
): MerchantCommercialRefreshStalenessResult => {
  if (!metadata?.lastSuccessfulCommercialRefreshAt) {
    return {
      pass: false,
      ageDays: null,
      message: "merchant commercial refresh metadata is missing",
    };
  }

  const refreshedAt = new Date(metadata.lastSuccessfulCommercialRefreshAt);
  if (!Number.isFinite(refreshedAt.getTime())) {
    return {
      pass: false,
      ageDays: null,
      message: `merchant commercial refresh metadata timestamp is invalid: ${metadata.lastSuccessfulCommercialRefreshAt}`,
    };
  }

  const ageDays = (now.getTime() - refreshedAt.getTime()) / MS_PER_DAY;
  const pass = ageDays <= maxAgeDays;

  return {
    pass,
    ageDays,
    message: pass
      ? `merchant commercial refresh metadata is fresh (${ageDays.toFixed(2)} days old)`
      : `merchant commercial refresh metadata is stale (${ageDays.toFixed(2)} days old; max ${maxAgeDays} days)`,
  };
};

export const assertMerchantCommercialRefreshFresh = (
  metadata: MerchantCommercialRefreshMetadata | null,
  now = new Date(),
  maxAgeDays = MERCHANT_COMMERCIAL_REFRESH_MAX_AGE_DAYS
) => {
  const staleness = assessMerchantCommercialRefreshStaleness(
    metadata,
    now,
    maxAgeDays
  );

  if (!staleness.pass) {
    throw new Error(staleness.message);
  }

  return staleness;
};
