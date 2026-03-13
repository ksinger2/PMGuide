import type { ScenarioType, NegotiationCompany } from "@/types/negotiation";

export interface ScenarioInfo {
  type: ScenarioType;
  label: string;
  description: string;
  icon: string;
  difficulty: string;
}

export const SCENARIOS: ScenarioInfo[] = [
  {
    type: "initial-offer",
    label: "Initial Offer",
    description: "You just received an offer. Counter strategically to maximize total comp.",
    icon: "📩",
    difficulty: "Standard",
  },
  {
    type: "counter-offer",
    label: "Counter Offer",
    description: "You've already countered once. The recruiter pushed back. Navigate round two.",
    icon: "🔄",
    difficulty: "Standard",
  },
  {
    type: "no-leverage",
    label: "No Leverage",
    description: "No competing offers. Use framing, timing, and research to negotiate up.",
    icon: "🪨",
    difficulty: "Hard",
  },
  {
    type: "equity-focus",
    label: "Equity Focus",
    description: "Base is at band maximum. Negotiate equity, refreshers, and vesting acceleration.",
    icon: "📈",
    difficulty: "Advanced",
  },
  {
    type: "exploding-offer",
    label: "Exploding Offer",
    description: "They gave you 48 hours. Buy time without losing the offer.",
    icon: "💣",
    difficulty: "Hard",
  },
  {
    type: "title-negotiation",
    label: "Title Negotiation",
    description: "The comp is fair but the level is wrong. Fight for the right title.",
    icon: "🏷️",
    difficulty: "Advanced",
  },
  {
    type: "retention",
    label: "Retention Counter",
    description: "Your current employer is trying to retain you. Maximize the counter-offer.",
    icon: "🔒",
    difficulty: "Standard",
  },
];

export const SCENARIO_MAP = Object.fromEntries(
  SCENARIOS.map((s) => [s.type, s])
) as Record<ScenarioType, ScenarioInfo>;

export const COMPANIES: Array<{ value: NegotiationCompany; label: string }> = [
  { value: "google", label: "Google" },
  { value: "meta", label: "Meta" },
  { value: "amazon", label: "Amazon" },
  { value: "netflix", label: "Netflix" },
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "roblox", label: "Roblox" },
  { value: "apple", label: "Apple" },
  { value: "microsoft", label: "Microsoft" },
  { value: "any", label: "Any Company" },
];

export const TARGET_ROLES = [
  "Senior PM (L5/L6)",
  "Staff PM (L6/IC6)",
  "Principal PM (L7)",
  "Director of Product",
  "Group PM",
];

export const DIFFICULTY_OPTIONS: Array<{
  value: "friendly" | "realistic" | "hardball";
  label: string;
  description: string;
}> = [
  {
    value: "friendly",
    label: "Friendly",
    description: "Recruiter is helpful and reveals range if pressed",
  },
  {
    value: "realistic",
    label: "Realistic",
    description: "Standard pushback, won't volunteer info",
  },
  {
    value: "hardball",
    label: "Hardball",
    description: "Aggressive anchoring, deadline pressure, silence tactics",
  },
];
