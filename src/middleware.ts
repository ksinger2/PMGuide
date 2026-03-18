import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/_next/", "/favicon.ico", "/images/"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Check for Cloudflare Access header
  const cfEmail = req.headers.get("cf-access-authenticated-user-email");

  // Development bypass
  const isDev = process.env.NODE_ENV === "development";
  const devEmail = process.env.DEV_USER_EMAIL;

  if (cfEmail || (isDev && devEmail)) {
    return NextResponse.next();
  }

  // No auth - reject
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For pages, return 401 (Cloudflare Access handles the login redirect)
  return new NextResponse("Unauthorized", { status: 401 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
