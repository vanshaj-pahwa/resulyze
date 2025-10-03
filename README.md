# Resulyze

A comprehensive AI-powered career assistant that helps job seekers analyze job descriptions, optimize resumes, and prepare for interviews with intelligent, personalized guidance.

## Key Features

- **Job Description Analysis**: Extract key skills, qualifications, and keywords from job postings using text, file upload, or URL input
- **ATS Score Calculator**: Evaluate your resume's compatibility with job requirements using AI analysis
- **Smart Resume Builder**: AI-optimized resume creation with multiple templates and real-time editing
- **Company Research**: Get insights about target companies to personalize your application
- **Cover Letter Generator**: Create tailored, compelling cover letters that highlight relevant experience
- **Referral Message Generator**: Craft professional networking messages for referrals that stand out
- **Interview Preparation**: AI-generated interview questions and suggested answers based on job and resume
- **Document Export**: Download resumes and cover letters in PDF and DOCX formats
- **User Profile Management**: Save and manage multiple resumes, job applications, and career goals
- **Secure Authentication**: Enterprise-grade security with Clerk authentication
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Real-time Feedback**: Instant suggestions for resume improvements
- **Data Persistence**: MongoDB with Mongoose ODM for robust data storage and auto-save functionality
- **Offline Support**: Graceful fallback to localStorage when database is unavailable

## Tech Stack

- **Frontend**: 
  - Next.js 14 with App Router
  - React with Server Components
  - TypeScript for type safety
  - Tailwind CSS for responsive styling
  - Shadcn UI component library
  
- **Backend**: 
  - Next.js API Routes
  - Serverless architecture
  - RESTful API design
  
- **Authentication & Security**: 
  - Clerk for secure user authentication
  - JWT for API authorization
  
- **Database**: 
  - MongoDB with Mongoose ODM
  - Optimized data models for performance
  
- **AI Integration**:
  - Google Gemini API for natural language processing
  - Custom-trained models for resume analysis
  
- **Document Generation**: 
  - jsPDF for PDF exports
  - docx for Word document generation
  
- **UI/UX**: 
  - Radix UI for accessible components
  - Lucide React for icons
  - Custom animations and transitions
  - Global API loading state management

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
git clone https://github.com/vanshaj-pahwa/resulyze.git
cd resulyze
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
2. **Analyze Job Description**: Paste, upload, or provide a URL to a job description to extract key requirements
3. **Build Resume**: Use the resume builder to create or optimize your resume based on job requirements
4. **Generate Cover Letter & Referrals**: Create personalized cover letters and referral messages tailored to the job (available in the same workflow step)
5. **Prepare for Interviews**: Get AI-generated interview questions specific to your profile and the job
6. **Export Documents**: Download your resume in PDF or DOCX format

## API Endpoints

### Job Analysis
- `POST /api/process-job-description` - Analyze job descriptions to extract key requirements and skills
- `POST /api/research-company` - Get insights and information about the target company

### Resume Operations
- `POST /api/parse-resume` - Extract structured data from uploaded resume files
- `POST /api/optimize-resume` - AI-optimize resume content based on job requirements
- `POST /api/calculate-ats-score` - Calculate ATS compatibility score for a resume against job requirements
- `POST /api/download-resume` - Export resume in PDF/DOCX formats

### Application Documents
- `POST /api/generate-cover-letter` - Generate personalized cover letters
- `POST /api/download-cover-letter` - Export cover letters in PDF/DOCX formats
- `POST /api/generate-referral-message` - Create professional referral request messages

### Interview Preparation
- `POST /api/generate-interview-questions` - Generate potential interview questions based on job and resume
- `POST /api/generate-interview-answer` - Create suggested answers to interview questions

### User Management
- `GET/POST /api/user/profile` - Retrieve or update user profile data
- `GET/POST /api/user/resume` - Manage user's saved resumes

## Key Features Explained

### Resume Builder & ATS Optimization
- **Real-time ATS Score**: Instant feedback on how well your resume matches the job description
- **Keyword Optimization**: Strategic placement of relevant keywords to increase visibility
- **Skills Gap Analysis**: Identifies missing skills and suggests additions
- **Export Options**: High-quality PDF and editable DOCX formats
- **Section Management**: Intuitive interface for profile, technical skills, work experience, education, projects, and achievements

### AI-Powered Career Tools
- **Advanced NLP**: Leverages Google Gemini API for sophisticated natural language understanding
- **Job Description Analysis**: Extracts keywords, requirements, experience level, and location details
- **Multi-source Input**: Processes job descriptions from text, file uploads, or direct URL parsing
- **Content Generation**: Creates optimized resume content while preserving accuracy and authenticity
- **Personalized Documents**: Tailored cover letters and referral messages that highlight relevant experience
- **Interview Preparation**: Generates industry-specific questions with suggested answer frameworks
- **Company Research**: Gathers company information to help personalize applications

### User Experience & Interface
- **Intuitive Workflow**: Guided step-by-step process from job analysis to application documents
- **Real-time Feedback**: Immediate suggestions and improvements as you build your resume
- **Global Loading States**: Elegant API loading indicators with branded animations
- **Mobile Responsiveness**: Fully functional experience across all device sizes
- **Accessibility**: WCAG-compliant interface with keyboard navigation support

### Security & Data Management
- **Enterprise Authentication**: Secure user management with Clerk
- **Data Persistence**: MongoDB with Mongoose for robust data modeling
- **Version Control**: Track and manage multiple versions of resumes and applications
- **Offline Capability**: Fallback to localStorage when database connection is unavailable
- **Privacy Focus**: User data is securely encrypted and protected

## Future Features

The Resulyze roadmap includes exciting upcoming features:

- **AI-powered resume scanner for recruiters**: Streamline candidate evaluation with objective skill assessment
- **Career path visualization**: Visual representation of potential career trajectories
- **Salary negotiation assistant**: Data-driven insights for salary negotiations
- **Enhanced skill gap training suggestions**: Personalized resources to build missing skills
- **Application tracking system**: Monitor and manage your job applications in one place
- **Integration with job boards**: Directly apply to positions with optimized materials
- **Resume version comparison**: Compare different versions and their ATS scores
- **Team collaboration**: Share and collaborate on application materials with mentors

## Contributing

Contributions to Resulyze are welcome! Here's how you can contribute to the project:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/vanshaj-pahwa/resulyze.git
   cd resulyze
   ```

2. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set Up Development Environment**
   ```bash
   npm install
   # Set up your .env.local file based on the .env.example
   ```

4. **Make Your Changes**
   - Follow the code style and formatting conventions
   - Add necessary tests for your changes
   - Update documentation as needed

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add a descriptive commit message"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Submit a Pull Request**
   - Go to the [Resulyze repository](https://github.com/vanshaj-pahwa/resulyze)
   - Click the "Pull Request" button
   - Select your fork and branch
   - Add a description of your changes
   - Submit the pull request

### Contribution Guidelines

- Follow the coding standards and project structure
- Write clear, descriptive commit messages
- Include tests for new features or bug fixes
- Update documentation to reflect changes