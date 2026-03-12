"use client";

import { useReducer, useEffect, useCallback, useState } from "react";
import type {
  ResumeBranch,
  BranchesState,
  Suggestion,
  BranchChatMessage,
} from "@/types/resume-branch";
import type { ResumeContent } from "@/lib/resume/docx-builder";
import {
  BRANCH_STORAGE_KEY,
  MAX_BRANCHES,
} from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type BranchAction =
  | { type: "HYDRATE"; payload: BranchesState }
  | { type: "ADD_BRANCH"; payload: ResumeBranch }
  | { type: "REMOVE_BRANCH"; payload: string }
  | { type: "SET_ACTIVE"; payload: string }
  | { type: "UPDATE_BRANCH_META"; payload: { branchId: string; jobTitle?: string; company?: string } }
  | {
      type: "UPDATE_SUGGESTION";
      payload: {
        branchId: string;
        suggestionId: string;
        status: "accepted" | "rejected";
      };
    }
  | { type: "SET_SUGGESTIONS"; payload: { branchId: string; suggestions: Suggestion[] } }
  | {
      type: "ADD_CHAT_MESSAGE";
      payload: { branchId: string; message: BranchChatMessage };
    }
  | {
      type: "APPLY_REWRITE";
      payload: { branchId: string; newContent: ResumeContent };
    }
  | { type: "ACCEPT_ALL"; payload: string }
  | { type: "REJECT_ALL"; payload: string };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState: BranchesState = {
  branches: [],
  activeBranchId: null,
};

function updateBranch(
  state: BranchesState,
  branchId: string,
  updater: (branch: ResumeBranch) => ResumeBranch
): BranchesState {
  return {
    ...state,
    branches: state.branches.map((b) =>
      b.id === branchId ? updater(b) : b
    ),
  };
}

function branchesReducer(
  state: BranchesState,
  action: BranchAction
): BranchesState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "ADD_BRANCH": {
      if (state.branches.length >= MAX_BRANCHES) return state;
      return {
        branches: [...state.branches, action.payload],
        activeBranchId: action.payload.id,
      };
    }

    case "REMOVE_BRANCH": {
      const remaining = state.branches.filter(
        (b) => b.id !== action.payload
      );
      return {
        branches: remaining,
        activeBranchId:
          state.activeBranchId === action.payload
            ? remaining[0]?.id ?? null
            : state.activeBranchId,
      };
    }

    case "SET_ACTIVE":
      return { ...state, activeBranchId: action.payload };

    case "UPDATE_BRANCH_META":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        ...(action.payload.jobTitle !== undefined && { jobTitle: action.payload.jobTitle }),
        ...(action.payload.company !== undefined && { company: action.payload.company }),
      }));

    case "UPDATE_SUGGESTION":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        suggestions: b.suggestions.map((s) =>
          s.id === action.payload.suggestionId
            ? { ...s, status: action.payload.status }
            : s
        ),
      }));

    case "SET_SUGGESTIONS":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        suggestions: action.payload.suggestions,
      }));

    case "ADD_CHAT_MESSAGE":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        chatHistory: [...b.chatHistory.slice(-19), action.payload.message],
      }));

    case "APPLY_REWRITE":
      return updateBranch(state, action.payload.branchId, (b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        content: action.payload.newContent,
        suggestions: [],
      }));

    case "ACCEPT_ALL":
      return updateBranch(state, action.payload, (b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        suggestions: b.suggestions.map((s) =>
          s.status === "pending" ? { ...s, status: "accepted" } : s
        ),
      }));

    case "REJECT_ALL":
      return updateBranch(state, action.payload, (b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        suggestions: b.suggestions.map((s) =>
          s.status === "pending" ? { ...s, status: "rejected" } : s
        ),
      }));

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBranches() {
  const [state, dispatch] = useReducer(branchesReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BRANCH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BranchesState;
        if (parsed.branches && Array.isArray(parsed.branches)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // Corrupted data — start fresh
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on change (skip before hydration to avoid clearing)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full — silently fail
    }
  }, [state, isHydrated]);

  const activeBranch = state.branches.find(
    (b) => b.id === state.activeBranchId
  ) ?? null;

  const acceptedCount = activeBranch
    ? activeBranch.suggestions.filter((s) => s.status === "accepted").length
    : 0;

  const pendingCount = activeBranch
    ? activeBranch.suggestions.filter((s) => s.status === "pending").length
    : 0;

  const canApply = acceptedCount > 0;

  const addBranch = useCallback(
    (branch: ResumeBranch) =>
      dispatch({ type: "ADD_BRANCH", payload: branch }),
    []
  );

  const removeBranch = useCallback(
    (branchId: string) =>
      dispatch({ type: "REMOVE_BRANCH", payload: branchId }),
    []
  );

  const setActive = useCallback(
    (branchId: string) =>
      dispatch({ type: "SET_ACTIVE", payload: branchId }),
    []
  );

  const updateSuggestion = useCallback(
    (branchId: string, suggestionId: string, status: "accepted" | "rejected") =>
      dispatch({
        type: "UPDATE_SUGGESTION",
        payload: { branchId, suggestionId, status },
      }),
    []
  );

  const setSuggestions = useCallback(
    (branchId: string, suggestions: Suggestion[]) =>
      dispatch({
        type: "SET_SUGGESTIONS",
        payload: { branchId, suggestions },
      }),
    []
  );

  const addChatMessage = useCallback(
    (branchId: string, message: BranchChatMessage) =>
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: { branchId, message },
      }),
    []
  );

  const applyRewrite = useCallback(
    (branchId: string, newContent: ResumeContent) =>
      dispatch({
        type: "APPLY_REWRITE",
        payload: { branchId, newContent },
      }),
    []
  );

  const acceptAll = useCallback(
    (branchId: string) =>
      dispatch({ type: "ACCEPT_ALL", payload: branchId }),
    []
  );

  const rejectAll = useCallback(
    (branchId: string) =>
      dispatch({ type: "REJECT_ALL", payload: branchId }),
    []
  );

  const updateBranchMeta = useCallback(
    (branchId: string, meta: { jobTitle?: string; company?: string }) =>
      dispatch({ type: "UPDATE_BRANCH_META", payload: { branchId, ...meta } }),
    []
  );

  return {
    state,
    activeBranch,
    acceptedCount,
    pendingCount,
    canApply,
    addBranch,
    removeBranch,
    setActive,
    updateSuggestion,
    setSuggestions,
    addChatMessage,
    applyRewrite,
    acceptAll,
    rejectAll,
    updateBranchMeta,
  };
}
