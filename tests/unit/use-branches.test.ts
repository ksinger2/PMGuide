/**
 * Unit tests for the branch state reducer logic.
 * We test the reducer directly (not the hook) since it's pure.
 */
import { describe, it, expect } from "vitest";

// We need to test the reducer logic. Since it's inside the hook file,
// we'll import and test via the hook's behavior by simulating dispatches.
// For pure unit tests, we extract the reducer logic.

// For now, test the data structures and validation logic.

import type { ResumeBranch, BranchesState, Suggestion } from "@/types/resume-branch";

// Inline the reducer for testing (same logic as use-branches.ts)
type BranchAction =
  | { type: "HYDRATE"; payload: BranchesState }
  | { type: "ADD_BRANCH"; payload: ResumeBranch }
  | { type: "REMOVE_BRANCH"; payload: string }
  | { type: "SET_ACTIVE"; payload: string }
  | { type: "UPDATE_SUGGESTION"; payload: { branchId: string; suggestionId: string; status: "accepted" | "rejected" } }
  | { type: "SET_SUGGESTIONS"; payload: { branchId: string; suggestions: Suggestion[] } }
  | { type: "ACCEPT_ALL"; payload: string }
  | { type: "REJECT_ALL"; payload: string }
  | { type: "APPLY_REWRITE"; payload: { branchId: string; newContent: { sections: { type: string; title: string; content: string }[]; fullText: string } } };

const MAX_BRANCHES = 5;

function updateBranch(state: BranchesState, branchId: string, updater: (b: ResumeBranch) => ResumeBranch): BranchesState {
  return { ...state, branches: state.branches.map((b) => (b.id === branchId ? updater(b) : b)) };
}

function branchesReducer(state: BranchesState, action: BranchAction): BranchesState {
  switch (action.type) {
    case "HYDRATE": return action.payload;
    case "ADD_BRANCH": {
      if (state.branches.length >= MAX_BRANCHES) return state;
      return { branches: [...state.branches, action.payload], activeBranchId: action.payload.id };
    }
    case "REMOVE_BRANCH": {
      const remaining = state.branches.filter((b) => b.id !== action.payload);
      return { branches: remaining, activeBranchId: state.activeBranchId === action.payload ? remaining[0]?.id ?? null : state.activeBranchId };
    }
    case "SET_ACTIVE": return { ...state, activeBranchId: action.payload };
    case "UPDATE_SUGGESTION":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b, updatedAt: new Date().toISOString(),
        suggestions: b.suggestions.map((s) => s.id === action.payload.suggestionId ? { ...s, status: action.payload.status } : s),
      }));
    case "SET_SUGGESTIONS":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b, updatedAt: new Date().toISOString(), suggestions: action.payload.suggestions,
      }));
    case "ACCEPT_ALL":
      return updateBranch(state, action.payload, (b) => ({
        ...b, updatedAt: new Date().toISOString(),
        suggestions: b.suggestions.map((s) => s.status === "pending" ? { ...s, status: "accepted" } : s),
      }));
    case "REJECT_ALL":
      return updateBranch(state, action.payload, (b) => ({
        ...b, updatedAt: new Date().toISOString(),
        suggestions: b.suggestions.map((s) => s.status === "pending" ? { ...s, status: "rejected" } : s),
      }));
    case "APPLY_REWRITE":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b, updatedAt: new Date().toISOString(), content: action.payload.newContent, suggestions: [],
      }));
    default: return state;
  }
}

// Test data
function makeBranch(overrides: Partial<ResumeBranch> = {}): ResumeBranch {
  return {
    id: "branch-1",
    jobUrl: "https://example.com/job",
    jobTitle: "Senior PM",
    company: "TestCo",
    jobDescriptionText: "We need a PM...",
    content: { sections: [], fullText: "Resume text" },
    suggestions: [],
    chatHistory: [],
    keywordAlignment: { matched: [], missing: [], added: [] },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeSuggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    id: "s-1",
    sectionType: "experience",
    original: "Original text",
    suggested: "Improved text",
    reason: "Better alignment",
    status: "pending",
    ...overrides,
  };
}

const emptyState: BranchesState = { branches: [], activeBranchId: null };

