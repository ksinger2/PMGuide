export const MODEL_CONFIG = {
  quality: {
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096,
    temperature: 0.7,
  },
  utility: {
    model: "claude-haiku-4-5-20251001",
    maxTokens: 512,
    temperature: 0.3,
  },
} as const;

export type ModelTier = keyof typeof MODEL_CONFIG;

/**
 * Per-task overrides that take precedence over the tier defaults.
 * Critique needs low temperature for consistent scoring.
 * Generate/fork stay at 0.7 for creative rewriting.
 */
export const TASK_OVERRIDES: Partial<
  Record<string, { temperature?: number; maxTokens?: number }>
> = {
  "resume-critique": { temperature: 0.0 },
  "interview-generate": { temperature: 0.8, maxTokens: 200 },
  "interview-grade": { temperature: 0.3, maxTokens: 1200 },
  "interview-model": { temperature: 0.5, maxTokens: 2000 },
  "negotiate-scenario": { temperature: 0.6, maxTokens: 1500 },
  "negotiate-chat": { temperature: 0.4, maxTokens: 800 },
  "negotiate-evaluate": { temperature: 0.2, maxTokens: 800 },
  "negotiate-grade": { temperature: 0.3, maxTokens: 2000 },
  "negotiate-expert": { temperature: 0.5, maxTokens: 3000 },
  "negotiate-analyze": { temperature: 0.3, maxTokens: 1000 },
  "negotiate-coach": { temperature: 0.5, maxTokens: 2000 },
  "negotiate-crafter": { temperature: 0.5, maxTokens: 2000 },
  "interview-ask-expert": { temperature: 0.5, maxTokens: 3000 },
  outreach: { temperature: 0.6, maxTokens: 2000 },
};

export function getModelForTask(task: string): ModelTier {
  const qualityTasks = [
    "resume-critique",
    "resume-generate",
    "resume-fork",
    "resume-branch",
    "career-advice",
    "interview",
    "interview-generate",
    "interview-grade",
    "interview-model",
    "negotiate-scenario",
    "negotiate-chat",
    "negotiate-evaluate",
    "negotiate-grade",
    "negotiate-expert",
    "negotiate-coach",
    "negotiate-crafter",
    "interview-ask-expert",
    "outreach",
  ];
  return qualityTasks.includes(task) ? "quality" : "utility";
}
