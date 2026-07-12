import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { DimensionKey, KrapaoScore, ReviewScores } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DIMENSIONS: DimensionKey[] = ['aromatic', 'wok', 'heat', 'purity', 'protein', 'egg']

export function calcOverall(scores: ReviewScores): number | null {
  const vals = DIMENSIONS.map(d => scores[d]).filter((v): v is number => v !== undefined)
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function heatMatchToScore(match: 1 | 2 | 3 | 4 | 5): number {
  if (match === 3) return 10
  if (match === 2 || match === 4) return 7
  return 3
}

export function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-600'
  if (score >= 6) return 'text-amber-500'
  return 'text-rose-500'
}

export function scoreBg(score: number): string {
  if (score >= 8) return 'bg-emerald-50 border-emerald-200'
  if (score >= 6) return 'bg-amber-50 border-amber-200'
  return 'bg-rose-50 border-rose-200'
}

export function formatScore(score: number): string {
  return score % 1 === 0 ? score.toFixed(0) : score.toFixed(1)
}

export function aggregateScores(scores: KrapaoScore): KrapaoScore {
  return scores
}
