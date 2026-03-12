import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as cheerio from "cheerio";
import { streamChat } from "@/lib/ai/client";
import { getModelForTask } from "@/lib/ai/models";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const fetchJdSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

// ---------------------------------------------------------------------------
// Rate limiter (5 req/min)
// ---------------------------------------------------------------------------

const RATE_LIMIT = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
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

function stripHtmlTags(html: string): string {
  // Decode HTML entities first, then strip tags
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Structured data extraction (JSON-LD + meta tags)
// ---------------------------------------------------------------------------

interface StructuredJobData {
  jobTitle?: string;
  company?: string;
  description?: string;
}

function findJobPostingInJsonLd(data: unknown): StructuredJobData | null {
  if (!data || typeof data !== "object") return null;

  // Direct JobPosting object
  if ("@type" in (data as Record<string, unknown>)) {
    const typed = data as Record<string, unknown>;
    if (typed["@type"] === "JobPosting") {
      const result: StructuredJobData = {};
      if (typeof typed.title === "string") result.jobTitle = typed.title;
      if (typeof typed.name === "string" && !result.jobTitle) result.jobTitle = typed.name;
      if (typed.hiringOrganization && typeof typed.hiringOrganization === "object") {
        const org = typed.hiringOrganization as Record<string, unknown>;
        if (typeof org.name === "string") result.company = org.name;
      }
      if (typeof typed.description === "string") {
        result.description = stripHtmlTags(typed.description);
      }
      return result;
    }
  }

  // Check @graph arrays (common in many sites)
  if ("@graph" in (data as Record<string, unknown>)) {
    const graph = (data as Record<string, unknown>)["@graph"];
    if (Array.isArray(graph)) {
      for (const item of graph) {
        const found = findJobPostingInJsonLd(item);
        if (found) return found;
      }
    }
  }

  // Check if data is an array (some sites wrap in arrays)
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findJobPostingInJsonLd(item);
      if (found) return found;
    }
  }

  return null;
}

function extractStructuredData(html: string): StructuredJobData {
  const $ = cheerio.load(html);
  const result: StructuredJobData = {};

  // --- Try JSON-LD first ---
  const jsonLdScripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLdScripts.length; i++) {
    const raw = $(jsonLdScripts[i]).html();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const jobData = findJobPostingInJsonLd(parsed);
      if (jobData) {
        if (jobData.jobTitle) result.jobTitle = jobData.jobTitle;
        if (jobData.company) result.company = jobData.company;
        if (jobData.description) result.description = jobData.description;
        console.log("[fetch-jd] JSON-LD JobPosting found:", {
          jobTitle: result.jobTitle,
          company: result.company,
          descriptionLength: result.description?.length ?? 0,
        });
        return result;
      }
    } catch {
      // Invalid JSON in script tag, skip
    }
  }

  // --- Fallback: meta tags ---
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");
  const ogSiteName = $('meta[property="og:site_name"]').attr("content");
  const pageTitle = $("title").text();
  const metaDescription = $('meta[name="description"]').attr("content");

  // Filter out generic/error page titles
  const badTitles = /^(not found|404|error|untitled|loading|page not found)$/i;
  if (ogTitle && !badTitles.test(ogTitle.trim())) result.jobTitle = ogTitle;
  else if (pageTitle && !badTitles.test(pageTitle.trim())) result.jobTitle = pageTitle;

  if (ogSiteName) result.company = ogSiteName;

  if (ogDescription) result.description = ogDescription;
  else if (metaDescription) result.description = metaDescription;

  if (result.jobTitle || result.company || result.description) {
    console.log("[fetch-jd] Meta tag extraction:", {
      jobTitle: result.jobTitle,
      company: result.company,
      descriptionLength: result.description?.length ?? 0,
    });
  } else {
    console.log("[fetch-jd] No structured data or meta tags found");
  }

  return result;
}

// ---------------------------------------------------------------------------
// Body text extraction (fallback for description)
// ---------------------------------------------------------------------------

