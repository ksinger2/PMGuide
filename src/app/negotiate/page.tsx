"use client";

import { useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/layout/section-header";
import { NegotiateHome } from "@/components/negotiate/negotiate-home";
import { SimulatorSetup } from "@/components/negotiate/simulator-setup";
import { SimulatorActive } from "@/components/negotiate/simulator-active";
import { SimulatorResults } from "@/components/negotiate/simulator-results";
import { ExpertSetup } from "@/components/negotiate/expert-setup";
import { ExpertViewing } from "@/components/negotiate/expert-viewing";
import { CoachChat } from "@/components/negotiate/coach-chat";
import { TipsBrowser } from "@/components/negotiate/tips-browser";
import { OfferCalculator } from "@/components/negotiate/offer-calculator";
import { useNegotiationSession } from "@/hooks/use-negotiation-session";
import type { NegotiationFeedback } from "@/types/negotiation";

export default function NegotiatePage() {
  const session = useNegotiationSession();
  const { state } = session;

  // ---------------------------------------------------------------------------
  // Auto-grade when entering analyzing state
  // ---------------------------------------------------------------------------

  const gradeNegotiation = useCallback(async () => {
    if (!state.config || !state.budgetCeiling || state.turns.length === 0) {
      session.setError("No negotiation data to analyze");
      return;
    }

    try {
      const res = await fetch("/api/negotiate/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: state.config,
          turns: state.turns,
          budgetCeiling: state.budgetCeiling,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Grading failed" }));
        session.setError(err.error ?? "Failed to grade negotiation");
        return;
      }

      const json = await res.json();
      session.setFeedback(json.data as NegotiationFeedback);
    } catch {
      session.setError("Network error — could not grade negotiation");
    }
  }, [state.config, state.budgetCeiling, state.turns, session]);

  useEffect(() => {
    if (state.screen === "analyzing" && state.isLoading) {
      gradeNegotiation();
    }
  }, [state.screen, state.isLoading, gradeNegotiation]);

  return (
    <div data-testid="negotiate-page">
      <SectionHeader
        title="Negotiation Lab"
        description="Maximize your compensation with expert coaching and practice"
      />

      {/* Error display */}
      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{state.error}</p>
          <button
            type="button"
            onClick={() => session.setError(null)}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {state.screen === "home" && (
        <NegotiateHome
          history={state.history}
          onSelectMode={session.selectMode}
        />
      )}

      {state.screen === "setup" && (
        <SimulatorSetup
          onStart={session.startSimulator}
          onBack={session.goHome}
          setLoading={session.setLoading}
          setError={session.setError}
          isLoading={state.isLoading}
        />
      )}

      {state.screen === "active" && state.config && (
        <SimulatorActive
          config={state.config}
          turns={state.turns}
          currentMessage={state.currentMessage}
          coachNotes={state.coachNotes}
          scenarioContext={state.scenarioContext}
          budgetCeiling={state.budgetCeiling}
          isLoading={state.isLoading}
          onMessageChange={session.setCurrentMessage}
          onAddTurn={session.addTurn}
          onAddCoachNote={session.addCoachNote}
          onEndNegotiation={session.endNegotiation}
          setLoading={session.setLoading}
          setError={session.setError}
        />
      )}

      {state.screen === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">Analyzing your negotiation...</p>
        </div>
      )}

      {state.screen === "results" && state.currentFeedback && (
        <SimulatorResults
          feedback={state.currentFeedback}
          config={state.config}
          turns={state.turns}
          coachNotes={state.coachNotes}
          onHome={session.goHome}
          onTryAgain={() => session.selectMode("simulator")}
        />
      )}

      {state.screen === "expert-setup" && (
        <ExpertSetup
          onStart={session.startExpert}
          onBack={session.goHome}
        />
      )}

      {state.screen === "expert-viewing" && (
        <ExpertViewing
          negotiation={state.currentModelNegotiation}
          config={state.expertConfig}
          isLoading={state.isLoading}
          setError={session.setError}
          setExpertNegotiation={session.setExpertNegotiation}
          onHome={session.goHome}
        />
      )}

      {state.screen === "coach" && (
        <CoachChat onBack={session.goHome} />
      )}

      {state.screen === "tips" && (
        <TipsBrowser
          activeCategory={state.activeTipCategory}
          onCategoryChange={session.setTipCategory}
          onBack={session.goHome}
          onTrySimulator={() => session.selectMode("simulator")}
        />
      )}

      {state.screen === "calculator" && (
        <OfferCalculator
          offers={state.calculatorOffers}
          onUpdateOffers={session.setCalculatorOffers}
          onBack={session.goHome}
        />
      )}
    </div>
  );
}
