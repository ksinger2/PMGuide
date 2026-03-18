"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
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
  isSyncing: boolean;
}

const initialState: ProfileState = {
  profile: null,
  completeness: 0,
  isLoaded: false,
  isSyncing: false,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type ProfileAction =
  | { type: "LOAD_PROFILE"; payload: UserProfile }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "SET_LOADED" }
  | { type: "SET_SYNCING"; payload: boolean }
  | { type: "RESET" };

function profileReducer(
  state: ProfileState,
  action: ProfileAction
): ProfileState {
  switch (action.type) {
    case "LOAD_PROFILE": {
      const profile = action.payload;
      return {
        ...state,
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
    case "SET_SYNCING":
      return { ...state, isSyncing: action.payload };
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
  saveProfile: (profile: UserProfile) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = "pmguide-profile";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Hydrate from DB on mount, fall back to localStorage
  useEffect(() => {
    async function loadProfile() {
      try {
        // Try to fetch from DB first
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            dispatch({ type: "LOAD_PROFILE", payload: data.profile });
            // Also update localStorage as cache
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
            return;
          }
        }
      } catch {
        // DB fetch failed, fall back to localStorage
      }

      // Fall back to localStorage
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
    }

    loadProfile();
  }, []);

  // Save profile to both DB and localStorage
  const saveProfile = useCallback(async (profile: UserProfile) => {
    dispatch({ type: "LOAD_PROFILE", payload: profile });
    dispatch({ type: "SET_SYNCING", payload: true });

    // Save to localStorage immediately (offline cache)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // localStorage may be full or unavailable
    }

    // Save to DB
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
    } catch {
      // DB save failed - localStorage serves as fallback
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false });
    }
  }, []);

  // Persist to localStorage on profile changes (for incremental updates)
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
    <ProfileContext.Provider value={{ state, dispatch, saveProfile }}>
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
