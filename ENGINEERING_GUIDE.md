# Engineering Guide — PMGuide

Technical architecture, coding conventions, and standards for the PMGuide project.

---

## Architecture Principles

### Chat-First, AI-Powered
Every section starts with conversational AI. The user talks to the chatbot, and the chatbot guides them through the process. Forms are secondary — conversation is primary.

### Server Components by Default
Use React Server Components for everything that doesn't need interactivity. Only add `"use client"` when the component needs:
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (Web Speech API, localStorage, File API)
- React hooks (useState, useEffect, useReducer, useContext)
- Streaming response rendering

### API Routes Handle All AI Calls
Never expose API keys client-side. All Anthropic API calls go through Next.js API routes (`src/app/api/`). The client sends user input to our API, our API calls Claude, our API streams the response back.

```
Browser → Next.js API Route → Anthropic API → Next.js API Route → Browser
```

---

## Component Patterns

### React Server Components
Use for:
- Page layouts (`layout.tsx`)
- Static content sections
- Navigation (sidebar, headers)
- "Coming Soon" stub pages

```tsx
// src/app/outreach/page.tsx — Server Component (no "use client")
import { ComingSoon } from "@/components/ui/coming-soon";

export default function OutreachPage() {
  return (
    <ComingSoon
      title="Outreach"
      description="Cold email templates, LinkedIn messages, and networking strategy."
      features={["Email templates", "LinkedIn outreach", "Networking playbook"]}
    />
  );
}
```

### Client Components
Use for:
- Chat interface (input, messages, streaming)
- File upload (drag-and-drop, file picker)
- Voice input (Web Speech API)
- Profile editor (forms with state)
- Any component consuming React Context

```tsx
"use client";

import { useState } from "react";

export function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [input, setInput] = useState("");

  return (
    <form
      data-testid="chat-input-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSend(input);
        setInput("");
      }}
    >
      <input
        data-testid="chat-input-field"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button data-testid="chat-send-button" type="submit">
        Send
      </button>
    </form>
  );
}
```

### Design Token Compliance
All components use Tailwind design tokens. Never hardcode colors, spacing, or font sizes.

```tsx
// GOOD
<div className="bg-primary-600 text-white p-4 rounded-lg">

// BAD — hardcoded values
<div style={{ backgroundColor: "#4F46E5", color: "white", padding: "16px" }}>
```

### Test IDs
Every interactive element gets a `data-testid` attribute. This is mandatory for Playwright tests.

```tsx
<button data-testid="resume-upload-button">Upload Resume</button>
<input data-testid="voice-input-toggle" />
<div data-testid="critique-results-panel">...</div>
```

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `chat-input.tsx`, `pdf-parser.ts` |
| Components | PascalCase | `ChatInput`, `UploadZone` |
| API routes | REST-style paths | `/api/resume/upload` |
| Types/Interfaces | PascalCase + descriptive suffix | `UserProfile`, `ResumeData`, `CritiqueResult` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `SUPPORTED_MODELS` |
| Hooks | camelCase with `use` prefix | `useProfile`, `useChatStream` |
| Utilities | camelCase | `parseResume`, `buildPrompt` |
| Test files | `*.test.ts` (unit), `*.spec.ts` (E2E) | `pdf-parser.test.ts`, `about-me.spec.ts` |
| CSS classes | Tailwind utilities only | No custom CSS files |

---

## API Route Standards

### Response Envelope

