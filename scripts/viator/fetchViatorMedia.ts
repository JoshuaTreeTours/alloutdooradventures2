import fs from "node:fs";
import path from "node:path";
import {
  getViatorMediaCacheKey,
  parseViatorMediaFromHtml,
} from "./viatorMedia";

const CACHE_DIR = path.resolve("data/cache/viator-media");
const USER_AGENT =
  "Mozilla/5.0 (compatible; AOA-Codex/1.0; +https://www.alloutdooradventures.com)";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, attempts = 3) => {
  let lastError: unknown = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await sleep(750 * (i + 1));
      }
    }
  }
  throw lastError;
};

const sourceUrl = process.argv[2];
if (!sourceUrl) {
  console.error("Usage: tsx scripts/viator/fetchViatorMedia.ts <viator-url>");
  process.exit(1);
}

const run = async () => {
  const html = await fetchWithRetry(sourceUrl, 3);
  const media = parseViatorMediaFromHtml(html, sourceUrl);
  const cacheKey = getViatorMediaCacheKey(sourceUrl);
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    cachePath,
    JSON.stringify(
      {
        sourceUrl,
        cacheKey,
        fetchedAt: new Date().toISOString(),
        rawHtml: html,
        media,
      },
      null,
      2
    )
  );
  console.log(cachePath);
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
