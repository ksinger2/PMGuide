"use client";

import { useCallback, useEffect } from "react";
import { SectionHeader } from "@/components/layout/section-header";
import { InterviewHome } from "@/components/interview/interview-home";
import { InterviewModeSetup } from "@/components/interview/interview-mode-setup";
import { PracticeModeSetup } from "@/components/interview/practice-mode-setup";
import { ExpertModeSetup } from "@/components/interview/expert-mode-setup";
import { ActiveQuestion } from "@/components/interview/active-question";
import { ExpertViewing } from "@/components/interview/expert-viewing";
import { AskExpertChat } from "@/components/interview/ask-expert-chat";
import { ResultsScreen } from "@/components/interview/results-screen";
import { GatedPage } from "@/components/layout/gated-page";
import { useInterviewSession } from "@/hooks/use-interview-session";
import type { SessionConfig, Question, Feedback, ModelAnswer } from "@/types/interview";
import type { InterviewQuestionType } from "@/lib/prompts/interview";

export default function InterviewPage() {
  const {
    state,
    currentType,
    totalQuestions,
    isSessionComplete,
    selectMode,
    startSession,
    setQuestion,
    setAnswer,
    submitAnswer,
    setResults,
    nextQuestion,
    endSession,
    goHome,
    setLoading,
    setError,
    setModelAnswer,
  } = useInterviewSession();

  // ---------------------------------------------------------------------------
  // Question generation
  // ---------------------------------------------------------------------------

  const generateQuestion = useCallback(
    async (config: SessionConfig, type: InterviewQuestionType, usedIds: string[]) => {
      // "Pick" mode: use pre-selected questions in order
      if (config.questionMode === "pick") {
        const idx = usedIds.length;
        const picked = config.pickedQuestions[idx];
        if (picked) {
          const q: Question = {
            id: picked.id,
            text: picked.text,
            type: picked.type,
            company: config.company === "any" ? "General" : config.company,
            source: "picked",
          };
          setQuestion(q);
          return;
        }
      }

      try {
        const res = await fetch("/api/interview/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: config.company,
            questionType: type,
            questionMode: config.questionMode === "pick" ? "bank" : config.questionMode,
            usedQuestionIds: usedIds,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Failed to generate question" }));
          setError(err.error ?? "Failed to generate question");
          return;
        }

        const json = await res.json();
        setQuestion(json.data as Question);
      } catch {
        setError("Network error — could not generate question");
      }
    },
    [setQuestion, setError]
  );

  // Auto-generate question when entering active screen
  useEffect(() => {
    if (
      state.screen === "active" &&
      state.config &&
      currentType &&
      !state.currentQuestion &&
      state.isLoading
    ) {
      generateQuestion(state.config, currentType, state.questionsUsed);
    }
  }, [state.screen, state.config, currentType, state.currentQuestion, state.isLoading, state.questionsUsed, generateQuestion]);

  // ---------------------------------------------------------------------------
  // Expert mode: auto-fetch model answer when question is loaded
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (
      state.screen === "active" &&
      state.mode === "expert" &&
      state.config &&
      state.currentQuestion &&
      !state.isLoading
    ) {
      // Transition to loading, then fetch model answer
      setLoading(true);

      fetch("/api/interview/model-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: state.config.company,
          questionType: state.currentQuestion.type,
          question: state.currentQuestion.text,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Model answer failed" }));
            setError(err.error ?? "Failed to generate model answer");
            return;
          }
          const json = await res.json();
          setModelAnswer(json.data as ModelAnswer);
        })
        .catch(() => {
          setError("Network error — could not generate model answer");
        });
    }
  }, [state.screen, state.mode, state.config, state.currentQuestion, state.isLoading, setLoading, setModelAnswer, setError]);

  // ---------------------------------------------------------------------------
  // Submit answer → parallel grade + model answer
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    if (!state.config || !state.currentQuestion) return;
    submitAnswer();

    try {
      const [gradeRes, modelRes] = await Promise.all([
        fetch("/api/interview/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: state.config.company,
            questionType: state.currentQuestion.type,
            question: state.currentQuestion.text,
            answer: state.currentAnswer,
          }),
        }),
        fetch("/api/interview/model-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: state.config.company,
            questionType: state.currentQuestion.type,
            question: state.currentQuestion.text,
          }),
        }),
      ]);

      if (!gradeRes.ok || !modelRes.ok) {
        const gradeErr = !gradeRes.ok
          ? await gradeRes.json().catch(() => ({ error: "Grading failed" }))
          : null;
        const modelErr = !modelRes.ok
          ? await modelRes.json().catch(() => ({ error: "Model answer failed" }))
          : null;
        setError(
          gradeErr?.error ?? modelErr?.error ?? "Analysis failed"
        );
        return;
      }

      const gradeJson = await gradeRes.json();
      const modelJson = await modelRes.json();
      setResults(gradeJson.data as Feedback, modelJson.data as ModelAnswer);
    } catch {
      setError("Network error — could not analyze answer");
    }
  }, [state.config, state.currentQuestion, state.currentAnswer, submitAnswer, setResults, setError]);

  // ---------------------------------------------------------------------------
  // Different question
  // ---------------------------------------------------------------------------

  const handleDifferentQuestion = useCallback(() => {
    if (!state.config || !currentType) return;
    setLoading(true);
    generateQuestion(state.config, currentType, state.questionsUsed);
  }, [state.config, currentType, state.questionsUsed, setLoading, generateQuestion]);

  // ---------------------------------------------------------------------------
  // Start session
  // ---------------------------------------------------------------------------

  const handleStart = useCallback(
    (config: SessionConfig) => {
      startSession(config);
    },
    [startSession]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <GatedPage>
    <div data-testid="interview-page">
      <SectionHeader
        title="Interview Lab"
        description="Practice PM interviews with specialist AI agents"
      />

      {/* Error display */}
      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{state.error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {state.screen === "ask-expert-chat" && (
        <AskExpertChat onBack={goHome} />
      )}

      {state.screen === "home" && (
        <InterviewHome
          history={state.history}
          onSelectMode={selectMode}
        />
      )}

      {state.screen === "setup" && state.mode === "interview" && (
        <InterviewModeSetup onStart={handleStart} onBack={goHome} />
      )}

      {state.screen === "setup" && state.mode === "practice" && (
        <PracticeModeSetup onStart={handleStart} onBack={goHome} />
      )}

      {state.screen === "setup" && state.mode === "expert" && (
        <ExpertModeSetup onStart={handleStart} onBack={goHome} />
      )}

      {(state.screen === "active" || state.screen === "analyzing") &&
        state.mode !== "expert" &&
        state.config && (
          <ActiveQuestion
            question={state.currentQuestion}
            questionIndex={state.currentQuestionIndex}
            totalQuestions={totalQuestions}
            config={state.config}
            currentType={currentType}
            answer={state.currentAnswer}
            onAnswerChange={setAnswer}
            onSubmit={handleSubmit}
            onDifferentQuestion={handleDifferentQuestion}
            isLoading={state.isLoading && !state.currentQuestion}
            isAnalyzing={state.screen === "analyzing"}
          />
        )}

      {(state.screen === "active" || state.screen === "viewing") &&
        state.mode === "expert" &&
        state.config && (
          <ExpertViewing
            question={state.currentQuestion}
            questionIndex={state.currentQuestionIndex}
            totalQuestions={totalQuestions}
            config={state.config}
            currentType={currentType}
            modelAnswer={state.currentModelAnswer}
            isLoading={state.isLoading}
            isSessionComplete={isSessionComplete}
            onNextQuestion={nextQuestion}
            onEndSession={endSession}
          />
        )}

      {state.screen === "results" &&
        state.currentFeedback &&
        state.currentModelAnswer &&
        state.currentQuestion && (
          <ResultsScreen
            question={state.currentQuestion.text}
            questionType={state.currentQuestion.type}
            company={state.currentQuestion.company}
            answer={state.currentAnswer}
            feedback={state.currentFeedback}
            modelAnswer={state.currentModelAnswer}
            isSessionComplete={isSessionComplete}
            onNextQuestion={nextQuestion}
            onEndSession={endSession}
          />
        )}
    </div>
    </GatedPage>
  );
}
