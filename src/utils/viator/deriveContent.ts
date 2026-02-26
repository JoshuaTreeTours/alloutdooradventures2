import type { ViatorParsedTour } from "./types";

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

const dedupe = (items: string[]) =>
  Array.from(new Set(items.map(clean).filter(Boolean)));

export function deriveHighlights(parsed: ViatorParsedTour): string[] {
  const pool = dedupe([
    ...(parsed.overviewText ? parsed.overviewText.split(/\.(?:\s+|$)/) : []),
    ...(parsed.itinerary ?? []).map(item =>
      item.duration ? `${item.title} (${item.duration})` : item.title
    ),
    ...(parsed.included ?? []).map(item => `Includes: ${item}`),
    ...(parsed.meetingPoint?.name
      ? [`Meeting point: ${parsed.meetingPoint.name}`]
      : []),
    ...(parsed.meetingPoint?.address
      ? [`Meeting address: ${parsed.meetingPoint.address}`]
      : []),
    ...(parsed.knowBeforeYouGo ?? []),
  ]).filter(item => item.length > 20);

  return pool.slice(0, 7).slice(0, Math.max(4, Math.min(7, pool.length)));
}

export function deriveLongDescription(parsed: ViatorParsedTour): string {
  const parts: string[] = [];

  if (parsed.overviewText) {
    parts.push(
      `This guided experience centers on ${clean(parsed.overviewText.toLowerCase())}.`
    );
  }

  if (parsed.itinerary?.length) {
    const itineraryList = parsed.itinerary
      .map(stop =>
        stop.duration ? `${stop.title} (${stop.duration})` : stop.title
      )
      .join(", ");
    parts.push(`The itinerary highlights ${itineraryList}.`);
  }

  if (parsed.highlightsSourceText?.length) {
    parts.push(
      `Key moments noted for this tour include ${parsed.highlightsSourceText.slice(0, 3).join("; ")}.`
    );
  }

  const logistics: string[] = [];
  if (parsed.durationText)
    logistics.push(`duration is listed as ${parsed.durationText}`);
  if (parsed.meetingPoint?.name)
    logistics.push(`meeting takes place at ${parsed.meetingPoint.name}`);
  if (parsed.meetingPoint?.address)
    logistics.push(`the address is ${parsed.meetingPoint.address}`);
  if (parsed.included?.length)
    logistics.push(
      `inclusions cover ${parsed.included.slice(0, 4).join(", ")}`
    );
  if (parsed.cancellationText)
    logistics.push(`cancellation terms indicate ${parsed.cancellationText}`);
  if (logistics.length) parts.push(`Logistics: ${logistics.join("; ")}.`);

  if (parsed.knowBeforeYouGo?.length) {
    parts.push(
      `Before departure, note the following guidance: ${parsed.knowBeforeYouGo.slice(0, 4).join("; ")}.`
    );
  }

  let description = parts.join(" ");
  const fallback = [
    parsed.durationText
      ? `The expected duration is ${parsed.durationText}.`
      : "",
    parsed.meetingPoint?.address
      ? `Travelers typically gather at ${parsed.meetingPoint.address}.`
      : "",
    parsed.itinerary?.length
      ? `Stops include ${parsed.itinerary.map(item => item.title).join(", ")}.`
      : "",
    parsed.included?.length
      ? `Included items include ${parsed.included.join(", ")}.`
      : "",
    parsed.knowBeforeYouGo?.length
      ? `Know-before-you-go notes mention ${parsed.knowBeforeYouGo.join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (description.split(/\s+/).length < 100) {
    description = `${description} ${fallback}`.trim();
  }

  if (description.split(/\s+/).length < 100) {
    description = `${description} This page summarizes verified facts from the supplier listing to help compare tour fit, timing, and inclusions before selecting the outbound booking link.`;
  }

  return description;
}
