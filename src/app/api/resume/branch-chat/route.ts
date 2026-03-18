import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamChat, AiError, type ChatMessage } from "@/lib/ai/client";
import { getModelForTask } from "@/lib/ai/models";
import { createStreamResponse, textEvent } from "@/lib/ai/streaming";
import { buildBranchChatPrompt } from "@/lib/prompts/resume-branch-chat";
import { requireAuth } from "@/lib/auth/require-auth";
import type { UserProfile } from "@/lib/utils/profile";
import { BRANCH_RATE_LIMIT } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const suggestionSchema = z.object({
  id: z.string(),
  sectionType: z.string(),
  original: z.string(),
  suggested: z.string(),
  reason: z.string(),
  status: z.enum(["pending", "accepted", "rejected"]),
});

const branchChatSchema = z.object({
  message: z.string().min(1).max(50000),
  branchId: z.string().min(1),
  conversationHistory: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
  currentResumeText: z.string().min(1),
  jobDescriptionText: z.string().min(1),
  suggestions: z.array(suggestionSchema).optional(),
  profile: z.record(z.string(), z.unknown()).nullable().optional(),
});

// ---------------------------------------------------------------------------
// Rate limiter
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= BRANCH_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    {
      data: null,
      error: { code, message },
      meta: { timestamp: new Date().toISOString() },
    },
    { status }
  );
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const rateLimitKey = session.user!.email!;

    if (!checkRateLimit(rateLimitKey)) {
      return errorResponse("RATE_LIMITED", "Too many requests.", 429);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("VALIDATION_ERROR", "Invalid JSON.", 400);
    }

    const parsed = branchChatSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid request.",
        400
      );
    }

    const {
      message,
      conversationHistory,
      currentResumeText,
      jobDescriptionText,
      suggestions,
      profile,
    } = parsed.data;

    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse("AI_ERROR", "AI service not configured.", 502);
    }

    const systemPrompt = buildBranchChatPrompt({
      jobDescriptionText,
      currentResumeText,
      profile: (profile as Partial<UserProfile>) ?? {},
      previousSuggestions: suggestions ?? [],
    });

    const tier = getModelForTask("resume-branch");
    const messages: ChatMessage[] = [
      ...(conversationHistory ?? []),
      { role: "user" as const, content: message },
    ];

    async function* generateEvents(): AsyncGenerator<string> {
      const stream = streamChat(messages, tier, systemPrompt);
      for await (const chunk of stream) {
        yield textEvent(chunk);
      }
    }

    return createStreamResponse(generateEvents());
  } catch (error: unknown) {
    if (error instanceof AiError) {
      const status = error.code === "AI_TIMEOUT" ? 504 : 502;
      return errorResponse(error.code, error.message, status);
    }
    console.error("[POST /api/resume/branch-chat]", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred.", 500);
  }
}
