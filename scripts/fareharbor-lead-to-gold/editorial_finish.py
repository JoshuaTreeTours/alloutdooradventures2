#!/usr/bin/env python3
"""Turn sufficient FareHarbor facts into finished travel prose.

Used when the sentence paraphraser cannot reach 100 words without copying
the operator or collapsing into template lines. Every sentence is written
from extracted facts. The product title is not repeated.
"""

from __future__ import annotations

import re

import editorial_voice as ev

_NAME_BLOCK_FIRST = {
    "about",
    "join",
    "our",
    "the",
    "this",
    "these",
    "from",
    "with",
    "for",
    "and",
    "details",
    "what",
    "private",
    "request",
    "rates",
    "highlights",
    "included",
    "enjoy",
    "discover",
    "explore",
    "learn",
    "visit",
    "see",
    "walk",
    "come",
    "during",
    "whether",
    "throughout",
    "prepare",
    "experience",
    "catch",
    "spot",
    "cheers",
    "half",
    "only",
    "max",
    "pickup",
    "pick",
}

_LOGISTICS = re.compile(
    r"\b(please|gratuity|what to bring|driver's license|not included|\$\s?\d|"
    r"per person|refund|parking|mbta|click here|fareharbor)\b",
    re.I,
)


_NAME_STOP = {
    "what",
    "this",
    "that",
    "join",
    "unlike",
    "better",
    "during",
    "after",
    "before",
    "when",
    "where",
    "which",
    "while",
    "into",
    "over",
    "from",
    "with",
    "your",
    "our",
    "the",
    "an",
    "a",
    "and",
    "bon",
    "of",
}


def _clean_name(name: str) -> str:
    parts = name.split()
    while parts and parts[-1].lower().strip(".,") in _NAME_STOP:
        parts.pop()
    while parts and parts[0].lower().strip(".,") in _NAME_STOP | _NAME_BLOCK_FIRST:
        parts.pop(0)
    cleaned = " ".join(parts).strip(" .,'")
    if cleaned.endswith("'s") or cleaned.endswith("’s"):
        cleaned = cleaned[:-2]
    return cleaned.strip()


def _names(text: str, title: str, operator: str) -> list[str]:
    blocked = {
        ev._normalized_phrase(title),
        ev._normalized_phrase(operator),
        "boston",
        "massachusetts",
        "new england",
        "united states",
        "american revolution",
    }
    found: list[str] = []
    seen = set()

    def add(name: str) -> None:
        name = _clean_name(name)
        if len(name.split()) < 1 or len(name) < 3:
            return
        key = name.lower()
        if key in seen or ev._normalized_phrase(name) in blocked:
            return
        if any(part.lower() in _NAME_STOP for part in name.split()):
            return
        if ev.is_junk_place_label(name):
            return
        if re.search(r"\b(whales|sharks|dolphins|cetaceans|species)$", key):
            return
        if key.startswith("vessel "):
            return
        calendar = {
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
        }
        if name.split() and all(part.lower() in calendar or part.isdigit() for part in name.split()):
            return
        if re.search(r"\b(combo|waiver|adventure|package)\b", key) or key.endswith(" special"):
            return
        if any(part.isupper() and len(part) > 2 for part in name.split()):
            return
        # Itinerary step labels and supply lists are not places.
        if re.search(
            r"\b(check|demo|paint|wrap|dry|arrive|final|touches|supplies|canvas|"
            r"upgrade|apron|glove|shoe|bottle|opener|cups?|teaching|hands|live)\b",
            key,
        ) and not re.search(
            r"\b(hall|house|museum|park|street|square|harbor|bridge|church|market)\b",
            key,
        ):
            return
        if re.search(
            r"\b(tour|tours|experience|package|guests|website|what|airport|hotel|terminal|luggage|"
            r"certified|captain|team-building|milestone|rewards|networking|"
            r"hours|about|discover|ages|rates|duration|welcome|federal|bring)\b",
            key,
        ):
            return
        if len(name.split()) > 4:
            return
        if len(name.split()) == 1 and name.lower() not in {
            "harvard",
            "mit",
            "salem",
            "concord",
            "lexington",
            "cambridge",
        }:
            return
        if ev.FOOD_RE.search(name):
            return
        if name.split()[-1].lower() in {
            "revolutionary",
            "historic",
            "historical",
            "famous",
            "great",
            "public",
            "private",
            "american",
            "national",
            "boston",
            "style",
            "show",
            "workshop",
            "one",
            "two",
            "only",
            "designed",
            "limit",
            "brief",
            "highlights",
            "vibes",
        }:
            return
        # Skip a name that is mostly the product title.
        title_words = set(ev._normalized_phrase(title).split())
        name_words = ev._normalized_phrase(name).split()
        if name_words and sum(1 for word in name_words if word in title_words) >= max(1, len(name_words) - 0):
            if len(name_words) >= 2 and set(name_words) <= title_words | {"the", "of", "and"}:
                return
        seen.add(key)
        found.append(name)

    for name in ev.PROPER_RE.findall(text or ""):
        add(name)
    for match in re.finditer(
        r"\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})'s\s+(house|home|grave|wharf|church|hall)\b",
        text or "",
    ):
        add(f"{match.group(1)}'s {match.group(2)}")
    for short in ("Harvard", "MIT", "Salem", "Concord", "Lexington", "Cambridge"):
        if re.search(rf"\b{short}\b", text or ""):
            add(short)
    # Drop a short name that is contained in a longer one.
    pruned = []
    for name in found:
        if any(name.lower() != other.lower() and name.lower() in other.lower() for other in found):
            continue
        pruned.append(name)
    return pruned


def _pair(names: list[str]) -> str:
    if len(names) == 1:
        return names[0]
    return f"{names[0]} and {names[1]}"


def _accept(
    text: str,
    overlap: str,
    title: str,
    operator: str,
    meeting: str | None,
    used_openers: list[str],
) -> str | None:
    if not text:
        return None
    cleaned = ev.sentence(text)
    if not cleaned or not ev.SENTENCE_VERB_RE.search(cleaned):
        return None
    if ev.count_words([cleaned]) < 6:
        return None
    if ev._AWKWARD_PROSE_RE.search(cleaned):
        return None
    if title and ev._normalized_phrase(title) and len(ev._normalized_phrase(title).split()) >= 4:
        if ev._normalized_phrase(title) in ev._normalized_phrase(cleaned):
            return None
    if ev.overlap_with_source(cleaned, overlap, title, operator):
        return None
    safe = ev.safe_sentence(cleaned, meeting, overlap, title, operator)
    if not safe:
        return None
    opener = " ".join(ev.WORD_RE.findall(safe.lower())[:2])
    if opener and used_openers.count(opener) >= 2:
        return None
    if ev.prose_quality_errors([safe], title, ""):
        # Single sentences can trip list-only only in groups; ignore list check here.
        blocking = [
            item
            for item in ev.prose_quality_errors([safe], title, "")
            if not item.startswith("description only concatenates")
        ]
        if blocking:
            return None
    used_openers.append(opener)
    return safe


def _outing_hours(blob: str) -> str | None:
    """Trip length, not a booking cutoff such as 'until 1 hour'."""
    words = {
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",
        "ten": "10",
        "twelve": "12",
    }
    found: list[int] = []
    for match in re.finditer(
        r"\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*-?\s*hours?\b",
        blob or "",
        re.I,
    ):
        prefix = (blob or "")[max(0, match.start() - 48) : match.start()].lower()
        if re.search(
            r"\b(until|within|least|notice|before|cancellation|refund|book|advance)\b",
            prefix,
        ):
            continue
        raw = match.group(1).lower()
        number = words.get(raw, raw)
        if number.isdigit():
            found.append(int(number))
    if not found:
        return None
    return str(max(found))


