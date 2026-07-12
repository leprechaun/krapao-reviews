import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-stone-900 text-white hover:bg-stone-700 focus-visible:outline-stone-900',
        secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200 focus-visible:outline-stone-500',
        outline: 'border border-stone-300 bg-white text-stone-900 hover:bg-stone-50 focus-visible:outline-stone-500',
        ghost: 'text-stone-700 hover:bg-stone-100 focus-visible:outline-stone-500',
        brand: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-500',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
