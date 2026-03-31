import type { UserProfile } from "@/lib/utils/profile";
import type { InterviewCompany, InterviewQuestionType } from "./interview";
import {
  skillPersona,
  companyGuides,
  questionTypeGuides,
  extractRubricSection,
  formatProfileContext,
  QUESTION_TYPE_LABELS,
} from "./interview";

// ---------------------------------------------------------------------------
// Question generation prompt
// ---------------------------------------------------------------------------

export function buildQuestionGenerationPrompt(
  company: InterviewCompany | "any",
  questionType: InterviewQuestionType
): string {
  const typeLabel = QUESTION_TYPE_LABELS[questionType];

  const companyContext =
    company !== "any"
      ? `\n\nTarget company: ${company.charAt(0).toUpperCase() + company.slice(1)}\n\n${companyGuides[company]}`
      : "\n\nNo specific company — generate a general PM interview question.";

  return `You are an expert PM interview coach specializing in ${typeLabel} questions.
${companyContext}

Generate ONE ${typeLabel} interview question for a PM candidate. Make it specific, realistic, and the kind of question that would actually be asked in a real interview.

Return ONLY the question text. No preamble, no labels, no quotation marks, no numbering.`;
}

// ---------------------------------------------------------------------------
// Grading prompt
// ---------------------------------------------------------------------------

export function buildGradingPrompt(
  company: InterviewCompany | "any",
  questionType: InterviewQuestionType,
  question: string,
  answer: string,
  profile?: Partial<UserProfile>
): { systemPrompt: string; userMessage: string } {
  const typeLabel = QUESTION_TYPE_LABELS[questionType];
  const rubricSection = extractRubricSection(questionType);
  const framework = questionTypeGuides[questionType];

  const companyContext =
    company !== "any"
      ? `\n\nCompany: ${company.charAt(0).toUpperCase() + company.slice(1)}\n${companyGuides[company]}`
      : "";

  const profileSection = profile
    ? `\n\nCandidate Profile:\n${formatProfileContext(profile)}`
    : "";

  const systemPrompt = `${skillPersona}

You are grading a PM interview answer. You are the ${typeLabel} specialist.
${companyContext}

## Framework
${framework}

## Scoring Rubric
${rubricSection}
${profileSection}

## Instructions
Grade the candidate's answer using the rubric. Return ONLY valid JSON matching this exact schema — no markdown fences, no commentary, no extra text:

{
  "overall": "1-2 sentence direct verdict",
  "score": <number 1-5>,
  "scoreLabel": "<Very Weak|Weak|Neutral|Strong|Very Strong>",
  "rubric": [
    {"signal": "<rubric signal name>", "score": "<Very Weak|Weak|Neutral|Strong|Very Strong>", "note": "<1-line explanation>"}
  ],
  "whatWorked": ["<bullet>"],
  "toImprove": ["<bullet>"],
  "hiringSignal": "<honest hiring signal — would you move this candidate forward?>",
  "oneChange": "<single most impactful thing to do differently>"
}

Score mapping: 1=Very Weak, 2=Weak, 3=Neutral, 4=Strong, 5=Very Strong.
Include ALL rubric signals for this question type.`;

  const userMessage = `**Question:** ${question}

**Candidate's Answer:** ${answer}`;

  return { systemPrompt, userMessage };
}

// ---------------------------------------------------------------------------
// Model answer prompt
// ---------------------------------------------------------------------------

