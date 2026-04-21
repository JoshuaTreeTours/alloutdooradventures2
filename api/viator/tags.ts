import { readFile } from "node:fs/promises";
import path from "node:path";

import { fetchViator } from "./client";

const CACHE_MAX_AGE = 60 * 60 * 24;

let cachedTags: unknown = null;
let cachedAt = 0;

const readLocalTagsCache = async () => {
  const tagsPath = path.resolve(process.cwd(), "src/data/viatorTags.json");
  const file = await readFile(tagsPath, "utf8");
  return JSON.parse(file) as unknown;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const now = Date.now();
  if (cachedTags && now - cachedAt < CACHE_MAX_AGE * 1000) {
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=86400`
    );
    res.status(200).json(cachedTags);
    return;
  }

  try {
    const apiKey = process.env.VIATOR_API_KEY;
    const data = apiKey
      ? await fetchViator(apiKey, "/taxonomy/tags", { method: "GET" })
      : await readLocalTagsCache();

    cachedTags = data;
    cachedAt = now;

    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=86400`
    );
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Unable to load tags" });
  }
}