function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove non-content elements (but JSON-LD was already extracted above)
  $("script, style, nav, footer, header, noscript, iframe, svg").remove();

  // Try to find the main content area
  const mainSelectors = [
    "main",
    "article",
    '[role="main"]',
    ".job-description",
    ".posting-page",
    "#job-description",
    ".content",
  ];

  let text = "";
  for (const selector of mainSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      text = el.text();
      break;
    }
  }

  // Fallback to body text
  if (!text) {
    text = $("body").text();
  }

  // Clean up whitespace
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 10000); // Cap at 10k chars
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return errorResponse(
        "RATE_LIMITED",
        "Too many requests. Please wait a moment.",
        429
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("VALIDATION_ERROR", "Invalid JSON.", 400);
    }

    const parsed = fetchJdSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid URL.",
        400
      );
    }

    const { url } = parsed.data;

    // Fetch the URL server-side (avoids CORS)
    let html: string;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; PMGuide/1.0; +https://pmguide.dev)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      clearTimeout(timeout);

      if (!res.ok) {
        return errorResponse(
          "FETCH_FAILED",
          `Could not fetch the URL (HTTP ${res.status}). Try pasting the job description instead.`,
          422
        );
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("html") && !contentType.includes("text")) {
        return errorResponse(
          "INVALID_CONTENT",
          "The URL did not return HTML content. Try pasting the job description instead.",
          422
        );
      }

      html = await res.text();
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "The URL took too long to respond. Try pasting the job description instead."
          : "Could not reach the URL. Try pasting the job description instead.";
      return errorResponse("FETCH_FAILED", message, 422);
    }

    // 1. Try structured data extraction first (preserves JSON-LD)
    const structured = extractStructuredData(html);

    // 2. Extract body text as fallback
    const bodyText = extractTextFromHtml(html);

    // Use structured description if it's substantial, otherwise fall back to body text
    const jobDescriptionText =
      structured.description && structured.description.length > 50
        ? structured.description
        : bodyText;

    console.log("[fetch-jd] Final text source:", {
      usedStructuredDescription: jobDescriptionText === structured.description,
      textLength: jobDescriptionText.length,
    });

    // Detect garbage text (JSON config blobs, theme data, etc.)
    const looksLikeJson = jobDescriptionText.trimStart().startsWith("{") || jobDescriptionText.trimStart().startsWith("[");
    const hasJobWords = /\b(responsibilities|qualifications|requirements|experience|role|position|team|salary|benefits)\b/i.test(jobDescriptionText);

    if (jobDescriptionText.length < 50 || (looksLikeJson && !hasJobWords)) {
      console.log("[fetch-jd] Content rejected:", {
        length: jobDescriptionText.length,
        looksLikeJson,
        hasJobWords,
      });
      return errorResponse(
        "EMPTY_CONTENT",
        "This site loads job details dynamically and can't be read server-side. Please paste the job description instead.",
        422
      );
    }

    // 3. Determine job title and company
    let jobTitle = "Untitled Position";
    let company = "Unknown Company";

    // If structured data gave us both title and company, skip the AI call
    if (structured.jobTitle && structured.company) {
      jobTitle = structured.jobTitle;
      company = structured.company;
      console.log("[fetch-jd] Using structured data for title/company — skipping Haiku call", {
        jobTitle,
        company,
      });
    } else if (process.env.ANTHROPIC_API_KEY) {
      // Fall back to Haiku extraction
      console.log("[fetch-jd] Structured data incomplete — using Haiku for title/company extraction");
      try {
        const tier = getModelForTask("utility");
        const messages = [
          {
            role: "user" as const,
            content: `Extract the job title and company name from this job description. Return ONLY valid JSON: {"jobTitle": "...", "company": "..."}

Job description (first 2000 chars):
${jobDescriptionText.slice(0, 2000)}`,
          },
        ];

        let result = "";
        for await (const chunk of streamChat(
          messages,
          tier,
          "You extract structured data from text. Return only valid JSON, no other text."
        )) {
          result += chunk;
        }

        // Parse the extraction result
        let jsonStr = result.trim();
        jsonStr = jsonStr
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        const extracted = JSON.parse(jsonStr);
        if (extracted.jobTitle) jobTitle = String(extracted.jobTitle);
        if (extracted.company) company = String(extracted.company);

        // If structured data had partial info, prefer it
        if (structured.jobTitle) jobTitle = structured.jobTitle;
        if (structured.company) company = structured.company;

        console.log("[fetch-jd] Haiku extraction result:", { jobTitle, company });
      } catch {
        // Extraction failed — use whatever structured data we have, or defaults
        if (structured.jobTitle) jobTitle = structured.jobTitle;
        if (structured.company) company = structured.company;
      }
    }

    return NextResponse.json({
      data: { jobTitle, company, jobDescriptionText },
      error: null,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("[POST /api/resume/fetch-jd]", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred.",
      500
    );
  }
}
