import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamChat, AiError } from "@/lib/ai/client";
import { getModelForTask } from "@/lib/ai/models";
import { createStreamResponse, textEvent } from "@/lib/ai/streaming";
import { buildResumeGeneratePrompt } from "@/lib/prompts/resume-generate";
import { requireAuth } from "@/lib/auth/require-auth";
import type { UserProfile } from "@/lib/utils/profile";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const generateRequestSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  extractedText: z.string().min(1, "extractedText is required"),
  sections: z
    .array(
      z.object({
        type: z.enum([
          "contact",
          "summary",
          "experience",
          "education",
          "skills",
          "other",
        ]),
        title: z.string(),
        content: z.string(),
        startLine: z.number(),
        endLine: z.number(),
      })
    )
    .optional(),
  profile: z.record(z.string(), z.unknown()).optional(),
  critiqueFindings: z
    .array(
      z.object({
        id: z.string(),
        severity: z.enum(["high", "medium", "low"]),
        category: z.string(),
        title: z.string(),
        description: z.string(),
        originalText: z.string().optional(),
        suggestedText: z.string().optional(),
        sectionRef: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  userFeedback: z.string().optional(),
});

// ---------------------------------------------------------------------------
// In-memory rate limiter (MVP) — 5 req/min
// ---------------------------------------------------------------------------

const GENERATE_RATE_LIMIT = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= GENERATE_RATE_LIMIT) {
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

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    // Rate limiting
    const rateLimitKey = session.user!.email!;

    if (!checkRateLimit(rateLimitKey)) {
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

    const parsed = generateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid request.",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const { extractedText, profile, critiqueFindings, userFeedback } =
      parsed.data;

    // Check API key before streaming
    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse(
        "AI_ERROR",
        "AI service is not configured. Please set ANTHROPIC_API_KEY.",
        502
      );
    }

    // Build system prompt — uses the quality tier (Sonnet 4)
    const systemPrompt = buildResumeGeneratePrompt(
      extractedText,
      (profile as Partial<UserProfile>) ?? {},
      critiqueFindings
    );

    // Model tier: resume-generate always maps to "quality" (Sonnet 4)
    const tier = getModelForTask("resume-generate");

    // Build messages — single user message asking for improved resume
    const userMessage =
      "Please generate an improved version of my resume addressing the critique findings." +
      (userFeedback
        ? `\n\nAdditional feedback from me:\n${userFeedback}`
        : "") +
      "\n\nReturn your output as structured JSON matching this schema:\n\n" +
      "{\n" +
      '  "content": {\n' +
      '    "sections": [{ "type": "contact|summary|experience|education|skills|other", "title": string, "content": string }],\n' +
      '    "fullText": string\n' +
      "  },\n" +
      '  "changes": [{\n' +
      '    "sectionType": string,\n' +
      '    "original": string,\n' +
      '    "improved": string,\n' +
      '    "reason": string\n' +
      "  }]\n" +
      "}\n\n" +
      "Return ONLY valid JSON, no markdown fences, no extra text.";

    const messages = [
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    // Stream the response
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

    console.error("[POST /api/resume/generate]", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}
