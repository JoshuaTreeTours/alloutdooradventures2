import {
  buildEngine6ItinerarySourceTitleFieldPattern,
  type ResolveEngine6ItinerarySourceTitleResult,
} from "./itineraryTitlePolicy.js";

export const ENGINE6_ITINERARY_TITLE_SOURCE_REPORT_PRODUCT_CODE = "276551P2";

export type Engine6ItineraryPayloadSource =
  | "live-api"
  | "bundled-exact-product-fixture"
  | "booking-page-scrape"
  | "unknown";

export type Engine6ItineraryTitleSourceKind =
  | "viator-itinerary-item-title"
  | "confirmed-title-override"
  | "missing";

export type Engine6ItineraryTitleSourceRow276551P2 = {
  rowIndex: number;
  sourceTitleFieldPath: string;
  sourceTitle: string | null;
  renderedTitle: string | null;
  titleSource: Engine6ItineraryTitleSourceKind;
};

export type Engine6ItineraryTitleSourceReport276551P2 = {
  productCode: typeof ENGINE6_ITINERARY_TITLE_SOURCE_REPORT_PRODUCT_CODE;
  payloadSource: Engine6ItineraryPayloadSource;
  itineraryFieldPath: string;
  sourceTitleFieldPattern: string;
  rows: Engine6ItineraryTitleSourceRow276551P2[];
};

export const buildEngine6ItineraryTitleSourceRow276551P2 = (args: {
  rowIndex: number;
  itineraryFieldPath: string;
  sourceTitle: string | null;
  titleResolution: ResolveEngine6ItinerarySourceTitleResult;
}): Engine6ItineraryTitleSourceRow276551P2 => {
  const sourceTitleFieldPath = `${args.itineraryFieldPath}[${args.rowIndex}].title`;
  const titleSource: Engine6ItineraryTitleSourceKind =
    args.titleResolution.usedConfirmedTitleOverride
      ? "confirmed-title-override"
      : args.sourceTitle !== null
        ? "viator-itinerary-item-title"
        : "missing";

  return {
    rowIndex: args.rowIndex,
    sourceTitleFieldPath,
    sourceTitle: args.sourceTitle,
    renderedTitle: args.titleResolution.title,
    titleSource,
  };
};

export const buildEngine6ItineraryTitleSourceReport276551P2 = (args: {
  payloadSource: Engine6ItineraryPayloadSource;
  itineraryFieldPath: string;
  rows: Engine6ItineraryTitleSourceRow276551P2[];
}): Engine6ItineraryTitleSourceReport276551P2 => ({
  productCode: ENGINE6_ITINERARY_TITLE_SOURCE_REPORT_PRODUCT_CODE,
  payloadSource: args.payloadSource,
  itineraryFieldPath: args.itineraryFieldPath,
  sourceTitleFieldPattern: buildEngine6ItinerarySourceTitleFieldPattern(
    args.itineraryFieldPath
  ),
  rows: args.rows,
});

export const logEngine6ItineraryTitleSourceReport276551P2 = (
  report: Engine6ItineraryTitleSourceReport276551P2
) => {
  console.info(
    `[engine6-itinerary-title-source:${ENGINE6_ITINERARY_TITLE_SOURCE_REPORT_PRODUCT_CODE}]`,
    JSON.stringify(report, null, 2)
  );
};
