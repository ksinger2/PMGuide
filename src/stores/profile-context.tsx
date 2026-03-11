"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import {
  type UserProfile,
  createEmptyProfile,
  calculateCompleteness,
} from "@/lib/utils/profile";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface ProfileState {
  profile: UserProfile | null;
  completeness: number;
  isLoaded: boolean;
}

const initialState: ProfileState = {
  profile: null,
  completeness: 0,
  isLoaded: false,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type ProfileAction =
  | { type: "LOAD_PROFILE"; payload: UserProfile }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "SET_LOADED" }
  | { type: "RESET" };

function profileReducer(
  state: ProfileState,
  action: ProfileAction
): ProfileState {
  switch (action.type) {
    case "LOAD_PROFILE": {
      const profile = action.payload;
      return {
        profile,
        completeness: calculateCompleteness(profile),
        isLoaded: true,
      };
    }
    case "UPDATE_PROFILE": {
      const profile = state.profile
        ? { ...state.profile, ...action.payload }
        : { ...createEmptyProfile(), ...action.payload };
      return {
        ...state,
        profile,
        completeness: calculateCompleteness(profile),
      };
    }
    case "SET_LOADED":
      return { ...state, isLoaded: true };
    case "RESET":
      return { ...initialState, isLoaded: true };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ProfileContextValue {
  state: ProfileState;
  dispatch: React.Dispatch<ProfileAction>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = "pmguide-profile";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        dispatch({ type: "LOAD_PROFILE", payload: parsed });
      } else {
        dispatch({ type: "SET_LOADED" });
      }
    } catch {
      dispatch({ type: "SET_LOADED" });
    }
  }, []);

  // Persist to localStorage on profile changes
  useEffect(() => {
    if (state.isLoaded && state.profile) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
      } catch {
        // localStorage may be full or unavailable — silently ignore
      }
    }
  }, [state.profile, state.isLoaded]);

  return (
    <ProfileContext.Provider value={{ state, dispatch }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
