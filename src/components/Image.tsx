import React, {
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactEventHandler,
  type SyntheticEvent,
} from "react";

const DEFAULT_FALLBACK = "";

type ImageProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export default function Image({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  onError,
  onLoad,
  decoding = "async",
  ...props
}: ImageProps) {
  const routeLabel =
    typeof window !== "undefined" ? window.location.pathname : "";
  const [currentSrc, setCurrentSrc] = useState(src);
  const isDebugEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugImages") === "1" &&
    import.meta.env.MODE !== "production" &&
    import.meta.env.VERCEL_ENV !== "production";

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const logImageEvent = (
    event: SyntheticEvent<HTMLImageElement, Event>,
    status: "load" | "error"
  ) => {
    const target = event.currentTarget;
    const details = {
      route: routeLabel,
      src,
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
    if (!fallbackSrc || currentSrc === fallbackSrc) {
      return;
    }

    console.warn(`Image failed to load: ${currentSrc} (route: ${routeLabel})`);
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
