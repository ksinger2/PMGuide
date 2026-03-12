# NextStep — Session Handoff Notes

> This file is the team's shared memory between sessions. Before ending work, update this file so the next session knows exactly where to pick up. When `/reinit` runs, every agent reads this to restore context.

---

## Last Updated
2026-03-12 — Session 8

## Session Summary
Session 8: Added two Interview Lab enhancements — "Watch the Expert" mode and voice input for interview answers.

What was done this session:

### Watch the Expert Mode (Feature A)
- **Types:** Added `"expert"` to `InterviewMode`, `"viewing"` to `InterviewScreen` in `src/types/interview.ts`
- **Session Hook:** Added `SET_MODEL_ANSWER` action + reducer case + `setModelAnswer` callback in `use-interview-session.ts`. Updated `isSessionComplete` to include "viewing" screen.
- **Home Screen:** 3-column grid with amber-themed "Watch the Expert" card (`interview-home.tsx`)
- **Expert Setup:** New `expert-mode-setup.tsx` — amber color scheme, same controls as interview setup (company, source, categories, count, question picker)
- **Expert Viewing:** New `expert-viewing.tsx` — question card (amber accent), loading state, `ModelAnswerTab` rendering, "Show Me Another" / "End Session" actions
- **Page Orchestration:** `interview/page.tsx` — expert setup/viewing routing + `useEffect` that auto-fetches model answer when question loads (no textarea, no grading)

### Voice Input for Interview Answers (Feature B)
- **Active Question:** Added `VoiceInput` component below textarea in `active-question.tsx`. Transcript appends to answer text. Mic button hidden if browser doesn't support Web Speech API.
- **No changes to VoiceInput component itself** — already production-ready from chat section.

### Tests
- **Unit:** 2 new tests in `interview-session.test.ts` — `SET_MODEL_ANSWER` transition test + expert mode history test (61 total, all passing)
- **E2E:** 3 new tests in `interview-lab.spec.ts` — expert mode card visibility, expert setup flow, voice input button visibility

### Previous Session (7): Interview Lab (Full Feature)
- 4 API routes, 10 UI components, session hook, question bank parser, specialist prompts
- Two modes: Interview Mode + Practice Mode
- State machine: home → setup → active → analyzing → results

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
  - Three modes: Interview Mode (multi-question, category rotation) + Practice Mode (single question) + Watch the Expert (observe model answers)
  - Five screens: Home → Setup → Active Question → Results + Viewing (expert)
  - Structured JSON responses with rubric-based scoring + model answers
  - Question bank parsed from markdown (112+ real questions across 7 types)
  - Three question sources: AI-Generated, From Real Bank, I'll Pick
  - Parallel grade + model answer API calls
  - Session history with score tracking (localStorage)
  - 7 specialist agents with company-specific context
  - Voice input (Web Speech API) on answer textarea for interview/practice modes
- [x] Resume flow state persists to localStorage
- [x] Vitest unit tests — 61/61 passing
- [x] Playwright E2E tests — needs re-run (3 new tests added for expert mode + voice)
- [x] Production build succeeds with all routes
- [x] `/reinit` command exists with full agent team (8 agents)

### What's NOT Done
- [ ] **CRITICAL: Resume scoring consistency** — Same resume gets wildly different scores on consecutive analyses (e.g., 60% impact on one run, 85% on the next). This is unreliable and untrustworthy. Needs an AI engineering plan to fix. See Priority #1 below.
- [ ] **Live manual testing** — Full interview lab flow with real API calls (Practice mode + Interview mode + Expert mode)
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
- Interview Lab: voice input added to answer textarea (Session 8) — done

## Notes for Specific Agents

### Product Manager
Interview Lab is live with three modes (Interview + Practice + Watch the Expert), structured scoring, model answers, and voice input. The old chat-based interview is gone — replaced with a proper screen flow. Next priority: the scoring consistency problem is a trust-killer and needs to be fixed before any user testing.

### UX Designer
Interview Lab has 5 screens: Home (3 mode cards + history), Setup (company/type/source selectors), Active Question (progress bar, question box, answer textarea with word count + voice input), Results (score banner, 3-tab panel for feedback/model answer/my answer), Viewing (expert mode — question + model answer only). Company badges + type badges throughout. Practice mode uses green accent, Interview mode uses indigo, Expert mode uses amber.

### Frontend Engineer
Key patterns: `useInterviewSession` hook follows the same useReducer + localStorage + isHydrated pattern as `useBranches`. Screen state machine in page.tsx dispatches to different components. Expert mode adds `SET_MODEL_ANSWER` action + "viewing" screen — auto-fetches model answer via useEffect when question loads (no user answer step). `VoiceInput` from chat section reused in `active-question.tsx` — appends transcript to textarea. `callChat()` is the new non-streaming counterpart to `streamChat()` — same error handling, returns Promise<string>. Question picker fetches from GET endpoint and supports both checkbox (multi) and radio (single) modes.

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
All tests passing: 61 unit (Vitest), E2E needs re-run. New Session 8 tests: `SET_MODEL_ANSWER` reducer transition, expert mode history isolation, expert mode card visibility E2E, expert setup flow E2E, voice input button E2E. Key test pattern: seed `pmguide-profile` in `addInitScript` with raw UserProfile object (NOT wrapped in `{profile, completeness}`). 2 pre-existing mobile failures: branch tab close button intercepted by mobile-nav z-index.
