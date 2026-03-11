# NextStep — Session Handoff Notes

> This file is the team's shared memory between sessions. Before ending work, update this file so the next session knows exactly where to pick up. When `/reinit` runs, every agent reads this to restore context.

---

## Last Updated
2026-03-10 — Session 4

## Session Summary
Session 4: Fixed 3 critical bugs (chat 400 error, profile not updating, PDF upload broken), built complete resume generate/fork workflow, added "I'm Karen" quick-load, increased chat message limit.

What was done this session:
- **Fixed chat 400 error** — `chat-container.tsx` was duplicating the user message in `conversationHistory` (client included it, then API route added it again = consecutive user messages = Anthropic 400). Fixed by excluding new message from conversationHistory.
- **Fixed profile not updating** — consequence of the 400 error above. Profile updates via `<profile_update>` SSE events now flow correctly. Added console.log for debugging.
- **Fixed PDF upload** — `pdf-parse` v2 has a completely different API (class-based `PDFParse` with `getText()` instead of v1's callable function). Rewrote `pdf-parser.ts` to use v2 API. Also strips page separator lines from extracted text.
- **Built resume generate API** — POST /api/resume/generate with SSE streaming, Sonnet 4, Zod validation
- **Built resume fork API** — POST /api/resume/fork with SSE streaming, Sonnet 4, Zod validation
- **Rewrote resume prompts** — Both generate and fork prompts rebuilt with research-backed frameworks (XYZ Formula, Jackie Bavaro's 3 pillars, IGotAnOffer keywords, 6-8 second recruiter scan rule)
- **Deep PM resume research** — 520-line research doc from 15+ verified sources (docs/resources/senior-pm-resume-research.md)
- **Built generate-panel.tsx** — Generate improved resume UI with changes diff view
- **Built fork-panel.tsx** — Tailor for a job UI with keyword alignment (matched/added/missing)
- **Built download-button.tsx** — Reusable DOCX download button with idle/generating/done states
- **Built docx-builder.ts** — Client-side DOCX generation (Calibri, professional formatting, bullet detection)
- **Rewrote resume page** — Full 4-step flow: Upload → Critique → Generate → Fork
- **Increased model maxTokens** — Quality tier 2048 → 4096 for full resume JSON output
- **Fixed all E2E tests** — 26/26 passing (fixed interview stub, sidebar viewport, resume nav locked)
- **Fixed unit test** — Profile completeness test used wrong field (goalRole → yearsExperience)
- **"I'm Karen" quick-load button** — One-click profile load from `src/data/karen-profile.ts` on About Me page
- **Increased chat message limit** — MAX_MESSAGE_LENGTH 5000 → 50000 (users can paste large docs)
- **Karen's full profile data** — `src/data/karen-profile.ts` with all 7 products, 9 metrics, skills, preferences

## Current Status

### What's Done
- [x] Next.js app scaffolded and building
- [x] Responsive layout shell (sidebar + mobile nav)
- [x] All 7 routes created
- [x] AI client wrapper + model routing (Haiku for chat, Sonnet 4 for resume/interview)
- [x] SSE streaming helpers
- [x] POST /api/chat — about-me + interview sections working (400 bug fixed)
- [x] About Me system prompt with progress tracking + extraction
- [x] Chat UI components — all bugs fixed, profile updates flowing
- [x] Voice input fills textarea, no auto-send
- [x] ProfileProvider with localStorage persistence
- [x] Profile gate enforcement (sidebar, mobile nav, resume page)
- [x] Sidebar profile card with live completeness
- [x] Chat history persistence (localStorage)
- [x] Profile editor form (8 core fields, Chat|Profile tabs)
- [x] "I'm Karen" quick-load button (loads full profile in one click)
- [x] POST /api/resume/upload (PDF parsing with pdf-parse v2)
- [x] POST /api/resume/critique (SSE streaming, Sonnet 4)
- [x] POST /api/resume/generate (SSE streaming, Sonnet 4)
- [x] POST /api/resume/fork (SSE streaming, Sonnet 4)
- [x] Resume page UI — full 4-step flow (Upload → Critique → Generate → Fork)
- [x] Upload zone with drag-and-drop
- [x] Critique panel with score ring, category bars, findings
- [x] Generate panel with changes diff view
- [x] Fork panel with keyword alignment badges
- [x] DOCX download (client-side, professional formatting)
- [x] Resume prompts research-backed (XYZ Formula, Bavaro pillars, IGotAnOffer keywords)
- [x] Interview resources + prompt system (7 question types, 6 companies)
- [x] Interview page with setup UI + chat session
- [x] Chat message limit increased to 50000 chars
- [x] Vitest unit tests — 10/10 passing
- [x] Playwright E2E tests — 26/26 passing

### What's NOT Done
- [ ] Outreach section (Coming Soon stub exists)
- [ ] Negotiate section (Coming Soon stub exists)
- [ ] Toast notifications
- [ ] Skeleton loaders
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Vercel deployment
- [ ] Lighthouse performance benchmarks
- [ ] Token budget management for long conversations
- [ ] Vitest worker timeout fix (WSL2 issue — tests pass but slow)

## Priority Next Steps
1. **Live test full resume workflow** — Upload real PDF, critique, generate, fork, download DOCX
2. **Live test interview section** — Verify mock interview flow end-to-end
3. **Polish UI/UX** — Toast notifications, skeleton loaders, responsive edge cases
4. **CI/CD + Vercel deployment** — GitHub Actions, production deploy
5. **Token budget** — Sliding window or summarization for long conversations

## Blockers
- Vitest worker times out in WSL2 (infra issue, not code — tests still pass)
- WSL2 npm install can fail with permission errors (workaround: use Windows terminal or sudo)
- WSL2 memory constraints may cause `next build` OOM

## Open Questions
- Rate limiting: IP-based in-memory counter resets on restart. Acceptable for MVP?
- Token budget: no sliding window or summarization for long conversations yet
- Should Interview section also have a profile gate, or is it open from the start?

## Notes for Specific Agents

### Product Manager
Complete resume workflow is built end-to-end. Profile quick-load bypasses chat for Karen's convenience. All core product features for About Me, Resume, and Interview are functional. Outreach and Negotiate remain as Coming Soon stubs.

### UX Designer
Resume page has 4 clear steps with visual progression. Fork panel has keyword alignment with color-coded badges. Quick-load button appears above tabs on About Me page and disappears after use. Review flow transitions and responsive behavior.

### Frontend Engineer
New components: generate-panel.tsx, fork-panel.tsx, download-button.tsx, quick-load-button.tsx. Resume page manages state across 4 steps (uploadData, critiqueFindings, generateResult). DOCX generation is client-side via `docx` package. Chat container fixed — no more duplicate messages in conversationHistory.

### Backend Engineer
All 4 resume APIs complete (upload, critique, generate, fork). pdf-parse v2 API integration done (class-based PDFParse with getText()). Quality tier maxTokens increased to 4096. Chat route message deduplication was client-side fix, not server-side.

### AI Engineer
Resume generate and fork prompts are comprehensive with research-backed frameworks. See docs/resources/senior-pm-resume-research.md for source material. Prompts include level-specific guidance (APM→VP), XYZ Formula, strong/weak verb lists, IGotAnOffer 40 PM keywords. Model picker routes resume tasks to Sonnet 4.

### DevOps Engineer
npm install has WSL2 permission issues on Windows filesystem (can't rename in node_modules). Consider running npm from Windows terminal. CI/CD pipeline is next priority after core features stabilize.

### Content Strategist
Karen's full career document is now in src/data/karen-profile.ts. Resume prompts enforce: no lies, no fake dates, outcome-first bullets, natural voice. Karen's resume preferences documented in her career doc (no summaries, no AI buzzwords, no em dashes, under 2 pages).

### QA Engineer
All tests passing: 10/10 unit, 26/26 E2E. Three critical bugs fixed (chat 400, profile updates, PDF parsing). Next: E2E tests for full resume workflow, interview flow E2E. Consider testing quick-load button behavior.
