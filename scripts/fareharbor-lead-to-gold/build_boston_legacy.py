#!/usr/bin/env python3
"""Build Stage C Boston legacy products from stored harvest artifacts.

Reuses Stage B extractors, price authority, and validation. Does not call FareHarbor.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from build_stage_b_proof import (
    MARKETING,
    SECOND_PERSON,
    clean_text,
    duration_iso,
    endpoint_ok,
    extract_price,
    factual_sentences,
    field,
    format_money,
    glean_facts,
    list_values,
    price_rows,
    restriction_lines,
    schema_amount,
    shingles,
    unwrap_content,
    validate,
    word_count,
)
from inventory_boston import inventory
from tripadvisor_ratings import (
    google_review_pair,
    parse_tripadvisor_rating,
    ratings_payload_item_id,
)
from florida_winter import FLORIDA_WINTER_CITY_SLUGS, apply_winter_cohort
from editorial_voice import (
    activity_contradiction_errors,
    compose_editorial,
    contrast_padding_errors,
    count_words,
    editorial_substance_errors,
    invented_food_walk_errors,
    load_editorial_sample,
    paragraphs_without_contrast,
    is_scraped_heading_highlight,
    is_structural_label,
    section_label_leak_errors,
    split_sentences,
    template_artifact_errors,
    usable_regenerated_copy,
)
from source_priority import (
    collect_authoritative_source,
    itinerary_stops,
    prose_for_overlap,
    source_can_support_full_editorial,
)
from image_integrity import (
    hero_gallery_duplicate_errors,
    item_owned_image_urls,
    prefetch,
    select_visible_gallery,
)
from migration_integrity import (
    assess_geography,
    collect_place_signals,
    editorial_errors,
    is_natural_place_name,
    normalize_activity_duration,
    slugify,
    strip_markdown,
)

ROOT = Path(__file__).resolve().parents[2]
CITY_PROFILES = {
    "boston": {
        "city": "Boston",
        "state": "Massachusetts",
        "stateSlug": "massachusetts",
        "exportName": "fareHarborBostonLegacyProducts",
        "generatedName": "fareharborBostonLegacy.generated.ts",
        "editorialSample": ROOT
        / "scripts"
        / "fareharbor-lead-to-gold"
        / "boston_editorial_sample.json",
        "publishUnpriced": True,
    },
    "chicago": {
        "city": "Chicago",
        "state": "Illinois",
        "stateSlug": "illinois",
        "exportName": "fareHarborChicagoLegacyProducts",
        "generatedName": "fareharborChicagoLegacy.generated.ts",
        "editorialSample": None,
        "publishUnpriced": False,
    },
    "los-angeles": {
        "city": "Los Angeles",
        "state": "California",
        "stateSlug": "california",
        "exportName": "fareHarborLosAngelesLegacyProducts",
        "generatedName": "fareharborLosAngelesLegacy.generated.ts",
        "editorialSample": None,
        "publishUnpriced": False,
    },
}
CITY_SLUG = "boston"
CITY_NAME = CITY_PROFILES[CITY_SLUG]["city"]
STATE_NAME = CITY_PROFILES[CITY_SLUG]["state"]
STATE_SLUG = CITY_PROFILES[CITY_SLUG]["stateSlug"]
EXPORT_NAME = CITY_PROFILES[CITY_SLUG]["exportName"]
HARVEST_ROOT = ROOT / "data" / "fareharbor-lead-to-gold" / CITY_SLUG
HARVEST_REPORT = (
    ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{CITY_SLUG}-harvest.json"
)
REPORT_JSON = (
    ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{CITY_SLUG}-proof.json"
)
REPORT_MD = ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{CITY_SLUG}-proof.md"
GENERATED_TS = ROOT / "src" / "data" / CITY_PROFILES[CITY_SLUG]["generatedName"]
GEOGRAPHY_TS = ROOT / "src" / "utils" / "fareharbor" / "geographyReview.generated.ts"
TERMINAL_TS = ROOT / "src" / "utils" / "fareharbor" / "stageBTerminalBookingPages.ts"
UNPRICED_TS = (
    ROOT / "src" / "utils" / "fareharbor" / "unpublishedUnpricedProducts.generated.ts"
)
EDITORIAL_SAMPLE = CITY_PROFILES[CITY_SLUG]["editorialSample"]
PUBLISH_UNPRICED = bool(CITY_PROFILES[CITY_SLUG]["publishUnpriced"])

LANG = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
    "ru": "Russian",
    "de": "German",
    "pt": "Portuguese",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "zh-cn": "Chinese",
    "zh-tw": "Chinese",
}

STREET_RE = re.compile(
    r"\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+"
    r"(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl|Wharf)\b",
    re.I,
)
PROPER_RE = re.compile(r"\b(?:[A-Z][A-Za-z0-9'&.-]+(?:\s+[A-Z][A-Za-z0-9'&.-]+){1,5})\b")
MEASURE_RE = re.compile(
    r"\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:hours?|minutes?|miles?|km|feet|foot|guests?|people|passengers?)\b",
    re.I,
)
FILESTACK_RE = re.compile(r"https://cdn\.filestackcontent\.com/([A-Za-z0-9]+)")
EDITORIAL_BY_ID = load_editorial_sample(EDITORIAL_SAMPLE) if EDITORIAL_SAMPLE else {}


def synthesized_city_profile(city_slug: str) -> dict:
    """Build a data-only profile from the catalog destination. No city-specific prose."""
    payload = inventory(city_slug)
    products = payload.get("products") or []
    if not products:
        known = ", ".join(sorted(CITY_PROFILES))
        raise SystemExit(
            f"unsupported FareHarbor city {city_slug}; no catalog products. known profiles: {known}"
        )
    destination = products[0].get("destination") or {}
    parts = "".join(part.capitalize() for part in city_slug.split("-") if part)
    return {
        "city": destination.get("city") or city_slug,
        "state": destination.get("state") or "",
        "stateSlug": destination.get("stateSlug") or "",
        "exportName": f"fareHarbor{parts}LegacyProducts",
        "generatedName": f"fareharbor{parts}Legacy.generated.ts",
        "editorialSample": None,
        "publishUnpriced": False,
    }


PREVIOUS_RUNTIME: dict[str, dict] = {}
REGENERATE_ITEM_IDS: set[str] = set()


def configure_city(city_slug: str) -> None:
    """Point the shared builder at one city. Boston remains the default."""
    global CITY_SLUG, CITY_NAME, STATE_NAME, STATE_SLUG, EXPORT_NAME
    global HARVEST_ROOT, HARVEST_REPORT, REPORT_JSON, REPORT_MD, GENERATED_TS
    global EDITORIAL_SAMPLE, EDITORIAL_BY_ID, PUBLISH_UNPRICED
    global PREVIOUS_RUNTIME, REGENERATE_ITEM_IDS
    PREVIOUS_RUNTIME = {}
    REGENERATE_ITEM_IDS = set()
    profile = CITY_PROFILES.get(city_slug) or synthesized_city_profile(city_slug)
    CITY_SLUG = city_slug
    CITY_NAME = profile["city"]
    STATE_NAME = profile["state"]
    STATE_SLUG = profile["stateSlug"]
    EXPORT_NAME = profile["exportName"]
    HARVEST_ROOT = ROOT / "data" / "fareharbor-lead-to-gold" / city_slug
    HARVEST_REPORT = (
        ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{city_slug}-harvest.json"
    )
    REPORT_JSON = (
        ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{city_slug}-proof.json"
    )
    REPORT_MD = (
        ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{city_slug}-proof.md"
    )
    GENERATED_TS = ROOT / "src" / "data" / profile["generatedName"]
    EDITORIAL_SAMPLE = profile["editorialSample"]
    EDITORIAL_BY_ID = load_editorial_sample(EDITORIAL_SAMPLE) if EDITORIAL_SAMPLE else {}
    PUBLISH_UNPRICED = bool(profile["publishUnpriced"])


def load_json(path: Path):
    return json.loads(path.read_text())


def source_blob(folder: Path) -> str:
    chunks = []
    for name in ("content.json", "structured-description.json", "item.json"):
        path = folder / name
        if not path.exists():
            continue
        raw = load_json(path)
        data = unwrap_content(raw)
        if isinstance(data, dict) and "error" not in data:
            chunks.append(json.dumps(data, ensure_ascii=False))
        elif isinstance(raw, dict) and "error" not in raw:
            chunks.append(json.dumps(raw, ensure_ascii=False))
    return " ".join(chunks)


def languages(payloads: list[dict]) -> list[str]:
    names = []
    for payload in payloads:
        entries = payload.get("guided_languages") or []
        if not isinstance(entries, list):
            continue
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            codes = []
            if entry.get("language_code"):
                codes.append(entry["language_code"])
            for code in entry.get("languages") or []:
                codes.append(code)
            for code in codes:
                label = LANG.get(str(code).lower())
                if label and label not in names:
                    names.append(label)
    return names


def activity_phrase(title: str) -> str:
    text = title.lower()
    if re.search(r"bike|bicycle|cycling|e-bike|scooter", text):
        return "bicycle outing"
    if re.search(r"kayak|paddle|canoe", text):
        return "paddle outing"
    if re.search(r"sail|yacht|cruise|harbor|boat|ferry", text):
        return "harbor outing"
    if re.search(r"food|taste|dumpling|dinner|brunch|lunch|cannoli|beer|wine|chocolate", text):
        return "food walk"
    if re.search(r"photo", text):
        return "photography walk"
    if re.search(r"ghost|haunt", text):
        return "evening walking tour"
    if re.search(r"walk|trail|foot|history|heritage|architecture", text):
        return "walking tour"
    return "guided outing"


def format_meeting(raw: str | None) -> str | None:
    if not raw:
        return None
    text = clean_text(raw)
    text = re.sub(r"\bUS\b", "", text)
    text = re.sub(r"\s+,", ",", text)
    text = re.sub(r"\s{2,}", " ", text).strip(" ,")
    text = re.sub(r",?\s*United States$", "", text, flags=re.I)
    if re.fullmatch(r"tbd|n/?a|none|null|unknown", text, re.I):
        return None
    return text or None


def street_fragments(meeting: str | None) -> list[str]:
    if not meeting:
        return []
    found = [match.group(0) for match in STREET_RE.finditer(meeting)]
    number = re.match(r"\d+[A-Za-z]?", meeting)
    if number:
        found.append(number.group(0))
    return found


def strip_addresses(text: str, meeting: str | None) -> str:
    next_text = text
    if meeting:
        next_text = re.sub(re.escape(meeting), "", next_text, flags=re.I)
        match = STREET_RE.search(meeting)
        if match and len(match.group(0).split()) >= 2:
            next_text = re.sub(re.escape(match.group(0)), "", next_text, flags=re.I)
    next_text = re.sub(r"\s{2,}", " ", next_text)
    next_text = re.sub(r"\s+,", ",", next_text)
    return next_text.strip(" ,")


def unique(items: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in items:
        text = clean_text(item)
        if not text:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(text)
    return result


def harvest_images(
    folder: Path,
    content: dict,
    structured: dict,
    item_raw: dict,
    item_id: str,
) -> list[str]:
    del folder
    payloads = []
    if isinstance(content, dict):
        payloads.append(content)
    if isinstance(structured, dict):
        payloads.append(structured)
    item = item_raw.get("item") if isinstance(item_raw, dict) else None
    if isinstance(item, dict):
        payloads.append(item)
    elif isinstance(item_raw, dict):
        payloads.append(item_raw)
    return item_owned_image_urls(payloads, item_id)


def proper_names(text: str) -> list[str]:
    blocked = {
        "Boston",
        "Massachusetts",
        "United States",
        "Please",
        "This",
        "The Tour",
        "Important Details",
        "See You Soon",
        "What To Bring",
        "Meeting Place",
        "Duration",
        "About",
    }
    names = []
    cleaned = strip_markdown(text or "")
    for match in PROPER_RE.findall(cleaned):
        if MARKETING.search(match) or SECOND_PERSON.search(match):
            continue
        if match in blocked or len(match) < 6:
            continue
        if not is_natural_place_name(match, cleaned):
            continue
        names.append(match)
    return unique(names)[:8]


def measures(text: str) -> list[str]:
    return unique(MEASURE_RE.findall(text or ""))[:6]


def join_and(items: list[str]) -> str:
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def sentence(text: str) -> str:
    text = clean_text(text).strip(" .")
    if not text:
        return ""
    if text[-1] not in ".!":
        text += "."
    return text[0].upper() + text[1:]


def sanitize_sentence(text: str, meeting: str | None, source_text: str) -> str | None:
    text = strip_addresses(text, meeting)
    text = re.sub(r"\$\s?\d[\d,]*\.?\d*", "", text)
    text = re.sub(r"\s{2,}", " ", text).strip()
    if not text or SECOND_PERSON.search(text) or MARKETING.search(text):
        return None
    text = sentence(text)
    if not text:
        return None
    overlap = shingles(text) & shingles(source_text)
    if overlap:
        return None
    return text


def short_tokens(items: list[str], limit: int = 6) -> list[str]:
    kept = []
    for item in items:
        words = re.findall(r"[A-Za-z0-9']+", item)
        if not words:
            continue
        if len(words) > 6:
            continue
        if MARKETING.search(item) or SECOND_PERSON.search(item):
            continue
        kept.append(item.rstrip(" ."))
        if len(kept) == limit:
            break
    return kept


def notice_hours(text: str | None) -> str | None:
    if not text:
        return None
    match = re.search(r"(\d+)\s*-?\s*hours?", text, re.I)
    if match:
        return match.group(1)
    return None


def compose_copy(
    catalog: dict, facts: dict, source_text: str, geography: dict
) -> tuple[list[str], list[str], list[str]]:
    title = clean_text(catalog["title"])
    operator = clean_text(catalog["operator"])
    activity = activity_phrase(title)
    duration = facts.get("duration")
    group = facts.get("groupSize")
    meeting = facts.get("meetingAddress")
    included = short_tokens(facts.get("included") or [], 6)
    excluded = short_tokens(facts.get("excluded") or [], 4)
    itinerary = [
        token
        for token in short_tokens(facts.get("itinerary") or [], 4)
        if is_natural_place_name(token, source_text)
    ]
    source_highlights = [
        token
        for token in short_tokens(facts.get("highlights") or [], 4)
        if is_natural_place_name(token, source_text)
    ]
    bring = short_tokens(facts.get("bring") or [], 5)
    names = [
        name
        for name in (facts.get("properNames") or [])
        if len(name.split()) <= 4 and is_natural_place_name(name, source_text)
    ][:5]
    langs = facts.get("languages") or []
    min_age = facts.get("minAge")
    max_age = facts.get("maxAge")
    access = facts.get("accessibility")
    cancel_hours = notice_hours(facts.get("cancellation"))
    rain = bool(
        re.search(
            r"rain or shine",
            " ".join(facts.get("restrictions") or []) + " " + (facts.get("cancellation") or ""),
            re.I,
        )
    )
    place = geography.get("place") or {}
    city = place.get("city") or (
        geography.get("city") if geography.get("disposition") == "moved" else None
    )
    state = place.get("state") or (
        geography.get("state") if geography.get("disposition") == "moved" else None
    )

    drafts: list[str] = []
    if duration and city and state:
        drafts.append(f"This {activity} lasts {duration} and takes place in {city}, {state}.")
    elif city and state:
        drafts.append(f"This {activity} takes place in {city}, {state}.")
    elif duration:
        drafts.append(f"This {activity} lasts {duration}.")
    else:
        drafts.append(f"This {activity} is listed by {operator}." if operator else f"This {activity} is listed.")
    if operator:
        drafts.append(f"{operator} is the listed operator.")
    if group:
        drafts.append(f"Published group size for this outing is {group.rstrip('.')}.")
    if langs:
        drafts.append(
            f"Guided-language options listed for this product include {join_and(langs)}."
        )
    site_bits = unique(names + itinerary + source_highlights)
    if site_bits:
        drafts.append(
            f"Named places and short route labels for this outing include {join_and(site_bits[:6])}."
        )
    if included:
        drafts.append(f"Short listed inclusions include {join_and(included)}.")
    if excluded:
        drafts.append(f"Short listed exclusions include {join_and(excluded)}.")
    age_bits = []
    if min_age not in (None, ""):
        age_bits.append(f"minimum age {min_age}")
    if max_age not in (None, ""):
        age_bits.append(f"maximum age {max_age}")
    if age_bits:
        drafts.append(f"Published age limits are {join_and(age_bits)}.")
    if bring:
        drafts.append(f"Short listed items to bring include {join_and(bring)}.")
    if rain:
        drafts.append("Published notes say the outing is held in ordinary rain as well as clear weather.")
    if access and len(re.findall(r"[A-Za-z0-9']+", access)) <= 16:
        drafts.append(f"Accessibility note: {access.rstrip('.')}.")
    if cancel_hours:
        drafts.append(
            f"The published cancellation note mentions a {cancel_hours}-hour notice window."
        )

    kept = []
    for draft in drafts:
        cleaned = sanitize_sentence(draft, meeting, source_text)
        if cleaned:
            kept.append(cleaned)

    if len(kept) <= 3:
        paragraphs = kept
    else:
        third = max(1, len(kept) // 3)
        paragraphs = [
            " ".join(kept[:third]),
            " ".join(kept[third : third * 2]),
            " ".join(kept[third * 2 :]),
        ]
        paragraphs = [part for part in paragraphs if part.strip()]

    highlight_rows = []
    if duration and city:
        highlight_rows.append(f"{duration} {activity} in {city}")
    elif duration:
        highlight_rows.append(f"{duration} {activity}")
    if names:
        highlight_rows.append(f"Named places include {join_and(names[:2])}")
    if included:
        highlight_rows.append(f"Short inclusions include {included[0]}")
    if not highlight_rows and city:
        highlight_rows.append(f"{city} {activity}")

    removed = [
        "Catalog quality_score and availability_count were not treated as ratings.",
        "Marketing headlines and structured-description pricing prose were not used as Offer prices.",
        "Process commentary about omitted lists, ratings, schema, and facts-panel behavior was not used as page copy.",
    ]
    if meeting:
        removed.append("Verified meeting and check-in details stay in the facts panel.")
    if geography.get("conflictsWithExpected"):
        removed.append(geography.get("reason") or "Source geography does not match the legacy city bucket.")
    return paragraphs, highlight_rows[:3], removed


def normalize_duration(raw: str | None) -> str | None:
    if not raw:
        return None
    text = clean_text(raw)
    match = re.search(
        r"\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:hours?|minutes?)",
        text,
        re.I,
    )
    if match:
        return match.group(0)
    if len(re.findall(r"[A-Za-z0-9']+", text)) <= 4:
        return text
    return None


def extract_facts(
    usable: list[dict],
    source_text: str,
    item: dict | None = None,
    authoritative: dict | None = None,
) -> dict:
    item = item or {}
    raw_description = field(usable, "description") or ""
    if not isinstance(raw_description, str):
        raw_description = ""
    structured_duration = clean_text(field(usable, "duration")) or None
    description = clean_text(raw_description)
    if authoritative and authoritative.get("description"):
        description = authoritative["description"]
    # Headings such as "## Duration" are removed from customer prose. Read the
    # raw source only when that cleaned prose no longer contains a duration.
    duration = normalize_activity_duration(structured_duration, description)
    if not duration and raw_description:
        duration = normalize_activity_duration(None, raw_description)
    meeting = field(usable, "meeting_point")
    meeting_address = None
    if isinstance(meeting, dict):
        meeting_address = format_meeting(meeting.get("address"))
    elif isinstance(meeting, str):
        meeting_address = format_meeting(meeting)
    if not meeting_address:
        meeting_address = format_meeting(field(usable, "location_address"))
    start = item.get("start_location") if isinstance(item.get("start_location"), dict) else {}
    included = []
    excluded = []
    itinerary = []
    route_notes = []
    highlights = []
    restrictions = []
    bring = []
    glean_source = []
    for payload in usable:
        item_included = list_values(payload.get("what_is_included_items"))
        included.extend(item_included or list_values(payload.get("what_is_included")))
        item_excluded = list_values(payload.get("what_is_not_included_items"))
        excluded.extend(item_excluded or list_values(payload.get("what_is_not_included")))
        itinerary.extend(itinerary_stops(payload.get("itinerary")))
        raw_itinerary = payload.get("itinerary")
        if isinstance(raw_itinerary, str):
            route_text = clean_text(raw_itinerary)
            if word_count([route_text]) >= 8:
                route_notes.append(route_text)
        highlights.extend(list_values(payload.get("highlights")))
        restrictions.extend(restriction_lines(payload.get("restrictions")))
        bring.extend(list_values(payload.get("what_to_bring_items") or payload.get("what_to_bring")))
        glean_source.append(clean_text(payload.get("description") or ""))
        glean_source.append(clean_text(payload.get("what_is_included") or ""))
    cancellation = clean_text(field(usable, "cancellation_summary")) or None
    if cancellation and (MARKETING.search(cancellation) or SECOND_PERSON.search(cancellation)):
        cancellation = None
    accessibility = clean_text(field(usable, "accessibility")) or None
    if accessibility and (MARKETING.search(accessibility) or SECOND_PERSON.search(accessibility)):
        accessibility = None
    return {
        "duration": duration,
        "meetingAddress": meeting_address,
        "itemLocation": format_meeting(item.get("location")) if item.get("location") else None,
        "headline": clean_text(item.get("headline") or field(usable, "headline") or "") or None,
        "startCity": start.get("city"),
        "startProvince": start.get("province"),
        "startLat": start.get("latitude"),
        "startLng": start.get("longitude"),
        "minAge": field(usable, "min_age"),
        "maxAge": field(usable, "max_age"),
        "groupSize": clean_text(field(usable, "group_size")).strip(" .") or None,
        "included": unique(included)[:8],
        "excluded": unique(excluded)[:6],
        "itinerary": unique((authoritative or {}).get("itinerary") or itinerary)[:18],
        "routeNotes": unique(route_notes)[:4],
        "highlights": unique(highlights)[:6],
        "restrictions": unique(restrictions)[:4],
        "bring": unique(bring)[:5],
        "cancellation": cancellation,
        "accessibility": accessibility,
        "languages": languages(usable),
        "factualSentences": factual_sentences(description),
        "gleanedFacts": unique(glean_facts(" ".join(glean_source)))[:6],
        "properNames": proper_names(description),
        "measures": measures(description + " " + " ".join(included)),
        "description": (authoritative or {}).get("description") or description,
        "detailsText": (authoritative or {}).get("detailsText") or "",
        "sourceUsed": (authoritative or {}).get("sourceUsed") or "",
    }


def short_missing_copy(title: str, operator: str | None = None) -> list[str]:
    if operator:
        return [f"The operator {operator} lists this outing."]
    return ["The outing is listed."]


def schema_from_paragraphs(paragraphs: list[str], facts: dict, title: str, exception: str, geography: dict) -> str:
    if exception in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND", "INSUFFICIENT_SOURCE_CONTENT"}:
        return " ".join(paragraphs).strip()
    duration = facts.get("duration")
    activity = activity_phrase(title)
    names = [
        name
        for name in (facts.get("properNames") or [])
        if len(name.split()) <= 4
    ][:3]
    place = geography.get("place") or {}
    city = place.get("city") or (
        geography.get("city") if geography.get("disposition") == "moved" else None
    )
    bits = []
    if city:
        bits.append(f"This {activity} takes place in {city}.")
    else:
        bits.append(f"This {activity} is a published outing.")
    if duration:
        bits.append(f"Published length is {duration}.")
    if names:
        bits.append(f"Named places include {join_and(names)}.")
    text = " ".join(bits)
    text = strip_addresses(text, facts.get("meetingAddress"))
    text = re.sub(r"\$\s?\d[\d,]*\.?\d*", "", text)
    words = word_count([text])
    if words > 80:
        text = " ".join(text.split()[:75]).rstrip(".,") + "."
    return clean_text(text)


def empty_facts() -> dict:
    return {
        "duration": None,
        "meetingAddress": None,
        "itemLocation": None,
        "headline": None,
        "startCity": None,
        "startProvince": None,
        "startLat": None,
        "startLng": None,
        "included": [],
        "excluded": [],
        "itinerary": [],
        "highlights": [],
        "restrictions": [],
        "bring": [],
        "cancellation": None,
        "accessibility": None,
        "languages": [],
        "factualSentences": [],
        "gleanedFacts": [],
        "properNames": [],
        "measures": [],
        "minAge": None,
        "maxAge": None,
        "groupSize": None,
        "description": "",
        "detailsText": "",
        "sourceUsed": "",
    }


def tripadvisor_rating(folder: Path, meta: dict, company: str, item_id: str) -> tuple[dict | None, str]:
    endpoint = (
        f"https://fareharbor.com/api/v1/companies/{company}/items/{item_id}/ratings/"
    )
    record = (meta.get("endpoints") or {}).get("ratings") or {}
    path = folder / "ratings.json"
    absent = (
        f"The FareHarbor ratings endpoint {endpoint} did not include a TripAdvisor "
        "rating and review count in ratings.tripadvisor.rating and "
        "ratings.tripadvisor.num_reviews. rating_image_url was not used. Google "
        "reviews were not substituted. Catalog quality_score and availability_count "
        "were not used. AggregateRating is omitted."
    )
    if record.get("status") != 200 or not path.exists():
        return None, absent
    payload = load_json(path)
    bound_item = ratings_payload_item_id(payload)
    if bound_item and bound_item != str(item_id):
        return None, (
            f"The FareHarbor ratings endpoint {endpoint} returned item pk {bound_item}, "
            f"which does not match item {item_id}. AggregateRating is omitted."
        )
    parsed = parse_tripadvisor_rating(payload)
    if parsed:
        provenance = (
            f"TripAdvisor rating {parsed['ratingValue']} from {parsed['reviewCount']} reviews "
            f"on GET {endpoint} fields ratings.tripadvisor.rating and "
            "ratings.tripadvisor.num_reviews. rating_image_url was not used to infer the score. "
            "Google reviews were not substituted. Catalog quality_score and availability_count "
            "were not used."
        )
        return parsed, provenance
    google = google_review_pair(payload)
    if google:
        parsed = {**google, "provider": "Google"}
        provenance = (
            f"Google rating {parsed['ratingValue']} from {parsed['reviewCount']} reviews "
            f"on GET {endpoint} fields ratings.google_reviews.rating and "
            "ratings.google_reviews.user_ratings_total. TripAdvisor was absent, so this "
            "pair stays attributed to Google. rating_image_url was not used. Catalog "
            "quality_score and availability_count were not used."
        )
        return parsed, provenance
    return None, absent


def choose_product_image(catalog_hero: str | None, owned: list[str]) -> str | None:
    """Prefer the catalog hero only when that file belongs to this item."""
    hero = (catalog_hero or "").strip()
    if hero and hero in owned:
        return hero
    return owned[0] if owned else None


def copy_is_grounded(
    paragraphs: list[str],
    highlights: list[str],
    schema: str,
    title: str,
    description: str,
) -> bool:
    blobs = [*(paragraphs or []), *(highlights or [])]
    if schema:
        blobs.append(schema)
    if section_label_leak_errors(blobs):
        return False
    if invented_food_walk_errors(blobs, title, description):
        return False
    if activity_contradiction_errors(paragraphs or [], title, description):
        return False
    if contrast_padding_errors([*(paragraphs or []), schema or ""], description):
        return False
    if template_artifact_errors(blobs):
        return False
    return word_count(paragraphs or []) >= 100


def restore_grounded_editorial(catalog: dict, description: str):
    """Keep prose that already passes the shared checks.

    Products whose previous copy was shared with an unrelated item are
    regenerated. Heading leaks and invented food-walk framing are regenerated.
    """
    if str(catalog.get("itemId")) in REGENERATE_ITEM_IDS:
        return None
    previous = PREVIOUS_RUNTIME.get(str(catalog.get("itemId")))
    if not previous or previous.get("exceptionStatus") != "OK":
        return None
    paragraphs = list(previous.get("paragraphs") or [])
    highlights = list(previous.get("highlights") or [])
    schema = previous.get("schemaDescription") or ""
    if not copy_is_grounded(
        paragraphs,
        highlights,
        schema,
        catalog.get("title") or "",
        description,
    ):
        return None
    return paragraphs, highlights, schema


def load_previous_runtime() -> dict[str, dict]:
    if not GENERATED_TS.exists():
        return {}
    text = GENERATED_TS.read_text()
    marker = f"export const {EXPORT_NAME}: FareHarborProofProduct[] = "
    start = text.find(marker)
    if start < 0:
        return {}
    payload = text[start + len(marker) :].strip()
    if payload.endswith(";"):
        payload = payload[:-1].strip()
    try:
        rows = json.loads(payload)
    except json.JSONDecodeError:
        return {}
    return {str(row["itemId"]): row for row in rows if row.get("itemId")}


def description_for_overlap(company: str, item_id: str) -> str:
    base = ROOT / "data" / "fareharbor-lead-to-gold"
    folders = list(base.glob(f"*/{company}-{item_id}"))
    preferred = HARVEST_ROOT / f"{company}-{item_id}"
    if preferred.exists():
        folders.insert(0, preferred)
    parts = []
    seen = set()
    for folder in folders:
        if folder in seen or not folder.is_dir():
            continue
        seen.add(folder)
        for name in ("structured-description.json", "content.json"):
            path = folder / name
            if not path.exists():
                continue
            raw = load_json(path)
            data = unwrap_content(raw)
            if isinstance(data, dict) and "error" not in data:
                parts.append(clean_text(data.get("description") or ""))
    return "\n".join(part for part in parts if part)


def identical_prose_without_shared_source(rows: dict[str, dict], catalog: dict) -> set[str]:
    """Item ids whose full prose matches another item with no shared source."""
    grouped: dict[str, list[str]] = {}
    for item_id, row in rows.items():
        if row.get("exceptionStatus") != "OK":
            continue
        key = " ".join(row.get("paragraphs") or []).strip()
        if len(key) < 80:
            continue
        grouped.setdefault(key, []).append(item_id)
    forced: set[str] = set()
    for item_ids in grouped.values():
        if len(item_ids) < 2:
            continue
        descriptions = {}
        for item_id in item_ids:
            entry = catalog.get(item_id) or {}
            company = entry.get("company") or rows[item_id].get("company") or ""
            descriptions[item_id] = description_for_overlap(company, item_id)
        borrowed = False
        for index, left in enumerate(item_ids):
            for right in item_ids[index + 1 :]:
                if not (shingles(descriptions[left]) & shingles(descriptions[right])):
                    borrowed = True
                    break
            if borrowed:
                break
        if borrowed:
            forced.update(item_ids)
    return forced


def withhold_unpublished_items(products: list[dict]) -> None:
    """A cleanup rebuild must not add routes that were not already published."""
    if not PREVIOUS_RUNTIME:
        return
    previous_ok = {
        item_id
        for item_id, row in PREVIOUS_RUNTIME.items()
        if row.get("exceptionStatus") == "OK"
    }
    for product in products:
        if product["exceptionStatus"] != "OK" or product["itemId"] in previous_ok:
            continue
        product["exceptionStatus"] = "INSUFFICIENT_SOURCE_CONTENT"
        product["visiblePriceLabel"] = None
        product["priceRows"] = []
        product["offer"] = None
        product["aggregateRating"] = None
        product["ratingProvenance"] = (
            "This item was not in the published set. A cleanup rebuild does not add a new route."
        )


def unpublish_borrowed_prose(products: list[dict], catalog: dict) -> None:
    rows = {product["itemId"]: product for product in products}
    borrowed = identical_prose_without_shared_source(rows, catalog)
    for product in products:
        if product["itemId"] not in borrowed or product["exceptionStatus"] != "OK":
            continue
        product["exceptionStatus"] = "INSUFFICIENT_SOURCE_CONTENT"
        product["paragraphs"] = short_missing_copy(product["title"], product.get("operator"))
        product["highlights"] = []
        product["wordCount"] = word_count(product["paragraphs"])
        product["schemaDescription"] = " ".join(product["paragraphs"]).strip()
        product["visiblePriceLabel"] = None
        product["priceRows"] = []
        product["offer"] = None
        product["aggregateRating"] = None
        product["ratingProvenance"] = (
            "AggregateRating is omitted because the composed prose matched another "
            "item whose source does not overlap this item."
        )
        product["galleryImages"] = []
        product["productImage"] = None


def public_path_for(geography: dict, slug: str) -> str:
    return f"/destinations/{geography['stateSlug']}/{geography['citySlug']}/tours/{slug}"


def build_product(catalog: dict, booking: dict, catalog_destinations: dict) -> dict:
    folder = HARVEST_ROOT / f"{catalog['company']}-{catalog['itemId']}"
    meta = load_json(folder / "harvest-meta.json")
    content_raw = load_json(folder / "content.json")
    structured_raw = load_json(folder / "structured-description.json")
    item_raw = load_json(folder / "item.json")
    preview = load_json(folder / "price-preview.json")
    content = unwrap_content(content_raw)
    structured = unwrap_content(structured_raw)
    item = item_raw.get("item") if isinstance(item_raw, dict) else None
    if not isinstance(item, dict):
        item = item_raw if isinstance(item_raw, dict) else {}
    if not isinstance(content, dict) or "error" in content:
        content = {}
    if not isinstance(structured, dict) or "error" in structured:
        structured = {}
    usable = []
    if endpoint_ok(meta, "content") and content:
        usable.append(content)
    if endpoint_ok(meta, "structured-description") and structured:
        usable.append(structured)
    source_text = source_blob(folder)
    authoritative = collect_authoritative_source(content, structured, item)
    classification = booking.get("classification")
    if classification == "BOOKING_PAGE_NOT_FOUND":
        exception = "BOOKING_PAGE_NOT_FOUND"
    elif not usable:
        exception = "SOURCE_NOT_FOUND"
    else:
        exception = "OK"

    facts = (
        extract_facts(usable, source_text, item, authoritative) if usable else empty_facts()
    )
    dest = catalog.get("destination") or {}
    geography = assess_geography(
        expected={
            "city": dest.get("city") or CITY_NAME,
            "state": dest.get("state") or STATE_NAME,
            "citySlug": dest.get("citySlug") or CITY_SLUG,
            "stateSlug": dest.get("stateSlug") or STATE_SLUG,
        },
        catalog_destinations=catalog_destinations,
        signals=collect_place_signals(
            meeting=facts.get("meetingAddress"),
            item_location=facts.get("itemLocation"),
            headline=facts.get("headline"),
            title=catalog.get("title"),
            description=facts.get("description"),
            start_city=facts.get("startCity"),
            start_province=facts.get("startProvince"),
            start_lat=facts.get("startLat"),
            start_lng=facts.get("startLng"),
        ),
    )
    public_path = public_path_for(geography, catalog["slug"])
    place_source = " ".join(
        part
        for part in (
            facts.get("description") or "",
            " ".join(facts.get("itinerary") or []),
            facts.get("detailsText") or "",
        )
        if part
    )
    overlap_text = prose_for_overlap(authoritative) or (facts.get("description") or "")
    short_grounded = False
    if exception in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"}:
        paragraphs = short_missing_copy(catalog["title"], catalog.get("operator"))
        highlights = []
        generated_schema = None
        removed = [
            "No public copy was written because the booking page is terminal or no FareHarbor content was stored."
        ]
    else:
        paragraphs, highlights, generated_schema, removed = compose_editorial(
            catalog, facts, place_source or source_text, geography, overlap_text
        )
        overlay = EDITORIAL_BY_ID.get(catalog["itemId"])
        if overlay and word_count(overlay.get("paragraphs") or []) >= 100:
            paragraphs = list(overlay.get("paragraphs") or paragraphs)
            highlights = list(overlay.get("highlights") or highlights)
            if overlay.get("removedClaims"):
                removed = list(overlay["removedClaims"])
            if overlay.get("schemaDescription"):
                generated_schema = overlay["schemaDescription"]
        elif not overlay:
            description = facts.get("description") or ""
            previous = PREVIOUS_RUNTIME.get(str(catalog.get("itemId")))
            restored = restore_grounded_editorial(catalog, description)
            if restored:
                paragraphs, highlights, generated_schema = restored
            elif previous and previous.get("exceptionStatus") == "OK":
                previous_highlights = list(previous.get("highlights") or [])
                kept_highlights = [
                    item
                    for item in previous_highlights
                    if item
                    and not template_artifact_errors([item])
                    and not is_scraped_heading_highlight(item)
                ]
                if kept_highlights:
                    highlights = kept_highlights
                elif not previous_highlights:
                    highlights = []
                source_is_thin = not source_can_support_full_editorial(
                    authoritative, facts
                )
                previous_paragraphs = list(previous.get("paragraphs") or [])
                if (
                    contrast_padding_errors(previous_paragraphs, description)
                    and not template_artifact_errors(previous_paragraphs)
                    and not usable_regenerated_copy(
                        paragraphs,
                        catalog.get("title") or "",
                        description,
                        source_is_thin,
                    )
                ):
                    stripped = paragraphs_without_contrast(
                        previous.get("paragraphs") or [], description
                    )
                    if count_words(stripped) >= 20:
                        paragraphs = stripped
                        if count_words(stripped) < 100:
                            short_grounded = True
                        schema_candidate = previous.get("schemaDescription") or ""
                        if contrast_padding_errors(
                            [schema_candidate], description
                        ) or count_words([schema_candidate]) >= count_words(stripped):
                            chosen_schema = []
                            for piece in split_sentences(" ".join(stripped)):
                                chosen_schema.append(piece)
                                if (
                                    count_words(chosen_schema) >= 8
                                    and count_words(chosen_schema) < count_words(stripped)
                                ):
                                    break
                            generated_schema = (
                                " ".join(chosen_schema) if chosen_schema else " ".join(stripped)
                            )
                        else:
                            generated_schema = schema_candidate
    words = word_count(paragraphs)
    price = (
        extract_price(preview, catalog["itemId"])
        if endpoint_ok(meta, "price-preview")
        else None
    )
    source_supports_full = source_can_support_full_editorial(authoritative, facts)
    # A thin or fact-light source keeps its grounded sentences. Padding them
    # out to 100 words is what produced template stops and fake contrasts.
    description_text = facts.get("description") or ""
    grounded_short = (
        words < 100
        and words >= 20
        and bool(paragraphs)
        and not contrast_padding_errors(paragraphs, description_text)
        and not template_artifact_errors(paragraphs)
    )
    publish_short = (
        exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"}
        and grounded_short
    )
    if (
        exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"}
        and words < 100
        and not source_supports_full
        and not publish_short
    ):
        exception = "INSUFFICIENT_SOURCE_CONTENT"
        price = None
        paragraphs = short_missing_copy(catalog["title"], catalog.get("operator"))
        highlights = []
        words = word_count(paragraphs)
        generated_schema = " ".join(paragraphs).strip()
        removed = [
            "No public experience copy was written because structured description, booking details, itinerary, and inclusions cannot support 100 words of specific prose without invention."
        ]
    elif exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"} and price is None:
        exception = "PRICE_NOT_FOUND"
    elif exception == "BOOKING_PAGE_NOT_FOUND":
        price = None

    if exception == "INSUFFICIENT_SOURCE_CONTENT" and generated_schema != " ".join(paragraphs).strip():
        generated_schema = " ".join(paragraphs).strip()

    owned_images = harvest_images(
        folder, content, structured, item_raw, catalog["itemId"]
    )
    owned_images = [url for url in owned_images if url in source_text]
    product_image = (
        None
        if exception == "BOOKING_PAGE_NOT_FOUND"
        else choose_product_image(catalog.get("heroImage"), owned_images)
    )
    gallery = []
    image_audit = {
        "hero": product_image,
        "selected": None,
        "action": "none",
        "reason": (
            "terminal booking page"
            if exception == "BOOKING_PAGE_NOT_FOUND"
            else "no item-owned images"
        ),
        "rejected": [],
        "candidates": [],
    }
    if product_image:
        gallery_source = [url for url in owned_images if url != product_image]
        gallery, image_audit = select_visible_gallery(product_image, gallery_source)
        image_audit["hero"] = product_image

    visible = None
    offer = None
    rows = []
    if price and exception == "OK":
        visible = f"From {format_money(price['basis']['amount'], price['currency'])}"
        offer = {
            "type": "Offer",
            "price": schema_amount(price["basis"]["amount"]),
            "priceCurrency": price["currency"],
        }
        rows = price_rows(price)

    overlay = EDITORIAL_BY_ID.get(catalog["itemId"])
    if exception in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND", "INSUFFICIENT_SOURCE_CONTENT"}:
        overlay = None
    if overlay and overlay.get("schemaDescription"):
        schema = overlay["schemaDescription"]
    elif generated_schema:
        schema = generated_schema
    else:
        schema = schema_from_paragraphs(
            paragraphs, facts, catalog["title"], exception, geography
        )
    meeting = facts.get("meetingAddress") if exception != "BOOKING_PAGE_NOT_FOUND" else None
    omit_facts = exception in {
        "SOURCE_NOT_FOUND",
        "INSUFFICIENT_SOURCE_CONTENT",
        "BOOKING_PAGE_NOT_FOUND",
    }
    product = {
        "itemId": catalog["itemId"],
        "company": catalog["company"],
        "title": catalog["title"],
        "operator": catalog["operator"],
        "publicPath": public_path,
        "engine2Path": None,
        "exceptionStatus": exception,
        "paragraphs": paragraphs,
        "schemaDescription": schema,
        "removedClaims": removed,
        "highlights": highlights if exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND", "INSUFFICIENT_SOURCE_CONTENT"} else [],
        "galleryImages": gallery,
        "productImage": product_image,
        "wordCount": words,
        "durationLabel": None if omit_facts else facts.get("duration"),
        "durationIso": None if omit_facts else duration_iso(facts.get("duration")),
        "meetingLocation": meeting,
        "visiblePriceLabel": visible,
        "priceRows": rows,
        "pricingNotes": [],
        "offer": offer,
        "aggregateRating": None,
        "ratingProvenance": "",
        "geography": geography,
        "imageAudit": image_audit,
        "source": {
            "artifacts": f"data/fareharbor-lead-to-gold/{CITY_SLUG}/{folder.name}",
            "fetchedAt": meta.get("fetchedAt"),
            "endpoints": meta.get("endpoints"),
            "price": price,
            "facts": facts,
            "bookingPageValidity": booking,
        },
    }
    rating, rating_provenance = tripadvisor_rating(
        folder, meta, catalog["company"], catalog["itemId"]
    )
    product["aggregateRating"] = rating
    product["ratingProvenance"] = rating_provenance
    validation = validate(
        product,
        source_text,
        geography=geography,
        expected_city=dest.get("city") or CITY_NAME,
        prose_source=overlap_text,
        allow_short=bool(publish_short and exception == "OK"),
    )
    extra = []
    expected_city_slug = dest.get("citySlug") or CITY_SLUG
    if (
        geography.get("conflictsWithExpected")
        and geography.get("disposition") != "exclude"
        and f"/{expected_city_slug}/" in product["publicPath"]
    ):
        extra.append("conflicting geography still published under the legacy city route")
    if exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"}:
        voice_errors = editorial_substance_errors(
            product["paragraphs"],
            product["highlights"],
            product["schemaDescription"],
            exception=exception,
            title=catalog.get("title") or "",
            description=(facts.get("description") or "") if exception not in {
                "SOURCE_NOT_FOUND",
                "BOOKING_PAGE_NOT_FOUND",
                "INSUFFICIENT_SOURCE_CONTENT",
            } else "",
            allow_short=bool(publish_short and exception == "OK"),
        )
        extra.extend(voice_errors)
        extra.extend(
            hero_gallery_duplicate_errors(product_image, gallery)
        )
    if extra:
        validation["errors"] = list(validation.get("errors") or []) + extra
        validation["ok"] = not validation["errors"]
    product["validation"] = validation
    return product


def catalog_destinations() -> dict[tuple[str, str], dict]:
    from inventory_boston import load_generated_tours

    dests = {}
    for tour in load_generated_tours():
        dest = tour.get("destination") or {}
        key = (dest.get("stateSlug"), dest.get("citySlug"))
        if key[0] and key[1]:
            dests[key] = dest
    return dests


def emit_geography_review_ts(entries: list[dict]) -> str:
    payload = json.dumps(entries, indent=2, ensure_ascii=False)
    return (
        "// Generated by scripts/fareharbor-lead-to-gold/build_boston_legacy.py\n"
        "// Geography exclusions for FareHarbor migrations. Do not edit by hand.\n"
        "export type FareHarborGeographyReviewEntry = {\n"
        "  itemId: string;\n"
        "  title: string;\n"
        "  reason: string;\n"
        "  city: string;\n"
        "  state: string;\n"
        "  expectedPath: string;\n"
        "};\n\n"
        f"export const fareHarborGeographyReviewEntries: FareHarborGeographyReviewEntry[] = {payload};\n\n"
        "export const FAREHARBOR_GEOGRAPHY_REVIEW_IDS = new Set(\n"
        "  fareHarborGeographyReviewEntries.map(entry => entry.itemId)\n"
        ");\n"
    )


def emit_ts(products: list[dict]) -> str:
    runtime = []
    for product in products:
        runtime.append(
            {
                "itemId": product["itemId"],
                "company": product["company"],
                "title": product["title"],
                "publicPath": product["publicPath"],
                "engine2Path": product["engine2Path"],
                "exceptionStatus": product["exceptionStatus"],
                "paragraphs": product["paragraphs"],
                "schemaDescription": product["schemaDescription"],
                "highlights": product["highlights"],
                "galleryImages": product["galleryImages"],
                "productImage": product.get("productImage"),
                "wordCount": product["wordCount"],
                "durationLabel": product["durationLabel"],
                "durationIso": product["durationIso"],
                "meetingLocation": product["meetingLocation"],
                "visiblePriceLabel": product["visiblePriceLabel"],
                "priceRows": product["priceRows"],
                "pricingNotes": product["pricingNotes"],
                "offer": product["offer"],
                "aggregateRating": product["aggregateRating"],
                "ratingProvenance": product["ratingProvenance"],
            }
        )
    payload = json.dumps(runtime, indent=2, ensure_ascii=False)
    return (
        "// Generated by scripts/fareharbor-lead-to-gold/build_boston_legacy.py\n"
        "// Stored FareHarbor harvest only. Do not edit by hand.\n"
        "import type { FareHarborProofProduct } from \"./fareharborLeadToGoldProof.generated\";\n\n"
        f"export const {EXPORT_NAME}: FareHarborProofProduct[] = {payload};\n"
    )


def load_existing_geography_entries() -> list[dict]:
    if not GEOGRAPHY_TS.exists():
        return []
    text = GEOGRAPHY_TS.read_text()
    match = re.search(
        r"export const fareHarborGeographyReviewEntries: FareHarborGeographyReviewEntry\[\] = (\[[\s\S]*?\n\]);",
        text,
    )
    if not match:
        raise SystemExit("failed to read existing geography review entries")
    return json.loads(match.group(1))


def merge_geography_entries(review: list[dict]) -> list[dict]:
    """Keep other cities' exclusions and replace only this city's review rows."""
    marker = f"/{CITY_SLUG}/"
    kept = [
        entry
        for entry in load_existing_geography_entries()
        if marker not in (entry.get("expectedPath") or "")
    ]
    seen = {entry["itemId"] for entry in kept}
    merged = list(kept)
    for entry in review:
        if entry["itemId"] in seen:
            continue
        merged.append(entry)
        seen.add(entry["itemId"])
    return merged


def has_authoritative_price(product: dict) -> bool:
    return bool(product.get("offer") and product.get("visiblePriceLabel"))


def placeholder_product_ids() -> set[str]:
    path = ROOT / "src" / "utils" / "tours" / "invalidPlaceholderTours.ts"
    if not path.exists():
        return set()
    text = path.read_text()
    match = re.search(
        r"const INVALID_PLACEHOLDER_TOUR_PRODUCT_IDS = new Set\(\[([\s\S]*?)\]\);",
        text,
    )
    if not match:
        return set()
    return set(re.findall(r'"(\d+)"', match.group(1)))


PLACEHOLDER_PRODUCT_IDS = placeholder_product_ids()


def is_public_product(product: dict) -> bool:
    if product["itemId"] in PLACEHOLDER_PRODUCT_IDS:
        return False
    if product.get("geography", {}).get("disposition") == "exclude":
        return False
    if product["exceptionStatus"] == "BOOKING_PAGE_NOT_FOUND":
        return False
    if not PUBLISH_UNPRICED and not has_authoritative_price(product):
        return False
    return True


def update_unpublished_unpriced_ids(item_ids: list[str]) -> None:
    """Union withheld ids. Never drop another city's ids."""
    current: list[str] = []
    if UNPRICED_TS.exists():
        current = re.findall(r'"(\d+)"', UNPRICED_TS.read_text())
    wanted = list(current)
    for item_id in item_ids:
        if item_id not in wanted:
            wanted.append(item_id)
    if UNPRICED_TS.exists() and current == wanted:
        return
    lines = ",\n  ".join(f'"{item_id}"' for item_id in wanted)
    body = "\n".join(
        [
            "// Generated by scripts/fareharbor-lead-to-gold/build_boston_legacy.py",
            "// Products withheld because no authoritative FareHarbor price exists.",
            "// Do not edit by hand. Ids are a union across cities.",
            "",
            "const normalizeUnpricedProductId = (value?: string | null) => {",
            '  const normalized = (value ?? "").trim().replace(/^engine2-/, "");',
            "  return normalized.match(/(\\d+)$/)?.[1] ?? normalized;",
            "};",
            "",
            "export const UNPUBLISHED_UNPRICED_FAREHARBOR_IDS = new Set<string>([",
            f"  {lines}," if lines else "",
            "]);",
            "",
            "export const isUnpublishedUnpricedFareHarborProduct = (",
            "  value?: string | null",
            "): boolean =>",
            "  UNPUBLISHED_UNPRICED_FAREHARBOR_IDS.has(normalizeUnpricedProductId(value));",
            "",
        ]
    )
    UNPRICED_TS.write_text(body)


