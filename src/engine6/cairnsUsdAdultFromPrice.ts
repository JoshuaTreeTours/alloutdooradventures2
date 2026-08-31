import { CAIRNS_VIATOR_PUBLIC_USD_FROM_PRICES } from "./cairnsViatorPublicRatings";

export type CairnsUsdAdultFromSource =
  | "from-us-dollar"
  | "from-usd-word"
  | "from-dollar-usd-page"
  | "dual-currency-usd-leg";

export type CairnsUsdAdultFromUnit = "per-person" | "per-group" | "unknown";

export type CairnsUsdAdultFromExtraction = {
  amount: number | null;
  currency: "USD" | null;
  source: CairnsUsdAdultFromSource | null;
  unit: CairnsUsdAdultFromUnit;
  rejectedReason: string | null;
};

const parseAmount = (raw: string | undefined | null): number | null => {
  if (!raw) {
    return null;
  }
  const match = raw.replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) {
    return null;
  }
  const amount = Number.parseFloat(match[1]);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

/**
 * Restrict parsing to the product's own price widget. Related-card From$
 * values and JSON fromPrice blobs often appear earlier in the Viator HTML.
 */
export const extractCairnsProductPriceWidget = (html: string): string => {
  const withoutRelated = html.split(
    /You might also like|Similar experiences|People also viewed|Recommended for you/i
  )[0];

  const h1Html = withoutRelated.match(
    /<h1\b[^>]*>[\s\S]*?<\/h1>([\s\S]{0,8000})/i
  );
  if (h1Html?.[1]) {
    return h1Html[1].split(
      /id=["']overview["']|<h2\b[^>]*>\s*Overview|## Overview/i
    )[0];
  }

  const mdTitle = withoutRelated.match(/^#\s+.+$/m);
  if (mdTitle && typeof mdTitle.index === "number") {
    return withoutRelated
      .slice(mdTitle.index)
      .split(/## Overview|## What's Included/i)[0]
      .slice(0, 8000);
  }

  return withoutRelated.slice(0, 12000);
};

const isNonUsdViatorLocale = (sourceUrl: string | undefined): boolean =>
  /viator\.com\/en-(?!US)[A-Z]{2}\//i.test(sourceUrl ?? "");

/**
 * Public Viator USD adult From extractor for Cairns only.
 * Prefers FromUS$ / FromUSD, then a US-page From$, then the $ leg of an
 * A$ / $ dual-currency pair. Never stores A$ / AU-locale From$ as USD.
 */
export const extractCairnsUsdAdultFromPrice = (input: {
  html: string;
  sourceUrl?: string;
}): CairnsUsdAdultFromExtraction => {
  const widget = extractCairnsProductPriceWidget(input.html);
  const unit: CairnsUsdAdultFromUnit = /per group/i.test(widget)
    ? "per-group"
    : /per person/i.test(widget)
      ? "per-person"
      : "unknown";

  const empty = (
    rejectedReason: string
  ): CairnsUsdAdultFromExtraction => ({
    amount: null,
    currency: null,
    source: null,
    unit,
    rejectedReason,
  });

  const fromUs = widget.match(
    /From\s*US\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const fromUsdWord = widget.match(
    /From\s*USD\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const fromAud = widget.match(
    /From\s*(?:A\$|AU\$|AUD)\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const fromDollar = widget.match(
    /From\s*\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const localFrom = widget.match(
    /From\s*(?:€|£|CA\$|NZ\$|S\$|R\$|¥|JP¥|THB|฿|ZAR|DKK|EUR|GBP)/i
  );

  const usAmount = parseAmount(fromUs?.[1]);
  if (usAmount != null) {
    return {
      amount: usAmount,
      currency: "USD",
      source: "from-us-dollar",
      unit,
      rejectedReason: null,
    };
  }

  const usdWordAmount = parseAmount(fromUsdWord?.[1]);
  if (usdWordAmount != null) {
    return {
      amount: usdWordAmount,
      currency: "USD",
      source: "from-usd-word",
      unit,
      rejectedReason: null,
    };
  }

  const audAmount = parseAmount(fromAud?.[1]);
  const dollarAmount = parseAmount(fromDollar?.[1]);
  if (
    audAmount != null &&
    dollarAmount != null &&
    dollarAmount < audAmount
  ) {
    return {
      amount: dollarAmount,
      currency: "USD",
      source: "dual-currency-usd-leg",
      unit,
      rejectedReason: null,
    };
  }

  if (audAmount != null && dollarAmount == null) {
    return empty("aud-from-only");
  }

  if (localFrom && dollarAmount == null) {
    return empty("local-currency-from");
  }

  if (dollarAmount != null) {
    if (isNonUsdViatorLocale(input.sourceUrl)) {
      return empty("bare-from-dollar-on-non-usd-locale");
    }
    if (
      /"priceCurrency"\s*:\s*"AUD"/i.test(widget) ||
      /"currency"\s*:\s*"AUD"/i.test(widget)
    ) {
      return empty("json-aud-currency");
    }
    return {
      amount: dollarAmount,
      currency: "USD",
      source: "from-dollar-usd-page",
      unit,
      rejectedReason: null,
    };
  }

  return empty("no-verified-usd-adult-from");
};

const AUD_TO_USD_RATIO_MIN = 1.3;
const AUD_TO_USD_RATIO_MAX = 1.9;

export const looksLikeCairnsAudAmountVsUsdFrom = (
  liveAmount: number | null | undefined,
  usdFromAmount: number | null | undefined
): boolean => {
  if (
    typeof liveAmount !== "number" ||
    typeof usdFromAmount !== "number" ||
    liveAmount <= 0 ||
    usdFromAmount <= 0
  ) {
    return false;
  }

  const ratio = liveAmount / usdFromAmount;
  return ratio >= AUD_TO_USD_RATIO_MIN && ratio <= AUD_TO_USD_RATIO_MAX;
};

export const isCairnsEngine6ProductCode = (
  productCode: string | null | undefined
): boolean =>
  Boolean(
    productCode &&
      Object.prototype.hasOwnProperty.call(
        CAIRNS_VIATOR_PUBLIC_USD_FROM_PRICES,
        productCode
      )
  );

/**
 * Cairns-only live overlay gate. Shared 8x/20x guards miss AUD because
 * A$249 vs $162.21 is only ~1.5x and Viator AU pages often render AUD as From$.
 * Returns true for non-Cairns product codes so other cities are unchanged.
 */
export const shouldApplyCairnsLiveUsdAdultFromPrice = (
  productCode: string | null | undefined,
  live: {
    priceAmount?: number | null;
    priceFormatted?: string | null;
    priceCurrency?: string | null;
  },
  usdReferenceAmount: number | null | undefined
): boolean => {
  if (!isCairnsEngine6ProductCode(productCode) || !productCode) {
    return true;
  }

  const pinned = CAIRNS_VIATOR_PUBLIC_USD_FROM_PRICES[productCode];
  const reference =
    typeof usdReferenceAmount === "number" && usdReferenceAmount > 0
      ? usdReferenceAmount
      : pinned;
  const liveAmount =
    typeof live.priceAmount === "number" && live.priceAmount > 0
      ? live.priceAmount
      : null;
  const formatted = live.priceFormatted ?? "";
  const currency = live.priceCurrency?.trim().toUpperCase() ?? "";

  if (currency === "AUD" || /A\$|AU\$|\bAUD\b/i.test(formatted)) {
    return false;
  }

  if (looksLikeCairnsAudAmountVsUsdFrom(liveAmount, reference)) {
    return false;
  }

  return true;
};
