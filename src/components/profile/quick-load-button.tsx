"use client";

import { UserCircle2 } from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import { karenProfile } from "@/data/karen-profile";

export function QuickLoadButton() {
  const { state, dispatch } = useProfile();

  if (state.profile) return null;

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "LOAD_PROFILE", payload: karenProfile })}
      className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 active:bg-primary-200"
      data-testid="quick-load-profile"
    >
      <UserCircle2 size={18} />
      I'm Karen — load my profile
    </button>
  );
}
