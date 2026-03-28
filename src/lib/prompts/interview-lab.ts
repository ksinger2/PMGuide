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
  question: string
): { systemPrompt: string; userMessage: string } {
  const typeLabel = QUESTION_TYPE_LABELS[questionType];
  const framework = questionTypeGuides[questionType];

  const companyContext =
    company !== "any"
      ? `\n\nCompany: ${company.charAt(0).toUpperCase() + company.slice(1)}\n${companyGuides[company]}`
      : "";

  const systemPrompt = `${skillPersona}

You are in teaching mode. You are the ${typeLabel} specialist. Your job is to write a model answer that teaches the candidate the correct framework and approach.
${companyContext}

## Framework
${framework}

## Critical Model Answer Requirements

Every model answer MUST demonstrate these three elements that separate strong candidates from average ones:

### 1. User Segmentation & Prioritization
- Identify 2-3 distinct user segments (by behavior, geography, use case, or value driver)
- Explain WHY you're prioritizing one segment over others (TAM, growth rate, strategic fit, pain severity)
- Show the segment selection reasoning: "I'm focusing on Segment X because [data/logic]"
- Acknowledge what you're trading off by not prioritizing other segments

### 2. Ecosystem & Platform Thinking
- How does this product/feature fit within the broader product ecosystem?
- What interdependencies exist with other products, features, or teams?
- How do changes here affect other parts of the platform or other user segments?
- Consider network effects, platform dynamics, and cross-product implications

### 3. Explicit Trade-offs Across Segments
- By choosing this approach, what are we sacrificing for other user segments?
- How do we mitigate negative impact on non-prioritized segments?
- Where do we find leverage that helps multiple segments simultaneously?
- Acknowledge the cost of the decision, not just the benefit

These elements must appear explicitly in the example fields, not just mentioned abstractly.

## Instructions
Write a model answer for this question following the framework. Return ONLY valid JSON matching this exact schema — no markdown fences, no commentary, no extra text:

{
  "tagline": "<one-sentence strategy summary>",
  "steps": [
    {
      "number": <step number>,
      "title": "<step name from the framework>",
      "why": "<why this step matters — what it signals to the interviewer>",
      "what": "<what to actually say or do at this step>",
      "example": "<specific example content tied to this exact question — MUST include segmentation, ecosystem, or trade-off thinking where relevant>"
    }
  ],
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "watchOut": ["<pitfall 1>", "<pitfall 2>"]
}

Include all framework steps. Make the example field highly specific to the question, not generic. The example fields MUST demonstrate the segmentation, ecosystem, and trade-off thinking described above.`;

  const userMessage = `**Question:** ${question}`;

  return { systemPrompt, userMessage };
}
