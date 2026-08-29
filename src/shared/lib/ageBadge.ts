export function ageBadge(tags: string[]) {
  const matched = tags.find((tag) => /\d+\s*-\s*\d+\s*세/.test(tag) || tag.endsWith('세'))
  return matched ?? '3-6세'
}
