#!/usr/bin/env python3
"""Harvest authoritative FareHarbor endpoints for Boston legacy products.

Does not change runtime pages. Writes harvest artifacts and a classification report.
"""

from __future__ import annotations

import hashlib
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from build_stage_b_proof import extract_price
from florida_winter import apply_winter_cohort
from inventory_boston import inventory as inventory_for_city
from tripadvisor_ratings import (
    google_review_pair,
    parse_tripadvisor_rating,
    ratings_provider_keys,
)

ROOT = Path(__file__).resolve().parents[2]
CITY_SLUG = "boston"
HARVEST_ROOT = ROOT / "data" / "fareharbor-lead-to-gold" / CITY_SLUG
REPORT = ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{CITY_SLUG}-harvest.json"
RATINGS_REPORT = (
    ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{CITY_SLUG}-ratings.json"
)

USER_AGENT = (
    "AllOutdoorAdventures-harvest/1.0 (+https://alloutdooradventures.com)"
)
TIMEOUT = 30
WORKERS = 4
RETRIES = 3
TRANSIENT_STATUSES = {408, 425, 429, 500, 502, 503, 504}
TERMINAL_BODY = re.compile(
    r"\b(page not found|product (?:was )?deleted|item (?:was )?deleted|"
    r"experience (?:is )?no longer (?:available|exists)|"
    r"booking page (?:is )?no longer available)\b",
    re.I,
)


class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.chunks: list[str] = []
        self.skip = False

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript"}:
            self.skip = True

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"}:
            self.skip = False

    def handle_data(self, data):
        if not self.skip:
            text = data.strip()
            if text:
                self.chunks.append(text)


def visible_text(html: str) -> str:
    parser = VisibleText()
    try:
        parser.feed(html)
    except Exception:
        return re.sub(r"<[^>]+>", " ", html)
    return " ".join(parser.chunks)


def classify_booking(status: int | None, text: str, network_error: bool) -> str:
    if network_error or status is None or status in TRANSIENT_STATUSES or (
        status is not None and status >= 500
    ):
        return "TRANSIENT_FAILURE"
    if status in {404, 410}:
        return "BOOKING_PAGE_NOT_FOUND"
    if 200 <= status < 300:
        return "BOOKING_PAGE_NOT_FOUND" if TERMINAL_BODY.search(text) else "VALID"
    return "INDETERMINATE"


def fetch(url: str, accept: str) -> tuple[int | None, bytes, bool]:
    last_error = False
    last_status = None
    last_body = b""
    for attempt in range(RETRIES):
        request = Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": accept,
            },
        )
        try:
            with urlopen(request, timeout=TIMEOUT) as response:
                body = response.read()
                return response.getcode(), body, False
        except HTTPError as error:
            last_status = error.code
            last_body = error.read() if error.fp else b""
            if error.code not in TRANSIENT_STATUSES:
                return error.code, last_body, False
        except (URLError, TimeoutError, OSError):
            last_error = True
            last_status = None
            last_body = b""
        time.sleep(1.5 * (attempt + 1))
    return last_status, last_body, last_error


def endpoint_record(url: str, status: int | None, body: bytes) -> dict:
    return {
        "url": url,
        "status": status,
        "bytes": len(body),
        "sha256": hashlib.sha256(body).hexdigest() if body else None,
    }


