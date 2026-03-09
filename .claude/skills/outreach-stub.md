---
name: outreach-stub
description: Use when building the Outreach stub section - defines the Coming Soon page and future feature scope
---

# Outreach - Coming Soon Stub

## Overview

The Outreach section is a planned future feature of PMGuide. For the current release, it displays a Coming Soon page that previews the feature set and allows users to express interest. This skill defines the stub page content and the future feature scope for planning purposes.

## Coming Soon Page Content

### Headline
"Outreach - Your Networking Copilot"

### Subheadline
"Land warm introductions and meaningful connections with AI-powered outreach tools. Coming soon."

### Preview Description
> Breaking into PM or leveling up often comes down to who you know and how you reach out. PMGuide's Outreach section will help you craft authentic, personalized messages that open doors - without sounding like a template.

### Feature Preview Cards

Display 4 feature preview cards in a 2x2 grid. Each card has an icon placeholder, title, and short description.

#### 1. Cold Email Templates
**Icon:** Mail
**Description:** AI-generated cold outreach emails personalized to your background and the recipient's role. Not generic templates - each email references your specific experience and their specific work.

#### 2. LinkedIn Messages
**Icon:** MessageSquare
**Description:** Connection request messages and follow-up sequences that feel human. Optimized for LinkedIn's character limits with strategies for when to InMail vs. connect vs. comment.

#### 3. Networking Strategy
**Icon:** Users
**Description:** A personalized networking plan based on your target companies and role. Identifies who to reach out to, in what order, and with what angle. Includes warm intro request templates.

#### 4. Company Research Briefs
**Icon:** Building2
**Description:** One-page research briefs on target companies: recent product launches, team structure, PM culture signals, and conversation hooks you can use in outreach and coffee chats.

### Interest Collection
- "Notify me when Outreach launches" button
- Captures user email (or marks interest in their existing profile)
- Optional: "What outreach challenge are you facing?" text input for user research

### Visual Treatment
- Use the design system's muted/secondary color palette to signal "not yet active"
- Feature cards should have a subtle frosted/blur overlay or reduced opacity
- Include a small lock icon or "Coming Soon" badge on the navigation item
- The page should feel polished and intentional, not broken or empty

## Future Feature Scope (for Planning)

### Cold Email Generator
- Input: Target person's name, title, company + user's profile
- Output: 3 email variants (formal, conversational, mutual-connection)
- Personalization: references specific products they've shipped, blog posts, talks
- Anti-spam: never send directly, always draft for user review
- Follow-up sequence: day 3 bump, day 7 value-add, day 14 close

### LinkedIn Outreach Suite
- Connection request messages (300 char limit)
- InMail templates (longer form)
- Comment-first strategy: suggest posts to engage with before connecting
- Follow-up cadence after connection accepted
- Profile optimization tips for inbound interest

### Networking Strategy Engine
- Map target companies to people worth reaching out to
- Prioritize: alumni connections > 2nd degree > cold outreach
- Suggest PM communities, events, and Slack groups for organic networking
- Track outreach pipeline: contacted, responded, meeting scheduled, follow-up needed
- Weekly outreach goals and accountability

### Company Research Briefs
- Auto-generated from public sources (job postings, press releases, product updates)
- PM team structure and recent hires
- Product culture signals (blog posts, engineering blog, Glassdoor)
- Interview process intelligence (from public sources)
- Conversation hooks: "I noticed you just launched X..."

## Implementation Notes for Stub Page

- Route: `/outreach`
- Component: `src/components/outreach/ComingSoon.tsx`
- No backend API needed for stub
- No data persistence needed beyond interest collection
- Should be accessible from main section navigation
- Mobile responsive: stack cards vertically on mobile
- Include back/home navigation
