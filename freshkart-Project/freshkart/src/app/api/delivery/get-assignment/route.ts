import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    await connectDB();

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

    const deliveryBoyId = session.user.id;

    console.log("========================================");
    console.log("GET DELIVERY ASSIGNMENTS");
    console.log("Delivery Boy:", deliveryBoyId);
    console.log("========================================");

    // ============================================
    // GET AVAILABLE + ACCEPTED ASSIGNMENTS
    // ============================================

    const assignments = await DeliveryAssignment.find({
      $or: [
        // ----------------------------------------
        // AVAILABLE ORDERS
        // ----------------------------------------
        {
          status: "broadcasted",
          broadcastedTo: deliveryBoyId,
          assignedTo: null,
        },

        // ----------------------------------------
        // ORDERS ALREADY ACCEPTED BY THIS BOY
        // ----------------------------------------
        {
          status: "assigned",
          assignedTo: deliveryBoyId,
        },
      ],
    })
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "name email mobile",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      "Available/assigned deliveries:",
      assignments.length,
    );

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json(
      {
        success: true,
        assignment: assignments,
        count: assignments.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "❌ Get delivery assignment error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch delivery assignments",
      },
      { status: 500 },
    );
  }
}