# Product Requirements Document — PMGuide

Version: 1.0
Last updated: 2026-03-09

---

## Product Vision

PMGuide helps product managers navigate the job search with AI-powered, personalized tools. It meets PMs where they are — from APMs writing their first resume to VP-level leaders making strategic career moves — and provides tailored, conversational guidance at every step.

PMGuide is not a generic resume builder. It understands PM careers: frameworks, metrics, stakeholder management, product sense, and the nuances that differentiate a PM resume from any other role.

---

## Target User

**Primary:** Product managers at all levels (APM through VP Product) who are actively seeking new roles.

**Characteristics:**
- Currently employed or recently transitioned, updating their resume
- Understands PM concepts but may not know how to articulate them on a resume
- Comfortable with chat interfaces and AI tools
- Values speed and quality over manual effort
- May be applying to 5-50+ roles and needs tailored materials

**Not our user (MVP):**
- Non-PM roles (engineers, designers, marketers)
- Students with no PM experience
- Recruiters or hiring managers

---

## Success Metrics

| Metric | Definition | Target (MVP) |
|--------|-----------|--------------|
| Profile completion rate | % of users who complete About Me to gate threshold | > 60% |
| Resume critiques completed | # of users who upload + receive a critique | > 40% of profile completers |
| Resume downloads generated | # of DOCX downloads (generic or forked) | > 25% of critique completers |
| User return rate (7-day) | % of users who return within 7 days | > 30% |
| Time to first resume download | Median time from first visit to first download | < 30 minutes |

### How We Track (MVP)

Since there's no backend database in MVP, tracking is limited to:
- localStorage event logging (timestamps for key actions)
- Vercel Analytics (page views, basic engagement)
- Future: proper analytics pipeline when auth is added

---

## Section Specifications

### About Me (P0 — Must Ship)

#### Purpose
Build a comprehensive user profile through conversational AI. This profile powers every other section — resume critique knows their background, resume generation knows their goals, and (eventually) interview prep knows their weak spots.

#### User Flow

```
Landing Page
  └─> "Get Started" button
       └─> Input Method Selection
            ├─> "Type" → Text chat interface
            └─> "Speak" → Voice input with Web Speech API
                 └─> Visual recording indicator (pulsing mic icon)
                 └─> Real-time transcript display
                 └─> Haiku cleans up transcript before sending
       └─> AI asks onboarding questions (see QUESTION_BANK.md)
       └─> After each answer, AI extracts facts → updates profile
       └─> Profile card shows what AI has learned (sidebar or panel)
       └─> User can view and edit any extracted fact
       └─> Completeness meter shows progress toward gate threshold
       └─> When profile is sufficiently complete → Resume section unlocks
```

#### Profile Data Model

```typescript
interface UserProfile {
  // Identity
  name: string;
  currentRole: string;
  yearsExperience: number;
  currentCompany?: string;

  // Experience
  companyTypes: string[];              // "B2B SaaS", "Consumer", "Marketplace", etc.
  pmType: string;                      // "Growth PM", "Platform PM", "0-to-1 PM", etc.
  productsShipped: ProductShipped[];   // Array of { name, description, impact }
  keyMetrics: string[];                // "DAU", "Revenue", "Conversion Rate", etc.
  frameworks: string[];                // "RICE", "OKRs", "Jobs-to-be-Done", etc.

  // Goals
  goalRole: string;                    // "Senior PM", "Group PM", "Director of Product"
  industryPreferences: string[];       // "Fintech", "Health Tech", "AI/ML", etc.
  companyStagePreferences: string[];   // "Seed", "Series A-C", "Public", etc.
  workStylePreferences: string[];      // "Remote", "Hybrid", "IC-focused", etc.

  // Meta
  learningStyle: LearningStyle;        // "direct" | "visual" | "example-based" | "framework-oriented"
  skillsAssessment: SkillsAssessment;  // Self-rated skills across PM competencies
  completeness: number;                // 0.0 to 1.0
}

interface ProductShipped {
  name: string;
  description: string;
  impact: string;                      // Quantified outcome
}

interface SkillsAssessment {
  productStrategy: number;             // 1-5
  userResearch: number;
  dataAnalysis: number;
  technicalDepth: number;
  stakeholderManagement: number;
  executionDelivery: number;
  leadership: number;
  communication: number;
}

type LearningStyle = "direct" | "visual" | "example-based" | "framework-oriented";
```

#### Voice Input Specification

