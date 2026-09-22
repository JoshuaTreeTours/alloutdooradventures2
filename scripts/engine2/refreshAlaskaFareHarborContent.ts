import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AlaskaFareHarborContentRecord } from "../../src/engine2/data/alaskaFareHarborContent";
import { alaskaFareHarborGeneratedContent } from "../../src/engine2/data/alaskaFareHarborContent.generated";

type AlaskaCsvRow = Record<string, string>;

type SourceItem = {
  id: string;
  title: string;
  companyShortname: string;
  location: string;
  bookingUrl: string;
};

const CSV_PATH = path.resolve("data/alaska.csv");
const OUTPUT_PATH = path.resolve(
  "src/engine2/data/alaskaFareHarborContent.generated.ts"
);
const USER_AGENT =
  "Mozilla/5.0 (compatible; AllOutdoorAdventuresBot/1.0; +https://www.alloutdooradventures.com)";
const CONCURRENCY = 5;
const REQUEST_TIMEOUT_MS = 20_000;
const FETCH_RETRIES = 2;

const clean = (value?: string) => (value ?? "").replace(/\s+/g, " ").trim();

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 10))
    );

const stripHtml = (value: string) =>
  clean(
    decodeHtmlEntities(
      value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    )
  );

const splitCsv = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(current);
      current = "";
      continue;
    }
    if (char === "\n" && !quoted) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }
    if (char !== "\r") current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (text: string): AlaskaCsvRow[] => {
  const [header, ...rows] = splitCsv(text.replace(/^\uFEFF/, ""));
  if (!header) return [];
  return rows
    .filter(row => row.some(cell => clean(cell)))
    .map(row => {
      const record: AlaskaCsvRow = {};
      header.forEach((key, index) => {
        record[clean(key)] = row[index] ?? "";
      });
      return record;
    });
};

const isAlaskaSourceRow = (row: AlaskaCsvRow) => {
  const location = clean(row.location).toLowerCase();
  if (location.startsWith("canada/")) return false;
  return true;
};

