type Engine6IncludedSectionProps = {
  inclusions: string[];
  exclusions: string[];
};

export default function Engine6IncludedSection({
  inclusions,
  exclusions,
}: Engine6IncludedSectionProps) {
  if (!inclusions.length && !exclusions.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold">What&apos;s Included / Not Included</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4">
          <h3 className="font-semibold">Included</h3>
          <ul className="mt-2 list-disc pl-6">
            {inclusions.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white p-4">
          <h3 className="font-semibold">Not Included</h3>
          <ul className="mt-2 list-disc pl-6">
            {exclusions.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
