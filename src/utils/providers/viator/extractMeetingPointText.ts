const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const candidateFromLocation = (
  location: Record<string, unknown> | undefined
): string | undefined => {
  if (!location) {
    return undefined;
  }

  const formattedAddress = cleanText(location.formattedAddress);
  if (formattedAddress) {
    return formattedAddress;
  }

  return (
    cleanText(location.address) ??
    cleanText(location.description) ??
    cleanText(location.name)
  );
};

export const extractMeetingPointText = ({
  structuredLocation,
  fallbackText,
}: {
  structuredLocation?: Record<string, unknown> | null;
  fallbackText?: string | null;
}): string | undefined =>
  candidateFromLocation(structuredLocation ?? undefined) ??
  cleanText(fallbackText);