const toSourceItem = (row: AlaskaCsvRow): SourceItem | null => {
  if (!isAlaskaSourceRow(row)) return null;

  const id = clean(row.item_id);
  const companyShortname = clean(row.company_shortname);
  if (!/^\d+$/.test(id) || !companyShortname) return null;

  const bookingUrl =
    clean(row.regular_link) ||
    clean(row.calendar_link) ||
    `https://fareharbor.com/embeds/book/${companyShortname}/items/${id}/`;

  return {
    id,
    title: clean(row.item_name),
    companyShortname,
    location: clean(row.location),
    bookingUrl,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const parseJson = (value: string): unknown | null => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const collectJsonCandidates = (html: string) => {
  const candidates: unknown[] = [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match = scriptRegex.exec(html);

  while (match) {
    const attrs = match[1] ?? "";
    const body = (match[2] ?? "").trim();

    if (body) {
      if (/application\/ld\+json/i.test(attrs)) {
        const parsed = parseJson(body);
        if (parsed) candidates.push(parsed);
      }

      for (const pattern of [
        /window\.FH\s*=\s*([\s\S]*?);\s*(?:window\.|$)/gi,
        /window\.__FH__\s*=\s*([\s\S]*?);\s*(?:window\.|$)/gi,
      ]) {
        let assignment = pattern.exec(body);
        while (assignment) {
          const parsed = parseJson((assignment[1] ?? "").trim());
          if (parsed) candidates.push(parsed);
          assignment = pattern.exec(body);
        }
      }

      if (body.startsWith("{") || body.startsWith("[")) {
        const parsed = parseJson(body);
        if (parsed) candidates.push(parsed);
      }
    }

    match = scriptRegex.exec(html);
  }

  return candidates;
};

const numericId = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return value.trim();
  return "";
};

const findItemNode = (
  input: unknown,
  itemId: string,
  depth = 0
): Record<string, unknown> | null => {
  if (depth > 12 || !input) return null;

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findItemNode(item, itemId, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (!isRecord(input)) return null;

  const directId = numericId(
    input.pk ?? input.id ?? input.item_id ?? input.itemId ?? input.product_id
  );
  if (directId === itemId) return input;

  if (isRecord(input.item)) {
    const nestedId = numericId(
      input.item.pk ?? input.item.id ?? input.item.item_id ?? input.item.itemId
    );
    if (nestedId === itemId || !nestedId) return input.item;
  }

  for (const value of Object.values(input)) {
    const found = findItemNode(value, itemId, depth + 1);
    if (found) return found;
  }
  return null;
};

const findValueByKeys = (
  input: unknown,
  keys: Set<string>,
  depth = 0
): unknown => {
  if (depth > 7 || !input) return undefined;
  if (Array.isArray(input)) {
    for (const value of input) {
      const found = findValueByKeys(value, keys, depth + 1);
      if (found !== undefined && found !== null && found !== "") return found;
    }
    return undefined;
  }
  if (!isRecord(input)) return undefined;

  for (const [key, value] of Object.entries(input)) {
    if (keys.has(key.toLowerCase()) && value !== undefined && value !== null) {
      return value;
    }
  }
  for (const value of Object.values(input)) {
    const found = findValueByKeys(value, keys, depth + 1);
    if (found !== undefined && found !== null && found !== "") return found;
  }
  return undefined;
};

const textFromUnknown = (value: unknown): string => {
  if (typeof value === "string") return stripHtml(value);
  if (typeof value === "number") return String(value);
  if (!isRecord(value)) return "";

  const pieces = [
    value.title,
    value.name,
    value.label,
    value.description,
    value.description_safe_html,
    value.address,
  ]
    .map(textFromUnknown)
    .filter(Boolean);
  return clean(Array.from(new Set(pieces)).join(" — "));
};

const arrayFromUnknown = (value: unknown): string[] => {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return Array.from(
    new Set(values.map(textFromUnknown).map(clean).filter(item => item.length >= 3))
  ).slice(0, 12);
};

const sectionContent = (html: string, labels: string[]) => {
  const escaped = labels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const labelPattern = escaped.join("|");
  const regex = new RegExp(
    `<h[1-5][^>]*>\\s*(?:${labelPattern})\\s*<\\/h[1-5]>([\\s\\S]*?)(?=<h[1-5][^>]*>|$)`,
    "i"
  );
  const match = html.match(regex);
  if (!match?.[1]) return [];

  const block = match[1];
  const listItems = Array.from(block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map(entry => stripHtml(entry[1] ?? ""))
    .filter(Boolean);
  if (listItems.length) return Array.from(new Set(listItems)).slice(0, 12);

  const paragraphs = Array.from(block.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map(entry => stripHtml(entry[1] ?? ""))
    .filter(Boolean);
  if (paragraphs.length) return Array.from(new Set(paragraphs)).slice(0, 12);

  const text = stripHtml(block);
  return text ? [text] : [];
};

const firstSectionText = (html: string, labels: string[]) =>
  sectionContent(html, labels)[0] ?? "";

const sentenceList = (value: string) =>
  value
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map(sentence => clean(sentence))
    .filter(Boolean) ?? [];

const conciseOverview = (value: string) => {
  const sentences = sentenceList(value);
  if (!sentences.length) return clean(value).slice(0, 900);
  let result = "";
  for (const sentence of sentences.slice(0, 5)) {
    const candidate = clean(`${result} ${sentence}`);
    if (candidate.length > 900 && result) break;
    result = candidate;
  }
  return result;
};

const deriveHighlights = (overview: string) =>
  sentenceList(overview)
    .filter(sentence => sentence.length >= 35 && sentence.length <= 190)
    .slice(0, 5)
    .map(sentence => sentence.replace(/[.!?]+$/, ""));

const parseDuration = (node: Record<string, unknown> | null, title: string, html: string) => {
  if (node) {
    const direct = findValueByKeys(
      node,
      new Set(["duration", "duration_text", "duration_display", "length"])
    );
    const directText = textFromUnknown(direct);
    if (directText && directText.length <= 80) return directText;

    const minutes = findValueByKeys(
      node,
      new Set(["duration_minutes", "duration_in_minutes", "length_minutes"])
    );
    const minuteValue = Number(minutes);
    if (Number.isFinite(minuteValue) && minuteValue > 0 && minuteValue < 100_000) {
      if (minuteValue % 60 === 0) return `${minuteValue / 60} hours`;
      if (minuteValue > 60) {
        return `${Math.floor(minuteValue / 60)} hr ${minuteValue % 60} min`;
      }
      return `${minuteValue} minutes`;
    }
  }

  const pageText = stripHtml(html);
  const explicit = pageText.match(
    /(?:duration|time|length)\s*:?\s*((?:\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?|days?))(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?|days?))?)/i
  );
  if (explicit?.[1]) return clean(explicit[1]);

  const fromTitle = title.match(
    /(\d+(?:\.\d+)?)\s*[- ]?\s*(hours?|hrs?|minutes?|mins?|days?)/i
  );
  return fromTitle ? clean(`${fromTitle[1]} ${fromTitle[2]}`) : undefined;
};

const parsePickup = (node: Record<string, unknown> | null, html: string) => {
  if (node) {
    const value = findValueByKeys(
      node,
      new Set([
        "is_pickup_ever_available",
        "pickup_available",
        "pickup_included",
        "has_pickup",
      ])
    );
    if (typeof value === "boolean") return value ? "yes" : "no";
  }
  const text = stripHtml(html);
  if (/pickup\s+(?:is\s+)?included|hotel\s+pickup/i.test(text)) return "yes";
  if (/no\s+(?:hotel\s+)?pickup/i.test(text)) return "no";
  return "unknown";
};

const sourceFromJson = (node: Record<string, unknown> | null) => {
  if (!node) return {} as Partial<AlaskaFareHarborContentRecord>;

  const overviewValue = findValueByKeys(
    node,
    new Set([
      "description",
      "description_safe_html",
      "short_description",
      "summary",
      "headline",
    ])
  );
  const overview = conciseOverview(textFromUnknown(overviewValue));

  return {
    overview: overview || undefined,
    highlights: arrayFromUnknown(
      findValueByKeys(node, new Set(["highlights", "item_highlights", "key_points"]))
    ),
    itinerary: arrayFromUnknown(
      findValueByKeys(
        node,
        new Set(["itinerary", "itinerary_items", "schedule", "stops"])
      )
    ),
    included: arrayFromUnknown(
      findValueByKeys(node, new Set(["included", "inclusions", "whats_included"]))
    ),
    notIncluded: arrayFromUnknown(
      findValueByKeys(
        node,
        new Set(["not_included", "excluded", "exclusions", "whats_not_included"])
      )
    ),
    requirements: arrayFromUnknown(
      findValueByKeys(
        node,
        new Set([
          "requirements",
          "what_to_bring",
          "restrictions",
          "booking_notes",
        ])
      )
    ),
    cancellation: textFromUnknown(
      findValueByKeys(
        node,
        new Set([
          "cancellation_policy",
          "cancellation_policy_safe_html",
          "cancellation",
        ])
      )
    ) || undefined,
    meetingLocation: textFromUnknown(
      findValueByKeys(
        node,
        new Set(["meeting_location", "meeting_point", "meeting_address"])
      )
    ) || undefined,
  } satisfies Partial<AlaskaFareHarborContentRecord>;
};

const mergeArrays = (primary: string[] | undefined, fallback: string[]) =>
  primary?.filter(Boolean).length ? primary.filter(Boolean) : fallback;

const buildRecord = (
  source: SourceItem,
  node: Record<string, unknown> | null,
  html: string
): AlaskaFareHarborContentRecord | null => {
  const json = sourceFromJson(node);

  const overviewFromHtml = firstSectionText(html, [
    "Overview",
    "Description",
    "About This Tour",
    "About",
  ]);
  const metaDescription =
    html
      .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html
      .match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ??
    "";
  const overview = conciseOverview(
    clean(json.overview) || stripHtml(overviewFromHtml) || decodeHtmlEntities(metaDescription)
  );

  const highlights = mergeArrays(
    json.highlights,
    sectionContent(html, ["Highlights", "Tour Highlights", "Experience Highlights"])
  );
  const finalHighlights = highlights.length
    ? highlights.slice(0, 8)
    : deriveHighlights(overview);

  const itinerary = mergeArrays(
    json.itinerary,
    sectionContent(html, ["Itinerary", "Tour Itinerary", "Schedule"])
  ).slice(0, 10);
  const included = mergeArrays(
    json.included,
    sectionContent(html, ["Included", "What's Included", "What’s Included"])
  ).slice(0, 12);
  const notIncluded = mergeArrays(
    json.notIncluded,
    sectionContent(html, ["Not Included", "What's Not Included", "What’s Not Included"])
  ).slice(0, 12);
  const requirements = mergeArrays(
    json.requirements,
    sectionContent(html, [
      "Requirements",
      "What to Bring",
      "What To Bring",
      "Important Information",
      "Restrictions",
    ])
  ).slice(0, 12);

  const cancellation =
    clean(json.cancellation) ||
    firstSectionText(html, ["Cancellation", "Cancellation Policy", "Refund Policy"]);
  const meetingLocation =
    clean(json.meetingLocation) ||
    firstSectionText(html, ["Meeting Point", "Meeting Location", "Where to Meet"]);

  const duration = parseDuration(node, source.title, html);
  const pickup = parsePickup(node, html);

  const record: AlaskaFareHarborContentRecord = {
    overview: overview || undefined,
    highlights: finalHighlights.length ? finalHighlights : undefined,
    itinerary: itinerary.length ? itinerary : undefined,
    duration,
    meetingLocation: meetingLocation || undefined,
    pickup,
    included: included.length ? included : undefined,
    notIncluded: notIncluded.length ? notIncluded : undefined,
    requirements: requirements.length ? requirements : undefined,
    cancellation: cancellation || undefined,
    sourceUrl: source.bookingUrl,
  };

  const meaningful = Boolean(
    record.overview ||
      record.highlights?.length ||
      record.itinerary?.length ||
      record.included?.length ||
      record.requirements?.length ||
      record.duration
  );
  return meaningful ? record : null;
};

const fetchWithRetry = async (url: string, accept: string) => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { accept, "user-agent": USER_AGENT },
        redirect: "follow",
        signal: controller.signal,
      });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error("Fetch failed");
};

