import {
  INTERVIEW_QUESTION_TYPES,
  readResource,
  type InterviewQuestionType,
} from "@/lib/prompts/interview";
import type { BankQuestion } from "@/types/interview";

// ---------------------------------------------------------------------------
// File name mapping (mirrors interview.ts)
// ---------------------------------------------------------------------------

const QUESTION_TYPE_FILE_MAP: Record<InterviewQuestionType, string> = {
  "product-design": "ProductDesign.md",
  "product-strategy": "ProductStrategy.md",
  "product-execution": "ProductExecution.md",
  "product-analytical": "ProductAnalytical.md",
  "product-estimation": "ProductEstimation.md",
  "product-technical": "ProductTechnical.md",
  behavioral: "Behavioral.md",
};

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseQuestionBank(
  markdown: string,
  type: InterviewQuestionType
): BankQuestion[] {
  const bankStart = markdown.indexOf("## Question Bank");
  if (bankStart === -1) return [];

  // Find the end of the bank section (next ## heading or EOF)
  const afterBank = markdown.indexOf("\n## ", bankStart + 16);
  const bankSection =
    afterBank === -1
      ? markdown.slice(bankStart)
      : markdown.slice(bankStart, afterBank);

  const questions: BankQuestion[] = [];
  let currentSubCategory = "General";
  let index = 0;

  for (const line of bankSection.split("\n")) {
    const trimmed = line.trim();

    // Sub-category heading
    if (trimmed.startsWith("### ")) {
      currentSubCategory = trimmed.slice(4).trim();
      continue;
    }

    // Question line: starts with "- "
    if (trimmed.startsWith("- ")) {
      const text = trimmed.slice(2).trim();
      if (!text) continue;

      // Extract optional company hint in parentheses at end
      const hintMatch = text.match(/\(([^)]+)\)\s*$/);
      const companyHint = hintMatch ? hintMatch[1] : undefined;

      questions.push({
        id: `${type}-${index}`,
        text,
        type,
        subCategory: currentSubCategory,
        companyHint,
      });
      index++;
    }
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Parsed bank (loaded once at module init — server-only)
// ---------------------------------------------------------------------------

export const QUESTION_BANK: Record<InterviewQuestionType, BankQuestion[]> =
  {} as Record<InterviewQuestionType, BankQuestion[]>;

for (const qt of INTERVIEW_QUESTION_TYPES) {
  const markdown = readResource(`question-types/${QUESTION_TYPE_FILE_MAP[qt]}`);
  QUESTION_BANK[qt] = parseQuestionBank(markdown, qt);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a random question from the bank for a given type, excluding already-used IDs.
 * Returns null if all questions have been used.
 */
export function getRandomBankQuestion(
  type: InterviewQuestionType,
  excludeIds: string[] = []
): BankQuestion | null {
  const pool = QUESTION_BANK[type];
  if (!pool || pool.length === 0) return null;

  const available = pool.filter((q) => !excludeIds.includes(q.id));
  if (available.length === 0) {
    // Pool exhausted — reset by ignoring excludeIds
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

/**
 * Get all bank questions for a given type.
 */
export function getBankQuestionsForType(
  type: InterviewQuestionType
): BankQuestion[] {
  return QUESTION_BANK[type] ?? [];
}
