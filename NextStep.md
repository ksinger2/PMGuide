# NextStep — Session Handoff Notes

> This file is the team's shared memory between sessions. Before ending work, update this file so the next session knows exactly where to pick up. When `/reinit` runs, every agent reads this to restore context.

---

## Last Updated
2026-03-09 — Initial project setup

## Session Summary
Initialized the PMGuide project from scratch:
- Created GitHub repo at ksinger2/PMGuide
- Set up 8 agent definitions (PM, UX, Frontend, Backend, AI, DevOps, Content, QA)
- Created /agents-init command, 6 skills, design system rules
- Created all foundation docs (CLAUDE.md, ENGINEERING_GUIDE.md, PRD, API contracts, question bank, resume examples, design system)
- No application code yet — directory structure exists but src/ is empty

## Current Status

### What's Done
- [x] Git repo initialized and pushed
- [x] Agent team defined (8 agents in .claude/agents/)
- [x] /agents-init command created
- [x] 6 skills created (verification, about-me-flow, resume-workflow, 3 stubs)
- [x] Foundation docs complete (PRD, API contracts, question bank, resume examples, design system)
- [x] CLAUDE.md and ENGINEERING_GUIDE.md written

### What's NOT Done
- [ ] Next.js app scaffold (no package.json, no src/ code yet)
- [ ] Tailwind configuration
- [ ] Any application code
- [ ] Playwright test setup
- [ ] CI/CD pipeline
- [ ] .env.example

## Priority Next Steps
1. **Scaffold Next.js app** — `npx create-next-app` with TypeScript + Tailwind + App Router
2. **Install dependencies** — @anthropic-ai/sdk, pdf-parse, docx, playwright
3. **Build layout** — responsive shell (sidebar desktop, bottom tabs mobile)
4. **About Me chatbot** — first feature to build (P0)

## Blockers
None currently.

## Open Questions
None currently.

## Notes for Specific Agents

### Product Manager
PRD is drafted in docs/PRD.md. Review and refine acceptance criteria for About Me section before build starts.

### UX Designer
Design system is in docs/DESIGN_SYSTEM.md and .claude/design_system_rules.md. First task: finalize chat UI component specs.

### Frontend Engineer
No code exists yet. Start with Next.js scaffold and responsive layout shell.

### Backend Engineer
API contracts are in docs/API_CONTRACTS.md. First endpoint to build: POST /api/chat.

### AI Engineer
Prompt registry needs to be created in src/lib/prompts/. Start with about-me conversation prompts.

### DevOps Engineer
No CI/CD yet. Set up after Next.js scaffold is in place.

### Content Strategist
Question bank is in docs/QUESTION_BANK.md. Review for completeness before About Me chatbot build.

### QA Engineer
No tests yet. Set up Playwright config after Next.js scaffold. First test suite: navigation + responsive layout.
