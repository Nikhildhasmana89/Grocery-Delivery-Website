import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, socketId } = await req.json();

    console.log("🔗 Connecting socket:", {
      userId,
      socketId,
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        socketId,
        isOnline: true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ Socket saved:", {
      userId: user._id,
      socketId: user.socketId,
      isOnline: user.isOnline,
    });

    return NextResponse.json(
      {
        message: "Socket ID updated successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Socket connect error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}