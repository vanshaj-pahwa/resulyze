'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2, Download, Plus, Trash2, AlertCircle, Target } from 'lucide-react'
import ResumePreview from './ResumePreview'
import ATSScore from './ATSScore'

interface ResumeBuilderProps {
  jobData: any
  onResumeDataChange: (data: any) => void
}

interface WorkExperience {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  achievements: string[]
}

interface Project {
  id: string
  name: string
  technologies: string
  description: string
  achievements: string[]
  githubUrl?: string
}

interface ResumeData {
  personalInfo: {
    name: string
    phone: string
    email: string
    linkedin: string
    github: string
    location: string
  }
  profile: string
  technicalSkills: {
    languages: string[]
    frontend: string[]
    backend: string[]
    devTools: string[]
    other: string[]
  }
  workExperience: WorkExperience[]
  education: {
    degree: string
    institution: string
    location: string
    graduationDate: string
    gpa?: string
  }
  projects: Project[]
  achievements: string[]
}

const defaultResumeData: ResumeData = {
  personalInfo: {
    name: 'VANSHAJ PAHWA',
    phone: '+91 9467275790',
    email: 'vanshajpahwa07@gmail.com',
    linkedin: 'https://www.linkedin.com/in/vanshaj-pahwa',
    github: 'https://github.com/vanshaj-pahwa',
    location: ''
  },
  profile: 'Software Engineer with 3+ years of experience building production-ready web applications using React, TypeScript, and Spring Boot. Delivered features used by thousands of users with measurable outcomes such as 25% faster load times, 60% reduction in manual effort, and 0 critical defects in 5+ releases. Skilled at building modular, test-driven UIs and refactoring backend services for performance.',
  technicalSkills: {
    languages: ['Java', 'JavaScript', 'TypeScript', 'C++', 'HTML', 'CSS'],
    frontend: ['React.js', 'Next.js', 'GraphQL', 'Next.js', 'React Hooks', 'Redux Toolkit', 'Jest', 'RTL'],
    backend: ['Spring Boot', 'REST APIs', 'Node.js'],
    devTools: ['Docker', 'Git', 'GitHub', 'Postman', 'VS Code', 'IntelliJ', 'SonarCube', 'JIRA'],
    other: ['PostgreSQL', 'Agile', 'CI/CD']
  },
  workExperience: [
    {
      id: '1',
      title: 'Software Engineer II',
      company: 'HashedIn By Deloitte',
      location: 'Bangalore, India',
      startDate: 'Oct 2024',
      endDate: 'Present',
      current: true,
      achievements: [
        'Owned the development of a licensing dashboard using React/Redux/TypeScript to replace manual Excel-based workflows, enabling key actions like license generation, merge/split, and upgrade/downgrade reducing manual overhead by 40%.',
        'Designed a drag-and-drop licensing dashboard, improving UX and reducing navigation time by ~30%.',
        'Implemented interactive visual dashboards with Plotly.js in Next.js (box plots, splom, scatter, etc.) with lazy loading, cutting initial payload by ~35% and improving first render speed.',
        'Conducted bi-weekly code reviews and established test-driven development workflows, contributing to a 20% drop in QA bugs.',
        'Collaborated with backend teams to refactor Spring Boot APIs and introduce Redis caching; improved load time by 25%.'
      ]
    }
  ],
  education: {
    degree: 'Bachelor of Technology in Information Technology',
    institution: 'Guru Gobind Singh Indraprastha University',
    location: 'New Delhi, India',
    graduationDate: '2018 - 2022',
    gpa: '9/10'
  },
  projects: [
    {
      id: '1',
      name: 'SWoT – Workout Tracker',
      technologies: 'React.js, Redux, Spring Boot, REST APIs, PostgreSQL',
      description: '',
      achievements: [
        'Built a full-stack fitness tracker with JWT auth, goal tracking, and dynamic charts ensuring seamless cross device compatibility.',
        'Boosted user engagement and retention by creating an interactive platform for tracking and visualizing workout metrics, leading to a 30% increase in active users within three months.'
      ],
      githubUrl: 'GitHub'
    }
  ],
  achievements: [
    'Microsoft Certified: Azure Developer Associate (AZ-204)',
    'Excellence Award, HashedIn by Deloitte – Recognized for delivering critical features with zero defects under tight deadlines.',
    'Rising Star Award – Awarded to top 2% performers for accelerating delivery by 20%.'
  ]
}

