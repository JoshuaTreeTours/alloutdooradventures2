import type { Engine6PageData } from "../types";

type Props = { data: Engine6PageData };

export default function Engine6IncludedSection({ data }: Props) {
  if (!data.inclusions.length && !data.exclusions.length) return null;

  return (
    <>
      <h2 className="mt-8 text-2xl font-semibold">What&apos;s Included</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {data.inclusions.length ? (
          <div className="rounded-xl bg-white/70 p-4">
            <h3 className="font-semibold">Included</h3>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
              {data.inclusions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.exclusions.length ? (
          <div className="rounded-xl bg-white/70 p-4">
            <h3 className="font-semibold">Not Included</h3>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
              {data.exclusions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}
