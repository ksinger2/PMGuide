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

/**
 * Build the 13-step Product Design model answer prompt
 */
function buildProductDesignModelAnswerPrompt(
  company: InterviewCompany | "any",
  question: string,
  profile?: Partial<UserProfile>
): { systemPrompt: string; userMessage: string } {
  const companyContext =
    company !== "any"
      ? `\n\nCompany: ${company.charAt(0).toUpperCase() + company.slice(1)}\n${companyGuides[company]}`
      : "";

  const yearsExp = profile?.yearsExperience ?? 3;
  const pmLevel = yearsExp >= 6 ? "senior" : "junior";

  const levelGuidance = pmLevel === "senior"
    ? `
## ANSWER DEPTH: SENIOR PM

This model answer targets a senior PM candidate. Expectations:
- Connect features to business strategy (revenue, retention, competitive moat)
- Discuss cross-functional dependencies (Eng, Design, Legal, Ops, Data)
- Consider market positioning and long-term platform effects
- Address organizational constraints and stakeholder alignment
- Frame metrics at the business level — describe the TYPE of metric, not specific numbers
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

You are in teaching mode. You are the Product Design specialist. Your job is to write a model answer using the 13-step formula.
${companyContext}
${levelGuidance}

## THE 13-STEP PRODUCT DESIGN FORMULA

This is NOT a checklist — it's a structured conversation. Each step should flow naturally into the next, with EXPLICIT PRIORITIZATION MATRICES at decision points.

### Step 1: LANDSCAPE — Why does this question matter?
Set the stage before diving in:
- Industry context: What's happening in this space?
- Company benefit: Why should this company care?
- Transformative potential: What could change if done well?

### Step 2: MISSION — Guiding statement
A single sentence that anchors the rest of your answer. This is your north star.

### Step 3: ECOSYSTEM — ALL stakeholders
Map the full ecosystem (not just end users):
- Users, creators, providers, advertisers, partners, company itself
- For each: name, role, incentives, current pain
- How do stakeholders interact and depend on each other?

### Step 4: PRIORITIZE STAKEHOLDER GROUP — WITH SCORING MATRIX
**CRITICAL: You must evaluate ALL stakeholders with explicit 1-5 scores.**

For EACH stakeholder, score on:
- **TAM (1-5)**: Market size/value potential + rationale
- **Underserved (1-5)**: Gap in current solutions + rationale
- **Mission (1-5)**: Alignment with company mission + rationale
- **Total**: Sum of scores

Then pick the winner and explain the tradeoff.

### Step 5: SEGMENT THE GROUP
Divide the chosen stakeholder group into 3 user segments:
- Use behavioral lenses (skill, motivation, role, usage, context)
- For each: name, description, key characteristic, current behavior
- ❌ AVOID demographics (age, income, geography)

### Step 6: PRIORITIZE SEGMENT — WITH SCORING MATRIX
**CRITICAL: You must evaluate ALL segments with explicit 1-5 scores.**

For EACH segment, score on:
- **TAM (1-5)**: Segment size/value + rationale
- **Underserved (1-5)**: Gap in current solutions + rationale
- **Mission (1-5)**: Alignment with mission + rationale
- **Total**: Sum of scores

Then pick the winner and explain the tradeoff.

### Step 7: PAIN POINTS — 3 dimensions with vivid empathy
This is the heart of the answer. Make the pain VIVID:

**Psychological** — Fears, frustrations, anxieties, aspirations
- What emotion? (fear, frustration, anxiety, aspiration)
- How intense? (low/medium/high)

**Behavioral** — Habits, friction, patterns
- Current workaround?
- Frequency? (rare/occasional/frequent/constant)

**Functional** — Tasks, efficiency, utility
- Impact? (time, money, effort)
- Job-to-be-done framing

### Step 8: PRIORITIZE PAIN POINT — WITH SCORING MATRIX
**CRITICAL: You must evaluate ALL pain points (from all 3 dimensions) with explicit 1-5 scores.**

For EACH pain point, score on:
- **Severity (1-5)**: How bad is it + rationale
- **Frequency (1-5)**: How often it happens + rationale
- **Mission (1-5)**: Alignment with mission + rationale
- **Total**: Sum of scores

Then pick the winner with synthesis.

### Step 9: SOLUTION IDEAS — 3-4 novel/clever approaches
Show breadth before depth:
- Different technical approaches
- Different UX paradigms
- Build vs buy vs partner
- What's NOVEL or CLEVER about each?

### Step 10: PRIORITIZE SOLUTION — WITH SCORING MATRIX
**CRITICAL: You must evaluate ALL solutions with explicit 1-5 scores.**

For EACH solution, score on:
- **Impact (1-5)**: User/business value + rationale
- **Effort (1-5)**: Feasibility (5=easy, 1=hard) + rationale
- **Differentiation (1-5)**: Competitive advantage + rationale
- **Total**: Sum of scores

Then pick the winner with synthesis.

### Step 11: RISKS & MITIGATIONS — Standalone section
For each risk:
- Type: technical, adoption, competitive, organizational
- Severity: low/medium/high
- Mitigation

### Step 12: MVP + METRICS
- Core features (IN)
- Explicit exclusions (OUT)
- Success metrics:
  - North star metric (one primary metric)
  - Leading indicators (early signals)
  - Guardrails (what we don't want to hurt)
- Learning goals

### Step 13: SUMMARY
- 2-3 sentence recap
- The ONE key insight to remember
- Primary watch-out

## CRITICAL GUIDELINES

1. **PRIORITIZATION MATRICES ARE MANDATORY**: At steps 4, 6, 8, and 10, you MUST provide explicit 1-5 scores for ALL options with rationale for each score. This is non-negotiable.

2. **VIVID PAIN POINTS**: Don't just list problems — make me FEEL them. Use specific scenarios, emotions, frustrations.

3. **NO FAKE NUMBERS**: Never invent TAM figures, percentages, or specific metrics. Describe the TYPE of metric and WHY it matters.

4. **FLOW, NOT CHECKLIST**: Each step should build on the previous. Reference earlier decisions.

## Instructions

Write a model answer for this Product Design question. Return ONLY valid JSON matching this exact schema:

{
  "landscape": {
    "industryContext": "<what's happening in this space — 2-3 sentences>",
    "companyBenefit": "<why this company should care>",
    "transformativePotential": "<what could change if done well>"
  },
  "mission": "<one-sentence guiding mission that anchors the answer>",
  "ecosystem": {
    "stakeholders": [
      {
        "name": "<stakeholder name, e.g., 'Creators', 'Advertisers'>",
        "role": "<what they do in the ecosystem>",
        "incentives": "<what they want>",
        "currentPain": "<what frustrates them>"
      }
    ],
    "ecosystemDynamics": "<how stakeholders interact/depend on each other>"
  },
  "stakeholderPrioritization": {
    "evaluations": [
      {
        "name": "<stakeholder name>",
        "tamScore": "<1-5>",
        "tamRationale": "<why this score>",
        "underservedScore": "<1-5>",
        "underservedRationale": "<why this score>",
        "missionScore": "<1-5>",
        "missionRationale": "<why this score>",
        "totalScore": "<sum of 3 scores>"
      }
    ],
    "chosen": "<which stakeholder group — must match highest totalScore>",
    "whyChosen": "<synthesis of why this stakeholder wins>",
    "tradeoff": "<what we sacrifice by not prioritizing others>"
  },
  "segmentation": [
    {
      "name": "<behavioral name — NOT demographic>",
      "description": "<who they are>",
      "keyCharacteristic": "<what defines this segment>",
      "currentBehavior": "<how they solve this today>"
    }
  ],
  "segmentPrioritization": {
    "evaluations": [
      {
        "name": "<segment name>",
        "tamScore": "<1-5>",
        "tamRationale": "<why this score>",
        "underservedScore": "<1-5>",
        "underservedRationale": "<why this score>",
        "missionScore": "<1-5>",
        "missionRationale": "<why this score>",
        "totalScore": "<sum of 3 scores>"
      }
    ],
    "chosen": "<which segment — must match highest totalScore>",
    "whyChosen": "<synthesis of why this segment wins>",
    "tradeoff": "<what we sacrifice>"
  },
  "painPoints": {
    "psychological": [
      {
        "pain": "<the pain point — vivid and specific>",
        "emotion": "<fear|frustration|anxiety|aspiration>",
        "intensity": "<low|medium|high>"
      }
    ],
    "behavioral": [
      {
        "pain": "<the pain point>",
        "currentWorkaround": "<how they cope today>",
        "frequency": "<rare|occasional|frequent|constant>"
      }
    ],
    "functional": [
      {
        "pain": "<the pain point>",
        "impact": "<what it costs them — time, money, effort>",
        "jtbd": "<job-to-be-done framing>"
      }
    ]
  },
  "painPointPrioritization": {
    "evaluations": [
      {
        "pain": "<the pain point text>",
        "type": "<psychological|behavioral|functional>",
        "severityScore": "<1-5>",
        "severityRationale": "<why this score>",
        "frequencyScore": "<1-5>",
        "frequencyRationale": "<why this score>",
        "missionScore": "<1-5>",
        "missionRationale": "<why this score>",
        "totalScore": "<sum of 3 scores>"
      }
    ],
    "chosen": "<which pain point — must match highest totalScore>",
    "whyChosen": "<synthesis of why this pain point wins>"
  },
  "solutions": [
    {
      "name": "<solution name>",
      "description": "<what it does — 1-2 sentences>",
      "novelty": "<what's clever or different>",
      "prosAndCons": "<quick pros/cons>"
    }
  ],
  "solutionPrioritization": {
    "evaluations": [
      {
        "name": "<solution name>",
        "impactScore": "<1-5>",
        "impactRationale": "<why this score>",
        "effortScore": "<1-5 where 5=easy>",
        "effortRationale": "<why this score>",
        "differentiationScore": "<1-5>",
        "differentiationRationale": "<why this score>",
        "totalScore": "<sum of 3 scores>"
      }
    ],
    "chosen": "<which solution — must match highest totalScore>",
    "whyChosen": "<synthesis of why this solution wins>"
  },
  "risks": [
    {
      "risk": "<what could go wrong>",
      "type": "<technical|adoption|competitive|organizational>",
      "severity": "<low|medium|high>",
      "mitigation": "<how to address it>"
    }
  ],
  "mvpAndMetrics": {
    "coreFeatures": ["<must-have feature 1>", "<feature 2>", "<feature 3>"],
    "explicitExclusions": ["<what's OUT and why>"],
    "successMetrics": {
      "northStar": "<primary metric — type, not number>",
      "leading": ["<early indicator 1>", "<early indicator 2>"],
      "guardrails": ["<metric we don't want to hurt>"]
    },
    "learningGoals": "<what we want to learn before expanding>"
  },
  "summary": {
    "recap": "<2-3 sentence recap of the answer>",
    "keyInsight": "<the ONE thing to remember>",
    "watchOut": "<primary risk or pitfall>"
  }
}

Include 3-5 stakeholders, 3 segments, 2-3 pain points per dimension, 3-4 solutions, and 2-3 risks.`;

  const userMessage = `**Question:** ${question}`;

  return { systemPrompt, userMessage };
}

