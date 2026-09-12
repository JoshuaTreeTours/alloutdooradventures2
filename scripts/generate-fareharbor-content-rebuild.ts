import { writeFile } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";

type JsonRecord = Record<string, unknown>;
type SourceRecord = {
  key: string;
  title: string;
  route: string;
  city: string;
  region: string;
  operator: string;
  bookingUrl: string;
};
type Harvested = SourceRecord & {
  headline: string;
  description: string;
  supplemental: Record<string, string>;
  images: string[];
  rewriteReady: boolean;
};
type AiRewrite = {
  key: string;
  paragraphs: string[];
  highlights: string[];
  seoDescription: string;
};

const OUTPUT = path.resolve("src/data/fareharborContent.generated.json");
const BATCH_SIZE = 12;
const MAX_CONCURRENCY = 3;
const REQUEST_TIMEOUT_MS = 15_000;
const OPENAI_MODEL = process.env.FH_REWRITE_MODEL || "gpt-5-mini";
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const isRecord = (value: unknown): value is JsonRecord => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const textOf = (value: unknown) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
const plain = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const collectSources = () => {
  const map = new Map<string, SourceRecord>();
  const add = (record: Omit<SourceRecord, "key">) => {
    const ref = getFareharborItemFromUrl(record.bookingUrl);
    if (!ref) return;
    const key = `${ref.companyShortname}:${ref.itemId}`;
    if (!map.has(key)) map.set(key, { ...record, key });
  };

  for (const tour of routeBackedTours) {
    if (tour.bookingProvider !== "fareharbor") continue;
    add({
      title: tour.title,
      route: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
      city: tour.destination.city,
      region: tour.destination.state,
      operator: tour.operatorName || "local operator",
      bookingUrl: tour.bookingUrl,
    });
  }

  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    add({
      title: tour.name,
      route: tour.seo.canonicalPath,
      city: tour.geo.city,
      region: tour.geo.region,
      operator: tour.provider.name,
      bookingUrl: tour.bookingUrl ?? tour.booking.bookingUrl,
    });
  }

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
};

const fetchJson = async (url: string) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "AOA-FH-Rebuild/1.0" },
        signal: controller.signal,
      });
      if (response.ok) return await response.json() as unknown;
      if (response.status !== 429 && response.status < 500) return null;
    } catch {
      // retry
    } finally {
      clearTimeout(timeout);
    }
    await sleep(500 * 2 ** attempt + Math.floor(Math.random() * 250));
  }
  return null;
};

const collectImageUrls = (value: unknown, out = new Set<string>()) => {
  if (typeof value === "string") {
    for (const match of value.match(/https?:\/\/[^\s)"'<>]+/gi) ?? []) {
      const clean = match.replace(/[.,;:]+$/, "");
      const lower = clean.toLowerCase();
      if (lower.includes("filestackcontent.com") || lower.includes("cdn.fareharbor.com") || /\.(jpe?g|png|webp)(\?|$)/i.test(lower)) out.add(clean);
    }
    return out;
  }
  if (Array.isArray(value)) for (const item of value) collectImageUrls(item, out);
  else if (isRecord(value)) for (const item of Object.values(value)) collectImageUrls(item, out);
  return out;
};

const harvestOne = async (source: SourceRecord): Promise<Harvested> => {
  const [company, itemId] = source.key.split(":");
  const contentPayload = await fetchJson(`https://fareharbor.com/api/items/v1/${encodeURIComponent(company)}/${encodeURIComponent(itemId)}/content/`);
  const detailPayload = await fetchJson(`https://fareharbor.com/api/v1/companies/${encodeURIComponent(company)}/items/${encodeURIComponent(itemId)}/`);
  const root = isRecord(contentPayload) ? contentPayload : {};
  const data = isRecord(root.data) ? root.data : root;
  const detailRoot = isRecord(detailPayload) ? detailPayload : {};
  const detail = isRecord(detailRoot.item) ? detailRoot.item : detailRoot;
  const description = [textOf(data.description), textOf(detail.description)].sort((a, b) => plain(b).length - plain(a).length)[0] || "";
  const headline = textOf(data.headline) || textOf(detail.headline);
  const supplementalKeys = ["what_is_included", "what_is_not_included", "what_to_bring", "check_in_details", "meeting_point", "cancellation_policy", "highlight_description", "duration", "group_size"];
  const supplemental: Record<string, string> = {};
  for (const key of supplementalKeys) {
    const value = textOf(data[key]);
    if (value.length >= 20) supplemental[key] = value;
  }
  const images = Array.from(collectImageUrls(contentPayload));
  collectImageUrls(detailPayload, new Set(images));
  const dedupedImages = Array.from(new Set([...images, ...Array.from(collectImageUrls(detailPayload))])).slice(0, 6);
  const descriptionLength = plain(description).length;
  const rewriteReady = descriptionLength >= 180 || (descriptionLength >= 80 && Object.keys(supplemental).length >= 1);
  return { ...source, headline, description: plain(description), supplemental, images: dedupedImages, rewriteReady };
};

const rewriteBatch = async (batch: Harvested[]): Promise<AiRewrite[]> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for FareHarbor rebuild generation.");
  const facts = batch.map(item => ({
    key: item.key,
    title: item.title,
    city: item.city,
    region: item.region,
    operator: item.operator,
    headline: item.headline,
    description: item.description,
    supplemental: item.supplemental,
  }));
  const prompt = [
    "You are rewriting tour pages for All Outdoor Adventures.",
    "Use ONLY facts supplied in the JSON input. Do not invent routes, inclusions, ages, meeting points, durations, prices, ratings, availability, or guarantees.",
    "Write original prose, not copied operator wording. Remove all prices and sales claims. Avoid first-person operator language such as we/our/us.",
    "For each item return: key, paragraphs (2 concise factual paragraphs), highlights (3-6 factual bullets), seoDescription (140-165 characters if possible).",
    "Keep destination and operator facts accurate. If source facts are thin, be conservative rather than padding.",
    "Return strict JSON only as an array in the same order as input.",
    JSON.stringify(facts),
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, input: prompt }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
  const payload = await response.json() as { output_text?: string };
  if (!payload.output_text) throw new Error("OpenAI response missing output_text");
  const parsed = JSON.parse(payload.output_text) as AiRewrite[];
  if (!Array.isArray(parsed) || parsed.length !== batch.length) throw new Error(`Unexpected rewrite batch size: ${Array.isArray(parsed) ? parsed.length : "non-array"}`);
  return parsed;
};

