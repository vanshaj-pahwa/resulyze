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
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\raggedright
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

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
\\centerline{\\textbf{\\Huge Jane Doe}}

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

\\vspace{-10pt}

%-----------PROJECTS-----------
\\section*{Projects}
\\textbf{Project A} $|$ Open-source project management tool -- Next.js, Prisma, PostgreSQL \\hfill \\href{https://github.com/janedoe/projecta}{github.com/janedoe/projecta} \\\\
\\textbf{Project B} $|$ Markdown-powered blogging platform with MDX and syntax highlighting \\hfill \\href{https://github.com/janedoe/devblog}{github.com/janedoe/devblog}

\\vspace{-10pt}

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

// ─── Developer (Source Sans Pro, blue headings) ──────────────────────────────

const DEVELOPER_LATEX_SOURCE = `%-------------------------
% Developer Resume Template
% Built with Resulyze
%------------------------

\\documentclass[a4paper,11pt]{article}

\\usepackage{titlesec}
\\usepackage{color}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage[hidelinks]{hyperref}
\\usepackage[normalem]{ulem}
\\usepackage[english]{babel}
\\usepackage[default]{sourcesanspro}
\\usepackage{xcolor}

\\input{glyphtounicode}
\\pdfgentounicode=1

\\urlstyle{same}
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0in}
\\renewcommand{\\footrulewidth}{0in}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

\\setlength{\\tabcolsep}{0in}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\topmargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\textheight}{1.0in}
\\raggedbottom{}
\\raggedright{}

% Small-caps section headings with rule
\\titleformat{\\section}
  {\\scshape\\large}{}{0em}{}[\\titlerule\\vspace{0pt}]

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand{\\ULdepth}{2pt}

% Custom commands
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[rightmargin=0.11in]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}}

\\newcommand{\\resumeSectionType}[3]{
  \\item\\begin{tabular*}{0.96\\textwidth}[t]{
    p{0.15\\linewidth}p{0.02\\linewidth}p{0.81\\linewidth}
  }
    \\textbf{#1} & #2 & #3
  \\end{tabular*}\\vspace{-2pt}
}

\\newcommand{\\resumeTrioHeading}[3]{
  \\item\\small{
    \\begin{tabular*}{0.96\\textwidth}[t]{
      l@{\\extracolsep{\\fill}}c@{\\extracolsep{\\fill}}r
    }
      \\textbf{#1} & \\textit{#2} & #3
    \\end{tabular*}
  }
}

\\newcommand{\\resumeQuadHeading}[4]{
  \\item
  \\begin{tabular*}{0.96\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{\\small#3} & \\textit{\\small #4} \\\\
  \\end{tabular*}
}

\\newcommand{\\resumeQuadHeadingChild}[2]{
  \\item
  \\begin{tabular*}{0.96\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{\\small#1} & {\\small#2} \\\\
  \\end{tabular*}
}

\\newcommand{\\resumeHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeHeadingListEnd}{\\end{itemize}}

%-------------------------------------------
\\begin{document}

%-----------HEADING-----------
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{\\Huge Jane Doe \\vspace{2pt}} &
  San Francisco, CA \\\\
  \\href{https://janedoe.dev}{\\uline{janedoe.dev}} $|$
  \\href{https://linkedin.com/in/janedoe}{\\uline{LinkedIn}} $|$
  \\href{https://github.com/janedoe}{\\uline{GitHub}} &
  \\href{mailto:jane.doe@email.com}{\\uline{jane.doe@email.com}} $|$
  +1 (555) 123-4567 \\\\
\\end{tabular*}

%-----------SUMMARY-----------
\\section{Full Stack Developer}
\\small{
  Highly skilled full-stack developer with over \\textbf{5 years of experience} building scalable web applications with \\textbf{React, Next.js, Node.js, and Python}. Passionate about clean architecture, developer experience, and shipping high-impact features.
}

%-----------SKILLS-----------
\\section{Technical Skills}
  \\resumeHeadingListStart{}
    \\resumeSectionType{Languages}{:}{JavaScript, TypeScript, Python, Java, HTML, CSS}
    \\resumeSectionType{Frontend}{:}{React, Next.js, Redux, Tailwind CSS, Jest}
    \\resumeSectionType{Backend}{:}{Node.js, Express, FastAPI, PostgreSQL, MongoDB}
    \\resumeSectionType{DevOps}{:}{AWS, Docker, Git, CI/CD, Terraform}
  \\resumeHeadingListEnd{}

%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeHeadingListStart{}
  \\resumeQuadHeading{Senior Software Engineer}{Jan 2024 -- Present}
  {Company A}{San Francisco, CA}
    \\resumeItemListStart{}
      \\resumeItem{Led migration of monolithic frontend to micro-frontend architecture, reducing build times by \\textbf{60\\%}}
      \\resumeItem{Designed real-time notification system using WebSockets and Redis pub/sub, serving \\textbf{50K+} concurrent users}
      \\resumeItem{Improved Core Web Vitals scores by \\textbf{35\\%} via automated Lighthouse CI pipelines}
    \\resumeItemListEnd{}

  \\resumeQuadHeading{Software Engineer}{Jun 2021 -- Dec 2023}
  {Company B}{New York, NY}
    \\resumeItemListStart{}
      \\resumeItem{Built customer analytics dashboard using Next.js and PostgreSQL, contributing to a \\textbf{25\\%} increase in retention}
      \\resumeItem{Developed RESTful APIs with \\textbf{90\\%+} test coverage, reducing API-related bugs by \\textbf{40\\%}}
      \\resumeItem{Automated infrastructure provisioning using Terraform, cutting deployment from \\textbf{2 hours to 15 minutes}}
    \\resumeItemListEnd{}

  \\resumeQuadHeadingChild{Software Engineer Intern}{Jan 2021 -- May 2021}
    \\resumeItemListStart{}
      \\resumeItem{Assisted senior engineers in building internal tooling with React and Node.js}
    \\resumeItemListEnd{}
\\resumeHeadingListEnd{}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeHeadingListStart{}
    \\resumeQuadHeading{University of California, Berkeley}{Berkeley, CA}
    {Bachelor of Science in Computer Science}{2020}
  \\resumeHeadingListEnd{}

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeHeadingListStart{}
    \\resumeTrioHeading{\\href{https://github.com/janedoe/projecta}{\\uline{Project A}}}{Next.js, Prisma, PostgreSQL}{\\href{https://github.com/janedoe/projecta}{\\uline{Source Code}}}
      \\resumeItemListStart{}
        \\resumeItem{Open-source project management tool with real-time collaboration features}
        \\resumeItem{Implemented drag-and-drop Kanban boards with optimistic UI updates}
        \\resumeItem{Deployed on Vercel with automated CI/CD via GitHub Actions}
      \\resumeItemListEnd{}

    \\resumeTrioHeading{Project B}{Node.js, Express, MongoDB}{\\href{https://github.com/janedoe/devblog}{\\uline{Source Code}}}
      \\resumeItemListStart{}
        \\resumeItem{Markdown-powered blogging platform with MDX and syntax highlighting}
        \\resumeItem{RESTful API with JWT auth, rate limiting, and \\textbf{95\\%+} test coverage}
      \\resumeItemListEnd{}
  \\resumeHeadingListEnd{}

%-----------CERTIFICATIONS-----------
\\section{Certifications}
  \\resumeItemListStart{}
    \\resumeItem{\\textbf{AWS Certified:} Solutions Architect Associate}
    \\resumeItem{\\textbf{Hackathon Winner:} First place at HackNY 2023 for building an AI-powered accessibility tool}
  \\resumeItemListEnd{}

\\end{document}`

// ─── Professional (Lato, FontAwesome icons) ──────────────────────────────────

const PROFESSIONAL_LATEX_SOURCE = `%-------------------------
% Professional Resume Template
% Built with Resulyze
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{fontawesome5}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{xcolor}

\\input{glyphtounicode}
\\pdfgentounicode=1

\\usepackage[default]{lato}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-0.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule\\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
\\begin{document}

%----------HEADING----------
\\begin{center}
  \\textbf{\\Huge \\scshape Jane Doe} \\\\ \\vspace{1pt}
  \\small
  \\faIcon{phone} \\, +1 (555) 123-4567 \\quad
  \\href{mailto:jane.doe@email.com}{\\faIcon{envelope} \\, jane.doe@email.com} \\quad
  \\href{https://linkedin.com/in/janedoe}{\\faIcon{linkedin} \\, janedoe} \\quad
  \\href{https://github.com/janedoe}{\\faIcon{github} \\, janedoe}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {University of California, Berkeley}{Berkeley, CA}
      {Bachelor of Science in Computer Science}{Aug 2016 -- May 2020}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Senior Software Engineer}{Jan 2024 -- Present}
      {Company A}{San Francisco, CA}
      \\resumeItemListStart
        \\resumeItem{Led migration of monolithic frontend to micro-frontend architecture, reducing build times by \\textbf{60\\%}}
        \\resumeItem{Designed real-time notification system using WebSockets and Redis pub/sub, serving \\textbf{50K+} concurrent users}
        \\resumeItem{Improved Core Web Vitals scores by \\textbf{35\\%} via automated Lighthouse CI pipelines}
      \\resumeItemListEnd

    \\resumeSubheading
      {Software Engineer}{Jun 2021 -- Dec 2023}
      {Company B}{New York, NY}
      \\resumeItemListStart
        \\resumeItem{Built customer analytics dashboard using Next.js and PostgreSQL, contributing to a \\textbf{25\\%} increase in retention}
        \\resumeItem{Developed RESTful APIs with \\textbf{90\\%+} test coverage, reducing API-related bugs by \\textbf{40\\%}}
        \\resumeItem{Automated infrastructure provisioning using Terraform, cutting deployment from \\textbf{2 hours to 15 minutes}}
        \\resumeItem{Mentored 3 junior engineers through code reviews, accelerating ramp-up time by \\textbf{50\\%}}
      \\resumeItemListEnd

    \\resumeSubheading
      {Web Developer}{Jan 2020 -- May 2021}
      {Freelance}{Remote}
      \\resumeItemListStart
        \\resumeItem{Delivered 10+ client projects using React and Tailwind CSS with a \\textbf{100\\%} on-time delivery record}
        \\resumeItem{Built an e-commerce platform with Stripe integration processing \\textbf{\\$200K+} in transactions in first quarter}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
    \\resumeProjectHeading
      {\\textbf{Project A} $|$ \\emph{Next.js, Prisma, PostgreSQL}}{\\href{https://github.com/janedoe/projecta}{\\faIcon{github} \\, Source Code}}
      \\resumeItemListStart
        \\resumeItem{Open-source project management tool with real-time collaboration features}
        \\resumeItem{Implemented drag-and-drop Kanban boards with optimistic UI updates}
      \\resumeItemListEnd

    \\resumeProjectHeading
      {\\textbf{Project B} $|$ \\emph{Node.js, Express, MongoDB}}{\\href{https://github.com/janedoe/devblog}{\\faIcon{github} \\, Source Code}}
      \\resumeItemListStart
        \\resumeItem{Markdown-powered blogging platform with MDX and syntax highlighting}
        \\resumeItem{RESTful API with JWT auth, rate limiting, and \\textbf{95\\%+} test coverage}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------SKILLS-----------
\\section{Technical Skills}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
      \\textbf{Languages}{: JavaScript, TypeScript, Python, Java, HTML, CSS} \\\\
      \\textbf{Frontend}{: React, Next.js, Redux, Tailwind CSS, Jest} \\\\
      \\textbf{Backend}{: Node.js, Express, FastAPI, PostgreSQL, MongoDB} \\\\
      \\textbf{Tools}{: AWS, Docker, Git, CI/CD, Terraform}
    }}
  \\end{itemize}

\\end{document}`

// ─── Bold ────────────────────────────────────────────────────────────────────

const BOLD_LATEX_SOURCE = `%-------------------------
% Bold Two-Column Resume Template
% Built with Resulyze
%------------------------

\\documentclass[letterpaper,10pt]{article}

\\usepackage[top=0.5in, left=0.5in, right=0.5in, bottom=0.5in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{fontawesome}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

\\definecolor{datecolor}{HTML}{666666}
\\definecolor{rulecolor}{HTML}{999999}

\\urlstyle{same}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Custom commands
\\newcommand{\\headername}[1]{{\\LARGE\\bfseries #1}}
\\newcommand{\\custombold}[1]{\\textbf{#1}}
\\newcommand{\\datecolortext}[1]{{\\footnotesize\\textcolor{datecolor}{#1}}\\hspace{6pt}}
\\newcommand{\\runsubsection}[1]{{\\textbf{#1}}}
\\newcommand{\\descript}[1]{{\\small\\textit{ -- #1}}}
\\newcommand{\\descriptright}[1]{\\\\{\\footnotesize\\textcolor{datecolor}{\\textit{#1}}}\\vspace{4pt}}
\\newcommand{\\sectionsep}{\\vspace{6pt}}

% Section formatting
\\newcommand{\\ressection}[1]{%
  \\vspace{6pt}%
  {\\normalsize\\textbf{#1}}%
  \\\\[-6pt]\\textcolor{rulecolor}{\\rule{\\linewidth}{0.4pt}}%
  \\vspace{2pt}%
}

% Sidebar section
\\newcommand{\\sidesection}[1]{%
  \\vspace{6pt}%
  {\\normalsize\\textbf{#1}}%
  \\\\[-6pt]\\textcolor{rulecolor}{\\rule{5cm}{0.4pt}}%
  \\vspace{2pt}%
}

%-------------------------------------------
\\begin{document}

%----------TWO COLUMN LAYOUT----------
\\begin{minipage}[t]{0.33\\textwidth}
\\begin{large}
  \\headername{Jane Doe}\\\\
\\end{large}
Senior Software Engineer\\\\
Computer Science \\& Engineering\\\\
San Francisco, CA\\\\
5+ years experience

\\sidesection{Links}

\\faGithub\\ \\href{https://github.com/janedoe}{\\custombold{janedoe}} \\\\
\\faLinkedin\\ \\href{https://linkedin.com/in/janedoe}{\\custombold{janedoe}} \\\\
\\faGlobe\\ \\href{https://janedoe.dev}{\\custombold{janedoe.dev}}

\\sidesection{Skills}
\\subsection*{\\footnotesize Languages}
{\\footnotesize JavaScript, TypeScript, Python,\\\\
Java, Go, SQL}
\\vspace{4pt}
\\subsection*{\\footnotesize Frameworks}
{\\footnotesize React, Next.js, Node.js,\\\\
Express, Flask, Spring Boot}
\\vspace{4pt}
\\subsection*{\\footnotesize Infrastructure}
{\\footnotesize AWS, Docker, Kubernetes,\\\\
Terraform, CI/CD, PostgreSQL}
\\vspace{4pt}
\\subsection*{\\footnotesize Tools}
{\\footnotesize Git, Vim, VS Code, Figma,\\\\
Jira, Datadog, Grafana}

\\sidesection{Coursework}

{\\footnotesize
Data Structures \\& Algorithms\\\\
Distributed Systems\\\\
Machine Learning\\\\
Operating Systems\\\\
Database Systems\\\\
Computer Networks
}

\\sidesection{Education}
\\datecolortext{2015--2019}
\\subsection*{\\footnotesize B.S. Computer Science}
{\\footnotesize University of California, Berkeley\\\\
GPA: 3.8/4.0}
\\vspace{6pt}
\\datecolortext{2019--2020}
\\subsection*{\\footnotesize M.S. Computer Science}
{\\footnotesize Stanford University\\\\
Focus: Systems \\& ML}

\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.63\\textwidth}

\\hspace*{0pt}\\hfill \\\\
\\hspace*{0pt}\\hfill San Francisco, CA \\\\
\\hspace*{0pt}\\hfill Mob.: +1 (555) 123-4567 \\\\
\\hspace*{0pt}\\hfill Email:\\textbf{\\href{mailto:jane.doe@email.com}{jane.doe@email.com}} \\\\
\\hspace*{0pt}\\hfill Web:\\textbf{\\href{https://janedoe.dev}{https://janedoe.dev}}

\\ressection{Experience}

\\datecolortext{2022--Present} \\runsubsection{Company A}
\\descript{Senior Software Engineer}
\\noindent
\\hspace{5em}%
\\begin{minipage}{0.85\\textwidth\\vspace{2pt}}
Led migration of monolithic frontend to micro-frontend architecture using React and Module Federation, reducing build times by 60\\% and enabling independent team deployments.
\\end{minipage}
\\descriptright{React, TypeScript, Webpack, Module Federation, AWS CloudFront}
\\sectionsep

\\datecolortext{2020--2022} \\runsubsection{Company B}
\\descript{Software Engineer}
\\noindent
\\hspace{5em}%
\\begin{minipage}{0.85\\textwidth\\vspace{2pt}}
Built real-time analytics dashboard serving 10K+ concurrent users with sub-100ms latency. Designed and implemented RESTful APIs with 95\\%+ test coverage.
\\end{minipage}
\\descriptright{Node.js, PostgreSQL, Redis, D3.js, Docker, Kubernetes}
\\sectionsep

\\datecolortext{2019--2020} \\runsubsection{Startup Inc.}
\\descript{Full Stack Intern}
\\noindent
\\hspace{5em}%
\\begin{minipage}{0.85\\textwidth\\vspace{2pt}}
Developed customer-facing features for SaaS platform serving 5K+ users. Implemented automated testing pipeline reducing QA time by 40\\%.
\\end{minipage}
\\descriptright{Python, Flask, React, PostgreSQL, Jenkins}

\\ressection{Achievements}

\\datecolortext{2023} \\runsubsection{HackMIT}
\\descript{Grand Prize Winner}
\\noindent
\\hspace{5em}%
\\begin{minipage}{0.85\\textwidth\\vspace{2pt}}
Built an AI-powered accessibility tool that generates alt text for images in real-time.
\\end{minipage}

\\datecolortext{2022} \\runsubsection{Open Source}
\\descript{Top Contributor}
\\noindent
\\hspace{5em}%
\\begin{minipage}{0.85\\textwidth\\vspace{2pt}}
500+ GitHub stars across personal projects, active contributor to React ecosystem.
\\end{minipage}

\\ressection{Projects}

\\datecolortext{2023} \\runsubsection{DevBoard -- Real-time Collaboration Tool}
\\descript{Next.js, WebSocket}
\\noindent
\\hspace{5em}%
\\begin{minipage}{0.85\\textwidth\\vspace{4pt}}
A collaborative whiteboard with real-time sync, supporting 50+ concurrent users per room.
\\end{minipage}

\\datecolortext{2022} \\runsubsection{MLFlow -- Model Training Pipeline}
\\descript{Python, PyTorch}
\\noindent
\\hspace{5em}%
\\begin{minipage}{0.85\\textwidth\\vspace{4pt}}
Automated ML pipeline reducing model training and deployment time from days to hours.
\\end{minipage}

\\end{minipage}
\\end{document}`

// ─── Compact ─────────────────────────────────────────────────────────────────

const COMPACT_LATEX_SOURCE = `%-------------------------
% Compact Developer CV Template
% Built with Resulyze
%------------------------

\\documentclass[9pt]{article}

\\usepackage[top=0.4in, left=0.5in, right=0.5in, bottom=0.4in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fontawesome}
\\usepackage{enumitem}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage{tabularx}
\\usepackage{fancyhdr}
\\usepackage{multicol}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlength{\\columnsep}{0mm}
\\setlength{\\tabcolsep}{0pt}

\\definecolor{accentcolor}{HTML}{333333}

% Icon command
\\newcommand{\\icon}[3]{\\raisebox{-0.1em}{\\makebox[1.2em]{\\textcolor{accentcolor}{\\csname fa#1\\endcsname}}}\\hspace{0.3em}{\\small #3}\\\\[2pt]}

% Section heading
\\newcommand{\\cvsect}[1]{%
  \\vspace{6pt}%
  {\\large\\textbf{\\textcolor{accentcolor}{#1}}}%
  \\\\[-6pt]\\textcolor{accentcolor}{\\rule{\\linewidth}{1pt}}%
  \\vspace{4pt}%
}

% Entry command (tag, title, location, description)
\\newcommand{\\cventry}[4]{%
  \\vspace{3pt}%
  {\\footnotesize\\textcolor{gray}{#1}}\\hspace{6pt}%
  {\\textbf{#2}} \\hfill {\\footnotesize\\textcolor{gray}{#3}} \\\\[-2pt]%
  {\\small #4}%
  \\vspace{4pt}%
}

% Slash separator
\\newcommand{\\slashsep}{\\hspace{3pt}/\\hspace{3pt}}

%-------------------------------------------
\\begin{document}

%----------HEADING----------
\\begin{minipage}[t]{0.5\\textwidth}
  \\vspace{-\\baselineskip}
  {\\fontsize{16}{20}\\textcolor{black}{\\textbf{\\MakeUppercase{Jane Doe}}}}

  \\vspace{6pt}
  {\\Large Full-Stack Engineer \\textcolor{gray}{$\\sim$} Developer}
\\end{minipage}%
\\hfill%
\\begin{minipage}[t]{0.2\\textwidth}
  \\vspace{-\\baselineskip}
  \\icon{Globe}{11}{\\href{https://janedoe.dev}{janedoe.dev}}
  \\icon{Phone}{11}{+1 (555) 123-4567}
  \\icon{MapMarker}{11}{San Francisco, CA}
\\end{minipage}%
\\begin{minipage}[t]{0.27\\textwidth}
  \\vspace{-\\baselineskip}
  \\icon{Envelope}{11}{\\href{mailto:jane@email.com}{jane@email.com}}
  \\icon{Github}{11}{\\href{https://github.com/janedoe}{github.com/janedoe}}
  \\icon{LinkedinSquare}{11}{\\href{https://linkedin.com/in/janedoe}{/in/janedoe}}
\\end{minipage}

\\vspace{6pt}

%----------SUMMARY & SKILLS----------
\\begin{minipage}[t]{0.46\\textwidth}
  \\cvsect{Summary}
  \\vspace{-6pt}

  {\\small Full-stack engineer with 5+ years of experience building scalable web applications. Passionate about clean architecture, developer tooling, and delivering high-impact features. Experienced in React, Node.js, Python, and cloud infrastructure.}
\\end{minipage}%
\\hfill%
\\begin{minipage}[t]{0.465\\textwidth}
  \\cvsect{Skills}
  \\vspace{-6pt}

  \\begin{minipage}[t]{0.25\\textwidth}
    {\\small\\textbf{Languages:}}
  \\end{minipage}%
  \\hfill%
  \\begin{minipage}[t]{0.73\\textwidth}
    {\\small JavaScript, TypeScript, Python, Java, Go, SQL, HTML/CSS}
  \\end{minipage}
  \\vspace{3mm}

  \\begin{minipage}[t]{0.25\\textwidth}
    {\\small\\textbf{Technologies:}}
  \\end{minipage}%
  \\hfill%
  \\begin{minipage}[t]{0.73\\textwidth}
    {\\small AWS, Docker, Kubernetes, Terraform, PostgreSQL, Redis, GraphQL}
  \\end{minipage}
\\end{minipage}

%----------PROJECTS----------
\\cvsect{Projects}

\\cventry
  {React, Node.js}
  {Real-time Collaboration Platform}
  {\\href{https://github.com/janedoe/collabboard}{github.com/janedoe/collabboard}}
  {Built a real-time whiteboard with WebSocket sync supporting 50+ concurrent users per room. Implemented conflict-free replicated data types (CRDTs) for seamless collaboration.}

\\cventry
  {Python, PyTorch}
  {ML Model Training Pipeline}
  {\\href{https://github.com/janedoe/mlflow}{github.com/janedoe/mlflow}}
  {Automated end-to-end ML pipeline that reduced model training and deployment time from 3 days to 4 hours. Integrated with MLflow for experiment tracking and model registry.}

\\cventry
  {Next.js, PostgreSQL}
  {Open-Source Project Management Tool}
  {\\href{https://github.com/janedoe/taskflow}{github.com/janedoe/taskflow}}
  {Full-stack Kanban board with real-time updates, drag-and-drop, and GitHub integration. 200+ stars on GitHub with active community contributions.}

\\cventry
  {Go, gRPC}
  {Distributed Task Scheduler}
  {\\href{https://github.com/janedoe/scheduler}{github.com/janedoe/scheduler}}
  {High-throughput distributed task scheduler handling 10K+ jobs per minute with fault tolerance and automatic retry logic.}

%----------EDUCATION----------
\\vspace{-8pt}
\\cvsect{Education}

\\cventry
  {2015 -- 2019}
  {B.S. Computer Science}
  {University of California, Berkeley}
  {GPA: 3.8/4.0. Focus on distributed systems and machine learning.}

\\cventry
  {2019 -- 2020}
  {M.S. Computer Science}
  {Stanford University}
  {Specialization in systems engineering and AI. Published research on distributed consensus.}

%----------EXPERIENCE----------
\\vspace{-8pt}
\\cvsect{Experience}

\\cventry
  {Jan 2022 -- Present}
  {Senior Software Engineer}
  {Company A, San Francisco}
  {\\vspace{-8pt}
  \\begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt,leftmargin=12pt]
    \\item Led migration of monolithic frontend to micro-frontend architecture, reducing build times by 60\\% and enabling independent team deployments across 5 product areas.
    \\item Designed real-time notification system using WebSockets and Redis pub/sub, serving 50K+ concurrent users with sub-100ms delivery latency.
  \\end{itemize}
  \\texttt{React} \\slashsep \\texttt{TypeScript} \\slashsep \\texttt{AWS} \\slashsep \\texttt{Redis}}

\\cventry
  {Jun 2020 -- Dec 2021}
  {Software Engineer}
  {Company B, New York}
  {\\vspace{-8pt}
  \\begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt,leftmargin=12pt]
    \\item Built customer analytics dashboard using Next.js and PostgreSQL, contributing to a 25\\% increase in user retention through data-driven insights.
    \\item Developed RESTful APIs with 95\\%+ test coverage, reducing API-related bugs by 40\\%.
  \\end{itemize}
  \\texttt{Node.js} \\slashsep \\texttt{PostgreSQL} \\slashsep \\texttt{Docker}}

\\cventry
  {May 2019 -- May 2020}
  {Software Engineering Intern}
  {Company C, Seattle}
  {\\vspace{-8pt}
  \\begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt,leftmargin=12pt]
    \\item Implemented automated testing pipeline reducing QA cycle time from 2 days to 3 hours.
    \\item Developed internal tooling used by 30+ engineers for deployment automation.
  \\end{itemize}
  \\texttt{Python} \\slashsep \\texttt{Jenkins} \\slashsep \\texttt{Terraform}}

%----------LANGUAGES----------
\\vspace{-8pt}
\\cvsect{Languages}
\\vspace{-6pt}

\\hspace{12pt} \\textbf{English} -- Native, \\textbf{Spanish} -- Professional proficiency, \\textbf{Mandarin} -- Conversational

\\end{document}`

// ─── Template registry ────────────────────────────────────────────────────────

export const TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modern',
    name: 'Modern',
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
  {
    id: 'developer',
    name: 'Developer',
    description: 'Source Sans Pro with small-caps headings. Built for engineers.',
    tags: ['Developer', 'Tech', 'Structured'],
    source: DEVELOPER_LATEX_SOURCE,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Lato font with FontAwesome icons. Polished and recruiter-friendly.',
    tags: ['Icons', 'Professional', 'ATS'],
    source: PROFESSIONAL_LATEX_SOURCE,
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Two-column layout with bold sidebar. Great for showcasing skills.',
    tags: ['Two-Column', 'Sidebar', 'Bold'],
    source: BOLD_LATEX_SOURCE,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Dense 9pt layout with icon header. Fits maximum content on one page.',
    tags: ['Dense', 'Icons', 'One-Page'],
    source: COMPACT_LATEX_SOURCE,
  },
]

/** Detect which template a LaTeX source was built from. */
export function detectActiveTemplate(source: string): string {
  const trimmed = source.trim()
  for (const t of TEMPLATES) {
    if (trimmed === t.source.trim()) return t.id
  }
  if (trimmed.includes('\\usepackage{palatino}')) return 'classic'
  if (trimmed.includes('\\begin{minipage}[t]{0.30')) return 'sidebar'
  if (trimmed.includes('\\usepackage{XCharter}') || trimmed.includes('\\minsec{')) return 'minimal'
  if (trimmed.includes('sourcesanspro') || trimmed.includes('\\resumeQuadHeading')) return 'developer'
  if (trimmed.includes('fontawesome5') || trimmed.includes('{lato}')) return 'professional'
  if (trimmed.includes('\\headername') || trimmed.includes('\\runsubsection')) return 'bold'
  if (trimmed.includes('\\cvsect') || trimmed.includes('\\cventry')) return 'compact'
  return 'modern'
}
