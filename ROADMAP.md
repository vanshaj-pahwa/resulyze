# Resulyze Roadmap

A prioritized list of improvements, new features, and optimizations for Resulyze.

---

## Current State

Resulyze is a fully functional AI-powered career toolkit with four core tools: Job Analysis, LaTeX Resume Editor, Cover Letter Generator, and Interview Prep. It runs entirely client-side with a BYOK (Bring Your Own Key) model using Google Gemini. Data persists in localStorage.

---

## AI Intelligence (The Big One)

The AI in Resulyze is functional but basic. Every prompt is a single-shot instruction with minimal context. There's no document understanding, no resume expertise baked in, no feedback loop. This section is about turning the AI from a generic text transformer into the smartest resume assistant on the internet.

### What's wrong today (brutally honest)

- **The chat assistant is a LaTeX formatter, not a resume expert.** It knows how to edit LaTeX syntax but has zero understanding of what makes a resume actually good. It can't tell you your bullets are weak, your summary is generic, or your experience section buries the lead.
- **"Optimize for JD" is keyword find-and-replace.** The optimization endpoint rephrases bullets with JD terminology but doesn't understand which achievements matter, which are irrelevant, or whether the resume even makes strategic sense for the role.
- **Skill matching is substring search.** `"Java"` matches `"JavaScript"`. `"React"` matches `"Reactive"`. There's no synonym handling, no semantic similarity, no skill taxonomy. The match percentage is unreliable.
- **Company research is hallucinated.** The research-company endpoint sends only a company name to Gemini and asks it to describe the interview process. It invents plausible-sounding processes with zero real data. This is actively misleading.
- **Interview fallback questions are hardcoded for React developers.** If Gemini fails, the app falls back to React/JavaScript questions regardless of the actual role.
- **Cover letter generation has no company knowledge.** The prompt says "show company knowledge" but provides none. The AI either hallucates or writes generic filler.
- **No resume review exists at all.** Users can optimize against a JD but can never get honest, standalone feedback on their resume quality.

### Resume Reviewer ✅ Done

A dedicated "Review" panel in the resume editor that gives a brutally honest, no-sugarcoating assessment of the resume.

- [x] **Overall score (0-100)** with letter grade and one-line verdict
- [x] **Section-by-section breakdown** (contact info, experience, skills, education, projects, formatting)
- [x] **ATS compliance check** with findings and suggestions
- [x] **Content quality flags:** weak bullets with rewrites, missing metrics, vague claims, redundant points
- [ ] **Structural feedback:** section ordering for candidate's level, white space balance — *not yet scored separately*
- [x] **Actionable fixes:** every criticism has a specific rewrite suggestion
- [ ] **Review updates live** as the user edits (debounced, not on every keystroke) — *currently manual trigger only*
- [x] **JD-aware mode:** when a JD is loaded, scores relevance to that specific role

### Smart Page Overflow Handling ✅ Done (core flow)

When a resume spills to two pages, the AI should fix it intelligently — not just tell the user to "remove some content."

- [x] **Auto-detect overflow:** after compilation, checks if PDF is >1 page, shows banner
- [x] **AI-powered trimming:** endpoint ranks bullets by impact + JD relevance, suggests removals before spacing hacks
- [x] **One-click fix:** user accepts AI trimming with one click from the overflow banner
- [ ] **Preserve mode:** user can mark bullets as "keep no matter what" — *not implemented*
- [ ] **Length target:** support 1-page and 2-page targets — *always targets 1 page currently*

### Smarter Chat Assistant ✅ Partially Done

The chat should understand resumes, not just LaTeX.

- [x] **Intent detection:** "too long" → suggests cuts; "keywords" → cross-references JD; "review" → scores against rules
- [x] **Achievement rewriting engine:** XYZ formula enforced via knowledge base; strong action verbs; pushes for metrics
- [x] **Quick action chips:** "Review my resume", "Add metrics", "Make concise", "Fix verbs", "Match JD keywords"
- [ ] **Resume structure awareness:** parse LaTeX into sections before each interaction so AI says "your 2nd bullet under Alterest" not "line 87" — *AI uses human-readable refs in prompt but doesn't parse the document*
- [ ] **Conversation memory:** summarize older messages instead of dropping them — *not implemented*
- [ ] **Streaming responses:** show response as it generates — *not implemented*

