---
name: resume-workflow
description: Use when building resume upload, critique, generation, forking, or download features - guides the complete resume pipeline from PDF to DOCX
---

# Resume Workflow - Complete Resume Pipeline

## Overview

PMGuide's resume section transforms a user's existing resume (or builds one from scratch) into a PM-optimized document. The pipeline handles upload, structured critique, AI-powered generation, version forking for different targets, and final download. The key philosophy: **PMGuide changes WHAT is in the resume, not HOW it looks.**

## Cardinal Rules

1. **No lies.** Never fabricate experience, companies, titles, dates, or metrics. If a user's background is thin, we strengthen how they tell their real story - we don't invent a fake one.
2. **No fake dates or companies.** All timeline entries must correspond to real experiences the user has described.
3. **No hallucinated metrics.** If the user says "I improved onboarding," we don't add "by 47%." We help them find and articulate their real impact.
4. **Content over cosmetics.** PMGuide optimizes the substance - bullet points, framing, keywords, story structure. Formatting/layout is handled by the template system, not the AI.
5. **User retains full control.** Every AI suggestion is a suggestion. The user accepts, edits, or rejects each change.

## Pipeline Stages

### Stage 1: Upload
**Input:** PDF, DOCX, or plain text paste
**Process:**
- Parse document into structured text (preserve section boundaries)
- Extract: contact info, summary/objective, work experience, education, skills, certifications, projects
- Handle messy formatting gracefully (tables, columns, headers, footers)
- If parsing fails, fall back to plain text extraction and ask user to confirm sections
- Store raw upload AND parsed structure separately

**Output:** `ParsedResume` object with all sections identified

**Edge cases:**
- Multi-page resumes: process all pages, flag if > 2 pages (PM resumes should be 1-2 pages)
- Non-English resumes: detect language, process in English, note original language
- Portfolio/CV uploads: distinguish from resume, advise on PM resume format
- Image-based PDFs: run OCR, warn about potential accuracy issues

### Stage 2: Critique
**Input:** `ParsedResume` from Stage 1 + user's `UserProfile` from About Me
**Process:**
- Evaluate every section against the critique rubric (see below)
- Score each section: Strong / Needs Work / Missing
- Generate specific, actionable feedback for each bullet point
- Identify PM-specific gaps (no metrics, weak impact statements, missing PM keywords)
- Compare against target role requirements (from user profile)
- Highlight transferable experience that isn't being leveraged (especially for career switchers)

**Output:** `ResumeCritique` with section-by-section feedback and overall score

### Stage 3: Generate
**Input:** `ResumeCritique` + user approval to proceed
**Process:**
- Rewrite bullet points using STAR/XYZ format where applicable
- Add PM-specific keywords naturally (not keyword stuffing)
- Strengthen impact statements with user-confirmed metrics
- Restructure sections for PM role targeting (skills before education for experienced PMs)
- Generate a PM-tailored professional summary
- Preserve all factual content - only change framing and language

**Output:** `GeneratedResume` with tracked changes (original vs. rewritten for each bullet)

**User interaction:**
- Show before/after for each bullet point
- Allow accept/reject/edit for each change
- Explain why each change was made
- Allow full rollback to original at any time

### Stage 4: Fork
**Input:** `GeneratedResume` (approved version)
**Process:**
- User selects a target company or role type
- Create a variant that emphasizes relevant experience for that target
- Adjust keywords, summary, and bullet ordering for the specific role
- ATS optimization: ensure keywords from job description are naturally present
- Generate a tailored cover letter outline (optional)

**Fork types:**
- Company-specific (e.g., "Google PM" fork vs. "Startup PM" fork)
- Level-specific (e.g., "Senior PM" fork vs. "Group PM" fork)
- Domain-specific (e.g., "Growth PM" fork vs. "Platform PM" fork)

**Output:** Named fork with diff view against base resume

**Rules:**
- Forks share the same factual base - no fork gets fake experience
- Forks differ in emphasis, ordering, keyword density, and summary framing
- Maximum 5 active forks per user (prevent version sprawl)

### Stage 5: Download
**Input:** Any approved resume version (base or fork)
**Process:**
- Apply selected template formatting (clean, modern, ATS-friendly)
- Generate DOCX with proper heading styles, consistent spacing, professional fonts
- Generate PDF from DOCX for preview
- Include ATS compatibility score
- Package with optional cover letter if generated in Stage 4

**Output:** DOCX file + PDF preview + ATS score

**Template requirements:**
- Clean, single-column layout (ATS-friendly)
- Professional serif or sans-serif font (not decorative)
- Consistent margins (0.5-1 inch)
- Clear section headers
- No tables, columns, graphics, or icons (ATS parsers break on these)
- No headers/footers (ATS often ignores these)

