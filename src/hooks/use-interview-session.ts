"use client";

import { useReducer, useEffect, useCallback, useState } from "react";
import type {
  InterviewSessionState,
  InterviewScreen,
  InterviewMode,
  SessionConfig,
  Question,
  Feedback,
  ModelAnswer,
  SessionEntry,
} from "@/types/interview";
import type { InterviewQuestionType } from "@/lib/prompts/interview";
import {
  INTERVIEW_HISTORY_KEY,
  MAX_INTERVIEW_HISTORY,
} from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type SessionAction =
  | { type: "SELECT_MODE"; payload: InterviewMode }
  | { type: "START_SESSION"; payload: SessionConfig }
  | { type: "SET_QUESTION"; payload: Question }
  | { type: "SET_ANSWER"; payload: string }
  | { type: "SUBMIT_ANSWER" }
  | { type: "SET_RESULTS"; payload: { feedback: Feedback; modelAnswer: ModelAnswer } }
  | { type: "NEXT_QUESTION" }
  | { type: "END_SESSION" }
  | { type: "GO_HOME" }
  | { type: "HYDRATE"; payload: SessionEntry[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SCREEN"; payload: InterviewScreen };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: InterviewSessionState = {
  screen: "home",
  mode: null,
  config: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  currentAnswer: "",
  currentFeedback: null,
  currentModelAnswer: null,
  questionsUsed: [],
  sessionEntries: [],
  history: [],
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function sessionReducer(
  state: InterviewSessionState,
  action: SessionAction
): InterviewSessionState {
  switch (action.type) {
    case "SELECT_MODE":
      return { ...state, screen: "setup", mode: action.payload, error: null };

    case "START_SESSION":
      return {
        ...state,
        screen: "active",
        config: action.payload,
        currentQuestionIndex: 0,
        currentQuestion: null,
        currentAnswer: "",
        currentFeedback: null,
        currentModelAnswer: null,
        questionsUsed: [],
        sessionEntries: [],
        isLoading: true,
        error: null,
      };

    case "SET_QUESTION":
      return {
        ...state,
        currentQuestion: action.payload,
        questionsUsed: [...state.questionsUsed, action.payload.id],
        isLoading: false,
      };

    case "SET_ANSWER":
      return { ...state, currentAnswer: action.payload };

    case "SUBMIT_ANSWER":
      return { ...state, screen: "analyzing", isLoading: true, error: null };

    case "SET_RESULTS": {
      const entry: SessionEntry = {
        company: state.currentQuestion?.company ?? "General",
        type: state.currentQuestion?.type ?? "product-design",
        question: state.currentQuestion?.text ?? "",
        answer: state.currentAnswer,
        score: action.payload.feedback.score,
        scoreLabel: action.payload.feedback.scoreLabel,
        timestamp: new Date().toISOString(),
      };

      const newHistory = [entry, ...state.history].slice(
        0,
        MAX_INTERVIEW_HISTORY
      );

      return {
        ...state,
        screen: "results",
        currentFeedback: action.payload.feedback,
        currentModelAnswer: action.payload.modelAnswer,
        sessionEntries: [...state.sessionEntries, entry],
        history: newHistory,
        isLoading: false,
      };
    }

    case "NEXT_QUESTION":
      return {
        ...state,
        screen: "active",
        currentQuestionIndex: state.currentQuestionIndex + 1,
        currentQuestion: null,
        currentAnswer: "",
        currentFeedback: null,
        currentModelAnswer: null,
        isLoading: true,
        error: null,
      };

    case "END_SESSION":
    case "GO_HOME":
      return {
        ...initialState,
        history: state.history,
      };

    case "HYDRATE":
      return { ...state, history: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_SCREEN":
      return { ...state, screen: action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useInterviewSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(INTERVIEW_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SessionEntry[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // corrupted — start fresh
    }
    setIsHydrated(true);
  }, []);

  // Persist history to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        INTERVIEW_HISTORY_KEY,
        JSON.stringify(state.history)
      );
    } catch {
      // localStorage full
    }
  }, [state.history, isHydrated]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const currentType: InterviewQuestionType | null =
    state.config
      ? state.config.types[
          state.currentQuestionIndex % state.config.types.length
        ]
      : null;

  const totalQuestions =
    state.config?.count === "infinite" ? null : (state.config?.count ?? null);

  const isSessionComplete =
    totalQuestions !== null &&
    state.currentQuestionIndex >= totalQuestions &&
    state.screen === "results";

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const selectMode = useCallback(
    (mode: InterviewMode) => dispatch({ type: "SELECT_MODE", payload: mode }),
    []
  );

  const startSession = useCallback(
    (config: SessionConfig) => dispatch({ type: "START_SESSION", payload: config }),
    []
  );

  const setQuestion = useCallback(
    (q: Question) => dispatch({ type: "SET_QUESTION", payload: q }),
    []
  );

  const setAnswer = useCallback(
    (answer: string) => dispatch({ type: "SET_ANSWER", payload: answer }),
    []
  );

  const submitAnswer = useCallback(
    () => dispatch({ type: "SUBMIT_ANSWER" }),
    []
  );

  const setResults = useCallback(
    (feedback: Feedback, modelAnswer: ModelAnswer) =>
      dispatch({ type: "SET_RESULTS", payload: { feedback, modelAnswer } }),
    []
  );

  const nextQuestion = useCallback(
    () => dispatch({ type: "NEXT_QUESTION" }),
    []
  );

  const endSession = useCallback(
    () => dispatch({ type: "END_SESSION" }),
    []
  );

  const goHome = useCallback(
    () => dispatch({ type: "GO_HOME" }),
    []
  );

  const setLoading = useCallback(
    (loading: boolean) => dispatch({ type: "SET_LOADING", payload: loading }),
    []
  );

  const setError = useCallback(
    (error: string | null) => dispatch({ type: "SET_ERROR", payload: error }),
    []
  );

  return {
    state,
    currentType,
    totalQuestions,
    isSessionComplete,
    selectMode,
    startSession,
    setQuestion,
    setAnswer,
    submitAnswer,
    setResults,
    nextQuestion,
    endSession,
    goHome,
    setLoading,
    setError,
  };
}
