import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamChat, AiError, type ChatMessage } from "@/lib/ai/client";
import { getModelForTask } from "@/lib/ai/models";
import {
  createStreamResponse,
  textEvent,
  profileUpdateEvent,
} from "@/lib/ai/streaming";
import { buildAboutMeSystemPrompt } from "@/lib/prompts/about-me";
import {
  buildInterviewSystemPrompt,
  type InterviewCompany,
  type InterviewQuestionType,
  type FeedbackMode,
} from "@/lib/prompts/interview";
import type { UserProfile } from "@/lib/utils/profile";
import { MAX_MESSAGE_LENGTH, CHAT_RATE_LIMIT } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required").max(MAX_MESSAGE_LENGTH),
  section: z.enum(["about-me", "resume", "interview"]),
  interviewCompany: z.string().optional(),
  interviewQuestionType: z.string().optional(),
  interviewFeedbackMode: z.enum(["after-each", "end-of-session"]).optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  profileSnapshot: z.record(z.string(), z.unknown()).nullable().optional(),
  questionsAsked: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// In-memory rate limiter (MVP)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= CHAT_RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    {
      data: null,
      error: { code, message, ...(details !== undefined ? { details } : {}) },
      meta: { timestamp: new Date().toISOString() },
    },
    { status }
  );
}

const PROFILE_UPDATE_RE =
  /<profile_update>\s*([\s\S]*?)\s*<\/profile_update>/;

function extractProfileUpdates(
  fullText: string
): Record<string, unknown> | null {
  const match = fullText.match(PROFILE_UPDATE_RE);
  if (!match) return null;
  try {
    // Strip markdown code fences if the model wrapped the JSON in them
    let jsonStr = match[1].trim();
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function stripProfileUpdateTag(text: string): string {
  return text
    .replace(/<profile_update>[\s\S]*?<\/profile_update>/g, "")
    .trimEnd();
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return errorResponse(
        "RATE_LIMITED",
        "Too many requests. Please wait a moment and try again.",
        429
      );
    }

    // Parse & validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid JSON in request body.",
        400
      );
    }

    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[POST /api/chat] Validation failed:", JSON.stringify(parsed.error.flatten(), null, 2));
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid request.",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const {
      message,
      section,
      conversationHistory,
      profileSnapshot,
      questionsAsked,
      interviewCompany,
      interviewQuestionType,
      interviewFeedbackMode,
    } = parsed.data;

    // Build messages array
    const messages: ChatMessage[] = [
      ...(conversationHistory ?? []),
      { role: "user" as const, content: message },
    ];

    // Build system prompt
    let systemPrompt: string;
    if (section === "about-me") {
      systemPrompt = buildAboutMeSystemPrompt(
        (profileSnapshot as Partial<UserProfile>) ?? {},
        questionsAsked ?? []
      );
    } else if (section === "interview") {
      systemPrompt = buildInterviewSystemPrompt({
        company: (interviewCompany as InterviewCompany) ?? "general",
        questionType:
          (interviewQuestionType as InterviewQuestionType) ?? "behavioral",
        userProfile: (profileSnapshot as Partial<UserProfile>) ?? {},
        feedbackMode: (interviewFeedbackMode as FeedbackMode) ?? "after-each",
      });
    } else {
      systemPrompt =
        "You are PMGuide, an AI career coach helping a product manager improve their resume. Be specific, actionable, and encouraging.";
    }

    // Check API key before streaming (avoids silent empty stream)
    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse(
        "AI_ERROR",
        "AI service is not configured. Please set ANTHROPIC_API_KEY.",
        502
      );
    }

    // Determine model tier
    const tier = getModelForTask(
      section === "resume"
        ? "resume-critique"
        : section === "interview"
          ? "interview"
          : "about-me"
    );

    // Stream the response with a rolling buffer to catch <profile_update> tags
    let fullText = "";
    const TAG = "<profile_update>";
    let buffer = "";
    let tagDetected = false;

    async function* generateEvents(): AsyncGenerator<string> {
      const stream = streamChat(messages, tier, systemPrompt);

      for await (const chunk of stream) {
        fullText += chunk;

        if (tagDetected) continue; // Already found tag, just collect remaining

        buffer += chunk;

        // Check if we have a complete non-tag section to flush
        const tagIdx = buffer.indexOf(TAG);
        if (tagIdx !== -1) {
          // Tag found — emit everything before it, then stop streaming text
          tagDetected = true;
          const before = buffer.substring(0, tagIdx).trimEnd();
          if (before) yield textEvent(before);
          continue;
        }

        // Check for partial tag match at the end of buffer (e.g. "<pro")
        let safeEnd = buffer.length;
        for (let i = 1; i < TAG.length && i <= buffer.length; i++) {
          if (TAG.startsWith(buffer.substring(buffer.length - i))) {
            safeEnd = buffer.length - i;
            break;
          }
        }

        // Flush the safe portion
        if (safeEnd > 0) {
          yield textEvent(buffer.substring(0, safeEnd));
          buffer = buffer.substring(safeEnd);
        }
      }

      // Flush any remaining buffer (no tag was found)
      if (!tagDetected && buffer) {
        yield textEvent(buffer);
      }

      // Extract and send profile updates
      const updates = extractProfileUpdates(fullText);
      if (updates && Object.keys(updates).length > 0) {
        yield profileUpdateEvent(updates);
      }
    }

    return createStreamResponse(generateEvents());
  } catch (error: unknown) {
    if (error instanceof AiError) {
      const status = error.code === "AI_TIMEOUT" ? 504 : 502;
      return errorResponse(error.code, error.message, status);
    }

    console.error("[POST /api/chat]", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}
