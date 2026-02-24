import { sanitizeFhText } from "../text/sanitizeFhText";

export type NormalizedDuration = {
  text: string;
  minutes?: number;
};

export const normalizeDurationText = (
  raw?: string | null
): NormalizedDuration | null => {
  const cleaned = sanitizeFhText(raw ?? "").replace(/\)s/g, "s").trim();
  if (!cleaned) return null;

  const lower = cleaned.toLowerCase();
  const rangeHours = lower.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)/);
  if (rangeHours) {
    const a = Number.parseFloat(rangeHours[1]);
    const b = Number.parseFloat(rangeHours[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      return {
        text: `${a}-${b} hours`,
        minutes: Math.round(((a + b) / 2) * 60),
      };
    }
  }

  const hours = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)/)?.[1];
  const minutes = lower.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|m)\b/)?.[1];

  if (hours || minutes) {
    const total =
      (hours ? Number.parseFloat(hours) * 60 : 0) +
      (minutes ? Number.parseFloat(minutes) : 0);
    if (Number.isFinite(total) && total > 0) {
      if (hours && !minutes) {
        return { text: `${Number.parseFloat(hours)} hours`, minutes: Math.round(total) };
      }
      if (!hours && minutes) {
        return { text: `${Math.round(Number.parseFloat(minutes))} minutes`, minutes: Math.round(total) };
      }
      return { text: `${cleaned}`, minutes: Math.round(total) };
    }
  }

  const minutesOnly = lower.match(/\b(\d{2,4})\b/);
  if (minutesOnly && /min/.test(lower)) {
    const total = Number.parseInt(minutesOnly[1], 10);
    if (Number.isFinite(total) && total > 0) {
      return { text: `${total} minutes`, minutes: total };
    }
  }

  return { text: cleaned };
};