def ensure_sitemap_paths(paths: list[str]) -> None:
    sitemap_path = ROOT / "public" / "sitemap-tours.xml"
    if not sitemap_path.exists():
        return
    text = sitemap_path.read_text()
    missing = [path for path in paths if path and path not in text]
    if not missing:
        return
    block = "".join(
        "  <url><loc>https://www.alloutdooradventures.com"
        f"{path}</loc><priority>0.8</priority></url>\n"
        for path in missing
    )
    if "</urlset>" not in text:
        raise SystemExit("sitemap-tours.xml is missing </urlset>")
    sitemap_path.write_text(text.replace("</urlset>", f"{block}</urlset>", 1))
    print(f"added {len(missing)} published sitemap urls")


def remove_sitemap_paths(paths: list[str]) -> None:
    sitemap_path = ROOT / "public" / "sitemap-tours.xml"
    if not sitemap_path.exists() or not paths:
        return
    drop = {path for path in paths if path}
    text = sitemap_path.read_text()
    kept = []
    removed = 0
    for line in text.splitlines(keepends=True):
        if any(path in line for path in drop):
            removed += 1
            continue
        kept.append(line)
    if removed:
        sitemap_path.write_text("".join(kept))
        print(f"removed {removed} unpublished sitemap urls")


def update_terminal_ids(terminal_ids: list[str]) -> None:
    """Union this city's terminal ids into the shared set. Never drop another city."""
    text = TERMINAL_TS.read_text()
    match = re.search(
        r"export const STAGE_B_BOOKING_PAGE_NOT_FOUND_IDS = new Set\(\[([\s\S]*?)\]\);",
        text,
    )
    if not match:
        raise SystemExit("failed to read terminal booking-page ids")
    current = re.findall(r'"(\d+)"', match.group(1))
    wanted = list(current)
    for item_id in ("595701", "612500", *terminal_ids):
        if item_id not in wanted:
            wanted.append(item_id)
    if current == wanted:
        return
    block = ",\n  ".join(f'"{item_id}"' for item_id in wanted)
    next_text = re.sub(
        r"export const STAGE_B_BOOKING_PAGE_NOT_FOUND_IDS = new Set\(\[[\s\S]*?\]\);",
        "export const STAGE_B_BOOKING_PAGE_NOT_FOUND_IDS = new Set([\n"
        f"  {block},\n"
        "]);",
        text,
        count=1,
    )
    if next_text == text:
        raise SystemExit("failed to update terminal booking-page ids")
    TERMINAL_TS.write_text(next_text)


