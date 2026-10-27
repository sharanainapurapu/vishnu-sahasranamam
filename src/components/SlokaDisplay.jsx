import { useLayoutEffect, useMemo, useRef, useState } from 'react'

const SECTION_LABELS = {
  intro: 'Introduction',
  section_1: 'Pūrvapīṭhikā',
  section_2: 'Dhyānam',
  section_3: 'Sahasranāmam',
  section_4: 'Uttarapīṭhikā',
  dhyanam: 'Dhyānam',
  main: 'Sahasranāmam',
  phalasruti: 'Phalaśruti',
  outro: 'Conclusion',
}

// Alignment rules for the verse:
//  - Each authored line (split on "\n") ALWAYS stays on exactly one line.
//  - The whole verse auto-scales so the widest line fits the card width.
//  - Result: the line-break shape is identical on phone, tablet, and desktop;
//    only the font size changes. Students memorize one stable visual layout.
const MAX_FONT = 27 // px — comfortable desktop size
const MIN_FONT = 11 // px — floor so it stays legible on very narrow screens

const SlokaDisplay = ({ sloka, language }) => {
  const slokaText = sloka?.text?.[language] || sloka?.text?.sanskrit || ''
  const sectionLabel = SECTION_LABELS[sloka?.section] || sloka?.section

  const lines = useMemo(
    () => (slokaText.length ? slokaText.split('\n') : ['']),
    [slokaText]
  )

  const containerRef = useRef(null)
  const measureRef = useRef(null)
  const [fontSize, setFontSize] = useState(MAX_FONT)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    const fit = () => {
      // Available inner width of the verse area.
      const available = container.clientWidth
      if (!available) return
      // Measure the widest line at the MAX font size (hidden measuring node
      // is rendered at MAX_FONT with nowrap), then scale down to fit.
      const widest = measure.scrollWidth
      if (!widest) return
      // 0.98 safety factor keeps the longest line just inside the card edge.
      const scaled = Math.floor(MAX_FONT * (available / widest) * 0.98)
      setFontSize(Math.max(MIN_FONT, Math.min(MAX_FONT, scaled)))
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [lines, language])

  return (
    <div className="bg-paper-card border border-paper-line rounded-2xl p-5 sm:p-8 md:p-10">
      <div className="w-7 h-0.5 bg-saff-500 mb-3" />
      <div className="text-xs font-semibold tracking-widest uppercase text-saff-700">
        {sectionLabel}
      </div>

      <div ref={containerRef} className="mt-6">
        {/* Hidden measuring node: widest authored line at MAX font, no wrap */}
        <div
          ref={measureRef}
          aria-hidden="true"
          className={`font-serif sloka-text-${language}`}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: `${MAX_FONT}px`,
            pointerEvents: 'none',
          }}
        >
          {lines.reduce((a, b) => (b.length > a.length ? b : a), '')}
        </div>

        {/* Visible verse: each authored line on its own row, never wrapping */}
        <div
          className={`text-center font-serif text-ink-900 sloka-text-${language}`}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'nowrap' }}>
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="text-xs text-ink-500 capitalize">{language}</span>
      </div>
    </div>
  )
}

export default SlokaDisplay
