import fs from "fs";
import path from "path";
import type { UserProfile } from "@/lib/utils/profile";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESOURCES_DIR = path.join(
  process.cwd(),
  "docs/resources/interview/pm-interview-resources"
);

/** Available companies for mock interviews. */
export const INTERVIEW_COMPANIES = [
  "anthropic",
  "google",
  "meta",
  "netflix",
  "openai",
  "roblox",
] as const;

export type InterviewCompany = (typeof INTERVIEW_COMPANIES)[number];

/** Available question types for mock interviews. */
export const INTERVIEW_QUESTION_TYPES = [
  "product-design",
  "product-strategy",
  "product-execution",
  "product-analytical",
  "product-estimation",
  "product-technical",
  "behavioral",
] as const;

export type InterviewQuestionType =
  (typeof INTERVIEW_QUESTION_TYPES)[number];

/** Feedback mode — coach after each question, or debrief at the end. */
export type FeedbackMode = "after-each" | "end-of-session";

// ---------------------------------------------------------------------------
// File name mappings
// ---------------------------------------------------------------------------

const COMPANY_FILE_MAP: Record<InterviewCompany, string> = {
  anthropic: "Anthropic.md",
  google: "Google.md",
  meta: "Meta.md",
  netflix: "Netflix.md",
  openai: "OpenAI.md",
  roblox: "Roblox.md",
};

const QUESTION_TYPE_FILE_MAP: Record<InterviewQuestionType, string> = {
  "product-design": "ProductDesign.md",
  "product-strategy": "ProductStrategy.md",
  "product-execution": "ProductExecution.md",
  "product-analytical": "ProductAnalytical.md",
  "product-estimation": "ProductEstimation.md",
  "product-technical": "ProductTechnical.md",
  behavioral: "Behavioral.md",
};

export const QUESTION_TYPE_LABELS: Record<InterviewQuestionType, string> = {
  "product-design": "Product Design",
  "product-strategy": "Product Strategy",
  "product-execution": "Execution",
  "product-analytical": "Analytical",
  "product-estimation": "Estimation",
  "product-technical": "Technical",
  behavioral: "Behavioral",
};

// ---------------------------------------------------------------------------
// File loaders (read once at module load — server-side only)
// ---------------------------------------------------------------------------

export function readResource(relativePath: string): string {
  return fs.readFileSync(
    path.join(RESOURCES_DIR, relativePath),
    "utf-8"
  );
}

export const skillPersona = readResource("SKILL.md");
const rubric = readResource("rubrics/Rubric.md");

export const companyGuides: Record<InterviewCompany, string> = {} as Record<
  InterviewCompany,
  string
>;
for (const company of INTERVIEW_COMPANIES) {
  companyGuides[company] = readResource(
    `companies/${COMPANY_FILE_MAP[company]}`
  );
}

export const questionTypeGuides: Record<InterviewQuestionType, string> =
  {} as Record<InterviewQuestionType, string>;
