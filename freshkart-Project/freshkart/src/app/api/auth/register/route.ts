import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    console.log("Database connected");

    const body = await req.json();
    const { name, email, password, mobile } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
    });

    await user.save();

    return NextResponse.json(
      { message: "User registered successfully", userId: user._id },
      { status: 201 },
    );

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 },
      );
    }

    const existingMobile = await User.findOne({ mobile });

    if (existingMobile) {
      return NextResponse.json(
        { message: "Mobile number already registered" },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid request body format" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
