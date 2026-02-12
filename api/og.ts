export const config = {
  runtime: "edge",
};

type MetaEntry = {
  title: string;
  description: string;
  image: string;
};

function htmlEscape(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildStaticMeta(path: string, origin: string) {
  const map: Record<string, MetaEntry> = {
    "/destinations/oregon/portland/tours/gorge-ous-sunset-multnomah-falls-waterfall-tour-from-portland-462223": {
      title:
        "Gorge-ous Sunset Multnomah Falls Waterfall Tour from Portland | Oregon Outdoor Tour",
      description:
        "Guided sunset waterfall tour from Portland to Multnomah Falls. Scenic Columbia River Gorge views and expert local guide.",
      image: "https://cdn.filestackcontent.com/Tr5TrDymQNOHOJPRAoGF",
    },

    "/destinations/arizona/flagstaff/tours/boulder-e-bike-art-and-nature-tour-628917": {
      title: "Boulder E-Bike Art & Nature Tour | Flagstaff Outdoor Adventure",
      description:
        "Explore art, trails, and nature in Flagstaff on this guided e-bike experience with curated stops and scenic routes.",
      image: "https://www.alloutdooradventures.com/hero.jpg",
    },

    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-2335p1": {
      title: "San Andreas Fault Jeep Tour | Palm Springs Desert Adventure",
      description:
        "Off-road jeep tour through the legendary San Andreas Fault zone with professional desert guides.",
      image: "https://www.alloutdooradventures.com/hero.jpg",
    },
  };

  const meta = map[path];
  if (!meta) return null;

  return {
    title: htmlEscape(meta.title),
    description: htmlEscape(meta.description),
    canonical: `${origin}${path}`,
    image: meta.image,
  };
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const path = url.searchParams.get("path") || "/";

  const meta = buildStaticMeta(path, origin);

  if (!meta) {
    return new Response("Not Found", { status: 404 });
  }

  const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${meta.title}</title>
<meta name="description" content="${meta.description}" />
<link rel="canonical" href="${meta.canonical}" />

<meta property="og:type" content="website" />
<meta property="og:url" content="${meta.canonical}" />
<meta property="og:title" content="${meta.title}" />
<meta property="og:description" content="${meta.description}" />
<meta property="og:image" content="${meta.image}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${meta.title}" />
<meta name="twitter:description" content="${meta.description}" />
<meta name="twitter:image" content="${meta.image}" />
</head>
<body></body>
</html>
`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
