import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildScenarioPrompt } from "@/lib/prompts/negotiate-recruiter";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SimulatorConfig, BudgetCeiling } from "@/types/negotiation";

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

interface ScenarioResponse {
  scenarioContext: string;
  initialOffer: {
    base: number;
    equity: number;
    signOn: number;
    bonus: number;
    level: string;
  };
  budgetCeiling: BudgetCeiling;
  recruiterBriefing: string;
}

function validateScenario(obj: unknown): obj is ScenarioResponse {
  if (!obj || typeof obj !== "object") return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.scenarioContext === "string" &&
    typeof s.initialOffer === "object" &&
    s.initialOffer !== null &&
    typeof s.budgetCeiling === "object" &&
    s.budgetCeiling !== null &&
    typeof s.recruiterBriefing === "string"
  );
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const config = body as SimulatorConfig;

    if (!config.company || !config.scenario || !config.difficulty || !config.targetRole) {
      return NextResponse.json(
        { error: "company, scenario, difficulty, and targetRole are required" },
        { status: 400 }
      );
    }

    const { systemPrompt, userMessage } = buildScenarioPrompt(config);

    const task = "negotiate-scenario";
    const tier = getModelForTask(task);
    const overrides = TASK_OVERRIDES[task];

    const raw = await callChat(
      [{ role: "user", content: userMessage }],
      tier,
      systemPrompt,
      overrides
    );

    const cleaned = stripFences(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON for scenario", raw: cleaned },
        { status: 502 }
      );
    }

    if (!validateScenario(parsed)) {
      return NextResponse.json(
        { error: "AI response did not match expected scenario schema", raw: cleaned },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate scenario";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
