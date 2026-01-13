import type { ComponentPropsWithoutRef, ReactEventHandler } from "react";
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
  decoding = "async",
  ...props
}: ImageProps) {
  const [location] = useLocation();
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    if (currentSrc === fallbackSrc) {
      return;
    }

    console.warn(`Image failed to load: ${currentSrc} (route: ${location})`);
    setCurrentSrc(fallbackSrc);
    onError?.(event);
  };

  return (
    <img
      src={currentSrc}
      decoding={decoding}
      onError={handleError}
      {...props}
    />
  );
}