Every API route returns a consistent envelope:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;          // Machine-readable: "VALIDATION_ERROR", "FILE_TOO_LARGE"
    message: string;       // Human-readable: "File exceeds 10MB limit"
    details?: unknown;     // Optional additional context
  } | null;
  meta: {
    timestamp: string;     // ISO 8601
    requestId?: string;    // For debugging
  };
}
```

### Success Response Example

```json
{
  "data": {
    "profileId": "local-1234",
    "name": "Jane Smith",
    "completeness": 0.85
  },
  "error": null,
  "meta": {
    "timestamp": "2026-03-09T12:00:00Z"
  }
}
```

### Error Response Example

```json
{
  "data": null,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Uploaded file exceeds the 10MB limit.",
    "details": { "maxBytes": 10485760, "receivedBytes": 15728640 }
  },
  "meta": {
    "timestamp": "2026-03-09T12:00:00Z"
  }
}
```

### Input Validation

Every API route validates input before processing. Use Zod for schema validation:

```typescript
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  section: z.enum(["about-me", "resume"]),
  conversationId: z.string().optional(),
});
```

### File Upload Limits

- **PDF uploads:** 10MB max
- **Accepted MIME types:** `application/pdf`
- Validate both client-side (for UX) and server-side (for security)

### Rate Limiting

AI endpoints should be rate-limited to prevent abuse:
- `/api/chat`: 30 requests per minute per session
- `/api/resume/critique`: 10 requests per minute per session
- `/api/resume/generate`: 5 requests per minute per session
- `/api/resume/fork`: 5 requests per minute per session

---

## State Management

### React Context for Global Profile

The user profile is global state. It's used by About Me, Resume, and (eventually) all other sections.

```typescript
// src/stores/profile-context.tsx
"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