const main = async () => {
  const sources = collectSources();
  console.info(`[fh-rebuild] source items=${sources.length}`);
  const harvested: Harvested[] = new Array(sources.length);
  let cursor = 0;
  const workers = Array.from({ length: 4 }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= sources.length) return;
      harvested[index] = await harvestOne(sources[index]);
      if ((index + 1) % 250 === 0) console.info(`[fh-rebuild] harvested ${index + 1}/${sources.length}`);
      await sleep(35);
    }
  });
  await Promise.all(workers);

  const ready = harvested.filter(item => item.rewriteReady);
  console.info(`[fh-rebuild] rewrite-ready=${ready.length}`);
  const batches: Harvested[][] = [];
  for (let i = 0; i < ready.length; i += BATCH_SIZE) batches.push(ready.slice(i, i + BATCH_SIZE));
  const rewrites = new Map<string, AiRewrite>();
  let batchCursor = 0;
  const aiWorkers = Array.from({ length: MAX_CONCURRENCY }, async () => {
    while (true) {
      const index = batchCursor++;
      if (index >= batches.length) return;
      const batch = batches[index];
      let rewritten: AiRewrite[] | null = null;
      for (let attempt = 0; attempt < 4 && !rewritten; attempt += 1) {
        try {
          rewritten = await rewriteBatch(batch);
        } catch (error) {
          if (attempt === 3) throw error;
          await sleep(1500 * 2 ** attempt);
        }
      }
      for (const item of rewritten ?? []) rewrites.set(item.key, item);
      if ((index + 1) % 20 === 0 || index + 1 === batches.length) console.info(`[fh-rebuild] AI batches ${index + 1}/${batches.length}`);
    }
  });
  await Promise.all(aiWorkers);

  const items: Record<string, unknown> = {};
  for (const item of ready) {
    const rewrite = rewrites.get(item.key);
    if (!rewrite) continue;
    items[item.route] = {
      key: item.key,
      paragraphs: rewrite.paragraphs.filter(Boolean).slice(0, 3),
      highlights: rewrite.highlights.filter(Boolean).slice(0, 8),
      seoDescription: rewrite.seoDescription,
      images: item.images.slice(0, 6),
    };
  }

  const result = {
    generatedAt: new Date().toISOString(),
    summary: {
      sourceItems: sources.length,
      rewriteReady: ready.length,
      rewritten: Object.keys(items).length,
      withTwoPlusImages: ready.filter(item => item.images.length >= 2).length,
    },
    items,
  };
  await writeFile(OUTPUT, `${JSON.stringify(result)}\n`, "utf8");
  console.info(`[fh-rebuild] SUMMARY ${JSON.stringify(result.summary)}`);
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
