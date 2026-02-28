'use client'

import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-1">{title}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