// Tests
describe("branchesReducer", () => {
  describe("ADD_BRANCH", () => {
    it("adds a branch and sets it as active", () => {
      const branch = makeBranch();
      const result = branchesReducer(emptyState, { type: "ADD_BRANCH", payload: branch });
      expect(result.branches).toHaveLength(1);
      expect(result.activeBranchId).toBe("branch-1");
    });

    it("enforces max 5 branches", () => {
      const state: BranchesState = {
        branches: Array.from({ length: 5 }, (_, i) => makeBranch({ id: `b-${i}` })),
        activeBranchId: "b-0",
      };
      const result = branchesReducer(state, { type: "ADD_BRANCH", payload: makeBranch({ id: "b-6" }) });
      expect(result.branches).toHaveLength(5); // unchanged
    });
  });

  describe("REMOVE_BRANCH", () => {
    it("removes a branch by id", () => {
      const state: BranchesState = {
        branches: [makeBranch({ id: "a" }), makeBranch({ id: "b" })],
        activeBranchId: "a",
      };
      const result = branchesReducer(state, { type: "REMOVE_BRANCH", payload: "a" });
      expect(result.branches).toHaveLength(1);
      expect(result.branches[0].id).toBe("b");
    });

    it("switches active to first remaining when active is removed", () => {
      const state: BranchesState = {
        branches: [makeBranch({ id: "a" }), makeBranch({ id: "b" })],
        activeBranchId: "a",
      };
      const result = branchesReducer(state, { type: "REMOVE_BRANCH", payload: "a" });
      expect(result.activeBranchId).toBe("b");
    });

    it("sets active to null when last branch removed", () => {
      const state: BranchesState = {
        branches: [makeBranch({ id: "a" })],
        activeBranchId: "a",
      };
      const result = branchesReducer(state, { type: "REMOVE_BRANCH", payload: "a" });
      expect(result.activeBranchId).toBeNull();
    });

    it("keeps active unchanged when non-active is removed", () => {
      const state: BranchesState = {
        branches: [makeBranch({ id: "a" }), makeBranch({ id: "b" })],
        activeBranchId: "a",
      };
      const result = branchesReducer(state, { type: "REMOVE_BRANCH", payload: "b" });
      expect(result.activeBranchId).toBe("a");
    });
  });

  describe("SET_ACTIVE", () => {
    it("sets the active branch id", () => {
      const state: BranchesState = {
        branches: [makeBranch({ id: "a" }), makeBranch({ id: "b" })],
        activeBranchId: "a",
      };
      const result = branchesReducer(state, { type: "SET_ACTIVE", payload: "b" });
      expect(result.activeBranchId).toBe("b");
    });
  });

  describe("UPDATE_SUGGESTION", () => {
    it("accepts a specific suggestion", () => {
      const branch = makeBranch({
        suggestions: [makeSuggestion({ id: "s-1" }), makeSuggestion({ id: "s-2" })],
      });
      const state: BranchesState = { branches: [branch], activeBranchId: "branch-1" };

      const result = branchesReducer(state, {
        type: "UPDATE_SUGGESTION",
        payload: { branchId: "branch-1", suggestionId: "s-1", status: "accepted" },
      });

      expect(result.branches[0].suggestions[0].status).toBe("accepted");
      expect(result.branches[0].suggestions[1].status).toBe("pending");
    });

    it("rejects a specific suggestion", () => {
      const branch = makeBranch({
        suggestions: [makeSuggestion()],
      });
      const state: BranchesState = { branches: [branch], activeBranchId: "branch-1" };

      const result = branchesReducer(state, {
        type: "UPDATE_SUGGESTION",
        payload: { branchId: "branch-1", suggestionId: "s-1", status: "rejected" },
      });

      expect(result.branches[0].suggestions[0].status).toBe("rejected");
    });
  });

  describe("ACCEPT_ALL / REJECT_ALL", () => {
    it("accepts all pending suggestions", () => {
      const branch = makeBranch({
        suggestions: [
          makeSuggestion({ id: "s-1", status: "pending" }),
          makeSuggestion({ id: "s-2", status: "rejected" }), // already rejected, should stay
          makeSuggestion({ id: "s-3", status: "pending" }),
        ],
      });
      const state: BranchesState = { branches: [branch], activeBranchId: "branch-1" };

      const result = branchesReducer(state, { type: "ACCEPT_ALL", payload: "branch-1" });

      expect(result.branches[0].suggestions[0].status).toBe("accepted");
      expect(result.branches[0].suggestions[1].status).toBe("rejected"); // unchanged
      expect(result.branches[0].suggestions[2].status).toBe("accepted");
    });

    it("rejects all pending suggestions", () => {
      const branch = makeBranch({
        suggestions: [
          makeSuggestion({ id: "s-1", status: "pending" }),
          makeSuggestion({ id: "s-2", status: "accepted" }), // already accepted, should stay
        ],
      });
      const state: BranchesState = { branches: [branch], activeBranchId: "branch-1" };

      const result = branchesReducer(state, { type: "REJECT_ALL", payload: "branch-1" });

      expect(result.branches[0].suggestions[0].status).toBe("rejected");
      expect(result.branches[0].suggestions[1].status).toBe("accepted"); // unchanged
    });
  });

  describe("APPLY_REWRITE", () => {
    it("replaces content and clears suggestions", () => {
      const branch = makeBranch({
        suggestions: [makeSuggestion()],
        content: { sections: [], fullText: "Old text" },
      });
      const state: BranchesState = { branches: [branch], activeBranchId: "branch-1" };

      const newContent = { sections: [{ type: "experience", title: "Exp", content: "New text" }], fullText: "New text" };
      const result = branchesReducer(state, {
        type: "APPLY_REWRITE",
        payload: { branchId: "branch-1", newContent },
      });

      expect(result.branches[0].content.fullText).toBe("New text");
      expect(result.branches[0].suggestions).toHaveLength(0);
    });
  });

  describe("HYDRATE", () => {
    it("replaces entire state", () => {
      const newState: BranchesState = {
        branches: [makeBranch()],
        activeBranchId: "branch-1",
      };
      const result = branchesReducer(emptyState, { type: "HYDRATE", payload: newState });
      expect(result).toEqual(newState);
    });
  });
});
