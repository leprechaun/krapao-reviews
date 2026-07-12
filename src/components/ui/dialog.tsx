import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export const Dialog = BaseDialog.Root
export const DialogTrigger = BaseDialog.Trigger
export const DialogClose = BaseDialog.Close

interface DialogContentProps {
  children: ReactNode
  className?: string
  title: string
  description?: string
}

export function DialogContent({ children, className, title, description }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 bg-black/40 z-[999] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 w-full max-w-lg',
          'bg-white rounded-xl shadow-xl p-6',
          'flex flex-col overflow-hidden',
          'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
          'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          'transition-all duration-200',
          className,
        )}
      >
        <BaseDialog.Title className="text-lg font-semibold text-stone-900 mb-1 shrink-0">
          {title}
        </BaseDialog.Title>
        {description && (
          <BaseDialog.Description className="text-sm text-stone-500 mb-3 shrink-0">
            {description}
          </BaseDialog.Description>
        )}
        <div className="flex flex-col flex-1 min-h-0">
          {children}
        </div>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}
