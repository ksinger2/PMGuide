import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildEvaluateTurnPrompt } from "@/lib/prompts/negotiate-recruiter";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SimulatorConfig, NegotiationTurn } from "@/types/negotiation";

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

interface EvalResult {
  tactic: string;
  effectiveness: "strong" | "neutral" | "weak";
  tip: string;
}

function validateEval(obj: unknown): obj is EvalResult {
  if (!obj || typeof obj !== "object") return false;
  const e = obj as Record<string, unknown>;
  return (
    typeof e.tactic === "string" &&
    typeof e.effectiveness === "string" &&
    typeof e.tip === "string"
  );
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { config, turns, latestUserMessage } = body as {
      config: SimulatorConfig;
      turns: NegotiationTurn[];
      latestUserMessage: string;
    };

    if (!config || !latestUserMessage) {
      return NextResponse.json(
        { error: "config and latestUserMessage are required" },
        { status: 400 }
      );
    }

    const { systemPrompt, userMessage } = buildEvaluateTurnPrompt(
      config,
      turns || [],
      latestUserMessage
    );

    const task = "negotiate-evaluate";
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
        { error: "AI returned invalid JSON for evaluation", raw: cleaned },
        { status: 502 }
      );
    }

    if (!validateEval(parsed)) {
      return NextResponse.json(
        { error: "AI response did not match expected evaluation schema" },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to evaluate turn";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
