/**
 * Create an SSE streaming Response from an async iterable of event strings.
 */
export function createStreamResponse(
  stream: AsyncIterable<string>
): Response {
  const encoder = new TextEncoder();
  const iterator = stream[Symbol.asyncIterator]();

  const readable = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await iterator.next();
        if (done) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } else {
          controller.enqueue(encoder.encode(`data: ${value}\n\n`));
        }
      } catch (error) {
        console.error("[SSE stream error]", error);
        const errMsg =
          error instanceof Error ? error.message : "Unknown streaming error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: errMsg })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/** Format a text chunk as an SSE data payload. */
export function textEvent(text: string): string {
  return JSON.stringify({ type: "text", text });
}

/** Format a profile update as an SSE data payload. */
export function profileUpdateEvent(
  updates: Record<string, unknown>
): string {
  return JSON.stringify({ type: "profileUpdate", profileUpdates: updates });
}
