// src/app/api/socket/disconnect/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { socketId } = await req.json();

    console.log("========================================");
    console.log("🔌 SOCKET DISCONNECT REQUEST");
    console.log("Socket ID:", socketId);
    console.log("========================================");

    if (!socketId) {
      return NextResponse.json(
        { success: false, message: "socketId is required" },
        { status: 400 }
      );
    }

    // CRITICAL: filter the update by socketId itself.
    // If a newer connection has already overwritten
    // User.socketId, this filter simply matches zero
    // documents and nothing is touched — no read-then-write
    // race window, because Mongo evaluates the filter and
    // the write atomically.
    const user = await User.findOneAndUpdate(
      { socketId },
      { socketId: null, isOnline: false },
      { returnDocument: "after" }
    ).select("_id name socketId isOnline");

    if (!user) {
      console.log(
        "⚠️ STALE OR ALREADY-REPLACED DISCONNECT — ignoring",
        socketId
      );

      return NextResponse.json(
        {
          success: true,
          message: "No user currently holds this socketId",
          cleared: false,
        },
        { status: 200 }
      );
    }

    console.log("✅ USER MARKED OFFLINE:", {
      userId: String(user._id),
      socketId,
    });

    return NextResponse.json(
      { success: true, cleared: true, userId: user._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ SOCKET DISCONNECT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}