const fetchSource = async (source: SourceItem) => {
  let apiNode: Record<string, unknown> | null = null;
  const itemApiUrl = `https://fareharbor.com/api/v1/companies/${encodeURIComponent(
    source.companyShortname
  )}/items/${source.id}/`;

  try {
    const response = await fetchWithRetry(itemApiUrl, "application/json");
    const payload = (await response.json()) as unknown;
    apiNode = findItemNode(payload, source.id) ?? (isRecord(payload) ? payload : null);
  } catch {
    // The public item endpoint is not enabled for every operator. The booking
    // page below is the canonical fallback and usually embeds the same item data.
  }

  const bookingUrl = source.bookingUrl.startsWith("http")
    ? source.bookingUrl
    : `https://fareharbor.com/embeds/book/${source.companyShortname}/items/${source.id}/`;
  const response = await fetchWithRetry(bookingUrl, "text/html,application/xhtml+xml");
  const html = await response.text();

  let node = apiNode;
  if (!node) {
    for (const candidate of collectJsonCandidates(html)) {
      node = findItemNode(candidate, source.id);
      if (node) break;
    }
  }

  return buildRecord(source, node, html);
};

const withConcurrency = async <T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>
) => {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
};

const sortedRecord = (records: Record<string, AlaskaFareHarborContentRecord>) =>
  Object.fromEntries(
    Object.entries(records).sort(([left], [right]) =>
      left.localeCompare(right, undefined, { numeric: true })
    )
  );

