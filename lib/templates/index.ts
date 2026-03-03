import { DEFAULT_LATEX_SOURCE } from '@/components/latex/defaultTemplate'

export interface ResumeTemplate {
  id: string
  name: string
  description: string
  tags: string[]
  source: string
}

// ─── Classic ─────────────────────────────────────────────────────────────────

const CLASSIC_LATEX_SOURCE = `%-------------------------
% Classic Resume Template
% Built with Resulyze
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage[margin=1in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{palatino}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{xcolor}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

\\urlstyle{same}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Section formatting
\\newcommand{\\ressection}[1]{%
  \\vspace{10pt}%
  {\\large\\textbf{\\uppercase{#1}}}%
  \\vspace{3pt}\\\\[-6pt]%
  \\noindent\\rule{\\textwidth}{0.6pt}%
  \\vspace{5pt}%
}

\\newcommand{\\resentry}[4]{%
  \\textbf{#1} \\hfill \\textit{\\small #2} \\\\%
  \\textit{\\small #3} \\hfill {\\small #4}%
}

%-------------------------------------------
\\begin{document}

%----------HEADING----------
\\begin{center}
  {\\LARGE\\textbf{Alex Johnson}} \\\\[6pt]
  \\small
  +1 (555) 123-4567 $\\cdot$
  \\href{mailto:alex@email.com}{alex@email.com} $\\cdot$
  \\href{https://linkedin.com/in/alexjohnson}{linkedin.com/in/alexjohnson} $\\cdot$
  \\href{https://github.com/alexjohnson}{github.com/alexjohnson}
\\end{center}

%-----------PROFILE-----------
\\ressection{Profile}
{\\small Full-Stack Software Engineer with \\textbf{4+ years} of experience building scalable web applications and cloud-native systems. Skilled in React, TypeScript, Node.js, and Python, with a track record of delivering high-impact features that improve user engagement and system reliability.}

%-----------SKILLS-----------
\\ressection{Skills}
\\begin{tabular}{@{} l l}
  \\textbf{Languages:}  & JavaScript, TypeScript, Python, Java, HTML, CSS \\\\
  \\textbf{Frontend:}   & React, Next.js, Redux, Tailwind CSS, Jest \\\\
  \\textbf{Backend:}    & Node.js, Express, FastAPI, PostgreSQL, MongoDB \\\\
  \\textbf{Tools:}      & AWS, Docker, Git, CI/CD, Terraform \\\\
\\end{tabular}

%-----------EXPERIENCE-----------
\\ressection{Experience}

\\resentry{Senior Software Engineer}{Jan 2024 -- Present}{Company A}{San Francisco, CA}
\\begin{itemize}[noitemsep, topsep=4pt, leftmargin=*]
  \\small
  \\item Led migration to micro-frontend architecture, reducing build times by \\textbf{60\\%}
  \\item Designed real-time notification system serving \\textbf{50K+} concurrent users with sub-100ms latency
  \\item Improved Core Web Vitals by \\textbf{35\\%} via automated Lighthouse CI pipelines
\\end{itemize}

\\vspace{6pt}
\\resentry{Software Engineer}{Jun 2021 -- Dec 2023}{Company B}{New York, NY}
\\begin{itemize}[noitemsep, topsep=4pt, leftmargin=*]
  \\small
  \\item Built customer analytics dashboard contributing to \\textbf{25\\%} increase in user retention
  \\item Developed RESTful APIs with \\textbf{90\\%+} test coverage, reducing bugs by \\textbf{40\\%}
  \\item Automated infrastructure provisioning cutting deployment from \\textbf{2 hours to 15 minutes}
  \\item Mentored 3 junior engineers, accelerating ramp-up time by \\textbf{50\\%}
\\end{itemize}

\\vspace{6pt}
\\resentry{Web Developer}{Jan 2020 -- May 2021}{Freelance}{Remote}
\\begin{itemize}[noitemsep, topsep=4pt, leftmargin=*]
  \\small
  \\item Delivered 10+ client projects using React, Next.js, and Tailwind CSS with \\textbf{100\\%} on-time delivery
  \\item Built e-commerce platform with Stripe processing \\textbf{\\$200K+} in transactions in first quarter
\\end{itemize}

%-----------PROJECTS-----------
\\ressection{Projects}
{\\small
\\textbf{Project A} $|$ Open-source project management tool --- Next.js, Prisma, PostgreSQL \\hfill \\href{https://github.com/alexjohnson/projecta}{github.com/alexjohnson/projecta} \\\\[4pt]
\\textbf{Project B} $|$ Markdown-powered blogging platform with MDX, syntax highlighting, RSS \\hfill \\href{https://github.com/alexjohnson/devblog}{github.com/alexjohnson/devblog}
}

%-----------EDUCATION-----------
\\ressection{Education}
\\resentry{Bachelor of Science in Computer Science}{2020}{University of California, Berkeley}{Berkeley, CA}

%-----------ACHIEVEMENTS-----------
\\ressection{Achievements}
{\\small
\\textbf{AWS Certified:} Solutions Architect Associate \\\\
\\textbf{Hackathon Winner:} First place at HackNY 2023 for building an AI-powered accessibility tool \\\\
\\textbf{Open Source:} 500+ GitHub stars across personal projects, active contributor to React ecosystem
}

\\end{document}`

