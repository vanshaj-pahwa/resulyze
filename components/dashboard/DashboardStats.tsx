'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Target, MessageSquare, Zap } from 'lucide-react'

interface DashboardStatsProps {
  resumeData: any
  jobData: any
}

export default function DashboardStats({ resumeData, jobData }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    resumeCompleteness: 0,
    atsScore: 0,
    jobsAnalyzed: 0,
    coverLettersGenerated: 0
  })

  useEffect(() => {
    // Calculate resume completeness
    let completeness = 0
    if (resumeData?.personalInfo?.name) completeness += 20
    if (resumeData?.profile) completeness += 20
    if (resumeData?.workExperience?.length > 0) completeness += 20
    if (resumeData?.technicalSkills?.languages?.length > 0) completeness += 20
    if (resumeData?.education?.degree) completeness += 20

    setStats(prev => ({
      ...prev,
      resumeCompleteness: completeness,
      jobsAnalyzed: jobData ? 1 : 0
    }))
  }, [resumeData, jobData])

  const statCards = [
    {
      title: 'Resume Completeness',
      value: `${stats.resumeCompleteness}%`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Current ATS Score',
      value: stats.atsScore > 0 ? `${stats.atsScore}/100` : 'Not calculated',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Jobs Analyzed',
      value: stats.jobsAnalyzed.toString(),
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'AI Optimizations',
      value: '0',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}