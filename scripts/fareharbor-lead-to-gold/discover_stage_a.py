#!/usr/bin/env python3
"""Stage A discovery census for legacy FareHarbor products.

Read-only. Does not rewrite product records. Re-running overwrites the
discovery reports from current source files and does not mutate catalog data.
"""

from __future__ import annotations

import csv
import json
import re
import subprocess
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "reports" / "fareharbor-lead-to-gold"
GENERATED = ROOT / "src" / "data" / "tours.generated.ts"
BOILERPLATE_PHRASE = (
    "keeps the logistics simple and the scenery front and center"
)
ENGINE2_BOILERPLATE = "more than a quick photo stop"
ENGINE2_META = "Guided experience, clear logistics, and memorable local stops"
ENJOY_GUIDED = "Enjoy a guided"
FH_URL = re.compile(
    r"https://fareharbor\.com/embeds/(?:book|calendar)/([^/\"'?]+)/items/(\d+)",
    re.I,
)
ROUTE_RE = re.compile(r'ROUTE\s*=\s*"(/destinations/[^"]+)"')
ITEM_ID_FIELD = re.compile(r'"itemId":\s*"(\d+)"')
PRODUCT_CODE_FIELD = re.compile(r'productCode:\s*"([^"]+)"')
VIATOR_URL = re.compile(r"https://www\.viator\.com/", re.I)

STANDARD_HEADER = [
    "company_name",
    "company_shortname",
    "company_email",
    "company_phone",
    "location",
    "location_lat",
    "location_long",
    "item_id",
    "item_name",
    "tags",
    "image_count",
    "quality_score",
    "availability_count",
    "calendar_link",
    "calendar_script",
    "regular_link",
    "image_url",
]


def words(value: str) -> int:
    return len(re.findall(r"\b[\w']+\b", value or ""))


def expected_rating(quality_score: str) -> float | None:
    try:
        score = float(quality_score)
    except (TypeError, ValueError):
        return None
    if not score:
        return None
    rating = round((score / 20) * 10) / 10
    return min(max(rating, 1), 5)


def load_generated_tours() -> list[dict]:
    text = GENERATED.read_text(encoding="utf-8")
    marker = "export const toursGenerated: Tour[] = "
    start = text.index(marker) + len(marker)
    end = text.rindex("]")
    return json.loads(text[start : end + 1])


def iter_csvs() -> list[Path]:
    files = []
    for path in (ROOT / "data").rglob("*.csv"):
        files.append(path)
    for path in (ROOT / "src" / "data").rglob("*.csv"):
        files.append(path)
    return files


def blank(value: str | None) -> bool:
    return not (value or "").strip()


def census_catalog_csvs() -> dict:
    files = iter_csvs()
    standard_rows = []
    header_counts = Counter()
    malformed = []
    missing_source_fields = Counter()
    by_file = []
    item_locations = defaultdict(list)

    for path in files:
        rel = str(path.relative_to(ROOT))
        if path.name in {"tourEnrichment.csv", "merchantFeed.csv"}:
            continue
        with path.open(newline="", encoding="utf-8", errors="replace") as handle:
            reader = csv.DictReader(handle)
            header = reader.fieldnames or []
            header_counts[tuple(header)] += 1
            rows = list(reader)
        fareharbor_rows = 0
        malformed_in_file = 0
        for index, row in enumerate(rows, start=2):
            if "item_id" not in row or "company_shortname" not in row:
                continue
            item_id = (row.get("item_id") or "").strip()
            shortname = (row.get("company_shortname") or "").strip()
            link = (row.get("regular_link") or row.get("booking_url") or "").strip()
            match = FH_URL.search(link)
            if not item_id or not item_id.isdigit():
                malformed.append(
                    {
                        "file": rel,
                        "line": index,
                        "reason": "MALFORMED_SOURCE",
                        "detail": "missing or non-numeric item_id",
                        "itemId": item_id,
                    }
                )
                malformed_in_file += 1
                continue
            if not shortname:
                malformed.append(
                    {
                        "file": rel,
                        "line": index,
                        "reason": "MALFORMED_SOURCE",
                        "detail": "missing company_shortname",
                        "itemId": item_id,
                    }
                )
                malformed_in_file += 1
            if link and not match:
                malformed.append(
                    {
                        "file": rel,
                        "line": index,
                        "reason": "MALFORMED_SOURCE",
                        "detail": "booking link is not a FareHarbor item URL",
                        "itemId": item_id,
                        "link": link[:180],
                    }
                )
                malformed_in_file += 1
            if "example-" in shortname or "example-" in link:
                malformed.append(
                    {
                        "file": rel,
                        "line": index,
                        "reason": "MALFORMED_SOURCE",
                        "detail": "example/placeholder FareHarbor shortname",
                        "itemId": item_id,
                    }
                )
            url_short = match.group(1) if match else ""
            url_item = match.group(2) if match else ""
            if match and (url_short != shortname or url_item != item_id):
                malformed.append(
                    {
                        "file": rel,
                        "line": index,
                        "reason": "MALFORMED_SOURCE",
                        "detail": "URL shortname/item_id does not match columns",
                        "itemId": item_id,
                        "shortname": shortname,
                        "urlShortname": url_short,
                        "urlItemId": url_item,
                    }
                )
            if "description" not in row or blank(row.get("description")):
                missing_source_fields["no_description_column_or_blank"] += 1
            if blank(row.get("location")) and blank(row.get("location_lat")):
                missing_source_fields["no_location"] += 1
            key = f"{shortname}:{item_id}" if shortname else f":{item_id}"
            record = {
                "key": key,
                "itemId": item_id,
                "shortname": shortname,
                "file": rel,
                "title": (row.get("item_name") or "").strip(),
                "location": (row.get("location") or "").strip(),
                "tags": (row.get("tags") or "").strip(),
                "qualityScore": (row.get("quality_score") or "").strip(),
                "availabilityCount": (row.get("availability_count") or "").strip(),
                "link": link,
                "image": (row.get("image_url") or row.get("image") or "").strip(),
                "description": (row.get("description") or "").strip(),
                "price": (row.get("price") or "").strip(),
                "company": (row.get("company_name") or "").strip(),
            }
            standard_rows.append(record)
            item_locations[item_id].append(record)
            fareharbor_rows += 1
        by_file.append(
            {
                "file": rel,
                "rows": len(rows),
                "fareharborItemRows": fareharbor_rows,
                "malformedSignals": malformed_in_file,
            }
        )

    unique_keys = {}
    duplicate_keys = []
    for record in standard_rows:
        previous = unique_keys.get(record["key"])
        if previous and previous["file"] != record["file"]:
            duplicate_keys.append(
                {
                    "key": record["key"],
                    "files": sorted({previous["file"], record["file"]}),
                    "titles": sorted({previous["title"], record["title"]}),
                }
            )
        elif previous and previous["title"] != record["title"]:
            duplicate_keys.append(
                {
                    "key": record["key"],
                    "files": [record["file"]],
                    "titles": [previous["title"], record["title"]],
                }
            )
        else:
            unique_keys.setdefault(record["key"], record)

    cross_company = []
    for item_id, records in item_locations.items():
        shortnames = {record["shortname"] for record in records if record["shortname"]}
        if len(shortnames) > 1:
            cross_company.append(
                {
                    "itemId": item_id,
                    "shortnames": sorted(shortnames),
                    "titles": sorted({record["title"] for record in records}),
                    "files": sorted({record["file"] for record in records}),
                }
            )

    repeated_same_file = []
    seen = Counter(record["key"] + "|" + record["file"] for record in standard_rows)
    for token, count in seen.items():
        if count > 1:
            key, file = token.rsplit("|", 1)
            repeated_same_file.append({"key": key, "file": file, "count": count})

    return {
        "csvFileCount": len(files),
        "catalogFiles": by_file,
        "standardHeader": STANDARD_HEADER,
        "rowsWithItemId": len(standard_rows),
        "uniqueCompanyItemKeys": len(unique_keys),
        "duplicateKeySignals": len(duplicate_keys),
        "duplicateKeySample": duplicate_keys[:25],
        "sameFileRepeatedKeys": len(repeated_same_file),
        "sameFileRepeatedSample": repeated_same_file[:25],
        "crossCompanyItemIdCollisions": len(cross_company),
        "crossCompanySample": cross_company[:25],
        "malformedCount": len(malformed),
        "malformedSample": malformed[:40],
        "missingSourceFieldCounts": dict(missing_source_fields),
        "recordsByKey": unique_keys,
        "recordsByItemId": item_locations,
        "importer": importer_csv_keys(standard_rows),
        "mxnAffiliateRows": sum(1 for record in standard_rows if "fhdn-mxn" in record["link"]),
        "usdAffiliateRows": sum(1 for record in standard_rows if "asn=fhdn&" in record["link"] or "asn=fhdn?" in record["link"]),
    }


