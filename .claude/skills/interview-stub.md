---
name: interview-stub
description: Use when building the Interview stub section - defines the Coming Soon page and future feature scope
---

# Interview - Coming Soon Stub

## Overview

The Interview section is a planned future feature of PMGuide. For the current release, it displays a Coming Soon page that previews the feature set and allows users to express interest. This skill defines the stub page content and the future feature scope for planning purposes.

## Coming Soon Page Content

### Headline
"Interview Prep - Your PM Interview Coach"

### Subheadline
"Practice every PM interview format with AI-powered mock interviews and real-time feedback. Coming soon."

### Preview Description
> PM interviews are uniquely challenging - product sense, estimation, behavioral, and technical all in one loop. PMGuide's Interview section will give you a dedicated practice partner that adapts to your skill level and target company's interview style.

### Feature Preview Cards

Display 5 feature preview cards. Top row: 3 cards. Bottom row: 2 cards centered.

#### 1. Product Sense
**Icon:** Lightbulb
**Description:** Practice "How would you improve X?" and "Design a product for Y" questions. Get structured frameworks, user-centric thinking feedback, and prioritization scoring. Covers favorite product, product improvement, and new product design.

#### 2. Estimation & Analytical
**Icon:** Calculator
**Description:** Sharpen your market sizing and Fermi estimation skills. Practice questions like "How many piano tuners in Chicago?" with step-by-step breakdown coaching and back-of-envelope math validation.

#### 3. Behavioral (STAR Method)
**Icon:** Star
**Description:** Master the STAR format for behavioral questions. Practice with questions tailored to your experience level: leadership, conflict resolution, failure stories, cross-functional collaboration. Get feedback on story structure and impact framing.

#### 4. System Design for PMs
**Icon:** Network
**Description:** Not the engineering deep dive - the PM perspective on system design. Practice articulating technical tradeoffs, API design decisions, scalability considerations, and data model choices at the right altitude for a PM role.

#### 5. Mock Interview Sessions
**Icon:** Video
**Description:** Full mock interview sessions that simulate real PM interview loops. Timed questions, follow-up probes, and a comprehensive scorecard at the end. Practice individual rounds or complete loops with multiple interviewers.

### Interest Collection
- "Notify me when Interview Prep launches" button
- Captures user email (or marks interest in their existing profile)
- Optional: "What type of PM interview are you preparing for?" dropdown (Product Sense, Behavioral, Technical, Full Loop, Other)

### Visual Treatment
- Use the design system's muted/secondary color palette to signal "not yet active"
- Feature cards should have a subtle frosted/blur overlay or reduced opacity
- Include a small lock icon or "Coming Soon" badge on the navigation item
- The page should feel polished and intentional, not broken or empty

## Future Feature Scope (for Planning)

### Product Sense Module
- Question bank organized by type: improve existing product, design new product, favorite product, product strategy
- Company-specific question sets (Google, Meta, Amazon, etc.)
- Structured framework coaching: user definition, pain points, solutions, prioritization, metrics, tradeoffs
- AI interviewer that asks follow-up questions based on user's response
- Scoring rubric: user empathy, creativity, structured thinking, prioritization rationale, metric definition

### Estimation Module
- Market sizing questions with graduated difficulty
- Step-by-step approach coaching (define scope, identify drivers, estimate each, sanity check)
- Common estimation patterns library (population-based, revenue-based, usage-based)
- Calculator scratchpad for showing work
- Accuracy benchmarking against known answers where available

### Behavioral Module
- Question bank organized by competency: leadership, conflict, failure, collaboration, influence, ambiguity
- STAR format coach: Situation (context), Task (your responsibility), Action (what YOU did), Result (measurable impact)
- Story bank: help users develop 8-10 versatile stories that cover multiple competencies
- Anti-patterns: flag vague stories, "we" without "I", missing metrics, no learning/reflection
- Company culture matching: emphasize different competencies based on target company values

### System Design for PMs Module
- PM-appropriate system design questions (not engineering whiteboard level)
- Focus areas: API design decisions, data model choices, scalability tradeoffs, integration patterns
- Practice articulating: "Why would you choose X over Y?" for architectural decisions
- Non-functional requirements thinking: latency, reliability, cost, security at PM depth
- Diagrams and data flow articulation practice

### Mock Interview Engine
- Timed sessions: 30-minute rounds, 45-minute rounds, or full 4-hour loops
- Interviewer personas: friendly, challenging, silent (minimal feedback), rapid-fire
- Adaptive difficulty: starts at user's assessed skill level, adjusts based on performance
- Post-session scorecard: dimension scores, transcript highlights, improvement areas
- Progress tracking: scores over time, weak areas trending, readiness assessment

## Implementation Notes for Stub Page

- Route: `/interview`
- Component: `src/components/interview/ComingSoon.tsx`
- No backend API needed for stub
- No data persistence needed beyond interest collection
- Should be accessible from main section navigation
- Mobile responsive: stack cards vertically on mobile, 2-column on tablet
- Include back/home navigation
