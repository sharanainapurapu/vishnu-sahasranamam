#!/usr/bin/env python3
"""
Build the audio manifest + encode the served audio for the VSN app.

Reads the raw teacher recordings from "Audio Recordings/" (git-ignored source
material) and produces:

  1. public/audio/<mode>/<hashed>.m4a   - re-encoded ~64 kbps mono AAC files
  2. public/data/manifest.json          - the single source of truth the app
                                          reads: sections, slokas, bundles, and
                                          which audio key each maps to.

Why a manifest instead of the app guessing from filenames:
  The raw filenames are inconsistent (mixed extensions, two naming schemes for
  Purvapithika, gaps, a stray "8-12" combined clip). We resolve all of that here,
  once, so the app only ever sees clean data.

Design decisions baked in (flip in the DECISIONS block or the per-section config):
  - Purvapithika tutorial = slokas 1..24. The VS_PP_* scheme wins for 6..24.
    Slokas 1,3,4,5 come from VSN _PP_01/03/04/05. Sloka 2 has no file -> disabled.
    "VSN _PP_0" is treated as a section intro (not a numbered sloka) -> skipped.
  - Uttarapithika tutorial = slokas 1..33. Sloka 26 has no file -> disabled.
  - Namalu tutorial = 1..108, all present. The extra "VSN 8-12" combined clip is
    exposed as a selectable combined item in tutorial mode.
  - Non-tutorial Namalu: bundles 27-30 and 51-52 have no file -> disabled.
  - Non-tutorial Uttarapithika: no files -> whole section disabled in that mode.

Usage:
  python3 scripts/build_audio_manifest.py --probe-only   # just print the plan
  python3 scripts/build_audio_manifest.py                # encode + write manifest

Requires ffmpeg/ffprobe on PATH.
"""

import argparse
import hashlib
import json
import re
import subprocess
import sys
import unicodedata
from dataclasses import dataclass, field, asdict
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RAW = REPO / "Audio Recordings"
OUT_AUDIO = REPO / "public" / "audio"
OUT_MANIFEST = REPO / "public" / "data" / "manifest.json"

# Target encode: single-voice speech, mono, modest bitrate. Indistinguishable
# from the 128k+ originals for recitation while cutting payload ~3x.
TARGET_BITRATE = "64k"
TARGET_AR = "44100"

# Obscured, stable key for a served file: hash of (mode, section, canonical id).
# Keeps real sloka numbers out of the URL (the "obscurity" security layer) while
# staying deterministic so re-runs don't churn filenames.
def audio_key(mode: str, section: str, canon: str) -> str:
    h = hashlib.sha1(f"{mode}/{section}/{canon}".encode("utf-8")).hexdigest()
    return h[:16]


# Order matches the script/recitation sequence:
# Pūrvapīṭhikā → Dhyānam → Namavali → Uttarapīṭhikā.
SECTION_META = {
    "purvapithika":  {"id": "section_purva",    "name": "Pūrvapīṭhikā",   "order": 1},
    "dhyanam":       {"id": "section_dhyanam",  "name": "Dhyānam",        "order": 2},
    "namalu":        {"id": "section_namalu",   "name": "Namavali",       "order": 3},
    "uttarapithika": {"id": "section_uttara",   "name": "Uttarapīṭhikā",  "order": 4},
}


@dataclass
class Item:
    # One selectable unit. In tutorial mode usually one sloka; may be a combined
    # clip spanning start..end. In non-tutorial mode a bundle spanning start..end.
    start: int
    end: int
    src: str | None            # path under RAW, or None if the file is missing
    enabled: bool = True
    note: str = ""
    duration: float = 0.0
    key: str = ""              # served audio key (set during encode)


def probe_duration(path: Path) -> float:
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)],
            capture_output=True, text=True, check=True,
        )
        return round(float(out.stdout.strip()), 3)
    except Exception:
        return 0.0


def _nfc(s: str) -> str:
    # macOS stores filenames in NFD (decomposed). Normalize both the filename and
    # the pattern to NFC so accented chars like "ā" match regardless of form.
    return unicodedata.normalize("NFC", s)


def _despace(s: str) -> str:
    # The raw filenames have spaces scattered inconsistently (e.g. "VS_ Namavali",
    # "VS _Namavali", "VS_Namavali_ 1-7"). Match on the space-stripped form so a
    # single pattern handles every variant. Patterns are written space-free too.
    return _nfc(s).replace(" ", "")


