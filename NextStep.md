# NextStep — Session Handoff Notes

> This file is the team's shared memory between sessions. Before ending work, update this file so the next session knows exactly where to pick up. When `/reinit` runs, every agent reads this to restore context.

---

## Last Updated
2026-03-12 — Session 9

## Session Summary
Session 9: Three major improvements — resume scoring consistency overhaul, critique navigation persistence, and real-time voice transcription.

What was done this session:

### Resume Scoring Consistency (AI Engineering)
- **Temperature 0.0**: Changed critique temperature from 0.2 to 0.0 in `TASK_OVERRIDES` (`models.ts`)
- **Structured output via tool_use**: Critique route (`api/resume/critique/route.ts`) now uses `callChatWithTool()` — forces AI into a strict JSON schema via `tool_choice`. New `callChatWithTool()` function added to `client.ts`. Critique is now non-streaming JSON (was SSE).
- **Decision-tree severity definitions**: Replaced vague severity labels with a 2-step yes/no decision tree in the prompt (`resume-critique.ts`)
- **Anchor calibration examples**: Added 12 few-shot examples (2 per category × 6 categories) showing exactly what high vs medium severity looks like for PM resumes
- **CritiquePanel updated**: Now reads structured JSON response directly instead of parsing SSE stream chunks

### Critique Navigation Persistence (Bug Fix)
- **Problem**: Starting a critique then navigating to Interview lost the in-progress API call — component unmount killed the fetch response
- **Fix**: Module-level promise cache in `critique-panel.tsx`. The fetch promise and resolved result live outside React in module-scoped variables. On remount, a `useEffect` checks for pending/resolved results and restores UI state. Also writes to localStorage from within the promise closure (independent of React lifecycle).

### Real-Time Voice Transcription (Bug Fix)
- **Problem**: Voice input text only appeared after user stopped speaking — no real-time feedback
- **Fix**: Enabled `interimResults = true` in `voice-input.tsx`. Added `onInterim` callback prop. `onresult` handler now emits interim text for live preview and final text when segment confirms. Chat input and interview answer textareas show interim text in real-time.
- **Files changed**: `voice-input.tsx`, `chat-input.tsx`, `active-question.tsx`

### Previous Sessions
- **Session 8**: Expert mode, voice input on interview, resume branching system
- **Session 7**: Interview Lab (full feature — 4 API routes, 10 components, 3 modes)
- **Session 6 and earlier**: Core app (chat, resume upload/critique/generate, profile system)

### Architecture Decisions
- **Non-streaming critique**: Switched from SSE to non-streaming JSON with forced tool_use. This enforces schema (severity enums, category enums) at the API level. CritiquePanel reads `json.data` directly.
- **Module-level promise cache**: Chosen over Context/Zustand/service worker. Zero dependencies, 1 file change, survives mount/unmount naturally.
- **Two-callback voice pattern**: `onTranscript` for final text (appended), `onInterim` for live preview (replaced). Parents track interim state separately.

## Current Status

### What's Done
- [x] Next.js app scaffolded and building
- [x] Responsive layout shell (sidebar + mobile nav)
- [x] All routes created (7 pages + 12 API routes)
- [x] AI client wrapper + model routing (Haiku for chat, Sonnet 4 for resume/interview)
- [x] Per-task temperature overrides (critique=0.0, generate/fork=0.7, interview-generate=0.8, interview-grade=0.3, interview-model=0.5)
- [x] SSE streaming helpers + non-streaming `callChat()` + `callChatWithTool()` (forced tool_use)
- [x] POST /api/chat — about-me + interview sections working
- [x] About Me system prompt with progress tracking + extraction
- [x] Chat UI components — all bugs fixed, profile updates flowing
- [x] Voice input with real-time interim transcription (Web Speech API)
- [x] ProfileProvider with localStorage persistence
- [x] Profile gate enforcement (sidebar, mobile nav, resume page, interview page)
- [x] Sidebar profile card with live completeness
- [x] Chat history persistence (localStorage)
- [x] Profile editor form (8 core fields, Chat|Profile tabs)
- [x] "I'm Karen" quick-load button
- [x] POST /api/resume/upload (PDF parsing with pdf-parse v2)
- [x] POST /api/resume/critique (non-streaming, tool_use, Sonnet 4, temp=0.0, calibrated rubric)
- [x] POST /api/resume/generate (SSE, Sonnet 4)
- [x] POST /api/resume/fork (SSE, Sonnet 4)
- [x] POST /api/resume/fetch-jd (URL → JD text, cheerio + Haiku extraction)
- [x] POST /api/resume/branch-chat (SSE, Sonnet 4, suggestions extraction)
- [x] POST /api/resume/branch-rewrite (apply accepted changes)
- [x] Resume page — Upload → Critique + Branch (parallel), Generate after critique
- [x] Upload zone with drag-and-drop
- [x] Critique panel with weighted score ring, category bars with weight labels, findings
- [x] Critique survives navigation (module-level promise cache + localStorage persistence)
- [x] Generate panel with changes diff view
- [x] Resume branching system — tabs, per-branch chat, accept/reject suggestions
- [x] Branch manager available after critique completes (no generate gate)
- [x] Score computation utility with weighted average + validation
- [x] DOCX download (client-side, per branch)
- [x] Interview resources + prompt system (7 question types, 6 companies)
- [x] **Interview Lab** — Full structured interview practice
  - Three modes: Interview Mode + Practice Mode + Watch the Expert
  - Five screens: Home → Setup → Active Question → Results + Viewing
  - Structured JSON responses with rubric-based scoring + model answers
  - Question bank parsed from markdown (112+ real questions across 7 types)
  - Three question sources: AI-Generated, From Real Bank, I'll Pick
  - Parallel grade + model answer API calls
  - Session history with score tracking (localStorage)
  - 7 specialist agents with company-specific context
  - Real-time voice input on answer textarea
