import { buildTourMeta } from "../src/lib/tourMeta";
import { getTourBySlug } from "../src/data/tourRegistry";
import { SITE_URL } from "../src/utils/seo";

export const config = { runtime: "edge" };

const htmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const parseDestinationTourPath = (path: string) => {
  const normalizedPath = path.split("?")[0].split("#")[0];
  const segments = normalizedPath.split("/");

  const state = segments[2] ?? "";
  const slug = segments[5] ?? "";

  if (!state || !slug) {
    return null;
  }

  return { state, slug };
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "/";
  const parsed = parseDestinationTourPath(path);

  if (!parsed) {
    return new Response("Not Found", { status: 404 });
  }

  const tour = getTourBySlug(parsed.state, parsed.slug);

  if (!tour) {
    return new Response("Not Found", { status: 404 });
  }

  const canonicalUrl = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const meta = buildTourMeta(tour, canonicalUrl);
  const image = tour.image.startsWith("http") ? tour.image : `${SITE_URL}${tour.image}`;

  const title = htmlEscape(meta.title);
  const description = htmlEscape(meta.description);
  const canonical = htmlEscape(meta.canonical);
  const ogImage = htmlEscape(image);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonical}" />

<meta property="og:type" content="website" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${ogImage}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${ogImage}" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
