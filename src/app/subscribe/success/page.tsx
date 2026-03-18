"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Check } from "lucide-react";

function SuccessContent() {
  const { update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"refreshing" | "ready">("refreshing");

  useEffect(() => {
    async function refreshSession() {
      // Trigger JWT refresh to pick up new subscription status
      await update();
      setStatus("ready");

      // Redirect after a short delay
      const next = searchParams.get("next") || "/about-me";
      setTimeout(() => router.push(next), 2000);
    }
    refreshSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
          <Check size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          You&apos;re all set!
        </h1>
        <p className="text-slate-500">
          {status === "refreshing"
            ? "Activating your subscription..."
            : "Redirecting you to PMGuide..."}
        </p>
      </div>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