def markdown_report(products: list[dict], harvest: dict, review: list[dict], moved: list[dict]) -> str:
    counts = {
        "OK": 0,
        "PRICE_NOT_FOUND": 0,
        "INSUFFICIENT_SOURCE_CONTENT": 0,
        "SOURCE_NOT_FOUND": 0,
        "BOOKING_PAGE_NOT_FOUND": 0,
    }
    fail = []
    published = [product for product in products if is_public_product(product)]
    boston_published = [
        product for product in published if f"/{CITY_SLUG}/" in product["publicPath"]
    ]
    for product in products:
        counts[product["exceptionStatus"]] = counts.get(product["exceptionStatus"], 0) + 1
        if not product["validation"]["ok"]:
            fail.append(product)
    lines = [
        f"# Stage C {CITY_NAME} legacy FareHarbor tranche",
        "",
        f"Scope is `citySlug === {CITY_SLUG}` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.",
        "",
        f"Authority is the stored harvest under `data/fareharbor-lead-to-gold/{CITY_SLUG}`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{{company}}/items/{{itemId}}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the {CITY_NAME} bucket.",
        "",
        f"- Total {CITY_NAME} legacy products: {harvest.get('total', harvest.get('totalBostonLegacy'))}",
        f"- Active booking pages: {harvest['active']}",
        f"- Terminal booking pages: {harvest['terminal']}",
        f"- Geography conflicts with {CITY_NAME}: {sum(1 for item in products if item.get('geography', {}).get('conflictsWithExpected'))}",
        f"- Moved to another destination: {len(moved)}",
        f"- Excluded for uncertain/unmapped geography: {len(review)}",
        f"- Published {CITY_NAME} routes: {len(boston_published)}",
        f"- Withheld for no authoritative price: {sum(1 for item in products if item['exceptionStatus'] != 'BOOKING_PAGE_NOT_FOUND' and item.get('geography', {}).get('disposition') != 'exclude' and not has_authoritative_price(item) and not PUBLISH_UNPRICED)}",
        f"- Authoritative price-preview fares among active pages: {harvest['authoritativePrice']}",
        f"- Active PRICE_NOT_FOUND before editorial: {harvest['priceNotFound']}",
        f"- Runtime PASS: {sum(1 for item in published if item['validation']['ok'])}",
        f"- Runtime FAIL: {sum(1 for item in published if not item['validation']['ok'])}",
        f"- Terminal removals: {counts['BOOKING_PAGE_NOT_FOUND']}",
        f"- PRICE_NOT_FOUND after editorial: {counts['PRICE_NOT_FOUND']}",
        f"- INSUFFICIENT_SOURCE_CONTENT: {counts['INSUFFICIENT_SOURCE_CONTENT']}",
        f"- SOURCE_NOT_FOUND: {counts['SOURCE_NOT_FOUND']}",
        f"- OK priced pages: {counts['OK']}",
        f"- Runtime pages with a FareHarbor rating: {sum(1 for item in published if item.get('aggregateRating'))}",
        f"- Runtime pages without a FareHarbor rating: {sum(1 for item in published if not item.get('aggregateRating'))}",
        "",
        "## Ratings",
        "",
    ]
    rated = [item for item in published if item.get("aggregateRating")]
    rated.sort(
        key=lambda item: (
            item["itemId"] != "657142",
            -(item["aggregateRating"]["reviewCount"]),
        )
    )
    if not rated:
        lines.append("- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.")
    else:
        lines.append(
            "TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. "
            "Otherwise Google reviews on the same endpoint are shown as Google."
        )
        for product in rated[:8]:
            rating = product["aggregateRating"]
            lines.append(
                f"- `{product['itemId']}` `{product['title']}` — "
                f"{rating['ratingValue']} / {rating['reviewCount']} {rating['provider']}"
            )
        if len(rated) > 8:
            lines.append(f"- {len(rated) - 8} more published pages carry a FareHarbor rating.")
    lines.extend([
        "",
        "## Geography conflicts",
        "",
    ])
    conflicts = [
        product
        for product in products
        if product.get("geography", {}).get("conflictsWithExpected")
    ]
    if not conflicts:
        lines.append("- None.")
    for product in conflicts:
        geo = product["geography"]
        lines.append(
            f"- `{product['itemId']}` `{product['title']}` — {geo.get('disposition')} — {geo.get('reason')} — `{product['publicPath']}`"
        )
    lines.extend(["", "## Terminal records retained for audit", ""])
    for product in products:
        if product["exceptionStatus"] == "BOOKING_PAGE_NOT_FOUND":
            lines.append(
                f"- `{product['itemId']}` `{product['publicPath']}` — `BOOKING_PAGE_NOT_FOUND`"
            )
    lines.extend(["", "## Manual review", ""])
    extra_review = [
        product
        for product in products
        if product["exceptionStatus"] in {"INSUFFICIENT_SOURCE_CONTENT", "SOURCE_NOT_FOUND"}
        or not product["validation"]["ok"]
    ]
    if not extra_review and not review:
        lines.append("- None.")
    for product in review:
        lines.append(
            f"- `{product['itemId']}` geography exclude — {product.get('reason')}"
        )
    for product in extra_review:
        errors = "; ".join(product["validation"]["errors"]) or "none"
        lines.append(
            f"- `{product['itemId']}` `{product['exceptionStatus']}` `{product['publicPath']}` — {errors}"
        )
    lines.append("")
    return "\n".join(lines)


