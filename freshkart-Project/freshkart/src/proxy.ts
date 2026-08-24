import { auth } from "@/auth";
import { NextResponse } from "next/server";

const LOGIN_PATH = "/login";
const UNAUTHORIZED_PATH = "/unauthorized";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // --------------------------------------------
  // 1. Determine required role from URL
  // --------------------------------------------

  let requiredRole: "user" | "admin" | "deliveryboy" | null = null;

  if (pathname.startsWith("/user")) {
    requiredRole = "user";
  } else if (pathname.startsWith("/delivery")) {
    requiredRole = "deliveryboy";
  } else if (pathname.startsWith("/admin")) {
    requiredRole = "admin";
  }

  if (!requiredRole) {
    return NextResponse.next();
  }

  // --------------------------------------------
  // 2. Read NextAuth v5 Session
  // --------------------------------------------

  const session = req.auth;

  // --------------------------------------------
  // 3. Not authenticated
  // --------------------------------------------

  if (!session?.user) {
    const loginUrl = new URL(LOGIN_PATH, req.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // --------------------------------------------
  // 4. Get normalized role
  // --------------------------------------------

  const role = (session.user as any).role
    ? String((session.user as any).role).trim().toLowerCase()
    : "user";

  // --------------------------------------------
  // 5. Check role authorization
  // --------------------------------------------

  // Admin routes: strictly requires admin
  if (requiredRole === "admin" && role !== "admin") {
    return NextResponse.redirect(new URL(UNAUTHORIZED_PATH, req.url));
  }

  // Delivery routes: requires deliveryboy or admin
  if (
    requiredRole === "deliveryboy" &&
    role !== "deliveryboy" &&
    role !== "delivery_boy" &&
    role !== "admin"
  ) {
    return NextResponse.redirect(new URL(UNAUTHORIZED_PATH, req.url));
  }

  // User routes (/user/*): accessible to all authenticated users
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/user/:path*",
    "/delivery/:path*",
    "/admin/:path*",
  ],
};