def find_one(folder: Path, *patterns: str) -> Path | None:
    """Return the first file in folder matching any regex (case-insensitive).

    Matching ignores spaces in both the filename and the pattern, so write
    patterns without spaces.
    """
    if not folder.is_dir():
        return None
    files = sorted(folder.iterdir())
    for pat in patterns:
        rx = re.compile(_despace(pat), re.IGNORECASE)
        for f in files:
            if f.is_file() and rx.fullmatch(_despace(f.name)):
                return f
    return None


# --------------------------------------------------------------------------
# Per-section builders. Each returns (tutorial_items, nontutorial_items).
# --------------------------------------------------------------------------

def build_dhyanam():
    t_dir = RAW / "Tutorial" / "Dhyānam"
    n_dir = RAW / "Non Tutorial" / "Dhyanam"
    tutorial = []
    for n in range(1, 7):
        src = find_one(t_dir, rf"VS_Dhyānam ?_{n}\.m4a")
        tutorial.append(Item(n, n, str(src.relative_to(RAW)) if src else None,
                             enabled=src is not None,
                             note="" if src else "missing file"))
    nontutorial = [
        Item(1, 4, rel(find_one(n_dir, r"VS_Dhyānam ?_1-4\..*"))),
        Item(5, 6, rel(find_one(n_dir, r"VS_Dhyānam_5-6\..*"))),
    ]
    return tutorial, nontutorial


def build_purvapithika():
    t_dir = RAW / "Tutorial" / "pūrvapīṭhikā"
    n_dir = RAW / "Non Tutorial" / "Purvapeetika"
    tutorial = []
    # Pūrvapīṭhikā is slokas 1..24. Slokas 1,3,4,5 come from the VSN _PP_0x
    # scheme; 2 is missing; 6..23 from VS_PP_*; sloka 24 is the viniyoga block
    # (recorded as "VS_PP_24_Nyasa mantras").
    low = {
        1: find_one(t_dir, r"VSN ?_PP_0?1\..*"),
        3: find_one(t_dir, r"VSN ?_PP_0?3\..*"),
        4: find_one(t_dir, r"VSN ?_PP_0?4\..*"),
        5: find_one(t_dir, r"VSN_PP_ ?0?5\..*"),
    }
    for n in range(1, 25):
        if n in low:
            src = low[n]
        elif n == 2:
            src = None
        elif n == 24:
            src = find_one(t_dir, r"VS_PP_24.*\.m4a")
        else:
            src = find_one(t_dir, rf"VS_PP_{n}\.m4a")
        tutorial.append(Item(n, n, rel(src), enabled=src is not None,
                             note="" if src else "missing file — enable when teacher shares"))
    nontutorial = [
        Item(1, 5,  rel(find_one(n_dir, r"VS_PP_1-5\..*"))),
        Item(6, 13, rel(find_one(n_dir, r"VS_PP_6-13\..*"))),
        Item(14, 20, rel(find_one(n_dir, r"VS_PP_14-20\..*"))),
        Item(21, 23, rel(find_one(n_dir, r"VS_PP_21-23.*\..*"))),
    ]
    return tutorial, nontutorial


def build_namalu():
    t_dir = RAW / "Tutorial" / "Namalu"
    n_dir = RAW / "Non Tutorial" / "Namalu"
    tutorial = []
    for n in range(1, 109):
        src = find_one(t_dir, rf"VSN {n:02d}\..*", rf"VSN {n}\..*")
        tutorial.append(Item(n, n, rel(src), enabled=src is not None,
                             note="" if src else "missing file"))
    # Note: a combined "VSN 8-12" clip exists in the Tutorial folder but is NOT
    # exposed — slokas 8..12 are available individually, so the combined button
    # would just be confusing.

    # Non-tutorial bundles. Present ranges + the two known gaps as disabled.
    present = [
        (1, 7), (8, 12), (13, 19), (20, 26),
        (31, 40), (41, 50), (53, 60), (61, 70),
        (71, 80), (81, 90), (91, 100), (101, 108),
    ]
    gaps = [(27, 30), (51, 52)]
    nontutorial = []
    for a, b in present:
        src = find_one(n_dir, rf"VS ?_?Namavali_ ?{a}-{b}\..*")
        nontutorial.append(Item(a, b, rel(src), enabled=src is not None,
                                note="" if src else "bundle file not found"))
    for a, b in gaps:
        nontutorial.append(Item(a, b, None, enabled=False,
                                note="no bundle yet — enable when teacher shares"))
    nontutorial.sort(key=lambda it: it.start)
    return tutorial, nontutorial