def harvest_one(product: dict) -> dict:
    company = product["company"]
    item_id = product["itemId"]
    folder = HARVEST_ROOT / f"{company}-{item_id}"
    folder.mkdir(parents=True, exist_ok=True)
    fetched_at = datetime.now(timezone.utc).isoformat()
    endpoints = {
        "content": f"https://fareharbor.com/api/items/v1/{company}/{item_id}/content/",
        "structured-description": (
            f"https://fareharbor.com/api/items/v1/{company}/{item_id}/structured-description/"
        ),
        "item": f"https://fareharbor.com/api/v1/companies/{company}/items/{item_id}/",
        "price-preview": (
            f"https://fareharbor.com/api/embed/{company}/price-preview/per-item/v2/"
            f"?asn=fhdn&item_pks={item_id}&include_breakdown=yes&allow_unlisted_items=yes"
        ),
        "ratings": ratings_endpoint(company, item_id),
    }
    meta_endpoints = {}
    saved = {}
    for name, url in endpoints.items():
        status, body, network_error = fetch(url, "application/json, */*;q=0.8")
        path = folder / f"{name}.json"
        try:
            parsed = json.loads(body.decode("utf-8", errors="replace")) if body else {}
        except json.JSONDecodeError:
            parsed = {"error": "non-json", "status": status}
        if network_error:
            parsed = {"error": "network", "status": status}
        path.write_text(json.dumps(parsed, ensure_ascii=False) + "\n")
        meta_endpoints[name] = endpoint_record(url, status, body)
        saved[name] = parsed
        time.sleep(0.15)

    booking_url = (
        f"https://fareharbor.com/embeds/book/{company}/items/{item_id}/"
    )
    booking_status, booking_body, booking_network = fetch(
        booking_url, "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8"
    )
    booking_html = booking_body.decode("utf-8", errors="replace") if booking_body else ""
    booking_text = visible_text(booking_html)
    classification = classify_booking(booking_status, booking_text, booking_network)
    # Keep classification evidence in harvest-meta only. Do not store full HTML.
    booking = {
        "itemId": item_id,
        "provider": company,
        "bookingUrl": booking_url,
        "httpStatus": booking_status,
        "classification": classification,
        "networkError": booking_network,
        "visibleTextExcerpt": booking_text[:400],
    }
    if classification == "BOOKING_PAGE_NOT_FOUND":
        booking["evidence"] = (
            f"Authoritative booking destination returned HTTP {booking_status} "
            "with a terminal not-found or deleted-product state."
            if booking_status in {404, 410}
            else "Authoritative booking destination returned a visible Page not found state."
        )

    preview = saved.get("price-preview") or {}
    price = None
    if meta_endpoints["price-preview"].get("status") == 200:
        price = extract_price(preview)

    meta = {
        "company": company,
        "itemId": item_id,
        "fetchedAt": fetched_at,
        "endpoints": meta_endpoints,
        "bookingPageValidity": booking,
        "hasAuthoritativePrice": price is not None,
    }
    (folder / "harvest-meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n"
    )
    return {
        **product,
        "fetchedAt": fetched_at,
        "endpoints": meta_endpoints,
        "bookingPageValidity": booking,
        "hasAuthoritativePrice": price is not None,
        "priceBasis": (
            {
                "amount": price["basis"]["amount"],
                "currency": price["currency"],
                "singular": price["basis"]["singular"],
            }
            if price
            else None
        ),
    }


def ratings_endpoint(company: str, item_id: str) -> str:
    return (
        f"https://fareharbor.com/api/v1/companies/{company}/items/{item_id}/ratings/"
    )


def harvest_ratings_one(product: dict) -> dict:
    """Fetch only the ratings endpoint. Leave content, price, and fetchedAt alone."""
    company = product["company"]
    item_id = product["itemId"]
    folder = HARVEST_ROOT / f"{company}-{item_id}"
    folder.mkdir(parents=True, exist_ok=True)
    url = ratings_endpoint(company, item_id)
    status, body, network_error = fetch(url, "application/json, */*;q=0.8")
    try:
        parsed = json.loads(body.decode("utf-8", errors="replace")) if body else {}
    except json.JSONDecodeError:
        parsed = {"error": "non-json", "status": status}
    if network_error:
        parsed = {"error": "network", "status": status}
    if not isinstance(parsed, dict):
        parsed = {"error": "non-object", "status": status}
    (folder / "ratings.json").write_text(
        json.dumps(parsed, ensure_ascii=False) + "\n"
    )
    meta_path = folder / "harvest-meta.json"
    meta = {}
    if meta_path.exists():
        loaded = json.loads(meta_path.read_text())
        if isinstance(loaded, dict):
            meta = loaded
    meta.setdefault("company", company)
    meta.setdefault("itemId", item_id)
    endpoints = meta.get("endpoints")
    if not isinstance(endpoints, dict):
        endpoints = {}
        meta["endpoints"] = endpoints
    endpoints["ratings"] = endpoint_record(url, status, b"" if network_error else body)
    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n")
    tripadvisor = (
        parse_tripadvisor_rating(parsed) if status == 200 and not network_error else None
    )
    google = google_review_pair(parsed) if status == 200 and not network_error else None
    return {
        "company": company,
        "itemId": item_id,
        "title": product.get("title"),
        "publicPath": product.get("publicPath"),
        "status": status,
        "networkError": network_error,
        "providerKeys": ratings_provider_keys(parsed) if status == 200 else [],
        "tripadvisor": tripadvisor,
        "googleReviews": google,
    }


