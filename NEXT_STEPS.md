# Next Steps — PMGuide

## Current Status
All Stripe/Supabase subscription code is implemented and builds successfully. The 6 Stripe/Supabase env vars in `.env.local` are still placeholders. Follow this walkthrough to connect everything.

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

- Prisma schema with `User` model (`prisma/schema.prisma`)
- Stripe checkout, portal, webhook routes (`src/app/api/stripe/`)
- NextAuth with Google provider + JWT subscription status (`src/lib/auth/`)
- Login page (`src/app/login/`)
- Subscribe page with Stripe Checkout redirect (`src/app/subscribe/`)
- Middleware for subscription gating (`src/middleware.ts`)
- Admin email bypass (skip paywall for specified emails)
- Manage Billing button in sidebar (Stripe Customer Portal)
- `.env.local` with placeholder values ready to fill in

---

## Troubleshooting

- **`prisma db push` fails**: Check that `DATABASE_URL` is correct and your IP isn't blocked by Supabase
- **Webhook 400 errors**: Make sure `stripe listen` is running and `STRIPE_WEBHOOK_SECRET` matches the CLI output
- **Redirect loop on `/subscribe`**: Clear cookies, or check that the JWT callback in `auth.ts` is correctly reading subscription status
- **"Subscription required" after paying**: The JWT caches subscription status — call `session.update()` to refresh, or sign out and back in
