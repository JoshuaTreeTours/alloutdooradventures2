import { describe, expect, it, vi } from "vitest";

import { createIngestLogger } from "./ingestLogger";

describe("createIngestLogger", () => {
  it("caps warning logs per rejection code", () => {
    const warn = vi.fn();
    const log = vi.fn();
    const logger = createIngestLogger({
      maxWarningsPerCode: 2,
      logger: { warn, log },
    });

    logger.warnRejected({ code: "TOO_FAR", reason: "far" });
    logger.warnRejected({ code: "TOO_FAR", reason: "far" });
    logger.warnRejected({ code: "TOO_FAR", reason: "far" });

    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("reports summary counts", () => {
    const warn = vi.fn();
    const log = vi.fn();
    const logger = createIngestLogger({
      logger: { warn, log },
    });

    logger.incrementProcessed();
    logger.incrementAccepted();
    logger.incrementProcessed();
    logger.warnRejected({ code: "OUTSIDE_BOUNDS", reason: "bounds" });

    expect(logger.getSummary()).toEqual({
      processed: 2,
      accepted: 1,
      rejected: 1,
      rejectionsByCode: { OUTSIDE_BOUNDS: 1 },
    });
  });
});
