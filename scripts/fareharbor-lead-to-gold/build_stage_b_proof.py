#!/usr/bin/env python3
"""Build the Stage B FareHarbor proof module from stored harvest artifacts.

Reads data/fareharbor-lead-to-gold/proof-set. Does not call FareHarbor.
The unmerged content rebuild is a secondary cross-check only.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from migration_integrity import editorial_errors

ROOT = Path(__file__).resolve().parents[2]
HARVEST_ROOT = ROOT / "data" / "fareharbor-lead-to-gold" / "proof-set"
STAGE_A = ROOT / "reports" / "fareharbor-lead-to-gold" / "stage-a-representative-products.json"
REPORT_JSON = ROOT / "reports" / "fareharbor-lead-to-gold" / "stage-b-proof.json"
REPORT_MD = ROOT / "reports" / "fareharbor-lead-to-gold" / "stage-b-proof.md"
GENERATED_TS = ROOT / "src" / "data" / "fareharborLeadToGoldProof.generated.ts"
EDITORIAL = ROOT / "scripts" / "fareharbor-lead-to-gold" / "editorial_copy.json"
BOOKING_VALIDITY = (
    ROOT
    / "reports"
    / "fareharbor-lead-to-gold"
    / "stage-b-booking-page-validity.json"
)

PROOF_ORDER = [
    "145208",
    "181765",
    "322210",
    "595701",
    "694384",
    "646999",
    "612500",
    "34849",
    "333279",
    "193220",
]

BOILERPLATE = (
    "keeps the logistics simple",
    "scenery front and center",
    "more than a quick photo stop",
    "flexible half-day",
    "locally operated experience",
    "from $129",
    "$129",
)

PROVENANCE = (
    "the operator lists",
    "included items listed",
    "additional facts stated",
    "the operator description states",
    "the stored price preview",
    "stored price preview",
    "price-preview",
    "quality_score",
    "availability_count",
    "http 403",
    "http 404",
    "http 400",
)

MARKETING = re.compile(
    r"award[- ]winning|strike gold|you might just|most iconic|best-selling|"
    r"signature experience|breathtaking|stunning|unforgettable|world-class|"
    r"amazing experience|fun for the whole family|like no one else|"
    r"\benjoy\b|\bfamous\b|\blively\b|\bpowerful\b|\bromantic\b|"
    r"\biconic\b|\blargest\b",
    re.I,
)
SECOND_PERSON = re.compile(r"\b(you|your|our|we|we'll|you’ll|you'll)\b", re.I)


def load_json(path: Path):
    return json.loads(path.read_text())


def unwrap_content(payload):
    if isinstance(payload, dict) and isinstance(payload.get("data"), dict):
        return payload["data"]
    return payload if isinstance(payload, dict) else {}


def endpoint_ok(meta: dict, name: str) -> bool:
    return meta.get("endpoints", {}).get(name, {}).get("status") == 200


def clean_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, dict):
        value = value.get("address") or value.get("raw") or ""
    text = str(value)
    text = re.sub(r"[#*`]+", " ", text)
    text = text.replace("\u2019", "'").replace("\u2013", "-").replace("\u2014", "-")
    text = re.sub(r"\s+", " ", text).strip(" -")
    return text


LIST_MARKETING = re.compile(
    r"join us|breathtaking|stunning|unforgettable|don't miss|do not miss|"
    r"fun and|instagram|awe-inspiring|delicious|award[- ]winning|strike gold|"
    r"\benjoy\b|\biconic\b|\bdramatic\b",
    re.I,
)


def strip_marker(text: str) -> str:
    text = re.sub(r"^\s*(?:[-*•]+|\d+(?:[.)](?!\d))|\+)\s*", "", text)
    return text.strip()


def list_values(value) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        parts = []
        for item in value:
            if isinstance(item, dict):
                parts.append(str(item.get("value") or item.get("name") or ""))
            else:
                parts.append(str(item))
    elif isinstance(value, str):
        parts = re.split(r"\n+|•", value)
    else:
        return []
    cleaned = []
    for part in parts:
        text = strip_marker(clean_text(part)).strip(" .")
        if not text or len(text) > 180:
            continue
        if text.endswith(":"):
            continue
        if re.search(r"\band more!?\b", text, re.I):
            continue
        if re.match(r"some of the stops|suggested itinerary|recommended items", text, re.I):
            continue
        if LIST_MARKETING.search(text) or SECOND_PERSON.search(text):
            continue
        cleaned.append(text)
    return cleaned


def restriction_lines(value) -> list[str]:
    text = clean_text(value or "")
    parts = re.split(r"\n+|(?<=[.!])\s+", text)
    kept = []
    for part in parts:
        line = strip_marker(part).strip(" .")
        if len(line) < 25 or len(line) > 220:
            continue
        if LIST_MARKETING.search(line):
            continue
        if SECOND_PERSON.search(line) and not re.search(
            r"\d|five|six|seven|eight|nine|ten|fifty|pounds|years", line, re.I
        ):
            continue
        kept.append(line)
    return kept


def glean_facts(text: str) -> list[str]:
    source = clean_text(text)
    patterns = [
        r"Jeep Scrambler \(CJ-8\)",
        r"up to \d+ guests per Jeep",
        r"admission fees and taxes included",
        r"bottled water",
        r"granola snacks",
        r"one mile deep into the [^,.]{0,50}",
        r"California Fan Palms Oasis",
        r"Cahuilla Indian Village",
        r"over [\d,]+ feet into the mountain",
        r"gold pan(?:ning)? in Eureka Creek",
        r"Kawasaki KLR 650(?:\s*/\s*650S)?",
        r"Yamaha Ténéré 700",
        r"at least five years old and weigh at least 50 pounds",
    ]
    found = []
    for pattern in patterns:
        match = re.search(pattern, source, re.I)
        if match:
            found.append(match.group(0).strip())
    return found


def factual_sentences(description: str) -> list[str]:
    text = clean_text(description)
    parts = re.split(r"(?<=[.!])\s+", text)
    kept = []
    for part in parts:
        sentence = part.strip()
        if len(sentence) < 25 or len(sentence) > 280:
            continue
        if MARKETING.search(sentence) or SECOND_PERSON.search(sentence):
            continue
        if not re.search(r"\d", sentence):
            continue
        if sentence[-1] not in ".!":
            sentence += "."
        kept.append(sentence)
        if len(kept) == 2:
            break
    return kept


def money(cents: int, places: int) -> float:
    return cents / float(10 ** places)


def format_money(amount: float, currency: str) -> str:
    if currency == "USD":
        if abs(amount - round(amount)) < 0.001:
            return f"${amount:,.0f}"
        return f"${amount:,.2f}"
    if abs(amount - round(amount)) < 0.001:
        return f"{amount:,.0f} {currency}"
    return f"{amount:,.2f} {currency}"


def schema_amount(amount: float) -> str:
    return f"{amount:.2f}"


def is_adult(label: str) -> bool:
    return bool(re.match(r"adult\b", label.strip(), re.I))


def duration_iso(label: str | None) -> str | None:
    if not label:
        return None
    text = label.lower()
    if re.search(r"\d+\s*-\s*\d+", text):
        return None
    match = re.search(r"(\d+(?:\.\d+)?)\s*hour", text)
    if match:
        hours = float(match.group(1))
        whole = int(hours)
        minutes = int(round((hours - whole) * 60))
        if minutes:
            return f"PT{whole}H{minutes}M"
        return f"PT{whole}H"
    if re.fullmatch(r"1 day", text.strip()):
        return "P1D"
    return None


def extract_price(preview: dict) -> dict | None:
    items = preview.get("items") if isinstance(preview, dict) else None
    if not items:
        return None
    details = preview.get("details") or {}
    currency = (details.get("currency") or "").upper()
    places = int(details.get("currency_decimal_places") or 2)
    if not currency:
        return None
    price = (items[0] or {}).get("price") or {}
    customer_types = ((price.get("breakdown") or {}).get("customer_types")) or []
    paid = []
    for entry in customer_types:
        raw = entry.get("price")
        if not isinstance(raw, int) or raw <= 0:
            continue
        paid.append(
            {
                "singular": clean_text(entry.get("singular")),
                "note": clean_text(entry.get("note")),
                "amount": money(raw, places),
            }
        )
    if not paid and isinstance(price.get("low"), int) and price["low"] > 0:
        paid.append(
            {
                "singular": "Listed low price",
                "note": "",
                "amount": money(price["low"], places),
            }
        )
    if not paid:
        return None
    adults = [entry for entry in paid if is_adult(entry["singular"])]
    basis = min(adults, key=lambda entry: entry["amount"]) if adults else min(
        paid, key=lambda entry: entry["amount"]
    )
    zero = []
    for entry in customer_types:
        raw = entry.get("price")
        if isinstance(raw, int) and raw == 0:
            zero.append(clean_text(entry.get("singular")))
    start_at = ((items[0].get("availability") or {}).get("start_at")) or None
    return {
        "currency": currency,
        "basis": basis,
        "customerTypes": paid,
        "zeroPriceTypes": [name for name in zero if name],
        "departureStartAt": start_at,
        "decimalPlaces": places,
    }


def join_list(items: list[str], limit: int = 8) -> str:
    shown = items[:limit]
    if not shown:
        return ""
    if len(shown) == 1:
        return shown[0]
    return ", ".join(shown[:-1]) + f", and {shown[-1]}"


def first_present(*payloads):
    for payload in payloads:
        if isinstance(payload, dict) and payload and "error" not in payload:
            return payload
    return {}


def field(payloads: list[dict], key: str):
    for payload in payloads:
        value = payload.get(key)
        if value not in (None, "", [], {}):
            return value
    return None


def word_count(paragraphs: list[str]) -> int:
    return len(re.findall(r"[A-Za-z0-9]+(?:'[A-Za-z]+)?", " ".join(paragraphs)))


def shingles(text: str, size: int = 8) -> set[str]:
    tokens = re.findall(r"[a-z0-9']+", text.lower())
    if len(tokens) < size:
        return set()
    return {" ".join(tokens[index : index + size]) for index in range(len(tokens) - size + 1)}


def price_row_label(singular: str) -> str:
    return re.sub(r"\s*-\s*free\s*$", "", singular, flags=re.I).strip()


def price_rows(price: dict | None) -> list[dict]:
    if not price:
        return []
    paid_adult = any(is_adult(entry["singular"]) for entry in price["customerTypes"])
    rows = []
    for entry in price["customerTypes"]:
        rows.append(
            {
                "label": price_row_label(entry["singular"]),
                "note": entry["note"],
                "amountLabel": format_money(entry["amount"], price["currency"]),
            }
        )
    if paid_adult:
        for name in price.get("zeroPriceTypes") or []:
            rows.append(
                {
                    "label": price_row_label(name),
                    "note": "",
                    "amountLabel": "Free",
                }
            )
    return rows


def load_editorial() -> dict:
    payload = load_json(EDITORIAL)
    missing = [item_id for item_id in PROOF_ORDER if item_id not in payload]
    if missing:
        raise SystemExit(f"editorial copy is missing {missing}")
    return payload


def source_blob(folder: Path) -> str:
    chunks = []
    for name in ("content.json", "structured-description.json", "item.json"):
        raw = load_json(folder / name)
        data = unwrap_content(raw)
        if isinstance(data, dict) and "error" not in data:
            chunks.append(json.dumps(data, ensure_ascii=False))
    return " ".join(chunks)


def derivative_notes(stage_a: dict, facts: dict, price: dict | None) -> dict:
    derivative = (stage_a.get("source") or {}).get("unmergedDerivative")
    cache = (stage_a.get("price") or {}).get("unmergedCache")
    excerpt = (derivative or {}).get("descriptionExcerpt") or ""
    confirmed = []
    unused = []
    if facts.get("duration") and facts["duration"].lower() in excerpt.lower():
        confirmed.append(f"duration {facts['duration']}")
    if facts.get("meetingAddress"):
        fragment = facts["meetingAddress"].split(",")[0]
        if fragment and fragment.lower() in excerpt.lower():
            confirmed.append(f"meeting fragment {fragment}")
    if price and cache and cache.get("startingPrice") is not None:
        if abs(float(cache["startingPrice"]) - price["basis"]["amount"]) < 0.001:
            confirmed.append(
                f"unmerged price cache {cache['startingPrice']} {cache.get('currency')} matches harvest basis"
            )
        else:
            unused.append(
                f"unmerged price cache {cache['startingPrice']} {cache.get('currency')} differs from harvest basis {price['basis']['amount']}; harvest is used"
            )
    if excerpt:
        if "locally operated experience" in excerpt:
            unused.append("derivative template opener was not copied")
        if MARKETING.search(excerpt):
            unused.append("derivative marketing phrasing was not copied")
        if not confirmed:
            unused.append("derivative excerpt was not used as page copy")
    else:
        unused.append("no unmerged derivative excerpt was stored for this route")
    return {
        "branch": "origin/feat/fareharbor-content-rebuild",
        "usedAsAuthority": False,
        "excerptPresent": bool(excerpt),
        "confirmedByHarvest": confirmed,
        "notUsed": unused,
    }


def validate(
    product: dict,
    source_text: str,
    geography: dict | None = None,
    expected_city: str | None = None,
    prose_source: str | None = None,
) -> dict:
    schema = product.get("schemaDescription") or ""
    public_bits = product["paragraphs"] + product["highlights"] + ([schema] if schema else [])
    text = " ".join(public_bits)
    lowered = text.lower()
    errors = []
    if not product["paragraphs"]:
        errors.append("missing copy")
    if not schema.strip():
        errors.append("missing schema description")
    if not product.get("removedClaims"):
        errors.append("provenance audit is missing removed claims")
    schema_words = word_count([schema]) if schema else 0
    if product["exceptionStatus"] in {
        "SOURCE_NOT_FOUND",
        "BOOKING_PAGE_NOT_FOUND",
        "INSUFFICIENT_SOURCE_CONTENT",
    }:
        if schema.strip() != " ".join(product["paragraphs"]).strip():
            errors.append("missing-source schema description must match the short page copy")
    elif schema_words >= product["wordCount"]:
        errors.append("schema description is not shorter than the editorial body")
    elif schema_words > 80:
        errors.append(f"schema description is {schema_words} words; keep it concise")
    elif schema_words < 8:
        errors.append("schema description is too short")
    for phrase in BOILERPLATE + PROVENANCE:
        if phrase in lowered:
            errors.append(f"disallowed phrase: {phrase}")
    errors.extend(editorial_errors(text, expected_city=expected_city, geography=geography))
    if product["aggregateRating"] is not None:
        errors.append("aggregate rating must be omitted")
    if re.search(r"\$\s?\d", text):
        errors.append("dollar amount leaked into editorial copy")
    if SECOND_PERSON.search(text):
        errors.append("second-person wording in editorial copy")
    if MARKETING.search(text):
        errors.append("marketing phrasing remains in copy")
    overlap = (shingles(text) & shingles(prose_source if prose_source is not None else source_text)) - shingles(
        " ".join(
            part
            for part in (product.get("title"), product.get("operator"))
            if part
        )
    )
    if overlap:
        sample = sorted(overlap)[:3]
        errors.append(f"verbatim overlap with source: {sample}")
    gallery_images = product.get("galleryImages") or []
    if len(gallery_images) != len(set(gallery_images)):
        errors.append("duplicate gallery image")
    for image in gallery_images:
        if image not in source_text:
            errors.append(f"gallery image is not present in the stored harvest: {image}")
    words = product["wordCount"]
    status = product["exceptionStatus"]
    if status in {
        "SOURCE_NOT_FOUND",
        "BOOKING_PAGE_NOT_FOUND",
        "INSUFFICIENT_SOURCE_CONTENT",
    }:
        if words >= 150:
            errors.append(f"{status} copy was padded")
        if product["offer"] is not None or product["visiblePriceLabel"] is not None:
            errors.append(f"{status} product still has a price")
        if status != "INSUFFICIENT_SOURCE_CONTENT" and product["durationLabel"] is not None:
            errors.append(f"{status} product still has a duration")
    elif words < 100:
        errors.append(
            "experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that"
        )
    offer = product["offer"]
    if status in {"PRICE_NOT_FOUND", "INSUFFICIENT_SOURCE_CONTENT"}:
        if offer is not None or product["visiblePriceLabel"] is not None:
            errors.append("unpriced product still has an offer")
    elif status == "OK":
        if offer is None or product["visiblePriceLabel"] is None:
            errors.append("priced product is missing an offer or visible price")
        elif offer.get("price") in {"129.00", "129"}:
            errors.append("synthetic 129 offer")
        elif offer.get("availability"):
            errors.append("offer still carries availability")
        else:
            visible_numbers = re.findall(r"\d[\d,]*\.?\d*", product["visiblePriceLabel"])
            visible_value = visible_numbers[-1].replace(",", "") if visible_numbers else ""
            if f"{float(visible_value):.2f}" != f"{float(offer['price']):.2f}":
                errors.append("visible price does not equal offer price")
            basis_label = format_money(float(offer["price"]), offer["priceCurrency"])
            if not any(row["amountLabel"] == basis_label for row in product["priceRows"]):
                errors.append("pricing list is missing the offer amount")
    if status == "OK" and product["itemId"] == "145208":
        for fact in ("Eureka Creek", "French Gulch", "1,000", "13 and older", "4 to 12", "3 and under"):
            if fact not in text:
                errors.append(f"Country Boy copy is missing {fact}")
    return {"ok": not errors, "errors": errors}


def motorcycle_pricing_notes(source_text: str) -> list[str]:
    notes = []
    if re.search(r"\$15(?:\.00)?\s+per day", source_text, re.I):
        notes.append(
            "Supplemental insurance through MBA: $15 per day, purchased separately."
        )
    if re.search(r"\$1,?000", source_text):
        notes.append("Damage hold on the card at delivery: $1,000.")
    return notes


def build_product(stage_a: dict, editorial: dict, booking_validity: dict) -> dict:
    folder = HARVEST_ROOT / f"{stage_a['operatorShortname']}-{stage_a['itemId']}"
    meta = load_json(folder / "harvest-meta.json")
    content_raw = load_json(folder / "content.json")
    structured_raw = load_json(folder / "structured-description.json")
    item_raw = load_json(folder / "item.json")
    preview = load_json(folder / "price-preview.json")
    content = unwrap_content(content_raw)
    structured = unwrap_content(structured_raw)
    usable = []
    if endpoint_ok(meta, "content") and "error" not in content:
        usable.append(content)
    if endpoint_ok(meta, "structured-description") and "error" not in structured:
        usable.append(structured)

    endpoint_status = {
        name: meta["endpoints"][name]["status"] for name in meta["endpoints"]
    }
    content_available = bool(usable)
    if not content_available:
        exception = "SOURCE_NOT_FOUND"
    else:
        exception = "OK"
    if booking_validity["classification"] == "BOOKING_PAGE_NOT_FOUND":
        exception = "BOOKING_PAGE_NOT_FOUND"

    duration = clean_text(field(usable, "duration")) or None
    if not duration:
        description = clean_text(field(usable, "description") or "")
        match = re.search(r"Duration\s+(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s+hours?)", description, re.I)
        if match:
            duration = match.group(1)
    meeting = field(usable, "meeting_point")
    meeting_address = None
    if isinstance(meeting, dict):
        meeting_address = clean_text(meeting.get("address"))
    elif isinstance(meeting, str):
        meeting_address = clean_text(meeting)
    if meeting_address and re.fullmatch(r"tbd|n/?a|none|null|unknown", meeting_address, re.I):
        meeting_address = ""
    if not meeting_address:
        meeting_address = clean_text(field(usable, "location_address")) or None
    if meeting_address and re.fullmatch(r"tbd|n/?a|none|null|unknown", meeting_address, re.I):
        meeting_address = None
    included = []
    excluded = []
    itinerary = []
    restrictions = []
    bring = []
    glean_source = []
    for payload in usable:
        item_included = list_values(payload.get("what_is_included_items"))
        if item_included:
            included.extend(item_included)
        else:
            included.extend(list_values(payload.get("what_is_included")))
        item_excluded = list_values(payload.get("what_is_not_included_items"))
        if item_excluded:
            excluded.extend(item_excluded)
        else:
            excluded.extend(list_values(payload.get("what_is_not_included")))
        itinerary.extend(list_values(payload.get("itinerary")))
        restrictions.extend(restriction_lines(payload.get("restrictions")))
        bring.extend(list_values(payload.get("what_to_bring_items") or payload.get("what_to_bring")))
        glean_source.append(clean_text(payload.get("description") or ""))
        glean_source.append(clean_text(payload.get("what_is_included") or ""))
    gleaned = glean_facts(" ".join(glean_source))

    def unique(items: list[str]) -> list[str]:
        seen = set()
        result = []
        for item in items:
            if LIST_MARKETING.search(item) or SECOND_PERSON.search(item):
                continue
            key = item.lower()
            if key in seen:
                continue
            seen.add(key)
            result.append(item)
        return result

    facts = {
        "endpointStatus": endpoint_status,
        "duration": duration,
        "meetingAddress": meeting_address,
        "minAge": field(usable, "min_age"),
        "maxAge": field(usable, "max_age"),
        "groupSize": clean_text(field(usable, "group_size")).strip(" .") or None,
        "included": unique(included)[:8],
        "excluded": unique(excluded)[:6],
        "itinerary": unique(itinerary)[:6],
        "restrictions": unique(restrictions)[:4],
        "bring": unique(bring)[:5],
        "cancellation": clean_text(field(usable, "cancellation_summary")) or None,
        "factualSentences": factual_sentences(clean_text(field(usable, "description") or "")),
        "gleanedFacts": unique(gleaned)[:6],
    }
    if facts["cancellation"] and (MARKETING.search(facts["cancellation"]) or SECOND_PERSON.search(facts["cancellation"])):
        facts["cancellation"] = None

    price = extract_price(preview) if endpoint_ok(meta, "price-preview") else None
    authored = editorial[stage_a["itemId"]]
    copy = [paragraph.strip() for paragraph in authored["paragraphs"] if paragraph.strip()]
    highlights = [item.strip() for item in authored.get("highlights") or [] if item.strip()]
    schema_description = clean_text(authored.get("schemaDescription") or "")
    removed_claims = [
        item.strip() for item in authored.get("removedClaims") or [] if str(item).strip()
    ]
    gallery_images = [
        item.strip() for item in authored.get("galleryImages") or [] if str(item).strip()
    ]
    words = word_count(copy)
    if exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"} and words < 150:
        exception = "INSUFFICIENT_SOURCE_CONTENT"
        price = None
    elif exception not in {"SOURCE_NOT_FOUND", "BOOKING_PAGE_NOT_FOUND"} and price is None:
        exception = "PRICE_NOT_FOUND"
    elif exception == "BOOKING_PAGE_NOT_FOUND":
        price = None

    rows = price_rows(price) if exception == "OK" else []
    notes = []
    if stage_a["itemId"] == "694384" and exception != "SOURCE_NOT_FOUND":
        notes = motorcycle_pricing_notes(" ".join(glean_source) + source_blob(folder))

    visible = None
    offer = None
    if price and exception == "OK":
        visible = f"From {format_money(price['basis']['amount'], price['currency'])}"
        offer = {
            "type": "Offer",
            "price": schema_amount(price["basis"]["amount"]),
            "priceCurrency": price["currency"],
        }

    engine2_path = None
    if stage_a["itemId"] == "612500":
        engine2_path = (
            "/destinations/world/canada/british-columbia/vancouver/tours/"
            "guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500"
        )
    elif stage_a["itemId"] in {"34849", "193220"}:
        engine2_path = stage_a["publicPath"]

    product = {
        "itemId": stage_a["itemId"],
        "company": stage_a["operatorShortname"],
        "title": stage_a["title"],
        "operator": stage_a["operator"],
        "publicPath": stage_a["publicPath"],
        "engine2Path": engine2_path,
        "exceptionStatus": exception,
        "paragraphs": copy,
        "schemaDescription": schema_description,
        "removedClaims": removed_claims,
        "highlights": highlights if exception != "SOURCE_NOT_FOUND" else [],
        "galleryImages": gallery_images if exception != "BOOKING_PAGE_NOT_FOUND" else [],
        "wordCount": words,
        "durationLabel": facts["duration"] if exception not in {"SOURCE_NOT_FOUND", "INSUFFICIENT_SOURCE_CONTENT", "BOOKING_PAGE_NOT_FOUND"} else None,
        "durationIso": duration_iso(facts["duration"]) if exception not in {"SOURCE_NOT_FOUND", "INSUFFICIENT_SOURCE_CONTENT", "BOOKING_PAGE_NOT_FOUND"} else None,
        "meetingLocation": (
            clean_text(authored.get("meetingLocation")) or None
            if exception != "BOOKING_PAGE_NOT_FOUND"
            else None
        ),
        "visiblePriceLabel": visible,
        "priceRows": rows,
        "pricingNotes": notes,
        "offer": offer,
        "aggregateRating": None,
        "ratingProvenance": (
            "No numeric rating or review count is present in the stored FareHarbor content, "
            "structured-description, item, or price-preview payloads. Catalog quality_score and "
            "availability_count were not used. AggregateRating is omitted."
        ),
        "source": {
            "artifacts": f"data/fareharbor-lead-to-gold/proof-set/{folder.name}",
            "fetchedAt": meta.get("fetchedAt"),
            "endpoints": meta.get("endpoints"),
            "price": price,
            "facts": facts,
            "derivativeCrossCheck": derivative_notes(stage_a, facts, price),
            "bookingPageValidity": booking_validity,
        },
    }
    if stage_a["itemId"] == "694384":
        product["source"]["insuranceConflict"] = (
            "what_is_not_included calls supplemental insurance optional; "
            "special_requirements and check-in require MBA insurance at $15 per day "
            "and a $1,000 damage hold. The page follows the requirement and keeps both amounts in the pricing notes."
        )
    product["validation"] = validate(product, source_blob(folder))
    if (
        stage_a["itemId"] == "694384"
        and exception != "SOURCE_NOT_FOUND"
        and len(notes) < 2
    ):
        product["validation"]["ok"] = False
        product["validation"]["errors"].append(
            "motorcycle insurance and damage-hold notes were not found in the harvest"
        )
    return product


def before_block(stage_a: dict) -> dict:
    return {
        "publicPath": stage_a["publicPath"],
        "legacyDescription": (stage_a.get("content") or {}).get("legacyDescription"),
        "engine2TemplateDescription": (stage_a.get("content") or {}).get("engine2TemplateDescription"),
        "priceOnMain": (stage_a.get("price") or {}).get("onMain"),
        "visibleCatalogRating": (stage_a.get("rating") or {}).get("visibleCatalogRating"),
        "visibleCatalogReviewCount": (stage_a.get("rating") or {}).get("visibleCatalogReviewCount"),
        "ratingNote": "Catalog rating and review count are quality_score/20 and availability_count, not FareHarbor reviews.",
    }


def markdown_report(records: list[dict]) -> str:
    lines = [
        "# Stage B FareHarbor proof set",
        "",
        "Scope is the 10 Stage A representative products. Runtime pages read the generated module in `src/data/fareharborLeadToGoldProof.generated.ts`. They do not call FareHarbor.",
        "",
        "Products classified `BOOKING_PAGE_NOT_FOUND` remain in this audit but are excluded from the generated runtime module and every public website surface.",
        "",
        "For active proof pages, `galleryImages` contains only stored exact-product harvest media selected to replace a repeated hero. An empty list suppresses the repeated gallery image when no alternate is available.",
        "",
        "Public copy is original editorial prose written from the stored harvest. Provenance labels, HTTP statuses, and fare tables stay in this report and in the pricing block. They are not part of the description.",
        "",
        "Authority is the stored harvest under `data/fareharbor-lead-to-gold/proof-set`. The unmerged derivative on `origin/feat/fareharbor-content-rebuild` is a secondary cross-check and is not page copy.",
        "",
        "Catalog `quality_score` and `availability_count` are not ratings or review counts. The synthetic $129 price floor is not used for these 10 products. Other FareHarbor pages still use that floor.",
        "",
        "Item 34849 had been hard-deleted and covered by the red-jeep operator opt-out. This proof restores only `shared-san-andreas-fault-jeep-tour-34849` at the Palm Springs path. Other red-jeep items stay removed.",
        "",
        "## Active proof URLs",
        "",
    ]
    for record in records:
        if record["after"]["exceptionStatus"] != "BOOKING_PAGE_NOT_FOUND":
            lines.append(f"- `{record['after']['publicPath']}`")
    lines.extend(["", "## Terminal records retained for audit", ""])
    for record in records:
        if record["after"]["exceptionStatus"] == "BOOKING_PAGE_NOT_FOUND":
            lines.append(
                f"- `{record['after']['itemId']}` `{record['after']['publicPath']}` "
                "— `BOOKING_PAGE_NOT_FOUND`; excluded from public output"
            )
    lines.append("")
    for record in records:
        before = record["before"]
        source = record["after"]["source"]
        after = record["after"]
        lines.extend(
            [
                f"## {after['itemId']} {after['title']}",
                "",
                "### BEFORE",
                "",
                f"- Path: `{before['publicPath']}`",
                f"- Price on main: {before['priceOnMain']}",
                f"- Catalog rating field: {before['visibleCatalogRating']} / review field {before['visibleCatalogReviewCount']}. {before['ratingNote']}",
                f"- Legacy copy: {before['legacyDescription'] or 'none'}",
                f"- Engine 2 template copy: {before['engine2TemplateDescription'] or 'none'}",
                "",
                "### SOURCE",
                "",
                f"- Artifacts: `{source['artifacts']}`",
                f"- Fetched at: {source['fetchedAt']}",
            ]
        )
        for name, endpoint in source["endpoints"].items():
            lines.append(
                f"- {name}: HTTP {endpoint['status']} sha256 `{endpoint['sha256']}`"
            )
        price = source.get("price")
        if price:
            basis = price["basis"]
            lines.append(
                f"- Authoritative price: {format_money(basis['amount'], price['currency'])} {price['currency']} ({basis['singular']})"
            )
        else:
            lines.append("- Authoritative price: none in the stored price preview")
        lines.append(f"- Rating provenance: {after['ratingProvenance']}")
        validity = source["bookingPageValidity"]
        lines.append(
            f"- Booking-page validity: `{validity['classification']}` "
            f"(HTTP {validity['httpStatus']} at `{validity['bookingUrl']}`)"
        )
        if source.get("insuranceConflict"):
            lines.append(f"- Insurance note: {source['insuranceConflict']}")
        cross = source["derivativeCrossCheck"]
        lines.append(
            f"- Derivative cross-check: usedAsAuthority={str(cross['usedAsAuthority']).lower()}; confirmed={cross['confirmedByHarvest'] or ['none']}; not used={cross['notUsed'] or ['none']}"
        )
        lines.extend(
            [
                "",
                "### AFTER",
                "",
                f"- Exception status: `{after['exceptionStatus']}`",
                f"- Editorial word count: {after['wordCount']}",
                f"- Visible price: {after['visiblePriceLabel'] or 'omitted'}",
                f"- Duration: {after['durationLabel'] or 'omitted'}",
                f"- Meeting location: {after['meetingLocation'] or 'omitted'}",
                f"- Visible gallery images: `{json.dumps(after['galleryImages'], ensure_ascii=False)}`",
                f"- Schema and meta description: {after['schemaDescription']}",
                f"- Offer: `{json.dumps(after['offer'], ensure_ascii=False)}`",
                f"- Pricing rows: `{json.dumps(after['priceRows'], ensure_ascii=False)}`",
                f"- Pricing notes: `{json.dumps(after['pricingNotes'], ensure_ascii=False)}`",
                "- AggregateRating: omitted",
                f"- Validation: {'pass' if after['validation']['ok'] else 'fail ' + '; '.join(after['validation']['errors'])}",
                "",
                "Rewritten copy:",
                "",
            ]
        )
        for paragraph in after["paragraphs"]:
            lines.append(f"- {paragraph}")
        lines.extend(["", "Claims removed in the provenance audit:", ""])
        for claim in after["removedClaims"]:
            lines.append(f"- {claim}")
        lines.append("")
    return "\n".join(lines) + "\n"


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
        "// Generated by scripts/fareharbor-lead-to-gold/build_stage_b_proof.py\n"
        "// Stored FareHarbor harvest only. Do not edit by hand.\n"
        "export type FareHarborProofOffer = {\n"
        "  type: \"Offer\";\n"
        "  price: string;\n"
        "  priceCurrency: string;\n"
        "};\n\n"
        "export type FareHarborProofPriceRow = {\n"
        "  label: string;\n"
        "  note: string;\n"
        "  amountLabel: string;\n"
        "};\n\n"
        "export type FareHarborProofProduct = {\n"
        "  itemId: string;\n"
        "  company: string;\n"
        "  title: string;\n"
        "  publicPath: string;\n"
        "  engine2Path: string | null;\n"
        "  exceptionStatus:\n"
        "    | \"OK\"\n"
        "    | \"BOOKING_PAGE_NOT_FOUND\"\n"
        "    | \"SOURCE_NOT_FOUND\"\n"
        "    | \"PRICE_NOT_FOUND\"\n"
        "    | \"INSUFFICIENT_SOURCE_CONTENT\";\n"
        "  paragraphs: string[];\n"
        "  schemaDescription: string;\n"
        "  highlights: string[];\n"
        "  galleryImages: string[];\n"
        "  wordCount: number;\n"
        "  durationLabel: string | null;\n"
        "  durationIso: string | null;\n"
        "  meetingLocation: string | null;\n"
        "  visiblePriceLabel: string | null;\n"
        "  priceRows: FareHarborProofPriceRow[];\n"
        "  pricingNotes: string[];\n"
        "  offer: FareHarborProofOffer | null;\n"
        "  aggregateRating: null;\n"
        "  ratingProvenance: string;\n"
        "};\n\n"
        f"export const fareHarborLeadToGoldProofProducts: FareHarborProofProduct[] = {payload};\n"
    )


def main() -> None:
    stage_a_products = {item["itemId"]: item for item in load_json(STAGE_A)}
    editorial = load_editorial()
    booking_validity_records = load_json(BOOKING_VALIDITY)["products"]
    booking_validity = {
        item["itemId"]: item for item in booking_validity_records
    }
    missing = [item_id for item_id in PROOF_ORDER if item_id not in stage_a_products]
    if missing:
        raise SystemExit(f"Stage A sample is missing {missing}")
    records = []
    runtime_products = []
    for item_id in PROOF_ORDER:
        stage_a = stage_a_products[item_id]
        product = build_product(stage_a, editorial, booking_validity[item_id])
        if not product["validation"]["ok"]:
            raise SystemExit(
                f"{item_id} failed validation: {product['validation']['errors']}\n"
                + "\n".join(product["paragraphs"])
            )
        if product["exceptionStatus"] != "BOOKING_PAGE_NOT_FOUND":
            runtime_products.append(product)
        records.append({"before": before_block(stage_a), "after": product})
    if len(records) != 10:
        raise SystemExit("proof audit must contain exactly 10 products")
    REPORT_JSON.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
    REPORT_MD.write_text(markdown_report(records))
    GENERATED_TS.write_text(emit_ts(runtime_products))
    print(f"wrote {GENERATED_TS}")
    print(f"wrote {REPORT_MD}")
    for product in runtime_products:
        price = product["visiblePriceLabel"] or "no price"
        print(f"{product['itemId']} {product['exceptionStatus']} {price}")


if __name__ == "__main__":
    main()
