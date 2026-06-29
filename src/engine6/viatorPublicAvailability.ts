export type ViatorPublicAvailabilityAssessment = {
  productCode: string;
  sourceUrl: string;
  finalUrl: string;
  available: boolean;
  reason: string | null;
};

export type ViatorPublicAvailabilityInput = {
  productCode: string;
  sourceUrl: string;
  html: string;
  finalUrl?: string;
  httpStatus?: number;
};

export class Engine6ViatorPublicAvailabilityError extends Error {
  readonly productCode: string;
  readonly sourceUrl: string;

  constructor(productCode: string, sourceUrl: string, reason: string) {
    super(
      `Engine6 rejected Viator product ${productCode} (${sourceUrl}): ${reason}`
    );
    this.name = "Engine6ViatorPublicAvailabilityError";
    this.productCode = productCode;
    this.sourceUrl = sourceUrl;
  }
}

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

const extractProductCodeFromUrl = (url: string) => {
  const match = url.match(/\/d\d+-([A-Z0-9_]+)(?:[/?#]|$)/i);
  return match ? normalizeProductCode(match[1]) : null;
};

const parseJsonScripts = (html: string): unknown[] => {
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const parsed: unknown[] = [];

  for (const script of scripts) {
    const body = script
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();

    if (!body.startsWith("{") && !body.startsWith("[")) {
      continue;
    }

    try {
      parsed.push(JSON.parse(body));
    } catch {
      // ignore non-json script blocks
    }
  }

  return parsed;
};

const deepCollectStringValues = (
  input: unknown,
  keyPattern: RegExp,
  values: string[] = []
): string[] => {
  if (!input || typeof input !== "object") {
    return values;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      deepCollectStringValues(item, keyPattern, values);
    }
    return values;
  }

  const record = input as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (keyPattern.test(key) && typeof value === "string" && value.trim()) {
      values.push(value.trim());
    }
    deepCollectStringValues(value, keyPattern, values);
  }

  return values;
};

const extractEmbeddedProductCodes = (html: string) => {
  const codes = new Set<string>();

  for (const match of html.matchAll(/"productCode"\s*:\s*"([^"]+)"/gi)) {
    codes.add(normalizeProductCode(match[1]));
  }

  for (const script of parseJsonScripts(html)) {
    for (const value of deepCollectStringValues(
      script,
      /^productCode$/i
    )) {
      codes.add(normalizeProductCode(value));
    }
  }

  return codes;
};

const UNAVAILABLE_TEXT_PATTERNS = [
  /sorry[,\s].{0,40}product.{0,40}unavailable/i,
  /this product is unavailable/i,
  /product is no longer available/i,
  /no longer available/i,
  /no longer offered/i,
  /has been discontinued/i,
  /discontinued product/i,
  /this experience is unavailable/i,
  /this tour is unavailable/i,
  /not currently available/i,
  /temporarily unavailable/i,
];

const REPLACEMENT_LANDING_PATTERNS = [
  /similar experiences/i,
  /you might also like/i,
  /explore other experiences/i,
  /browse similar tours/i,
  /other things to do/i,
];

const INACTIVE_STATUS_PATTERNS = [
  /"productStatus"\s*:\s*"(?:UNAVAILABLE|INACTIVE|DISCONTINUED|NOT_AVAILABLE)"/i,
  /"status"\s*:\s*"(?:UNAVAILABLE|INACTIVE|DISCONTINUED|NOT_AVAILABLE)"/i,
  /"availabilityStatus"\s*:\s*"(?:UNAVAILABLE|INACTIVE|DISCONTINUED|NOT_AVAILABLE)"/i,
];

const REPLACEMENT_URL_PATTERNS = [
  /\/search(?:\/|\?|$)/i,
  /\/similar(?:-experiences|-products)?(?:\/|\?|$)/i,
  /\/things-to-do(?:\/|\?|$)/i,
  /\/attractions(?:\/|\?|$)/i,
];

const hasActiveProductSignals = (html: string, productCode: string) => {
  const normalizedCode = normalizeProductCode(productCode);
  const embeddedCodes = extractEmbeddedProductCodes(html);
  if (embeddedCodes.has(normalizedCode)) {
    return true;
  }

  const hasBookingCta =
    /check availability/i.test(html) ||
    /select date/i.test(html) ||
    /book now/i.test(html);

  return (
    hasBookingCta &&
    (html.includes(normalizedCode) ||
      html.includes(`/d5265-${normalizedCode}`) ||
      html.includes(`/d651-${normalizedCode}`))
  );
};

