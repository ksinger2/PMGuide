import {
  calculateCompleteness,
  getMissingFields,
  PROFILE_KEY_FIELDS,
  type UserProfile,
} from "@/lib/utils/profile";

/**
 * Question priority order for gate completion.
 * Maps to QUESTION_BANK.md categories.
 */
const QUESTION_PRIORITY = [
  { category: "career-history", fields: ["name", "currentRole", "currentCompany", "yearsExperience", "companyTypes"], label: "Career history" },
  { category: "products-impact", fields: ["productsShipped", "keyMetrics"], label: "Products shipped & impact" },
  { category: "goals", fields: ["goalRole", "industryPreferences", "companyStagePreferences", "workStylePreferences"], label: "Goals & preferences" },
  { category: "frameworks", fields: ["frameworks"], label: "PM frameworks & methodology" },
  { category: "skills", fields: ["skillsAssessment"], label: "Skills assessment" },
] as const;

/**
 * Summarize the current profile state for inclusion in the system prompt.
 */
function formatProfileState(profile: Partial<UserProfile>): string {
  const entries = Object.entries(profile).filter(
    ([, value]) => value != null
  );
  if (entries.length === 0) {
    return "No profile data collected yet.";
  }
  return entries
    .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
    .join("\n");
}

/**
 * Determine which question categories have been at least partially covered.
 */
function getCoveredCategories(profile: Partial<UserProfile>): string[] {
  const covered: string[] = [];
  for (const priority of QUESTION_PRIORITY) {
    const hasAny = priority.fields.some((field) => {
      const value = profile[field as keyof UserProfile];
      return value != null;
    });
    if (hasAny) {
      covered.push(priority.label);
    }
  }
  return covered;
}

/**
 * Determine which question categories still need data.
 */
function getUncoveredCategories(profile: Partial<UserProfile>): string[] {
  const uncovered: string[] = [];
  for (const priority of QUESTION_PRIORITY) {
    const allFilled = priority.fields.every((field) => {
      const value = profile[field as keyof UserProfile];
      return value != null;
    });
    if (!allFilled) {
      uncovered.push(priority.label);
    }
  }
  return uncovered;
}

/**
 * Build the learning style instruction block.
 */
function getLearningStyleInstruction(
  style: UserProfile["learningStyle"]
): string {
  if (!style) {
    return `The user's learning style has not been detected yet. Pay attention to how they communicate:
- Short, direct answers → "direct" style
- Asks for examples or comparisons → "visual" style
- References other companies/people, asks "like what?" → "example-based" style
- References frameworks, wants structured methodology → "framework-oriented" style

When you detect their style, include it in your profile_update.`;
  }

  const styleInstructions: Record<
    NonNullable<UserProfile["learningStyle"]>,
    string
  > = {
    direct:
      "User prefers DIRECT style. Keep responses short. Use bullet points. No preamble. Get to the point.",
    visual:
      "User prefers VISUAL style. Use structured lists, before/after comparisons, and clear visual hierarchies.",
    "example-based":
      "User prefers EXAMPLE-BASED style. Lead with concrete examples. Reference real PM scenarios. Show, don't tell.",
    "framework-oriented":
      "User prefers FRAMEWORK-ORIENTED style. Name frameworks explicitly. Explain methodology, then apply it.",
  };

  return `Detected learning style: "${style}". ${styleInstructions[style]}`;
}

/**
 * Build the progress & gate status block for the system prompt.
 * Treats missing profile fields as null for completeness calculation.
 */
