# Next Steps — PMGuide

---

## Docker Setup (Run on Windows PC)

> **For Claude Code:** This section contains commands you can execute on the Windows PC (WSL).
> **Full guide:** See [`docs/DOCKER_SETUP.md`](docs/DOCKER_SETUP.md) for detailed explanations and troubleshooting.

### Architecture
```
SSH in → WSL starts → systemd starts Docker → Docker restarts PMGuide container
```

### Step 1: Enable systemd in WSL

```bash
# Check if systemd is already enabled
cat /etc/wsl.conf
```

If `[boot] systemd=true` is not present, add it:
```bash
sudo tee -a /etc/wsl.conf << 'EOF'
[boot]
systemd=true
EOF
```

> ⚠️ **Manual step required:** User must run `wsl --shutdown` from PowerShell, then reopen WSL.

Verify systemd is running:
```bash
systemctl --version
```

---

### Step 2: Install Docker Engine

```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repo
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Enable Docker to start with systemd
sudo systemctl enable docker
sudo systemctl start docker
```

Verify:
```bash
docker run hello-world
```

---

### Step 3: Build and Start PMGuide

```bash
cd /mnt/c/Users/[YourUser]/path/to/PMGuide

# Build the image
docker compose build

# Start the container (detached)
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

Test in browser: http://localhost:3000

---

### Step 4: Auto-Start (Already Configured)

No Task Scheduler needed. The boot chain handles everything:

1. **SSH in** → WSL starts automatically
2. **systemd** starts Docker (`systemctl is-enabled docker` → `enabled`)
3. **Docker** restarts the PMGuide container (`restart: always` in `docker-compose.yml`)

The container stays alive across WSL restarts. As long as you SSH in (which starts WSL), Docker and PMGuide come up on their own.

**Verify the chain is configured:**
```bash
# systemd enabled?
grep -q 'systemd=true' /etc/wsl.conf && echo "OK" || echo "MISSING"

# Docker auto-starts?
systemctl is-enabled docker

# Container restarts automatically?
grep 'restart:' docker-compose.yml
```

---

### Verification Checklist

- [x] `/etc/wsl.conf` has `systemd=true`
- [x] `systemctl is-enabled docker` returns `enabled`
- [x] `docker compose up -d` starts PMGuide
- [x] http://localhost:3000 loads PMGuide
- [ ] After reboot: SSH in → `docker compose ps` shows container running → localhost:3000 loads

---

### Management Commands

```bash
docker compose logs -f pmguide   # View logs
docker compose restart           # Restart container
docker compose down              # Stop container
docker compose build --no-cache  # Rebuild after code changes
docker compose up -d             # Start again
```

---

## Current Status (Session 13 — 2026-03-17)

### Session 13 Update: Chrome MCP for Browser Automation
Chrome DevTools MCP server was configured in `~/.claude/settings.json` to enable Claude agents to control Chrome programmatically. This will help with Stripe/Supabase account setup.

**To activate Chrome MCP (next session):**
1. Launch Chrome: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/ChromeDebugProfile"`
2. Restart Claude Code
3. Run `/mcp` to verify tools are available

---

## Previous Status (Session 9)

### What's Done
- **About Me chatbot** — profile collection, learning style, profile gate (70% threshold)
- **Resume section** — upload, critique (Sonnet 4), generate, fork, branch chat, scoring (weighted in code), voice input
- **Interview Lab** — structured practice, question bank, grading, model answers, ask-expert chat
- **Negotiation Lab** — 5 modes (coach, crafter, recruiter sim, offer analysis, expert demo)
- **Outreach section** — cold email/LinkedIn templates, research-backed prompts
- **Auth & billing** — NextAuth (Google), Stripe checkout/portal/webhooks, Prisma/Supabase user model, admin bypass, subscription gating middleware

### What's Next
1. **Connect Stripe + Supabase** — env vars are placeholders, follow walkthrough below
2. **Testing** — E2E tests for auth flow, subscription gating, webhook handling
3. **Production deploy** — Vercel env vars, production Stripe webhook endpoint
4. **Analytics** — track usage per user now that auth exists
5. **Polish** — error states, loading skeletons, mobile responsiveness audit

---

## Stripe + Supabase Setup Walkthrough

### Step 1: Supabase — Create Project & Get Connection Strings

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Pick a name (e.g. "pmguide"), set a DB password, choose a region
3. Once created, go to **Project Settings → Database**
4. Copy **two** connection strings:
   - **Session mode (port 5432)** → paste as `DATABASE_URL` in `.env.local`
   - **Direct connection (port 6543)** → paste as `DIRECT_URL` in `.env.local`
   - Both should look like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
5. Run `npx prisma db push` from the project root — this creates the `users` table in Supabase

