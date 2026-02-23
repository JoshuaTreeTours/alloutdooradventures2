export function formatTourDetailValue(value: unknown): string {
  if (value == null) return "—";

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : "—";
  }

  if (typeof value === "number") return String(value);

  // Never stringify objects into the UI
  if (typeof value === "object") return "—";

  return String(value);
}