// ─── Minimal ─────────────────────────────────────────────────────────────────

const MINIMAL_LATEX_SOURCE = `%-------------------------
% Minimal Resume Template
% Built with Resulyze
%------------------------

\\documentclass[11pt]{article}
\\usepackage[letterpaper,
  top=0.5in,
  bottom=0.5in,
  left=0.5in,
  right=0.5in]{geometry}

\\usepackage{XCharter}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\raggedright
\\pagestyle{empty}

\\input{glyphtounicode}
\\pdfgentounicode=1

% Bold large section headings with a full-width rule underneath
\\titleformat{\\section}{\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule\\vspace{-6.5pt}]

% Bullet style and list spacing
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\setlist[itemize]{itemsep=-2pt, leftmargin=12pt, topsep=7pt}

%-------------------------------------------
\\begin{document}

%----------HEADING----------
\\centerline{\\Huge Jane Doe}

\\vspace{5pt}

\\begin{center}
\\small \\href{mailto:jane.doe@email.com}{jane.doe@email.com} $|$ +1 (555) 123-4567 $|$ \\href{https://linkedin.com/in/janedoe}{linkedin.com/in/janedoe} $|$ \\href{https://github.com/janedoe}{github.com/janedoe}
\\end{center}

\\vspace{-10pt}

%-----------SKILLS-----------
\\section*{Skills}
\\textbf{Languages:} JavaScript, TypeScript, Python, Java, HTML, CSS \\\\
\\textbf{Frontend:} React, Next.js, Redux, Tailwind CSS, Jest \\\\
\\textbf{Backend:} Node.js, Express, FastAPI, PostgreSQL, MongoDB \\\\
\\textbf{Tools:} AWS, Docker, Git, CI/CD, Terraform

\\vspace{-6.5pt}

%-----------EXPERIENCE-----------
\\section*{Experience}
\\textbf{Senior Software Engineer,} {Company A} -- San Francisco, CA \\hfill Jan 2024 -- Present \\\\
\\vspace{-9pt}
\\begin{itemize}
  \\item Led migration of monolithic frontend to micro-frontend architecture, reducing build times by \\textbf{60\\%}
  \\item Designed real-time notification system using WebSockets and Redis pub/sub, serving \\textbf{50K+} concurrent users
  \\item Improved Core Web Vitals scores by \\textbf{35\\%} via automated Lighthouse CI pipelines
\\end{itemize}

\\textbf{Software Engineer,} {Company B} -- New York, NY \\hfill Jun 2021 -- Dec 2023 \\\\
\\vspace{-9pt}
\\begin{itemize}
  \\item Built customer analytics dashboard using Next.js and PostgreSQL, contributing to a \\textbf{25\\%} increase in retention
  \\item Developed RESTful APIs with \\textbf{90\\%+} test coverage, reducing API-related bugs by \\textbf{40\\%}
  \\item Automated infrastructure provisioning using Terraform, cutting deployment from \\textbf{2 hours to 15 minutes}
  \\item Mentored 3 junior engineers through code reviews, accelerating ramp-up time by \\textbf{50\\%}
\\end{itemize}

\\textbf{Web Developer,} {Freelance} -- Remote \\hfill Jan 2020 -- May 2021 \\\\
\\vspace{-9pt}
\\begin{itemize}
  \\item Delivered 10+ client projects using React and Tailwind CSS with a \\textbf{100\\%} on-time delivery record
  \\item Built an e-commerce platform with Stripe integration processing \\textbf{\\$200K+} in transactions in first quarter
\\end{itemize}

\\vspace{-18.5pt}

%-----------PROJECTS-----------
\\section*{Projects}
\\textbf{Project A} $|$ Open-source project management tool -- Next.js, Prisma, PostgreSQL \\hfill \\href{https://github.com/janedoe/projecta}{github.com/janedoe/projecta} \\\\
\\textbf{Project B} $|$ Markdown-powered blogging platform with MDX and syntax highlighting \\hfill \\href{https://github.com/janedoe/devblog}{github.com/janedoe/devblog}

\\vspace{-18.5pt}

%-----------EDUCATION-----------
\\section*{Education}
\\textbf{University of California, Berkeley} -- Bachelor of Science in Computer Science \\hfill 2020

\\vspace{-6.5pt}

%-----------ACHIEVEMENTS-----------
\\section*{Achievements}
\\textbf{AWS Certified:} Solutions Architect Associate \\\\
\\textbf{Hackathon Winner:} First place at HackNY 2023 for building an AI-powered accessibility tool \\\\
\\textbf{Open Source:} 500+ GitHub stars across personal projects, active contributor to React ecosystem

\\end{document}`

