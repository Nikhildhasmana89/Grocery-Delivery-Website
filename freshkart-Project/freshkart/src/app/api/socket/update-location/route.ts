import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

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

    const body = await req.json();

    const {
      userId,
      location,
    } = body;

    if (!userId || !location) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing userId or location",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================
    // VALIDATE LOCATION
    // ============================================

    if (
      location.type !== "Point" ||
      !Array.isArray(
        location.coordinates,
      ) ||
      location.coordinates.length !== 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid location format",
        },
        {
          status: 400,
        },
      );
    }

    const [
      longitude,
      latitude,
    ] = location.coordinates;

    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Latitude and longitude must be numbers",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================
    // VALIDATE COORDINATES
    // ============================================

    if (
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid latitude or longitude",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================
    // UPDATE USER LOCATION
    // ============================================

    const user =
      await User.findByIdAndUpdate(
        userId,
        {
          location,
          isOnline: true,
        },
        {
          returnDocument: "after",
        },
      ).select(
        "_id name email mobile role image socketId isOnline location",
      );

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
        message:
          "Location updated successfully",

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
      "❌ UPDATE LOCATION ERROR:",
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