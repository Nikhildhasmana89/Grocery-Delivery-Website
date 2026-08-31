// app/api/user/edit-role-mobile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. Get authenticated session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const { role, mobile } = await req.json();

    const currentUser = await User.findOne({ email: session.user.email }).select("_id email role mobile");
    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found in database." },
        { status: 404 }
      );
    }

    const targetRole = role || currentUser.role || "user";

    // Build update payload dynamically
    const updateData: any = {
      role: targetRole,
      roleSelected: true,
    };

    if (mobile !== undefined) {
      const trimmedMobile = String(mobile || "").trim();
      if (trimmedMobile) {
        // Validate mobile format (e.g. 10 digits)
        const digitsOnly = trimmedMobile.replace(/\D/g, "");
        if (digitsOnly.length < 10) {
          return NextResponse.json(
            { message: "Please enter a valid 10-digit mobile number." },
            { status: 400 }
          );
        }

        // Check if another account is already registered with this mobile number
        const existingMobileUser = await User.findOne({
          mobile: trimmedMobile,
          _id: { $ne: currentUser._id },
        }).lean();

        if (existingMobileUser) {
          return NextResponse.json(
            { message: "This mobile number is already associated with another account." },
            { status: 400 }
          );
        }

        updateData.mobile = trimmedMobile;
      } else {
        // If mobile is explicitly cleared, unset it in MongoDB
        updateData.$unset = { mobile: 1 };
      }
    }

    // 3. Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error("Error in update-role-mobile API:", error.message || error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This mobile number is already associated with another account." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Failed to update user profile" },
      { status: 500 }
    );
  }
}