## Resume Structure Expected

A PM-optimized resume should contain these sections in order:

```
1. Contact Information
   - Name, email, phone, LinkedIn, location (city/state only)
   - Optional: portfolio URL, GitHub (for technical PMs)

2. Professional Summary (2-3 sentences)
   - Years of PM experience + domain expertise
   - Key achievement or differentiator
   - Target role alignment statement

3. Work Experience (reverse chronological)
   - Company name, title, dates (month/year)
   - 3-5 bullet points per role
   - Each bullet: Action verb + What you did + Impact/Result
   - Quantify wherever possible (revenue, users, efficiency, time saved)

4. Skills
   - Technical: SQL, Python, APIs, system design, A/B testing tools
   - PM Tools: Jira, Figma, Amplitude, Mixpanel, Notion
   - Methodologies: Agile, Scrum, Design Thinking, Jobs-to-be-Done
   - Soft skills: cross-functional leadership, stakeholder management

5. Education
   - Degree, institution, graduation year
   - Relevant coursework or honors (if recent grad)

6. Certifications & Additional (optional)
   - PM certifications, relevant training
   - Speaking engagements, publications, patents
   - Side projects with PM relevance
```

## Critique Rubric

### Bullet Point Scoring

Each work experience bullet is evaluated on:

| Criterion | Strong | Needs Work | Weak |
|---|---|---|---|
| **Action Verb** | Strong PM verb (Led, Launched, Defined, Drove) | Generic verb (Worked on, Helped, Assisted) | No verb / passive voice |
| **Specificity** | Clear what was built/done | Vague description | Completely ambiguous |
| **Impact** | Quantified result ($, %, users, time) | Qualitative impact stated | No impact mentioned |
| **PM Signal** | Shows PM ownership and decision-making | Shows participation | Shows task execution only |
| **Scope** | Cross-functional, org-level impact clear | Team-level scope | Individual task scope |

### Section Scoring

| Section | Strong | Needs Work | Missing |
|---|---|---|---|
| **Summary** | Compelling, targeted, differentiating | Generic, could be any PM | Absent |
| **Experience** | 3-5 quantified bullets per role, PM-framed | Weak bullets, no metrics | Missing key roles |
| **Skills** | Relevant, organized, not padded | Disorganized or padded | Missing or token |
| **Education** | Clean, appropriately weighted | Over-emphasized (experienced PMs) | Missing |

### Overall Resume Score

- **90-100:** Interview-ready. Minor polish only.
- **70-89:** Strong foundation. Needs bullet strengthening and metrics.
- **50-69:** Significant rewriting needed. Missing PM framing.
- **Below 50:** Fundamental restructuring needed. May need About Me data to fill gaps.

## Fork Strategy

When creating a fork, adjust these elements:

1. **Professional Summary:** Rewrite to align with target role description
2. **Bullet Ordering:** Move most relevant bullets to top of each role
3. **Keyword Integration:** Naturally incorporate job description keywords
4. **Skills Prioritization:** Reorder skills to match target role requirements
5. **Section Emphasis:** For career switchers, may promote Projects or Skills above Experience

**Never change in a fork:**
- Company names, titles, or dates
- Fundamental claims about what was done
- Education details
- Contact information

## DOCX Formatting Specifications

```
Font: Calibri or Arial, 10-11pt body, 12-14pt name, 11-12pt section headers
Margins: 0.75 inches all sides
Line spacing: 1.0 or 1.15
Section spacing: 6pt before section headers
Bullet style: simple round bullet, 0.25 inch indent
Color: black text only (no colored headers, no colored accents)
File naming: {FirstName}_{LastName}_Resume_{ForkName}.docx
```

## Data Model

```typescript
interface ParsedResume {
  raw: string;
  contactInfo: ContactInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  certifications: string[];
  additional: string[];
  parseConfidence: number; // 0-1
}

interface ResumeCritique {
  overallScore: number;
  sectionScores: Record<string, SectionScore>;
  bulletFeedback: BulletFeedback[];
  missingElements: string[];
  strengths: string[];
  priorityImprovements: string[];
}

interface GeneratedResume {
  baseResumeId: string;
  sections: ResumeSection[];
  changes: TrackedChange[];
  atsScore: number;
  forks: ResumeFork[];
}

interface ResumeFork {
  id: string;
  name: string;
  targetCompany?: string;
  targetRole?: string;
  changes: TrackedChange[]; // diff from base
  createdAt: Date;
}
```
