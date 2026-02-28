export const DEFAULT_LATEX_SOURCE = `%-------------------------
% Sample Resume Template
% Built with Resulyze
% Author: Vanshaj Pahwa
%------------------------

\\documentclass[letterpaper,10.9pt]{article}

\\usepackage{latexsym}
\\usepackage{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{geometry}
\\usepackage[scale=0.90,lf]{FiraMono}
\\usepackage{tgheros}
\\usepackage[T1]{fontenc}

% Colors
\\definecolor{text-grey}{gray}{.08}

% Sans serif default
\\renewcommand*\\familydefault{\\sfdefault}

% Page style
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\cfoot{\\footnotesize\\textcolor{gray}{Built with Resulyze}}

% Margins
\\geometry{
  top=1.1cm,
  left=1.1cm,
  right=1.1cm,
  bottom=1.1cm
}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{
    \\bfseries \\vspace{2pt} \\large
}{}{0em}{}[\\vspace{-4pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{{#1 \\vspace{-1pt}}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#3} $|$ {#1} & {\\small #2}\\vspace{1pt}\\\\
      {\\small #4} & {}\\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      #1 & {\\small #2} \\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{0pt}}

\\color{text-grey}

%-------------------------------------------
\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge Jane Doe} \\\\ \\vspace{5pt}
    \\small +1 (555) 123-4567 $|$ \\href{mailto:jane.doe@email.com}{jane.doe@email.com} $|$ \\href{https://linkedin.com/in/janedoe}{linkedin.com/in/janedoe} $|$ \\href{https://github.com/janedoe}{github.com/janedoe}
    \\\\ \\vspace{-3pt}
\\end{center}

%-----------PROFILE-----------
\\section{Profile}
 \\begin{itemize}[leftmargin=0in, label={}]
    \\small{\\item{
     Full-Stack Software Engineer with \\textbf{4+ years} of experience building scalable \\textbf{web applications} and \\textbf{cloud-native systems}. Skilled in \\textbf{React, TypeScript, Node.js, and Python}, with a track record of delivering high-impact features that improve user engagement and system reliability.
    }}
 \\end{itemize}

%-----------SKILLS-----------
\\section{Skills}
 \\begin{itemize}[leftmargin=0in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: JavaScript, TypeScript, Python, Java, HTML, CSS} \\\\
     \\textbf{Frontend}{: React, Next.js, Redux, Tailwind CSS, Jest} \\\\
     \\textbf{Backend}{: Node.js, Express, FastAPI, PostgreSQL, MongoDB} \\\\
     \\textbf{Tools}{: AWS, Docker, Git, CI/CD, Terraform}
    }}
   \\end{itemize}

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart

    \\resumeSubheading
      {Company A}{Jan 2024 -- Present}
      {Senior Software Engineer}{San Francisco, CA}
      \\resumeItemListStart
        \\resumeItem{Led migration of monolithic frontend to micro-frontend architecture using React and Module Federation, reducing build times by \\textbf{60\\%} and enabling independent team deployments}
        \\resumeItem{Designed and shipped a real-time notification system using WebSockets and Redis pub/sub, serving \\textbf{50K+ concurrent users} with sub-100ms delivery latency}
        \\resumeItem{Implemented automated performance monitoring with custom Lighthouse CI pipelines, improving Core Web Vitals scores by \\textbf{35\\%} across all product pages}
      \\resumeItemListEnd

    \\resumeSubheading
      {Company B}{Jun 2021 -- Dec 2023}
      {Software Engineer}{New York, NY}
      \\resumeItemListStart
        \\resumeItem{Built a customer analytics dashboard using Next.js, D3.js, and PostgreSQL, providing actionable insights that contributed to a \\textbf{25\\%} increase in user retention}
        \\resumeItem{Developed RESTful APIs using Node.js and Express with comprehensive test coverage (\\textbf{90\\%+}), reducing API-related bugs by \\textbf{40\\%}}
        \\resumeItem{Automated infrastructure provisioning using Terraform and AWS CDK, cutting deployment time from \\textbf{2 hours to 15 minutes}}
        \\resumeItem{Mentored 3 junior engineers through code reviews and pair programming sessions, accelerating their ramp-up time by \\textbf{50\\%}}
      \\resumeItemListEnd

    \\resumeSubheading
      {Freelance}{Jan 2020 -- May 2021}
      {Web Developer}{Remote}
      \\resumeItemListStart
        \\resumeItem{Delivered 10+ client projects using React, Next.js, and Tailwind CSS, maintaining a \\textbf{100\\%} on-time delivery record}
        \\resumeItem{Built an e-commerce platform with Stripe integration processing \\textbf{\\$200K+} in transactions within the first quarter}
      \\resumeItemListEnd

  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
      \\resumeProjectHeading
          {\\textbf{Project A} $|$ Open-source project management tool built with Next.js, Prisma, and PostgreSQL}{\\href{https://github.com/janedoe/taskflow}{GitHub}}
      \\resumeProjectHeading
          {\\textbf{Project B} $|$ Markdown-powered blogging platform with MDX, syntax highlighting, and RSS feeds}{\\href{https://github.com/janedoe/devblog}{GitHub}}
    \\resumeSubHeadingListEnd

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
        {University of California, Berkeley}{2020}
        {Bachelor of Science in Computer Science}{Berkeley, CA}
  \\resumeSubHeadingListEnd

%-----------ACHIEVEMENTS-----------
\\section{Achievements}
 \\begin{itemize}[leftmargin=0in, label={}]
    \\small{\\item{
     \\textbf{AWS Certified}: Solutions Architect Associate \\vspace{2pt} \\\\
     \\textbf{Hackathon Winner}: First place at HackNY 2023 for building an AI-powered accessibility tool \\vspace{2pt} \\\\
     \\textbf{Open Source}: 500+ GitHub stars across personal projects, active contributor to React ecosystem
    }}
  \\end{itemize}

\\end{document}`
