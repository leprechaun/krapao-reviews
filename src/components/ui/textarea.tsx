import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-stone-400 resize-none',
        'focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-0',
        'disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
