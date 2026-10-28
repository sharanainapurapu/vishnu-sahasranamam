#!/usr/bin/env python3
"""
Generate public/data/text-content.json — the sloka TEXT keyed to match the audio
manifest, so the two always align.

Audio (manifest.json) and text (text-content.json) are kept separate on purpose:
the teacher's language script arrives independently of the recordings, and each
can be updated without touching the other. They are joined in the app by
(sectionKey, slokaNumber).

This builds a skeleton with every section + every individual sloka number present
in the manifest's tutorial lists, each with all 7 language fields as placeholders.
Paste the real script over the placeholders; keys must not change.

Re-running MERGES: existing non-placeholder text is preserved, new numbers are
added. So it is safe to run again after the manifest grows.

Usage:  python3 scripts/build_text_skeleton.py
"""

import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = REPO / "public" / "data" / "manifest.json"
OUT = REPO / "public" / "data" / "text-content.json"

LANGS = ["sanskrit", "tamil", "telugu", "kannada", "malayalam", "hindi", "english"]


def placeholder(section_name: str, n: int, lang: str) -> str:
    return f"[{section_name} · Sloka {n} · {lang} — text to be added]"


def is_placeholder(val: str) -> bool:
    return isinstance(val, str) and val.startswith("[") and "to be added" in val


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    existing = {}
    if OUT.exists():
        prev = json.loads(OUT.read_text(encoding="utf-8"))
        for sec in prev.get("sections", []):
            for s in sec.get("slokas", []):
                existing[(sec["key"], s["number"])] = s.get("text", {})

    out = {"schemaVersion": 2, "languages": LANGS, "sections": []}

    for sec in manifest["sections"]:
        # Individual sloka numbers that exist in this section (from tutorial items
        # where start == end). Combined clips (start != end) are not text rows.
        numbers = sorted({
            it["start"] for it in sec["tutorial"] if it["start"] == it["end"]
        })
        slokas = []
        for n in numbers:
            prev_text = existing.get((sec["key"], n), {})
            text = {}
            for lang in LANGS:
                val = prev_text.get(lang)
                text[lang] = val if (val and not is_placeholder(val)) else \
                    placeholder(sec["name"], n, lang)
            slokas.append({"number": n, "text": text})
        out["sections"].append({
            "key": sec["key"],
            "name": sec["name"],
            "slokas": slokas,
        })

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(len(s["slokas"]) for s in out["sections"])
    print(f"Wrote {OUT.relative_to(REPO)} with {total} sloka text entries "
          f"across {len(out['sections'])} sections.")


if __name__ == "__main__":
    main()
