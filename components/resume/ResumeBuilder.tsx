"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Download,
  Plus,
  Trash2,
  AlertCircle,
  Target,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import ResumePreview from "./ResumePreview";
import ATSScore from "./ATSScore";
import ResumeTabsNav from "./ResumeTabsNav";

interface ResumeBuilderProps {
  readonly jobData: any;
  readonly onResumeDataChange: (data: any) => void;
}

interface WorkExperience {
  id: string;
  position: string; // Changed from title to position to match backend model
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
}

interface Project {
  id: string;
  name: string;
  technologies: string;
  description: string;
  achievements: string[];
  githubUrl?: string;
}

interface ResumeData {
  personalInfo: {
    name: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
    location: string;
  };
  profile: string;
  technicalSkills: {
    languages: string[];
    frontend: string[];
    backend: string[];
    devTools: string[];
    other: string[];
  };
  workExperience: WorkExperience[];
  education: {
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  };
  projects: Project[];
  achievements: string[];
}

export default function ResumeBuilder({
  jobData,
  onResumeDataChange,
}: Readonly<ResumeBuilderProps>) {
  const { user } = useUser();
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      phone: "",
      email: "",
      linkedin: "",
      github: "",
      location: "",
    },
    profile: "",
    technicalSkills: {
      languages: [],
      frontend: [],
      backend: [],
      devTools: [],
      other: [],
    },
    workExperience: [],
    education: {
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      gpa: "",
    },
    projects: [],
    achievements: [],
  });
  const [isParsing, setIsParsing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCalculatingATS, setIsCalculatingATS] = useState(false);
  const [atsData, setAtsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadBanner, setShowUploadBanner] = useState(false);
  
  // Alert dialog states
  const [alertInfo, setAlertInfo] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
    action?: string;
  }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
    details: '',
    action: ''
  });
  
  // Helper function to show alert dialogs
  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, details?: string) => {
    const actionLabels = {
      'success': 'Great!',
      'error': 'Try Again',
      'warning': 'Got it',
      'info': 'OK'
    };
    
    setAlertInfo({
      open: true,
      type,
      title,
      message,
      details,
      action: actionLabels[type]
    });
    
    // Auto hide after 5 seconds for success messages only
    if (type === 'success') {
      setTimeout(() => {
        setAlertInfo(prev => ({ ...prev, open: false }));
      }, 5000);
    }
  };

  useEffect(() => {
    const loadResumeData = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/user/resume");
        if (response.ok) {
          const result = await response.json();
          if (result && !result.error) {
            // Ensure each work experience has a unique ID
            if (result.workExperience && Array.isArray(result.workExperience)) {
              result.workExperience = result.workExperience.map((exp: any) => ({
                ...exp,
                id: exp.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
              }));
            }
            setResumeData(result);
          } else if (result.fallback) {
            try {
              const localData = localStorage.getItem(`resume_${user.id}`);
              if (localData) {
                const parsedData = JSON.parse(localData);
                // Ensure each work experience has a unique ID
                if (parsedData.workExperience && Array.isArray(parsedData.workExperience)) {
                  parsedData.workExperience = parsedData.workExperience.map((exp: any) => ({
                    ...exp,
                    id: exp.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
                  }));
                }
                setResumeData(parsedData);
              }
            } catch (localError) {
              console.error("Failed to load from localStorage:", localError);
            }
          }
        }
      } catch (error) {
        console.error("Error loading resume data:", error);
        if (typeof window !== "undefined") {
          try {
            const localData = localStorage.getItem(`resume_${user.id}`);
            if (localData) {
              const parsedData = JSON.parse(localData);
              // Ensure each work experience has a unique ID
              if (parsedData.workExperience && Array.isArray(parsedData.workExperience)) {
                parsedData.workExperience = parsedData.workExperience.map((exp: any) => ({
                  ...exp,
                  id: exp.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
                }));
              }
              setResumeData(parsedData);
            }
          } catch (localError) {
            console.error("Failed to load from localStorage:", localError);
          }
        }
      } finally {
        setIsLoading(false);
        
        // Check if we should show the upload banner (no resume data yet)
        if (user) {
          try {
            const hasSeenUploadBanner = localStorage.getItem(`upload_banner_seen_${user.id}`);
            if (!hasSeenUploadBanner) {
              setShowUploadBanner(true);
              // Mark as seen after 10 seconds
              setTimeout(() => {
                localStorage.setItem(`upload_banner_seen_${user.id}`, 'true');
                setShowUploadBanner(false);
              }, 10000);
            }
          } catch (error) {
            console.error("Error checking local storage:", error);
          }
        }
      }
    };

    loadResumeData();
  }, [user]);

  const saveResumeData = useCallback(
    async (data: ResumeData) => {
      if (!user || isLoading || !data) return;

      setIsSaving(true);
      try {
        const response = await fetch("/api/user/resume", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.fallback) {
          console.warn(
            "Using fallback storage:",
            result.message || "Data saved locally"
          );
          
          // Store in localStorage as fallback
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(`resume_${user.id}`, JSON.stringify(data));
            } catch (localError) {
              console.error("Failed to save to localStorage:", localError);
              showAlert('warning', 'Partial Save', 'Your resume was saved locally but not to the cloud.', 'Changes may not persist across devices.');
            }
          }
        } else if (result.success) {
          // Only show save success alert for manual saves, not auto-saves
          // We don't want to display this every time auto-save happens
          if (data !== resumeData) {
            showAlert('success', 'Resume Saved', 'Your resume has been saved successfully.');
          }
        }
      } catch (error) {
        console.error("Error saving resume data:", error);
        
        // Attempt localStorage fallback
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`resume_${user.id}`, JSON.stringify(data));
            showAlert('warning', 'Offline Save', 'Your resume was saved locally.', 'Changes may not be accessible from other devices until you reconnect.');
          } catch (localError) {
            console.error("Failed to save to localStorage:", localError);
            showAlert('error', 'Save Failed', 'Failed to save your resume.', 'Please check your internet connection and try again.');
          }
        }
      } finally {
        setIsSaving(false);
      }
    },
    [user, isLoading, resumeData]
  );

  useEffect(() => {
    if (resumeData) {
      onResumeDataChange(resumeData);
      const timeoutId = setTimeout(() => {
        saveResumeData(resumeData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, onResumeDataChange, saveResumeData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  const getMissingRequirements = () => {
    const missing: string[] = [];
    if (!jobData) missing.push("Job Description Analysis");
    return missing;
  };

  const getTooltipMessage = () => {
    const missing = getMissingRequirements();
    if (missing.length === 0) return "";
    return `Please complete: ${missing.join(" and ")}`;
  };

  const optimizeResume = async () => {
    if (!jobData) {
      showAlert('warning', 'Job Analysis Required', 'Please analyze a job description first.');
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jobData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const optimizedData = await response.json();
      
      // Save the optimized resume to the database
      await saveResumeData(optimizedData);
      
      // Update the state
      setResumeData(optimizedData);
      
      // Show success message
      showAlert(
        'success',
        'Resume Optimized!',
        'Your resume has been optimized for the job description and saved.',
        'The resume now better highlights relevant skills and experience for the target position.'
      );
    } catch (error) {
      console.error("Error optimizing resume:", error);
      showAlert(
        'error',
        'Optimization Failed',
        'Failed to optimize your resume.',
        'Please try again or optimize manually based on the job description.'
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const calculateATSScore = async () => {
    if (!jobData || !resumeData) {
      showAlert('warning', 'Missing Information', 'Please complete job analysis and resume first.');
      return;
    }

    setIsCalculatingATS(true);
    try {
      const response = await fetch("/api/calculate-ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobData, resumeData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('data:', data);

      if (data.error) {
        setAtsData({ error: data.error });
        showAlert('error', 'ATS Score Calculation Failed', data.error);
      } else {
        setAtsData(data);
        
        // Show success alert with score information
        const score = data.overallScore || 0;
        let scoreMessage = '';
        
        if (score >= 80) {
          scoreMessage = 'Excellent match! Your resume is well optimized for this job.';
        } else if (score >= 60) {
          scoreMessage = 'Good match. Consider making minor improvements to your resume.';
        } else {
          scoreMessage = 'Your resume may need significant improvements to pass ATS systems.';
        }
        
        showAlert(
          'success',
          'ATS Score Calculated',
          scoreMessage,
          `Score: ${score}/100. See the ATS Score tab for detailed feedback.`
        );
      }

      setActiveTab("ats-score");
    } catch (error) {
      console.error("Error calculating ATS score:", error);
      setAtsData({
        error:
          "The AI service is currently unavailable. Please try again in a few moments.",
      });
      showAlert('error', 'ATS Score Calculation Failed', 'The AI service is currently unavailable.', 'Please try again in a few moments.');
      setActiveTab("ats-score");
    } finally {
      setIsCalculatingATS(false);
    }
  };

  const improveWithAI = async () => {
    await optimizeResume();
    if (atsData) {
      await calculateATSScore();
    }
  };

  const addWorkExperience = () => {
    // Generate a more robust unique ID by combining timestamp and random string
    const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newExp: WorkExperience = {
      id: uniqueId,
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      achievements: [""],
    };
    setResumeData((prev) => ({
      ...prev!,
      workExperience: [...prev!.workExperience, newExp],
    }));
  };

  const updateWorkExperience = (
    id: string,
    field: keyof WorkExperience,
    value: any
  ) => {
    console.log(`Updating work experience ${id}, field: ${field}, value: ${value}`);
    
    setResumeData((prev) => {
      // Make sure each work experience has a unique id
      const updatedWorkExperiences = prev!.workExperience.map((exp) => {
        if (exp.id === id) {
          console.log(`Found match for ID: ${id}`);
          return { ...exp, [field]: value };
        }
        return exp;
      });
      
      return {
        ...prev!,
        workExperience: updatedWorkExperiences,
      };
    });
  };

  const addProject = () => {
    // Generate a more robust unique ID by combining timestamp and random string
    const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newProject: Project = {
      id: uniqueId,
      name: "",
      technologies: "",
      description: "",
      achievements: [""],
    };
    setResumeData((prev) => ({
      ...prev!,
      projects: [...prev!.projects, newProject],
    }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['pdf', 'docx'].includes(fileExt)) {
      showAlert('error', 'Invalid File Type', 'Please upload a PDF or DOCX file.');
      return;
    }
    
    const formData = new FormData();
    formData.append("resumeFile", file);
    
    // Show loading state
    setIsParsing(true);
    
    try {
      // We no longer need to confirm - we'll just replace and save the previous version automatically
      // This simplifies the flow and we'll handle it in the backend
      
      // Add a timeout to prevent hanging on large files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      let response;
      try {
        response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error("Error uploading resume:", fetchError);
        showAlert('error', 'Upload Failed', 'Failed to upload resume.', 'Please try again with a smaller file or different format.');
        setIsParsing(false);
        return;
      }
        
      
      if (response.ok) {
        const parsedData = await response.json();
        
        // Validate and ensure data structure is complete
        const validatedData = {
          ...resumeData, // Start with current data as base
          ...parsedData,  // Merge with parsed data
          personalInfo: {
            ...resumeData.personalInfo,
            ...parsedData.personalInfo || {},
          },
          technicalSkills: {
            ...resumeData.technicalSkills,
            ...parsedData.technicalSkills || {},
            languages: parsedData.technicalSkills?.languages || [],
            frontend: parsedData.technicalSkills?.frontend || [],
            backend: parsedData.technicalSkills?.backend || [],
            devTools: parsedData.technicalSkills?.devTools || [],
            other: parsedData.technicalSkills?.other || [],
          },
        };
        
        // Ensure work experience array exists and has unique IDs
        if (parsedData.workExperience && Array.isArray(parsedData.workExperience)) {
          validatedData.workExperience = parsedData.workExperience.map((exp: any) => ({
            position: exp.position || "",
            company: exp.company || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: exp.current || false,
            achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }));
        }
        
        // Ensure projects array exists and has unique IDs
        if (parsedData.projects && Array.isArray(parsedData.projects)) {
          validatedData.projects = parsedData.projects.map((proj: any) => ({
            name: proj.name || "",
            description: proj.description || "",
            technologies: Array.isArray(proj.technologies) ? proj.technologies : 
              (typeof proj.technologies === 'string' ? proj.technologies : ""),
            achievements: Array.isArray(proj.achievements) ? proj.achievements : [],
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }));
        }
        
        // Update achievements format if needed
        if (parsedData.achievements && Array.isArray(parsedData.achievements)) {
          // Filter out empty achievements
          validatedData.achievements = parsedData.achievements
            .filter((ach: string) => ach && ach.trim().length > 0);
        }
        
        // Set the validated data
        setResumeData(validatedData);
        
        // Show success message with extracted info
        const extractedFields = [
          validatedData.personalInfo?.name && `Name: ${validatedData.personalInfo.name}`,
          validatedData.workExperience?.length > 0 && `Work Experience: ${validatedData.workExperience.length} entries`,
          validatedData.education?.degree && `Education: ${validatedData.education.degree}`,
          validatedData.technicalSkills?.languages?.length > 0 && `Skills: ${validatedData.technicalSkills.languages.length} languages found`
        ].filter(Boolean).join('\n');
        
        // Save the parsed resume data to the database
        await saveResumeData(validatedData);
        
        // Check if there was a warning message
        if (parsedData.warning) {
          showAlert(
            'warning', 
            'Resume Parsed with Limited Information', 
            parsedData.warning, 
            'We\'ve populated the form with sample data. Please review and edit as needed.'
          );
        } else {
          showAlert(
            'success', 
            'Resume Parsed Successfully!', 
            'Your resume has been parsed and saved.', 
            `Extracted information includes:\n${extractedFields}`
          );
        }
      } else {
        const errorData = await response.json();
        
        // Show detailed error with suggestions if available
        if (errorData.suggestions && Array.isArray(errorData.suggestions)) {
          showAlert(
            'error', 
            'Resume Parsing Failed', 
            errorData.error || 'Unknown error', 
            `Suggestions:\n${errorData.suggestions.join('\n')}`
          );
        } else {
          showAlert(
            'error', 
            'Resume Parsing Failed', 
            errorData.error || 'Unknown error'
          );
        }
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      showAlert(
        'error', 
        'Resume Parsing Failed', 
        'Failed to parse resume.', 
        'Please try again or enter details manually.'
      );
    } finally {
      setIsParsing(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const downloadResume = async (format: "pdf" | "docx") => {
    try {
      // Show loading alert
      showAlert('info', 'Preparing Download', `Generating your ${format.toUpperCase()} resume...`);
      
      const response = await fetch("/api/download-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, format }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success alert
      showAlert('success', 'Download Started', `Your ${format.toUpperCase()} resume is downloading.`);
    } catch (error) {
      console.error("Error downloading resume:", error);
      showAlert('error', 'Download Failed', `Failed to generate ${format.toUpperCase()} resume.`, 'Please try again or check your resume data for completeness.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Dialog */}
      <AlertDialog open={alertInfo.open} onOpenChange={(open: boolean) => setAlertInfo(prev => ({ ...prev, open }))}>
        <AlertDialogContent type={alertInfo.type}>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertInfo.title}</AlertDialogTitle>
            <AlertDialogDescription>
              <p>{alertInfo.message}</p>
              {alertInfo.details && (
                <div className="mt-2 text-sm whitespace-pre-line">
                  {alertInfo.details}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-2">
            <AlertDialogCancel className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            {alertInfo.action && (
              <AlertDialogAction
                className={
                  alertInfo.type === 'success' ? 'px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700' :
                  alertInfo.type === 'error' ? 'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700' :
                  alertInfo.type === 'warning' ? 'px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700' :
                  'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
                }
              >
                {alertInfo.action}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSaving && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Saving changes...</span>
        </div>
      )}

      {isParsing && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Parsing resume...</span>
        </div>
      )}
      
      {showUploadBanner && !resumeData?.personalInfo?.name && (
        <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">
              <strong>Pro tip:</strong> Save time by uploading your existing resume in PDF or DOCX format!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-700 border-green-300 hover:bg-green-100"
              onClick={() => document.getElementById("resume-upload")?.click()}
            >
              Upload Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowUploadBanner(false);
                if (user) {
                  localStorage.setItem(`upload_banner_seen_${user.id}`, 'true');
                }
              }}
            >
              &times;
            </Button>
          </div>
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

      {/* Button section with responsive layout */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Mobile view - stacked buttons */}
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full max-w-[320px] flex items-center justify-center h-10"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">{resumeData?.personalInfo?.name ? "Replace Resume" : "Upload Resume"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload a PDF or DOCX resume to automatically fill the form</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-full max-w-[320px] h-10"
                  onClick={optimizeResume}
                  disabled={isOptimizing || !jobData}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 flex-shrink-0 animate-spin" />
                      <span className="whitespace-nowrap">Optimizing...</span>
                    </>
                  ) : (
                    <span className="whitespace-nowrap">AI Optimize Resume</span>
                  )}
                </Button>
              </TooltipTrigger>
              {!jobData && (
                <TooltipContent>
                  <p>{getTooltipMessage()}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={calculateATSScore}
                  disabled={isCalculatingATS || !jobData || !resumeData}
                  variant="outline"
                  className="w-full max-w-[320px] h-10 flex items-center justify-center"
                >
                  {isCalculatingATS ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 flex-shrink-0 animate-spin" />
                      <span className="whitespace-nowrap">Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="whitespace-nowrap">Calculate ATS Score</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {!jobData && (
                <TooltipContent>
                  <p>{getTooltipMessage()}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => downloadResume("pdf")} 
            className="w-36 flex items-center justify-center h-10 px-2"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap text-sm">Download PDF</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => downloadResume("docx")} 
            className="w-36 flex items-center justify-center h-10 px-2"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap text-sm">Download DOCX</span>
          </Button>
        </div>
      </div>
      
      {/* Desktop view - inline buttons with left and right aligned groups */}
      <div className="hidden sm:flex sm:justify-between sm:items-center sm:mb-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center h-10"
                  onClick={() => document.getElementById("resume-upload-desktop")?.click()}
                >
                  <input
                    id="resume-upload-desktop"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">{resumeData?.personalInfo?.name ? "Replace Resume" : "Upload Resume"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload a PDF or DOCX resume to automatically fill the form</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-10"
                  onClick={optimizeResume}
                  disabled={isOptimizing || !jobData}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 flex-shrink-0 animate-spin" />
                      <span className="whitespace-nowrap">Optimizing...</span>
                    </>
                  ) : (
                    <span className="whitespace-nowrap">AI Optimize Resume</span>
                  )}
                </Button>
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
                <Button
                  onClick={calculateATSScore}
                  disabled={isCalculatingATS || !jobData || !resumeData}
                  variant="outline"
                  className="h-10 flex items-center justify-center"
                >
                  {isCalculatingATS ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 flex-shrink-0 animate-spin" />
                      <span className="whitespace-nowrap">Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="whitespace-nowrap">Calculate ATS Score</span>
                    </>
                  )}
                </Button>
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
          <Button 
            variant="outline" 
            onClick={() => downloadResume("pdf")} 
            className="flex items-center h-10"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Download PDF</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => downloadResume("docx")} 
            className="flex items-center h-10"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Download DOCX</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            {/* Import and use our custom ResumeTabsNav component */}
            <ResumeTabsNav 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              atsData={atsData}
            />

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={resumeData?.personalInfo?.name ?? ""}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev!,
                        personalInfo: {
                          ...prev!.personalInfo,
                          name: e.target.value,
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={resumeData?.personalInfo.phone}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev!,
                        personalInfo: {
                          ...prev!.personalInfo,
                          phone: e.target.value,
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Email"
                    value={resumeData?.personalInfo.email}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev!,
                        personalInfo: {
                          ...prev!.personalInfo,
                          email: e.target.value,
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={resumeData?.personalInfo.linkedin}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev!,
                        personalInfo: {
                          ...prev!.personalInfo,
                          linkedin: e.target.value,
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="GitHub URL"
                    value={resumeData?.personalInfo.github}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev!,
                        personalInfo: {
                          ...prev!.personalInfo,
                          github: e.target.value,
                        },
                      }))
                    }
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
                    value={resumeData?.profile}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev!,
                        profile: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              {resumeData?.workExperience.map((exp, index) => (
                <Card key={exp.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      Work Experience {index + 1}
                      {resumeData?.workExperience.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setResumeData((prev) => ({
                              ...prev!,
                              workExperience: prev!.workExperience.filter(
                                (e) => e.id !== exp.id
                              ),
                            }))
                          }
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
                        value={exp.position}
                        onChange={(e) =>
                          updateWorkExperience(exp.id, "position", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) =>
                          updateWorkExperience(
                            exp.id,
                            "company",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) =>
                        updateWorkExperience(exp.id, "location", e.target.value)
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) =>
                          updateWorkExperience(
                            exp.id,
                            "startDate",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) =>
                          updateWorkExperience(
                            exp.id,
                            "endDate",
                            e.target.value
                          )
                        }
                        disabled={exp.current}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Achievements
                      </label>
                      {exp.achievements &&
                        exp.achievements.map((achievement, achIndex) => (
                          <Textarea
                            key={achIndex}
                            placeholder="Achievement or responsibility..."
                            value={achievement}
                            onChange={(e) => {
                              const newAchievements = [...exp.achievements];
                              newAchievements[achIndex] = e.target.value;
                              updateWorkExperience(
                                exp.id,
                                "achievements",
                                newAchievements
                              );
                            }}
                            rows={2}
                          />
                        ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateWorkExperience(exp.id, "achievements", [
                            ...exp.achievements,
                            "",
                          ])
                        }
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
                    <label className="text-sm font-medium mb-2 block">
                      Languages
                    </label>
                    <Input
                      placeholder="Java, JavaScript, Python..."
                      value={resumeData?.technicalSkills.languages.join(", ")}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev!,
                          technicalSkills: {
                            ...prev!.technicalSkills,
                            languages: e.target.value
                              .split(", ")
                              .filter((s) => s.trim()),
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Frontend Technologies
                    </label>
                    <Input
                      placeholder="React, Vue, Angular..."
                      value={resumeData?.technicalSkills.frontend.join(", ")}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev!,
                          technicalSkills: {
                            ...prev!.technicalSkills,
                            frontend: e.target.value
                              .split(", ")
                              .filter((s) => s.trim()),
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Backend Technologies
                    </label>
                    <Input
                      placeholder="Spring Boot, Node.js, Django..."
                      value={resumeData?.technicalSkills.backend.join(", ")}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev!,
                          technicalSkills: {
                            ...prev!.technicalSkills,
                            backend: e.target.value
                              .split(", ")
                              .filter((s) => s.trim()),
                          },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              {resumeData?.projects.map((project, index) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      Project {index + 1}
                      {resumeData?.projects.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setResumeData((prev) => ({
                              ...prev!,
                              projects: prev!.projects.filter(
                                (p) => p.id !== project.id
                              ),
                            }))
                          }
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
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev!,
                          projects: prev!.projects.map((p) =>
                            p.id === project.id
                              ? { ...p, name: e.target.value }
                              : p
                          ),
                        }))
                      }
                    />
                    <Input
                      placeholder="Technologies Used"
                      value={project.technologies}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev!,
                          projects: prev!.projects.map((p) =>
                            p.id === project.id
                              ? { ...p, technologies: e.target.value }
                              : p
                          ),
                        }))
                      }
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Achievements
                      </label>
                      {project.achievements &&
                        project.achievements.map((achievement, achIndex) => (
                          <Textarea
                            key={achIndex}
                            placeholder="Project achievement or feature..."
                            value={achievement}
                            onChange={(e) => {
                              const newAchievements = [...project.achievements];
                              newAchievements[achIndex] = e.target.value;
                              setResumeData((prev) => ({
                                ...prev!,
                                projects: prev!.projects.map((p) =>
                                  p.id === project.id
                                    ? { ...p, achievements: newAchievements }
                                    : p
                                ),
                              }));
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
  );
}