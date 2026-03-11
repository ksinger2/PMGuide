"use client";

import { useState } from "react";
import { MessageSquare, ClipboardList } from "lucide-react";
import { SectionHeader } from "@/components/layout/section-header";
import { ChatContainer } from "@/components/chat/chat-container";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { QuickLoadButton } from "@/components/profile/quick-load-button";

type Tab = "chat" | "profile";

export default function AboutMePage() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div data-testid="about-me-page">
      <SectionHeader
        title="About Me"
        description="Let's build your PM profile through a quick conversation."
      />

      <QuickLoadButton />

      {/* Tab bar */}
      <div
        className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={tab === "chat"}
          onClick={() => setTab("chat")}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 ${
            tab === "chat"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          Chat
        </button>
        <button
          role="tab"
          aria-selected={tab === "profile"}
          onClick={() => setTab("profile")}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 ${
            tab === "profile"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          Profile
        </button>
      </div>

      {/* Tab content */}
      {tab === "chat" ? (
        <ChatContainer
          section="about-me"
          storageKey="pmguide-chat-history"
          welcomeMessage="Hi there! I'm your PM career companion. Let's build your profile so I can give you personalized guidance. To start — what's your name, and what's your current role?"
        />
      ) : (
        <ProfileEditor />
      )}
    </div>
  );
}
