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

## CRITICAL: Platform Context FIRST, Then Segmentation

The order matters. Strong candidates:
1. **Understand the platform ecosystem** — What does this product do today? What are its strategic priorities? How would this feature fit?
2. **THEN segment users** — Based on the platform context, who are the relevant user segments?
3. **Name the trade-offs** — what are we sacrificing by this choice? How do we mitigate?

## PLATFORM CONTEXT (Step 2 in Framework)

Before segmenting users, establish:
- What the platform/product does today and its core value proposition
- The company's strategic priorities (growth, retention, monetization, new markets)
- How this feature would fit into the existing product ecosystem
- Key dependencies (other teams, products, infrastructure)

## SEGMENTATION (MECE) — Based on Platform Context

Choose the lens that creates the most ACTIONABLE differences FOR THIS PLATFORM:

| Lens | When to Use | Example Segments |
|------|-------------|------------------|
| **Skill/Experience** | Learning products, tools | Beginners, Power Users, Experts |
| **Motivation** | Social/entertainment products | Learners, Socializers, Achievers |
| **Role** | Multi-stakeholder products | Parents, Children, Teachers |
| **Usage Pattern** | Collaboration/consumption | Individual vs Group, Creator vs Consumer |
| **Context** | Time-sensitive products | Commuters, At-home, On-the-go |

Pick ONE lens. Segments should be:
- **Mutually Exclusive** (no overlap)
- **Collectively Exhaustive** (covers the market)
- **Behaviorally distinct** (different needs → different solutions)

❌ AVOID: Age ranges, income brackets, company size, geographic location, specific market sizes or percentages
✅ USE: Behavioral patterns, motivations, usage contexts, skill levels

## METRICS: Framework Over Fabrication

Do NOT invent specific numbers (no "40% of users" or "$50M ARR"). Instead:
- Name the TYPE of metric: "engagement rate," "conversion to paid," "retention at day 30"
- Explain WHY that metric matters for this feature
- Describe directional impact: "we expect to see higher retention" not "25% improvement"

### BAD (fabricated numbers):
"Success: 40% of users engage weekly, 25% convert monthly, $50M ARR in year 1"
→ WRONG: Interviewees don't have access to these numbers

### GOOD (metric framework):
"Success metrics: (1) Discovery engagement — are users exploring recommendations? (2) Conversion — do they visit recommended places? (3) Retention — do they return to the feature? We'd track these against baseline behavior to measure lift."
→ RIGHT: Shows metric thinking without fabricating data

## Instructions
Write a model answer for this question. Return ONLY valid JSON matching this exact schema:

{
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
  "steps": [
    {
      "number": <step number>,
      "title": "<step name from the framework>",
      "why": "<why this step matters — what it signals to the interviewer>",
      "what": "<what to actually say or do at this step>",
      "example": "<specific example for this question — NO fabricated numbers>"
    }
  ],
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "watchOut": ["<pitfall 1>", "<pitfall 2>"]
}

Include 2-3 segments. The platformContext field is REQUIRED and comes BEFORE segmentAnalysis. Include all 7 framework steps.`;

  const userMessage = `**Question:** ${question}`;

  return { systemPrompt, userMessage };
}
