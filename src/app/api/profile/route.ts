import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/cloudflare";
import type { UserProfile } from "@/lib/utils/profile";

/**
 * GET /api/profile
 * Fetch the current user's profile from the database
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({ profile: dbUser.profile as unknown as UserProfile | null });
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

  // Upsert: create user if doesn't exist, update if does
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
}
