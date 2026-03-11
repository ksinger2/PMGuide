import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamChat, AiError } from "@/lib/ai/client";
import { getModelForTask } from "@/lib/ai/models";
import { createStreamResponse, textEvent } from "@/lib/ai/streaming";
import { buildResumeForkPrompt } from "@/lib/prompts/resume-fork";
import type { UserProfile } from "@/lib/utils/profile";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const forkRequestSchema = z.object({
  generatedResumeId: z.string().min(1),
  baseContent: z.object({
    sections: z.array(z.object({
      type: z.string(),
      title: z.string(),
      content: z.string(),
    })),
    fullText: z.string(),
  }),
  jobDescription: z.string().min(1).max(10000),
  profile: z.record(z.string(), z.unknown()).optional(),
  userNotes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// In-memory rate limiter (MVP) — 5 req/min
// ---------------------------------------------------------------------------

const FORK_RATE_LIMIT = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= FORK_RATE_LIMIT) {
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

    const parsed = forkRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid request.",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const { baseContent, jobDescription, profile, userNotes } = parsed.data;

    // Check API key before streaming
    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse(
        "AI_ERROR",
        "AI service is not configured. Please set ANTHROPIC_API_KEY.",
        502
      );
    }

    // Build system prompt — uses the quality tier (Sonnet 4)
    const systemPrompt = buildResumeForkPrompt(
      baseContent.fullText,
      (profile as Partial<UserProfile>) ?? {},
      jobDescription
    );

    // Model tier: resume-fork always maps to "quality" (Sonnet 4)
    const tier = getModelForTask("resume-fork");

    // Build messages — single user message asking for tailored resume
    const messages = [
      {
        role: "user" as const,
        content:
          "Please tailor my resume to the provided job description. " +
          (userNotes ? `Additional notes: ${userNotes}\n\n` : "") +
          "Return your tailored resume as structured JSON matching this schema:\n\n" +
          "{\n" +
          '  "targetCompany": string (extracted from job description),\n' +
          '  "targetRole": string (extracted from job description),\n' +
          '  "content": {\n' +
          '    "sections": [{ "type": string, "title": string, "content": string }],\n' +
          '    "fullText": string (the complete tailored resume as plain text)\n' +
          "  },\n" +
          '  "tailoringNotes": [{\n' +
          '    "sectionType": string,\n' +
          '    "whatChanged": string,\n' +
          '    "why": string\n' +
          "  }],\n" +
          '  "keywordAlignment": {\n' +
          '    "matched": string[] (keywords from JD already in resume),\n' +
          '    "missing": string[] (keywords from JD not addressed),\n' +
          '    "added": string[] (keywords newly woven into tailored resume)\n' +
          "  }\n" +
          "}\n\n" +
          "Return ONLY valid JSON, no markdown fences, no extra text.",
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

    console.error("[POST /api/resume/fork]", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}
