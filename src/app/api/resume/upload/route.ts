import { NextRequest, NextResponse } from "next/server";
import { validateResumeFile, validatePdfMagicBytes } from "@/lib/resume/validators";
import { parsePdf } from "@/lib/resume/pdf-parser";
import { MAX_FILE_SIZE } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// In-memory rate limiter (MVP) — 10 req/min
// ---------------------------------------------------------------------------

const UPLOAD_RATE_LIMIT = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= UPLOAD_RATE_LIMIT) {
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
        "Too many upload requests. Please wait a moment and try again.",
        429
      );
    }

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid form data. Please upload a file using multipart/form-data.",
        400
      );
    }

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse(
        "VALIDATION_ERROR",
        "No file provided. Please upload a PDF file.",
        400
      );
    }

    // Validate file type and size (MIME check)
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      return errorResponse(
        validation.error!.code,
        validation.error!.message,
        400
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes (server-side security check)
    const magicBytesValidation = validatePdfMagicBytes(buffer);
    if (!magicBytesValidation.valid) {
      return errorResponse(
        magicBytesValidation.error!.code,
        magicBytesValidation.error!.message,
        400
      );
    }

    // Parse PDF
    let parsed;
    try {
      parsed = await parsePdf(buffer);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to parse PDF. Please try a different file.";
      return errorResponse("PARSE_ERROR", message, 400);
    }

    // Build response
    const resumeId = `resume-${Date.now()}`;
    const now = new Date().toISOString();

    return NextResponse.json(
      {
        data: {
          resumeId,
          extractedText: parsed.text,
          pageCount: parsed.pageCount,
          sections: parsed.sections,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: now,
          },
        },
        error: null,
        meta: { timestamp: now },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/resume/upload]", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}
