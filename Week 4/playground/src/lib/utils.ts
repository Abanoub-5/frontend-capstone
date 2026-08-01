import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes without conflicts (shadcn/ui helper).
 * `twMerge` resolves competing utilities so the last one wins instead of
 * emitting contradictory classes (e.g. `p-2 p-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