- **Technology:** Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`)
- **Visual indicator:** Pulsing red mic icon when recording. Static gray when idle.
- **Transcript display:** Real-time text appears as user speaks
- **Cleanup:** Haiku 4.5 cleans up the raw transcript (removes filler words, fixes grammar) before it's sent as a chat message
- **Fallback:** If Web Speech API is unavailable (e.g., Firefox on Linux), show a tooltip: "Voice input is not supported in this browser. Please type instead."
- **Privacy:** Audio is processed entirely in the browser. No audio is sent to our servers.

#### Learning Style Detection

The AI detects learning style from conversational cues:
- **Direct:** Short answers, wants to get to the point → AI gives concise responses
- **Visual:** Asks for examples, diagrams → AI uses bullet lists, structured formats
- **Example-based:** Says "like what?" or "can you give an example?" → AI leads with examples
- **Framework-oriented:** References frameworks, asks for structured approaches → AI references PM frameworks

The detected style is stored in the profile and affects AI communication in ALL sections.

#### Profile Gate

The Resume section is locked until the profile reaches a completeness threshold:
- **Threshold:** 70% completeness (14 of 20 key fields populated)
- **Required fields (must have all):** name, currentRole, yearsExperience, goalRole, at least 1 product shipped, at least 1 framework
- **Visual:** Locked sections show a lock icon with "Complete your profile to unlock"
- **Enforcement:** Both client-side (UI) and server-side (API routes check profile)

---

### Resume (P0 — Must Ship)

#### Purpose
Help PMs improve their resume with AI-powered critique and generation. Upload an existing resume, get actionable feedback, create an improved version, and fork it for specific job applications.

#### User Flow

```
Resume Section (unlocked after About Me)
  └─> Upload Resume
       ├─> Drag-and-drop zone
       └─> File picker button
       └─> PDF only, max 10MB
       └─> Validation: file type, file size, parseable text
  └─> Auto-Assessment (runs immediately after upload)
       └─> AI analyzes resume against PM best practices
       └─> Inline critique with severity levels:
            ├─> High: Critical issues (missing metrics, vague bullets)
            ├─> Medium: Improvement opportunities (better framing)
            └─> Low: Minor suggestions (word choice, formatting)
       └─> Summary score with breakdown by category
  └─> Generic Resume (improved base version)
       └─> User reviews critique and chooses to generate
       └─> AI creates improved version using profile + original resume
       └─> Side-by-side comparison (original vs. improved)
       └─> User can provide text/voice feedback for regeneration
       └─> Download as .docx
  └─> Fork (Job-Specific)
       └─> User pastes job description (URL or text)
       └─> AI tailors the generic resume for that specific role
       └─> Highlights what changed and why
       └─> Download as .docx
       └─> Can create multiple forks for different jobs
