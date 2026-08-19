import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import User from "@/models/user.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    // Ensure models registered
    void User;
    void DeliveryAssignment;

    const { orderId } = await params;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing Order ID",
        },
        { status: 400 }
      );
    }

    const session = await auth();
    const deliveryBoyId = session?.user?.id;

    if (!deliveryBoyId || !mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Find order
    const order = await Order.findById(orderId)
      .populate("user", "name email mobile image")
      .populate("assignedDeliveryBoy", "name email mobile image location socketId isOnline")
      .populate("assignment")
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // SECURITY CHECK: Must be assigned to this delivery boy
    const assignedBoyIdStr = order.assignedDeliveryBoy
      ? String((order.assignedDeliveryBoy as any)._id || order.assignedDeliveryBoy)
      : null;

    if (assignedBoyIdStr !== String(deliveryBoyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You are not assigned to this delivery order",
        },
        { status: 403 }
      );
    }

    // Delivery boy location
    let deliveryBoyLocation = null;
    if (
      order.assignedDeliveryBoy &&
      typeof order.assignedDeliveryBoy === "object" &&
      (order.assignedDeliveryBoy as any).location?.coordinates
    ) {
      const coords = (order.assignedDeliveryBoy as any).location.coordinates;
      deliveryBoyLocation = {
        longitude: coords[0] || 0,
        latitude: coords[1] || 0,
      };
    }

    return NextResponse.json(
      {
        success: true,
        order,
        deliveryBoyLocation,
        assignment: order.assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Delivery order details error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch delivery order details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
