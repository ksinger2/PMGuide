import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";

export interface ResumeSection {
  type: string;
  title: string;
  content: string;
}

export interface ResumeContent {
  sections: ResumeSection[];
  fullText: string;
}

/**
 * Map section type to a heading level.
 * Contact/name gets the top heading; other sections get Heading 2.
 */
function sectionHeadingLevel(type: string): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  if (type === "contact") return HeadingLevel.HEADING_1;
  return HeadingLevel.HEADING_2;
}

/**
 * Parse a section's content string into Paragraph objects.
 * Lines starting with "- " or "• " become bulleted paragraphs.
 * Empty lines become spacing paragraphs.
 */
function parseContentToParagraphs(content: string): Paragraph[] {
  const lines = content.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const text = trimmed.replace(/^[-•]\s*/, "");
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text,
              font: "Calibri",
              size: 22, // 11pt
            }),
          ],
          spacing: { after: 60 },
        })
      );
      continue;
    }

    // Regular paragraph
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: trimmed,
            font: "Calibri",
            size: 22,
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  return paragraphs;
}

/**
 * Generate a DOCX Blob from structured resume content.
 * Uses professional formatting: Calibri font, clean headings, bullet points.
 */
export async function generateDocx(content: ResumeContent): Promise<Blob> {
  const children: Paragraph[] = [];

  for (const section of content.sections) {
    // Section heading
    if (section.type === "contact") {
      // Contact section: name as large centered heading, rest as body
      const contactLines = section.content.split("\n").filter((l) => l.trim());
      if (contactLines.length > 0) {
        // First line is typically the name
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: contactLines[0].trim(),
                font: "Calibri",
                size: 32, // 16pt
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          })
        );

        // Remaining contact info (email, phone, location, LinkedIn)
        if (contactLines.length > 1) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: contactLines.slice(1).join(" | "),
                  font: "Calibri",
                  size: 20, // 10pt
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          );
        }
      }
    } else {
      // Section heading with bottom border
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title.toUpperCase(),
              font: "Calibri",
              size: 24, // 12pt
              bold: true,
              color: "333333",
            }),
          ],
          heading: sectionHeadingLevel(section.type),
          spacing: { before: 240, after: 80 },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "CCCCCC",
            },
          },
        })
      );

      // Section content
      children.push(...parseContentToParagraphs(section.content));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              bottom: 720,
              left: 1080,  // 0.75 inch
              right: 1080,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
}

/**
 * Trigger a DOCX download in the browser.
 */
export async function downloadResume(
  content: ResumeContent,
  filename: string
): Promise<void> {
  const blob = await generateDocx(content);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
