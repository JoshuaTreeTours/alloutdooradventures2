import fs from "fs";
import path from "path";

export type ViatorCacheData = {
  sourceUrl?: string;
  productCode: string;
  title?: string;
  supplierImage?: string;
  priceFrom?: string;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  itinerary?: Array<{ title: string; duration?: string; description?: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  duration?: string;
};

export type ViatorCacheFile = {
  cacheVersion: number;
  fetchedAt: string;
  sourceUrl?: string;
  data: ViatorCacheData;
};

export function loadViatorCache(productCode: string): ViatorCacheFile | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "cache",
      "viator",
      `${productCode}.json`
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as ViatorCacheFile;
  } catch {
    return null;
  }
}

export function parsePriceFrom(priceFrom?: string): {
  currency?: string;
  amount?: number;
} {
  if (!priceFrom) return {};
  const m = priceFrom.trim().match(/^([A-Z]{3})\s+([\d,.]+)$/);
  if (!m) return {};
  const currency = m[1];
  const amount = Number(m[2].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return {};
  return { currency, amount };
}
