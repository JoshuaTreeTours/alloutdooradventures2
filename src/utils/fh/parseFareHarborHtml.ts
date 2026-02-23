export type ParsedFareHarborContent = {
  title?: string;
  duration?: string;
  meetingPoint?: string;
  cancellationPolicy?: string;
  ageMin?: string;
  groupSize?: string;
  accessibilityNotes?: string;
  included?: string[];
  notIncluded?: string[];
  highlights?: string[];
  activityDetails?: string;
  faq?: { q: string; a: string }[];
  pricing?: { label: string; price: string }[];
};

const cleanText = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const matchAfterLabel = (html: string, label: string) => {
  const regex = new RegExp(`${label}\\s*[:\\-]\\s*([^<\\n]{3,180})`, "i");
  const match = html.match(regex);
  return match ? cleanText(match[1]) : undefined;
};

const extractListNearHeading = (html: string, heading: string) => {
  const sectionRegex = new RegExp(
    `<h[1-6][^>]*>[^<]*${heading}[^<]*<\\/h[1-6]>([\\s\\S]{0,1500}?)(?:<h[1-6]|$)`,
    "i"
  );
  const section = html.match(sectionRegex)?.[1];
  if (!section) {
    return [] as string[];
  }

  const items = section
    .match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
    ?.map(item => cleanText(item))
    .filter(Boolean);

  return items && items.length ? items : [];
};

export const parseFareHarborHtml = (html: string): ParsedFareHarborContent => {
  const cleanedHtml = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  const title =
    cleanText(
      cleanedHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""
    ) || undefined;

  const detailsParagraphs = cleanedHtml
    .match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
    ?.map(item => cleanText(item))
    .filter(paragraph => paragraph.length > 80)
    .slice(0, 4);

  const faqQuestions = cleanedHtml
    .match(/<h[3-6][^>]*>([\s\S]*?\?)<\/h[3-6]>/gi)
    ?.map(item => cleanText(item))
    .slice(0, 5);

  return {
    title,
    duration: matchAfterLabel(cleanedHtml, "Duration"),
    meetingPoint: matchAfterLabel(
      cleanedHtml,
      "Meeting(?:\\s+point|\\s+location)?"
    ),
    cancellationPolicy: matchAfterLabel(cleanedHtml, "Cancellation"),
    ageMin: matchAfterLabel(cleanedHtml, "(?:Minimum\\s+age|Age)"),
    groupSize: matchAfterLabel(
      cleanedHtml,
      "(?:Group\\s+size|Max(?:imum)?\\s+group)"
    ),
    accessibilityNotes: matchAfterLabel(cleanedHtml, "Accessibility"),
    included: extractListNearHeading(cleanedHtml, "Included"),
    notIncluded: extractListNearHeading(cleanedHtml, "Not Included"),
    highlights: (() => {
      const highlights = extractListNearHeading(
        cleanedHtml,
        "Highlights"
      ).slice(0, 9);
      if (highlights.length) {
        return highlights;
      }

      return extractListNearHeading(cleanedHtml, "What to Expect").slice(0, 9);
    })(),
    activityDetails: detailsParagraphs?.join(" "),
    faq: faqQuestions?.map(question => ({
      q: question,
      a: "Please confirm details with the operator before departure.",
    })),
  };
};
