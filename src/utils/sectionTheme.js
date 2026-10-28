// Single source of truth for per-section names + colors.
// Used by the sloka display eyebrow/accent, the range dropdown markers,
// and the footer legend so color-coding stays consistent everywhere.
//
// Each color is chosen to pass AA as text on white (>= 4.5:1).
export const SECTION_THEME = {
  intro:     { name: 'Introduction',  text: '#8a6d1b', dot: '#c9a227', soft: '#fbf3d6' },
  section_1: { name: 'Pūrvapīṭhikā',   text: '#b45309', dot: '#ea8a1e', soft: '#fdecd7' }, // amber
  section_2: { name: 'Dhyānam',        text: '#15803d', dot: '#2f9e52', soft: '#dcf3e4' }, // green
  section_3: { name: 'Sahasranāmam',   text: '#9a3412', dot: '#d2691e', soft: '#fbe4d5' }, // saffron
  section_4: { name: 'Uttarapīṭhikā',  text: '#6d28d9', dot: '#8b5cf6', soft: '#ece3fb' }, // violet
  outro:     { name: 'Conclusion',     text: '#475569', dot: '#64748b', soft: '#e8edf3' }, // slate
}

const FALLBACK = { name: '', text: '#3a3833', dot: '#9a958e', soft: '#f1efeb' }

export const getSectionTheme = (section) => SECTION_THEME[section] || FALLBACK
export const getSectionName = (section) => (SECTION_THEME[section] || FALLBACK).name
