import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/habits", "/stats", "/profile", "/settings", "/billing"];
const protectedApiPaths = ["/api/habits", "/api/checkin", "/api/profile", "/api/settings", "/api/stripe/checkout"];
const authPaths = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Stripe webhook without auth
  if (pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  // Allow auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isProtectedApi = protectedApiPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  // Block unauthenticated API requests
  if (isProtectedApi && !sessionToken) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
