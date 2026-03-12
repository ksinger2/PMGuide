# NextStep — Session Handoff Notes

> This file is the team's shared memory between sessions. Before ending work, update this file so the next session knows exactly where to pick up. When `/reinit` runs, every agent reads this to restore context.

---

## Last Updated
2026-03-12 — Session 7

## Session Summary
Session 7: Built the complete Interview Lab feature — replaced the chat-based interview page with a structured, multi-screen interview practice system. 4 new API routes, 10 new UI components, session hook with localStorage persistence, question bank parser, and specialist prompt builders. All tests passing.

What was done this session:

### Interview Lab (Full Feature)
- **Phase 1 — Infrastructure:** Types (`src/types/interview.ts`), non-streaming `callChat()` in `client.ts`, 3 task overrides in `models.ts` (interview-generate/grade/model), new constants, exported helpers from `interview.ts`
- **Phase 2 — Question Bank + Prompts:** `question-bank.ts` parses all 7 question-type markdown files for question banks at module load. `interview-lab.ts` has 3 prompt builders (question generation, grading, model answer) — all return structured JSON instructions.
- **Phase 3 — API Routes (4 new):**
  - `POST /api/interview/generate-question` — bank or AI-generated questions
  - `POST /api/interview/grade` — rubric-based grading, returns validated Feedback JSON
  - `POST /api/interview/model-answer` — step-by-step model answer, returns validated ModelAnswer JSON
  - `GET /api/interview/questions` — returns full question bank for a type (for "I'll Pick" UI)
- **Phase 4 — Session Hook:** `useInterviewSession` — useReducer + localStorage history persistence, category rotation, all screen transitions
- **Phase 5 — UI Components (10 new):** interview-home, interview-mode-setup, practice-mode-setup, question-picker, active-question, results-screen, score-banner, feedback-tab, model-answer-tab, progress-bar
- **Phase 6 — Page + Sidebar:** Full rewrite of `src/app/interview/page.tsx` with state machine (home → setup → active → analyzing → results). Sidebar changed interview from `locked: true` to `gated: true` (unlocks at 70% profile). Deleted old `interview-setup.tsx`.
- **Phase 7 — Tests:** 15 new unit tests (question bank parser, session logic, score colors). 4 new E2E tests (home screen, practice setup, interview setup, back navigation).

### Architecture Decisions
- **Non-streaming JSON** for all interview API routes (not SSE) — structured feedback needs complete JSON parsing
- **Parallel `Promise.all`** for grade + model answer calls on submit — faster results
- **Category rotation** via `config.types[currentQuestionIndex % config.types.length]`
- **Three question modes:** AI-Generated (Sonnet 4), From Real Bank (no AI call), I'll Pick (browse + select)
- **Session history** persisted to localStorage, capped at 30 entries

### Test Results
- **59/59 unit tests** passing (15 new interview + 44 existing)
- **66/68 E2E tests** passing, 2 pre-existing mobile branch tab failures (mobile-nav overlay intercept — not related to interview changes), 2 skipped
- TypeScript strict mode — zero errors
- Production build succeeds

## Current Status

