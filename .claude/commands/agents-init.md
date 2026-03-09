---
description: Initialize all PMGuide agents - each reads their domain docs and reports ready status
allowed-tools: ["Read", "Glob", "Grep", "Bash", "Agent"]
---

# /agents-init - PMGuide Agent Initialization

Execute the following 4-phase initialization workflow in strict order. Do not skip phases.

---

## Phase 1: Verify Foundation

Before launching any agents, verify that all foundation files exist. Check for the presence of each file:

1. `CLAUDE.md` - Project intelligence and conventions
2. `ENGINEERING_GUIDE.md` - Engineering standards and patterns
3. `.claude/design_system_rules.md` - Design system tokens and component specs
4. `docs/PRD.md` - Product Requirements Document

**Use Glob or Bash to confirm each file exists.**

If ANY file is missing:
- Report exactly which files are missing in a clear list
- **STOP execution immediately** - do not proceed to Phase 2
- Suggest the user create the missing files first

If ALL files exist, print: "Foundation verified. All 4 core files present." and proceed.

---

## Phase 2: Launch All 8 Agents in Parallel (Domain-Scoped)

Launch ALL 8 agents simultaneously using the Agent tool. Each agent has a strictly scoped domain - they must ONLY read the files listed for their role. This prevents cross-domain confusion and keeps initialization fast.

### Agent 1: Product Manager
**Read ONLY:** `docs/PRD.md`, `CLAUDE.md`
**Do NOT read:** Source code, API files, test files
**Report:**
- PRD completeness status (are all sections filled in?)
- Requirement gaps (missing user stories, undefined acceptance criteria)
- Priority recommendations (what should be built first based on PRD)
- Feature dependency map observations

### Agent 2: UX Designer
**Read ONLY:** `.claude/design_system_rules.md`, `docs/DESIGN_SYSTEM.md`
**Do NOT read:** API code, backend logic, test files
**Report:**
- Design system completeness (tokens, components, patterns defined?)
- Missing component specs (any components referenced but not specified?)
- Accessibility status (WCAG compliance gaps, missing aria patterns)
- Responsive design coverage (mobile/desktop breakpoints defined?)

### Agent 3: Frontend Engineer
**Read ONLY:** `src/components/` (all files), `src/app/` (page files), `.claude/design_system_rules.md`, `ENGINEERING_GUIDE.md`
**Do NOT read:** API route handlers, test files, docs/
**Report:**
- Component inventory (list all existing components)
- Missing components (referenced in design system but not built)
- Pattern compliance (do existing components follow engineering guide conventions?)
- Import/export structure health

### Agent 4: Backend Engineer
**Read ONLY:** `src/app/api/` (all route handlers), `src/lib/` (non-prompt files), `docs/API_CONTRACTS.md`, `ENGINEERING_GUIDE.md`
**Do NOT read:** Components, pages, design system, test files
**Report:**
- API route inventory (list all endpoints with methods)
- Missing endpoints (defined in API contracts but not implemented)
- Security checklist (auth middleware, input validation, rate limiting, CORS)
- Error handling patterns audit

### Agent 5: AI Engineer
**Read ONLY:** `src/lib/prompts/` (all prompt files), `src/lib/claude.ts`, `docs/PRD.md` (AI-related sections only)
**Do NOT read:** Components, pages, API routes, test files
**Report:**
- Prompt registry status (list all defined prompts and their purposes)
- Model routing config (which models are used where, fallback chains)
- Conversation flow completeness (all PRD-defined AI interactions covered?)
- Token/cost optimization observations

### Agent 6: DevOps Engineer
**Read ONLY:** `package.json`, `next.config.js`, `.github/workflows/` (all files), `.env.example`
**Do NOT read:** Source code, docs/, test files
**Report:**
- CI/CD status (GitHub Actions workflows present and configured?)
- Deployment readiness (build scripts, environment configs)
- Env config completeness (all required env vars documented in .env.example?)
- Dependency health (outdated packages, security concerns in package.json)

### Agent 7: Content Strategist
**Read ONLY:** `docs/QUESTION_BANK.md`, `docs/RESUME_EXAMPLES.md`, `docs/PRD.md`
**Do NOT read:** Source code, API files, test files
**Report:**
- Content inventory (what PM domain content exists?)
- PM domain content gaps (missing question categories, thin coverage areas)
- Question bank completeness (behavioral, product sense, estimation, technical)
- Resume examples quality (do examples cover different PM levels/industries?)

### Agent 8: QA Engineer
**Read ONLY:** `tests/` (all test files), `playwright.config.ts`, `src/` (scan for data-testid coverage)
**Do NOT read:** docs/, config files unrelated to testing
**Report:**
- Test coverage inventory (unit tests, integration tests, e2e tests)
- Missing test suites (features without tests, untested API routes)
- CI integration status (are tests wired into GitHub Actions?)
- Test ID coverage (components with/without data-testid attributes)

---

## Phase 3: Status Dashboard

After ALL 8 agents have reported back, collect their results and present a unified dashboard.

### Dashboard Table

Format as a markdown table:

| Agent | Status | Files Read | Gaps Found |
|-------|--------|------------|------------|
| Product Manager | Ready/Warning/Blocked | count | count |
| UX Designer | Ready/Warning/Blocked | count | count |
| Frontend Engineer | Ready/Warning/Blocked | count | count |
| Backend Engineer | Ready/Warning/Blocked | count | count |
| AI Engineer | Ready/Warning/Blocked | count | count |
| DevOps Engineer | Ready/Warning/Blocked | count | count |
| Content Strategist | Ready/Warning/Blocked | count | count |
| QA Engineer | Ready/Warning/Blocked | count | count |

**Status definitions:**
- **Ready** - All domain files found, no critical gaps
- **Warning** - Files found but significant gaps identified
- **Blocked** - Missing critical files, cannot proceed

### Priority Actions

Below the table, list the top 5 priority actions across all agents, ordered by impact. Format:

**Priority Actions:**
1. [Agent] - Action description (Impact: High/Medium/Low)
2. [Agent] - Action description (Impact: High/Medium/Low)
3. ...

---

## Phase 4: Ask User Next Step

Present the following options to the user and wait for their selection:

---

**All agents initialized. What would you like to work on?**

1. **About Me chatbot** - Build the conversational onboarding experience (warm welcome, career snapshot, goals, skills assessment)
2. **Resume section** - Build the resume upload, critique, generation, and download pipeline
3. **Foundation work** - Address gaps found during initialization (missing docs, config, infrastructure)
4. **Full sprint planning** - Plan a complete sprint across all agents with task breakdown and assignments

Please select a number (1-4) or describe what you'd like to focus on.

---

Wait for user response before proceeding. Do not auto-select an option.
