import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fareHarborHtmlByUrl } from "../fh/fareharborBookFixtures";
import { parseFareHarborHtml } from "../fh/parseFareHarborHtml";
import { sanitizeFhText, isBadTokenString } from "../text/sanitizeFhText";
import { normalizeDurationText } from "./normalizeDuration";

export type FhTourFacts = {
  title?: string;
  durationText?: string;
  durationMinutes?: number;
  meetingPoint?: string;
  meetingPointAddress?: string;
  ageMin?: number;
  groupSizeMax?: number;
  groupSizeMin?: number;
  cancellationPolicy?: string;
  accessibility?: string;
  inclusions?: string[];
  exclusions?: string[];
  highlights?: string[];
  itinerary?: string[];
  pricing?: {
    isPrivate?: boolean;
    pricePerPersonFrom?: number;
    privateTotalFrom?: number;
    currency?: string;
  };
  operatorName?: string;
};

const CACHE_DIR = path.resolve(process.cwd(), ".cache/fh-item-details");

const stripTags = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const extractList = (html: string, label: string) => {
  const block = html.match(new RegExp(`<[^>]+>${label}<\\/[^>]+>([\\s\\S]{0,1200}?)<\\/(ul|ol|div)>`, "i"))?.[1] ?? "";
  return Array.from(block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(m => stripTags(m[1] ?? "")).filter(Boolean);
};

const extractFacts = (html: string, fallbackTitle?: string): FhTourFacts => {
  const title = sanitizeFhText(stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") || fallbackTitle || "");
  const text = stripTags(html);
  const durationRaw = sanitizeFhText(
    text.match(/Duration\s*:?\s*([^\.\n|]+)/i)?.[1]?.trim() ?? ""
  );
  const normalizedDuration = normalizeDurationText(durationRaw);
  const durationText = normalizedDuration?.text;
  const meetingPoint = sanitizeFhText(
    text
      .match(/Meeting(?:\s+Point|\s+Location)?\s*:?\s*([^\.\n|]+)/i)?.[1]
      ?.trim() ?? ""
  );
  const cancellationPolicy = normalizeCancellationPolicy(
    text
      .match(/Cancellation(?:\s+Policy)?\s*:?\s*([^\n]{10,220})/i)?.[1]
      ?.trim()
  );
  const accessibility = sanitizeFhText(
    text.match(/Accessibility\s*:?\s*([^\n]{6,180})/i)?.[1]?.trim() ?? ""
  );
  const ageMin = Number.parseInt(text.match(/(?:minimum age|ages?\s+)(\d{1,2})/i)?.[1] ?? "", 10);
  const groupMax = Number.parseInt(text.match(/(?:up to|max(?:imum)? group(?: size)?|group size:?\s*)(\d{1,3})/i)?.[1] ?? "", 10);
  const price = Number.parseFloat((text.match(/from\s*\$\s*([\d,.]+)/i)?.[1] ?? "").replace(/,/g, ""));

  return {
    title,
    durationText,
    durationMinutes: normalizedDuration?.minutes,
    meetingPoint,
    ageMin: Number.isFinite(ageMin) ? ageMin : undefined,
    groupSizeMax: Number.isFinite(groupMax) ? groupMax : undefined,
    cancellationPolicy,
    accessibility,
    inclusions: extractList(html, "Included").map(item => sanitizeFhText(item)).filter(Boolean),
    exclusions: extractList(html, "Not Included").map(item => sanitizeFhText(item)).filter(Boolean),
    highlights: extractList(html, "Highlights").map(item => sanitizeFhText(item, { itemName: title, durationText })).filter(Boolean),
    itinerary: extractList(html, "Itinerary").map(item => sanitizeFhText(item, { itemName: title, durationText })).filter(Boolean),
    pricing: {
      pricePerPersonFrom: Number.isFinite(price) ? price : undefined,
      currency: "USD",
      isPrivate: /private/i.test(text) ? true : undefined,
    },
  };
};


const extractFromFixture = (shortname: string, itemId: string): FhTourFacts | null => {
  const key = Object.keys(fareHarborHtmlByUrl).find(url =>
    new RegExp(`/embeds/book/${shortname}/items/${itemId}/`, "i").test(url)
  );
  if (!key) return null;
  const parsed = parseFareHarborHtml(fareHarborHtmlByUrl[key]);
  return {
    title: parsed.title,
    durationText: normalizeDurationText(parsed.duration)?.text,
    durationMinutes: normalizeDurationText(parsed.duration)?.minutes,
    meetingPoint: parsed.meetingPoint.rawText,
    meetingPointAddress: parsed.meetingPoint.addressLine1,
    cancellationPolicy: normalizeCancellationPolicy(parsed.faq.find(item => /cancel/i.test(item.q))?.a),
    inclusions: parsed.inclusions,
    exclusions: parsed.exclusions,
    highlights: parsed.highlights,
    pricing: {
      isPrivate: /private/i.test(parsed.title),
      pricePerPersonFrom: parsed.priceAdult,
      currency: "USD",
    },
  };
};


const normalizeCancellationPolicy = (raw?: string) => {
  const cleaned = sanitizeFhText(raw ?? "");
  if (!cleaned) return undefined;

  let candidate = cleaned;
  if (/^\s*\{/.test(cleaned)) {
    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      const best =
        (typeof parsed.short_description === "string" && parsed.short_description) ||
        (typeof parsed.description === "string" && parsed.description) ||
        (typeof parsed.policy_text === "string" && parsed.policy_text) ||
        "";
      candidate = sanitizeFhText(best || "");
    } catch {
      candidate = "";
    }
  }

  const cancelWindow = candidate.match(
    /(cancel(?:lation)?[^.\n]{0,180}(?:hour|hours|day|days))/i
  )?.[1];
  const normalized = sanitizeFhText(cancelWindow || candidate);

  if (
    !normalized ||
    /flownode|policy\{|\{\s*"|\{\s*'/.test(normalized.toLowerCase()) ||
    isBadTokenString(normalized)
  ) {
    return "See booking page for cancellation terms.";
  }

  return normalized;
};

const parseUrlBits = (fhEmbedUrl: string) => {
  try {
    const u = new URL(fhEmbedUrl);
    const m = u.pathname.match(/\/embeds\/(?:book|calendar)\/([^/]+)\/items\/(\d+)/);
    if (!m) return null;
    return { shortname: m[1], itemId: m[2], url: u };
  } catch {
    return null;
  }
};

export const fetchFhItemDetails = async ({
  fhEmbedUrl,
  cacheKey,
  cacheTtlHours = 24,
}: {
  fhEmbedUrl: string;
  cacheKey: string;
  cacheTtlHours?: number;
}): Promise<FhTourFacts | null> => {
  const bits = parseUrlBits(fhEmbedUrl);
  if (!bits) return null;

  await mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

  try {
    const existing = JSON.parse(await readFile(cachePath, "utf8")) as { fetchedAt: string; facts: FhTourFacts | null };
    const ageMs = Date.now() - new Date(existing.fetchedAt).getTime();
    if (ageMs < cacheTtlHours * 60 * 60 * 1000) {
      return existing.facts ?? null;
    }
  } catch {
    // no cache
  }

  try {
    const fetchUrl = new URL(fhEmbedUrl);
    fetchUrl.searchParams.set("full-items", "yes");
    const response = await fetch(fetchUrl.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const facts = extractFacts(html);

    await writeFile(cachePath, JSON.stringify({ fetchedAt: new Date().toISOString(), facts }, null, 2), "utf8");
    return facts;
  } catch {
    const fixtureFacts = extractFromFixture(bits.shortname, bits.itemId);
    await writeFile(
      cachePath,
      JSON.stringify({ fetchedAt: new Date().toISOString(), facts: fixtureFacts }, null, 2),
      "utf8"
    );
    return fixtureFacts;
  }
};
