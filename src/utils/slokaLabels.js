import { getSectionName } from './sectionTheme'

// A selectable item (from utils/manifest.js) already carries `label` ("3" or
// "8–19") and `section`. These helpers format it for display consistently.

export const getItemLabel = (item) => {
  if (!item) return ''
  return item.start === item.end ? `Sloka ${item.start}` : `Slokas ${item.start}–${item.end}`
}

export const getSectionTitle = (sectionKey) => getSectionName(sectionKey)

// Group a flat item list (for one mode) by section, preserving order, so the
// range dropdowns and grid can show section headers. Option values are the
// item's index in the flat list.
export const groupItemsBySection = (items) => {
  const groups = []
  items.forEach((item, index) => {
    const last = groups[groups.length - 1]
    const row = { index, item }
    if (last && last.section === item.section) {
      last.items.push(row)
    } else {
      groups.push({
        section: item.section,
        title: getSectionTitle(item.section),
        items: [row],
      })
    }
  })
  return groups
}
