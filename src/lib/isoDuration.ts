export function toIsoDuration(input?: string): string | undefined {
  if (!input) return undefined;
  const s = input.trim().toLowerCase();

  let m = s.match(/^(\d+)\s*minutes?$/);
  if (m) return `PT${m[1]}M`;

  m = s.match(/^(\d+)\s*hours?$/);
  if (m) return `PT${m[1]}H`;

  m = s.match(/^(\d+)\s*hours?\s*(\d+)\s*minutes?$/);
  if (m) return `PT${m[1]}H${m[2]}M`;

  return undefined;
}