### AI-Guided Resume Builder ⚠️ Scaffold Only

When a user starts with an empty editor or clicks "Build my resume," the AI should run a structured interview — asking questions one by one until it has enough to generate a complete, polished LaTeX resume.

- [x] **Data model** (`BuilderData`) and conversation flow scaffold (`lib/ai/builder-flow.ts`) created
- [x] **Builder mode** wired into chat-latex route and useChatLatex hook
- [x] **"Build from scratch" button** in empty chat state
- [ ] **Full question flow** (career stage → contact → education → experience → projects → skills → generate) — *scaffold exists, not fully prompted*
- [ ] **Progress indicator** showing current phase/section — *not implemented*
- [ ] **Skip and come back** — *not implemented*
- [ ] **Save progress** across sessions — *not implemented*

### Smarter JD Analysis ⚠️ Partially Done

The current analysis extracts flat lists. It should understand the job deeply.

- [x] **Skill taxonomy:** `SKILL_ALIASES` map normalizes "ReactJS" → "React", "K8s" → "Kubernetes", etc. Integrated into JD processing and SkillMatchPanel
- [x] **Expanded output:** `seniorityLevel`, `responsibilities[]`, `cultureSignals`, skill `required/preferred/bonus` tagging
- [ ] **Skill prioritization by frequency:** rank skills by mention count across JD — *schema added but AI scoring is qualitative*
- [ ] **Red flag detection:** unrealistic requirements, salary mismatch signals — *not implemented*

### Smarter Skill Matching ⚠️ Partially Done

Replace naive substring matching with real intelligence.

- [x] **False positive elimination:** word-boundary regex stops "Java" matching inside "JavaScript"
- [x] **Alias map:** bidirectional lookup — "ReactJS" → "React", "postgres" → "PostgreSQL", etc. (~50 entries)
- [ ] **Semantic matching:** embeddings or taxonomy to match "Redux" → "state management" — *not implemented*
- [ ] **Weighted scoring:** skills in JD title / first paragraph score higher — *not implemented*
- [ ] **Gap analysis with suggestions:** "Docker appears 3× in JD — add it to your Alterest bullet" — *not implemented*
- [ ] **Inferred skills:** "Kubernetes + Terraform" → infer "Docker" — *not implemented*

### Smarter Cover Letters ✅ Done

- [x] **Achievement cherry-picking:** picks 2-3 most impressive achievements that map to JD requirements
- [x] **Company-aware tone:** uses JD language cues to calibrate formality; startup vs enterprise
- [x] **Name extraction:** parses candidate's actual name from resume instead of "[Your Name]"
- [ ] **Unique value proposition:** "why pick you over 200 others" angle — *partially addressed via knowledge injection*

### Smarter Interview Prep ⚠️ Partially Done

- [x] **Role-generic fallback questions:** replaced hardcoded React questions with `generateFallbackQuestions(jobData, resumeData)` — adapts to any role
- [ ] **Difficulty calibration:** junior → fundamentals; senior → system design; staff → cross-org impact — *not implemented*
- [ ] **Resume-grounded answers:** model answers reference candidate's actual projects — *partially via knowledge injection*
- [ ] **Follow-up chains:** 2-3 likely follow-ups per question — *not implemented*
- [ ] **Weakness-targeting questions:** probe weakest areas vs JD — *not implemented*

### Company Research ✅ Done

The current company research endpoint is dangerous — it invents interview processes from thin air.

- [x] **Honest about uncertainty:** explicitly states when it lacks verified data; `confidenceLevel` field in output
- [x] **Use JD as source:** extracts process hints from JD text ("technical assessment", "panel interview")
- [x] **Industry-calibrated defaults:** adjusts for company size/type signals
- [x] **Preparation focus over process prediction:** focuses on what to prepare for based on JD, not invented round names
- [x] **InterviewPrep wired up:** passes `jobDescription` to research API call

### Resume Knowledge Base as RAG Context ✅ Done

A comprehensive resume writing knowledge base (`lib/knowledge/resume-rules.md`, ~364 lines). Injected as system context into AI endpoints.

