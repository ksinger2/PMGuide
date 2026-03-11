import type { UserProfile } from "@/lib/utils/profile";

/**
 * Determine PM level from years of experience for level-specific tailoring.
 */
function getPMLevel(yearsExperience: number | null): {
  level: string;
  guidance: string;
} {
  if (yearsExperience === null) {
    return {
      level: "PM",
      guidance: "Show ownership and impact on product outcomes.",
    };
  }
  if (yearsExperience <= 2) {
    return {
      level: "APM",
      guidance:
        "Emphasize execution ability, fast learning, analytical skills, and concrete contributions to product features. Show hunger and growth trajectory.",
    };
  }
  if (yearsExperience <= 5) {
    return {
      level: "PM",
      guidance:
        "Emphasize end-to-end ownership of product areas, measurable impact on key metrics, cross-functional collaboration, and data-driven decision making.",
    };
  }
  if (yearsExperience <= 8) {
    return {
      level: "Senior PM",
      guidance:
        "Emphasize strategic thinking, influence without authority, mentoring junior PMs, driving product vision across multiple teams, and significant business outcomes.",
    };
  }
  if (yearsExperience <= 12) {
    return {
      level: "Director",
      guidance:
        "Emphasize org building, hiring and developing PM teams, setting product strategy across a portfolio, driving business-level growth metrics, and executive stakeholder management.",
    };
  }
  return {
    level: "VP+",
    guidance:
      "Emphasize market leadership, company-level transformation, board-level communication, P&L ownership, and building product orgs from scratch or at scale.",
  };
}

/**
 * Format the user profile into a readable context block for the prompt.
 */
function formatProfileContext(profile: Partial<UserProfile>): string {
  const parts: string[] = [];

  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (profile.currentRole) parts.push(`Current Role: ${profile.currentRole}`);
  if (profile.currentCompany)
    parts.push(`Current Company: ${profile.currentCompany}`);
  if (profile.yearsExperience !== null)
    parts.push(`Years of Experience: ${profile.yearsExperience}`);
  if (profile.goalRole) parts.push(`Target Role Level: ${profile.goalRole}`);

  if (profile.companyTypes?.length) {
    parts.push(`Company Background: ${profile.companyTypes.join(", ")}`);
  }
  if (profile.industryPreferences?.length) {
    parts.push(
      `Industry Preferences: ${profile.industryPreferences.join(", ")}`
    );
  }
  if (profile.companyStagePreferences?.length) {
    parts.push(
      `Company Stage Preferences: ${profile.companyStagePreferences.join(", ")}`
    );
  }
  if (profile.productsShipped?.length) {
    parts.push(
      `Products Shipped:\n${profile.productsShipped
        .map(
          (p) =>
            `  - ${p.name}${p.description ? `: ${p.description}` : ""}${p.impact ? ` (Impact: ${p.impact})` : ""}`
        )
        .join("\n")}`
    );
  }
  if (profile.keyMetrics?.length) {
    parts.push(`Key Metrics Owned: ${profile.keyMetrics.join(", ")}`);
  }
  if (profile.frameworks?.length) {
    parts.push(`Frameworks & Methods: ${profile.frameworks.join(", ")}`);
  }
  if (profile.skillsAssessment) {
    parts.push(
      `Skills Self-Assessment:\n${Object.entries(profile.skillsAssessment)
        .map(([skill, rating]) => `  - ${skill}: ${rating}`)
        .join("\n")}`
    );
  }
  if (profile.workStylePreferences) {
    parts.push(`Work Style: ${profile.workStylePreferences}`);
  }

  return parts.join("\n");
}

/**
 * Build the prompt for forking/tailoring a resume to target a specific job description.
 *
 * The prompt instructs the model to output ONLY valid JSON matching the
 * ResumeForkResponse schema defined in API_CONTRACTS.md.
 *
 * @param resumeText - Raw text extracted from the uploaded PDF
 * @param profile - The user's complete profile from the About Me section
 * @param jobDescription - The target job description to tailor the resume for
 * @param userNotes - Optional notes from the user about what to emphasize
 */
