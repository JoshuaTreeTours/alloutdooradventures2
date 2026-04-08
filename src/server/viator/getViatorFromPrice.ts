import { resolveViatorApiKey, resolveViatorBaseUrl } from "../../../api/viator/runtimeConfig";

type CurrencyCode = "USD";

type ViatorFromPrice = {
  price: number;
  currency: string;
};

type CacheEntry = {
  expiresAt: number;
  value: ViatorFromPrice | null;
};

const DEFAULT_TTL_SECONDS = 86_400;
const TIMEOUT_MS = 800;

const memoryCache = new Map<string, CacheEntry>();

const resolveTtlMs = () => {
  const raw = Number.parseInt(process.env.VIATOR_PRICE_TTL_SECONDS ?? "", 10);
  const ttlSeconds = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_SECONDS;
  return ttlSeconds * 1000;
};

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const extractCandidatePrice = (payload: unknown): number | null => {
  const candidates: unknown[] = [];

  const collect = (value: unknown) => {
    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    const node = value as Record<string, unknown>;
    candidates.push(
      node.recommendedRetailPrice,
      node.recommendedRetailPriceFrom,
      node.fromPrice,
      node.price,
      node.lowestPrice,
      node.amount,
      node.original,
      node.partnerNet
    );

    Object.values(node).forEach(collect);
  };

  collect(payload);

  for (const candidate of candidates) {
    const numeric =
      typeof candidate === "number"
        ? candidate
        : typeof candidate === "string"
          ? Number.parseFloat(candidate)
          : candidate && typeof candidate === "object"
            ? Number.parseFloat(
                String((candidate as Record<string, unknown>).amount ?? "")
              )
            : Number.NaN;

    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return null;
};

const cacheKey = (productCode: string, currency: CurrencyCode) =>
  `viator:fromPrice:${productCode}:${currency}`;

const readCache = (key: string) => {
  const entry = memoryCache.get(key);
  if (!entry) {
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return undefined;
  }

  return entry.value;
};

const writeCache = (key: string, value: ViatorFromPrice | null) => {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + resolveTtlMs(),
  });
};

const formatDate = (input: Date) => input.toISOString().slice(0, 10);

const fetchViatorFromPrice = async (
  productCode: string,
  currency: CurrencyCode
): Promise<ViatorFromPrice | null> => {
  const apiKey = resolveViatorApiKey();
  if (!apiKey) {
    return null;
  }

  const baseUrl = resolveViatorBaseUrl();

  const nextWeek = new Date();
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/availability/schedules/search`, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        productCode,
        currency,
        travelDate: formatDate(nextWeek),
        paxMix: [{ ageBand: "ADULT", numberOfTravelers: 1 }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    const price = extractCandidatePrice(payload);

    if (!price || !Number.isFinite(price) || price <= 0) {
      return null;
    }

    return { price, currency };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const peekViatorFromPriceCache = (
  productCode: string,
  currency: CurrencyCode = "USD"
): ViatorFromPrice | null => readCache(cacheKey(productCode, currency)) ?? null;

export const getViatorFromPrice = async (
  productCode: string,
  currency: CurrencyCode = "USD"
): Promise<ViatorFromPrice | null> => {
  if (!productCode.trim()) {
    return null;
  }

  const key = cacheKey(productCode.trim().toUpperCase(), currency);
  const cached = readCache(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await fetchViatorFromPrice(productCode.trim().toUpperCase(), currency);
  writeCache(key, value);
  return value;
};
