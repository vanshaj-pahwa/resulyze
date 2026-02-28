'use client'

import { useState } from 'react'
import { useApiKey } from '@/hooks/useApiKey'
import { ApiKeyDialog } from './api-key-dialog'
import { Key } from 'lucide-react'
import { Button } from './button'

export function ApiKeyIndicator() {
  const { isKeySet, mounted } = useApiKey()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-400">
        <div className="w-2 h-2 rounded-full bg-zinc-300" />
        <Key className="w-3.5 h-3.5" />
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => setDialogOpen(true)}
      >
        <div className={`w-2 h-2 rounded-full ${isKeySet ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
        <Key className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
        <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">
          {isKeySet ? 'Connected' : 'No Key'}
        </span>
      </Button>

      <ApiKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
