import type { FareHarborProofProduct } from "../data/fareharborLeadToGoldProof.generated";
import {
  fareHarborPartialPayment,
  fareHarborPriceLabel,
} from "../data/fareharborPresentation";

type FareHarborProofSnapshotProps = {
  proof: FareHarborProofProduct;
};

export default function FareHarborProofSnapshot({
  proof,
}: FareHarborProofSnapshotProps) {
  const priceLabel = fareHarborPriceLabel(proof);
  const partialPayment = fareHarborPartialPayment(proof);
  const hasPrice = Boolean(priceLabel);
  const hasDuration = Boolean(proof.durationLabel);
  const hasMeetingPoint = Boolean(proof.meetingLocation);
  const hasFareDetail =
    proof.priceRows.length > 0 || proof.pricingNotes.length > 0;

  if (!hasPrice && !hasDuration && !hasMeetingPoint && !hasFareDetail) {
    return null;
  }

  return (
    <div
      className="rounded-2xl border border-green-200 bg-green-50 p-5"
      data-testid="fareharbor-proof-facts"
    >
      <div className="space-y-4 text-sm text-green-950">
        {hasPrice ? (
          <p>
            <strong>Price:</strong> {priceLabel}
          </p>
        ) : null}
        {partialPayment ? (
          <p className="text-xs text-green-900/80">
            Tour price {partialPayment.tourPriceLabel}. The{" "}
            {partialPayment.depositLabel} amount charged online is a
            partial-payment deposit, not the full tour price.
          </p>
        ) : null}
        {hasDuration ? (
          <p>
            <strong>Duration:</strong> {proof.durationLabel}
          </p>
        ) : null}
        {hasMeetingPoint ? (
          <p>
            <strong>Meeting point:</strong> {proof.meetingLocation}
          </p>
        ) : null}
        {hasFareDetail ? (
          <div className="space-y-2">
            {proof.priceRows.length > 0 ? (
              <ul className="space-y-2">
                {proof.priceRows.map(row => (
                  <li
                    key={`${row.label}-${row.amountLabel}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <span>
                      <span className="font-semibold">{row.label}</span>
                      {row.note ? (
                        <span className="block text-xs text-green-900/80">
                          {row.note}
                        </span>
                      ) : null}
                    </span>
                    <span className="font-semibold">
                      {partialPayment &&
                      row.amountLabel === partialPayment.depositLabel
                        ? `${row.amountLabel} deposit`
                        : row.amountLabel}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {proof.pricingNotes.map(note => (
              <p key={note} className="text-green-900/80">
                {note}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
