"use client";

import { UserCircle2 } from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import { karenProfile } from "@/data/karen-profile";

const DEBUG_EMAIL = process.env.NEXT_PUBLIC_DEBUG_EMAIL;

export function QuickLoadButton() {
  const { state, dispatch } = useProfile();

  // Only show for debug user
  if (!DEBUG_EMAIL || state.userEmail !== DEBUG_EMAIL) return null;

  // Hide once profile is mostly complete
  if (state.completeness >= 0.7) return null;

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "LOAD_PROFILE", payload: karenProfile })}
      className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 active:bg-indigo-200"
      data-testid="quick-load-profile"
    >
      <UserCircle2 size={18} />
      Load debug profile
    </button>
  );
}
