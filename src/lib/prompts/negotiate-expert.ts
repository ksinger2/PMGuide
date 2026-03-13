import type { NegotiationCompany, ScenarioType, DifficultyLevel } from "@/types/negotiation";
import { getCompanyData } from "@/lib/negotiate/comp-data";
import { SCENARIO_MAP } from "@/lib/negotiate/scenarios";

export function buildExpertDemoPrompt(
  company: NegotiationCompany,
  scenario: ScenarioType,
  difficulty: DifficultyLevel
): { systemPrompt: string; userMessage: string } {
  const companyData = getCompanyData(company);
  const scenarioInfo = SCENARIO_MAP[scenario];

  const companySection = companyData
    ? `Company: ${companyData.name}
Equity type: ${companyData.equityType}
Vesting: ${companyData.vestingSchedule}
Negotiation culture: ${companyData.negotiationCulture}
Comp ranges: ${JSON.stringify(companyData.ranges, null, 2)}`
    : "Company: Generic top tech company";

  const systemPrompt = `You are an expert negotiation coach writing an annotated model negotiation.

Your job is to show a PM candidate EXACTLY how an expert would handle this negotiation scenario. Every turn should be annotated with the tactic used and WHY it works.

Use real negotiation frameworks:
- Chris Voss: Mirroring, Labeling, Calibrated Questions, Power of No
- Ackerman: 65% → 85% → 95% tapering anchors
- BATNA: Creating leverage without lying
- Component Separation: Negotiating each comp element independently

${companySection}

Return ONLY valid JSON matching this schema — no markdown fences:

{
  "scenario": "<brief scenario description>",
  "company": "<company name>",
  "difficulty": "<difficulty level>",
  "transcript": [
    {
      "role": "<candidate|recruiter>",
      "content": "<what they say>",
      "tactic": "<tactic name, only for candidate turns>",
      "why": "<why this tactic works here, only for candidate turns>"
    }
  ],
  "summary": "<2-3 sentence summary of what happened>",
  "totalCompGain": "<dollar amount gained through negotiation>",
  "keyTakeaways": ["<takeaway 1>", "<takeaway 2>", "<takeaway 3>"]
}

Include 8-14 turns total. Make the conversation realistic and educational.`;

  const userMessage = `Generate an annotated expert negotiation:
- Scenario: ${scenarioInfo.label} — ${scenarioInfo.description}
- Company: ${company === "any" ? "Generic top tech company" : company}
- Difficulty: ${difficulty}
- Role: Senior/Staff PM`;

  return { systemPrompt, userMessage };
}
