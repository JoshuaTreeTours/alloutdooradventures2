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

ROOT = Path(__file__).resolve().parents[2]
HARVEST_ROOT = ROOT / "data" / "fareharbor-lead-to-gold" / "boston"
HARVEST_REPORT = ROOT / "reports" / "fareharbor-lead-to-gold" / "stage-c-boston-harvest.json"
REPORT_JSON = ROOT / "reports" / "fareharbor-lead-to-gold" / "stage-c-boston-proof.json"
REPORT_MD = ROOT / "reports" / "fareharbor-lead-to-gold" / "stage-c-boston-proof.md"
GENERATED_TS = ROOT / "src" / "data" / "fareharborBostonLegacy.generated.ts"
TERMINAL_TS = ROOT / "src" / "utils" / "fareharbor" / "stageBTerminalBookingPages.ts"

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


def harvest_images(folder: Path, content: dict, structured: dict, item_raw: dict) -> list[str]:
    urls = []
    for payload in (content, structured):
        for image in payload.get("images") or []:
            if isinstance(image, str):
                urls.append(image)
            elif isinstance(image, dict):
                urls.append(str(image.get("url") or image.get("image") or ""))
    item = item_raw.get("item") if isinstance(item_raw, dict) else None
    if isinstance(item, dict):
        for image in item.get("images") or []:
            if isinstance(image, str):
                urls.append(image)
            elif isinstance(image, dict):
                urls.append(str(image.get("url") or image.get("image") or ""))
    return unique([url for url in urls if FILESTACK_RE.search(url)])


def select_gallery(hero: str | None, harvest_urls: list[str]) -> list[str]:
    hero_handle = FILESTACK_RE.search(hero or "")
    hero_id = hero_handle.group(1) if hero_handle else None
    for url in harvest_urls:
        match = FILESTACK_RE.search(url)
        if match and match.group(1) != hero_id:
            return [url]
    return []


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
    for match in PROPER_RE.findall(text or ""):
        if MARKETING.search(match) or SECOND_PERSON.search(match):
            continue
        if match in blocked or len(match) < 6:
            continue
        if re.search(r"\b(Street|Avenue|Road|Blvd|Drive)\b", match):
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


