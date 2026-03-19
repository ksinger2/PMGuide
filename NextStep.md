# NextStep — Session Handoff Notes

> This file is the team's shared memory between sessions. Before ending work, update this file so the next session knows exactly where to pick up. When `/reinit` runs, every agent reads this to restore context.

---

## Last Updated
2026-03-18 — Session 14

## Session Summary
Session 14: Remove hardcoded personal data, make PM level references dynamic across all prompts.

What was done this session:

### 1. Gated Debug Profile Button
- `src/components/profile/quick-load-button.tsx` — only renders for `NEXT_PUBLIC_DEBUG_EMAIL`
- `src/stores/profile-context.tsx` — added `userEmail` to state, fetches from API
- `src/app/api/profile/route.ts` — now returns `email` in GET response
- Button text changed from "I'm Karen" to "Load debug profile"

### 2. Removed Personal Data from SKILL.md
- `docs/resources/interview/pm-interview-resources/SKILL.md` — replaced hardcoded candidate profile (Karen's background, companies, etc.) with dynamic placeholders

### 3. Made Prompts Level-Dynamic
- `src/lib/prompts/interview.ts` — uses `profile.goalRole` or `currentRole` instead of hardcoded "Staff/Senior PM"
- `src/lib/prompts/interview-lab.ts` — removed hardcoded level assumption in question generation
- `src/lib/prompts/negotiate-coach.ts` — uses dynamic level from profile

### 4. Environment Variable
- Added `NEXT_PUBLIC_DEBUG_EMAIL` to `.env.local`

### Files Modified (7)
- `src/components/profile/quick-load-button.tsx`
- `src/stores/profile-context.tsx`
- `src/app/api/profile/route.ts`
- `docs/resources/interview/pm-interview-resources/SKILL.md`
- `src/lib/prompts/interview.ts`
- `src/lib/prompts/interview-lab.ts`
- `src/lib/prompts/negotiate-coach.ts`
- `.env.local`

### What's Preserved
- `karen-profile.ts` stays for debugging (gated by email match)
- All existing functionality unchanged
- Resume prompts already had dynamic level detection via `getLevelGuidance()` and `getPMLevel()`

---

### Previous Session (13)
Session 13: Chrome MCP setup for browser automation + Stripe/Supabase integration prep.

What was done this session:

### 1. Chrome MCP Server Configuration
Added Chrome DevTools MCP server to global Claude Code settings (`~/.claude/settings.json`):
```json
"mcpServers": {
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "@anthropic-ai/mcp-server-chrome-devtools"]
  }
}
```

**Purpose:** Enable Claude agents to control Chrome browser programmatically for:
- Automated signup flows (Stripe, Supabase)
- Form filling and navigation
- Reading page content
- Taking screenshots

### 2. Setup Steps Remaining (for next session)
The Chrome MCP was configured but not yet tested. Next session needs to:

1. **Launch Chrome with remote debugging:**
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/ChromeDebugProfile"
   ```

2. **Restart Claude Code** to load the new MCP server

3. **Verify MCP connection** by running `/mcp` to see available Chrome tools

4. **Complete Stripe setup** — use Chrome MCP to help with:
   - Creating Stripe account (if not already done)
   - Getting API keys (publishable + secret)
   - Creating product + price ($12.99/mo PMGuide Monthly)
   - Enabling customer portal
   - Setting up webhook endpoints

5. **Complete Supabase setup** — use Chrome MCP to help with:
   - Creating Supabase project
   - Getting database connection strings
   - Running `npx prisma db push`

### Previous Session (12)
- Outreach prompt overhaul (research-backed brevity)
- Profile hydration bug fix (4 files)

What was done this session:

### 1. Outreach Prompt Overhaul (`src/lib/prompts/outreach.ts`)
Research-backed rewrite of the outreach system prompt for shorter, higher-converting messages:
- **Word count targets tightened**: Email 125→50-75 words, LinkedIn connection 300→200 chars, LinkedIn InMail 500→400 chars, LinkedIn word target 25-50 words
- **Email format restructured**: Subject line 2-6 words/60 chars → 1-5 words/under 40 chars/lowercase. Body "3-4 SHORT paragraphs" → 3 sections, 1-2 sentences each (hook about them, bridge to you, one ask + graceful out)
- **Audience sections trimmed**: Cut verbose PHILOSOPHY preambles from all three audiences. Hiring manager: "state purpose within first 2 sentences." Recruiter: "link to the job posting." Referral: DJ Chung's 1-2 step approach for non-close connections. All three: "ONE ASK only" rule.
- **Added Brevity Protocol section**: Filler/qualifier removal checklist, you/your > I/my ratio, backed by 34M email data
- **Rules expanded** (10→13): Hard word limits with "count them", one ask per message, you/your ratio, no markdown formatting in body
- Data sources: Hunter.io 34M emails, Lavender, Aakash Gupta, CNBC/Meredith Fineman, DJ Chung

### 2. Profile Hydration Bug Fix (4 files)
"Start here" badge and locked sections showed incorrectly after profile was complete (70%+). Root cause: profile loads from localStorage in useEffect, but components rendered with `completeness=0` before hydration.
- `src/app/page.tsx` — don't show "Start here" or "Requires profile" badges until `state.isLoaded`
- `src/components/layout/sidebar.tsx` — don't lock nav items until `state.isLoaded`
- `src/components/layout/mobile-nav.tsx` — don't lock nav items until `state.isLoaded`
- `src/components/layout/gated-page.tsx` — don't show gate lock screen until `state.isLoaded`

### Files Modified (5)
- `src/lib/prompts/outreach.ts` — full prompt rewrite for brevity
- `src/app/page.tsx` — hydration-aware badge/lock logic
- `src/components/layout/sidebar.tsx` — hydration-aware lock logic
- `src/components/layout/mobile-nav.tsx` — hydration-aware lock logic
- `src/components/layout/gated-page.tsx` — hydration-aware gate logic

### Previous Sessions
- **Session 11**: Crafter candidate context, URL bypass protection, interview nav verification
- **Session 10**: Negotiation Lab (full feature — 5 modes, 37 files, ~4800 lines)
- **Session 9**: Scoring consistency (tool_use, temp=0.0, calibration examples), critique navigation persistence, real-time voice transcription
- **Session 8**: Expert mode, voice input on interview, resume branching system
- **Session 7**: Interview Lab (full feature — 4 API routes, 10 components, 3 modes)
- **Session 6 and earlier**: Core app (chat, resume upload/critique/generate, profile system)

### Negotiation Lab (Full Feature — Session 10)
- **Simulator Mode**: Multi-turn salary negotiation roleplay against an AI recruiter. Hidden budget ceiling mechanic — recruiter has a secret max they'll go to. Real-time evaluation of each turn with coaching feedback. Final grading with detailed scorecard.
- **Expert Demo Mode**: Watch an AI expert negotiate on your behalf. Setup screen collects scenario details, then streams a full negotiation with expert commentary on strategy.
- **Coach Mode**: Parallel coaching during simulation. Split-panel UI with coach notes appearing alongside the negotiation. Coach analyzes recruiter responses and suggests tactics.
- **Tips Browser**: Searchable library of negotiation frameworks and tactics. Client-side only, no API needed. Categories: anchoring, BATNA, framing, timing, etc.
- **Offer Calculator**: Side-by-side total compensation comparison. Equity modeling (RSU vesting schedules, refresh grants), signing bonus amortization, benefits valuation. Pure client-side computation.

### Files Added (30 new)
- **6 API routes**: `negotiate/scenario`, `negotiate/chat`, `negotiate/evaluate-turn`, `negotiate/grade`, `negotiate/expert-demo`, `negotiate/analyze-offers`
- **20 components**: `negotiate-home`, `simulator-setup`, `simulator-active`, `simulator-results`, `expert-setup`, `expert-viewing`, `coach-chat`, `coach-notes-panel`, `negotiation-turn`, `tip-card`, `tips-browser`, `offer-calculator`, `offer-column`, `comparison-chart` + more
- **4 prompts**: `negotiate-recruiter.ts`, `negotiate-expert.ts`, `negotiate-coach.ts`, `negotiate-grade.ts`
- **Session hook**: `use-negotiation-session.ts` (useReducer + localStorage)
- **Utilities**: `calc-utils.ts`, `comp-data.ts`, `frameworks.ts`, `scenarios.ts`
- **Types**: `negotiation.ts`
- **Tests**: `calc-utils.test.ts`

### Files Modified (6)
- `chat/route.ts` — negotiate section routing
- `negotiate/page.tsx` — full page implementation (was Coming Soon stub)
- `mobile-nav.tsx`, `sidebar.tsx` — negotiate nav with profile gate
- `models.ts` — negotiate task temperature overrides
- `constants.ts` — negotiate-related constants

### Architecture Decisions
- **Hidden budget ceiling**: Recruiter AI has a secret maximum it will accept, calculated from scenario parameters. Player doesn't know the ceiling — creates realistic negotiation tension. Evaluated per-turn so player gets feedback on whether they're pushing too hard or leaving money on the table.
- **Parallel coach notes**: Coach runs as a separate API call alongside the recruiter response. Split-panel UI shows both simultaneously. Coach analyzes the recruiter's latest response and suggests next moves.
- **Component separation**: 20 components instead of a monolithic page. Each mode has its own setup → active → results flow. Shared `negotiation-turn` component for message display across modes.
- **Client-side calculator**: Offer Calculator and Tips Browser require no API key — pure client-side computation. Useful even without Anthropic access.
- **Session state hook**: `useNegotiationSession` follows the same pattern as interview — useReducer + localStorage, typed actions, serializable state.

## Current Status

### What's Done
- [x] Next.js app scaffolded and building
- [x] Responsive layout shell (sidebar + mobile nav)
- [x] All routes created (7 pages + 18 API routes)
- [x] AI client wrapper + model routing (Haiku for chat, Sonnet 4 for resume/interview/negotiate)
- [x] Per-task temperature overrides (critique=0.0, generate/fork=0.7, interview-generate=0.8, interview-grade=0.3, interview-model=0.5, negotiate=0.7, negotiate-grade=0.3)
- [x] SSE streaming helpers + non-streaming `callChat()` + `callChatWithTool()` (forced tool_use)
- [x] POST /api/chat — about-me + interview + negotiate sections working
- [x] About Me system prompt with progress tracking + extraction
- [x] Chat UI components — all bugs fixed, profile updates flowing
- [x] Voice input with real-time interim transcription (Web Speech API)
- [x] ProfileProvider with localStorage persistence
- [x] Profile gate enforcement (sidebar, mobile nav, resume page, interview page, negotiate page, URL bypass protection)
- [x] Sidebar profile card with live completeness
- [x] Chat history persistence (localStorage)
- [x] Profile editor form (8 core fields, Chat|Profile tabs)
- [x] Debug profile button (gated to NEXT_PUBLIC_DEBUG_EMAIL)
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
- [x] **Negotiation Lab** — Full negotiation practice and analysis
  - Five modes: Simulator + Expert Demo + Coach + Tips Browser + Offer Calculator
  - Simulator: multi-turn roleplay with hidden budget ceiling, per-turn evaluation, final grading
  - Expert Demo: watch AI negotiate with strategic commentary
  - Coach: parallel advice panel during simulation
  - Tips Browser: searchable frameworks library (client-side)
  - Offer Calculator: TC comparison with equity modeling (client-side)
  - Response Crafter with candidate context input for mid-conversation refinement
  - 6 API routes, 20 components, 4 prompts
  - Session state hook (useReducer + localStorage)
- [x] Dynamic PM level in all prompts (interview, negotiate, resume) — no hardcoded "Senior PM" assumptions
- [x] Vitest unit tests — 76/76 passing (6 test files)
- [x] Production build succeeds with all routes
- [x] `/reinit` command exists with full agent team (8 agents)

### What's NOT Done
- [ ] **Chrome MCP verification** — MCP config added but not tested yet. Need to:
  1. Launch Chrome with `--remote-debugging-port=9222`
  2. Restart Claude Code
  3. Run `/mcp` to verify Chrome tools load
  4. Test basic navigation/interaction
- [ ] **Stripe + Supabase credentials** — `.env.local` has placeholders. Use Chrome MCP to help complete signup flows and get real credentials.
- [ ] **Live manual testing** — Negotiate feature needs manual verification:
  1. Simulator: run a full multi-turn negotiation, check grading
  2. Expert Demo: watch a full AI negotiation
  3. Coach: verify parallel notes appear alongside simulator
  4. Calculator: compare two offers, check math
  5. Tips: browse and search frameworks
- [ ] **E2E tests for Negotiation Lab** — No Playwright tests yet for negotiate flows
- [ ] **E2E tests for scoring consistency** — Verify critique scores are more stable across runs
- [ ] **Multi-sample consensus** (Phase 3 scoring) — Run critique 2-3x and majority-vote findings. Only needed if current fixes don't sufficiently reduce variance.
- [x] Outreach prompt system (research-backed brevity, 3 audiences × 2 formats)
- [ ] Outreach manual testing — verify generated messages meet word count targets across all audience/format combos
- [ ] Toast notifications
- [ ] Skeleton loaders
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Vercel deployment
- [ ] Lighthouse performance benchmarks
- [ ] Token budget management for long conversations
- [ ] ForkPanel cleanup — still in codebase but not imported anywhere
- [ ] 2 pre-existing mobile E2E failures (branch tab close button blocked by mobile-nav overlay)
- [ ] E2E tests need re-run after Session 9/10 changes

## Priority Next Steps

### 0. Complete Chrome MCP + Stripe/Supabase Setup (BLOCKING)
This is the highest priority. The app cannot go live without real credentials.

**Chrome MCP Setup:**
1. Close Chrome completely
2. Launch with debugging: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/ChromeDebugProfile"`
3. Restart Claude Code
4. Run `/mcp` to verify Chrome tools are available

**Then use Chrome MCP to help with:**
- Stripe: Create account → Get API keys → Create product ($12.99/mo) → Enable portal → Setup webhooks
- Supabase: Create project → Get connection strings → Run `npx prisma db push`
- Update `.env.local` with real credentials (see NEXT_STEPS.md for full checklist)

### 1. Outreach Manual Testing
Test all 3 audiences (hiring-manager, recruiter, referral) × 2 formats (email, LinkedIn). Verify: messages under 75 words (email) / 50 words (LinkedIn), subject lines under 40 chars lowercase, lead with recipient, one ask, no AI buzzwords, no em dashes. Test refinement ("make it shorter").

### 2. Live Manual Testing (Negotiation Lab)
Test all 5 modes. Tips & Calculator work without API key. Simulator, Expert, and Coach need ANTHROPIC_API_KEY. Profile gate must be passed first (70%+ completeness).

### 3. E2E Tests for Negotiate + Outreach
Add Playwright tests for negotiate flows — at minimum: mode selection, calculator math, tips browsing.

### 4. Polish UI/UX
Toast notifications, skeleton loaders, responsive edge cases. Fix 2 pre-existing mobile E2E failures.

### 5. CI/CD + Vercel Deployment
GitHub Actions workflow, Vercel project setup.

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
- Negotiate: should simulator have difficulty levels (easy/medium/hard budget ceilings)?

## Notes for Specific Agents

### Product Manager
4 of 5 major sections complete (About Me, Resume, Interview, Negotiate). Only Outreach remains as Coming Soon. 76 tests passing, 18 API routes, production build clean. Negotiate adds significant depth — 5 distinct modes covering practice, analysis, and education.

### UX Designer
Negotiate uses a mode-selection home screen (same pattern as Interview). Each mode has setup → active → results flow. Split-panel layout for Coach mode. Calculator has side-by-side offer columns with comparison chart. Tips browser has category filtering and search.

### Frontend Engineer
Key Session 10 patterns: `useNegotiationSession` hook follows interview pattern (useReducer + localStorage). 20 components in `src/components/negotiate/`. Coach notes use parallel API calls — recruiter response and coach analysis fire simultaneously. Calculator is pure client-side (no API). `negotiation-turn.tsx` is shared across Simulator, Expert, and Coach modes.

### Backend Engineer
6 new API routes under `/api/negotiate/`. `scenario` generates negotiation scenarios, `chat` handles recruiter turns (SSE), `evaluate-turn` scores individual moves, `grade` produces final scorecard, `expert-demo` streams expert negotiation, `analyze-offers` processes calculator data. Temperature: 0.7 for creative (chat, expert), 0.3 for evaluation (grade, evaluate-turn).

### AI Engineer
4 new prompt files: recruiter (adversarial with hidden ceiling), expert (strategic demonstration), coach (parallel tactical advice), grade (structured scoring). Recruiter prompt includes budget ceiling mechanics — AI must negotiate realistically without revealing the max. Coach prompt analyzes conversation history and suggests specific tactics.

### DevOps Engineer
**Session 13 changes:** Chrome MCP server added to `~/.claude/settings.json` for browser automation. This enables Claude agents to help with Stripe/Supabase account setup via Chrome DevTools Protocol.

**Chrome MCP requires:**
- Chrome launched with `--remote-debugging-port=9222`
- Separate user profile recommended: `--user-data-dir="$HOME/ChromeDebugProfile"`

18 total API routes. CI/CD still needed. Build passes clean.

### QA Engineer
76 tests passing (was 61). New: `calc-utils.test.ts` covers TC calculation, equity vesting, comparison logic. E2E tests needed for negotiate flows. Manual testing checklist: all 5 modes, profile gate enforcement, calculator math accuracy.
