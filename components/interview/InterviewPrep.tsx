'use client'

import { useState, useEffect } from 'react'
import { fetchWithKey } from '@/lib/fetch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, MessageSquare, ChevronUp, ChevronDown, Building, Users, Briefcase, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.css' // Import a code highlighting theme

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
      const response = await fetchWithKey('/api/research-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: jobData.company,
          jobTitle: jobData.jobTitle || ''
        })
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

  const generateQuestionsForRound = async (roundName: string, description: string) => {
    if (!jobData || !resumeData) {
      alert('Please complete job analysis and resume first');
      return;
    }

    setCurrentRound(roundName);
    setIsGeneratingRoundQuestions(true);

    try {
      const response = await fetchWithKey('/api/generate-interview-questions', {
        method: 'POST',
        body: JSON.stringify({
          jobData,
          resumeData,
          interviewRound: roundName,
          roundDetails: description
        })
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

      // Round-specific questions have been generated

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
      const response = await fetchWithKey('/api/generate-interview-questions', {
        method: 'POST',
        body: JSON.stringify({ jobData, resumeData })
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
      const response = await fetchWithKey('/api/generate-interview-answer', {
        method: 'POST',
        body: JSON.stringify({
          question: question.question,
          category: question.category,
          tips: question.tips,
          resumeData,
          jobData,
          roundName // Pass the round name if available
        })
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
      'Technical': 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600',
      'Behavioral': 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600',
      'Experience': 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600',
      'Company': 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600',
      'Problem Solving': 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600'
    }
    return colors[category] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Interview Preparation</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Research, questions, and answers tailored to your profile and the job</p>
          <div className="flex items-center mt-2 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md border border-zinc-200 dark:border-zinc-700">
            <Building className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mr-2 flex-shrink-0" />
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {isResearchLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  <span className="hidden xs:inline">Researching {jobData?.company || 'company'} interview process...</span>
                  <span className="xs:hidden">Researching...</span>
                </span>
              ) : companyResearch ? (
                <span>
                  <span className="hidden sm:inline">Explore the interview process at {jobData?.company || 'the company'} and prepare for each stage</span>
                  <span className="sm:hidden">Interview process available</span>
                </span>
              ) : (
                <span>
                  <span className="hidden xs:inline">Analyzing interview process at {jobData?.company || 'the company'}...</span>
                  <span className="xs:hidden">Analyzing interview process...</span>
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <Button
            onClick={generateQuestions}
            disabled={isGenerating || !jobData || !resumeData}
            className={`w-full md:w-auto ${isGenerating ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'} shadow-md transition-all duration-200`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden xs:inline">Generating...</span>
                <span className="xs:hidden">Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Generate General Questions</span>
                <span className="sm:hidden">General Questions</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Direct display of content without tabs */}
      <div className="space-y-8">

        {/* Company Research Section */}
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <Building className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Company Research</h3>
          </div>

          {!companyResearch && !isResearchLoading ? (
            <Card className="border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50">
              <CardContent className="text-center py-8">
                <div className="text-zinc-500 dark:text-zinc-400">
                  <div className="bg-white dark:bg-zinc-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm flex items-center justify-center">
                    <Building className="w-8 h-8 text-zinc-400 dark:text-zinc-500 opacity-80" />
                  </div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">Research the company to prepare for your interview</p>
                  <p className="text-sm mt-2 max-w-md mx-auto text-zinc-500 dark:text-zinc-400">
                    Get insights about {jobData?.company || 'the company'}, its culture, and what to expect during the interview process.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : companyResearch ? (
            <Card>
              <CardHeader className="bg-zinc-50 dark:bg-zinc-800">
                <CardTitle className="text-lg font-medium">
                  About {jobData?.company || 'the company'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="prose prose-sm max-w-none markdown-content">
                  <ReactMarkdown
                    rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {companyResearch.companyOverview}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Interview Rounds Section */}
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Briefcase className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Interview Rounds</h3>
          </div>

          {!companyResearch?.interviewProcess && !isResearchLoading ? (
            <Card className="border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50">
              <CardContent className="text-center py-8">
                <div className="text-zinc-500 dark:text-zinc-400">
                  <div className="bg-white dark:bg-zinc-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-zinc-400 dark:text-zinc-500 opacity-80" />
                  </div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">Research the company first to see interview stages</p>
                  <p className="text-sm mt-2 max-w-md mx-auto text-zinc-500 dark:text-zinc-400">
                    Wait for the company research to complete to learn about {jobData?.company || 'the company'}'s interview process.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : companyResearch?.interviewProcess ? (
            <div className="space-y-8">
              {companyResearch.interviewProcess.map((round, index) => (
                <Card key={`round-${index}`} className="border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
                  <CardHeader className="bg-zinc-50 dark:bg-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full w-6 h-6 flex items-center justify-center mr-2 sm:mr-3 font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <CardTitle className="text-sm sm:text-lg font-medium">{round.roundName}</CardTitle>
                      </div>
                      <Button
                        onClick={() => generateQuestionsForRound(round.roundName, round.description)}
                        disabled={isGeneratingRoundQuestions && currentRound === round.roundName}
                        className={`${isGeneratingRoundQuestions && currentRound === round.roundName ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'} shadow-sm transition-all duration-200 text-xs sm:text-sm`}
                        size="sm"
                      >
                        {isGeneratingRoundQuestions && currentRound === round.roundName ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 sm:mr-2 animate-spin" />
                            <span className="hidden xs:inline">Generating...</span>
                            <span className="xs:hidden">...</span>
                          </>
                        ) : roundSpecificQuestions[round.roundName] ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">Refresh Questions</span>
                            <span className="xs:hidden">Refresh</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3 h-3 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">Generate Questions</span>
                            <span className="xs:hidden">Generate</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <p>{round.description}</p>

                      <div>
                        <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-300 mb-2">Focus Areas:</h4>
                        <p className="text-sm">{round.focus}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-300 mb-2">Preparation Tips:</h4>
                        <ul className="space-y-1">
                          {round.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm arrow-tip">
                              <ArrowRight className="h-3 w-3 text-zinc-500 dark:text-zinc-400 mr-2 mt-1 flex-shrink-0" />
                              <div className="prose prose-sm markdown-content">
                                <ReactMarkdown
                                  rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                                  remarkPlugins={[remarkGfm]}
                                >
                                  {tip}
                                </ReactMarkdown>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Show round-specific questions */}
                      {roundSpecificQuestions[round.roundName]?.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                          <h4 className="font-medium text-md text-zinc-700 dark:text-zinc-300 mb-4 flex items-center">
                            <MessageSquare className="h-4 w-4 text-zinc-500 dark:text-zinc-400 mr-2" />
                            Sample Questions for this Round:
                          </h4>
                          <div className="space-y-4">
                            {roundSpecificQuestions[round.roundName].map((item, qIndex) => (
                              <Card key={`question-${round.roundName}-${qIndex}`} className="border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-md rounded-lg overflow-hidden">
                                <CardHeader className="bg-zinc-50 dark:bg-zinc-800 py-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-md text-zinc-800 dark:text-zinc-200 w-full">
                                      <div className="prose prose-sm max-w-none markdown-content">
                                        <ReactMarkdown
                                          rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {item.question}
                                        </ReactMarkdown>
                                      </div>
                                    </CardTitle>
                                    <Badge className={`${getCategoryColor(item.category)} font-medium shadow-sm ml-2 flex-shrink-0`}>
                                      {item.category}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-3">
                                  <div>
                                    <h5 className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 mb-2">Tips:</h5>
                                    <ul className="space-y-1">
                                      {item.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="text-xs text-zinc-500 dark:text-zinc-400 tip-list-item">
                                          <div className="prose prose-sm markdown-content">
                                            <ReactMarkdown
                                              rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                                              remarkPlugins={[remarkGfm]}
                                            >
                                              {tip}
                                            </ReactMarkdown>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>

                                    {/* Answer section */}
                                    {item.answer && item.showAnswer && (
                                      <div className="mt-4 border-t pt-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center">
                                            <div className="bg-green-600 rounded-full w-2 h-2 mr-2"></div>
                                            <h4 className="font-semibold text-xs text-green-700 dark:text-green-400">Answer</h4>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleShowAnswer(qIndex, round.roundName)}
                                            className="h-6 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                          >
                                            <ChevronUp className="h-3 w-3" />
                                            <span className="ml-1 text-xs">Hide</span>
                                          </Button>
                                        </div>
                                        <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs markdown-content">
                                          <ReactMarkdown
                                            rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                                            remarkPlugins={[remarkGfm]}
                                          >
                                            {item.answer}
                                          </ReactMarkdown>
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
                                      className="text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs"
                                    >
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                      View Answer
                                    </Button>
                                  ) : !item.answer && (
                                    <Button
                                      onClick={() => generateAnswer(qIndex, round.roundName)}
                                      disabled={item.isGeneratingAnswer}
                                      size="sm"
                                      className={`${item.isGeneratingAnswer ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'} text-xs`}
                                    >
                                      {item.isGeneratingAnswer ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          <span className="hidden xs:inline">Generating...</span>
                                          <span className="xs:hidden">...</span>
                                        </>
                                      ) : (
                                        <>
                                          <MessageSquare className="w-3 h-3 mr-1" />
                                          <span className="hidden xs:inline">Generate Answer</span>
                                          <span className="xs:hidden">Answer</span>
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
          ) : null}
        </div>

        {/* General Questions Section */}
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">General Questions</h3>
          </div>

          {questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((item, index) => (
                <Card key={`question-${index}-${item.question?.substring(0, 15)}`} className="border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-md rounded-xl overflow-hidden">
                  <CardHeader className="bg-zinc-50 dark:bg-zinc-800 pb-4">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
                      <CardTitle className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 font-medium w-full">
                        <div className="prose prose-sm max-w-none markdown-content">
                          <ReactMarkdown
                            rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                            remarkPlugins={[remarkGfm]}
                          >
                            {item.question}
                          </ReactMarkdown>
                        </div>
                      </CardTitle>
                      <Badge className={`${getCategoryColor(item.category)} font-medium shadow-sm text-xs mt-1 xs:mt-0`}>
                        {item.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-sm flex items-center">
                        <div className="bg-zinc-900 dark:bg-zinc-100 rounded-full w-2 h-2 mr-2"></div>
                        Tips for answering:
                      </h4>
                      <ul className="space-y-2 ml-1">
                        {item.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-zinc-500 dark:text-zinc-400 tip-list-item">
                            <div className="prose prose-sm markdown-content">
                              <ReactMarkdown
                                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                                remarkPlugins={[remarkGfm]}
                              >
                                {tip}
                              </ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* Redesigned Answer section */}
                      {item.answer && item.showAnswer && (
                        <div className="mt-6 border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="bg-green-600 rounded-full w-2 h-2 mr-2"></div>
                              <h4 className="font-semibold text-sm text-green-700 dark:text-green-400">AI-Generated Answer</h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleShowAnswer(index)}
                              className="h-8 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <ChevronUp className="h-4 w-4" />
                              <span className="ml-1">Hide</span>
                            </Button>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
                            <div className="prose prose-sm max-w-none markdown-content">
                              <ReactMarkdown
                                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                                remarkPlugins={[remarkGfm]}
                              >
                                {item.answer}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center xs:justify-between pt-3">
                    {item.answer && !item.showAnswer ? (
                      <Button
                        variant="outline"
                        onClick={() => toggleShowAnswer(index)}
                        className="text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 w-full xs:w-auto"
                      >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        <span className="font-medium text-green-700 dark:text-green-400 hidden xs:inline">View Answer</span>
                        <span className="font-medium text-green-700 dark:text-green-400 xs:hidden">View</span>
                      </Button>
                    ) : !item.answer && (
                      <Button
                        onClick={() => generateAnswer(index)}
                        disabled={item.isGeneratingAnswer}
                        className={`${item.isGeneratingAnswer ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'} shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 w-full xs:w-auto`}
                      >
                        {item.isGeneratingAnswer ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span className="text-zinc-600 dark:text-zinc-300 hidden xs:inline">Generating...</span>
                            <span className="text-zinc-600 dark:text-zinc-300 xs:hidden">Loading...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span className="hidden xs:inline">Generate Answer</span>
                            <span className="xs:hidden">Answer</span>
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
            <Card className="border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50">
              <CardContent className="text-center py-8">
                <div className="text-zinc-500 dark:text-zinc-400">
                  <div className="bg-white dark:bg-zinc-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-zinc-400 dark:text-zinc-500 opacity-80" />
                  </div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">Generate interview questions to start preparing</p>
                  <p className="text-sm mt-2 max-w-md mx-auto text-zinc-500 dark:text-zinc-400">
                    Questions will be tailored based on your resume and the job requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