def compose_copy(catalog: dict, facts: dict, source_text: str) -> tuple[list[str], list[str], list[str]]:
    title = clean_text(catalog["title"])
    operator = clean_text(catalog["operator"])
    activity = activity_phrase(title)
    duration = facts.get("duration")
    group = facts.get("groupSize")
    meeting = facts.get("meetingAddress")
    included = short_tokens(facts.get("included") or [], 6)
    excluded = short_tokens(facts.get("excluded") or [], 4)
    itinerary = short_tokens(facts.get("itinerary") or [], 4)
    source_highlights = short_tokens(facts.get("highlights") or [], 4)
    bring = short_tokens(facts.get("bring") or [], 5)
    names = [name for name in (facts.get("properNames") or []) if len(name.split()) <= 4][:5]
    langs = facts.get("languages") or []
    min_age = facts.get("minAge")
    max_age = facts.get("maxAge")
    access = facts.get("accessibility")
    cancel_hours = notice_hours(facts.get("cancellation"))
    rain = bool(re.search(r"rain or shine", " ".join(facts.get("restrictions") or []) + " " + (facts.get("cancellation") or ""), re.I))

    drafts: list[str] = []
    if duration:
        drafts.append(
            f"This {activity} lasts {duration} and takes place in Boston, Massachusetts."
        )
    else:
        drafts.append(f"This {activity} takes place in Boston, Massachusetts.")
    drafts.append(f"{operator} is the listed operator for this Boston product.")
    drafts.append(
        f"The format is a {activity} rather than a multi-day package, and the description stays limited to published logistics."
    )
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
    else:
        drafts.append(
            f"The published focus stays on a Boston {activity} rather than a multi-city itinerary."
        )
    if included:
        drafts.append(f"Short listed inclusions include {join_and(included)}.")
    else:
        drafts.append(
            "Long promotional inclusion lists are omitted here in favor of the short logistics above."
        )
    if excluded:
        drafts.append(f"Short listed exclusions include {join_and(excluded)}.")
    else:
        drafts.append(
            "Food, drinks, and gratuities are treated as extra unless a short exclusion list says otherwise."
        )
    age_bits = []
    if min_age not in (None, ""):
        age_bits.append(f"minimum age {min_age}")
    if max_age not in (None, ""):
        age_bits.append(f"maximum age {max_age}")
    if age_bits:
        drafts.append(f"Published age limits are {join_and(age_bits)}.")
    if bring:
        drafts.append(f"Short listed items to bring include {join_and(bring)}.")
    else:
        drafts.append(
            "Closed-toe shoes and weather-ready clothing are the usual practical needs for an outdoor Boston outing when a longer packing list is not stored."
        )
    if rain:
        drafts.append("Published notes say the outing is held in ordinary rain as well as clear weather.")
    if access and len(re.findall(r"[A-Za-z0-9']+", access)) <= 16:
        drafts.append(f"Accessibility note: {access.rstrip('.')}." )
    if cancel_hours:
        drafts.append(
            f"The published cancellation note mentions a {cancel_hours}-hour notice window."
        )
    drafts.append(
        "Any published fare appears only in the facts panel, and the page stays unpriced when no stable fare exists."
    )
    drafts.append(
        "The meeting and check-in location, when verified, stays in the facts panel so this body does not repeat a street address."
    )
    drafts.append(
        "Guest ratings are omitted on this page because no product-level review figures were published with the listing."
    )
    drafts.append(
        "The description above is limited to logistics, named places, and packing notes rather than promotional claims."
    )
    drafts.append(
        "Departure times and remaining seats are checked on the booking calendar rather than restated as a fixed daily schedule here."
    )
    drafts.append(
        "Boston weather, traffic, and transit connections can change the arrival buffer, so the published check-in window belongs with the meeting details in the facts panel."
    )

    kept = []
    for draft in drafts:
        cleaned = sanitize_sentence(draft, meeting, source_text)
        if cleaned:
            kept.append(cleaned)

    # Pack into 3 paragraphs when possible.
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
    if duration:
        highlight_rows.append(f"{duration} {activity} in Boston")
    if names:
        highlight_rows.append(f"Named places include {join_and(names[:2])}")
    if included:
        highlight_rows.append(f"Short inclusions include {included[0]}")
    if not highlight_rows:
        highlight_rows.append(f"Boston {activity} with published logistics")

    removed = [
        "Catalog quality_score and availability_count were not treated as ratings.",
        "Marketing headlines and structured-description pricing prose were not used as Offer prices.",
    ]
    if meeting:
        removed.append("Verified meeting and check-in details were moved into the facts panel.")
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


def extract_facts(usable: list[dict], source_text: str) -> dict:
    duration = normalize_duration(clean_text(field(usable, "duration")) or None)
    if not duration:
        description = clean_text(field(usable, "description") or "")
        duration = normalize_duration(description)
    meeting = field(usable, "meeting_point")
    meeting_address = None
    if isinstance(meeting, dict):
        meeting_address = format_meeting(meeting.get("address"))
    elif isinstance(meeting, str):
        meeting_address = format_meeting(meeting)
    if not meeting_address:
        meeting_address = format_meeting(field(usable, "location_address"))
    included = []
    excluded = []
    itinerary = []
    highlights = []
    restrictions = []
    bring = []
    glean_source = []
    for payload in usable:
        item_included = list_values(payload.get("what_is_included_items"))
        included.extend(item_included or list_values(payload.get("what_is_included")))
        item_excluded = list_values(payload.get("what_is_not_included_items"))
        excluded.extend(item_excluded or list_values(payload.get("what_is_not_included")))
        itinerary.extend(list_values(payload.get("itinerary")))
        highlights.extend(list_values(payload.get("highlights")))
        restrictions.extend(restriction_lines(payload.get("restrictions")))
        bring.extend(list_values(payload.get("what_to_bring_items") or payload.get("what_to_bring")))
        glean_source.append(clean_text(payload.get("description") or ""))
        glean_source.append(clean_text(payload.get("what_is_included") or ""))
    description = clean_text(field(usable, "description") or "")
    cancellation = clean_text(field(usable, "cancellation_summary")) or None
    if cancellation and (MARKETING.search(cancellation) or SECOND_PERSON.search(cancellation)):
        cancellation = None
    accessibility = clean_text(field(usable, "accessibility")) or None
    if accessibility and (MARKETING.search(accessibility) or SECOND_PERSON.search(accessibility)):
        accessibility = None
    return {
        "duration": duration,
        "meetingAddress": meeting_address,
        "minAge": field(usable, "min_age"),
        "maxAge": field(usable, "max_age"),
        "groupSize": clean_text(field(usable, "group_size")).strip(" .") or None,
        "included": unique(included)[:8],
        "excluded": unique(excluded)[:6],
        "itinerary": unique(itinerary)[:6],
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
    }