interface ProfileState {
  profile: UserProfile | null;
  completeness: number;
  isLoaded: boolean;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pmguide-profile");
    if (saved) {
      dispatch({ type: "LOAD_PROFILE", payload: JSON.parse(saved) });
    }
    dispatch({ type: "SET_LOADED" });
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (state.profile) {
      localStorage.setItem("pmguide-profile", JSON.stringify(state.profile));
    }
  }, [state.profile]);

  return (
    <ProfileContext.Provider value={{ state, dispatch }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
}
```

### Local State for Components

Use `useState` and `useReducer` for component-level state:
- Chat message history within a session
- File upload progress
- Form field values
- UI toggles (modals, dropdowns)

### No Redux

Keep it simple. React Context + useReducer handles everything PMGuide needs. If state management becomes complex, reconsider architecture before reaching for Redux.

### localStorage for Persistence (MVP)

For MVP, all persistence goes through localStorage:
- `pmguide-profile`: User profile data
- `pmguide-resume`: Parsed resume content
- `pmguide-chat-history`: Recent chat messages

This will be replaced with a database in a future version.

---

## AI Integration Patterns

### Prompt Registry

All prompts live in `src/lib/prompts/` as exported functions. Never inline prompts in API routes.

```typescript
// src/lib/prompts/about-me.ts
export function buildOnboardingPrompt(
  learningStyle: LearningStyle,
  questionsAsked: string[],
  profileSoFar: Partial<UserProfile>
): string {
  return `You are PMGuide, an AI career coach for product managers.

The user's learning style is: ${learningStyle}
${learningStyle === "example-based" ? "Use concrete examples in your responses." : ""}
${learningStyle === "framework-oriented" ? "Reference PM frameworks (RICE, HEART, etc.) when relevant." : ""}

You have already asked: ${questionsAsked.join(", ")}
You have learned so far: ${JSON.stringify(profileSoFar)}

Ask the next most valuable question to build their profile.
Focus on areas not yet covered.
Be conversational and warm.`;
}
```

### Model Routing

```typescript
// src/lib/ai/models.ts
export const MODEL_CONFIG = {
  // Quality-critical: resume analysis, career advice
  quality: {
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096,
    temperature: 0.7,
  },
  // Utility: classification, transcript cleanup, short responses
  utility: {
    model: "claude-haiku-4-5-20250514",
    maxTokens: 1024,
    temperature: 0.3,
  },
} as const;

export type ModelTier = keyof typeof MODEL_CONFIG;

// Route by use case
export function getModelForTask(task: string): ModelTier {
  const qualityTasks = ["resume-critique", "resume-generate", "resume-fork", "career-advice"];
  return qualityTasks.includes(task) ? "quality" : "utility";
}
```

### Streaming Responses

Chat responses stream to the client using Server-Sent Events:

```typescript
// src/lib/ai/streaming.ts
export function createStreamResponse(stream: AsyncIterable<string>): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### Token Budget Management

For long conversations, manage the context window:
- Keep the system prompt + last N messages within the model's context limit
- Summarize older messages when the conversation exceeds the budget
- Always include the full user profile in the system prompt (it's small)

---

## Testing Standards

### Playwright (E2E)

Mandatory before shipping any feature. Test the user journey, not implementation details.

```typescript
// tests/e2e/about-me.spec.ts
import { test, expect } from "@playwright/test";

test("About Me: complete onboarding flow", async ({ page }) => {
  await page.goto("/about-me");
  await expect(page.getByTestId("get-started-button")).toBeVisible();

  await page.getByTestId("get-started-button").click();
  await expect(page.getByTestId("input-method-selector")).toBeVisible();

  await page.getByTestId("type-input-option").click();
  await expect(page.getByTestId("chat-input-field")).toBeVisible();

  // Send a message
  await page.getByTestId("chat-input-field").fill("I'm a Senior PM at a B2B SaaS company");
  await page.getByTestId("chat-send-button").click();

  // Wait for AI response
  await expect(page.getByTestId("chat-message-assistant")).toBeVisible({ timeout: 10000 });
});
```

### Vitest (Unit)

Test prompt construction, PDF parsing, DOCX generation, and utility functions.

```typescript
// tests/unit/pdf-parser.test.ts
import { describe, it, expect } from "vitest";
import { parsePdf } from "@/lib/resume/pdf-parser";

describe("parsePdf", () => {
  it("extracts text from a valid PDF", async () => {
    const buffer = await fs.readFile("tests/fixtures/sample-resume.pdf");
    const result = await parsePdf(buffer);
    expect(result.text).toContain("Product Manager");
    expect(result.pageCount).toBeGreaterThan(0);
  });

  it("rejects files over 10MB", async () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(parsePdf(largeBuffer)).rejects.toThrow("FILE_TOO_LARGE");
  });
});
```

### Test Fixtures

Store test data in `tests/fixtures/`:
- `sample-resume.pdf` — A realistic PM resume for testing upload/parse
- `mock-api-responses.json` — Canned AI responses for deterministic tests

### Test ID Conventions

Format: `data-testid="context-element-variant"`

Examples:
- `chat-input-field`
- `chat-send-button`
- `chat-message-assistant`
- `resume-upload-dropzone`
- `resume-critique-severity-high`
- `profile-completeness-bar`
- `nav-sidebar-resume-link`
- `coming-soon-outreach`

---

## Performance Benchmarks

| Operation | Target | How to Measure |
|-----------|--------|---------------|
| Chat response (first token) | < 3 seconds | Time from send to first streamed token |
| PDF upload + parse | < 5 seconds | Time from file drop to parsed text display |
| Resume generation (full) | < 15 seconds | Time from "Generate" click to complete resume |
| DOCX download | < 10 seconds | Time from "Download" click to file save dialog |
| Page load (LCP) | < 2 seconds | Lighthouse LCP metric |

### How to Enforce

- Playwright tests can assert on timing: `expect(duration).toBeLessThan(5000)`
- Lighthouse CI in the deployment pipeline for LCP
- Log API route durations for server-side benchmarks

---

## Error Handling

### Client-Side

```typescript
try {
  const response = await fetch("/api/resume/upload", { method: "POST", body: formData });
  const result: ApiResponse<ResumeData> = await response.json();

  if (result.error) {
    // Show user-friendly error
    showToast({ type: "error", message: result.error.message });
    return;
  }

  // Use result.data
} catch (err) {
  showToast({ type: "error", message: "Something went wrong. Please try again." });
}
```

### Server-Side

```typescript
// In API routes, always catch and return structured errors
export async function POST(request: Request) {
  try {
    // ... handle request
  } catch (error) {
    console.error("[/api/resume/upload]", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred. Please try again.",
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }
}
```

---

## Git Conventions

- **Branch naming:** `feature/section-name`, `fix/bug-description`, `chore/task-description`
- **Commit messages:** Imperative mood, concise. `Add resume upload API route`, `Fix PDF parsing for multi-page resumes`
- **No force pushes to main.**
- **Never commit `.env.local`.**
