"""Parse the FareHarbor item ratings payload.

The booking widget loads
GET /api/v1/companies/{company}/items/{itemPk}/ratings/
and binds ratings.tripadvisor.rating plus ratings.tripadvisor.num_reviews
(camelized as numReviews in the widget). The bubble image URL is not a score.
"""

from __future__ import annotations

TRIPADVISOR_PROVIDER = "TripAdvisor"


def _rating_value(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    number = float(value)
    if not 0 < number <= 5:
        return None
    if number.is_integer():
        return int(number)
    return number


def _review_count(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    if isinstance(value, int) and value > 0:
        return value
    return None


def _ratings_object(payload):
    if not isinstance(payload, dict):
        return None
    ratings = payload.get("ratings")
    if not isinstance(ratings, dict):
        return None
    return ratings


def parse_tripadvisor_rating(payload) -> dict | None:
    """Return the TripAdvisor pair, or None.

    Reads only ratings.tripadvisor.rating and num_reviews / numReviews.
    Ignores rating_image_url even when its filename encodes a different score.
    Does not read Google reviews.
    """
    ratings = _ratings_object(payload)
    if ratings is None:
        return None
    tripadvisor = ratings.get("tripadvisor")
    if not isinstance(tripadvisor, dict):
        return None
    rating_value = _rating_value(tripadvisor.get("rating"))
    review_count = _review_count(
        tripadvisor.get("num_reviews", tripadvisor.get("numReviews"))
    )
    if rating_value is None or review_count is None:
        return None
    return {
        "ratingValue": rating_value,
        "reviewCount": review_count,
        "provider": TRIPADVISOR_PROVIDER,
    }


def google_review_pair(payload) -> dict | None:
    """Detect a Google pair for the audit. Never a TripAdvisor substitute."""
    ratings = _ratings_object(payload)
    if ratings is None:
        return None
    google = ratings.get("google_reviews", ratings.get("googleReviews"))
    if not isinstance(google, dict):
        return None
    rating_value = _rating_value(google.get("rating"))
    review_count = _review_count(
        google.get(
            "user_ratings_total",
            google.get("userRatingsTotal", google.get("num_reviews")),
        )
    )
    if rating_value is None or review_count is None:
        return None
    return {"ratingValue": rating_value, "reviewCount": review_count}


def ratings_payload_item_id(payload) -> str | None:
    """Item pk bound on the ratings payload, when the endpoint includes one."""
    ratings = _ratings_object(payload)
    if ratings is None:
        return None
    item = ratings.get("item")
    if not isinstance(item, dict) or item.get("pk") is None:
        return None
    return str(item.get("pk"))


def ratings_provider_keys(payload) -> list[str]:
    ratings = _ratings_object(payload)
    if ratings is None:
        return []
    return sorted(key for key in ratings.keys() if key != "item")
