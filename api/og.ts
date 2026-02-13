export const config = { runtime: "edge" };

function htmlEscape(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type OgMeta = {
  title: string;
  description: string;
  canonical: string;
  image: string;
};

function getStaticOgMeta(path: string, origin: string): OgMeta | null {
  const map: Record<string, Omit<OgMeta, "canonical">> = {
    "/destinations/oregon/portland/tours/gorge-ous-sunset-multnomah-falls-waterfall-tour-from-portland-462223": {
      title:
        "Gorge-ous Sunset Multnomah Falls Waterfall Tour from Portland | Portland, Oregon Outdoor Tour",
      description:
        "Guided Tour – Gorge-ous Sunset Multnomah Falls Waterfall Tour from Portland (Portland, Oregon).",
      image: "https://cdn.filestackcontent.com/Tr5TrDymQNOHOJPRAoGF",
    },

    "/destinations/arizona/flagstaff/tours/boulder-e-bike-art-and-nature-tour-628917": {
      title: "Boulder E-Bike Art & Nature Tour | Flagstaff Outdoor Adventure",
      description:
        "Explore trails, art, and nature in Flagstaff on a guided e-bike experience with curated stops.",
      image: `${origin}/hero.jpg`,
    },

    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-2335p1": {
      title: "San Andreas Fault Jeep Tour | Palm Springs Desert Adventure",
      description:
        "Off-road jeep tour through the legendary San Andreas Fault zone with professional desert guides.",
      image: `${origin}/hero.jpg`,
    },

    "/destinations/arizona/sedona/tours/sedona-scenic-adventure-tour-214429": {
      title: "Sedona Scenic Adventure Tour | Sedona Red Rock Experience",
      description:
        "Discover Sedona's iconic red rock landscapes on a scenic guided adventure tour.",
      image: `${origin}/hero.jpg`,
    },
  };

  const hit = map[path];
  if (!hit) return null;

  return {
    title: hit.title,
    description: hit.description,
    canonical: `${origin}${path}`,
    image: hit.image,
  };
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;

  const path = url.searchParams.get("path") || "/";
  const meta = getStaticOgMeta(path, origin);

  if (!meta) {
    return new Response("Not Found", { status: 404 });
  }

  const title = htmlEscape(meta.title);
  const description = htmlEscape(meta.description);
  const canonical = htmlEscape(meta.canonical);
  const image = htmlEscape(meta.image);

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
<meta property="og:image" content="${image}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
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
