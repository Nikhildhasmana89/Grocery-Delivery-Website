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
        {
          status: 401,
        },
      );
    }

    const deliveryBoyId =
      String(session.user.id);

    console.log(
      "========================================",
    );

    console.log(
      "🚚 CURRENT DELIVERY ORDER",
    );

    console.log(
      "Delivery Boy ID:",
      deliveryBoyId,
    );

    console.log(
      "========================================",
    );

    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // Make sure referenced models are registered
    void User;
    void Order;

    // ============================================
    // FIND ACCEPTED ACTIVE ASSIGNMENTS (UP TO 2)
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

    // ============================================
    // NO CURRENT ORDERS
    // ============================================

    if (activeCount === 0) {
      console.log("ℹ️ No active delivery orders");

      return NextResponse.json(
        {
          success: true,
          active: false,
          activeCount: 0,
          activeAssignments: [],
          assignment: null,
          order: null,
        },
        {
          status: 200,
        },
      );
    }

    // ============================================
    // CURRENT ORDERS FOUND
    // ============================================

    console.log("========================================");
    console.log(`✅ ${activeCount} ACTIVE ORDER(S) FOUND`);
    console.log(
      "Assignment IDs:",
      activeAssignments.map((a: any) => String(a._id)),
    );
    console.log("========================================");

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json(
      {
        success: true,
        active: true,
        activeCount,
        activeAssignments,
        assignment: activeAssignments[0],
        order: activeAssignments[0]?.order,
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error(
      "========================================",
    );

    console.error(
      "❌ CURRENT DELIVERY ORDER ERROR",
    );

    console.error(error);

    console.error(
      "========================================",
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to get current delivery order",

        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      {
        status: 500,
      },
    );
  }
}