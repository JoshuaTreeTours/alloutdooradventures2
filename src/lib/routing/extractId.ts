export function extractIdFromSlug(slugOrPath: string): string | null {
  const normalized = slugOrPath.replace(/\/book$/, "");
  const match = normalized.match(/-(\d+)(?:\/)?$/);
  return match?.[1] ?? null;
}

