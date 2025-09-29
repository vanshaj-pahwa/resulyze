"use client";

import { Card, CardContent } from "@/components/ui/card";

interface ResumePreviewProps {
  resumeData: any;
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  if (!resumeData.personalInfo.name && !resumeData.profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">No resume data available.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div
          className="resume-preview bg-white text-black"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "11px",
            lineHeight: "1.2",
          }}
        >
          {/* Header */}
          {(resumeData.personalInfo.name ||
            resumeData.personalInfo.phone ||
            resumeData.personalInfo.email ||
            resumeData.personalInfo.linkedin ||
            resumeData.personalInfo.github) && (
            <>
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold mb-2">
                  {resumeData.personalInfo.name}
                </h1>
                <div className="text-sm text-blue-600">
                  {resumeData.personalInfo.phone} |{" "}
                  {resumeData.personalInfo.email} |{" "}
                  {resumeData.personalInfo.linkedin} |{" "}
                  {resumeData.personalInfo.github}
                </div>
              </div>

              <hr className="border-black mb-4" />
            </>
          )}

          {/* Profile */}
          {resumeData.profile && (
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">PROFILE</h2>
              <p className="text-xs leading-relaxed">{resumeData.profile}</p>
            </div>
          )}

          {/* Technical Skills */}
          {resumeData.technicalSkills.languages.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">TECHNICAL SKILLS</h2>
              <div className="text-xs space-y-1">
                {resumeData.technicalSkills.languages &&
                  resumeData.technicalSkills.languages.length > 0 && (
                    <div>
                      <strong>Languages:</strong>{" "}
                      {resumeData.technicalSkills.languages.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.frontend &&
                  resumeData.technicalSkills.frontend.length > 0 && (
                    <div>
                      <strong>Frontend Frameworks/Technologies:</strong>{" "}
                      {resumeData.technicalSkills.frontend.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.backend &&
                  resumeData.technicalSkills.backend.length > 0 && (
                    <div>
                      <strong>Backend Technologies:</strong>{" "}
                      {resumeData.technicalSkills.backend.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.devTools &&
                  resumeData.technicalSkills.devTools.length > 0 && (
                    <div>
                      <strong>Dev Tools:</strong>{" "}
                      {resumeData.technicalSkills.devTools.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.other &&
                  resumeData.technicalSkills.other.length > 0 && (
                    <div>
                      <strong>Other:</strong>{" "}
                      {resumeData.technicalSkills.other.join(", ")}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {resumeData.workExperience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">WORK EXPERIENCE</h2>
              {resumeData.workExperience.map((exp: any, index: number) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <strong className="text-xs">{exp.title}</strong> |{" "}
                      {exp.company}
                    </div>
                    <div className="text-xs">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </div>
                  </div>
                  <div className="text-xs italic mb-1">{exp.location}</div>
                  <ul className="text-xs space-y-1 ml-4">
                    {exp.achievements.map(
                      (achievement: string, achIndex: number) => (
                        <li key={achIndex} className="list-disc">
                          {achievement}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {(resumeData.education.degree ||
            resumeData.education.institution) && (
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">EDUCATION</h2>
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs">
                  <strong>{resumeData.education.degree}</strong> |{" "}
                  {resumeData.education.institution}
                </div>
                <div className="text-xs">
                  {resumeData.education.graduationDate}
                </div>
              </div>
              <div className="text-xs italic">
                {resumeData.education.location} | GPA:{" "}
                {resumeData.education.gpa}
              </div>
            </div>
          )}

          {/* Projects */}
          {resumeData.projects.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">PROJECTS</h2>
              {resumeData.projects.map((project: any, index: number) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs">
                      <strong>{project.name}</strong> – {project.technologies}
                    </div>
                    <div className="text-xs text-blue-600">
                      {project.githubUrl}
                    </div>
                  </div>
                  <ul className="text-xs space-y-1 ml-4">
                    {project.achievements &&
                      project.achievements.map(
                        (achievement: string, achIndex: number) => (
                          <li key={achIndex} className="list-disc">
                            {achievement}
                          </li>
                        )
                      )}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {resumeData.achievements.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-2">
                ACHIEVEMENTS AND CERTIFICATIONS
              </h2>
              <ul className="text-xs space-y-1 list-disc ml-4">
                {resumeData.achievements.map(
                  (achievement: string, index: number) => (
                    <li key={index}>{achievement}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
