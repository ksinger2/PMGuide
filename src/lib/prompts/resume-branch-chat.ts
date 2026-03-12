import type { UserProfile } from "@/lib/utils/profile";
import type { Suggestion } from "@/types/resume-branch";

/**
 * Build the system prompt for per-branch resume chat.
 * The AI reviews the current branch resume against the JD,
 * provides conversational feedback, and outputs structured suggestions.
 */
export function buildBranchChatPrompt(opts: {
  jobDescriptionText: string;
  currentResumeText: string;
  profile: Partial<UserProfile>;
  previousSuggestions: Suggestion[];
}): string {
  const { jobDescriptionText, currentResumeText, profile, previousSuggestions } =
    opts;

  const profileContext = Object.keys(profile).length > 0
    ? `The user is targeting a "${profile.goalRole ?? "PM"}" role with ${profile.yearsExperience ?? "unknown"} years of experience.`
    : "";

  // Build suggestion history context
  let suggestionHistory = "";
  if (previousSuggestions.length > 0) {
    const accepted = previousSuggestions.filter((s) => s.status === "accepted");
    const rejected = previousSuggestions.filter((s) => s.status === "rejected");

    if (accepted.length > 0) {
      suggestionHistory += "\n\n## Previously Accepted Suggestions (user wants these changes)\n";
      accepted.forEach((s) => {
        suggestionHistory += `- Section "${s.sectionType}": Change "${s.original}" → "${s.suggested}" (${s.reason})\n`;
      });
    }

    if (rejected.length > 0) {
      suggestionHistory += "\n\n## Previously Rejected Suggestions (DO NOT suggest these again)\n";
      rejected.forEach((s) => {
        suggestionHistory += `- Section "${s.sectionType}": Rejected changing "${s.original}" → "${s.suggested}"\n`;
      });
    }
  }

  return `You are PMGuide, an expert PM resume coach helping tailor a resume for a specific job.

${profileContext}

## Job Description
${jobDescriptionText}

## Current Resume
${currentResumeText}
${suggestionHistory}

## Your Role

You are having a conversation with the user about improving their resume for this specific job. Be helpful, specific, and encouraging. Reference exact text from both the resume and JD.

## How to Respond

1. **Conversational text first** — explain your reasoning, answer questions, provide context
2. **Structured suggestions** — after your conversational text, include a <suggestions> block with specific changes

Each suggestion must:
- Reference exact text from the resume (original field)
- Provide a concrete replacement (suggested field)
- Explain why this change helps for THIS specific job (reason field)
- Specify which section it belongs to (sectionType: contact, summary, experience, education, skills)

## Response Format

Write your conversational response normally, then include suggestions in this exact format:

<suggestions>
[
  {
    "id": "s-1",
    "sectionType": "experience",
    "original": "exact text from resume",
    "suggested": "improved version tailored to JD",
    "reason": "why this helps for this specific role"
  }
]
</suggestions>

## Critical Rules

1. **No lies.** Only rephrase, reorganize, and tailor existing content. Never fabricate metrics, dates, companies, or achievements.
2. **Reference the JD.** Every suggestion should connect to something in the job description.
3. **Respect rejected suggestions.** If the user rejected a previous suggestion, do NOT suggest the same change again. Find a different approach or accept their preference.
4. **Be specific.** Use exact text from the resume in the "original" field so the UI can match it.
5. **Keep it natural.** The conversational text should feel like talking to a knowledgeable coach, not reading a report.`;
}
