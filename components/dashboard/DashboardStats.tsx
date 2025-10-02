'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Target, MessageSquare, Zap } from 'lucide-react'

interface DashboardStatsProps {
  readonly resumeData: any
  readonly jobData: any
}

export default function DashboardStats({ resumeData, jobData }: Readonly<DashboardStatsProps>) {
  const [stats, setStats] = useState({
    jobStatus: 'Not started',
    resumeStatus: 'Not started',
    matchScore: 0,
    atsScore: 0
  })

  useEffect(() => {
    // Update job and resume status
    let jobStatus = 'Not started'
    let resumeStatus = 'Not started'
    let atsScore = 0

    if (jobData) {
      jobStatus = 'Analyzed'
    }

    if (resumeData) {
      if (resumeData?.personalInfo?.name) {
        resumeStatus = jobData ? 'Optimized' : 'Uploaded'
      }
      
      // Calculate ATS score if available
      if (resumeData?.atsScore) {
        atsScore = resumeData.atsScore
      }
    }

    // Calculate match score (simple algorithm)
    let matchScore = 0
    if (jobData && resumeData) {
      // Simple calculation - can be replaced with a more sophisticated algorithm
      const hasName = resumeData?.personalInfo?.name ? 25 : 0
      const hasSkills = resumeData?.technicalSkills?.languages?.length > 0 ? 25 : 0
      const hasExperience = resumeData?.workExperience?.length > 0 ? 25 : 0
      const hasEducation = resumeData?.education?.degree ? 25 : 0
      matchScore = hasName + hasSkills + hasExperience + hasEducation
    }

    setStats({
      jobStatus,
      resumeStatus,
      matchScore,
      atsScore
    })
  }, [resumeData, jobData])

  const statCards = [
    {
      title: 'Job Description',
      value: stats.jobStatus,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Resume Status',
      value: stats.resumeStatus,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'ATS Score',
      value: stats.atsScore > 0 ? `${stats.atsScore}/100` : 'Not calculated',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Job Match',
      value: stats.matchScore > 0 ? `${stats.matchScore}%` : 'Not calculated',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {stat.title}
            </CardTitle>
            <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
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