### What's Done
- [x] Next.js app scaffolded and building
- [x] Responsive layout shell (sidebar + mobile nav)
- [x] All routes created (7 pages + 12 API routes)
- [x] AI client wrapper + model routing (Haiku for chat, Sonnet 4 for resume/interview)
- [x] Per-task temperature overrides (critique=0.2, generate/fork=0.7, interview-generate=0.8, interview-grade=0.3, interview-model=0.5)
- [x] SSE streaming helpers + non-streaming `callChat()`
- [x] POST /api/chat — about-me + interview sections working
- [x] About Me system prompt with progress tracking + extraction
- [x] Chat UI components — all bugs fixed, profile updates flowing
- [x] Voice input fills textarea, no auto-send
- [x] ProfileProvider with localStorage persistence
- [x] Profile gate enforcement (sidebar, mobile nav, resume page, interview page)
- [x] Sidebar profile card with live completeness
- [x] Chat history persistence (localStorage)
- [x] Profile editor form (8 core fields, Chat|Profile tabs)
- [x] "I'm Karen" quick-load button
- [x] POST /api/resume/upload (PDF parsing with pdf-parse v2)
- [x] POST /api/resume/critique (SSE, Sonnet 4, temp=0.2, quantified rubric)
- [x] POST /api/resume/generate (SSE, Sonnet 4)
- [x] POST /api/resume/fork (SSE, Sonnet 4)
- [x] POST /api/resume/fetch-jd (URL → JD text, cheerio + Haiku extraction)
- [x] POST /api/resume/branch-chat (SSE, Sonnet 4, suggestions extraction)
- [x] POST /api/resume/branch-rewrite (apply accepted changes)
- [x] Resume page — Upload → Critique + Branch (parallel), Generate after critique
- [x] Upload zone with drag-and-drop
- [x] Critique panel with weighted score ring, category bars with weight labels, findings
- [x] Generate panel with changes diff view
- [x] Resume branching system — tabs, per-branch chat, accept/reject suggestions
- [x] Branch manager available after critique completes (no generate gate)
- [x] Score computation utility with weighted average + validation
- [x] DOCX download (client-side, per branch)
- [x] Interview resources + prompt system (7 question types, 6 companies)
- [x] **Interview Lab** — Full structured interview practice (replaces old chat-based approach)
  - Two modes: Interview Mode (multi-question, category rotation) + Practice Mode (single question)
  - Four screens: Home → Setup → Active Question → Results
  - Structured JSON responses with rubric-based scoring + model answers
  - Question bank parsed from markdown (112+ real questions across 7 types)
  - Three question sources: AI-Generated, From Real Bank, I'll Pick
  - Parallel grade + model answer API calls
  - Session history with score tracking (localStorage)
  - 7 specialist agents with company-specific context
- [x] Resume flow state persists to localStorage
- [x] Vitest unit tests — 59/59 passing
- [x] Playwright E2E tests — 66/68 passing (2 pre-existing mobile failures)
- [x] Production build succeeds with all routes
- [x] `/reinit` command exists with full agent team (8 agents)

### What's NOT Done
- [ ] **CRITICAL: Resume scoring consistency** — Same resume gets wildly different scores on consecutive analyses (e.g., 60% impact on one run, 85% on the next). This is unreliable and untrustworthy. Needs an AI engineering plan to fix. See Priority #1 below.
- [ ] **Live manual testing** — Full interview lab flow with real API calls (Practice mode + Interview mode)
- [ ] **E2E tests for scoring consistency** — Verify critique scores are stable across runs
- [ ] Outreach section (Coming Soon stub exists)
- [ ] Negotiate section (Coming Soon stub exists)
- [ ] Toast notifications
- [ ] Skeleton loaders
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Vercel deployment
- [ ] Lighthouse performance benchmarks
- [ ] Token budget management for long conversations
- [ ] ForkPanel cleanup — still in codebase but not imported anywhere
- [ ] 2 pre-existing mobile E2E failures (branch tab close button blocked by mobile-nav overlay)

## Priority Next Steps

### 1. CRITICAL: Fix Resume Scoring Consistency
**Problem:** The resume critique scoring is SO inconsistent — the same resume can get 60% on impact/metrics on one analysis and 85% on the next. This makes the tool unreliable and untrustworthy for users making career decisions.

**Root cause hypothesis:** Even with temp=0.2, the AI's scoring is non-deterministic. The prompt asks for qualitative rubric evaluation that the AI converts to numbers, and small phrasing variations in the response lead to large score swings.

**Proposed plan (needs AI engineer review):**
- **Multi-sample consensus:** Run critique 2-3 times and average/median the scores. More expensive but dramatically more stable.
- **Anchor scoring with examples:** Add few-shot examples in the prompt showing exactly what a 60% vs 85% impact score looks like for PM resumes. Calibrate the rubric.
- **Structured output enforcement:** Use tool_use/function calling to force the AI into a strict scoring schema rather than free-form JSON extraction.
- **Score clamping/rounding:** Round to nearest 5% or 10% to reduce perceived jitter.
- **Deterministic post-processing:** Move more of the scoring logic into code (like we did for weighted averages) rather than relying on AI judgment for numerical values.
- **Regression test suite:** Build a set of 5-10 test resumes with expected score ranges. Run automated consistency checks.

This needs a dedicated session with the AI engineer agent to design and implement the solution.

