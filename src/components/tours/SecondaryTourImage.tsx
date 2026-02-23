import Image from "../Image";

type SecondaryTourImageProps = {
  src: string;
  alt: string;
};

export default function SecondaryTourImage({
  src,
  alt,
}: SecondaryTourImageProps) {
  return (
    <div className="mt-6 px-1" data-secondary-image="true">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="aspect-[16/10] w-full">
          <Image
            src={src}
            fallbackSrc={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