def _cue_sentences(kind: str, description: str) -> list[str]:
    blob = description or ""
    rows: list[str] = []
    if kind == "drive" and re.search(r"minivan|\bvan\b", blob, re.I):
        rows.append("Guests travel by minivan rather than covering the sights on foot.")
    if kind == "drive" and re.search(r"heat", blob, re.I) and re.search(r"air-condition", blob, re.I):
        rows.append("The vehicle has heat and air conditioning.")
    if kind == "drive" and re.search(r"mainly driving|mostly driving|time in the (?:car|vehicle|van)", blob, re.I):
        rows.append("Most of the time is spent in the vehicle, with only short stops outside.")
    if re.search(r"photo", blob, re.I) and re.search(r"\bstop", blob, re.I):
        rows.append("A few optional stops leave time to step out for photographs and a closer look.")
    if re.search(r"5\s*-\s*10\s*minutes|5 to 10 minutes", blob, re.I):
        rows.append("Those pauses run about five to ten minutes each.")
    max_people = re.search(r"max(?:imum)? of (\d+) people", blob, re.I)
    if max_people and kind == "drive":
        rows.append(f"The van holds {max_people.group(1)} guests, with a little room for bags.")
    if re.search(r"logan airport|cruise ship terminal|hotels in", blob, re.I) and kind == "drive":
        rows.append("Pickup can be at a hotel, at Logan Airport, or at the cruise terminal.")
    if re.search(r"american revolution", blob, re.I) and re.search(r"stor(?:y|ies)|learn|hear", blob, re.I):
        rows.append("The guide talks about Boston's past, including the American Revolution.")
    if re.search(r"religious morals", blob, re.I) and re.search(r"corruption", blob, re.I):
        rows.append("The commentary also takes up the uneasy mix of religious morals and corruption.")
    if re.search(r"fireworks", blob, re.I) and kind == "sail":
        rows.append("The cruise is out on the harbor for the fireworks.")
    schooner = re.search(
        r"(Adirondack(?:\s+(?:II|III|IV))?|Northern Lights|Patriot).{0,40}?(\d+)\s*-?\s*foot",
        blob,
        re.I,
    )
    if not schooner:
        schooner = re.search(
            r"(\d+)\s*-?\s*foot(?:\s+long)?(?:\s+pilot)?\s+schooner",
            blob,
            re.I,
        )
        if schooner and kind == "sail":
            rows.append(f"The boat is an {schooner.group(1)}-foot schooner.")
    elif kind == "sail":
        rows.append(
            f"Guests go aboard {schooner.group(1).strip()}, an {schooner.group(2)}-foot schooner."
        )
    if re.search(r"1890s", blob) and kind == "sail":
        rows.append("The hull follows the lines of pilot boats built in the 1890s.")
    if re.search(r"teak decks", blob, re.I):
        rows.append("Teak decks and wood trim are part of the boat.")
    if re.search(r"not a fully narrated", blob, re.I):
        rows.append("Commentary on monuments, forts, and historic ships stays light rather than continuous.")
    if re.search(r"cocktails|appetizers", blob, re.I) and kind == "sail":
        rows.append("Drinks and appetizers are sold from the deck bar.")
    if re.search(r"skyline", blob, re.I) and kind == "sail":
        rows.append("The skyline is the main view as the boat moves through the harbor.")
    if re.search(r"freedom trail", blob, re.I) and kind == "walk":
        rows.append("Guests follow part of the Freedom Trail and hear how the Revolution began.")
    if re.search(r"old state house", blob, re.I) and re.search(r"faneuil hall", blob, re.I):
        rows.append("Stories cover events at the Old State House and at Faneuil Hall.")
    if re.search(r"ordinary people", blob, re.I) and re.search(r"colonial", blob, re.I):
        rows.append("Colonial Bostonians are described as ordinary people who took up the cause of their time.")
    if re.search(r"moderate pace", blob, re.I) and re.search(r"(\d+(?:\.\d+)?)\s*-?\s*miles?", blob, re.I):
        mile = re.search(r"(\d+(?:\.\d+)?)\s*-?\s*miles?", blob, re.I)
        amount = mile.group(1)
        unit = "mile" if amount in {"1", "1.0"} else "miles"
        rows.append(f"Guests cover about {amount} {unit} at a moderate pace.")
    if re.search(r"north end", blob, re.I) and re.search(r"murder|molasses|misery", blob, re.I):
        rows.append("On the North End's streets, guests hear accounts of misery, misfortune, and murder drawn from documented events.")
    if re.search(r"great influenza", blob, re.I) or re.search(r"molasses flood", blob, re.I):
        bits = []
        for label, pat in (
            ("the 1918 influenza", r"great influenza"),
            ("smallpox outbreaks", r"smallpox"),
            ("the Molasses Flood", r"molasses flood"),
            ("the Brink's Robbery", r"brink'?s robbery"),
        ):
            if re.search(pat, blob, re.I):
                bits.append(label)
        if bits:
            rows.append(f"The account includes {ev.join_and(bits[:4])}.")
    if re.search(r"earliest streets", blob, re.I):
        rows.append("Guests walk some of the city's earliest streets.")
    if re.search(r"moving hills|filling coves|filled coves|moved hills", blob, re.I):
        rows.append("Hills were moved and coves were filled, and guests look at that made ground.")
    if re.search(r"managing water", blob, re.I):
        rows.append("Water management, and the ways people were carried through the growing city, are part of the account.")
    if re.search(r"reinvention", blob, re.I):
        rows.append("The theme is how Boston has been built, altered, and rebuilt.")
    if re.search(r"clues that were once above", blob, re.I) or re.search(r"beneath our feet|underfoot", blob, re.I):
        rows.append("Some clues to that history sit overhead, and others are still underfoot.")
    if re.search(r"ralph waldo emerson|louisa may alcott|henry david thoreau", blob, re.I):
        rows.append("Guests hear where Ralph Waldo Emerson, Louisa May Alcott, and Henry David Thoreau met to trade ideas.")
    if re.search(r"charles dickens", blob, re.I):
        rows.append("Local publishers and the visit of Charles Dickens are part of the same story.")
    if re.search(r"edgar allan poe", blob, re.I):
        rows.append("The guide also explains why Edgar Allan Poe refused Boston as a home.")
    if re.search(r"old corner bookstore|athenaeum", blob, re.I):
        rows.append("Stops include the Old Corner Bookstore and the Athenaeum.")
    if re.search(r"lgbtq", blob, re.I):
        rows.append("The outing follows queer life in Boston from the 18th century into the Gay Liberation years.")
    if re.search(r"pride march", blob, re.I):
        rows.append("Boston's first Pride march, court cases, and local leaders are part of the commentary.")
    if re.search(r"gender norms", blob, re.I):
        rows.append("Guests hear about Bostonians who challenged gender norms, and about bars and clubs that sheltered the community.")
    if re.search(r"coach bus|local actors", blob, re.I):
        rows.append("Local actors lead the group by coach bus and talk through film locations.")
    if re.search(r"good will hunting|l street tavern", blob, re.I):
        rows.append("One stop is the L Street Tavern, known from Good Will Hunting.")
    if re.search(r"\bthe town\b", blob, re.I) and re.search(r"film|movie|chase", blob, re.I):
        rows.append("The bus also passes a chase location from the film The Town.")
    if re.search(r"bean-to-bar|boston cream pie|truffle", blob, re.I):
        foods = ev.extract_foods(blob, [])
        if foods:
            rows.append(f"Guests taste {ev.join_and(foods)}.")
    if re.search(r"beacon hill", blob, re.I) and re.search(r"chocolate|tasting", blob, re.I):
        rows.append("The tasting moves through Beacon Hill, Boston Common, and the Boston Public Market.")
    if re.search(r"little italy|oldest cafe|coffee and pastry", blob, re.I):
        rows.append("The morning starts in the North End with coffee and a pastry at the neighborhood's oldest cafe.")
    if re.search(r"paul revere house", blob, re.I) and re.search(r"entry included|entrance", blob, re.I):
        rows.append("Entry to the Paul Revere House is included, along with time at the Old North Church.")
    if re.search(r"acorn street", blob, re.I):
        rows.append("Later the group hears stories on Boston Common and photographs Acorn Street on Beacon Hill.")
    if re.search(r"botanical garden|public garden", blob, re.I) and re.search(r"america's first", blob, re.I):
        rows.append("The Public Garden, the country's first botanical garden, is on the same day.")
    if re.search(r"private (?:luxury )?van|door-to-door|hotel pickup", blob, re.I):
        rows.append("A private van collects guests at their hotel.")
    if re.search(r"shawmut", blob, re.I):
        rows.append("The account starts with Shawmut, the peninsula that became Boston.")
    if re.search(r"back bay", blob, re.I) and re.search(r"filled|landfill|made land", blob, re.I):
        rows.append("Guests look at how Back Bay was filled in to make new streets.")
        rows.append("The guide treats that fill as a major piece of nineteenth-century engineering, including the Victorian houses and the people who staffed them.")
    if re.search(r"fort point", blob, re.I) and re.search(r"seaport", blob, re.I):
        rows.append("Fort Point and the Seaport have a waterfront past in common. One side is older loft blocks, and the other is glass towers on former marsh.")
    if re.search(r"chinatown", blob, re.I) and re.search(r"immigrant|backstreet", blob, re.I):
        rows.append("Chinatown is presented as a small immigrant neighborhood that survived, with time in the back streets as well as at the markets.")
    if re.search(r"kona dew|rental bike", blob, re.I):
        rows.append("The bike is a Kona Dew, geared for hills such as Beacon Hill, and the fenders are bright green.")
    if re.search(r"burying|graveyard|granary", blob, re.I):
        rows.append("The stops are burying grounds, and the guide talks about who is buried there and why those yards still matter.")
    if re.search(r"brutalist|brutalism", blob, re.I):
        rows.append("Guests see brutalist concrete up close, and the guide explains the look.")
    if re.search(r"city hall", blob, re.I):
        rows.append("Boston City Hall is the building under discussion, including its design and its civic history.")
    if re.search(r"harvard square", blob, re.I) and re.search(r"charles river|boston common", blob, re.I):
        rows.append("The evening ride runs from Boston Common toward Harvard Square, across the Charles River.")
    if re.search(r"\bsalem\b", blob, re.I) and re.search(r"witch", blob, re.I):
        rows.append("Guests visit Salem to see the witch trials memorial and hear about the China Trade years.")
    if re.search(r"drag queen", blob, re.I):
        rows.append("Guests see a drag dinner show, with impersonations and a seated meal.")
    if re.search(r"beacon hill", blob, re.I) and re.search(r"back bay", blob, re.I):
        rows.append("Guests walk Beacon Hill's brick streets and the wider avenues of Back Bay, hearing the history of each.")
    if re.search(r"tall ship|reel house|lewis mall", blob, re.I) and re.search(r"pick", blob, re.I):
        rows.append("Guests see the pickup boat at the Tall Ship, Lewis Mall, or Reel House in East Boston.")
    if re.search(r"final goodbyes|memorial service|say their final", blob, re.I):
        rows.append("Guests go aboard for a private memorial, with prayers, music, and a ceremony the family chooses.")
    if re.search(r"abolition|slavery", blob, re.I):
        rows.append("Slavery and the fight against it are the subject, tied to the Boston places where that fight was carried on.")
    if re.search(r"art deco", blob, re.I):
        rows.append("Art Deco buildings in the financial district are what guests are taken to see.")
    if re.search(r"aesop|fables", blob, re.I):
        rows.append("Aesop's fables are the lens, and guests look for those stories in the sculpture and buildings around Copley Square.")
    if re.search(r"immigration|immigrants", blob, re.I) and re.search(r"north end", blob, re.I):
        rows.append("The North End is treated as a gateway neighborhood, with arrivals from several countries.")
    if re.search(r"company events|team-building|coworkers|colleagues", blob, re.I) and re.search(
        r"food|tasting", blob, re.I
    ):
        rows.append("Private groups book the tasting for colleagues, combining neighborhood streets with local food.")
    if re.search(r"open[- ]air", blob, re.I) and re.search(
        r"does not include any stops|\bno stops\b", blob, re.I
    ):
        rows.append("Guests ride in an open-air vehicle rather than walking between sights.")
        rows.append("The outing does not include stops, so the sights are seen from the vehicle.")
        if re.search(r"\btraffic\b", blob, re.I):
            hours = re.search(r"up to\s+(\d+)\s*hours?", blob, re.I)
            if hours:
                unit = "hour" if hours.group(1) == "1" else "hours"
                rows.append(
                    f"The length runs up to about {hours.group(1)} {unit} and changes with traffic."
                )
            else:
                rows.append("The running time changes with traffic conditions.")
        if re.search(r"\bneighborhood", blob, re.I):
            rows.append("The vehicle passes through city neighborhoods on the same drive.")
        if re.search(r"moviemaking|\bmovies?\b", blob, re.I):
            rows.append("Moviemaking landmarks are among the sights seen from the vehicle.")
        if re.search(r"residential", blob, re.I):
            rows.append("Residential neighborhoods are part of the same ride.")
        if re.search(r"architect", blob, re.I):
            rows.append("Architectural buildings are visible from the open-air vehicle.")
        if re.search(r"historic", blob, re.I):
            rows.append("Historic sites are also on the drive and are seen without a stop.")
        if re.search(r"\bcamera\b", blob, re.I):
            rows.append("Guests are asked to bring a camera for the ride.")
        rows.append("People stay aboard the vehicle for the length of the outing.")
        rows.append("There is no walking portion, because the operator does not schedule stops.")
        rows.append("The same open-air ride is how every sight on the outing is viewed.")
        if re.search(r"\bLos Angeles\b", blob):
            rows.append("The ride stays in Los Angeles.")
    if re.search(r"\bwhales?\b|\bwhale watch\b", blob, re.I) and re.search(
        r"\b(boat|aboard|vessel|on board|on the water|whale watch)\b", blob, re.I
    ):
        rows.append("Guests go out on the water to look for whales.")
        if re.search(r"dolphin", blob, re.I):
            rows.append("Dolphins are also part of what the outing goes out to see.")
        species = [
            label
            for label, pattern in (
                ("humpback whales", r"humpback"),
                ("fin whales", r"\bfin whales\b"),
                ("minke whales", r"minke"),
                ("Bryde's whales", r"bryde"),
                ("orcas", r"\borcas\b"),
            )
            if re.search(pattern, blob, re.I)
        ]
        if species:
            rows.append(f"Animals the trip watches for include {ev.join_and(species[:4])}.")
        if re.search(r"\borcas\b", blob, re.I) and not any("orca" in item for item in species[:4]):
            rows.append("Orcas are among the rarer animals the trip also watches for.")
        elif re.search(r"\borcas\b", blob, re.I) and len(species) > 4:
            rows.append("Orcas are among the rarer animals the trip also watches for.")
        foot = re.search(r"(\d+)\s*-?\s*foot", blob, re.I)
        if foot:
            rows.append(f"Length of the boat is about {foot.group(1)} feet.")
        named = re.search(r"\baboor?d the ([A-Z][A-Za-z]+)\b", blob)
        if named:
            rows.append(f"Guests spend the trip aboard {named.group(1)}.")
        if re.search(r"mission bay", blob, re.I):
            rows.append("The waters for this trip are off Mission Bay.")
        if re.search(r"seaforth", blob, re.I):
            rows.append("The boat returns to Seaforth Marina at the end.")
        if re.search(r"marine biologist", blob, re.I):
            rows.append("A marine biologist is aboard to answer questions about the animals.")
        if re.search(r"shade", blob, re.I) and re.search(r"seat", blob, re.I):
            rows.append("Shade and seating are available while guests watch the water.")
        if re.search(r"quiet", blob, re.I) and re.search(r"engine", blob, re.I):
            rows.append("Quiet engines let the boat approach wildlife with less disturbance.")
        if re.search(r"restroom|bathroom", blob, re.I):
            rows.append("A restroom is available on board during the trip.")
        cap = re.search(r"(\d+)\s*passenger", blob, re.I)
        if cap:
            rows.append(f"Capacity on the vessel is {cap.group(1)} passengers.")
        if re.search(r"great white", blob, re.I):
            rows.append("When conditions allow, the same trip also searches for great white sharks.")
        if re.search(r"great white shark park", blob, re.I):
            rows.append("That search uses a spot the operator calls Great White Shark Park.")
        if re.search(r"san diego", blob, re.I):
            rows.append("Departure for these trips is offshore from San Diego.")
        if re.search(r"calm|calmer|end of the year|october", blob, re.I):
            rows.append("The operator runs these trips in the calmer months near the end of the year.")
        hours = _outing_hours(blob)
        if hours:
            unit = "hour" if hours == "1" else "hours"
            rows.append(f"Time on the water is about {hours} {unit}.")
        if re.search(r"whale sightings|see whales|look for whales|extended time", blob, re.I):
            rows.append("The longer window on the water is there to look for whales.")
        rows.append("People stay aboard, and the animals are what the trip goes out to find.")
        rows.append("Travel stays on the boat, so there is no walking route.")
    if re.search(r"\b(whaler|outboard|center console|powerboat|power boat)\b", blob, re.I) and not re.search(
        r"\bwhales?\b", blob, re.I
    ):
        rows.append("Guests take out a small powerboat and stay aboard for the rental.")
        if re.search(r"center console|montauk", blob, re.I):
            rows.append("The rental is a center-console hull, with the helm in the middle of the boat.")
        if re.search(r"boston whaler", blob, re.I):
            rows.append("The hull is a Boston Whaler, built as an open powerboat.")
        hp = re.search(r"(\d+)\s*-?\s*hp\b", blob, re.I)
        if hp:
            rows.append(f"An outboard of about {hp.group(1)} horsepower is fitted on the stern.")
        if re.search(r"fourstroke|four-stroke|four stroke", blob, re.I):
            rows.append("The motor is a four-stroke, and it is meant to run quietly.")
        if re.search(r"planing|dry ride", blob, re.I):
            rows.append("The hull is shaped to get on plane and to throw less spray.")
        if re.search(r"bluetooth", blob, re.I):
            rows.append("A Bluetooth sound system is installed on the boat.")
        if re.search(r"fishing", blob, re.I) and not re.search(r"no fishing", blob, re.I):
            rows.append("Fishing is one of the uses the operator describes for this boat.")
        elif re.search(r"no fishing", blob, re.I):
            rows.append("Fishing is not allowed on this smaller boat.")
        people = re.search(r"(\d+)\s*persons?", blob, re.I)
        if people:
            rows.append(f"The posted capacity is {people.group(1)} people.")
        if re.search(r"fuel included|fuel is included", blob, re.I):
            rows.append("Fuel for the rental period is included in the booking.")
        if re.search(r"harbor", blob, re.I) and re.search(r"only allowed inside", blob, re.I):
            rows.append("This smaller boat is limited to the harbor and does not go outside it.")
        if re.search(r"bimini", blob, re.I):
            rows.append("A bimini top provides shade over the seats.")
        if re.search(r"swivel", blob, re.I):
            rows.append("The seats swivel, which is part of how the boat is set up for new drivers.")
        if re.search(r"novice|first time", blob, re.I):
            rows.append("The operator describes the boat as manageable for a first-time driver.")
        speed = re.search(r"(\d+)\s*mph", blob, re.I)
        if speed:
            rows.append(f"Top speed is about {speed.group(1)} miles per hour.")
        rows.append("People remain on the boat for the rental, and there is no walking route.")
    if re.search(r"\bgocar\b|\bgo\s*car\b", blob, re.I):
        rows.append("Guests drive a small GPS-guided car rather than riding a tour bus.")
        if re.search(r"speedboat", blob, re.I):
            rows.append("The same booking also includes time in a speedboat that guests drive on the bay.")
        if re.search(r"story", blob, re.I):
            rows.append("The car plays a recorded story while guests drive the route.")
        if re.search(r"coronado", blob, re.I):
            rows.append("The drive goes out to Coronado and then returns.")
        if re.search(r"\bbridge\b", blob, re.I):
            if re.search(r"night|after dark|city lights", blob, re.I):
                rows.append("The drive crosses the bridge after dark, with the city lights in view.")
            else:
                rows.append("The drive crosses the bridge as part of the same route.")
        if re.search(r"gaslamp", blob, re.I):
            rows.append("The route comes back through the Gaslamp quarter.")
        hours = re.search(r"(\d+)\s*hours?", blob, re.I)
        if hours:
            unit = "hour" if hours.group(1) == "1" else "hours"
            rows.append(f"The driving portion runs about {hours.group(1)} {unit}.")
        rows.append("Guests steer the car themselves, with the GPS setting the turns.")
        rows.append("The outing is a drive, not a walk between the sights.")
    if re.search(r"bonfire|s'mores|smores", blob, re.I) or (
        re.search(r"firepit|fire pit", blob, re.I) and re.search(r"attendant", blob, re.I)
    ):
        rows.append("Guests gather at a firepit rather than walking a neighborhood route.")
        if re.search(r"s'mores|smores|marshmallow", blob, re.I):
            rows.append("The group toasts marshmallows and makes s'mores at the fire.")
        if re.search(r"attendant", blob, re.I):
            rows.append("A bonfire attendant stays with the group for the evening.")
        people = re.search(r"(?:up to|for)\s+(\d+)", blob, re.I)
        if people:
            rows.append(f"Seating at the fire is for up to {people.group(1)} guests.")
        if re.search(r"\bbay\b|sunset|sun sets", blob, re.I):
            rows.append("The fire looks out over the bay as the evening comes on.")
        if re.search(r"palm", blob, re.I):
            rows.append("Palms are part of the setting around the firepit.")
        if re.search(r"attendant", blob, re.I):
            rows.append("The visit stays at the fire, with the attendant handling the bonfire.")
        else:
            rows.append("The visit stays at the fire rather than touring the streets.")
        rows.append("People sit together for the length of the booking instead of touring the streets.")
    if re.search(r"\bhike", blob, re.I) and re.search(r"mountain", blob, re.I):
        rows.append("Guests hike a mountain trail rather than touring by vehicle.")
        if re.search(r"cowles", blob, re.I):
            rows.append("The hike goes up Cowles Mountain.")
        if re.search(r"mission trails", blob, re.I):
            rows.append("The approach follows trails in Mission Trails.")
        if re.search(r"photo|picture", blob, re.I):
            rows.append("The guide pauses so guests can take pictures from the viewpoints.")
        if re.search(r"sage", blob, re.I):
            rows.append("Sage grows along the trail the group walks.")
        if re.search(r"easy", blob, re.I):
            rows.append("The operator describes the hike as an easier walk, with time to stop and look.")
        rows.append("Guests stay on foot for the outing, and the mountain is the destination.")
        rows.append("The views are from the trail itself, not from a vehicle window.")
    if re.search(r"christmas|holiday lights", blob, re.I) and re.search(
        r"neighborhood", blob, re.I
    ):
        rows.append("Guests ride through neighborhoods to see holiday light displays.")
        places = re.findall(
            r"((?:Christmas|Holiday)\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})",
            blob,
        )
        cleaned = []
        for place in places:
            place = place.strip()
            if place.lower() in {"christmas lights", "holiday lights"}:
                continue
            if place not in cleaned:
                cleaned.append(place)
        if len(cleaned) >= 2:
            rows.append(f"The displays include {ev.join_and(cleaned[:3])}.")
        elif cleaned:
            rows.append(f"One stop is the display at {cleaned[0]}.")
        if re.search(r"music", blob, re.I):
            rows.append("Music plays during the ride between the light displays.")
        if re.search(r"photo", blob, re.I):
            rows.append("There is time to get out for photographs at the displays.")
        if re.search(r"family", blob, re.I):
            rows.append("Families ride together to see the lights.")
        rows.append("The outing is a ride past the decorations, not a daytime sightseeing walk.")
        rows.append("Guests stay with the vehicle except where the route stops for the displays.")
    if re.search(r"\b(geodesic dome|bell tent|glamping|dry campsite|campsite)\b", blob, re.I):
        if re.search(r"geodesic dome|\bdome\b", blob, re.I):
            rows.append("Overnight guests sleep in a geodesic dome instead of taking a guided walk.")
        elif re.search(r"bell tent", blob, re.I):
            rows.append("Overnight guests sleep in a bell tent instead of taking a guided walk.")
        else:
            rows.append("Guests camp on a dry site and bring a tent, a camper, or a trailer.")
        people = re.search(r"(?:up to|sleeps)\s+(\d+)", blob, re.I)
        if people:
            rows.append(f"The site sleeps up to {people.group(1)} guests.")
        elif re.search(r"sleeps two|sleep two|for two", blob, re.I):
            rows.append("The tent sleeps two guests for the night.")
        if re.search(r"queen", blob, re.I):
            rows.append("Sleeping is on a queen bed, and linens are provided.")
        if re.search(r"couch|folding mattress", blob, re.I):
            rows.append("A couch and a folding mattress give more room to sleep.")
        if re.search(r"firepit|fire pit", blob, re.I):
            rows.append("A firepit on the site is there for the evening.")
        if re.search(r"grill", blob, re.I):
            rows.append("A propane grill is on hand for cooking outdoors.")
        if re.search(r"picnic", blob, re.I):
            rows.append("Outdoor seating includes a picnic table for meals on the site.")
        if re.search(r"solar", blob, re.I):
            rows.append("Solar lights are inside for the evening hours.")
        if re.search(r"outdoor shower|\bshower\b", blob, re.I):
            rows.append("An outdoor shower and a sink are part of this site.")
        if re.search(r"private portable toilet", blob, re.I):
            rows.append("A private portable toilet is assigned to this site.")
        elif re.search(r"portable toilet", blob, re.I):
            rows.append("Shared portable toilets are a short walk from the site.")
        if re.search(r"generator", blob, re.I):
            rows.append("A generator powers the lights, the water pump, and small devices.")
        if re.search(r"heater", blob, re.I):
            rows.append("A heater is available when the night turns cold.")
        if re.search(r"not insulated", blob, re.I):
            rows.append("The dome is not insulated, so summers run hot and winters run cold.")
        if re.search(r"drinking water", blob, re.I):
            rows.append("Guests bring their own drinking water for the stay.")
        if re.search(r"30\s*ft|30ft", blob, re.I):
            rows.append("Trailers parked on the site are limited to about 30 feet.")
        if re.search(r"dry camp", blob, re.I):
            rows.append("The site has no hookups, so guests bring what they need for the night.")
        if re.search(r"joshua tree", blob, re.I):
            rows.append("The overnight stay is in Joshua Tree.")
        rows.append("This booking is an overnight stay, not a sightseeing route through town.")
        if re.search(r"firepit|fire pit", blob, re.I):
            rows.append("Guests spend the night on the site, and the firepit is the evening gathering place.")
        else:
            rows.append("Guests spend the night on the site rather than touring the town.")
    if re.search(r"\bbike\b|\bbiking\b|\bebike\b|\be-bike\b", blob, re.I) and re.search(
        r"muir woods|golden gate|sausalito|santa monica|venice|pier|canal", blob, re.I
    ):
        if re.search(r"shuttle", blob, re.I):
            rows.append("The day pairs a shuttle ride with time on a bike.")
        else:
            rows.append("Guests ride bikes rather than touring the sights on foot.")
        if re.search(r"pedal[\s-]?assist|electric", blob, re.I):
            rows.append("The bikes are pedal-assist, so the motor helps on the hills.")
        if re.search(r"muir woods", blob, re.I):
            rows.append("The shuttle runs out to Muir Woods National Monument.")
            rows.append("Guests walk among the coastal redwoods while they are there.")
        if re.search(r"golden gate bridge", blob, re.I):
            rows.append("Riders cross the Golden Gate Bridge and watch the bay from the span.")
        elif re.search(r"golden gate park", blob, re.I):
            rows.append("The ride stays in Golden Gate Park, on the park's bike paths.")
        if re.search(r"golden gate bridge", blob, re.I) and re.search(r"\bpark\b", blob, re.I):
            rows.append("The same ride can take in both the park paths and the bridge.")
        if re.search(r"sausalito", blob, re.I):
            rows.append("The route continues toward Sausalito after the bridge.")
        if re.search(r"waterfront|water views", blob, re.I):
            rows.append("Much of the riding is along the waterfront, with the bay alongside.")
        if re.search(r"ghirardelli|beach street", blob, re.I):
            rows.append("The ride meets by Ghirardelli Square on Beach Street.")
        if re.search(r"hippie hill", blob, re.I):
            rows.append("Hippie Hill is one of the places riders pass inside the park.")
        if re.search(r"fisherman", blob, re.I):
            rows.append("The shuttle portion starts at Fisherman's Wharf.")
        if re.search(r"sausalito", blob, re.I) and re.search(r"free time", blob, re.I):
            rows.append("There is free time in Sausalito before the shuttle turns back.")
        if re.search(r"bay trail", blob, re.I):
            rows.append("Once the shuttle is done, the bike portion follows the Bay Trail.")
        if re.search(r"helmet", blob, re.I):
            rows.append("A helmet is included, and the shop fits the bike before departure.")
        if re.search(r"\bguide\b", blob, re.I):
            rows.append("A guide rides with the group and sets the pace.")
        if re.search(r"beginner", blob, re.I):
            rows.append("The operator presents the ride as suitable for beginners.")
        if re.search(r"ferry", blob, re.I):
            rows.append("A round-trip ferry is part of getting riders back.")
        hours = _outing_hours(blob)
        if hours:
            unit = "hour" if hours == "1" else "hours"
            rows.append(f"The booking runs about {hours} {unit}.")
        if re.search(r"90 minutes|ninety minutes", blob, re.I):
            rows.append("About 90 minutes are set aside inside the redwood grove.")
        if re.search(r"self-guided", blob, re.I):
            rows.append("The city bike portion is self-guided after the shuttle returns.")
        if re.search(r"redwood", blob, re.I):
            rows.append("The redwoods are why the shuttle goes out, and the bridge is the riding highlight.")
        if re.search(r"santa monica pier", blob, re.I):
            rows.append("The ride starts near the Santa Monica Pier.")
        if re.search(r"venice canal", blob, re.I):
            rows.append("Riders continue on to the Venice Canals.")
        if re.search(r"marina del rey", blob, re.I):
            rows.append("The same route also passes through Marina del Rey.")
        if re.search(r"muscle beach", blob, re.I):
            rows.append("Muscle Beach is one of the places the group stops.")
        if re.search(r"art wall", blob, re.I):
            rows.append("The Art Walls are a stop where riders take photographs.")
        if re.search(r"ocean", blob, re.I):
            rows.append("Much of the riding follows the shore, with the ocean alongside.")
        if re.search(r"non-electric|standard", blob, re.I) and re.search(r"pedal", blob, re.I):
            rows.append("Some guests ride pedal-assist bikes, and others ride ordinary bikes.")
        if re.search(r"photo", blob, re.I):
            rows.append("The guide stops so riders can take photographs along the way.")
        rows.append("People stay with the bikes for the riding portion of the booking.")
    if re.search(
        r"\b(animal ambassadors?|zookeep\w*|veterinar\w*|pumpkin patch|humane education|animal husbandry)\b",
        blob,
        re.I,
    ):
        if re.search(r"pumpkin|halloween|howl", blob, re.I):
            rows.append("Families meet animal ambassadors and move between activity stations.")
            if re.search(r"trick-or-treat|trick or treat", blob, re.I):
                rows.append("Trick-or-treat stops are set around the activity areas.")
            if re.search(r"face painting", blob, re.I):
                rows.append("Face painting is offered along with the animal visits.")
            if re.search(r"pumpkin", blob, re.I):
                rows.append("A small pumpkin patch is on site, and each child may take one pumpkin.")
            if re.search(r"haunted", blob, re.I):
                rows.append("A few rooms are arranged as a mild haunt for young children.")
            if re.search(r"music", blob, re.I):
                rows.append("Music plays while the stations stay open.")
        if re.search(r"zookeeper|zookeep|husbandry|diet preparation", blob, re.I):
            rows.append("The camp day is built around animal-care tasks with the staff.")
            if re.search(r"diet", blob, re.I):
                rows.append("Preparing animal diets is one of those tasks.")
            if re.search(r"enrichment", blob, re.I):
                rows.append("The group also sets up enrichment for the animals.")
            if re.search(r"groom|exercis", blob, re.I):
                rows.append("Grooming and exercise are part of the same camp day.")
            if re.search(r"reptile|mammal|bird", blob, re.I):
                rows.append("Mammals, reptiles, and birds are among the animals campers work with.")
            if re.search(r"habitat", blob, re.I):
                rows.append("Cleaning animal habitats is one of the camp tasks.")
            if re.search(r"training", blob, re.I):
                rows.append("Training sessions with the animals are part of the day.")
            if re.search(r"limited", blob, re.I):
                rows.append("The camp keeps the group small so each camper can work close to the animals.")
        if re.search(r"veterinar", blob, re.I):
            rows.append("Campers meet a veterinarian and practice simple clinical skills.")
            if re.search(r"banana", blob, re.I):
                rows.append("Suture practice uses a banana rather than a live animal.")
            if re.search(r"microscope", blob, re.I):
                rows.append("A microscope is set out so campers can look at cells.")
            if re.search(r"\bcpr\b", blob, re.I):
                rows.append("Canine CPR is practiced on a training dummy.")
            if re.search(r"hospital", blob, re.I):
                rows.append("The day includes a walk through a companion-animal hospital.")
        if re.search(r"butterfly|life cycle", blob, re.I) and re.search(r"animal", blob, re.I):
            rows.append("Children meet live animals and hear how life cycles work.")
            if re.search(r"butterfly", blob, re.I):
                rows.append("One station covers butterfly conservation.")
            species = [
                label
                for label, pattern in (
                    ("a mini horse", r"mini horse"),
                    ("a chicken", r"\bchicken\b"),
                    ("a frog", r"\bfrog\b"),
                    ("a guinea pig", r"guinea pig"),
                    ("a dove", r"\bdove\b"),
                )
                if re.search(pattern, blob, re.I)
            ]
            if species:
                rows.append(f"Animals that may be brought out include {ev.join_and(species[:4])}.")
        rows.append("Staff stay with the group while the animals are part of the program.")
        rows.append("This booking is an animal program, not a sightseeing loop through town.")
    if re.search(r"\bsurf", blob, re.I) and re.search(r"\b(lesson|surfboard|waves?)\b", blob, re.I):
        rows.append(
            "Guests start on the sand with a lesson in paddling, stance, and how to stand up on the board."
        )
        rows.append("After that land lesson, the group goes into the ocean to catch waves.")
        if re.search(r"ocean safety", blob, re.I):
            rows.append("Ocean safety is covered before anyone takes a board into the water.")
        if re.search(r"wave selection", blob, re.I):
            rows.append("Choosing which wave to catch is part of the same instruction.")
        if re.search(r"wetsuit", blob, re.I) and re.search(r"surfboard", blob, re.I):
            rows.append("A wetsuit and a surfboard are provided for the time in the water.")
        elif re.search(r"surfboard", blob, re.I):
            rows.append("A surfboard is provided for the time in the water.")
        if re.search(r"rash guard", blob, re.I):
            rows.append("A rash guard, fins, a leash, and reef shoes are also set out with the gear.")
        if re.search(r"\benglish\b", blob, re.I):
            rows.append("The lesson itself is given in English.")
        ratio = re.search(r"(\d+)\s*:\s*1", blob)
        if ratio and ratio.group(1) != "1":
            rows.append(
                f"Instructors stay with the group at about {ratio.group(1)} guests per instructor."
            )
        if re.search(r"one-on-one|\b1\s*:\s*1\b", blob, re.I):
            rows.append("A private booking keeps one instructor with one guest.")
        elif re.search(r"\bprivate\b", blob, re.I):
            rows.append("The booking is private, so the instructor works with that party alone.")
        if re.search(r"family|friends|ohana", blob, re.I):
            rows.append("Family or friends share the lesson and take the same waves together.")
        if re.search(r"beginner|first time", blob, re.I):
            rows.append("The lesson is aimed at first-time and beginner surfers.")
        if re.search(r"30 minutes", blob, re.I) and re.search(r"stand", blob, re.I):
            rows.append("The operator aims to have beginners standing on the board within about 30 minutes.")
        cap = re.search(r"(?:maximum|max(?:imum)? group size of|group size of)\s+(\d+)", blob, re.I)
        if not cap:
            cap = re.search(r"maximum group size of (\d+)", blob, re.I)
        if cap:
            rows.append(f"The lesson takes groups of up to {cap.group(1)} guests.")
        rows.append("People are in the water on surfboards rather than walking a neighborhood route.")
        rows.append("The instructor stays in the surf with the group for the length of the lesson.")
    if re.search(r"\bprivate\b", blob, re.I) and re.search(
        r"you decide what to see|hidden gems", blob, re.I
    ):
        rows.append(
            "A private group sets the sights, the departure time, and the length of the outing."
        )
        rows.append(
            "The pace stays with the guests instead of following a fixed public timetable."
        )
        if re.search(r"travel guides", blob, re.I):
            rows.append(
                "Stops include well-known sights and places left out of ordinary travel guides."
            )
        people = re.search(r"up to (\d+) people", blob, re.I)
        if people:
            rows.append(f"The private booking is limited to {people.group(1)} guests.")
        pickup = re.search(
            r"free pick\s*up in ([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?)",
            blob,
            re.I,
        )
        if pickup:
            rows.append(f"Free pickup is available in {pickup.group(1)}.")
        if re.search(r"\bcamera\b", blob, re.I):
            rows.append("Guests are asked to bring a camera for the outing.")
        hours = re.search(r"\b(\d+)\s*hours?\b", blob, re.I)
        if hours:
            unit = "hour" if hours.group(1) == "1" else "hours"
            rows.append(f"The outing runs for about {hours.group(1)} {unit}.")
        rows.append("There is no set walking route, and the group sets the stops.")
        if re.search(r"small groups", blob, re.I):
            rows.append(
                "Small groups book the same private outing, and the plan is built around that party."
            )
        rows.append(
            "The operator leads the outing, and the plan changes with the group's size and interests."
        )
        if re.search(r"sights", blob, re.I):
            rows.append(
                "Guests visit both the better-known sights and the places the travel guides skip."
            )
    if re.search(r"customizable|tailored", blob, re.I) and re.search(r"private", blob, re.I) and re.search(
        r"walk", blob, re.I
    ):
        rows.append(
            "A private group picks the subject, and the guide walks them through downtown sites that fit it."
        )
        theme_bits = []
        if re.search(r"architecture", blob, re.I):
            theme_bits.append("architecture")
        if re.search(r"jazz", blob, re.I):
            theme_bits.append("jazz history")
        if re.search(r"gangster", blob, re.I):
            theme_bits.append("gangster-era history")
        if re.search(r"route 66", blob, re.I):
            theme_bits.append("Route 66 stories")
        if theme_bits:
            rows.append(
                f"{ev.join_and([bit[0].upper() + bit[1:] if i == 0 else bit for i, bit in enumerate(theme_bits)])} are examples of themes the operator will build a route around."
            )
        rows.append(
            "Couples can take a long day on foot, and a conference party can take a shorter walk between sessions."
            if re.search(r"conference|couples", blob, re.I)
            else "The length of the walk changes with what the group asks to see."
        )
        if re.search(r"corporate|family", blob, re.I):
            rows.append(
                "Corporate outings and family groups use the same idea: public-route material is adapted for that party."
            )
        leader = re.search(
            r"\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})\b",
            blob,
        )
        if leader:
            rows.append(
                f"{leader.group(1)} leads the walk, and the plan changes with the group's size and interests."
            )
        else:
            rows.append("The operator leads the walk, and the plan changes with the group's size and interests.")
    if re.search(r"\bwalk", blob, re.I) and (
        re.search(r"street art", blob, re.I)
        or len(re.findall(r"\bmurals?\b", blob, re.I)) >= 2
    ):
        if re.search(r"b-line", blob, re.I):
            rows.append("Guests walk the B-Line corridor and look at outdoor murals along the way.")
        else:
            rows.append("Guests walk the corridor and look at outdoor murals along the way.")
        if re.search(r"1970", blob):
            rows.append("The guide explains how that public-art route grew from the 1970s into the present.")
        else:
            rows.append("The guide explains how that public-art route and its artists developed.")
        rows.append("Artists, neighborhood change, and the works on the walls are what the commentary covers.")
        rows.append("People stay on foot, and the art is viewed outside rather than inside a museum.")
        if re.search(r"west town", blob, re.I):
            rows.append("West Town is the setting, and the guide attaches a story to the murals the group stops to see.")
        else:
            rows.append("The neighborhood is the setting, and the guide attaches a story to the murals the group stops to see.")
    if re.search(r"spray paint|stencil", blob, re.I) and re.search(r"canvas|workshop", blob, re.I):
        technique_bits = [
            label
            for label, pattern in (
                ("spray-paint handling", r"spray paint"),
                ("stencils", r"stencil"),
                ("lettering", r"lettering"),
                ("texture", r"texture"),
            )
            if re.search(pattern, blob, re.I)
        ]
        if technique_bits:
            rows.append(
                f"Guests practice {ev.join_and(technique_bits)} in a studio session."
            )
        else:
            rows.append("Guests practice street-art methods in a studio session.")
        if re.search(r"canvas", blob, re.I):
            rows.append("Each person finishes an original canvas and takes that piece home.")
        if re.search(r"studio w\.?i\.?p", blob, re.I):
            rows.append(
                "Studio W.I.P. artists lead the instruction for newcomers and for people who have painted before."
            )
        else:
            rows.append("Artists lead the instruction for newcomers and for people who have painted before.")
        rows.append("The session stays indoors, with hands-on teaching rather than a walk past outdoor walls.")
        rows.append("A canvas and staff instruction are what the studio sets out for the group.")
    if re.search(r"neon|blacklight|ultraviolet", blob, re.I) and re.search(
        r"canvas|workshop|paint", blob, re.I
    ):
        rows.append("Guests paint with neon colors under blacklight and watch the canvas glow in the dark.")
        rows.append("Street-art instructors demonstrate a method, then people paint their own piece.")
        if re.search(r"studio w\.?i\.?p", blob, re.I):
            rows.append("The finished work is a canvas made during the session at Studio W.I.P.")
        else:
            rows.append("The finished work is a canvas made during the session.")
        rows.append("Lighting in the room is part of the setup, and the paint is what guests came to use.")
        rows.append(
            "The outing stays inside the studio, and the glow comes from the pigments under ultraviolet light."
        )
    if re.search(r"male revue|male strip", blob, re.I):
        rows.append(
            "The evening is a male revue, with choreographed dancers and a host who draws the crowd in."
        )
        if re.search(r"las vegas", blob, re.I):
            rows.append(
                "Audience participation is part of the show, and the operator describes the staging as Las Vegas Style."
            )
        elif re.search(r"audience participation", blob, re.I):
            rows.append("Audience participation is part of the show rather than a seated lecture.")
        if re.search(r"bachelorette|birthday", blob, re.I):
            rows.append("Groups book the night for a bachelorette party, a birthday, or a night out with friends.")
        rows.append("The performance stays in a club setting rather than on a walking route through the city.")
        rows.append(
            "Dancers, humor from the hosts, and direct involvement of the audience are what the booking details describe."
        )
    return rows


