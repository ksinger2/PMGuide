import { NextRequest } from "next/server";
import { streamChat, AiError } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { createStreamResponse, textEvent } from "@/lib/ai/streaming";
import { buildRecruiterChatPrompt } from "@/lib/prompts/negotiate-recruiter";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SimulatorConfig, NegotiationTurn, BudgetCeiling } from "@/types/negotiation";

function errorJson(code: string, message: string, status: number) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const {
      config,
      scenarioContext,
      budgetCeiling,
      recruiterBriefing,
      turns,
      userMessage,
    } = body as {
      config: SimulatorConfig;
      scenarioContext: string;
      budgetCeiling: BudgetCeiling;
      recruiterBriefing: string;
      turns: NegotiationTurn[];
      userMessage: string;
    };

    if (!config || !userMessage) {
      return errorJson("VALIDATION_ERROR", "config and userMessage are required", 400);
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return errorJson("AI_ERROR", "AI service is not configured.", 502);
    }

    const systemPrompt = buildRecruiterChatPrompt(
      config,
      scenarioContext,
      budgetCeiling,
      recruiterBriefing || "",
      turns || []
    );

    const task = "negotiate-chat";
    const tier = getModelForTask(task);
    const overrides = TASK_OVERRIDES[task];

    const messages = [{ role: "user" as const, content: userMessage }];

    async function* generateEvents(): AsyncGenerator<string> {
      const stream = streamChat(messages, tier, systemPrompt, overrides);
      for await (const chunk of stream) {
        yield textEvent(chunk);
      }
    }

    return createStreamResponse(generateEvents());
  } catch (error: unknown) {
    if (error instanceof AiError) {
      const status = error.code === "AI_TIMEOUT" ? 504 : 502;
      return errorJson(error.code, error.message, status);
    }
    const message = error instanceof Error ? error.message : "Recruiter chat failed";
    return errorJson("INTERNAL_ERROR", message, 500);
  }
}
