export function formatTourValue(value: unknown): string {
  if (!value) return "—";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return "See tour description";
  }

  return String(value);
}