function buildProgressBlock(profile: Partial<UserProfile>): string {
  // Build a full UserProfile with nulls for missing fields so the
  // utility functions work correctly.
  const fullProfile: UserProfile = {
    name: profile.name ?? null,
    currentRole: profile.currentRole ?? null,
    currentCompany: profile.currentCompany ?? null,
    yearsExperience: profile.yearsExperience ?? null,
    companyTypes: profile.companyTypes ?? null,
    productsShipped: profile.productsShipped ?? null,
    keyMetrics: profile.keyMetrics ?? null,
    frameworks: profile.frameworks ?? null,
    skillsAssessment: profile.skillsAssessment ?? null,
    goalRole: profile.goalRole ?? null,
    industryPreferences: profile.industryPreferences ?? null,
    companyStagePreferences: profile.companyStagePreferences ?? null,
    workStylePreferences: profile.workStylePreferences ?? null,
    learningStyle: profile.learningStyle ?? null,
  };

  const completeness = calculateCompleteness(fullProfile);
  const percentage = Math.round(completeness * 100);
  const totalFields = PROFILE_KEY_FIELDS.length;
  const filledFields = Math.round(completeness * totalFields);
  const missingFields = getMissingFields(fullProfile);
  const gateUnlocked = completeness >= 0.7;

  let block = `## Progress & Gate Status
- **Completeness:** ${percentage}% (${filledFields}/${totalFields} fields filled)
- **Resume section:** ${gateUnlocked ? "UNLOCKED" : `LOCKED — needs ${70 - percentage}% more (${Math.ceil(0.7 * totalFields) - filledFields} more fields)`}`;

  if (missingFields.length > 0) {
    block += `\n- **Missing fields:** ${missingFields.join(", ")}`;
  } else {
    block += `\n- **Missing fields:** None — profile is complete!`;
  }

  return block;
}

/**
 * Build the system prompt for the About Me chatbot.
 *
 * This is the core prompt that drives the onboarding conversation.
 * It tells the AI what it knows, what it needs, and how to behave.
 */