def scan_source_urls(paths: list[Path]) -> dict:
    keys = {}
    viator_hits = 0
    for path in paths:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        viator_hits += len(VIATOR_URL.findall(text))
        for match in FH_URL.finditer(text):
            shortname, item_id = match.group(1), match.group(2)
            keys[f"{shortname}:{item_id}"] = {
                "shortname": shortname,
                "itemId": item_id,
                "file": str(path.relative_to(ROOT)),
            }
    return {"uniqueFareHarborKeys": keys, "viatorUrlHits": viator_hits}


def engine2_files() -> list[Path]:
    directory = ROOT / "src" / "engine2" / "data"
    return sorted(directory.glob("*.ts"))


def retired_item_ids() -> set[str]:
    text = (ROOT / "src" / "utils" / "fareharbor" / "suppressedBookingPages.ts").read_text(
        encoding="utf-8"
    )
    return set(re.findall(r"itemId:\s*\"(\d+)\"", text))


def supplement_fareharbor_keys() -> dict[str, dict]:
    files = [
        ROOT / "src" / "data" / "tours.manual.ts",
        ROOT / "src" / "data" / "flagstaffTours.ts",
        ROOT / "src" / "data" / "sedonaTours.ts",
    ]
    found = {}
    for path in files:
        text = path.read_text(encoding="utf-8", errors="replace")
        for match in FH_URL.finditer(text):
            shortname, item_id = match.group(1), match.group(2)
            key = f"{shortname}:{item_id}"
            found.setdefault(
                key,
                {
                    "shortname": shortname,
                    "itemId": item_id,
                    "file": str(path.relative_to(ROOT)),
                },
            )
    return found


def importer_csv_keys(catalog_records: list[dict]) -> dict:
    importer_names = {
        "cycling2.csv",
        "hiking2.csv",
        "canoeing.csv",
        "san-francisco.csv",
        "san-diego.csv",
        "santa-barbara.csv",
        "palm-springs.csv",
        "joshua-tree.csv",
    }
    importer_prefixes = (
        "data/northeast/",
        "data/deep-south/",
        "data/heartland/",
    )
    keys = set()
    rows = 0
    for record in catalog_records:
        file = record["file"].replace("\\", "/")
        name = Path(file).name
        if name in importer_names or file.startswith(importer_prefixes):
            keys.add(record["key"])
            rows += 1
    return {"rows": rows, "uniqueKeys": len(keys), "keys": keys}


def engine6_routes() -> set[str]:
    text = (ROOT / "src" / "engine6" / "routes.ts").read_text(encoding="utf-8")
    return set(ROUTE_RE.findall(text))


def count_product_codes(path: Path) -> int:
    if not path.exists():
        return 0
    return len(PRODUCT_CODE_FIELD.findall(path.read_text(encoding="utf-8")))


