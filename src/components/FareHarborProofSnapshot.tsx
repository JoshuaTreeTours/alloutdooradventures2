import type { FareHarborProofProduct } from "../data/fareharborLeadToGoldProof.generated";

type FareHarborProofSnapshotProps = {
  proof: FareHarborProofProduct;
};

export default function FareHarborProofSnapshot({
  proof,
}: FareHarborProofSnapshotProps) {
  if (
    !proof.durationLabel &&
    !proof.meetingLocation &&
    proof.priceRows.length === 0 &&
    proof.pricingNotes.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-[#1f2a1f]">Tour snapshot</h3>
      {proof.durationLabel ? (
        <div className="mt-4 flex items-center justify-between text-sm text-[#405040]">
          <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            Duration
          </span>
          <span className="font-semibold text-[#1f2a1f]">
            {proof.durationLabel}
          </span>
        </div>
      ) : null}
      {proof.meetingLocation ? (
        <div className="mt-4 text-sm text-[#405040]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            Meeting location
          </p>
          <p className="mt-2 font-semibold text-[#1f2a1f]">
            {proof.meetingLocation}
          </p>
        </div>
      ) : null}
      {proof.priceRows.length > 0 || proof.pricingNotes.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            Pricing
          </p>
          {proof.priceRows.length > 0 ? (
            <ul className="mt-2 space-y-2 text-sm text-[#405040]">
              {proof.priceRows.map(row => (
                <li
                  key={`${row.label}-${row.amountLabel}`}
                  className="flex items-start justify-between gap-3"
                >
                  <span>
                    <span className="font-semibold text-[#1f2a1f]">
                      {row.label}
                    </span>
                    {row.note ? (
                      <span className="block text-xs text-[#405040]">
                        {row.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-semibold text-[#1f2a1f]">
                    {row.amountLabel}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {proof.pricingNotes.map(note => (
            <p key={note} className="mt-2 text-sm text-[#405040]">
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