const serialize = (records: Record<string, AlaskaFareHarborContentRecord>) => `import type { AlaskaFareHarborContentRecord } from "./alaskaFareHarborContent";

// Auto-generated by scripts/engine2/refreshAlaskaFareHarborContent.ts.
// Successful FareHarbor refreshes populate this map. Manual high-confidence
// overrides live in alaskaFareHarborContent.ts and take precedence.
export const alaskaFareHarborGeneratedContent: Record<
  string,
  AlaskaFareHarborContentRecord
> = ${JSON.stringify(sortedRecord(records), null, 2)};
`;

const main = async () => {
  const raw = await readFile(CSV_PATH, "utf8");
  const sources = parseCsv(raw)
    .map(toSourceItem)
    .filter((item): item is SourceItem => item !== null);

  const uniqueSources = Array.from(
    new Map(sources.map(source => [source.id, source])).values()
  );
  const next: Record<string, AlaskaFareHarborContentRecord> = {
    ...alaskaFareHarborGeneratedContent,
  };

  let refreshed = 0;
  let preserved = 0;
  const failures: Array<{ id: string; title: string; reason: string }> = [];

  await withConcurrency(uniqueSources, CONCURRENCY, async source => {
    try {
      const record = await fetchSource(source);
      if (record) {
        next[source.id] = record;
        refreshed += 1;
      } else {
        preserved += 1;
      }
    } catch (error) {
      preserved += 1;
      failures.push({
        id: source.id,
        title: source.title,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  await writeFile(OUTPUT_PATH, serialize(next), "utf8");

  console.log(`Alaska FareHarbor products considered: ${uniqueSources.length}`);
  console.log(`Content records refreshed: ${refreshed}`);
  console.log(`Existing records preserved/no rich content: ${preserved}`);
  console.log(`Failures: ${failures.length}`);
  for (const failure of failures.slice(0, 30)) {
    console.log(` - ${failure.id} ${failure.title}: ${failure.reason}`);
  }
  if (failures.length > 30) {
    console.log(` - ...and ${failures.length - 30} more`);
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
