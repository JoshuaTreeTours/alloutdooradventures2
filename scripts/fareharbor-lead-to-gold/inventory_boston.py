#!/usr/bin/env python3
"""Inventory eligible Boston legacy FareHarbor products. Read-only."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "src" / "data" / "tours.generated.ts"
ENGINE6_ROUTES = ROOT / "src" / "engine6" / "routes.ts"
SUPPRESSED = ROOT / "src" / "utils" / "fareharbor" / "suppressedBookingPages.ts"
def inventory_report_path(city_slug: str = "boston") -> Path:
    return (
        ROOT
        / "reports"
        / "fareharbor-lead-to-gold"
        / f"stage-c-{city_slug}-inventory.json"
    )

FH_URL = re.compile(
    r"https://fareharbor\.com/embeds/(?:book|calendar)/([^/\"'?]+)/items/(\d+)",
    re.I,
)
VIATOR_URL = re.compile(r"https://www\.viator\.com/", re.I)
ROUTE_RE = re.compile(r'ROUTE\s*=\s*"(/destinations/[^"]+)"')
ITEM_ID_RE = re.compile(r'itemId:\s*"(\d+)"')


def load_generated_tours() -> list[dict]:
    text = GENERATED.read_text(encoding="utf-8")
    marker = "export const toursGenerated: Tour[] = "
    start = text.index(marker) + len(marker)
    end = text.rindex("]")
    return json.loads(text[start : end + 1])


def engine6_routes() -> set[str]:
    return set(ROUTE_RE.findall(ENGINE6_ROUTES.read_text(encoding="utf-8")))


def retired_ids() -> set[str]:
    return set(ITEM_ID_RE.findall(SUPPRESSED.read_text(encoding="utf-8")))


def public_path(tour: dict) -> str:
    dest = tour.get("destination") or {}
    return (
        f"/destinations/{dest.get('stateSlug')}/{dest.get('citySlug')}/tours/{tour.get('slug')}"
    )


def inventory(city_slug: str = "boston") -> dict:
    tours = load_generated_tours()
    e6 = engine6_routes()
    retired = retired_ids()
    products = []
    skipped = []
    seen = set()
    for tour in tours:
        dest = tour.get("destination") or {}
        if dest.get("citySlug") != city_slug:
            continue
        booking = tour.get("bookingUrl") or tour.get("bookingWidgetUrl") or ""
        if VIATOR_URL.search(booking):
            skipped.append({"id": tour.get("id"), "reason": "VIATOR"})
            continue
        match = FH_URL.search(booking)
        if not match:
            skipped.append({"id": tour.get("id"), "reason": "NOT_FAREHARBOR"})
            continue
        company, item_id = match.group(1), match.group(2)
        path = public_path(tour)
        if path in e6:
            skipped.append(
                {
                    "id": tour.get("id"),
                    "itemId": item_id,
                    "reason": "ENGINE6_CANONICAL_PATH",
                    "publicPath": path,
                }
            )
            continue
        key = f"{company}:{item_id}"
        if key in seen:
            skipped.append({"id": tour.get("id"), "itemId": item_id, "reason": "DUPLICATE_KEY"})
            continue
        seen.add(key)
        products.append(
            {
                "itemId": item_id,
                "company": company,
                "catalogId": tour.get("id"),
                "slug": tour.get("slug"),
                "title": tour.get("title"),
                "operator": tour.get("operator"),
                "publicPath": path,
                "destination": dest,
                "bookingUrl": booking,
                "heroImage": tour.get("heroImage"),
                "galleryImages": tour.get("galleryImages") or [],
                "alreadyRetired": item_id in retired,
            }
        )
    products.sort(key=lambda item: (item["company"], item["itemId"]))
    return {
        "total": len(products),
        "alreadyRetired": sum(1 for item in products if item["alreadyRetired"]),
        "engine6Collisions": sum(1 for item in skipped if item["reason"] == "ENGINE6_CANONICAL_PATH"),
        "skipped": skipped,
        "citySlug": city_slug,
        "products": products,
    }


def main() -> None:
    import sys

    city_slug = "boston"
    if "--city" in sys.argv:
        city_slug = sys.argv[sys.argv.index("--city") + 1]
    payload = inventory(city_slug)
    out = inventory_report_path(city_slug)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(
        f"city={city_slug} total={payload['total']} "
        f"alreadyRetired={payload['alreadyRetired']} engine6={payload['engine6Collisions']}"
    )


if __name__ == "__main__":
    main()
