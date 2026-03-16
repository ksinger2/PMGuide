"use client";

import { useProfile } from "@/stores/profile-context";

function getProgressColor(completeness: number): string {
  if (completeness >= 0.7) return "bg-success-500";
  if (completeness >= 0.3) return "bg-warning-500";
  return "bg-error-500";
}

export function ProfileCard() {
  const { state } = useProfile();
  const { profile, completeness, isLoaded } = state;

  if (!isLoaded) return null;

  const percentage = Math.round(completeness * 100);
  const displayName = profile?.name ?? "New User";
  const displayRole = profile?.currentCompany === "Not currently employed"
    ? "Funemployed"
    : profile?.currentRole ?? "Complete your profile";

  return (
    <div
      className="rounded-lg bg-slate-50 p-3"
      data-testid="sidebar-profile-card"
    >
      <p
        className="text-sm font-semibold text-slate-800 truncate"
        data-testid="profile-card-name"
      >
        {displayName}
      </p>
      <p
        className="mt-0.5 text-xs text-slate-500 truncate"
        data-testid="profile-card-role"
      >
        {displayRole}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(completeness)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-500 tabular-nums">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
