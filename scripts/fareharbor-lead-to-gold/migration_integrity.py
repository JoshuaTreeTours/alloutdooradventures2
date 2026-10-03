#!/usr/bin/env python3
"""Shared geography and editorial-quality rules for FareHarbor city migrations.

Never treat a legacy city bucket as proof that the activity takes place there.
"""

from __future__ import annotations

import re
from typing import Iterable

STATE_ABBR_TO_NAME = {
    "al": "Alabama",
    "ak": "Alaska",
    "az": "Arizona",
    "ar": "Arkansas",
    "ca": "California",
    "co": "Colorado",
    "ct": "Connecticut",
    "de": "Delaware",
    "dc": "District of Columbia",
    "fl": "Florida",
    "ga": "Georgia",
    "hi": "Hawaii",
    "id": "Idaho",
    "il": "Illinois",
    "in": "Indiana",
    "ia": "Iowa",
    "ks": "Kansas",
    "ky": "Kentucky",
    "la": "Louisiana",
    "me": "Maine",
    "md": "Maryland",
    "ma": "Massachusetts",
    "mi": "Michigan",
    "mn": "Minnesota",
    "ms": "Mississippi",
    "mo": "Missouri",
    "mt": "Montana",
    "ne": "Nebraska",
    "nv": "Nevada",
    "nh": "New Hampshire",
    "nj": "New Jersey",
    "nm": "New Mexico",
    "ny": "New York",
    "nc": "North Carolina",
    "nd": "North Dakota",
    "oh": "Ohio",
    "ok": "Oklahoma",
    "or": "Oregon",
    "pa": "Pennsylvania",
    "ri": "Rhode Island",
    "sc": "South Carolina",
    "sd": "South Dakota",
    "tn": "Tennessee",
    "tx": "Texas",
    "ut": "Utah",
    "vt": "Vermont",
    "va": "Virginia",
    "wa": "Washington",
    "wv": "West Virginia",
    "wi": "Wisconsin",
    "wy": "Wyoming",
}
STATE_NAME_TO_ABBR = {name.lower(): abbr for abbr, name in STATE_ABBR_TO_NAME.items()}
STATE_NAME_TO_ABBR.update({abbr: abbr for abbr in STATE_ABBR_TO_NAME})

BOSTON_CORE_CITIES = {
    "boston",
    "east boston",
    "south boston",
    "charlestown",
    "back bay",
    "beacon hill",
    "north end",
    "downtown",
    "seaport",
    "fenway",
    "allston",
    "brighton",
    "dorchester",
    "roxbury",
    "jamaica plain",
    "south end",
    "west end",
    "chinatown",
    "financial district",
    "theater district",
    "waterfront",
    "boston harbor",
    "logan",
}

BOSTON_AREA_CITIES = BOSTON_CORE_CITIES | {
    "cambridge",
    "somerville",
    "brookline",
    "chelsea",
    "revere",
    "winthrop",
    "quincy",
    "newton",
    "watertown",
    "medford",
    "malden",
    "everett",
    "arlington",
    "belmont",
    "milton",
    "dedham",
}

AREA_CITIES_BY_EXPECTED = {
    ("massachusetts", "boston"): BOSTON_AREA_CITIES,
}

HEADING_STOPWORDS = {
    "about",
    "duration",
    "includes",
    "included",
    "important",
    "details",
    "please",
    "overview",
    "highlights",
    "meeting",
    "cancellation",
    "what",
    "bring",
    "note",
    "notes",
    "tour",
    "package",
    "this",
    "the",
    "see",
    "you",
    "soon",
    "explore",
    "request",
    "including",
    "admission",
    "private",
    "hours",
    "available",
    "english",
    "spanish",
}

HEADING_ANY_WORDS = HEADING_STOPWORDS - {
    "the",
    "this",
    "tour",
    "you",
    "see",
    "soon",
    "package",
}

STREET_WORDS = {
    "street",
    "st",
    "avenue",
    "ave",
    "road",
    "rd",
    "boulevard",
    "blvd",
    "drive",
    "dr",
    "lane",
    "ln",
    "way",
    "place",
    "pl",
    "wharf",
    "square",
    "sq",
    "court",
    "ct",
    "park",
    "hall",
    "monument",
    "mall",
    "pier",
    "dock",
    "landing",
    "circle",
    "row",
}