export function buildModelAnswerPrompt(
  company: InterviewCompany | "any",
  questionType: InterviewQuestionType,
  question: string,
  profile?: Partial<UserProfile>
): { systemPrompt: string; userMessage: string } {
  const typeLabel = QUESTION_TYPE_LABELS[questionType];
  const framework = questionTypeGuides[questionType];

  const companyContext =
    company !== "any"
      ? `\n\nCompany: ${company.charAt(0).toUpperCase() + company.slice(1)}\n${companyGuides[company]}`
      : "";

  // Determine PM level from profile
  const yearsExp = profile?.yearsExperience ?? 3;
  const pmLevel = yearsExp >= 6 ? "senior" : "junior";

  const levelGuidance = pmLevel === "senior"
    ? `
## ANSWER DEPTH: SENIOR PM

This model answer targets a senior PM candidate. Expectations:
- Connect features to business strategy (how does this drive revenue, retention, or competitive moat?)
- Discuss cross-functional dependencies (Eng, Design, Legal, Ops, Data)
- Consider market positioning and long-term platform effects
- Address organizational constraints and stakeholder alignment
- Frame metrics at the business level (retention, revenue impact, market share) — describe the TYPE of metric, not specific numbers
- Show systems thinking — how changes ripple across the product ecosystem`
    : `
## ANSWER DEPTH: JUNIOR PM

This model answer targets a junior PM candidate. Expectations:
- Focus on user problems and feature solutions
- Show clear user flows and interaction design thinking
- Frame success metrics at the feature level (engagement rate, conversion, task completion)
- Demonstrate structured thinking (framework application)
- Consider basic trade-offs (scope, timeline, resources)
- Prioritize clarity and execution over strategic depth`;

  const systemPrompt = `${skillPersona}

You are in teaching mode. You are the ${typeLabel} specialist. Your job is to write a model answer that teaches the candidate the correct framework and approach.
${companyContext}

## Framework
${framework}
${levelGuidance}

## CRITICAL: Structure for Product Design Answers

Strong candidates demonstrate DEPTH at each step, not just coverage. The answer should feel like a thoughtful conversation, not a checklist.

### Opening: Set the Stage (Before diving in)
Start by reflecting on WHY this question matters:
- What's interesting or challenging about this space?
- Why would this company care about solving this?
- What's your initial hypothesis or angle?

This shows strategic thinking before jumping into the framework.

### 1. PLATFORM CONTEXT (Understand the Ecosystem FIRST)
Before anything else, establish:
- What the platform/product does today and its core value proposition
- The company's strategic priorities (growth, retention, monetization, new markets)
- How this feature would fit into the existing product ecosystem
- Key dependencies (other teams, products, infrastructure)

### 2. SEGMENTATION (MECE) — Based on Platform Context

Choose the lens that creates the most ACTIONABLE differences:
| Lens | When to Use | Example Segments |
|------|-------------|------------------|
| **Skill/Experience** | Learning products, tools | Beginners, Power Users, Experts |
| **Motivation** | Social/entertainment products | Learners, Socializers, Achievers |
| **Role** | Multi-stakeholder products | Parents, Children, Teachers |
| **Usage Pattern** | Collaboration/consumption | Individual vs Group, Creator vs Consumer |
| **Context** | Time-sensitive products | Commuters, At-home, On-the-go |

❌ AVOID: Age, income, company size, geography, specific market sizes
✅ USE: Behavioral patterns, motivations, usage contexts, skill levels

### 3. COMPREHENSIVE PROBLEM/NEEDS ANALYSIS

For your prioritized segment, analyze problems across THREE dimensions:
1. **Psychological** — Fears, frustrations, aspirations, anxieties, emotional needs
2. **Functional** — Tasks they're trying to accomplish, efficiency gaps, utility needs
3. **Behavioral** — Current habits, friction points, workarounds, patterns

For each dimension, identify the PAIN POINTS — what hurts most?

Then PRIORITIZE: Which problem is most critical?
- **HOW you prioritized** — What criteria did you use? (impact vs frequency vs severity)
- **WHY this problem** — Why does this matter most for this user and this platform?

### 4. SOLUTION BRAINSTORMING

Generate 3-4 distinct solution approaches. Show breadth before depth:
- Different technical approaches
- Different UX paradigms
- Build vs buy vs partner options
- Incremental vs transformative options

### 5. SOLUTION PRIORITIZATION WITH RISK ANALYSIS

Pick your top solution. Explain:
- **HOW you prioritized** — What criteria? (impact, feasibility, alignment, differentiation)
- **WHY this solution wins** — What makes it better than alternatives?
- **RISKS** — What could go wrong? Technical, adoption, competitive, organizational
- **MITIGATIONS** — How would you address each risk?

### 6. MVP DESIGN

Define the Minimum Viable Product:
- Core features (what's IN)
- Explicit exclusions (what's OUT and why)
- Success criteria for MVP
- What you'd learn before expanding

### 7. METRICS: Framework Over Fabrication

Do NOT invent specific numbers. Instead:
- Name the TYPE of metric: "engagement rate," "conversion to paid"
- Explain WHY that metric matters
- Describe directional impact, not specific targets

## Instructions
Write a model answer for this question. Return ONLY valid JSON matching this exact schema:

{
  "openingReflection": {
    "spaceContext": "<what's interesting/challenging about this space — 2-3 sentences>",
    "whyItMatters": "<why this company should care about solving this>",
    "initialAngle": "<your hypothesis or unique perspective on the problem>"
  },
  "tagline": "<one-sentence strategy summary>",
  "platformContext": {
    "whatItDoesToday": "<current product/platform value proposition>",
    "strategicPriorities": "<company's key goals this feature could serve>",
    "featureFit": "<how this feature fits into the existing ecosystem>",
    "dependencies": "<teams, products, or infrastructure this touches>"
  },
  "segmentAnalysis": {
    "segmentationLens": "<skill|motivation|role|usage|context>",
    "whyThisLens": "<why this lens is most actionable for THIS platform>",
    "segments": [
      {
        "name": "<behavioral name — NOT demographic>",
        "description": "<who they are + their context>",
        "keyNeed": "<primary unmet need>",
        "currentWorkaround": "<how they solve this today>"
      }
    ],
    "prioritized": "<which segment and WHY — tie back to platform priorities>",
    "tradeoff": "<what we sacrifice by not prioritizing others>",
    "mitigation": "<how we address other segments later>"
  },
  "problemAnalysis": {
    "psychologicalProblems": ["<fear/frustration/anxiety/aspiration — with pain points>"],
    "functionalProblems": ["<task/efficiency/utility problem — with pain points>"],
    "behavioralProblems": ["<habit/friction/pattern problem — with pain points>"],
    "prioritizedProblem": "<the ONE problem to focus on>",
    "howPrioritized": "<HOW you chose this — what criteria? impact vs frequency vs severity>",
    "whyThisProblem": "<WHY this problem matters most for this user and platform>"
  },
  "solutionBrainstorm": [
    {
      "name": "<solution name>",
      "description": "<what it does — 1-2 sentences>",
      "prosAndCons": "<quick pros/cons>"
    }
  ],
  "solutionPrioritization": {
    "chosenSolution": "<name of chosen solution>",
    "howPrioritized": "<criteria used: impact, feasibility, alignment, differentiation>",
    "whyThisWins": "<what makes it better than alternatives>",
    "risks": [
      {
        "risk": "<what could go wrong>",
        "type": "<technical|adoption|competitive|organizational>",
        "mitigation": "<how to address it>"
      }
    ]
  },
  "mvpDesign": {
    "coreFeatures": ["<must-have feature 1>", "<feature 2>", "<feature 3>"],
    "explicitExclusions": ["<what's OUT and why>"],
    "successCriteria": "<how we know MVP succeeded — metrics framework, not specific numbers>",
    "learningGoals": "<what we want to learn before expanding>"
  },
  "steps": [
    {
      "number": 1,
      "title": "<step name from the framework>",
      "why": "<why this step matters — what it signals to the interviewer>",
      "what": "<what to actually say or do at this step>",
      "example": "<specific example for this question — NO fabricated numbers>"
    }
  ],
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "watchOut": ["<pitfall 1>", "<pitfall 2>"]
}

Include 2-3 segments, 3-4 brainstormed solutions, and 2-3 risks. Include all 7 framework steps.`;

  const userMessage = `**Question:** ${question}`;

  return { systemPrompt, userMessage };
}
