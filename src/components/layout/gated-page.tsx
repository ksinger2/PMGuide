"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import { PROFILE_GATE_THRESHOLD } from "@/lib/utils/constants";

interface GatedPageProps {
  children: React.ReactNode;
  locked?: boolean;
}

export function GatedPage({ children, locked }: GatedPageProps) {
  const { state } = useProfile();
  const isGated = locked || state.completeness < PROFILE_GATE_THRESHOLD;
  const percentComplete = Math.round(state.completeness * 100);

  if (!isGated) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center mt-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Lock size={24} className="text-slate-400" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-800">
        {locked ? "Coming Soon" : "Profile incomplete"}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {locked
          ? "This section is not yet available. Check back soon!"
          : `Complete at least 70% of your profile in About Me to unlock this section. You're currently at ${percentComplete}%.`}
      </p>
      {!locked && (
        <Link
          href="/about-me"
          className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Continue in About Me
        </Link>
      )}
    </div>
  );
}
