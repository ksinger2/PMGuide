import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamChat, AiError } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { createStreamResponse, textEvent } from "@/lib/ai/streaming";
import { buildResumeCritiquePrompt } from "@/lib/prompts/resume-critique";
import type { UserProfile } from "@/lib/utils/profile";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const resumeSectionSchema = z.object({
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
});

const critiqueRequestSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  extractedText: z.string().min(1, "extractedText is required"),
  sections: z.array(resumeSectionSchema).optional(),
  profile: z.record(z.string(), z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// In-memory rate limiter (MVP) — 10 req/min
// ---------------------------------------------------------------------------

const CRITIQUE_RATE_LIMIT = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= CRITIQUE_RATE_LIMIT) {
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

    const parsed = critiqueRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid request.",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const { extractedText, profile } = parsed.data;

    // Check API key before streaming
    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse(
        "AI_ERROR",
        "AI service is not configured. Please set ANTHROPIC_API_KEY.",
        502
      );
    }

    // Build system prompt — uses the quality tier (Sonnet 4)
    const systemPrompt = buildResumeCritiquePrompt(
      extractedText,
      (profile as Partial<UserProfile>) ?? {}
    );

    // Model tier: resume-critique always maps to "quality" (Sonnet 4)
    const tier = getModelForTask("resume-critique");

    // Build messages — single user message asking for critique
    const messages = [
      {
        role: "user" as const,
        content:
          "Please analyze my resume and provide a detailed critique. Return your analysis as structured JSON matching this schema:\n\n" +
          "{\n" +
          '  "summary": string (2-3 sentence overview),\n' +
          '  "findings": [{\n' +
          '    "id": string,\n' +
          '    "severity": "high" | "medium" | "low",\n' +
          '    "category": "impact_metrics" | "pm_language" | "relevance" | "clarity" | "structure" | "completeness",\n' +
          '    "title": string,\n' +
          '    "description": string,\n' +
          '    "originalText"?: string,\n' +
          '    "suggestedText"?: string,\n' +
          '    "sectionRef"?: string\n' +
          "  }],\n" +
          '  "strengths": string[] (3-5 items),\n' +
          '  "profileSuggestions": [{ "field": string, "value": string, "suggestion": string }]\n' +
          "}\n\n" +
          "Do NOT include overallScore or categoryScores — they are computed from findings.\n" +
          "Severity levels: high = resume will be rejected, medium = weakens resume, low = nice to have.\n" +
          "Return ONLY valid JSON, no markdown fences, no extra text.",
      },
    ];

    // Stream the response (critique uses low temperature for consistent scoring)
    const overrides = TASK_OVERRIDES["resume-critique"];

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
      return errorResponse(error.code, error.message, status);
    }

    console.error("[POST /api/resume/critique]", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}