export default function ResumeBuilder({ jobData, onResumeDataChange }: ResumeBuilderProps) {
  const { user } = useUser()
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isCalculatingATS, setIsCalculatingATS] = useState(false)
  const [atsData, setAtsData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("personal")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load user's resume data on component mount
  useEffect(() => {
    const loadResumeData = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/user/resume')
        if (response.ok) {
          const result = await response.json()
          if (result && !result.error) {
            setResumeData(result)
          } else if (result.fallback) {
            // Try loading from localStorage as fallback
            try {
              const localData = localStorage.getItem(`resume_${user.id}`)
              if (localData) {
                setResumeData(JSON.parse(localData))
                console.log('Loaded data from localStorage fallback')
              }
            } catch (localError) {
              console.error('Failed to load from localStorage:', localError)
            }
          }
        }
      } catch (error) {
        console.error('Error loading resume data:', error)
        // Try localStorage fallback
        if (typeof window !== 'undefined') {
          try {
            const localData = localStorage.getItem(`resume_${user.id}`)
            if (localData) {
              setResumeData(JSON.parse(localData))
              console.log('Loaded data from localStorage fallback')
            }
          } catch (localError) {
            console.error('Failed to load from localStorage:', localError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadResumeData()
  }, [user])

  // Auto-save resume data when it changes
  const saveResumeData = useCallback(async (data: ResumeData) => {
    if (!user || isLoading) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.fallback) {
        console.warn('Using fallback storage:', result.message || 'Data saved locally')
      }
    } catch (error) {
      console.error('Error saving resume data:', error)
      // Fallback to localStorage on client side
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`resume_${user.id}`, JSON.stringify(data))
          console.log('Data saved to localStorage as fallback')
        } catch (localError) {
          console.error('Failed to save to localStorage:', localError)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }, [user, isLoading])

  useEffect(() => {
    onResumeDataChange(resumeData)
    // Auto-save with debounce
    const timeoutId = setTimeout(() => {
      saveResumeData(resumeData)
    }, 1000) // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId)
  }, [resumeData, onResumeDataChange, saveResumeData])

  const getMissingRequirements = () => {
    const missing = []
    if (!jobData) missing.push('Job Description Analysis')
    return missing
  }

  const getTooltipMessage = () => {
    const missing = getMissingRequirements()
    if (missing.length === 0) return ''
    return `Please complete: ${missing.join(' and ')}`
  }

  const optimizeResume = async () => {
    if (!jobData) {
      alert('Please analyze a job description first')
      return
    }

    setIsOptimizing(true)
    try {
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobData })
      })

      const optimizedData = await response.json()
      setResumeData(optimizedData)
    } catch (error) {
      console.error('Error optimizing resume:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const calculateATSScore = async () => {
    if (!jobData || !resumeData) {
      alert('Please complete job analysis and resume first')
      return
    }

    setIsCalculatingATS(true)
    try {
      const response = await fetch('/api/calculate-ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobData, resumeData })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Check if the response contains an error
      if (data.error) {
        setAtsData({ error: data.error })
      } else {
        setAtsData(data)
      }
      
      // Automatically switch to ATS Score tab when calculation is complete
      setActiveTab("ats-score")
    } catch (error) {
      console.error('Error calculating ATS score:', error)
      // Set error state for display
      setAtsData({ 
        error: 'The AI service is currently unavailable. Please try again in a few moments.' 
      })
      setActiveTab("ats-score")
    } finally {
      setIsCalculatingATS(false)
    }
  }

  const improveWithAI = async () => {
    await optimizeResume()
    if (atsData) {
      await calculateATSScore()
    }
  }

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      achievements: ['']
    }
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp]
    }))
  }

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      technologies: '',
      description: '',
      achievements: ['']
    }
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
  }

  const downloadResume = async (format: 'pdf' | 'docx') => {
    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, format })
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading resume:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading your resume...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Save indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Saving changes...</span>
        </div>
      )}

      {!jobData && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700">
            {getTooltipMessage()} to optimize your resume with AI
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button onClick={optimizeResume} disabled={isOptimizing || !jobData}>
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      'AI Optimize Resume'
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              {!jobData && (
                <TooltipContent>
                  <p>{getTooltipMessage()}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button onClick={calculateATSScore} disabled={isCalculatingATS || !jobData || !resumeData} variant="outline">
                    {isCalculatingATS ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Calculate ATS Score
                      </>
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              {!jobData && (
                <TooltipContent>
                  <p>{getTooltipMessage()}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadResume('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => downloadResume('docx')}>
            <Download className="w-4 h-4 mr-2" />
            Download DOCX
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="personal" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Personal</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="experience" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Experience</span>
                <span className="sm:hidden">Exp</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="text-xs sm:text-sm">Skills</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Projects</span>
                <span className="sm:hidden">Proj</span>
              </TabsTrigger>
              <TabsTrigger value="ats-score" className="relative text-xs sm:text-sm">
                <span className="hidden sm:inline">ATS Score</span>
                <span className="sm:hidden">ATS</span>
                {atsData && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, name: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="GitHub URL"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, github: e.target.value }
                    }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Professional summary..."
                    value={resumeData.profile}
                    onChange={(e) => setResumeData(prev => ({ ...prev, profile: e.target.value }))}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              {resumeData.workExperience.map((exp, index) => (
                <Card key={exp.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      Work Experience {index + 1}
                      {resumeData.workExperience.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            workExperience: prev.workExperience.filter(e => e.id !== exp.id)
                          }))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => updateWorkExperience(exp.id, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                      />
                      <Input
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Achievements</label>
                      {exp.achievements && exp.achievements.map((achievement, achIndex) => (
                        <Textarea
                          key={achIndex}
                          placeholder="Achievement or responsibility..."
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...exp.achievements]
                            newAchievements[achIndex] = e.target.value
                            updateWorkExperience(exp.id, 'achievements', newAchievements)
                          }}
                          rows={2}
                        />
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateWorkExperience(exp.id, 'achievements', [...exp.achievements, ''])}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addWorkExperience} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Work Experience
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Languages</label>
                    <Input
                      placeholder="Java, JavaScript, Python..."
                      value={resumeData.technicalSkills.languages.join(', ')}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        technicalSkills: {
                          ...prev.technicalSkills,
                          languages: e.target.value.split(', ').filter(s => s.trim())
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Frontend Technologies</label>
                    <Input
                      placeholder="React, Vue, Angular..."
                      value={resumeData.technicalSkills.frontend.join(', ')}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        technicalSkills: {
                          ...prev.technicalSkills,
                          frontend: e.target.value.split(', ').filter(s => s.trim())
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Backend Technologies</label>
                    <Input
                      placeholder="Spring Boot, Node.js, Django..."
                      value={resumeData.technicalSkills.backend.join(', ')}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        technicalSkills: {
                          ...prev.technicalSkills,
                          backend: e.target.value.split(', ').filter(s => s.trim())
                        }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              {resumeData.projects.map((project, index) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      Project {index + 1}
                      {resumeData.projects.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.filter(p => p.id !== project.id)
                          }))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Project Name"
                      value={project.name}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        projects: prev.projects.map(p =>
                          p.id === project.id ? { ...p, name: e.target.value } : p
                        )
                      }))}
                    />
                    <Input
                      placeholder="Technologies Used"
                      value={project.technologies}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        projects: prev.projects.map(p =>
                          p.id === project.id ? { ...p, technologies: e.target.value } : p
                        )
                      }))}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Achievements</label>
                      {project.achievements && project.achievements.map((achievement, achIndex) => (
                        <Textarea
                          key={achIndex}
                          placeholder="Project achievement or feature..."
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...project.achievements]
                            newAchievements[achIndex] = e.target.value
                            setResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map(p =>
                                p.id === project.id ? { ...p, achievements: newAchievements } : p
                              )
                            }))
                          }}
                          rows={2}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addProject} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </TabsContent>

            <TabsContent value="ats-score" className="space-y-4">
              <ATSScore
                jobData={jobData}
                resumeData={resumeData}
                atsData={atsData}
                onImproveWithAI={improveWithAI}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:sticky lg:top-4">
          <ResumePreview resumeData={resumeData} />
        </div>
      </div>
    </div>
  )
}