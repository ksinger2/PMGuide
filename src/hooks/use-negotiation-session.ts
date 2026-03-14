"use client";

import { useReducer, useEffect, useCallback, useState } from "react";
import type {
  NegotiationSessionState,
  NegotiationScreen,
  NegotiationMode,
  SimulatorConfig,
  NegotiationTurn,
  CoachNote,
  BudgetCeiling,
  NegotiationFeedback,
  ExpertNegotiation,
  NegotiationCompany,
  ScenarioType,
  DifficultyLevel,
  CalculatorOffer,
  NegotiationHistoryEntry,
  CrafterContext,
} from "@/types/negotiation";
import {
  NEGOTIATE_HISTORY_KEY,
  MAX_NEGOTIATE_HISTORY,
} from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type SessionAction =
  | { type: "SELECT_MODE"; payload: NegotiationMode }
  | { type: "START_SIMULATOR"; payload: { config: SimulatorConfig; scenarioContext: string; budgetCeiling: BudgetCeiling } }
  | { type: "ADD_TURN"; payload: NegotiationTurn }
  | { type: "SET_CURRENT_MESSAGE"; payload: string }
  | { type: "ADD_COACH_NOTE"; payload: CoachNote }
  | { type: "END_NEGOTIATION" }
  | { type: "SET_FEEDBACK"; payload: NegotiationFeedback }
  | { type: "START_EXPERT"; payload: { company: NegotiationCompany; scenario: ScenarioType; difficulty: DifficultyLevel } }
  | { type: "SET_EXPERT_NEGOTIATION"; payload: ExpertNegotiation }
  | { type: "ADD_CHAT_MESSAGE"; payload: { role: "user" | "assistant"; content: string } }
  | { type: "SET_CALCULATOR_OFFERS"; payload: CalculatorOffer[] }
  | { type: "SET_TIP_CATEGORY"; payload: string | null }
  | { type: "START_CRAFTER"; payload: CrafterContext }
  | { type: "SET_CRAFTER_MESSAGES"; payload: Array<{ role: "user" | "assistant"; content: string }> }
  | { type: "GO_HOME" }
  | { type: "HYDRATE"; payload: NegotiationHistoryEntry[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SCREEN"; payload: NegotiationScreen };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: NegotiationSessionState = {
  screen: "home",
  mode: null,
  config: null,
  turns: [],
  currentMessage: "",
  budgetCeiling: null,
  scenarioContext: "",
  coachNotes: [],
  currentFeedback: null,
  currentModelNegotiation: null,
  expertConfig: null,
  chatMessages: [],
  calculatorOffers: [],
  activeTipCategory: null,
  crafterContext: null,
  crafterMessages: [],
  history: [],
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function sessionReducer(
  state: NegotiationSessionState,
  action: SessionAction
): NegotiationSessionState {
  switch (action.type) {
    case "SELECT_MODE": {
      const screenMap: Record<NegotiationMode, NegotiationScreen> = {
        simulator: "setup",
        expert: "expert-setup",
        coach: "coach",
        tips: "tips",
        calculator: "calculator",
        crafter: "crafter-setup",
      };
      return {
        ...state,
        screen: screenMap[action.payload],
        mode: action.payload,
        error: null,
      };
    }

    case "START_SIMULATOR":
      return {
        ...state,
        screen: "active",
        config: action.payload.config,
        scenarioContext: action.payload.scenarioContext,
        budgetCeiling: action.payload.budgetCeiling,
        turns: [],
        currentMessage: "",
        coachNotes: [],
        currentFeedback: null,
        isLoading: false,
        error: null,
      };

    case "ADD_TURN":
      return {
        ...state,
        turns: [...state.turns, action.payload],
        currentMessage: "",
        isLoading: false,
      };

    case "SET_CURRENT_MESSAGE":
      return { ...state, currentMessage: action.payload };

    case "ADD_COACH_NOTE":
      return {
        ...state,
        coachNotes: [...state.coachNotes, action.payload],
      };

    case "END_NEGOTIATION":
      return { ...state, screen: "analyzing", isLoading: true, error: null };

    case "SET_FEEDBACK": {
      const entry: NegotiationHistoryEntry = {
        id: Date.now().toString(),
        mode: "simulator",
        company: state.config?.company ?? "any",
        scenario: state.config?.scenario,
        score: action.payload.score,
        scoreLabel: action.payload.scoreLabel,
        summary: action.payload.overall,
        timestamp: new Date().toISOString(),
      };
      const newHistory = [entry, ...state.history].slice(0, MAX_NEGOTIATE_HISTORY);
      return {
        ...state,
        screen: "results",
        currentFeedback: action.payload,
        history: newHistory,
        isLoading: false,
      };
    }

    case "START_EXPERT":
      return {
        ...state,
        screen: "expert-viewing",
        expertConfig: action.payload,
        currentModelNegotiation: null,
        isLoading: true,
        error: null,
      };

    case "SET_EXPERT_NEGOTIATION": {
      const entry: NegotiationHistoryEntry = {
        id: Date.now().toString(),
        mode: "expert",
        company: state.expertConfig?.company ?? "any",
        scenario: state.expertConfig?.scenario,
        summary: action.payload.summary,
        timestamp: new Date().toISOString(),
      };
      const newHistory = [entry, ...state.history].slice(0, MAX_NEGOTIATE_HISTORY);
      return {
        ...state,
        currentModelNegotiation: action.payload,
        history: newHistory,
        isLoading: false,
      };
    }

    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
        isLoading: false,
      };

    case "SET_CALCULATOR_OFFERS":
      return { ...state, calculatorOffers: action.payload };

    case "SET_TIP_CATEGORY":
      return { ...state, activeTipCategory: action.payload };

    case "START_CRAFTER":
      return {
        ...state,
        screen: "crafter-active",
        crafterContext: action.payload,
        crafterMessages: [],
        isLoading: false,
        error: null,
      };

    case "SET_CRAFTER_MESSAGES":
      return { ...state, crafterMessages: action.payload };

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

export function useNegotiationSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NEGOTIATE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NegotiationHistoryEntry[];
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
        NEGOTIATE_HISTORY_KEY,
        JSON.stringify(state.history)
      );
    } catch {
      // localStorage full
    }
  }, [state.history, isHydrated]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const selectMode = useCallback(
    (mode: NegotiationMode) => dispatch({ type: "SELECT_MODE", payload: mode }),
    []
  );

  const startSimulator = useCallback(
    (config: SimulatorConfig, scenarioContext: string, budgetCeiling: BudgetCeiling) =>
      dispatch({ type: "START_SIMULATOR", payload: { config, scenarioContext, budgetCeiling } }),
    []
  );

  const addTurn = useCallback(
    (turn: NegotiationTurn) => dispatch({ type: "ADD_TURN", payload: turn }),
    []
  );

  const setCurrentMessage = useCallback(
    (msg: string) => dispatch({ type: "SET_CURRENT_MESSAGE", payload: msg }),
    []
  );

  const addCoachNote = useCallback(
    (note: CoachNote) => dispatch({ type: "ADD_COACH_NOTE", payload: note }),
    []
  );

  const endNegotiation = useCallback(
    () => dispatch({ type: "END_NEGOTIATION" }),
    []
  );

  const setFeedback = useCallback(
    (feedback: NegotiationFeedback) => dispatch({ type: "SET_FEEDBACK", payload: feedback }),
    []
  );

  const startExpert = useCallback(
    (company: NegotiationCompany, scenario: ScenarioType, difficulty: DifficultyLevel) =>
      dispatch({ type: "START_EXPERT", payload: { company, scenario, difficulty } }),
    []
  );

  const setExpertNegotiation = useCallback(
    (negotiation: ExpertNegotiation) =>
      dispatch({ type: "SET_EXPERT_NEGOTIATION", payload: negotiation }),
    []
  );

  const addChatMessage = useCallback(
    (role: "user" | "assistant", content: string) =>
      dispatch({ type: "ADD_CHAT_MESSAGE", payload: { role, content } }),
    []
  );

  const setCalculatorOffers = useCallback(
    (offers: CalculatorOffer[]) => dispatch({ type: "SET_CALCULATOR_OFFERS", payload: offers }),
    []
  );

  const setTipCategory = useCallback(
    (category: string | null) => dispatch({ type: "SET_TIP_CATEGORY", payload: category }),
    []
  );

  const startCrafter = useCallback(
    (context: CrafterContext) => dispatch({ type: "START_CRAFTER", payload: context }),
    []
  );

  const setCrafterMessages = useCallback(
    (msgs: Array<{ role: "user" | "assistant"; content: string }>) =>
      dispatch({ type: "SET_CRAFTER_MESSAGES", payload: msgs }),
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

  const setScreen = useCallback(
    (screen: NegotiationScreen) => dispatch({ type: "SET_SCREEN", payload: screen }),
    []
  );

  return {
    state,
    selectMode,
    startSimulator,
    addTurn,
    setCurrentMessage,
    addCoachNote,
    endNegotiation,
    setFeedback,
    startExpert,
    setExpertNegotiation,
    addChatMessage,
    setCalculatorOffers,
    setTipCategory,
    startCrafter,
    setCrafterMessages,
    goHome,
    setLoading,
    setError,
    setScreen,
  };
}
