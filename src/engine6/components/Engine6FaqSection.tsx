import type { Engine6FaqItem } from "../types";

export default function Engine6FaqSection({
  faqs,
}: {
  faqs: Engine6FaqItem[];
}) {
  if (!faqs.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#1f2a1f]">FAQs</h2>
      <div className="mt-5 space-y-4">
        {faqs.map((faq, index) => (
          <article
            key={`${faq.question}-${index}`}
            className="rounded-xl border border-black/10 p-4"
          >
            <h3 className="text-base font-semibold text-[#1f2a1f]">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm text-[#405040]">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
