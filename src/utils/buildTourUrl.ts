const slugSegment = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

export function buildTourUrl(state: string, city: string, slug: string) {
  const s = slugSegment(state);
  const c = slugSegment(city);

  return `https://www.alloutdooradventures.com/destinations/${s}/${c}/tours/${slug}`;
}
