// Feature flags.
// Language/script text is hidden until scripts are ready (planned for v2).
// Flip to true to show the language selector and the sloka text card again.
export const SHOW_LANGUAGES = true

// -------------------------------------------------------------------
// Release gating.
// Only slokas allowed by isSlokaEnabled() are shown/selectable anywhere
// (the "All verses" grid, the range dropdowns, and the player).
// For launch we expose ONLY the first 10 slokas of section_3 (number 1-10).
//
// To release more later:
//   - add/raise the limit for a section below, or
//   - set LIMIT_RELEASE = false to enable every sloka in the data.
// -------------------------------------------------------------------
export const LIMIT_RELEASE = true

// section -> max `number` that is enabled (inclusive). Sections not listed
// here are fully hidden while LIMIT_RELEASE is true.
const ENABLED_UP_TO = {
  section_3: 10,
}

export const isSlokaEnabled = (sloka) => {
  if (!LIMIT_RELEASE) return true
  if (!sloka) return false
  const max = ENABLED_UP_TO[sloka.section]
  if (max == null) return false
  const num = Number(sloka.number)
  return Number.isFinite(num) && num >= 1 && num <= max
}
