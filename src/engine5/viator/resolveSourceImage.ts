import type { Engine5ViatorApiTour, Engine5ViatorTourRecord } from "../types";

const TACDN_IMAGE_REGEX =
  /https:\/\/(?:dynamic-media|media)\.tacdn\.com\/[^"'\s)]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s)]*)?/gi;

const HOMEPAGE_OR_DESTINATION_FALLBACK_REGEX =
  /(globalNav|fallback|placeholder|top-activities)/i;

const clean = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const looksLikeUsableProductImage = (value?: string) => {
  const normalized = clean(value);
  if (!normalized) {
    return false;
  }

  return !HOMEPAGE_OR_DESTINATION_FALLBACK_REGEX.test(normalized);
};

const extractTacdnFromSourceCode = (sourceCode?: string) => {
  if (!sourceCode) {
    return undefined;
  }

  const matches = sourceCode.match(TACDN_IMAGE_REGEX) ?? [];
  return matches.find(candidate => looksLikeUsableProductImage(candidate));
};

export const resolveSourceImage = (input: {
  productCode: string;
  sourceCode?: string;
  apiTour?: Engine5ViatorApiTour;
  record: Engine5ViatorTourRecord;
  lastResortDestinationImage?: string;
}) => {
  const sourceCodeImage = extractTacdnFromSourceCode(input.sourceCode);

  if (sourceCodeImage) {
    console.info(`[engine5-image] product=${input.productCode}`);
    console.info("[engine5-image] imageSource=source-code");
    console.info("[engine5-image] apiImageIgnored=true");
    console.info("[engine5-image] homepageFallbackUsed=false");
    console.info(`[engine5-image] resolvedPrimaryImage=${sourceCodeImage}`);
    return {
      primaryImage: sourceCodeImage,
      imageSource: "source-code" as const,
    };
  }

  const fallbackImage = clean(
    input.apiTour?.sourceDerivedImageUrl ?? input.apiTour?.fallbackImageUrl
  );
  if (looksLikeUsableProductImage(fallbackImage)) {
    console.info(`[engine5-image] product=${input.productCode}`);
    console.info("[engine5-image] imageSource=fallback-record");
    console.info("[engine5-image] apiImageIgnored=true");
    console.info("[engine5-image] homepageFallbackUsed=false");
    console.info(`[engine5-image] resolvedPrimaryImage=${fallbackImage}`);
    return {
      primaryImage: fallbackImage,
      imageSource: "fallback-record" as const,
    };
  }

  const emergencyImage = clean(input.lastResortDestinationImage);
  if (looksLikeUsableProductImage(emergencyImage)) {
    console.info(`[engine5-image] product=${input.productCode}`);
    console.info("[engine5-image] imageSource=destination-home-last-resort");
    console.info("[engine5-image] apiImageIgnored=true");
    console.info("[engine5-image] homepageFallbackUsed=true");
    console.info(`[engine5-image] resolvedPrimaryImage=${emergencyImage}`);
    return {
      primaryImage: emergencyImage,
      imageSource: "destination-home-last-resort" as const,
    };
  }

  throw new Error(
    `Engine5 could not resolve primaryImage for ${input.productCode}`
  );
};
