# API Contracts — PMGuide

All API endpoints, request/response schemas, and error codes.

---

## General Conventions

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://pmguide.vercel.app/api`

### Response Envelope

Every endpoint returns this structure:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta: {
    timestamp: string;  // ISO 8601
    requestId?: string;
  };
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body failed schema validation |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | 400 | Uploaded file is not a supported type |
| `PROFILE_INCOMPLETE` | 403 | Action requires a complete profile |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_ERROR` | 502 | Anthropic API returned an error |
| `AI_TIMEOUT` | 504 | Anthropic API request timed out |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Content Types

- JSON endpoints: `Content-Type: application/json`
- File upload: `Content-Type: multipart/form-data`
- Streaming: `Content-Type: text/event-stream`

---

## Endpoints

---

### POST /api/chat

Send a message to the AI chatbot and receive a streaming response.

**Use case:** About Me onboarding conversation, general PM career chat.

**Rate limit:** 30 requests/minute

#### Request

```
POST /api/chat
Content-Type: application/json
```

```typescript
interface ChatRequest {
  message: string;             // User's message (1-5000 chars)
  section: "about-me" | "resume";  // Which section the chat is in
  conversationHistory?: {      // Previous messages for context
    role: "user" | "assistant";
    content: string;
  }[];
  profileSnapshot?: UserProfile;  // Current profile state for context
}
```

**Example request body:**
```json
{
  "message": "I'm a Senior PM at Stripe, been in product for 6 years",
  "section": "about-me",
  "conversationHistory": [
    { "role": "assistant", "content": "Welcome to PMGuide! Tell me about your current role." }
  ],
  "profileSnapshot": {
    "name": null,
    "currentRole": null,
    "completeness": 0.0
  }
}
```

#### Response (Streaming)

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

Each event:
```
data: {"text": "That's great! "}

data: {"text": "6 years in product "}

data: {"text": "at Stripe is impressive. "}

data: {"profileUpdates": {"currentRole": "Senior PM", "currentCompany": "Stripe", "yearsExperience": 6}}

data: [DONE]
```

**Stream event types:**

```typescript
// Text chunk
interface TextEvent {
  text: string;
}

// Profile extraction (sent once at end, if applicable)
interface ProfileUpdateEvent {
  profileUpdates: Partial<UserProfile>;
}

// Done signal
// Literal string: [DONE]
```

#### Errors

| Code | When |
|------|------|
| `VALIDATION_ERROR` | Missing or invalid `message` or `section` |
| `RATE_LIMITED` | More than 30 requests in 60 seconds |
| `AI_ERROR` | Anthropic API returned an error |
| `AI_TIMEOUT` | No response within 30 seconds |

---

### POST /api/resume/upload

Upload a PDF resume for parsing and analysis.

**Use case:** User uploads their existing resume.

**Rate limit:** 10 requests/minute

#### Request

```
POST /api/resume/upload
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | PDF file, max 10MB |

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append("file", pdfFile);

