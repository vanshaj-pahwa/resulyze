'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2, Copy, Download, Mail, AlertCircle } from 'lucide-react'

interface CoverLetterGeneratorProps {
  readonly jobData: any
  readonly resumeData: any
}

export default function CoverLetterGenerator({ jobData, resumeData }: Readonly<CoverLetterGeneratorProps>) {
  const [coverLetter, setCoverLetter] = useState('')
  const [referralMessage, setReferralMessage] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const getMissingRequirements = () => {
    const missing = []
    if (!jobData) missing.push('Job Description')
    if (!resumeData) missing.push('Resume')
    return missing
  }

  const getTooltipMessage = () => {
    const missing = getMissingRequirements()
    if (missing.length === 0) return ''
    return `Please complete: ${missing.join(' and ')}`
  }

  const generateCoverLetter = async () => {
    if (!jobData || !resumeData) {
      alert('Please complete job analysis and resume first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobData, resumeData })
      })

      const data = await response.json()
      setCoverLetter(data.coverLetter)
    } catch (error) {
      console.error('Error generating cover letter:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateReferralMessage = async () => {
    if (!jobData || !resumeData) {
      alert('Please complete job analysis and resume first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-referral-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobData,
          resumeData,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim()
        })
      })

      const data = await response.json()
      setReferralMessage(data.referralMessage)
    } catch (error) {
      console.error('Error generating referral message:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const downloadAsDoc = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const sendEmail = () => {
    if (!contactEmail || !referralMessage) {
      alert('Please provide contact email and generate referral message first')
      return
    }

    const subject = `Referral Request - ${jobData?.jobTitle || 'Job Opportunity'} at ${jobData?.company || 'Company'}`
    const body = encodeURIComponent(referralMessage)
    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${body}`

    window.open(mailtoLink, '_blank')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cover-letter" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
          <TabsTrigger value="referral">Referral Message</TabsTrigger>
        </TabsList>

        <TabsContent value="cover-letter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Cover Letter</CardTitle>
              <CardDescription>
                Personalized cover letter based on your resume and the job description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!jobData || !resumeData) && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    {getTooltipMessage()} to generate your cover letter
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button onClick={generateCoverLetter} disabled={isGenerating || !jobData || !resumeData}>
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate Cover Letter'
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {(!jobData || !resumeData) && (
                      <TooltipContent>
                        <p>{getTooltipMessage()}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                {coverLetter && (
                  <>
                    <Button variant="outline" onClick={() => copyToClipboard(coverLetter)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" onClick={() => downloadAsDoc(coverLetter, 'cover-letter')}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>

              {coverLetter && (
                <div className="space-y-4">
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={15}
                    className="w-full"
                    placeholder="Your cover letter will appear here..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Message</CardTitle>
              <CardDescription>
                Professional message to send to your network for referrals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Name</label>
                  <Input
                    placeholder="e.g., John Smith"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email (Optional)</label>
                  <Input
                    type="email"
                    placeholder="e.g., john.smith@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              {(!jobData || !resumeData) && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    {getTooltipMessage()} to generate your referral message
                  </span>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button onClick={generateReferralMessage} disabled={isGenerating || !jobData || !resumeData}>
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate Referral Message'
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {(!jobData || !resumeData) && (
                      <TooltipContent>
                        <p>{getTooltipMessage()}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                {referralMessage && (
                  <>
                    <Button variant="outline" onClick={() => copyToClipboard(referralMessage)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" onClick={() => downloadAsDoc(referralMessage, 'referral-message')}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    {contactEmail && (
                      <Button variant="outline" onClick={sendEmail} className="bg-blue-50 hover:bg-blue-100">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    )}
                  </>
                )}
              </div>

              {referralMessage && (
                <div className="space-y-4">
                  <Textarea
                    value={referralMessage}
                    onChange={(e) => setReferralMessage(e.target.value)}
                    rows={8}
                    className="w-full"
                    placeholder="Your referral message will appear here..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}