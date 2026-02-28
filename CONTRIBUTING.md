# Contributing to Resulyze

Thanks for your interest in contributing to Resulyze! We welcome contributions of all kinds — bug fixes, new features, documentation improvements, and more.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Development Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/<your-username>/resulyze.git
   cd resulyze
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** No `.env` file is needed for basic use — users provide their own Gemini API key via the browser UI (BYOK). If you want a server-side fallback key, create a `.env.local` with `GEMINI_API_KEY=your_key`.

## Code Conventions

- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Framework:** Next.js 14 (App Router)
- **Components:** Radix UI primitives + custom components
- **Formatting:** Follow the existing code style in the project

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — A new feature
- `fix:` — A bug fix
- `docs:` — Documentation changes
- `refactor:` — Code changes that neither fix a bug nor add a feature
- `chore:` — Maintenance tasks (deps, CI, etc.)

Example: `feat: add dark mode toggle to settings`

## Pull Request Process

1. **Fork** the repository and create a new branch from `master`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** — keep PRs focused on a single concern.

3. **Test** your changes locally to make sure nothing is broken.

4. **Push** your branch and open a Pull Request:

   ```bash
   git push origin feat/your-feature-name
   ```

5. Fill out the PR template with a clear description of your changes.

6. A maintainer will review your PR and may request changes.

## Reporting Bugs & Requesting Features

- **Bug reports** → [Open an issue](https://github.com/vanshaj-pahwa/resulyze/issues/new?template=BUG_REPORT.md)
- **Feature requests** → [Open an issue](https://github.com/vanshaj-pahwa/resulyze/issues/new?template=FEATURE_REQUEST.md)
