import connectDB from "@/app/lib/db";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"; 

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    
    const body = await req.json();
    const { name, email, password, mobile } = body;

    
    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    
    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
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
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid request body format" },
        { status: 400 }
      );
    }

    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}