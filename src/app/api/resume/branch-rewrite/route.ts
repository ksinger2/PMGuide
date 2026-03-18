import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamChat, AiError } from "@/lib/ai/client";
import { getModelForTask } from "@/lib/ai/models";
import { createStreamResponse, textEvent } from "@/lib/ai/streaming";
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
});

const rewriteSchema = z.object({
  currentResumeText: z.string().min(1),
  acceptedSuggestions: z.array(suggestionSchema).min(1),
  rejectedSuggestions: z.array(suggestionSchema).optional(),
  jobDescriptionText: z.string().min(1),
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

    const parsed = rewriteSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid request.", 400);
    }

    const {
      currentResumeText,
      acceptedSuggestions,
      rejectedSuggestions,
      jobDescriptionText,
      profile,
    } = parsed.data;

    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse("AI_ERROR", "AI service not configured.", 502);
    }

    const targetRole = (profile as Partial<UserProfile>)?.goalRole ?? "PM";

    // Build a clear prompt listing exactly what to change
    const acceptedList = acceptedSuggestions
      .map(
        (s, i) =>
          `${i + 1}. In "${s.sectionType}" section, change:\n   FROM: "${s.original}"\n   TO: "${s.suggested}"\n   REASON: ${s.reason}`
      )
      .join("\n\n");

    const rejectedList =
      rejectedSuggestions && rejectedSuggestions.length > 0
        ? "\n\n## Rejected Changes (DO NOT apply these)\n" +
          rejectedSuggestions
            .map((s) => `- Keep original: "${s.original}" (user prefers this)`)
            .join("\n")
        : "";

    const systemPrompt = `You are PMGuide, an expert PM resume writer. Apply the accepted changes below to produce a complete updated resume.

## Target Role: ${targetRole}

## Job Description
${jobDescriptionText}

## Current Resume
${currentResumeText}

## Accepted Changes (APPLY these)
${acceptedList}
${rejectedList}

## Instructions

1. Apply ALL accepted changes to the resume
2. DO NOT modify any other content — only apply the specific changes listed above
3. Maintain the exact same structure and sections
4. Return ONLY valid JSON matching this schema (no markdown fences, no extra text):

{
  "content": {
    "sections": [
      { "type": "contact|summary|experience|education|skills", "title": "Section Title", "content": "Full section content" }
    ],
    "fullText": "The complete resume as plain text"
  }
}`;

    const tier = getModelForTask("resume-branch");
    const messages = [
      {
        role: "user" as const,
        content:
          "Apply the accepted changes to my resume and return the updated version as JSON.",
      },
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
    console.error("[POST /api/resume/branch-rewrite]", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred.", 500);
  }
}