export const assessViatorPublicPageAvailability = (
  input: ViatorPublicAvailabilityInput
): ViatorPublicAvailabilityAssessment => {
  const productCode = normalizeProductCode(input.productCode);
  const sourceUrl = input.sourceUrl.trim();
  const finalUrl = (input.finalUrl ?? sourceUrl).trim();
  const html = input.html;
  const normalizedHtml = html.toLowerCase();

  const finalUrlProductCode = extractProductCodeFromUrl(finalUrl);
  if (
    finalUrlProductCode &&
    finalUrlProductCode !== productCode &&
    REPLACEMENT_URL_PATTERNS.some(pattern => pattern.test(finalUrl))
  ) {
    return {
      productCode,
      sourceUrl,
      finalUrl,
      available: false,
      reason: `resolved to replacement landing page for ${finalUrlProductCode} instead of ${productCode}`,
    };
  }

  if (finalUrlProductCode && finalUrlProductCode !== productCode) {
    return {
      productCode,
      sourceUrl,
      finalUrl,
      available: false,
      reason: `redirected to a different Viator product (${finalUrlProductCode}) instead of ${productCode}`,
    };
  }

  if (REPLACEMENT_URL_PATTERNS.some(pattern => pattern.test(finalUrl))) {
    return {
      productCode,
      sourceUrl,
      finalUrl,
      available: false,
      reason: "redirected to a search or similar-experiences landing page",
    };
  }

  for (const pattern of UNAVAILABLE_TEXT_PATTERNS) {
    if (pattern.test(html)) {
      return {
        productCode,
        sourceUrl,
        finalUrl,
        available: false,
        reason: "public Viator page indicates the selected product is unavailable",
      };
    }
  }

  for (const pattern of INACTIVE_STATUS_PATTERNS) {
    if (pattern.test(html)) {
      return {
        productCode,
        sourceUrl,
        finalUrl,
        available: false,
        reason: "public Viator page reports an inactive or unavailable product status",
      };
    }
  }

  const embeddedCodes = extractEmbeddedProductCodes(html);
  if (
    embeddedCodes.size > 0 &&
    !embeddedCodes.has(productCode) &&
    !hasActiveProductSignals(html, productCode)
  ) {
    const replacementCode = [...embeddedCodes].find(code => code !== productCode);
    return {
      productCode,
      sourceUrl,
      finalUrl,
      available: false,
      reason: replacementCode
        ? `canonical public page product is ${replacementCode}, not ${productCode}`
        : `public page does not resolve to selected product ${productCode}`,
    };
  }

  const replacementLandingDetected = REPLACEMENT_LANDING_PATTERNS.some(pattern =>
    pattern.test(html)
  );
  if (replacementLandingDetected && !hasActiveProductSignals(html, productCode)) {
    return {
      productCode,
      sourceUrl,
      finalUrl,
      available: false,
      reason:
        "public Viator page appears to be a replacement or similar-experiences landing page",
    };
  }

  if (
    typeof input.httpStatus === "number" &&
    input.httpStatus >= 400 &&
    !hasActiveProductSignals(html, productCode)
  ) {
    return {
      productCode,
      sourceUrl,
      finalUrl,
      available: false,
      reason: `public Viator page returned HTTP ${input.httpStatus}`,
    };
  }

  if (!hasActiveProductSignals(html, productCode)) {
    return {
      productCode,
      sourceUrl,
      finalUrl,
      available: false,
      reason: "public Viator page does not resolve to an active selected product",
    };
  }

  return {
    productCode,
    sourceUrl,
    finalUrl,
    available: true,
    reason: null,
  };
};

export const assertViatorPublicPageAvailability = (
  input: ViatorPublicAvailabilityInput
) => {
  const assessment = assessViatorPublicPageAvailability(input);
  if (!assessment.available) {
    throw new Engine6ViatorPublicAvailabilityError(
      assessment.productCode,
      assessment.sourceUrl,
      assessment.reason ?? "product unavailable"
    );
  }
  return assessment;
};

export const validateEngine6CityProductAvailability = (
  candidates: ViatorPublicAvailabilityInput[]
) => {
  const rejections: Engine6ViatorPublicAvailabilityError[] = [];

  for (const candidate of candidates) {
    const assessment = assessViatorPublicPageAvailability(candidate);
    if (!assessment.available) {
      rejections.push(
        new Engine6ViatorPublicAvailabilityError(
          assessment.productCode,
          assessment.sourceUrl,
          assessment.reason ?? "product unavailable"
        )
      );
    }
  }

  return rejections;
};

export const fetchViatorPublicPage = async (
  sourceUrl: string,
  fetchImpl: typeof fetch = fetch
) => {
  const response = await fetchImpl(sourceUrl, {
    redirect: "follow",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; AOAEngine6Availability/1.0)",
    },
  });

  return {
    html: await response.text(),
    finalUrl: response.url,
    httpStatus: response.status,
  };
};

export const assertViatorPublicPageAvailabilityFromUrl = async (args: {
  productCode: string;
  sourceUrl: string;
  fetchImpl?: typeof fetch;
}) => {
  const page = await fetchViatorPublicPage(args.sourceUrl, args.fetchImpl);
  return assertViatorPublicPageAvailability({
    productCode: args.productCode,
    sourceUrl: args.sourceUrl,
    html: page.html,
    finalUrl: page.finalUrl,
    httpStatus: page.httpStatus,
  });
};

/** Public-page evidence captured when Yosemite unavailable products were rejected. */
export const ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS = {
  "3454P41": {
    sourceUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Best-of-Yosemite-Tour-Giant-Sequoias-and-Glacier-Point/d5265-3454P41",
    title: "Best of Yosemite Small Group Tour: Giant Sequoias & Glacier Point",
  },
  "18808P1": {
    sourceUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-and-Glacier-Point-Tour-from-Fresno/d5265-18808P1",
    title:
      "Full-Day Small Group Yosemite & Glacier Point Tour Including Hotel Pickup",
  },
  "391021P3": {
    sourceUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Mariposa-Grove-of-Giant-Sequoias-and-Wawona-Small-Group-Tour/d5265-391021P3",
    title:
      "Mariposa Grove of Giant Sequoias and Wawona Small Group Tour in Yosemite",
  },
} as const;