- [x] **Fed to chat-latex** — full knowledge base; AI enforces STAR/XYZ, flags weak verbs, understands section ordering
- [x] **Fed to optimize-latex** — condensed version (~1.5K tokens)
- [x] **Fed to optimize-resume** — all 3 modes (checklist, skills, general)
- [x] **Fed to resume reviewer** — used as scoring rubric
- [x] **Fed to cover letter** — condensed version
- [x] **Condensed version** created for token-constrained endpoints
- [x] **Updatable standalone markdown** — all endpoints pick up changes automatically

---

## Editor Intelligence (Make It Feel Like VS Code)

The CodeMirror 6 editor works but it's a basic text area with syntax highlighting. No autocomplete, no error detection, no smart editing. For a LaTeX resume editor, this is the difference between "usable" and "people won't shut up about it."

### What's there today

- Syntax highlighting (LaTeX via legacy stex mode)
- Line numbers, active line highlight, bracket matching
- Code folding, indent on input, line wrapping
- Find & Replace with regex, case-sensitive, whole-word
- Undo/redo, tab indentation
- Ctrl+Enter to compile, Ctrl+Shift+L for chat
- Custom dark theme (Prism-inspired)
- **Light theme with auto-switch** ✅

### What's missing

~~`@codemirror/autocomplete` and `@codemirror/lint` are both installed in node_modules but **never imported or used**. The editor has zero intelligence.~~

### LaTeX Autocomplete ✅ Done (core)

