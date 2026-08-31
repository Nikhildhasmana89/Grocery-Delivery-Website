import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import User from "@/models/user.model";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ============================================
    // AUTHENTICATION
    // ============================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const deliveryBoyId = String(session.user.id);

    // ============================================
    // DATABASE & ROLE / MOBILE CHECK
    // ============================================

    await connectDB();

    void Order;

    const dbUser = await User.findById(deliveryBoyId).select("_id role mobile");

    if (!dbUser || !["deliveryBoy", "deliveryboy", "delivery_boy"].includes(dbUser.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only delivery partners can access active delivery orders.",
        },
        { status: 403 },
      );
    }

    if (!dbUser.mobile || !dbUser.mobile.trim()) {
      return NextResponse.json(
        {
          success: true,
          requiresMobile: true,
          active: false,
          activeCount: 0,
          activeAssignments: [],
          assignment: null,
          order: null,
        },
        { status: 200 },
      );
    }

    // ============================================
    // FIND ACCEPTED ACTIVE ASSIGNMENTS FOR THIS DELIVERY BOY
    // ============================================

    const activeAssignments = await DeliveryAssignment.find({
      assignedTo: deliveryBoyId,
      status: "assigned",
    })
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "name email mobile image",
        },
      })
      .populate({
        path: "assignedTo",
        select: "name email mobile image",
      })
      .sort({ createdAt: -1 })
      .lean();

    const activeCount = activeAssignments.length;

    if (activeCount === 0) {
      return NextResponse.json(
        {
          success: true,
          requiresMobile: false,
          active: false,
          activeCount: 0,
          activeAssignments: [],
          assignment: null,
          order: null,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        requiresMobile: false,
        active: true,
        activeCount,
        activeAssignments,
        assignment: activeAssignments[0],
        order: activeAssignments[0]?.order,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("❌ CURRENT DELIVERY ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get current delivery order",
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}