import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildModelAnswerPrompt } from "@/lib/prompts/interview-lab";
import { requireAuth } from "@/lib/auth/require-auth";
import type { InterviewCompany, InterviewQuestionType } from "@/lib/prompts/interview";
import type { ModelAnswer } from "@/types/interview";
import type { UserProfile } from "@/lib/utils/profile";

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function validateModelAnswer(obj: unknown): obj is ModelAnswer {
  if (!obj || typeof obj !== "object") return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.tagline === "string" &&
    Array.isArray(m.steps) &&
    m.steps.length > 0 &&
    Array.isArray(m.keyInsights) &&
    Array.isArray(m.watchOut)
  );
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { company, questionType, question, userProfile } = body as {
      company: InterviewCompany | "any";
      questionType: InterviewQuestionType;
      question: string;
      userProfile?: Partial<UserProfile>;
    };

    if (!question || !questionType) {
      return NextResponse.json(
        { error: "question and questionType are required" },
        { status: 400 }
      );
    }

    const { systemPrompt, userMessage } = buildModelAnswerPrompt(
      company,
      questionType,
      question,
      userProfile
    );

    const task = "interview-model";
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
        { error: "AI returned invalid JSON for model answer", raw: cleaned },
        { status: 502 }
      );
    }

    if (!validateModelAnswer(parsed)) {
      return NextResponse.json(
        { error: "AI response did not match expected model answer schema", raw: cleaned },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate model answer";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
