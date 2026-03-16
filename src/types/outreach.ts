// ---------------------------------------------------------------------------
// Audience & format types
// ---------------------------------------------------------------------------

export type AudienceType = "hiring-manager" | "recruiter" | "referral";
export type MessageFormat = "email" | "linkedin";

// ---------------------------------------------------------------------------
// Context provided during setup
// ---------------------------------------------------------------------------

export interface OutreachContext {
  audienceType: AudienceType;
  messageFormat: MessageFormat;
  userName: string;
  recipientName: string;
  purpose: string;
  jobTitle: string;
  company: string;
  jobDescriptionText: string;
  jobUrl: string;
}

// ---------------------------------------------------------------------------
// Chat message
// ---------------------------------------------------------------------------

export interface OutreachMessage {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Saved draft
// ---------------------------------------------------------------------------

export interface OutreachDraft {
  id: string;
  context: OutreachContext;
  messages: OutreachMessage[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Screen flow
// ---------------------------------------------------------------------------

export type OutreachScreen = "home" | "setup" | "active";

// ---------------------------------------------------------------------------
// Top-level state
// ---------------------------------------------------------------------------

export interface OutreachState {
  screen: OutreachScreen;
  audienceType: AudienceType | null;
  drafts: OutreachDraft[];
  activeDraftId: string | null;
}
