'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, FileText, Link as LinkIcon, RotateCcw, Clock, Trash2, Eye, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fetchWithKey } from '@/lib/fetch'
import type { JdHistoryEntry } from '@/hooks/useJdHistory'

interface JobDescriptionProcessorProps {
  readonly onJobDataExtracted: (data: any) => void
  readonly initialData?: any
  readonly onClear?: () => void
  readonly history?: JdHistoryEntry[]
  readonly onSelectHistory?: (jobData: any) => void
  readonly onRemoveHistory?: (id: string) => void
}

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

function JdHistoryCard({
  entry,
  onSelect,
  onRemove,
}: {
  entry: JdHistoryEntry
  onSelect: () => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {entry.jobTitle}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {entry.company} &middot; {timeAgo(entry.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-7 px-2"
            title={expanded ? 'Collapse' : 'View details'}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 px-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={onSelect}
            className="h-7 px-3 text-xs"
          >
            Select
          </Button>
        </div>
      </div>
      {expanded && entry.jobData && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          {entry.jobData.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.jobData.skills.slice(0, 8).map((skill: string, i: number) => (
                <Badge key={`h-skill-${i}`} variant="secondary" className="text-xs">{skill}</Badge>
              ))}
              {entry.jobData.skills.length > 8 && (
                <Badge variant="outline" className="text-xs">+{entry.jobData.skills.length - 8}</Badge>
              )}
            </div>
          )}
          {entry.jobData.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.jobData.keywords.slice(0, 6).map((kw: string, i: number) => (
                <Badge key={`h-kw-${i}`} variant="outline" className="text-xs">{kw}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function JobDescriptionProcessor({
  onJobDataExtracted,
  initialData,
  onClear,
  history,
  onSelectHistory,
  onRemoveHistory,
}: Readonly<JobDescriptionProcessorProps>) {
  const router = useRouter()
  const [jobDescription, setJobDescription] = useState(initialData?.jobDescription || '')
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(initialData ?? null)
  const [inputMethod, setInputMethod] = useState<'text' | 'url' | 'file'>('text')

  // Sync if initialData arrives after mount (async localStorage hydration)
  useEffect(() => {
    if (initialData && !extractedData) {
      setExtractedData(initialData)
      if (initialData.jobDescription) {
        setJobDescription(initialData.jobDescription)
      }
    }
  }, [initialData]) // eslint-disable-line react-hooks/exhaustive-deps

  const processJobDescription = async () => {
    if (inputMethod === 'text' && !jobDescription.trim()) return
    if (inputMethod === 'url' && !jobDescriptionUrl.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetchWithKey('/api/process-job-description', {
        method: 'POST',
        body: JSON.stringify({
          jobDescription: inputMethod === 'text' ? jobDescription : '',
          jobDescriptionUrl: inputMethod === 'url' ? jobDescriptionUrl : ''
        })
      })

      const data = await response.json()
      if (data.jobDescription) {
        setJobDescription(data.jobDescription)
      }
      setExtractedData(data)
      onJobDataExtracted(data)
    } catch (error) {
      console.error('Error processing job description:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setJobDescription(text)
    setInputMethod('text')
  }

  const handleReset = () => {
    setExtractedData(null)
    setJobDescription('')
    setJobDescriptionUrl('')
    onClear?.()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap mb-4 gap-2">
          <Button
            variant={inputMethod === 'text' ? "secondary" : "outline"}
            onClick={() => setInputMethod('text')}
            className="text-sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Text Input
          </Button>
          <Button
            variant={inputMethod === 'url' ? "secondary" : "outline"}
            onClick={() => setInputMethod('url')}
            className="text-sm"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            URL Input
          </Button>
        </div>

        {inputMethod === 'text' ? (
          <div>
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <Textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="w-full"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">Job Description URL</label>
            <Input
              type="url"
              placeholder="Enter the URL of the job posting..."
              value={jobDescriptionUrl}
              onChange={(e) => setJobDescriptionUrl(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button
            onClick={processJobDescription}
            disabled={isProcessing || (inputMethod === 'text' ? !jobDescription.trim() : !jobDescriptionUrl.trim())}
            className="flex-1 sm:flex-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Processing...</span>
                <span className="sm:hidden">Processing...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Analyze Job Description</span>
                <span className="sm:hidden">Analyze</span>
              </>
            )}
          </Button>

          {inputMethod === 'text' && (
            <div className="flex items-center">
              <input
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="job-file-upload"
              />
              <label htmlFor="job-file-upload" className="w-full sm:w-auto">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">Upload</span>
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Recent Analyses - show below input when no extracted data is displayed */}
      {history && history.length > 0 && !extractedData && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Analyses
          </h3>
          <div className="grid gap-2">
            {history.map((entry) => (
              <JdHistoryCard
                key={entry.id}
                entry={entry}
                onSelect={() => {
                  setExtractedData(entry.jobData)
                  if (entry.jobData.jobDescription) {
                    setJobDescription(entry.jobData.jobDescription)
                  }
                  onSelectHistory?.(entry.jobData)
                }}
                onRemove={() => onRemoveHistory?.(entry.id)}
              />
            ))}
          </div>
        </div>
      )}

      {extractedData && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Information</CardTitle>
              <CardDescription>Key requirements and skills identified from the job description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {extractedData.jobTitle && (
                <div>
                  <h4 className="font-semibold mb-2">Job Title</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{extractedData.jobTitle}</p>
                </div>
              )}

              {extractedData.company && (
                <div>
                  <h4 className="font-semibold mb-2">Company</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{extractedData.company}</p>
                </div>
              )}

              {extractedData.skills && extractedData.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-base xs:text-lg">Required Skills</h4>
                  <div className="flex flex-wrap gap-1 xs:gap-2">
                    {extractedData.skills.map((skill: string, index: number) => (
                      <Badge
                        key={`skill-${skill}-${index}`}
                        variant="secondary"
                        className="text-xs xs:text-sm py-1 mb-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.qualifications && extractedData.qualifications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-base xs:text-lg">Key Qualifications</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs xs:text-sm text-zinc-600 dark:text-zinc-400 ml-0 xs:ml-2">
                    {extractedData.qualifications.map((qual: string, index: number) => (
                      <li key={`qual-${index}-${qual.substring(0, 15)}`} className="mb-1">{qual}</li>
                    ))}
                  </ul>
                </div>
              )}

              {extractedData.keywords && extractedData.keywords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-base xs:text-lg">Important Keywords</h4>
                  <div className="flex flex-wrap gap-1 xs:gap-2">
                    {extractedData.keywords.map((keyword: string, index: number) => (
                      <Badge
                        key={`keyword-${keyword}-${index}`}
                        variant="outline"
                        className="text-xs xs:text-sm py-1 mb-1"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.experience && (
                <div>
                  <h4 className="font-semibold mb-2">Experience Required</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{extractedData.experience}</p>
                </div>
              )}

              {extractedData.location && (
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{extractedData.location}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4 gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto text-sm xs:text-base"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">New Analysis</span>
              <span className="xs:hidden">Reset</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/resume')}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 w-full sm:w-auto text-sm xs:text-base"
            >
              <span className="hidden xs:inline">Optimize My Resume Based on This Analysis</span>
              <span className="xs:hidden">Optimize Resume</span>
              <span className="ml-1">&rarr;</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
