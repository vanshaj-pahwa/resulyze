'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react'

interface InterviewPrepProps {
  readonly jobData: any
  readonly resumeData: any
}

interface InterviewQuestion {
  category: string
  question: string
  tips: string[]
  answer?: string
  isGeneratingAnswer?: boolean
  showAnswer?: boolean
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
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobData, resumeData }),
        // include credentials to send cookies with the request
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please make sure you are logged in.');
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json()
      // Initialize questions with additional properties for answer management
      const questionsWithAnswerProps = data.questions.map((q: InterviewQuestion) => ({
        ...q,
        answer: '',
        isGeneratingAnswer: false,
        showAnswer: false
      }))
      setQuestions(questionsWithAnswerProps)
    } catch (error) {
      console.error('Error generating interview questions:', error)
      alert(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const generateAnswer = async (questionIndex: number) => {
    const question = questions[questionIndex];
    
    // Update state to show loading indicator
    setQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        isGeneratingAnswer: true
      };
      return updated;
    });
    
    try {
      // Make sure we're using the same fetch configuration as generateQuestions
      const response = await fetch('/api/generate-interview-answer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: question.question,
          category: question.category,
          tips: question.tips,
          resumeData,
          jobData
        }),
        // Make sure credentials are included to send auth cookies
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please make sure you are logged in.');
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the question with the generated answer
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = {
          ...updated[questionIndex],
          answer: data.answer,
          isGeneratingAnswer: false,
          showAnswer: true
        };
        return updated;
      });
      
    } catch (error) {
      console.error('Error generating answer:', error);
      alert(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset loading state on error
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = {
          ...updated[questionIndex],
          isGeneratingAnswer: false
        };
        return updated;
      });
    }
  }
  
  const toggleShowAnswer = (questionIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        showAnswer: !updated[questionIndex].showAnswer
      };
      return updated;
    });
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Interview Questions</h3>
          <p className="text-sm text-gray-600">AI-generated questions tailored to your profile and the job</p>
          <p className="text-xs text-blue-600 mt-1">Click "Generate Answer" on any question to get AI-powered response suggestions</p>
        </div>
        <Button onClick={generateQuestions} disabled={isGenerating || !jobData || !resumeData} className="w-full md:w-auto">
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
            <Card key={`question-${index}-${item.question?.substring(0, 15)}`} className="border-2 hover:border-gray-300 transition-all">
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
                  
                  {/* Answer section */}
                  {item.answer && item.showAnswer && (
                    <div className="mt-6 border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-green-700">AI-Generated Answer:</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleShowAnswer(index)}
                          className="h-8 px-2"
                        >
                          <ChevronUp className="h-4 w-4" />
                          <span className="ml-1">Hide</span>
                        </Button>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md text-sm text-gray-800">
                        {item.answer.split('\n').map((paragraph, pIndex) => (
                          <p key={pIndex} className={pIndex > 0 ? 'mt-2' : ''}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                {item.answer && !item.showAnswer ? (
                  <Button 
                    variant="outline" 
                    onClick={() => toggleShowAnswer(index)}
                    className="text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Answer
                  </Button>
                ) : !item.answer && (
                  <Button 
                    onClick={() => generateAnswer(index)}
                    disabled={item.isGeneratingAnswer}
                    variant="outline"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50"
                  >
                    {item.isGeneratingAnswer ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Generate Answer
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
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