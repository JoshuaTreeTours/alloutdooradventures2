import fs from "node:fs";
import path from "node:path";

import { getEngine3TourBySlugs } from "../src/engine3/routing/getEngine3TourBySlugs";
import { buildEngine3ViatorSchemaGraph } from "../src/engine3/schema/buildEngine3ViatorSchemaGraph";
import { mapViatorToEngine3ViewModel } from "../src/engine3/viator/mapViatorToEngine3ViewModel";
import { viatorProductCacheByCode } from "../src/engine3/data/viatorProductCache";
import { buildEngine3BreadcrumbItems } from "../src/engine3/utils/buildEngine3BreadcrumbItems";

type ViteAssetPaths = {
  scriptPath: string;
  cssPaths: string[];
};

const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const getOrigin = (req: Request): string => {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) {
    return "https://www.alloutdooradventures.com";
  }
  return `${proto}://${host}`;
};

const getViteAssets = (): ViteAssetPaths => {
  const distDir = path.resolve(process.cwd(), "dist");
  const manifestPath = path.join(distDir, "manifest.json");

  try {
    const manifestRaw = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestRaw) as Record<
      string,
      { file?: string; css?: string[] }
    >;

    const entry = manifest["index.html"];
    if (entry?.file) {
      return {
        scriptPath: `/${entry.file}`,
        cssPaths: (entry.css ?? []).map(file => `/${file}`),
      };
    }
  } catch {
    // fall through to filename scan fallback
  }

  const assetsDir = path.join(distDir, "assets");
  const assetNames = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
  const scriptName = assetNames.find(name => /^index-.*\.js$/i.test(name));
  const cssNames = assetNames.filter(name => /^index-.*\.css$/i.test(name));

  if (!scriptName) {
    throw new Error("Unable to resolve Vite entry asset from dist/manifest.json");
  }

  return {
    scriptPath: `/assets/${scriptName}`,
    cssPaths: cssNames.map(name => `/assets/${name}`),
  };
};

const parseTourPath = (pathname: string) => {
  const match = pathname.match(
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/?#]+)\/?$/i
  );

  if (!match) {
    return null;
  }

  return {
    stateSlug: decodeURIComponent(match[1]).toLowerCase(),
    citySlug: decodeURIComponent(match[2]).toLowerCase(),
    tourSlug: decodeURIComponent(match[3]),
  };
};

export default async function handler(req: Request): Promise<Response> {
  const requestUrl = new URL(req.url);
  const requestedPath = requestUrl.searchParams.get("path") ?? requestUrl.pathname;
  const parsed = parseTourPath(requestedPath);

  if (!parsed) {
    return new Response("Not Found", {
      status: 404,
      headers: { "cache-control": CACHE_CONTROL },
    });
  }

  const engine3Tour = getEngine3TourBySlugs(
    parsed.stateSlug,
    parsed.citySlug,
    parsed.tourSlug
  );

  if (!engine3Tour || engine3Tour.bookingProvider !== "viator") {
    return new Response("Not Found", {
      status: 404,
      headers: { "cache-control": CACHE_CONTROL },
    });
  }

  const viewModel = mapViatorToEngine3ViewModel(
    engine3Tour,
    viatorProductCacheByCode[engine3Tour.id]
  );

  const description =
    viewModel.description || `${viewModel.title} in ${viewModel.city}, ${viewModel.region}`;
  const origin = getOrigin(req);
  const canonicalAbsolute = `${origin}${viewModel.canonicalPath}`;
  const imageAbsolute = viewModel.primaryImageUrl ?? `${origin}/hero.jpg`;
  const breadcrumbItems = buildEngine3BreadcrumbItems({
    title: viewModel.title,
    canonicalUrl: viewModel.canonicalPath,
    stateSlug: viewModel.stateSlug,
    citySlug: viewModel.citySlug,
    region: viewModel.region,
    city: viewModel.city,
  });

  const jsonLd = buildEngine3ViatorSchemaGraph(viewModel, viewModel.canonicalPath, {
    breadcrumbItems: breadcrumbItems.map(item => ({
      name: item.label,
      item: item.href,
    })),
  });

  const { scriptPath, cssPaths } = getViteAssets();

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(viewModel.title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonicalAbsolute)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escapeHtml(viewModel.title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${escapeHtml(canonicalAbsolute)}" />
<meta property="og:image" content="${escapeHtml(imageAbsolute)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(viewModel.title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(imageAbsolute)}" />
${cssPaths.map(cssPath => `<link rel="stylesheet" crossorigin href="${escapeHtml(cssPath)}" />`).join("\n")}
<script id="structured-data-engine3-viator" type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<div id="root"></div>
<script type="module" crossorigin src="${escapeHtml(scriptPath)}"></script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": CACHE_CONTROL,
    },
  });
}
