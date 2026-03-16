"use client";

import Link from "next/link";
import { User, FileText, Mail, MessageSquare, DollarSign } from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import { PROFILE_GATE_THRESHOLD } from "@/lib/utils/constants";

const sections = [
  {
    href: "/about-me",
    icon: User,
    title: "About Me",
    description: "Build your PM profile through a guided conversation",
    gated: false,
  },
  {
    href: "/resume",
    icon: FileText,
    title: "Resume",
    description: "Get AI-powered critique and tailored resume generation",
    gated: true,
  },
  {
    href: "/outreach",
    icon: Mail,
    title: "Outreach",
    description: "Craft compelling cold emails and LinkedIn messages",
    gated: true,
  },
  {
    href: "/interview",
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Practice PM interviews with AI-powered mock sessions",
    gated: true,
  },
  {
    href: "/negotiate",
    icon: DollarSign,
    title: "Negotiate",
    description: "Prepare your compensation negotiation strategy",
    gated: true,
  },
];

export default function DashboardPage() {
  const { state } = useProfile();
  const isGateOpen = state.completeness >= PROFILE_GATE_THRESHOLD;

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome to PMGuide
        </h1>
        <p className="mt-2 text-lg text-slate-500">
          Your AI-powered PM career companion. Start by telling us about
          yourself.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          // Don't show locked/badge states until profile has hydrated from localStorage
          const isLocked = state.isLoaded && section.gated && !isGateOpen;
          const status = !state.isLoaded
            ? null
            : !section.gated
              ? (isGateOpen ? null : "Start here")
              : isLocked
                ? "Requires profile"
                : null;

          const content = (
            <div
              className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 ${
                isLocked
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:shadow-md cursor-pointer"
              }`}
              data-testid={`dashboard-card-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isLocked
                      ? "bg-slate-100 text-slate-400"
                      : "bg-primary-50 text-primary-600"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      {section.title}
                    </h2>
                    {status && (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          status === "Start here"
                            ? "bg-primary-50 text-primary-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>
          );

          if (isLocked) {
            return <div key={section.href}>{content}</div>;
          }

          return (
            <Link key={section.href} href={section.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
