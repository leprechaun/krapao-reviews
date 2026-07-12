import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-stone-400',
        'focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
