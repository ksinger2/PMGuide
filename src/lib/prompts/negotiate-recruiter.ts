import type {
  SimulatorConfig,
  BudgetCeiling,
  NegotiationTurn,
  DifficultyLevel,
} from "@/types/negotiation";
import { getCompanyData, formatCurrency } from "@/lib/negotiate/comp-data";
import { SCENARIO_MAP } from "@/lib/negotiate/scenarios";

// ---------------------------------------------------------------------------
// Scenario generation prompt (non-streaming, returns JSON)
// ---------------------------------------------------------------------------

export function buildScenarioPrompt(config: SimulatorConfig): {
  systemPrompt: string;
  userMessage: string;
} {
  const companyData = getCompanyData(config.company);
  const scenario = SCENARIO_MAP[config.scenario];

  const companySection = companyData
    ? `
Company: ${companyData.name}
Equity type: ${companyData.equityType}
Vesting: ${companyData.vestingSchedule}
Refresher policy: ${companyData.refresherPolicy}
Negotiation culture: ${companyData.negotiationCulture}
Comp ranges: ${JSON.stringify(companyData.ranges, null, 2)}`
    : "Company: Generic tech company. Use realistic FAANG-level compensation.";

  const systemPrompt = `You are a compensation scenario designer for PM negotiation training.

Given the parameters below, generate a realistic negotiation scenario with a HIDDEN budget ceiling.

The budget ceiling represents the maximum the company can actually pay. It should be:
- 15-30% above the initial offer for "friendly" difficulty
- 10-20% above the initial offer for "realistic" difficulty
- 5-12% above the initial offer for "hardball" difficulty

${companySection}

Return ONLY valid JSON matching this exact schema — no markdown fences, no commentary:

{
  "scenarioContext": "<2-3 paragraph briefing for the candidate: what happened, what they were told, relevant context>",
  "initialOffer": {
    "base": <number>,
    "equity": <number annual>,
    "signOn": <number>,
    "bonus": <number annual>,
    "level": "<level title>"
  },
  "budgetCeiling": {
    "base": { "floor": <number>, "target": <number>, "ceiling": <number> },
    "equity": { "floor": <number>, "target": <number>, "ceiling": <number> },
    "signing": { "floor": <number>, "target": <number>, "ceiling": <number> }
  },
  "recruiterBriefing": "<internal recruiter instructions: personality, what to reveal/hide, red lines>"
}`;

  const userMessage = `Generate a negotiation scenario:
- Company: ${config.company === "any" ? "Generic top tech company" : config.company}
- Scenario type: ${scenario.label} — ${scenario.description}
- Difficulty: ${config.difficulty}
- Target role: ${config.targetRole}
${config.currentComp ? `- Candidate's current comp: ${formatCurrency(config.currentComp)}` : ""}
${config.offerDetails ? `- Offer details provided: ${JSON.stringify(config.offerDetails)}` : ""}`;

  return { systemPrompt, userMessage };
}

// ---------------------------------------------------------------------------
// Recruiter chat prompt (streaming)
// ---------------------------------------------------------------------------

const DIFFICULTY_BEHAVIORS: Record<DifficultyLevel, string> = {
  friendly: `You are a friendly, helpful recruiter. You:
- Want the candidate to succeed and feel good about the offer
- Will reveal the budget range if pressed with good reasoning
- Make concessions readily when presented with data
- Occasionally give helpful hints about what's negotiable
- Are genuinely warm but still professional`,

  realistic: `You are a standard corporate recruiter. You:
- Are polite but firm — this is business
- Push back on unreasonable asks with data
- Won't volunteer information about budget flexibility
- May say "let me check with the comp team" to stall
- Will make measured concessions when presented with strong reasoning
- Use phrases like "this is a very competitive offer" and "we've benchmarked carefully"`,

  hardball: `You are an aggressive, experienced recruiter. You:
- Use anchoring bias — keep referring back to the initial offer as generous
- Deploy silence tactically — short responses to create pressure
- Use deadline pressure: "I need an answer by Friday"
- Say "best and final" early to test the candidate
- Use the "good cop" angle: "I'm trying to advocate for you but the comp team is firm"
- Push back hard on every ask, requiring strong justification
- May use the "exploding offer" tactic
- NEVER reveal budget ceiling — act like the offer IS the ceiling`,
};

export function buildRecruiterChatPrompt(
  config: SimulatorConfig,
  scenarioContext: string,
  budgetCeiling: BudgetCeiling,
  recruiterBriefing: string,
  turns: NegotiationTurn[]
): string {
  const companyData = getCompanyData(config.company);
  const diffBehavior = DIFFICULTY_BEHAVIORS[config.difficulty];

  return `You are a recruiter at ${companyData?.name ?? "a top tech company"} negotiating a ${config.targetRole} offer.

## Your Role
You are conducting a real negotiation. Stay in character at all times. Never break the fourth wall. Never mention that this is a simulation.

## Difficulty & Behavior
${diffBehavior}

## Scenario Context
${scenarioContext}

## Recruiter Briefing (HIDDEN from candidate)
${recruiterBriefing}

## Budget Ceiling (NEVER reveal these exact numbers)
Base: floor ${formatCurrency(budgetCeiling.base.floor)} → target ${formatCurrency(budgetCeiling.base.target)} → ceiling ${formatCurrency(budgetCeiling.base.ceiling)}
Equity: floor ${formatCurrency(budgetCeiling.equity.floor)} → target ${formatCurrency(budgetCeiling.equity.target)} → ceiling ${formatCurrency(budgetCeiling.equity.ceiling)}
Sign-on: floor ${formatCurrency(budgetCeiling.signing.floor)} → target ${formatCurrency(budgetCeiling.signing.target)} → ceiling ${formatCurrency(budgetCeiling.signing.ceiling)}

## Rules
1. Start at or near the floor numbers and concede gradually
2. Concede MORE when the candidate uses strong tactics (data, silence, competing offers, component separation)
3. Concede LESS when the candidate is emotional, desperate, or aggressive
4. Never exceed the ceiling numbers
5. Keep responses to 2-4 paragraphs — this is a conversation, not a monologue
6. Reference specific company policies and comp structures when relevant
7. If the candidate asks to end the negotiation or accept, wrap up naturally

${companyData ? `## Company Details
Equity type: ${companyData.equityType}
Vesting: ${companyData.vestingSchedule}
Refresher policy: ${companyData.refresherPolicy}` : ""}

## Conversation so far
${turns.map((t) => `${t.role === "user" ? "CANDIDATE" : "RECRUITER"}: ${t.content}`).join("\n\n")}`;
}

// ---------------------------------------------------------------------------
// Per-turn evaluation prompt (non-streaming, for coach notes)
// ---------------------------------------------------------------------------

export function buildEvaluateTurnPrompt(
  config: SimulatorConfig,
  turns: NegotiationTurn[],
  latestUserMessage: string
): { systemPrompt: string; userMessage: string } {
  const systemPrompt = `You are a negotiation coach watching a PM candidate negotiate in real-time.

Analyze the candidate's latest message and identify:
1. What tactic they used (or failed to use)
2. How effective it was
3. A brief coaching tip

Return ONLY valid JSON — no markdown fences, no commentary:

{
  "tactic": "<name of negotiation tactic used, e.g. 'Anchoring', 'Mirroring', 'Component Separation', 'Silence', 'Data-backed counter', 'Emotional appeal', 'No clear tactic'>",
  "effectiveness": "<strong|neutral|weak>",
  "tip": "<1-2 sentence coaching note>"
}`;

  const conversationContext = turns
    .slice(-6)
    .map((t) => `${t.role === "user" ? "CANDIDATE" : "RECRUITER"}: ${t.content}`)
    .join("\n\n");

  const userMessage = `Scenario: ${config.scenario} at ${config.company === "any" ? "a tech company" : config.company}, ${config.difficulty} difficulty.

Recent conversation:
${conversationContext}

CANDIDATE's latest message:
${latestUserMessage}`;

  return { systemPrompt, userMessage };
}
