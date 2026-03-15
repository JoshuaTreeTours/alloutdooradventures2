import type { Engine6PageData } from "../types";

type Props = { data: Engine6PageData };

export default function Engine6FaqSection({ data }: Props) {
  if (!data.faqs.length) return null;

  return (
    <>
      <h2 className="mt-8 text-2xl font-semibold">FAQs</h2>
      <div className="mt-3 space-y-4">
        {data.faqs.map(faq => (
          <div key={faq.question}>
            <h3 className="font-semibold">{faq.question}</h3>
            <p className="text-[#334433]">{faq.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}
