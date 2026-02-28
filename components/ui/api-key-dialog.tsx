'use client'

import { useState } from 'react'
import { useApiKey } from '@/hooks/useApiKey'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dismissible?: boolean
}

export function ApiKeyDialog({ open, onOpenChange, dismissible = true }: ApiKeyDialogProps) {
  const { setKey, validateKey } = useApiKey()
  const [inputKey, setInputKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleValidate = async () => {
    if (!inputKey.trim()) return

    setStatus('validating')
    setErrorMsg('')

    const result = await validateKey(inputKey.trim())

    if (result.valid) {
      setStatus('success')
      setKey(inputKey.trim())
      setTimeout(() => {
        onOpenChange(false)
        setStatus('idle')
        setInputKey('')
      }, 1000)
    } else {
      setStatus('error')
      setErrorMsg(result.error || 'Invalid API key')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={dismissible ? onOpenChange : undefined}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-lg animate-fade-in"
          onInteractOutside={(e) => { if (!dismissible) e.preventDefault() }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Key className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <Dialog.Title className="text-lg font-heading font-semibold text-zinc-900 dark:text-zinc-100">
                Connect Your API Key
              </Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-500 dark:text-zinc-400">
                Resulyze uses your Gemini API key to power AI features
              </Dialog.Description>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter your Gemini API key"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value)
                  setStatus('idle')
                  setErrorMsg('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {status === 'error' && (
              <div className="max-h-32 overflow-y-auto rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-words overflow-wrap-anywhere">{errorMsg}</span>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>API key validated successfully</span>
              </div>
            )}

            <Button
              onClick={handleValidate}
              disabled={!inputKey.trim() || status === 'validating'}
              className="w-full"
            >
              {status === 'validating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate & Save'
              )}
            </Button>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Get a free API key from Google AI Studio
              </a>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Your key is stored only in your browser and sent directly to Google&apos;s API. We never store it on our servers.
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
