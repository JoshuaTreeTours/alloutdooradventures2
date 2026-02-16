import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type CsvData = {
  headers: string[];
  rows: Record<string, string>[];
};

type SyncOptions = {
  file: string;
  concurrency: number;
  limit?: number;
  force: boolean;
};

type ExtractedContent = {
  price?: string;
  description?: string;
};

type Failure = {
  tourId: string;
  url: string;
  reason: string;
};

const DEFAULT_FILE = "data/tourEnrichment.csv";
const DEFAULT_CONCURRENCY = 6;
const USER_AGENT =
  "Mozilla/5.0 (compatible; alloutdooradventures-sync/1.0; +https://www.alloutdooradventures.com)";

const PRICE_KEYS = new Set(["price", "lowPrice", "minPrice", "startingPrice", "amount"]);
const DESCRIPTION_KEYS = new Set(["description"]);

const parseArgs = (argv: string[]): SyncOptions => {
  let file = DEFAULT_FILE;
  let concurrency = DEFAULT_CONCURRENCY;
  let limit: number | undefined;
  let force = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--file") {
      file = argv[i + 1] ?? file;
      i += 1;
      continue;
    }

    if (arg === "--concurrency") {
      const value = Number(argv[i + 1]);
      if (Number.isFinite(value) && value > 0) {
        concurrency = Math.floor(value);
      }
      i += 1;
      continue;
    }

    if (arg === "--limit") {
      const value = Number(argv[i + 1]);
      if (Number.isFinite(value) && value > 0) {
        limit = Math.floor(value);
      }
      i += 1;
      continue;
    }

    if (arg === "--force") {
      force = true;
    }
  }

  return { file, concurrency, limit, force };
};

const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    if (char !== "\r") {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (text: string): CsvData => {
  const normalized = text.replace(/^\uFEFF/, "");
  const rawRows = parseCsvRows(normalized);

  if (!rawRows.length) {
    return { headers: [], rows: [] };
  }

  const headers = rawRows[0].map((cell) => cell.trim());
  const rows = rawRows.slice(1).map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });

  return { headers, rows };
};

const escapeCsvCell = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const stringifyCsv = (data: CsvData) => {
  const lines: string[] = [];
  lines.push(data.headers.map(escapeCsvCell).join(","));

  for (const row of data.rows) {
    const line = data.headers.map((header) => escapeCsvCell(row[header] ?? "")).join(",");
    lines.push(line);
  }

  return `${lines.join("\r\n")}\r\n`;
};

const appendBookPath = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    if (/\/book\//.test(pathname)) {
      parsed.pathname = pathname;
      return parsed.toString();
    }
    if (pathname.endsWith("/book")) {
      parsed.pathname = pathname || "/book";
      return parsed.toString();
    }
    parsed.pathname = `${pathname}/book`.replace(/\/+/g, "/");
    return parsed.toString();
  } catch {
    const normalized = trimmed.replace(/\/+$/, "");
    if (normalized.endsWith("/book")) {
      return normalized;
    }
    return `${normalized}/book`;
  }
};

const deriveBookUrl = (row: Record<string, string>) => {
  const fromSource = appendBookPath(row.source_url ?? "");
  if (!fromSource) {
    return "";
  }

  return fromSource;
};

const parseJsonSafely = (value: string): unknown | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const findScriptContents = (html: string, attrsPattern?: RegExp): string[] => {
  const matches: string[] = [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch = scriptRegex.exec(html);

  while (scriptMatch) {
    const attrs = scriptMatch[1] ?? "";
    const body = scriptMatch[2] ?? "";
    if (!attrsPattern || attrsPattern.test(attrs)) {
      matches.push(body.trim());
    }
    scriptMatch = scriptRegex.exec(html);
  }

  return matches;
};

const normalizePrice = (value: string | number): string | undefined => {
  const raw = String(value).trim();
  if (!raw) {
    return undefined;
  }

  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) {
    return undefined;
  }

  return cleaned;
};

const walkForKeys = (input: unknown, keys: Set<string>, output: string[] = []): string[] => {
  if (Array.isArray(input)) {
    for (const item of input) {
      walkForKeys(item, keys, output);
    }
    return output;
  }

  if (input && typeof input === "object") {
    for (const [key, value] of Object.entries(input)) {
      if (keys.has(key) && (typeof value === "string" || typeof value === "number")) {
        output.push(String(value));
      }

      if (typeof value === "object" && value !== null) {
        walkForKeys(value, keys, output);
      }
    }
  }

  return output;
};

