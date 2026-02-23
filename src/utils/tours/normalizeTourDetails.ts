type TourDetails = Record<string, unknown>;

function toStringOrNull(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : null;
  }
  if (typeof v === "number") return String(v);
  return null;
}

export function normalizeTourDetails(details: TourDetails): TourDetails {
  const out: TourDetails = { ...details };

  const fields = [
    "duration",
    "meetingPoint",
    "cancellations",
    "cancellation",
    "age",
    "groupSize",
    "accessibility",
  ];

  for (const key of fields) {
    const safe = toStringOrNull(out[key]);
    if (safe == null) delete out[key];
    else out[key] = safe;
  }

  return out;
}
