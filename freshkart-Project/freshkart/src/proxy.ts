import { getToken } from "next-auth/jwt";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export async function proxy(
  req: NextRequest,
) {
  const { pathname } = req.nextUrl;

  // ============================================
  // PUBLIC PAGE ROUTES
  // ============================================

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/unauthorized" ||
    pathname === "/edit-role-mobile"
  ) {
    return NextResponse.next();
  }

  // ============================================
  // ONLY PROTECT APPLICATION PAGES
  // ============================================

  const isProtectedPage =
    pathname.startsWith("/user") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/admin");

  if (!isProtectedPage) {
    return NextResponse.next();
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    console.error(
      "❌ Auth secret is missing",
    );

    return NextResponse.redirect(
      new URL("/login", req.url),
    );
  }

  const token = await getToken({
    req,
    secret,
    secureCookie:
      process.env.NODE_ENV === "production",
  });

  // ============================================
  // NOT LOGGED IN
  // ============================================

  if (!token) {
    const loginUrl = new URL(
      "/login",
      req.url,
    );

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  // ============================================
  // ROLE
  // ============================================

  const role =
    typeof token.role === "string"
      ? token.role.trim().toLowerCase()
      : "";

  // ============================================
  // ROLE PROTECTION
  // ============================================

  if (
    pathname.startsWith("/user") &&
    role !== "user"
  ) {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url),
    );
  }

  if (
    pathname.startsWith("/delivery") &&
    role !== "deliveryboy"
  ) {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url),
    );
  }

  if (
    pathname.startsWith("/admin") &&
    role !== "admin"
  ) {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url),
    );
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/user/:path*",
    "/delivery/:path*",
    "/admin/:path*",
  ],
};