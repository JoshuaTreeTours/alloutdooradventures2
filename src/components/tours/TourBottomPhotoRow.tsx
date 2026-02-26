import Image from "../Image";

type TourBottomPhotoRowProps = {
  imageUrls: string[];
  title?: string;
};

export default function TourBottomPhotoRow({
  imageUrls,
  title = "More photos",
}: TourBottomPhotoRowProps) {
  const unique = Array.from(new Set(imageUrls.filter(Boolean))).slice(0, 2);

  if (!unique.length) {
    return null;
  }

  return (
    <section className="mt-10">
      <h3 className="text-xl font-semibold text-[#2f4a2f]">{title}</h3>
      <div
        className={`mt-4 grid gap-4 ${unique.length === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}
      >
        {unique.map(image => (
          <div
            key={image}
            className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
          >
            <Image
              src={image}
              fallbackSrc={image}
              alt="Tour photo"
              className="h-56 w-full object-cover md:h-64"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
