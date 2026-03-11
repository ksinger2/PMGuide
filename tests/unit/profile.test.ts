import { describe, it, expect } from "vitest";
import {
  createEmptyProfile,
  calculateCompleteness,
  getMissingFields,
  meetsGateThreshold,
  PROFILE_KEY_FIELDS,
  type UserProfile,
} from "@/lib/utils/profile";

describe("createEmptyProfile", () => {
  it("returns a profile with all null fields", () => {
    const profile = createEmptyProfile();

    expect(profile.name).toBeNull();
    expect(profile.currentRole).toBeNull();
    expect(profile.currentCompany).toBeNull();
    expect(profile.yearsExperience).toBeNull();
    expect(profile.companyTypes).toBeNull();
    expect(profile.productsShipped).toBeNull();
    expect(profile.keyMetrics).toBeNull();
    expect(profile.frameworks).toBeNull();
    expect(profile.skillsAssessment).toBeNull();
    expect(profile.goalRole).toBeNull();
    expect(profile.industryPreferences).toBeNull();
    expect(profile.companyStagePreferences).toBeNull();
    expect(profile.workStylePreferences).toBeNull();
    expect(profile.learningStyle).toBeNull();
  });
});

describe("calculateCompleteness", () => {
  it("returns 0 for an empty profile", () => {
    const profile = createEmptyProfile();
    expect(calculateCompleteness(profile)).toBe(0);
  });

  it("returns the correct fraction for a partially filled profile", () => {
    const profile = createEmptyProfile();
    // Fill 4 out of 8 key fields (name, currentRole, currentCompany, yearsExperience)
    profile.name = "Alice";
    profile.currentRole = "PM";
    profile.currentCompany = "Acme";
    profile.yearsExperience = 3;

    const completeness = calculateCompleteness(profile);
    expect(completeness).toBeCloseTo(4 / PROFILE_KEY_FIELDS.length, 5);
  });

  it("returns 1.0 for a fully filled profile", () => {
    const profile = createFullProfile();
    expect(calculateCompleteness(profile)).toBe(1.0);
  });
});

describe("getMissingFields", () => {
  it("returns all fields for an empty profile", () => {
    const profile = createEmptyProfile();
    const missing = getMissingFields(profile);
    expect(missing).toHaveLength(PROFILE_KEY_FIELDS.length);
  });

  it("returns fewer fields when some are filled", () => {
    const profile = createEmptyProfile();
    profile.name = "Alice";
    profile.currentRole = "PM";

    const missing = getMissingFields(profile);
    expect(missing).toHaveLength(PROFILE_KEY_FIELDS.length - 2);
    expect(missing).not.toContain("Name");
    expect(missing).not.toContain("Current role");
  });

  it("returns an empty array for a fully filled profile", () => {
    const profile = createFullProfile();
    const missing = getMissingFields(profile);
    expect(missing).toHaveLength(0);
  });
});

describe("meetsGateThreshold", () => {
  it("returns false when completeness is below 0.7", () => {
    const profile = createEmptyProfile();
    // Fill only 4 / 20 = 0.2
    profile.name = "Alice";
    profile.currentRole = "PM";
    profile.currentCompany = "Acme";
    profile.goalRole = "Senior PM";

    expect(meetsGateThreshold(profile)).toBe(false);
  });

  it("returns true when completeness is at 0.7", () => {
    // 14 / 20 = 0.7 exactly
    const profile = createEmptyProfile();
    profile.name = "Alice";
    profile.currentRole = "PM";
    profile.currentCompany = "Acme";
    profile.yearsExperience = 5;
    profile.companyTypes = ["B2B"];
    profile.productsShipped = [
      { name: "Widget", description: "A widget", impact: "10x growth" },
    ];
    profile.keyMetrics = ["DAU", "Revenue"];
    profile.frameworks = ["RICE"];
    profile.skillsAssessment = {
      productStrategy: 4,
      userResearch: 3,
      dataAnalysis: 4,
      technicalDepth: 3,
      stakeholderManagement: 4,
      executionDelivery: 4,
      leadership: null,
      communication: null,
    };
    profile.goalRole = "Senior PM";

    expect(meetsGateThreshold(profile)).toBe(true);
  });

  it("returns true when completeness exceeds 0.7", () => {
    const profile = createFullProfile();
    expect(meetsGateThreshold(profile)).toBe(true);
  });
});

// ---- Helper ----

function createFullProfile(): UserProfile {
  return {
    name: "Alice Johnson",
    currentRole: "Product Manager",
    currentCompany: "Acme Corp",
    yearsExperience: 5,
    companyTypes: ["B2B", "SaaS"],
    productsShipped: [
      {
        name: "Dashboard v2",
        description: "Rebuilt analytics dashboard",
        impact: "40% increase in daily active usage",
      },
    ],
    keyMetrics: ["DAU", "Revenue", "NPS"],
    frameworks: ["RICE", "Jobs-to-be-Done"],
    skillsAssessment: {
      productStrategy: 4,
      userResearch: 3,
      dataAnalysis: 4,
      technicalDepth: 3,
      stakeholderManagement: 5,
      executionDelivery: 4,
      leadership: 3,
      communication: 5,
    },
    goalRole: "Senior PM",
    industryPreferences: ["FinTech", "HealthTech"],
    companyStagePreferences: ["Series B", "Growth"],
    workStylePreferences: "Collaborative, async-first",
    learningStyle: "example-based",
  };
}