```

#### Resume Rules (Non-Negotiable)

1. **Same format and fonts.** PMGuide does not change how the resume looks — only what it says.
2. **No fake dates.** Never fabricate or adjust employment dates.
3. **No fake companies.** Never invent companies or roles.
4. **No lies.** Never fabricate metrics, outcomes, or responsibilities.
5. **Only rephrase and cater.** Rewrite bullets to be more impactful, add missing context from the profile, and tailor content to target roles.
6. **About Me integration.** If the user's profile contains achievements or skills not on their resume, the AI may suggest adding them — but the user decides.

#### Critique Categories

| Category | What It Checks |
|----------|---------------|
| Impact & Metrics | Are outcomes quantified? Do bullets show results, not just tasks? |
| PM-Specific Language | Does the resume speak the PM dialect? (stakeholders, roadmap, prioritization) |
| Relevance | Is content tailored to the target role/level? |
| Clarity & Conciseness | Are bullets scannable? Is there filler? |
| Structure | Is the hierarchy right? Most important content first? |
| Completeness | Are key PM competencies represented? |

#### Severity Levels

- **High (red):** This will get your resume rejected. Fix before applying. Examples: no metrics anywhere, three pages for a mid-level PM, obvious gaps with no explanation.
- **Medium (amber):** This weakens your resume. Fix if possible. Examples: bullets describe tasks not outcomes, generic verbs ("managed", "worked on"), missing PM frameworks.
- **Low (blue):** Nice to have. Polish if you have time. Examples: inconsistent date formats, could reorder bullets for impact, minor word choice improvements.

#### DOCX Generation

- Use the `docx` npm package to generate downloadable Word documents
- Preserve a clean, professional template (no fancy formatting)
- Sections: Contact Info, Summary, Experience, Education, Skills
- File naming: `{name}-resume-{timestamp}.docx` (generic) or `{name}-resume-{company}-{timestamp}.docx` (forked)

---

### Outreach (P2 — Stub)

**Status:** Coming Soon

**Page content:**
- Section title: "Outreach"
- Coming Soon badge
- Description: "Craft compelling cold emails, LinkedIn messages, and networking strategies tailored to your target companies."
- Feature preview (grayed out cards):
  - Cold email templates personalized to the company and role
  - LinkedIn connection request messages
  - Follow-up sequences with timing guidance
  - Networking strategy for target companies

---

### Interview (P2 — Stub)

**Status:** Coming Soon

**Page content:**
- Section title: "Interview Prep"
- Coming Soon badge
- Description: "Practice product sense, estimation, behavioral, and technical PM interviews with AI-powered mock sessions."
- Feature preview (grayed out cards):
  - Product sense questions with structured frameworks
  - Estimation/market sizing practice
  - Behavioral STAR method coaching
  - Mock interview sessions with real-time feedback

---

### Negotiate (P2 — Stub)

**Status:** Coming Soon

**Page content:**
- Section title: "Negotiate"
- Coming Soon badge
- Description: "Navigate compensation discussions with data-driven insights and personalized negotiation strategies."
- Feature preview (grayed out cards):
  - Salary benchmarking by role, level, and location
  - Offer comparison calculator
  - Negotiation scripts and email templates
  - Counter-offer strategy coaching

---

## Non-Functional Requirements

### Responsive Design
- **Desktop (1024px+):** Sidebar navigation on the left, main content area on the right
- **Tablet (768px-1023px):** Collapsible sidebar, full-width content
- **Mobile (< 768px):** Bottom tab navigation, full-width content

### Accessibility
- **Standard:** WCAG 2.1 AA compliance
- **Keyboard navigation:** All interactive elements reachable via Tab, activated via Enter/Space
- **Screen reader support:** Semantic HTML, ARIA labels on icons, live regions for chat messages
- **Color contrast:** Minimum 4.5:1 ratio for text, 3:1 for large text and UI components
- **Motion:** Respect `prefers-reduced-motion` for animations

### Browser Support
- Chrome: latest 2 versions
- Safari: latest 2 versions
- Edge: latest 2 versions
- Firefox: latest 2 versions
- Mobile Safari (iOS 15+)
- Chrome for Android (latest)

### Performance
See `ENGINEERING_GUIDE.md` for specific benchmarks:
- Chat response: < 3 seconds
- PDF upload + parse: < 5 seconds
- Resume generation: < 15 seconds
- DOCX download: < 10 seconds
- Page load (LCP): < 2 seconds

### Security
- No API keys exposed client-side (all AI calls through API routes)
- Input validation on all API routes (Zod schemas)
- File type validation (MIME type + magic bytes, not just extension)
- File size validation (server-side enforcement, not just client-side)
- Sanitize user input before including in AI prompts
- No user data sent to third parties (except Anthropic API for AI processing)

---

## Out of Scope (MVP)

The following are explicitly NOT in the MVP. Do not build, plan for, or design around these:

| Feature | Why Not Now |
|---------|-------------|
| User accounts / authentication | localStorage is sufficient for single-user MVP |
| Database persistence | localStorage for now; database when we add auth |
| Payment / monetization | Free MVP to validate product-market fit |
| Mobile native app | Web-first; responsive web handles mobile use cases |
| Social features | No sharing, no community, no public profiles |
| Multiple resume formats | DOCX only for MVP; PDF generation later |
| ATS optimization scoring | Valuable but complex; future feature |
| Job board integration | API integrations are a V2 concern |
| Interview scheduling | Out of scope for career prep tool |
| Collaborative editing | Single-user tool for MVP |

---

## Open Questions

1. **Profile data portability:** Should users be able to export their profile as JSON? Useful for backup since we're localStorage-only.
2. **Resume version history:** Should we keep previous versions in localStorage? Could get large.
3. **Offline support:** Worth considering a service worker for the chat interface?
4. **Analytics MVP:** What's the lightest-weight analytics we can add without a backend?

---

## References

- `CLAUDE.md` — Project-level instructions for development
- `ENGINEERING_GUIDE.md` — Technical architecture and conventions
- `docs/API_CONTRACTS.md` — API endpoint specifications
- `docs/QUESTION_BANK.md` — About Me chatbot questions
- `docs/RESUME_EXAMPLES.md` — Resume guidance by PM level
- `docs/DESIGN_SYSTEM.md` — UI/UX design system
