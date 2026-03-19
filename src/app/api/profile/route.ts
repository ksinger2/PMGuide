import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cloudflare";
import type { UserProfile } from "@/lib/utils/profile";

// Lazy-load prisma only if DB is configured
async function getPrisma() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const { prisma } = await import("@/lib/db");
  return prisma;
}

/**
 * GET /api/profile
 * Fetch the current user's profile from the database
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = await getPrisma();
  if (!prisma) {
    // No DB configured - return null, client will use localStorage
    return NextResponse.json({ profile: null, email: user.email });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ profile: null, email: user.email });
    }

    return NextResponse.json({ profile: dbUser.profile as unknown as UserProfile | null, email: user.email });
  } catch {
    // DB error - return null, client will use localStorage
    return NextResponse.json({ profile: null, email: user.email });
  }
}

/**
 * PUT /api/profile
 * Save/update the current user's profile
 */
export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const profile = body.profile as UserProfile;

  if (!profile) {
    return NextResponse.json({ error: "Missing profile data" }, { status: 400 });
  }

  const prisma = await getPrisma();
  if (!prisma) {
    // No DB configured - just acknowledge, client uses localStorage
    return NextResponse.json({ profile });
  }

  try {
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        profile: profile as object,
        name: profile.name,
      },
      create: {
        email: user.email,
        profile: profile as object,
        name: profile.name,
      },
    });

    return NextResponse.json({ profile: dbUser.profile as unknown as UserProfile });
  } catch {
    // DB error - just acknowledge, client uses localStorage
    return NextResponse.json({ profile });
  }
}
