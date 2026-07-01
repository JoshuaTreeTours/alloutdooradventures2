import type { Engine6ProductSelectionSlot } from "./engine6ProductSelectionGovernance.js";

export type Engine6ParagonProductSelectionConfig = {
  destinationLabel: string;
  stateSlug: string;
  citySlug: string;
  slots: Engine6ProductSelectionSlot[];
  targetPremiumShare?: number;
};

export type Engine6ParagonConfigNormalizationIssue = {
  path: string;
  detail: string;
};

export type Engine6ParagonConfigNormalizationResult =
  | {
      ok: true;
      config: Engine6ParagonProductSelectionConfig;
      issues: [];
    }
  | {
      ok: false;
      config: null;
      issues: Engine6ParagonConfigNormalizationIssue[];
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readString = (value: unknown, path: string, issues: Engine6ParagonConfigNormalizationIssue[]) => {
  if (typeof value !== "string" || !value.trim()) {
    issues.push({ path, detail: "expected non-empty string" });
    return "";
  }
  return value.trim();
};

const readNumber = (
  value: unknown,
  path: string,
  issues: Engine6ParagonConfigNormalizationIssue[]
) => {
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push({ path, detail: "expected finite number" });
    return undefined;
  }
  return value;
};

export const normalizeEngine6ParagonProductSelectionConfig = (
  raw: unknown
): Engine6ParagonConfigNormalizationResult => {
  const issues: Engine6ParagonConfigNormalizationIssue[] = [];

  if (!isRecord(raw)) {
    return {
      ok: false,
      config: null,
      issues: [{ path: "$", detail: "expected object" }],
    };
  }

  const destinationLabel = readString(
    raw.destinationLabel ?? raw.destination,
    "destinationLabel",
    issues
  );
  const stateSlug = readString(raw.stateSlug, "stateSlug", issues);
  const citySlug = readString(raw.citySlug, "citySlug", issues);
  const targetPremiumShare = readNumber(
    raw.targetPremiumShare,
    "targetPremiumShare",
    issues
  );

  if (!Array.isArray(raw.slots) || raw.slots.length === 0) {
    issues.push({ path: "slots", detail: "expected non-empty array" });
  }

  const slots: Engine6ProductSelectionSlot[] = [];

  if (Array.isArray(raw.slots)) {
    raw.slots.forEach((slotRaw, slotIndex) => {
      const slotPath = `slots[${slotIndex}]`;
      if (!isRecord(slotRaw)) {
        issues.push({ path: slotPath, detail: "expected object" });
        return;
      }

      const experienceType = readString(
        slotRaw.experienceType,
        `${slotPath}.experienceType`,
        issues
      );
      const desiredCount =
        typeof slotRaw.desiredCount === "number" &&
        Number.isInteger(slotRaw.desiredCount) &&
        slotRaw.desiredCount > 0
          ? slotRaw.desiredCount
          : (issues.push({
              path: `${slotPath}.desiredCount`,
              detail: "expected positive integer",
            }),
            0);

      if (!Array.isArray(slotRaw.candidates) || slotRaw.candidates.length === 0) {
        issues.push({
          path: `${slotPath}.candidates`,
          detail: "expected non-empty array",
        });
        return;
      }

      const candidates = slotRaw.candidates.map((candidateRaw, candidateIndex) => {
        const candidatePath = `${slotPath}.candidates[${candidateIndex}]`;
        if (!isRecord(candidateRaw)) {
          issues.push({ path: candidatePath, detail: "expected object" });
          return null;
        }

        const productCode = readString(
          candidateRaw.productCode,
          `${candidatePath}.productCode`,
          issues
        );
        const sourceUrl = readString(
          candidateRaw.sourceUrl,
          `${candidatePath}.sourceUrl`,
          issues
        );
        const title = readString(candidateRaw.title, `${candidatePath}.title`, issues);
        const candidateExperienceType = readString(
          candidateRaw.experienceType ?? experienceType,
          `${candidatePath}.experienceType`,
          issues
        );
        const priceFrom =
          typeof candidateRaw.priceFrom === "number" &&
          Number.isFinite(candidateRaw.priceFrom)
            ? candidateRaw.priceFrom
            : null;
        const priority =
          typeof candidateRaw.priority === "number" &&
          Number.isFinite(candidateRaw.priority)
            ? candidateRaw.priority
            : undefined;
        const categories = Array.isArray(candidateRaw.categories)
          ? candidateRaw.categories.filter(
              (entry): entry is string => typeof entry === "string"
            )
          : undefined;
        const commercialTier =
          candidateRaw.commercialTier === "premium" ||
          candidateRaw.commercialTier === "standard"
            ? candidateRaw.commercialTier
            : undefined;

        return {
          productCode,
          sourceUrl,
          title,
          experienceType: candidateExperienceType,
          priceFrom,
          categories,
          commercialTier,
          priority,
        };
      });

      if (desiredCount > 0) {
        slots.push({
          experienceType,
          desiredCount,
          candidates: candidates.filter(
            (entry): entry is NonNullable<typeof entry> => entry !== null
          ),
        });
      }
    });
  }

  if (issues.length > 0) {
    return { ok: false, config: null, issues };
  }

  return {
    ok: true,
    config: {
      destinationLabel,
      stateSlug,
      citySlug,
      slots,
      targetPremiumShare,
    },
    issues: [],
  };
};

export const parseEngine6ParagonProductSelectionConfigFromJson = (
  json: string
) => normalizeEngine6ParagonProductSelectionConfig(JSON.parse(json));
