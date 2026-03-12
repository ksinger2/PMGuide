import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildQuestionGenerationPrompt } from "@/lib/prompts/interview-lab";
import { getRandomBankQuestion } from "@/lib/interview/question-bank";
import type { InterviewCompany, InterviewQuestionType } from "@/lib/prompts/interview";
import type { Question } from "@/types/interview";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      company,
      questionType,
      questionMode,
      usedQuestionIds = [],
    } = body as {
      company: InterviewCompany | "any";
      questionType: InterviewQuestionType;
      questionMode: "generated" | "bank";
      usedQuestionIds?: string[];
    };

    if (!questionType) {
      return NextResponse.json(
        { error: "questionType is required" },
        { status: 400 }
      );
    }

    // Bank mode: pick from question bank, no AI call
    if (questionMode === "bank") {
      const bankQ = getRandomBankQuestion(questionType, usedQuestionIds);
      if (!bankQ) {
        return NextResponse.json(
          { error: "No questions available for this type" },
          { status: 404 }
        );
      }

      const question: Question = {
        id: bankQ.id,
        text: bankQ.text,
        type: questionType,
        company: company === "any" ? "General" : company,
        source: "bank",
      };

      return NextResponse.json({ data: question });
    }

    // AI-generated mode
    const systemPrompt = buildQuestionGenerationPrompt(company, questionType);
    const task = "interview-generate";
    const tier = getModelForTask(task);
    const overrides = TASK_OVERRIDES[task];

    const text = await callChat(
      [{ role: "user", content: "Generate a question." }],
      tier,
      systemPrompt,
      overrides
    );

    const question: Question = {
      id: `gen-${Date.now()}`,
      text: text.trim(),
      type: questionType,
      company: company === "any" ? "General" : company,
      source: "generated",
    };

    return NextResponse.json({ data: question });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
