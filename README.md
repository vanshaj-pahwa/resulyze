# AI Career Coach

A comprehensive web application that helps job seekers tailor their applications to job descriptions using AI-powered assistance.

## Features

- **Job Description Analysis**: Extract key skills, qualifications, and keywords from job postings
- **Smart Resume Builder**: AI-optimized resume creation with multiple templates
- **Cover Letter Generator**: Personalized cover letters tailored to job requirements
- **Referral Message Creator**: Professional networking messages for referrals
- **Interview Preparation**: AI-generated interview questions based on job and resume
- **Document Export**: Download resumes in PDF and DOCX formats
- **User Authentication**: Secure authentication with Clerk
- **Data Persistence**: MongoDB with Mongoose ODM for robust data modeling and auto-save functionality
- **Offline Support**: Graceful fallback to localStorage when database is unavailable

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini API
- **Document Generation**: docx, jsPDF
- **UI Components**: Radix UI, Lucide React

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB database (Atlas or local)
- Clerk account for authentication
- Google AI Studio account for Gemini API

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
MONGODB_URL=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
BASE_URL=localhost:3000
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-career-coach
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables as described above

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Sign Up/Sign In**: Create an account or sign in using Clerk authentication
2. **Analyze Job Description**: Paste or upload a job description to extract key requirements
3. **Build Resume**: Use the resume builder to create or optimize your resume based on job requirements
4. **Generate Cover Letter**: Create personalized cover letters tailored to the job
5. **Create Referral Messages**: Generate professional networking messages
6. **Prepare for Interviews**: Get AI-generated interview questions specific to your profile and the job
7. **Export Documents**: Download your resume in PDF or DOCX format

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── sign-in/          # Authentication pages
│   └── sign-up/
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── job/              # Job description processing
│   ├── resume/           # Resume builder components
│   ├── cover-letter/     # Cover letter generator
│   └── interview/        # Interview preparation
├── lib/                  # Utility functions
├── models/               # Database models
└── public/               # Static assets
```

## API Endpoints

- `POST /api/process-job-description` - Analyze job descriptions
- `POST /api/optimize-resume` - AI-optimize resume content
- `POST /api/generate-cover-letter` - Generate cover letters
- `POST /api/generate-referral-message` - Create referral messages
- `POST /api/generate-interview-questions` - Generate interview questions
- `POST /api/download-resume` - Export resume in PDF/DOCX

## Key Features Explained

### Resume Template
The resume template matches the provided design with:
- Clean, professional layout
- ATS-friendly formatting
- Sections for profile, technical skills, work experience, education, projects, and achievements
- Optimized for both PDF and DOCX export

### AI Integration
- Uses Google Gemini API for intelligent content generation
- Analyzes job descriptions to extract relevant keywords and requirements
- Optimizes resume content to match job requirements while maintaining truthfulness
- Generates contextual interview questions based on job and candidate profile

### Authentication & Data Persistence
- Secure authentication with Clerk
- User data stored in MongoDB
- Resume versions and job applications tracked
- Persistent user sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.