**Verify:** Go to Supabase → Table Editor — you should see a `users` table with columns: `id`, `email`, `name`, `stripe_customer_id`, `subscription_status`, `stripe_subscription_id`, `current_period_end`, `created_at`, `updated_at`.

---

### Step 2: Stripe — Create Account & Get API Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → sign up or log in
2. You'll start in **Test Mode** (toggle in top-right) — stay in test mode for now
3. Go to **Developers → API Keys**
4. Copy:
   - **Publishable key** (`pk_test_...`) → paste as `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...`) → paste as `STRIPE_SECRET_KEY`

---

### Step 3: Stripe — Create Product & Price

1. Go to **Product Catalog → Add Product**
2. Fill in:
   - **Name:** PMGuide Monthly
   - **Description:** AI-powered PM career coaching (optional)
   - **Pricing:** $12.99, Recurring, Monthly
3. Click **Add Product**
4. On the product page, find the **Price ID** (starts with `price_...`)
5. Copy it → paste as `STRIPE_PRICE_ID`

---

### Step 4: Stripe — Enable Customer Portal

1. Go to **Settings → Billing → Customer Portal**
2. Toggle on: **Allow customers to update payment methods**
3. Toggle on: **Allow customers to cancel subscriptions**
4. Save — this enables the "Manage Billing" button in the sidebar

---

### Step 5: Stripe CLI — Install & Test Webhooks Locally

1. Install Stripe CLI:
   - **Mac:** `brew install stripe/stripe-cli/stripe`
   - **Windows/WSL:**
     ```bash
     curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
     echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
     sudo apt update && sudo apt install stripe
     ```
2. Run `stripe login` — opens browser to authenticate
3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. The CLI prints a **webhook signing secret** (`whsec_...`) — copy it → paste as `STRIPE_WEBHOOK_SECRET`
5. Keep this terminal running while testing

---

### Step 6: Test the Full Flow

1. Start dev server: `npm run dev`
2. Open browser → `localhost:3000`
3. Sign in with Google → you should be redirected to `/subscribe`
4. Click **Subscribe Now** → redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
6. Complete payment → redirected to `/subscribe/success` → then to `/about-me`
7. Check the `stripe listen` terminal — you should see `checkout.session.completed` event
8. Check Supabase → `users` table → your row should show `subscription_status = active`

#### Test admin bypass
- Set `ADMIN_EMAILS=your-google-email@gmail.com` in `.env.local`
- Sign in → should skip `/subscribe` and go straight to the app

#### Test cancellation
- In Stripe Dashboard → Customers → find yourself → cancel subscription
- Refresh the app → should redirect to `/subscribe`

---

### Step 7: Production Webhook (when deploying to Vercel)

1. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** → set as `STRIPE_WEBHOOK_SECRET` in Vercel env vars
5. Also set all other env vars in Vercel (DATABASE_URL, DIRECT_URL, STRIPE_SECRET_KEY, etc.)

---

## Env Vars Checklist (`.env.local`)

| Variable | Where to get it | Status |
|----------|----------------|--------|
| `DATABASE_URL` | Supabase → Settings → Database → Session mode | placeholder |
| `DIRECT_URL` | Supabase → Settings → Database → Direct | placeholder |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys | placeholder |
| `STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys | placeholder |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` output (local) or Stripe webhook endpoint (prod) | placeholder |
| `STRIPE_PRICE_ID` | Stripe → Product Catalog → your product → Price ID | placeholder |
| `ADMIN_EMAILS` | Your email (comma-separated for multiple) | set |

---

## What's Already Implemented

- **Core features**: About Me chatbot, Resume (critique/generate/fork/branch), Interview Lab, Negotiation Lab, Outreach
- **AI routing**: Sonnet 4 for quality tasks, Haiku for chat, per-task temperature overrides
- **Auth**: NextAuth + Google OAuth, JWT with subscription status, admin email bypass
- **Billing**: Stripe checkout, portal, webhook routes, subscription gating middleware
- **Database**: Prisma schema with `User` model on Supabase (Postgres)
- **UI**: Sidebar with billing management, profile gate, voice input (Web Speech API)
- **All API routes** protected with `requireAuth()`, rate limiting keyed to user email

---

## Troubleshooting

- **`prisma db push` fails**: Check that `DATABASE_URL` is correct and your IP isn't blocked by Supabase
- **Webhook 400 errors**: Make sure `stripe listen` is running and `STRIPE_WEBHOOK_SECRET` matches the CLI output
- **Redirect loop on `/subscribe`**: Clear cookies, or check that the JWT callback in `auth.ts` is correctly reading subscription status
- **"Subscription required" after paying**: The JWT caches subscription status — call `session.update()` to refresh, or sign out and back in
- **Google OAuth errors**: Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set, and redirect URI matches `http://localhost:3000/api/auth/callback/google`
