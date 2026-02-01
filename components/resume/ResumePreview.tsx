"use client";

import { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ResumePreviewProps {
  readonly resumeData: any;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resumeData }, ref) => {
    if (!resumeData.personalInfo.name && !resumeData.profile) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-8">No resume data available.</CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-0">
          {/* A4 size container: 210mm x 297mm = 794px x 1123px at 96dpi */}
          <div
            ref={ref}
            id="resume-preview-content"
            className="bg-white text-black"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "10mm 12mm",
              fontFamily: "Arial, sans-serif",
              fontSize: "9pt",
              lineHeight: "1.3",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            {(resumeData.personalInfo.name ||
              resumeData.personalInfo.phone ||
              resumeData.personalInfo.email ||
              resumeData.personalInfo.linkedin ||
              resumeData.personalInfo.github) && (
              <>
                <div className="text-center" style={{ marginBottom: "3mm" }}>
                  <h1
                    style={{
                      fontSize: "18pt",
                      fontWeight: "bold",
                      marginBottom: "2mm",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    {resumeData.personalInfo.name}
                  </h1>
                  <div style={{ fontSize: "8pt", color: "#2563eb" }}>
                    {resumeData.personalInfo.phone && (
                      <span>{resumeData.personalInfo.phone}</span>
                    )}
                    {resumeData.personalInfo.phone && resumeData.personalInfo.email && " | "}
                    {resumeData.personalInfo.email && (
                      <a href={`mailto:${resumeData.personalInfo.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                        {resumeData.personalInfo.email}
                      </a>
                    )}
                    {(resumeData.personalInfo.phone || resumeData.personalInfo.email) && resumeData.personalInfo.linkedin && " | "}
                    {resumeData.personalInfo.linkedin && (
                      <a href={resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                        {resumeData.personalInfo.linkedin}
                      </a>
                    )}
                    {(resumeData.personalInfo.phone || resumeData.personalInfo.email || resumeData.personalInfo.linkedin) && resumeData.personalInfo.github && " | "}
                    {resumeData.personalInfo.github && (
                      <a href={resumeData.personalInfo.github.startsWith("http") ? resumeData.personalInfo.github : `https://${resumeData.personalInfo.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                        {resumeData.personalInfo.github}
                      </a>
                    )}
                  </div>
                </div>
                <hr
                  style={{
                    borderColor: "#000",
                    borderWidth: "1px",
                    marginBottom: "3mm",
                  }}
                />
              </>
            )}

            {/* Profile */}
            {resumeData.profile && (
              <div style={{ marginBottom: "3mm" }}>
                <h2
                  style={{
                    fontSize: "10pt",
                    fontWeight: "bold",
                    marginBottom: "1.5mm",
                                                            fontFamily: "Arial, sans-serif",
                  }}
                >
                  PROFILE
                </h2>
                <p style={{ textAlign: "justify", fontSize: "9pt" }}>
                  {resumeData.profile}
                </p>
              </div>
            )}

            {/* Technical Skills - Dynamic fields */}
            {resumeData.technicalSkills &&
              Object.keys(resumeData.technicalSkills).some((key) => {
                const value = resumeData.technicalSkills[key];
                return Array.isArray(value) ? value.length > 0 : (typeof value === "string" && value.trim());
              }) && (
                <div style={{ marginBottom: "3mm" }}>
                  <h2
                    style={{
                      fontSize: "10pt",
                      fontWeight: "bold",
                      marginBottom: "1.5mm",
                                                                  fontFamily: "Arial, sans-serif",
                    }}
                  >
                    TECHNICAL SKILLS
                  </h2>
                  <div style={{ fontSize: "9pt" }}>
                    {Object.entries(resumeData.technicalSkills).map(([key, value]) => {
                      const values = Array.isArray(value) ? value : (typeof value === "string" && value.trim() ? [value] : []);
                      if (values.length === 0) return null;
                      return (
                        <div key={key} style={{ marginBottom: "0.5mm" }}>
                          <strong>{key}:</strong>{" "}
                          {values.join(", ")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Work Experience */}
            {resumeData.workExperience?.length > 0 && (
              <div style={{ marginBottom: "3mm" }}>
                <h2
                  style={{
                    fontSize: "10pt",
                    fontWeight: "bold",
                    marginBottom: "1.5mm",
                                                            fontFamily: "Arial, sans-serif",
                  }}
                >
                  WORK EXPERIENCE
                </h2>
                {resumeData.workExperience.map((exp: any, index: number) => (
                  <div
                    key={`work-${exp.company}-${exp.position}-${index}`}
                    style={{ marginBottom: "2.5mm" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ fontSize: "9pt" }}>
                        <strong>{exp.position}</strong> | {exp.company}
                      </div>
                      <div style={{ fontSize: "9pt", fontStyle: "italic" }}>
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "9pt",
                        fontStyle: "italic",
                        marginBottom: "1mm",
                      }}
                    >
                      {exp.location}
                    </div>
                    {exp.achievements?.length > 0 && (
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "4mm",
                          fontSize: "9pt",
                        }}
                      >
                        {exp.achievements.map(
                          (achievement: string, achIndex: number) =>
                            achievement?.trim() && (
                              <li
                                key={achIndex}
                                style={{
                                  textAlign: "justify",
                                  marginBottom: "0.5mm",
                                }}
                              >
                                {achievement}
                              </li>
                            )
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {(resumeData.education?.degree ||
              resumeData.education?.institution) && (
              <div style={{ marginBottom: "3mm" }}>
                <h2
                  style={{
                    fontSize: "10pt",
                    fontWeight: "bold",
                    marginBottom: "1.5mm",
                                                            fontFamily: "Arial, sans-serif",
                  }}
                >
                  EDUCATION
                </h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <div style={{ fontSize: "9pt", flex: "1", minWidth: 0 }}>
                    <strong>{resumeData.education.degree}</strong> |{" "}
                    {resumeData.education.institution}
                  </div>
                  <div style={{ fontSize: "9pt", fontStyle: "italic", flexShrink: 0, whiteSpace: "nowrap" }}>
                    {resumeData.education.graduationDate}
                  </div>
                </div>
                <div style={{ fontSize: "9pt", fontStyle: "italic" }}>
                  {[
                    resumeData.education.location,
                    resumeData.education.gpa
                      ? `GPA: ${resumeData.education.gpa}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </div>
              </div>
            )}

            {/* Projects */}
            {resumeData.projects?.length > 0 && (
              <div style={{ marginBottom: "3mm" }}>
                <h2
                  style={{
                    fontSize: "10pt",
                    fontWeight: "bold",
                    marginBottom: "1.5mm",
                                                            fontFamily: "Arial, sans-serif",
                  }}
                >
                  PROJECTS
                </h2>
                {resumeData.projects.map((project: any, index: number) => (
                  <div
                    key={`project-${project.name}-${index}`}
                    style={{ marginBottom: "2.5mm" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ fontSize: "9pt" }}>
                        <strong>{project.name}</strong>
                        {project.technologies && ` – ${project.technologies}`}
                      </div>
                      {project.githubUrl && (
                        <div style={{ fontSize: "9pt", color: "#2563eb" }}>
                          <a href={project.githubUrl.startsWith("http") ? project.githubUrl : `https://${project.githubUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                            {project.githubUrl}
                          </a>
                        </div>
                      )}
                    </div>
                    {project.description && (
                      <p
                        style={{
                          fontSize: "9pt",
                          textAlign: "justify",
                          marginBottom: "1mm",
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                    {project.achievements?.length > 0 && (
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "4mm",
                          fontSize: "9pt",
                        }}
                      >
                        {project.achievements.map(
                          (achievement: string, achIndex: number) =>
                            achievement?.trim() && (
                              <li
                                key={achIndex}
                                style={{
                                  textAlign: "justify",
                                  marginBottom: "0.5mm",
                                }}
                              >
                                {achievement}
                              </li>
                            )
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Achievements */}
            {resumeData.achievements?.length > 0 && (
              <div style={{ marginBottom: "3mm" }}>
                <h2
                  style={{
                    fontSize: "10pt",
                    fontWeight: "bold",
                    marginBottom: "1.5mm",
                                                            fontFamily: "Arial, sans-serif",
                  }}
                >
                  ACHIEVEMENTS AND CERTIFICATIONS
                </h2>
                <div style={{ fontSize: "9pt" }}>
                  {resumeData.achievements.map(
                    (achievement: string, index: number) => {
                      if (!achievement?.trim()) return null;
                      const colonIndex = achievement.indexOf(":");
                      if (colonIndex > 0 && colonIndex < 50) {
                        const title = achievement.substring(0, colonIndex + 1);
                        const rest = achievement.substring(colonIndex + 1);
                        return (
                          <div
                            key={`achievement-${index}`}
                            style={{ marginBottom: "0.5mm" }}
                          >
                            <strong>{title}</strong>
                            {rest}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`achievement-${index}`}
                          style={{ marginBottom: "0.5mm" }}
                        >
                          {achievement}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