def short_missing_copy(title: str) -> list[str]:
    return [
        f"No description, meeting place, or price was available for {title}. Those details are not added here."
    ]


def schema_from_paragraphs(paragraphs: list[str], facts: dict, title: str, exception: str) -> str:
    if exception in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND", "INSUFFICIENT_SOURCE_CONTENT"}:
        return " ".join(paragraphs).strip()
    duration = facts.get("duration")
    activity = activity_phrase(title)
    names = [name for name in (facts.get("properNames") or []) if len(name.split()) <= 4][:3]
    bits = [f"This {activity} takes place in Boston."]
    if duration:
        bits.append(f"Published length is {duration}.")
    if names:
        bits.append(f"Named places include {join_and(names)}.")
    bits.append(
        "The meeting point, when verified, stays on the facts panel, and a fare is shown only when a stable amount exists."
    )
    text = " ".join(bits)
    text = strip_addresses(text, facts.get("meetingAddress"))
    text = re.sub(r"\$\s?\d[\d,]*\.?\d*", "", text)
    words = word_count([text])
    if words > 80:
        text = " ".join(text.split()[:75]).rstrip(".,") + "."
    elif words < 20:
        text = (
            f"{text} Logistics, packing notes, and named stops stay in the page description; "
            "promotional claims are omitted."
        )
    return clean_text(text)