PROCESS_COMMENTARY_PHRASES = (
    "facts panel",
    "guest ratings are omitted",
    "promotional inclusion lists are omitted",
    "promotional claims are omitted",
    "rather than promotional claims",
    "stays limited to published logistics",
    "when no stable fare exists",
    "source-backed",
    "source limitations",
    "migration logic",
    "schema/pricing",
    "schema description",
    "quality_score",
    "availability_count",
    "longer packing list is not stored",
    "for this boston product",
    "rather than a multi-day package",
    "boston weather, traffic, and transit",
    "checked on the booking calendar rather than restated",
    "the meeting and check-in location, when verified",
    "the meeting point, when verified",
    "stays on the facts panel",
    "any published fare appears only",
)

TRAVEL_TIME_RE = re.compile(
    r"\b\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:hours?|minutes?)\s+from\b",
    re.I,
)
CITY_STATE_RE = re.compile(
    r"\b([A-Z][A-Za-z.'-]{2,}"
    r"(?:\s+(?:del|de|la|los|las)\s+[A-Z][A-Za-z.'-]{2,})?"
    r"(?:\s+[A-Z][A-Za-z.'-]{2,}){0,3}),\s*"
    r"(Vermont|Maine|Massachusetts|New Hampshire|Rhode Island|Connecticut|"
    r"New York|New Jersey|Pennsylvania|Maryland|Virginia|California|Oregon|"
    r"Colorado|Florida|Hawaii|Texas|Washington|Illinois|"
    r"VT|ME|MA|NH|RI|CT|NY|NJ|PA|MD|VA|CA|OR|CO|FL|HI|TX|WA|IL)\b"
)
IN_PLACE_RE = re.compile(
    r"\b(?:in|at|near|outside|located(?:\s+in)?|takes place in|based in|nestled in(?: the woods of)?)\s+"
    r"([A-Z][A-Za-z.'-]{2,}(?:\s+[A-Z][A-Za-z.'-]{2,}){0,3}),\s*"
    r"(Vermont|Maine|Massachusetts|New Hampshire|Rhode Island|Connecticut|New York|"
    r"VT|ME|MA|NH|RI|CT|NY)\b",
    re.I,
)


