'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw } from 'lucide-react'

interface InterviewPrepProps {
  readonly jobData: any
  readonly resumeData: any
}

interface InterviewQuestion {
  category: string
  question: string
  tips: string[]
}

export default function InterviewPrep({ jobData, resumeData }: Readonly<InterviewPrepProps>) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQuestions = async () => {
    if (!jobData || !resumeData) {
      alert('Please complete job analysis and resume first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobData, resumeData })
      })

      const data = await response.json()
      setQuestions(data.questions)
    } catch (error) {
      console.error('Error generating interview questions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technical': 'bg-blue-100 text-blue-800',
      'Behavioral': 'bg-green-100 text-green-800',
      'Experience': 'bg-purple-100 text-purple-800',
      'Company': 'bg-orange-100 text-orange-800',
      'Problem Solving': 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Interview Questions</h3>
          <p className="text-sm text-gray-600">AI-generated questions tailored to your profile and the job</p>
        </div>
        <Button onClick={generateQuestions} disabled={isGenerating || !jobData || !resumeData}>
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Questions
            </>
          )}
        </Button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((item, index) => (
            <Card key={`question-${index}-${item.question?.substring(0, 15)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Tips for answering:</h4>
                  <ul className="space-y-1">
                    {item.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-gray-600 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {questions.length === 0 && !isGenerating && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Generate interview questions to start preparing</p>
              <p className="text-sm mt-2">Questions will be tailored based on your resume and the job requirements</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}