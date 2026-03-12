import { describe, it, expect } from "vitest";
import {
  QUESTION_BANK,
  getRandomBankQuestion,
  getBankQuestionsForType,
} from "@/lib/interview/question-bank";

describe("Question Bank Parser", () => {
  it("parses questions for all 7 types", () => {
    const types = Object.keys(QUESTION_BANK);
    expect(types).toHaveLength(7);

    for (const type of types) {
      const questions = QUESTION_BANK[type as keyof typeof QUESTION_BANK];
      expect(questions.length).toBeGreaterThan(0);
    }
  });

  it("each question has required fields", () => {
    for (const [type, questions] of Object.entries(QUESTION_BANK)) {
      for (const q of questions) {
        expect(q.id).toBeTruthy();
        expect(q.text).toBeTruthy();
        expect(q.type).toBe(type);
        expect(q.subCategory).toBeTruthy();
      }
    }
  });

  it("generates deterministic IDs in {type}-{index} format", () => {
    const designQs = QUESTION_BANK["product-design"];
    expect(designQs[0].id).toBe("product-design-0");
    expect(designQs[1].id).toBe("product-design-1");
  });

  it("detects company hints in parentheses", () => {
    const allQuestions = Object.values(QUESTION_BANK).flat();
    const withHints = allQuestions.filter((q) => q.companyHint);
    expect(withHints.length).toBeGreaterThan(0);
  });
});

describe("getRandomBankQuestion", () => {
  it("returns a question for a valid type", () => {
    const q = getRandomBankQuestion("product-design");
    expect(q).not.toBeNull();
    expect(q!.type).toBe("product-design");
  });

  it("excludes already-used IDs", () => {
    const allDesign = getBankQuestionsForType("product-design");
    const allButOne = allDesign.slice(1).map((q) => q.id);
    // Only one question remains available
    const q = getRandomBankQuestion("product-design", allButOne);
    expect(q).not.toBeNull();
    expect(q!.id).toBe(allDesign[0].id);
  });

  it("resets when pool is exhausted", () => {
    const allDesign = getBankQuestionsForType("product-design");
    const allIds = allDesign.map((q) => q.id);
    const q = getRandomBankQuestion("product-design", allIds);
    // Should still return something (reset behavior)
    expect(q).not.toBeNull();
  });
});

describe("getBankQuestionsForType", () => {
  it("returns questions for known types", () => {
    const qs = getBankQuestionsForType("behavioral");
    expect(qs.length).toBeGreaterThan(0);
  });
});
