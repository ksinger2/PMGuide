import { headers } from "next/headers";

/**
 * Reads user email from Cloudflare Access header.
 * Falls back to DEV_USER_EMAIL in development for local testing.
 */
export async function getCurrentUser(): Promise<{ email: string } | null> {
  const headersList = await headers();

  // Cloudflare Access sets this header when authenticated
  const cfEmail = headersList.get("cf-access-authenticated-user-email");

  if (cfEmail) {
    return { email: cfEmail };
  }

  // Development fallback
  if (process.env.NODE_ENV === "development" && process.env.DEV_USER_EMAIL) {
    return { email: process.env.DEV_USER_EMAIL };
  }

  return null;
}
