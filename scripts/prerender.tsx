import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderApp } from "../src/entry-server";
import { DEFAULT_SEO } from "../src/utils/seo";
import { buildRouteSets } from "./generate-sitemap.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "../dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

const replaceOrInsert = (
  html: string,
  pattern: RegExp,
  replacement: string,
) => {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace("</head>", `${replacement}\n</head>`);
};

const updateHead = (html: string, seo: typeof DEFAULT_SEO) => {
  const titleTag = `<title>${escapeHtml(seo.title)}</title>`;
  const descriptionTag = `<meta name="description" content="${escapeHtml(
    seo.description,
  )}" />`;
  const ogTitleTag = `<meta property="og:title" content="${escapeHtml(
    seo.title,
  )}" />`;
  const ogDescriptionTag = `<meta property="og:description" content="${escapeHtml(
    seo.description,
  )}" />`;
  const ogTypeTag = `<meta property="og:type" content="${escapeHtml(
    seo.type,
  )}" />`;
  const ogUrlTag = `<meta property="og:url" content="${escapeHtml(
    seo.url,
  )}" />`;
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(seo.url)}" />`;

  let updated = html;
  updated = replaceOrInsert(updated, /<title>.*?<\/title>/s, titleTag);
  updated = replaceOrInsert(
    updated,
    /<meta\s+name="description"[^>]*>/i,
    descriptionTag,
  );
  updated = replaceOrInsert(
    updated,
    /<meta\s+property="og:title"[^>]*>/i,
    ogTitleTag,
  );
  updated = replaceOrInsert(
    updated,
    /<meta\s+property="og:description"[^>]*>/i,
    ogDescriptionTag,
  );
  updated = replaceOrInsert(
    updated,
    /<meta\s+property="og:type"[^>]*>/i,
    ogTypeTag,
  );
  updated = replaceOrInsert(
    updated,
    /<meta\s+property="og:url"[^>]*>/i,
    ogUrlTag,
  );
  updated = replaceOrInsert(
    updated,
    /<link\s+rel="canonical"[^>]*>/i,
    canonicalTag,
  );

  return updated;
};

const renderRoute = async (template: string, route: string) => {
  const { appHtml, seo } = renderApp(route);
  const resolvedSeo = seo ?? DEFAULT_SEO;
  const htmlWithApp = template.replace(
    "<div id=\"root\"></div>",
    `<div id=\"root\">${appHtml}</div>`,
  );
  const html = updateHead(htmlWithApp, resolvedSeo);

  const outputPath =
    route === "/"
      ? path.join(DIST_DIR, "index.html")
      : path.join(DIST_DIR, route.replace(/^\//, ""), "index.html");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
};

const run = async () => {
  const template = await readFile(TEMPLATE_PATH, "utf8");
  const {
    pages,
    toursUrls,
    bookingUrls,
    cityUrls,
    guideUrls,
    destinationUrls,
    categoryUrls,
  } = await buildRouteSets();

  const routes = new Set<string>([
    ...pages,
    ...toursUrls,
    ...bookingUrls,
    ...cityUrls,
    ...guideUrls,
    ...destinationUrls,
    ...categoryUrls,
  ]);

  await Promise.all(
    Array.from(routes).map((route) => renderRoute(template, route)),
  );

  console.log(`Prerendered ${routes.size} routes.`);
};

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Prerender failed: ${message}`);
  process.exit(1);
}
