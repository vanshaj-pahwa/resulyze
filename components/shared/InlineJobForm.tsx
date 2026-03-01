'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Briefcase, ChevronDown, ChevronUp } from 'lucide-react'

interface InlineJobFormProps {
  readonly onSubmit: (data: { company: string; jobTitle: string; jobDescription?: string }) => void
}

export default function InlineJobForm({ onSubmit }: Readonly<InlineJobFormProps>) {
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [showDescription, setShowDescription] = useState(false)

  const handleSubmit = () => {
    if (!company.trim() || !jobTitle.trim()) return
    onSubmit({
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim() || undefined,
    })
  }

  return (
    <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Briefcase className="w-4 h-4 text-zinc-500" />
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Quick Job Details</p>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Provide basic job info to get started. For a full analysis, use the Job Analysis tab.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <Input
            placeholder="e.g., Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Job Title *</label>
          <Input
            placeholder="e.g., Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShowDescription(!showDescription)}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        {showDescription ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showDescription ? 'Hide' : 'Add'} job description (optional)
      </button>
      {showDescription && (
        <Textarea
          placeholder="Paste the job description here (optional)..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
        />
      )}
      <Button
        onClick={handleSubmit}
        disabled={!company.trim() || !jobTitle.trim()}
        className="w-full sm:w-auto"
      >
        Continue
      </Button>
    </div>
  )
}
