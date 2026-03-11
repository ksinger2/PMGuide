/**
 * PDF text extraction using pdf-parse.
 * Extracts raw text content from a PDF buffer.
 */

/**
 * Extract text from a PDF buffer using pdf-parse v2's PDFParse class.
 * Dynamic import avoids build-time issues with Next.js static analysis.
 */
async function extractTextFromBuffer(
  buffer: Buffer
): Promise<{ text: string; numPages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await import("pdf-parse") as any;
  const PDFParse = mod.PDFParse ?? mod.default?.PDFParse;

  if (!PDFParse) {
    throw new Error("pdf-parse module not found");
  }

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  // Strip page separator lines added by pdf-parse v2 (e.g. "-- 1 of 3 --")
  const cleanText = (result.text ?? "").replace(/\n*-- \d+ of \d+ --\n*/g, "\n");
  return {
    text: cleanText,
    numPages: result.total ?? 0,
  };
}

export interface ParsedResume {
  text: string;
  pageCount: number;
  sections: ResumeSection[];
}

export interface ResumeSection {
  type:
    | "contact"
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "other";
  title: string;
  content: string;
  startLine: number;
  endLine: number;
}

/**
 * Known section header patterns for resume parsing.
 * Ordered by typical resume structure.
 */
const SECTION_PATTERNS: {
  type: ResumeSection["type"];
  patterns: RegExp[];
}[] = [
  {
    type: "summary",
    patterns: [
      /^(professional\s+)?summary$/i,
      /^(career\s+)?objective$/i,
      /^profile$/i,
      /^about(\s+me)?$/i,
      /^overview$/i,
    ],
  },
  {
    type: "experience",
    patterns: [
      /^(professional\s+|work\s+)?experience$/i,
      /^employment(\s+history)?$/i,
      /^work\s+history$/i,
      /^career\s+history$/i,
    ],
  },
  {
    type: "education",
    patterns: [
      /^education$/i,
      /^academic\s+(background|history)$/i,
      /^degrees?$/i,
    ],
  },
  {
    type: "skills",
    patterns: [
      /^(technical\s+|core\s+|key\s+)?skills$/i,
      /^competenc(ies|es)$/i,
      /^tools?\s*(&|and)\s*technolog(ies|y)$/i,
      /^certifications?$/i,
    ],
  },
];

/**
 * Detect what type of section a header line represents.
 */
function detectSectionType(line: string): ResumeSection["type"] | null {
  const trimmed = line.trim();
  for (const { type, patterns } of SECTION_PATTERNS) {
    if (patterns.some((p) => p.test(trimmed))) {
      return type;
    }
  }
  return null;
}

/**
 * Heuristic: a line is likely a section header if it's short,
 * possibly uppercase, and matches known patterns.
 */
function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 60) return false;
  return detectSectionType(trimmed) !== null;
}

/**
 * Split extracted text into detected resume sections.
 */
function detectSections(text: string): ResumeSection[] {
  const lines = text.split("\n");
  const sections: ResumeSection[] = [];

  // First few lines are likely contact info
  let contactEnd = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    if (isSectionHeader(lines[i])) {
      contactEnd = i;
      break;
    }
    contactEnd = i + 1;
  }

  if (contactEnd > 0) {
    const contactContent = lines.slice(0, contactEnd).join("\n").trim();
    if (contactContent) {
      sections.push({
        type: "contact",
        title: "Contact Information",
        content: contactContent,
        startLine: 1,
        endLine: contactEnd,
      });
    }
  }

  // Find remaining sections by header detection
  let currentSection: {
    type: ResumeSection["type"];
    title: string;
    startLine: number;
    contentLines: string[];
  } | null = null;

  for (let i = contactEnd; i < lines.length; i++) {
    const line = lines[i];
    const sectionType = detectSectionType(line);

    if (sectionType) {
      // Save previous section
      if (currentSection) {
        sections.push({
          type: currentSection.type,
          title: currentSection.title,
          content: currentSection.contentLines.join("\n").trim(),
          startLine: currentSection.startLine,
          endLine: i,
        });
      }

      currentSection = {
        type: sectionType,
        title: line.trim(),
        startLine: i + 1,
        contentLines: [],
      };
    } else if (currentSection) {
      currentSection.contentLines.push(line);
    } else if (line.trim()) {
      // Content before any recognized section header — treat as "other"
      if (
        sections.length > 0 &&
        sections[sections.length - 1].type === "other"
      ) {
        sections[sections.length - 1].content += "\n" + line;
        sections[sections.length - 1].endLine = i + 1;
      } else {
        sections.push({
          type: "other",
          title: "Other",
          content: line,
          startLine: i + 1,
          endLine: i + 1,
        });
      }
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      type: currentSection.type,
      title: currentSection.title,
      content: currentSection.contentLines.join("\n").trim(),
      startLine: currentSection.startLine,
      endLine: lines.length,
    });
  }

  return sections;
}

/**
 * Extract text content from a PDF buffer.
 *
 * @param buffer - The raw PDF file buffer
 * @returns Parsed resume with text, page count, and detected sections
 * @throws Error if the PDF cannot be parsed
 */
export async function parsePdf(buffer: Buffer): Promise<ParsedResume> {
  try {
    const result = await extractTextFromBuffer(buffer);

    const text = result.text.trim();

    if (!text || text.length < 20) {
      throw new Error(
        "Could not extract text from this PDF. It may be image-only or encrypted. Please upload a text-based PDF."
      );
    }

    const sections = detectSections(text);

    return {
      text,
      pageCount: result.numPages,
      sections,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Could not extract")) {
      throw error;
    }
    console.error("[parsePdf] PDF parsing failed:", error);
    throw new Error(
      "Failed to parse PDF. The file may be corrupted, encrypted, or image-only. Please try uploading a different PDF."
    );
  }
}
