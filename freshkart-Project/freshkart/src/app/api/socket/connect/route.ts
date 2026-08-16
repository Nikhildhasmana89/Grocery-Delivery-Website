import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(
  req: NextRequest,
) {
  try {
    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // REQUEST DATA
    // ============================================

    const {
      userId,
      socketId,
    } = await req.json();

    console.log(
      "========================================",
    );

    console.log(
      "🔗 CONNECTING SOCKET",
    );

    console.log({
      userId,
      socketId,
    });

    console.log(
      "========================================",
    );

    // ============================================
    // VALIDATION
    // ============================================

    if (!userId || !socketId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "userId and socketId are required",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================
    // UPDATE SOCKET
    // ============================================

    const user =
      await User.findByIdAndUpdate(
        userId,
        {
          socketId,
          isOnline: true,
        },
        {
          returnDocument: "after",
        },
      ).select(
        "_id name email mobile role image socketId isOnline location",
      );

    // ============================================
    // USER NOT FOUND
    // ============================================

    if (!user) {
      console.log(
        "❌ User not found:",
        userId,
      );

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
    // SUCCESS
    // ============================================

    console.log(
      "========================================",
    );

    console.log(
      "✅ SOCKET SAVED",
    );

    console.log({
      userId: String(user._id),
      socketId: user.socketId,
      isOnline: user.isOnline,
    });

    console.log(
      "========================================",
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Socket ID updated successfully",

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          image: user.image,
          socketId: user.socketId,
          isOnline: user.isOnline,
          location: user.location,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error(
      "❌ SOCKET CONNECT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}