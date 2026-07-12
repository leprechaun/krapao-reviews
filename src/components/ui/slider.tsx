import { Slider as BaseSlider } from '@base-ui-components/react/slider'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number | null
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

export function Slider({ value, onChange, min = 0, max = 10, step = 0.5, disabled, className }: SliderProps) {
  return (
    <BaseSlider.Root
      value={value ?? 0}
      onValueChange={onChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn('relative flex w-full flex-col gap-2 select-none touch-none', className)}
    >
      <BaseSlider.Control className="flex items-center">
        <BaseSlider.Track className="relative h-2 w-full grow rounded-full bg-stone-200">
          <BaseSlider.Indicator className="absolute h-full rounded-full bg-brand-500" />
          <BaseSlider.Thumb className="block h-5 w-5 rounded-full bg-white border-2 border-brand-500 shadow focus-visible:outline-2 focus-visible:outline-brand-500" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}