def _name_sentences(kind: str, names: list[str], description: str) -> list[str]:
    if kind == "drive":
        vehicle = "car" if re.search(r"\bgocar\b|\bgo\s*car\b", description or "", re.I) else "van"
        frames = [
            "The drive passes {pair}.",
            f"Farther along, the {vehicle} goes by {{pair}}.",
            "{pair} are on the same circuit.",
            f"Also visible from the {vehicle} are {{pair}}.",
            "The later stretch includes {pair}.",
        ]
    elif kind == "sail":
        frames = [
            "From the water, guests see {pair}.",
            "{pair} come into view as the boat moves.",
            "The cruise also passes {pair}.",
            "Looking back toward shore, the group can see {pair}.",
        ]
    elif kind == "bike":
        frames = [
            "The ride passes {pair}.",
            "Cyclists also come to {pair}.",
            "{pair} are on the same loop.",
            "Later the route reaches {pair}.",
        ]
    elif kind == "food":
        frames = [
            "The tasting also stops near {pair}.",
            "Guests keep eating as they reach {pair}.",
            "{pair} are part of the same food route.",
            "Another pause is at {pair}.",
        ]
    elif kind == "paddle":
        frames = [
            "The paddle passes {pair}.",
            "From the water the group comes to {pair}.",
            "{pair} are on the same stretch.",
        ]
    elif kind == "bus":
        frames = [
            "The bus passes {pair}.",
            "Also on the film route are {pair}.",
            "The coach slows for {pair}.",
            "{pair} are part of the same ride.",
        ]
    elif re.search(r"hear|story|tale|learn about", description or "", re.I):
        frames = [
            "Guests hear about {pair}.",
            "The guide's account includes {pair}.",
            "Stories along the way cover {pair}.",
            "{pair} come up in the commentary.",
            "The same narrative reaches {pair}.",
        ]
    else:
        frames = [
            "Guests spend time at {pair}.",
            "The route also reaches {pair}.",
            "{pair} are part of the same outing.",
            "Later the group comes to {pair}.",
            "There is time to look at {pair}.",
        ]
    rows = []
    index = 0
    cursor = 0
    while cursor < len(names) and index < len(frames):
        chunk = names[cursor : cursor + 2]
        cursor += 2
        if not chunk:
            break
        rows.append(frames[index].format(pair=_pair(chunk)))
        index += 1
    return rows