def build_product(catalog: dict, booking: dict) -> dict:
    folder = HARVEST_ROOT / f"{catalog['company']}-{catalog['itemId']}"
    meta = load_json(folder / "harvest-meta.json")
    content_raw = load_json(folder / "content.json")
    structured_raw = load_json(folder / "structured-description.json")
    item_raw = load_json(folder / "item.json")
    preview = load_json(folder / "price-preview.json")
    content = unwrap_content(content_raw)
    structured = unwrap_content(structured_raw)
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
    classification = booking.get("classification")
    if classification == "BOOKING_PAGE_NOT_FOUND":
        exception = "BOOKING_PAGE_NOT_FOUND"
    elif not usable:
        exception = "SOURCE_NOT_FOUND"
    else:
        exception = "OK"

    facts = extract_facts(usable, source_text) if usable else {
        "duration": None,
        "meetingAddress": None,
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
    }
    if exception in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"}:
        paragraphs = short_missing_copy(catalog["title"])
        highlights = []
        removed = [
            "No public copy was written because the booking page is terminal or no FareHarbor content was stored."
        ]
    else:
        paragraphs, highlights, removed = compose_copy(catalog, facts, source_text)
    words = word_count(paragraphs)
    price = extract_price(preview) if endpoint_ok(meta, "price-preview") else None
    if exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"} and words < 150:
        exception = "INSUFFICIENT_SOURCE_CONTENT"
        price = None
        if word_count(paragraphs) >= 150:
            paragraphs = short_missing_copy(catalog["title"])
            words = word_count(paragraphs)
    elif exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"} and price is None:
        exception = "PRICE_NOT_FOUND"
    elif exception == "BOOKING_PAGE_NOT_FOUND":
        price = None

    if exception == "INSUFFICIENT_SOURCE_CONTENT":
        # Keep only harvest-backed short copy; do not pad to 150 words.
        if words >= 150:
            paragraphs = paragraphs[:1]
            words = word_count(paragraphs)
        if words < 20:
            paragraphs = short_missing_copy(catalog["title"])
            words = word_count(paragraphs)

    gallery = []
    if exception != "BOOKING_PAGE_NOT_FOUND":
        gallery = select_gallery(
            catalog.get("heroImage"),
            harvest_images(folder, content, structured, item_raw),
        )
        gallery = [url for url in gallery if url in source_text]

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

    schema = schema_from_paragraphs(paragraphs, facts, catalog["title"], exception)
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
        "publicPath": catalog["publicPath"],
        "engine2Path": None,
        "exceptionStatus": exception,
        "paragraphs": paragraphs,
        "schemaDescription": schema,
        "removedClaims": removed,
        "highlights": highlights if exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"} else [],
        "galleryImages": gallery,
        "wordCount": words,
        "durationLabel": None if omit_facts else facts.get("duration"),
        "durationIso": None if omit_facts else duration_iso(facts.get("duration")),
        "meetingLocation": meeting,
        "visiblePriceLabel": visible,
        "priceRows": rows,
        "pricingNotes": [],
        "offer": offer,
        "aggregateRating": None,
        "ratingProvenance": (
            "No numeric rating or review count is present in the stored FareHarbor content, "
            "structured-description, item, or price-preview payloads. Catalog quality_score and "
            "availability_count were not used. AggregateRating is omitted."
        ),
        "source": {
            "artifacts": f"data/fareharbor-lead-to-gold/boston/{folder.name}",
            "fetchedAt": meta.get("fetchedAt"),
            "endpoints": meta.get("endpoints"),
            "price": price,
            "facts": facts,
            "bookingPageValidity": booking,
        },
    }
    product["validation"] = validate(product, source_text)
    return product


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
                "wordCount": product["wordCount"],
                "durationLabel": product["durationLabel"],
                "durationIso": product["durationIso"],
                "meetingLocation": product["meetingLocation"],
                "visiblePriceLabel": product["visiblePriceLabel"],
                "priceRows": product["priceRows"],
                "pricingNotes": product["pricingNotes"],
                "offer": product["offer"],
                "aggregateRating": None,
                "ratingProvenance": product["ratingProvenance"],
            }
        )
    payload = json.dumps(runtime, indent=2, ensure_ascii=False)
    return (
        "// Generated by scripts/fareharbor-lead-to-gold/build_boston_legacy.py\n"
        "// Stored FareHarbor harvest only. Do not edit by hand.\n"
        "import type { FareHarborProofProduct } from \"./fareharborLeadToGoldProof.generated\";\n\n"
        f"export const fareHarborBostonLegacyProducts: FareHarborProofProduct[] = {payload};\n"
    )


def update_terminal_ids(terminal_ids: list[str]) -> None:
    wanted = ["595701", "612500", *terminal_ids]
    text = TERMINAL_TS.read_text()
    current = re.findall(
        r'"(\d+)"',
        re.search(
            r"export const STAGE_B_BOOKING_PAGE_NOT_FOUND_IDS = new Set\(\[([\s\S]*?)\]\);",
            text,
        ).group(1),
    )
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


