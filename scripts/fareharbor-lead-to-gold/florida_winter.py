#!/usr/bin/env python3
"""Winter Magpie cohort for the Florida FareHarbor tranche.

The shared builder still publishes a city from its harvested FareHarbor
sources. This module only decides which catalog rows belong in the first
Florida tranche: high-demand November–February markets, and within those
markets the boat, snorkel, wildlife, fishing, sightseeing, food, and private
charter products. Equipment rentals, admissions, and off-priority activities
stay in the catalog and are reported as withheld.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SELECTION_REPORT = (
    ROOT / "reports" / "fareharbor-lead-to-gold" / "florida-winter-selection.json"
)

# Catalog city slugs. Miami Beach is part of the Miami market. Stock Island is
# the Key West harbor. Homestead and Goodland are Everglades / Ten Thousand
# Islands gateways, not a later inland-town expansion.
# Already published in the Stage B proof batch. A second city module would
# duplicate the item id.
ALREADY_PUBLISHED_ITEM_IDS = {"333279"}

FLORIDA_WINTER_CITY_SLUGS = {
    "miami",
    "miami-beach",
    "fort-lauderdale",
    "key-west",
    "stock-island",
    "orlando",
    "tampa",
    "st-petersburg",
    "naples",
    "sarasota",
    "everglades-city",
    "homestead",
    "goodland",
}

_EXPERIENCE_RE = re.compile(
    r"\b("
    r"airboats?|everglades|snorkel(?:ing)?|scuba|dives?|diving|wreck|"
    r"fish(?:ing)?|charters?|dolphin|manatee|wildlife|alligator|safari|"
    r"eco[- ]?tours?|shelling|birding|"
    r"kayaks?|kayaking|paddle(?:board(?:ing)?)?|canoes?|"
    r"food tours?|coffee|snacks?|treats?|tastings?|"
    r"cruises?|cruising|sails?|sailing|yachts?|"
    r"sandbars?|whalers?|boats?|boat tours?|sightseeing|"
    r"airplanes?|sundancers?|sundeckers?|cruisers?|"
    r"walking tours?|heritage|space center|keys"
    r")\b",
    re.I,
)

_HARD_EXCLUDE_RE = re.compile(
    r"\b("
    r"general admission|museum|birthday|luggage storage|"
    r"transport(?:ation)?(?:\s+only|\s+services)?|ticket only|tickets|"
    r"fam trip|demo|scooter|rollerblades?|skates|"
    r"open water diver|rescue diver|"
    r"soccer|arsenal|chelsea|"
    r"atv|utv|slingshot|"
    r"jet\s?ski|"
    r"bike rentals?|bicycle rentals?|e-?bike rentals?|"
    r"tandem bike rental|fat tire(?: beach rider)? bike rental|hybrid bike rental|"
    r"kayak / canoe rental|kayak rentals?|canoe rentals?|"
    r"multi day (?:kayak|canoe)|"
    r"\d+\s*hour (?:kayak|canoe)|"
    r"segway|pedicab|chariot|tender|parasail(?:ing)?"
    r")\b",
    re.I,
)

_OTHER_STATE_RE = re.compile(
    r"\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|"
    r"delaware|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|"
    r"louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|"
    r"missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|"
    r"new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|"
    r"rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|"
    r"virginia|washington|west virginia|wisconsin|wyoming)\b",
    re.I,
)

_RENTAL_RE = re.compile(r"\brentals?\b", re.I)
_GUIDED_RE = re.compile(
    r"\b(tours?|cruises?|charters?|sails?|airboats?|snorkel|dives?|fishing|wildlife|dolphin|manatee|food)\b",
    re.I,
)
_BIKE_RE = re.compile(r"\b(bikes?|bicycles?|e-?bikes?|cycling)\b", re.I)
_FOOD_OR_BOAT_RE = re.compile(
    r"\b(food|coffee|snacks?|treats?|tastings?|boats?|cruises?|airboats?|snorkel|sails?|yachts?|charters?)\b",
    re.I,
)
_YACHT_LENGTH_RE = re.compile(r"\b\d+\s*(?:ft|foot|feet)\b|\b\d+\s*['’]\b", re.I)
_GUIDED_JET_SKI_RE = re.compile(r"\bguided\b.*\bjet\s?ski\b|\bjet\s?ski\b.*\bguided\b", re.I)


def winter_cohort_decision(product: dict) -> tuple[bool, str]:
    """Return (selected, reason). Reason is stable for the selection report."""
    title = str(product.get("title") or "")
    tags = " ".join(str(tag) for tag in (product.get("tags") or []))
    categories = " ".join(str(category) for category in (product.get("categories") or []))
    primary = str(product.get("primaryDisplayCategory") or "")
    blob = " ".join([title, tags, categories, primary])

    if _OTHER_STATE_RE.search(title):
        return False, "outside-florida"

    if _GUIDED_JET_SKI_RE.search(title):
        return True, "winter-priority-experience"

    title_blocked = _HARD_EXCLUDE_RE.search(title)
    if title_blocked and not (
        _FOOD_OR_BOAT_RE.search(title) and not re.search(r"\b(segway|pedicab|chariot|tender|parasail)", title, re.I)
    ):
        return False, "rental-admission-or-off-priority"
    if title_blocked and re.search(r"\b(tender|parasail|jet\s?ski)\b", title, re.I):
        return False, "rental-admission-or-off-priority"

    if not _EXPERIENCE_RE.search(title) and _HARD_EXCLUDE_RE.search(blob):
        return False, "rental-admission-or-off-priority"

    if _RENTAL_RE.search(title) and not _GUIDED_RE.search(title):
        return False, "equipment-rental"

    if _BIKE_RE.search(title) and not _FOOD_OR_BOAT_RE.search(title):
        return False, "bike-or-land-tour-outside-winter-priority"

    if _EXPERIENCE_RE.search(title) or (
        _EXPERIENCE_RE.search(tags) and not _BIKE_RE.search(title)
    ):
        return True, "winter-priority-experience"

    if _YACHT_LENGTH_RE.search(title):
        return True, "private-yacht"

    if re.search(r"\bprivate\b", title, re.I) and re.search(
        r"\b(tour|cruise|charter|boat|sail|snorkel|fish|keys)\b", blob, re.I
    ):
        return True, "private-charter"

    return False, "not-a-winter-priority-experience"


def split_winter_cohort(products: list[dict]) -> tuple[list[dict], list[dict]]:
    selected = []
    withheld = []
    for product in products:
        keep, reason = winter_cohort_decision(product)
        if keep:
            selected.append(product)
        else:
            withheld.append({**product, "withholdReason": reason})
    return selected, withheld


def apply_winter_cohort(city_slug: str, products: list[dict]) -> list[dict]:
    """Keep the winter cohort for this city and record what was withheld."""
    if city_slug not in FLORIDA_WINTER_CITY_SLUGS:
        return products
    already = []
    remaining = []
    for product in products:
        if str(product.get("itemId")) in ALREADY_PUBLISHED_ITEM_IDS:
            already.append({**product, "withholdReason": "already-published-in-proof-batch"})
        else:
            remaining.append(product)
    selected, withheld = split_winter_cohort(remaining)
    withheld = [*already, *withheld]
    payload = {}
    if SELECTION_REPORT.exists():
        loaded = json.loads(SELECTION_REPORT.read_text(encoding="utf-8"))
        if isinstance(loaded, dict):
            payload = loaded
    cities = payload.get("cities")
    if not isinstance(cities, dict):
        cities = {}
    cities[city_slug] = {
        "catalog": len(products),
        "selected": len(selected),
        "withheld": [
            {
                "itemId": item.get("itemId"),
                "title": item.get("title"),
                "publicPath": item.get("publicPath"),
                "reason": item.get("withholdReason"),
            }
            for item in withheld
        ],
    }
    payload["cities"] = cities
    payload["winterCitySlugs"] = sorted(FLORIDA_WINTER_CITY_SLUGS)
    SELECTION_REPORT.parent.mkdir(parents=True, exist_ok=True)
    SELECTION_REPORT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(
        f"florida winter cohort {city_slug}: selected={len(selected)} withheld={len(withheld)}"
    )
    return selected
