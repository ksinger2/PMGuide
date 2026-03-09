# CLAUDE.md — PMGuide

This file is the entry point for Claude Code when working on the PMGuide project.

---

## Communication Style

- Keep terminal output clean. Don't narrate tool calls.
- Only show: results, summaries, next steps, questions, links. No filler.
- Short bullet points and headers. No walls of text.
- Plain English error explanations — say what broke and how to fix it.
- When a task completes, confirm what was done in 1-3 sentences max.

---

## Task Management

- **Plan first, then build.** Read the relevant docs before writing code.
- **Use agents for specialized work.** Route PM-specific questions to the product-manager agent.
- **Verify before claiming complete.** Run the relevant test suite. Check the dev server. Confirm the output.
- **One concern at a time.** Don't refactor while implementing a feature.

---

## Developer Preferences

- **Environment:** WSL2 (Linux on Windows). Paths use `/mnt/c/...`.
- **Next.js dev server:** `npm run dev`
- **Playwright E2E tests:** `npx playwright test`
- **Vitest unit tests:** `npm run test`
- **Package manager:** npm (not yarn, not pnpm)
- **Editor:** Cursor / VS Code (irrelevant to CLI, but FYI)

---

## Critical Product Requirements

These are non-negotiable. Violating any of these is a bug.

1. **About Me chatbot must store a complete user profile before the Resume section unlocks.** The gate is enforced — no shortcuts.
2. **Resume critique uses Sonnet 4.** Quality matters for career advice. Never downgrade to a cheaper model for resume analysis.
3. **Voice input uses the Web Speech API** with a visible recording indicator. The user must always know when the mic is active.
4. **Stub sections show "Coming Soon"** with feature previews. They are not empty pages.
5. **Learning style preferences affect AI communication across all sections.** If a user prefers examples, the AI gives examples. If they prefer frameworks, the AI uses frameworks.
6. **PMGuide changes WHAT is in a resume, not HOW it looks.** No lies. No fake dates. No fake companies. No fabricated metrics. Only rephrase, reorganize, and cater existing content to a target role.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript (strict mode) |
| AI (core) | Claude Sonnet 4 via Anthropic API |
| AI (light) | Claude Haiku 4.5 via Anthropic API |
| Voice | Web Speech API (browser-native) |
| PDF parsing | pdf-parse |
| DOCX output | docx |
| E2E testing | Playwright |
| Unit testing | Vitest |
| Deployment | Vercel |

---

## Project Structure

```
PMGuide/
├── CLAUDE.md                    # This file — project instructions for Claude
├── ENGINEERING_GUIDE.md         # Architecture, patterns, conventions
├── docs/
│   ├── PRD.md                   # Product Requirements Document
│   ├── API_CONTRACTS.md         # API endpoint specifications
│   ├── QUESTION_BANK.md        # PM chatbot question library
│   ├── RESUME_EXAMPLES.md      # Resume guidance by PM level
│   └── DESIGN_SYSTEM.md        # Colors, typography, components
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (sidebar nav)
│   │   ├── page.tsx             # Landing / dashboard
│   │   ├── about-me/
│   │   │   └── page.tsx         # About Me chatbot section
│   │   ├── resume/
│   │   │   └── page.tsx         # Resume critique & generation
│   │   ├── outreach/
│   │   │   └── page.tsx         # Stub — Coming Soon
│   │   ├── interview/
│   │   │   └── page.tsx         # Stub — Coming Soon
│   │   ├── negotiate/
│   │   │   └── page.tsx         # Stub — Coming Soon
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts     # POST /api/chat (streaming)
│   │       ├── resume/
│   │       │   ├── upload/
│   │       │   │   └── route.ts # POST /api/resume/upload
│   │       │   ├── critique/
│   │       │   │   └── route.ts # POST /api/resume/critique
│   │       │   ├── generate/
│   │       │   │   └── route.ts # POST /api/resume/generate
│   │       │   └── fork/
│   │       │       └── route.ts # POST /api/resume/fork
│   │       └── profile/
│   │           └── route.ts     # GET/PUT /api/profile
│   ├── components/
│   │   ├── chat/
│   │   │   ├── chat-container.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── chat-message.tsx
│   │   │   └── voice-input.tsx
│   │   ├── resume/
│   │   │   ├── upload-zone.tsx
│   │   │   ├── critique-panel.tsx
│   │   │   ├── resume-editor.tsx
│   │   │   └── download-button.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── section-header.tsx
│   │   ├── profile/
│   │   │   ├── profile-card.tsx
│   │   │   └── profile-editor.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── progress.tsx
│   │       └── coming-soon.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts        # Anthropic SDK wrapper
│   │   │   ├── models.ts        # Model routing config
│   │   │   └── streaming.ts     # Streaming response helpers
│   │   ├── prompts/
│   │   │   ├── about-me.ts      # About Me conversation prompts
│   │   │   ├── resume-critique.ts
│   │   │   ├── resume-generate.ts
│   │   │   └── resume-fork.ts
│   │   ├── resume/
│   │   │   ├── pdf-parser.ts    # PDF text extraction
│   │   │   ├── docx-builder.ts  # DOCX file generation
│   │   │   └── validators.ts    # File type/size validation
│   │   └── utils/
│   │       ├── profile.ts       # Profile completeness checks
│   │       └── constants.ts     # App-wide constants
│   └── stores/
│       ├── profile-context.tsx  # React Context for user profile
│       └── chat-store.ts        # Chat history state
├── tests/
│   ├── e2e/
│   │   ├── about-me.spec.ts
│   │   ├── resume-upload.spec.ts
│   │   ├── resume-critique.spec.ts
│   │   └── navigation.spec.ts
│   ├── unit/
│   │   ├── pdf-parser.test.ts
│   │   ├── docx-builder.test.ts
│   │   ├── profile.test.ts
│   │   └── prompts.test.ts
│   └── fixtures/
│       ├── sample-resume.pdf
│       └── mock-api-responses.json
├── public/
│   └── images/
├── .env.local                   # ANTHROPIC_API_KEY (never commit)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

---

## Key Commands

```bash
# Development
npm run dev                      # Start Next.js dev server
npm run build                    # Production build
npm run lint                     # ESLint

# Testing
npm run test                     # Vitest unit tests
npx playwright test              # Playwright E2E tests
npx playwright test --ui         # Playwright UI mode

# Deployment
vercel                           # Deploy to Vercel
```

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...     # Required. Never commit.
```

---

## References

- `ENGINEERING_GUIDE.md` — Architecture, conventions, testing standards
- `docs/PRD.md` — Full product requirements
- `docs/API_CONTRACTS.md` — API endpoint specs
- `docs/DESIGN_SYSTEM.md` — UI/UX patterns
- `docs/QUESTION_BANK.md` — About Me chatbot questions
- `docs/RESUME_EXAMPLES.md` — Resume guidance by PM level
