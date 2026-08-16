import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const AUTH_SECRET =
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

const LOGIN_PATH = "/login";
const UNAUTHORIZED_PATH = "/unauthorized";

export async function proxy(req: NextRequest) {
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

  // Should normally never happen because of matcher,
  // but avoids unnecessary work.
  if (!requiredRole) {
    return NextResponse.next();
  }

  // --------------------------------------------
  // 2. Check auth secret
  // --------------------------------------------

  if (!AUTH_SECRET) {
    console.error("AUTH_SECRET is missing");

    return NextResponse.redirect(
      new URL(LOGIN_PATH, req.url)
    );
  }

  // --------------------------------------------
  // 3. Read JWT token
  // --------------------------------------------

  const token = await getToken({
    req,
    secret: AUTH_SECRET,
  });

  // --------------------------------------------
  // 4. Not authenticated
  // --------------------------------------------

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, req.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  // --------------------------------------------
  // 5. Get role
  // --------------------------------------------

  const role =
    typeof token.role === "string"
      ? token.role.trim().toLowerCase()
      : "";

  // --------------------------------------------
  // 6. Check role
  // --------------------------------------------

  if (role !== requiredRole) {
    return NextResponse.redirect(
      new URL(UNAUTHORIZED_PATH, req.url)
    );
  }

  // --------------------------------------------
  // 7. Authorized
  // --------------------------------------------

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