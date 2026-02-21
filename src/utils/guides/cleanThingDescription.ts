const INLINE_SOURCE_PATTERN = /\s*Source:\s*Wikipedia\s*(?:→|->)\s*https?:\/\/\S+\s*$/i;
const TRAILING_SOURCE_FRAGMENT_PATTERN = /\s*Source:\s*$/i;

export const cleanThingDescription = (text: string) => {
  if (!text) {
    return text;
  }

  return text
    .replace(INLINE_SOURCE_PATTERN, "")
    .replace(TRAILING_SOURCE_FRAGMENT_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();
};
