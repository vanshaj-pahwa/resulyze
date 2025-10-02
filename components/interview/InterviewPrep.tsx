'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, RefreshCw, MessageSquare, ChevronUp, ChevronDown, Building, Users, Briefcase, ArrowRight } from 'lucide-react'

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

interface InterviewRound {
  roundName: string
  description: string
  focus: string
  tips: string[]
  questions?: InterviewQuestion[]
}

interface CompanyResearch {
  companyOverview: string
  interviewProcess: InterviewRound[]
}

export default function InterviewPrep({ jobData, resumeData }: Readonly<InterviewPrepProps>) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  const [companyResearch, setCompanyResearch] = useState<CompanyResearch | null>(null)
  const [isResearchLoading, setIsResearchLoading] = useState(false)
  const [roundSpecificQuestions, setRoundSpecificQuestions] = useState<{[key: string]: InterviewQuestion[]}>({})
  const [currentRound, setCurrentRound] = useState<string | null>(null)
  const [isGeneratingRoundQuestions, setIsGeneratingRoundQuestions] = useState(false)
  
  // Automatically fetch company research when component loads
  useEffect(() => {
    if (jobData?.company) {
      getCompanyResearch();
    }
  }, [jobData?.company]);

  const getCompanyResearch = async () => {
    if (!jobData?.company) {
      alert('Please complete job analysis with company information first')
      return
    }
    
    setIsResearchLoading(true)
    try {
      const response = await fetch('/api/research-company', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyName: jobData.company,
          jobTitle: jobData.jobTitle || ''
        }),
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please make sure you are logged in.');
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json()
      setCompanyResearch(data)
    } catch (error) {
      console.error('Error getting company research:', error)
      alert(`Failed to research company: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsResearchLoading(false)
    }
  }
  
  const generateQuestionsForRound = async (roundName: string) => {
    if (!jobData || !resumeData) {
      alert('Please complete job analysis and resume first');
      return;
    }

    setCurrentRound(roundName);
    setIsGeneratingRoundQuestions(true);
    
    try {
      const response = await fetch('/api/generate-interview-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          jobData, 
          resumeData,
          interviewRound: roundName // Pass the round name to the API
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please make sure you are logged in.');
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Initialize questions with additional properties for answer management
      const questionsWithAnswerProps = data.questions.map((q: InterviewQuestion) => ({
        ...q,
        answer: '',
        isGeneratingAnswer: false,
        showAnswer: false
      }));
      
      // Update the round-specific questions
      setRoundSpecificQuestions(prev => ({
        ...prev,
        [roundName]: questionsWithAnswerProps
      }));
      
      // Switch to the rounds tab to show the questions
      setActiveTab('rounds');
      
    } catch (error) {
      console.error(`Error generating questions for ${roundName}:`, error);
      alert(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingRoundQuestions(false);
    }
  };

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
  
  // First implementation removed as we now have the complete version below
  
  const toggleShowAnswer = (questionIndex: number, roundName?: string) => {
    if (roundName) {
      // For round-specific questions
      setRoundSpecificQuestions(prev => {
        const updated = {...prev};
        if (updated[roundName] && updated[roundName][questionIndex]) {
          updated[roundName] = [...updated[roundName]];
          updated[roundName][questionIndex] = {
            ...updated[roundName][questionIndex],
            showAnswer: !updated[roundName][questionIndex].showAnswer
          };
        }
        return updated;
      });
    } else {
      // For general questions
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = {
          ...updated[questionIndex],
          showAnswer: !updated[questionIndex].showAnswer
        };
        return updated;
      });
    }
  }
  
  const generateAnswer = async (questionIndex: number, roundName?: string) => {
    let question: InterviewQuestion;
    
    if (roundName) {
      // For round-specific questions
      question = roundSpecificQuestions[roundName][questionIndex];
      
      // Update state to show loading indicator
      setRoundSpecificQuestions(prev => {
        const updated = {...prev};
        if (updated[roundName]) {
          updated[roundName] = [...updated[roundName]];
          updated[roundName][questionIndex] = {
            ...updated[roundName][questionIndex],
            isGeneratingAnswer: true
          };
        }
        return updated;
      });
    } else {
      // For general questions
      question = questions[questionIndex];
      
      // Update state to show loading indicator
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = {
          ...updated[questionIndex],
          isGeneratingAnswer: true
        };
        return updated;
      });
    }
    
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
          jobData,
          roundName // Pass the round name if available
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
      
      if (roundName) {
        // Update the round-specific question with the generated answer
        setRoundSpecificQuestions(prev => {
          const updated = {...prev};
          if (updated[roundName]) {
            updated[roundName] = [...updated[roundName]];
            updated[roundName][questionIndex] = {
              ...updated[roundName][questionIndex],
              answer: data.answer,
              isGeneratingAnswer: false,
              showAnswer: true
            };
          }
          return updated;
        });
      } else {
        // Update the general question with the generated answer
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
      }
      
    } catch (error) {
      console.error('Error generating answer:', error);
      alert(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset loading state on error
      if (roundName) {
        setRoundSpecificQuestions(prev => {
          const updated = {...prev};
          if (updated[roundName]) {
            updated[roundName] = [...updated[roundName]];
            updated[roundName][questionIndex] = {
              ...updated[roundName][questionIndex],
              isGeneratingAnswer: false
            };
          }
          return updated;
        });
      } else {
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
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technical': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200',
      'Behavioral': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200',
      'Experience': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200',
      'Company': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200',
      'Problem Solving': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200'
    }
    return colors[category] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">Interview Preparation</h3>
          <p className="text-sm text-gray-600 mt-1">Research, questions, and answers tailored to your profile and the job</p>
          <div className="flex items-center mt-2 bg-blue-50 p-2 rounded-md border border-blue-100">
            <Building className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              {isResearchLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Researching {jobData?.company || 'company'} interview process...
                </span>
              ) : companyResearch ? (
                <span>Explore the interview process at {jobData?.company || 'the company'} and prepare for each stage</span>
              ) : (
                <span>Analyzing interview process at {jobData?.company || 'the company'}...</span>
              )}
            </p>
          </div>
        </div>
        <div>
          <Button 
            onClick={generateQuestions} 
            disabled={isGenerating || !jobData || !resumeData} 
            className={`w-full md:w-auto ${isGenerating ? 'bg-blue-50 text-blue-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'} shadow-md transition-all duration-200`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate General Questions
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Tabs for different interview preparation sections */}
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="general">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">General Questions</span>
            <span className="inline sm:hidden">Questions</span>
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Company Research</span>
            <span className="inline sm:hidden">Company</span>
          </TabsTrigger>
          <TabsTrigger value="rounds">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Interview Rounds</span>
            <span className="inline sm:hidden">Rounds</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          {questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((item, index) => (
                <Card key={`question-${index}-${item.question?.substring(0, 15)}`} className="border border-gray-200 hover:border-blue-200 transition-all shadow-sm hover:shadow-md rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-800 font-medium">{item.question}</CardTitle>
                      <Badge className={`${getCategoryColor(item.category)} font-medium shadow-sm`}>
                        {item.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-sm flex items-center">
                        <div className="bg-blue-600 rounded-full w-2 h-2 mr-2"></div>
                        Tips for answering:
                      </h4>
                      <ul className="space-y-2 ml-1">
                        {item.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2 font-bold">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                      
                      {/* Redesigned Answer section */}
                      {item.answer && item.showAnswer && (
                        <div className="mt-6 border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="bg-green-600 rounded-full w-2 h-2 mr-2"></div>
                              <h4 className="font-semibold text-sm bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">AI-Generated Answer</h4>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleShowAnswer(index)}
                              className="h-8 px-2 hover:bg-green-50"
                            >
                              <ChevronUp className="h-4 w-4" />
                              <span className="ml-1">Hide</span>
                            </Button>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-sm border border-green-100 text-gray-800">
                            <div className="prose prose-sm max-w-none">
                              {item.answer.split('\n').map((paragraph, pIndex) => (
                                <p key={pIndex} className={`${pIndex > 0 ? 'mt-3' : ''} leading-relaxed`}>
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3">
                    {item.answer && !item.showAnswer ? (
                      <Button 
                        variant="outline" 
                        onClick={() => toggleShowAnswer(index)}
                        className="text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        <span className="bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent font-medium">View Answer</span>
                      </Button>
                    ) : !item.answer && (
                      <Button 
                        onClick={() => generateAnswer(index)}
                        disabled={item.isGeneratingAnswer}
                        className={`${item.isGeneratingAnswer ? 'bg-blue-50 text-blue-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'} text-white shadow-sm transition-all duration-200 transform hover:-translate-y-0.5`}
                      >
                        {item.isGeneratingAnswer ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span className="text-blue-700">Generating...</span>
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
            <Card className="border border-dashed border-blue-200 bg-blue-50/50">
              <CardContent className="text-center py-16">
                <div className="text-gray-600">
                  <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-sm flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-blue-500 opacity-80" />
                  </div>
                  <p className="font-medium text-blue-800">Generate interview questions to start preparing</p>
                  <p className="text-sm mt-3 max-w-md mx-auto text-gray-500">
                    Questions will be tailored based on your resume and the job requirements. You'll also be able to get AI-generated answer suggestions for each question.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="company" className="mt-6">
          {!companyResearch && !isResearchLoading && (
            <Card className="border border-dashed border-purple-200 bg-purple-50/50">
              <CardContent className="text-center py-16">
                <div className="text-gray-600">
                  <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-sm flex items-center justify-center">
                    <Building className="w-10 h-10 text-purple-500 opacity-80" />
                  </div>
                  <p className="font-medium text-purple-800">Research the company to prepare for your interview</p>
                  <p className="text-sm mt-3 max-w-md mx-auto text-gray-500">
                    Get insights about {jobData?.company || 'the company'}, its culture, and what to expect during the interview process.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {companyResearch && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="text-lg font-medium">
                    About {jobData?.company || 'the company'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="prose prose-sm max-w-none">
                    {companyResearch.companyOverview.split('\n').map((paragraph, index) => (
                      <p key={index} className={index > 0 ? 'mt-3' : ''}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="rounds" className="mt-6">
          {!companyResearch?.interviewProcess && !isResearchLoading && (
            <Card className="border border-dashed border-blue-200 bg-blue-50/50">
              <CardContent className="text-center py-16">
                <div className="text-gray-600">
                  <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-sm flex items-center justify-center">
                    <Briefcase className="w-10 h-10 text-blue-500 opacity-80" />
                  </div>
                  <p className="font-medium text-blue-800">Research the company first to see interview stages</p>
                  <p className="text-sm mt-3 max-w-md mx-auto text-gray-500">
                    Click the "Research Company" button to learn about {jobData?.company || 'the company'}'s interview process.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {companyResearch?.interviewProcess && (
            <div className="space-y-8">
              {companyResearch.interviewProcess.map((round, index) => (
                <Card key={`round-${index}`} className="border border-blue-100 hover:border-blue-200 transition-all">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 font-bold text-sm">
                          {index + 1}
                        </div>
                        <CardTitle className="text-lg font-medium">{round.roundName}</CardTitle>
                      </div>
                      <Button 
                        onClick={() => generateQuestionsForRound(round.roundName)}
                        disabled={isGeneratingRoundQuestions && currentRound === round.roundName}
                        className={`${isGeneratingRoundQuestions && currentRound === round.roundName ? 'bg-blue-50 text-blue-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white shadow-sm transition-all duration-200`}
                        size="sm"
                      >
                        {isGeneratingRoundQuestions && currentRound === round.roundName ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : roundSpecificQuestions[round.roundName] ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Refresh Questions
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3 h-3 mr-2" />
                            Generate Questions
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <p>{round.description}</p>
                      
                      <div>
                        <h4 className="font-medium text-sm text-blue-800 mb-2">Focus Areas:</h4>
                        <p className="text-sm">{round.focus}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-blue-800 mb-2">Preparation Tips:</h4>
                        <ul className="space-y-1">
                          {round.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm flex items-start">
                              <ArrowRight className="h-3 w-3 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Show round-specific questions */}
                      {roundSpecificQuestions[round.roundName]?.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                          <h4 className="font-medium text-md text-purple-800 mb-4 flex items-center">
                            <MessageSquare className="h-4 w-4 text-purple-600 mr-2" />
                            Sample Questions for this Round:
                          </h4>
                          <div className="space-y-4">
                            {roundSpecificQuestions[round.roundName].map((item, qIndex) => (
                              <Card key={`question-${round.roundName}-${qIndex}`} className="border border-gray-200 hover:border-purple-200 transition-all shadow-sm hover:shadow-md rounded-lg overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-gray-50 py-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-md text-gray-800">{item.question}</CardTitle>
                                    <Badge className={`${getCategoryColor(item.category)} font-medium shadow-sm`}>
                                      {item.category}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-3">
                                  <div>
                                    <h5 className="font-semibold text-xs text-gray-600 mb-2">Tips:</h5>
                                    <ul className="space-y-1">
                                      {item.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="text-xs text-gray-600 flex items-start">
                                          <span className="text-blue-500 mr-1 font-bold">•</span>
                                          {tip}
                                        </li>
                                      ))}
                                    </ul>
                                    
                                    {/* Answer section */}
                                    {item.answer && item.showAnswer && (
                                      <div className="mt-4 border-t pt-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center">
                                            <div className="bg-green-600 rounded-full w-2 h-2 mr-2"></div>
                                            <h4 className="font-semibold text-xs bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">Answer</h4>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => toggleShowAnswer(qIndex, round.roundName)}
                                            className="h-6 px-2 hover:bg-green-50"
                                          >
                                            <ChevronUp className="h-3 w-3" />
                                            <span className="ml-1 text-xs">Hide</span>
                                          </Button>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg shadow-sm border border-green-100 text-gray-800 text-xs">
                                          {item.answer.split('\n').map((paragraph, pIndex) => (
                                            <p key={pIndex} className={`${pIndex > 0 ? 'mt-2' : ''} leading-relaxed`}>
                                              {paragraph}
                                            </p>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                                <CardFooter className="flex justify-end py-2">
                                  {item.answer && !item.showAnswer ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => toggleShowAnswer(qIndex, round.roundName)}
                                      className="text-green-700 border-green-200 hover:bg-green-50 text-xs"
                                    >
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                      View Answer
                                    </Button>
                                  ) : !item.answer && (
                                    <Button 
                                      onClick={() => generateAnswer(qIndex, round.roundName)}
                                      disabled={item.isGeneratingAnswer}
                                      size="sm"
                                      className={`${item.isGeneratingAnswer ? 'bg-blue-50 text-blue-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'} text-white text-xs`}
                                    >
                                      {item.isGeneratingAnswer ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <MessageSquare className="w-3 h-3 mr-1" />
                                          Generate Answer
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((item, index) => (
            <Card key={`question-${index}-${item.question?.substring(0, 15)}`} className="border border-gray-200 hover:border-blue-200 transition-all shadow-sm hover:shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800 font-medium">{item.question}</CardTitle>
                  <Badge className={`${getCategoryColor(item.category)} font-medium shadow-sm`}>
                    {item.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div>
                  <h4 className="font-semibold mb-3 text-sm flex items-center">
                    <div className="bg-blue-600 rounded-full w-2 h-2 mr-2"></div>
                    Tips for answering:
                  </h4>
                  <ul className="space-y-2 ml-1">
                    {item.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-gray-600 flex items-start">
                        <span className="text-blue-500 mr-2 font-bold">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Redesigned Answer section */}
                  {item.answer && item.showAnswer && (
                    <div className="mt-6 border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="bg-green-600 rounded-full w-2 h-2 mr-2"></div>
                          <h4 className="font-semibold text-sm bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">AI-Generated Answer</h4>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleShowAnswer(index)}
                          className="h-8 px-2 hover:bg-green-50"
                        >
                          <ChevronUp className="h-4 w-4" />
                          <span className="ml-1">Hide</span>
                        </Button>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-sm border border-green-100 text-gray-800">
                        <div className="prose prose-sm max-w-none">
                          {item.answer.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className={`${pIndex > 0 ? 'mt-3' : ''} leading-relaxed`}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                {item.answer && !item.showAnswer ? (
                  <Button 
                    variant="outline" 
                    onClick={() => toggleShowAnswer(index)}
                    className="text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    <span className="bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent font-medium">View Answer</span>
                  </Button>
                ) : !item.answer && (
                  <Button 
                    onClick={() => generateAnswer(index)}
                    disabled={item.isGeneratingAnswer}
                    className={`${item.isGeneratingAnswer ? 'bg-blue-50 text-blue-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'} text-white shadow-sm transition-all duration-200 transform hover:-translate-y-0.5`}
                  >
                    {item.isGeneratingAnswer ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-blue-700">Generating...</span>
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
        <Card className="border border-dashed border-blue-200 bg-blue-50/50">
          <CardContent className="text-center py-16">
            <div className="text-gray-600">
              <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-sm flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-blue-500 opacity-80" />
              </div>
              <p className="font-medium text-blue-800">Generate interview questions to start preparing</p>
              <p className="text-sm mt-3 max-w-md mx-auto text-gray-500">
                Questions will be tailored based on your resume and the job requirements. You'll also be able to get AI-generated answer suggestions for each question.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}