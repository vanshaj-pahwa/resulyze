"use client";

import { Card, CardContent } from "@/components/ui/card";

interface ResumePreviewProps {
  readonly resumeData: any;
}

export default function ResumePreview({ resumeData }: Readonly<ResumePreviewProps>) {
  if (!resumeData.personalInfo.name && !resumeData.profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">No resume data available.</CardContent>
      </Card>
    );
  }

  const resumeStyles = {
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    lineHeight: "1.2",
  };

  const headingStyles = {
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
  };
  
  const strongStyles = {
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
          <div
          className="resume-preview bg-white text-black"
          style={resumeStyles}
        >
          {/* Header */}
          {(resumeData.personalInfo.name ||
            resumeData.personalInfo.phone ||
            resumeData.personalInfo.email ||
            resumeData.personalInfo.linkedin ||
            resumeData.personalInfo.github) && (
            <>
              <div className="text-center mb-4">
                <h1 className="text-2xl mb-2" style={headingStyles}>
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
          )}          {/* Profile */}
          {resumeData.profile && (
            <div className="mb-4">
              <h2 className="text-sm mb-2" style={headingStyles}>PROFILE</h2>
              <p className="text-xs leading-relaxed text-justify">{resumeData.profile}</p>
            </div>
          )}

          {/* Technical Skills */}
          {resumeData.technicalSkills.languages.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm mb-2" style={headingStyles}>TECHNICAL SKILLS</h2>
              <div className="text-xs space-y-1">
                {resumeData.technicalSkills.languages &&
                  resumeData.technicalSkills.languages.length > 0 && (
                    <div className="text-justify">
                      <strong style={strongStyles}>Languages:</strong>{" "}
                      {resumeData.technicalSkills.languages.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.frontend &&
                  resumeData.technicalSkills.frontend.length > 0 && (
                    <div className="text-justify">
                      <strong style={strongStyles}>Frontend Frameworks/Technologies:</strong>{" "}
                      {resumeData.technicalSkills.frontend.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.backend &&
                  resumeData.technicalSkills.backend.length > 0 && (
                    <div className="text-justify">
                      <strong style={strongStyles}>Backend Technologies:</strong>{" "}
                      {resumeData.technicalSkills.backend.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.devTools &&
                  resumeData.technicalSkills.devTools.length > 0 && (
                    <div className="text-justify">
                      <strong style={strongStyles}>Dev Tools:</strong>{" "}
                      {resumeData.technicalSkills.devTools.join(", ")}
                    </div>
                  )}
                {resumeData.technicalSkills.other &&
                  resumeData.technicalSkills.other.length > 0 && (
                    <div className="text-justify">
                      <strong style={strongStyles}>Other:</strong>{" "}
                      {resumeData.technicalSkills.other.join(", ")}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {resumeData.workExperience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm mb-2" style={headingStyles}>WORK EXPERIENCE</h2>
              {resumeData.workExperience.map((exp: any, index: number) => (
                <div key={`work-${exp.company}-${exp.position}-${index}`} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <strong className="text-xs" style={strongStyles}>{exp.position}</strong> |{" "}
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
                          <span className="text-justify block">{achievement}</span>
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
              <h2 className="text-sm mb-2" style={headingStyles}>EDUCATION</h2>
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs">
                  <strong style={strongStyles}>{resumeData.education.degree}</strong> |{" "}
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
              <h2 className="text-sm mb-2" style={headingStyles}>PROJECTS</h2>
              {resumeData.projects.map((project: any, index: number) => (
                <div key={`project-${project.name}-${index}`} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs">
                      <strong style={strongStyles}>{project.name}</strong> – {project.technologies}
                    </div>
                    <div className="text-xs text-blue-600">
                      {project.githubUrl}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs mb-1 text-justify">{project.description}</p>
                  )}
                  <ul className="text-xs space-y-1 ml-4">
                    {project.achievements &&
                      project.achievements.map(
                        (achievement: string, achIndex: number) => (
                          <li key={achIndex} className="list-disc">
                            <span className="text-justify block">{achievement}</span>
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
              <h2 className="text-sm mb-2" style={headingStyles}>
                ACHIEVEMENTS AND CERTIFICATIONS
              </h2>
              <ul className="text-xs space-y-1 list-disc ml-4">
                {resumeData.achievements.map(
                  (achievement: string, index: number) => (
                    <li key={`achievement-${achievement.substring(0, 15)}-${index}`} className="text-justify">{achievement}</li>
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
