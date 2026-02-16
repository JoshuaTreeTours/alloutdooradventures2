import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildTourUrlSafe } from "../src/utils/buildTourUrl";

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
  description?: string;
  price?: string;
};

type Failure = {
  tourId: string;
  url: string;
  reason: string;
};

const DEFAULT_FILE = "data/tourEnrichment.csv";
const DEFAULT_CONCURRENCY = 6;
const USER_AGENT = "Mozilla/5.0";

const MARKETING_PATTERNS = [
  /\bbook now\b[!,.]?/gi,
  /\breserve today\b[!,.]?/gi,
  /\blimited availability\b[!,.]?/gi,
];

const parseArgs = (argv: string[]): SyncOptions => {
  let file = DEFAULT_FILE;
  let concurrency = DEFAULT_CONCURRENCY;
  let limit: number | undefined;
  let force = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--file") {
      file = argv[index + 1] ?? file;
      index += 1;
      continue;
    }

    if (arg === "--concurrency") {
      const parsed = Number(argv[index + 1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        concurrency = Math.floor(parsed);
      }
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const parsed = Number(argv[index + 1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = Math.floor(parsed);
      }
      index += 1;
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

  const headers = rawRows[0].map(cell => cell.trim());
  const rows = rawRows.slice(1).map(cells => {
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

const stringifyCsv = (
  data: CsvData,
  lineEnding: "\n" | "\r\n",
  hasBom: boolean
) => {
  const lines: string[] = [];
  lines.push(data.headers.map(escapeCsvCell).join(","));

  for (const row of data.rows) {
    lines.push(
      data.headers.map(header => escapeCsvCell(row[header] ?? "")).join(",")
    );
  }

  const serialized = `${lines.join(lineEnding)}${lineEnding}`;
  return hasBom ? `\uFEFF${serialized}` : serialized;
};

const parseJsonSafely = (value: string): unknown | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x2F;/gi, "/");

const stripHtmlToText = (html: string): string =>
  decodeHtmlEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

const normalizePrice = (value: unknown): string | undefined => {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const raw = String(value).trim();
  if (!raw) {
    return undefined;
  }

  const matched = raw.match(/\d+(?:,\d{3})*(?:\.\d{1,2})?/);
  if (!matched) {
    return undefined;
  }

  return matched[0].replace(/,/g, "");
};

const findScriptBlocks = (html: string) => {
  const matches: Array<{ attrs: string; body: string }> = [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch = scriptRegex.exec(html);

  while (scriptMatch) {
    matches.push({
      attrs: scriptMatch[1] ?? "",
      body: (scriptMatch[2] ?? "").trim(),
    });
    scriptMatch = scriptRegex.exec(html);
  }

  return matches;
};

const collectJsonCandidates = (html: string): unknown[] => {
  const candidates: unknown[] = [];

  for (const { attrs, body } of findScriptBlocks(html)) {
    if (!body) {
      continue;
    }

    if (/application\/ld\+json/i.test(attrs)) {
      const parsedLd = parseJsonSafely(body);
      if (parsedLd) {
        candidates.push(parsedLd);
      }
      continue;
    }

    const fhAssignments = [
      /window\.FH\s*=\s*([\s\S]*?);\s*(?:window\.|$)/gi,
      /window\.__FH__\s*=\s*([\s\S]*?);\s*(?:window\.|$)/gi,
      /window\.FH\s*=\s*([\s\S]*?);\s*<\//gi,
      /window\.__FH__\s*=\s*([\s\S]*?);\s*<\//gi,
    ];

    for (const pattern of fhAssignments) {
      let match = pattern.exec(body);
      while (match) {
        const parsed = parseJsonSafely(match[1]?.trim() ?? "");
        if (parsed) {
          candidates.push(parsed);
        }
        match = pattern.exec(body);
      }
    }

    const braceMatches = body.match(/\{[\s\S]*\}/g) ?? [];
    for (const chunk of braceMatches) {
      const parsed = parseJsonSafely(chunk);
      if (parsed) {
        candidates.push(parsed);
      }
    }
  }

  return candidates;
};

const pickBestDescription = (candidates: Array<string | undefined>) =>
  candidates
    .filter((candidate): candidate is string =>
      Boolean(candidate && candidate.trim())
    )
    .map(candidate => candidate.trim())
    .sort((a, b) => b.length - a.length)[0];

const extractItemLikeNode = (
  input: unknown
): Record<string, unknown> | undefined => {
  if (!input) {
    return undefined;
  }

  if (Array.isArray(input)) {
    for (const value of input) {
      const found = extractItemLikeNode(value);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  if (!isRecord(input)) {
    return undefined;
  }

  const item = input.item;
  if (isRecord(item)) {
    return item;
  }

  if (
    typeof input.name === "string" &&
    (typeof input.description === "string" || input.price)
  ) {
    return input;
  }

  for (const value of Object.values(input)) {
    const found = extractItemLikeNode(value);
    if (found) {
      return found;
    }
  }

  return undefined;
};

const extractFromJsonCandidates = (candidates: unknown[]): ExtractedContent => {
  for (const candidate of candidates) {
    const node = extractItemLikeNode(candidate);
    if (!node) {
      continue;
    }

    const description = pickBestDescription([
      typeof node.description === "string" ? node.description : undefined,
      typeof node.short_description === "string"
        ? node.short_description
        : undefined,
      typeof node.summary === "string" ? node.summary : undefined,
    ]);

    const price =
      normalizePrice(node.price) ??
      normalizePrice(node.display_price) ??
      normalizePrice(node.minimum_price) ??
      normalizePrice(node.min_price) ??
      normalizePrice(node.amount);

    if (description || price) {
      return { description, price };
    }
  }

  return {};
};

const extractVisibleDescription = (html: string): string | undefined => {
  const visibleBlocks = [
    /<(?:div|section|p)[^>]*(?:description|overview|details)[^>]*>([\s\S]*?)<\/(?:div|section|p)>/gi,
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i,
    /<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["'][^>]*>/i,
  ];

  const candidates: string[] = [];
  for (const pattern of visibleBlocks) {
    let match = pattern.exec(html);
    while (match) {
      const text = stripHtmlToText(match[1] ?? "");
      if (text) {
        candidates.push(text);
      }
      match = pattern.exec(html);
    }
  }

  return pickBestDescription(candidates);
};

const extractVisiblePrice = (html: string): string | undefined => {
  const text = stripHtmlToText(html);
  const patterns = [
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:USD|per\s+person|pp|adult)/i,
    /(?:from|starting\s+at|price\s+from)\s*\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/,
  ];

  for (const pattern of patterns) {
    const matched = text.match(pattern);
    if (matched?.[1]) {
      const normalized = normalizePrice(matched[1]);
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
  return matches.map(sentence => sentence.trim()).filter(Boolean);
};

const formatDescription = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  let cleaned = decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of MARKETING_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").replace(/\s+/g, " ").trim();
  }

  if (!cleaned) {
    return undefined;
  }

  const sentences = splitSentences(cleaned);
  if (!sentences.length) {
    return undefined;
  }

  return sentences.slice(0, 2).join(" ");
};

const fetchFareHarborHtml = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
};

const extractContent = (html: string): ExtractedContent => {
  const fromJson = extractFromJsonCandidates(collectJsonCandidates(html));
  const description = formatDescription(
    fromJson.description ?? extractVisibleDescription(html)
  );
  const price = fromJson.price ?? extractVisiblePrice(html);

  return {
    description,
    price,
  };
};

const runWithConcurrency = async <T>(
  taskCount: number,
  concurrency: number,
  worker: (index: number) => Promise<T>
): Promise<T[]> => {
  const output = new Array<T>(taskCount);
  let nextIndex = 0;

  const runners = Array.from(
    { length: Math.min(concurrency, taskCount) },
    async () => {
      while (true) {
        const current = nextIndex;
        nextIndex += 1;
        if (current >= taskCount) {
          return;
        }

        output[current] = await worker(current);
      }
    }
  );

  await Promise.all(runners);
  return output;
};

const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

const shouldUpdateField = (
  currentValue: string,
  nextValue: string | undefined,
  force: boolean
): boolean => {
  if (!nextValue) {
    return false;
  }

  if (force) {
    return currentValue !== nextValue;
  }

  return !currentValue.trim() || currentValue !== nextValue;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(options.file);

  const csvRaw = await readFile(filePath, "utf8");
  const hasBom = csvRaw.startsWith("\uFEFF");
  const lineEnding: "\n" | "\r\n" = csvRaw.includes("\r\n") ? "\r\n" : "\n";

  const csv = parseCsv(csvRaw);
  if (!csv.headers.length) {
    throw new Error(`CSV file has no headers: ${filePath}`);
  }

  const rowsToProcess = options.limit
    ? csv.rows.slice(0, options.limit)
    : csv.rows;

  let rowsProcessed = 0;
  let rowsUpdated = 0;
  let rowsSkipped = 0;
  const failures: Failure[] = [];

  await runWithConcurrency(
    rowsToProcess.length,
    options.concurrency,
    async index => {
      const row = rowsToProcess[index];
      const tourId = (row.tourId ?? "").trim() || "unknown";
      const sourceUrl = buildTourUrlSafe({
        source_url: row.source_url,
        slug: row.slug,
        title: row.title,
        tourId,
        state: row.state,
        city: row.city,
        state_slug: row.state_slug,
        city_slug: row.city_slug,
      });

      if (!(row.source_url ?? "").trim()) {
        console.warn(`Fallback used: missing source_url for tourId ${tourId}`);
      }

      try {
        const html = await fetchFareHarborHtml(sourceUrl);
        const extracted = extractContent(html);

        let changed = false;

        if (
          shouldUpdateField(
            row.description ?? "",
            extracted.description,
            options.force
          )
        ) {
          row.description = extracted.description ?? row.description ?? "";
          changed = true;
        }

        if (
          shouldUpdateField(row.price ?? "", extracted.price, options.force)
        ) {
          row.price = extracted.price ?? row.price ?? "";
          changed = true;
        }

        if (changed) {
          row.last_updated = nowIso();
          rowsUpdated += 1;
        } else {
          rowsSkipped += 1;
        }
      } catch (error) {
        rowsSkipped += 1;
        failures.push({
          tourId,
          url: sourceUrl,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }

      rowsProcessed += 1;
    }
  );

  const nextCsv = stringifyCsv(csv, lineEnding, hasBom);
  if (nextCsv !== csvRaw) {
    await writeFile(filePath, nextCsv, "utf8");
  }

  console.log(`Rows processed: ${rowsProcessed}`);
  console.log(`Rows updated: ${rowsUpdated}`);
  console.log(`Rows skipped: ${rowsSkipped}`);
  console.log(`Failures: ${failures.length}`);
  for (const failure of failures) {
    console.log(
      ` - tourId=${failure.tourId} url=${failure.url || "n/a"} reason=${failure.reason}`
    );
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
