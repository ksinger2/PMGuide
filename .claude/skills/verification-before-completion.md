---
name: verification-before-completion
description: Enforces fresh verification evidence before any completion claim - prevents false positives and premature done signals
---

# Verification Before Completion

## Core Principle

**No completion claims without fresh verification evidence.**

Every time you claim something is "done," "working," "fixed," or "complete," you MUST have run a verification command in the CURRENT conversation turn and read its output. Memory of past runs, assumptions about what "should" work, and logical deduction are NOT verification.

## Gate Function

Before any completion claim, execute this gate:

1. **Identify** the verification command (build, test, lint, curl, browser check, etc.)
2. **Run** the command using Bash
3. **Read** the full output - do not skim or assume
4. **Verify** the output confirms success (exit code 0, expected output present, no errors)
5. **THEN and only then** claim completion

If any step fails, you are NOT done. Fix the issue and re-run the gate.

## Common Verification Commands for PMGuide

| Action Completed | Verification Command | Success Criteria |
|---|---|---|
| Component created | `npx tsc --noEmit` | No type errors |
| API route added | `curl -s localhost:3000/api/route` | Expected response shape |
| Page built | `npm run build` | Build succeeds, no errors |
| Test written | `npm test -- --run path/to/test` | All assertions pass |
| Style changes | `npm run lint` | No lint errors |
| Package installed | `npm ls package-name` | Package listed in tree |
| Env var added | Check `.env.example` has it documented | Variable present |
| Prompt modified | Test with sample input | Expected output format |
| Fix applied | Run the originally failing scenario | Scenario now passes |
| CI config changed | `act --list` or push and check | Workflow parses correctly |

## Common Failure Modes

### 1. The Assumption Trap
"I added the import so it should work now."
**Wrong.** Run `npx tsc --noEmit` and confirm zero errors.

### 2. The Partial Check
"The component renders." But does it handle the error state? The loading state? The empty state?
**Verify each state** the component is expected to handle.

### 3. The Stale Evidence
"It worked when I checked 10 minutes ago."
**Re-run now.** Code has changed since then.

### 4. The Happy Path Only
"The API returns the right data."
**Also verify:** What happens with invalid input? Missing auth? Empty request body?

### 5. The Build-but-not-Runtime
"TypeScript compiles."
**Also verify:** Does it actually run? Types passing does not mean logic is correct.

## Red Flags - Phrases That Require Immediate Verification

If you catch yourself saying any of these, STOP and run verification:

- "That should fix it"
- "This will work because..."
- "I've updated the code to..."
- "The component now handles..."
- "The API endpoint is ready"
- "Tests should pass now"
- "The build should succeed"
- "I've resolved the issue"

Every "should" is a hypothesis. Verify it.

## Rationalization Prevention

Your brain will generate plausible reasons to skip verification:

- "It's a trivial change" - Trivial changes cause production outages. Verify.
- "I just need to add one more thing first" - Verify the current state, then add.
- "The user is waiting" - The user would rather wait 10 seconds for verification than debug a false completion for 10 minutes.
- "I already verified something similar" - Similar is not identical. Verify this specific change.

## Non-Negotiable Discipline

This is not a suggestion. This is not a "best practice." This is a hard requirement.

**The cost of false verification: hours of debugging, lost user trust, compounding errors.**
**The cost of real verification: seconds.**

There is no scenario where skipping verification is the right call.

### The Rule

```
IF claiming_completion THEN
  evidence = run_verification_command()
  assert evidence.exit_code == 0
  assert evidence.output contains expected_results
  assert evidence.timestamp is current_turn
  ONLY THEN say "done"
END
```
