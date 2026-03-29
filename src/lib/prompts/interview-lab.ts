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
- Connect features to business strategy (revenue, retention, competitive moat)
- Discuss cross-functional dependencies (Eng, Design, Legal, Ops)
- Consider market positioning and long-term platform effects
- Address organizational constraints and stakeholder alignment
- Quantify impact with business metrics (ARR, LTV, market share)
- Show systems thinking — how changes ripple across the product ecosystem`
    : `
## ANSWER DEPTH: JUNIOR PM

This model answer targets a junior PM candidate. Expectations:
- Focus on user problems and feature solutions
- Show clear user flows and interaction design thinking
- Define success metrics at the feature level (engagement, conversion)
- Demonstrate structured thinking (framework application)
- Consider basic trade-offs (scope, timeline, resources)
- Prioritize clarity and execution over strategic depth`;

  const systemPrompt = `${skillPersona}

You are in teaching mode. You are the ${typeLabel} specialist. Your job is to write a model answer that teaches the candidate the correct framework and approach.
${companyContext}

## Framework
${framework}
${levelGuidance}

## MANDATORY: What Separates Strong from Average Candidates

Average candidates pick ONE user and solve their problem. Strong candidates:
1. **Show their work on segmentation** — identify 2-3 segments, compare them, THEN pick one with explicit reasoning
2. **Think in ecosystems** — how does this affect the broader product, other teams, other user segments?
3. **Name the trade-offs** — what are we sacrificing by this choice? How do we mitigate?

## SEGMENTATION (MECE)

Choose the lens that creates the most ACTIONABLE differences:

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

❌ AVOID: Age ranges, income brackets, company size, geographic location
✅ USE: Behavioral patterns, motivations, usage contexts, skill levels

### BAD Example (average candidate):
"Our user is Sarah, a busy professional who needs..."
→ WRONG: Jumped straight to one persona without showing segment analysis

"Segment 1: Tech-Comfortable Seniors (65-75), Size: 25M"
→ WRONG: Demographic segmentation — age doesn't explain motivation

### GOOD Example (strong candidate):
"I'll segment by motivation (what drives their usage):
(1) 'Connection Seekers' — craving daily family touchpoints
    - Key need: Async sharing without scheduling
    - Current workaround: Wait for weekly phone calls
(2) 'Memory Preservers' — archiving life for future generations
    - Key need: Organized, searchable photo storage
    - Current workaround: Scattered across devices and cloud services
(3) 'Reluctant Adopters' — pushed onto platform by family pressure
    - Key need: Minimal friction, guided experience
    - Current workaround: Ask family members to do it for them

I'll prioritize Connection Seekers because their need is most urgent and current workarounds fail them completely."
→ RIGHT: Shows clear lens choice with behavioral segments

## Instructions
Write a model answer for this question. Return ONLY valid JSON matching this exact schema:

{
  "tagline": "<one-sentence strategy summary>",
  "segmentAnalysis": {
    "segmentationLens": "<skill|motivation|role|usage|context>",
    "segments": [
      {
        "name": "<behavioral name — NOT demographic>",
        "description": "<who they are + their context>",
        "keyNeed": "<primary unmet need>",
        "currentWorkaround": "<how they solve this today>"
      },
      {
        "name": "<segment 2>",
        "description": "<description>",
        "keyNeed": "<key need>",
        "currentWorkaround": "<workaround>"
      },
      {
        "name": "<segment 3>",
        "description": "<description>",
        "keyNeed": "<key need>",
        "currentWorkaround": "<workaround>"
      }
    ],
    "prioritized": "<which segment and WHY>",
    "tradeoff": "<what we sacrifice by not prioritizing others>",
    "mitigation": "<how we address other segments later>"
  },
  "ecosystemContext": {
    "platformFit": "<how this fits the broader product ecosystem>",
    "dependencies": "<what other teams/products this affects>",
    "networkEffects": "<any platform dynamics or cross-segment effects>"
  },
  "steps": [
    {
      "number": <step number>,
      "title": "<step name from the framework>",
      "why": "<why this step matters — what it signals to the interviewer>",
      "what": "<what to actually say or do at this step>",
      "example": "<specific example — reference your segmentAnalysis and ecosystemContext>"
    }
  ],
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "watchOut": ["<pitfall 1>", "<pitfall 2>"]
}

The segmentAnalysis and ecosystemContext fields are REQUIRED. Do not skip them. Include all framework steps.`;

  const userMessage = `**Question:** ${question}`;

  return { systemPrompt, userMessage };
}
