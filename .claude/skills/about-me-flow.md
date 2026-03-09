---
name: about-me-flow
description: Use when building or modifying the About Me chatbot onboarding experience - guides conversation design, profile extraction, and learning style detection
---

# About Me Flow - Conversational Onboarding

## Overview

The About Me chatbot is PMGuide's first touchpoint with every user. It replaces static forms with a warm, adaptive conversation that builds a comprehensive PM profile. The chatbot extracts structured data from natural conversation, detects learning preferences, and creates the foundation for all personalized features downstream (resume, interview prep, outreach).

## Conversation Flow Phases

### Phase 1: Warm Welcome
**Goal:** Set the tone, reduce anxiety, establish trust.

- Greet the user by introducing PMGuide's purpose
- Explain what will happen: "a short conversation to understand your background"
- Set expectations: ~5-10 minutes, can pause and return anytime
- Offer voice or text input preference
- No data collection in this phase - purely rapport-building

**Example opener:**
> "Hey! I'm PMGuide - think of me as your PM career co-pilot. I'd love to spend a few minutes getting to know you so I can tailor everything to your specific situation. Sound good?"

**Transition trigger:** User confirms readiness or asks a question (both count as engagement).

### Phase 2: Career Snapshot
**Goal:** Establish current position and high-level trajectory.

Extract these data points through natural conversation (do NOT present as a form):
- Current role and title (or "aspiring PM" if career-switching)
- Years of experience (total and in PM specifically)
- Company/industry (current or most recent)
- Career stage: student, early career (0-2 yrs), mid-level (3-6 yrs), senior (7+ yrs), executive
- Career transition status: staying in PM, switching into PM, switching PM specialization

