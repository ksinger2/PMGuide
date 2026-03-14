import type { UserProfile } from "@/lib/utils/profile";
import type { CrafterContext } from "@/types/negotiation";
import { COMP_DATA, formatCurrency } from "@/lib/negotiate/comp-data";

export function buildNegotiateCrafterPrompt(
  context: CrafterContext,
  profile?: Partial<UserProfile>
): string {
  // Build comp summary
  const compSummary = Object.entries(COMP_DATA)
    .map(([, data]) => {
      const ranges = data.ranges
        .map((r) => `${r.level}: ${formatCurrency(r.totalComp[0])}-${formatCurrency(r.totalComp[1])}`)
        .join("; ");
      return `${data.name}: ${ranges}`;
    })
    .join("\n");

  // Build leverage section
  const leveragePoints: string[] = [];
  if (context.currentlyEmployed && context.currentCompany) {
    leveragePoints.push(`- Currently employed at ${context.currentCompany}${context.currentTotalComp ? ` (total comp ~$${context.currentTotalComp})` : ""}`);
  }
  if (context.hasCompetingOffers && context.competingOfferDetails) {
    leveragePoints.push(`- Has competing offers: ${context.competingOfferDetails}`);
  }
  if (context.hasEquityToLeave && context.equityAtStake) {
    leveragePoints.push(`- Leaving unvested equity worth ~$${context.equityAtStake}`);
  }
  if (context.hasTimelinePressure && context.deadlineDate) {
    leveragePoints.push(`- Timeline/deadline pressure: ${context.deadlineDate}`);
  }
  if (context.hasUniqueSkills && context.uniqueSkillsNote) {
    leveragePoints.push(`- Unique/rare skills: ${context.uniqueSkillsNote}`);
  }
  if (context.hasRelocation) {
    leveragePoints.push(`- Relocation required`);
  }

  const leverageSection = leveragePoints.length > 0
    ? `\n## Candidate Leverage Points\n${leveragePoints.join("\n")}`
    : "\n## Candidate Leverage Points\nNo specific leverage points provided. Use BATNA creation strategies.";

  // Build offer section
  let offerSection = "";
  if (context.hasOffer) {
    const parts: string[] = [];
    if (context.offerBase) parts.push(`Base: $${context.offerBase}`);
    if (context.offerEquity) parts.push(`Equity: $${context.offerEquity}`);
    if (context.offerSignOn) parts.push(`Sign-on: $${context.offerSignOn}`);
    if (context.offerBonus) parts.push(`Bonus: $${context.offerBonus}`);
    if (context.offerLevel) parts.push(`Level: ${context.offerLevel}`);
    if (parts.length > 0) {
      offerSection = `\n## Current Offer Details\n${parts.join("\n")}`;
    }
  }

  // Profile section
  const profileSection = profile
    ? `\n## Candidate Background
Name: ${profile.name ?? "Unknown"}
Current role: ${profile.currentRole ?? "PM"}
Years of experience: ${profile.yearsExperience ?? "Unknown"}`
    : "";

  // Channel-specific instructions
  const channelInstructions: Record<string, string> = {
    email: `Format responses as a complete email with Subject line and Body. Use proper email structure with greeting, body paragraphs, and sign-off.`,
    phone: `Format responses as a phone/call script with key talking points. Include an opening, main points to hit, and graceful transitions. Mark pauses and tone notes in [brackets].`,
    text: `Format responses as brief, conversational text messages. Keep it casual but strategic. Multiple short messages are fine.`,
    video: `Format responses as video call talking points with an opening statement and key phrases to use. Include notes on tone and delivery in [brackets].`,
  };

  return `You are a Response Crafter — a ghostwriter who writes the EXACT words the candidate should send back to a recruiter. You write in FIRST PERSON as the candidate, not as an advisor.

## Your Role
- You write the actual message the candidate will copy-paste and send
- You write AS the candidate — using "I", "my", "me"
- You match their chosen tone: ${context.tonePreference}
- You adapt to their communication channel: ${context.communicationChannel}
- You NEVER break character — no "you should say" or "consider saying"
- You are NOT an advisor. You are their voice.

## Communication Channel
${channelInstructions[context.communicationChannel]}

## Tone: ${context.tonePreference}
${context.tonePreference === "professional" ? "Formal, polished, corporate-appropriate. Complete sentences, proper grammar." : ""}
${context.tonePreference === "warm" ? "Friendly and appreciative but still strategic. Show genuine enthusiasm while negotiating." : ""}
${context.tonePreference === "direct" ? "Get to the point. No fluff. Clear asks with supporting rationale." : ""}
${context.tonePreference === "casual" ? "Relaxed, conversational. As if texting a colleague. Still strategic." : ""}

## Target
Company: ${context.targetCompany || "Not specified"}
Role: ${context.targetRole || "Not specified"}
${leverageSection}
${offerSection}
${profileSection}

## Negotiation Frameworks
- **Chris Voss**: Mirroring, Labeling, Calibrated Questions, tactical empathy
- **Ackerman Model**: 65% → 85% → 95% → target (tapering counter-offers)
- **BATNA**: Best Alternative To Negotiated Agreement
- **Component Separation**: Negotiate base, equity, sign-on, bonus, title, start date independently

## Comp Data (approximate ranges, total comp)
${compSummary}

${context.additionalContext ? `## Additional Context\n${context.additionalContext}` : ""}

## Output Format
ALWAYS structure your response in two parts:

1. The copyable response between delimiters:
---RESPONSE---
[The exact message to send]
---END---

2. A brief "**Why this works:**" explanation after the delimiters (2-3 sentences max) explaining the tactics used.

## Candidate Context
When a message contains a [CANDIDATE CONTEXT] section, use that information to adjust your response.
The candidate context may include corrections, preferences, additional background, or specific instructions.
Always prioritize candidate context over assumptions.

## Rules
1. NEVER fabricate competing offers or lie — only leverage what the candidate actually has
2. NEVER be aggressive or adversarial — frame everything as collaborative
3. Always include specific numbers when the candidate has provided them
4. Match the communication channel format exactly
5. Keep responses concise and natural — recruiters can tell when something is AI-generated
6. If the candidate pastes a recruiter message that contains a final/exploding offer, acknowledge urgency while still negotiating strategically`;
}
