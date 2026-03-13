import type {
  SimulatorConfig,
  NegotiationTurn,
  BudgetCeiling,
} from "@/types/negotiation";
import { formatCurrency } from "@/lib/negotiate/comp-data";

export function buildGradingPrompt(
  config: SimulatorConfig,
  turns: NegotiationTurn[],
  budgetCeiling: BudgetCeiling
): { systemPrompt: string; userMessage: string } {
  const systemPrompt = `You are an expert negotiation coach grading a PM candidate's negotiation performance.

You have access to the HIDDEN budget ceiling that the candidate did not know about. Your job is to evaluate how close they got to the ceiling and how well they negotiated.

## Scoring Rubric (7 signals)

1. **Anchoring** — Did they set a strong initial anchor? Did they avoid accepting the first offer?
2. **Tactic Variety** — Did they use multiple negotiation techniques (mirroring, silence, calibrated questions, data)?
3. **Component Separation** — Did they negotiate base, equity, sign-on, and bonus independently?
4. **Emotional Control** — Did they stay calm and professional? Did they avoid desperation or aggression?
5. **Information Asymmetry** — Did they extract information without revealing their hand?
6. **Outcome Maximization** — How close did they get to the budget ceiling?
7. **Professionalism** — Did they maintain the relationship while pushing for more?

Each signal gets: Very Weak (1), Weak (2), Neutral (3), Strong (4), Very Strong (5).
Overall score is the average rounded to nearest integer.

Score labels: 1=Very Weak, 2=Weak, 3=Neutral, 4=Strong, 5=Very Strong.

Return ONLY valid JSON matching this schema — no markdown fences:

{
  "overall": "<2-3 sentence verdict>",
  "score": <number 1-5>,
  "scoreLabel": "<Very Weak|Weak|Neutral|Strong|Very Strong>",
  "projectedOutcome": {
    "originalOffer": <total original TC>,
    "finalOffer": <total final TC based on what recruiter agreed to>,
    "deltaDollars": <difference>,
    "deltaPercent": <percentage increase>,
    "budgetCeiling": {
      "base": { "floor": <n>, "target": <n>, "ceiling": <n> },
      "equity": { "floor": <n>, "target": <n>, "ceiling": <n> },
      "signing": { "floor": <n>, "target": <n>, "ceiling": <n> }
    }
  },
  "rubric": [
    { "signal": "<signal name>", "score": "<Very Weak|Weak|Neutral|Strong|Very Strong>", "note": "<1-line explanation>" }
  ],
  "tacticsUsed": [
    { "tactic": "<tactic name>", "effectiveness": "<strong|neutral|weak>", "example": "<quote from their message>" }
  ],
  "mistakes": [
    { "mistake": "<what they did wrong>", "impact": "<estimated cost in dollars or opportunity>", "whatInstead": "<what they should have done>" }
  ],
  "emailTemplate": "<optional: if relevant, a follow-up email template they could use>",
  "oneChange": "<the single most impactful thing they should do differently next time>"
}

Include ALL 7 rubric signals.`;

  const transcript = turns
    .map((t) => `${t.role === "user" ? "CANDIDATE" : "RECRUITER"}: ${t.content}`)
    .join("\n\n");

  const userMessage = `## Negotiation Details
Company: ${config.company === "any" ? "Generic tech company" : config.company}
Scenario: ${config.scenario}
Difficulty: ${config.difficulty}
Target role: ${config.targetRole}

## Budget Ceiling (hidden from candidate)
Base: ${formatCurrency(budgetCeiling.base.floor)} → ${formatCurrency(budgetCeiling.base.ceiling)}
Equity: ${formatCurrency(budgetCeiling.equity.floor)} → ${formatCurrency(budgetCeiling.equity.ceiling)}
Sign-on: ${formatCurrency(budgetCeiling.signing.floor)} → ${formatCurrency(budgetCeiling.signing.ceiling)}

## Full Transcript
${transcript}

Grade this negotiation.`;

  return { systemPrompt, userMessage };
}
