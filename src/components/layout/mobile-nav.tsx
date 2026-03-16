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
} from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import { PROFILE_GATE_THRESHOLD } from "@/lib/utils/constants";

const navItems = [
  { href: "/about-me", label: "About Me", icon: User, gated: false },
  { href: "/resume", label: "Resume", icon: FileText, gated: true },
  { href: "/outreach", label: "Outreach", icon: Mail, gated: true },
  { href: "/interview", label: "Interview", icon: MessageSquare, gated: true },
  { href: "/negotiate", label: "Negotiate", icon: DollarSign, gated: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { state } = useProfile();
  const isGateOpen = state.completeness >= PROFILE_GATE_THRESHOLD;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white pb-safe lg:hidden"
      data-testid="mobile-nav"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        const isLocked = state.isLoaded && item.gated && !isGateOpen;

        if (isLocked) {
          return (
            <div
              key={item.href}
              className="relative flex flex-col items-center gap-1 text-xs text-slate-300"
              title="Profile required"
              data-testid={`mobile-nav-${item.label.toLowerCase()}-locked`}
            >
              <div className="relative">
                <Icon size={20} />
                <Lock size={10} className="absolute -right-1 -top-1" />
              </div>
              <span>{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              isActive ? "text-primary-600" : "text-slate-400"
            }`}
            data-testid={`mobile-nav-${item.label.toLowerCase().replace(" ", "-")}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