**Adaptive behavior:**
- If user says "I'm a software engineer wanting to break into PM" - shift to career-switcher track
- If user says "I'm a Senior PM at Google" - shift to advancement/leveling track
- If user gives minimal answers, ask one follow-up, then move on (don't interrogate)

### Phase 3: Deep Dive
**Goal:** Understand PM specialization, domain expertise, and work style.

Explore (adapt based on Phase 2 answers):
- PM type: platform, growth, data, technical, consumer, enterprise, AI/ML, internal tools
- Domain expertise: fintech, health tech, e-commerce, SaaS, marketplace, social, dev tools
- Team context: team size, cross-functional partners, direct reports (if any)
- Key skills self-assessment: strategy, analytics, technical depth, design thinking, stakeholder management, execution
- Proudest PM achievement (open-ended, reveals what they value)

**Adaptive behavior:**
- Career switchers: focus on transferable skills from current role
- Senior PMs: explore leadership philosophy and org-level impact
- Students: focus on coursework, internships, side projects, case competitions

### Phase 4: Goals
**Goal:** Understand what the user wants to achieve with PMGuide.

Explore:
- Primary goal: land first PM role, level up, switch companies, switch PM specialization, prepare for interviews, improve resume
- Timeline: actively job searching now, preparing for future search, general skill building
- Target companies: FAANG, startups, mid-size, specific companies by name
- Target level: APM, PM, Senior PM, Group PM, Director, VP
- Blockers: "What's the biggest thing holding you back right now?"

### Phase 5: Skills Assessment
**Goal:** Identify specific strengths and gaps for personalized recommendations.

Assess across PM competency areas (use conversation, not a quiz):
- **Product Sense:** How they approach user problems, prioritization frameworks they use
- **Execution:** How they run sprints, handle scope creep, manage launches
- **Analytics:** SQL comfort level, metrics they track, A/B testing experience
- **Technical:** System design understanding, API literacy, technical debt management
- **Strategic Thinking:** Market analysis, competitive positioning, roadmap planning
- **Communication:** Stakeholder management, PRD writing, presentation comfort

**Detection method:** Ask scenario-based questions, not self-rating scales.
> "If you had to cut 50% of your roadmap tomorrow, walk me through how you'd decide what stays."

### Phase 6: Profile Synthesis
**Goal:** Confirm understanding and transition to PMGuide features.

- Summarize the profile back to the user in a natural paragraph (not a data dump)
- Highlight 2-3 key strengths detected
- Identify 2-3 growth areas
- Recommend which PMGuide section to start with and why
- Save the complete profile to the user's data store

**Example synthesis:**
> "Here's what I'm seeing: You're a mid-level PM with strong execution chops - your sprint management sounds tight. Your growth edge is product strategy and stakeholder communication at the director level. I'd recommend starting with the Resume section to sharpen how you tell your PM story, then moving to Interview prep for product sense practice. Sound right?"

## Profile Data Model

```typescript
interface UserProfile {
  // Identity
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  // Career Context
  currentRole: string;
  currentCompany: string;
  industry: string;
  yearsExperienceTotal: number;
  yearsExperiencePM: number;
  careerStage: 'student' | 'early' | 'mid' | 'senior' | 'executive';
  isCareerSwitcher: boolean;
  previousRole?: string; // if career switcher

  // PM Profile
  pmType: string[];         // e.g., ['growth', 'consumer']
  domainExpertise: string[]; // e.g., ['fintech', 'marketplace']
  teamSize?: number;
  hasDirectReports: boolean;
  directReportCount?: number;

  // Skills Assessment
  skills: {
    productSense: SkillLevel;
    execution: SkillLevel;
    analytics: SkillLevel;
    technical: SkillLevel;
    strategy: SkillLevel;
    communication: SkillLevel;
  };

  // Goals
  primaryGoal: string;
  targetCompanies: string[];
  targetLevel: string;
  timeline: 'active' | 'preparing' | 'exploring';
  biggestBlocker: string;

  // Preferences
  learningStyle: LearningStyle;
  inputPreference: 'text' | 'voice' | 'mixed';
  sessionPacePreference: 'quick' | 'detailed' | 'adaptive';

  // Achievements
  proudestAchievement: string;

  // Meta
  onboardingComplete: boolean;
  onboardingPhaseReached: number;
  profileCompleteness: number; // 0-100
}

type SkillLevel = 'novice' | 'developing' | 'competent' | 'proficient' | 'expert';

type LearningStyle = 'visual' | 'reading' | 'kinesthetic' | 'social' | 'mixed';
```

## Voice Input Guidance

- Support voice input as an option in Phase 1
- Use speech-to-text transcription, then process the text normally
- Voice responses tend to be longer and more natural - extract key data points without asking the user to repeat
- If transcription confidence is low, confirm key data points: "I heard you say you're at Stripe - is that right?"
- Never force voice; always allow text fallback

## Adaptive Pacing Rules

1. **Never ask more than 2 questions in a single message** - conversations, not interrogations
2. **If user gives a long, detailed answer, skip follow-up questions** in that area - they've already provided the info
3. **If user gives one-word answers, reduce scope** - ask fewer questions, accept less data, move forward
4. **Allow tangents** - if user goes off-topic into something interesting, acknowledge it and gently redirect
5. **Save progress after every phase** - user can close and resume without losing data
6. **Estimate remaining time** - "We're about halfway through - maybe 3 more minutes"
7. **Offer skip options** - "We can skip this part if you'd prefer and come back to it later"

## Learning Style Detection

Detect learning style implicitly through conversation behavior (do not ask "what's your learning style?"):

| Signal | Detected Style | Adaptation |
|---|---|---|
| User asks for examples, screenshots, diagrams | Visual | Provide more visual content, charts, frameworks as images |
| User gives long written responses, asks for articles | Reading/Writing | Provide detailed written guides, templates, checklists |
| User says "let me try" or "can I practice" | Kinesthetic | Offer interactive exercises, mock scenarios, hands-on tasks |
| User asks about communities, peers, mentors | Social | Suggest peer review features, community resources, networking |
| Mixed signals or no clear pattern | Mixed/Adaptive | Vary content format, let user gravitate naturally |

Store detected learning style in profile and use it across all PMGuide sections to personalize content delivery.

## Error Handling

- If the AI misunderstands a response, apologize briefly and re-ask with more specificity
- If the user seems frustrated (short answers, "idk", "whatever"), acknowledge it: "No worries - we can keep this super light. Just a couple more questions."
- If the user asks to restart, clear current phase data and go back to Phase 1
- If the user asks what data is collected, provide a clear summary and allow deletion

## Integration Points

The completed profile feeds into:
- **Resume section:** Pre-fills career context, tailors critique rubric to career stage
- **Interview prep:** Selects question difficulty and topics based on skills assessment
- **Outreach:** Personalizes templates based on target companies and networking style
- **Negotiate:** Benchmarks salary expectations based on level, location, and industry
