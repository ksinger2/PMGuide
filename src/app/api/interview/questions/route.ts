import { NextResponse } from "next/server";
import { getBankQuestionsForType } from "@/lib/interview/question-bank";
import { INTERVIEW_QUESTION_TYPES, type InterviewQuestionType } from "@/lib/prompts/interview";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as InterviewQuestionType | null;

  if (!type || !INTERVIEW_QUESTION_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Valid question type is required" },
      { status: 400 }
    );
  }

  const questions = getBankQuestionsForType(type);
  return NextResponse.json({ data: questions });
}
