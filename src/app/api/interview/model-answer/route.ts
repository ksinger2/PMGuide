import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildModelAnswerPrompt } from "@/lib/prompts/interview-lab";
import { requireAuth } from "@/lib/auth/require-auth";
import type { InterviewCompany, InterviewQuestionType } from "@/lib/prompts/interview";
import type { ModelAnswer, GenericModelAnswer, ProductDesignModelAnswer } from "@/types/interview";
import type { UserProfile } from "@/lib/utils/profile";

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

/** Validate generic model answer (non-product-design) */
function validateGenericModelAnswer(obj: unknown): obj is GenericModelAnswer {
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

/** Validate 13-step product design model answer */
function validateProductDesignModelAnswer(obj: unknown): obj is ProductDesignModelAnswer {
  if (!obj || typeof obj !== "object") return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.landscape === "object" && m.landscape !== null &&
    typeof m.mission === "string" &&
    typeof m.ecosystem === "object" && m.ecosystem !== null &&
    typeof m.stakeholderPrioritization === "object" && m.stakeholderPrioritization !== null &&
    Array.isArray(m.segmentation) &&
    typeof m.segmentPrioritization === "object" && m.segmentPrioritization !== null &&
    typeof m.painPoints === "object" && m.painPoints !== null &&
    typeof m.painPointPrioritization === "object" && m.painPointPrioritization !== null &&
    Array.isArray(m.solutions) &&
    typeof m.solutionPrioritization === "object" && m.solutionPrioritization !== null &&
    Array.isArray(m.risks) &&
    typeof m.mvpAndMetrics === "object" && m.mvpAndMetrics !== null &&
    typeof m.summary === "object" && m.summary !== null
  );
}

/** Validate model answer based on question type */
function validateModelAnswer(obj: unknown, questionType: InterviewQuestionType): obj is ModelAnswer {
  if (questionType === "product-design") {
    return validateProductDesignModelAnswer(obj);
  }
  return validateGenericModelAnswer(obj);
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

    if (!validateModelAnswer(parsed, questionType)) {
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
