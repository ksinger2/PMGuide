---
name: negotiate-stub
description: Use when building the Negotiate stub section - defines the Coming Soon page and future feature scope
---

# Negotiate - Coming Soon Stub

## Overview

The Negotiate section is a planned future feature of PMGuide. For the current release, it displays a Coming Soon page that previews the feature set and allows users to express interest. This skill defines the stub page content and the future feature scope for planning purposes.

## Coming Soon Page Content

### Headline
"Negotiate - Maximize Your PM Offer"

### Subheadline
"Data-driven negotiation strategy powered by real market compensation data. Coming soon."

### Preview Description
> The difference between accepting an offer and negotiating well can be $50K+ over a single year - and compounds over your entire career. PMGuide's Negotiate section will arm you with market data, proven scripts, and a simulation environment to practice before the real conversation.

### Feature Preview Cards

Display 4 feature preview cards in a 2x2 grid. Each card has an icon placeholder, title, and short description.

#### 1. Salary Range Intelligence
**Icon:** TrendingUp
**Description:** See real PM compensation ranges by company, level, and location. Understand base, bonus, and equity splits. Know your market value before you get to the negotiation table, backed by aggregated data from public and crowd-sourced compensation databases.

#### 2. Offer Comparison Tool
**Icon:** Scale
**Description:** Compare multiple offers side-by-side with total compensation modeling. Factor in base salary, signing bonus, annual bonus, RSU vesting schedules, benefits value, 401k matching, and cost-of-living adjustments. See the 4-year total comp picture, not just Year 1.

#### 3. Negotiation Scripts
**Icon:** MessageCircle
**Description:** Battle-tested scripts for every negotiation scenario: initial response to an offer, asking for more base, negotiating equity, competing offer leverage, signing bonus requests, level-up arguments, and graceful acceptance. Personalized to your situation.

#### 4. Equity Valuation
**Icon:** PieChart
**Description:** Understand what your equity is actually worth. Model RSU vesting schedules, calculate effective annual equity value, assess startup option strike prices and dilution scenarios, and compare liquid vs. illiquid compensation. Avoid the "your equity is worth $X" trap.

### Interest Collection
- "Notify me when Negotiate launches" button
- Captures user email (or marks interest in their existing profile)
- Optional: "Do you have a current offer you're evaluating?" yes/no toggle for prioritization

### Visual Treatment
- Use the design system's muted/secondary color palette to signal "not yet active"
- Feature cards should have a subtle frosted/blur overlay or reduced opacity
- Include a small lock icon or "Coming Soon" badge on the navigation item
- The page should feel polished and intentional, not broken or empty

## Future Feature Scope (for Planning)

### Salary Range Intelligence
- Data sources: levels.fyi, Glassdoor, Blind, H1B salary database, user-contributed data
- Filters: company, level (L3-L8 / IC4-IC8 etc.), location, PM specialization
- Compensation breakdown: base salary, annual bonus (% and $), sign-on bonus, RSU grant value
- Trend data: YoY compensation movement by level and company tier
- Location adjustment: cost-of-living multipliers, remote work policies
- Confidence intervals: show data density and reliability per data point
- "What should I ask for?" recommendation engine based on user profile + market data

### Offer Comparison Tool
- Side-by-side comparison of up to 4 offers
- Total compensation model:
  - Year 1: base + signing bonus + first-year bonus (prorated) + first-year equity vest
  - Year 2-4: base + full bonus + equity vesting schedule
  - 4-year total: sum with equity refresher assumptions
- Benefits valuation: health insurance quality, PTO days, parental leave, learning budget, 401k match
- Lifestyle factors: commute time, remote flexibility, team size, growth trajectory
- Tax implications: state tax differences, RSU tax treatment
- Final recommendation with weighted scoring based on user priorities

### Negotiation Scripts Engine
- Scenario-specific scripts:
  - "The initial offer just came in - what do I say?" (buy time, express enthusiasm, don't commit)
  - "I want to ask for X% more base" (anchoring, justification, collaborative framing)
  - "I have a competing offer" (leverage without ultimatums, respectful comparison)
  - "They said the offer is final" (probe for flexibility, alternative compensation, creative solutions)
  - "I want to negotiate level, not just comp" (career trajectory argument, scope evidence)
  - "I want to accept gracefully" (confirming details, start date negotiation, written confirmation)
- Personalization: scripts reference user's specific background, the specific company, and the specific numbers
- Tone calibration: assertive but collaborative, never aggressive or entitled
- Email vs. phone guidance: which conversations should be written vs. verbal
- Follow-up cadence: when to follow up after each negotiation step

### Equity Valuation Module
- Public company RSU calculator:
  - Input: grant size (shares or $), vesting schedule, current stock price
  - Output: annual vest value, 4-year projected value (with growth scenarios)
  - Tax modeling: RSU taxation at vest, capital gains on appreciation
- Startup equity calculator:
  - Input: option grant, strike price, current valuation (409A), share count, funding stage
  - Output: current paper value, dilution scenarios (next round projections), liquidity timeline
  - Risk assessment: stage-appropriate discount rates (seed vs. Series C)
  - Exit scenarios: what your equity is worth at different exit valuations
- Equity comparison: "Is 0.1% at a Series B startup worth more than 200 RSUs at Google?"
- Common traps: "Your equity is worth $X" without context, cliff vesting gotchas, single-trigger vs. double-trigger acceleration

### Negotiation Simulator
- Practice negotiations with AI playing the recruiter/hiring manager
- Recruiter personas: friendly, firm, aggressive, vague
- Simulate common pushback: "That's above our band," "We don't negotiate on equity," "We need an answer by Friday"
- Real-time coaching: after each user message, get feedback on approach before continuing
- Scorecard: rated on assertiveness, preparation evidence, collaborative tone, creative problem-solving

## Implementation Notes for Stub Page

- Route: `/negotiate`
- Component: `src/components/negotiate/ComingSoon.tsx`
- No backend API needed for stub
- No data persistence needed beyond interest collection
- Should be accessible from main section navigation
- Mobile responsive: stack cards vertically on mobile
- Include back/home navigation