const response = await fetch("/api/resume/upload", {
  method: "POST",
  body: formData,
});
```

#### Response

```typescript
interface ResumeUploadResponse {
  data: {
    resumeId: string;                // Unique ID for this resume
    extractedText: string;           // Full extracted text
    pageCount: number;               // Number of pages
    sections: {                      // Detected resume sections
      type: "contact" | "summary" | "experience" | "education" | "skills" | "other";
      title: string;
      content: string;
      startLine: number;
      endLine: number;
    }[];
    metadata: {
      fileName: string;
      fileSize: number;              // Bytes
      uploadedAt: string;            // ISO 8601
    };
  } | null;
  error: ApiError | null;
  meta: { timestamp: string };
}
```

**Example response:**
```json
{
  "data": {
    "resumeId": "resume-1709985600000",
    "extractedText": "Jane Smith\nSenior Product Manager\n...",
    "pageCount": 2,
    "sections": [
      {
        "type": "contact",
        "title": "Contact Information",
        "content": "Jane Smith\njane@example.com\n...",
        "startLine": 1,
        "endLine": 4
      },
      {
        "type": "experience",
        "title": "Professional Experience",
        "content": "Senior Product Manager, Stripe (2021-Present)\n...",
        "startLine": 8,
        "endLine": 35
      }
    ],
    "metadata": {
      "fileName": "jane-smith-resume.pdf",
      "fileSize": 245760,
      "uploadedAt": "2026-03-09T12:00:00Z"
    }
  },
  "error": null,
  "meta": { "timestamp": "2026-03-09T12:00:00Z" }
}
```

#### Errors

| Code | When |
|------|------|
| `VALIDATION_ERROR` | No file provided |
| `INVALID_FILE_TYPE` | File is not a PDF (checked via MIME type and magic bytes) |
| `FILE_TOO_LARGE` | File exceeds 10MB |
| `PARSE_ERROR` | PDF could not be parsed (corrupted, image-only, encrypted) |
| `PROFILE_INCOMPLETE` | User profile does not meet gate threshold |

---

### POST /api/resume/critique

Run an AI critique of the uploaded resume.

**Use case:** Automatically triggered after upload, or manually re-triggered.

**Rate limit:** 10 requests/minute

#### Request

```
POST /api/resume/critique
Content-Type: application/json
```

```typescript
interface CritiqueRequest {
  resumeId: string;              // From upload response
  extractedText: string;         // Full resume text
  sections: ResumeSection[];     // Parsed sections
  profile: UserProfile;          // User profile for context
}
```

#### Response

```typescript
interface CritiqueResponse {
  data: {
    overallScore: number;        // 0-100
    summary: string;             // 2-3 sentence overview
    categoryScores: {
      category: "impact_metrics" | "pm_language" | "relevance" | "clarity" | "structure" | "completeness";
      score: number;             // 0-100
      label: string;             // Human-readable category name
    }[];
    findings: {
      id: string;                // Unique finding ID
      severity: "high" | "medium" | "low";
      category: string;          // Which category this belongs to
      title: string;             // Short description
      description: string;       // Detailed explanation
      originalText?: string;     // The problematic text from the resume
      suggestedText?: string;    // AI's suggested improvement
      sectionRef?: string;       // Which resume section this references
    }[];
    strengths: string[];         // What the resume does well (3-5 items)
    profileSuggestions: {        // Things from profile not on resume
      field: string;             // Profile field name
      value: string;             // What's in the profile
      suggestion: string;        // How to incorporate it
    }[];
  } | null;
  error: ApiError | null;
  meta: { timestamp: string };
}
```

**Example response (abbreviated):**
```json
{
  "data": {
    "overallScore": 62,
    "summary": "Your resume demonstrates solid PM experience but lacks quantified impact. Most bullets describe activities rather than outcomes. Your profile shows strong metrics knowledge — let's get those numbers on the page.",
    "categoryScores": [
      { "category": "impact_metrics", "score": 35, "label": "Impact & Metrics" },
      { "category": "pm_language", "score": 72, "label": "PM-Specific Language" },
      { "category": "relevance", "score": 68, "label": "Relevance" },
      { "category": "clarity", "score": 75, "label": "Clarity & Conciseness" },
      { "category": "structure", "score": 80, "label": "Structure" },
      { "category": "completeness", "score": 55, "label": "Completeness" }
    ],
    "findings": [
      {
        "id": "f-001",
        "severity": "high",
        "category": "impact_metrics",
        "title": "No metrics in 4 of 6 experience bullets",
        "description": "Recruiters spend 6 seconds on a resume. Metrics are the fastest way to prove impact. Bullets like 'managed the product roadmap' tell what you did, not what happened because of it.",
        "originalText": "Managed the product roadmap for the payments team",
        "suggestedText": "Owned the payments roadmap, prioritizing 40+ features that drove $2.3M ARR growth in 12 months",
        "sectionRef": "experience"
      }
    ],
    "strengths": [
      "Clear role progression showing career growth",
      "Good use of PM frameworks in the skills section",
      "Concise summary that positions you for Senior PM roles"
    ],
    "profileSuggestions": [
      {
        "field": "frameworks",
        "value": "RICE, OKRs, Jobs-to-be-Done",
        "suggestion": "Your profile mentions JTBD expertise but it's not on your resume. Consider adding a bullet about how you used JTBD to drive product decisions."
      }
    ]
  },
  "error": null,
  "meta": { "timestamp": "2026-03-09T12:00:00Z" }
}
```

#### Errors

| Code | When |
|------|------|
| `VALIDATION_ERROR` | Missing required fields |
| `PROFILE_INCOMPLETE` | User profile does not meet gate threshold |
| `AI_ERROR` | Anthropic API error during critique |
| `AI_TIMEOUT` | Critique took longer than 30 seconds |

---

### POST /api/resume/generate

Generate an improved generic resume based on critique feedback and user profile.

**Use case:** User wants to create an improved base resume.

**Rate limit:** 5 requests/minute

#### Request

```
POST /api/resume/generate
Content-Type: application/json
```

```typescript
interface GenerateRequest {
  resumeId: string;              // Original resume ID
  extractedText: string;         // Original resume text
  sections: ResumeSection[];     // Parsed sections
  profile: UserProfile;          // User profile
  critiqueFindings: Finding[];   // Findings to address
  userFeedback?: string;         // Optional: user's instructions for regeneration
}
```

#### Response

```typescript
interface GenerateResponse {
  data: {
    generatedResumeId: string;   // ID for this generated version
    content: {
      sections: {
        type: string;
        title: string;
        content: string;         // Improved content
      }[];
      fullText: string;          // Complete resume text
    };
    changes: {
      sectionType: string;
      original: string;
      improved: string;
      reason: string;            // Why this change was made
    }[];
    docxUrl?: string;            // If pre-generated, URL to download
  } | null;
  error: ApiError | null;
  meta: { timestamp: string };
}
```

#### Errors

| Code | When |
|------|------|
| `VALIDATION_ERROR` | Missing required fields |
| `PROFILE_INCOMPLETE` | User profile does not meet gate threshold |
| `AI_ERROR` | Anthropic API error during generation |
| `AI_TIMEOUT` | Generation took longer than 60 seconds |

---

### POST /api/resume/fork

Generate a job-specific resume variant tailored to a specific job description.

**Use case:** User wants to customize their resume for a specific application.

**Rate limit:** 5 requests/minute

#### Request

```
POST /api/resume/fork
Content-Type: application/json
```

```typescript
interface ForkRequest {
  generatedResumeId: string;     // Base resume to fork from
  baseContent: {                 // The generic improved resume content
    sections: ResumeSection[];
    fullText: string;
  };
  jobDescription: string;       // Full job description text (max 10000 chars)
  profile: UserProfile;         // User profile for additional context
  userNotes?: string;           // Optional: user's notes about what to emphasize
}
```

#### Response

```typescript
interface ForkResponse {
  data: {
    forkId: string;              // ID for this fork
    targetCompany: string;       // Extracted from job description
    targetRole: string;          // Extracted from job description
    content: {
      sections: {
        type: string;
        title: string;
        content: string;         // Tailored content
      }[];
      fullText: string;
    };
    tailoringNotes: {
      sectionType: string;
      whatChanged: string;       // Description of changes
      why: string;               // Why these changes match the JD
    }[];
    keywordAlignment: {          // How well the fork matches the JD
      matched: string[];         // Keywords from JD found in resume
      missing: string[];         // Keywords from JD NOT in resume (couldn't add truthfully)
      added: string[];           // Keywords added from profile/resume
    };
  } | null;
  error: ApiError | null;
  meta: { timestamp: string };
}
```

#### Errors

| Code | When |
|------|------|
| `VALIDATION_ERROR` | Missing required fields or job description too long |
| `PROFILE_INCOMPLETE` | User profile does not meet gate threshold |
| `AI_ERROR` | Anthropic API error during fork generation |
| `AI_TIMEOUT` | Fork generation took longer than 60 seconds |

---

### GET /api/profile

Retrieve the current user profile.

**Use case:** Load profile on app startup, check completeness for gate.

**Rate limit:** None (reads from localStorage via API)

#### Request

```
GET /api/profile
```

No request body. Profile is loaded from the request context (in MVP, the client sends the profile from localStorage).

**Note:** In MVP, the profile is stored entirely client-side. This endpoint exists to validate the profile server-side and compute completeness. The client sends the profile in a query parameter or header.

#### Alternative: Client sends profile for validation

```
GET /api/profile?data={base64EncodedProfile}
```

#### Response

```typescript
interface ProfileResponse {
  data: {
    profile: UserProfile;
    completeness: number;        // 0.0 to 1.0
    missingFields: string[];     // Fields still needed for gate
    meetsGateThreshold: boolean; // true if completeness >= 0.7 and required fields present
  } | null;
  error: ApiError | null;
  meta: { timestamp: string };
}
```

**Example response:**
```json
{
  "data": {
    "profile": {
      "name": "Jane Smith",
      "currentRole": "Senior PM",
      "yearsExperience": 6,
      "completeness": 0.65
    },
    "completeness": 0.65,
    "missingFields": ["productsShipped", "keyMetrics", "goalRole", "industryPreferences"],
    "meetsGateThreshold": false
  },
  "error": null,
  "meta": { "timestamp": "2026-03-09T12:00:00Z" }
}
```

---

### PUT /api/profile

Update the user profile (full or partial update).

**Use case:** Save profile changes from the profile editor or from chat-extracted data.

**Rate limit:** None

#### Request

```
PUT /api/profile
Content-Type: application/json
```

```typescript
interface ProfileUpdateRequest {
  profile: Partial<UserProfile>;  // Fields to update (merged with existing)
}
```

**Example request body:**
```json
{
  "profile": {
    "name": "Jane Smith",
    "currentRole": "Senior PM",
    "yearsExperience": 6,
    "currentCompany": "Stripe"
  }
}
```

#### Response

```typescript
interface ProfileUpdateResponse {
  data: {
    profile: UserProfile;        // Full updated profile
    completeness: number;
    meetsGateThreshold: boolean;
    previousCompleteness: number; // For showing progress
  } | null;
  error: ApiError | null;
  meta: { timestamp: string };
}
```

#### Errors

| Code | When |
|------|------|
| `VALIDATION_ERROR` | Invalid profile data (wrong types, out-of-range values) |

---

## DOCX Download

DOCX file generation happens client-side after receiving resume content from `/api/resume/generate` or `/api/resume/fork`. The download is triggered via JavaScript:

```typescript
// Client-side DOCX generation
import { generateDocx } from "@/lib/resume/docx-builder";

async function downloadResume(content: ResumeContent, filename: string) {
  const blob = await generateDocx(content);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

No dedicated API endpoint is needed for download — the `docx` package runs in the browser.

---

## WebSocket / SSE Considerations

The `/api/chat` endpoint uses Server-Sent Events (SSE) for streaming. This is simpler than WebSockets and works well with Next.js API routes and Vercel deployment.

**Client-side consumption:**

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(chatRequest),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

  for (const line of lines) {
    const data = line.slice(6); // Remove "data: " prefix
    if (data === "[DONE]") return;

    const parsed = JSON.parse(data);
    if (parsed.text) appendToMessage(parsed.text);
    if (parsed.profileUpdates) updateProfile(parsed.profileUpdates);
  }
}
```