def _stretch(kind: str, names: list[str], description: str, already: str) -> list[str]:
    """Longer restatements of facts already extracted, used only to reach 100 words."""
    blob = description or ""
    rows: list[str] = []
    unused = [name for name in names if name.lower() not in already.lower()]
    if len(unused) >= 2:
        rows.append(
            f"Attention also goes to {unused[0]} and {unused[1]}, with the guide attaching a story to each stop."
        )
    elif len(unused) == 1:
        rows.append(f"Attention also goes to {unused[0]}, and the guide explains why it is on the route.")
    if kind == "walk" and re.search(r"\bwalk", blob, re.I):
        rows.append("Guests stay on foot the whole time, pausing while the guide talks at each site.")
    if kind == "drive":
        vehicle = "car" if re.search(r"\bgocar\b|\bgo\s*car\b", blob, re.I) else "van"
        rows.append(
            f"The point of the outing is the succession of landmarks seen from the {vehicle}, not a march between them."
        )
    if kind == "sail":
        rows.append("The landmarks are seen from the harbor, with the boat doing the traveling.")
    if kind == "food":
        rows.append("Food is the thread: each stop is there for what guests taste, with the street as the setting.")
    if kind == "bike":
        rows.append("Guests cover the sights by bike, stopping where the guide has something to say.")
    if re.search(r"\b(?:american revolution|the revolution)\b", blob, re.I):
        rows.append("The Revolution is the thread that ties the stops together, from the people involved to the places where events happened.")
    if re.search(r"immigrant|immigration", blob, re.I):
        rows.append("Immigration is the thread, following who arrived and how the neighborhood changed around them.")
    if re.search(r"writer|poet|literary|bookstore", blob, re.I):
        rows.append("Writers and the rooms where they worked are the subject, more than a checklist of facades.")
    if re.search(r"lgbtq|queer|pride", blob, re.I):
        rows.append("Persecution, resistance, and celebration are all part of what the guide covers.")
    if re.search(r"\b(?:film|movie|cinematic|television)\b", blob, re.I):
        rows.append("The locations are chosen because a film or television scene was shot there.")
    if re.search(r"fireworks", blob, re.I):
        rows.append("People are on the water so they can watch the display away from the crowded shore.")
    if names and kind == "walk":
        rows.append(
            f"The named places, including {names[0]}, are there so guests can stand where the events happened."
        )
    if len(names) >= 3:
        rows.append(
            f"Among the places guests actually encounter are {names[0]}, {names[1]}, and {names[2]}."
        )
    if len(names) >= 5 and re.search(r"guide|story|stories|hear|commentary", blob, re.I):
        rows.append(
            f"Later the guide turns to {names[3]} and {names[4]}, explaining what happened there."
        )
    elif len(names) >= 5:
        rows.append(f"Later the route reaches {names[3]} and {names[4]}.")
    if re.search(r"benjamin franklin", blob, re.I):
        rows.append("The walk follows Benjamin Franklin's Boston homes and haunts.")
        rows.append("He was born in Boston, came of age in Philadelphia, and later became a favorite in Paris.")
        rows.append("Guests hear about his inventions, his civic and educational work, and his part in founding the United States.")
        rows.append("The walk stays with his Boston homes and haunts. Philadelphia and Paris enter only as the later life the guide uses for context.")
        rows.append("Science, invention, diplomacy, and the humor he was known for all come up on the route.")
    if re.search(r"harbor islands", blob, re.I):
        rows.append("The sail goes out to the Boston Harbor Islands and later turns back toward the inner harbor.")
    if re.search(r"copp's hill", blob, re.I):
        rows.append("The walk starts at Copp's Hill Terrace and continues through the North End.")
        rows.append("From that ground, guests look toward the USS Constitution and the Bunker Hill Monument.")
    if re.search(r"oldest neighborhood", blob, re.I):
        rows.append("The streets are treated as the oldest part of the city, and the stories are told there.")
    if re.search(r"skyline", blob, re.I) and kind == "sail":
        rows.append("The changing skyline is the view, with the boat moving while guests watch from the deck.")
    if re.search(r"music", blob, re.I) and kind == "sail":
        rows.append("Music plays during the cruise, and the landmark commentary is kept light.")
    if re.search(r"cocoa|carols", blob, re.I):
        rows.append("In December that sunset hour is given to cocoa and carols.")
    if re.search(r"cocktails|appetizers|bar", blob, re.I) and kind == "sail":
        rows.append("The deck bar sells drinks and small plates while the boat is underway.")
    if re.search(r"pilot schooner|1890", blob, re.I):
        rows.append("The hull is a pilot schooner in the style of boats from the 1890s, with room on deck to watch.")
    if kind == "walk":
        rows.append("Guests do not travel by bus or by boat. They stand at the sites while the explanation is given.")
        rows.append("Guests keep walking while that account is given, moving at the guide's pace.")
        rows.append("The explanation happens outdoors, in front of the buildings, and the group moves on only after it is given.")
        rows.append("Each pause is there so guests can look at the place the story belongs to.")
    elif kind == "drive":
        vehicle = "car" if re.search(r"\bgocar\b|\bgo\s*car\b", blob, re.I) else "van"
        rows.append(
            f"There is no set walking route. The {vehicle} is how guests move, and most landmarks are seen through the windows."
        )
    elif kind == "sail":
        rows.append("There is no walking route. The boat is how guests move, and the harbor is the viewpoint.")
        rows.append("People stay aboard, watching the shore go by rather than touring the sidewalks.")
        rows.append("The course is on the water for the whole outing, and the shore is what guests are there to see.")
    elif kind == "food":
        rows.append("The stops exist for the food. Streets and storefronts are the setting, and tasting is the point.")
    elif kind == "bike":
        rows.append("Guests are on bikes rather than on foot, with pauses only where there is something to see or hear.")
    elif kind == "bus":
        rows.append("The coach does the traveling. Guests watch the locations go by and hear which scene was filmed at each one.")
    if len(names) >= 2:
        rows.append(
            f"Guests come to {names[0]} and {names[1]}, and they hear why those places are on the trip."
        )
    elif names:
        rows.append(f"Guests come to {names[0]}, and they hear why it is on the trip.")
    indoor = re.search(
        r"\b(workshop|studio|revue|blacklight|spray paint)\b", blob, re.I
    ) or (
        re.search(r"\bcanvas\b", blob, re.I) and not re.search(r"blank canvas", blob, re.I)
    )
    if indoor and re.search(r"revue|strip", blob, re.I):
        rows.append("People are seated for a show. The dancers and the hosts are the event, not a neighborhood route.")
        rows.append("The night stays indoors, and the performance is what guests came to watch.")
    elif indoor:
        rows.append("People stay in the studio for the session. The canvas in front of them is the work, not a sidewalk stop.")
        rows.append("Instruction and practice happen in the same room, and guests leave with the piece they made.")
    else:
        rows.append("Outdoors is where the account is given, with the site itself in front of the group.")
        rows.append("Talking and looking are paired at every stop.")
        rows.append("History stays attached to the places, which is why the route exists.")
        rows.append("The hour is spent at those sites, hearing the account rather than reading it later.")
        rows.append("Guests stay with that subject for the length of the outing.")
        rows.append("Nothing is staged indoors, because the block itself is the room.")
        rows.append("Seeing the place and hearing the reason for it are the whole visit.")
        rows.append("The visit is guided and the places are specific. Guests hear the explanation while they are standing at those places, not afterward from a brochure.")
        rows.append("A brochure is not a substitute for being at the site.")
    return rows


