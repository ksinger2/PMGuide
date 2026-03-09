---
description: Reinitialize the agent team and restore context from the last session's handoff notes
allowed-tools: ["Read", "Glob", "Grep", "Bash", "Agent"]
---

# /reinit — Team Reinitialization with Session Context

This command brings the full agent team online and catches them up on where we left off. It runs `/agents-init` first, then distributes the handoff notes from `NextStep.md` to every agent.

---

## Phase 1: Run /agents-init

Execute the full `/agents-init` workflow:

1. **Verify foundation files** exist (CLAUDE.md, ENGINEERING_GUIDE.md, design_system_rules.md, docs/PRD.md)
2. **Launch all 8 agents in parallel** with domain-scoped file reading
3. **Collect status reports** from each agent
4. **Present the initialization dashboard**

---

## Phase 2: Read NextStep.md

After all agents are initialized, read `NextStep.md` from the project root. This file contains:
- **Last session summary** — what was accomplished
- **Current status** — what's done and what's not
- **Priority next steps** — what to work on now
- **Blockers and open questions**
- **Agent-specific notes** — targeted context for each role

---

## Phase 3: Distribute Context to All Agents

Launch all 8 agents again in parallel. Each agent reads `NextStep.md` AND their agent-specific notes section. Each agent reports:

- **Acknowledged context**: What they picked up from the handoff notes
- **Their domain status**: Based on both their domain files AND the handoff notes
- **Recommended first action**: What they think they should work on next, given the current state
- **Questions or concerns**: Anything unclear or potentially stale in the notes

---

## Phase 4: Present Unified Briefing

Compile all agent responses into a briefing:

```
## Team Reinit — Session Briefing

### Last Session
[Summary from NextStep.md]

### Current State
| Agent | Domain Status | Recommended First Action |
|-------|--------------|-------------------------|
| Product Manager | [status] | [action] |
| UX Designer | [status] | [action] |
| Frontend Engineer | [status] | [action] |
| Backend Engineer | [status] | [action] |
| AI Engineer | [status] | [action] |
| DevOps Engineer | [status] | [action] |
| Content Strategist | [status] | [action] |
| QA Engineer | [status] | [action] |

### Priority Next Steps
[From NextStep.md, validated by agent feedback]

### Blockers
[From NextStep.md + any new ones agents identified]

### Open Questions
[From NextStep.md + any new ones from agents]
```

---

## Phase 5: Ask User Direction

Present the briefing and ask:
> "Team is reinitialized and caught up. Based on the handoff notes, the top priority is [X]. Would you like to:
> 1. Start on the top priority
> 2. Pick a different task
> 3. Update NextStep.md first (if notes are stale)
> 4. Full sprint planning session"

---

## IMPORTANT: End-of-Session Protocol

**Before ending ANY work session, you MUST update NextStep.md.** This is non-negotiable.

Update these sections:
- **Last Updated**: Current date
- **Session Summary**: What was accomplished this session
- **Current Status**: Update done/not-done checklists
- **Priority Next Steps**: What should happen next
- **Blockers**: Any unresolved issues
- **Open Questions**: Anything that needs decision
- **Notes for Specific Agents**: Targeted context per role

The quality of the next session depends entirely on the quality of these notes. Be specific, be honest about what's incomplete, and leave clear breadcrumbs.
