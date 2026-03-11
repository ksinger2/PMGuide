// Profile types and completeness utilities

export interface SkillsAssessment {
  productStrategy: number | null; // 1-5
  userResearch: number | null;
  dataAnalysis: number | null;
  technicalDepth: number | null;
  stakeholderManagement: number | null;
  executionDelivery: number | null;
  leadership: number | null;
  communication: number | null;
}

export interface ProductShipped {
  name: string;
  description: string;
  impact: string;
}

export interface UserProfile {
  name: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;
  companyTypes: string[] | null; // B2B, B2C, marketplace, etc.
  productsShipped: ProductShipped[] | null;
  keyMetrics: string[] | null;
  frameworks: string[] | null;
  skillsAssessment: SkillsAssessment | null;
  goalRole: string | null;
  industryPreferences: string[] | null;
  companyStagePreferences: string[] | null;
  workStylePreferences: string | null;
  learningStyle:
    | "direct"
    | "visual"
    | "example-based"
    | "framework-oriented"
    | null;
}

/**
 * The 8 core experience fields used for completeness calculation.
 * Skills assessment and goals are optional — they don't count toward the gate.
 * learningStyle is detected (not asked), so it's also excluded.
 */
export const PROFILE_KEY_FIELDS = [
  "name",
  "currentRole",
  "currentCompany",
  "yearsExperience",
  "companyTypes",
  "productsShipped",
  "keyMetrics",
  "frameworks",
] as const;

export function createEmptyProfile(): UserProfile {
  return {
    name: null,
    currentRole: null,
    currentCompany: null,
    yearsExperience: null,
    companyTypes: null,
    productsShipped: null,
    keyMetrics: null,
    frameworks: null,
    skillsAssessment: null,
    goalRole: null,
    industryPreferences: null,
    companyStagePreferences: null,
    workStylePreferences: null,
    learningStyle: null,
  };
}

/**
 * Check whether a single profile field is non-null (filled).
 */
function isFieldFilled(
  profile: UserProfile,
  field: (typeof PROFILE_KEY_FIELDS)[number]
): boolean {
  const value = profile[field as keyof UserProfile];
  return value != null;
}

/**
 * Returns a value between 0.0 and 1.0 representing profile completeness.
 * Based on the 8 core experience fields.
 */
export function calculateCompleteness(profile: UserProfile): number {
  const filled = PROFILE_KEY_FIELDS.filter((field) =>
    isFieldFilled(profile, field)
  ).length;
  return filled / PROFILE_KEY_FIELDS.length;
}

/**
 * Returns human-readable names of fields that are still missing.
 */
export function getMissingFields(profile: UserProfile): string[] {
  const labelMap: Record<(typeof PROFILE_KEY_FIELDS)[number], string> = {
    name: "Name",
    currentRole: "Current role",
    currentCompany: "Current company",
    yearsExperience: "Years of experience",
    companyTypes: "Company types",
    productsShipped: "Products shipped",
    keyMetrics: "Key metrics",
    frameworks: "Frameworks used",
  };

  return PROFILE_KEY_FIELDS.filter(
    (field) => !isFieldFilled(profile, field)
  ).map((field) => labelMap[field]);
}

/**
 * Profile gate: user must reach 70% completeness to unlock the Resume section.
 */
export function meetsGateThreshold(profile: UserProfile): boolean {
  return calculateCompleteness(profile) >= 0.7;
}
