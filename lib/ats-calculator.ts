// Enhanced Rule-based ATS Score Calculator
export interface ATSScoreResult {
  overallScore: number
  scoreBreakdown: {
    toneAndStyle: {
      score: number
      status: string
      feedback: string
    }
    content: {
      score: number
      status: string
      feedback: string
    }
    structure: {
      score: number
      status: string
      feedback: string
    }
    skills: {
      score: number
      status: string
      feedback: string
    }
  }
  improvementChecklist: string[]
  atsCompatibility: {
    score: number
    status: string
    checks: Array<{
      item: string
      status: 'pass' | 'warning' | 'fail'
      icon: string
    }>
    description: string
    improvementTip: string
  }
  keywordAnalysis?: {
    matchedSkills: string[]
    missingSkills: string[]
    matchPercentage: number
  }
  relevanceScore?: number
}

export function calculateATSScore(resumeData: any, jobData: any): ATSScoreResult {
  // Helper functions
  const getStatus = (score: number): string => {
    if (score >= 80) return 'Strong'
    if (score >= 60) return 'Good Start'
    return 'Needs work'
  }

  const countWords = (text: string): number => {
    return text ? text.split(/\s+/).filter(word => word.length > 0).length : 0
  }

  const hasQuantifiedAchievements = (text: string): boolean => {
    const numberPattern = /\d+%|\d+x|\d+\+|\$\d+|\d+k\+|\d+ years?|\d+ months?/i
    return numberPattern.test(text)
  }

  const hasActionVerbs = (text: string): boolean => {
    const actionVerbs = [
      'achieved', 'built', 'created', 'developed', 'designed', 'implemented',
      'improved', 'increased', 'led', 'managed', 'optimized', 'reduced',
      'delivered', 'collaborated', 'established', 'conducted', 'owned',
      'launched', 'executed', 'streamlined', 'enhanced', 'accelerated',
      'transformed', 'pioneered', 'spearheaded', 'orchestrated', 'facilitated',
      'generated', 'maximized', 'minimized', 'resolved', 'automated'
    ]
    return actionVerbs.some(verb => text.toLowerCase().includes(verb))
  }

  const calculateRelevanceScore = (): number => {
    // If no job data, use keyword matching as baseline
    if (!jobData?.title && !jobData?.description && !jobData?.skills) {
      return 65 // Neutral score when no job data available
    }

    let totalScore = 0
    let scoreComponents = 0

    // 1. Skills matching (40% weight)
    if (jobData?.skills && jobData.skills.length > 0) {
      const keywordMatch = calculateKeywordMatch()
      totalScore += keywordMatch.score * 0.4
      scoreComponents += 0.4
    }

    // 2. Job title relevance (25% weight)
    if (jobData?.title) {
      const jobTitle = jobData.title.toLowerCase()
      const resumePositions = resumeData?.workExperience?.map((exp: any) => exp.position?.toLowerCase() || '') || []
      const profileText = (resumeData?.profile || '').toLowerCase()

      let titleScore = 0

      // Check if job title words appear in resume positions or profile
      const titleWords = jobTitle.split(/\s+/).filter((word: string) =>
        word.length > 2 &&
        !['the', 'and', 'for', 'with', 'at', 'in', 'of', 'to', 'a', 'an'].includes(word)
      )

      const titleMatches = titleWords.filter((word: string) =>
        resumePositions.some((pos: string) => pos.includes(word)) || profileText.includes(word)
      )

      titleScore = titleWords.length > 0 ? (titleMatches.length / titleWords.length) * 100 : 50
      totalScore += titleScore * 0.25
      scoreComponents += 0.25
    }

    // 3. Description/content relevance (25% weight)
    if (jobData?.description) {
      const jobText = jobData.description.toLowerCase()
      const resumeText = [
        resumeData?.profile || '',
        ...(resumeData?.workExperience?.map((exp: any) => `${exp.position} ${exp.company} ${exp.achievements?.join(' ') || ''}`) || []),
        ...(resumeData?.projects?.map((proj: any) => `${proj.name} ${proj.description}`) || [])
      ].join(' ').toLowerCase()

      // Extract meaningful terms from job description
      const jobWords = jobText.split(/\s+/).filter((word: string) =>
        word.length > 4 &&
        !['the', 'and', 'for', 'with', 'this', 'that', 'will', 'are', 'have', 'been', 'they', 'their', 'would', 'should', 'could', 'from', 'into', 'about', 'through'].includes(word)
      )

      const matchedWords = jobWords.filter((word: string) => resumeText.includes(word))
      const descriptionScore = jobWords.length > 0 ? (matchedWords.length / jobWords.length) * 100 : 50

      totalScore += descriptionScore * 0.25
      scoreComponents += 0.25
    }

    // 4. Industry/role alignment (10% weight)
    const industryScore = hasIndustryKeywords(
      `${resumeData?.profile || ''} ${resumeData?.workExperience?.map((exp: any) => exp.achievements?.join(' ') || '').join(' ') || ''}`,
      jobData?.industry
    ) ? 80 : 40

    totalScore += industryScore * 0.1
    scoreComponents += 0.1

    // Normalize score based on available components
    const finalScore = scoreComponents > 0 ? totalScore / scoreComponents : 65

    // Boost score if ATS compatibility checks are all passing
    const atsChecks = [
      (resumeData?.personalInfo?.name && resumeData?.personalInfo?.email && resumeData?.personalInfo?.phone),
      (resumeData?.technicalSkills?.languages?.length || 0) >= 3,
      allAchievements.some((achievement: string) => hasQuantifiedAchievements(achievement)),
      (resumeData?.profile?.trim()?.length || 0) >= 100,
      (resumeData?.workExperience?.length || 0) > 0 && allAchievements.length >= 3
    ]

    const passingChecks = atsChecks.filter(Boolean).length
    const atsBonus = (passingChecks / atsChecks.length) * 15 // Up to 15 point bonus

    return Math.min(100, Math.round(finalScore + atsBonus))
  }

  const hasIndustryKeywords = (text: string, industry?: string): boolean => {
    const industryKeywords: { [key: string]: string[] } = {
      'software': ['agile', 'scrum', 'ci/cd', 'devops', 'microservices', 'api', 'database', 'cloud'],
      'marketing': ['seo', 'sem', 'analytics', 'conversion', 'campaign', 'brand', 'social media'],
      'finance': ['financial modeling', 'risk management', 'compliance', 'audit', 'portfolio'],
      'healthcare': ['hipaa', 'clinical', 'patient care', 'medical records', 'healthcare'],
      'education': ['curriculum', 'pedagogy', 'assessment', 'learning outcomes', 'student engagement']
    }

    if (!industry) return false
    const keywords = industryKeywords[industry.toLowerCase()] || []
    return keywords.some(keyword => text.toLowerCase().includes(keyword))
  }

  const calculateKeywordMatch = (): { score: number; matchedSkills: string[]; missingSkills: string[] } => {
    if (!jobData?.skills || !jobData.skills.length) {
      return { score: 50, matchedSkills: [], missingSkills: [] }
    }

    const jobSkills = jobData.skills.map((s: string) => s.toLowerCase())
    const resumeText = [
      resumeData?.profile || '',
      ...(resumeData?.technicalSkills?.languages || []),
      ...(resumeData?.technicalSkills?.frontend || []),
      ...(resumeData?.technicalSkills?.backend || []),
      ...(resumeData?.technicalSkills?.devTools || []),
      ...(resumeData?.workExperience?.flatMap((exp: any) => exp.achievements || []) || [])
    ].join(' ').toLowerCase()

    const matchedSkills = jobSkills.filter((skill: string) =>
      resumeText.includes(skill.toLowerCase())
    )

    const missingSkills = jobSkills.filter((skill: string) =>
      !resumeText.includes(skill.toLowerCase())
    )

    const score = Math.min(100, (matchedSkills.length / jobSkills.length) * 100)

    return {
      score,
      matchedSkills: matchedSkills.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)),
      missingSkills: missingSkills.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    }
  }

  // Get all achievements for reuse
  const allAchievements = resumeData?.workExperience?.flatMap((exp: any) => exp.achievements || []) || []

  // 1. Tone & Style Analysis
  const analyzeToneAndStyle = (): { score: number; feedback: string } => {
    let score = 0
    const feedback: string[] = []

    // Check for action verbs in achievements (improved scoring)
    const actionVerbCount = allAchievements.filter((achievement: string) => hasActionVerbs(achievement)).length
    const actionVerbRatio = allAchievements.length > 0 ? actionVerbCount / allAchievements.length : 0

    if (actionVerbRatio >= 0.8) {
      score += 30
    } else if (actionVerbRatio >= 0.5) {
      score += 20
      feedback.push('Use action verbs in more bullet points for stronger impact')
    } else {
      score += 10
      feedback.push('Start most bullet points with strong action verbs')
    }

    // Check for quantified achievements (improved scoring)
    const quantifiedCount = allAchievements.filter((achievement: string) => hasQuantifiedAchievements(achievement)).length
    const quantifiedRatio = allAchievements.length > 0 ? quantifiedCount / allAchievements.length : 0

    if (quantifiedRatio >= 0.6) {
      score += 30
    } else if (quantifiedRatio >= 0.3) {
      score += 20
      feedback.push('Quantify more achievements with specific metrics')
    } else {
      score += 10
      feedback.push('Add numbers, percentages, and measurable results to achievements')
    }

    // Check profile summary quality (enhanced)
    const profileWordCount = countWords(resumeData?.profile || '')
    const profileText = resumeData?.profile || ''

    if (profileWordCount >= 40 && profileWordCount <= 80 && hasActionVerbs(profileText)) {
      score += 25
    } else if (profileWordCount >= 30 && profileWordCount <= 100) {
      score += 15
      feedback.push('Enhance profile summary with action verbs and specific achievements')
    } else {
      feedback.push('Optimize profile summary (40-80 words with strong action verbs)')
    }

    // Check for professional language and industry keywords
    const unprofessionalWords = ['awesome', 'amazing', 'cool', 'stuff', 'things', 'lots of', 'tons of']
    const hasUnprofessionalLanguage = unprofessionalWords.some(word =>
      profileText.toLowerCase().includes(word)
    )

    const hasIndustryTerms = hasIndustryKeywords(profileText, jobData?.industry)

    if (!hasUnprofessionalLanguage && hasIndustryTerms) {
      score += 15
    } else if (!hasUnprofessionalLanguage) {
      score += 10
      feedback.push('Include more industry-specific terminology')
    } else {
      feedback.push('Use more professional language and industry terminology')
    }

    return {
      score: Math.min(100, score),
      feedback: feedback.length > 0 ? feedback.join('. ') : 'Excellent professional tone with strong action-oriented language'
    }
  }

  // 2. Content Analysis
  const analyzeContent = (): { score: number; feedback: string } => {
    let score = 0
    const feedback: string[] = []

    // Check work experience relevance and depth
    const workExperienceCount = resumeData?.workExperience?.length || 0
    const relevanceScore = calculateRelevanceScore()

    if (workExperienceCount >= 3 && relevanceScore >= 70) {
      score += 35
    } else if (workExperienceCount >= 2 && relevanceScore >= 50) {
      score += 25
      feedback.push('Highlight more relevant experience that matches the job requirements')
    } else if (workExperienceCount >= 1) {
      score += 15
      feedback.push('Add more relevant work experience and tailor descriptions to the job')
    } else {
      feedback.push('Add relevant work experience with detailed achievements')
    }

    // Check for measurable achievements (enhanced)
    const quantifiedCount = allAchievements.filter((achievement: string) => hasQuantifiedAchievements(achievement)).length
    const totalAchievements = allAchievements.length

    if (quantifiedCount >= 5 && totalAchievements >= 8) {
      score += 35
    } else if (quantifiedCount >= 3) {
      score += 25
      feedback.push('Add more quantified achievements across all positions')
    } else if (quantifiedCount >= 1) {
      score += 15
      feedback.push('Significantly increase measurable results and specific metrics')
    } else {
      feedback.push('Include concrete numbers, percentages, and measurable outcomes')
    }

    // Check keyword matching with job (enhanced)
    const keywordMatch = calculateKeywordMatch()
    const keywordScore = Math.floor(keywordMatch.score * 0.3) // 30% weight
    score += keywordScore

    if (keywordMatch.score >= 80) {
      // Bonus for excellent keyword matching
    } else if (keywordMatch.score >= 60) {
      feedback.push(`Include these missing skills: ${keywordMatch.missingSkills.slice(0, 3).join(', ')}`)
    } else {
      feedback.push(`Critical missing keywords: ${keywordMatch.missingSkills.slice(0, 5).join(', ')}`)
    }

    return {
      score: Math.min(100, score),
      feedback: feedback.length > 0 ? feedback.join('. ') : 'Excellent content alignment with strong quantified achievements'
    }
  }

  // 3. Structure Analysis
  const analyzeStructure = (): { score: number; feedback: string } => {
    let score = 0
    const feedback: string[] = []

    // Check for essential sections
    const hasProfile = !!(resumeData?.profile?.trim())
    const hasWorkExperience = !!(resumeData?.workExperience?.length)
    const hasEducation = !!(resumeData?.education?.degree)
    const hasSkills = !!(resumeData?.technicalSkills?.languages?.length)
    const hasProjects = !!(resumeData?.projects?.length)

    const sectionCount = [hasProfile, hasWorkExperience, hasEducation, hasSkills, hasProjects].filter(Boolean).length
    score += sectionCount * 15 // 15 points per section

    // Check contact information completeness
    const contactFields = [
      resumeData?.personalInfo?.name,
      resumeData?.personalInfo?.email,
      resumeData?.personalInfo?.phone
    ].filter(field => field?.trim()).length

    score += contactFields * 5 // 5 points per contact field

    // Check for ATS-friendly formatting
    const hasConsistentDates = resumeData?.workExperience?.every((exp: any) =>
      exp.startDate && (exp.endDate || exp.current)
    )

    if (hasConsistentDates) {
      score += 10
    } else {
      feedback.push('Ensure all work experience has consistent date formatting')
    }

    // Deduct points for common ATS issues
    if (!hasSkills) {
      feedback.push('Add a dedicated technical skills section')
    }

    if (!hasProjects) {
      feedback.push('Consider adding relevant projects')
    }

    return {
      score: Math.min(100, score),
      feedback: feedback.length > 0 ? feedback.join('. ') : 'Well-structured resume with clear sections'
    }
  }

  // 4. Skills Analysis
  const analyzeSkills = (): { score: number; feedback: string } => {
    let score = 0
    const feedback: string[] = []

    // Check technical skills coverage and organization
    const skillCategories = [
      resumeData?.technicalSkills?.languages?.length || 0,
      resumeData?.technicalSkills?.frontend?.length || 0,
      resumeData?.technicalSkills?.backend?.length || 0,
      resumeData?.technicalSkills?.devTools?.length || 0
    ]

    const totalSkills = skillCategories.reduce((sum, count) => sum + count, 0)
    const categoriesWithSkills = skillCategories.filter(count => count > 0).length

    // Score based on total skills and organization
    if (totalSkills >= 20 && categoriesWithSkills >= 3) {
      score += 40
    } else if (totalSkills >= 15 && categoriesWithSkills >= 2) {
      score += 30
      feedback.push('Consider organizing skills into more categories for better ATS parsing')
    } else if (totalSkills >= 10) {
      score += 20
      feedback.push('Expand technical skills and organize into clear categories')
    } else {
      feedback.push('Significantly expand your technical skills section with organized categories')
    }

    // Check job-specific skills matching (enhanced)
    const keywordMatch = calculateKeywordMatch()
    const skillMatchScore = Math.floor(keywordMatch.score * 0.6) // 60% weight
    score += skillMatchScore

    // Provide specific feedback based on skill matching
    if (keywordMatch.score >= 85) {
      // Excellent match, no additional feedback needed
    } else if (keywordMatch.score >= 70) {
      feedback.push(`Consider adding: ${keywordMatch.missingSkills.slice(0, 2).join(', ')}`)
    } else if (keywordMatch.score >= 50) {
      feedback.push(`Important missing skills: ${keywordMatch.missingSkills.slice(0, 4).join(', ')}`)
    } else {
      feedback.push(`Critical skills gap - add: ${keywordMatch.missingSkills.slice(0, 6).join(', ')}`)
    }

    // Check for skill depth indicators
    const hasSkillLevels = resumeData?.technicalSkills?.languages?.some((skill: string) =>
      skill.includes('(') || skill.includes('Advanced') || skill.includes('Intermediate')
    )

    if (hasSkillLevels) {
      score += 10
    } else {
      feedback.push('Consider indicating proficiency levels for key skills')
    }

    return {
      score: Math.min(100, score),
      feedback: feedback.length > 0 ? feedback.join('. ') : 'Excellent skills alignment with comprehensive technical coverage'
    }
  }

  // Calculate individual scores
  const toneAndStyle = analyzeToneAndStyle()
  const content = analyzeContent()
  const structure = analyzeStructure()
  const skills = analyzeSkills()

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (toneAndStyle.score * 0.2) +
    (content.score * 0.3) +
    (structure.score * 0.25) +
    (skills.score * 0.25)
  )

  // Enhanced ATS Compatibility Checks
  const keywordMatchResult = calculateKeywordMatch()

  const atsChecks = [
    {
      item: "Contact information complete",
      status: (resumeData?.personalInfo?.name && resumeData?.personalInfo?.email && resumeData?.personalInfo?.phone) ? 'pass' : 'warning',
      icon: (resumeData?.personalInfo?.name && resumeData?.personalInfo?.email && resumeData?.personalInfo?.phone) ? 'check' : 'warning'
    },
    {
      item: "Keywords match job requirements",
      status: keywordMatchResult.score >= 70 ? 'pass' : keywordMatchResult.score >= 50 ? 'warning' : 'fail',
      icon: keywordMatchResult.score >= 70 ? 'check' : keywordMatchResult.score >= 50 ? 'warning' : 'x'
    },
    {
      item: "Technical skills section present",
      status: (resumeData?.technicalSkills?.languages?.length || 0) >= 3 ? 'pass' : 'warning',
      icon: (resumeData?.technicalSkills?.languages?.length || 0) >= 3 ? 'check' : 'warning'
    },
    {
      item: "Quantified achievements included",
      status: allAchievements.some((achievement: string) => hasQuantifiedAchievements(achievement)) ? 'pass' : 'warning',
      icon: allAchievements.some((achievement: string) => hasQuantifiedAchievements(achievement)) ? 'check' : 'warning'
    },
    {
      item: "Professional summary present",
      status: (resumeData?.profile?.trim()?.length || 0) >= 100 ? 'pass' : 'warning',
      icon: (resumeData?.profile?.trim()?.length || 0) >= 100 ? 'check' : 'warning'
    },
    {
      item: "Work experience with achievements",
      status: (resumeData?.workExperience?.length || 0) > 0 && allAchievements.length >= 3 ? 'pass' : 'warning',
      icon: (resumeData?.workExperience?.length || 0) > 0 && allAchievements.length >= 3 ? 'check' : 'warning'
    }
  ]

  const passCount = atsChecks.filter(check => check.status === 'pass').length
  const warningCount = atsChecks.filter(check => check.status === 'warning').length
  const atsScore = Math.round((passCount + (warningCount * 0.5)) / atsChecks.length * 100)

  // Generate comprehensive improvement checklist
  const improvementChecklist: string[] = []

  // Keyword optimization
  if (keywordMatchResult.score < 70) {
    improvementChecklist.push(`Add missing keywords: ${keywordMatchResult.missingSkills.slice(0, 3).join(', ')}`)
  }

  // Achievement quantification
  const quantifiedRatio = allAchievements.length > 0 ?
    allAchievements.filter((achievement: string) => hasQuantifiedAchievements(achievement)).length / allAchievements.length : 0

  if (quantifiedRatio < 0.5) {
    improvementChecklist.push('Quantify at least 50% of achievements with specific metrics')
  }

  // Technical skills expansion
  const totalSkills = [
    resumeData?.technicalSkills?.languages?.length || 0,
    resumeData?.technicalSkills?.frontend?.length || 0,
    resumeData?.technicalSkills?.backend?.length || 0,
    resumeData?.technicalSkills?.devTools?.length || 0
  ].reduce((sum, count) => sum + count, 0)

  if (totalSkills < 12) {
    improvementChecklist.push('Expand technical skills to at least 12 relevant technologies')
  }

  // Action verbs usage
  const actionVerbRatio = allAchievements.length > 0 ?
    allAchievements.filter((achievement: string) => hasActionVerbs(achievement)).length / allAchievements.length : 0

  if (actionVerbRatio < 0.7) {
    improvementChecklist.push('Start 70% of bullet points with strong action verbs')
  }

  // Profile summary optimization
  const profileWordCount = countWords(resumeData?.profile || '')
  if (profileWordCount < 40 || profileWordCount > 80) {
    improvementChecklist.push('Optimize profile summary to 40-80 words with key achievements')
  }

  // Work experience depth
  if ((resumeData?.workExperience?.length || 0) < 2) {
    improvementChecklist.push('Add more relevant work experience positions')
  }

  // Contact information completeness
  if (!resumeData?.personalInfo?.phone || !resumeData?.personalInfo?.email) {
    improvementChecklist.push('Complete contact information (phone, email, location)')
  }

  // Industry relevance
  if (calculateRelevanceScore() < 60) {
    improvementChecklist.push('Tailor experience descriptions to better match the job requirements')
  }

  return {
    overallScore,
    scoreBreakdown: {
      toneAndStyle: {
        score: toneAndStyle.score,
        status: getStatus(toneAndStyle.score),
        feedback: toneAndStyle.feedback
      },
      content: {
        score: content.score,
        status: getStatus(content.score),
        feedback: content.feedback
      },
      structure: {
        score: structure.score,
        status: getStatus(structure.score),
        feedback: structure.feedback
      },
      skills: {
        score: skills.score,
        status: getStatus(skills.score),
        feedback: skills.feedback
      }
    },
    improvementChecklist,
    atsCompatibility: {
      score: atsScore,
      status: getStatus(atsScore),
      checks: atsChecks as any,
      description: "Your resume was analyzed using enhanced ATS criteria including keyword matching, formatting, and content quality.",
      improvementTip: atsScore >= 80 ? "Excellent ATS compatibility! Minor optimizations can push you to perfection." :
        atsScore >= 60 ? "Good foundation. Focus on areas marked as 'warning' for better ATS performance." :
          "Significant improvements needed. Address all 'warning' and 'fail' items to improve ATS compatibility."
    },
    keywordAnalysis: {
      matchedSkills: keywordMatchResult.matchedSkills,
      missingSkills: keywordMatchResult.missingSkills,
      matchPercentage: Math.round(keywordMatchResult.score)
    },
    relevanceScore: Math.round(calculateRelevanceScore())
  }
}