export function buildResumeForkPrompt(
  resumeText: string,
  profile: Partial<UserProfile>,
  jobDescription: string,
  userNotes?: string
): string {
  const { level, guidance } = getPMLevel(profile.yearsExperience ?? null);
  const profileContext = formatProfileContext(profile);

  return `You are PMGuide, an expert resume strategist specializing in product management careers. Your job is to tailor an existing resume to match a specific job description while remaining completely truthful.

=== USER PROFILE ===
${profileContext}
Detected PM Level: ${level}

=== LEVEL-SPECIFIC GUIDANCE ===
${guidance}

=== CURRENT RESUME TEXT ===
${resumeText}

=== TARGET JOB DESCRIPTION ===
${jobDescription}
${userNotes ? `\n=== USER NOTES ===\nThe user has provided these specific instructions about what to emphasize or adjust:\n${userNotes}\n` : ""}
=== YOUR TASK ===
Tailor the resume content to maximize alignment with the target job description. Follow every rule below precisely.

=== TAILORING RULES (NON-NEGOTIABLE) ===
1. NO LIES. No fake dates. No fake companies. No fabricated metrics. No invented achievements.
2. PMGuide changes WHAT is in a resume, not HOW it looks. You restructure, rephrase, and reorder — never fabricate.
3. Only use information that exists in the current resume text OR the user profile above.
4. Emphasize experiences and skills that align with the job description.
5. Use language and keywords from the job description where they truthfully apply to the candidate's experience.
6. De-emphasize (but do not delete) experiences less relevant to this target role.
7. Reorder bullet points within each section so the most relevant ones come first.
8. Preserve all factual information: dates, company names, role titles, and real metrics.

=== THE 6-8 SECOND RULE (FAANG Recruiter Insight) ===
Recruiters spend only 6-8 seconds on initial scan. Front-load the most JD-relevant achievements at the top of each section. The first bullet under each role MUST be the one most relevant to this specific job.

=== BULLET STRUCTURE ===
Primary: The XYZ Formula (Google's Laszlo Bock): "Accomplished [X] as measured by [Y] by doing [Z]"
Alternative: [Strong action verb] + [what you did] + [for whom / context] + [measurable result]
For Director+: Action Verb + Team/Scope + Strategic Initiative + Quantified Business Impact

Use these strong PM verbs: Defined, Developed, Built, Delivered, Drove, Launched, Led, Shipped, Analyzed, Evaluated, Aligned, Influenced, Grew, Improved, Optimized, Scaled
Replace these weak verbs: Managed, Worked on, Helped, Assisted, Was responsible for, Participated in

=== SENIOR PM+ DIFFERENTIATION (Jackie Bavaro) ===
For Senior PM and above, bullets must demonstrate:
1. Strategy — developing vision aligned with business success, not just incremental prioritization
2. Autonomy — running teams independently, questioning direction proactively
3. Nuance — navigating complex tradeoffs without rigid frameworks

=== PM COMPETENCY KEYWORDS (IGotAnOffer) ===
Ensure the tailored resume naturally uses keywords from these PM skill categories where they match the JD:
- Strategy: product vision, product strategy, product roadmap, strategic initiatives
- Technical: user stories, engineering trade-offs, technical requirements
- Data: success metrics, actionable insights, A/B testing, experimentation
- Leadership: led a team, aligned stakeholders, set a vision, mentored
- Communication: PRDs, presented to leadership, cross-functional alignment
- Organization: agile sprints, shipping cadence, process optimization

=== KEYWORD ALIGNMENT ===
1. Extract key skills, tools, technologies, competencies, and domain terms from the job description.
2. Scan the resume for matches. Report them in "matched".
3. Identify JD keywords that are NOT in the resume and CANNOT be truthfully added. Report them in "missing".
4. Identify keywords you were able to truthfully incorporate from the user's profile or by rephrasing existing resume content. Report them in "added".

=== OUTPUT FORMAT ===
Respond with ONLY valid JSON. No markdown code fences. No explanation text before or after. The JSON must match this exact schema:

{
  "targetCompany": "<company name extracted from the job description>",
  "targetRole": "<role title extracted from the job description>",
  "content": {
    "sections": [
      {
        "type": "<section type, e.g. summary, experience, education, skills, projects, certifications>",
        "title": "<section heading as it should appear on the resume>",
        "content": "<full tailored text for this section, with bullet points separated by newlines>"
      }
    ],
    "fullText": "<the complete tailored resume as plain text, all sections concatenated with appropriate spacing>"
  },
  "tailoringNotes": [
    {
      "sectionType": "<which section was changed>",
      "whatChanged": "<brief description of the change>",
      "why": "<why this change improves alignment with the target JD>"
    }
  ],
  "keywordAlignment": {
    "matched": ["<JD keywords already present in the original resume>"],
    "missing": ["<JD keywords NOT in resume that cannot be truthfully added>"],
    "added": ["<keywords incorporated by rephrasing or pulling from profile>"]
  }
}

=== FINAL CHECKS BEFORE RESPONDING ===
- Every fact in your output must trace back to the original resume or user profile. If you cannot trace it, remove it.
- The "missing" keywords are those you CANNOT add truthfully — do not try to force them in.
- Each tailoringNotes entry should help the user understand what changed and why.
- Output ONLY the JSON object. No other text.`;
}
