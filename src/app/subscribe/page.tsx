"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { FileText, MessageSquare, DollarSign, Mail, User, Check } from "lucide-react";

const features = [
  { icon: User, label: "AI-powered PM profile builder" },
  { icon: FileText, label: "Resume critique & tailored generation" },
  { icon: Mail, label: "Outreach message crafting" },
  { icon: MessageSquare, label: "Mock interview practice" },
  { icon: DollarSign, label: "Negotiation strategy lab" },
];

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const isSubscribed =
    session?.user?.subscriptionStatus === "active" ||
    session?.user?.subscriptionStatus === "past_due";

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white font-bold text-xl mb-4">
              PM
            </div>
            <h1 className="text-2xl font-bold text-slate-800">PMGuide Pro</h1>
            <p className="mt-1 text-slate-500">Your AI-powered PM career companion</p>
          </div>

          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-slate-800">$12.99</span>
            <span className="text-slate-500">/month</span>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.label} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <Check size={14} />
                  </div>
                  {feature.label}
                </li>
              );
            })}
          </ul>

          {isSubscribed ? (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="w-full rounded-xl bg-slate-100 py-3 font-medium text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Manage Subscription"}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full rounded-xl bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Redirecting to checkout..." : "Subscribe Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
