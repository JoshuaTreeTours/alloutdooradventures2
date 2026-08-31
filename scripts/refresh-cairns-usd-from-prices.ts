/**
 * Refresh Cairns Engine6 USD adult From prices from Viator public pages.
 * Uses the Cairns-only widget extractor (FromUS$ / FromUSD / US-page From$,
 * dual-currency $ leg). Never writes A$ or AU-locale From$ as USD.
 *
 * Audit: npx tsx scripts/refresh-cairns-usd-from-prices.ts
 * Apply:  npx tsx scripts/refresh-cairns-usd-from-prices.ts --apply
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  CAIRNS_VIATOR_PUBLIC_PRODUCT_CODES,
  CAIRNS_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "../src/engine6/cairnsViatorPublicRatings";
import { extractCairnsUsdAdultFromPrice } from "../src/engine6/cairnsUsdAdultFromPrice";
import { fetchViatorPublicPage } from "../src/engine6/viatorPublicAvailability";

const execFileAsync = promisify(execFile);
const APPLY = process.argv.includes("--apply");
const AUDIT_PATH = "scripts/cairns-usd-from-price-audit.json";
const LIVE_DATA_PATH = "scripts/cairns-live-product-data.json";
const CATALOG_PATH = "scripts/cairns-product-catalog.json";
const RATINGS_PATH = "src/engine6/cairnsViatorPublicRatings.ts";
const MERCHANT_FEED_PATH = "data/merchantFeed.csv";
const SNAPSHOT_PATH = "data/merchantFeed-commercial-snapshot.json";

type LiveProduct = {
  productCode: string;
  productUrl: string;
  priceFrom?: string;
  price?: number;
  currency?: string;
  sourceCurrency?: string;
};

const liveProducts = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
) as LiveProduct[];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithCurl = async (url: string) => {
  const { stdout } = await execFileAsync(
    "curl",
    [
      "-sL",
      "--max-time",
      "40",
      "-A",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "-H",
      "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "-H",
      "Accept-Language: en-US,en;q=0.9",
      "-H",
      "Cookie: currency=USD; viatorCurrency=USD",
      "--compressed",
      url,
    ],
    { maxBuffer: 12 * 1024 * 1024 }
  );
  return stdout;
};

const fetchPage = async (sourceUrl: string) => {
  const usdUrl = sourceUrl.includes("?")
    ? `${sourceUrl}&currency=USD`
    : `${sourceUrl}?currency=USD`;

  try {
    const page = await fetchViatorPublicPage(usdUrl);
    if (
      page.httpStatus < 400 &&
      page.html.length > 4000 &&
      !/datadome|captcha/i.test(page.html)
    ) {
      return { ...page, usdUrl };
    }
  } catch {
    // fall through to curl
  }

  const html = await fetchWithCurl(usdUrl);
  return {
    html,
    finalUrl: usdUrl,
    usdUrl,
    httpStatus: html.length > 2000 ? 200 : 0,
  };
};

const formatUsdFromLabel = (amount: number, source: string | null) => {
  if (source === "from-us-dollar") {
    return `From US$${amount.toFixed(2)}`;
  }
  if (source === "from-usd-word") {
    return `From USD ${amount.toFixed(2)}`;
  }
  return `From $${amount.toFixed(2)}`;
};

const replacePinnedPrice = (productCode: string, amount: number) => {
  const source = readFileSync(RATINGS_PATH, "utf8");
  const pattern = new RegExp(
    `("${productCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":\\s*)([0-9]+(?:\\.[0-9]+)?)`
  );
  if (!pattern.test(source)) {
    throw new Error(`Missing pinned USD From for ${productCode}`);
  }
  writeFileSync(RATINGS_PATH, source.replace(pattern, `$1${amount}`), "utf8");
};

const applyPrice = (productCode: string, amount: number, source: string | null) => {
  replacePinnedPrice(productCode, amount);

  const live = liveProducts.find(entry => entry.productCode === productCode);
  if (live) {
    live.price = amount;
    live.priceFrom = formatUsdFromLabel(amount, source);
    live.currency = "USD";
    live.sourceCurrency = "USD";
  }

  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as Array<{
    productCode: string;
    priceFrom?: number;
  }>;
  const catalogRow = catalog.find(entry => entry.productCode === productCode);
  if (catalogRow) {
    catalogRow.priceFrom = amount;
    writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  }

  const fixturePath = `data/engine6/viator/${productCode}.exact-product.json`;
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as {
    product: {
      priceFrom?: string;
      pricing?: { summary?: { fromPrice?: number }; currency?: string };
    };
  };
  fixture.product.priceFrom = `From $${amount.toFixed(2)}`;
  if (!fixture.product.pricing) {
    fixture.product.pricing = { summary: { fromPrice: amount }, currency: "USD" };
  } else {
    fixture.product.pricing.currency = "USD";
    fixture.product.pricing.summary = {
      ...(fixture.product.pricing.summary ?? {}),
      fromPrice: amount,
    };
  }
  writeFileSync(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");

  const feed = readFileSync(MERCHANT_FEED_PATH, "utf8");
  const feedLines = feed.split(/\r?\n/);
  const nextFeed = feedLines.map(line => {
    if (!line.startsWith(`${productCode},`)) {
      return line;
    }
    return line.replace(/,in stock,[^,]+,new,/, `,in stock,${amount.toFixed(2)} USD,new,`);
  });
  writeFileSync(MERCHANT_FEED_PATH, nextFeed.join("\n"), "utf8");

  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as {
    rows: Array<{ productCode: string; price: string }>;
  };
  snapshot.rows = snapshot.rows.map(row =>
    row.productCode === productCode
      ? { ...row, price: `${amount.toFixed(2)} USD` }
      : row
  );
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
};

const main = async () => {
  const rows = [];

  for (const productCode of CAIRNS_VIATOR_PUBLIC_PRODUCT_CODES) {
    const live = liveProducts.find(entry => entry.productCode === productCode);
    if (!live) {
      throw new Error(`Missing live product data for ${productCode}`);
    }

    const stored = CAIRNS_VIATOR_PUBLIC_USD_FROM_PRICES[productCode];
    let extractedAmount: number | null = null;
    let extractedSource: string | null = null;
    let rejectedReason: string | null = null;
    let fetchStatus = 0;
    let blocked = false;

    try {
      const page = await fetchPage(live.productUrl);
      fetchStatus = page.httpStatus;
      blocked = /datadome|captcha|Access denied/i.test(page.html);
      const extracted = extractCairnsUsdAdultFromPrice({
        html: page.html,
        sourceUrl: page.finalUrl || live.productUrl,
      });
      extractedAmount = extracted.amount;
      extractedSource = extracted.source;
      rejectedReason = extracted.rejectedReason;
    } catch (error) {
      rejectedReason = error instanceof Error ? error.message : String(error);
    }

    const changed =
      extractedAmount != null &&
      Math.abs(extractedAmount - stored) >= 0.005;

    rows.push({
      productCode,
      storedUsdAdultFrom: stored,
      liveUsdAdultFrom: extractedAmount,
      source: extractedSource,
      rejectedReason,
      fetchStatus,
      blocked,
      changed,
      productUrl: live.productUrl,
    });

    if (APPLY && changed && extractedAmount != null) {
      applyPrice(productCode, extractedAmount, extractedSource);
    }

    await sleep(250);
  }

  if (APPLY) {
    writeFileSync(LIVE_DATA_PATH, `${JSON.stringify(liveProducts, null, 2)}\n`, "utf8");
  }

  const audit = {
    generatedAt: new Date().toISOString(),
    applied: APPLY,
    changedCount: rows.filter(row => row.changed).length,
    blockedCount: rows.filter(row => row.blocked).length,
    rows,
  };
  writeFileSync(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  console.log(
    `Cairns USD adult From audit: ${audit.changedCount} changed, ${audit.blockedCount} blocked, wrote ${AUDIT_PATH}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
