import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // ---------------------------------------------
    // 1. Read request body
    // ---------------------------------------------
    const body = await req.json();

    const { name, email, password, mobile } = body;

    // ---------------------------------------------
    // 2. Validate input BEFORE database connection
    // ---------------------------------------------
    if (!name || !email || !password || !mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password and mobile are required",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------
    // 3. Normalize data
    // ---------------------------------------------
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.toString().trim();

    // ---------------------------------------------
    // 4. Connect to MongoDB
    // ---------------------------------------------
    await connectDB();

    // ---------------------------------------------
    // 5. Check email OR mobile in ONE query
    // ---------------------------------------------
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { mobile: normalizedMobile },
      ],
    }).lean();

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already registered",
          },
          { status: 400 },
        );
      }

      if (existingUser.mobile === normalizedMobile) {
        return NextResponse.json(
          {
            success: false,
            message: "Mobile number already registered",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------
    // 6. Hash password
    // ---------------------------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------------------------------------
    // 7. Create user
    // ---------------------------------------------
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: normalizedMobile,
    });

    // ---------------------------------------------
    // 8. Success response
    // ---------------------------------------------
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        userId: user._id,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("❌ Registration API Error:", error);

    // ---------------------------------------------
    // Invalid JSON
    // ---------------------------------------------
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------
    // MongoDB duplicate key error
    // ---------------------------------------------
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or mobile number is already registered",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------
    // Other errors
    // ---------------------------------------------
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}