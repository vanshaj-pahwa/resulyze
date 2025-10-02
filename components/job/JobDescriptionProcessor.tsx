'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, FileText, Link as LinkIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface JobDescriptionProcessorProps {
  readonly onJobDataExtracted: (data: any) => void
}

export default function JobDescriptionProcessor({ onJobDataExtracted }: Readonly<JobDescriptionProcessorProps>) {
  const [jobDescription, setJobDescription] = useState('')
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [inputMethod, setInputMethod] = useState<'text' | 'url' | 'file'>('text')

  const processJobDescription = async () => {
    if (inputMethod === 'text' && !jobDescription.trim()) return
    if (inputMethod === 'url' && !jobDescriptionUrl.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/process-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
                  <ul className="list-disc list-inside space-y-1 text-xs xs:text-sm text-gray-600 ml-0 xs:ml-2">
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
                  <p className="text-sm text-gray-600">{extractedData.experience}</p>
                </div>
              )}

              {extractedData.location && (
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-sm text-gray-600">{extractedData.location}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-center sm:justify-end mt-4">
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('move-to-resume-optimization'))}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm xs:text-base"
            >
              <span className="hidden xs:inline">Optimize My Resume Based on This Analysis</span>
              <span className="xs:hidden">Optimize Resume</span>
              <span className="ml-1">→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}