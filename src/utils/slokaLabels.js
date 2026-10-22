// The bottom grid (SlokaGrid) is the source of truth for how each entry is named:
// it shows `sloka.number` and titles the card `Sloka ${sloka.number}`.
// The range dropdowns use the same helper so they list the same entries, in the
// same order, with the same labels. Sloka numbers restart per section, so the
// dropdowns group options by section; option values are array positions (1-based).

const SECTION_TITLES = {
  intro: 'Introduction',
  section_1: 'Section 1',
  section_2: 'Section 2',
  section_3: 'Section 3',
  outro: 'Conclusion'
}

export const getSlokaLabel = (sloka) => `Sloka ${sloka?.number}`

export const getSectionTitle = (section) =>
  SECTION_TITLES[section] || String(section || '')

// [{ section, title, items: [{ position, label }] }] in array order
export const groupSlokasBySection = (slokas) => {
  const groups = []
  slokas.forEach((sloka, index) => {
    const item = { position: index + 1, label: getSlokaLabel(sloka) }
    const last = groups[groups.length - 1]
    if (last && last.section === sloka.section) {
      last.items.push(item)
    } else {
      groups.push({ section: sloka.section, title: getSectionTitle(sloka.section), items: [item] })
    }
  })
  return groups
}
