"use client";

import { useState, useRef } from "react";
import { useProfile } from "@/stores/profile-context";
import type { CrafterContext } from "@/types/negotiation";

interface CrafterSetupProps {
  onStart: (context: CrafterContext) => void;
  onBack: () => void;
  isLoading: boolean;
}

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone/Call" },
  { value: "text", label: "Text Message" },
  { value: "video", label: "Video Call" },
] as const;

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
  { value: "casual", label: "Casual" },
] as const;

export function CrafterSetup({ onStart, onBack, isLoading }: CrafterSetupProps) {
  const { state: profileState } = useProfile();
  const startingRef = useRef(false);

  // Pre-fill from profile where available
  const profile = profileState.profile;

  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState(profile?.currentRole ?? "");
  const [channel, setChannel] = useState<CrafterContext["communicationChannel"]>("email");
  const [tone, setTone] = useState<CrafterContext["tonePreference"]>("professional");

  // Leverage toggles
  const [currentlyEmployed, setCurrentlyEmployed] = useState(!!profile?.currentCompany);
  const [currentCompany, setCurrentCompany] = useState(profile?.currentCompany ?? "");
  const [currentTotalComp, setCurrentTotalComp] = useState("");
  const [hasCompetingOffers, setHasCompetingOffers] = useState(false);
  const [competingOfferDetails, setCompetingOfferDetails] = useState("");
  const [hasEquityToLeave, setHasEquityToLeave] = useState(false);
  const [equityAtStake, setEquityAtStake] = useState("");
  const [hasTimelinePressure, setHasTimelinePressure] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [hasUniqueSkills, setHasUniqueSkills] = useState(false);
  const [uniqueSkillsNote, setUniqueSkillsNote] = useState("");
  const [hasRelocation, setHasRelocation] = useState(false);

  // Offer details
  const [hasOffer, setHasOffer] = useState(false);
  const [offerBase, setOfferBase] = useState("");
  const [offerEquity, setOfferEquity] = useState("");
  const [offerSignOn, setOfferSignOn] = useState("");
  const [offerBonus, setOfferBonus] = useState("");
  const [offerLevel, setOfferLevel] = useState("");

  const [additionalContext, setAdditionalContext] = useState("");

  const handleStart = () => {
    if (startingRef.current) return;
    startingRef.current = true;

    const context: CrafterContext = {
      targetCompany,
      targetRole,
      communicationChannel: channel,
      tonePreference: tone,
      currentlyEmployed,
      currentCompany,
      currentTotalComp,
      hasOffer,
      offerBase,
      offerEquity,
      offerSignOn,
      offerBonus,
      offerLevel,
      hasCompetingOffers,
      competingOfferDetails,
      hasEquityToLeave,
      equityAtStake,
      hasTimelinePressure,
      deadlineDate,
      hasUniqueSkills,
      uniqueSkillsNote,
      hasRelocation,
      additionalContext,
    };

    onStart(context);
    startingRef.current = false;
  };

  return (
    <div className="space-y-6" data-testid="crafter-setup">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        &larr; Back to home
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-800">Response Crafter Setup</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tell me about your situation. I&apos;ll write the exact words to send back.
        </p>
      </div>

      {/* Basic info */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Target Company</label>
          <input
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="e.g. Google, Meta, Anthropic"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior PM, Staff PM"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Communication Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as CrafterContext["communicationChannel"])}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as CrafterContext["tonePreference"])}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leverage Points */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Leverage Points</h3>
        <div className="space-y-4">
          {/* Currently employed */}
          <ToggleSection
            label="Currently employed"
            enabled={currentlyEmployed}
            onToggle={setCurrentlyEmployed}
          >
            <input
              type="text"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              placeholder="Current company"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </ToggleSection>

          {/* Competing offers */}
          <ToggleSection
            label="Have competing offers"
            enabled={hasCompetingOffers}
            onToggle={setHasCompetingOffers}
          >
            <textarea
              value={competingOfferDetails}
              onChange={(e) => setCompetingOfferDetails(e.target.value)}
              placeholder="Brief details about competing offers..."
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </ToggleSection>

          {/* Leaving equity */}
          <ToggleSection
            label="Leaving unvested equity"
            enabled={hasEquityToLeave}
            onToggle={setHasEquityToLeave}
          >
            <input
              type="text"
              value={equityAtStake}
              onChange={(e) => setEquityAtStake(e.target.value)}
              placeholder="Approximate $ value"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </ToggleSection>

          {/* Timeline pressure */}
          <ToggleSection
            label="Timeline/deadline pressure"
            enabled={hasTimelinePressure}
            onToggle={setHasTimelinePressure}
          >
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </ToggleSection>

          {/* Unique skills */}
          <ToggleSection
            label="Unique/rare skills"
            enabled={hasUniqueSkills}
            onToggle={setHasUniqueSkills}
          >
            <input
              type="text"
              value={uniqueSkillsNote}
              onChange={(e) => setUniqueSkillsNote(e.target.value)}
              placeholder="Brief note about your unique skills"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </ToggleSection>

          {/* Relocation */}
          <ToggleSection
            label="Relocation needed"
            enabled={hasRelocation}
            onToggle={setHasRelocation}
          />
        </div>
      </div>

      {/* Current comp */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Current Total Comp <span className="text-slate-400">(optional)</span>
        </label>
        <input
          type="text"
          value={currentTotalComp}
          onChange={(e) => setCurrentTotalComp(e.target.value)}
          placeholder="e.g. 350000"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Offer details */}
      <div>
        <ToggleSection
          label="I have an offer to respond to"
          enabled={hasOffer}
          onToggle={setHasOffer}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Base Salary</label>
              <input
                type="text"
                value={offerBase}
                onChange={(e) => setOfferBase(e.target.value)}
                placeholder="e.g. 220000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Equity (annual)</label>
              <input
                type="text"
                value={offerEquity}
                onChange={(e) => setOfferEquity(e.target.value)}
                placeholder="e.g. 80000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sign-on Bonus</label>
              <input
                type="text"
                value={offerSignOn}
                onChange={(e) => setOfferSignOn(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Annual Bonus</label>
              <input
                type="text"
                value={offerBonus}
                onChange={(e) => setOfferBonus(e.target.value)}
                placeholder="e.g. 30000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Level</label>
              <input
                type="text"
                value={offerLevel}
                onChange={(e) => setOfferLevel(e.target.value)}
                placeholder="e.g. L6, E5"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </ToggleSection>
      </div>

      {/* Additional context */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Additional Context <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Anything else that might help craft better responses..."
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Start button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleStart}
          disabled={isLoading}
          className="rounded-lg bg-cyan-600 px-6 py-3 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Start Crafting
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle section helper
// ---------------------------------------------------------------------------

function ToggleSection({
  label,
  enabled,
  onToggle,
  children,
}: {
  label: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-cyan-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </label>
      {enabled && children && (
        <div className="mt-3 pl-14">
          {children}
        </div>
      )}
    </div>
  );
}
