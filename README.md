<p align="center">
  <img src="public/logo.svg" alt="Resulyze" width="80" />
</p>

<h1 align="center">Resulyze</h1>

<p align="center">
  <strong>Paste a job posting. Get a tailored LaTeX resume, cover letter, and interview prep.</strong><br/>
  No sign-up. No tracking. Just your Gemini API key and your browser.
</p>

<p align="center">
  <a href="https://smartresulyze.vercel.app"><img src="https://img.shields.io/badge/Live-smartresulyze.vercel.app-black?style=flat-square" alt="Live Demo" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square" alt="TypeScript" />
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" /></a>
</p>

---

## What is Resulyze?

Resulyze is an AI-powered career toolkit with four tools you can use in any order:

- **Job Analysis** extracts skills, qualifications, and keywords from any job posting. Recent analyses are saved so you can switch between roles
- **Resume Editor** lets you write LaTeX with a live PDF preview and an AI chat that optimizes your resume for ATS and the specific job description
- **Cover Letters & Referrals** generates role-specific letters exportable as PDF, plain text, or directly via email. Works with or without a prior job analysis
- **Interview Prep** creates practice questions from the actual job requirements with model answers and company research

> **New to LaTeX?** No problem. Just paste your details and let the AI handle the formatting and LaTeX coding. You get a clean, ATS-friendly resume without writing a single LaTeX command.

Everything runs in your browser. Bring your own Gemini API key.

---

## Features

| Feature | What it does |
|---------|-------------|
| **AI Chat Assistant** | Chat with AI to rewrite, optimize, and tailor your resume for ATS and recruiters |
| **Live PDF Preview** | High-fidelity canvas rendering with zoom, retina support, and responsive resizing |
| **Resume Versioning** | Every AI edit is auto-saved with a timestamp. Restore any version in one click |
| **AI-Generated Titles** | Resume titles are auto-generated from your content. Edit anytime |
| **JD History** | Last 5 analyzed job descriptions are saved. Preview, delete, or switch between them in one click |
| **Persistent State** | Job data, resume, chat history, and progress all survive page refreshes |
| **Code Search** | Find and replace across your LaTeX source. Match case, regex, and whole-word filters built in |
| **Keyboard Shortcuts** | `Ctrl+Enter` to compile, `Ctrl+Shift+L` to toggle AI chat |
| **Route-Based Navigation** | Each step has its own URL. Refresh or share a link and land right where you left off |
| **PDF & Text Export** | Download resumes and cover letters as PDF or plain text |

---

## Quick Start

```bash
git clone https://github.com/vanshaj-pahwa/resulyze.git
cd resulyze
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). Enter your Gemini API key in the browser. That's it.

> Get a free key at [Google AI Studio](https://aistudio.google.com/apikey)

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 18, Radix UI, Tailwind CSS |
| **Editor** | CodeMirror 6 (LaTeX) |
| **PDF** | pdf.js, jsPDF |
| **AI** | Google Gemini API |
| **Rich Text** | Tiptap |

---

## BYOK (Bring Your Own Key)

Your Gemini API key stays in your browser. It's sent directly to Google's API from the client. Resulyze never stores, logs, or proxies your key.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) &copy; Vanshaj Pahwa