### 2. Live Manual Test — Interview Lab
Upload real profile, complete a Practice Mode flow (generate question → answer → get feedback + model answer), then an Interview Mode flow with 3 questions and category rotation. Verify "I'll Pick" shows the question bank correctly.

### 3. Polish UI/UX
Toast notifications, skeleton loaders, responsive edge cases. Fix 2 pre-existing mobile E2E failures (branch tab close button z-index issue).

### 4. CI/CD + Vercel Deployment
GitHub Actions workflow, Vercel project setup.

### 5. Remove Dead Code
ForkPanel, any unused imports.

### 6. Outreach/Negotiate Sections
Build out remaining Coming Soon stubs.

## Blockers
- **Resume scoring inconsistency** — #1 blocker for user trust. See Priority #1.
- Vitest worker times out in WSL2 (infra issue, not code — tests still pass)
- WSL2 npm install can fail with permission errors (workaround: Windows terminal)
- Some job sites block server-side URL fetching (mitigated with paste fallback)
- Playwright needs `rm -rf .next` if code changes aren't picked up by dev server

## Open Questions
- Rate limiting resets on server restart — acceptable for MVP?
- Token budget: no sliding window for long conversations yet
- Should branch chat history have a max length? (currently capped at 20 messages)
- Interview Lab: should infinite mode have a session summary at the end?
- Interview Lab: should voice input be added to the answer textarea?

## Notes for Specific Agents

### Product Manager
Interview Lab is live with two modes (Interview + Practice), structured scoring, and model answers. The old chat-based interview is gone — replaced with a proper screen flow. Next priority: the scoring consistency problem is a trust-killer and needs to be fixed before any user testing.

### UX Designer
Interview Lab has 4 screens: Home (mode cards + history), Setup (company/type/source selectors), Active Question (progress bar, question box, answer textarea with word count), Results (score banner, 3-tab panel for feedback/model answer/my answer). Company badges + type badges throughout. Practice mode uses green accent, Interview mode uses indigo.

### Frontend Engineer
Key patterns: `useInterviewSession` hook follows the same useReducer + localStorage + isHydrated pattern as `useBranches`. Screen state machine in page.tsx dispatches to different components. `callChat()` is the new non-streaming counterpart to `streamChat()` — same error handling, returns Promise<string>. Question picker fetches from GET endpoint and supports both checkbox (multi) and radio (single) modes.

### Backend Engineer
4 new API routes under `/api/interview/`. All use `callChat()` (non-streaming) and return JSON. Grade and model-answer routes validate AI responses against expected schemas. `stripFences()` handles markdown code fence removal. Question bank is parsed at module load from markdown files — no database needed.

### AI Engineer
**CRITICAL:** Resume scoring consistency is the #1 problem. Same resume, different scores each run. Current setup: temp=0.2, weighted average computed in code. The AI still has too much latitude in assigning qualitative scores. Need to explore: multi-sample consensus, few-shot calibration, structured output/tool_use, and a regression test suite.

Interview Lab prompts: question generation (temp=0.8, 200 tokens), grading (temp=0.3, 1200 tokens), model answer (temp=0.5, 2000 tokens). All Sonnet 4. Prompts include full framework + rubric + company context. JSON schema enforced in prompt text.

### DevOps Engineer
Playwright config: 2 workers max (WSL2 can't handle more with dev server), expect timeout 15s, screenshots on failure. `.next` cache can go stale — `rm -rf .next` fixes it. No CI/CD yet — this is the next infra priority. 2 pre-existing mobile failures from branch tab close button being intercepted by mobile-nav overlay.

### Content Strategist
Interview question bank has 112+ questions across 7 categories, parsed from the resource markdown files. Model answer format: tagline + steps (WHY/WHAT/EXAMPLE) + insights + watch-outs. This teaches transferable understanding, not memorization.

### QA Engineer
All tests passing: 59 unit (Vitest), 66 E2E (Playwright). New interview tests cover: home screen rendering, practice mode setup flow, interview mode setup flow, back navigation. Key test pattern: seed `pmguide-profile` in `addInitScript` with raw UserProfile object (NOT wrapped in `{profile, completeness}`). 2 pre-existing mobile failures: branch tab close button intercepted by mobile-nav z-index.
