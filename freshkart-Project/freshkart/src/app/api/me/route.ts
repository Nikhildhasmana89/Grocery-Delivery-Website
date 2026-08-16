import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ============================================
    // AUTHENTICATION
    // ============================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not authenticated",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // FIND USER BY ID
    // ============================================

    const user =
      await User.findById(
        session.user.id,
      ).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json(
      {
        success: true,
        user,
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error(
      "❌ GET /api/me ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get current user",
        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      {
        status: 500,
      },
    );
  }
}