def slugify(value: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")
    return text


def normalize_space(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip(" ,")


def title_from_slug(slug: str) -> str:
    return " ".join(part.capitalize() for part in slug.split("-") if part)


def normalize_state(value: str | None) -> tuple[str | None, str | None]:
    if not value:
        return None, None
    raw = normalize_space(value).lower().replace(".", "")
    abbr = STATE_NAME_TO_ABBR.get(raw)
    if not abbr:
        return None, None
    return STATE_ABBR_TO_NAME[abbr], abbr


def known_area_cities() -> set[str]:
    cities = set()
    for group in AREA_CITIES_BY_EXPECTED.values():
        cities.update(group)
    return cities


KNOWN_AREA_CITIES = known_area_cities()


SAINT_CITY_TAILS = {"petersburg", "augustine", "pete", "cloud"}


def _is_street_token(part: str, next_part: str | None) -> bool:
    token = part.lower().rstrip(".")
    # "St. Petersburg" is a city, not a street suffix.
    if token == "st" and next_part and next_part.lower().rstrip(".,") in SAINT_CITY_TAILS:
        return False
    return token in STREET_WORDS


def city_from_address_parts(parts: list[str]) -> str | None:
    if not parts:
        return None
    cleaned = [part for part in parts if part.lower().rstrip(".") not in {"us", "usa"}]
    last_street = max(
        (
            index
            for index, part in enumerate(cleaned)
            if _is_street_token(part, cleaned[index + 1] if index + 1 < len(cleaned) else None)
        ),
        default=-1,
    )
    if last_street >= 0:
        cleaned = cleaned[last_street + 1 :]
    if cleaned and cleaned[0][:1].isdigit():
        return None
    if not cleaned or cleaned[0].lower().rstrip(".") in STREET_WORDS:
        return None
    for size in (3, 2, 1):
        if len(cleaned) >= size:
            tail = " ".join(cleaned[-size:]).lower()
            if tail in KNOWN_AREA_CITIES:
                return " ".join(cleaned[-size:])
    if len(cleaned) > 3:
        return None
    return " ".join(cleaned)


def normalize_city(value: str | None) -> str | None:
    city = normalize_space(value)
    if not city:
        return None
    city = re.sub(r"\b(MA|Massachusetts)\b", "", city, flags=re.I).strip(" ,")
    parsed = city_from_address_parts(city.split())
    if not parsed or parsed.lower() in STREET_WORDS:
        return None
    lowered = parsed.lower().replace(".", "")
    if lowered == "st petersburg" or lowered.endswith(" st petersburg"):
        return "St. Petersburg"
    if lowered == "st augustine" or lowered.endswith(" st augustine"):
        return "St. Augustine"
    return parsed


def parse_city_state(text: str | None) -> dict | None:
    blob = normalize_space(text)
    if not blob:
        return None
    parsed_rows = []
    for match in CITY_STATE_RE.finditer(blob):
        city = normalize_city(match.group(1))
        state_name, abbr = normalize_state(match.group(2))
        if not city or not state_name:
            continue
        if city.lower() in STREET_WORDS:
            continue
        parsed_rows.append(
            {
                "city": city,
                "state": state_name,
                "stateAbbr": abbr,
                "citySlug": slugify(city),
                "stateSlug": slugify(state_name),
                "raw": match.group(0),
            }
        )
    if not parsed_rows:
        return None
    return parsed_rows[0]


def city_in_area(city: str | None, expected_state_slug: str, expected_city_slug: str) -> bool:
    if not city:
        return False
    key = (expected_state_slug, expected_city_slug)
    area = AREA_CITIES_BY_EXPECTED.get(key)
    if area:
        return city.lower() in area
    return slugify(city) == expected_city_slug


def collect_place_signals(
    *,
    meeting: str | None = None,
    item_location: str | None = None,
    location_address: str | None = None,
    headline: str | None = None,
    title: str | None = None,
    description: str | None = None,
    start_city: str | None = None,
    start_province: str | None = None,
    start_lat: float | None = None,
    start_lng: float | None = None,
) -> list[dict]:
    signals: list[dict] = []
    strong_fields = (
        ("meeting_point", meeting),
        ("item_location", item_location),
        ("location_address", location_address),
        ("title", title),
        ("headline", headline),
    )
    for source, value in strong_fields:
        parsed = parse_city_state(value)
        if parsed:
            signals.append({**parsed, "source": source, "weight": "strong"})
    for match in IN_PLACE_RE.finditer(description or ""):
        parsed = parse_city_state(f"{match.group(1)}, {match.group(2)}")
        if parsed:
            signals.append({**parsed, "source": "description", "weight": "medium"})
    start_parsed = None
    if start_city:
        start_parsed = parse_city_state(f"{start_city}, {start_province or ''}")
        if not start_parsed:
            state_name, abbr = normalize_state(start_province)
            city = normalize_city(start_city)
            if city and state_name:
                start_parsed = {
                    "city": city,
                    "state": state_name,
                    "stateAbbr": abbr,
                    "citySlug": slugify(city),
                    "stateSlug": slugify(state_name),
                    "raw": f"{start_city}, {start_province}",
                }
        if start_parsed:
            start_parsed.update(
                {
                    "source": "company_start_location",
                    "weight": "weak",
                    "lat": start_lat,
                    "lng": start_lng,
                }
            )
            signals.append(start_parsed)
    return signals


def choose_authoritative_place(
    signals: Iterable[dict],
    *,
    expected_state_slug: str | None = None,
    expected_city_slug: str | None = None,
) -> dict | None:
    items = list(signals)
    strong = [item for item in items if item.get("weight") == "strong"]
    if strong:
        for source in (
            "meeting_point",
            "item_location",
            "location_address",
            "title",
            "headline",
        ):
            for item in strong:
                if item.get("source") == source:
                    return item
        return strong[0]
    medium = [item for item in items if item.get("weight") == "medium"]
    if medium:
        if expected_state_slug:
            in_area = [
                item
                for item in medium
                if item["stateSlug"] == expected_state_slug
                and city_in_area(
                    item["city"], expected_state_slug, expected_city_slug or ""
                )
            ]
            if in_area:
                return in_area[0]
            out_of_state = [
                item for item in medium if item["stateSlug"] != expected_state_slug
            ]
            if out_of_state:
                return out_of_state[0]
            return None
        return medium[0]
    weak = [item for item in items if item.get("weight") == "weak"]
    return weak[0] if weak else None


def assess_geography(
    *,
    expected: dict,
    catalog_destinations: dict[tuple[str, str], dict],
    signals: list[dict],
) -> dict:
    expected_city = expected.get("city") or ""
    expected_state = expected.get("state") or ""
    expected_city_slug = expected.get("citySlug") or slugify(expected_city)
    expected_state_slug = expected.get("stateSlug") or slugify(expected_state)
    place = choose_authoritative_place(
        signals,
        expected_state_slug=expected_state_slug,
        expected_city_slug=expected_city_slug,
    )
    if not place:
        return {
            "disposition": "keep",
            "conflictsWithExpected": False,
            "city": expected_city,
            "state": expected_state,
            "citySlug": expected_city_slug,
            "stateSlug": expected_state_slug,
            "reason": "no contradictory source geography; not inferred from the bucket alone",
            "place": None,
            "signals": signals,
        }

    same_state = place["stateSlug"] == expected_state_slug
    in_area = same_state and city_in_area(
        place["city"], expected_state_slug, expected_city_slug
    )
    if in_area:
        return {
            "disposition": "keep",
            "conflictsWithExpected": False,
            "city": expected_city,
            "state": expected_state,
            "citySlug": expected_city_slug,
            "stateSlug": expected_state_slug,
            "reason": f"{place['city']}, {place['state']} belongs to the {expected_city} area via {place['source']}",
            "place": place,
            "signals": signals,
        }

    dest_key = (place["stateSlug"], place["citySlug"])
    dest = catalog_destinations.get(dest_key)
    if dest:
        return {
            "disposition": "moved",
            "conflictsWithExpected": True,
            "city": dest.get("city") or place["city"],
            "state": dest.get("state") or place["state"],
            "citySlug": dest["citySlug"] if "citySlug" in dest else place["citySlug"],
            "stateSlug": dest["stateSlug"] if "stateSlug" in dest else place["stateSlug"],
            "reason": (
                f"{place['city']}, {place['state']} from {place['source']} does not belong to "
                f"{expected_city}; moved to existing /{place['stateSlug']}/{place['citySlug']}"
            ),
            "place": place,
            "signals": signals,
        }

    return {
        "disposition": "exclude",
        "conflictsWithExpected": True,
        "city": place["city"],
        "state": place["state"],
        "citySlug": place["citySlug"],
        "stateSlug": place["stateSlug"],
        "reason": (
            f"{place['city']}, {place['state']} from {place['source']} does not belong to "
            f"{expected_city}, and no matching public destination exists"
        ),
        "place": place,
        "signals": signals,
    }


def strip_markdown(text: str) -> str:
    cleaned = re.sub(r"^#+\s*", "", text or "", flags=re.M)
    cleaned = re.sub(r"[*_`>#]+", " ", cleaned)
    return normalize_space(cleaned)


def is_natural_place_name(name: str, source_text: str) -> bool:
    text = normalize_space(name)
    if not text or len(text) < 4 or len(text) > 48:
        return False
    if re.search(r"[.#*_/]|: ", text):
        return False
    words = text.split()
    if not (1 <= len(words) <= 5):
        return False
    if words[0].lower().strip(":,") in HEADING_STOPWORDS:
        return False
    if any(word.lower().strip(":,") in HEADING_ANY_WORDS for word in words):
        return False
    if any(word.lower().rstrip(".") in STREET_WORDS for word in words):
        return False
    haystack = strip_markdown(source_text)
    if not re.search(rf"\b{re.escape(text)}\b", haystack):
        return False
    return True


def normalize_activity_duration(raw: str | None, description: str | None = None) -> str | None:
    text = normalize_space(raw)
    if text and TRAVEL_TIME_RE.search(text):
        text = ""
    compact = re.fullmatch(r"(\d+(?:\.\d+)?)h", text or "", re.I)
    if compact:
        text = f"{compact.group(1)} hours"
    compact_range = re.fullmatch(
        r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)h", text or "", re.I
    )
    if compact_range:
        text = f"{compact_range.group(1)}-{compact_range.group(2)} hours"
    if text:
        match = re.search(
            r"\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:hours?|minutes?)",
            text,
            re.I,
        )
        if match:
            return match.group(0)
        if len(re.findall(r"[A-Za-z0-9']+", text)) <= 4 and re.search(
            r"\d|\b(?:hour|minute|day)s?\b", text, re.I
        ):
            return text
    desc = strip_markdown(description or "")
    desc = TRAVEL_TIME_RE.sub(" ", desc)
    match = re.search(
        r"\b(?:duration|length|lasts?)\b[^\n.]{0,40}?(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:hours?|minutes?))",
        desc,
        re.I,
    )
    if match:
        return match.group(1)
    return None


def editorial_errors(text: str, *, expected_city: str | None = None, geography=None) -> list[str]:
    errors = []
    lowered = (text or "").lower()
    for phrase in PROCESS_COMMENTARY_PHRASES:
        if phrase in lowered:
            errors.append(f"process commentary: {phrase}")
    if re.search(r"\binclude About [A-Z]", text or "") or re.search(
        r"\bAbout Nestled\b", text or ""
    ):
        errors.append("malformed extracted fragment in named-place list")
    if re.search(
        r"\b[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)+\. (?:She|He|This|What|Please|It|There's)\b",
        text or "",
    ):
        errors.append("malformed keyword fragment")
    geo = geography or {}
    if (
        expected_city
        and geo.get("conflictsWithExpected")
        and f"takes place in {expected_city.lower()}" in lowered
    ):
        errors.append(f"copy locates the outing in {expected_city} despite conflicting source geography")
    return errors
