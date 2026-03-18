import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

const isProduction = process.env.NODE_ENV === "production";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  cookies: {
    csrfToken: {
      name: "authjs.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProduction },
    },
    callbackUrl: {
      name: "authjs.callback-url",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProduction },
    },
    sessionToken: {
      name: "authjs.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProduction },
    },
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProduction },
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      // Upsert user into DB on every login
      await prisma.user.upsert({
        where: { email },
        update: { name: user.name || undefined },
        create: { email, name: user.name || undefined },
      });

      return true;
    },
    async jwt({ token, trigger }) {
      const email = token.email?.toLowerCase();
      if (!email) return token;

      // Refresh subscription status on sign-in or manual update
      if (trigger === "signIn" || trigger === "update" || !token.subscriptionStatus) {
        const isAdmin = getAdminEmails().has(email);
        if (isAdmin) {
          token.subscriptionStatus = "active";
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { subscriptionStatus: true },
          });
          token.subscriptionStatus = dbUser?.subscriptionStatus || "inactive";
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.email) {
          session.user.email = token.email as string;
        }
        session.user.subscriptionStatus = (token.subscriptionStatus as string) || "inactive";
      }
      return session;
    },
  },
});
