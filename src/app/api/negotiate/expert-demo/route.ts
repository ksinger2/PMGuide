import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildExpertDemoPrompt } from "@/lib/prompts/negotiate-expert";
import { requireAuth } from "@/lib/auth/require-auth";
import type { NegotiationCompany, ScenarioType, DifficultyLevel, ExpertNegotiation } from "@/types/negotiation";

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function validateExpert(obj: unknown): obj is ExpertNegotiation {
  if (!obj || typeof obj !== "object") return false;
  const e = obj as Record<string, unknown>;
  return (
    typeof e.scenario === "string" &&
    typeof e.company === "string" &&
    Array.isArray(e.transcript) &&
    e.transcript.length > 0 &&
    typeof e.summary === "string" &&
    Array.isArray(e.keyTakeaways)
  );
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { company, scenario, difficulty } = body as {
      company: NegotiationCompany;
      scenario: ScenarioType;
      difficulty: DifficultyLevel;
    };

    if (!company || !scenario || !difficulty) {
      return NextResponse.json(
        { error: "company, scenario, and difficulty are required" },
        { status: 400 }
      );
    }

    const { systemPrompt, userMessage } = buildExpertDemoPrompt(company, scenario, difficulty);

    const task = "negotiate-expert";
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
        { error: "AI returned invalid JSON for expert demo", raw: cleaned },
        { status: 502 }
      );
    }

    if (!validateExpert(parsed)) {
      return NextResponse.json(
        { error: "AI response did not match expected expert demo schema" },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate expert demo";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
