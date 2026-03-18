import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callChatWithTool, AiError, type ToolDefinition } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import { buildResumeCritiquePrompt } from "@/lib/prompts/resume-critique";
import { requireAuth } from "@/lib/auth/require-auth";
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
// Tool definition for structured critique output
// ---------------------------------------------------------------------------

const RESUME_CRITIQUE_TOOL: ToolDefinition = {
  name: "resume_critique",
  description: "Submit structured resume critique findings",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "2-3 sentence overview" },
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            severity: { type: "string", enum: ["high", "medium", "low"] },
            category: {
              type: "string",
              enum: [
                "impact_metrics",
                "pm_language",
                "relevance",
                "clarity",
                "structure",
                "completeness",
              ],
            },
            title: { type: "string" },
            description: { type: "string" },
            originalText: { type: "string" },
            suggestedText: { type: "string" },
            sectionRef: { type: "string" },
          },
          required: ["id", "severity", "category", "title", "description"],
        },
      },
      strengths: { type: "array", items: { type: "string" } },
      profileSuggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            suggestion: { type: "string" },
          },
          required: ["field", "suggestion"],
        },
      },
    },
    required: ["summary", "findings", "strengths"],
  },
};

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

    // Check API key
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
          "Please analyze my resume and provide a detailed critique. " +
          "Use the resume_critique tool to submit your structured findings. " +
          "Severity levels: high = resume will be rejected without this fix, " +
          "medium = weakens the resume, low = nice to have. " +
          "Do NOT include overallScore or categoryScores — they are computed from findings.",
      },
    ];

    // Non-streaming call with forced tool use for structured output
    const overrides = {
      ...TASK_OVERRIDES["resume-critique"],
      maxTokens: 4096,
    };

    const toolResult = await callChatWithTool(
      messages,
      tier,
      systemPrompt,
      RESUME_CRITIQUE_TOOL,
      overrides
    );

    // Return the structured result as JSON
    return NextResponse.json(
      {
        data: toolResult,
        error: null,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 200 }
    );
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
