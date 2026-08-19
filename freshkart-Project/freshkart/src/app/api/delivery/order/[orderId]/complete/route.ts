import { auth } from "@/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

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

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Security check: Delivery boy must be assigned to this order
    if (
      !order.assignedDeliveryBoy ||
      order.assignedDeliveryBoy.toString() !== deliveryBoyId.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You are not assigned to this delivery order",
        },
        { status: 403 }
      );
    }

    if (order.deliveryBoyCompleted) {
      return NextResponse.json(
        {
          success: true,
          message: "Delivery already marked completed. Waiting for customer confirmation.",
          order,
        },
        { status: 200 }
      );
    }

    // Mark delivery completed by delivery boy (Order status remains 'out of delivery' until customer confirms)
    order.deliveryBoyCompleted = true;
    order.deliveryBoyCompletedAt = new Date();
    await order.save();

    console.log(`✅ Order ${order._id} marked completed by delivery boy ${deliveryBoyId}`);

    // Emit event to customer
    const customerId = String(order.user);
    emitEventHandler(
      "delivery-completed",
      {
        orderId: String(order._id),
        orderRequestId: order.orderRequestId,
        message: "Delivery partner has handed over your order. Please confirm receipt.",
      },
      { userId: customerId }
    ).catch((err) => console.error("❌ Socket event delivery-completed error:", err));

    // Also update order-status-update so track-order UI updates
    emitEventHandler(
      "order-status-update",
      {
        orderId: String(order._id),
        orderRequestId: order.orderRequestId,
        status: "out of delivery",
        deliveryBoyCompleted: true,
        message: "Order delivered by partner. Confirmation pending.",
      },
      { userId: customerId }
    ).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "Delivery completed! Waiting for customer confirmation.",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Complete order API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark order completed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