- [x] Resume scoring consistency: tool_use schema enforcement, temp=0.0, decision-tree severities, calibration examples
- [x] Resume flow state persists to localStorage
- [x] Vitest unit tests — 61/61 passing
- [x] Production build succeeds with all routes
- [x] `/reinit` command exists with full agent team (8 agents)

### What's NOT Done
- [ ] **Live manual testing** — Both bugs need manual verification:
  1. Critique persistence: start critique → navigate to interview → come back → results should be there
  2. Voice real-time: speak into mic → text should stream into textarea as you talk
- [ ] **E2E tests for scoring consistency** — Verify critique scores are more stable across runs
- [ ] **Multi-sample consensus** (Phase 3 scoring) — Run critique 2-3x and majority-vote findings. Only needed if current fixes don't sufficiently reduce variance.
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
- [ ] E2E tests need re-run after Session 9 changes

## Priority Next Steps

### 1. Live Manual Testing (Both Session 9 Fixes)
Test the critique persistence fix: upload resume → start critique → navigate to interview → wait → come back. Test voice real-time: record speech in chat and interview, verify text streams live.

### 2. Run Full Test Suite
Re-run all unit and E2E tests after Session 9 changes. The critique panel tests may need updates since the API response format changed (SSE → JSON).

### 3. Scoring Consistency Evaluation
Run the same resume through critique 3-5 times and compare scores. If variance is still too high, implement multi-sample consensus (Phase 3).

### 4. Polish UI/UX
Toast notifications, skeleton loaders, responsive edge cases. Fix 2 pre-existing mobile E2E failures.

### 5. CI/CD + Vercel Deployment
GitHub Actions workflow, Vercel project setup.

### 6. Outreach/Negotiate Sections
Build out remaining Coming Soon stubs.

## Blockers
- Vitest worker times out in WSL2 (infra issue, not code — tests still pass)
- WSL2 npm install can fail with permission errors (workaround: Windows terminal)
- Some job sites block server-side URL fetching (mitigated with paste fallback)
- Playwright needs `rm -rf .next` if code changes aren't picked up by dev server

## Open Questions
- Rate limiting resets on server restart — acceptable for MVP?
- Token budget: no sliding window for long conversations yet
- Should branch chat history have a max length? (currently capped at 20 messages)
- Interview Lab: should infinite mode have a session summary at the end?
- Is multi-sample consensus needed or did the prompt/tool_use fixes sufficiently stabilize scores?

## Notes for Specific Agents

### Product Manager
Scoring consistency addressed with 4 techniques (tool_use, temp=0.0, decision-tree severity, calibration examples). Needs live testing to evaluate. Critique now survives navigation. Voice input is real-time. Next priority: manual testing, then polish.

### UX Designer
Voice input now shows text streaming in real-time as user speaks (interim results). Critique loading state persists across navigation — user can start critique, do interview practice, and come back to see results.

### Frontend Engineer
Key Session 9 patterns: Module-level promise cache in `critique-panel.tsx` — `pendingCritique` and `resolvedCritique` live outside React, recovery `useEffect` on mount checks both. Voice uses two-callback pattern: `onTranscript` (final, appended) + `onInterim` (live preview, replaced). `callChatWithTool()` in `client.ts` forces structured JSON output via tool_use + tool_choice.

### Backend Engineer
Critique route is now non-streaming. Uses `callChatWithTool()` with forced `tool_choice: {type: "tool", name: "resume_critique"}`. Returns `NextResponse.json({data, error, meta})`. Tool schema enforces severity enum and category enum at API level. `ToolDefinition` interface exported from `client.ts`.

### AI Engineer
Scoring consistency fixes implemented: temp=0.0, tool_use schema enforcement (severity/category enums), decision-tree severity flow, 12 calibration examples. Needs evaluation — run same resume 3-5x and compare variance. If still too high, Phase 3 is multi-sample consensus with majority-vote on findings.

### DevOps Engineer
No infra changes this session. CI/CD still needed. E2E tests need re-run — critique panel tests may need updates for new JSON response format (was SSE).

### QA Engineer
Session 9 changed critique from SSE to JSON response — E2E tests that mock/check critique flow need updating. New behaviors to test: critique persistence across navigation, voice interim text in textarea, structured tool_use response format. Run full suite before next feature work.