for (const qt of INTERVIEW_QUESTION_TYPES) {
  questionTypeGuides[qt] = readResource(
    `question-types/${QUESTION_TYPE_FILE_MAP[qt]}`
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format the user's profile into a concise context block for the system prompt.
 */
export function formatProfileContext(profile: Partial<UserProfile>): string {
  const lines: string[] = [];

  if (profile.name) lines.push(`- **Name:** ${profile.name}`);
  if (profile.currentRole)
    lines.push(`- **Current role:** ${profile.currentRole}`);
  if (profile.currentCompany)
    lines.push(`- **Current company:** ${profile.currentCompany}`);
  if (profile.yearsExperience != null)
    lines.push(`- **Years of experience:** ${profile.yearsExperience}`);
  if (profile.goalRole)
    lines.push(`- **Target role:** ${profile.goalRole}`);
  if (profile.companyTypes?.length)
    lines.push(
      `- **Company types:** ${profile.companyTypes.join(", ")}`
    );
  if (profile.industryPreferences?.length)
    lines.push(
      `- **Industry preferences:** ${profile.industryPreferences.join(", ")}`
    );
  if (profile.frameworks?.length)
    lines.push(
      `- **Frameworks used:** ${profile.frameworks.join(", ")}`
    );
  if (profile.keyMetrics?.length)
    lines.push(
      `- **Key metrics owned:** ${profile.keyMetrics.join(", ")}`
    );
  if (profile.productsShipped?.length) {
    const products = profile.productsShipped
      .map((p) => `${p.name} (${p.impact})`)
      .join("; ");
    lines.push(`- **Products shipped:** ${products}`);
  }
  if (profile.skillsAssessment) {
    const skills = Object.entries(profile.skillsAssessment)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}: ${v}/5`)
      .join(", ");
    if (skills) lines.push(`- **Skills assessment:** ${skills}`);
  }
  if (profile.learningStyle)
    lines.push(`- **Learning style:** ${profile.learningStyle}`);

  return lines.length > 0
    ? lines.join("\n")
    : "No profile data available.";
}

/**
 * Extract the rubric section relevant to a question type from Rubric.md.
 */
export function extractRubricSection(
  questionType: InterviewQuestionType
): string {
  const sectionHeaders: Record<InterviewQuestionType, string> = {
    "product-design": "## Product Design Rubric",
    "product-strategy": "## Product Strategy Rubric",
    "product-execution": "## Execution Rubric",
    "product-analytical": "## Analytical Rubric",
    "product-estimation": "## Estimation Rubric",
    "product-technical": "## Technical Rubric",
    behavioral: "", // Behavioral doesn't have a dedicated rubric section
  };

  const header = sectionHeaders[questionType];
  if (!header) {
    // Behavioral — return a short inline rubric note
    return `## Behavioral Rubric
Evaluate based on: Communication (clear, concise STAR story), Self-awareness (honest reflection), Impact (quantified results), Culture fit (values alignment), Specificity (concrete details, not generalities).`;
  }

  const startIdx = rubric.indexOf(header);
  if (startIdx === -1) return rubric; // Fallback: return entire rubric

  // Find the next "---" separator or the next "## " heading after this section
  const afterHeader = rubric.indexOf("\n## ", startIdx + header.length);
  const endIdx = afterHeader === -1 ? rubric.length : afterHeader;

  return rubric.slice(startIdx, endIdx).trim();
}

/**
 * Build the feedback mode instruction.
 */
function getFeedbackModeInstruction(mode: FeedbackMode): string {
  if (mode === "after-each") {
    return `**Feedback mode: Coach after each question.**
After the candidate answers each question (and any follow-ups), break character and deliver structured rubric-based feedback using this format:

### Feedback: [Question Type] — [Company]

**Overall:** [1-2 sentence verdict]

**Rubric Scores:**
| Signal | Score | Note |
|--------|-------|------|
| [signal] | [Very Weak → Very Strong] | [1 line] |

**What Worked:**
- [bullet]

**What to Improve:**
- [bullet]

**If I Were the Interviewer:** [Honest hiring signal]

**One Thing to Do Differently Next Time:**
[Single most impactful change]`;
  }

  return `**Feedback mode: Full simulation, then debrief.**
Stay fully in interviewer character for the entire session. Do NOT give feedback between questions. After all questions are complete, deliver a comprehensive debrief covering:
1. Overall performance summary
2. Rubric scores for each question
3. Strongest moments
4. Patterns to improve
5. Honest hiring signal for this company/level`;
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

/**
 * Build the system prompt for a mock PM interview session.
 *
 * Composes the prompt from:
 * 1. SKILL.md persona
 * 2. Company-specific guide (if not "general")
 * 3. Question-type framework + question bank
 * 4. Rubric scoring criteria for the question type
 * 5. User profile context
 * 6. Feedback mode instructions
 */
export function buildInterviewSystemPrompt(options: {
  company: InterviewCompany | "general";
  questionType: InterviewQuestionType;
  userProfile: Partial<UserProfile>;
  feedbackMode: FeedbackMode;
}): string {
  const { company, questionType, userProfile, feedbackMode } = options;

  const questionTypeLabel = QUESTION_TYPE_LABELS[questionType];
  const questionGuide = questionTypeGuides[questionType];
  const rubricSection = extractRubricSection(questionType);
  const profileContext = formatProfileContext(userProfile);
  const feedbackInstruction = getFeedbackModeInstruction(feedbackMode);

  const sections: string[] = [];

  // 1. Persona
  sections.push(skillPersona);

  // 2. Company guide (if specific company selected)
  if (company !== "general") {
    const companyGuide = companyGuides[company];
    sections.push(`---

# Target Company: ${company.charAt(0).toUpperCase() + company.slice(1)}

Use this company profile to tailor your questions, style, and evaluation criteria. Ask questions that this company actually asks or would ask. Reference the company's products, culture, and values in your questions and follow-ups.

${companyGuide}`);
  } else {
    sections.push(`---

# Target Company: General Practice

No specific company selected. Ask general PM interview questions appropriate for Staff/Senior PM level. Mix in questions from various company styles to give broad practice.`);
  }

  // 3. Question type framework + question bank
  sections.push(`---

# Question Type Focus: ${questionTypeLabel}

Use this framework and question bank for this session. Follow the framework's structure when evaluating answers.

${questionGuide}`);

  // 4. Rubric scoring criteria
  sections.push(`---

# Scoring Rubric

Use these criteria to score the candidate's answer. Reference specific signals in your feedback.

${rubricSection}`);

  // 5. User profile context
  sections.push(`---

# Candidate Profile

Use this context to calibrate difficulty, reference the candidate's background, and make the interview feel personalized. If the candidate has shipped relevant products or has domain experience, incorporate that into follow-up questions.

${profileContext}`);

  // 6. Feedback mode
  sections.push(`---

# Session Configuration

${feedbackInstruction}

## Rules
1. Ask one question at a time — never stack multiple questions.
2. Stay in character as the interviewer during the candidate's answer. Minimal interruption unless they are completely lost.
3. Ask 1 follow-up question after each answer to probe depth before moving on.
4. Calibrate difficulty to the candidate's target level (Staff PM / Senior PM).
5. Be honest — a "Strong" score should feel earned.
6. When asking a question, provide enough context for the candidate to answer (company context, constraints, etc.).`);

  return sections.join("\n\n");
}