def harvest_ratings(products: list[dict]) -> None:
    results = []
    print(f"harvesting TripAdvisor ratings for {len(products)} {CITY_SLUG} products")
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {
            pool.submit(harvest_ratings_one, product): product["itemId"]
            for product in products
        }
        for index, future in enumerate(as_completed(futures), start=1):
            item_id = futures[future]
            try:
                record = future.result()
            except Exception as error:
                record = {
                    "itemId": item_id,
                    "status": None,
                    "networkError": True,
                    "error": str(error),
                    "tripadvisor": None,
                    "googleReviews": None,
                    "providerKeys": [],
                }
            results.append(record)
            trip = record.get("tripadvisor")
            label = (
                f"TripAdvisor {trip['ratingValue']} ({trip['reviewCount']})"
                if trip
                else "no-tripadvisor"
            )
            print(f"[{index}/{len(products)}] {item_id} HTTP {record.get('status')} {label}")
    results.sort(key=lambda item: (item.get("company") or "", item.get("itemId") or ""))
    tripadvisor = [item for item in results if item.get("tripadvisor")]
    google_only = [
        item
        for item in results
        if item.get("googleReviews") and not item.get("tripadvisor")
    ]
    failures = [
        item
        for item in results
        if item.get("networkError") or item.get("status") != 200
    ]
    neither = [
        item
        for item in results
        if item.get("status") == 200
        and not item.get("tripadvisor")
        and not item.get("googleReviews")
    ]
    key_counts: dict[str, int] = {}
    for item in results:
        for key in item.get("providerKeys") or []:
            key_counts[key] = key_counts.get(key, 0) + 1

    def compact(item: dict) -> dict:
        trip = item.get("tripadvisor") or {}
        google = item.get("googleReviews") or {}
        return {
            "itemId": item.get("itemId"),
            "company": item.get("company"),
            "title": item.get("title"),
            "publicPath": item.get("publicPath"),
            "status": item.get("status"),
            "ratingValue": trip.get("ratingValue"),
            "reviewCount": trip.get("reviewCount"),
            "provider": trip.get("provider"),
            "googleRatingValue": google.get("ratingValue"),
            "googleReviewCount": google.get("reviewCount"),
        }

    ranked = sorted(
        tripadvisor,
        key=lambda item: (
            item.get("itemId") != "657142",
            item.get("company") or "",
            -item["tripadvisor"]["reviewCount"],
        ),
    )
    representative = []
    seen_pairs = set()
    for item in ranked:
        trip = item["tripadvisor"]
        pair = (item.get("company"), trip["ratingValue"], trip["reviewCount"])
        if pair in seen_pairs and item.get("itemId") != "657142":
            continue
        seen_pairs.add(pair)
        representative.append(compact(item))
    if google_only:
        representative.append(compact(google_only[0]))
    unrated = next((item for item in neither), None)
    if unrated:
        representative.append(compact(unrated))
    company_pairs = []
    for company, rating_value, review_count in sorted(seen_pairs):
        company_pairs.append(
            {
                "company": company,
                "ratingValue": rating_value,
                "reviewCount": review_count,
                "provider": "TripAdvisor",
                "items": sum(
                    1
                    for item in tripadvisor
                    if item.get("company") == company
                    and item["tripadvisor"]["ratingValue"] == rating_value
                    and item["tripadvisor"]["reviewCount"] == review_count
                ),
            }
        )
    report = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "source": {
            "endpoint": "GET https://fareharbor.com/api/v1/companies/{company}/items/{itemId}/ratings/",
            "widgetConfiguration": "api.itemRatings",
            "widgetScript": "https://dipr2nuwo661l.cloudfront.net/static/cache/js/output.10d951f5ab23.js",
            "fields": {
                "ratingValue": "ratings.tripadvisor.rating",
                "reviewCount": "ratings.tripadvisor.num_reviews",
                "provider": "TripAdvisor",
            },
            "ignored": [
                "ratings.tripadvisor.rating_image_url",
                "ratings.google_reviews",
                "ratings.googleReviews",
                "catalog quality_score",
                "catalog availability_count",
            ],
            "note": (
                "The booking HTML does not embed the numeric rating. The widget GETs "
                "this endpoint and renders ratings.tripadvisor.rating with num_reviews. "
                "The bubble PNG filename is not the score."
            ),
        },
        "audited": len(results),
        "http200": sum(1 for item in results if item.get("status") == 200),
        "tripadvisor": len(tripadvisor),
        "googleOnly": len(google_only),
        "tripadvisorAndGoogle": sum(
            1
            for item in results
            if item.get("tripadvisor") and item.get("googleReviews")
        ),
        "neither": len(neither),
        "failures": len(failures),
        "companyPairs": company_pairs,
        "providerKeyCounts": key_counts,
        "failureIds": [item.get("itemId") for item in failures],
        "googleOnlyIds": [item.get("itemId") for item in google_only],
        "representative": representative,
        "products": [compact(item) for item in results],
    }
    RATINGS_REPORT.parent.mkdir(parents=True, exist_ok=True)
    RATINGS_REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(
        "RATINGS "
        f"audited={report['audited']} "
        f"http200={report['http200']} "
        f"tripadvisor={report['tripadvisor']} "
        f"googleOnly={report['googleOnly']} "
        f"neither={report['neither']} "
        f"failures={report['failures']}"
    )


