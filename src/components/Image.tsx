import type {
  ComponentPropsWithoutRef,
  ReactEventHandler,
  SyntheticEvent,
} from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const DEFAULT_FALLBACK = "/hero.jpg";

type ImageProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src: string;
  fallbackSrc?: string;
  disableFallback?: boolean;
  fallbackCandidates?: string[];
};

const cleanSrc = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function Image({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  disableFallback = false,
  fallbackCandidates,
  onError,
  onLoad,
  decoding = "async",
  ...props
}: ImageProps) {
  const [location] = useLocation();
  const failoverCandidates = useMemo(() => {
    const seen = new Set<string>();
    const bag: string[] = [];
    [src, ...(fallbackCandidates ?? [])].forEach(candidate => {
      const cleanCandidate = cleanSrc(candidate);
      if (!cleanCandidate || seen.has(cleanCandidate)) {
        return;
      }
      seen.add(cleanCandidate);
      bag.push(cleanCandidate);
    });
    return bag;
  }, [src, fallbackCandidates]);

  const [currentSrc, setCurrentSrc] = useState(failoverCandidates[0] ?? src);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const isDebugEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugImages") === "1" &&
    import.meta.env.MODE !== "production" &&
    import.meta.env.VERCEL_ENV !== "production";

  useEffect(() => {
    setCurrentCandidateIndex(0);
    setCurrentSrc(failoverCandidates[0] ?? src);
  }, [src, failoverCandidates]);

  const logImageEvent = (
    event: SyntheticEvent<HTMLImageElement, Event>,
    status: "load" | "error"
  ) => {
    const target = event.currentTarget;
    const details = {
      route: location,
      src,
      failoverCandidates,
      currentCandidateIndex,
      currentSrc,
      resolvedCurrentSrc: target.currentSrc,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      eventType: event.type,
      isTrusted: event.isTrusted,
    };

    if (!isDebugEnabled) {
      return;
    }

    if (status === "error") {
      console.error("Image failed to load.", details, event);
    } else {
      console.info("Image loaded.", details);
    }
  };

  const handleError: ReactEventHandler<HTMLImageElement> = event => {
    logImageEvent(event, "error");

    const nextIndex = currentCandidateIndex + 1;
    if (nextIndex < failoverCandidates.length) {
      const nextSrc = failoverCandidates[nextIndex];
      console.warn(
        `Image failed to load: ${currentSrc} (route: ${location}). Trying fallback candidate: ${nextSrc}`
      );
      setCurrentCandidateIndex(nextIndex);
      setCurrentSrc(nextSrc);
      onError?.(event);
      return;
    }

    if (disableFallback) {
      onError?.(event);
      return;
    }

    if (currentSrc === fallbackSrc) {
      return;
    }

    console.warn(`Image failed to load: ${currentSrc} (route: ${location})`);
    setCurrentSrc(fallbackSrc);
    onError?.(event);
  };

  const handleLoad: ReactEventHandler<HTMLImageElement> = event => {
    logImageEvent(event, "load");
    onLoad?.(event);
  };

  return (
    <img
      src={currentSrc}
      decoding={decoding}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}
