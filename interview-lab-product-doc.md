# Interview Lab — Product Documentation
### AI-Powered PM Interview Practice System
**Version 1.0 · March 2026**

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Architecture Philosophy](#2-architecture-philosophy)
3. [Specialist Agent System](#3-specialist-agent-system)
4. [Application Modes](#4-application-modes)
   - [Interview Mode](#41-interview-mode)
   - [Practice Mode](#42-practice-mode)
5. [Screen-by-Screen Breakdown](#5-screen-by-screen-breakdown)
6. [Question Sources](#6-question-sources)
7. [Results System](#7-results-system)
8. [Rubric System](#8-rubric-system)
9. [Session History & Progress Tracking](#9-session-history--progress-tracking)
10. [Voice Input](#10-voice-input)
11. [Data Model](#11-data-model)
12. [API Architecture](#12-api-architecture)
13. [Expansion Considerations](#13-expansion-considerations)
14. [File & Resource Structure](#14-file--resource-structure)

---

## 1. Product Overview

**Interview Lab** is an AI-powered PM interview coaching application. It simulates realistic Staff and Senior PM interviews at top tech companies (Anthropic, Netflix, Meta, Google, OpenAI, Roblox) using a system of **specialist AI agents** — one per question category — each deeply trained on frameworks, rubrics, example questions, and company-specific context.

### Core Value Proposition

Most PM interview tools give generic feedback. Interview Lab gives **expert-level feedback from a specialist who lives and breathes their category** — and then immediately shows a model answer that teaches you not just *what* to say, but *why* each step matters to the interviewer.

### Target User

Staff PM / Senior PM candidates with 8–15 years of experience preparing for FAANG-level interviews. Users are experienced enough to know *what* good looks like — they need coaching on consistency, structure, and depth under pressure.

### Design Principles

| Principle | How It Manifests |
|-----------|-----------------|
| **Teach, don't test** | Every session ends with a model answer showing the *why* behind every step |
| **Expert breadth, specialist depth** | One agent per category — not a generalist pretending to know everything |
| **Real questions only** | Question banks sourced from thousands of real interview reports |
| **Parallel intelligence** | Feedback and model answer generate simultaneously — no waiting |
| **Progress over perfection** | Session history tracks scores over time so improvement is visible |

---

## 2. Architecture Philosophy

### Specialist Agent Model

The system does **not** use a single general-purpose AI assistant. Instead, it routes each request to a **dedicated specialist agent** whose system prompt is scoped entirely to one question category.

Each specialist agent is initialized with:

- The complete **framework** for their question type (e.g., 7-step Product Design framework, GAME framework for Analytical)
- The full **rubric** for that category with scoring descriptions across all 5 levels (Very Weak → Very Strong)
- A curated **question bank** sourced from real interviews
- **Company-specific context** for how that question type manifests differently at each company
- Explicit knowledge of **what strong answers do** and **what weak answers do**

This means when you ask the Analytical agent to grade an answer, it isn't guessing what good looks like — it knows the Analytical rubric cold and applies it the same way a real Anthropic or Meta interviewer would.

### Why This Approach

| Single General Agent | Specialist Agent System |
|---------------------|------------------------|
| Gives generic feedback | Applies category-specific rubric |
| Asks generic clarifying questions | Asks questions that specialists actually ask |
| Model answers lack framework depth | Model answers teach the correct framework for that type |
| One system prompt getting very long | Each agent is lean, focused, and expert |

---

## 3. Specialist Agent System

There are **7 specialist agents**, one per question category. Each is instantiated at runtime by passing the agent's system prompt as the `system` parameter to the Claude API.

### Agent Roster

| Agent | Icon | Question Type | Core Framework |
|-------|------|---------------|----------------|
| Product Design Agent | 🎨 | Design, improve, or envision a product | 7-Step Framework |
| Product Strategy Agent | ♟️ | Market entry, threats, growth, pricing, GTM | 7-Step Strategy Framework + AARRR |
| Execution Agent | ⚡ | Root cause analysis, decision-making, tradeoffs | RCA (6-step) + Decision (6-step) |
| Analytical Agent | 📊 | Metrics, goal-setting, A/B testing | GAME Framework |
| Estimation Agent | 🔢 | Market sizing, back-of-envelope math | 5-Step Estimation Framework |
| Technical Agent | ⚙️ | System design, technical concepts, AI/ML | System design + AI/ML concept library |
| Behavioral Agent | 💬 | Leadership, conflict, failure, culture fit | STAR Framework + Story Bank |

### What Each Agent Knows

Every agent's system prompt contains, in full:

1. **What this question type tests** — the underlying skills being evaluated
2. **The complete framework** — every step, with guidance on what to say at each step
3. **The complete rubric** — all scoring signals with descriptions for each level (Very Weak through Very Strong)
4. **What strong answers do** — specific, actionable behaviors
5. **What weak answers do** — specific anti-patterns to avoid
6. **Company-specific context** — how the question type differs at each of the 6 target companies
7. **Sub-type knowledge** — e.g., the Strategy agent knows Market Entry questions differently than Pricing questions

### Agent Capabilities

Each agent can perform three distinct tasks:

| Task | Trigger | Output |
|------|---------|--------|
| **Generate a question** | User starts a session | A realistic, company-specific question |
| **Grade an answer** | User submits their answer | Rubric scores + feedback JSON |
| **Write a model answer** | Triggered in parallel with grading | Step-by-step model answer JSON |

---

## 4. Application Modes

### 4.1 Interview Mode

**"Claude leads. You respond."**

Interview Mode simulates the closest thing to a real interview loop. The app proactively drives the session from start to finish. The user configures the session upfront, then responds to questions one at a time.

#### Configuration Options

| Setting | Options | Notes |
|---------|---------|-------|
| **Target Company** | Anthropic, Netflix, Meta, Google, OpenAI, Roblox, Any | "Any" randomizes company per question |
| **Question Source** | AI-Generated, From Real Bank, I'll Pick | See Section 6 |
| **Categories** | Any combination of all 7 types | Multi-select checkboxes |
| **Question Count** | 1, 3, 5, 10, ∞ Infinite | Infinite = session continues until user stops |

#### Session Flow

```
Setup → Q1 (generate) → Answer → Analyze (parallel) → Results → Q2 → ... → Session End
```

1. **Session begins** — app generates first question from the first selected category
2. **User answers** — types in the answer field
3. **User submits** — clicks "Submit for Feedback"
4. **Parallel analysis** — Feedback agent and Model Answer agent run simultaneously
5. **Results appear** — three tabs: Feedback, Model Answer, My Answer
6. **Continue or stop** — "Next Question" or "End Session"

#### Category Rotation

When multiple categories are selected, questions rotate through them in order. For example, if the user selects [Design, Analytical, Behavioral] with 6 questions:

```
Q1: Product Design
Q2: Analytical
Q3: Behavioral
Q4: Product Design
Q5: Analytical
Q6: Behavioral
```

#### Infinite Mode

When count is set to ∞, the session continues indefinitely. Each "Next Question" generates a fresh question from the next category in rotation. The user ends the session manually via "End Session."

---

### 4.2 Practice Mode

**"You pick. One focused question."**

Practice Mode is for targeted, intentional practice on a specific area. The user selects one company and one question type, then either gets an AI-generated question or picks one from the real question bank.

#### Configuration Options

| Setting | Options |
|---------|---------|
| **Company** | Any of the 7 options (including "Any") |
| **Question Type** | One of the 7 categories |
| **Question Source** | AI-Generated or Pick from Bank |

Practice Mode always does one question at a time. After results, the user returns to home or starts a new session.

---

## 5. Screen-by-Screen Breakdown

### Screen 1: Home

**Purpose:** Entry point. Mode selection. Session history.

**Elements:**
- Logo mark and product name
- Two mode cards: Interview Mode (🎙️) and Practice Mode (🎯)
- Recent sessions grid (last 6 sessions, shows company + type + score badge)
- Specialist Agents grid (7 agents displayed with icons)

**Design Notes:**
- Dark background (deep navy/slate)
- Mode cards use distinct accent colors (indigo for Interview, green for Practice)
- History cards are compact — company, type, truncated question, score badge
- Score badge color-codes by rating: green (Strong/Very Strong), yellow (Neutral), red (Weak/Very Weak)

---

### Screen 2a: Interview Mode Setup

**Purpose:** Configure the full interview session.

**Elements:**
- Company selector (pill buttons)
- Question source selector (3 card options)
- Question picker panel (appears when "I'll Pick" is selected)
- Category multi-select (7 toggle cards with icons)
- Question count selector (1, 3, 5, 10, ∞)
- "Start Interview →" CTA (disabled until valid config)

**Validation:**
- At least one category must be selected
- If "I'll Pick" mode: at least one question must be selected
- Company must be selected (defaults to "Any" — always valid)

---

### Screen 2b: Practice Mode Setup

**Purpose:** Configure a single focused practice question.

**Elements:**
- Company selector (pill buttons)
- Question type selector (toggle cards)
- Question source selector (appears after type is selected)
- Question picker panel (appears when "Pick from Bank" is selected)
- "Generate Question →" CTA

**Validation:**
- Company and question type both required

---

### Screen 3: Active Question

**Purpose:** Display the current question and collect the user's answer.

**Elements:**
- Company badge + question type badge
- Progress bar (shows X/Total, hidden for infinite)
- Question box (with left accent border in company color)
  - Loading shimmer state while generating
  - Question text once loaded
  - "↻ Different question" button (hidden in "Pick" mode)
- Answer textarea
  - Placeholder: "Type your answer here..."
  - Word count / estimated speaking time
- Submit button (company color accent, disabled until answer has content)

**States:**
- `loading_question` — shimmer animation, no textarea
- `question_ready` — question visible, textarea enabled
- `answering` — user is typing (same UI, textarea active)
- `submitting` — button shows "Analyzing...", inputs disabled

**UX Notes:**
- The "Different question" button lets users regenerate without going back
- Speaking time estimate helps calibrate answer length (target: 2-3 min for most types)

---

### Screen 4: Results

**Purpose:** Show feedback, model answer, and the user's own answer for comparison.

**Elements:**
- Company + type badges
- Score banner (large circle score, scoreLabel, one-line overall verdict)
- 3-tab panel:
  - **📋 Feedback** — rubric, what worked, to improve, hiring signal, one change
  - **✨ Model Answer** — step-by-step model with WHY/WHAT/EXAMPLE
  - **📝 My Answer** — the user's original answer verbatim
- Action buttons: "End Session" + "Next Question →" (or completion state)

**Score Banner Color:**
- 4-5: Green (#10B981)
- 3: Amber (#F59E0B)
- 1-2: Red (#EF4444)

---

## 6. Question Sources

Three distinct question source modes exist throughout the app:

### 6.1 AI-Generated (Default)

The appropriate specialist agent generates a fresh question each time, scoped to the selected company. Questions are novel on every generation — no repetition.

**Agent prompt for question generation:**
```
You are conducting a Staff PM interview at {company}. 
Generate ONE {type} interview question. Make it specific to {company}'s 
products, strategy, and what they care about. Return ONLY the question — 
no preamble, no labels, no quotation marks.
```

**Best for:** Realistic variety, exposure to unexpected questions, long sessions

---

### 6.2 From Real Bank

The app maintains a curated bank of questions sourced from thousands of real interview reports (collected from a crowd-sourced database of PM interview experiences). Questions are filtered to avoid repetition within a session.

**Bank sizes by category:**
| Category | Questions in Bank |
|----------|------------------|
| Product Design | 23 |
| Product Strategy | 17 |
| Execution | 13 |
| Analytical | 17 |
| Estimation | 14 |
| Technical | 13 |
| Behavioral | 15 |

**Deduplication logic:** Within a session, questions already used are filtered from the pool. If the pool is exhausted, it resets.

**Best for:** Practicing with exactly the kinds of questions interviewers are actually asking right now

---

### 6.3 I'll Pick

The user browses the real question bank by category and selects specific questions using checkboxes (Interview Mode) or radio buttons (Practice Mode). Selected questions are used in the order they appear.

**Best for:** Targeted practice on a specific question the user previously struggled with, or known questions from an upcoming interview at a specific company

---

## 7. Results System

Results are generated by **two specialist agents running in parallel**:

```
Submit Answer
     │
     ├──► Grading Agent ──────────► Feedback JSON
     │         (same specialist,
     │          grading mode)
     │
     └──► Model Answer Agent ──────► Model Answer JSON
               (same specialist,
                teaching mode)
```

Both API calls fire simultaneously via `Promise.all()`. The results page only renders once both return.

### 7.1 Feedback Output

```json
{
  "overall": "1-2 sentence direct verdict",
  "score": 4,
  "scoreLabel": "Strong",
  "rubric": [
    {
      "signal": "User-centricity",
      "score": "Strong",
      "note": "Good persona definition but pain points stayed generic"
    }
  ],
  "whatWorked": ["bullet 1", "bullet 2"],
  "toImprove": ["bullet 1", "bullet 2", "bullet 3"],
  "hiringSignal": "Would move forward — structure was solid and showed PM instinct",
  "oneChange": "Make pain points sharper — quote a real user need, not a category"
}
```

### 7.2 Model Answer Output

```json
{
  "tagline": "One-sentence strategy summary",
  "steps": [
    {
      "number": 1,
      "title": "Clarify",
      "why": "Why this step matters — what it signals to the interviewer",
      "what": "What to actually say or do at this step",
      "example": "Specific example content tied to this exact question"
    }
  ],
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "watchOut": ["pitfall 1", "pitfall 2"]
}
```

### 7.3 Three-Tab Results View

| Tab | Contents | Purpose |
|-----|----------|---------|
| **📋 Feedback** | Rubric grid, What Worked, To Improve, Hiring Signal, One Change | Diagnostic — where am I weak? |
| **✨ Model Answer** | Tagline, Step-by-step (WHY/WHAT/EXAMPLE), Key Insights, Watch Out | Learning — what does great look like? |
| **📝 My Answer** | User's verbatim answer | Comparison — let me re-read what I actually said |

The WHY/WHAT/EXAMPLE structure in the model answer is intentional:
- **WHY** — tells the user what this step signals to an interviewer (the meta layer)
- **WHAT** — tells them exactly what to do or say
- **EXAMPLE** — shows them a concrete application to this exact question

This teaches *transferable understanding*, not memorization.

---

## 8. Rubric System

All feedback is grounded in a formal rubric system with 5 scoring levels:

```
Very Weak → Weak → Neutral → Strong → Very Strong
```

### Rubrics by Category

Each category has 4-8 scoring signals. Examples:

**Product Design Rubric Signals:**
- Business acumen
- User-centricity
- Product vision
- Clarifying questions
- Tradeoffs & errors
- Passion & creativity
- Communication
- Collaboration

**Analytical Rubric Signals:**
- Data literacy
- Comfort with metrics
- Diagnosis
- Prioritization
- Execution
- Collaboration
- Curiosity

**Scoring descriptions exist for every signal at every level.** For example, User-centricity at each level:

| Level | Description |
|-------|-------------|
| Very Weak | Failed to consider the end user |
| Weak | Struggled to anchor on users |
| Neutral | Attempted user-centric design, missed key points |
| Strong | Discussed pain points and opportunities, prioritized well |
| Very Strong | Analyzed users accurately, prioritized effectively, recalled users throughout |

The rubric images (PNG files) from the original source material are included in the resource bundle for reference.

---

## 9. Session History & Progress Tracking

### Current Implementation (V1)

Session history is stored **in-memory** for the duration of the browser session. It persists across navigation within the app but resets on page refresh.

Each history entry contains:
```typescript
{
  company: string,       // "Meta"
  type: string,          // "Analytical"
  question: string,      // Full question text
  answer: string,        // User's full answer
  score: number,         // 1-5
  scoreLabel: string     // "Strong"
}
```

The home screen displays the **last 6 sessions** in reverse chronological order with company, type, truncated question, and score badge.

### V2 Expansion (Recommended)

| Feature | Implementation |
|---------|---------------|
| Persistent history | Store entries in localStorage or user account |
| Score trends by category | Line chart: score over time per question type |
| Weakness identification | Flag categories with average score < 3 |
| Session replays | Save full question + answer + feedback for later review |
| Streak tracking | Days of consecutive practice |
| Company-specific stats | Average score per company |

---

## 10. Voice Input

### Current State (V1)

Voice input is **not yet implemented** in the current version. The answer field is a standard textarea.

### Recommended V2 Implementation

Voice input would transform the practice experience — it forces candidates to practice the actual verbal delivery they need in real interviews, not just written composition.

#### Implementation Approach

**Web Speech API (browser-native, no cost):**
```javascript
const recognition = new window.SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(result => result[0].transcript)
    .join('');
  setAnswer(transcript);
};
```

**UX Considerations for Voice:**
- Toggle button in answer field: 🎤 Start / ⏹ Stop
- Live transcript appears in the textarea as the user speaks
- Interim results (mid-sentence) shown in lighter color
- Final results in full opacity
- Pause detection: stop recording after 3 seconds of silence
- Edit mode: user can correct transcript after speaking before submitting

**Why Voice Matters:**
- Real interviews are verbal — muscle memory matters
- Spoken answers reveal filler words, pacing issues, and structure breakdowns that typed answers hide
- Training verbal delivery is as important as training content

#### Advanced Voice Features (V3+)

| Feature | Benefit |
|---------|---------|
| Speaking pace analysis | Flag if speaking too fast/slow |
| Filler word detection | Track "um", "uh", "like", "basically" |
| Answer duration timer | Shows real-time speaking duration |
| Playback | Listen to your answer before submitting |
| Transcript correction | Side-by-side spoken vs. corrected |

---

## 11. Data Model

### Session Config Object
```typescript
interface SessionConfig {
  company: string;                   // "Meta" | "Netflix" | "Any" | ...
  types: string[];                   // ["Product Design", "Analytical"]
  count: string;                     // "5" | "∞"
  questionMode: "generated" | "bank" | "pick";
  pickedQuestions: string[];         // Only used in "pick" mode
}
```

### Question Object
```typescript
interface Question {
  text: string;
  type: string;                      // "Product Design"
  company: string;                   // "Meta"
  source: "generated" | "bank" | "picked";
}
```

### Session History Entry
```typescript
interface SessionEntry {
  company: string;
  type: string;
  question: string;
  answer: string;
  score: number;                     // 1-5
  scoreLabel: string;                // "Strong"
  timestamp?: Date;
}
```

### Feedback Object
```typescript
interface Feedback {
  overall: string;
  score: number;
  scoreLabel: string;
  rubric: RubricRow[];
  whatWorked: string[];
  toImprove: string[];
  hiringSignal: string;
  oneChange: string;
}

interface RubricRow {
  signal: string;
  score: "Very Weak" | "Weak" | "Neutral" | "Strong" | "Very Strong";
  note: string;
}
```

### Model Answer Object
```typescript
interface ModelAnswer {
  tagline: string;
  steps: ModelStep[];
  keyInsights: string[];
  watchOut: string[];
}

interface ModelStep {
  number: number;
  title: string;
  why: string;
  what: string;
  example: string;
}
```

---

## 12. API Architecture

### Current Implementation

All Claude API calls are made directly from the client using `fetch` to the Anthropic `/v1/messages` endpoint.

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: AGENT_PROMPTS[questionType],   // Specialist agent system prompt
    messages: [{ role: "user", content: userPrompt }],
  }),
});
```

### Agent Selection

The correct specialist agent is selected by indexing into the `AGENT_PROMPTS` object using the question type string:

```javascript
const systemPrompt = AGENT_PROMPTS[currentType];
// e.g., AGENT_PROMPTS["Analytical"] → the full Analytical agent system prompt
```

### Parallel Execution

Feedback and model answer are generated in parallel using `Promise.all`:

```javascript
const [feedbackRaw, modelAnswerRaw] = await Promise.all([
  callClaude(agentPrompt, gradingPrompt, 1200),
  callClaude(agentPrompt, modelAnswerPrompt, 2000),
]);
```

### Token Budget by Call Type

| Call | Max Tokens | Reasoning |
|------|-----------|-----------|
| Question generation | 200 | Short output — just the question |
| Feedback grading | 1,200 | Rubric + multiple fields |
| Model answer | 2,000 | Multi-step answer can be long |

### Embedded API Key Consideration

⚠️ **Current V1 has no API key.** The Claude.ai environment handles auth transparently. In an embedded version on another site, the team will need to:

1. **Proxy all API calls through a backend** — never expose API keys client-side
2. **Rate limit per user** — each question + answer cycle = 2 API calls
3. **Estimate costs** — average session (5 questions) = ~10 API calls, ~8,000-12,000 tokens total
4. **Cache question generation** — if using "From Real Bank" mode, question text is static; only grading + model answer calls are dynamic

---

## 13. Expansion Considerations

This section documents recommended features and architectural improvements for the team building the full embedded version.

### 13.1 Authentication & User Accounts

**Why:** Progress tracking, session history, personalized coaching, and team/cohort features require persistent identity.

**Recommended:** OAuth (Google/LinkedIn) — keeps friction low for PM candidates who likely have both.

**User profile should store:**
- Target companies
- Target role level
- Current weak categories (auto-computed from session history)
- Preferred question source (default setting)

---

### 13.2 Question Bank Expansion

The current question bank contains ~112 questions across 7 categories. The team has access to a database of 3,000+ real interview questions sourced from crowd-reported PM interview experiences.

**Recommended ingestion pipeline:**
1. Parse raw spreadsheet (Company, Question, Type, Interview Round columns)
2. Deduplicate by semantic similarity (not just exact match)
3. Tag each question with: company, type, difficulty, interview round (first/onsite), recency
4. Store in database with full metadata
5. Surface to app via API with filters

**Filtering the app should support:**
- By company
- By type
- By recency (last 6 months, last year, all time)
- By interview round (first round vs. onsite)
- By difficulty (inferred or crowd-tagged)

---

### 13.3 Interviewer Persona Mode

Currently, the agent generates a question and then grades the answer. A richer version would have the agent **conduct a real back-and-forth conversation** — asking follow-up questions, probing weak areas, pushing back on assumptions, and behaving like an actual interviewer.

**Flow:**
```
Agent: "Here's your question..."
User: [answers]
Agent: "Interesting — you mentioned X. Can you say more about how you'd prioritize between Y and Z?"
User: [responds]
Agent: "One more — what's your success metric for this?"
User: [responds]
Agent: [after 2-3 exchanges] "Thanks. Here's my feedback..."
```

**Implementation note:** This requires multi-turn conversation state — the full conversation history must be included in each API call. The agent system prompt should include explicit instructions on when to stop follow-ups and move to feedback.

---

### 13.4 Team / Cohort Features

For use in PM bootcamps, recruiting programs, or team training:

| Feature | Description |
|---------|-------------|
| Cohort leaderboard | Average scores by member across categories |
| Coach dashboard | Instructor can see individual session histories |
| Assigned question sets | Coach assigns specific questions to specific users |
| Group sessions | Multiple users answer the same question; compare model answers |
| Progress reports | Weekly PDF summary of scores, improvement, weak areas |

---

### 13.5 Company-Specific Expansion

The current implementation covers 6 companies. The architecture supports any number of companies — each needs:

1. A `companies/{Company}.md` file with mission, culture, interview process, and confirmed question bank
2. The company added to the `COMPANIES` array and `COMPANY_COLORS` object
3. Company-specific context added to each relevant specialist agent prompt

**High-priority additions based on demand:**
- Amazon (Leadership Principles are a distinct interview format)
- Apple
- LinkedIn / Microsoft
- Stripe
- Airbnb

---

### 13.6 Analytics & Instrumentation

**Events to track:**

| Event | Properties |
|-------|-----------|
| `session_started` | mode, company, types, count |
| `question_generated` | type, company, source |
| `answer_submitted` | type, company, word_count, time_spent_sec |
| `feedback_viewed` | score, scoreLabel |
| `model_answer_viewed` | type, step_count |
| `session_completed` | question_count, avg_score |
| `session_abandoned` | screen, question_number |

**Key metrics:**
- Average score by category (track improvement over time)
- Most practiced categories (by user and aggregate)
- Completion rate (sessions started vs. completed)
- Tab engagement (do users actually read model answers?)
- Voice vs. text split (once voice is implemented)

---

### 13.7 Mobile Optimization

The current layout is responsive but optimized for desktop (760px container). For mobile-first usage:

- Answer textarea height should auto-grow on mobile
- Voice input becomes much more important on mobile (typing long answers on phone is painful)
- Progress bar and badge layout should stack vertically on small screens
- Results tabs should be swipeable (not just clickable)
- Score banner should be more compact

---

## 14. File & Resource Structure

The full resource package accompanying this document contains:

```
pm-interview-resources/
│
├── SKILL.md                          # Top-level skill index and session orchestration rules
│
├── question-types/                   # One file per question category
│   ├── ProductDesign.md              # 7-step framework, pitfalls, tips, question bank, rubric signals
│   ├── ProductStrategy.md            # 7-step strategy framework, sub-types (GTM, Growth, Pricing), question bank
│   ├── ProductExecution.md           # RCA framework (6-step), decision-making framework, question bank
│   ├── ProductAnalytical.md          # GAME framework, A/B testing framework, key concepts, question bank
│   ├── ProductEstimation.md          # 5-step framework, estimation strategies, benchmarks, question bank
│   ├── ProductTechnical.md           # System design, AI/ML concepts, technical PM knowledge map
│   └── Behavioral.md                 # STAR framework, story bank strategy, "why this company" structure
│
├── companies/                        # One file per target company
│   ├── Anthropic.md                  # Mission, culture, what they look for, real confirmed questions
│   ├── Netflix.md                    # Freedom & Responsibility culture, confirmed questions
│   ├── Meta.md                       # Large question bank (~100 questions from real interview reports)
│   ├── Google.md                     # "Googleyness", craft focus, confirmed questions
│   ├── OpenAI.md                     # Research-to-product context, AI-forward questions
│   └── Roblox.md                     # Creator economy, child safety, platform thinking
│
└── rubrics/
    ├── Rubric.md                     # All 6 rubrics in full (markdown tables with all 5 scoring levels)
    ├── PM_Product_Design_Rubric.png  # Original rubric image
    ├── PM_Product_Strategy_Rubric.png
    ├── PM_Analytical_Rubric.png
    ├── PM_Execution_Rubric.png
    ├── PM_Technical_Rubric.png
    └── PM_Estimation_Rubric.png
```

### How the App Uses These Files

At runtime, the app does **not** read these `.md` files directly. Instead, their content has been **compiled into the specialist agent system prompts** that live in the application code. These `.md` files are the canonical source of truth — when content needs to be updated (e.g., adding a new company, updating a framework), update the `.md` file first, then update the corresponding agent prompt in code.

**Update workflow:**
```
Edit companies/Meta.md
    → copy relevant changes into AGENT_PROMPTS["Analytical"] or relevant agent
    → redeploy
```

---

*Document prepared March 2026. Questions? This doc should be treated as a living spec — update it as the product evolves.*
