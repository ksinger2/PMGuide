import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildGradingPrompt } from "@/lib/prompts/negotiate-grade";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SimulatorConfig, NegotiationTurn, BudgetCeiling, NegotiationFeedback } from "@/types/negotiation";

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function validateFeedback(obj: unknown): obj is NegotiationFeedback {
  if (!obj || typeof obj !== "object") return false;
  const f = obj as Record<string, unknown>;
  return (
    typeof f.overall === "string" &&
    typeof f.score === "number" &&
    typeof f.scoreLabel === "string" &&
    typeof f.projectedOutcome === "object" &&
    f.projectedOutcome !== null &&
    Array.isArray(f.rubric) &&
    Array.isArray(f.tacticsUsed) &&
    Array.isArray(f.mistakes) &&
    typeof f.oneChange === "string"
  );
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { config, turns, budgetCeiling } = body as {
      config: SimulatorConfig;
      turns: NegotiationTurn[];
      budgetCeiling: BudgetCeiling;
    };

    if (!config || !turns || !budgetCeiling) {
      return NextResponse.json(
        { error: "config, turns, and budgetCeiling are required" },
        { status: 400 }
      );
    }

    const { systemPrompt, userMessage } = buildGradingPrompt(config, turns, budgetCeiling);

    const task = "negotiate-grade";
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
        { error: "AI returned invalid JSON for grading", raw: cleaned },
        { status: 502 }
      );
    }

    if (!validateFeedback(parsed)) {
      return NextResponse.json(
        { error: "AI response did not match expected feedback schema", raw: cleaned },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to grade negotiation";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
