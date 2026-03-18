import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.email) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Defense in depth: check subscription status
  const status = session.user.subscriptionStatus;
  if (status !== "active" && status !== "past_due") {
    return { session: null, error: NextResponse.json({ error: "Subscription required" }, { status: 403 }) };
  }

  return { session, error: null };
}