// ─── Sidebar (Two-Column) ────────────────────────────────────────────────────

const SIDEBAR_LATEX_SOURCE = `%-------------------------
% Sidebar Resume Template
% Built with Resulyze
%------------------------

\\documentclass[letterpaper,10pt]{article}

\\usepackage[top=0.6in, left=0.6in, right=0.6in, bottom=0.6in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

\\definecolor{accent}{RGB}{37,99,235}

\\urlstyle{same}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Sidebar section header
\\newcommand{\\sidesec}[1]{%
  \\vspace{8pt}%
  {\\footnotesize\\textbf{\\textcolor{accent}{\\uppercase{#1}}}}%
  \\vspace{2pt}\\\\[-4pt]%
  {\\color{accent}\\rule{\\linewidth}{0.5pt}}%
  \\vspace{4pt}%
}

% Main section header
\\newcommand{\\mainsec}[1]{%
  \\vspace{8pt}%
  {\\normalsize\\textbf{\\textcolor{accent}{\\uppercase{#1}}}}%
  \\vspace{2pt}\\\\[-4pt]%
  {\\color{accent}\\rule{\\linewidth}{0.5pt}}%
  \\vspace{4pt}%
}

\\newcommand{\\mainentry}[4]{%
  {\\small\\textbf{#1}} \\hfill {\\small\\textit{#2}} \\\\%
  {\\footnotesize\\itshape #3} \\hfill {\\footnotesize #4}%
}

%-------------------------------------------
\\begin{document}

%----------HEADING----------
{\\LARGE\\textbf{Alex Johnson}} \\hfill
{\\small\\textcolor{accent}{Senior Software Engineer}} \\\\[4pt]
{\\small
  \\href{mailto:alex@email.com}{alex@email.com} $|$
  +1 (555) 123-4567 $|$
  \\href{https://linkedin.com/in/alexjohnson}{linkedin.com/in/alexjohnson} $|$
  \\href{https://github.com/alexjohnson}{github.com/alexjohnson}
}

\\vspace{6pt}
\\noindent\\rule{\\textwidth}{1pt}
\\vspace{4pt}

% ─── Two-column body ───────────────────────────────────────────────────────
\\begin{minipage}[t]{0.30\\textwidth}

\\sidesec{Skills}
{\\footnotesize
  \\textbf{Languages} \\\\
  JavaScript $\\cdot$ TypeScript \\\\
  Python $\\cdot$ Java \\\\[4pt]
  \\textbf{Frontend} \\\\
  React $\\cdot$ Next.js \\\\
  Redux $\\cdot$ Tailwind CSS \\\\[4pt]
  \\textbf{Backend} \\\\
  Node.js $\\cdot$ FastAPI \\\\
  PostgreSQL $\\cdot$ MongoDB \\\\[4pt]
  \\textbf{Tools} \\\\
  AWS $\\cdot$ Docker $\\cdot$ Git \\\\
  Terraform $\\cdot$ CI/CD
}

\\sidesec{Education}
{\\footnotesize
  \\textbf{UC Berkeley} \\\\
  B.S. Computer Science \\\\
  2020 \\\\[4pt]
  \\textit{Berkeley, CA}
}

\\sidesec{Certifications}
{\\footnotesize
  AWS Solutions Architect \\\\
  Associate
}

\\sidesec{Achievements}
{\\footnotesize
  HackNY 2023 Winner \\\\[2pt]
  500+ GitHub Stars \\\\[2pt]
  Active OSS Contributor
}

\\sidesec{Location}
{\\footnotesize
  San Francisco, CA \\\\
  Open to remote
}

\\end{minipage}%
\\hfill%
\\begin{minipage}[t]{0.66\\textwidth}

\\mainsec{Profile}
{\\small Full-Stack Software Engineer with \\textbf{4+ years} of experience building scalable web applications and cloud-native systems. Track record of delivering high-impact features that improve user engagement and system reliability.}

\\mainsec{Experience}

\\mainentry{Senior Software Engineer}{Jan 2024 -- Present}{Company A}{San Francisco, CA}
\\begin{itemize}[noitemsep, topsep=3pt, leftmargin=1em]
  \\small
  \\item Led migration to micro-frontend architecture, reducing build times by \\textbf{60\\%}
  \\item Designed real-time notification system serving \\textbf{50K+} concurrent users
  \\item Improved Core Web Vitals by \\textbf{35\\%} via automated Lighthouse CI pipelines
\\end{itemize}

\\vspace{4pt}
\\mainentry{Software Engineer}{Jun 2021 -- Dec 2023}{Company B}{New York, NY}
\\begin{itemize}[noitemsep, topsep=3pt, leftmargin=1em]
  \\small
  \\item Built analytics dashboard contributing to \\textbf{25\\%} increase in user retention
  \\item Developed RESTful APIs with \\textbf{90\\%+} test coverage, reducing bugs by \\textbf{40\\%}
  \\item Cut deployment time from \\textbf{2 hours to 15 minutes} via infrastructure automation
\\end{itemize}

\\vspace{4pt}
\\mainentry{Web Developer}{Jan 2020 -- May 2021}{Freelance}{Remote}
\\begin{itemize}[noitemsep, topsep=3pt, leftmargin=1em]
  \\small
  \\item Delivered 10+ client projects with \\textbf{100\\%} on-time delivery record
  \\item Built e-commerce platform processing \\textbf{\\$200K+} in transactions in first quarter
\\end{itemize}

\\mainsec{Projects}
{\\small
  \\textbf{Project A} $|$ Open-source project management tool \\\\
  {\\footnotesize Next.js, Prisma, PostgreSQL $|$ \\href{https://github.com/alexjohnson/projecta}{github.com/alexjohnson/projecta}} \\\\[5pt]
  \\textbf{Project B} $|$ Markdown-powered blogging platform \\\\
  {\\footnotesize MDX, syntax highlighting, RSS $|$ \\href{https://github.com/alexjohnson/devblog}{github.com/alexjohnson/devblog}}
}

\\end{minipage}

\\end{document}`

// ─── Template registry ────────────────────────────────────────────────────────

export const TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modern',
    name: "Jake's Resume",
    description: 'Clean sans-serif layout popular in tech. ATS-optimized.',
    tags: ['ATS-Friendly', 'Tech', 'Default'],
    source: DEFAULT_LATEX_SOURCE,
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional Palatino serif. Great for finance, law, consulting.',
    tags: ['Traditional', 'Serif', 'Formal'],
    source: CLASSIC_LATEX_SOURCE,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with thin rules. Elegant and distraction-free.',
    tags: ['Minimal', 'Modern', 'Clean'],
    source: MINIMAL_LATEX_SOURCE,
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Two-column with skills sidebar. Visually striking layout.',
    tags: ['Two-Column', 'Design', 'Creative'],
    source: SIDEBAR_LATEX_SOURCE,
  },
]
