import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: Date
  updatedAt: Date
  resumeData?: {
    personalInfo?: {
      name?: string
      email?: string
      phone?: string
      location?: string
      linkedin?: string
      github?: string
    }
    profile?: string
    workExperience?: Array<{
      position: string
      company: string
      startDate: string
      endDate?: string
      current?: boolean
      achievements: string[]
    }>
    education?: {
      degree: string
      institution: string
      graduationDate: string
      gpa?: string
    }
    technicalSkills?: {
      languages: string[]
      frontend: string[]
      backend: string[]
      devTools: string[]
    }
    projects?: Array<{
      name: string
      description: string
      technologies: string[]
      link?: string
    }>
    achievements?: string[]
  }
  jobSearchData?: {
    targetRoles?: string[]
    preferredLocations?: string[]
    salaryRange?: {
      min: number
      max: number
    }
    jobApplications?: Array<{
      company: string
      position: string
      appliedDate: Date
      status: 'applied' | 'interview' | 'offer' | 'rejected'
      jobDescription?: string
      atsScore?: number
    }>
  }
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resumeData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
    },
    profile: String,
    workExperience: [{
      position: String,
      company: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      achievements: [String]
    }],
    education: {
      degree: String,
      institution: String,
      graduationDate: String,
      gpa: String,
    },
    technicalSkills: {
      languages: [String],
      frontend: [String],
      backend: [String],
      devTools: [String],
    },
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String,
    }],
    achievements: [String],
  },
  jobSearchData: {
    targetRoles: [String],
    preferredLocations: [String],
    salaryRange: {
      min: Number,
      max: Number,
    },
    jobApplications: [{
      company: String,
      position: String,
      appliedDate: Date,
      status: { type: String, enum: ['applied', 'interview', 'offer', 'rejected'] },
      jobDescription: String,
      atsScore: Number,
    }],
  },
});

// Update the updatedAt field before saving
UserProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const UserProfile = mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

export interface ISavedJobDescription extends Document {
  userId: string
  jobId: string
  title: string
  company: string
  description: string
  skills: string[]
  requirements: string[]
  location?: string
  salaryRange?: string
  createdAt: Date
}

const SavedJobDescriptionSchema = new Schema<ISavedJobDescription>({
  userId: { type: String, required: true },
  jobId: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  skills: [String],
  requirements: [String],
  location: String,
  salaryRange: String,
  createdAt: { type: Date, default: Date.now },
});

export const SavedJobDescription = mongoose.models.SavedJobDescription || mongoose.model<ISavedJobDescription>('SavedJobDescription', SavedJobDescriptionSchema);