import type { Printable } from '@/types/printable'

export function printableLineArtUrl(printable: Printable) {
  return printable.image_bw_url || printable.line_art_url || printable.image_color_url || printable.color_image_url || ''
}

export function printableColorUrl(printable: Printable) {
  return printable.image_color_url || printable.color_image_url || printable.image_bw_url || printable.line_art_url || ''
}

export function difficultyLabel(difficulty?: Printable['difficulty']) {
  if (difficulty === 'easy') return '초급'
  if (difficulty === 'hard') return '고급'
  if (difficulty === 'normal') return '중급'
  return ''
}
