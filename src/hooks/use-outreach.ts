"use client";

import { useReducer, useEffect, useCallback, useState } from "react";
import type {
  OutreachState,
  OutreachScreen,
  AudienceType,
  OutreachContext,
  OutreachMessage,
  OutreachDraft,
} from "@/types/outreach";
import {
  OUTREACH_STORAGE_KEY,
  MAX_OUTREACH_DRAFTS,
  MAX_OUTREACH_MESSAGES,
} from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type OutreachAction =
  | { type: "HYDRATE"; payload: OutreachDraft[] }
  | { type: "SELECT_AUDIENCE"; payload: AudienceType }
  | { type: "START_DRAFT"; payload: { context: OutreachContext } }
  | { type: "ADD_MESSAGE"; payload: { draftId: string; message: OutreachMessage } }
  | { type: "SET_MESSAGES"; payload: { draftId: string; messages: OutreachMessage[] } }
  | { type: "RESUME_DRAFT"; payload: string }
  | { type: "DELETE_DRAFT"; payload: string }
  | { type: "GO_HOME" };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: OutreachState = {
  screen: "home",
  audienceType: null,
  drafts: [],
  activeDraftId: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function outreachReducer(
  state: OutreachState,
  action: OutreachAction
): OutreachState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, drafts: action.payload };

    case "SELECT_AUDIENCE":
      return {
        ...state,
        screen: "setup",
        audienceType: action.payload,
      };

    case "START_DRAFT": {
      const draft: OutreachDraft = {
        id: Date.now().toString(),
        context: action.payload.context,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const drafts = [draft, ...state.drafts].slice(0, MAX_OUTREACH_DRAFTS);
      return {
        ...state,
        screen: "active",
        drafts,
        activeDraftId: draft.id,
      };
    }

    case "ADD_MESSAGE": {
      const drafts = state.drafts.map((d) => {
        if (d.id !== action.payload.draftId) return d;
        const messages = [...d.messages, action.payload.message].slice(
          -MAX_OUTREACH_MESSAGES
        );
        return { ...d, messages, updatedAt: new Date().toISOString() };
      });
      return { ...state, drafts };
    }

    case "SET_MESSAGES": {
      const drafts = state.drafts.map((d) => {
        if (d.id !== action.payload.draftId) return d;
        return {
          ...d,
          messages: action.payload.messages.slice(-MAX_OUTREACH_MESSAGES),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, drafts };
    }

    case "RESUME_DRAFT":
      return {
        ...state,
        screen: "active",
        activeDraftId: action.payload,
        audienceType:
          state.drafts.find((d) => d.id === action.payload)?.context
            .audienceType ?? null,
      };

    case "DELETE_DRAFT": {
      const drafts = state.drafts.filter((d) => d.id !== action.payload);
      const wasActive = state.activeDraftId === action.payload;
      return {
        ...state,
        drafts,
        activeDraftId: wasActive ? null : state.activeDraftId,
        screen: wasActive ? "home" : state.screen,
      };
    }

    case "GO_HOME":
      return {
        ...state,
        screen: "home",
        audienceType: null,
        activeDraftId: null,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOutreach() {
  const [state, dispatch] = useReducer(outreachReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(OUTREACH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OutreachDraft[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // start fresh
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(OUTREACH_STORAGE_KEY, JSON.stringify(state.drafts));
    } catch {
      // localStorage full
    }
  }, [state.drafts, isHydrated]);

  // Actions
  const selectAudience = useCallback(
    (type: AudienceType) => dispatch({ type: "SELECT_AUDIENCE", payload: type }),
    []
  );

  const startDraft = useCallback(
    (context: OutreachContext) =>
      dispatch({ type: "START_DRAFT", payload: { context } }),
    []
  );

  const addMessage = useCallback(
    (draftId: string, message: OutreachMessage) =>
      dispatch({ type: "ADD_MESSAGE", payload: { draftId, message } }),
    []
  );

  const setMessages = useCallback(
    (draftId: string, messages: OutreachMessage[]) =>
      dispatch({ type: "SET_MESSAGES", payload: { draftId, messages } }),
    []
  );

  const resumeDraft = useCallback(
    (draftId: string) => dispatch({ type: "RESUME_DRAFT", payload: draftId }),
    []
  );

  const deleteDraft = useCallback(
    (draftId: string) => dispatch({ type: "DELETE_DRAFT", payload: draftId }),
    []
  );

  const goHome = useCallback(() => dispatch({ type: "GO_HOME" }), []);

  return {
    state,
    selectAudience,
    startDraft,
    addMessage,
    setMessages,
    resumeDraft,
    deleteDraft,
    goHome,
  };
}
