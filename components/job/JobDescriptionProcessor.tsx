'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, FileText } from 'lucide-react'

interface JobDescriptionProcessorProps {
  onJobDataExtracted: (data: any) => void
}

export default function JobDescriptionProcessor({ onJobDataExtracted }: JobDescriptionProcessorProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  const processJobDescription = async () => {
    if (!jobDescription.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/process-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      })

      const data = await response.json()
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
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button 
            onClick={processJobDescription} 
            disabled={isProcessing || !jobDescription.trim()}
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
        </div>
      </div>

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
                  <p className="text-sm text-gray-600">{extractedData.jobTitle}</p>
                </div>
              )}

              {extractedData.company && (
                <div>
                  <h4 className="font-semibold mb-2">Company</h4>
                  <p className="text-sm text-gray-600">{extractedData.company}</p>
                </div>
              )}

              {extractedData.skills && extractedData.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.qualifications && extractedData.qualifications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Key Qualifications</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {extractedData.qualifications.map((qual: string, index: number) => (
                      <li key={index}>{qual}</li>
                    ))}
                  </ul>
                </div>
              )}

              {extractedData.keywords && extractedData.keywords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Important Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}