def write_discovery(harvest: dict) -> None:
    sitemap_path = ROOT / "public" / "sitemap-tours.xml"
    sitemap = (
        sitemap_path.read_text(encoding="utf-8", errors="ignore")
        if sitemap_path.exists()
        else ""
    )
    merchant = (ROOT / "data" / "merchantFeed.csv").read_text(
        encoding="utf-8", errors="ignore"
    )
    rows = []
    for item in harvest.get("products") or []:
        item_id = str(item.get("itemId") or "")
        folder = HARVEST_ROOT / f"{item.get('company')}-{item_id}"
        rating = None
        ratings_path = folder / "ratings.json"
        if ratings_path.exists():
            rating = parse_tripadvisor_rating(load_json(ratings_path))
        content = (item.get("endpoints") or {}).get("content") or {}
        structured = (item.get("endpoints") or {}).get("structured-description") or {}
        public_path = item.get("publicPath") or ""
        rows.append(
            {
                "company": item.get("company"),
                "operator": item.get("operator"),
                "itemId": item_id,
                "slug": item.get("slug"),
                "publicPath": public_path,
                "status": (item.get("bookingPageValidity") or {}).get("classification"),
                "sourceContent": {
                    "contentStatus": content.get("status"),
                    "contentBytes": content.get("bytes"),
                    "structuredStatus": structured.get("status"),
                    "structuredBytes": structured.get("bytes"),
                },
                "priceAvailable": bool(item.get("hasAuthoritativePrice")),
                "tripadvisorRatingAvailable": rating is not None,
                "imageAvailable": bool(item.get("heroImage") or item.get("galleryImages")),
                "inSitemap": bool(public_path) and public_path in sitemap,
                "inMerchantFeed": bool(
                    item_id
                    and re.search(rf"(?<![0-9]){re.escape(item_id)}(?![0-9])", merchant)
                ),
            }
        )
    payload = {
        "citySlug": CITY_SLUG,
        "total": len(rows),
        "active": sum(1 for row in rows if row["status"] == "VALID"),
        "terminal": sum(1 for row in rows if row["status"] == "BOOKING_PAGE_NOT_FOUND"),
        "priceAvailable": sum(1 for row in rows if row["priceAvailable"]),
        "tripadvisorRatingAvailable": sum(
            1 for row in rows if row["tripadvisorRatingAvailable"]
        ),
        "imageAvailable": sum(1 for row in rows if row["imageAvailable"]),
        "inSitemap": sum(1 for row in rows if row["inSitemap"]),
        "inMerchantFeed": sum(1 for row in rows if row["inMerchantFeed"]),
        "products": rows,
    }
    out = (
        ROOT
        / "reports"
        / "fareharbor-lead-to-gold"
        / f"stage-c-{CITY_SLUG}-inventory.json"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {out}")


CALIFORNIA_EDITORIAL_CITIES = {
    "avalon",
    "calistoga",
    "coronado",
    "del-mar",
    "healdsburg",
    "joshua-tree",
    "laguna-beach",
    "los-angeles",
    "marina-del-rey",
    "oakhurst",
    "redondo-beach",
    "san-diego",
    "san-francisco",
    "santa-monica",
}


def main() -> None:
    import sys

    global PREVIOUS_RUNTIME, REGENERATE_ITEM_IDS

    if "--city" in sys.argv:
        configure_city(sys.argv[sys.argv.index("--city") + 1])
    catalog_products = inventory(CITY_SLUG)["products"]
    if "--all-products" not in sys.argv:
        catalog_products = apply_winter_cohort(CITY_SLUG, catalog_products)
    catalog = {item["itemId"]: item for item in catalog_products}
    PREVIOUS_RUNTIME = load_previous_runtime()
    REGENERATE_ITEM_IDS = identical_prose_without_shared_source(PREVIOUS_RUNTIME, catalog)
    if CITY_SLUG in CALIFORNIA_EDITORIAL_CITIES or CITY_SLUG in FLORIDA_WINTER_CITY_SLUGS:
        REGENERATE_ITEM_IDS.update(
            item_id
            for item_id, row in PREVIOUS_RUNTIME.items()
            if row.get("exceptionStatus") == "OK"
        )
    harvest = load_json(HARVEST_REPORT)
    booking = {
        item["itemId"]: item["bookingPageValidity"]
        for item in harvest["products"]
        if item.get("itemId")
    }
    write_discovery(harvest)
    destinations = catalog_destinations()
    image_urls = []
    for entry in catalog.values():
        if entry.get("heroImage"):
            image_urls.append(entry["heroImage"])
        folder = HARVEST_ROOT / f"{entry['company']}-{entry['itemId']}"
        if not (folder / "content.json").exists():
            continue
        content_raw = load_json(folder / "content.json")
        structured_raw = load_json(folder / "structured-description.json")
        item_raw = load_json(folder / "item.json")
        content = unwrap_content(content_raw)
        structured = unwrap_content(structured_raw)
        if not isinstance(content, dict) or "error" in content:
            content = {}
        if not isinstance(structured, dict) or "error" in structured:
            structured = {}
        image_urls.extend(
            harvest_images(folder, content, structured, item_raw, entry["itemId"])
        )
    unique_images = list(dict.fromkeys(image_urls))
    print(f"prefetching {len(unique_images)} product images")
    prefetch(unique_images, workers=12)
    products = []
    for item_id, entry in sorted(catalog.items(), key=lambda pair: (pair[1]["company"], pair[0])):
        product = build_product(entry, booking[item_id], destinations)
        products.append(product)
    unpublish_borrowed_prose(products, catalog)
    withhold_unpublished_items(products)
    runtime = []
    failures = []
    for product in products:
        if not product["validation"]["ok"] and is_public_product(product):
            failures.append(product)
        if is_public_product(product):
            runtime.append(product)
    review = [
        {
            "itemId": product["itemId"],
            "title": product["title"],
            "reason": product.get("geography", {}).get("reason"),
            "city": product.get("geography", {}).get("city"),
            "state": product.get("geography", {}).get("state"),
            "expectedPath": catalog[product["itemId"]]["publicPath"],
        }
        for product in products
        if product.get("geography", {}).get("disposition") == "exclude"
    ]
    moved = [
        product
        for product in products
        if product.get("geography", {}).get("disposition") == "moved"
    ]
    REPORT_JSON.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n")
    REPORT_MD.write_text(markdown_report(products, harvest, review, moved))
    GENERATED_TS.write_text(emit_ts(runtime))
    GEOGRAPHY_TS.write_text(emit_geography_review_ts(merge_geography_entries(review)))
    terminal_ids = [
        product["itemId"]
        for product in products
        if product["exceptionStatus"] == "BOOKING_PAGE_NOT_FOUND"
    ]
    update_terminal_ids(terminal_ids)
    unpublished_unpriced = [
        product["itemId"]
        for product in products
        if product["exceptionStatus"] != "BOOKING_PAGE_NOT_FOUND"
        and product.get("geography", {}).get("disposition") != "exclude"
        and not has_authoritative_price(product)
        and not PUBLISH_UNPRICED
    ]
    if not PUBLISH_UNPRICED:
        update_unpublished_unpriced_ids(unpublished_unpriced)
    published_paths = {product["publicPath"] for product in runtime}
    drop_paths = []
    for product in products:
        original = catalog[product["itemId"]]["publicPath"]
        current = product.get("publicPath") or ""
        if current not in published_paths:
            drop_paths.extend([current, original])
        elif original != current:
            drop_paths.append(original)
    remove_sitemap_paths(drop_paths)
    ensure_sitemap_paths(sorted(published_paths))
    print(f"wrote {GENERATED_TS}")
    print(f"wrote {GEOGRAPHY_TS}")
    print(f"wrote {REPORT_MD}")
    boston_runtime = [item for item in runtime if f"/{CITY_SLUG}/" in item["publicPath"]]
    ratings_report = (
        ROOT / "reports" / "fareharbor-lead-to-gold" / f"stage-c-{CITY_SLUG}-ratings.json"
    )
    if ratings_report.exists():
        coverage = load_json(ratings_report)
        coverage["runtimePublished"] = len(runtime)
        coverage["runtimeWithTripadvisor"] = sum(
            1 for item in runtime if item.get("aggregateRating")
        )
        coverage["runtimeWithoutTripadvisor"] = sum(
            1 for item in runtime if not item.get("aggregateRating")
        )
        ratings_report.write_text(
            json.dumps(coverage, indent=2, ensure_ascii=False) + "\n"
        )
    print(
        f"runtime={len(runtime)} {CITY_SLUG}={len(boston_runtime)} moved={len(moved)} "
        f"geo_exclude={len(review)} terminal={len(terminal_ids)} "
        f"unpriced_withheld={len(unpublished_unpriced)} fail={len(failures)} "
        f"tripadvisor={sum(1 for item in runtime if item.get('aggregateRating'))}"
    )
    for product in failures[:25]:
        print(f"FAIL {product['itemId']} {product['exceptionStatus']} {product['validation']['errors']}")
    if failures:
        raise SystemExit(f"{len(failures)} {CITY_NAME} products failed validation")


if __name__ == "__main__":
    main()
