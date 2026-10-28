#!/usr/bin/env python3
"""
Import the teacher's multi-language verse text from script/<lang> into
public/data/text-content.json, keyed by (section, sloka number) so it lines up
with the audio manifest.

Each script/<lang> file has the same deterministic structure:
  - optional lead-in lines, then four sections in this fixed order:
      Pūrvapīṭhikā (purvapithika) 1..23
      Dhyānam       (dhyanam)      1..6
      Namavali      (namalu)       1..108
      Uttarapīṭhikā (uttarapithika) 1..32
  - a section boundary is a line "N." where N == 1 (numbering restarts per
    section). Non-numbered lines (speaker intros like "Śrī bhīṣma uvāca",
    "Hariḥ ōm", prose blocks) attach to the NEXT numbered sloka as lead-in,
    matching how the recitation flows.

Numbering is positional and identical across languages, so we rely on the "1."
resets for section boundaries rather than localized header strings.

Usage:  python3 scripts/import_script_text.py
"""

import json
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCRIPT_DIR = REPO / "script"
MANIFEST = REPO / "public" / "data" / "manifest.json"
OUT = REPO / "public" / "data" / "text-content.json"

# Sections in the fixed order they appear in every script file.
SECTION_ORDER = ["purvapithika", "dhyanam", "namalu", "uttarapithika"]
SECTION_NAME = {
    "purvapithika": "Pūrvapīṭhikā",
    "dhyanam": "Dhyānam",
    "namalu": "Namavali",
    "uttarapithika": "Uttarapīṭhikā",
}

NUM_RE = re.compile(r"^(\d+)\.\s*(.*)$")


def audio_max_sloka():
    """Highest individual sloka number per section from the audio manifest.

    Used as the oracle for whether a section's trailing boundary prose is its own
    numbered sloka (e.g. Pūrvapīṭhikā 24 viniyoga, Uttarapīṭhikā 33 colophon) or
    just a chant-tag that belongs to the last verse (e.g. the refrain after
    Namavali 108, which the audio does NOT number).
    """
    out = {}
    if not MANIFEST.exists():
        return out
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for s in m.get("sections", []):
        nums = [it["start"] for it in s.get("tutorial", []) if it["start"] == it["end"]]
        if nums:
            out[s["key"]] = max(nums)
    return out


