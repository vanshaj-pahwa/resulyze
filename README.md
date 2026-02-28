<p align="center">
  <img src="public/logo.svg" alt="Resulyze" width="80" />
</p>

<h1 align="center">Resulyze</h1>

<p align="center">
  AI-powered career toolkit that turns any job posting into a tailored resume, cover letter, and interview prep — in minutes.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript" />
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

## Features

- **Intelligent Job Analysis** — Paste any job posting. AI extracts the skills, qualifications, and keywords that matter.
- **LaTeX Resume Editor + Resulyze AI** — Write in LaTeX with live preview. Chat with the AI assistant to optimize your resume against the job description in real time.
- **Cover Letters & Referrals** — Generate role-specific cover letters and concise referral messages that sound like you, not a template.
- **Interview Preparation** — Practice with AI-generated questions drawn from the actual job requirements, complete with model answers and company research.

## Bring Your Own Key (BYOK)

Resulyze runs entirely in your browser with **your own Gemini API key**.

- No sign-up required
- No usage tracking
- Your key never leaves your browser

> Get a free API key at [Google AI Studio](https://aistudio.google.com/apikey).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| UI | React 18, Radix UI, Tailwind CSS |
| Editor | CodeMirror 6 (LaTeX) |
| AI | Google Gemini API |
| Rich Text | Tiptap |
| Export | jsPDF, docx |

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

```bash
git clone https://github.com/vanshaj-pahwa/resulyze.git
cd resulyze
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — no `.env` file needed for basic use. Just enter your Gemini API key in the browser.

> **Optional:** To set a server-side fallback key, create `.env.local` with `GEMINI_API_KEY=your_key`.

## How It Works

1. **Paste the job description** — Skills, requirements, and keywords are extracted automatically.
2. **Refine your resume** — AI suggestions align every detail to the specific role.
3. **Prepare with confidence** — Cover letters, referral messages, and interview questions, ready in minutes.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © Vanshaj Pahwa
