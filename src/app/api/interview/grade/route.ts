import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildGradingPrompt } from "@/lib/prompts/interview-lab";
import { requireAuth } from "@/lib/auth/require-auth";
import type { InterviewCompany, InterviewQuestionType } from "@/lib/prompts/interview";
import type { Feedback } from "@/types/interview";

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function validateFeedback(obj: unknown): obj is Feedback {
  if (!obj || typeof obj !== "object") return false;
  const f = obj as Record<string, unknown>;
  return (
    typeof f.overall === "string" &&
    typeof f.score === "number" &&
    typeof f.scoreLabel === "string" &&
    Array.isArray(f.rubric) &&
    Array.isArray(f.whatWorked) &&
    Array.isArray(f.toImprove) &&
    typeof f.hiringSignal === "string" &&
    typeof f.oneChange === "string"
  );
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { company, questionType, question, answer, userProfile } = body as {
      company: InterviewCompany | "any";
      questionType: InterviewQuestionType;
      question: string;
      answer: string;
      userProfile?: Record<string, unknown>;
    };

    if (!question || !answer || !questionType) {
      return NextResponse.json(
        { error: "question, answer, and questionType are required" },
        { status: 400 }
      );
    }

    const { systemPrompt, userMessage } = buildGradingPrompt(
      company,
      questionType,
      question,
      answer,
      userProfile
    );

    const task = "interview-grade";
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
      error instanceof Error ? error.message : "Failed to grade answer";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
