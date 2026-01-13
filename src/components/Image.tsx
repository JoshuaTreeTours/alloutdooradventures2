import type {
  ComponentPropsWithoutRef,
  ReactEventHandler,
  SyntheticEvent,
} from "react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const DEFAULT_FALLBACK = "/hero.jpg";

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
  const [location] = useLocation();
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const logImageEvent = (
    event: SyntheticEvent<HTMLImageElement, Event>,
    status: "load" | "error",
  ) => {
    const target = event.currentTarget;
    const details = {
      route: location,
      src,
      currentSrc,
      resolvedCurrentSrc: target.currentSrc,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      eventType: event.type,
      isTrusted: event.isTrusted,
    };

    if (status === "error") {
      console.error("Image failed to load.", details, event);
    } else {
      console.info("Image loaded.", details);
    }
  };

  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    logImageEvent(event, "error");
    if (currentSrc === fallbackSrc) {
      return;
    }

    console.warn(`Image failed to load: ${currentSrc} (route: ${location})`);
    setCurrentSrc(fallbackSrc);
    onError?.(event);
  };

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
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
