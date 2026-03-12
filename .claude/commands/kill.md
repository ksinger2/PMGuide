# /kill — Kill All Project Processes

Find and kill all processes related to this project: dev servers, test runners, and any stale port listeners.

---

## Steps

1. **Find processes on known ports** — Check ports 3000, 3001, 3002 (Next.js dev servers) and 9323 (Playwright):
   ```bash
   lsof -i :3000,:3001,:3002,:9323 2>/dev/null || ss -tlnp 'sport = :3000 or sport = :3001 or sport = :3002 or sport = :9323' 2>/dev/null
   ```

2. **Find Node/Next.js processes for this project** — Look for node processes running from the PMGuide directory:
   ```bash
   ps aux | grep -E '(next|playwright|node)' | grep -i pmguide
   ```

3. **Find any remaining node dev processes** — Broader sweep for stale node processes:
   ```bash
   ps aux | grep -E '(next-server|next dev|playwright|vitest)' | grep -v grep
   ```

4. **Kill identified processes** — For each found process, kill it:
   ```bash
   kill <PID>
   ```
   If a process won't die, use `kill -9 <PID>`.

5. **Verify ports are free** — Confirm nothing is still listening:
   ```bash
   lsof -i :3000,:3001,:3002 2>/dev/null || echo "All ports clear"
   ```

6. **Report** — List what was killed (process name, PID, port) and confirm all ports are free.

---

## Notes
- Always show what you're about to kill before killing it.
- If nothing is found, just say "No project processes running."
- Don't kill unrelated node processes (e.g., VS Code, Cursor).
