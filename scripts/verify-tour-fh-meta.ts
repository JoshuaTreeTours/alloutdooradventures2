import { readFile } from "node:fs/promises";
import path from "node:path";

import { getTourDetailPath, tours } from "../src/data/tours";

const distDir = path.resolve("dist");
const GENERIC_TEMPLATE_MARKER = "guided outdoor experience";

const getTitle = (html: string) =>
  html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";

const getMetaDescription = (html: string) => {
  const pattern =
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i;
  const reversePattern =
    /<meta\s+[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i;
  return (
    html.match(pattern)?.[1]?.trim() ??
    html.match(reversePattern)?.[1]?.trim() ??
    ""
  );
};

const assertContains = (actual: string, expected: string, label: string) => {
  if (!actual || !expected || !actual.includes(expected)) {
    throw new Error(
      `${label} mismatch. Expected to contain: "${expected}". Received: "${actual}"`
    );
  }
};

const verifyRoute = async (
  routePath: string,
  seoTitle: string,
  seoDescription: string
) => {
  const htmlPath = path.join(distDir, routePath.slice(1), "index.html");
  const html = await readFile(htmlPath, "utf8");
  const title = getTitle(html);
  const description = getMetaDescription(html);

  assertContains(title, seoTitle, `${routePath} <title>`);
  assertContains(
    description,
    seoDescription,
    `${routePath} <meta name=description>`
  );

  if (description.toLowerCase().includes(GENERIC_TEMPLATE_MARKER)) {
    throw new Error(
      `${routePath} description still contains generic template marker "${GENERIC_TEMPLATE_MARKER}"`
    );
  }
};

const run = async () => {
  const candidates = tours.filter(
    tour =>
      tour.bookingProvider === "fareharbor" &&
      tour.seoTitle &&
      tour.seoDescription
  );

  if (candidates.length < 3) {
    throw new Error(
      `Expected at least 3 FH-enriched tours with seoTitle+seoDescription, found ${candidates.length}.`
    );
  }

  for (const tour of candidates.slice(0, 3)) {
    await verifyRoute(
      getTourDetailPath(tour),
      tour.seoTitle!,
      tour.seoDescription!
    );
  }

  console.log("Verified FH SEO title/description are used in SSR for 3 tours.");
};

run().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
