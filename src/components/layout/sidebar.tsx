"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  FileText,
  Mail,
  MessageSquare,
  DollarSign,
  Lock,
  CreditCard,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useProfile } from "@/stores/profile-context";
import { PROFILE_GATE_THRESHOLD } from "@/lib/utils/constants";
import { ProfileCard } from "@/components/profile/profile-card";

const navItems = [
  { href: "/about-me", label: "About Me", icon: User, gated: false, locked: false },
  { href: "/resume", label: "Resume", icon: FileText, gated: true, locked: false },
  { href: "/outreach", label: "Outreach", icon: Mail, gated: true, locked: false },
  { href: "/interview", label: "Interview", icon: MessageSquare, gated: true, locked: false },
  { href: "/negotiate", label: "Negotiate", icon: DollarSign, gated: true, locked: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state } = useProfile();

  const isSubscribed =
    session?.user?.subscriptionStatus === "active" ||
    session?.user?.subscriptionStatus === "past_due";

  async function handleManageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }
  const isGateOpen = state.completeness >= PROFILE_GATE_THRESHOLD;

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-slate-200 bg-white"
      data-testid="sidebar"
    >
      <div className="p-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2"
          data-testid="sidebar-logo"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            PM
          </div>
          <span className="text-lg font-semibold text-slate-800">PMGuide</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1" data-testid="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const isLocked = state.isLoaded && (item.locked || (item.gated && !isGateOpen));

          if (isLocked) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
                title="Profile required"
                data-testid={`nav-${item.label.toLowerCase()}-locked`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                <span className="ml-auto flex items-center gap-1">
                  <span className="text-xs text-slate-300">Profile required</span>
                  <Lock size={14} />
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 space-y-3">
        {isSubscribed && (
          <button
            onClick={handleManageBilling}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <CreditCard size={16} />
            Manage Billing
          </button>
        )}
        <ProfileCard />
      </div>
    </aside>
  );
}
