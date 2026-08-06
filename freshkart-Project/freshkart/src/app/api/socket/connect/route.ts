import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, socketId } = await req.json();

    const user = await User.findByIdAndUpdate(
      userId,
      { socketId,isOnline:true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Socket ID updated successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}