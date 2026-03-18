import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/api/auth", "/_next/", "/favicon.ico", "/images/", "/api/stripe/webhook"];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Subscription check for authenticated users
  const status = (req.auth.user as { subscriptionStatus?: string })?.subscriptionStatus;
  const hasAccess = status === "active" || status === "past_due";

  // These paths must be accessible to unpaid authenticated users
  if (pathname.startsWith("/subscribe") || pathname.startsWith("/api/stripe")) {
    return NextResponse.next();
  }

  if (!hasAccess) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Subscription required" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/subscribe", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
