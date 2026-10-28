// Single source of truth for per-section names + colors, keyed to the manifest
// section keys (which mirror the audio folder structure).
// Each text color passes AA on white (>= 4.5:1).
// Order here drives the footer legend; it matches the recitation sequence.
export const SECTION_THEME = {
  purvapithika:  { name: 'Pūrvapīṭhikā',  text: '#b45309', dot: '#ea8a1e', soft: '#fdecd7' }, // amber
  dhyanam:       { name: 'Dhyānam',       text: '#15803d', dot: '#2f9e52', soft: '#dcf3e4' }, // green
  namalu:        { name: 'Namavali',      text: '#9a3412', dot: '#d2691e', soft: '#fbe4d5' }, // saffron
  uttarapithika: { name: 'Uttarapīṭhikā', text: '#6d28d9', dot: '#8b5cf6', soft: '#ece3fb' }, // violet
}

const FALLBACK = { name: '', text: '#3a3833', dot: '#9a958e', soft: '#f1efeb' }

export const getSectionTheme = (section) => SECTION_THEME[section] || FALLBACK
export const getSectionName = (section) => (SECTION_THEME[section] || FALLBACK).name
