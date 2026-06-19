export const ENGINE6_ITINERARY_ROW_INSPECTION_PRODUCT_CODE = "276551P2";
export const ENGINE6_ITINERARY_ROW_INSPECTION_ROW_LIMIT = 5;

export type Engine6ItineraryRowInspection276551P2 = {
  rowIndex: number;
  itineraryRowFieldPath: string;
  keys: string[];
  title: unknown;
  name: unknown;
  label: unknown;
  pointOfInterestLocation: unknown;
  location: unknown;
  attraction: unknown;
  stopName: unknown;
  stop: unknown;
  pointOfInterest: unknown;
  otherNamingFields: Record<string, unknown>;
};

const NAMING_FIELD_PATTERN =
  /(?:name|title|label|location|attraction|poi|stop|place|venue|landmark|site)/i;

const CAPTURED_TOP_LEVEL_FIELDS = new Set([
  "title",
  "name",
  "label",
  "pointOfInterestLocation",
  "location",
  "attraction",
  "stopName",
  "stop",
  "pointOfInterest",
]);

const serializeInspectionValue = (value: unknown): unknown => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.map(item => serializeInspectionValue(item));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        serializeInspectionValue(nested),
      ])
    );
  }
  return String(value);
};

const collectOtherNamingFields = (
  row: Record<string, unknown>
): Record<string, unknown> => {
  const otherNamingFields: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    if (CAPTURED_TOP_LEVEL_FIELDS.has(key)) continue;
    if (!NAMING_FIELD_PATTERN.test(key)) continue;
    otherNamingFields[key] = serializeInspectionValue(value);
  }

  return otherNamingFields;
};

export const inspectEngine6ItineraryRow276551P2 = (
  row: Record<string, unknown>,
  args: { rowIndex: number; itineraryFieldPath: string }
): Engine6ItineraryRowInspection276551P2 => ({
  rowIndex: args.rowIndex,
  itineraryRowFieldPath: `${args.itineraryFieldPath}[${args.rowIndex}]`,
  keys: Object.keys(row).sort(),
  title: serializeInspectionValue(row.title),
  name: serializeInspectionValue(row.name),
  label: serializeInspectionValue(row.label),
  pointOfInterestLocation: serializeInspectionValue(row.pointOfInterestLocation),
  location: serializeInspectionValue(row.location),
  attraction: serializeInspectionValue(row.attraction),
  stopName: serializeInspectionValue(row.stopName),
  stop: serializeInspectionValue(row.stop),
  pointOfInterest: serializeInspectionValue(row.pointOfInterest),
  otherNamingFields: collectOtherNamingFields(row),
});

export const logEngine6ItineraryRowInspection276551P2 = (
  inspections: Engine6ItineraryRowInspection276551P2[]
) => {
  console.info(
    `[engine6-itinerary-inspection:${ENGINE6_ITINERARY_ROW_INSPECTION_PRODUCT_CODE}]`,
    JSON.stringify(inspections, null, 2)
  );
};
