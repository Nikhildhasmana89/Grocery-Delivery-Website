import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const admin = await User.findOne({ role: "admin" });

    return NextResponse.json(
      {
        adminExist: !!admin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check admin error:", error);

    return NextResponse.json(
      {
        message: "Check for admin error",
      },
      { status: 500 }
    );
  }
}