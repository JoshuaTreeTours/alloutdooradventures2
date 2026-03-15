import type { Engine6FaqItem } from "../types";

type Engine6FaqSectionProps = {
  faqs: Engine6FaqItem[];
};

export default function Engine6FaqSection({ faqs }: Engine6FaqSectionProps) {
  if (!faqs.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold">FAQs</h2>
      <div className="mt-3 space-y-3">
        {faqs.map(faq => (
          <article key={faq.question} className="rounded-xl bg-white p-4">
            <h3 className="font-semibold">{faq.question}</h3>
            <p className="mt-1 text-sm text-[#334433]">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
