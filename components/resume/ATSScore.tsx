'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertTriangle, Target, TrendingUp, X, Check, Clock, Eye, BarChart3, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ATSScoreProps {
    jobData: any
    resumeData: any
    atsData: any
    onImproveWithAI: () => void
}

export default function ATSScore({ jobData, resumeData, atsData, onImproveWithAI }: ATSScoreProps) {
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreIcon = (score: number) => {
        if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
        if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
        return <AlertTriangle className="w-5 h-5 text-red-600" />
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'strong': return 'bg-green-100 text-green-800'
            case 'good start': return 'bg-blue-100 text-blue-800'
            case 'needs work': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getATSIcon = (status: string) => {
        switch (status) {
            case 'pass': return <Check className="w-4 h-4 text-green-600" />
            case 'warning': return <Clock className="w-4 h-4 text-yellow-600" />
            case 'fail': return <X className="w-4 h-4 text-red-600" />
            default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
        }
    }

    const toggleCheckItem = (index: number) => {
        const newChecked = new Set(checkedItems)
        if (newChecked.has(index)) {
            newChecked.delete(index)
        } else {
            newChecked.add(index)
        }
        setCheckedItems(newChecked)
    }

    return (
        <div className="space-y-6">

            {atsData && atsData.overallScore !== undefined && atsData.scoreBreakdown && (
                <div className="space-y-6">
                    {/* Overall Score */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-gray-200"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (atsData.overallScore || 0) / 100)}`}
                                            className={getScoreColor(atsData.overallScore || 0)}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-2xl font-bold ${getScoreColor(atsData.overallScore || 0)}`}>
                                            {atsData.overallScore || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <CardTitle className="flex items-center justify-center gap-2">
                                Your Resume Score
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-sm p-3 bg-white border shadow-lg z-50">
                                            <div className="space-y-2 text-xs">
                                                <div className="font-semibold text-gray-900 mb-2">Overall score breakdown:</div>
                                                <div className="space-y-1">
                                                    <div>• <strong>Tone & Style (20%)</strong> - Action verbs, professional language, quantified achievements</div>
                                                    <div>• <strong>Content (30%)</strong> - Work experience relevance, measurable results, keyword matching</div>
                                                    <div>• <strong>Structure (25%)</strong> - Essential sections, contact info, consistent formatting</div>
                                                    <div>• <strong>Skills (25%)</strong> - Technical skills coverage, job-specific skills matching</div>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </CardTitle>
                            <CardDescription>
                                This score is calculated based on the variables listed below
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Score Breakdown */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(atsData.scoreBreakdown || {}).map(([key, data]: [string, any]) => (
                            <Card key={key} className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </CardTitle>
                                        <Badge className={getStatusColor(data?.status || 'unknown')}>
                                            {data?.status || 'Unknown'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getScoreIcon(data?.score || 0)}
                                        <span className={`font-bold ${getScoreColor(data?.score || 0)}`}>
                                            {data?.score || 0}/100
                                        </span>
                                    </div>
                                    <Progress value={data?.score || 0} className="mb-2" />
                                    <p className="text-sm text-gray-600">{data?.feedback || 'No feedback available'}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* ATS Compatibility Checks */}
                    {atsData.atsCompatibility && (
                        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    ATS Compatibility Analysis
                                </CardTitle>
                                <CardDescription>
                                    {atsData.atsCompatibility.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mb-4">
                                    {atsData.atsCompatibility.checks?.map((check: any, index: number) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                            {getATSIcon(check.status)}
                                            <span className="flex-1 text-sm">{check.item}</span>
                                            <Badge 
                                                variant={check.status === 'pass' ? 'default' : 'secondary'}
                                                className={
                                                    check.status === 'pass' ? 'bg-green-100 text-green-800' :
                                                    check.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }
                                            >
                                                {check.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Tip:</strong> {atsData.atsCompatibility.improvementTip}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Keyword Analysis */}
                    {atsData.keywordAnalysis && (
                        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Keyword Match Analysis
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-sm p-3 bg-white border shadow-lg z-50">
                                                <div className="space-y-2 text-xs">
                                                    <div className="font-semibold text-gray-900 mb-2">Keyword matching process:</div>
                                                    <div className="space-y-1">
                                                        <div>• Analyzes skills from the job posting</div>
                                                        <div>• Searches your resume for these keywords</div>
                                                        <div>• Checks profile, skills sections, and work experience</div>
                                                        <div>• Calculates percentage of job skills found in your resume</div>
                                                        <div>• Higher match = better ATS compatibility</div>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </CardTitle>
                                <CardDescription>
                                    {atsData.keywordAnalysis.matchPercentage}% keyword match with job requirements
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Progress value={atsData.keywordAnalysis.matchPercentage} className="mb-4" />
                                
                                {atsData.keywordAnalysis.matchedSkills?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Matched Skills ({atsData.keywordAnalysis.matchedSkills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsData.keywordAnalysis.matchedSkills.map((skill: string, index: number) => (
                                                <Badge key={index} className="bg-green-100 text-green-800">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {atsData.keywordAnalysis.missingSkills?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                                            <X className="w-4 h-4" />
                                            Missing Skills ({atsData.keywordAnalysis.missingSkills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsData.keywordAnalysis.missingSkills.slice(0, 10).map((skill: string, index: number) => (
                                                <Badge key={index} variant="outline" className="border-red-300 text-red-700">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {atsData.keywordAnalysis.missingSkills.length > 10 && (
                                                <Badge variant="outline" className="border-gray-300 text-gray-600">
                                                    +{atsData.keywordAnalysis.missingSkills.length - 10} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Improvement Checklist */}
                    {atsData.improvementChecklist && atsData.improvementChecklist.length > 0 && (
                        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Improvement Checklist
                                </CardTitle>
                                <CardDescription>
                                    Complete these items to boost your ATS score
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {atsData.improvementChecklist.map((item: string, index: number) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <button
                                                onClick={() => toggleCheckItem(index)}
                                                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                    checkedItems.has(index)
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300 hover:border-green-400'
                                                }`}
                                            >
                                                {checkedItems.has(index) && <Check className="w-3 h-3" />}
                                            </button>
                                            <span className={`flex-1 text-sm ${checkedItems.has(index) ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Progress:</strong> {checkedItems.size} of {atsData.improvementChecklist.length} items completed
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Relevance Score */}
                    {atsData.relevanceScore !== undefined && (
                        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Job Relevance Score
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-sm p-3 bg-white border shadow-lg z-50">
                                                <div className="space-y-2 text-xs">
                                                    <div className="font-semibold text-gray-900 mb-2">How this score is calculated:</div>
                                                    <div className="space-y-1">
                                                        <div>• <strong>Skills matching (40%)</strong> - Keywords from job requirements found in your resume</div>
                                                        <div>• <strong>Job title relevance (25%)</strong> - Job title words appear in your positions or profile</div>
                                                        <div>• <strong>Description relevance (25%)</strong> - Content matching with job description</div>
                                                        <div>• <strong>Industry alignment (10%)</strong> - Industry-specific keywords and terminology</div>
                                                        <div>• <strong>ATS bonus</strong> - Up to 15 points for strong structural elements</div>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </CardTitle>
                                <CardDescription>
                                    How well your experience matches this specific role
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`text-3xl font-bold ${getScoreColor(atsData.relevanceScore)}`}>
                                        {atsData.relevanceScore}%
                                    </div>
                                    <Progress value={atsData.relevanceScore} className="flex-1" />
                                </div>
                                <p className="text-sm text-gray-600">
                                    {atsData.relevanceScore >= 80 ? 'Excellent match! Your experience strongly aligns with this role.' :
                                     atsData.relevanceScore >= 60 ? 'Good alignment. Consider emphasizing more relevant experience.' :
                                     'Limited alignment. Focus on highlighting transferable skills and relevant projects.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Button
                        onClick={onImproveWithAI}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Improve with AI
                    </Button>

                </div>
            )}

            {/* Error State */}
            {atsData && atsData.error && (
                <Card className="border-0 bg-red-50 backdrop-blur-sm shadow-lg border-red-200">
                    <CardContent className="text-center py-12">
                        <div className="text-red-600">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-semibold mb-2">Unable to Calculate ATS Score</p>
                            <p className="text-sm">The AI service is currently unavailable. Please try again in a few moments.</p>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
                            >
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!atsData && (
                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                    <CardContent className="text-center py-12">
                        <div className="text-gray-500">
                            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Calculate your ATS score to get detailed feedback</p>
                            <p className="text-sm mt-2">Use the "Calculate ATS Score" button above to analyze your resume</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}