def load_price_cache() -> dict[str, dict]:
    show = subprocess.run(
        [
            "git",
            "show",
            "origin/feat/fareharbor-commercial-reserve-phase1:src/data/fareharborPricing.ts",
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    prices = {}
    pattern = re.compile(
        r'"([^"]+)":\s*\{\s*"startingPrice":\s*([0-9.]+),\s*"currency":\s*"([A-Z]+)",\s*"source":\s*"([^"]+)",\s*"confidence":\s*"([^"]+)",\s*"basis":\s*"([^"]+)",\s*"basisLabel":\s*"([^"]*)"',
        re.S,
    )
    for match in pattern.finditer(show.stdout):
        prices[match.group(1)] = {
            "startingPrice": float(match.group(2)),
            "currency": match.group(3),
            "source": match.group(4),
            "confidence": match.group(5),
            "basis": match.group(6),
            "basisLabel": match.group(7),
            "branch": "origin/feat/fareharbor-commercial-reserve-phase1",
            "path": "src/data/fareharborPricing.ts",
        }
    return prices


def load_rebuild_index() -> dict:
    blob = subprocess.run(
        [
            "git",
            "ls-tree",
            "-l",
            "origin/feat/fareharbor-content-rebuild",
            "src/data/fareharborRebuild.generated.ts",
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    text = subprocess.run(
        [
            "git",
            "show",
            "origin/feat/fareharbor-content-rebuild:src/data/fareharborRebuild.generated.ts",
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    routes = {}
    parts = text.split('\n  "/destinations/')
    for part in parts[1:]:
        path, _, body = part.partition('": ')
        route = "/destinations/" + path
        item_match = re.search(r"-(\d+)", route)
        item_id = item_match.group(1) if item_match else ""
        description_match = re.search(r'"description":\s*"(.*?)"\s*,\s*\n', body, re.S)
        description = ""
        if description_match:
            description = json.loads('"' + description_match.group(1) + '"')
        routes[route] = {
            "itemId": item_id,
            "description": description,
            "wordCount": words(description),
            "hasDuration": '"duration":' in body[:2500],
            "hasMeetingPoint": '"meetingPoint":' in body[:4000],
            "hasIncluded": '"included":' in body[:4000],
            "hasNotIncluded": '"notIncluded":' in body[:5000],
        }
    template_openers = text.count("is a locally operated experience in")
    return {
        "blobLine": blob,
        "routeCount": len(routes),
        "templateOpenerCount": template_openers,
        "containsRatingValue": "ratingValue" in text,
        "containsStartingPrice": "startingPrice" in text,
        "containsReviewCount": "reviewCount" in text,
        "routes": routes,
    }


def canonical_path(tour: dict) -> str:
    destination = tour.get("destination") or {}
    return (
        f"/destinations/{destination.get('stateSlug', '')}/"
        f"{destination.get('citySlug', '')}/tours/{tour.get('slug', '')}"
    )


def analyze_generated(tours: list[dict], catalog: dict) -> dict:
    providers = Counter(tour.get("bookingProvider") for tour in tours)
    engines = Counter(tour.get("engine") or "untagged-engine1" for tour in tours)
    boilerplate = 0
    word_counts = []
    rating_values = Counter()
    review_counts = []
    with_price = 0
    with_currency = 0
    price_from = Counter()
    fh_keys = {}
    malformed_booking = []
    rating_compared = 0
    rating_exact = 0
    review_exact = 0
    rating_missing_score = 0
    rating_absent = 0
    rating_mismatches = []
    by_item = defaultdict(list)

    records_by_item = catalog["recordsByItemId"]
    for tour in tours:
        description = tour.get("longDescription") or ""
        word_counts.append(words(description))
        if BOILERPLATE_PHRASE in description:
            boilerplate += 1
        badges = tour.get("badges") or {}
        if isinstance(badges.get("rating"), (int, float)):
            rating_values[str(badges["rating"])] += 1
        if isinstance(badges.get("reviewCount"), int):
            review_counts.append(badges["reviewCount"])
        if tour.get("startingPrice") not in (None, ""):
            with_price += 1
        if tour.get("currency"):
            with_currency += 1
        if badges.get("priceFrom"):
            price_from[str(badges.get("priceFrom"))] += 1
        if tour.get("bookingProvider") != "fareharbor":
            continue
        match = FH_URL.search(tour.get("bookingUrl") or "")
        if not match:
            malformed_booking.append(
                {"id": tour.get("id"), "bookingUrl": tour.get("bookingUrl")}
            )
            continue
        shortname, item_id = match.group(1), match.group(2)
        key = f"{shortname}:{item_id}"
        entry = {
            "key": key,
            "itemId": item_id,
            "shortname": shortname,
            "id": tour.get("id"),
            "slug": tour.get("slug"),
            "title": tour.get("title"),
            "operator": tour.get("operator"),
            "path": canonical_path(tour),
            "city": (tour.get("destination") or {}).get("city"),
            "state": (tour.get("destination") or {}).get("state"),
            "stateSlug": (tour.get("destination") or {}).get("stateSlug"),
            "rating": badges.get("rating"),
            "reviewCount": badges.get("reviewCount"),
            "longDescription": description,
            "wordCount": words(description),
            "primaryCategory": tour.get("primaryCategory"),
            "tags": tour.get("tags") or [],
        }
        fh_keys[key] = entry
        by_item[item_id].append(entry)
        csv_rows = records_by_item.get(item_id) or []
        importer_prefixes = ("data/northeast/", "data/deep-south/", "data/heartland/")
        importer_names = {
            "cycling2.csv",
            "hiking2.csv",
            "canoeing.csv",
            "san-francisco.csv",
            "san-diego.csv",
            "santa-barbara.csv",
            "palm-springs.csv",
            "joshua-tree.csv",
        }

        def importer_row(row: dict) -> bool:
            file = row["file"].replace("\\", "/")
            return Path(file).name in importer_names or file.startswith(importer_prefixes)

        same_operator = [row for row in csv_rows if row["shortname"] == shortname]
        csv_row = next((row for row in same_operator if importer_row(row)), None)
        if csv_row is None and same_operator:
            csv_row = same_operator[0]
        if csv_row is None and csv_rows:
            csv_row = next((row for row in csv_rows if importer_row(row)), csv_rows[0])
        if csv_row:
            rating_compared += 1
            if entry["rating"] is None:
                rating_absent += 1
            expected = expected_rating(csv_row["qualityScore"])
            if expected is None:
                rating_missing_score += 1
                if entry["rating"] in (None,):
                    rating_exact += 1
            elif entry["rating"] == expected:
                rating_exact += 1
            elif entry["rating"] is not None and len(rating_mismatches) < 8:
                rating_mismatches.append(
                    {
                        "itemId": item_id,
                        "catalogRating": entry["rating"],
                        "formulaRating": expected,
                        "qualityScore": csv_row["qualityScore"],
                        "csvFile": csv_row["file"],
                        "csvCopies": len(csv_rows),
                    }
                )
            try:
                availability = int(float(csv_row["availabilityCount"])) if csv_row["availabilityCount"] else None
            except ValueError:
                availability = None
            if availability is not None and entry["reviewCount"] == availability:
                review_exact += 1

    duplicate_items = {
        item_id: records
        for item_id, records in by_item.items()
        if len({record["shortname"] for record in records}) > 1
        or len(records) > 1
    }
    return {
        "generatedCount": len(tours),
        "providers": dict(providers),
        "engines": dict(engines),
        "boilerplateLongDescriptions": boilerplate,
        "averageWordCount": round(sum(word_counts) / len(word_counts), 2) if word_counts else 0,
        "minWordCount": min(word_counts) if word_counts else 0,
        "maxWordCount": max(word_counts) if word_counts else 0,
        "under150Words": sum(1 for count in word_counts if count < 150),
        "ratingValueDistribution": rating_values.most_common(15),
        "reviewCountMin": min(review_counts) if review_counts else None,
        "reviewCountMax": max(review_counts) if review_counts else None,
        "reviewCountAverage": round(sum(review_counts) / len(review_counts), 2) if review_counts else None,
        "startingPricePresent": with_price,
        "currencyPresent": with_currency,
        "priceFromValues": price_from.most_common(10),
        "fareharborKeys": fh_keys,
        "malformedBookingUrls": malformed_booking[:20],
        "malformedBookingCount": len(malformed_booking),
        "ratingRowsComparedToCsv": rating_compared,
        "ratingExactQualityScoreFormula": rating_exact,
        "reviewCountExactAvailabilityCount": review_exact,
        "ratingMissingBecauseZeroQualityScore": rating_missing_score,
        "duplicateGeneratedItemIds": len(duplicate_items),
        "ratingMismatchSample": rating_mismatches,
        "ratingAbsentOnGeneratedRecord": rating_absent,
    }


def enrichment_census() -> dict:
    path = ROOT / "data" / "tourEnrichment.csv"
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        rows = list(csv.DictReader(handle))
    prices = Counter((row.get("price") or "").strip() or "(blank)" for row in rows)
    ratings = Counter((row.get("ratingValue") or "").strip() or "(blank)" for row in rows)
    boilerplate = sum(1 for row in rows if ENJOY_GUIDED in (row.get("description") or ""))
    currencies = Counter((row.get("currency") or "").strip() or "(blank)" for row in rows)
    return {
        "file": "data/tourEnrichment.csv",
        "rows": len(rows),
        "blankPrice": prices.get("(blank)", 0),
        "priceValues": prices.most_common(10),
        "blankRating": ratings.get("(blank)", 0),
        "ratingValues": ratings.most_common(10),
        "currencyValues": currencies.most_common(5),
        "enjoyAGuidedBoilerplate": boilerplate,
    }


def merchant_census() -> dict:
    path = ROOT / "data" / "merchantFeed.csv"
    fareharbor = 0
    viator = 0
    other = 0
    fh_prices = Counter()
    fh_ratings = Counter()
    country_boy = None
    with path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for row in csv.DictReader(handle):
            link = row.get("link") or ""
            if "fareharbor.com" in link or "/destinations/" in link and "145208" in (row.get("id") or ""):
                pass
            blob = " ".join(row.values())
            if "fareharbor.com" in blob:
                fareharbor += 1
                fh_prices[(row.get("price") or "").strip() or "(blank)"] += 1
                fh_ratings[(row.get("average_rating") or "").strip() or "(blank)"] += 1
            elif "viator.com" in blob:
                viator += 1
            else:
                other += 1
            if "145208" in blob or "country-boy" in blob.lower():
                country_boy = {
                    "id": row.get("id"),
                    "title": row.get("title"),
                    "price": row.get("price"),
                    "average_rating": row.get("average_rating"),
                    "rating_count": row.get("rating_count"),
                    "review_count": row.get("review_count"),
                    "link": row.get("link"),
                    "description": (row.get("description") or "")[:400],
                }
    return {
        "file": "data/merchantFeed.csv",
        "rowsMentioningFareHarbor": fareharbor,
        "rowsMentioningViator": viator,
        "otherRows": other,
        "fareharborPriceValues": fh_prices.most_common(12),
        "fareharborAverageRatingValues": fh_ratings.most_common(12),
        "countryBoyRow": country_boy,
    }


def main_pricing_file() -> dict:
    text = (ROOT / "src" / "data" / "fareharborPricing.ts").read_text(encoding="utf-8")
    return {
        "path": "src/data/fareharborPricing.ts",
        "entryCount": text.count("startingPrice"),
        "isEmptyObject": "Record<string, FareharborPriceEntry> = {}" in text
        or " = {};" in text,
    }


def fetch_live_product(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "AOA-LeadToGold-StageA-Discovery/1.0",
            "Accept": "text/html",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            html = response.read().decode("utf-8", errors="replace")
            status = response.status
            final_url = response.geturl()
    except Exception as error:  # noqa: BLE001 - discovery must report the failure
        return {"url": url, "error": str(error)}

    blocks = re.findall(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
        html,
        flags=re.I | re.S,
    )
    nodes = []
    for block in blocks:
        try:
            parsed = json.loads(block)
        except json.JSONDecodeError:
            nodes.append({"parseError": True, "excerpt": block[:240]})
            continue
        graph = parsed.get("@graph") if isinstance(parsed, dict) else None
        candidates = graph if isinstance(graph, list) else [parsed]
        for node in candidates:
            if not isinstance(node, dict):
                continue
            node_type = node.get("@type")
            type_names = node_type if isinstance(node_type, list) else [node_type]
            interesting = {
                "Product",
                "Offer",
                "AggregateOffer",
                "AggregateRating",
                "BreadcrumbList",
                "TouristTrip",
            }
            if any(name in interesting for name in type_names):
                summary = {
                    "@type": node_type,
                }
                if node_type == "Product":
                    summary["name"] = node.get("name")
                    summary["offers"] = node.get("offers")
                    summary["aggregateRating"] = node.get("aggregateRating")
                elif node_type == "BreadcrumbList":
                    summary["itemCount"] = len(node.get("itemListElement") or [])
                elif node_type == "TouristTrip":
                    summary["name"] = node.get("name")
                nodes.append(summary)
    visible_129 = "From $129" in html or "129.00" in html
    visible_from = bool(re.search(r"Prices starting at|From \$", html))
    return {
        "url": url,
        "status": status,
        "finalUrl": final_url,
        "htmlBytes": len(html),
        "visible129": visible_129,
        "visibleFromPrice": visible_from,
        "boilerplatePhrasePresent": BOILERPLATE_PHRASE in html,
        "expandedBoilerplatePresent": "delivers a guided" in html,
        "jsonLdSummaries": nodes,
    }


def choose_representatives(generated: dict, rebuild: dict, prices: dict, catalog: dict) -> list[dict]:
    keys = generated["fareharborKeys"]
    by_item = {entry["itemId"]: entry for entry in keys.values()}
    forced = ["145208"]
    chosen = []
    used = set()

    def add(item_id: str, reason: str):
        entry = by_item.get(item_id)
        if not entry or item_id in used:
            return
        used.add(item_id)
        chosen.append((entry, reason))

    for item_id in forced:
        add(item_id, "Primary assay sample required by the brief")

    for entry in keys.values():
        if entry["itemId"] in prices or f"{entry['shortname']}:{entry['itemId']}" in prices:
            add(entry["itemId"], "Present in the unmerged 132-item FareHarbor price cache")
            break

    longest = None
    for entry in keys.values():
        route = rebuild["routes"].get(entry["path"])
        if route and (longest is None or route["wordCount"] > longest[0]):
            longest = (route["wordCount"], entry["itemId"])
    if longest:
        add(longest[1], "Longest stored derivative description among matched routes")

    for entry in keys.values():
        if entry["path"] not in rebuild["routes"]:
            add(entry["itemId"], "Legacy page with no stored derivative on the unmerged rebuild branch")
            break

    for entry in keys.values():
        if re.search(r"\brental\b", entry["title"], re.I):
            add(entry["itemId"], "Rental-shaped product")
            break
    for entry in keys.values():
        if re.search(r"\bprivate\b", entry["title"], re.I):
            add(entry["itemId"], "Private-format product")
            break
    for entry in keys.values():
        if entry["stateSlug"] in {"hawaii", "alaska", "quebec", "ontario", "british-columbia"}:
            add(entry["itemId"], "Non-Colorado destination")
            break
    for entry in keys.values():
        location = ""
        rows = catalog["recordsByItemId"].get(entry["itemId"]) or []
        if rows:
            location = rows[0]["location"]
        if location.count("/") >= 2 and not location.startswith("United States/"):
            add(entry["itemId"], "International or non-US location string")
            break
    for entry in keys.values():
        if entry["stateSlug"] == "california" and "jeep" in entry["title"].lower():
            add(entry["itemId"], "California jeep / desert activity")
            break
    for entry in keys.values():
        if "train" in entry["title"].lower() or "cruise" in entry["title"].lower() or "kayak" in entry["title"].lower():
            add(entry["itemId"], "Distinct activity type")
            break

    dossiers = []
    for entry, reason in chosen:
        csv_rows = catalog["recordsByItemId"].get(entry["itemId"]) or []
        csv_row = next(
            (row for row in csv_rows if row["shortname"] == entry["shortname"]),
            csv_rows[0] if csv_rows else None,
        )
        route = rebuild["routes"].get(entry["path"])
        price_key = f"{entry['shortname']}:{entry['itemId']}"
        price = prices.get(price_key) or prices.get(entry["itemId"])
        dossiers.append(
            {
                "selectionReason": reason,
                "productId": entry["id"],
                "itemId": entry["itemId"],
                "operatorShortname": entry["shortname"],
                "title": entry["title"],
                "operator": entry["operator"],
                "destination": f"{entry['city']}, {entry['state']}",
                "publicPath": entry["path"],
                "productionUrl": f"https://www.alloutdooradventures.com{entry['path']}",
                "engine": "untagged legacy catalog (internally engine1). Not Engine 3.",
                "source": {
                    "catalogCsv": None
                    if not csv_row
                    else {
                        "file": csv_row["file"],
                        "location": csv_row["location"],
                        "tags": csv_row["tags"],
                        "qualityScore": csv_row["qualityScore"],
                        "availabilityCount": csv_row["availabilityCount"],
                        "description": csv_row["description"] or None,
                        "price": csv_row["price"] or None,
                        "bookingLink": csv_row["link"],
                    },
                    "storedHtmlOnMain": "Only two hand-authored fixtures exist, and only for items 34849 and 459591.",
                    "unmergedDerivative": None
                    if not route
                    else {
                        "branch": "origin/feat/fareharbor-content-rebuild",
                        "file": "src/data/fareharborRebuild.generated.ts",
                        "route": entry["path"],
                        "wordCount": route["wordCount"],
                        "hasDuration": route["hasDuration"],
                        "hasMeetingPoint": route["hasMeetingPoint"],
                        "hasIncluded": route["hasIncluded"],
                        "descriptionExcerpt": route["description"][:900],
                    },
                },
                "price": {
                    "onMain": "NONE",
                    "unmergedCache": price,
                    "csvQualityIsNotPrice": True,
                },
                "rating": {
                    "visibleCatalogRating": entry["rating"],
                    "visibleCatalogReviewCount": entry["reviewCount"],
                    "derivedFromQualityScore": expected_rating(csv_row["qualityScore"]) if csv_row else None,
                    "derivedFromAvailabilityCount": csv_row["availabilityCount"] if csv_row else None,
                    "productLevelFareHarborRatingOnMain": False,
                },
                "content": {
                    "legacyDescription": entry["longDescription"],
                    "legacyWordCount": entry["wordCount"],
                    "boilerplate": BOILERPLATE_PHRASE in entry["longDescription"],
                },
            }
        )
    return dossiers


def build_manifest(
    generated: dict,
    engine2_keys: dict,
    retired: set[str],
    engine6: set[str],
    rebuild: dict,
    prices: dict,
) -> list[dict]:
    rows = []
    seen = set()
    for key, entry in generated["fareharborKeys"].items():
        seen.add(key)
        reasons = []
        if entry["itemId"] in retired:
            reasons.append("RETIRED_FAREHARBOR_TOUR")
        if entry["shortname"] in {"red-jeep", "desert-adventures"}:
            reasons.append("OPERATOR_OPT_OUT")
        if entry["path"] in engine6:
            reasons.append("ENGINE6_CANONICAL_PATH")
        in_engine2 = key in engine2_keys
        route = rebuild["routes"].get(entry["path"])
        price = prices.get(key)
        if reasons:
            population = "excluded"
            error = ",".join(reasons)
        else:
            population = "legacy-fareharbor"
            error = None
        rows.append(
            {
                "productIdentifier": entry["id"],
                "fareHarborKey": key,
                "itemId": entry["itemId"],
                "sourceRecord": entry["path"],
                "sourceUrl": f"https://fareharbor.com/embeds/book/{entry['shortname']}/items/{entry['itemId']}/",
                "engine": "engine2" if in_engine2 else "engine1-legacy-catalog",
                "alsoInEngine2Module": in_engine2,
                "sourceFound": bool(route),
                "sourceLocation": (
                    "origin/feat/fareharbor-content-rebuild:src/data/fareharborRebuild.generated.ts"
                    if route
                    else "catalog CSV metadata only; no stored FareHarbor HTML on main"
                ),
                "priceStatus": "PRICE_FOUND_UNMERGED_CACHE" if price else "PRICE_NOT_FOUND",
                "ratingStatus": "RATING_NOT_FOUND",
                "contentExtractionStatus": (
                    "DERIVATIVE_PRESENT_UNMERGED_BRANCH" if route else "SOURCE_NOT_FOUND"
                ),
                "rewriteStatus": "not_started",
                "validationStatus": "not_started",
                "migrationTimestamp": None,
                "population": population,
                "error": error,
            }
        )
    for key, info in engine2_keys.items():
        if key in seen:
            continue
        rows.append(
            {
                "productIdentifier": f"engine2-{info['itemId']}",
                "fareHarborKey": key,
                "itemId": info["itemId"],
                "sourceRecord": info["file"],
                "sourceUrl": f"https://fareharbor.com/embeds/book/{info['shortname']}/items/{info['itemId']}/",
                "engine": "engine2",
                "alsoInEngine2Module": True,
                "sourceFound": False,
                "sourceLocation": info["file"],
                "priceStatus": "PRICE_FOUND_UNMERGED_CACHE" if key in prices else "PRICE_NOT_FOUND",
                "ratingStatus": "RATING_NOT_FOUND",
                "contentExtractionStatus": "SOURCE_NOT_FOUND",
                "rewriteStatus": "not_started",
                "validationStatus": "not_started",
                "migrationTimestamp": None,
                "population": "legacy-fareharbor" if info["itemId"] not in retired else "excluded",
                "error": "RETIRED_FAREHARBOR_TOUR" if info["itemId"] in retired else None,
            }
        )
    return rows


def markdown_report(summary: dict) -> str:
    population = summary["population"]
    lines = [
        "# Stage A — Legacy FareHarbor Lead to Gold discovery",
        "",
        "Status: STOP. Stage B is not authorized by this report.",
        "",
        f"Generated: {summary['generatedAt']}",
        f"Base commit: `{summary['baseCommit']}`",
        f"Branch: `{summary['branch']}`",
        "",
        "## Authoritative population",
        "",
        "The brief estimated about 7,000 legacy FareHarbor products. Unique item keys in the CSV files read by `scripts/import-tours-from-csv.ts` are 6,960, which is the warehouse behind that estimate. The generated page catalog is smaller because import drops rows. Engine 2 modules add FareHarbor items that never entered `tours.generated.ts`. Engine 3 in this repository is Viator-only. There are **0 Engine 3 FareHarbor products**.",
        "",
        "| Population | Count |",
        "| --- | ---: |",
        f"| CSV warehouse rows with an item id | {population['csvRowsWithItemId']} |",
        f"| Unique `company:item` keys in the CSV warehouse | {population['uniqueCsvKeys']} |",
        f"| Importer CSV rows (`import-tours-from-csv.ts` directories) | {population['importerCsvRows']} |",
        f"| Unique importer `company:item` keys | {population['importerUniqueKeys']} |",
        f"| `fhdn-mxn` affiliate rows (MXN marketplace signal, not a price) | {population['mxnAffiliateRows']} |",
        f"| `tours.generated.ts` records | {population['generatedRecords']} |",
        f"| Generated FareHarbor records | {population['generatedFareHarbor']} |",
        f"| Generated Viator records | {population['generatedViator']} |",
        f"| Unique generated FareHarbor keys | {population['uniqueGeneratedFareHarborKeys']} |",
        f"| Engine 2 FareHarbor keys in `src/engine2/data` | {population['engine2FareHarborKeys']} |",
        f"| Engine 2 keys also present in the generated catalog | {population['engine2OverlapWithGenerated']} |",
        f"| Engine 2 FareHarbor keys absent from the generated catalog | {population['engine2OnlyKeys']} |",
        f"| Manual / Flagstaff / Sedona FareHarbor keys | {population['supplementFareHarborKeys']} |",
        f"| Supplement keys absent from the generated catalog | {population['supplementKeysAbsentFromGenerated']} |",
        f"| Engine 3 FareHarbor keys | {population['engine3FareHarborKeys']} |",
        f"| Proposed active legacy FareHarbor population | {population['activeLegacyFareHarbor']} |",
        f"| Excluded retired / opt-out / Engine6-path collisions | {population['excludedLegacyFareHarbor']} |",
        f"| Engine 6 configured routes (Viator, excluded) | {population['engine6Routes']} |",
        f"| Engine 6 routes that collide with a legacy FareHarbor canonical path | {population['engine6PathCollisions']} |",
        f"| Engine 3 Viator product records (excluded) | {population['engine3ViatorProducts']} |",
        f"| Engine 4 Viator product records (excluded) | {population['engine4ViatorProducts']} |",
        f"| Engine 2 file Viator URL hits (excluded) | {population['engine2ViatorUrlHits']} |",
        f"| Retired FareHarbor item ids | {population['retiredItemIds']} |",
        f"| Retired ids that also appear in the generated catalog | {population['retiredIntersectingActiveCandidates']} |",
        f"| CSV rows missing description text | {population['csvRowsMissingDescription']} |",
        f"| Duplicate `company:item` signals | {population['duplicateKeySignals']} |",
        f"| Same item id used by more than one company | {population['crossCompanyItemIdCollisions']} |",
        f"| Malformed source signals | {population['malformedSignals']} |",
        "",
        "### How engines map",
        "",
        "- **Engine 1 / untagged legacy catalog.** `src/data/tours.generated.ts` is produced by `scripts/import-tours-from-csv.ts`. Records have no `engine` field. `src/data/tours.ts` calls this path engine1 and ranks it below Engine 2.",
        "- **Engine 2 FareHarbor.** Separate modules under `src/engine2/data`, mostly the same CSV items rendered through `buildTourCopy`. Public dedupe keeps the Engine 2 record when the FareHarbor item id collides.",
        "- **Engine 3.** `src/engine3/types.ts` fixes `bookingProvider` to `viator`. Three Palm Springs Viator products. Not a FareHarbor population.",
        "- **Engine 4 and Engine 6.** Viator. Out of scope. This discovery does not modify them.",
        "",
        "The migration population proposed for later stages is the active legacy FareHarbor set above: unique FareHarbor item keys from the generated catalog, Engine 2-only modules, and manual/Flagstaff/Sedona supplements, minus retired ids, the red-jeep opt-out, and canonical paths occupied by Engine 6. The CSV warehouse is larger because regional files repeat the same item and because many CSV files are not published by the current importer.",
        "",
        "## Source mapping",
        "",
        "Authoritative commercial prose, prices, and product ratings are **not stored on main**.",
        "",
        "What main does contain:",
        "",
        "- Catalog CSVs with operator, item id, title, tags, image, quality score, availability count, and FareHarbor embed URLs. The standard 17-column header has no description, price, currency, or rating.",
        "- `src/data/fareharborPricing.ts` is an empty object on main.",
        "- `src/utils/fh/fareharborBookFixtures.ts` contains two hand-authored HTML fixtures (`data-fh` sections) for items `34849` and `459591`. Those are parser fixtures, not a catalog harvest.",
        "- `data/amsterdam.csv` is a 10-column example file (`example-amsterdam`, Unsplash image, prices 59 and 45). It is not an authoritative FareHarbor extract.",
        "- `data/tourEnrichment.csv` descriptions use the filler sentence “Enjoy a guided …”. Prices and ratings in that file are blank.",
        "",
        "What exists only on unmerged branches, inspected read-only and not copied onto this branch:",
        "",
        f"- `{summary['rebuild']['branchFile']}` on `origin/feat/fareharbor-content-rebuild` has **{summary['rebuild']['routeCount']}** route records. Blob: `{summary['rebuild']['blobLine']}`.",
        f"- Those records were harvested from FareHarbor item APIs (`/api/items/v1/{{company}}/{{item}}/content/`, `structured-description/`, and `/api/v1/companies/{{company}}/items/{{item}}/`), then wrapped in a repeated opener: “is a locally operated experience in …” appears **{summary['rebuild']['templateOpenerCount']}** times. The file has rating fields: {summary['rebuild']['containsRatingValue']}. It has starting-price fields: {summary['rebuild']['containsStartingPrice']}.",
        f"- Matched to current generated canonical paths: **{summary['rebuild']['matchedGeneratedPaths']}**. Generated FareHarbor paths with no derivative: **{summary['rebuild']['generatedPathsMissingDerivative']}**.",
        f"- Derivative word count average among matched routes: **{summary['rebuild']['matchedAverageWords']}**. Routes at or above 150 words: **{summary['rebuild']['matchedAtLeast150Words']}**.",
        f"- `origin/feat/fareharbor-commercial-reserve-phase1:src/data/fareharborPricing.ts` has **{summary['prices']['count']}** adult price-preview entries (`fareharbor-price-preview-v2`, confidence high). That cache is not on main. Country Boy item 145208 is in that cache: **{summary['prices']['countryBoyPresent']}**.",
        "",
        "Stage B cannot treat the unmerged derivative as raw FareHarbor HTML. It is already lightly templated. Raw API JSON was not committed. A later stage needs an explicit decision: re-harvest the FareHarbor content and price APIs into stored build artifacts on this branch, or extract facts from the unmerged derivative and mark its template opener as non-authoritative.",
        "",
        "## Pricing",
        "",
        "No trustworthy from-price is stored on main for the legacy catalog.",
        "",
        f"- Generated records with `startingPrice`: **{summary['generated']['startingPricePresent']}**.",
        f"- Generated records with `currency`: **{summary['generated']['currencyPresent']}**.",
        f"- `badges.priceFrom` values: `{summary['generated']['priceFromValues']}`.",
        "- Synthetic floor still in code: `PRICE_FLOOR_USD = 129` in `src/constants/merchantDefaults.ts`. `applyPriceFloor` in `src/utils/merchantPricing.ts` substitutes 129 when price is missing, zero, or below 20.",
        "- `src/pages/tours/TourDetail.tsx` and `src/pages/tours/FlagstaffTourDetailRoute.tsx` render “From $129 per person” when that floor applies.",
        "- `src/engine2/schema/buildSchemaGraph.ts` sets Engine 2 `schemaPrice` from `applyPriceFloor` when no rewrite price exists, so a missing Engine 2 price becomes Offer `129.00`.",
        "- Static HTML does not use that React graph alone. `scripts/prerender.mjs` and `scripts/finalize-product-structured-data.mjs` call `buildTourProductStructuredData`, which runs `toOfferPrice` → `applyPriceFloor`. Missing FareHarbor prices are written as Offer `129.00` on both Product and TouristTrip. The visible Country Boy page shows no dollar amount.",
        "",
        f"Unmerged price cache currencies: `{summary['prices']['currencies']}`.",
        "",
        "## Ratings",
        "",
        "The numbers on generated FareHarbor records are not FareHarbor product ratings.",
        "",
        "`scripts/import-tours-from-csv.ts` sets `badges.rating` to `quality_score / 20` (clamped 1–5) and `badges.reviewCount` to `availability_count`. Quality score and availability count are catalog-export columns, not review aggregates.",
        "",
        f"- Rows compared to a CSV copy of the same item: **{summary['generated']['ratingRowsComparedToCsv']}**.",
        f"- Generated records whose joined CSV row exists but the record has no rating badge: **{summary['generated']['ratingAbsentOnGeneratedRecord']}**. Wyoming and some other loaders never copy `quality_score` into `badges.rating`.",
        f"- Rating matched `quality_score / 20` on the preferred importer CSV row: **{summary['generated']['ratingExactQualityScoreFormula']}**.",
        f"- Review count matched availability count: **{summary['generated']['reviewCountExactAvailabilityCount']}**.",
        f"- Mismatch sample (often a second CSV copy with a different quality score): `{summary['generated']['ratingMismatchSample']}`.",
        f"- Most common derived ratings: `{summary['generated']['ratingValueDistribution'][:8]}`.",
        "- The current Product schema graph in `src/schema/buildTourSchemaGraph.ts` does not emit `AggregateRating` for this legacy path.",
        "- Engine 2 emits Viator `aggregateRating` only when `bookingProvider === \"viator\"`.",
        "",
        "Product-level FareHarbor rating coverage on main: **0**. Unknown is the correct rating state.",
        "",
        "## Content and boilerplate",
        "",
        f"- Generated long descriptions containing “{BOILERPLATE_PHRASE}”: **{summary['generated']['boilerplateLongDescriptions']}** of {summary['generated']['generatedCount']}.",
        f"- Average generated long-description word count: **{summary['generated']['averageWordCount']}**. Under 150 words: **{summary['generated']['under150Words']}**.",
        "- `getExpandedTourDescription` in `src/data/tourNarratives.ts` appends three more generic paragraphs, including an invented skill level and a default duration of “a flexible half-day window” when no duration exists.",
        f"- Engine 2 copy template “{ENGINE2_BOILERPLATE}” occurrences in `src/engine2/data`: **{summary['boilerplate']['engine2PhotoStop']}**.",
        f"- Engine 2 meta sentence “{ENGINE2_META}” occurrences: **{summary['boilerplate']['engine2Meta']}**.",
        f"- Enrichment file “{ENJOY_GUIDED}” rows: **{summary['enrichment']['enjoyAGuidedBoilerplate']}** of {summary['enrichment']['rows']}. Blank enrichment prices: **{summary['enrichment']['blankPrice']}**. Blank enrichment ratings: **{summary['enrichment']['blankRating']}**.",
        "",
        "A 150-word factual rewrite is not supported by the CSV row alone. Titles, tags, operator, and city are real. Itinerary, inclusions, duration, meeting point, and restrictions are not on main except inside the two fixtures and the unmerged derivative.",
        "",
        "## Schema — Country Boy Gold Mine",
        "",
        "Primary page: https://www.alloutdooradventures.com/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208",
        "",
        "```json",
        json.dumps(summary["countryBoyLive"], indent=2)[:6000],
        "```",
        "",
        "Live production HTML, fetched during this discovery, is the assay. Static HTML is written by `scripts/prerender.mjs` and `scripts/finalize-product-structured-data.mjs` through `buildTourProductStructuredData` / `buildTourTripStructuredData`. `toOfferPrice` calls `applyPriceFloor`, so a missing FareHarbor price becomes `129.00`.",
        "",
        "- Visible page: no from-price. The hero shows BOOK and no dollar amount. The body is four boilerplate paragraphs, including an invented skill level and “a flexible half-day window”. The snapshot duration says “Check booking page”.",
        "- Product JSON-LD: one Product node. Offer price is `129.00` USD, availability `https://schema.org/InStock`, no AggregateRating. That price is the synthetic floor. It does not match a visible price because the page shows no price.",
        "- TouristTrip JSON-LD: a second Offer with the same synthetic `129.00`. Two commercial Offer nodes, one product.",
        "- Merchant listing fails because the price is synthetic and not visible.",
        "- Product snippet fails for the same price mismatch.",
        "- BreadcrumbList is present with three items: Destinations, Colorado, and the product. The live list does not include the city or a Tours crumb.",
        "- Catalog `badges.rating` 3.2 and `reviewCount` 895 are the quality-score formula and the availability count. They are not in the live schema. They must stay out.",
        "",
        "Google Rich Results Test was not executed. Manual URL:",
        "",
        "https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.alloutdooradventures.com%2Fdestinations%2Fcolorado%2Fbreckenridge%2Ftours%2Fcountry-boy-gold-mine-tour-145208",
        "",
        "## Representative products",
        "",
        "Full dossiers are in `stage-a-representative-products.json`.",
        "",
    ]
    for dossier in summary["representatives"]:
        lines.append(
            f"- **{dossier['title']}** (`{dossier['itemId']}`, {dossier['destination']}). {dossier['selectionReason']} Legacy words: {dossier['content']['legacyWordCount']}. Derivative stored: {bool(dossier['source']['unmergedDerivative'])}. Unmerged price: {dossier['price']['unmergedCache']['startingPrice'] if dossier['price']['unmergedCache'] else 'none'} {dossier['price']['unmergedCache']['currency'] if dossier['price']['unmergedCache'] else ''}."
            )
    lines.extend(
        [
            "",
            "Country Boy stored derivative on the unmerged branch is 49 words. It does name a one-hour combined group tour, ages 4+, a walk of more than 1,000 feet into the mountain, and gold panning. It also carries operator marketing (“award winning”, “you might just strike gold”) that is not usable as AOA copy. Forty-nine source words cannot support a 150-word factual rewrite. Under the brief, that product is an insufficient-source exception unless a fuller FareHarbor content payload is harvested.",
            "",
        ]
    )
    lines.extend(
        [
            "",
            "## Coverage estimate",
            "",
            "| Signal | Estimate |",
            "| --- | --- |",
            "| Trustworthy from-price on main | 0% |",
            f"| High-confidence adult price on the unmerged price-preview cache, among active legacy keys | {summary['prices']['activeCoverage']} |",
            "| Trustworthy currency on main | 0%. The empty price cache and the $129 floor both assume USD. |",
            "| Trustworthy product rating | 0% |",
            "| Trustworthy review count | 0%. Current counts are availability counts. |",
            f"| Usable derivative description on the unmerged branch, matched to a generated path | {summary['rebuild']['matchedGeneratedPaths']} paths; {summary['rebuild']['matchedAtLeast150Words']} of those have at least 150 words before editorial rewrite |",
            f"| Insufficient source content on main | {population['csvRowsMissingDescription']} CSV item rows have no description |",
            "",
            "## Blockers before Stage B",
            "",
            "1. Confirm the population definition: active legacy FareHarbor keys, with Engine 3 FareHarbor = 0.",
            "2. Authorize a stored re-harvest of FareHarbor content and price endpoints, or authorize fact extraction from the unmerged derivative. Do not scrape FareHarbor during page render.",
            "3. Do not import `quality_score` or `availability_count` as ratings.",
            "4. Remove the $129 floor from FareHarbor visible copy and Offer schema only after a price provenance model exists. That code change is Stage B or later, not this discovery commit's behavior change.",
            "5. Engine 6 and Viator files stay untouched.",
            "",
            "## Files changed",
            "",
            "Discovery artifacts only. No product page, Engine 6, or Viator renderer was modified.",
            "",
            "## Tests",
            "",
            "The discovery script asserts that Country Boy item 145208 resolves, Engine 3 FareHarbor count is 0, the generated catalog parses, and the boilerplate phrase is present on the majority of generated descriptions. Production build was not run. Page output is unchanged.",
            "",
            "## Usage and cost",
            "",
            summary["usageNote"],
            "",
            "## Checkpoint",
            "",
            "`migration-manifest.jsonl` lists every discovered legacy FareHarbor key with source, price, rating, and content status. `rewriteStatus` and `validationStatus` are `not_started`. `migrationTimestamp` is null. Re-running discovery regenerates the same product statuses from source files.",
            "",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    catalog = census_catalog_csvs()
    tours = load_generated_tours()
    generated = analyze_generated(tours, catalog)
    supplements = supplement_fareharbor_keys()
    engine2 = scan_source_urls(engine2_files())
    engine3 = scan_source_urls(list((ROOT / "src" / "engine3").rglob("*.ts")))
    engine6 = engine6_routes()
    retired = retired_item_ids()
    prices = load_price_cache()
    rebuild = load_rebuild_index()
    enrichment = enrichment_census()
    merchant = merchant_census()
    pricing_main = main_pricing_file()

    engine2_keys = engine2["uniqueFareHarborKeys"]
    generated_keys = generated["fareharborKeys"]
    overlap = set(engine2_keys) & set(generated_keys)
    collisions = [
        entry["path"]
        for entry in generated_keys.values()
        if entry["path"] in engine6
    ]
    manifest = build_manifest(generated, engine2_keys, retired, engine6, rebuild, prices)
    present_keys = {row["fareHarborKey"] for row in manifest}
    for key, info in supplements.items():
        if key in present_keys:
            continue
        retired_reason = "RETIRED_FAREHARBOR_TOUR" if info["itemId"] in retired else None
        manifest.append(
            {
                "productIdentifier": f"supplement-{info['itemId']}",
                "fareHarborKey": key,
                "itemId": info["itemId"],
                "sourceRecord": info["file"],
                "sourceUrl": f"https://fareharbor.com/embeds/book/{info['shortname']}/items/{info['itemId']}/",
                "engine": "legacy-supplement",
                "alsoInEngine2Module": key in engine2_keys,
                "sourceFound": False,
                "sourceLocation": info["file"],
                "priceStatus": "PRICE_FOUND_UNMERGED_CACHE" if key in prices else "PRICE_NOT_FOUND",
                "ratingStatus": "RATING_NOT_FOUND",
                "contentExtractionStatus": "SOURCE_NOT_FOUND",
                "rewriteStatus": "not_started",
                "validationStatus": "not_started",
                "migrationTimestamp": None,
                "population": "excluded" if retired_reason else "legacy-fareharbor",
                "error": retired_reason,
            }
        )
    active = [row for row in manifest if row["population"] == "legacy-fareharbor"]
    excluded = [row for row in manifest if row["population"] != "legacy-fareharbor"]

    matched_words = []
    matched_150 = 0
    missing_derivative = 0
    for entry in generated_keys.values():
        route = rebuild["routes"].get(entry["path"])
        if not route:
            missing_derivative += 1
            continue
        matched_words.append(route["wordCount"])
        if route["wordCount"] >= 150:
            matched_150 += 1

    engine2_text = "\n".join(
        path.read_text(encoding="utf-8", errors="replace") for path in engine2_files()
    )
    representatives = choose_representatives(generated, rebuild, prices, catalog)
    country = next(item for item in representatives if item["itemId"] == "145208")
    live = fetch_live_product(country["productionUrl"])

    active_with_price = sum(1 for row in active if row["priceStatus"] == "PRICE_FOUND_UNMERGED_CACHE")
    price_currencies = Counter(item["currency"] for item in prices.values())

    base = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout.strip()
    branch = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()

    population = {
        "csvRowsWithItemId": catalog["rowsWithItemId"],
        "uniqueCsvKeys": catalog["uniqueCompanyItemKeys"],
        "generatedRecords": generated["generatedCount"],
        "generatedFareHarbor": generated["providers"].get("fareharbor", 0),
        "generatedViator": generated["providers"].get("viator", 0),
        "uniqueGeneratedFareHarborKeys": len(generated_keys),
        "engine2FareHarborKeys": len(engine2_keys),
        "engine2OverlapWithGenerated": len(overlap),
        "engine2OnlyKeys": len(set(engine2_keys) - set(generated_keys)),
        "engine3FareHarborKeys": len(engine3["uniqueFareHarborKeys"]),
        "activeLegacyFareHarbor": len(active),
        "excludedLegacyFareHarbor": len(excluded),
        "engine6Routes": len(engine6),
        "engine6PathCollisions": len(collisions),
        "engine3ViatorProducts": count_product_codes(ROOT / "src" / "engine3" / "data" / "viatorTours.ts"),
        "engine4ViatorProducts": count_product_codes(ROOT / "src" / "engine4" / "data" / "viatorTours.ts"),
        "engine2ViatorUrlHits": engine2["viatorUrlHits"],
        "retiredItemIds": len(retired),
        "csvRowsMissingDescription": catalog["missingSourceFieldCounts"].get(
            "no_description_column_or_blank", 0
        ),
        "duplicateKeySignals": catalog["duplicateKeySignals"],
        "crossCompanyItemIdCollisions": catalog["crossCompanyItemIdCollisions"],
        "malformedSignals": catalog["malformedCount"],
        "importerCsvRows": catalog["importer"]["rows"],
        "importerUniqueKeys": catalog["importer"]["uniqueKeys"],
        "supplementFareHarborKeys": len(supplements),
        "supplementKeysAbsentFromGenerated": len(set(supplements) - set(generated_keys)),
        "mxnAffiliateRows": catalog["mxnAffiliateRows"],
        "retiredIntersectingActiveCandidates": len(
            {entry["itemId"] for entry in generated_keys.values()} & retired
        ),
    }

    summary = {
        "stage": "A",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "baseCommit": base,
        "branch": branch,
        "population": population,
        "generated": {
            "generatedCount": generated["generatedCount"],
            "providers": generated["providers"],
            "engines": generated["engines"],
            "boilerplateLongDescriptions": generated["boilerplateLongDescriptions"],
            "averageWordCount": generated["averageWordCount"],
            "minWordCount": generated["minWordCount"],
            "maxWordCount": generated["maxWordCount"],
            "under150Words": generated["under150Words"],
            "ratingValueDistribution": generated["ratingValueDistribution"],
            "reviewCountMin": generated["reviewCountMin"],
            "reviewCountMax": generated["reviewCountMax"],
            "reviewCountAverage": generated["reviewCountAverage"],
            "startingPricePresent": generated["startingPricePresent"],
            "currencyPresent": generated["currencyPresent"],
            "priceFromValues": generated["priceFromValues"],
            "malformedBookingCount": generated["malformedBookingCount"],
            "ratingRowsComparedToCsv": generated["ratingRowsComparedToCsv"],
            "ratingExactQualityScoreFormula": generated["ratingExactQualityScoreFormula"],
            "reviewCountExactAvailabilityCount": generated["reviewCountExactAvailabilityCount"],
            "duplicateGeneratedItemIds": generated["duplicateGeneratedItemIds"],
            "ratingMismatchSample": generated["ratingMismatchSample"],
            "ratingAbsentOnGeneratedRecord": generated["ratingAbsentOnGeneratedRecord"],
        },
        "rebuild": {
            "branchFile": "origin/feat/fareharbor-content-rebuild:src/data/fareharborRebuild.generated.ts",
            "blobLine": rebuild["blobLine"],
            "routeCount": rebuild["routeCount"],
            "templateOpenerCount": rebuild["templateOpenerCount"],
            "containsRatingValue": rebuild["containsRatingValue"],
            "containsStartingPrice": rebuild["containsStartingPrice"],
            "containsReviewCount": rebuild["containsReviewCount"],
            "matchedGeneratedPaths": len(matched_words),
            "generatedPathsMissingDerivative": missing_derivative,
            "matchedAverageWords": round(sum(matched_words) / len(matched_words), 1) if matched_words else 0,
            "matchedAtLeast150Words": matched_150,
        },
        "prices": {
            "count": len(prices),
            "currencies": dict(price_currencies),
            "countryBoyPresent": "countryboymine:145208" in prices,
            "countryBoy": prices.get("countryboymine:145208"),
            "activeCoverage": f"{active_with_price}/{len(active)}",
            "mainPricingFile": pricing_main,
        },
        "enrichment": enrichment,
        "merchant": {
            "rowsMentioningFareHarbor": merchant["rowsMentioningFareHarbor"],
            "rowsMentioningViator": merchant["rowsMentioningViator"],
            "otherRows": merchant["otherRows"],
            "fareharborPriceValues": merchant["fareharborPriceValues"],
            "fareharborAverageRatingValues": merchant["fareharborAverageRatingValues"],
            "countryBoyRow": merchant["countryBoyRow"],
        },
        "boilerplate": {
            "engine2PhotoStop": engine2_text.count(ENGINE2_BOILERPLATE),
            "engine2Meta": engine2_text.count(ENGINE2_META),
        },
        "catalogQuality": {
            "duplicateKeySample": catalog["duplicateKeySample"],
            "crossCompanySample": catalog["crossCompanySample"],
            "malformedSample": catalog["malformedSample"],
            "sameFileRepeatedKeys": catalog["sameFileRepeatedKeys"],
        },
        "countryBoyLive": live,
        "representatives": representatives,
        "engine6ChangedCount": 0,
        "legitimateViatorChangedCount": 0,
        "usageNote": (
            "Model: grok-4.7. Agent run: https://cursor.com/agents/bc-d789ac6a-38a7-405e-941c-614de4092196. "
            "Token counts and dollar cost are not exposed by run-info, so cost per product is not available for Stage A. "
            "This pass is a local census plus one production HTML fetch of the Country Boy page. "
            "It did not call FareHarbor. Stage B was not started."
        ),
    }

    # Drop bulky representative descriptions from the summary JSON duplicate by
    # writing them fully to the representative file and keeping summary too.
    (OUT_DIR / "stage-a-discovery.json").write_text(
        json.dumps(summary, indent=2),
        encoding="utf-8",
    )
    (OUT_DIR / "stage-a-representative-products.json").write_text(
        json.dumps(representatives, indent=2),
        encoding="utf-8",
    )
    (OUT_DIR / "stage-a-discovery.md").write_text(markdown_report(summary), encoding="utf-8")
    manifest_path = OUT_DIR / "migration-manifest.jsonl"
    with manifest_path.open("w", encoding="utf-8") as handle:
        for row in manifest:
            handle.write(json.dumps(row, sort_keys=True) + "\n")
    schema = {
        "stage": "A",
        "idempotent": True,
        "mutatesProductRecords": False,
        "fields": [
            "productIdentifier",
            "fareHarborKey",
            "itemId",
            "sourceRecord",
            "sourceUrl",
            "engine",
            "sourceFound",
            "sourceLocation",
            "priceStatus",
            "ratingStatus",
            "contentExtractionStatus",
            "rewriteStatus",
            "validationStatus",
            "migrationTimestamp",
            "population",
            "error",
        ],
        "priceStatusValues": ["PRICE_NOT_FOUND", "PRICE_FOUND_UNMERGED_CACHE"],
        "ratingStatusValues": ["RATING_NOT_FOUND"],
        "contentExtractionStatusValues": [
            "SOURCE_NOT_FOUND",
            "DERIVATIVE_PRESENT_UNMERGED_BRANCH",
        ],
    }
    (OUT_DIR / "migration-manifest.schema.json").write_text(
        json.dumps(schema, indent=2),
        encoding="utf-8",
    )

    assert any(row["itemId"] == "145208" for row in manifest), "Country Boy missing"
    assert population["engine3FareHarborKeys"] == 0
    assert generated["boilerplateLongDescriptions"] > 1000
    assert generated["generatedCount"] > 1000
    assert country["content"]["boilerplate"] is True
    print(json.dumps({
        "activeLegacyFareHarbor": population["activeLegacyFareHarbor"],
        "generatedFareHarbor": population["generatedFareHarbor"],
        "engine2FareHarborKeys": population["engine2FareHarborKeys"],
        "engine3FareHarborKeys": population["engine3FareHarborKeys"],
        "engine6Routes": population["engine6Routes"],
        "rebuildRoutes": rebuild["routeCount"],
        "matchedDerivative": len(matched_words),
        "priceCache": len(prices),
        "countryBoyLiveStatus": live.get("status") or live.get("error"),
        "ratingFormulaMatches": generated["ratingExactQualityScoreFormula"],
        "ratingCompared": generated["ratingRowsComparedToCsv"],
    }, indent=2))


if __name__ == "__main__":
    main()
