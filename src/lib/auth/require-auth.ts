import { NextResponse } from "next/server";
import { getCurrentUser } from "./cloudflare";

type RequireAuthResult =
  | { session: { user: { email: string } }; error: null }
  | { session: null; error: NextResponse };

/**
 * Helper for API routes to require authentication.
 * Returns the user session or an error response.
 */
export async function requireAuth(): Promise<RequireAuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    session: { user: { email: user.email } },
    error: null,
  };
}
