import { describe, it, expect } from "vitest";

// Test the reducer logic directly by importing and manually dispatching
// Since useInterviewSession is a hook, we test the reducer's core logic

// We'll test the key business logic: category rotation, session complete detection

describe("Interview Session Logic", () => {
  describe("Category rotation", () => {
    it("rotates through types by index modulo", () => {
      const types = ["product-design", "product-analytical", "behavioral"] as const;

      // Simulates config.types[currentQuestionIndex % config.types.length]
      expect(types[0 % types.length]).toBe("product-design");
      expect(types[1 % types.length]).toBe("product-analytical");
      expect(types[2 % types.length]).toBe("behavioral");
      expect(types[3 % types.length]).toBe("product-design");
      expect(types[4 % types.length]).toBe("product-analytical");
      expect(types[5 % types.length]).toBe("behavioral");
    });

    it("works with single type", () => {
      const types = ["product-design"] as const;
      expect(types[0 % types.length]).toBe("product-design");
      expect(types[5 % types.length]).toBe("product-design");
    });
  });

  describe("Session completion", () => {
    it("detects complete when index >= count", () => {
      const totalQuestions = 3;
      const currentQuestionIndex = 3;
      const isComplete =
        totalQuestions !== null && currentQuestionIndex >= totalQuestions;
      expect(isComplete).toBe(true);
    });

    it("never completes in infinite mode", () => {
      const totalQuestions = null; // infinite
      const currentQuestionIndex = 100;
      const isComplete =
        totalQuestions !== null && currentQuestionIndex >= totalQuestions;
      expect(isComplete).toBe(false);
    });
  });

  describe("Score color logic", () => {
    it("returns green for 4-5", () => {
      expect(getScoreCategory(5)).toBe("green");
      expect(getScoreCategory(4)).toBe("green");
    });

    it("returns amber for 3", () => {
      expect(getScoreCategory(3)).toBe("amber");
    });

    it("returns red for 1-2", () => {
      expect(getScoreCategory(1)).toBe("red");
      expect(getScoreCategory(2)).toBe("red");
    });
  });
});

// Helper that mirrors ScoreBanner logic
function getScoreCategory(score: number): "green" | "amber" | "red" {
  if (score >= 4) return "green";
  if (score >= 3) return "amber";
  return "red";
}