const extractPriceFromJsonLd = (html: string): string | undefined => {
  const blocks = findScriptContents(html, /type=["']application\/ld\+json["']/i);

  for (const block of blocks) {
    const parsed = parseJsonSafely(block);
    if (!parsed) {
      continue;
    }

    const values = walkForKeys(parsed, PRICE_KEYS);
    for (const value of values) {
      const normalized = normalizePrice(value);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
};

const extractDescriptionFromJsonLd = (html: string): string | undefined => {
  const blocks = findScriptContents(html, /type=["']application\/ld\+json["']/i);

  for (const block of blocks) {
    const parsed = parseJsonSafely(block);
    if (!parsed) {
      continue;
    }

    const values = walkForKeys(parsed, DESCRIPTION_KEYS);
    const candidate = values.find(Boolean);
    if (candidate) {
      return candidate;
    }
  }

  return undefined;
};

const extractFromNextData = (html: string): ExtractedContent => {
  const blocks = findScriptContents(html, /id=["']__NEXT_DATA__["']/i);
  for (const block of blocks) {
    const parsed = parseJsonSafely(block);
    if (!parsed) {
      continue;
    }

    const prices = walkForKeys(parsed, PRICE_KEYS);
    const descriptions = walkForKeys(parsed, DESCRIPTION_KEYS);

    const price = prices.map(normalizePrice).find(Boolean);
    const description = descriptions.find(Boolean);

    if (price || description) {
      return {
        price: price ?? undefined,
        description: description ?? undefined,
      };
    }
  }

  return {};
};

const decodeEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const extractMetaDescription = (html: string): string | undefined => {
  const patterns = [
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i,
    /<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["'][^>]*>/i,
    /<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["'][^>]*>/i,
    /<meta\s+content=["']([\s\S]*?)["']\s+property=["']og:description["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeEntities(match[1]).trim();
    }
  }

  return undefined;
};

const stripHtmlToText = (html: string): string => {
  const withoutScripts = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");

  const noTags = withoutScripts.replace(/<[^>]+>/g, " ");
  return decodeEntities(noTags).replace(/\s+/g, " ").trim();
};

const extractPriceFromHtmlFallback = (html: string): string | undefined => {
  const text = stripHtmlToText(html);
  const patterns = [
    /from\s*\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:per\s+person|pp|adult)/i,
    /(?:starting\s+at|price\s+from)\s*\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const normalized = normalizePrice(match[1]);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
};

const splitSentences = (value: string): string[] => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const matches = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  return matches.map((sentence) => sentence.trim()).filter(Boolean);
};

const stripBoilerplate = (value: string) =>
  value
    .replace(/\bbook now\b[!,.]?/gi, "")
    .replace(/\breserve today\b[!,.]?/gi, "")
    .replace(/\blowest price guarantee\b[!,.]?/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeDescription = (value: string): string | undefined => {
  const stripped = stripBoilerplate(value);
  if (!stripped) {
    return undefined;
  }

  const sentences = splitSentences(stripped);
  if (!sentences.length) {
    return undefined;
  }

  return sentences.slice(0, 2).join(" ");
};

const extractContent = (html: string): ExtractedContent => {
  const jsonLdPrice = extractPriceFromJsonLd(html);
  const jsonLdDescription = extractDescriptionFromJsonLd(html);

  const nextData = extractFromNextData(html);

  const metaDescription = extractMetaDescription(html);
  const visibleDescription = stripHtmlToText(html);

  const description = normalizeDescription(
    jsonLdDescription ?? nextData.description ?? metaDescription ?? visibleDescription,
  );

  const price =
    jsonLdPrice ?? nextData.price ?? extractPriceFromHtmlFallback(html);

  return {
    price,
    description,
  };
};

const fetchBookPage = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
};

const runWithConcurrency = async <T>(
  taskCount: number,
  concurrency: number,
  worker: (index: number) => Promise<T>,
): Promise<T[]> => {
  const output = new Array<T>(taskCount);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.min(concurrency, taskCount) }, async () => {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= taskCount) {
        return;
      }

      output[current] = await worker(current);
    }
  });

  await Promise.all(runners);
  return output;
};

const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(options.file);
  const csvRaw = await readFile(filePath, "utf8");
  const csv = parseCsv(csvRaw);

  if (!csv.headers.length) {
    throw new Error(`CSV file has no headers: ${filePath}`);
  }

  const targetRows = options.limit ? csv.rows.slice(0, options.limit) : csv.rows;

  const failures: Failure[] = [];
  let rowsUpdated = 0;
  let rowsSkipped = 0;
  let rowsProcessed = 0;

  await runWithConcurrency(targetRows.length, options.concurrency, async (index) => {
    const row = targetRows[index];
    const tourId = (row.tourId ?? "").trim();
    const url = deriveBookUrl(row);

    if (!url) {
      failures.push({ tourId: tourId || "unknown", url: "", reason: "Missing source_url" });
      rowsSkipped += 1;
      return;
    }

    try {
      const html = await fetchBookPage(url);
      const extracted = extractContent(html);

      let changed = false;

      if (extracted.price && (options.force || !(row.price ?? "").trim())) {
        if ((row.price ?? "") !== extracted.price) {
          row.price = extracted.price;
          changed = true;
        }
      }

      if (extracted.description && (options.force || !(row.description ?? "").trim())) {
        if ((row.description ?? "") !== extracted.description) {
          row.description = extracted.description;
          changed = true;
        }
      }

      if (changed) {
        row.last_updated = nowIso();
        rowsUpdated += 1;
      } else {
        rowsSkipped += 1;
      }

      rowsProcessed += 1;
    } catch (error) {
      failures.push({
        tourId: tourId || "unknown",
        url,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
      rowsProcessed += 1;
      rowsSkipped += 1;
    }
  });

  const fullRowsByRef = new Set(targetRows);
  const mergedRows = csv.rows.map((row) => (fullRowsByRef.has(row) ? row : row));

  const nextCsv = stringifyCsv({ headers: csv.headers, rows: mergedRows });
  if (nextCsv !== csvRaw) {
    await writeFile(filePath, nextCsv, "utf8");
  }

  console.log(`Rows processed: ${rowsProcessed}`);
  console.log(`Rows updated: ${rowsUpdated}`);
  console.log(`Rows skipped: ${rowsSkipped}`);
  console.log(`Failures: ${failures.length}`);

  for (const failure of failures) {
    console.log(` - tourId=${failure.tourId} url=${failure.url || "n/a"} reason=${failure.reason}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
