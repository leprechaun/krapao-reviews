import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'brand'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-stone-100 text-stone-700',
        variant === 'outline' && 'border border-stone-300 text-stone-700',
        variant === 'brand' && 'bg-brand-100 text-brand-700',
        className,
      )}
    >
      {children}
    </span>
  )
}