def configure_city(city_slug: str) -> None:
    global CITY_SLUG, HARVEST_ROOT, REPORT, RATINGS_REPORT
    CITY_SLUG = city_slug
    HARVEST_ROOT = ROOT / "data" / "fareharbor-lead-to-gold" / city_slug
    REPORT = (
        ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{city_slug}-harvest.json"
    )
    RATINGS_REPORT = (
        ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{city_slug}-ratings.json"
    )


def inventory():
    return inventory_for_city(CITY_SLUG)


def main() -> None:
    import sys

    if "--city" in sys.argv:
        configure_city(sys.argv[sys.argv.index("--city") + 1])
    catalog = inventory()
    if "--all-products" not in sys.argv:
        catalog["products"] = apply_winter_cohort(CITY_SLUG, catalog["products"])
    if "--ratings-only" in sys.argv:
        harvest_ratings(catalog["products"])
        return
    HARVEST_ROOT.mkdir(parents=True, exist_ok=True)
    products = catalog["products"]
    results = []
    print(f"harvesting {len(products)} {CITY_SLUG} FareHarbor products")
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(harvest_one, product): product["itemId"] for product in products}
        for index, future in enumerate(as_completed(futures), start=1):
            item_id = futures[future]
            try:
                record = future.result()
            except Exception as error:
                record = {
                    "itemId": item_id,
                    "error": str(error),
                    "bookingPageValidity": {
                        "classification": "TRANSIENT_FAILURE",
                        "networkError": True,
                    },
                    "hasAuthoritativePrice": False,
                }
            results.append(record)
            status = record.get("bookingPageValidity", {}).get("classification")
            priced = "priced" if record.get("hasAuthoritativePrice") else "no-price"
            print(f"[{index}/{len(products)}] {item_id} {status} {priced}")

    results.sort(key=lambda item: (item.get("company") or "", item.get("itemId") or ""))
    terminal = [
        item
        for item in results
        if item.get("bookingPageValidity", {}).get("classification") == "BOOKING_PAGE_NOT_FOUND"
    ]
    transient = [
        item
        for item in results
        if item.get("bookingPageValidity", {}).get("classification")
        in {"TRANSIENT_FAILURE", "INDETERMINATE"}
    ]
    active = [
        item
        for item in results
        if item.get("bookingPageValidity", {}).get("classification") == "VALID"
    ]
    priced = [item for item in active if item.get("hasAuthoritativePrice")]
    price_not_found = [item for item in active if not item.get("hasAuthoritativePrice")]
    report = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "citySlug": CITY_SLUG,
        "totalBostonLegacy": len(results),
        "total": len(results),
        "active": len(active),
        "terminal": len(terminal),
        "transientOrIndeterminate": len(transient),
        "authoritativePrice": len(priced),
        "priceNotFound": len(price_not_found),
        "alreadyRetired": catalog["alreadyRetired"],
        "engine6Collisions": catalog["engine6Collisions"],
        "terminalIds": [item["itemId"] for item in terminal],
        "priceNotFoundIds": [item["itemId"] for item in price_not_found],
        "transientIds": [item.get("itemId") for item in transient],
        "products": results,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    (HARVEST_ROOT / "harvest-index.json").write_text(
        json.dumps(
            {
                "fetchedAt": report["fetchedAt"],
                "total": len(results),
                "products": [
                    {
                        "company": item.get("company"),
                        "itemId": item.get("itemId"),
                        "fetchedAt": item.get("fetchedAt"),
                        "endpoints": item.get("endpoints"),
                        "bookingPageValidity": item.get("bookingPageValidity"),
                        "hasAuthoritativePrice": item.get("hasAuthoritativePrice"),
                    }
                    for item in results
                ],
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )
    print(
        "COUNTS "
        f"total={report['totalBostonLegacy']} "
        f"active={report['active']} "
        f"terminal={report['terminal']} "
        f"priced={report['authoritativePrice']} "
        f"PRICE_NOT_FOUND={report['priceNotFound']} "
        f"transient={report['transientOrIndeterminate']}"
    )


if __name__ == "__main__":
    main()
