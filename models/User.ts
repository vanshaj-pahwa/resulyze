import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  resumeData: {
    type: Object,
    default: null,
  },
  jobApplications: [{
    jobTitle: String,
    company: String,
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['applied', 'interview', 'rejected', 'offer'],
      default: 'applied',
    },
    jobData: Object,
    resumeVersion: Object,
    coverLetter: String,
    referralMessage: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.User || mongoose.model('User', UserSchema)