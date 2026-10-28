import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getSectionTheme } from '../utils/sectionTheme'
import { getItemLabel } from '../utils/slokaLabels'

// The verse text, auto-scaled so each authored line stays on one row and the
// line-break shape is identical across devices (only font size changes). This
// gives a learner one stable visual to memorise.
const MAX_FONT = 27
const MIN_FONT = 11

const SlokaDisplay = ({ item, language }) => {
  const theme = getSectionTheme(item?.section)
  const sectionLabel = theme.name || item?.section
  const text = item?.text?.[language] || item?.text?.english || ''
  const isPlaceholder = typeof text === 'string' && text.startsWith('[') && text.includes('to be added')
  const shown = isPlaceholder ? '' : text

  const lines = useMemo(() => (shown.length ? shown.split('\n') : ['']), [shown])

  const containerRef = useRef(null)
  const measureRef = useRef(null)
  const [fontSize, setFontSize] = useState(MAX_FONT)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return
    const fit = () => {
      const available = container.clientWidth
      if (!available) return
      const widest = measure.scrollWidth
      if (!widest) return
      const scaled = Math.floor(MAX_FONT * (available / widest) * 0.98)
      setFontSize(Math.max(MIN_FONT, Math.min(MAX_FONT, scaled)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [lines, language])

  return (
    <div
      className="rounded-2xl p-5 sm:p-7 border transition-colors"
      style={{ backgroundColor: theme.soft, borderColor: theme.dot }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="w-7 h-0.5 mb-3" style={{ backgroundColor: theme.dot }} />
          <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: theme.text }}>
            {sectionLabel}
          </div>
        </div>
        <div className="text-sm font-medium" style={{ color: theme.text }}>
          {getItemLabel(item)}
        </div>
      </div>

      <div ref={containerRef} className="mt-5">
        <div
          ref={measureRef}
          aria-hidden="true"
          className={`font-serif sloka-text-${language}`}
          style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', fontSize: `${MAX_FONT}px`, pointerEvents: 'none' }}
        >
          {/* Widest actual verse line (number markers excluded from sizing). */}
          {lines.filter((l) => !l.startsWith('§')).reduce((a, b) => (b.length > a.length ? b : a), '')}
        </div>

        {shown ? (
          // Cap the height so a long clip (a non-tutorial bundle, or a long
          // tutorial verse) scrolls inside the card instead of stretching it.
          <div className="grid-scroll max-h-[45vh] overflow-y-auto">
            <div
              className={`text-center font-serif text-ink-900 sloka-text-${language}`}
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
            >
              {lines.map((line, i) => {
                // A "§N" marker line renders as a small sloka-number chip, not
                // as verse text. It separates stacked verses in a range/bundle.
                if (line.startsWith('§')) {
                  return (
                    <div
                      key={i}
                      className="text-xs font-semibold tracking-wide mt-4 first:mt-0 mb-1 select-none"
                      style={{ color: theme.text }}
                    >
                      {line.slice(1)}
                    </div>
                  )
                }
                return (
                  <div key={i} style={{ whiteSpace: 'nowrap' }}>{line || '\u00A0'}</div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-ink-400 py-6">
            Text coming soon for this verse.
          </p>
        )}
      </div>
    </div>
  )
}

export default SlokaDisplay
