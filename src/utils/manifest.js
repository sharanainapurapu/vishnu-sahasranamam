// Loads and joins the two data files into the model the UI consumes:
//   - manifest.json      : audio structure (sections, per-mode items, audioKey)
//   - text-content.json  : per-sloka multi-language text
// They are joined by (sectionKey, slokaNumber). Keeping them separate lets the
// teacher update recordings and script independently.

const base = () => import.meta.env.BASE_URL || '/'

export const loadData = async () => {
  const [manifestRes, textRes] = await Promise.all([
    fetch(`${base()}data/manifest.json`),
    fetch(`${base()}data/text-content.json`),
  ])
  if (!manifestRes.ok) throw new Error('Failed to load audio manifest')
  const manifest = await manifestRes.json()
  // Text is optional — the app still works (audio only) if it is missing.
  const text = textRes.ok ? await textRes.json() : { sections: [] }

  const textBySection = new Map()
  for (const sec of text.sections || []) {
    const byNumber = new Map()
    for (const s of sec.slokas || []) byNumber.set(s.number, s.text || {})
    textBySection.set(sec.key, byNumber)
  }

  const sections = (manifest.sections || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((sec) => {
      const textByNumber = textBySection.get(sec.key) || new Map()

      // Build the text for an item. A single sloka (start === end) uses that
      // sloka's text. A bundle (non-tutorial, e.g. 1–7) concatenates every
      // sloka in its range per language, so the card shows all grouped verses.
      const textForRange = (start, end) => {
        if (start === end) return textByNumber.get(start) || null
        const merged = {}
        for (let n = start; n <= end; n++) {
          const t = textByNumber.get(n)
          if (!t) continue
          for (const [lang, val] of Object.entries(t)) {
            if (!val) continue
            // Prefix each verse with a number marker ("§N") so the display can
            // show the sloka number before its text when several are stacked.
            const block = `§${n}\n${val}`
            merged[lang] = merged[lang] ? `${merged[lang]}\n\n${block}` : block
          }
        }
        return Object.keys(merged).length ? merged : null
      }

      const decorate = (item) => ({
        ...item,
        // Label like "3" or "1–7" for bundle items.
        label: item.start === item.end ? String(item.start) : `${item.start}–${item.end}`,
        text: textForRange(item.start, item.end),
      })
      return {
        id: sec.id,
        key: sec.key,
        name: sec.name,
        order: sec.order,
        tutorial: (sec.tutorial || []).map(decorate),
        nonTutorial: (sec.nonTutorial || []).map(decorate),
      }
    })

  return {
    languages: manifest.languages || [],
    encoding: manifest.encoding || null,
    sections,
  }
}

// Flattened, ordered list of selectable items for a given mode across all
// sections. Each item carries its section so the UI can label/colour it.
export const itemsForMode = (sections, mode) => {
  const field = mode === 'nonTutorial' ? 'nonTutorial' : 'tutorial'
  const out = []
  for (const sec of sections) {
    for (const item of sec[field]) {
      out.push({ ...item, section: sec.key, sectionName: sec.name })
    }
  }
  return out
}

// In non-tutorial mode a selection "snaps" to whole bundles: given a target
// sloka number, return the bundle item that contains it (or null).
export const bundleContaining = (items, slokaNumber) =>
  items.find((it) => slokaNumber >= it.start && slokaNumber <= it.end) || null

// Build the item to show in the text card for a selection spanning flat indices
// lo..hi. For a single item it is that item. For a multi-item range it is a
// synthetic item whose text concatenates every item in the range per language,
// so the card shows all selected verses — identical behaviour in both modes
// (a non-tutorial bundle is already one item; a tutorial range spans several).
export const displayItemForRange = (items, lo, hi) => {
  if (!items.length) return null
  const a = Math.max(0, Math.min(lo, hi))
  const b = Math.min(items.length - 1, Math.max(lo, hi))
  const first = items[a]
  if (a === b) return first

  const merged = {}
  for (let i = a; i <= b; i++) {
    const it = items[i]
    const t = it?.text
    if (!t) continue
    // Marker label for this item: a single sloka number, or a bundle's range.
    const marker = it.start === it.end ? `§${it.start}` : `§${it.start}–${it.end}`
    for (const [lang, val] of Object.entries(t)) {
      if (!val) continue
      const block = `${marker}\n${val}`
      merged[lang] = merged[lang] ? `${merged[lang]}\n\n${block}` : block
    }
  }
  return {
    ...first,
    start: first.start,
    end: items[b].end,
    text: Object.keys(merged).length ? merged : null,
  }
}