- [x] **Command completions:** Type `\` and get a dropdown — `\textbf{}`, `\emph{}`, `\href{}{}`, `\section{}`, `\begin{}`. Cursor placed inside braces after selection.
- [x] **Environment snippets:** Type `\begin{` and get environment options with auto-inserted `\end{}`.
- [ ] **Preamble-aware completions:** Parse the user's `\usepackage{}` declarations and offer completions specific to loaded packages — *not implemented*
- [x] **Resume-specific snippets:** Quick-insert templates for common resume patterns (experience entry, project entry, education, skills row, section)
- [x] **Closing brace/environment auto-insert:** Type `{` and auto-insert `}` with cursor between them. Same for `[`, `(`, `$`
- [x] **Smart trigger:** Completions only show after `\` for commands, after `\begin{` for environments

### LaTeX Linting & Error Detection ✅ Done (core)

- [x] **Brace matching errors:** Detects unclosed `{`, `}`, `[`, `]` with inline squiggly underlines
- [x] **Environment mismatch:** Flags `\begin{itemize}` without matching `\end{itemize}` and mismatched names
- [ ] **Compilation error integration:** Parse compile error line numbers and show inline in gutter — *errors still only shown in preview panel*
- [ ] **Missing package warnings:** Warn if `\href` used without `\usepackage{hyperref}` — *not implemented*
- [x] **Undefined command detection:** Flags commands not in standard LaTeX or preamble, with quick-fix actions

### Smart Editing Features ✅ Done (core)

- [x] **Comment toggle (Ctrl+/):** Toggle `%` comment on selected lines — LaTeX comment shortcut
- [x] **Multi-cursor (Ctrl+D):** Select current word, then Ctrl+D to select next occurrence
- [x] **Duplicate line (Ctrl+Shift+D):** Duplicate current line or selection
- [x] **Move line (Alt+Up/Down):** Move current line or selection up/down — essential for reordering bullets
- [x] **Delete line (Ctrl+Shift+K):** Delete entire current line.
- [x] **Bracket auto-close:** Typing `{` auto-inserts `}` with cursor between them. Same for `[`, `(`, `$`
- [x] **Smart backspace:** Deleting `{` also deletes the matching `}` if it's empty
- [x] **Select enclosing (Ctrl+Shift+M):** Expand selection to enclosing braces/environment via `selectParentSyntax`
- [x] **Indent/outdent (Tab/Shift+Tab on selection):** Indent or outdent multiple selected lines

### Visual Enhancements ✅ Done (core)

- [x] **Indent guides:** Custom `ViewPlugin` draws subtle vertical border lines at each indentation level, updates on viewport scroll
- [x] **Whitespace rendering:** ¶ toggle button in toolbar; `highlightWhitespace` Compartment shows spaces/tabs as faint symbols
- [x] **Matching bracket highlight:** Vivid teal/blue background + border on matching `{}` pair; red for mismatches — both dark and light themed
- [ ] **Sticky scroll:** Not implemented — editor viewport doesn't currently pin the current section header
- [ ] **Minimap (stretch goal):** A zoomed-out view of the full document on the right side of the editor, like VS Code.
- [x] **Diff gutter markers:** When AI modifies the LaTeX, green markers appear in the gutter next to changed lines (like VS Code's git diff indicators).

### Document Structure & Navigation ✅ Done (core)

- [x] **Outline panel:** Sidebar showing the document structure — all `\section{}`, `\subsection{}`, `\subsubsection{}` as a live navigable tree. Click to jump to line.
- [ ] **Breadcrumbs:** Persistent section bar above editor — removed, not needed
- [x] **Go to section (Ctrl+Shift+O):** Fuzzy-search palette modal — type to filter, Enter to jump, shows `:line` numbers
- [ ] **Symbol matching:** Ctrl+Click on `\ref{label}` jumps to the `\label{label}` definition — *not implemented*

### Light Theme ✅ Done

- [x] **Light mode editor theme:** full Prism-inspired light theme with proper syntax colors
- [x] **Auto-switch:** follows the app's dark/light mode toggle via MutationObserver

### Performance

- [ ] **Large document handling:** For resumes this isn't critical (typically <200 lines), but if templates grow or users paste large content, ensure smooth performance with CodeMirror's built-in viewport culling.
- [ ] **Debounced change events:** Currently every keystroke triggers `onChange`. Add a small debounce (50-100ms) for smoother typing on slower machines.

---

## High Priority

### Resume Templates Library
- [ ] Add 3-5 professionally designed LaTeX templates (modern, classic, minimal, two-column, academic)
- [ ] Template picker UI on first visit or via a "Templates" button in the editor toolbar
- [ ] Each template tagged with style, ATS score, and preview thumbnail
- [ ] Switching templates preserves user content (name, experience, skills) where possible

### Resume Import (PDF / DOCX)
- [ ] Upload an existing resume (PDF or DOCX) and auto-extract content
- [ ] Parse into structured data (name, experience, skills, education) via Gemini
- [ ] Auto-populate a LaTeX template with extracted data
- [ ] The `/api/parse-resume` endpoint already exists but isn't wired to the UI

### Diff View for Optimizations
- [ ] When AI optimizes the resume or chat applies changes, show a side-by-side or inline diff
- [ ] Highlight additions (green), removals (red), and modifications (yellow)
- [ ] Accept/reject individual hunks instead of all-or-nothing
- [ ] Use a lightweight diff library (e.g., `diff` or `jsdiff`)

### ATS Compatibility Score ✅ Done

- [x] ATS compliance check with findings and suggestions — *part of Resume Review panel*
- [x] Actionable fixes per finding — *integrated into Resume Review*
- [x] Dedicated ATS score panel separate from the full review flow
- [x] Score broken down by: keyword density, formatting compliance, section completeness, file parsability
- [x] Analyzes the compiled PDF via Gemini multimodal — exactly what ATS bots see
- [x] Auto-triggers after each compilation (no manual trigger needed)
- [x] Suggestions grouped inline under each compliance dimension bar
- [x] Missing keywords clickable to send to chat; suggestions have "Ask AI to fix" button
- [x] Split-pill diagnostic badge in PDF preview toolbar (score-colored, bouncing-dots loading state)

### Mobile Responsiveness ✅ Partially Done

- [x] Chat and Resume Review panels open as a bottom sheet overlay on mobile (fixed bottom, `h-[65vh]`, drag handle, backdrop dismiss)
- [x] Desktop layout unchanged — `lg:static` override keeps side-by-side on larger screens
- [ ] Code panel and PDF preview still stack poorly on very small screens — *not yet addressed*
- [ ] Touch-friendly zoom/pan controls for PDF preview — *not implemented*

---

## Medium Priority

### Export Formats
- [ ] Export cover letters as formatted PDF (currently plain text via jsPDF)
- [ ] Export resume as Word (.docx) using a library like `docx`
- [ ] Export interview prep as PDF study guide
- [ ] One-click "Export All" bundle (resume + cover letter + interview notes)

### Interview Prep Enhancements
- [ ] Timer mode for mock interviews (2 min per answer)
- [ ] Save/bookmark favorite questions
- [ ] Track which questions have been practiced
- [ ] Generate follow-up questions based on user's answer
- [x] Remove hardcoded React fallback questions — make fallback generic

### Cover Letter Improvements
- [ ] Live preview panel (like the resume editor) instead of raw text
- [ ] Tone selector: formal, conversational, confident, humble
- [ ] Length control: short (2 paragraphs), standard (3-4), detailed (5+)
- [ ] Version history for cover letters (currently regenerates from scratch)

### Smarter AI Chat
- [ ] Streaming responses instead of waiting for full completion
- [ ] Context-aware message trimming (summarize old messages instead of dropping them)
- [ ] Send diffs instead of full LaTeX source on each message to reduce tokens
- [ ] Show token usage / estimated API cost per message
- [x] Suggested quick actions: "Make more concise", "Add metrics", "Reorder skills"

### Keyboard Shortcuts Expansion
- [ ] `Ctrl+S` to save version
- [ ] `Ctrl+Z` / `Ctrl+Shift+Z` for undo/redo in chat changes (not just editor)
- [x] `Ctrl+/` to toggle comments in LaTeX
- [x] `Tab` / `Shift+Tab` for indentation in editor
- [ ] Shortcuts cheatsheet accessible via `?` key

### Job Description URL Parsing
- [ ] Current URL fetching uses regex-based HTML stripping — fragile
- [ ] Use a headless extraction approach or a readability library
- [ ] Support common job boards: LinkedIn, Indeed, Greenhouse, Lever, Workday
- [ ] Auto-detect and extract structured job data from these platforms

---

## Low Priority

### Multi-Resume Management
- [ ] Support multiple resumes (e.g., "Frontend Resume", "Fullstack Resume")
- [ ] Resume switcher in the editor toolbar
- [ ] Each resume has its own version history and chat history
- [ ] Link specific resumes to specific job analyses

### Analytics Dashboard
- [ ] Track: resumes created, cover letters generated, interviews prepped
- [ ] Show optimization history: which changes were applied over time
- [ ] Word cloud of most-used skills across all analyzed JDs
- [ ] All data stays local (localStorage or IndexedDB)

### Offline Support
- [ ] Service worker for caching static assets
- [ ] Offline mode for editing LaTeX (compilation requires network)
- [ ] Queue API calls when offline, execute when back online
- [ ] Show clear offline indicator with limited functionality notice

### Internationalization
- [ ] UI language selector (English, Spanish, French, German, etc.)
- [ ] AI-generated content in user's preferred language
- [ ] LaTeX templates for different regional resume formats (US, EU, etc.)

### Collaboration & Sharing
- [ ] Generate a shareable link for a resume (read-only, time-limited)
- [ ] Export as a self-contained HTML page
- [ ] QR code generation for quick mobile access to resume PDF

---

## Technical Debt & Code Quality

### Testing
- [ ] Add unit tests for all custom hooks (`useJobData`, `useChatLatex`, `useResumeVersions`, etc.)
- [ ] Add integration tests for API routes
- [ ] Add component tests for critical UI flows (job analysis, chat, optimization)
- [ ] Set up CI pipeline with test runner (Vitest recommended for Next.js)

### Refactoring
- [ ] Break up `LatexEditor.tsx` (545 lines) into smaller composable pieces
- [ ] Extract localStorage keys into a single constants file
- [ ] Replace `any` types with proper TypeScript interfaces throughout
- [ ] Standardize error handling pattern across all API routes
- [x] Extract retry logic into a shared utility (`lib/ai/generate.ts`)

### Performance
- [ ] Memoize expensive CodeMirror re-renders
- [ ] Virtualize long lists (version history, chat messages, JD history)
- [ ] Add `loading.tsx` skeletons for all dashboard routes
- [ ] Lazy load pdf.js worker only when preview panel is visible
- [ ] Consider IndexedDB for large data (resume versions) to avoid localStorage limits

### Security
- [ ] Add Content Security Policy headers
- [ ] Sanitize user input before interpolating into AI prompts
- [ ] Add rate limiting middleware for API routes
- [ ] Consider encrypting localStorage data (especially API key)
- [ ] Add CSRF token validation on API routes

### Developer Experience
- [ ] Add ESLint rules for consistent patterns
- [ ] Add Prettier for code formatting
- [ ] Set up Husky pre-commit hooks
- [ ] Add `CONTRIBUTING.md` with architecture overview
- [ ] Document all localStorage keys and their schemas

---

## Model & API

### Gemini Model Consistency
- [ ] Standardize on one model version across all endpoints (currently mixed: `gemini-2.0-flash` and `gemini-3-flash-preview`)
- [ ] Add model configuration so users can choose between speed (Flash) and quality (Pro)
- [ ] Handle model deprecation gracefully with fallback

### Multi-Provider Support
- [ ] Support OpenAI (GPT-4o) as an alternative to Gemini
- [ ] Support Anthropic (Claude) as an alternative
- [ ] Provider selector in settings with per-provider API key storage
- [ ] Abstract AI calls behind a provider interface

---

## Completed

- [x] Unlock all dashboard tabs (no step locking)
- [x] JD analysis history (last 5, with preview/delete/select)
- [x] Inline job form for cover letter and interview when no JD exists
- [x] Fix JD persistence when navigating between tabs
- [x] Reset button for JD analysis
- [x] Clickable links in PDF preview
- [x] Code search with find & replace
- [x] New to LaTeX callout for beginners
- [x] Resume version history with restore
- [x] AI chat assistant for resume editing
- [x] Dark mode support
- [x] BYOK (Bring Your Own Key) system
- [x] Light mode support (editor, all panels, chat, review, skill match)
- [x] Resume knowledge base (`lib/knowledge/resume-rules.md`) injected into all AI endpoints
- [x] Shared `generateWithRetry` utility (`lib/ai/generate.ts`) across all routes
- [x] Skill matching word-boundary fix (Java no longer matches JavaScript)
- [x] Skill alias map — 50+ aliases (`lib/ai/skill-taxonomy.ts`) in JD processing + SkillMatchPanel
- [x] Dynamic fallback interview questions (role-aware, not hardcoded React)
- [x] Company research honesty rewrite — confidence levels, JD-derived process hints
- [x] Resume Review panel — score, grade, section breakdown, ATS check, weak bullet rewrites
- [x] Page overflow detection + AI trim endpoint + overflow banner
- [x] Quick action chips in chat (Review, Add metrics, Make concise, Fix verbs, Match JD)
- [x] Intent-aware chat system prompt (too long → cuts; keywords → cross-references JD)
- [x] AI-guided builder scaffold — data model, flow types, chat mode wiring
- [x] Cover letter name extraction + achievement cherry-picking + tone calibration
- [x] Light/dark scrollbar theming for CodeMirror via CSS variables
- [x] LaTeX autocomplete — command completions, environment snippets, resume-specific snippets, triggered on `\`
- [x] Real-time linting — unclosed braces, environment mismatches, unknown commands, inline diagnostics with quick-fix actions
- [x] Document outline panel — live tree of `\section`, `\subsection`, `\subsubsection` with click-to-navigate
- [x] Diff gutter — changed-line markers in the editor gutter after AI edits (like VS Code git indicators)
- [x] Mobile bottom sheet for chat and resume review panels (fixed overlay with drag handle, backdrop dismiss)
- [x] Unified toolbar design system across editor, preview, and version history (consistent height, button sizing, separators)
- [x] Redesigned VersionHistory — compact git-log-style rows with inline LaTeX preview
- [x] Redesigned SkillMatchPanel — color-coded progress bar (emerald/amber/rose by match %)
- [x] ResumeReviewPanel color contrast improvements — stronger tinted section backgrounds, higher-contrast labels
- [x] Dedicated ATS Score panel — PDF-based Gemini multimodal analysis (analyzes compiled PDF, not LaTeX source)
- [x] ATS compliance dimensions: sections, keywords, formatting, structure — each with inline accordion of issues
- [x] ATS split-pill diagnostic badge in PDF preview toolbar with ScanText icon, score-colored border/tint, bouncing-dots loading state
- [x] ATS panel onSendToChat — suggestions and missing keywords send directly to AI chat
- [x] Purpose notes in both ATS and Resume Review panels to clarify human-quality vs machine-parsability distinction
- [x] generateWithRetry supports multimodal content array (string | any[]) for PDF inline data
- [x] Smart Editing Features — bracket auto-close (`{`, `[`, `(`, `$`), smart backspace, comment toggle (Ctrl+/), multi-cursor (Ctrl+D), duplicate line (Ctrl+Shift+D), move line (Alt+Up/Down), indent/outdent (Tab/Shift+Tab on selection)