/**
 * Build the generic model answer prompt (for non-product-design types)
 */
function buildGenericModelAnswerPrompt(
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

  const yearsExp = profile?.yearsExperience ?? 3;
  const pmLevel = yearsExp >= 6 ? "senior" : "junior";

  const levelGuidance = pmLevel === "senior"
    ? `
## ANSWER DEPTH: SENIOR PM

This model answer targets a senior PM candidate. Expectations:
- Connect features to business strategy (revenue, retention, competitive moat)
- Discuss cross-functional dependencies (Eng, Design, Legal, Ops, Data)
- Consider market positioning and long-term platform effects
- Address organizational constraints and stakeholder alignment
- Frame metrics at the business level — describe the TYPE of metric, not specific numbers
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

## Instructions
Write a model answer for this question. Return ONLY valid JSON matching this exact schema:

{
  "tagline": "<one-sentence strategy summary>",
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

Include all framework steps with specific examples for this question.`;

  const userMessage = `**Question:** ${question}`;

  return { systemPrompt, userMessage };
}

/**
 * Main entry point — routes to product design or generic prompt
 */
export function buildModelAnswerPrompt(
  company: InterviewCompany | "any",
  questionType: InterviewQuestionType,
  question: string,
  profile?: Partial<UserProfile>
): { systemPrompt: string; userMessage: string } {
  if (questionType === "product-design") {
    return buildProductDesignModelAnswerPrompt(company, question, profile);
  }
  return buildGenericModelAnswerPrompt(company, questionType, question, profile);
}