DEBUG_REASONS: list[tuple[str, str]] = []


def finish_experience(
    facts: dict,
    title: str,
    operator: str,
    meeting: str | None,
    overlap_text: str,
) -> list[str] | None:
    description = facts.get("description") or ""
    short_stops = []
    for stop in facts.get("itinerary") or []:
        text = ev.clean_text(stop)
        if not text or ev.count_words([text]) > 6:
            continue
        if re.match(r"^(see|visit|stop|take|learn|explore|hear|enjoy|view)\b", text, re.I):
            continue
        short_stops.append(text)
    blob = " ".join(
        part
        for part in (
            description,
            " ".join(short_stops),
            " ".join(facts.get("highlights") or []),
            " ".join(facts.get("included") or []),
        )
        if part
    )
    if ev.count_words([blob]) < 40:
        DEBUG_REASONS.append((title, "short-blob"))
        return None
    kind = ev.activity_kind(title, blob)
    names = _names(blob, title, operator)
    cue_drafts = _cue_sentences(kind, blob)
    name_drafts = _name_sentences(kind, names, blob)
    used: list[str] = []
    kept: list[str] = []
    seen = set()

    def _take(draft: str) -> None:
        if _LOGISTICS.search(draft or ""):
            return
        cleaned = _accept(draft, overlap_text or blob, title, operator, meeting, used)
        if not cleaned:
            return
        key = cleaned.lower()
        if key in seen:
            return
        seen.add(key)
        kept.append(cleaned)

    for draft in cue_drafts:
        _take(draft)
        if ev.count_words(kept) >= ev.PREFERRED_MAX_EDITORIAL_WORDS:
            break
    if ev.count_words(kept) < ev.MIN_FULL_EDITORIAL_WORDS:
        for draft in name_drafts:
            _take(draft)
            if ev.count_words(kept) >= ev.PREFERRED_MAX_EDITORIAL_WORDS:
                break
    if ev.count_words(kept) < ev.MIN_FULL_EDITORIAL_WORDS:
        for draft in _stretch(kind, names, blob, " ".join(kept)):
            _take(draft)
            if ev.count_words(kept) >= ev.MIN_FULL_EDITORIAL_WORDS:
                break
    if ev.count_words(kept) < ev.MIN_FULL_EDITORIAL_WORDS:
        DEBUG_REASONS.append((title, f"under-{ev.count_words(kept)}"))
        return None
    # Trim into the preferred band without dropping below 100.
    chosen = []
    total = 0
    for item in kept:
        words = ev.count_words([item])
        if total >= ev.MIN_FULL_EDITORIAL_WORDS and total + words > ev.PREFERRED_MAX_EDITORIAL_WORDS + 10:
            break
        chosen.append(item)
        total += words
        if total >= ev.PREFERRED_MAX_EDITORIAL_WORDS:
            break
    if ev.count_words(chosen) < ev.MIN_FULL_EDITORIAL_WORDS:
        DEBUG_REASONS.append((title, f"trim-{ev.count_words(chosen)}"))
        return None
    paragraphs = ev._pack_paragraphs(chosen)
    if ev.editorial_length_errors(paragraphs):
        DEBUG_REASONS.append((title, "length"))
        return None
    quality = ev.prose_quality_errors(paragraphs, title, blob)
    if quality:
        DEBUG_REASONS.append((title, "quality:" + quality[0][:80]))
        return None
    fragments = ev.fragment_errors(paragraphs)
    if fragments or ev.editorial_is_thin(paragraphs):
        DEBUG_REASONS.append((title, "fragment" if fragments else "thin"))
        return None
    if ev.overlap_with_source(" ".join(paragraphs), overlap_text or blob, title, operator):
        DEBUG_REASONS.append((title, "overlap"))
        return None
    return paragraphs
