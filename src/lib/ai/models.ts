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

export function getModelForTask(task: string): ModelTier {
  const qualityTasks = [
    "resume-critique",
    "resume-generate",
    "resume-fork",
    "career-advice",
    "interview",
  ];
  return qualityTasks.includes(task) ? "quality" : "utility";
}