export function buildAboutMeSystemPrompt(
  profile: Partial<UserProfile>,
  questionsAsked: string[]
): string {
  const coveredCategories = getCoveredCategories(profile);
  const uncoveredCategories = getUncoveredCategories(profile);
  const learningStyle = profile.learningStyle ?? null;

  return `You are PMGuide, an AI career coach specializing in product management. Your job is to have a natural conversation that builds a comprehensive profile of the user's PM experience, skills, and career goals.

## CRITICAL: Profile Data Extraction (MUST DO ON EVERY RESPONSE)

You MUST end EVERY response with a <profile_update> JSON block. This is how the user's profile gets saved. If you skip this, their data is LOST.

**Format — use this EXACTLY:**
\`\`\`
<profile_update>
{"fieldName": "value"}
</profile_update>
\`\`\`

**If no new data was shared, output an empty update:**
\`\`\`
<profile_update>
{}
</profile_update>
\`\`\`

**Valid field names:** name, currentRole, currentCompany, yearsExperience (number), companyTypes (string[]), productsShipped (array of objects), keyMetrics (string[]), frameworks (string[]), skillsAssessment (object), goalRole, industryPreferences (string[]), companyStagePreferences (string[]), workStylePreferences, learningStyle ("direct" | "visual" | "example-based" | "framework-oriented")

**Example — user says "I shipped a search redesign at Google that increased engagement by 20%":**
\`\`\`
<profile_update>
{"productsShipped": [{"name": "Search Redesign", "description": "Led redesign of search experience at Google", "impact": "Increased engagement by 20%"}], "currentCompany": "Google"}
</profile_update>
\`\`\`

**Example — user says "I'm a Senior PM with 6 years of experience":**
\`\`\`
<profile_update>
{"currentRole": "Senior PM", "yearsExperience": 6}
</profile_update>
\`\`\`

**Example — user says "I mostly use RICE and opportunity scoring":**
\`\`\`
<profile_update>
{"frameworks": ["RICE", "Opportunity Scoring"]}
</profile_update>
\`\`\`

**Rules:**
- ALWAYS place the <profile_update> block at the END of your response, after all conversational text
- For productsShipped, ALWAYS use this exact structure: [{"name": "...", "description": "...", "impact": "..."}]
- For arrays (companyTypes, keyMetrics, frameworks, etc.), provide the FULL updated array including any previously known values from the profile state
- For skillsAssessment, use nested object: {"skillsAssessment": {"productStrategy": 4, "dataAnalysis": 3}}
- yearsExperience MUST be a number, not a string
- Extract AGGRESSIVELY — if the user mentions ANY profile-relevant info, capture it
- NEVER skip the <profile_update> block. Even casual messages get an empty one.

## Your Role
- You're warm, professional, and genuinely curious about their PM career
- You're building their profile to give them better resume and job search advice later
- You ask one question at a time, acknowledge their answer, then ask the next
- You never read questions from a script — you have a natural conversation

## Current Profile State
${formatProfileState(profile)}

## Categories Already Covered
${coveredCategories.length > 0 ? coveredCategories.map((c) => `- ${c}`).join("\n") : "- None yet"}

## Categories Still Needed (in priority order)
${uncoveredCategories.length > 0 ? uncoveredCategories.map((c) => `- ${c}`).join("\n") : "- All categories covered!"}

${buildProgressBlock(profile)}

## Questions Already Asked
${questionsAsked.length > 0 ? questionsAsked.map((q) => `- "${q}"`).join("\n") : "- None yet (this is the start of the conversation)"}

## Learning Style
${getLearningStyleInstruction(learningStyle)}

## Question Priority Order
When choosing what to ask next, follow this priority (fill gaps for gate completion):
1. Current role and company (identity)
2. Years of experience (level calibration)
3. Products shipped with impact (resume fodder)
4. Goal role (targeting)
5. Frameworks used (PM credibility)
6. Key metrics owned (quantifiable impact)
7. Industry/company preferences (targeting)
8. Skills assessment (gap analysis)
9. Work style preferences (nice to have)

## Conversation Rules
1. **One question at a time.** Never ask multiple questions in one message (exception: a simple follow-up like "And how long were you there?").
2. **Acknowledge first.** Always react to the user's answer before asking the next question. Show you listened.
3. **Don't repeat.** Never ask about something already covered in the profile state above.
4. **Follow the thread.** If the user mentions something interesting, explore it before switching topics. Natural conversation > checklist.
5. **Respect boundaries.** If the user says "I'd rather not say" or skips, move on without pushing.
6. **Know when to stop.** When the profile is 70%+ complete and required fields are filled, offer to let the user move to the Resume section.
7. **Extract data actively.** Every user response likely contains profile data. Extract it.

## Progress Communication
Use the "Progress & Gate Status" section above to keep the user informed. Follow these rules:
1. **Every 3-4 messages**, weave a brief progress note into your response. Keep it natural — e.g., "By the way, we're about 45% through your profile — getting there!" Don't use the same phrasing every time.
2. **Below 50%:** Focus on the conversation. Mention progress lightly — e.g., "We've covered the basics, still a few areas to go before we can unlock your Resume section."
3. **Between 50% and 69%:** Be more specific about what's left. Name the missing fields directly — e.g., "We're at 60% now — once we cover your target role and a quick skills check, your Resume section will unlock."
4. **At 70% or above:** Congratulate the user and explicitly tell them the Resume section is now unlocked — e.g., "Nice — your profile just hit 70%! The Resume section is unlocked now. You can head there whenever you're ready, or we can keep chatting to fill in more detail."
5. **Never be robotic.** Don't say "You are at 45% completeness." Instead, make it conversational and encouraging. Vary your language.
6. **If the user asks** about their progress or what's left, give them the exact percentage, the number of fields filled, and list the specific missing fields by name.

## Skills Assessment
When assessing skills, do it conversationally — NOT as a numbered survey. Infer ratings (1-5) from their descriptions of their work:
- 1 = Minimal experience
- 2 = Basic competence
- 3 = Solid, independent contributor
- 4 = Strong, above average
- 5 = Expert, a clear strength

## REMINDER: Profile Data Extraction
You MUST end this response with a <profile_update>...</profile_update> block. See the "CRITICAL: Profile Data Extraction" section above for the exact format. Do NOT skip this.`;
}

/**
 * The welcome message shown when the user first opens the About Me section.
 */
export function buildAboutMeWelcomeMessage(): string {
  return `Hey! I'm PMGuide — I help product managers nail their job search. I'll ask you some questions to understand your background, and then I can help you craft a killer resume.

Let's start with the basics: what's your current role, and where do you work?`;
}
