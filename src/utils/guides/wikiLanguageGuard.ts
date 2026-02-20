import { cleanWikiLanguage } from "../cleanWikiLanguage";

type GuideLike = {
  overview?: string[];
  travelTips?: string[];
  thingsToDo?: Array<{ description?: string }>;
  highlights?: Array<{ description?: string }>;
  faq?: Array<{ a?: string }>;
  aboutCity?: {
    sections?: Array<{ paragraphs?: string[] }>;
  };
};

const FORBIDDEN_PATTERN = /\b(wikipedia|wiki)\b/i;

export const cleanGuideTextContent = <T extends GuideLike>(guide: T): T => {
  if (Array.isArray(guide.overview)) {
    guide.overview = guide.overview.map(line => cleanWikiLanguage(line));
  }

  if (Array.isArray(guide.travelTips)) {
    guide.travelTips = guide.travelTips.map(line => cleanWikiLanguage(line));
  }

  if (Array.isArray(guide.thingsToDo)) {
    guide.thingsToDo = guide.thingsToDo.map(item => ({
      ...item,
      description: cleanWikiLanguage(item.description ?? ""),
    }));
  }

  if (Array.isArray(guide.highlights)) {
    guide.highlights = guide.highlights.map(item => ({
      ...item,
      description: cleanWikiLanguage(item.description ?? ""),
    }));
  }

  if (Array.isArray(guide.faq)) {
    guide.faq = guide.faq.map(item => ({
      ...item,
      a: cleanWikiLanguage(item.a ?? ""),
    }));
  }

  if (guide.aboutCity?.sections) {
    guide.aboutCity.sections = guide.aboutCity.sections.map(section => ({
      ...section,
      paragraphs: Array.isArray(section.paragraphs)
        ? section.paragraphs.map(paragraph => cleanWikiLanguage(paragraph))
        : section.paragraphs,
    }));
  }

  return guide;
};

export const assertNoWikiLanguage = (text: string, context: string) => {
  if (FORBIDDEN_PATTERN.test(text)) {
    throw new Error(`Forbidden wiki language detected in ${context}`);
  }
};

export const assertGuideHasNoWikiLanguage = (
  guide: GuideLike,
  context: string
): void => {
  const buckets: Array<{ label: string; value: string }> = [];

  guide.overview?.forEach((value, index) => {
    buckets.push({ label: `overview[${index}]`, value });
  });

  guide.travelTips?.forEach((value, index) => {
    buckets.push({ label: `travelTips[${index}]`, value });
  });

  guide.thingsToDo?.forEach((item, index) => {
    if (item.description) {
      buckets.push({
        label: `thingsToDo[${index}].description`,
        value: item.description,
      });
    }
  });

  guide.highlights?.forEach((item, index) => {
    if (item.description) {
      buckets.push({
        label: `highlights[${index}].description`,
        value: item.description,
      });
    }
  });

  guide.faq?.forEach((item, index) => {
    if (item.a) {
      buckets.push({ label: `faq[${index}].a`, value: item.a });
    }
  });

  guide.aboutCity?.sections?.forEach((section, sectionIndex) => {
    section.paragraphs?.forEach((value, paragraphIndex) => {
      buckets.push({
        label: `aboutCity.sections[${sectionIndex}].paragraphs[${paragraphIndex}]`,
        value,
      });
    });
  });

  buckets.forEach(bucket => {
    assertNoWikiLanguage(bucket.value, `${context}:${bucket.label}`);
  });
};
