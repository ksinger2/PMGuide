import Anthropic from "@anthropic-ai/sdk";
import { MODEL_CONFIG, type ModelTier } from "./models";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local."
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Stream a chat completion from Anthropic.
 * Yields text chunks as they arrive.
 */
export async function* streamChat(
  messages: ChatMessage[],
  tier: ModelTier,
  systemPrompt: string,
  overrides?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string> {
  const client = getClient();
  const config = MODEL_CONFIG[tier];

  try {
    const stream = client.messages.stream({
      model: config.model,
      max_tokens: overrides?.maxTokens ?? config.maxTokens,
      temperature: overrides?.temperature ?? config.temperature,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  } catch (error: unknown) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        throw new AiError("AI_TIMEOUT", "Anthropic rate limit exceeded. Please try again shortly.");
      }
      if (error.status === 408 || error.status === 524) {
        throw new AiError("AI_TIMEOUT", "The AI request timed out. Please try again.");
      }
      throw new AiError("AI_ERROR", `Anthropic API error: ${error.message}`);
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiError("AI_TIMEOUT", "The AI request timed out. Please try again.");
    }
    throw new AiError("AI_ERROR", "An unexpected AI error occurred.");
  }
}

/**
 * Non-streaming chat completion. Returns the full response text.
 */
export async function callChat(
  messages: ChatMessage[],
  tier: ModelTier,
  systemPrompt: string,
  overrides?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const client = getClient();
  const config = MODEL_CONFIG[tier];

  try {
    const response = await client.messages.create({
      model: config.model,
      max_tokens: overrides?.maxTokens ?? config.maxTokens,
      temperature: overrides?.temperature ?? config.temperature,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlocks = response.content.filter((b) => b.type === "text");
    return textBlocks.map((b) => b.text).join("");
  } catch (error: unknown) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        throw new AiError("AI_TIMEOUT", "Anthropic rate limit exceeded. Please try again shortly.");
      }
      if (error.status === 408 || error.status === 524) {
        throw new AiError("AI_TIMEOUT", "The AI request timed out. Please try again.");
      }
      throw new AiError("AI_ERROR", `Anthropic API error: ${error.message}`);
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiError("AI_TIMEOUT", "The AI request timed out. Please try again.");
    }
    throw new AiError("AI_ERROR", "An unexpected AI error occurred.");
  }
}

export class AiError extends Error {
  code: "AI_ERROR" | "AI_TIMEOUT";
  constructor(code: "AI_ERROR" | "AI_TIMEOUT", message: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
  }
}
