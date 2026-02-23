export type ParsedTour = {
  title: string;
  overview: string;
  highlights: string[];
  duration: string;
  meetingPoint: string;
  category: string;
  pricing: string[];
  inclusions: string[];
  exclusions: string[];
  faq: { q: string; a: string }[];
};

const stripTags = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSection = (html: string, key: string) => {
  const match = html.match(
    new RegExp(`<section[^>]*data-fh=["']${key}["'][^>]*>([\\s\\S]*?)<\\/section>`, "i")
  );
  return match?.[1] ?? "";
};

const getListItems = (sectionHtml: string) =>
  Array.from(sectionHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map(match => stripTags(match[1] ?? ""))
    .filter(Boolean);

export const parseFareHarborHtml = (html: string): ParsedTour => {
  const title = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const overviewSection = getSection(html, "overview");
  const overview = Array.from(overviewSection.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map(match => stripTags(match[1] ?? ""))
    .filter(Boolean)
    .join(" ");

  const details = stripTags(getSection(html, "details"));
  const duration = details.match(/Duration:\s*([^\n]+?)(?:Meeting Point:|$)/i)?.[1]?.trim() ?? "";
  const meetingPoint =
    details.match(/Meeting Point:\s*([^\n]+)$/i)?.[1]?.trim() ?? "";

  const category = stripTags(getSection(html, "category"));

  const faqSection = getSection(html, "faq");
  const faq = Array.from(
    faqSection.matchAll(
      /<article[^>]*>\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/article>/gi
    )
  )
    .map(match => ({ q: stripTags(match[1] ?? ""), a: stripTags(match[2] ?? "") }))
    .filter(item => item.q && item.a);

  return {
    title,
    overview,
    highlights: getListItems(getSection(html, "highlights")),
    duration,
    meetingPoint,
    category,
    pricing: getListItems(getSection(html, "pricing")),
    inclusions: getListItems(getSection(html, "inclusions")),
    exclusions: getListItems(getSection(html, "exclusions")),
    faq,
  };
};

