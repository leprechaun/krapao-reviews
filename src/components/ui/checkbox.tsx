import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
  children?: ReactNode
}

export function Checkbox({ checked, onCheckedChange, id, className, children }: CheckboxProps) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer select-none', className)}>
      <BaseCheckbox.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="size-4 rounded border border-stone-300 bg-white data-[checked]:bg-brand-500 data-[checked]:border-brand-500 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        <BaseCheckbox.Indicator className="text-white text-xs font-bold leading-none">✓</BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {children}
    </label>
  )
}
