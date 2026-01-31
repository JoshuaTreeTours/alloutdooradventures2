export type RejectionPayload = {
  code: string;
  reason: string;
  source?: string;
  event?: string;
  regionKind?: string;
  regionSlug?: string;
  title?: string;
  lat?: number;
  lng?: number;
};

export type IngestSummary = {
  processed: number;
  accepted: number;
  rejected: number;
  rejectionsByCode: Record<string, number>;
};

type Logger = {
  warn: (message: string) => void;
  log: (message: string) => void;
};

export const createIngestLogger = (options?: {
  maxWarningsPerCode?: number;
  logger?: Logger;
}) => {
  const maxWarningsPerCode = options?.maxWarningsPerCode ?? 50;
  const logger = options?.logger ?? console;
  const warningCounts = new Map<string, number>();
  const rejectionsByCode = new Map<string, number>();
  let processed = 0;
  let accepted = 0;
  let rejected = 0;

  const incrementProcessed = () => {
    processed += 1;
  };

  const incrementAccepted = () => {
    accepted += 1;
  };

  const warnRejected = (payload: RejectionPayload) => {
    rejected += 1;
    const nextCount = (rejectionsByCode.get(payload.code) ?? 0) + 1;
    rejectionsByCode.set(payload.code, nextCount);

    const currentWarnings = warningCounts.get(payload.code) ?? 0;
    if (currentWarnings < maxWarningsPerCode) {
      warningCounts.set(payload.code, currentWarnings + 1);
      const logPayload = {
        level: "warn",
        event: payload.event ?? "ingest_rejected",
        code: payload.code,
        reason: payload.reason,
        source: payload.source,
        regionKind: payload.regionKind,
        regionSlug: payload.regionSlug,
        title: payload.title,
        lat: payload.lat,
        lng: payload.lng,
      };
      logger.warn(JSON.stringify(logPayload));
    }
  };

  const getSummary = (): IngestSummary => ({
    processed,
    accepted,
    rejected,
    rejectionsByCode: Object.fromEntries(rejectionsByCode.entries()),
  });

  const printSummary = () => {
    const summary = getSummary();
    logger.log(
      JSON.stringify({
        level: "info",
        event: "ingest_summary",
        ...summary,
      }),
    );
  };

  return {
    incrementProcessed,
    incrementAccepted,
    warnRejected,
    printSummary,
    getSummary,
  };
};
