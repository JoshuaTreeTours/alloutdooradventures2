import type { ComponentPropsWithoutRef } from "react";

import Image from "./Image";

type CanonicalImageProps = ComponentPropsWithoutRef<typeof Image> & {
  priority?: boolean;
};

export default function CanonicalImage({
  priority = false,
  loading,
  decoding = "async",
  ...props
}: CanonicalImageProps) {
  const resolvedLoading = priority ? "eager" : loading ?? "lazy";

  return (
    <Image {...props} loading={resolvedLoading} decoding={decoding} />
  );
}