def parse_file(path: Path, section_max: dict):
    """Return {(section_key, number): text} for one language file.

    Structure of each file (after the leading invocation was stripped):

        1. <verse>                 } Pūrvapīṭhikā
        ...                        }
        <boundary prose>           }  (viniyoga etc. — closes the section)
        <SECTION HEADER>              e.g. "Dhyānam"
        1. <verse>                 } Dhyānam
        ...

    Two kinds of non-numbered prose appear:
      - a SPEAKER INTRO inside a section ("... uvāca :-") that leads into the
        NEXT numbered verse, and
      - a BOUNDARY block at the end of a section (the viniyoga after Pūrvapīṭhikā
        23, the closing mantras near the end of Namavali / Uttarapīṭhikā) that
        belongs to that section's LAST verse.

    We tell them apart by the section header: a non-numbered run that is followed
    by a "1." reset is boundary prose (attach to the previous verse, and drop the
    header line itself); otherwise the run is a speaker intro (attach to the next
    verse). Lines are kept contiguous and in order.
    """
    raw_lines = [l.strip() for l in path.read_text(encoding="utf-8").splitlines()]
    tokens = [l for l in raw_lines if l]

    # First pass: split into slokas. Each sloka = (section_idx, number, [lines]).
    # Trailing non-numbered lines stay with the sloka they follow for now; we
    # re-home boundary prose in the second pass.
    slokas = []           # list of dicts: {section, number, lines}
    lead_before_first = []  # prose before any numbered sloka in a section
    section_idx = -1
    cur = None

    for line in tokens:
        m = NUM_RE.match(line)
        if m:
            n = int(m.group(1))
            if n == 1:
                section_idx += 1
            cur = {"section_idx": section_idx, "number": n, "lines": []}
            if m.group(2):
                cur["lines"].append(m.group(2))
            slokas.append(cur)
        else:
            if cur is None:
                lead_before_first.append(line)
            else:
                cur["lines"].append(line)

    # Second pass: re-home only the prose we can identify with confidence, so we
    # never accidentally split a real verse. Two safe cases:
    #
    #   (a) SPEAKER INTRO: a trailing line matching "... uvāca :-" (or the lone
    #       "Hariḥ ōm" before Namavali) leads into the NEXT verse. Move the run
    #       from this sloka's tail onto the next sloka's front.
    #   (b) BOUNDARY PROSE: the prose at the end of a section (the viniyoga block
    #       after Pūrvapīṭhikā 23; the closing colophon after Uttarapīṭhikā 32)
    #       is recorded in the audio as that section's NEXT number (PP 24, UP 33).
    #       So we split it off as a new sloka numbered (last verse + 1), and drop
    #       the single section-header line that follows it.
    #
    # Everything else stays with the sloka it was read under, which keeps
    # shifted-danda verses (e.g. Pūrvapīṭhikā 19) intact.
    def is_speaker_intro(line):
        s = line.lower()
        return s.endswith(":-") or "uvāca" in s or s in ("hariḥ ōm", "hariḥ ōṁ")

    # Section-name header lines that sit just before a "1." reset, in every
    # script. These are DROPPED (they are headings, not content). A non-॥ line
    # before a reset that is NOT one of these (e.g. "Hariḥ ōm") is a lead-in and
    # is moved to the next section's first verse instead.
    SECTION_HEADERS = {
        # Dhyānam
        "dhyānam", "ধ্যানম্", "ધ્યાનમ્", "ध्यानम्", "ಧ್ಯಾನಮ್", "ധ്യാനമ്",
        "ଧ୍ଯାନମ୍", "ਧ੍ਯਾਨਮ੍", "த்யானம்", "ధ్యానమ్",
        # Uttarapīṭhikā
        "uttarapīṭhikā", "উত্তরপীঠিকা", "ઉત્તરપીઠિકા", "उत्तरपीठिका",
        "ಉತ್ತರಪೀಠಿಕಾ", "ഉത്തരപീഠികാ", "ଉତ୍ତରପୀଠିକା", "ਉਤ੍ਤਰਪੀਠਿਕਾ",
        "உத்தரபீடிகா", "ఉత్తరపీఠికా",
    }

    def is_section_header(line):
        return line.strip().lower() in SECTION_HEADERS

    out = {}
    for i, s in enumerate(slokas):
        if s["section_idx"] < 0:
            continue
        sec_key = SECTION_ORDER[s["section_idx"]]
        lines = list(s["lines"])
        nxt = slokas[i + 1] if i + 1 < len(slokas) else None
        crosses_boundary = nxt is not None and nxt["number"] == 1
        is_last_of_file = nxt is None

        # (a) Move a trailing speaker-intro run to the NEXT verse (same section).
        if nxt is not None and not crosses_boundary:
            j = len(lines)
            while j > 0 and is_speaker_intro(lines[j - 1]):
                j -= 1
            if j < len(lines):
                nxt["lines"] = lines[j:] + nxt["lines"]
                lines = lines[:j]

        # (b) At a section boundary (or file end), peel off trailing boundary
        # prose into a new (last+1) sloka. The verse ends at its last ॥ line; any
        # lines after that, minus a trailing non-verse section header, are prose.
        if crosses_boundary or is_last_of_file:
            # A trailing non-॥ line right before a section reset is either the
            # next section's NAME HEADER (drop it) or a LEAD-IN chant like
            # "Hariḥ ōm" that belongs to the next section's first verse (move it).
            # A header matches a known section name (in any script); anything
            # else is a lead-in. This applies uniformly to every language.
            if crosses_boundary and lines and "॥" not in lines[-1]:
                tail = lines[-1]
                if is_section_header(tail):
                    lines = lines[:-1]
                else:
                    nxt["lines"] = [tail] + nxt["lines"]
                    lines = lines[:-1]
            # The numbered verse ends at its FIRST closing ॥; the boundary prose
            # (viniyoga / colophon / refrain) is everything after it.
            first_danda = next((k for k, l in enumerate(lines) if "॥" in l), -1)
            verse_lines = lines[:first_danda + 1]
            prose_lines = lines[first_danda + 1:]
            if prose_lines and any("॥" in l for l in prose_lines):
                extra_num = s["number"] + 1
                if section_max.get(sec_key, s["number"]) >= extra_num:
                    # The audio numbers this block (PP 24 viniyoga, UP 33
                    # colophon) → its own sloka.
                    out[(sec_key, extra_num)] = "\n".join(prose_lines).strip()
                    lines = verse_lines
                # else: a chant-tag the audio does NOT number (e.g. the refrain
                # after Namavali 108) → leave it attached to the last verse.

        key = (sec_key, s["number"])
        text = "\n".join(lines).strip()
        if text:
            out[key] = text
    return out


def main():
    if not SCRIPT_DIR.is_dir():
        raise SystemExit(f"No script/ folder at {SCRIPT_DIR}")

    files = sorted(p for p in SCRIPT_DIR.iterdir() if p.is_file())
    langs = [f.name for f in files]
    section_max = audio_max_sloka()

    # (section, number) -> {lang: text}
    merged = {}
    per_lang_counts = {}
    for f in files:
        parsed = parse_file(f, section_max)
        per_lang_counts[f.name] = len(parsed)
        for key, text in parsed.items():
            merged.setdefault(key, {})[f.name] = text

    # Build sections in order with every sloka number that has any text.
    sections = []
    for sec in SECTION_ORDER:
        numbers = sorted(n for (s, n) in merged if s == sec)
        slokas = []
        for n in numbers:
            text = dict(merged[(sec, n)])
            slokas.append({"number": n, "text": text})
        sections.append({"key": sec, "name": SECTION_NAME[sec], "slokas": slokas})

    out = {"schemaVersion": 2, "languages": langs, "sections": sections}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")

    total = sum(len(s["slokas"]) for s in sections)
    print("Imported languages:", ", ".join(langs))
    print("Per-language sloka counts:")
    for lang, c in per_lang_counts.items():
        print(f"  {lang:<10} {c}")
    print(f"\nWrote {OUT.relative_to(REPO)}: {total} slokas across {len(sections)} sections.")
    for s in sections:
        print(f"  {s['name']:<16} {len(s['slokas'])} slokas (1..{s['slokas'][-1]['number'] if s['slokas'] else 0})")


if __name__ == "__main__":
    main()
