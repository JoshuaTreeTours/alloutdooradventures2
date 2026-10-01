import type { FareHarborProofProduct } from "../data/fareharborLeadToGoldProof.generated";
import {
  fareHarborPriceLabel,
  fareHarborRating,
  fareHarborShortDescription,
  formatFareHarborRating,
} from "../data/fareharborPresentation";

type FareHarborProductSummaryProps = {
  proof: FareHarborProofProduct;
  tone: "card" | "hero";
  showShortDescription?: boolean;
};

export default function FareHarborProductSummary({
  proof,
  tone,
  showShortDescription = true,
}: FareHarborProductSummaryProps) {
  const shortDescription = showShortDescription
    ? fareHarborShortDescription(proof)
    : "";
  const priceLabel = fareHarborPriceLabel(proof);
  const rating = fareHarborRating(proof);
  if (!shortDescription && !priceLabel && !rating) {
    return null;
  }

  const descriptionClass =
    tone === "hero"
      ? "mt-4 max-w-3xl text-sm leading-6 text-white/90 md:text-base"
      : "mt-2 overflow-hidden text-sm text-[#405040] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]";
  const ratingClass =
    tone === "hero"
      ? "mt-3 text-sm font-medium text-white"
      : "mt-3 text-sm font-medium text-[#2f4a2f]";
  const priceClass =
    tone === "hero"
      ? "mt-3 text-sm font-semibold text-white"
      : "mt-3 text-sm font-semibold text-[#1f2a1f]";

  return (
    <div data-testid="fareharbor-product-summary">
      {shortDescription ? (
        <p className={descriptionClass} data-testid="fareharbor-short-description">
          {shortDescription}
        </p>
      ) : null}
      {rating ? (
        <p
          className={ratingClass}
          data-testid="fareharbor-rating"
          data-rating-value={rating.ratingValue}
          data-review-count={rating.reviewCount}
        >
          {formatFareHarborRating(rating)}
        </p>
      ) : null}
      {priceLabel ? (
        <p className={priceClass} data-testid="fareharbor-price">
          {priceLabel}
        </p>
      ) : null}
    </div>
  );
}
