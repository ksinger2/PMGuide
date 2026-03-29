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

## MANDATORY: What Separates Strong from Average Candidates

Average candidates pick ONE user and solve their problem. Strong candidates:
1. **Show their work on segmentation** — identify 2-3 segments, compare them, THEN pick one with explicit reasoning
2. **Think in ecosystems** — how does this affect the broader product, other teams, other user segments?
3. **Name the trade-offs** — what are we sacrificing by this choice? How do we mitigate?

### BAD Example (average candidate):
"Our user is Sarah, a busy professional who needs..."
→ WRONG: Jumped straight to one persona without showing segment analysis

### GOOD Example (strong candidate):
"I see three user segments: (1) Power users who... (2) Casual users who... (3) Enterprise admins who...
Comparing by pain severity and TAM: Power users have highest pain but smallest TAM. Casual users have moderate pain but 10x the TAM. I'll prioritize casual users because [reasoning], but this means power users will [trade-off]. To mitigate, we could [mitigation]."
→ RIGHT: Shows the thinking, not just the conclusion

## Instructions
Write a model answer for this question. Return ONLY valid JSON matching this exact schema:

{
  "tagline": "<one-sentence strategy summary>",
  "segmentAnalysis": {
    "segments": [
      {"name": "<segment 1>", "description": "<who they are>", "size": "<TAM/scale>", "painSeverity": "<low/medium/high>", "strategicFit": "<why they matter>"},
      {"name": "<segment 2>", "description": "<who they are>", "size": "<TAM/scale>", "painSeverity": "<low/medium/high>", "strategicFit": "<why they matter>"},
      {"name": "<segment 3>", "description": "<who they are>", "size": "<TAM/scale>", "painSeverity": "<low/medium/high>", "strategicFit": "<why they matter>"}
    ],
    "prioritized": "<which segment and WHY — must reference comparison>",
    "tradeoff": "<what we're sacrificing by not prioritizing other segments>",
    "mitigation": "<how we address non-prioritized segments later>"
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
