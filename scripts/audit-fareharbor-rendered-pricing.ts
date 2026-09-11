import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

import { toursForAudit } from "../src/data/tours.audit";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { isSuppressedFareHarborBookingPage } from "../src/utils/fareharbor/suppressedBookingPages";

const OUT_DIR = path.resolve("artifacts");
const SAMPLE_SIZE = 12;
const CONTROL_URL = "https://fareharbor.com/embeds/book/red-jeep/items/34849/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures";

type Candidate = { title: string; companyShortname: string; itemId: string; bookingUrl: string; canonicalPath: string };

const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const buildSample = () => {
  const map = new Map<string, Candidate>();
  for (const tour of toursForAudit) {
    if (tour.bookingProvider !== "fareharbor") continue;
    if (tour.engine === "engine6") continue;
    if (isSuppressedFareHarborBookingPage(tour)) continue;
    if (tour.startingPrice !== undefined && tour.startingPrice !== null && tour.startingPrice >= 20) continue;
    const bookingUrl = tour.bookingWidgetUrl || tour.bookingUrl;
    const ref = getFareharborItemFromUrl(bookingUrl);
    if (!ref) continue;
    const key = `${ref.companyShortname}:${ref.itemId}`;
    if (map.has(key)) continue;
    const canonicalPath = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;
    map.set(key, { title: tour.title, companyShortname: ref.companyShortname, itemId: ref.itemId, bookingUrl, canonicalPath });
  }
  return Array.from(map.values()).sort((a,b) => hash(a.canonicalPath)-hash(b.canonicalPath)).slice(0, SAMPLE_SIZE);
};

const priceTokens = (text: string) => {
  const out = new Set<string>();
  const re = /(?:US\$|CA\$|A\$|NZ\$|C\$|\$|€|£|¥|USD\s*|CAD\s*|AUD\s*|NZD\s*|EUR\s*|GBP\s*)[\s]*[\d,]+(?:\.\d{1,2})?/gi;
  for (const m of text.matchAll(re)) {
    out.add(m[0].replace(/\s+/g, " ").trim());
    if (out.size >= 40) break;
  }
  return Array.from(out);
};

const main = async () => {
  const executablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome";
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const candidates: Candidate[] = [
    { title: "Shared San Andreas Fault Jeep Tour (control)", companyShortname: "red-jeep", itemId: "34849", bookingUrl: CONTROL_URL, canonicalPath: "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849" },
    ...buildSample(),
  ];
  const rows: any[] = [];

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const page = await browser.newPage();
    const networkUrls = new Set<string>();
    const jsonPriceSnippets: string[] = [];

    page.on("response", async response => {
      const url = response.url();
      if (/fareharbor\.com/i.test(url)) networkUrls.add(url);
      const contentType = response.headers()["content-type"] || "";
      if (/json/i.test(contentType) && /fareharbor\.com/i.test(url)) {
        try {
          const body = await response.text();
          if (/price|amount|currency/i.test(body)) {
            const match = body.match(/.{0,120}(?:public_price|minimum_price|price|amount|currency).{0,240}/i);
            if (match && jsonPriceSnippets.length < 20) jsonPriceSnippets.push(match[0].slice(0, 400));
          }
        } catch {}
      }
    });

    let gotoStatus: number | null = null;
    let bodyText = "";
    let error: string | null = null;
    try {
      const response = await page.goto(candidate.bookingUrl, { waitUntil: "networkidle2", timeout: 30000 });
      gotoStatus = response?.status() ?? null;
      await new Promise(resolve => setTimeout(resolve, 1500));
      bodyText = await page.evaluate(() => document.body?.innerText || "");
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      try { bodyText = await page.evaluate(() => document.body?.innerText || ""); } catch {}
    }

    const tokens = priceTokens(bodyText);
    const priceLines = bodyText.split(/\n+/).map(v => v.trim()).filter(v => v && /(?:\$|€|£|USD|CAD|AUD|NZD|EUR|GBP)\s*[\d]/i.test(v)).slice(0, 30);
    const interestingNetworkUrls = Array.from(networkUrls).filter(url => /api|availability|calendar|items|book|graphql|embed/i.test(url)).slice(0, 80);

    rows.push({ ...candidate, gotoStatus, bodyChars: bodyText.length, priceTokens: tokens, priceLines, interestingNetworkUrls, jsonPriceSnippets, error });
    console.log(`[fh-rendered-audit] ${i + 1}/${candidates.length} ${candidate.companyShortname}/${candidate.itemId} status=${gotoStatus} tokens=${tokens.join(",")}`);
    await page.close();
  }

  await browser.close();
  const summary = {
    generatedAt: new Date().toISOString(),
    testedCount: rows.length,
    rowsWithVisiblePriceTokens: rows.filter(r => r.priceTokens.length > 0).length,
    rowsWithPriceLikeJsonResponses: rows.filter(r => r.jsonPriceSnippets.length > 0).length,
    rowsWithInterestingNetworkCalls: rows.filter(r => r.interestingNetworkUrls.length > 0).length,
    control34849: rows[0],
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "fareharbor-rendered-pricing-audit.json"), JSON.stringify({ summary, rows }, null, 2) + "\n");
  await writeFile(path.join(OUT_DIR, "fareharbor-rendered-pricing-audit-summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(`[fh-rendered-audit] SUMMARY ${JSON.stringify({ testedCount: summary.testedCount, rowsWithVisiblePriceTokens: summary.rowsWithVisiblePriceTokens, rowsWithPriceLikeJsonResponses: summary.rowsWithPriceLikeJsonResponses, rowsWithInterestingNetworkCalls: summary.rowsWithInterestingNetworkCalls, controlTokens: rows[0]?.priceTokens })}`);
};

main().catch(error => { console.error("[fh-rendered-audit] FATAL", error); process.exitCode = 1; });