def build_uttarapithika():
    t_dir = RAW / "Tutorial" / "UttaraPithika"
    tutorial = []
    for n in range(1, 34):
        src = find_one(t_dir, rf"VS_UP {n}\..*")
        if n == 26:
            tutorial.append(Item(26, 26, None, enabled=False,
                                 note="no file yet — enable when teacher shares"))
            continue
        tutorial.append(Item(n, n, rel(src), enabled=src is not None,
                             note="" if src else "missing file"))
    # Non-tutorial: no files exist for Uttarapithika yet -> whole section disabled.
    nontutorial = []
    return tutorial, nontutorial


def rel(p: Path | None) -> str | None:
    return str(p.relative_to(RAW)) if p else None


SECTION_BUILDERS = {
    "dhyanam": build_dhyanam,
    "purvapithika": build_purvapithika,
    "namalu": build_namalu,
    "uttarapithika": build_uttarapithika,
}


def encode(src_rel: str, mode: str, section: str, canon: str, probe_only: bool) -> tuple[str, float]:
    """Encode one raw file to mono 64k AAC under public/audio/<mode>/<key>.m4a."""
    key = audio_key(mode, section, canon)
    src = RAW / src_rel
    dur = probe_duration(src)
    if probe_only:
        return key, dur
    dest_dir = OUT_AUDIO / mode
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{key}.m4a"
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src), "-vn", "-ac", "1",
         "-c:a", "aac", "-b:a", TARGET_BITRATE, "-ar", TARGET_AR,
         "-movflags", "+faststart", str(dest)],
        capture_output=True, check=True,
    )
    return key, dur


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe-only", action="store_true",
                    help="Resolve the mapping and print a summary without encoding.")
    args = ap.parse_args()

    if not RAW.is_dir():
        sys.exit(f"Raw recordings not found at {RAW}")

    manifest = {
        "schemaVersion": 2,
        "title": "Vishnu Sahasranamam",
        "encoding": {"codec": "aac", "bitrate": TARGET_BITRATE, "channels": 1},
        "languages": ["sanskrit", "tamil", "telugu", "kannada", "malayalam", "hindi", "english"],
        "sections": [],
    }

    summary = []
    for section, builder in SECTION_BUILDERS.items():
        meta = SECTION_META[section]
        tutorial, nontutorial = builder()

        def process(items, mode):
            out = []
            for it in items:
                canon = f"{it.start}-{it.end}" if it.start != it.end else str(it.start)
                if it.src:
                    key, dur = encode(it.src, mode, section, canon, args.probe_only)
                    it.key = key
                    it.duration = dur
                out.append({
                    "start": it.start,
                    "end": it.end,
                    "enabled": it.enabled and it.src is not None,
                    "audioKey": it.key or None,
                    "duration": it.duration,
                    "note": it.note,
                })
            return out

        tut = process(tutorial, "tutorial")
        non = process(nontutorial, "nontutorial")

        manifest["sections"].append({
            "id": meta["id"],
            "key": section,
            "name": meta["name"],
            "order": meta["order"],
            "tutorial": tut,
            "nonTutorial": non,
        })

        t_on = sum(1 for x in tut if x["enabled"])
        n_on = sum(1 for x in non if x["enabled"])
        summary.append(f"  {meta['name']:<16} tutorial {t_on}/{len(tut)} enabled"
                       f"   non-tutorial {n_on}/{len(non)} enabled")

    if not args.probe_only:
        OUT_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        OUT_MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))

    print("Audio manifest plan:")
    print("\n".join(summary))
    if args.probe_only:
        print("\n(probe-only: no files encoded, manifest not written)")
    else:
        print(f"\nWrote {OUT_MANIFEST.relative_to(REPO)}")
        print(f"Encoded audio under {OUT_AUDIO.relative_to(REPO)}/")


if __name__ == "__main__":
    main()
