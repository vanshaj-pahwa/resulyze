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

- **Job Analysis** extracts skills, qualifications, and keywords from any job posting. Normalizes 50+ skill aliases and saves your last 5 analyzed JDs for quick switching between roles
- **Resume Editor** gives you a LaTeX editor with live PDF preview and an AI chat assistant that rewrites, optimizes, and scores your resume against the specific job description
- **Cover Letters and Referrals** generates role-specific letters exportable as PDF or plain text. Company-aware tone calibration, achievement cherry-picking from your resume
- **Interview Prep** creates practice questions from the actual job requirements with model answers and company research drawn from the JD context

> **New to LaTeX?** No problem. Just paste your details and let the AI handle the formatting. You get a clean, ATS-friendly resume without writing a single LaTeX command.

Everything runs in your browser. Bring your own Gemini API key.

---

## Features

| Feature | What it does |
|---------|-------------|
| **Resume Review** | Scores your resume 0-100 with a letter grade. Section-by-section breakdown of ATS compliance, content quality, and skill match against the job description |
| **Weak Bullet Detection** | Flags vague or unquantified bullets and suggests specific AI rewrites with metrics and strong action verbs |
| **Skill Match Panel** | Shows your match percentage against the analyzed job description with color-coded matched and missing skills |
| **AI Chat Assistant** | Chat to rewrite, optimize, and tailor your resume. Intent-aware: understands "too long", "add keywords", "fix verbs", and more |
| **Quick Action Chips** | One-click prompts for common tasks: Review, Add metrics, Make concise, Fix verbs, Match JD |
| **Live PDF Preview** | High-fidelity canvas rendering with zoom, retina support, clickable link annotations, and responsive resizing |
| **Resume Versioning** | Every AI edit is auto-saved with a timestamp. Restore any version in one click |
| **Page Overflow Detection** | Detects when your resume exceeds one page and suggests AI-powered trims to fit |
| **Editor Intelligence** | LaTeX autocomplete, real-time linting with inline diagnostics, document outline panel, and diff gutter showing changed lines |
| **JD History** | Last 5 analyzed job descriptions are saved. Preview, delete, or switch between them |
| **Code Search** | Find and replace across your LaTeX source with case, regex, and whole-word filter support |
| **Keyboard Shortcuts** | `Ctrl+Enter` to compile, `Ctrl+Shift+L` to toggle AI chat |
| **Persistent State** | Resume, job data, chat history, and preferences all survive page refreshes via localStorage |
| **PDF and Text Export** | Download resumes and cover letters as PDF or plain text |
| **Mobile Responsive** | Full access on mobile: editor, review panel, and chat open as a bottom sheet overlay |

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
| **Editor** | CodeMirror 6 (LaTeX syntax, autocomplete, linting) |
| **PDF** | pdf.js, jsPDF |
| **AI** | Google Gemini API (gemini-2.0-flash) |
| **Rich Text** | Tiptap |

---

## BYOK (Bring Your Own Key)

Your Gemini API key stays in your browser. It is sent directly to Google's API from the client. Resulyze never stores, logs, or proxies your key. Your resume, job descriptions, and chat history are stored exclusively in localStorage and never leave your device.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) &copy; Vanshaj Pahwa