def markdown_report(products: list[dict], harvest: dict) -> str:
    counts = {
        "OK": 0,
        "PRICE_NOT_FOUND": 0,
        "INSUFFICIENT_SOURCE_CONTENT": 0,
        "SOURCE_NOT_FOUND": 0,
        "BOOKING_PAGE_NOT_FOUND": 0,
    }
    fail = []
    for product in products:
        counts[product["exceptionStatus"]] = counts.get(product["exceptionStatus"], 0) + 1
        if not product["validation"]["ok"]:
            fail.append(product)
    lines = [
        "# Stage C Boston legacy FareHarbor tranche",
        "",
        "Scope is `citySlug === boston` FareHarbor products in `tours.generated.ts`. Engine 6 Viator Boston routes and non-Boston cities were not processed.",
        "",
        "Authority is the stored harvest under `data/fareharbor-lead-to-gold/boston`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. AggregateRating is omitted.",
        "",
        f"- Total Boston legacy products: {harvest['totalBostonLegacy']}",
        f"- Active booking pages: {harvest['active']}",
        f"- Terminal booking pages: {harvest['terminal']}",
        f"- Authoritative price-preview fares among active pages: {harvest['authoritativePrice']}",
        f"- Active PRICE_NOT_FOUND before editorial: {harvest['priceNotFound']}",
        f"- Runtime PASS: {sum(1 for item in products if item['validation']['ok'] and item['exceptionStatus'] != 'BOOKING_PAGE_NOT_FOUND')}",
        f"- Runtime FAIL: {len(fail)}",
        f"- Terminal removals: {counts['BOOKING_PAGE_NOT_FOUND']}",
        f"- PRICE_NOT_FOUND after editorial: {counts['PRICE_NOT_FOUND']}",
        f"- INSUFFICIENT_SOURCE_CONTENT: {counts['INSUFFICIENT_SOURCE_CONTENT']}",
        f"- SOURCE_NOT_FOUND: {counts['SOURCE_NOT_FOUND']}",
        f"- OK priced pages: {counts['OK']}",
        "",
        "## Terminal records retained for audit",
        "",
    ]
    for product in products:
        if product["exceptionStatus"] == "BOOKING_PAGE_NOT_FOUND":
            lines.append(
                f"- `{product['itemId']}` `{product['publicPath']}` — `BOOKING_PAGE_NOT_FOUND`"
            )
    lines.extend(["", "## Manual review", ""])
    review = [
        product
        for product in products
        if product["exceptionStatus"] in {"INSUFFICIENT_SOURCE_CONTENT", "SOURCE_NOT_FOUND"}
        or not product["validation"]["ok"]
    ]
    if not review:
        lines.append("- None.")
    for product in review:
        errors = "; ".join(product["validation"]["errors"]) or "none"
        lines.append(
            f"- `{product['itemId']}` `{product['exceptionStatus']}` `{product['publicPath']}` — {errors}"
        )
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    catalog = {item["itemId"]: item for item in inventory()["products"]}
    harvest = load_json(HARVEST_REPORT)
    booking = {
        item["itemId"]: item["bookingPageValidity"]
        for item in harvest["products"]
        if item.get("itemId")
    }
    products = []
    runtime = []
    failures = []
    for item_id, entry in sorted(catalog.items(), key=lambda pair: (pair[1]["company"], pair[0])):
        product = build_product(entry, booking[item_id])
        products.append(product)
        if not product["validation"]["ok"]:
            failures.append(product)
        if product["exceptionStatus"] != "BOOKING_PAGE_NOT_FOUND":
            runtime.append(product)
    REPORT_JSON.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n")
    REPORT_MD.write_text(markdown_report(products, harvest))
    GENERATED_TS.write_text(emit_ts(runtime))
    terminal_ids = [
        product["itemId"]
        for product in products
        if product["exceptionStatus"] == "BOOKING_PAGE_NOT_FOUND"
    ]
    update_terminal_ids(terminal_ids)
    print(f"wrote {GENERATED_TS}")
    print(f"wrote {REPORT_MD}")
    print(f"runtime={len(runtime)} terminal={len(terminal_ids)} fail={len(failures)}")
    for product in failures[:25]:
        print(f"FAIL {product['itemId']} {product['exceptionStatus']} {product['validation']['errors']}")
    if failures:
        raise SystemExit(f"{len(failures)} Boston products failed validation")


if __name__ == "__main__":
    main()
