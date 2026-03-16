export default function Engine6IncludedSection({
  inclusions,
  exclusions,
}: {
  inclusions: string[];
  exclusions: string[];
}) {
  if (!inclusions.length && !exclusions.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#1f2a1f]">
        What&apos;s Included
      </h2>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {inclusions.length ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f4a2f]">
              Included
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {inclusions.map(item => (
                <li key={`inc-${item}`}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {exclusions.length ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f4a2f]">
              Not Included
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {exclusions.map(item => (
                <li key={`exc-${item}`}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
